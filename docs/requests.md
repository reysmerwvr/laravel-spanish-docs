::: v-pre

# Solicitudes HTTP

- [Accediendo a la solicitud](#accessing-the-request)
    - [Ruta y método de la solicitud](#request-path-and-method)
    - [Solicitudes PSR-7](#psr7-requests)
- [Recorte y normalización de entrada](#input-trimming-and-normalization)
- [Obteniendo datos ingresados](#retrieving-input)
    - [Datos antiguos](#old-input)
    - [Cookies](#cookies)
- [Archivos](#files)
    - [Obteniendo archivos cargados](#retrieving-uploaded-files)
    - [Almacenando archivos cargados](#storing-uploaded-files)
- [Configurando proxies de confianza](#configuring-trusted-proxies)

<a name="accessing-the-request"></a>
## Accediendo a la solicitud

Para obtener una instancia de la solicitud HTTP actual por medio de una inyección de dependencia, deberías poner la referencia de la clase `Illuminate\Http\Request` en tu método de controlador. La instancia de la solicitud entrante automáticamente será inyectada por el [contenedor de servicio](/container.html):

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
        $name = $request->input('name');

        //
    }
}
```

#### Inyección de dependencias Y parametros de rutas

Si tu método de controlador también está esperando la entrada de un parámetro de ruta deberías listar tus parámetros de ruta después de tus otras dependencias. Por ejemplo, si tu ruta es definida como sigue:

```php
Route::put('user/{id}', 'UserController@update');
```

Todavía puedes poner la referencia de la clase `Illuminate\Http\Request` y acceder a tu parámetro de ruta `id` al definir tu método de controlador como sigue:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
    * Update the specified user.
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

#### Accediendo la solicitud a través de closures de rutas

También puedes poner la referencia de la clase `Illuminate\Http\Request` en una Closure de ruta. El contenedor de servicio automáticamente inyectará la solicitud entrante dentro de la Closure que es ejecutada:

```php
use Illuminate\Http\Request;

Route::get('/', function (Request $request) {
    //
});
```

<a name="request-path-and-method"></a>
### Ruta y método de la solicitud

La instancia `Illuminate\Http\Request` proporciona una variedad de métodos para examinar la solicitud HTTP para tu aplicación y extiende la clase `Symfony\Component\HttpFoundation\Request`. Discutiremos algunos de los métodos más importantes a continuación.

#### Obteniendo la ruta de la solicitud

El método `path` devuelve la información de ruta de la solicitud. Así, si la solicitud entrante tiene como destino `http://domain.com/foo/bar`, el método `path` devolverá `foo/bar`:

```php
$uri = $request->path();
```

El método `is` te permite verificar que la ruta de la solicitud entrante coincide con un patrón dado. Puedes usar el caracter ` * ` para especificar que cualquier cadena puede coincidir al momento de utilizar este método:

```php
if ($request->is('admin/*')) {
    //
}
```

#### Obteniendo la URL de la solicitud

Para obtener la URL completa de la solicitud entrante puedes usar los métodos `url` o `fullUrl`. El método `url` devolverá la URL sin la cadena de la consulta, mientras que el método `fullUrl` si la incluye:

```php
// Without Query String...
$url = $request->url();

// With Query String...
$url = $request->fullUrl();
```

#### Obteniendo el método de la solicitud

El método `method` devolverá el verbo HTTP de la solicitud. Puedes usar el método `isMethod` para verificar que el verbo HTTP coincida con una cadena dada:

```php
$method = $request->method();

if ($request->isMethod('post')) {
    //
}
```

<a name="psr7-requests"></a>
### Solicitudes PSR-7

El [estándar PSR-7](https://www.php-fig.org/psr/psr-7/) específica interfaces para mensajes HTTP, incluyendo solicitudes y respuestas. Si prefieres obtener una instancia de una solicitud PSR-7 en lugar de una solicitud de Laravel, primero necesitarás instalar algunos paquetes de terceros. Laravel usa el componente *Symfony HTTP Message Bridge* para convertir solicitudes y respuestas típicas de Laravel en implementaciones compatibles con PSR-7:

```php
composer require symfony/psr-http-message-bridge
composer require zendframework/zend-diactoros
```

Una vez que has instalado estos paquetes, puedes obtener una solicitud PSR-7 al colocar la referencia  de la interface de solicitud en tu Closure de ruta o método de controlador:

```php
use Psr\Http\Message\ServerRequestInterface;

Route::get('/', function (ServerRequestInterface $request) {
    //
});
```

::: tip TIP
Si devuelves una instancia de respuesta PSR-7 desde una ruta o controlador, automáticamente será convertida de vuelta a una instancia de respuesta de Laravel y será mostrada por el framework.
:::

<a name="input-trimming-and-normalization"></a>
## Recorte y normalización de entrada

De forma predeterminada, Laravel incluye los middleware `TrimStrings` y `ConvertEmptyStringsToNull` en la pila de middleware global de tu aplicación. Estos middleware son listados en la pila por la clase `App\Http\Kernel`. Estos middleware automáticamente recortarán todos los campos de cadena entrantes en la solicitud, así como convertirán cualquier campo de cadena vacío a `null`. Esto permite que no tengas que preocuparte sobre estos asuntos de normalización en tus rutas y controladores.

Si prefieres deshabilitar este comportamiento, puedes remover los dos middleware de tu pila de middleware de tu aplicación al eliminarlos de la propiedad `$middleware` de tu clase `App\Http\Kernel`.

<a name="retrieving-input"></a>
## Obteniendo datos ingresados

#### Obteniendo todos los datos ingresados

También puedes obtener todos los datos ingresados en forma de arreglo usando el método `all`:

```php
$input = $request->all();
```

#### Obteniendo el valor de un campo

Usando unos pocos métodos básicos, puedes acceder a todos los datos ingresados por el usuario desde la instancia `Illuminate\Http\Request` sin preocuparte por cuál verbo HTTP fue usado por la solicitud. Sin importar el verbo HTTP, el método `input` puede ser usado para obtener la entrada de usuario:

```php
$name = $request->input('name');
```

Puedes pasar un valor predeterminado como segundo argumento del método `input`. Este valor será devuelto si el valor de entrada solicitado no está presente en la solicitud:

```php
$name = $request->input('name', 'Sally');
```

Al momento de trabajar con formularios que contienen arreglos de campos, usa notación de "punto" para acceder a estos arreglos:

```php
$name = $request->input('products.0.name');

$names = $request->input('products.*.name');
```

Puedes llamar al método `input` sin ningún argumento para retornar todos los valores como arreglo asociativo:
	
```php    
$input = $request->input();    
```

#### Obteniendo datos desde la cadena de consulta

Mientras el método `input` obtiene valores de la porción de datos de la solicitud completa (incluyendo la cadena de consulta), el método `query` solamente obtendrá valores de la cadena de consulta:

```php
$name = $request->query('name');
```

Si los datos de los valores de la cadena de consulta solicitada no están presentes, el segundo argumento de este método será devuelto:

```php
$name = $request->query('name', 'Helen');
```

Puedes ejecutar el método `query` sin ningún argumento con el propósito de obtener todos los valores de la cadena de consulta como un arreglo asociativo:

```php
$query = $request->query();
```

#### Recuperando datos por medio de propiedades dinámicas

También puedes acceder a los datos ingresados por el usuario usando propiedades dinámicas en la instancia `Illuminate\Http\Request`. Por ejemplo, si uno de los formularios de tu aplicación contiene un campo `name`, puedes acceder al valor del campo de la siguiente forma:

```php
$name = $request->name;
```

Al momento de usar propiedades dinámicas, Laravel primero buscará por el valor del parámetro en la porción de datos de la solicitud. Si no está presente, buscará el campo en los parámetros de ruta.

#### Obteniendo valores JSON

Al momento de enviar solicitudes JSON a tu aplicación, puedes acceder a los datos JSON por medio del método `input` al tiempo que el encabezado `Content-Type` de la solicitud sea establecido apropiadamente a `application/json`. Incluso puedes usar sintaxis "." para buscar adentro de los arreglos JSON:

```php
$name = $request->input('user.name');
```

#### Obteniendo una porción de los datos ingresados

Si necesitas obtener un subconjunto de los datos ingresados, puedes usar los métodos `only` y `except`. Ambos métodos aceptan un solo arreglo o una lista dinámica de argumentos:

```php
$input = $request->only(['username', 'password']);

$input = $request->only('username', 'password');

$input = $request->except(['credit_card']);

$input = $request->except('credit_card');
```

::: tip TIP
El método `only` devuelve todos los pares clave / valor que solicites; sin embargo, no devolverá pares clave / valor que no estén presentes en la solicitud.
:::

#### Determinando si un Valor ingresado está presente

Deberías usar el método `has` para determinar si un valor está presente en la solicitud. El método `has` devuelve `true` si el valor está presente en la solicitud:

```php
if ($request->has('name')) {
    //
}
```

Cuando es dado un arreglo, el método `has` determinará si todos los valores especificados están presentes:

```php
if ($request->has(['name', 'email'])) {
    //
}
```

Si prefieres determinar si un valor está presente en la solicitud y no esté vacío, puedes usar el método `filled`:

```php
if ($request->filled('name')) {
    //
}
```

<a name="old-input"></a>
### Entrada antigua

Laravel permite que mantengas los datos de una solicitud durante la próxima solicitud. Esta característica es útil particularmente para volver a llenar los formularios después de detectar errores de validación. Sin embargo, si estás usando las [características de validación](/validation.html) incluidas con Laravel, es poco probable que necesites usar manualmente estos métodos, ya que algunas de las facilidades de validación integradas con Laravel las ejecutarán automáticamente.

#### Enviando datos a la sesión

El método `flash` en la clase `Illuminate\Http\Request` enviará los datos ingresados a la [sesión](/session.html) para que así estén disponibles durante la próxima solicitud realizada por el usuario:

```php
$request->flash();
```

También puedes usar los métodos `flashOnly` y `flashExcept` para enviar un subconjunto de datos de la solicitud a la sesión. Estos métodos son útiles para mantener información sensible tales como contraseñas fuera de la sesión:

```php
$request->flashOnly(['username', 'email']);

$request->flashExcept('password');
```

#### Enviando datos y redirigir

Ya que con frecuencia querrás enviar datos a la sesión y luego redirigir a la página anterior puedes encadenar datos a una redirección usando el método `withInput`:

```php
return redirect('form')->withInput();

return redirect('form')->withInput(
    $request->except('password')
);
```

#### Obteniendo datos antiguos

Para obtener los datos de la sesión anterior, usa el método `old` en la instancia `Request`. El método old extrarerá los datos de la solicitiud y [sesión](/session.html) anterior:

```php
$username = $request->old('username');
```

Laravel también proporciona un helper global `old`. Si estás mostrando datos antiguos dentro de una [plantilla Blade](/blade.html), es más conveniente usar el helper `old`. Si no existen datos antiguos para el campo dado, será devuelto `null`:

```php
<input type="text" name="username" value="{{ old('username') }}">
```

<a name="cookies"></a>
### Cookies

#### Obteniendo cookies de las solicitudes

Todos las cookies creados por el framework Laravel son encriptadas y firmadas con un código de autenticación, significa que serán consideradas no válidas si han sido cambiados por el cliente. Para obtener el valor de una cookie de la solicitud, usa el método `cookie` en una instancia de `Illuminate\Http\Request`:

```php
$value = $request->cookie('name');
```

Alternativamente, puedes usar la clase facade `Cookie` para acceder a los valores de las cookies:

```php
use Illuminate\Support\Facades\Cookie;

$value = Cookie::get('name');
```

#### Adjuntando cokies a las respuestas

Puedes adjuntar una cookie a una instancia saliente de `Illuminate\Http\Response` usando el método `cookie`. Debes pasar el nombre, valor y el número de minutos en los cuales dicha cookie debería ser válida:

```php
return response('Hello World')->cookie(
    'name', 'value', $minutes
);
```

El método `cookie` también acepta unos cuantos argumentos los cuales son usados con menos frecuencia. Generalmente, estos argumentos tienen el mismo propósito y significan lo mismo que los argumentos que deberían ser dados al método [setcookie](https://secure.php.net/manual/en/function.setcookie.php) nativo de PHP:

```php
return response('Hello World')->cookie(
    'name', 'value', $minutes, $path, $domain, $secure, $httpOnly
);
```

Alternativamente, puedes usar la clase facade `Cookie` para "encolar" cookies para adjuntar a la respuesta saliente de tu aplicación. El método `queue` acepta una instancia `Cookie` o los argumentos necesarios para crear una instancia `Cookie`. Estas cookies serán adjuntadas a la respuesta saliente antes de que sea enviada al navegador:

```php
Cookie::queue(Cookie::make('name', 'value', $minutes));

Cookie::queue('name', 'value', $minutes);
```

#### Generando instancias cookie

Si prefieres generar una instancia `Symfony\Component\HttpFoundation\Cookie` que pueda ser dada a una instancia de respuesta en un momento posterior, puedes usar el helper global `cookie`. Este cookie no será enviado de regreso al cliente a menos que sea adjuntado a una instancia de respuesta:

```php
$cookie = cookie('name', 'value', $minutes);

return response('Hello World')->cookie($cookie);
```

<a name="files"></a>
## Archivos

<a name="retrieving-uploaded-files"></a>
### Obteniendo archivos cargados

Puedes acceder los archivos cargados de una instancia `Illuminate\Http\Request` usando el método `file` o usando propiedades dinámicas. El método `file` devuelve una instancia de la clase `Illuminate\Http\UploadedFile`, la cual extiende la clase `SplFileInfo` de PHP y proporciona una variedad de métodos para interactuar con el archivo:

```php
$file = $request->file('photo');

$file = $request->photo;
```

Puedes determinar si un archivo está presente en la solicitud usando el método `hasFile`:

```php
if ($request->hasFile('photo')) {
    //
}
```

#### Validando cargas exitosas

Además de verficar si el archivo está presente, puedes verificar que no ocurrieron problemas cargando el archivo por medio del método `isValid`:

```php
if ($request->file('photo')->isValid()) {
    //
}
```

#### Rutas y extensiones de archivo

La clase `UploadedFile` también contiene métodos para acceder a la ruta completa del archivo y su extensión. El método `extension` intentará adivinar la extensión del archivo en base a su contenido. Esta extensión puede ser diferente de la extensión que fue suministrada por el cliente:

```php
$path = $request->photo->path();

$extension = $request->photo->extension();
```

#### Otros métodos de archivo

Hay una variedad de otros métodos disponibles en instancias `UploadedFile`. Revisa la [documentación de la API para la clase](https://api.symfony.com/3.0/Symfony/Component/HttpFoundation/File/UploadedFile.html) para más información concerniente a estos métodos.

<a name="storing-uploaded-files"></a>
### Almacenando archivos cargados

Para almacenar un archivo cargado, típicamente usarás uno de tus [sistemas de archivos](/filesystem.html) configurados. La clase `UploadedFile` tiene un método `store` el cual moverá un archivo cargado a uno de tus discos, el cual puede ser una ubicación de tu sistema de archivo local o incluso una ubicación de almacenamiento en la nube como Amazon S3.

El método `store` acepta la ruta dónde el archivo debería ser almacenado relativa al directorio raíz configurado del sistema de archivo. Esta ruta no debería contener un nombre de archivo, ya que un ID único será generado automáticamente para servir como el nombre del archivo.

El método `store` acepta un segundo argumento opcional para el nombre del disco que debería ser usado para almacenar el archivo. El método devolverá la ruta relativa del archivo al directorio raíz del disco:

```php
$path = $request->photo->store('images');

$path = $request->photo->store('images', 's3');
```

Si no quieres que un nombre de archivo sea generado automáticamente, puedes usar el método `storeAs`, el cual acepta la ruta, el nombre de archivo y el nombre del disco como sus argumentos:

```php
$path = $request->photo->storeAs('images', 'filename.jpg');

$path = $request->photo->storeAs('images', 'filename.jpg', 's3');
```

<a name="configuring-trusted-proxies"></a>
## Configurando proxies de confianza

Al momento de administrar tus aplicaciones detrás de un balanceador de carga que finaliza los certificados TLS / SSL, puedes notar que algunas veces tu aplicación no genera enlaces HTTPS. Típicamente esto es debido a que el tráfico de tu aplicación está siendo dirigido desde tu balanceador de carga por el puerto 80 y no sabe que debería generar enlaces seguros.

Para solucionar esto, puedes usar el middleware `App\Http\Middleware\TrustProxies` que es incluido en tu aplicación de Laravel, el cual permite que rápidamente personalices los balanceadores de carga o proxies que deberían ser de confianza en tu aplicación. Tus proxies de confianza deberían ser listados como un arreglo en la propiedad `$proxies` de este middleware. Además de la configuración de los proxies de confianza, puedes configurar los encabezados que están siendo enviados por tu proxy con información sobre la solicitud original:

```php
<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Fideloper\Proxy\TrustProxies as Middleware;

class TrustProxies extends Middleware
{
    /**
    * The trusted proxies for this application.
    *
    * @var array
    */
    protected $proxies = [
        '192.168.1.1',
        '192.168.1.2',
    ];

    /**
    * The headers that should be used to detect proxies.
    *
    * @var string
    */
    protected $headers = Request::HEADER_X_FORWARDED_ALL;
}
```

::: tip TIP
Si estás usando Balanceo de Carga Elástico AWS, tu valor `$headers` debe ser `Request::HEADER_X_FORWARDED_AWS_ELB`. Para más información de las constantes que pueden ser usadas en la propiedad `$headers`, revisa la documentación de Symfony sobre [proxies de confianza](https://symfony.com/doc/current/deployment/proxies.html).
:::

#### Confiar en todos los proxies

Si estás usando Amazon AWS u otro proveedor de balanceador de carga de la "nube", no puedes saber las direcciones IP de tus balanceadores reales. En este caso, puedes usar `**` para confiar en todos los proxies:

```php
/**
* The trusted proxies for this application.
*
* @var array
*/
protected $proxies = '**';
```