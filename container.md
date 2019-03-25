::: v-pre

# Contenedor de Servicios (Service Container)

- [Introducción](#introduction)
- [Enlaces](#binding)
    - [Fundamentos de los Enlaces](#binding-basics)
    - [Enlazando Interfaces A Implementaciones](#binding-interfaces-to-implementations)
    - [Enlaces Contextuales](#contextual-binding)
    - [Etiquetado](#tagging)
    - [Extendiendo Enlaces](#extending-bindings)
- [Resolviendo](#resolving)
    - [Método Make](#the-make-method)
    - [Inyección Automática](#automatic-injection)
- [Eventos del Contenedor](#container-events)
- [PSR-11](#psr-11)

<a name="introduction"></a>
## Introducción

El contenedor de servicios de Laravel es una herramienta poderosa para administrar dependencias de clases y realizar inyección de dependencias. La inyección de dependencias es una frase bonita para básicamente decir: las dependencias de clases son "inyectadas" en la clase mediante el constructor o, en algunos casos, métodos "setter".

Echemos un vistazo a un ejemplo sencillo:

```php
<?php

namespace App\Http\Controllers;

use App\User;
use App\Repositories\UserRepository;
use App\Http\Controllers\Controller;

class UserController extends Controller
{
    /**
    * The user repository implementation.
    *
    * @var UserRepository
    */
    protected $users;

    /**
    * Create a new controller instance.
    *
    * @param  UserRepository  $users
    * @return void
    */
    public function __construct(UserRepository $users)
    {
        $this->users = $users;
    }

    /**
    * Show the profile for the given user.
    *
    * @param  int  $id
    * @return Response
    */
    public function show($id)
    {
        $user = $this->users->find($id);

        return view('user.profile', ['user' => $user]);
    }
}
```

En este ejemplo, `UserController` necesita retornar usuarios desde una fuente de datos. Así que, **inyectaremos** un servicio que es capaz de retornar los usuarios. En este conexto, nuestro `UserRepository` probablemente usa [Eloquent](/docs/5.8/eloquent) para retornar la información de los usuarios desde la base de datos. Sin embargo, dado que el repositorio es inyectado, somos capaces de cambiarlo fácilmente con otra implementación. También somos capaces de "simular" o crear una implementación de ejemplo de `UserRepository` al probar nuestra aplicación.

Un conocimiento profundo del contenedor de servicios de Laravel es esencial para construir aplicaciones grandes y poderosas así como también contribuir al núcleo de Laravel.

<a name="binding"></a>
## Enlaces

<a name="binding-basics"></a>
### Fundamentos de los Enlaces

La mayoría de los enlaces de tu contenedor de servicios serán registrados dentro de [proveedores de servicios](/docs/5.8/providers), así que la mayoría de estos ejemplos muestra el uso del contenedor en ese contexto.

::: tip
No hay necesidad de enlazar clases al contenedor si no dependen de ninguna interfaz. El contenedor no necesita ser instruido en cómo construir esos objetos, dado que puede resolver dichos objetos automáticamente usando reflejos.
:::

#### Enlaces Sencillos

Dentro de un proveedor de servicios, siempre tienes acceso al contenedor mediante la propiedad `$this->app`. Podemos registrar un enlace usando el método `bind`, pasando el nombre de la clase o interfaz que deseamos registrar junto con una `Closure` que retorna una instancia de la clase:

```php
$this->app->bind('HelpSpot\API', function ($app) {
    return new HelpSpot\API($app->make('HttpClient'));
});
```

Observa que recibimos el contenedor como argumento. Podemos entonces usar el contenedor para resolver sub-dependencias del objeto que estamos construyendo.

#### Enlazando un Singleton

El método `singleton` enlaza una clase o interfaz al contenedor que debería ser resuelto una sola vez. Una vez que el enlace de un singleton es resuelto, la misma instancia de objeto será retornada en llamadas siguientes al contenedor:

```php
$this->app->singleton('HelpSpot\API', function ($app) {
    return new HelpSpot\API($app->make('HttpClient'));
});
```

#### Enlazando Instancias

También puedes enlazar una instancia de objeto existente al contenedor usando el método `instance`. La instancia dada siempre será retornada en llamadas siguientes al contenedor:

```php
$api = new HelpSpot\API(new HttpClient);

$this->app->instance('HelpSpot\API', $api);
```

#### Enlazando Valores Primitivos

Algunas veces tendrás una clase que recibe algunas clases inyectadas, pero que también necesita un valor primitivo inyectado, como un entero. Puedes fácilmente usar enlaces contextuales para inyectar cualquier valor que tu clase pueda necesitar:

```php
$this->app->when('App\Http\Controllers\UserController')
          ->needs('$variableName')
          ->give($value);
```

<a name="binding-interfaces-to-implementations"></a>
### Enlazando Interfaces A Implementaciones

Una característica muy poderosa del contenedor de servicios es su habilidad para enlazar una interfaz a una implementación dada. Por ejemplo, vamos a suponer que tenemos una interfaz `EventPusher` y una implementación `RedisEventPusher`. Una vez que hemos programado nuestra implementación `RedisEventPusher` de esta interfaz, podemos registrarla con el contenedor de servicios de la siguiente manera:

```php
$this->app->bind(
    'App\Contracts\EventPusher',
    'App\Services\RedisEventPusher'
);
```

Esta sentencia le dice al contenedor que debe inyectar `RedisEventPusher` cuando una clase necesita una implementación de `EventPusher`. Ahora podemos determinar el tipo de la interfaz `EventPusher` en un constructor o cualquier otra ubicación donde las dependencias son inyectadas por el contenedor de servicios:

```php
use App\Contracts\EventPusher;

/**
* Create a new class instance.
*
* @param  EventPusher  $pusher
* @return void
*/
public function __construct(EventPusher $pusher)
{
    $this->pusher = $pusher;
}
```

<a name="contextual-binding"></a>
### Enlaces Contextuales

Algunas veces tendrás dos clases que usan la misma interfaz, pero quieres inyectar diferentes implementaciones en cada clase. Por ejemplo, dos controladores pueden depender de diferentes implementaciones del [contrato](/docs/5.8/contracts) `Illuminate\Contracts\Filesystem\Filesystem`. Laravel proporciona una simple y fluida interfaz para definir este comportamiento:

```php
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\PhotoController;
use App\Http\Controllers\VideoController;
use Illuminate\Contracts\Filesystem\Filesystem;

$this->app->when(PhotoController::class)
          ->needs(Filesystem::class)
          ->give(function () {
              return Storage::disk('local');
          });

$this->app->when([VideoController::class, UploadController::class])
          ->needs(Filesystem::class)
          ->give(function () {
              return Storage::disk('s3');
          });
```

<a name="tagging"></a>
### Etiquetado

Ocasionalmente, puedes necesitar resolver todo de una determinada "categoría" de enlaces. Por ejemplo, puede que estés construyendo un agregador de reportes que recibe un arreglo de diferentes implementaciones de la interfaz `Report`. Luego de registrar las implementaciones de `Report`, puedes asignarles una etiqueta usando el método `tag`:

```php
$this->app->bind('SpeedReport', function () {
    //
});

$this->app->bind('MemoryReport', function () {
    //
});

$this->app->tag(['SpeedReport', 'MemoryReport'], 'reports');
```

Una vez que los servicios han sido etiquetados, puedes resolverlos fácilmente mediante el método `tagged`:

```php
$this->app->bind('ReportAggregator', function ($app) {
    return new ReportAggregator($app->tagged('reports'));
});
```

<a name="extending-bindings"></a>
### Extendiendo Enlaces

El método `extend` te permite modificar servicios resueltos. Por ejemplo, cuando un servicio es resuelto, puedes ejecutar código adicional para decorar o configurar el servicio. El método `extend` acepta un Closure, que debe retornar el servicio modificado, como único argumento:

```php
$this->app->extend(Service::class, function ($service) {
    return new DecoratedService($service);
});
```

<a name="resolving"></a>
## Resolviendo

<a name="the-make-method"></a>
#### Método `make`

Puedes usar el método `make` para resolver una instancia de clase fuera del contenedor. El método `make` acepta el nombre de la clase o interfaz que deseas resolver:

```php
$api = $this->app->make('HelpSpot\API');
```

Si estás en una ubicación de tu código que no tiene acceso a la variable `$app`, puedes usar el helper global `resolve`:

```php
$api = resolve('HelpSpot\API');
```

Si algunas de las dependencias de tu clase no son resueltas mediante el contenedor, puedes inyectarlas pasandolas como un arreglo asociativo al método `makeWith`:

```php
$api = $this->app->makeWith('HelpSpot\API', ['id' => 1]);
```

<a name="automatic-injection"></a>
#### Inyección Automática

Alternativamente, y de forma importante, puedes "determinar el tipo" de la dependencia en el constructor de una clase que es resuelta por el contenedor, incluyendo [controladores](/docs/5.8/controllers), [listeners de eventos](/docs/5.8/events), [colas](/docs/5.8/queues), [middleware](/docs/5.8/middleware) y más. En la práctica, así es como la mayoría de tus objetos deben ser resueltos por el contenedor.

Por ejemplo, puedes determinar el tipo de un repositorio definido por tu aplicación en el constructor de un controlador. El repositorio será automáticamente resuelto e inyectado en la clase:

```php
<?php

namespace App\Http\Controllers;

use App\Users\Repository as UserRepository;

class UserController extends Controller
{
    /**
    * The user repository instance.
    */
    protected $users;

    /**
    * Create a new controller instance.
    *
    * @param  UserRepository  $users
    * @return void
    */
    public function __construct(UserRepository $users)
    {
        $this->users = $users;
    }

    /**
    * Show the user with the given ID.
    *
    * @param  int  $id
    * @return Response
    */
    public function show($id)
    {
        //
    }
}
```

<a name="container-events"></a>
## Eventos del Contenedor

El contenedor de servicios ejecuta un evento cada vez que resuelve un objeto. Puedes escuchar a este evento usando el método `resolving`:

```php
$this->app->resolving(function ($object, $app) {
    // Called when container resolves object of any type...
});

$this->app->resolving(HelpSpot\API::class, function ($api, $app) {
    // Called when container resolves objects of type "HelpSpot\API"...
});
```

Como puedes ver, el objeto siendo resuelto será pasado a la función de retorno, permitiéndote establecer cualquier propiedad adicional en el objeto antes de que sea entregado a su consumidor.

<a name="psr-11"></a>
## PSR-11

El contenedor de servicios de Laravel implementa la interfaz [PSR-11](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-11-container.md). Por lo tanto, puedes determinar el tipo de la interfaz de contenedor PSR-11 para obtener una instancia del contenedor de Laravel:

```php
use Psr\Container\ContainerInterface;

Route::get('/', function (ContainerInterface $container) {
    $service = $container->get('Service');

    //
});
```

Una excepción es mostrada si el identificador dado no puede ser resuelto. La excepción será una instancia de `Psr\Container\NotFoundExceptionInterface` si el identificador nunca fue enlazado. Si el identificador fue enlazado pero ha sido incapaz de resolver, una instancia de `Psr\Container\ContainerExceptionInterface` será mostrada.