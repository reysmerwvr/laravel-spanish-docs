::: v-pre

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

Al momento de probar aplicaciones de Laravel, puedes querer "simular" (mock) ciertos aspectos de tu aplicación de modo que realmente no sean ejecutados durante una prueba dada. Por ejemplo, al momento de probar un controlador que despacha un evento, puedes querer simular los listeners de eventos de modo que realmente no se ejecuten durante la prueba. Esto te permite probar solamente la respuesta HTTP del controlador sin preocuparte por la ejecución de los listeners de eventos, ya que los listeners de eventos pueden ser evaluados en sus propios casos de prueba.

Laravel provee funciones helpers para simular eventos, tareas y clases facades predeterminadas. Estos helpers proporcionan principalmente una capa conveniente sobre la clase Mockery de modo que no tengas que hacer manualmente llamadas complicadas a métodos Mockery. Puedes también usar [Mockery](http://docs.mockery.io/en/latest/) o PHPUnit para crear tus propios mocks o spies.

<a name="mocking-objects"></a>
## Mocking De Objetos

Cuando hagas mocking de un objeto que vas a inyectar en tu aplicación a través del contenedor de servicio de Laravel, debes enlazar tu instancia a la que le has hecho mocking al contenedor como un enlace de `instance`. Esto le indicará al contenedor que use tu instancia "mockeada" del objeto en lugar de construir el propio objeto:

```php
use Mockery;
use App\Service;

$this->instance(Service::class, Mockery::mock(Service::class, function ($mock) {
    $mock->shouldReceive('process')->once();
}));
```

Para hacer esto más conveniente, puedes usar el método `mock`, que es proporcionado por la clase TestCase base de Laravel:

```php
use App\Service;

$this->mock(Service::class, function ($mock) {
    $mock->shouldReceive('process')->once();
});
```

<a name="bus-fake"></a>
## Fake De Trabajos (Jobs)

Como una alternativa a mocking, puedes usar el método `fake` de la clase facade `Bus` para evitar que determinadas tareas sean despachadas. Al momento de usar fakes, las aserciones serán hechas después de que el código bajo prueba sea ejecutado.

```php
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

        // Comprueba que un trabajo no fue enviado...
        Bus::assertNotDispatched(AnotherJob::class);
    }
}
```

<a name="event-fake"></a>
## Fake De Eventos

Como una alternativa a mocking, puedes usar el método `fake` de la clase facade `Event` para prevenir la ejecución de todos los listeners de eventos. Después puedes comprobar que los eventos fueron despachados e incluso inspeccionar los datos que recibieron. Al momento de usar fakes, las aserciones son hechas después de que el código bajo prueba sea ejecutado:

```php
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

        // Comprueba que un evento fue enviado dos veces...
        Event::assertDispatched(OrderShipped::class, 2);

        // Comprueba que un evento no fue enviado...
        Event::assertNotDispatched(OrderFailedToShip::class);
    }
}
```

::: danger Nota
Después de llamar a `Event::fake()`, no se ejecutarán listeners de eventos. Entonces, si tus pruebas usan model factories que dependen de eventos, cómo crear una UUID durante el evento de modelo `creating`, debes llamar `Event::fake()` **después** de usar tus factories.
:::

#### Haciendo Fake A Un Subconjunto de Eventos

Si sólo si deseas hacer fake a oyentes de eventos para un grupo específico de eventos, puedes pasarlos a los métodos `fake` o `fakeFor`:

```php
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

    // Otros eventos se envían de forma normal...
    $order->update([...]);
}
```

<a name="scoped-event-fakes"></a>
### Fake De Eventos con Alcance

Si sólo quieres hacer fake a oyentes de eventos para una porción de la prueba, se puede usar el método `fakeFor`:

```php
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

        // Los eventos se envían normalmente y los observadores se ejecutarán...
        $order->update([...]);
    }
}
```

<a name="mail-fake"></a>
## Fake De Correos Electrónicos

Puedes usar el método `fake` de la clase facade `Mail` para prevenir que los correos sean enviados. Después puedes comprobar qué [correos de clases mailables](/docs/{{version}}/mail) fueron enviados a los usuarios e incluso inspeccionar los datos que recibieron. Al momento de usar fakes, las aserciones son hechas después de que el código bajo prueba sea ejecutado.

```php
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

        // Comprueba que no se enviaron mailables...
        Mail::assertNothingSent();

        // Perform order shipping...

        Mail::assertSent(OrderShipped::class, function ($mail) use ($order) {
            return $mail->order->id === $order->id;
        });

        // Comprueba que un mensaje fue enviado a los usuarios dados...
        Mail::assertSent(OrderShipped::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email) &&
                    $mail->hasCc('...') &&
                    $mail->hasBcc('...');
        });

        // Comprueba que un correo electrónico fue enviado dos veces...
        Mail::assertSent(OrderShipped::class, 2);

        // Comprueba que un correo electrónico no fue enviado...
        Mail::assertNotSent(AnotherMailable::class);
    }
}
```

Si estás haciendo colas de mailables para su entrega en segundo plano, deberías usar el método `assertQueued` en lugar de `assertSent`:

```php
Mail::assertQueued(...);
Mail::assertNotQueued(...);
```

<a name="notification-fake"></a>
## Fake De Notificaciones

Puedes usar el método `fake` de la clase facade `Notification` para prevenir que se envíen las notificaciones. Después puedes comprobar qué [notificaciones](/docs/{{version}}/notifications) fueron enviadas a los usuarios e incluso inspeccionar los datos que recibieron. Al momento de usar fakes, las aserciones son hechas después de que el código bajo prueba es ejecutado:

```php
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

        // Comprueba que no se enviaron notificaciones...
        Notification::assertNothingSent();

        // Perform order shipping...

        Notification::assertSentTo(
            $user,
            OrderShipped::class,
            function ($notification, $channels) use ($order) {
                return $notification->order->id === $order->id;
            }
        );

        // Comprueba que una notificación fue enviada a los usuarios dados...
        Notification::assertSentTo(
            [$user], OrderShipped::class
        );

        // Comprueba que una notificación no fue enviada...
        Notification::assertNotSentTo(
            [$user], AnotherNotification::class
        );

        // Comprueba que se envió una notificación mediante el método Notification::route ()...
        Notification::assertSentTo(
            new AnonymousNotifiable, OrderShipped::class
        );
    }
}
```

<a name="queue-fake"></a>
## Fake De Colas

Como alternativa a mocking, puedes usar el método `fake` de la clase facade `Queue` para prevenir que las tareas sean encoladas. Después puedes comprobar que tareas fueron agregadas a la cola e incluso inspeccionar los datos que recibieron. Al momento de usar fakes, las aserciones son hechas después de que el código bajo prueba es ejecutado:

```php
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

        // Comprueba que no se agregaron trabajos...
        Queue::assertNothingPushed();

        // Perform order shipping...

        Queue::assertPushed(ShipOrder::class, function ($job) use ($order) {
            return $job->order->id === $order->id;
        });

        // Comprueba que un trabajo fue agregado a una cola dada...
        Queue::assertPushedOn('queue-name', ShipOrder::class);

        // Comprueba que un trabajo fue agregado dos veces...
        Queue::assertPushed(ShipOrder::class, 2);

        // Comprueba que un trabajo no fue agregado...
        Queue::assertNotPushed(AnotherJob::class);

        // Comprueba que un trabajo fue agregado con una cadena específica...
        Queue::assertPushedWithChain(ShipOrder::class, [
            AnotherJob::class,
            FinalJob::class
        ]);
    }
}
```

<a name="storage-fake"></a>
## Fake De Almacenamiento De Archivos

El método fake de la clase facade `Storage` permite que generes fácilmente un disco falso que, combinado con las utilidades de generación de archivo de la clase `UploadedFile`, simplifica mucho la prueba de subidas de archivos. Por ejemplo:

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;

class ExampleTest extends TestCase
{
    public function testAlbumUpload()
    {
        Storage::fake('photos');

        $response = $this->json('POST', '/photos', [
            UploadedFile::fake()->image('photo1.jpg'),
            UploadedFile::fake()->image('photo2.jpg')
        ]);

        // Comprueba que uno o más archivos fueron almacenados...
        Storage::disk('photos')->assertExists('photo1.jpg');
        Storage::disk('photos')->assertExists(['photo1.jpg', 'photo2.jpg']);

        // Comprueba que uno o más archivos no fueron almacenados...
        Storage::disk('photos')->assertMissing('missing.jpg');
        Storage::disk('photos')->assertMissing(['missing.jpg', 'non-existing.jpg']);
    }
}
```

::: tip
De forma predeterminada, el método `fake` borrará todos los archivos en su directorio temporal. Si prefieres mantener estos archivos, puedes usar en su lugar el método "persistentFake".
:::

<a name="mocking-facades"></a>
## Las Clases Facade

Diferente de las llamadas de métodos estáticos tradicionales, [las clases facade](/docs/{{version}}/facades) pueden ser simuladas (mock). Esto proporciona una gran ventaja sobre los métodos estáticos tradicionales y te concede la misma capacidad de prueba que tendrías si estuvieras usando inyección de dependencias. Al momento de probar, con frecuencia puedes querer simular una llamada a una clase facade de Laravel en uno de tus controladores. Por ejemplo, considera la siguiente acción de controlador:

```php
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
```

Podemos simular (mock) la ejecución de la clase facade `Cache` usando el método `shouldReceive`, el cual devolverá una instancia mock de la clase [Mockery](https://github.com/padraic/mockery). Ya que las clases facades realmente son resueltas y administradas por el [contenedor de servicios](/docs/{{version}}/container) de Laravel, tendrán mucho más capacidad de prueba que una clase estática típica. Por ejemplo, vamos a simular (mock) nuestra llamada al método `get` de la clase facade `Cache`:

```php
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
```

::: danger Nota
No deberías hacer mock a la clase facade `Request`. En lugar de eso, pasa la entrada que deseas dentro de los métodos helper HTTP tales como `get` y `post` al momento de ejecutar tus pruebas. Del mismo modo, en lugar de simular (mock) la clase facade `Config`, ejecuta el método `Config::set` en tus pruebas.
:::