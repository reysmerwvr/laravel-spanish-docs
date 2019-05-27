::: v-pre

# Generación de URLs

- [Introducción](#introduction)
- [Fundamentos](#the-basics)
    - [Generando URLs Básicas](#generating-basic-urls)
    - [Accediendo la URL Actual](#accessing-the-current-url)
- [URLs para Rutas Nombradas](#urls-for-named-routes)
    - [URLs firmadas](#signed-urls)
- [URLs para Acciones de Controlador](#urls-for-controller-actions)
- [Valores Predeterminados](#default-values)

<a name="introduction"></a>
## Introducción

Laravel proporciona varios helpers para asistirte en la generación de URLs para tu aplicación. Éstos son útiles principalmente al momento de construir enlaces en tus plantillas y respuestas de API, o al momento de generar respuestas redireccionadas a otra parte de tu aplicación.

<a name="the-basics"></a>
## Fundamentos

<a name="generating-basic-urls"></a>
### Generando URLs Básicas

El helper `url` puede ser usado para generar URLs arbitrarias en tu aplicación. La URL generada utilizará automáticamente el esquema (HTTP o HTTPS) y el host de la solicitud actual:

```php
$post = App\Post::find(1);

echo url("/posts/{$post->id}");

// http://example.com/posts/1
```

<a name="accessing-the-current-url"></a>
### Accediendo la URL Actual

Si ninguna ruta es proporcionada al helper `url`, una instancia `Illuminate\Routing\UrlGenerator` es devuelta, permitiéndote que accedas información sobre la URL actual:

```php
// Obtener la URL actual sin la cadena de consulta...
echo url()->current();

// Obtener la URL actual incluyendo la cadena de consulta...
echo url()->full();

// Obtener la URL completa de la solicitud anterior...
echo url()->previous();
```

Cada uno de estos métodos también puede ser accedido por medio del [facade](/docs/{{version}}/facades) `URL`:

```php
use Illuminate\Support\Facades\URL;

echo URL::current();
```

<a name="urls-for-named-routes"></a>
## URLs para Rutas Nombradas

El helper `route` puede ser usado para generar URLs para rutas nombradas. Las rutas nombradas permiten generar URLs sin estar acopladas a la URL real definida en la ruta. Por lo tanto, si la URL de la ruta cambia, no es necesario realizar cambios en las llamadas a la función `route`. Por ejemplo, imagina que tu aplicación contiene una ruta definida de la siguiente forma:

```php
Route::get('/post/{post}', function () {
    //
})->name('post.show');
```

Para generar una URL a esta ruta, puedes usar el helper `route` así:

```php
echo route('post.show', ['post' => 1]);

// http://example.com/post/1
```

Con frecuencia estarás generando URLs usando la clave primaria de [modelos de Eloquent](/docs/{{version}}/eloquent). Por esta razón, puedes pasar modelos de Eloquent como valores de parámetros. El helper `route` extraerá automáticamente la clave primaria del modelo:

```php
echo route('post.show', ['post' => $post]);
```

El helper `route` también se puede usar para generar URL para rutas con múltiples parámetros:

```php
Route::get('/post/{post}/comment/{comment}', function () {
    //
})->name('comment.show');

echo route('comment.show', ['post' => 1, 'comment' => 3]);

// http://example.com/post/1/comment/3
```

<a name="signed-urls"></a>
### URLs Firmadas

Laravel te permite crear fácilmente URLs "firmadas" para rutas nombradas. Estas URLs tienen un hash de "firma" añadido a la cadena de solicitud que le permite a Laravel verificar que la URL no haya sido modificada desde que fue creada. Las URLs firmadas son especialmente útiles para rutas que están disponibles públicamente pero necesitan una capa de protección contra la manipulación de URLs.

Por ejemplo, puedes usar URLs firmadas para implementar un enlace público de "anular suscripción" que es enviado por correo electrónico a tus clientes. Para crear una URL firmada para una ruta nombrada, usa el método `signedRoute` del facade `URL`:

```php
use Illuminate\Support\Facades\URL;

return URL::signedRoute('unsubscribe', ['user' => 1]);
```

Si te gustaría generar una ruta firmada temporal que expira, puedes usar el método `temporarySignedRoute`:

```php
use Illuminate\Support\Facades\URL;

return URL::temporarySignedRoute(
    'unsubscribe', now()->addMinutes(30), ['user' => 1]
);
```

#### Validando Solicitudes A Rutas Firmadas

Para verificar que una solicitud entrate tiene una firma válida, debes llamar al método `hasValidSignature` en el `Request` entrante:

```php
use Illuminate\Http\Request;

Route::get('/unsubscribe/{user}', function (Request $request) {
    if (! $request->hasValidSignature()) {
        abort(401);
    }

    // ...
})->name('unsubscribe');
```

Alternativamente, puedes asignar el middleware `Illuminate\Routing\Middleware\ValidateSignature` a la ruta. Si aún no está presnete, debes asignar una clave a este middleware en el arreglo `routeMiddleware` de tu kernel HTTP:

```php
/**
* The application's route middleware.
*
* These middleware may be assigned to groups or used individually.
*
* @var array
*/
protected $routeMiddleware = [
    'signed' => \Illuminate\Routing\Middleware\ValidateSignature::class,
];
```

Una vez que has registrado el middleware en tu kernel, puedes adjuntarlo a una ruta. Si la solicitud entrante no tiene una firma válida, el middleware automáticamente retornará una respuesta de error `403`:

```php
Route::post('/unsubscribe/{user}', function (Request $request) {
    // ...
})->name('unsubscribe')->middleware('signed');
```

<a name="urls-for-controller-actions"></a>
## URLs Para Acciones de Controlador

La función `action` genera una URL para la acción de controlador dada. No necesitarás pasar el espacio de nombre completo del controlador. En lugar de eso, pasa el nombre de clase del controlador relativo al espacio de nombre `App\Http\Controllers`:

```php
$url = action('HomeController@index');
```

También puedes hacer referencia a acciones con una sintaxis de arreglo "callable":

```php
use App\Http\Controllers\HomeController;

$url = action([HomeController::class, 'index']);
```

Si el método del controlador acepta parámetros de ruta, puedes pasarlos como segundo argumento de la función:

```php
$url = action('UserController@profile', ['id' => 1]);
```

<a name="default-values"></a>
## Valores Predeterminados

Para algunas aplicaciones, puedes querer especificar valores predeterminados para toda la solicitud en los parámetros de ciertas URL. Por ejemplo, imagina que muchas de tus rutas definen un parámetro `{locale}`:

```php
Route::get('/{locale}/posts', function () {
    //
})->name('post.index');
```

Es complicado pasar siempre el parámetro `locale` cada vez que ejecutas el helper `route`. Así, puedes usar el método `URL::defaults` para definir un valor predeterminado para este parámetro que siempre será aplicado durante la solicitud actual. Puedes querer ejecutar este método desde un [middleware de ruta](/docs/{{version}}/middleware#assigning-middleware-to-routes) de modo que tengas acceso a la solicitud actual:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\URL;

class SetDefaultLocaleForUrls
{
    public function handle($request, Closure $next)
    {
        URL::defaults(['locale' => $request->user()->locale]);

        return $next($request);
    }
}
```

Una vez que el valor predeterminado para el parámetro `locale` ha sido establecido, ya no estás obligado a pasar su valor al momento de generar URLs por medio del helper `route`.