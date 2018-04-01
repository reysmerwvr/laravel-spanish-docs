# Cache

- [Configuración](#configuration)
    - [Prerrequisitos Del Controlador](#driver-prerequisites)
- [Uso De Caché](#cache-usage)
    - [Obtener Una Instancia De Caché](#obtaining-a-cache-instance)
    - [Recuperar Elementos De Caché](#retrieving-items-from-the-cache)
    - [Almacenar Elementos En Caché](#storing-items-in-the-cache)
    - [Eliminar Elementos De Caché](#removing-items-from-the-cache)
    - [El Helper Cache](#the-cache-helper)
- [Etiquetas De Caché](#cache-tags)
    - [Almacenar Elementos De Caché Etiquetados](#storing-tagged-cache-items)
    - [Acceder A Elementos De Caché Etiquetados](#accessing-tagged-cache-items)
    - [Eliminar Elementos De Caché Etiquetados](#removing-tagged-cache-items)
- [Agregar Controladores De Caché Personalizados](#adding-custom-cache-drivers)
    - [Escribir El Controlador](#writing-the-driver)
    - [Registrar El Controlador](#registering-the-driver)
- [Eventos](#events)

<a name="configuration"></a>
## Configuración

Laravel proporciona una API expresiva y unifcada para varios backends de almacenamiento de caché. La configuración de caché está ubicada en `config/cache.php`. En este archivo puede indicar el controlador de caché que desee utilizar por default en toda su aplicación. Laravel es compatible con los almacenamientos en caché más populares como lo son [Memcached](https://memcached.org) y [Redis](https://redis.io) por default.

El archivo de configuración de caché contiene otras opciones adicionales, las cuales están documentadas dentro del mismo archivo, por lo que deberá asegurarse de revisar esas opciones. Por default, Laravel está configurado para utilizar el controlador de caché `local`, que almacena los objetos de caché serializados en el sistema de archivos. Para aplicaciones más grandes, es recomendable que utilice un controlador más robusto como Memcached o Redis. Incluso puede configurar múltiples configuraciones de caché para el mismo controlador.

<a name="driver-prerequisites"></a>
### Prerrequisitos Del Controlador

#### Base de datos

Cuando utilice el controlador de caché `database`, necesitará configurar una tabla que contenga los elementos de caché. Podrá encontrar una declaración de ejemplo `Schema` en la tabla inferior:

    Schema::create('cache', function ($table) {
        $table->string('key')->unique();
        $table->text('value');
        $table->integer('expiration');
    });

> {tip} También puede utilizar el comando `php artisan cache:table` para generar una migración con el esquema apropiado.

#### Memcached

Utilizar el controlador Memcached requiere que tenga instalado el [paquete de Memcached PECL](https://pecl.php.net/package/memcached). Puede listar todos sus servidores de Memcached en el archivo de configuración `config/cache.php`:

    'memcached' => [
        [
            'host' => '127.0.0.1',
            'port' => 11211,
            'weight' => 100
        ],
    ],

También puede establecer la opción `host` a la ruta de un socket de UNIX. Si hace esto, la opción `port` se debe establecer como `0`:

    'memcached' => [
        [
            'host' => '/var/run/memcached/memcached.sock',
            'port' => 0,
            'weight' => 100
        ],
    ],

#### Redis

Antes de comenzar a utilizar el caché con Redis en Laravel, deberá instalar el paquete `predis/predis` (~1.0) por medio de Composer o instalar la extensión de PHP PhpRedis por medio de PECL.

Para más información sobre cómo configurar Redis, consulte su [página de documentación de Laravel](/docs/{{version}}/redis#configuration).

<a name="cache-usage"></a>
## Uso De Caché

<a name="obtaining-a-cache-instance"></a>
### Obtener Una Instancia De Caché

Los [contratos](/docs/{{version}}/contracts) `Illuminate\Contracts\Cache\Factory` y `Illuminate\Contracts\Cache\Repository` proporcionan acceso a los servicios de caché de Laravel. El contrato `Factory` proporciona acceso a todos los controladores de cahcé definidos para su aplicación. El contrato `Repository` típicamente es una implementación del controlador de caché predeterminado para su aplicación según lo especificado en su archivo de configuración de `cache`.

Sin embargo, también puede usar el facade `Cache`, que es lo que usaremos a lo largo de esta documentación. El facade `Cache` proporciona acceso conveniente y directo  a las implementaciones subyacientes de los contratos de Laravel.

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

#### Acceder A Múltiples Almacenamientos De Caché

Usando el facade `Cache`, puede acceder a varios almacenamientos de caché a través del método `store`. La llave que se pasa al método `store` debe corresponder a uno de los almacenamientos listados en el arreclo de configuración `stores` en su archivo de configuración `cache`:

    $value = Cache::store('file')->get('foo');

    Cache::store('redis')->put('bar', 'baz', 10);

<a name="retrieving-items-from-the-cache"></a>
### Recuperar Elementos De Caché

El método `get` en el facade `Cache` es utilizado para recuperar elementos desde caché. Si el elemento no existe en caché, se va a regresar `null`. Si lo desea, puede pasar un segundo argumento al método `get` indicando el valor predeterminado que desee regresar en caso de que el elemento no exista:

    $value = Cache::get('key');

    $value = Cache::get('key', 'default');

Incluso puede pasar un `Closure` como valor predeterminado. El resultado del `Closure` será devuelto si el elemento especificado no existe en caché. Pasar un Closure le permite diferir la recuperación de valores predeterminados de una base de datos a otro servicio externo:

    $value = Cache::get('key', function () {
        return DB::table(...)->get();
    });

#### Comprobar La Existencia De Un Elemento

El método `has` se puede utilizar para determinar la existencia de un elemento en caché. Este método devolverá `false` si el valor es `null` o `false`:

    if (Cache::has('key')) {
        //
    }

#### Incrementando / Decrementando Valores

Los métodos `increment` y `decrement` se pueden usar para ajustar el valor de los elementos enteros en caché. Ambos métodos aceptan un segundo parámetro opcional que indica la cantidar por la cuál incrementar o disminuir el valor del elemento:

    Cache::increment('key');
    Cache::increment('key', $amount);
    Cache::decrement('key');
    Cache::decrement('key', $amount);

#### Recuperar Y Almacenar

En ocasiones, es posible que desee recuperar un elemento de la memoria caché, pero también almacenar un valor predeterminado si el elemento no existe. Por ejemplo, puede que desee recuperar todos los usuarios de la memoria caché o, si no existen, recuerarlos desde la base de datos y agregarlos al caché. Puede hacer esto utilizando el método `Cache::remember`:

    $value = Cache::remember('users', $minutes, function () {
        return DB::table('users')->get();
    });

Si el elemento no existe en la memoria caché, se ejecutará el `Closure` pasado al método `remember` y su resultado se colocará en cache.

Puede utilizar el método `rememberForever` para recuperar un elemento del caché o almacenarlo para siempre:

    $value = Cache::rememberForever('users', function() {
        return DB::table('users')->get();
    });

#### Recuperar y eliminar

Si necesita recuperar un elemento del caché y después eliminarlo, puede utilizar el método `pull`. Al igual que el método `get`, se devolverá `null` si el elemento no existe en la memoria caché:

    $value = Cache::pull('key');

<a name="storing-items-in-the-cache"></a>
### Almacenar Elementos En Caché

Puede utilizar el método `put` en el facade `Cache` para almacenar elementos en caché. Cuando coloque un elemento en la memoria caché, necesitará especificar el número de minutos para los cuales el valor deberá ser almacenado en caché:

    Cache::put('key', 'value', $minutes);

En lugar de pasar el número de minutos como un entero, también puede pasar una instancia de `DateTime` que reprecente el tiempo de expiración del elemento almacenado en caché:

    $expiresAt = now()->addMinutes(10);

    Cache::put('key', 'value', $expiresAt);

#### Alacenar Si No Está Presente

El método `add` solo agregará el elemento a caché si éste no existe todavia en la memoria caché. El metodo va a regresar `true` si el elemento realmente se agregó al caché. De otra manera, el método va a regresar `false`:

    Cache::add('key', 'value', $minutes);

#### Almacenar Elementos Para Siempre

El método `forever` puede ser utilizado para almacenar un elemento en la memoria caché de manera permanente. Como estos elementos no caducan, se deben eliminar de la memora caché manualmente utilizando el método `forget`:

    Cache::forever('key', 'value');

> {tip} Si utiliza el controlador de Memcached, los elementos almacenados "permanentemente" podrán ser eliminados una vez que el caché alcance su tamaño límite.

<a name="removing-items-from-the-cache"></a>
### Eliminar Elementos De Caché

Puede eliminar elementos de caché utilizando el método `forget`:

    Cache::forget('key');

Puede borrar todo el caché utilizando el método `flush`:

    Cache::flush();

> {note} La limpieza de caché no respeta el prefijo del caché y borrará todas las entradas del caché. Considere esto cuidadosamente cuando borre un caché que sea compartido por otras aplicaciones.

<a name="the-cache-helper"></a>
### El Helper Cache

Además de usar el facade `Cache` o [cache contract](/docs/{{version}}/contracts), también puede usar la función global `cache` para recuperar y almacenar información a través del caché. Cuando se llama a la función `cache` con un solo argumento, vevolverá el valor de la llava dada:

    $value = cache('key');

Si proporciona un arreglo de pares clave / valor y su tiempo de expiración a la función, almacenará los valores en caché durante la duración especificada:

    cache(['key' => 'value'], $minutes);

    cache(['key' => 'value'], now()->addSeconds(10));

> {tip} Al realizar pruebas utilizando la función global `cache`, deberá usar el método `Cache::shouldReceive` como si estuviera [probando un facade](/docs/{{version}}/mocking#mocking-facades).

<a name="cache-tags"></a>
## Cache Tags

> {note} Las etiquetas de cahcé no son compatibles cuando utilice los controladores de caché `file` o `database`. Además, cuando se utilicen múltiples etiquetas con cachés que son alacenados "permanentemente", el rendimiento será mejor si utiliza un controlador como `memcached`, el cuál automaticamente purga los registros obsoletos.

<a name="storing-tagged-cache-items"></a>
### Almacenar Elementos De Caché Etiquetados

Las etiquetas de caché le permiten etiquetar elementos relacionedos en caché y después limpiar todos los valores almacenados en caché asignados a una etiqueta dada. Puede acceder a un caché etiquetado al pasar un arreglo ordenado de nombres de etiquetas. Por ejemplo, vamos a cceder a un caché etiquetado y al valor `put` en el caché:

    Cache::tags(['people', 'artists'])->put('John', $john, $minutes);

    Cache::tags(['people', 'authors'])->put('Anne', $anne, $minutes);

<a name="accessing-tagged-cache-items"></a>
### Acceder A Elementos De Caché Etiquetados

Para recuperar un elemento de caché etiquetado, pase la misma lista ordenada de etiquetas al método `tags` y después haga un llamado al método `get` con la llave que desee recuperar:

    $john = Cache::tags(['people', 'artists'])->get('John');

    $anne = Cache::tags(['people', 'authors'])->get('Anne');

<a name="removing-tagged-cache-items"></a>
### Eliminar Elementos De Caché Etiquetados

Puede borrar todos los elementos a los que se les asigna una etiqueta o lista de etiquetas. Por ejemplo, la siguiente sentencia eliminaría todos los cachés etiquetados tanto con `people`, `authors`, o ambos. Por lo tanto, tanto `Anne` como `John` serán eliminados de caché.

    Cache::tags(['people', 'authors'])->flush();

Por el contrario, la siguiente sentencia eliminará solamente los cachés con la etiqueta `authors`, por lo tanto se eliminará `Anne`, pero `John` no:

    Cache::tags('authors')->flush();

<a name="adding-custom-cache-drivers"></a>
## Agregar Controladores De Caché Personalizados

<a name="writing-the-driver"></a>
### Escribir El Controlador

Para crear el controlador de caché, primero se debe implementar el [contract](/docs/{{version}}/contracts) `Illuminate\Contracts\Cache\Store`. Por lo tanto, una implementación de caché de MongoDB se vería de la siguiente manera:

    <?php

    namespace App\Extensions;

    use Illuminate\Contracts\Cache\Store;

    class MongoStore implements Store
    {
        public function get($key) {}
        public function many(array $keys);
        public function put($key, $value, $minutes) {}
        public function putMany(array $values, $minutes);
        public function increment($key, $value = 1) {}
        public function decrement($key, $value = 1) {}
        public function forever($key, $value) {}
        public function forget($key) {}
        public function flush() {}
        public function getPrefix() {}
    }

Solo se necesita implementar cada uno de estos métodos utilizando una conexión de MongoDB. Para tener un ejemplo de cómo implementar cada uno de estos métodos, puede echar un vistazo a `Illuminate\Cache\MemcachedStore` en el código fuente del framework. Una vez que complete la implementación, puede finalizar con el registro de su controlador personalizado.

    Cache::extend('mongo', function ($app) {
        return Cache::repository(new MongoStore);
    });

> {tip} Si se pregunta en dónde puede colocar el código de su controlador de caché personalizado, puede crear un namespace `Extensions` en su directorio `app`. Sin embargo, tenga en cuenta que Laravel no tiene una estructura de aplicación rígida y que es libre de organizar su aplicación de acuerdo a sus preferencias.

<a name="registering-the-driver"></a>
### Registering The Driver

Para registrar el controlador de caché personalizado con Laravel, debe utilizar el método `extend` en el facade `Cache`. La llamada a `Cache::extend` puede hacerse en el método `boot` del `App\Providers\AppServiceProvider` predeterminado que contiene cada aplicación nueva de Laravel, o puede crear su propio service provider para alojar la extensión - solo recuerde registrar el provider en el arreglo de providers en `config/app.php`:

    <?php

    namespace App\Providers;

    use App\Extensions\MongoStore;
    use Illuminate\Support\Facades\Cache;
    use Illuminate\Support\ServiceProvider;

    class CacheServiceProvider extends ServiceProvider
    {
        /**
         * Perform post-registration booting of services.
         *
         * @return void
         */
        public function boot()
        {
            Cache::extend('mongo', function ($app) {
                return Cache::repository(new MongoStore);
            });
        }

        /**
         * Register bindings in the container.
         *
         * @return void
         */
        public function register()
        {
            //
        }
    }

El primer argumento pasado al método `extend` es el nombre del controlador. Esto corresponde a su opción `driver` en el archivo de configuración `config/cache.php`. El segundo argumento es un Closure que debe regresar una instancia de `Illuminate\Cache\Repository`. El Closure debe pasar una instancia de `$app`, que es una instancia del [contenedor de servicios](/docs/{{version}}/container).

Una vez que haya registrado su extensión, actualice la opción `driver` en su archivo de configuración `config/cache.php` con el nombre de su extensión.

<a name="events"></a>
## Eventos

Para ejecutar código en cada operación de caché, puede escucchar los [eventos](/docs/{{version}}/events) activados por el caché. Normalmente, debe colocar estos event listener dentro de su `EventServiceProvider`:

    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        'Illuminate\Cache\Events\CacheHit' => [
            'App\Listeners\LogCacheHit',
        ],

        'Illuminate\Cache\Events\CacheMissed' => [
            'App\Listeners\LogCacheMissed',
        ],

        'Illuminate\Cache\Events\KeyForgotten' => [
            'App\Listeners\LogKeyForgotten',
        ],

        'Illuminate\Cache\Events\KeyWritten' => [
            'App\Listeners\LogKeyWritten',
        ],
    ];
