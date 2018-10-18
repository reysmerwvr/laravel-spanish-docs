# Mocking

- [Introducción](#introduction)
- [El Método Fake de la Clase Facade Bus](#bus-fake)
- [El Método Fake de la Clase Facade Event](#event-fake)
- [El Método Fake de la Clase Facade Mail](#mail-fake)
- [El Método Fake de la Clase Facade Notification](#notification-fake)
- [El Método Fake de la Clase Facade Queue](#queue-fake)
- [El Método Fake de la Clase Facade Storage](#storage-fake)
- [Las Clases Facades](#mocking-facades)

<a name="introduction"></a>
## Introducción

Al momento de probar aplicaciones de Laravel, puedes querer "simular" ciertos aspectos de tu aplicación de modo que realmente no sean ejecutados durante una prueba dada. Por ejemplo, al momento de probar un controlador que despacha un evento, puedes querer simular los listeners de eventos de modo que en realmente no se ejecuten durante la prueba. Esto te permite probar solamente la respuesta HTTP del controlador sin preocuparte por la ejecución de los listeners de eventos, ya que los listener de eventos pueden ser evaluados en su propios caso de prueba.

Laravel proporciona helpers para simular eventos, tareas, y clases facades predeterminadas. Estos helpers proporcionan principalmente una capa conveniente sobre la clase Mockery de modo que no tengas que hacer manualmente llamadas de métodos Mockery complicadas. Ciertamente, eres libre de usar [Mockery](http://docs.mockery.io/en/latest/) o PHPUnit para crear tus propios mocks o spies.

<a name="bus-fake"></a>
## El Método Fake de la Clase Facade Bus

Como una alternativa a mocking, puedes usar el método `fake` de la clase facade `Bus` para prevenir tareas de ser despachadas. Al momento de usar fakes, las aserciones serán hechas después que el código bajo prueba sea ejecutado.

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
## El método Fake de la Clase Facade Event

Como una alternativa a mocking, puedes usar el método `fake` de la clase facade `Event` para prevenir la ejecución de todos los listeners de eventos. Después puedes comprobar que los eventos fueron despachados e incluso inspeccionar los datos que recibieron. Al momento de usar fakes, las asercciones son hechas después de que el código bajo prueba sea ejecutado:

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

            Event::assertNotDispatched(OrderFailedToShip::class);
        }
    }

<a name="mail-fake"></a>
## El Método Fake de la Clase Facade Mail

Puedes usar el método `fake` de la clase facade `Mail` para prevenir que los correos sean enviados. Después puedes comprobar que [correos que pueden ser entregados](/docs/{{version}}/mail) fueron enviados a los usuarios e incluso inspeccionar los datos que recibieron. Al momento de usar fakes, las aserciones son hechas después que el código bajo test sea ejecutado.

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

Si estas encolando correos que pueden ser enviados para entregar en segundo plano, deberías usar el método `assertQueued` en lugar de `assertSent`:

    Mail::assertQueued(...);
    Mail::assertNotQueued(...);

<a name="notification-fake"></a>
## El Método Fake de la Clase Facade Notification

Puedes usar el método `fake` de la clase facade `Notification` para prevenir que se envién las notificaciones. Después puedes comprobar que [notificaciones](/docs/{{version}}/notifications) fueron enviadas a los usuarios e incluso inspeccionar los datos que recibieron. Al momento de usar fakes, las aserciones son hechas después que el código bajo prueba es ejecutado:

    <?php

    namespace Tests\Feature;

    use Tests\TestCase;
    use App\Notifications\OrderShipped;
    use Illuminate\Support\Facades\Notification;
    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Illuminate\Foundation\Testing\WithoutMiddleware;

    class ExampleTest extends TestCase
    {
        public function testOrderShipping()
        {
            Notification::fake();

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
        }
    }

<a name="queue-fake"></a>
## El Método Fake de la Clase Facade Queue

Como alternativa a mocking, puedes usar el método `fake` de la clase facade `Queue` para prevenir que las tareas sean encoladas. Después puedes comprobar que tareas fueron empujadas a la cola e incluso inspeccionar los datos que recibieron. Al momento de usar fakes, las aserciones son hechas después que el código bajo prueba es ejecutado:

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
        }
    }

<a name="storage-fake"></a>
## El Método Fake de la Clase Facade Storage

El método fake de la clase facade Storage permite que generes fácilmente una disco de imitación que, combinado con las utilidades de generación de archivo de la clase `UploadedFile`, simplifica mucho la prueba de subidas de archivos. Por ejemplo:

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

> {tip} De forma predeterminada, el método `fake` borrará todos los archivos en su directorio temporal. Si prefieres mantener estos archivos, puedes usar el método "persistentFake" en su lugar.

<a name="mocking-facades"></a>
## Las Clases Facades

Diferente de las llamadas de métodos estáticos tradicionales, [las clases facades](/docs/{{version}}/facades) pueden ser imitadas. Esto proporciona una gran ventaja sobre los métodos estáticos tradicionales y te concede la misma capacidad de prueba que tendrías si estuvieras usando inyección de dependencias. Al momento de probar, con frecuencia puedes querer imitar una llamada a una clase facade de Laravel en uno de tus controladores. Por ejemplo, considera la siguiente acción de controlador:

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

Podemos imitar la ejecución de la clase facade `Cache` usando el método `shouldReceive`, el cúal devolverá una instancia de imitación de la clase [Mockery](https://github.com/padraic/mockery). Ya que las clases facades realmente son resueltas y administradas por el [contenedor de servicios](/docs/{{version}}/container) de Laravel, tendrán mucho más capacidad de prueba que una clase estática típica. Por ejemplo, vamos a imitar nuestra llamada al método `get` de la clase facade `Cache`: 

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
