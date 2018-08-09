# Protección CSRF

- [Introducción](#csrf-introduction)
- [Excluyendo las URIs](#csrf-excluding-uris)
- [X-CSRF-Token](#csrf-x-csrf-token)
- [X-XSRF-Token](#csrf-x-xsrf-token)

<a name="csrf-introduction"></a>
## Introducción

Laravel hace que sea fácil proteger tu aplicación de ataques de tipo [cross-site request forgery](https://en.wikipedia.org/wiki/Cross-site_request_forgery) (CSRF). Los ataques de tipo CSRF son un tipo de explotación de vulnerabilidad malicioso por el cual comandos no autorizados son ejecutados en nombre de un usuario autenticado.

Laravel genera automáticamente un "token" CSRF para cada sesión de usuario activa manejada por la aplicación. Este token es usado para verificar que el usuario autenticado es quien en realidad esta haciendo la petición a la aplicación.

En cualquier momento que definas un formulario HTML en tu aplicación, deberías incluir un campo de token CSRF en el formulario con el propósito de que el middleware para protección CSRF pueda validar la solicitud. Puedes usar la clase `csrf_field` para generar el campo de token:

    <form method="POST" action="/profile">
        {{ csrf_field() }}
        ...
    </form>

El [middleware] `VerifyCsrfToken` (/docs/{{version}}/middleware), el cual es incluido en el grupo de middleware `web`, verificará automáticamente que el token en el campo de entrada de la solicitud coincida con el almacenado para la sesión.

#### Tokens CSRF & JavaScript

Cuando se crean aplicaciones controladas por JavaScript, es conveniente tener tu librería HTTP de JavaScript conectada automáticamente al token CSRF para cada solicitud realizada. Por defecto, el archivo `resources/assets/js/bootstrap.js` registra el valor de la meta etiqueta `csrf-token` con la librería HTTP Axios. Si no estás usando esta librería, necesitarás configurarla manualmente para tu aplicación.

<a name="csrf-excluding-uris"></a>
## Excluyendo las URIs de la Protección CSRF

Algunas veces puedes desear excluir un conjunto de URIs de la protección CSRF. Por ejemplo, si estás usando [Stripe](https://stripe.com) para procesar pagos y estás utilizando su sistema webhook, necesitarás excluir tu ruta de manejador webhook de Stripe desde la protección CSRF ya que Stripe no sabrá que token CSRF enviar a sus rutas.

Típicamente, deberías quitar estas clases de rutas del grupo de middleware `web` que el `RouteServiceProvider` aplica a todas las rutas en el archivo `routes/web.php`. Sin embargo, también puedes excluir las rutas al añadir sus URIs a la propiedad `except` del middleware `VerifyCsrfToken`:

    <?php

    namespace App\Http\Middleware;

    use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

    class VerifyCsrfToken extends Middleware
    {
        /**
         * URIs que deberían ser excluidas de la verificación CSRF.
         *
         * @var array
         */
        protected $except = [
            'stripe/*',
            'http://example.com/foo/bar',
            'http://example.com/foo/*',
        ];
    }

<a name="csrf-x-csrf-token"></a>
## X-CSRF-TOKEN

En adición al chequeo del token CSRF como un parámetro POST, el middleware `VerifyCsrfToken` también chequeará el encabezado de solicitud `X-CSRF-TOKEN`. Podrías, por ejemplo, almacenar el token en una etiqueta `meta` de HTML:

    <meta name="csrf-token" content="{{ csrf_token() }}">

Entonces, una vez que has creado la etiqueta `meta`, puedes instruir una librería como jQuery para añadir automáticamente el token a todos los encabezados de solicitud.  Esto proporciona protección CSRF fácil y conveniente para tus aplicaciones basadas en AJAX.

    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });

> {tip} Por defecto, el archivo `resources/assets/js/bootstrap.js` registra el valor de la meta etiqueta del `csrf-token` con la librería HTTP Axios. Si no estás usando esta librería, necesitarás configurarla manualmente para tu aplicación.

<a name="csrf-x-xsrf-token"></a>
## X-XSRF-TOKEN

Laravel almacena el token CSRF actual en una cookie `XSRF-TOKEN` que es incluido con cada respuesta generada por el framework. Puedes usar el valor del cookie para establecer el encabezado de la solicitud `X-XSRF-TOKEN`.

Esta cookie primeramente es enviada por conveniencia ya que algunos frameworks JavaScript y librerías como Angular y Axios colocan automáticamente su valor en el encabezado `X-XSRF-TOKEN`.
