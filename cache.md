::: v-pre

# Caché

- [Configuración](#configuration)
    - [Prerrequisitos Del Controlador](#driver-prerequisites)
- [Uso De Caché](#cache-usage)
    - [Obtener Una Instancia De Caché](#obtaining-a-cache-instance)
    - [Recuperar Elementos De Caché](#retrieving-items-from-the-cache)
    - [Almacenar Elementos En Caché](#storing-items-in-the-cache)
    - [Eliminar Elementos De Caché](#removing-items-from-the-cache)
    - [Cierres Atómicos](#atomic-locks)
    - [El Helper Cache](#the-cache-helper)
- [Etiquetas De Caché](#cache-tags)
    - [Almacenar Elementos De Caché Etiquetados](#storing-tagged-cache-items)
    - [Acceder A Elementos De Caché Etiquetados](#accessing-tagged-cache-items)
    - [Eliminar Elementos De Caché Etiquetados](#removing-tagged-cache-items)
- [Agregar Controladores De Caché Personalizados](#adding-custom-cache-drivers)
    - [Escribir El Driver](#writing-the-driver)
    - [Registrar El Driver](#registering-the-driver)
- [Eventos](#events)

<a name="configuration"></a>
## Configuración

Laravel proporciona una API expresiva y unificada para varios backends de almacenamiento de caché. La configuración de caché está ubicada en `config/cache.php`. En este archivo puedes indicar el controlador de caché que desees utilizar por defecto en toda tu aplicación. Por defecto, Laravel es compatible con los almacenamientos en caché más populares, tales como [Memcached](https://memcached.org) y [Redis](https://redis.io).

El archivo de configuración de caché contiene otras opciones adicionales, las cuales están documentadas dentro del mismo archivo, por lo que deberás asegurarte de revisar estas opciones. Por defecto, Laravel está configurado para utilizar el controlador de caché `local`, que almacena los objetos de caché serializados en el sistema de archivos. Para aplicaciones más grandes, es recomendable que utilices un controlador más robusto como Memcached o Redis. Incluso puedes configurar múltiples configuraciones de caché para el mismo controlador.

<a name="driver-prerequisites"></a>
### Prerrequisitos Del Controlador

#### Base de datos

Cuando utilices el controlador de caché `database`, necesitarás configurar una tabla que contenga los elementos de caché. Puedes encontrar un `Schema` de ejemplo en la tabla inferior:

```php
Schema::create('cache', function ($table) {
    $table->string('key')->unique();
    $table->text('value');
    $table->integer('expiration');
});
```

::: tip
También puedes utilizar el comando `php artisan cache:table` para generar una migración con el esquema apropiado.
:::

#### Memcached

Utilizar el controlador Memcached requiere que tengas instalado el [paquete de Memcached PECL](https://pecl.php.net/package/memcached). Puedes listar todos tus servidores de Memcached en el archivo de configuración `config/cache.php`:

```php
'memcached' => [
    [
        'host' => '127.0.0.1',
        'port' => 11211,
        'weight' => 100
    ],
],
```

También puedes establecer la opción `host` a la ruta de un socket de UNIX. Si haces esto, la opción `port` se debe establecer a `0`:

```php
'memcached' => [
    [
        'host' => '/var/run/memcached/memcached.sock',
        'port' => 0,
        'weight' => 100
    ],
],
```

#### Redis

Antes de comenzar a utilizar el caché con Redis en Laravel, deberás instalar el paquete `predis/predis` (~1.0) por medio de Composer o instalar la extensión de PHP PhpRedis por medio de PECL.

Para más información sobre cómo configurar Redis, consulta la [página de la documentación de Laravel](/docs/{{version}}/redis#configuration).

<a name="cache-usage"></a>
## Uso De Caché

<a name="obtaining-a-cache-instance"></a>
### Obtener Una Instancia De Caché

Las [interfaces](/docs/{{version}}/contracts) `Illuminate\Contracts\Cache\Factory` y `Illuminate\Contracts\Cache\Repository` proporcionan acceso a los servicios de caché de Laravel. La interfaz `Factory` proporciona acceso a todos los controladores de caché definidos para tu aplicación. La interfaz `Repository` típicamente es una implementación del controlador de caché predeterminado para tu aplicación según lo especificado en tu archivo de configuración de `cache`.

Sin embargo, también puedes usar el facade `Cache`, que es lo que usaremos a lo largo de esta documentación. El facade `Cache` proporciona acceso conveniente y directo a las implementaciones subyacientes de las interfaces de Laravel.

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

#### Acceder A Múltiples Almacenamientos De Caché

Usando el facade `Cache`, puedes acceder a varios almacenamientos de caché a través del método `store`. La llave que se pasa al método `store` debe corresponder a uno de los almacenamientos listados en el arreglo de configuración `stores` en tu archivo de configuración `cache`:

```php
$value = Cache::store('file')->get('foo');

Cache::store('redis')->put('bar', 'baz', 600); // 10 Minutes
```

<a name="retrieving-items-from-the-cache"></a>
### Recuperar Elementos De Caché

El método `get` en el facade `Cache` es utilizado para recuperar elementos desde la caché. Si el elemento no existe en caché, se va a regresar `null`. Si lo deseas, puedes pasar un segundo argumento al método `get` indicando el valor predeterminado que deseas retornar en caso de que el elemento no exista:

```php
$value = Cache::get('key');

$value = Cache::get('key', 'default');
```

Incluso puedes pasar una `Closure` como valor predeterminado. El resultado del `Closure` será devuelto si el elemento especificado no existe en caché. Pasar un Closure te permite diferir la recuperación de valores predeterminados de una base de datos a otro servicio externo:

```php
$value = Cache::get('key', function () {
    return DB::table(...)->get();
});
```

#### Comprobar La Existencia De Un Elemento

El método `has` se puede utilizar para determinar la existencia de un elemento en caché. Este método devolverá `false` si el valor es `null`:

```php
if (Cache::has('key')) {
    //
}
```

#### Incrementando / Decrementando Valores

Los métodos `increment` y `decrement` se pueden usar para ajustar el valor de los elementos enteros en caché. Ambos métodos aceptan un segundo parámetro opcional que indica la cantidad por la cual incrementar o disminuir el valor del elemento:

```php
Cache::increment('key');
Cache::increment('key', $amount);
Cache::decrement('key');
Cache::decrement('key', $amount);
```

#### Recuperar Y Almacenar

En ocasiones, es posible que desees recuperar un elemento de la memoria caché, pero también almacenar un valor predeterminado si el elemento no existe. Por ejemplo, puede que desees recuperar todos los usuarios de la memoria caché o, si no existen, recuperarlos desde la base de datos y agregarlos a la caché. Puedes hacer esto utilizando el método `Cache::remember`:

```php
$value = Cache::remember('users', $seconds, function () {
    return DB::table('users')->get();
});
```

Si el elemento no existe en la memoria caché, se ejecutará el `Closure` pasado al método `remember` y su resultado se colocará en caché.

Puedes utilizar el método `rememberForever` para recuperar un elemento del caché o almacenarlo para siempre:

```php
$value = Cache::rememberForever('users', function () {
    return DB::table('users')->get();
});
```

#### Recuperar Y Eliminar

Si necesitas recuperar un elemento del caché y después eliminarlo, puedes utilizar el método `pull`. Al igual que el método `get`, se devolverá `null` si el elemento no existe en la memoria caché:

```php
$value = Cache::pull('key');
```

<a name="storing-items-in-the-cache"></a>
### Almacenar Elementos En Caché

Puedes utilizar el método `put` en el facade `Cache` para almacenar elementos en caché: 

```php
Cache::put('key', 'value', $seconds);
```

Si el tiempo de almacenamiento no es pasado al método `put`, el elemento será almacenado indefinidamente:

```php
Cache::put('key', 'value');
```

En lugar de pasar el número de segundos como un entero, también puedes pasar una instancia de `DateTime` que represente el tiempo de expiración del elemento almacenado en caché:

```php
Cache::put('key', 'value', now()->addMinutes(10));
```

#### Almacenar Si No Está Presente

El método `add` solo agregará el elemento a caché si éste no existe todavia en la memoria caché. El metodo va a regresar `true` si el elemento realmente se agregó a la caché. De otra manera, el método va a regresar `false`:

    Cache::add('key', 'value', $seconds);

#### Almacenar Elementos Para Siempre

El método `forever` puede ser utilizado para almacenar un elemento en la memoria caché de manera permanente. Como estos elementos no caducan, se deben eliminar de la memoria caché manualmente utilizando el método `forget`:

```php
Cache::forever('key', 'value');
```

::: tip
Si utilizas el controlador de Memcached, los elementos almacenados "permanentemente" podrán ser eliminados una vez que la caché alcance su tamaño límite.
:::

<a name="removing-items-from-the-cache"></a>
### Eliminar Elementos De La Caché

Puedes eliminar elementos de caché utilizando el método `forget`:

```php
Cache::forget('key');
```

También puedes eliminar elementos de caché especificando un TTL cero o negativo:

```php
Cache::put('key', 'value', 0);

Cache::put('key', 'value', -5);
```

Puedes borrar todo el caché utilizando el método `flush`:

```php
Cache::flush();
```

::: danger Nota
La limpieza de caché no respeta el prefijo del caché y borrará todas las entradas del caché. Considera esto cuidadosamente cuando borres un caché que sea compartido por otras aplicaciones.
:::

<a name="atomic-locks"></a>
### Bloqueos Atómicos

::: danger Nota
Para usar esta característica, tu aplicación debe estar haciendo uso de los drivers de caché `memcached`, `dynamodb`, o `redis` como el driver de caché por defecto de tu aplicación. Adicionalmente, todos los servidores deben estar comunicándose con el mismo servidor de caché central.
:::

Los bloqueos atómicos permiten la manipulación de bloqueos distribuidos sin que tengas que preocuparte sobre las condiciones de la carrera. Por ejemplo, [Laravel Forge](https://forge.laravel.com) usa bloqueos atómicos para asegurarse de que sólo una tarea remota está siendo ejecutada en un servidor a la vez. Puedes crear y administrar bloqueos usando el método `Cache::lock`:

```php
use Illuminate\Support\Facades\Cache;

$lock = Cache::lock('foo', 10);

if ($lock->get()) {
    // Lock acquired for 10 seconds...

    $lock->release();
}
```

El método `get` también acepta una Closure. Luego de que la Closure sea ejecutada, Laravel automáticamente liberará el cierre:

```php
Cache::lock('foo')->get(function () {
    // Lock acquired indefinitely and automatically released...
});
```

Si el bloqueo no está disponible en el momento en que lo solicitas, puedes instruir a Laravel para que espere un número determinado de segundos. Si el bloqueo no puede ser adquirido dentro del tiempo límite especificado, una excepción `Illuminate\Contracts\Cache\LockTimeoutException` será mostrada:

```php
use Illuminate\Contracts\Cache\LockTimeoutException;

$lock = Cache::lock('foo', 10);

try {
    $lock->block(5);
    
    // Lock acquired after waiting maximum of 5 seconds...
} catch (LockTimeoutException $e) {
    // Unable to acquire lock...
} finally {
    optional($lock)->release();
}

Cache::lock('foo', 10)->block(5, function () {
    // Lock acquired after waiting maximum of 5 seconds...
});
```

#### Administrando Bloqueos A Través de Procesos

Algunas veces, necesitarás adquirir un bloqueo en un proceso para liberarlo en otro proceso distinto más adelante. Por ejemplo, podemos solicitar un bloqueo durante la ejecución de un proceso que hace una solicitud web pero queremos liberarlo después que se ejecute un trabajo que es despachado donde se hizo la solicitud a una cola de trabajos. En un escenario como éste, necesitaríamos tomar la identificación del propietario del bloqueo (owner token) en el ámbito donde se produce el mismo y pasarlo al trabajo que va a la cola de trabajos de modo que pueda volver a instanciar el bloqueo usando ese identificador.

```php
// Within Controller...
$podcast = Podcast::find($id);

$lock = Cache::lock('foo', 120);

if ($result = $lock->get()) {
    ProcessPodcast::dispatch($podcast, $lock->owner());
}

// Within ProcessPodcast Job...
Cache::restoreLock('foo', $this->owner)->release();
```

Si prefieres liberar un bloqueo sin necesidad de indicar su propietario, puedes usar el método `forceRelease`:

```php
Cache::lock('foo')->forceRelease();
```

<a name="the-cache-helper"></a>
### El Helper Cache

Además de usar el facade `Cache` o [la interfaz de caché](/docs/{{version}}/contracts), también puedes usar la función global `cache` para recuperar y almacenar información a través del caché. Cuando se llama a la función `cache` con un solo argumento, devolverá el valor de la clave dada:

```php
$value = cache('key');
```

Si proporcionas un arreglo de pares clave / valor y su tiempo de expiración a la función, almacenará los valores en caché durante la duración especificada:

```php
cache(['key' => 'value'], $seconds);

cache(['key' => 'value'], now()->addMinutes(10));
```

Cuando la función `cache` es llamada sin ningún argumento, ésta retorna una instancia de la implementación `Illuminate\Contracts\Cache\Factory`, permitiéndote llamar a otros métodos de almacenamiento en caché:

```php
cache()->remember('users', $seconds, function () {
    return DB::table('users')->get();
});
```

::: tip
Al realizar pruebas utilizando la función global `cache`, deberás usar el método `Cache::shouldReceive` como si estuvieras [probando un facade](/docs/{{version}}/mocking#mocking-facades).
:::

<a name="cache-tags"></a>
## Cache Tags

::: danger Nota
Las etiquetas de caché no son compatibles cuando usas los controladores de caché `file` o `database`. Además, cuando se utilicen múltiples etiquetas con cachés que son almacenados "permanentemente", el rendimiento será mejor si utilizas un controlador como `memcached`, el cual automaticamente purga los registros obsoletos.
:::

<a name="storing-tagged-cache-items"></a>
### Almacenar Elementos De Caché Etiquetados

Las etiquetas de caché te permiten etiquetar elementos relacionados en caché y después limpiar todos los valores almacenados en caché asignados a una etiqueta dada. Puedes acceder a un caché etiquetado al pasar un arreglo ordenado de nombres de etiquetas. Por ejemplo, vamos a acceder a un caché etiquetado y al valor `put` en el caché:

```php
Cache::tags(['people', 'artists'])->put('John', $john, $seconds);

Cache::tags(['people', 'authors'])->put('Anne', $anne, $seconds);
```

<a name="accessing-tagged-cache-items"></a>
### Acceder A Elementos De Caché Etiquetados

Para recuperar un elemento de caché etiquetado, pasa la misma lista ordenada de etiquetas al método `tags` y después haz un llamado al método `get` con la clave que deseas recuperar:

```php
$john = Cache::tags(['people', 'artists'])->get('John');

$anne = Cache::tags(['people', 'authors'])->get('Anne');
```

<a name="removing-tagged-cache-items"></a>
### Eliminar Elementos De Caché Etiquetados

Puedes borrar todos los elementos a los que se les asigna una etiqueta o lista de etiquetas. Por ejemplo, la siguiente sentencia eliminaría todos los cachés etiquetados tanto con `people`, `authors` o ambos. Por lo tanto, tanto `Anne` como `John` serán eliminados de caché:

```php
Cache::tags(['people', 'authors'])->flush();
```

Por el contrario, la siguiente sentencia eliminará solamente los cachés con la etiqueta `authors`, por lo tanto se eliminará `Anne`, pero `John` no:

```php
Cache::tags('authors')->flush();
```

<a name="adding-custom-cache-drivers"></a>
## Agregar Controladores De Caché Personalizados

<a name="writing-the-driver"></a>
### Escribir El Controlador

Para crear el controlador de caché, primero se debe implementar la [interfaz](/docs/{{version}}/contracts) `Illuminate\Contracts\Cache\Store`. Por lo tanto, una implementación de caché de MongoDB se vería de la siguiente manera:

```php
<?php

namespace App\Extensions;

use Illuminate\Contracts\Cache\Store;

class MongoStore implements Store
{
    public function get($key) {}
    public function many(array $keys);
    public function put($key, $value, $seconds) {}
    public function putMany(array $values, $seconds);
    public function increment($key, $value = 1) {}
    public function decrement($key, $value = 1) {}
    public function forever($key, $value) {}
    public function forget($key) {}
    public function flush() {}
    public function getPrefix() {}
}
```

Solo necesitas implementar cada uno de estos métodos utilizando una conexión de MongoDB. Para tener un ejemplo de cómo implementar cada uno de estos métodos, puedes echar un vistazo a `Illuminate\Cache\MemcachedStore` en el código fuente del framework. Una vez que completes la implementación, puedes finalizar con el registro de tu controlador personalizado.

```php
Cache::extend('mongo', function ($app) {
    return Cache::repository(new MongoStore);
});
```

::: tip
Si te preguntas dónde puedes colocar el código de tu driver de caché personalizado, puedes crear un espacio de nombre `Extensions` en tu directorio `app`. Sin embargo, ten en cuenta que Laravel no tiene una estructura de aplicación rígida y por tanto eres libre de organizar tu aplicación de acuerdo a tus preferencias.
:::

<a name="registering-the-driver"></a>
### Registrando El Driver

Para registrar el controlador de caché personalizado con Laravel, debes utilizar el método `extend` en el facade `Cache`. La llamada a `Cache::extend` puede hacerse en el método `boot` del `App\Providers\AppServiceProvider` predeterminado que contiene cada aplicación nueva de Laravel, o puedes crear tu propio proveedor de servicios para alojar la extensión - solo recuerda registrar el proveedor en el arreglo de proveedores en `config/app.php`:

```php
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
```

El primer argumento pasado al método `extend` es el nombre del controlador. Esto corresponde a la opción `driver` en el archivo de configuración `config/cache.php`. El segundo argumento es un Closure que debe regresar una instancia de `Illuminate\Cache\Repository`. El Closure debe pasar una instancia de `$app`, que es una instancia del [contenedor de servicios](/docs/{{version}}/container).

Una vez que hayas registrado tu extensión, actualiza la opción `driver` en tu archivo de configuración `config/cache.php` con el nombre de tu extensión.

<a name="events"></a>
## Eventos

Para ejecutar código en cada operación de caché, puedes escuchar los [eventos](/docs/{{version}}/events) activados por el caché. Normalmente, debes colocar estos listener de eventos dentro de tu `EventServiceProvider`:

```php
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
```