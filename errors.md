# Errores & Logging

- [Introducción](#introduction)
- [Configuración](#configuration)
    - [Detalle de Error](#error-detail)
    - [Almacenamiento de Log](#log-storage)
    - [Niveles de Severidad de Log](#log-severity-levels)
    - [Configuración de Monologo Personalizado](#custom-monolog-configuration)
- [El Manejador de Excepción](#the-exception-handler)
    - [Método Reporte](#report-method)
    - [Método Render](#render-method)
    - [Excepciones Renderizable & Reportable](#renderable-exceptions)
- [Excepciones HTTP](#http-exceptions)
    - [Páginas de Error HTTP Personalizadas](#custom-http-error-pages)
- [Loggin](#logging)

<a name="introduction"></a>
## Introducción

Cuando empieces un nuevo proyecto de Laravel, el manejo de excepciones y errores ya estará configurado para ti. La clase `App\Exceptions\Handler` es donde todas las excepciones disparadas por tu aplicación son registradas y después renderizadas de vuelta al usuario. Revisaremos más profundamente dentro de esta clase a través de esta documentación.

Para el logging, Laravel utiliza la librería [Monolog](https://github.com/Seldaek/monolog), la cual proporciona soporte para una variedad de poderosos manejadores de log. Laravel configura varios de estos manejadores por ti, permitiendo que elijas entre un solo archivo de log, al rotar los archivos de log, o escribiendo información de error en el log del sistema.

<a name="configuration"></a>
## Configuración

<a name="error-detail"></a>
### Detalle de Error

La opción `debug` en tu archivo de configuración `config/app.php` determina cuanta información sobre un error se muestra realmente al usuario. Por defecto, esta opción es establecida para respetar el valor de la variable de entorno `APP_DEBUG`, la cual es almacenada en tu archivo `.env`.

Para desarrollo local, deberías establecer la variable de entorno a `true`. En tu entorno de producción, este valor debería estar siempre `false`. Si el valor es establecido a `true` en producción, te arriesgas a exponer valores de configuración sensitivos a los usuarios finales de tu aplicación.

<a name="log-storage"></a>
### Almacenamiento de Log

De forma predeterminada, Laravel soporta la escritura de información de log en archivos `single`, archivos `daily`, el `syslog`, y el `errorlog`. Para configurar cuál mecanismo de almacenamiento usa Laravel, deberías modificar la opción `log` en tu archivo de configuración `config/app.php`. Por ejemplo, si deseas usar archivos log diariamente en lugar de un archivo único, deberías establecer el valor `log` en tu archivo de configuración `app` a `daily`:

    'log' => 'daily'

#### Máximo de Archivos de log Diarios

Al momento de usar el modo de log `daily`, Laravel solamente retenerá cinco días de archivos log de forma predeterminada. Si quieres ajustar el número de archivos retenidos, puedes agregar un valor de configuración `log_max_files` en tu archivo de configuración `app`:

    'log_max_files' => 30

<a name="log-severity-levels"></a>
### Niveles de Severidad de Log

Al momento de usar Monolog, los mensajes de log pueden tener distintos niveles de severidad. De forma predeterminada, Laravel escribe todo los niveles de log en el almacenamiento. Sin embargo, en tu entorno de producción, puedes desear configurar la severidad mínima que debería ser registrada agregando la opción `log_level` en tu archivo de configuración `app.php`.

Una vez que esta opción ha sido configurada, Laravel registrará todos los niveles mayores que o iguales a la severidad especificada. Por ejemplo, un `log_level` predeterminado de `error` registrará los mensajes **error**, **critical**, **alert**, y **emergency**:

    'log_level' => env('APP_LOG_LEVEL', 'error'),

> {tip} Monolog reconoce los niveles de severidad siguientes - desde el menos severo al más severo: `debug`, `info`, `notice`, `warning`, `error`, `critical`, `alert`, `emergency`.

<a name="custom-monolog-configuration"></a>
### Configuración de Monolog Personalizada

Si prefieres tener el control total de cómo Monolog es configurado por tu aplicación, puedes usar el método `configureMonologUsing` de la aplicación. Deberías colocar una llamada de este método en tu archivo `bootstrap/app.php` justo antes que la variable `$app` sea devuelta por el archivo:

    $app->configureMonologUsing(function ($monolog) {
        $monolog->pushHandler(...);
    });

    return $app;

#### Personalizando el Nombre del Canal

De forma predeterminada, Monolog se instancia con el nombre que coincida con el entorno actual, tal como `production` o `local`. Para cambiar este valor, agrega la opción `log_channel` a tu archivo de configuración `app.php`:

    'log_channel' => env('APP_LOG_CHANNEL', 'my-app-name'),

<a name="the-exception-handler"></a>
## El Manejador de Excepción

<a name="report-method"></a>
### El Método Reporte

Todas las excepciones son manejadas por la clase App\Exceptions\Handler`. Esta clase contiene dos métodos: `report` y `render`. Examinaremos cada uno de estos métodos en detalle. El método `report` se usa para registrar excepciones o enviarlas a un servicio externo como [Bugsnag](https://bugsnag.com) o [Sentry](https://github.com/getsentry/sentry-laravel). De forma predeterminada, el método `report` pasa la excepción a la clase base donde la excepción es registrada. Sin embargo, eres libre de registrar excepciones en la forma que desees.

Por ejemplo, si necesitas reportar distintos tipos de excepciones en diferentes formas, puedes usar el operador de comparación `instanceof` de PHP:

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

        return parent::report($exception);
    }

#### El Helper `report`

Algunas veces puede que necesites reportar una execpción pero continuar manejando la solicitud actual. La función helper `report` permite que reportes rápidamente una excepción usando el método `report` de tu manejador de excepción sin renderizar una página de error:

    public function isValid($value)
    {
        try {
            // Validate the value...
        } catch (Exception $e) {
            report($e);

            return false;
        }
    }

#### Ignorando Excepciones por Tipo

La propiedad `$dontReport` del manejador de excepción contiene un arreglo de tipos de excepción que no serán registrados. Por ejemplo, excepciones que resulten de errores 404, al igual que otros varios tipos de errores, no son escritos a tus archivos de log. Puedes agregar otros tipos de excepción a este arreglo como necesites:

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

<a name="render-method"></a>
### El Método Render

El método `render` es responsable de convertir una excepción dada en una respuesta HTTP que debería ser devuelta al navegador. De forma predeterminada, la excepción es pasada a la clase base la cual genera una respuesta para ti. Sin embargo, eres libre de revisar el tipo de excepción o devolver tu propia respuesta personalizada:

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

<a name="renderable-exceptions"></a>
### Excepciones Renderizables y Reportables

En lugar de verificar-tipo de excepciones en los métodos `report` y `render` del manejador de excepción, puedes definir métodos `report` y `render` directamente en tu excepción personalizada. Cuando estos métodos existen, serán ejecutados automáticamente por el framework:

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

<a name="http-exceptions"></a>
## Excepciones HTTP

Algunas excepciones describen códigos de error HTTP del servidor. Por ejemplo, esto puede ser un error "página no encontrada" (404), un "error no autorizado" (401) o incluso un error 500 generado por el desarrollador. Con el propósito de generar tal respuesta desde cualquier lugar en tu aplicación, puedes usar el helper `abort`:

    abort(404);

El helper `abort` provocará inmediatamente una excepción la cual será renderizada por el manejador de excepción. Opcionalmente, puedes proporcionar el texto de la respuesta:

    abort(403, 'Unauthorized action.');

<a name="custom-http-error-pages"></a>
### Página de Error HTTP Personalizadas

Laravel hace fácil mostrar páginas de error personalizadas para varios códigos de estado HTTP. Por ejemplo, si deseas personalizar la página de error para los códigos de estado HTTP 404, crea una vista `resources/views/errors/404.blade.php`. Este archivo será servido en todos los errores 404 generados por tu aplicación. La vista dentro de este directorio debería ser nombrada para coincidir con el código de estado HTTP que les corresponde. La instancia `HttpException` provocada por la función `abort` será pasada a la vista como una variable `$exception`:

    <h2>{{ $exception->getMessage() }}</h2>

<a name="logging"></a>
## Logging

Laravel proporciona una simple capa de abstracción en el tope de la poderosa librería  [Monolog](https://github.com/seldaek/monolog). De forma predeterminada, Laravel es configurado para crear un archivo log para tu aplicación en el directorio `storage/logs`. Puedes escribir información a los logs usando la clase [facade](/docs/{{version}}/facades) `Log`:

    <?php

    namespace App\Http\Controllers;

    use App\User;
    use Illuminate\Support\Facades\Log;
    use App\Http\Controllers\Controller;

    class UserController extends Controller
    {
        /**
         * Show the profile for the given user.
         *
         * @param  int  $id
         * @return Response
         */
        public function showProfile($id)
        {
            Log::info('Showing user profile for user: '.$id);

            return view('user.profile', ['user' => User::findOrFail($id)]);
        }
    }

El logger proporciona los ocho niveles de loggin definidos en la especificación [RFC 5424](https://tools.ietf.org/html/rfc5424): **emergency**, **alert**, **critical**, **error**, **warning**, **notice**, **info** y **debug**.

    Log::emergency($message);
    Log::alert($message);
    Log::critical($message);
    Log::error($message);
    Log::warning($message);
    Log::notice($message);
    Log::info($message);
    Log::debug($message);

#### Información Contextual

Un arreglo de datos contextuales también puede ser pasado a los métodos logs. Estos datos contextuales serán formateados y mostrados con el mensaje de log:

    Log::info('User failed to login.', ['id' => $user->id]);

#### Accediendo a la Instancia Monolog Subyacente

Monolog tiene una variedad de manejadores adicionales que puedes usar para logging. Si es necesario, puedes acceder a la instancia Monolog subyacente que está siendo usada por Laravel:

    $monolog = Log::getMonolog();
