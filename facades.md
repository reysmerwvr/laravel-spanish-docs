# Facades

- [Introducción](#introduction)
- [Cuándo Usar Facades](#when-to-use-facades)
    - [Facades Vs. Inyección De Dependencias](#facades-vs-dependency-injection)
    - [Facades Vs. Funciones del Helper](#facades-vs-helper-functions)
- [Cómo Funcionan Las Facades](#how-facades-work)
- [Facades En Tiempo Real](#real-time-facades)
- [Referencia De Clases de Facades](#facade-class-reference)

<a name="introduction"></a>
## Introducción

Las Facades proveen una interfaz "estática" a las clases disponibles en el [service container] de la aplicación (/docs/{{version}}/container). Laravel viene con numerosas facades, las cuales brindan acceso a casi todas las características de Laravel. Las facades de Laravel sirven como "proxies estáticas" a las clases subyacentes en el service container, brindando el beneficio de una sintaxis tersa y expresiva, mantieniendo mayor verificabilidad y flexibilidad que los métodos estáticos tradicionales.

Todas las facades de Laravel se definen en el namespace `Illuminate\Support\Facades` . Entonces, podemos fácilmente acceder a una facade de esta forma:

    use Illuminate\Support\Facades\Cache;

    Route::get('/cache', function () {
        return Cache::get('key');
    });

A través de la documentación de Laravel, muchos de los ejemplos usarán facades para demostrar varias características del framework.

<a name="when-to-use-facades"></a>
## Cuándo Usar Facades

Las Facades tienen múltiples beneficios. Brindan una sintaxis tersa y memorizable que permite utilizar las características de Laravel sin tener que recordar nombres de clase largos que deben ser inyectados o configurados manualmente. Además, debido a su uso único de los métodos dinámicos PHP, son fáciles de probar.

Sin embargo, deben guardarse ciertas precauciones al hacer uso de facades. El peligro principal de las facades es la corrupción de alcance de clases. Como las facades son tan fáciles de usar y no requieren inyección, pued resultar fácil dejar que tus clases sigan creciendo y usar muchas facades en una sola clase. Usando inyección de dependencias, este potencial es mitigado por la retroalimentación visual que un constructor grande te da cuando tu clase está creciendo demasiado. Entonces, al usar facades, pon especial atención al tamaño de tu clase para que su alcance de responsabilidades permanezca limitado.

> {tip} CUando se construye un paquete de tercera partes que interactúa con Laravel, es mejor inyectar [Laravel contracts](/docs/{{version}}/contracts) en vez de usar facades. Como los paquetes son construidos fuera de Laravel, no tendrás acceso a los testing helpers para facades de Laravel.

<a name="facades-vs-dependency-injection"></a>
### Facades Vs. Inyección De Dependencias

Uno de los principales beneficios de la inyección de dependencias es la habilidad de intercambiar implementaciones de la clase inyectada. is the ability to swap implementations of the injected class. This is useful during testing since you can inject a mock or stub and assert that various methods were called on the stub.

Típicamente, no sería posible imitar o sustituir un método de clase verdaderamente estático. Sin embargo, como las facades utilizan métodos dinámicos para hacer proxy de llamadas de método a objetos resueltos desde el service container, podemos de hecho probar las facades exactamente como probaríamos una instancia de clase inyectada. Por ejemplo, dada la siguiente ruta:

    use Illuminate\Support\Facades\Cache;

    Route::get('/cache', function () {
        return Cache::get('key');
    });

Podemos escribir la siguiene prueba para verificar que el método `Cache::get` fue llamado con el argumento esperado:

    use Illuminate\Support\Facades\Cache;

    /**
     * A basic functional test example.
     *
     * @return void
     */
    public function testBasicExample()
    {
        Cache::shouldReceive('get')
             ->with('key')
             ->andReturn('value');

        $this->visit('/cache')
             ->see('value');
    }

<a name="facades-vs-helper-functions"></a>
### Facades Vs. Funciones Helper

Además de las facades, Laravel incluye una variedad de funciones "helper", las cuales pueden realizar tareas comunes como generar vistas, disparar eventos, despachar trabajos, o mandar respuestas HTTP. Muchas de estas funciones helper realizan la misma función que su facade correspondiente. For example, estas llamadas facade y helper son equivalentes:

    return View::make('profile');

    return view('profile');

No hay diferencia práctica en lo absoluto entre facades y funciones helper. Al usar funciones helper, aún se pueden probar como se probaría la facade correspondiente. Por ejemplo, dada la siguiente ruta:

    Route::get('/cache', function () {
        return cache('key');
    });

Bajo la superficie, el helper `cache` llamará al método `get` en la clase subyacente a la facade `Cache`. Entonces, aúncuando estamos usando la función helper, podemos escribir la siguiente prueba para verificar que el método fue llamado con el argumento esperado:

    use Illuminate\Support\Facades\Cache;

    /**
     * A basic functional test example.
     *
     * @return void
     */
    public function testBasicExample()
    {
        Cache::shouldReceive('get')
             ->with('key')
             ->andReturn('value');

        $this->visit('/cache')
             ->see('value');
    }

<a name="how-facades-work"></a>
## Cómo Funcionan Las Facades

En una aplicación Laravel, una facade es una clase que provee acceso a un objeto desde el container. The machinery that makes this work is in the `Facade` class. Laravel's facades, and any custom facades you create, will extend the base `Illuminate\Support\Facades\Facade` class.

The `Facade` base class makes use of the `__callStatic()` magic-method to defer calls from your facade to an object resolved from the container. In the example below, a call is made to the Laravel cache system. By glancing at this code, one might assume that the static method `get` is being called on the `Cache` class:

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use Illuminate\Support\Facades\Cache;

    class UserController extends Controller
    {
        /**
         * Show the profile for the given user.
         *
         * @param  int  $id
         * @return Response
         */
        public function showProfile($id)
        {
            $user = Cache::get('user:'.$id);

            return view('profile', ['user' => $user]);
        }
    }

Nótese que cerca del inicio del archivo estamos "importando" la facade `Cache` Esta facade sirve como proxy para acceder a la implementación subyacente de la interfaz `Illuminate\Contracts\Cache\Factory`. Cualquier llamada que hagamos usando la facade será pasada a la instancia subyacente del servicio de caché de Laravel.

Si observamos la clase `Illuminate\Support\Facades\Cache` verás que no hay método estático `get`:

    class Cache extends Facade
    {
        /**
         * Get the registered name of the component.
         *
         * @return string
         */
        protected static function getFacadeAccessor() { return 'cache'; }
    }

En su lugar, la facade `Cache` extiende la clase `Facade`y define el método `getFacadeAccessor()`. El trabajo de este método es devolver el nombre de un enlace de service container. Cuando un ususrio referencia cualquier método estático en la facade `Cache`, Laravel resuelve el enlace `cache` desde el [service container](/docs/{{version}}/container) y ejecuta el método solicitado (en este caso, `get`) contra ese objeto.

<a name="real-time-facades"></a>
## Facades En Tiempo Real

Usando facades en tiempo real, puedes tratar cualquier clase en tu aplicación como si fuera una facade. Para ilustrar cómo ésto puede ser utilizado, examinemos una alternativa. Por ejemplo, asumamos que nuestro modelo `Podcast` tiene un método `publish`. Sin embargo, para publicar el podcast, necesitamos inyectar una instancia `Publisher`:

    <?php

    namespace App;

    use App\Contracts\Publisher;
    use Illuminate\Database\Eloquent\Model;

    class Podcast extends Model
    {
        /**
         * Publish the podcast.
         *
         * @param  Publisher  $publisher
         * @return void
         */
        public function publish(Publisher $publisher)
        {
            $this->update(['publishing' => now()]);

            $publisher->publish($this);
        }
    }

Inyectar una implementación publisher dentro del método nos permite probar fácilmente el método aislado porque podemos imitar el publisher inyectado. Sin embargo, requiere que pasemos una instancia publisher instance cada vez que llamamos al método `publish`. Usando facades en tiempo real, podemos mantener la misma verificabilidad sin que se requiera pasar explícitamente una instancia `Publisher`. Para generar una facade en tiempo real, se añade el prefijo `Facades` al namespace de la clase importada:

    <?php

    namespace App;

    use Facades\App\Contracts\Publisher;
    use Illuminate\Database\Eloquent\Model;

    class Podcast extends Model
    {
        /**
         * Publish the podcast.
         *
         * @return void
         */
        public function publish()
        {
            $this->update(['publishing' => now()]);

            Publisher::publish($this);
        }
    }

Cuando la facade en tiempo real es utilizada, la implementación publisher será resuelta en el service container usando la porción de la interfaz o nombre de clase que aparece después del prefijo `Facades`. Al probar, podemos usar los testing helpers para facades integrados en Laravel para imitar esta llamada de método:

    <?php

    namespace Tests\Feature;

    use App\Podcast;
    use Tests\TestCase;
    use Facades\App\Contracts\Publisher;
    use Illuminate\Foundation\Testing\RefreshDatabase;

    class PodcastTest extends TestCase
    {
        use RefreshDatabase;

        /**
         * A test example.
         *
         * @return void
         */
        public function test_podcast_can_be_published()
        {
            $podcast = factory(Podcast::class)->create();

            Publisher::shouldReceive('publish')->once()->with($podcast);

            $podcast->publish();
        }
    }

<a name="facade-class-reference"></a>
## Referencia De Clases De Facades

A continuación encontrarás cada facade y su clase subyacente. Esta es una herrameinta útil para explorar rápidamente dentro de la documentación API para cualquier raíz de facade dada. La llave [service container binding](/docs/{{version}}/container) también ha sido incluida donde aplica.

Facade  |  Class  |  Service Container Binding
------------- | ------------- | -------------
App  |  [Illuminate\Foundation\Application](https://laravel.com/api/{{version}}/Illuminate/Foundation/Application.html)  |  `app`
Artisan  |  [Illuminate\Contracts\Console\Kernel](https://laravel.com/api/{{version}}/Illuminate/Contracts/Console/Kernel.html)  |  `artisan`
Auth  |  [Illuminate\Auth\AuthManager](https://laravel.com/api/{{version}}/Illuminate/Auth/AuthManager.html)  |  `auth`
Auth (Instance)  |  [Illuminate\Contracts\Auth\Guard](https://laravel.com/api/{{version}}/Illuminate/Contracts/Auth/Guard.html)  |  `auth.driver`
Blade  |  [Illuminate\View\Compilers\BladeCompiler](https://laravel.com/api/{{version}}/Illuminate/View/Compilers/BladeCompiler.html)  |  `blade.compiler`
Broadcast  |  [Illuminate\Contracts\Broadcasting\Factory](https://laravel.com/api/{{version}}/Illuminate/Contracts/Broadcasting/Factory.html)  |  &nbsp;
Broadcast (Instance)  |  [Illuminate\Contracts\Broadcasting\Broadcaster](https://laravel.com/api/{{version}}/Illuminate/Contracts/Broadcasting/Broadcaster.html)  |  &nbsp;
Bus  |  [Illuminate\Contracts\Bus\Dispatcher](https://laravel.com/api/{{version}}/Illuminate/Contracts/Bus/Dispatcher.html)  |  &nbsp;
Cache  |  [Illuminate\Cache\CacheManager](https://laravel.com/api/{{version}}/Illuminate/Cache/CacheManager.html)  |  `cache`
Cache (Instance)  |  [Illuminate\Cache\Repository](https://laravel.com/api/{{version}}/Illuminate/Cache/Repository.html)  |  `cache.store`
Config  |  [Illuminate\Config\Repository](https://laravel.com/api/{{version}}/Illuminate/Config/Repository.html)  |  `config`
Cookie  |  [Illuminate\Cookie\CookieJar](https://laravel.com/api/{{version}}/Illuminate/Cookie/CookieJar.html)  |  `cookie`
Crypt  |  [Illuminate\Encryption\Encrypter](https://laravel.com/api/{{version}}/Illuminate/Encryption/Encrypter.html)  |  `encrypter`
DB  |  [Illuminate\Database\DatabaseManager](https://laravel.com/api/{{version}}/Illuminate/Database/DatabaseManager.html)  |  `db`
DB (Instance)  |  [Illuminate\Database\Connection](https://laravel.com/api/{{version}}/Illuminate/Database/Connection.html)  |  `db.connection`
Event  |  [Illuminate\Events\Dispatcher](https://laravel.com/api/{{version}}/Illuminate/Events/Dispatcher.html)  |  `events`
File  |  [Illuminate\Filesystem\Filesystem](https://laravel.com/api/{{version}}/Illuminate/Filesystem/Filesystem.html)  |  `files`
Gate  |  [Illuminate\Contracts\Auth\Access\Gate](https://laravel.com/api/{{version}}/Illuminate/Contracts/Auth/Access/Gate.html)  |  &nbsp;
Hash  |  [Illuminate\Contracts\Hashing\Hasher](https://laravel.com/api/{{version}}/Illuminate/Contracts/Hashing/Hasher.html)  |  `hash`
Lang  |  [Illuminate\Translation\Translator](https://laravel.com/api/{{version}}/Illuminate/Translation/Translator.html)  |  `translator`
Log  |  [Illuminate\Log\LogManager](https://laravel.com/api/{{version}}/Illuminate/Log/LogManager.html)  |  `log`
Mail  |  [Illuminate\Mail\Mailer](https://laravel.com/api/{{version}}/Illuminate/Mail/Mailer.html)  |  `mailer`
Notification  |  [Illuminate\Notifications\ChannelManager](https://laravel.com/api/{{version}}/Illuminate/Notifications/ChannelManager.html)  |  &nbsp;
Password  |  [Illuminate\Auth\Passwords\PasswordBrokerManager](https://laravel.com/api/{{version}}/Illuminate/Auth/Passwords/PasswordBrokerManager.html)  |  `auth.password`
Password (Instance)  |  [Illuminate\Auth\Passwords\PasswordBroker](https://laravel.com/api/{{version}}/Illuminate/Auth/Passwords/PasswordBroker.html)  |  `auth.password.broker`
Queue  |  [Illuminate\Queue\QueueManager](https://laravel.com/api/{{version}}/Illuminate/Queue/QueueManager.html)  |  `queue`
Queue (Instance)  |  [Illuminate\Contracts\Queue\Queue](https://laravel.com/api/{{version}}/Illuminate/Contracts/Queue/Queue.html)  |  `queue.connection`
Queue (Base Class)  |  [Illuminate\Queue\Queue](https://laravel.com/api/{{version}}/Illuminate/Queue/Queue.html)  |  &nbsp;
Redirect  |  [Illuminate\Routing\Redirector](https://laravel.com/api/{{version}}/Illuminate/Routing/Redirector.html)  |  `redirect`
Redis  |  [Illuminate\Redis\RedisManager](https://laravel.com/api/{{version}}/Illuminate/Redis/RedisManager.html)  |  `redis`
Redis (Instance)  |  [Illuminate\Redis\Connections\Connection](https://laravel.com/api/{{version}}/Illuminate/Redis/Connections/Connection.html)  |  `redis.connection`
Request  |  [Illuminate\Http\Request](https://laravel.com/api/{{version}}/Illuminate/Http/Request.html)  |  `request`
Response  |  [Illuminate\Contracts\Routing\ResponseFactory](https://laravel.com/api/{{version}}/Illuminate/Contracts/Routing/ResponseFactory.html)  |  &nbsp;
Response (Instance)  |  [Illuminate\Http\Response](https://laravel.com/api/{{version}}/Illuminate/Http/Response.html)  |  &nbsp;
Route  |  [Illuminate\Routing\Router](https://laravel.com/api/{{version}}/Illuminate/Routing/Router.html)  |  `router`
Schema  |  [Illuminate\Database\Schema\Builder](https://laravel.com/api/{{version}}/Illuminate/Database/Schema/Builder.html)  |  &nbsp;
Session  |  [Illuminate\Session\SessionManager](https://laravel.com/api/{{version}}/Illuminate/Session/SessionManager.html)  |  `session`
Session (Instance)  |  [Illuminate\Session\Store](https://laravel.com/api/{{version}}/Illuminate/Session/Store.html)  |  `session.store`
Storage  |  [Illuminate\Filesystem\FilesystemManager](https://laravel.com/api/{{version}}/Illuminate/Filesystem/FilesystemManager.html)  |  `filesystem`
Storage (Instance)  |  [Illuminate\Contracts\Filesystem\Filesystem](https://laravel.com/api/{{version}}/Illuminate/Contracts/Filesystem/Filesystem.html)  |  `filesystem.disk`
URL  |  [Illuminate\Routing\UrlGenerator](https://laravel.com/api/{{version}}/Illuminate/Routing/UrlGenerator.html)  |  `url`
Validator  |  [Illuminate\Validation\Factory](https://laravel.com/api/{{version}}/Illuminate/Validation/Factory.html)  |  `validator`
Validator (Instance)  |  [Illuminate\Validation\Validator](https://laravel.com/api/{{version}}/Illuminate/Validation/Validator.html)  |  &nbsp;
View  |  [Illuminate\View\Factory](https://laravel.com/api/{{version}}/Illuminate/View/Factory.html)  |  `view`
View (Instance)  |  [Illuminate\View\View](https://laravel.com/api/{{version}}/Illuminate/View/View.html)  |  &nbsp;
