::: v-pre

# Broadcasting

- [Introducción](#introduction)
    - [Configuración](#configuration)
    - [Prerrequisitos Del Driver](#driver-prerequisites)
- [Descripción General](#concept-overview)
    - [Usando Una Aplicación De Ejemplo](#using-example-application)
- [Definiendo Eventos De Transmisión](#defining-broadcast-events)
    - [Nombre De La Transmisión](#broadcast-name)
    - [Datos De La Transmisión](#broadcast-data)
    - [Cola De La Transmisión](#broadcast-queue)
    - [Condiciones De La Transmisión](#broadcast-conditions)
- [Autorizando Canales](#authorizing-channels)
    - [Definiendo Rutas De Autorización](#defining-authorization-routes)
    - [Definiendo Callbacks de Autorización](#defining-authorization-callbacks)
    - [Definiendo Clases De Canales](#defining-channel-classes)
- [Transmitiendo Eventos](#broadcasting-events)
    - [Sólo A Otros](#only-to-others)
- [Recibiendo Transmisiones](#receiving-broadcasts)
    - [Instalando Laravel Echo](#installing-laravel-echo)
    - [Escuchando Eventos](#listening-for-events)
    - [Dejando Un Canal](#leaving-a-channel)
    - [Nombres De Espacio](#namespaces)
- [Canales De Presencia](#presence-channels)
    - [Autorizando Canales De Presencia](#authorizing-presence-channels)
    - [Uniéndose A Canales De Presencia](#joining-presence-channels)
    - [Transmitiendo A Canales De Presencia](#broadcasting-to-presence-channels)
- [Eventos Del Cliente](#client-events)
- [Notificaciones](#notifications)

<a name="introduction"></a>
## Introducción

En muchas aplicaciones web modernas, los WebSockets son usados para implementar interfaces de usuarios actualizadas en tiempo real. Cuando algún dato es actualizado en el servidor, un mensaje es típicamente enviado a través de una conexión WebSocket para ser manejado por el cliente. Esto proporciona una alternativa más robusta y eficiente para monitorear continuamente tu aplicación en busca de cambios.

Para asistirte en la construcción de ese tipo de aplicaciones, Laravel hace fácil "emitir" tus [eventos](/docs/{{version}}/events) a través de una conexión WebSocket. Emitir tus eventos te permite compartir los mismos nombres de eventos entre tu código del lado del servidor y tu aplicación JavaScript del lado de cliente.

::: tip
Antes de sumergirnos en la emisión de eventos, asegurate de haber leído toda la documentación de Laravel sobre [eventos y listeners](/docs/{{version}}/events).
:::

<a name="configuration"></a>
### Configuración

Toda la configuración de transmisión de eventos de tu aplicación está almacenada en el archivo de configuración `config/broadcasting.php`. Laravel soporta múltiples drivers de transmisión: [Pusher](https://pusher.com), [Redis](/docs/{{version}}/redis) y un driver `log` para desarrollo local y depuración. Adicionalmente, un driver `null` es incluido, que te permite deshabilitar totalmente las emisiones. Un ejemplo de configuración para cada uno de los drivers está incluido en el archivo de configuración `config/broadcasting.php`.

#### Proveedor De Servicios Broadcast

Antes de transmitir cualquier evento, necesitarás primero registrar `App\Providers\BroadcastServiceProvider`. En aplicaciones de Laravel nuevas, sólo necesitas descomentar este proveedor en el arreglo `providers` de tu archivo de configuración `config/app.php`. Este proveedor te permitirá registrar las rutas de autorización del broadcast y los callbacks.

#### Token CSRF

[Laravel Echo](#installing-laravel-echo) necesitará acceso al token CSRF de la sesión actual. Debes verificar que el elemento HTML `head` de tu aplicación define una etiqueta `meta` que contiene el token CSRF:

```html
<meta name="csrf-token" content="{{ csrf_token() }}">
```

<a name="driver-prerequisites"></a>
### Prerrequisitos Del Driver

#### Pusher

Si estás transmitiendo tus eventos mediante [Pusher](https://pusher.com), debes instalar el SDK de PHP de Pusher mediante el administrador de paquetes Composer:

```bash
composer require pusher/pusher-php-server "~3.0"
```

Luego, debes configurar tus credenciales de Pusher en el archivo de configuración `config/broadcasting.php`. Un ejemplo de configuración de Pusher está incluido en este archivo, permitiéndote especificar rápidamente tu clave de Pusher, contraseña y ID de la aplicación. La configuración de `pusher` del archivo `config/broadcasting.php` también te permite especificar `options` adicionales que son soportadas por Pusher, como el cluster:

```php
'options' => [
    'cluster' => 'eu',
    'encrypted' => true
],
```

Al usar Pusher y [Laravel Echo](#installing-laravel-echo), debes especificar `pusher` como tu transmisor deseado al instanciar la instancia de Echo en tu archivo `resources/js/bootstrap.js`:

```php
import Echo from "laravel-echo";

window.Pusher = require('pusher-js');

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: 'your-pusher-key'
});
```

#### Redis

Si estás usando el transmisor de Redis, debes instalar la librería Predis:

```php
composer require predis/predis
```

El transmisor de Redis transmitirá mensajes usando las característica pub / sub de Redis; sin embargo, necesitarás unir esto con un servidor de WebSocket que puede recibir mensajes desde Redis y emitirlos a tus canales de WebSocket.

Cuando el transmisor de Redis publica un evento, éste será publicado en los nombres de canales especificados en el evento y la carga será una cadena codificada de JSON que contiene el nombre del evento, una carga `data` y el usuario que genero el ID de socket del evento (si aplica).

#### Socket.IO

Si vas a unir el transmisor de Redis con un servidor Socket.IO, necesitarás incluir la librería de Socket.IO en tu aplicación. Puedes instalarla mediante el gestor de paquetes NPM:

```php
npm install --save socket.io-client
```

Luego, necesitarás instanciar Echo con el conector `socket.io` y un `host`.

```php
import Echo from "laravel-echo"

window.io = require('socket.io-client');

window.Echo = new Echo({
    broadcaster: 'socket.io',
    host: window.location.hostname + ':6001'
});
```

Finalmente, necesitarás ejecutar un servidor de Socket.IO compatible. Laravel no incluye la implementación de un servidor Socket.IO; sin embargo, un servidor de Socket.IO de la comunidad es actualmente mantenido en el repositorio de GitHub [tlaverdure/laravel-echo-server](https://github.com/tlaverdure/laravel-echo-server).

#### Prerrequisitos De La Cola

Antes de transmitir eventos, también necesitarás configurar y ejecutar un [listener de colas](/docs/{{version}}/queues). Toda la transmisión de eventos es realizada mediante trabajos en cola para que el tiempo de respuesta de tu aplicación no se vea necesariamente afectado.

<a name="concept-overview"></a>
## Descripción General

La transmisión de eventos de Laravel te permite transmitir tus eventos del lado del servidor de Laravel a tu aplicación JavaScript del lado del cliente usando un enfoque basado en drivers a los WebSockets. Actualmente, Laravel viene con drivers de [Pusher](https://pusher.com) y Redis. Los eventos pueden ser fácilmente consumidos en el lado del cliente usando el paquete de JavaScript [Laravel Echo](#installing-laravel-echo).

Los eventos son transmitidos mediante "canales", que pueden ser definidos como públicos o privados. Cualquier visitante en tu aplicación puede suscribirse a una canal público sin necesidad de autenticación o autorización; sin embargo, para poder suscribirse a canales privados, un usuario debe estar autenticado y autorizado para escuchar en dicho canal.

<a name="using-example-application"></a>
### Usando Una Aplicación De Ejemplo

Antes de sumergirnos en cada componente de la transmisión de eventos, vamos a ver un resumen usando una tienda virtual como ejemplo. No discutiremos los detalles sobre configurar [Pusher](https://pusher.com) o [Laravel Echo](#installing-laravel-echo) dado que éstos será discutido a detalle en otras secciones de esta documentación.

En nuestra aplicación, vamos a asumir que tenemos una página que permite a los usuarios ver el estado de envío de sus ordenes. Vamos también a asumir que un evento `ShippingStatusUpdated` es ejecutado cuando un estado de envío es procesado por la aplicación:

```php
event(new ShippingStatusUpdated($update));
```

#### Interfaz `ShouldBroadcast`

Cuando un usuario está viendo una de sus ordenes, no que queremos que tengan que refrescar la página para ver las actualizaciones del estado. En su lugar, queremos transmitir las actualizaciones a la aplicación a medida que son creadas. Así que, necesitamos marcar el evento `ShippingStatusUpdated` con la interfaz `ShouldBroadcast`. Esto instruirá a Laravel para que transmita el evento cuando es ejecutado:

```php
<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class ShippingStatusUpdated implements ShouldBroadcast
{
    /**
    * Information about the shipping status update.
    *
    * @var string
    */
    public $update;
}
```

La interfaz `ShouldBroadcast` requiere que nuestro evento defina un método `broadcastOn`. Este método es responsable de retornar los canales en los que el evento debería transmitir. Un stub vacío para este metodo está definido en las clases de eventos generadas, así que sólo necesitamos rellenar sus detalles. Sólo queremos que el creador de la orden sea capaz de ver las actualizaciones de estado, así que transmitiremos el evento en un canal privado que está enlazado a la orden:

```php
/**
* Get the channels the event should broadcast on.
*
* @return \Illuminate\Broadcasting\PrivateChannel
*/
public function broadcastOn()
{
    return new PrivateChannel('order.'.$this->update->order_id);
}
```

#### Autorizando Canales

Recuerda, los usuarios deben ser autorizados para escuchar en canales privados. Podemos definir las reglas de autorización de nuestro canal en el archivo `routes/channels.php`. En este ejemplo, necesitamos verificar que cualquier usuario intentando escuchar en el canal privado `order.1` es realmente el creador de la orden:

```php
Broadcast::channel('order.{orderId}', function ($user, $orderId) {
    return $user->id === Order::findOrNew($orderId)->user_id;
});
```

El método `channel` acepta dos argumentos: el nombre del canal y un callback que retorna `true` o `false` indicando si el usuario está autorizado para escuchar en el canal.

Todos los callbacks de autorización recibien al usuario actualmente autenticado como primer argumento y cualquier paremetro adicional como siguientes argumentos. En este ejemplo, estamos usando el placeholder `{orderId}` para indicar que la porción "ID" del nombre del canal es un wildcard.

#### Escuchar Transmisiones De Eventos

Luego, todo lo que queda es escuchar el evento en nuestra aplicación de JavaScript. Podemos hacer esto usando Laravel Echo. Primero, usaremos el método `private` para suscribirnos a un canal privado. Luego, podemos usar el método `listen` para escuchar el evento `ShippingStatusUpdated`. Por defecto, todas las propiedades públicas del evento serán incluidas en el evento de transmisión:

```php
Echo.private(`order.${orderId}`)
    .listen('ShippingStatusUpdated', (e) => {
        console.log(e.update);
    });
```

<a name="defining-broadcast-events"></a>
## Definiendo La Transmisión De Eventos

Para informar a Laravel que un evento dado debería ser transmitido, implementa la interfaz `Illuminate\Contracts\Broadcasting\ShouldBroadcast` en la clase del evento. Esta interfaz ya está importada en todas las clases de eventos generadas por el framework para que así puedas agregarla fácilmente a tus eventos.

La interfaz `ShouldBroadcast` requiere que implementes un sólo método: `broadcastOn`. El método `broadcastOn` debería retornar un canal o un arreglo de canales en los que el evento debería transmitirse. Los canales deben ser instancias de `Channel`, `PrivateChannel` o `PresenceChannel`. Las instancias de `Channel` representan canales públicos a los que cualquier usuario puede suscribirse mientras que `PrivateChannels` y `PresenceChannels` representan canales privados que requieren [autorización](#authorizing-channels):

```php
<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class ServerCreated implements ShouldBroadcast
{
    use SerializesModels;

    public $user;

    /**
    * Create a new event instance.
    *
    * @return void
    */
    public function __construct(User $user)
    {
        $this->user = $user;
    }

    /**
    * Get the channels the event should broadcast on.
    *
    * @return Channel|array
    */
    public function broadcastOn()
    {
        return new PrivateChannel('user.'.$this->user->id);
    }
}
```

Luego, sólo necesitas [ejecutar el evento](/docs/{{version}}/events) como normalmente lo harías. Una vez que el evento ha sido ejecutado, [un trabajo en cola](/docs/{{version}}/queues) transmitirá automáticamente el evento a través de tu driver de transmisión especificado.

<a name="broadcast-name"></a>
### Nombre De La Transmisión

Por defecto, Laravel transmitirá el evento usando el nombre de clase del evento. Sin embargo, puedes personalizar el nombre de la transmisión definiendo un método `broadcastAs` en el evento:

```php
/**
* The event's broadcast name.
*
* @return string
*/
public function broadcastAs()
{
    return 'server.created';
}
```

Si personalizas el nombre de la transmisión usando el método `broadcastAs`, debes asegurarte de registrar tu listener prefijándolo con un caracter `.`. Esto instruíra a Echo a no agregar el nombre de espacio de la aplicación al evento:

```php
.listen('.server.created', function (e) {
    ....
});
```

<a name="broadcast-data"></a>
### Datos De La Transmisión

Cuando un evento es transmitido, todas sus propiedades `public` son automáticamente serializadas y transmitidas como carga del evento, permitiéndote acceder a cualquiera de sus datos públicos desde tu aplicación de JavaScript. Así que, por ejemplo, si tu evento tiene una sola propiedad pública `$user` que contiene un modelo de Eloquent, la carga de transmisión del evento sería:

```php
{
    "user": {
        "id": 1,
        "name": "Patrick Stewart"
        ...
    }
}
```

Sin embargo, si deseas tener mayor control sobre la carga transmitida, puedes agregar un método `broadcastWith` a tu evento. Este método debería retornar el arreglo de datos que deseas transmitir como la carga del evento:

```php
/**
* Get the data to broadcast.
*
* @return array
*/
public function broadcastWith()
{
    return ['id' => $this->user->id];
}
```

<a name="broadcast-queue"></a>
### Cola De Transmisión

Por defecto, cada evento transmitido es colocado en la cola por defecto para la conexión de cola por defecto especificada en tu archivo de configuración `queue.php`. Puedes personalizar la cola usada por el transmisor definiendo una propiedad `broadcastQueue` en la clase de tu evento. Esta propiedad debería especificar el nombre de la cola que deseas usar al transmitir:

```php
/**
* The name of the queue on which to place the event.
*
* @var string
*/
public $broadcastQueue = 'your-queue-name';
```

Si quieres transmitir tu evento usando la cola `sync` en lugar del driver de cola por defecto, puedes implementar la interfaz `ShouldBroadcastNow` en lugar de `ShouldBroadcast`:

```php
<?php

use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class ShippingStatusUpdated implements ShouldBroadcastNow
{
    //
}
```

<a name="broadcast-conditions"></a>
### Condiciones De La Transmisión

Algunas veces quieres transmitir tu evento sólo si una condición dada es verdadera. Puedes definir estas condiciones agregando un método `broadcastWhen` a la clase de tu evento:

```php
/**
* Determine if this event should broadcast.
*
* @return bool
*/
public function broadcastWhen()
{
    return $this->value > 100;
}
```

<a name="authorizing-channels"></a>
## Autorizando Canales

Los canales privados requieren que autorizes que el usuario actualmente autenticado puede escuchar en el canal privado. Esto es logrado haciendo una solicitud HTTP a tu aplicación de Laravel con el nombre del canal y permitiendo a tu aplicación de terminar si el usuario puede escuchar en dicho canal. Al usar [Laravel Echo](#installing-laravel-echo), la solicitud HTTP para autorizar suscripciones a canales privados será realizada automáticamente; sin embargo, si necesitas definir las rutas necesarias para responder a estas solicitudes.

<a name="defining-authorization-routes"></a>
### Definiendo Rutas De Autorización

Afortunadamente, Laravel hace que sea fácil definir las rutas para responder a las solicitudes de autorización de canales. En el `BroadcastServiceProvider` incluido con tu aplicación de Laravel, verás una llamada al método `Broadcast::routes`. Este método registrará la ruta `/broadcasting/auth` para manejar las solicitudes de autorización:

```php
Broadcast::routes();
```

El método `Broadcast::routes` automáticamente coloca sus rutas dentro del grupo de middleware `web`; sin embargo, puedes pasar un arreglo de atributos de ruta al método si te gustaría personalizar los atributos asignados:

```php
Broadcast::routes($attributes);
```

#### Personalizando Endpoints De Autorización

Por defecto, Echo usará el endpoint `/broadcasting/auth` para autorizar acceso a canales. Sin embargo, puedes especificar tus propios endpoints de autorización pasando la opción de configuración `authEndpoint` a tu instancia de Echo:

```php
window.Echo = new Echo({
    broadcaster: 'pusher',
    key: 'your-pusher-key',
    authEndpoint: '/custom/endpoint/auth'
});
```

<a name="defining-authorization-callbacks"></a>
### Definiendo Callbacks De Autorización

Luego, necesitamos definir la lógica que realizará la autorización del canal. Esto es hecho en el archivo `routes/channels.php` que es incluido con tu aplicación. En este archivo, puedes usar el método `Broadcast::channel` para registrar callbacks de autorización de canales:

```php
Broadcast::channel('order.{orderId}', function ($user, $orderId) {
    return $user->id === Order::findOrNew($orderId)->user_id;
});
```

El método `channel` acepta dos argumentos: el nombre del canal y un callback que retorna `true` o `false` indicando si el usuario está autorizado para escuchar el canal.

Todos los callbacks de autorización reciben al usuario actualmente autenticado como primer argumento y cualquier parametro wildcard como sus argumentos siguientes. En este ejemplo, estamos usando el placeholder `{orderId}` para indicar la porción "ID" del nombre del canal es un wildcard.

#### Authorization Callback Model Binding

Igual que las rutas HTTP, las rutas de los canales pueden tomar ventaja de [modelo de enlace de rutas](/docs/{{version}}/routing#route-model-binding) de forma implícita y explícita. Por ejemplo, en lugar de recibir la cadena o ID númerico de la orden, puedes solicitar una instancia del modelo `Order`:

```php
use App\Order;

Broadcast::channel('order.{order}', function ($user, Order $order) {
    return $user->id === $order->user_id;
});
```

#### Autenticación del callback de autorización

Los canales privados y de presencia autentican al usuario actual a través de la protección de autenticación por defecto de la aplicacion. Si el usuario no está autenticado, la autorizacion del canal es automáticamente negada y el callback de autorización nunca se ejecuta. Sin embargo, puedes asignar múltiples protecciones personalizadas que deben autenticar la solicitud entrante si es necesario:

```php
Broadcast::channel('channel', function() {
    // ...
}, ['guards' => ['web', 'admin']])
```

<a name="defining-channel-classes"></a>
### Definiendo Clases De Canales

Si tu aplicación está consumiendo muchos canales diferentes, tu archivo `routes/channels.php` podría volverse voluminoso. Así que, en lugar de usar Closures para autorizar canales, puedes usar clases de canales. Para generar una clase de canal, usa el comando de artisan `make:channel`. Este comando colocará una nueva clase de canal en el directorio `App/Broadcasting`.

```php
php artisan make:channel OrderChannel
```

Luego, registra tu canal en tu archivo `routes/channels.php`:

```php
use App\Broadcasting\OrderChannel;

Broadcast::channel('order.{order}', OrderChannel::class);
```

Finalmente, puedes colocar la lógica de autorización para tu canal en el método `join` de la clase del canal. Este método `join` contendrá la misma lógica que típicamente habrías colocado en el Closure de tu canal de autorización. Puedes también tomar ventaja del modelo de enlace de canales:

```php
<?php

namespace App\Broadcasting;

use App\User;
use App\Order;

class OrderChannel
{
    /**
    * Create a new channel instance.
    *
    * @return void
    */
    public function __construct()
    {
        //
    }

    /**
    * Authenticate the user's access to the channel.
    *
    * @param  \App\User  $user
    * @param  \App\Order  $order
    * @return array|bool
    */
    public function join(User $user, Order $order)
    {
        return $user->id === $order->user_id;
    }
}
```

::: tip
Como muchas otras clases en Laravel, las clases de canales automáticamente serán resueltas por el [contenedor de servicios](/docs/{{version}}/container). Así que, puedes declarar el tipo de cualquier dependencia requerida por tu canal en su constructor.
:::

<a name="broadcasting-events"></a>
## Transmitiendo Eventos

Una vez que has definido un evento y lo has marcado con la interfaz `ShouldBroadcast`, sólo necesitas ejecutar el evento usando la función `event`. El despachador de eventos notará que el evento está marcado con la interfaz `ShouldBroadcast` y agrega el evento a la cola para transmisión:

```php
event(new ShippingStatusUpdated($update));
```

<a name="only-to-others"></a>
### Sólo A Otros

Al construir una aplicación que usa la transmisión de eventos, puedes sustituir la función `event` por la función `broadcast`. Como la función `event`, la función `broadcast` despacha el evento a tus listeners del lado del servidor:

```php
broadcast(new ShippingStatusUpdated($update));
```

Sin embargo, la función `broadcast` también expone el método `toOthers` que te permite excluir al usuario actual de los recipientes de la transmisión:

```php
broadcast(new ShippingStatusUpdated($update))->toOthers();
```

Para entender mejor cuando es posible que quieras usar el método `toOthers`, vamos a imaginar una aplicación de lista de tareas donde un usuario puede crear una nueva tarea ingresando un nombre de tarea. Para crear una tarea, tu aplicación puede hacer una solicitud a un punto de salida `/task` que transmite la creación de la tarea y retorna una representación JSON de la nueva tarea. Cuando tu aplicación de JavaScript recibe la respuesta del punto de salida, podría directamente insertar la nueva tarea en su lista de tareas de la siguiente forma:

```php
axios.post('/task', task)
    .then((response) => {
        this.tasks.push(response.data);
    });
```

Sin embargo, recuerda que también transmitimos la creación de la tarea. Si tu aplicación de JavaScript está escuchando este evento para agregar tareas a la lista de tareas, tendrás tareas duplicadas en tu lista: una del punto de salida y una de la transmisión.  Puedes resolver esto usando el método `toOthers` para instruir al transmisor para que no transmita el evento al usuario actual.

::: danger Nota
Tu evento debe usar el trait `Illuminate\Broadcasting\InteractsWithSockets` para poder llamar al método `toOthers`.
:::

#### Configuración

Cuando incializas una instancia de Laravel Echo, un ID de socket es asignado a la conexión. Si estás usando [Vue](https://vuejs.org) y [Axios](https://github.com/mzabriskie/axios), el ID del socket será agregado automáticamente a cada solicitud saliente como un header `X-Socket-ID`. Entonces, cuando llamas al método `toOthers`, Laravel extraerá el ID del socket desde el encabezado e instruirá al transmisor a no transmitir a ninguna conexión con dicho ID de socket.

Si no estás usando Vue y Axios, necesitarás configurar manualmente tu aplicación de JavaScript para enviar el encabezado `X-Socket-ID`. Puedes retornar el ID del socket usando el método `Echo.socketId`:

```php
var socketId = Echo.socketId();
```

<a name="receiving-broadcasts"></a>
## Recibiendo Transmisiones

<a name="installing-laravel-echo"></a>
### Instalando Laravel Echo

Laravel Echo es una librería de JavaScript que hace que sea fácil suscribirse a canales y escuchar transmisiones de eventos en Laravel. Puedes instalar Echo mediante el administrador de paquetes NPM. En este ejemplo, también instalaremos el paquete `pusher-js` dado que usaremos el transmisor de Pusher:

```php
npm install --save laravel-echo pusher-js
```

Una vez que Echo es instalado, estás listo para crear una instancia nueva de Echo en el JavaScript de tu aplicación. Un buen lugar para hacer esto es en la parte inferior del archivo `resources/js/bootstrap.js` que es incluido con el framework Laravel:

```php
import Echo from "laravel-echo"

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: 'your-pusher-key'
});
```

Al crear una instancia de Echo que usa el conector `pusher`, puedes también especificar un `cluster` así como también si la conexión debe ser encriptada:

```php
window.Echo = new Echo({
    broadcaster: 'pusher',
    key: 'your-pusher-key',
    cluster: 'eu',
    encrypted: true
});
```

#### Usando Una Instancia De Cliente Existente

Si ya tienes una instancia de cliente de Pusher o Socket.io que te gustaría que Echo usara, puedes pasarla a Echo mediante la opción de configuración `client`:

```php
const client = require('pusher-js');

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: 'your-pusher-key',
    client: client
});
```

<a name="listening-for-events"></a>
### Escuchando Eventos

Una vez que has instalado e instanciado Echo, estás listo para comenzar a escuchar transmisiones de eventos. Primero, usa el método `channel` para retornar una instancia de un canal, luego llama al método `listen` para escuchar a un evento especificado:

```php
Echo.channel('orders')
    .listen('OrderShipped', (e) => {
        console.log(e.order.name);
    });
```

Si te gustaría escuchar eventos en un canal privado, usa el método `private` en su lugar. Puedes continuar encadenando llamadas al método `listen` para escuchar múltiples eventos en un sólo canal:

```php
Echo.private('orders')
    .listen(...)
    .listen(...)
    .listen(...);
```

<a name="leaving-a-channel"></a>
### Abandonando Un Canal

Para abandonar un canal, puedes llamar al método `leaveChannel` en tu instancia de Echo:

```php
Echo.leaveChannel('orders');
```

Si te gustaría abandonar un canal y también sus canales privados y presenciales asociados, puedes usar el método `leave`:

```php
Echo.leave('orders');
```

<a name="namespaces"></a>
### Nombres De Espacio

Puedes haber notado en los ejemplos superiores que no especificamos un nombre de espacio completo para las clases del evento. Esto es debido a que Echo automáticamente asumirá que los eventos están ubicados en el nombre de espacio `App\Events`. Sin embargo, puedes configurar el nombre de espacio principal cuando instancias Echo pasando una opción de configuración `namespace`:

```php
window.Echo = new Echo({
    broadcaster: 'pusher',
    key: 'your-pusher-key',
    namespace: 'App.Other.Namespace'
});
```

Alternativamente, puedes prefijar las clases del evento con un `.` al suscribrte a estos usando Echo. Esto te permitirá siempre especificar el nombre de clase completamente calificado:

```php
Echo.channel('orders')
    .listen('.Namespace\\Event\\Class', (e) => {
        //
    });
```

<a name="presence-channels"></a>
## Canales De Presencia

Los Canales de Presencia son construidos sobre la seguridad de los canales privados mientras que exponen la característica adicional de saber quien está susbscrito al canal. Esto hace que sea fácil construir características de aplicación poderosas y colaborativas como notificar a usuarios cuando otro usuario está viendo la misma página.

<a name="authorizing-presence-channels"></a>
### Autorizando Canales De Presencia

Todos los canales de Presencia son también canales privados; por lo tanto, los usuarios deben estar [autorizados para accederlos](#authorizing-channels). Sin embargo, al definir callbacks de autorización para canales de presencia, no retornarás `true` si el usuario está autorizado para unirse al canal. En su lugar, debes retornar un arreglo de datos sobre el usuario.

Los datos retornados por el callback de autorización estarán disponibles para los listeners de eventos de canales de presencia en tu aplicación de JavaScript. Si el usuario no está autorizado para unirse al canal de presencia, debes retornar `false` o `null`:

```php
Broadcast::channel('chat.{roomId}', function ($user, $roomId) {
    if ($user->canJoinRoom($roomId)) {
        return ['id' => $user->id, 'name' => $user->name];
    }
});
```

<a name="joining-presence-channels"></a>
### Uniendose A Canales De Presencia

Para unirse a un canal de presencia, puedes usar el método `join` de Echo. El método `join` retornará una implementación de `PresenceChannel` que, junto con la exposición del método `listen`, te permite suscribirte a los eventos `here`, `joining` y `leaving`.

```php
Echo.join(`chat.${roomId}`)
    .here((users) => {
        //
    })
    .joining((user) => {
        console.log(user.name);
    })
    .leaving((user) => {
        console.log(user.name);
    });
```

El callback `here` será ejecutado inmediatamente una vez que el canal se haya unido con éxito y recibirá un arreglo que contiene la información del usuario para todos los demás usuarios actualmente subscritos al canal. El método `joining` será ejecutado cuando un nuevo usuario se une a un canal, mientras que el método `leaving` será ejecutado cuando un usuario abandona el canal.

<a name="broadcasting-to-presence-channels"></a>
### Transmitiendo A Canales De Presencia

Los canales de Presencia pueden recibir eventos igual que los canales públicos y privados. Usando el ejemplo de una sala de chat, podemos querer transmitir eventos `NewMessage` al canal de presencia de la sala. Para hacer eso, retornaremos una instancia de `PresenceChannel` desde el método `broadcastOn` del evento:

```php
/**
* Get the channels the event should broadcast on.
*
* @return Channel|array
*/
public function broadcastOn()
{
    return new PresenceChannel('room.'.$this->message->room_id);
}
```

Como los eventos públicos o privados, los canales de presencia pueden ser transmitidos usando la función `broadcast`. Como con otros eventos, puedes usar el método `toOthers` para excluir al usuario actual de recibir las transmisiones:

```php
broadcast(new NewMessage($message));

broadcast(new NewMessage($message))->toOthers();
```

Puedes escuchar el evento join mediante el método `listen` de Echo:

```php
Echo.join(`chat.${roomId}`)
    .here(...)
    .joining(...)
    .leaving(...)
    .listen('NewMessage', (e) => {
        //
    });
```

<a name="client-events"></a>
## Eventos Del Cliente

::: tip
Al usar [Pusher](https://pusher.com), debes habilitar la opción "Client Events" en la sección "App Settings" del [dashboard de tu aplicación](https://dashboard.pusher.com/) para enviar eventos del cliente.
:::

Algunas veces puedes querer transmitir un evento a otros clientes conectados sin tocar tu aplicación en lo absoluto. Esto puede ser particularmente útil para cosas como "escribir" notificaciones, donde quieres advertir a los usuarios de tu aplicación que otro usuario está escribiendo un mensaje en una pantalla dada. 

Para transmitir eventos del cliente, puedes usar el método `whisper` de Echo:

```php
Echo.private('chat')
    .whisper('typing', {
        name: this.user.name
    });
```

Para escuchar eventos del cliente, puedes usar el método `listenForWhisper`:

```php
Echo.private('chat')
    .listenForWhisper('typing', (e) => {
        console.log(e.name);
    });
```

<a name="notifications"></a>
## Notificaciones

Al juntar transmisión de eventos con [notificaciones](/docs/{{version}}/notifications), tu aplicación de JavaScript puede recibir nuevas notificaciones mientras ocurren sin necesidad de refrescar la página. Primero, asegurate de leer la documentación sobre el uso [del canal de transmisión de notificaciones](/docs/{{version}}/notifications#broadcast-notifications).

Una vez que has configurado una notificación para usar el canal de transmisión, puedes escuchar a los eventos de la transmisión usando el método `notification` de Echo. Recuerda, el nombre del canal debe ser igual al nombre de la clase de la entidad recibiendo la notificaciones:

```php
Echo.private(`App.User.${userId}`)
    .notification((notification) => {
        console.log(notification.type);
    });
```

En este ejemplo, todas las notificaciones enviadas a instancias de `App\User` mediante el canal `broadcast` serán recibidas por el callback. Un callback de autorización de canal para el canal `App.User.{id}` es incluido en el `BroadcastServiceProvider` que viene con el framework Laravel por defecto.