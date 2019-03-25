::: v-pre

# Contratos

- [Introducción](#introduction)
    - [Contratos Vs. Facades](#contracts-vs-facades)
- [Cuando Usar Contratos](#when-to-use-contracts)
    - [Bajo Acoplamiento](#loose-coupling)
    - [Simplicidad](#simplicity)
- [Cómo Usar Contratos](#how-to-use-contracts)
- [Referencia de Contratos](#contract-reference)

<a name="introduction"></a>
## Introducción

Los Contratos de Laravel son un conjunto de interfaces que definen los servicios principales proporcionados por el framework. Por ejemplo, un contrato `Illuminate\Contracts\Queue\Queue` define los métodos necesarios para las colas de trabajo, mientras que el contrato `Illuminate\Contracts\Mail\Mailer` define los métodos necesarios para el envío de correos electrónicos.

Cada contrato tiene una implementación correspondiente provista por el framework. Por ejemplo, laravel proporciona una implementación de cola con una variedad de conductores (drivers), y una implementación de envío de correo electrónico que funciona con [SwiftMailer](https://swiftmailer.symfony.com/).

Todos los contratos de Laravel viven en [su repositorio de GitHub propio](https://github.com/illuminate/contracts). Esto proporciona un punto de referencia rápido para todos los contratos disponibles, así como un paquete único y desacoplado que puede ser utilizado por los desarrolladores de paquetes.

<a name="contracts-vs-facades"></a>
### Contratos Vs. Facades

Los [facades](/docs/5.8/facades) de Laravel y las funciones de ayuda (helpers) proporcionan una forma sencilla de utilizar los servicios de Laravel sin necesidad de determinar el tipo y resolver contratos fuera del contenedor de servicios. En la mayoría de los casos, cada facade tiene un contrato equivalente.

A diferencia de las facades, que no necesitan que las requieras en el constructor de su clase, los contratos te permiten definir dependencias explícitas para tus clases. Algunos desarrolladores prefieren definir explícitamente sus dependencias de esta manera y, por lo tanto, prefieren usar contratos, mientras que otros desarrolladores disfrutan de la conveniencia de las facades.

::: tip
La mayoría de las aplicaciones funcionarán bien sin importar si prefieres facades o contratos. Sin embargo, si estás construyendo un paquete, debes considerar seriamente el uso de contratos, ya que será más fáciles de probar en un contexto paquete.
:::

<a name="when-to-use-contracts"></a>
## Cuando Usar Contratos

Como se discutió en otro lugar, gran parte de la decisión de usar contratos o facades se reducirá a los gustos personales y los gustos de su equipo de desarrollo. Tanto los contratos como las facades se pueden utilizar para crear aplicaciones Laravel robustas y bien probadas. Mientras mantengas enfocadas las responsabilidades de tu clase, notarás muy pocas diferencias prácticas entre el uso de contratos y facades.

Sin embargo, todavía puede tener varias preguntas con respecto a los contratos. Por ejemplo, ¿por qué usar interfaces? ¿No es más complicado usar interfaces? Detallemos las razones para utilizar interfaces en los siguientes encabezados: bajo acoplamiento y simplicidad.

<a name="loose-coupling"></a>
### Bajo Acoplamiento

Primero, revisemos algunos códigos que están estrechamente acoplado a una implementación de caché. Considera lo siguiente:

```php
<?php

namespace App\Orders;

class Repository
{
    /**
    * The cache instance.
    */
    protected $cache;

    /**
    * Create a new repository instance.
    *
    * @param  \SomePackage\Cache\Memcached  $cache
    * @return void
    */
    public function __construct(\SomePackage\Cache\Memcached $cache)
    {
        $this->cache = $cache;
    }

    /**
    * Retrieve an Order by ID.
    *
    * @param  int  $id
    * @return Order
    */
    public function find($id)
    {
        if ($this->cache->has($id))    {
            //
        }
    }
}
```

En esta clase, el código está estrechamente acoplado a una implementación de caché determinada. Está estrechamente acoplado porque dependemos de una clase de caché concreta de un proveedor de paquetes. Si la API de ese paquete cambia, nuestro código también debe cambiar.

Del mismo modo, si queremos reemplazar nuestra tecnología de caché subyacente (Memcached) con otra tecnología (Redis), nuevamente tendremos que modificar nuestro repositorio. Nuestro repositorio no debe tener tanto conocimiento sobre quién les proporciona los datos o cómo los proporcionan.

**En lugar de este enfoque, podemos mejorar nuestro código dependiendo de una interfaz simple e independiente del proveedor:**

```php
<?php

namespace App\Orders;

use Illuminate\Contracts\Cache\Repository as Cache;

class Repository
{
    /**
    * The cache instance.
    */
    protected $cache;

    /**
    * Create a new repository instance.
    *
    * @param  Cache  $cache
    * @return void
    */
    public function __construct(Cache $cache)
    {
        $this->cache = $cache;
    }
}
```

Ahora el código no está acoplado a ningún proveedor específico, ni siquiera a Laravel. Dado que el paquete de contratos no contiene implementación ni dependencias, puede escribir fácilmente una implementación alternativa de cualquier contrato dado, lo que le permite reemplazar su implementación de caché sin modificar ninguno de los códigos que consumen caché.

<a name="simplicity"></a>
### Simplicidad

Cuando todos los servicios de Laravel están claramente definidos dentro de interfaces simples, es muy fácil determinar la funcionalidad ofrecida por un servicio dado. **Los contratos sirven como documentación sucinta de las características del framework.**

Además, cuando dependes de interfaces simples, tu código es más fácil de entender y mantener. En lugar de rastrear qué métodos están disponibles dentro de una clase grande y complicada, puedes hacer referencia a una interfaz sencilla y limpia.

<a name="how-to-use-contracts"></a>
## Cómo Usar Contratos

Entonces, ¿Cómo se obtiene una implementación de un contrato? En realidad es bastante simple.

Muchos tipos de clases en Laravel se resuelven a través del [contenedor de servicio](/docs/5.8/container), incluyendo controladores, los escuchadores de eventos, middleware, trabajos de cola e incluso una Closure de ruta. Por lo tanto, para obtener una implementación de un contrato, puede simplemente "declarar el tipo" de la interfaz en el constructor de la clase que se está resolviendo.

Por ejemplo, veamos este escuchador (listener) de evento:

```php
<?php

namespace App\Listeners;

use App\User;
use App\Events\OrderWasPlaced;
use Illuminate\Contracts\Redis\Factory;

class CacheOrderInformation
{
    /**
    * The Redis factory implementation.
    */
    protected $redis;

    /**
    * Create a new event handler instance.
    *
    * @param  Factory  $redis
    * @return void
    */
    public function __construct(Factory $redis)
    {
        $this->redis = $redis;
    }

    /**
    * Handle the event.
    *
    * @param  OrderWasPlaced  $event
    * @return void
    */
    public function handle(OrderWasPlaced $event)
    {
        //
    }
}
```

Cuando se resuelve el escuchador de evento, el contenedor de servicios leerá las declaraciones de tipo en el constructor de la clase e inyectará el valor apropiado. Para obtener más información sobre cómo registrar cosas en el contenedor de servicios, consulte [su documentación](/docs/5.8/container).

<a name="contract-reference"></a>
## Referencia de Contratos

Esta tabla proporciona una referencia rápida a todos los contratos de Laravel y sus facades equivalentes:

Contrato  |  Referencias de la Facade
--------- | -------------------------
[Illuminate\Contracts\Auth\Access\Authorizable](https://github.com/illuminate/contracts/blob/5.8/Auth/Access/Authorizable.php) | &nbsp;
[Illuminate\Contracts\Auth\Access\Gate](https://github.com/illuminate/contracts/blob/5.8/Auth/Access/Gate.php) | `Gate`
[Illuminate\Contracts\Auth\Authenticatable](https://github.com/illuminate/contracts/blob/5.8/Auth/Authenticatable.php) | &nbsp;
[Illuminate\Contracts\Auth\CanResetPassword](https://github.com/illuminate/contracts/blob/5.8/Auth/CanResetPassword.php) | &nbsp;
[Illuminate\Contracts\Auth\Factory](https://github.com/illuminate/contracts/blob/5.8/Auth/Factory.php) | `Auth`
[Illuminate\Contracts\Auth\Guard](https://github.com/illuminate/contracts/blob/5.8/Auth/Guard.php) | `Auth::guard()`
[Illuminate\Contracts\Auth\PasswordBroker](https://github.com/illuminate/contracts/blob/5.8/Auth/PasswordBroker.php) | `Password::broker()`
[Illuminate\Contracts\Auth\PasswordBrokerFactory](https://github.com/illuminate/contracts/blob/5.8/Auth/PasswordBrokerFactory.php) | `Password`
[Illuminate\Contracts\Auth\StatefulGuard](https://github.com/illuminate/contracts/blob/5.8/Auth/StatefulGuard.php) | &nbsp;
[Illuminate\Contracts\Auth\SupportsBasicAuth](https://github.com/illuminate/contracts/blob/5.8/Auth/SupportsBasicAuth.php) | &nbsp;
[Illuminate\Contracts\Auth\UserProvider](https://github.com/illuminate/contracts/blob/5.8/Auth/UserProvider.php) | &nbsp;
[Illuminate\Contracts\Bus\Dispatcher](https://github.com/illuminate/contracts/blob/5.8/Bus/Dispatcher.php) | `Bus`
[Illuminate\Contracts\Bus\QueueingDispatcher](https://github.com/illuminate/contracts/blob/5.8/Bus/QueueingDispatcher.php) | `Bus::dispatchToQueue()`
[Illuminate\Contracts\Broadcasting\Factory](https://github.com/illuminate/contracts/blob/5.8/Broadcasting/Factory.php) | `Broadcast`
[Illuminate\Contracts\Broadcasting\Broadcaster](https://github.com/illuminate/contracts/blob/5.8/Broadcasting/Broadcaster.php)  | `Broadcast::connection()`
[Illuminate\Contracts\Broadcasting\ShouldBroadcast](https://github.com/illuminate/contracts/blob/5.8/Broadcasting/ShouldBroadcast.php) | &nbsp;
[Illuminate\Contracts\Broadcasting\ShouldBroadcastNow](https://github.com/illuminate/contracts/blob/5.8/Broadcasting/ShouldBroadcastNow.php) | &nbsp;
[Illuminate\Contracts\Cache\Factory](https://github.com/illuminate/contracts/blob/5.8/Cache/Factory.php) | `Cache`
[Illuminate\Contracts\Cache\Lock](https://github.com/illuminate/contracts/blob/5.8/Cache/Lock.php) | &nbsp;
[Illuminate\Contracts\Cache\LockProvider](https://github.com/illuminate/contracts/blob/5.8/Cache/LockProvider.php) | &nbsp;
[Illuminate\Contracts\Cache\Repository](https://github.com/illuminate/contracts/blob/5.8/Cache/Repository.php) | `Cache::driver()`
[Illuminate\Contracts\Cache\Store](https://github.com/illuminate/contracts/blob/5.8/Cache/Store.php) | &nbsp;
[Illuminate\Contracts\Config\Repository](https://github.com/illuminate/contracts/blob/5.8/Config/Repository.php) | `Config`
[Illuminate\Contracts\Console\Application](https://github.com/illuminate/contracts/blob/5.8/Console/Application.php) | &nbsp;
[Illuminate\Contracts\Console\Kernel](https://github.com/illuminate/contracts/blob/5.8/Console/Kernel.php) | `Artisan`
[Illuminate\Contracts\Container\Container](https://github.com/illuminate/contracts/blob/5.8/Container/Container.php) | `App`
[Illuminate\Contracts\Cookie\Factory](https://github.com/illuminate/contracts/blob/5.8/Cookie/Factory.php) | `Cookie`
[Illuminate\Contracts\Cookie\QueueingFactory](https://github.com/illuminate/contracts/blob/5.8/Cookie/QueueingFactory.php) | `Cookie::queue()`
[Illuminate\Contracts\Database\ModelIdentifier](https://github.com/illuminate/contracts/blob/5.8/Database/ModelIdentifier.php) | &nbsp;
[Illuminate\Contracts\Debug\ExceptionHandler](https://github.com/illuminate/contracts/blob/5.8/Debug/ExceptionHandler.php) | &nbsp;
[Illuminate\Contracts\Encryption\Encrypter](https://github.com/illuminate/contracts/blob/5.8/Encryption/Encrypter.php) | `Crypt`
[Illuminate\Contracts\Events\Dispatcher](https://github.com/illuminate/contracts/blob/5.8/Events/Dispatcher.php) | `Event`
[Illuminate\Contracts\Filesystem\Cloud](https://github.com/illuminate/contracts/blob/5.8/Filesystem/Cloud.php) | `Storage::cloud()`
[Illuminate\Contracts\Filesystem\Factory](https://github.com/illuminate/contracts/blob/5.8/Filesystem/Factory.php) | `Storage`
[Illuminate\Contracts\Filesystem\Filesystem](https://github.com/illuminate/contracts/blob/5.8/Filesystem/Filesystem.php) | `Storage::disk()`
[Illuminate\Contracts\Foundation\Application](https://github.com/illuminate/contracts/blob/5.8/Foundation/Application.php) | `App`
[Illuminate\Contracts\Hashing\Hasher](https://github.com/illuminate/contracts/blob/5.8/Hashing/Hasher.php) | `Hash`
[Illuminate\Contracts\Http\Kernel](https://github.com/illuminate/contracts/blob/5.8/Http/Kernel.php) | &nbsp;
[Illuminate\Contracts\Mail\MailQueue](https://github.com/illuminate/contracts/blob/5.8/Mail/MailQueue.php) | `Mail::queue()`
[Illuminate\Contracts\Mail\Mailable](https://github.com/illuminate/contracts/blob/5.8/Mail/Mailable.php) | &nbsp;
[Illuminate\Contracts\Mail\Mailer](https://github.com/illuminate/contracts/blob/5.8/Mail/Mailer.php) | `Mail`
[Illuminate\Contracts\Notifications\Dispatcher](https://github.com/illuminate/contracts/blob/5.8/Notifications/Dispatcher.php) | `Notification`
[Illuminate\Contracts\Notifications\Factory](https://github.com/illuminate/contracts/blob/5.8/Notifications/Factory.php) | `Notification`
[Illuminate\Contracts\Pagination\LengthAwarePaginator](https://github.com/illuminate/contracts/blob/5.8/Pagination/LengthAwarePaginator.php) | &nbsp;
[Illuminate\Contracts\Pagination\Paginator](https://github.com/illuminate/contracts/blob/5.8/Pagination/Paginator.php) | &nbsp;
[Illuminate\Contracts\Pipeline\Hub](https://github.com/illuminate/contracts/blob/5.8/Pipeline/Hub.php) | &nbsp;
[Illuminate\Contracts\Pipeline\Pipeline](https://github.com/illuminate/contracts/blob/5.8/Pipeline/Pipeline.php) | &nbsp;
[Illuminate\Contracts\Queue\EntityResolver](https://github.com/illuminate/contracts/blob/5.8/Queue/EntityResolver.php) | &nbsp;
[Illuminate\Contracts\Queue\Factory](https://github.com/illuminate/contracts/blob/5.8/Queue/Factory.php) | `Queue`
[Illuminate\Contracts\Queue\Job](https://github.com/illuminate/contracts/blob/5.8/Queue/Job.php) | &nbsp;
[Illuminate\Contracts\Queue\Monitor](https://github.com/illuminate/contracts/blob/5.8/Queue/Monitor.php) | `Queue`
[Illuminate\Contracts\Queue\Queue](https://github.com/illuminate/contracts/blob/5.8/Queue/Queue.php) | `Queue::connection()`
[Illuminate\Contracts\Queue\QueueableCollection](https://github.com/illuminate/contracts/blob/5.8/Queue/QueueableCollection.php) | &nbsp;
[Illuminate\Contracts\Queue\QueueableEntity](https://github.com/illuminate/contracts/blob/5.8/Queue/QueueableEntity.php) | &nbsp;
[Illuminate\Contracts\Queue\ShouldQueue](https://github.com/illuminate/contracts/blob/5.8/Queue/ShouldQueue.php) | &nbsp;
[Illuminate\Contracts\Redis\Factory](https://github.com/illuminate/contracts/blob/5.8/Redis/Factory.php) | `Redis`
[Illuminate\Contracts\Routing\BindingRegistrar](https://github.com/illuminate/contracts/blob/5.8/Routing/BindingRegistrar.php) | `Route`
[Illuminate\Contracts\Routing\Registrar](https://github.com/illuminate/contracts/blob/5.8/Routing/Registrar.php) | `Route`
[Illuminate\Contracts\Routing\ResponseFactory](https://github.com/illuminate/contracts/blob/5.8/Routing/ResponseFactory.php) | `Response`
[Illuminate\Contracts\Routing\UrlGenerator](https://github.com/illuminate/contracts/blob/5.8/Routing/UrlGenerator.php) | `URL`
[Illuminate\Contracts\Routing\UrlRoutable](https://github.com/illuminate/contracts/blob/5.8/Routing/UrlRoutable.php) | &nbsp;
[Illuminate\Contracts\Session\Session](https://github.com/illuminate/contracts/blob/5.8/Session/Session.php) | `Session::driver()`
[Illuminate\Contracts\Support\Arrayable](https://github.com/illuminate/contracts/blob/5.8/Support/Arrayable.php) | &nbsp;
[Illuminate\Contracts\Support\Htmlable](https://github.com/illuminate/contracts/blob/5.8/Support/Htmlable.php) | &nbsp;
[Illuminate\Contracts\Support\Jsonable](https://github.com/illuminate/contracts/blob/5.8/Support/Jsonable.php) | &nbsp;
[Illuminate\Contracts\Support\MessageBag](https://github.com/illuminate/contracts/blob/5.8/Support/MessageBag.php) | &nbsp;
[Illuminate\Contracts\Support\MessageProvider](https://github.com/illuminate/contracts/blob/5.8/Support/MessageProvider.php) | &nbsp;
[Illuminate\Contracts\Support\Renderable](https://github.com/illuminate/contracts/blob/5.8/Support/Renderable.php) | &nbsp;
[Illuminate\Contracts\Support\Responsable](https://github.com/illuminate/contracts/blob/5.8/Support/Responsable.php) | &nbsp;
[Illuminate\Contracts\Translation\Loader](https://github.com/illuminate/contracts/blob/5.8/Translation/Loader.php) | &nbsp;
[Illuminate\Contracts\Translation\Translator](https://github.com/illuminate/contracts/blob/5.8/Translation/Translator.php) | `Lang`
[Illuminate\Contracts\Validation\Factory](https://github.com/illuminate/contracts/blob/5.8/Validation/Factory.php) | `Validator`
[Illuminate\Contracts\Validation\ImplicitRule](https://github.com/illuminate/contracts/blob/5.8/Validation/ImplicitRule.php) | &nbsp;
[Illuminate\Contracts\Validation\Rule](https://github.com/illuminate/contracts/blob/5.8/Validation/Rule.php) | &nbsp;
[Illuminate\Contracts\Validation\ValidatesWhenResolved](https://github.com/illuminate/contracts/blob/5.8/Validation/ValidatesWhenResolved.php) | &nbsp;
[Illuminate\Contracts\Validation\Validator](https://github.com/illuminate/contracts/blob/5.8/Validation/Validator.php) | `Validator::make()`
[Illuminate\Contracts\View\Engine](https://github.com/illuminate/contracts/blob/5.8/View/Engine.php) | &nbsp;
[Illuminate\Contracts\View\Factory](https://github.com/illuminate/contracts/blob/5.8/View/Factory.php) | `View`
[Illuminate\Contracts\View\View](https://github.com/illuminate/contracts/blob/5.8/View/View.php) | `View::make()`