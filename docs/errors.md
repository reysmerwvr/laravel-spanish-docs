::: v-pre

# Manejo de Errores

- [Introducción](#introduction)
- [Configuración](#configuration)
- [Manejador de Excepciones](#the-exception-handler)
    - [Método Report](#report-method)
    - [Método Render](#render-method)
    - [Excepciones Renderizables y Reportables](#renderable-exceptions)
- [Excepciones HTTP](#http-exceptions)
    - [Páginas de Error HTTP Personalizadas](#custom-http-error-pages)

<a name="introduction"></a>
## Introducción

Cuando comienzas un nuevo proyecto de Laravel, el manejo de excepciones y errores ya está configurado para ti. La clase `App\Exceptions\Handler` es donde todas las excepciones disparadas por tu aplicación son registradas y después renderizadas de vuelta al usuario. Revisaremos más profundamente dentro de esta clase a través de esta documentación.

<a name="configuration"></a>
## Configuración

La opción `debug` en tu archivo de configuración `config/app.php` determina cuanta información sobre un error se muestra realmente al usuario. Por defecto, esta opción es establecida para respetar el valor de la variable de entorno `APP_DEBUG`, la cual es almacenada en tu archivo `.env`.

Para desarrollo local, deberías establecer la variable de entorno a `true`. En tu entorno de producción, este valor debería estar siempre `false`. Si el valor es establecido a `true` en producción, te arriesgas a exponer valores de configuración sensitivos a los usuarios finales de tu aplicación.

<a name="the-exception-handler"></a>
## Manejador de Excepciones

<a name="report-method"></a>
### Método Report

Todas las excepciones son manejadas por la clase `App\Exceptions\Handler`. Esta clase contiene dos métodos: `report` y `render`. Examinaremos cada uno de estos métodos en detalle. El método `report` se usa para registrar excepciones o enviarlas a un servicio externo como [Bugsnag](https://bugsnag.com) o [Sentry](https://github.com/getsentry/sentry-laravel). De forma predeterminada, el método `report` pasa la excepción a la clase base donde la excepción es registrada. Sin embargo, eres libre de registrar excepciones en la forma que desees.

Por ejemplo, si necesitas reportar distintos tipos de excepciones en diferentes formas, puedes usar el operador de comparación `instanceof` de PHP:

```php
/**
* Report or log an exception.
*
* This is a great spot to send exceptions to Sentry, Bugsnag, etc.
*
* @param  \Exception  $exception
* @return void
*/
public function report(Exception $exception)
{
    if ($exception instanceof CustomException) {
        //
    }

    parent::report($exception);
}
```

::: tip
En lugar de hacer uso de muchos `instanceof` en tu método `report`, considera usar [excepciones reportables](/docs/{{version}}/errors#renderable-exceptions)
:::

#### Contexto De Log Global

De estar disponible, Laravel automáticamente agrega el ID del usuario actual al mensaje de log de cada excepción como datos contextuales. Puedes definir tus propios datos contextuales sobrescribiendo el método `context` de la clase `App\Exceptions\Handler` de tu aplicación. Esta información será incluida en cada mensaje de log de excepción escrito por tu aplicación:

```php   
/**
* Get the default context variables for logging.
*
* @return array
*/
protected function context()
{
    return array_merge(parent::context(), [
        'foo' => 'bar',
    ]);
}
```

#### Helper `report`

Algunas veces puede que necesites reportar una execpción pero continuar manejando la solicitud actual. La función helper `report` permite que reportes rápidamente una excepción usando el método `report` de tu manejador de excepción sin renderizar una página de error:

```php
public function isValid($value)
{
    try {
        // Validate the value...
    } catch (Exception $e) {
        report($e);

        return false;
    }
}
```

#### Ignorando Excepciones por Tipo

La propiedad `$dontReport` del manejador de excepción contiene un arreglo de tipos de excepción que no serán registrados. Por ejemplo, excepciones que resulten de errores 404, al igual que otros varios tipos de errores, no son escritos a tus archivos de log. Puedes agregar otros tipos de excepción a este arreglo cuando lo necesites:

```php
/**
* A list of the exception types that should not be reported.
*
* @var array
*/
protected $dontReport = [
    \Illuminate\Auth\AuthenticationException::class,
    \Illuminate\Auth\Access\AuthorizationException::class,
    \Symfony\Component\HttpKernel\Exception\HttpException::class,
    \Illuminate\Database\Eloquent\ModelNotFoundException::class,
    \Illuminate\Validation\ValidationException::class,
];
```

<a name="render-method"></a>
### Método Render

El método `render` es responsable de convertir una excepción dada en una respuesta HTTP que debería ser devuelta al navegador. De forma predeterminada, la excepción es pasada a la clase base la cual genera una respuesta para ti. Sin embargo, eres libre de revisar el tipo de excepción o devolver tu propia respuesta personalizada:

```php
/**
* Render an exception into an HTTP response.
*
* @param  \Illuminate\Http\Request  $request
* @param  \Exception  $exception
* @return \Illuminate\Http\Response
*/
public function render($request, Exception $exception)
{
    if ($exception instanceof CustomException) {
        return response()->view('errors.custom', [], 500);
    }

    return parent::render($request, $exception);
}
```

<a name="renderable-exceptions"></a>
### Excepciones Renderizables y Reportables

En lugar de hacer verificaciones por tipo de excepciones en los métodos `report` y `render` del manejador de excepción, puedes definir métodos `report` y `render` directamente en tu excepción personalizada. Cuando estos métodos existen, serán ejecutados automáticamente por el framework:

```php
<?php

namespace App\Exceptions;

use Exception;

class RenderException extends Exception
{
    /**
    * Report the exception.
    *
    * @return void
    */
    public function report()
    {
        //
    }

    /**
    * Render the exception into an HTTP response.
    *
    * @param  \Illuminate\Http\Request
    * @return \Illuminate\Http\Response
    */
    public function render($request)
    {
        return response(...);
    }
}
```

::: tip
Puedes declarar el tipo de cualquier dependencia requerida en el método `report` y el [contenedor de servicios](/docs/{{version}}/container) las inyectará automáticamente en el método.
:::

<a name="http-exceptions"></a>
## Excepciones HTTP

Algunas excepciones describen códigos de error HTTP del servidor. Por ejemplo, esto puede ser un error "página no encontrada" (404), un "error no autorizado" (401) o incluso un error 500 generado por el desarrollador. Con el propósito de generar tal respuesta desde cualquier lugar en tu aplicación, puedes usar el helper `abort`:

```php
abort(404);
```

El helper `abort` provocará inmediatamente una excepción la cual será renderizada por el manejador de excepción. Opcionalmente, puedes proporcionar el texto de la respuesta:

```php
abort(403, 'Unauthorized action.');
```

<a name="custom-http-error-pages"></a>
### Páginas de Error HTTP Personalizadas

Laravel hace fácil mostrar páginas de error personalizadas para varios códigos de estado HTTP. Por ejemplo, si deseas personalizar la página de error para los códigos de estado HTTP 404, crea una vista `resources/views/errors/404.blade.php`. Este archivo será servido en todos los errores 404 generados por tu aplicación. La vista dentro de este directorio debería ser nombrada para coincidir con el código de estado HTTP que les corresponde. La instancia `HttpException` provocada por la función `abort` será pasada a la vista como una variable `$exception`:

```php
<h2>{{ $exception->getMessage() }}</h2>
```

Puedes publicar las plantillas de página de error de Laravel usando el comando de Artisan `vender:publish`. Una vez que las plantillas han sido publicadas, puedes personalizarlas de la forma que quieras:

```php
php artisan vendor:publish --tag=laravel-errors
```