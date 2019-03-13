# Mocking

- [Introducción](#introduction)
- [Mocking De Objectos](#mocking-objects)
- [Fake De Trabajos (Jobs)](#bus-fake)
- [Fake De Eventos](#event-fake)
    - [Fake De Eventos con Alcance](#scoped-event-fakes)
- [Fake De Correos Electrónicos](#mail-fake)
- [Fake De Notificaciones](#notification-fake)
- [Fake De Colas](#queue-fake)
- [Fake De Almacenamiento De Archivos](#storage-fake)
- [Clases Facade](#mocking-facades)

<a name="introduction"></a>
## Introducción

Al momento de probar aplicaciones de Laravel, puedes querer "simular" ciertos aspectos de tu aplicación de modo que realmente no sean ejecutados durante una prueba dada. Por ejemplo, al momento de probar un controlador que despacha un evento, puedes querer simular los listeners de eventos de modo que realmente no se ejecuten durante la prueba. Esto te permite probar solamente la respuesta HTTP del controlador sin preocuparte por la ejecución de los listeners de eventos, ya que los listeners de eventos pueden ser evaluados en sus propios casos de prueba.

Laravel provee funciones helpers para simular eventos, tareas, y clases facades predeterminadas. Estos helpers proporcionan principalmente una capa conveniente sobre la clase Mockery de modo que no tengas que hacer manualmente llamadas complicadas a métodos Mockery. Puedes también usar [Mockery](http://docs.mockery.io/en/latest/) o PHPUnit para crear tus propios mocks o spies.

<a name="mocking-objects"></a>
## Mocking De Objetos

Cuando hagas mocking de un objeto que vas a inyectar en tu aplicación a través del contenedor de servicio de Laravel, debes enlazar tu instancia a la que le has hecho mocking al contenedor como un enlace de `instance`. Esto le indicará al contenedor que use tu instancia "mockeada" del objeto en lugar de construir el propio objeto:

    use Mockery;
    use App\Service;

    $this->instance(Service::class, Mockery::mock(Service::class, function ($mock) {
        $mock->shouldReceive('process')->once();
    }));

Para hacer esto más conveniente, puedes usar el método `mock`, que es proporcionado por la clase TestCase base de Laravel:

    use App\Service;

    $this->mock(Service::class, function ($mock) {
        $mock->shouldReceive('process')->once();
    });

<a name="bus-fake"></a>
## Fake De Trabajos (Jobs)

Como una alternativa a mocking, puedes usar el método `fake` de la clase facade `Bus` para evitar que determinadas tareas sean despachadas. Al momento de usar fakes, las aserciones serán hechas después de que el código bajo prueba sea ejecutado.

    <?php

    namespace Tests\Feature;

    use Tests\TestCase;
    use App\Jobs\ShipOrder;
    use Illuminate\Support\Facades\Bus;
    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Illuminate\Foundation\Testing\WithoutMiddleware;

    class ExampleTest extends TestCase
    {
        public function testOrderShipping()
        {
            Bus::fake();

            // Perform order shipping...

            Bus::assertDispatched(ShipOrder::class, function ($job) use ($order) {
                return $job->order->id === $order->id;
            });

            // Assert a job was not dispatched...
            Bus::assertNotDispatched(AnotherJob::class);
        }
    }

<a name="event-fake"></a>
## Fake De Eventos

Como una alternativa a mocking, puedes usar el método `fake` de la clase facade `Event` para prevenir la ejecución de todos los listeners de eventos. Después puedes comprobar que los eventos fueron despachados e incluso inspeccionar los datos que recibieron. Al momento de usar fakes, las aserciones son hechas después de que el código bajo prueba sea ejecutado:

    <?php

    namespace Tests\Feature;

    use Tests\TestCase;
    use App\Events\OrderShipped;
    use App\Events\OrderFailedToShip;
    use Illuminate\Support\Facades\Event;
    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Illuminate\Foundation\Testing\WithoutMiddleware;

    class ExampleTest extends TestCase
    {
        /**
         * Test order shipping.
         */
        public function testOrderShipping()
        {
            Event::fake();

            // Perform order shipping...

            Event::assertDispatched(OrderShipped::class, function ($e) use ($order) {
                return $e->order->id === $order->id;
            });

            // Assert an event was dispatched twice...
            Event::assertDispatched(OrderShipped::class, 2);

            // Assert an event was not dispatched...
            Event::assertNotDispatched(OrderFailedToShip::class);
        }
    }

> {note} Después de llamar a `Event::fake()`, no se ejecutarán listeners de eventos. Entonces, si tus pruebas usan model factories que dependen de eventos, cómo crear una UUID durante el evento de modelo `creating` event, debes llamar `Event::fake()` **después** de usar tus factories.

#### Haciendo Fake A Un Subconjunto de Eventos

Si sólo si deseas hacer fake a oyentes de eventos para un grupo específico de eventos, puedes pasarlos a los métodos `fake` o `fakeFor`:

    /**
     * Test order process.
     */
    public function testOrderProcess()
    {
        Event::fake([
            OrderCreated::class,
        ]);

        $order = factory(Order::class)->create();

        Event::assertDispatched(OrderCreated::class);

        // Other events are dispatched as normal...
        $order->update([...]);
    }

<a name="scoped-event-fakes"></a>
### Fake De Eventos con Alcance

Si sólo quieres hacer fake a oyentes de eventos para una porción de la prueba, se puede usar el método `fakeFor`:

    <?php

    namespace Tests\Feature;

    use App\Order;
    use Tests\TestCase;
    use App\Events\OrderCreated;
    use Illuminate\Support\Facades\Event;
    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Illuminate\Foundation\Testing\WithoutMiddleware;

    class ExampleTest extends TestCase
    {
        /**
         * Test order process.
         */
        public function testOrderProcess()
        {
            $order = Event::fakeFor(function () {
                $order = factory(Order::class)->create();

                Event::assertDispatched(OrderCreated::class);

                return $order;
            });

            // Events are dispatched as normal and observers will run ...
            $order->update([...]);
        }
    }

<a name="mail-fake"></a>
## Fake De Correos Electrónicos

Puedes usar el método `fake` de la clase facade `Mail` para prevenir que los correos sean enviados. Después puedes comprobar qué [correos de clases mailables](/docs/{{version}}/mail) fueron enviados a los usuarios e incluso inspeccionar los datos que recibieron. Al momento de usar fakes, las aserciones son hechas después de que el código bajo prueba sea ejecutado.

    <?php

    namespace Tests\Feature;

    use Tests\TestCase;
    use App\Mail\OrderShipped;
    use Illuminate\Support\Facades\Mail;
    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Illuminate\Foundation\Testing\WithoutMiddleware;

    class ExampleTest extends TestCase
    {
        public function testOrderShipping()
        {
            Mail::fake();

            // Assert that no mailables were sent...
            Mail::assertNothingSent();

            // Perform order shipping...

            Mail::assertSent(OrderShipped::class, function ($mail) use ($order) {
                return $mail->order->id === $order->id;
            });

            // Assert a message was sent to the given users...
            Mail::assertSent(OrderShipped::class, function ($mail) use ($user) {
                return $mail->hasTo($user->email) &&
                       $mail->hasCc('...') &&
                       $mail->hasBcc('...');
            });

            // Assert a mailable was sent twice...
            Mail::assertSent(OrderShipped::class, 2);

            // Assert a mailable was not sent...
            Mail::assertNotSent(AnotherMailable::class);
        }
    }

Si estás haciendo colas de mailables para su entrega en segundo plano, deberías usar el método `assertQueued` en lugar de `assertSent`:

    Mail::assertQueued(...);
    Mail::assertNotQueued(...);

<a name="notification-fake"></a>
## Fake De Notificaciones

Puedes usar el método `fake` de la clase facade `Notification` para prevenir que se envíen las notificaciones. Después puedes comprobar qué [notificaciones](/docs/{{version}}/notifications) fueron enviadas a los usuarios e incluso inspeccionar los datos que recibieron. Al momento de usar fakes, las aserciones son hechas después de que el código bajo prueba es ejecutado:

    <?php

    namespace Tests\Feature;

    use Tests\TestCase;
    use App\Notifications\OrderShipped;
    use Illuminate\Support\Facades\Notification;
    use Illuminate\Notifications\AnonymousNotifiable;
    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Illuminate\Foundation\Testing\WithoutMiddleware;

    class ExampleTest extends TestCase
    {
        public function testOrderShipping()
        {
            Notification::fake();

            // Assert that no notifications were sent...
            Notification::assertNothingSent();

            // Perform order shipping...

            Notification::assertSentTo(
                $user,
                OrderShipped::class,
                function ($notification, $channels) use ($order) {
                    return $notification->order->id === $order->id;
                }
            );

            // Assert a notification was sent to the given users...
            Notification::assertSentTo(
                [$user], OrderShipped::class
            );

            // Assert a notification was not sent...
            Notification::assertNotSentTo(
                [$user], AnotherNotification::class
            );

            // Assert a notification was sent via Notification::route() method...
            Notification::assertSentTo(
                new AnonymousNotifiable, OrderShipped::class
            );
        }
    }

<a name="queue-fake"></a>
## Fake De Colas

Como alternativa a mocking, puedes usar el método `fake` de la clase facade `Queue` para prevenir que las tareas sean encoladas. Después puedes comprobar que tareas fueron agregadas a la cola e incluso inspeccionar los datos que recibieron. Al momento de usar fakes, las aserciones son hechas después de que el código bajo prueba es ejecutado:

    <?php

    namespace Tests\Feature;

    use Tests\TestCase;
    use App\Jobs\ShipOrder;
    use Illuminate\Support\Facades\Queue;
    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Illuminate\Foundation\Testing\WithoutMiddleware;

    class ExampleTest extends TestCase
    {
        public function testOrderShipping()
        {
            Queue::fake();

            // Assert that no jobs were pushed...
            Queue::assertNothingPushed();

            // Perform order shipping...

            Queue::assertPushed(ShipOrder::class, function ($job) use ($order) {
                return $job->order->id === $order->id;
            });

            // Assert a job was pushed to a given queue...
            Queue::assertPushedOn('queue-name', ShipOrder::class);

            // Assert a job was pushed twice...
            Queue::assertPushed(ShipOrder::class, 2);

            // Assert a job was not pushed...
            Queue::assertNotPushed(AnotherJob::class);

            // Assert a job was pushed with a specific chain...
            Queue::assertPushedWithChain(ShipOrder::class, [
                AnotherJob::class,
                FinalJob::class
            ]);
        }
    }

<a name="storage-fake"></a>
## Fake De Almacenamiento De Archivos

El método fake de la clase facade `Storage` permite que generes fácilmente un disco falso que, combinado con las utilidades de generación de archivo de la clase `UploadedFile`, simplifica mucho la prueba de subidas de archivos. Por ejemplo:

    <?php

    namespace Tests\Feature;

    use Tests\TestCase;
    use Illuminate\Http\UploadedFile;
    use Illuminate\Support\Facades\Storage;
    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Illuminate\Foundation\Testing\WithoutMiddleware;

    class ExampleTest extends TestCase
    {
        public function testAvatarUpload()
        {
            Storage::fake('avatars');

            $response = $this->json('POST', '/avatar', [
                'avatar' => UploadedFile::fake()->image('avatar.jpg')
            ]);

            // Assert the file was stored...
            Storage::disk('avatars')->assertExists('avatar.jpg');

            // Assert a file does not exist...
            Storage::disk('avatars')->assertMissing('missing.jpg');
        }
    }

> {tip} De forma predeterminada, el método `fake` borrará todos los archivos en su directorio temporal. Si prefieres mantener estos archivos, puedes usar en su lugar el método "persistentFake".

<a name="mocking-facades"></a>
## Las Clases Facade

Diferente de las llamadas de métodos estáticos tradicionales, [las clases facade](/docs/{{version}}/facades) pueden ser imitadas (mock). Esto proporciona una gran ventaja sobre los métodos estáticos tradicionales y te concede la misma capacidad de prueba que tendrías si estuvieras usando inyección de dependencias. Al momento de probar, con frecuencia puedes querer imitar una llamada a una clase facade de Laravel en uno de tus controladores. Por ejemplo, considera la siguiente acción de controlador:

    <?php

    namespace App\Http\Controllers;

    use Illuminate\Support\Facades\Cache;

    class UserController extends Controller
    {
        /**
         * Show a list of all users of the application.
         *
         * @return Response
         */
        public function index()
        {
            $value = Cache::get('key');

            //
        }
    }

Podemos imitar la ejecución de la clase facade `Cache` usando el método `shouldReceive`, el cual devolverá una instancia mock de la clase [Mockery](https://github.com/padraic/mockery). Ya que las clases facades realmente son resueltas y administradas por el [contenedor de servicios](/docs/{{version}}/container) de Laravel, tendrán mucho más capacidad de prueba que una clase estática típica. Por ejemplo, vamos a imitar nuestra llamada al método `get` de la clase facade `Cache`:

    <?php

    namespace Tests\Feature;

    use Tests\TestCase;
    use Illuminate\Support\Facades\Cache;
    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Illuminate\Foundation\Testing\WithoutMiddleware;

    class UserControllerTest extends TestCase
    {
        public function testGetIndex()
        {
            Cache::shouldReceive('get')
                        ->once()
                        ->with('key')
                        ->andReturn('value');

            $response = $this->get('/users');

            // ...
        }
    }

> {note} No deberías imitar la clase facade `Request`. En lugar de eso, pasa la entrada que deseas dentro de los métodos helper HTTP tales como `get` y `post` al momento de ejecutar tus pruebas. Del mismo modo, en lugar de imitar la clase facade `Config`, ejecuta el método `Config::set` en tus pruebas.
