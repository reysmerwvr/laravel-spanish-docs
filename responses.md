::: v-pre

# Respuestas HTTP

- [Creando Respuestas](#creating-responses)
    - [Adjuntando Encabezados a las Respuestas](#attaching-headers-to-responses)
    - [Adjuntando Cookies a las Respuestas](#attaching-cookies-to-responses)
    - [Cookies & Encriptación](#cookies-and-encryption)
- [Redirecciones](#redirects)
    - [Redireccionando a Rutas Nombradas](#redirecting-named-routes)
    - [Redireccionando a Acciones de Controlador](#redirecting-controller-actions)
    - [Redireccionando a Dominios Externos](#redirecting-external-domains)
    - [Redireccionando con los Datos de una Sesión Movida Rápidamente](#redirecting-with-flashed-session-data)
- [Otros Tipos de Respuestas](#other-response-types)
    - [Respuestas de Vista](#view-responses)
    - [Respuestas JSON](#json-responses)
    - [Descargas de Archivo](#file-downloads)
    - [Respuestas de Archivo](#file-responses)
- [Macros de Respuesta](#response-macros)

<a name="creating-responses"></a>
## Creando Respuestas

#### Cadenas & Arreglos

Todas las rutas y controladores deberían devolver una respuesta para ser enviada de regreso al navegador del usuario. Laravel proporciona diferentes formas de devolver respuestas. La respuesta más básica es devolver una cadena desde una ruta o controlador. El framework convertirá la cadena en una respuesta HTTP completa:

```php
Route::get('/', function () {
    return 'Hello World';
});
```

Además de devolver cadenas desde tus rutas y controladores, también puedes devolver arreglos. El framework convertirá automáticamente el arreglo en una respuesta JSON:

```php
Route::get('/', function () {
    return [1, 2, 3];
});
```

::: tip
¿Sabias que también puedes devolver [colecciones de Eloquent](/docs/{{version}}/eloquent-collections) desde tus rutas o controladores? Estas serán convertidas automáticamente a JSON. ¡Inténtalo!
:::

#### Objetos de Respuesta

Típicamente, no sólo estarás devolviendo cadenas básicas o arreglos desde tus acciones de ruta. Además, estarás devolviendo instancias `Illuminate\Http\Response` completas o [vistas](/docs/{{version}}/views).

Devolver una instancia `Response` completa te permite personalizar el código de estado y los encabezados HTTP de la respuesta. Una instancia `Response` hereda desde la clase `Symfony\Component\HttpFoundation\Response`, la cual proporciona una variedad de métodos para construir respuestas HTTP:

```php
Route::get('home', function () {
    return response('Hello World', 200)
                  ->header('Content-Type', 'text/plain');
});
```

<a name="attaching-headers-to-responses"></a>
#### Adjuntando Encabezados a las Respuestas

Ten en cuenta que la mayoría de los métodos de respuestas son encadenables, permitiendo la construcción fluida de instancias de respuesta. Por ejemplo, puedes usar el método `header` para agregar una serie de encabezados para la respuesta antes de enviarla de regreso al usuario:

```php
return response($content)
            ->header('Content-Type', $type)
            ->header('X-Header-One', 'Header Value')
            ->header('X-Header-Two', 'Header Value');
```

O, puedes usar el método `withHeaders` para especificar un arreglo de encabezados para que sean agregados a la respuesta:

```php
return response($content)
            ->withHeaders([
                'Content-Type' => $type,
                'X-Header-One' => 'Header Value',
                'X-Header-Two' => 'Header Value',
            ]);
```

<a name="attaching-cookies-to-responses"></a>
#### Adjuntando Cookies a las Respuestas

El método `cookie` en las instancias de respuesta permite que adjuntes fácilmente cookies a la respuesta. Por ejemplo, puedes usar el método `cookie` para generar una cookie y adjuntarla fluidamente a la instancia de respuesta, de la siguiente manera:

```php
return response($content)
                ->header('Content-Type', $type)
                ->cookie('name', 'value', $minutes);
```

El método `cookie` también acepta unos cuantos argumentos los cuales son usados con menos frecuencia. Generalmente, estos argumentos tienen el mismo propósito y significado que los argumentos que serán dados al método nativo de PHP [setcookie](https://secure.php.net/manual/en/function.setcookie.php):

```php
->cookie($name, $value, $minutes, $path, $domain, $secure, $httpOnly)
```

Alternativamente, puedes usar la clase facade `Cookie` para agregar cookies a la cola y adjuntarlas a la respuesta saliente de tu aplicación. El método `queue` acepta una instancia `Cookie` o los argumentos que se necesitan para crear una instancia `Cookie`. Estas cookies serán adjuntadas a la respuesta saliente antes de que sea enviada al navegador:

```php
Cookie::queue(Cookie::make('name', 'value', $minutes));

Cookie::queue('name', 'value', $minutes);
```

<a name="cookies-and-encryption"></a>
#### Cookies & Encriptación

De forma predeterminada, todos los cookies generados por Laravel son encriptados y firmados de modo que no puedan ser modificados o leídos por el cliente. Si prefieres deshabilitar la encriptación para un subconjunto de cookies generados por tu aplicación, puedes usar la propiedad `$except` del middleware `App\Http\Middleware\EncryptCookies`, el cual es localizado en el directorio `app/Http/Middleware`:

```php
/**
* The names of the cookies that should not be encrypted.
*
* @var array
*/
protected $except = [
    'cookie_name',
];
```

<a name="redirects"></a>
## Redirecciones

Las respuestas redireccionadas son instancias de la clase `Illuminate\Http\RedirectResponse` y contienen los encabezados apropiados que se necesitan para redireccionar al usuario a otra URL. Hay varias formas de generar una instancia `RedirectResponse`. El método más simple es usar el helper global `redirect`:

```php
Route::get('dashboard', function () {
    return redirect('home/dashboard');
});
```

Algunas veces podras querer redireccionar al usuario a su página previa, tal como cuando un formulario enviado no es válido. Puedes hacer eso usando la función helper global `back`. Ya que esta característica utiliza la [sesión](/docs/{{version}}/session), asegurate de que la ruta llamando a la función `back` está usando el grupo de middleware `web` o tiene todos los middleware de sesión aplicados.

```php
Route::post('user/profile', function () {
    // Validate the request...

    return back()->withInput();
});
```

<a name="redirecting-named-routes"></a>
### Redireccionando a Rutas Nombradas

Cuando ejecutas el helper `redirect` sin parámetros, una instancia de `Illuminate\Routing\Redirector` es devuelta, permitiendo que ejecutes cualquier método en la instancia `Redirector`. Por ejemplo, para generar una `RedirectResponse` para una ruta nombrada, puedes usar el método `route`:

```php
return redirect()->route('login');
```

Si tu ruta tiene parámetros, puedes pasarlos como segundo argumento del método `route`:

```php
// For a route with the following URI: profile/{id}

return redirect()->route('profile', ['id' => 1]);
```

#### Rellenando Parámetros a través de Modelos de Eloquent

Si estás redireccionando a una ruta con un parámetro "ID" que está siendo rellenado desde un modelo Eloquent, puedas pasar el modelo como tal. puedes pasar el modelo mismo. El ID será extraído automáticamente:

```php
// For a route with the following URI: profile/{id}

return redirect()->route('profile', [$user]);
```

Si prefieres personalizar el valor que es colocado en el parámetro de la ruta, deberías sobrescribir el método `getRouteKey` en tu modelo Eloquent:

```php
/**
* Get the value of the model's route key.
*
* @return mixed
*/
public function getRouteKey()
{
    return $this->slug;
}
```

<a name="redirecting-controller-actions"></a>
### Redireccionando a Acciones de Controlador

También puedes generar redirecciones a [acciones de controlador](/docs/{{version}}/controllers). Para hacer eso, pasa el controlador y nombre de acción al método `action`. Recuerda, no necesitas especificar el espacio de nombres completo del controlador ya que el `RouteServiceProvider` de Laravel establecerá el espacio de nombres del controlador base:

```php
return redirect()->action('HomeController@index');
```

Si tu ruta de controlador requiere parámetros, puedes pasarlos como segundo argumento del método `action`:

```php
return redirect()->action(
    'UserController@profile', ['id' => 1]
);
```

<a name="redirecting-external-domains"></a>
### Redireccionando a Dominios Externos

Algunas veces puedes necesitar redireccionar a un dominio fuera de tu aplicación. Puedes hacer eso ejecutando el método `away`, el cual crea una instancia de `RedirectResponse` sin alguna codificación, validación o verificación de URL adicional:

```php
return redirect()->away('https://www.google.com');
```

<a name="redirecting-with-flashed-session-data"></a>
### Redireccionando con Datos de Sesión

El redireccionamiento a una nueva URL y [el envío de los datos de la sesión](/docs/{{version}}/session#flash-data) son hechos usualmente al mismo tiempo. Típicamente, esto es hecho después de ejecutar una acción exitosamente cuando mueves rápidamente un mensaje de éxito de la sesión. Por conveniencia, puedes crear una instancia `RedirectResponse` y mover rápidamente los datos de la sesión en un solo encadenamiento de método fluido:

```php
Route::post('user/profile', function () {
    // Update the user's profile...

    return redirect('dashboard')->with('status', 'Profile updated!');
});
```

Después de que el usuario es redireccionado, puedes mostrar el mensaje enviado desde la [sesión](/docs/{{version}}/session). Por ejemplo, usando la [sintaxis de Blade](/docs/{{version}}/blade):

```php
@if (session('status'))
    <div class="alert alert-success">
        {{ session('status') }}
    </div>
@endif
```

<a name="other-response-types"></a>
## Otros Tipos de Respuesta

El helper `response` puede ser usado para generar otros tipos de instancias de respuesta. Cuando el helper `response` es ejecutado sin argumentos, una implementación del [contrato](/docs/{{version}}/contracts) `Illuminate\Contracts\Routing\ResponseFactory` es devuelta. Este contrato proporciona varios métodos útiles para generar respuestas.

<a name="view-responses"></a>
### Respuestas de Vista

Si necesitas control sobre el estado y encabezados de la respuesta pero también necesitas devolver una [vista](/docs/{{version}}/views) como el contenido de la respuesta, deberías usar el método `view`:

```php
return response()
            ->view('hello', $data, 200)
            ->header('Content-Type', $type);
```

Ciertamente, si no necesitas pasar un código de estado HTTP o encabezados personalizados, deberías usar la función helper global `view`.

<a name="json-responses"></a>
### Respuestas JSON

El método `json` establecerá automáticamente el encabezado `Content-Type` a `application/json`, al igual que convertirá el arreglo dado a JSON usando la función de PHP `json_encode`:

```php
return response()->json([
    'name' => 'Abigail',
    'state' => 'CA'
]);
```

Si prefieres crear una respuesta JSONP, puedes usar el método `json` en combinación con el método `withCallback`:

```php
return response()
            ->json(['name' => 'Abigail', 'state' => 'CA'])
            ->withCallback($request->input('callback'));
```

<a name="file-downloads"></a>
### Descargas de Archivo

El método `download` puede ser usado para generar una respuesta que fuerza al navegador del usuario a descargar el archivo a una ruta dada. El método `download` acepta un nombre de archivo como segundo argumento del método, el cual determinará el nombre del archivo que es visto por el usuario que esté descargando el archivo. Finalmente, puedes pasar un arreglo de encabezados HTTP como tercer argumento del método:

```php
return response()->download($pathToFile);

return response()->download($pathToFile, $name, $headers);

return response()->download($pathToFile)->deleteFileAfterSend();
```

::: note
Symfony HttpFoundation, la cual administra las descargas de archivo, requiere que el archivo que esté siendo descargado tenga un nombre de archivo ASCII.
:::

#### Descargas En Streaming

Algunas veces puedes querer convertir la cadena de respuesta de una operación dada a una respuesta descargable sin tener que escribir los contenidos de la operación al disco. Puedes usar el método `streamDownload` en este escenario. Este método acepta un callback, un nombre de archivo y un arreglo opcional de encabezados como argumentos:

```php
return response()->streamDownload(function () {
    echo GitHub::api('repo')
                ->contents()
                ->readme('laravel', 'laravel')['contents'];
}, 'laravel-readme.md');
```

<a name="file-responses"></a>
### Respuestas de Archivo

El método `file` puede ser usado para mostrar un archivo, tal como una imagen o PDF, directamente en el navegador del usuario en lugar de iniciar una descarga. Este método acepta la ruta del archivo como su primer argumento y un arreglo de encabezados como segundo argumento:

```php
return response()->file($pathToFile);

return response()->file($pathToFile, $headers);
```

<a name="response-macros"></a>
## Macros de Respuesta

Si prefieres definir una respuesta personalizada que puedas volver a usar en múltiples rutas y controladores, puedes usar el método `macro` de la clase facade `Response`. Por ejemplo, desde un método `boot` del [proveedor de servicio](/docs/{{version}}/providers)

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Response;

class ResponseMacroServiceProvider extends ServiceProvider
{
    /**
    * Register the application's response macros.
    *
    * @return void
    */
    public function boot()
    {
        Response::macro('caps', function ($value) {
            return Response::make(strtoupper($value));
        });
    }
}
```

La función `macro` acepta un nombre como su primer argumento y una Closure como segundo. La Closure de la macro será ejecutada al momento de ejecutar el nombre de la macro desde una implementación `ResponseFactory` o el helper `response`:

```php
return response()->caps('foo');
```