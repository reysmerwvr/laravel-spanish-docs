::: v-pre

# Eventos

- [Introducción](#introduction)
- [Registro de Eventos y Oyentes](#registering-events-and-listeners)
    - [Generación de Eventos y Oyentes](#generating-events-and-listeners)
    - [Registro Manual de Eventos](#manually-registering-events)
    - [Descubrimiento de Eventos](#event-discovery)
- [Definiendo Eventos](#defining-events)
- [Definiendo Oyentes](#defining-listeners)
- [Oyentes de Eventos en Cola](#queued-event-listeners)
    - [Accediendo Manualmente a la Cola](#manually-accessing-the-queue)
    - [Manejo de Trabajos Fallidos](#handling-failed-jobs)
- [Despachando Eventos](#dispatching-events)
- [Suscriptores de Eventos](#event-subscribers)
    - [Escribiendo Suscriptores de Eventos](#writing-event-subscribers)
    - [Registrando Suscriptores de Eventos](#registering-event-subscribers)

<a name="introduction"></a>
## Introducción

Los eventos de Laravel proporcionan una implementación de observador simple, lo que permite suscribirse y escuchar diversos eventos que ocurren en tu aplicación. Las clases de eventos normalmente se almacenan en el directorio `app/Events`, mientras que tus oyentes se almacenan en `app/Listeners`. No te preocupes si no ves estos directorios en tu aplicación, ya que se crearán para ti cuando generes eventos y oyentes utilizando los comandos de consola Artisan.

Los eventos sirven como una excelente manera de desacoplar varios aspectos de tu aplicación, ya que un solo evento puede tener múltiples oyentes que no dependen entre sí. Por ejemplo, es posible que desees enviar una notificación de Slack a tu usuario cada vez que se envíe un pedido. En lugar de acoplar tu código de procesamiento de pedidos a tu código de notificación Slack, puedes generar un evento `OrderShipped`, que un oyente puede recibir y transformar en una notificación Slack.

<a name="registering-events-and-listeners"></a>
## Registro de Eventos y Oyentes

El `EventServiceProvider` incluido en tu aplicación Laravel proporciona un lugar conveniente para registrar todos los oyentes de eventos de tu aplicación. La propiedad `listen` contiene un arreglo de todos los eventos (claves) y sus oyentes (valores). Puedes agregar tantos eventos a este arreglo como lo requieras tu aplicación. Por ejemplo, agreguemos un evento `OrderShipped`:

```php
/**
* The event listener mappings for the application.
*
* @var array
*/
protected $listen = [
    'App\Events\OrderShipped' => [
        'App\Listeners\SendShipmentNotification',
    ],
];
```

<a name="generating-events-and-listeners"></a>
### Generación de Eventos y Oyentes

Por supuesto, crear manualmente los archivos para cada evento y oyente es engorroso. En vez de eso, agrega oyentes y eventos a tu `EventServiceProvider` y usa el comando `event:generate`. Este comando generará cualquier evento u oyente que esté listado en tu `EventServiceProvider`. Los eventos y oyentes que ya existen quedarán intactos:

```php
php artisan event:generate
```

<a name="manually-registering-events"></a>
### Registro Manual de Eventos

Normalmente, los eventos deberían registrarse a través del arreglo `$listen` de `EventServiceProvider`; sin embargo, también puedes registrar manualmente eventos basados en Closure en el método `boot` de tu `EventServiceProvider`:

```php
/**
* Register any other events for your application.
*
* @return void
*/
public function boot()
{
    parent::boot();

    Event::listen('event.name', function ($foo, $bar) {
        //
    });
}
```

#### Comodín de Oyentes de un Evento

Puedes incluso registrar oyentes usando el `*` como un parámetro comodín, lo que te permite capturar múltiples eventos en el mismo oyente. Los comodines de oyentes reciben el nombre del evento como su primer argumento y el arreglo de datos de eventos completo como su segundo argumento:

```php
Event::listen('event.*', function ($eventName, array $data) {
    //
});
```

<a name="event-discovery"></a>
### Descubrimiento de Eventos

::: danger Nota
El Descubrimiento de Eventos solo está disponible para Laravel 5.8.9 o posterior.
:::

En vez de registrar eventos y oyentes (listeners) manualmente en el arreglo `$listen` del `EventServiceProvider`, puedes habilitar la detección automática de eventos. Cuando se habilita la detección de eventos, Laravel encontrará y registrará automáticamente tus eventos y oyentes escaneando el directorio `Listeners` de tu aplicación. Además, todos los eventos definidos explícitamente listados en el `EventServiceProvider` seguirán registrados.

La detección de eventos está deshabilitada de forma predeterminada, pero puedes habilitarla sobreescribiendo el método `shouldDiscoverEvents` del `EventServiceProvider` de tu aplicación:

```php
/**
* Determine if events and listeners should be automatically discovered.
*
* @return bool
*/
public function shouldDiscoverEvents()
{
    return true;
}
```

Por defecto, se escanearán todos los oyentes dentro del directorio `Listeners` de tu aplicación. Si deseas definir directorios adicionales para analizar, puedes sobreescribir el método `discoverEventsWithin` en tu `EventServiceProvider`:

```php
/**
* Get the listener directories that should be used to discover events.
*
* @return array
*/
protected function discoverEventsWithin()
{
    return [
        $this->app->path('Listeners'),
    ];
}
```

En producción, es probable que no desees que el framework analice todos tus oyentes en cada petición. Por lo tanto, durante tu proceso de despliegue, debes ejecutar el comando Artisan `event:cache` para almacenar en caché un manifiesto de todos los eventos y oyentes de tu aplicación. Este manifiesto será utilizado por el framework para acelerar el proceso de registro de eventos. El comando `event:clear` puede ser usado para destruir la caché.

::: tip
El comando `event:list` puede ser usado para mostrar una lista de todos los eventos y oyentes registrados por tu aplicación.
:::

<a name="defining-events"></a>
## Definiendo Eventos

Una clase de evento es un contenedor de datos que guarda la información relacionada con el evento. Por ejemplo, supongamos que nuestro evento `OrderShipped` (orden enviada) generado recibe un objeto [ORM Eloquent](/docs/{{version}}/eloquent):

```php
<?php

namespace App\Events;

use App\Order;
use Illuminate\Queue\SerializesModels;

class OrderShipped
{
    use SerializesModels;

    public $order;

    /**
    * Create a new event instance.
    *
    * @param  \App\Order  $order
    * @return void
    */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }
}
```

Como puedes ver, esta clase de evento no contiene lógica. Es un contenedor para la instancia `Order` que se compró. El trait `SerializesModels` utilizado por el evento serializará con elegancia cualquier modelo Eloquent si el objeto del evento se serializa utilizando la función de PHP `serialize`.

<a name="defining-listeners"></a>
## Definiendo Oyentes

A continuación, echemos un vistazo al oyente de nuestro evento de ejemplo. Los oyentes de eventos reciben la instancia de evento en su método `handle`. El comando `event:generate` importará automáticamente la clase de evento adecuada y declarará el tipo de evento en el método `handle`. Dentro del método `handle`, puedes realizar las acciones necesarias para responder al evento:

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;

class SendShipmentNotification
{
    /**
    * Create the event listener.
    *
    * @return void
    */
    public function __construct()
    {
        //
    }

    /**
    * Handle the event.
    *
    * @param  \App\Events\OrderShipped  $event
    * @return void
    */
    public function handle(OrderShipped $event)
    {
        // Access the order using $event->order...
    }
}
```

::: tip
Tus oyentes de eventos también pueden declarar el tipo de cualquier dependencia que necesiten de sus constructores. Todos los oyentes de eventos se resuelven a través [contenedor de servicio](/docs/{{version}}/container) de Laravel, por lo que las dependencias se inyectarán automáticamente.
:::

#### Deteniendo la propagación de un evento

A veces, es posible que desees detener la propagación de un evento a otros oyentes. Puede hacerlo devolviendo `false` desde el método` handle` de tu oyente.

<a name="queued-event-listeners"></a>
## Oyentes de Eventos de Cola

Los oyentes de colas pueden ser beneficiosos si tu oyente va a realizar una tarea lenta, como enviar un correo electrónico o realizar una solicitud HTTP. Antes de comenzar con oyentes de cola, asegúrate de [configurar su cola](/docs/{{version}}/queues) e iniciar un oyente de colas en tu servidor o entorno de desarrollo local.

Para especificar que un oyente debe estar en cola, agrega la interfaz `ShouldQueue` a la clase de oyente. Los oyentes generados por el comando de Artisan `event:generate` ya tienen esta interfaz importada en el espacio de nombres actual, por lo que puedes usarla inmediatamente:

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendShipmentNotification implements ShouldQueue
{
    //
}
```

¡Eso es! Ahora, cuando este oyente es llamado por un evento, el despachador de eventos lo colocará en cola automáticamente usando el [sistema de colas](/docs/{{version}}/queues) de Laravel. Si no se lanzan excepciones cuando la cola ejecuta el oyente, el trabajo en cola se eliminará automáticamente una vez que haya terminado de procesarse.

#### Personalizando la conexión de la cola y el nombre de la cola

Si deseas personalizar la conexión de cola, el nombre de la cola o el tiempo de demora de la cola de un oyente de eventos, puedes definir las propiedades `$connection`, `$queue` o `$delay` en tu clase de oyente:

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendShipmentNotification implements ShouldQueue
{
    /**
    * The name of the connection the job should be sent to.
    *
    * @var string|null
    */
    public $connection = 'sqs';

    /**
    * The name of the queue the job should be sent to.
    *
    * @var string|null
    */
    public $queue = 'listeners';

    /**
    * The time (seconds) before the job should be processed.
    *
    * @var int
    */
    public $delay = 60;
}
```

<a name="manually-accessing-the-queue"></a>
### Accediendo Manualmente a la Cola

Si necesitas acceder manualmente a los métodos `delete` y` release` de la cola de trabajo subyacente del oyente, puedes hacerlo utilizando el trait `Illuminate\Queue\InteractsWithQueue`. Este trait se importa de forma predeterminada en los oyentes generados y proporciona acceso a estos métodos:

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendShipmentNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
        * Handle the event.
        *
        * @param  \App\Events\OrderShipped  $event
        * @return void
        */
    public function handle(OrderShipped $event)
    {
        if (true) {
            $this->release(30);
        }
    }
}
```

<a name="handling-failed-jobs"></a>
### Manejo de Trabajos Fallidos

A veces, tus oyentes de eventos en cola pueden fallar. Si el oyente en cola supera el número máximo de intentos según lo define tu trabajador de cola, se llamará al método `failed` en tu oyente. El método `failed` recibe la instancia del evento y la excepción que causó el error:

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendShipmentNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
    * Handle the event.
    *
    * @param  \App\Events\OrderShipped  $event
    * @return void
    */
    public function handle(OrderShipped $event)
    {
        //
    }

    /**
    * Handle a job failure.
    *
    * @param  \App\Events\OrderShipped  $event
    * @param  \Exception  $exception
    * @return void
    */
    public function failed(OrderShipped $event, $exception)
    {
        //
    }
}
```

<a name="dispatching-events"></a>
## Despachando Eventos

Para enviar un evento, puedes pasar una instancia del evento a la función de ayuda (helper) `event`. El helper enviará el evento a todos tus oyentes registrados. Dado que el helper `event` está disponible globalmente, puedes llamarlo desde cualquier lugar de tu aplicación:

```php
<?php

namespace App\Http\Controllers;

use App\Order;
use App\Events\OrderShipped;
use App\Http\Controllers\Controller;

class OrderController extends Controller
{
    /**
    * Ship the given order.
    *
    * @param  int  $orderId
    * @return Response
    */
    public function ship($orderId)
    {
        $order = Order::findOrFail($orderId);

        // Order shipment logic...

        event(new OrderShipped($order));
    }
}
```

::: tip
Al realizar pruebas, puede ser útil afirmar que ciertos eventos se enviaron sin activar realmente a tus oyentes. Las [funciones de ayuda (helpers) incluidas](/docs/{{version}}/mocking#event-fake) en Laravel hace que sea fácil de hacerlo.
:::

<a name="event-subscribers"></a>
## Suscriptores de Eventos

<a name="writing-event-subscribers"></a>
### Escribiendo Suscriptores de Eventos

Los suscriptores de eventos son clases que pueden suscribirse a múltiples eventos dentro de la misma clase, lo que te permite definir varios manejadores de eventos dentro de una sola clase. Los suscriptores deben definir un método `subscribe`, al que se le pasará una instancia de despachador de eventos. Puedes llamar al método `listen` en el despachador dado para registrar los oyentes de eventos:

```php
<?php

namespace App\Listeners;

class UserEventSubscriber
{
    /**
    * Handle user login events.
    */
    public function handleUserLogin($event) {}

    /**
    * Handle user logout events.
    */
    public function handleUserLogout($event) {}

    /**
    * Register the listeners for the subscriber.
    *
    * @param  \Illuminate\Events\Dispatcher  $events
    */
    public function subscribe($events)
    {
        $events->listen(
            'Illuminate\Auth\Events\Login',
            'App\Listeners\UserEventSubscriber@handleUserLogin'
        );

        $events->listen(
            'Illuminate\Auth\Events\Logout',
            'App\Listeners\UserEventSubscriber@handleUserLogout'
        );
    }
}
```

<a name="registering-event-subscribers"></a>
### Registrando Suscriptores de Eventos

Después de escribir el suscriptor, estás listo para registrarlo con el despachador de eventos. Puede registrar suscriptores usando la propiedad `$subscribe` en el `EventServiceProvider`. Por ejemplo, vamos a agregar el `UserEventSubscriber` a la lista:

```php
<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
    * The event listener mappings for the application.
    *
    * @var array
    */
    protected $listen = [
        //
    ];

    /**
    * The subscriber classes to register.
    *
    * @var array
    */
    protected $subscribe = [
        'App\Listeners\UserEventSubscriber',
    ];
}
```