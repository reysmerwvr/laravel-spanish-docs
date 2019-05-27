::: v-pre

# Middleware

- [Introducción](#introduction)
- [Definiendo un Middleware](#defining-middleware)
- [Registrando un Middleware](#registering-middleware)
    - [Middleware Globales](#global-middleware)
    - [Asignando un Middleware a una Ruta](#assigning-middleware-to-routes)
    - [Middleware Grupales](#middleware-groups)
    - [Clasificación de Middleware](#sorting-middleware)
- [Parámetros en los Middleware](#middleware-parameters)
- [Middleware Terminable](#terminable-middleware)

<a name="introduction"></a>
## Introducción

Los Middleware proporcionan un mecanismo conveniente para filtrar consultas HTTP en toda tu aplicación. Por ejemplo, Laravel incluye un middleware que verifica si el usuario de tu aplicación está autenticado. Si el usuario no está autenticado, el middleware redireccionará al usuario a la pantalla de inicio de sesión. Sin embargo, si el usuario es autenticado, el middleware permitirá que la consulta proceda dentro de la aplicación.

Middleware adicionales pueden ser escritos para realizar una variedad de tareas además de autenticar. Un núcleo de un middleware podría ser responsable de agregar los encabezados apropiados para todas las respuestas que va dejando tu aplicación. Un middleware de registro podría registrar todas las consultas entrantes en tu aplicación.

Hay varios middleware incluidos en el framework Laravel, incluyendo middleware para autenticación y protección CSRF. Todos esos middleware están localizados en el directorio `app/Http/Middleware`.

<a name="defining-middleware"></a>
## Definiendo un Middleware

Para crear un nuevo middleware, usa el comando de Artisan: `make:middleware` 

```php
php artisan make:middleware CheckAge
```

Este comando ubicará una nueva clase `CheckAge` dentro de tu directorio `app/Http/Middleware`. En este middleware, nosotros solo permitiremos el acceso a la ruta si la `edad` suministrada es mayor que 200. De otra forma, redireccionaremos a los usuarios de vuelta a la URL `home`:

```php
<?php

namespace App\Http\Middleware;

use Closure;

class CheckAge
{
    /**
    * Handle an incoming request.
    *
    * @param  \Illuminate\Http\Request  $request
    * @param  \Closure  $next
    * @return mixed
    */
    public function handle($request, Closure $next)
    {
        if ($request->age <= 200) {
            return redirect('home');
        }

        return $next($request);
    }
}
```

Como puedes ver, si la `edad` dada es menor o igual a `200`, el middleware retornará una redirección HTTP al cliente; de otra forma, la solicitud pasará más adentro de la aplicación. Para pasar la solicitud más profundo dentro de la aplicación (permitiendo al middleware "pasar") llama al callback `$next` con el `$request`.

Es mejor visualizar el middleware como una serie de "capas" que deben pasar las solicitudes HTTP antes de que lleguen a tu aplicación. Cada capa puede examinar la solicitud e incluso rechazarla por completo.

::: tip
Todos los middleware son resueltos a través del [contenedor de servicio](/5.8/container), de esta forma, puedes declarar el tipo de cualquier dependencia que necesites dentro del constructor del middleware.
:::

### Middleware Before y After

Que un middleware se ejecute antes o después de una solicitud depende del middleware en sí mismo. Por ejemplo, el siguiente middleware podría realizar alguna tarea **antes** que la solicitud sea manejada por la aplicación:

```php
<?php

namespace App\Http\Middleware;

use Closure;

class BeforeMiddleware
{
    public function handle($request, Closure $next)
    {
        // Perform action

        return $next($request);
    }
}
```

Sin embargo, este middleware podría realizar esta tarea **despúes** de que la solicitud sea manejada por la aplicación:

```php
<?php

namespace App\Http\Middleware;

use Closure;

class AfterMiddleware
{
    public function handle($request, Closure $next)
    {
        $response = $next($request);

        // Perform action

        return $response;
    }
}
```

<a name="registering-middleware"></a>
## Registrando un Middleware

<a name="global-middleware"></a>
### Middleware Globales

Si tu quieres que un middleware corra durante cada solicitud HTTP a tu aplicación, lista la clase del middleware en la propiedad `$middleware` de tu clase `app/Http/Kernel.php`.

<a name="assigning-middleware-to-routes"></a>
### Asignando un Middleware a las Rutas

Si te gustaría asignar un middleware a rutas específicas, deberías primero asignar una clave al middleware en tu archivo `app/Http/Kernel.php`. Por defecto, la propiedad`$routeMiddleware` de esta clase contiene entradas para los middleware incluidos con Laravel. Para agregar uno propio, adjúntalo a esta lista y asígnale una clave de tu elección:

```php
// Within App\Http\Kernel Class...

protected $routeMiddleware = [
    'auth' => \App\Http\Middleware\Authenticate::class,
    'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
    'bindings' => \Illuminate\Routing\Middleware\SubstituteBindings::class,
    'cache.headers' => \Illuminate\Http\Middleware\SetCacheHeaders::class,
    'can' => \Illuminate\Auth\Middleware\Authorize::class,
    'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
    'signed' => \Illuminate\Routing\Middleware\ValidateSignature::class,
    'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
    'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
];
```

Una vez el middleware ha sido definido en el núcleo HTTP, puedes usar el método `middleware` para asignar un middleware a una ruta:

```php
Route::get('admin/profile', function () {
    //
})->middleware('auth');
```

Puedes además asignar multiples middleware a la ruta:

```php
Route::get('/', function () {
    //
})->middleware('first', 'second');
```

Cuando asignas middleware, puedes además pasar un nombre de clase plenamente calificado:

```php
use App\Http\Middleware\CheckAge;

Route::get('admin/profile', function () {
    //
})->middleware(CheckAge::class);
```

<a name="middleware-groups"></a>
### Grupos de Middleware

Algunas veces puedes querer agrupar varios middleware bajo una sola clave para hacerlos más fáciles de asignar a las rutas. Puedes hacer esto usando la propiedad `$middlewareGroups` de tu kernel HTTP.

Por defecto, Laravel viene con los grupos de middleware `web` y `api` que contienen middleware comunes que puedes aplicar a la UI de tu web y a las rutas de tu API:

```php
/**
* The application's route middleware groups.
*
* @var array
*/
protected $middlewareGroups = [
    'web' => [
        \App\Http\Middleware\EncryptCookies::class,
        \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
        \Illuminate\Session\Middleware\StartSession::class,
        \Illuminate\View\Middleware\ShareErrorsFromSession::class,
        \App\Http\Middleware\VerifyCsrfToken::class,
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ],

    'api' => [
        'throttle:60,1',
        'auth:api',
    ],
];
```

Los grupos de Middleware pueden ser asignados a las rutas y las acciones de los controladores usando la misma sintaxis como los middleware individuales. De nuevo, los grupos de middleware hacen más conveniente asignar muchos middleware a una ruta a la vez:

```php
Route::get('/', function () {
    //
})->middleware('web');

Route::group(['middleware' => ['web']], function () {
    //
});
```

::: tip
Por defecto, el grupo de middleware `web` es automaticamente aplicado a tu archivo `routes/web.php` por el `RouteServiceProvider`.
:::

<a name="sorting-middleware"></a>
### Clasificación de Middleware

Raramente, necesitarás que tu middleware se ejecute en un orden específico pero no tienes control sobre su orden cuando son asignados a una ruta. En este caso, puedes especificar la prioridad de tu middleware usando la propiedad `$middlewarePriority` de tu archivo `app/Http/Kernel.php`:

```php
/**
* The priority-sorted list of middleware.
*
* This forces non-global middleware to always be in the given order.
*
* @var array
*/
protected $middlewarePriority = [
    \Illuminate\Session\Middleware\StartSession::class,
    \Illuminate\View\Middleware\ShareErrorsFromSession::class,
    \App\Http\Middleware\Authenticate::class,
    \Illuminate\Session\Middleware\AuthenticateSession::class,
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
    \Illuminate\Auth\Middleware\Authorize::class,
];
```

<a name="middleware-parameters"></a>
## Parámetros en los Middleware

Los middleware pueden además recibir parámetros adicionales. Por ejemplo, si tu aplicación necesita verificar que el usuario autenticado tiene un "rol" dado antes de ejecutar una acción dada, podrías crear un middleware `CheckRole` que reciba un nombre de rol como un argumento adicional.

Los parámetros adicionales en el middleware serán pasados al middleware después del argumento `$next`:

```php
<?php

namespace App\Http\Middleware;

use Closure;

class CheckRole
{
    /**
    * Handle the incoming request.
    *
    * @param  \Illuminate\Http\Request  $request
    * @param  \Closure  $next
    * @param  string  $role
    * @return mixed
    */
    public function handle($request, Closure $next, $role)
    {
        if (! $request->user()->hasRole($role)) {
            // Redirect...
        }

        return $next($request);
    }

}
```

Los parámetros en los middleware pueden ser especificados al definir la ruta separando el nombre del middleware y los parámetros con `:`. Múltiples parámetros deben ser delimitados por comas:

```php
Route::put('post/{id}', function ($id) {
    //
})->middleware('role:editor');
```

<a name="terminable-middleware"></a>
## Middleware Terminable

Algunas veces un middleware puede necesitar hacer algún trabajo después de que la respuesta HTTP ha sido preparada. Por ejemplo, el middleware "session" incluído con Laravel escribe los datos de la sesión para almacenarlos después de que la respuesta ha sido totalmente preparada. Si defines un método `terminate` en tu middleware, este automáticamente será llamado despúes de que la respuesta esté lista para ser enviada al navegador.

```php
<?php

namespace Illuminate\Session\Middleware;

use Closure;

class StartSession
{
    public function handle($request, Closure $next)
    {
        return $next($request);
    }

    public function terminate($request, $response)
    {
        // Store the session data...
    }
}
```

El método `terminate` debería recibir tanto la consulta como la respuesta. Una vez has definido el middleware terminable, deberías agregarlo a la lista de rutas o como un middleware global en el archivo `app/Http/Kernel.php`.

Cuando llamas al método `terminate` en tu middleware, Laravel resolverá una instancia fresca del middleware del [contenedor de servicio](/docs/{{version}}/container). Si te gustaría usar la misma instancia del middleware cuando los métodos `handle` y `terminate` sean llamados, registra el middleware con el contenedor usando el método `singleton` del contenedor.