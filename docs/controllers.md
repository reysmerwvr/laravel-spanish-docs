::: v-pre

# Controladores

- [Introducción](#introduction)
- [Controladores Básicos](#basic-controllers)
    - [Definiendo Controladores](#defining-controllers)
    - [Controladores y Espacios de Nombres](#controllers-and-namespaces)
    - [Controladores de Acción Única](#single-action-controllers)
- [Middleware de Controlador](#controller-middleware)
- [Controladores de Recursos](#resource-controllers)
    - [Rutas de Recursos Parciales](#restful-partial-resource-routes)
    - [Nombrando Rutas de Recursos](#restful-naming-resource-routes)
    - [Nombrando Parámetros de Rutas de Recursos](#restful-naming-resource-route-parameters)
    - [Configuración Regional Para URIs de Recursos](#restful-localizing-resource-uris)
    - [Complementando Controladores de Recursos](#restful-supplementing-resource-controllers)
- [Inyección de Dependencias y Controladores](#dependency-injection-and-controllers)
- [Caché de Rutas](#route-caching)

<a name="introduction"></a>
## Introducción

En lugar de definir toda la lógica de manejo de solicitud como Closure en archivos de ruta, puedes desear organizar este comportamiento usando clases Controller. Los controladores pueden agrupar la lógica de manejo de solicitud relacionada dentro de una sola clase. Los controladores son almacenados en el directorio `app/Http/Controllers`.

<a name="basic-controllers"></a>
## Controladores Básicos

<a name="defining-controllers"></a>
### Definiendo Controladores

A continuación se muestra un ejemplo de una clase de controlador básica. Nota que el controlador extiende la clase de controlador base incluida con Laravel. La clase base proporciona unos cuantos métodos de conveniencia tal como el método `middleware`, el cual puede ser usado para conectar un middleware a acciones de controlador:

```php
<?php

namespace App\Http\Controllers;

use App\User;
use App\Http\Controllers\Controller;

class UserController extends Controller
{
    /**
    * Show the profile for the given user.
    *
    * @param  int  $id
    * @return View
    */
    public function show($id)
    {
        return view('user.profile', ['user' => User::findOrFail($id)]);
    }
}
```

Puedes definir una ruta a esta acción de controlador de esta forma:

```php
Route::get('user/{id}', 'UserController@show');
```

Ahora, cuando una solicitud coincide con la URI de la ruta especificada, se ejecutará el método `show` de la clase `UserController`. Los parámetros de ruta también se pasarán al método.

::: tip
Los controladores no están **obligados** a extender de la clase base. Sin embargo, no tendrás acceso a características de conveniencia tales como los métodos `middleware`, `validate`, y `dispatch`.
:::

<a name="controllers-and-namespaces"></a>
### Controladores y Espacios de Nombres

Es muy importante notar que no necesitamos especificar el espacio de nombre completo del controlador al momento de definir la ruta del controlador. Debido a que el `RouteServiceProvider` carga sus archivos de ruta dentro de un grupo de ruta que contiene el espacio de nombre, solamente necesitaremos la porción del nombre de la clase que viene después de la porción `App\Http\Controllers` del espacio de nombre.

Si eliges anidar tus controladores dentro del directorio `App\Http\Controllers`, usa el nombre de clase específico relativo al espacio de nombre raíz `App\Http\Controllers`. Así, si tu clase de controlador completa es `App\Http\Controllers\Photos\AdminController`, deberías registrar rutas al controlador de esta forma:

```php
Route::get('foo', 'Photos\AdminController@method');
```

<a name="single-action-controllers"></a>
### Controladores de Acción Única

Si prefieres definir un controlador que maneja solamente una acción única, debes colocar un único método `__invoke` en el controlador:

```php
<?php

namespace App\Http\Controllers;

use App\User;
use App\Http\Controllers\Controller;

class ShowProfile extends Controller
{
    /**
    * Show the profile for the given user.
    *
    * @param  int  $id
    * @return View
    */
    public function __invoke($id)
    {
        return view('user.profile', ['user' => User::findOrFail($id)]);
    }
}
```

Al momento de registrar rutas para controladores de acción única, no necesitarás especificar un método:

```php
Route::get('user/{id}', 'ShowProfile');
```

Puedes generar un controlador invocable usando la opción `--invokable` del comando Artisan `make:controller`:

```php
php artisan make:controller ShowProfile --invokable
```

<a name="controller-middleware"></a>
## Middleware de Controlador

Los [Middleware](/docs/{{version}}/middleware) pueden ser asignados a las rutas del controlador en tus archivos de ruta:

```php
Route::get('profile', 'UserController@show')->middleware('auth');
```

Sin embargo, es más conveniente especificar los middleware dentro del constructor de tu controlador. Usando el método `middleware` del constructor de tu controlador, puedes asignar fácilmente los middleware a la acción del controlador. Incluso puedes restringir los middleware a sólo ciertos métodos en la clase del controlador:

```php
class UserController extends Controller
{
    /**
    * Instantiate a new controller instance.
    *
    * @return void
    */
    public function __construct()
    {
        $this->middleware('auth');

        $this->middleware('log')->only('index');

        $this->middleware('subscribed')->except('store');
    }
}
```

También los controladores permiten que registres los middleware usando una Closure. Esto proporciona una forma conveniente de definir un middleware para un solo controlador sin definir una clase middleware completa:

```php
$this->middleware(function ($request, $next) {
    // ...

    return $next($request);
});
```

::: tip
Puedes asignar los middleware a un subconjunto de acciones de controlador, esto puede indicar que tu controlador está creciendo demasiado. En lugar de esto, considera dividir tu controlador en varios controladores más pequeños.
:::

<a name="resource-controllers"></a>
## Controladores de Recursos

El enrutamiento de recurso de Laravel asigna las rutas típicas "CRUD" a un controlador con una sola línea de código. Por ejemplo, puedes desear crear un controlador que maneje todas las solicitudes HTTP para "photos" almacenadas por tu aplicación. Usando el comando Artisan `make:controller`, podemos crear fácilmente tal controlador:

```php
php artisan make:controller PhotoController --resource
```

Este comando creará un controlador en `app/Http/Controllers/PhotoController.php`. El controlador contendrá un método para cada una de las operaciones de recursos disponibles.

Seguidamente, puedes registrar una ruta de recurso genérica al controlador:

```php
Route::resource('photos', 'PhotoController');
```

Esta declaración de ruta única crea varias rutas para manejar una variedad de acciones del recurso. El controlador generado ya tendrá los métodos separados para cada una de las acciones, incluyendo comentarios que te informan de los verbos HTTP y URIs que manejan.

Puedes registrar muchos controladores de recursos a la vez pasando un arreglo al método `resources`:

```php
Route::resources([
    'photos' => 'PhotoController',
    'posts' => 'PostController'
]);
```

#### Acciones manejadas Por El Controlador de Recursos

Tipo      | URI                    | Acción       | Nombre de la Ruta
----------|----------------------- |--------------|---------------------
GET       | `/photos`              | índice       | photos.index
GET       | `/photos/create`       | crear        | photos.create
POST      | `/photos`              | guardar      | photos.store
GET       | `/photos/{photo}`      | mostrar      | photos.show
GET       | `/photos/{photo}/edit` | editar       | photos.edit
PUT/PATCH | `/photos/{photo}`      | actualizar   | photos.update
DELETE    | `/photos/{photo}`      | eliminar     | photos.destroy

#### Especificando El Modelo de Recurso

Si estás usando el enlace de modelo de ruta (route model binding) y deseas que los métodos del controlador de recursos declaren el tipo de una instancia de modelo, puedes usar la opción `--model` al momento de generar el controlador:

```php
php artisan make:controller PhotoController --resource --model=Photo
```

#### Suplantar los Métodos de Formulario

Debido a que los formularios no pueden hacer solicitudes `PUT`, `PATCH`, o `DELETE`, necesitarás agregar un campo `_method` oculto para suplantar estos verbos HTTP. La directiva de Blade `@method` puede crear este campo para ti:

```php
<form action="/foo/bar" method="POST">
    @method('PUT')
</form>
```

<a name="restful-partial-resource-routes"></a>
### Rutas de Recursos Parciales

Al momento de declarar una ruta de recurso, puedes especificar un subconjunto de acciones que el controlador debería manejar en lugar de conjunto completo de acciones por defecto.

```php
Route::resource('photos', 'PhotoController')->only([
    'index', 'show'
]);

Route::resource('photos', 'PhotoController')->except([
    'create', 'store', 'update', 'destroy'
]);
```

#### Rutas de Recursos para APIs

Al momento de declarar rutas de recursos que serán consumidas por APIs, normalmente te gustará excluir rutas que presentan plantillas HTML tales como `create` y `edit`. Por conveniencia, puedes usar el método `apiResource` para excluir automáticamente éstas dos rutas:

    Route::apiResource('photos', 'PhotoController');

Puedes registrar muchos controladores de recursos de API de una sola vez pasando un arreglo al método `apiResources`:

```php
Route::apiResources([
    'photos' => 'PhotoController',
    'posts' => 'PostController'
]);
```

Para generar rápidamente un controlador de recursos API que no incluya los métodos `create` o `edit`, usa la opción `--api` cuando ejecutas el comando `make:controller`:

```php
php artisan make:controller API/PhotoController --api
```

<a name="restful-naming-resource-routes"></a>
### Nombrando Rutas de Recursos

De forma predeterminada, todas las acciones de controlador de recursos tienen un nombre de ruta; sin embargo, puedes sobrescribir esos nombres al pasar un arreglo de nombres con tus opciones:

```php
Route::resource('photos', 'PhotoController')->names([
    'create' => 'photos.build'
]);
```

<a name="restful-naming-resource-route-parameters"></a>
### Nombrando Parámetros de Rutas de Recursos

De forma predeterminada, `Route::resource` creará los parámetros de ruta para tus rutas de recursos basado en la versión "singularizada" del nombre de recurso. Puedes sobrescribir fácilmente esto para cada recurso usando el método `parameters`. El arreglo pasado al método `parameters` debería ser un arreglo asociativo de nombres de recursos y nombres de parámetros: 

```php
Route::resource('users', 'AdminUserController')->parameters([
    'users' => 'admin_user'
]);
```

El ejemplo anterior genera las URIs siguientes para la ruta `show` del recurso:

```php
/users/{admin_user}
```

<a name="restful-localizing-resource-uris"></a>
### Configuración Regional Para URIs de Recursos

De forma predeterminada, `Route::resource` creará URIs de recursos usando verbos en Inglés. Si necesitas configurar los verbos de acción `create` y `edit` a un idioma, puedes usar el método `Route::resourceVerbs`. Esto puede ser hecho en el método `boot` de tu `AppServiceProvider`:

```php
use Illuminate\Support\Facades\Route;

/**
* Bootstrap any application services.
*
* @return void
*/
public function boot()
{
    Route::resourceVerbs([
        'create' => 'crear',
        'edit' => 'editar',
    ]);
}
```

Una vez que los verbos han sido personalizados, un registro de ruta de recurso tal como `Route::resource('fotos', 'PhotoController')` producirá las siguientes URIs:

```php
/fotos/crear

/fotos/{foto}/editar
```

<a name="restful-supplementing-resource-controllers"></a>
### Complementando Controladores de Recursos

Si necesitas agregar rutas adicionales para un controlador de recursos más allá del conjunto predeterminado de rutas de recursos, deberías definir esas rutas antes de que ejecutes `Route::resource`; de otra forma, las rutas definidas por el método `resource` pueden tomar precedencia involuntariamente sobre tus rutas complementarias:

```php
Route::get('photos/popular', 'PhotoController@method');

Route::resource('photos', 'PhotoController');
```

::: tip
Recuerda mantener la lógica de tus controladores enfocada. Si te encuentras a ti mismo necesitando rutinariamente métodos fuera del conjunto típico de acciones de recurso, considera dividir tu controlador en dos controladores más pequeños.
:::

<a name="dependency-injection-and-controllers"></a>
## Inyección de Dependencia y Controladores

#### Inyección Al Constructor

El [contenedor de servicio](/docs/{{version}}/container) de Laravel es usado para resolver todos los controladores de Laravel. Como resultado, estás habilitado para declarar el tipo de cualquier dependencia que tu controlador pueda necesitar en su constructor. Las dependencias declaradas serán automáticamente resueltas e inyectadas dentro de la instancia del controlador:

```php
<?php

namespace App\Http\Controllers;

use App\Repositories\UserRepository;

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
}
```

También puedes declarar el tipo de cualquier [Contrato de Laravel](/docs/{{version}}/contracts). Si el contenedor puede resolverlo, puedes declararlo. Dependiendo de tu aplicación, inyectar tus dependencias dentro de tu controlador puede proporcionar mejo capacidad para pruebas.

#### Inyección de Métodos

Adicional a la inyección al constructor, también puedes declarar el tipo de dependencias en los métodos de tu controlador. Un caso de uso común para la inyección de método está inyectando la instancia `Illuminate\Http\Request` dentro de tus métodos de controlador:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
    * Store a new user.
    *
    * @param  Request  $request
    * @return Response
    */
    public function store(Request $request)
    {
        $name = $request->name;

        //
    }
}
```

Si tu método de controlador también está esperando entrada de un parámetro de ruta, lista tus argumentos de ruta después de tus otras dependencias. Por ejemplo, si tu ruta es definida como esto:

```php
Route::put('user/{id}', 'UserController@update');
```

Aún puedes declarar el tipo de la clase `Illuminate\Http\Request` y acceder a tu parámetro `id` al definir tu método de controlador de la siguiente manera:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
    * Update the given user.
    *
    * @param  Request  $request
    * @param  string  $id
    * @return Response
    */
    public function update(Request $request, $id)
    {
        //
    }
}
```

<a name="route-caching"></a>
## Caché de Rutas

::: danger Nota
Las rutas basadas en Closure no pueden ser cacheadas. Para usar caché de rutas, debes convertir cualquiera de las rutas Closure a clases de controlador.
:::

Si tu aplicación está usando exclusivamente rutas basadas en controlador, deberías tomar ventaja de la caché de rutas de Laravel. Usar la cache de rutas reducirá drásticamente la cantidad de tiempo que toma registrar todas las rutas de tu aplicación. En algunos casos, incluso la rapidez de tu registro de rutas puede llegar a ser hasta 100 veces más rápida.

```php
php artisan route:cache
```

Después de ejecutar este comando, tu archivo de rutas cacheado será cargado en cada solicitud. Recuerda, si agregas cualquier ruta nueva necesitarás generar una caché de ruta nueva. Debido a esto, deberías ejecutar solamente el comando `route:cache` durante el despliegue o puesta en producción del proyecto.

Puedes usar el comando `route:clear` para limpiar la caché de ruta:

```php
php artisan route:clear
```