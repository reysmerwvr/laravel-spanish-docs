# Generación de URL

- [Introducción](#introduction)
- [Los Fundamentos](#the-basics)
    - [Generando URLs Básicas](#generating-basic-urls)
    - [Accediendo la URL Actual](#accessing-the-current-url)
- [URLs para Rutas Nombradas](#urls-for-named-routes)
- [URLs para Acciones de Controlador](#urls-for-controller-actions)
- [Valores Predeterminados](#default-values)

<a name="introduction"></a>
## Introducción

Laravel proporciona varios helpers para asistirte en la generación de URLs para tu aplicación. Ciertamente, estos son útiles principalmente al momento de construir enlaces en tus plantillas y respuestas de API, o al momento de generar respuestas redireccionadas a otra parte de tu aplicación.

<a name="the-basics"></a>
## Los Fundamentos

<a name="generating-basic-urls"></a>
### Generando URLs Básicas

El helper `url` puede ser usado en URLs arbitrarias de tu aplicación. La URL generada usará automáticamente el esquema (HTTP o HTTPS) y el anfitrión de la solicitud actual:

    $post = App\Post::find(1);

    echo url("/posts/{$post->id}");

    // http://example.com/posts/1

<a name="accessing-the-current-url"></a>
### Accediendo la URL Actual

Si ninguna ruta es proporcionada al helper `url`, una instancia `Illuminate\Routing\UrlGenerator` es devuelta, permitiéndote que accedas información sobre la URL actual:

    // Get the current URL without the query string...
    echo url()->current();

    // Get the current URL including the query string...
    echo url()->full();

    // Get the full URL for the previous request...
    echo url()->previous();

Cada uno de estos métodos también puede ser accedido por medio de la clase [facade](/docs/{{version}}/facades) `URL`:

    use Illuminate\Support\Facades\URL;

    echo URL::current();

<a name="urls-for-named-routes"></a>
## URLs para Rutas Nombradas

El helper `route` puede ser usado para generar URLs para rutas nombradas. Las rutas nombradas permiten generar URLs sin estar acopladas a la URL real definida en la ruta. Por lo tanto, si la URL de la ruta cambia, ningún cambio necesita ser hecho a tus llamadas de función `route`. Por ejemplo, imagina que tu aplicación contiene una ruta definida como la siguiente:

    Route::get('/post/{post}', function () {
        //
    })->name('post.show');

Para generar una URL a esta ruta, puedes usar el helper `route` como sigue:

    echo route('post.show', ['post' => 1]);

    // http://example.com/post/1

Con frecuencia estarás generando URLs usando la clave primaria de [modelos Eloquent](/docs/{{version}}/eloquent). Por esta razón, puedes pasar modelos Eloquent como valores de parámetro. El helper `route` extraerá automáticamente la clave primaria del modelo:

    echo route('post.show', ['post' => $post]);

<a name="urls-for-controller-actions"></a>
## URLs para Acciones de Controlador

La función `action` genera una URL para la acción de controlador dada. No necesitarás pasar el espacio de nombre completo del controlador. En lugar de eso, pasa el nombre de clase del controlador relativo al espacio de nombre `App\Http\Controllers`:

    $url = action('HomeController@index');

Si el método del controlador acepta parámetros de ruta, puedes pasarlas como segundo argumento de la función:

    $url = action('UserController@profile', ['id' => 1]);

<a name="default-values"></a>
## Valores Predeterminados

Para algunas aplicaciones, puedes querer especificar los valores predeterminados de largas-solicitudes para los parámetros de ciertas URL. Por ejemplo, imagina que muchas de tus rutas definen un parámetro `{locale}`:

    Route::get('/{locale}/posts', function () {
        //
    })->name('post.index');

Es complicado pasar siempre el parámetro `locale` cada vez que ejecutas el helper `route`. Así, puedes usar el método `URL::defaults` para definir un valor predeterminado para este parámetro que siempre será aplicado durante la solicitud actual. Puedes querer ejecutar este método desde un [middleware de ruta](/docs/{{version}}/middleware#assigning-middleware-to-routes) de modo que tengas acceso a la solicitud actual:

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

Una vez que el valor predeterminado para el parámetro `locale` ha sido establecido, ya no estás obligado a pasar su valor al momento de generar URLs por medio del helper `route`.
