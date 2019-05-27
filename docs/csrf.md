::: v-pre

# Protección CSRF

- [Introducción](#csrf-introduction)
- [Excluyendo URIs](#csrf-excluding-uris)
- [X-CSRF-Token](#csrf-x-csrf-token)
- [X-XSRF-Token](#csrf-x-xsrf-token)

<a name="csrf-introduction"></a>
## Introducción

Laravel hace que sea fácil proteger tu aplicación de ataques de tipo [cross-site request forgery](https://en.wikipedia.org/wiki/Cross-site_request_forgery) (CSRF). Los ataques de tipo CSRF son un tipo de explotación de vulnerabilidad malicioso por el cual comandos no autorizados son ejecutados en nombre de un usuario autenticado.

Laravel genera automáticamente un "token" CSRF para cada sesión de usuario activa manejada por la aplicación. Este token es usado para verificar que el usuario autenticado es quien en realidad está haciendo la petición a la aplicación.

En cualquier momento que definas un formulario HTML en tu aplicación, debes incluir un campo de token CSRF en el formulario con el propósito de que el middleware para protección CSRF pueda validar la solicitud. Puedes usar la directiva de Blade `@csrf` para generar el campo de token:

```php
<form method="POST" action="/profile">
    @csrf
    ...
</form>
```

El [middleware](/docs/{{version}}/middleware) `VerifyCsrfToken`, el cual es incluido en el grupo de middleware `web`, verificará automáticamente que el token en el campo de la solicitud coincida con el almacenado en la sesión.

#### Tokens CSRF & JavaScript

Cuando se crean aplicaciones controladas por JavaScript, es conveniente hacer que tu biblioteca HTTP de JavaScript agregue el token CSRF a cada petición saliente. Por defecto, el archivo `resources/js/bootstrap.js` registra el valor de la meta etiqueta `csrf-token` con la biblioteca HTTP Axios. Si no estás usando esta biblioteca, necesitarás configurar este comportamiento de forma manual para tu aplicación.

<a name="csrf-excluding-uris"></a>
## Excluyendo las URIs de la Protección CSRF

Algunas veces puedes desear excluir un conjunto de URIs de la protección CSRF. Por ejemplo, si estás usando [Stripe](https://stripe.com) para procesar pagos y estás utilizando su sistema webhook, necesitarás excluir tu ruta de manejador webhook de Stripe de la protección CSRF ya que Stripe no sabrá que token CSRF enviar a sus rutas.

Típicamente, deberías colocar este tipo de rutas afuera del grupo de middleware `web` que el `RouteServiceProvider` aplica a todas las rutas en el archivo `routes/web.php`. Sin embargo, también puedes excluir las rutas al añadir sus URIs a la propiedad `except` del middleware `VerifyCsrfToken`:

```php
<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
    * The URIs that should be excluded from CSRF verification.
    *
    * @var array
    */
    protected $except = [
        'stripe/*',
        'http://example.com/foo/bar',
        'http://example.com/foo/*',
    ];
}
```

::: tip
El middleware CSRF está deshabilitado automáticamente al [ejecutar pruebas](/docs/{{version}}/testing).
:::

<a name="csrf-x-csrf-token"></a>
## X-CSRF-TOKEN

Además de comprobar el token CSRF como parámetro POST, el middleware `VerifyCsrfToken` también comprobará el encabezado de solicitud `X-CSRF-TOKEN`. Podrías, por ejemplo, almacenar el token en una etiqueta `meta` de HTML:

```php
<meta name="csrf-token" content="{{ csrf_token() }}">
```

Entonces, una vez que has creado la etiqueta `meta`, puedes instruir una biblioteca como jQuery para añadir automáticamente el token a todos los encabezados de las peticiones. Esto proporciona protección CSRF fácil y conveniente para tus aplicaciones basadas en AJAX.

```php
$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});
```

::: tip
Por defecto, el archivo `resources/js/bootstrap.js` registra el valor de la etiqueta meta `csrf-token` con la biblioteca HTTP Axios. Si no estás usando esta biblioteca, necesitarás configurar este comportamiento de forma manual para tu aplicación.
:::

<a name="csrf-x-xsrf-token"></a>
## X-XSRF-TOKEN

Laravel almacena el token CSRF actual en una cookie `XSRF-TOKEN` que es incluida con cada respuesta generada por el framework. Puedes usar el valor del cookie para establecer el encabezado de la solicitud `X-XSRF-TOKEN`.

Esta cookie primeramente es enviada por conveniencia ya que algunos frameworks JavaScript y librerías, como Angular y Axios colocan automáticamente su valor en el encabezado `X-XSRF-TOKEN`.