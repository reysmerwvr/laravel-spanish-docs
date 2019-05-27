::: v-pre

# Sesión HTTP

- [Introducción](#introduction)
    - [Configuración](#configuration)
    - [Prerequisitos de Manejador](#driver-prerequisites)
- [Usando la Sesión](#using-the-session)
    - [Obteniendo Datos](#retrieving-data)
    - [Almacenando Datos](#storing-data)
    - [Datos Instantáneos](#flash-data)
    - [Eliminando Datos](#deleting-data)
    - [Regenerando el ID de la Sesión](#regenerating-the-session-id)
- [Agregando Manejadores de Sesión Personalizada](#adding-custom-session-drivers)
    - [Implementando el Manejador](#implementing-the-driver)
    - [Registrando el Manejador](#registering-the-driver)

<a name="introduction"></a>
## Introducción

Ya que las aplicaciones manejadas por HTTP son sin estado, las sesiones proporcionan una forma de almacenar información sobre el usuario a través de múltiples solicitudes. Laravel viene con una variedad de backends de sesión que son accedidos a través de una expresiva API unificada. El soporte para los backends populares tales como [Memcached](https://memcached.org), [Redis](https://redis.io) y bases de datos es incluido de forma predeterminada.

<a name="configuration"></a>
### Configuración

El archivo de configuración de sesión es almacenado en `config/session.php`. Asegurate de revisar las opciones disponibles para ti en este archivo. De forma predeterminada, Laravel es configurado para usar el manejador de sesión `file`, el cual trabajará bién para muchas aplicaciones. En aplicaciones de producción, puedes considerar usar los manejadores `memcached` o `redis` para incluso alcanzar un desempeño de sesión más rápido.

La opción de configuración `driver` de la sesión define donde los datos de la sesión serán almacenados para cada solicitud. Laravel viene con varios excelentes manejadores de forma predeterminada.

- `file` - las sesiones son almacenadas en `storage/framework/sessions`.
- `cookie` - las sesiones son almacenadas en cookies encriptados seguros.
- `database` - las sesiones son almacenadas en una base de datos relacional.
- `memcached` / `redis` - las sesiones son almacenadas en rápidos almacenes basados en cache.
- `array` - las sesiones son almacenadas en un arreglo de PHP y no serán guardadas de forma permanente.

::: tip
El driver array es usado durante [las pruebas](/docs/{{version}}/testing) y previene que los datos almacenados en la sesión sean guardados de forma permanente.
:::

<a name="driver-prerequisites"></a>
### Prerequisitos del Driver

#### Base de Datos

Al momento de usar el driver de sesión `database`, necesitarás crear una tabla para contener los elementos de la sesión. A continuación se muestra una declaración de `Schema` de ejemplo para la tabla:

```php
Schema::create('sessions', function ($table) {
    $table->string('id')->unique();
    $table->unsignedInteger('user_id')->nullable();
    $table->string('ip_address', 45)->nullable();
    $table->text('user_agent')->nullable();
    $table->text('payload');
    $table->integer('last_activity');
});
```

Puedes usar el comando Artisan `session:table` para generar esta migración:

```php
php artisan session:table

php artisan migrate
```

#### Redis

Antes de usar sesiones Redis con Laravel, necesitarás instalar el paquete `predis/predis` (~1.0) por medio de Composer. Puedes configurar tus conexiones Redis en el archivo de configuración `database`. En el archivo de configuración de `session`, la opción `connection` puede ser usada para especificar cuál conexión Redis es usada por la sesión.

<a name="using-the-session"></a>
## Usando la Sesión

<a name="retrieving-data"></a>
### Obteniendo Datos

Hay dos formás principales de trabajar con datos de sesión en Laravel: el helper global `session` y por medio de una instancia `Request`. Primero, vamos a echar un vistazo al acceder a la sesión por medio de una instancia `Request`, la cual puede ser referenciada en un método de controlador. Recuerda, las dependencias de métodos de controlador son inyectadas automáticamente por medio del [contenedor de servicio](/docs/{{version}}/container) de Laravel:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class UserController extends Controller
{
    /**
    * Show the profile for the given user.
    *
    * @param  Request  $request
    * @param  int  $id
    * @return Response
    */
    public function show(Request $request, $id)
    {
        $value = $request->session()->get('key');

        //
    }
}
```

Cuando obtienes un elemento de la sesión, también puedes pasar un valor predeterminado como segundo argumento del método `get`. Este valor predeterminado será devuelto si la clave especificada no existe en la sesión. Si pasas una `Closure` como el valor predeterminado del método `get` y la clave solicitada no existe, la `Closure` será ejecutada y su resultado devuelto:

```php
$value = $request->session()->get('key', 'default');

$value = $request->session()->get('key', function () {
    return 'default';
});
```

#### Helper Global de Sesión

También puedes usar la función global de PHP `session` para obtener y almacenar datos en la sesión. Cuando el helper `session` es ejecutado con un solo argumento de cadena, devolverá el valor de esa clave de sesión. Cuando el helper es ejecutado con una arreglo de pares clave / valor, esos valores serán almacenados en la sesión:

```php
Route::get('home', function () {
    // Retrieve a piece of data from the session...
    $value = session('key');

    // Specifying a default value...
    $value = session('key', 'default');

    // Store a piece of data in the session...
    session(['key' => 'value']);
});
```

::: tip
Hay una pequeña diferencia práctica entre usar la sesión por medio de una instancia de solicitud HTTP contra usar el helper global `session`. Ambos métodos pueden ser [probados](/docs/{{version}}/testing) por medio del método `assertSessionHas`, el cual está disponible en todos tus casos de prueba.
:::

#### Obteniendo Todos los Datos de Sesión

Si prefieres obtener todos los datos en la sesión, puedes usar el método `all`:

```php
$data = $request->session()->all();
```

#### Determinando si un Elemento Existe en la Sesión

Para determinar si un elemento está presente en la sesión, puedes usar el método `has`. El método `has` devuelve `true` si el valor está presente y no es `null`:

```php
if ($request->session()->has('users')) {
    //
}
```

Para determinar si un elemento está presente en la sesión, incluso si su valor es `null`, puedes usar el método `exists`. El método `exists` devuelve `true` si el valor está presente:

```php
if ($request->session()->exists('users')) {
    //
}
```

<a name="storing-data"></a>
### Almacenando Datos

Para almacenar datos en la sesión, típicamente usarás el método `put` o el helper `session`:

```php
// Via a request instance...
$request->session()->put('key', 'value');

// Via the global helper...
session(['key' => 'value']);
```

#### Agregar a Valores del Arreglo de Sesión

El método `push` puede ser usado para agregar un nuevo valor a un valor de sesión que está en un arreglo. Por ejemplo, si la clave `user.teams` contiene un arreglo de nombres de equipo, puedes agregar un nuevo valor al arreglo de la siguiente forma:

```php
$request->session()->push('user.teams', 'developers');
```

#### Obteniendo & Eliminando un Elemento

El método `pull` obtendrá y eliminará un elemento de la sesión en una sola instrucción:

```php
$value = $request->session()->pull('key', 'default');
```

<a name="flash-data"></a>
### Datos Instantáneos

Algunas veces puedes querer almacenar varios elementos en la sesión para la próxima solicitud. Puedes hacer eso usando el método `flash`. Los datos almacenados en la sesión usando este método solamente estarán disponibles durante la subsecuente solicitud HTTP, y luego serán eliminados. Los datos instantáneos son principalmente útiles para mensajes de estado con vida corta:

```php
$request->session()->flash('status', 'Task was successful!');
```

Si necesitas mantener tus datos instantáneos alrededor para varias solicitudes, puedes usar el método `reflash`, el cuál mantendrá todos los datos instantáneos para una solicitud adicional. Si solamente necesitas mantener datos instantáneos específicos, puedes usar el método `keep`:

```php
$request->session()->reflash();

$request->session()->keep(['username', 'email']);
```

<a name="deleting-data"></a>
### Eliminando Datos

El método `forget` removerá una porción de datos de la sesión. Si prefieres remover todos los datos de la sesión, puedes usar el método `flush`:

```php
// Forget a single key...
$request->session()->forget('key');

// Forget multiple keys...
$request->session()->forget(['key1', 'key2']);

$request->session()->flush();
```

<a name="regenerating-the-session-id"></a>
### Regenerando el ID de la Sesión

Regenerar el ID de la sesión es hecho frecuentemente con el propósito de prevenir que usuarios maliciosos exploten un ataque de [fijación de sesión](https://en.wikipedia.org/wiki/Session_fixation) en tu aplicación.

Laravel regenera automáticamente el ID de la sesión durante la autenticación si estás usando el `LoginController` integrado; sin embargo, si necesitas regenerar manualmente el ID de la sesión, puedes usar el método `regenerate`.

```php
$request->session()->regenerate();
```

<a name="adding-custom-session-drivers"></a>
## Agregando Manejadores de Sesión Personalizados

<a name="implementing-the-driver"></a>
#### Implementando el Manejador

Tu manejador de sesión personalizado debería implementar la interface `SessionHandlerInterface`. Esta interface contiene justo unos cuantos métodos que necesitamos implementar. Una implementación MongoDB truncada luce de forma similar a lo siguiente:

```php
<?php

namespace App\Extensions;

class MongoSessionHandler implements \SessionHandlerInterface
{
    public function open($savePath, $sessionName) {}
    public function close() {}
    public function read($sessionId) {}
    public function write($sessionId, $data) {}
    public function destroy($sessionId) {}
    public function gc($lifetime) {}
}
```

::: tip
Laravel no viene con un directorio para contener tus extensiones. Eres libre de colocarlos en cualquier parte que quieras. En este ejemplo, hemos creado un directorio `Extensions` para alojar el manejador `MongoSessionHandler`.
:::

Ya que el propósito de estos métodos no es entendible rápidamente y sin dificultad, vamos a cubrir rápidamente lo que cada uno de estos métodos hace:

- El método `open` típicamente sería usado en sistemas de almacenamiento de sesión basada en archivo. Ya que Laravel viene con un manejador de sesión `file`, casi nunca necesitarás poner cualquier cosa en este método. Puedes dejarlo como un stub vacío. Es una característica de diseño de interface pobre (lo que discutiremos más tarde) que PHP nos oblige a implementar este método.
- El método `close`, como el método `open`, también puede ser descartado. Para la mayoría de los drivers, no es necesario.
- El método `read` debería devolver la versión de cadena de la sesión de datos asociada con la `$sessionId` dada. No hay necesidad de hacer alguna serialización u otra codificación al momento de obtener o almacenar los datos de la sesión en tu manejador, ya que Laravel ejcutará la serialización por ti.
- El método `write` debería escribir la cadena `$data` asociada dada con la `$sessionId` para algún sistema de almacenamiento persistente, tal como MongoDB, Dynamo, etc. Otra vez, no deberías ejecutar alguna serialización - Laravel ya ha manejado esto por ti.
- El método `destroy` debería remover los datos asociados con la $sessionId` desde el almacenamiento persistente.
- El método `gc` debería destruir todos los datos de la sesión que son más viejos que el `$lifetime` dado, el cual es una marca de tiempo UNIX. Para los sistemas que se auto-expiran como Memcached y Redis, este método puede ser dejado vacío.

<a name="registering-the-driver"></a>
#### Registrando el Manejador

Una vez que tu manejador ha sido implementado, estás listo para registrarlo en el framework. Para agregar manejadores adicionales para el backend de sesión de Laravel, puedes usar el método `extend` del método en la `Session` [facade](/docs/{{version}}/facades). Deberías ejecutar el método `extend` desde el método `boot` de un [proveedor de servicio](/docs/{{version}}/providers). Puedes hacer esto desde el existente `AppServiceProvider` o crear un nuevo proveedor de servicios completo:

```php
<?php

namespace App\Providers;

use App\Extensions\MongoSessionHandler;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\ServiceProvider;

class SessionServiceProvider extends ServiceProvider
{
    /**
    * Perform post-registration booting of services.
    *
    * @return void
    */
    public function boot()
    {
        Session::extend('mongo', function ($app) {
            // Return implementation of SessionHandlerInterface...
            return new MongoSessionHandler;
        });
    }

    /**
    * Register bindings in the container.
    *
    * @return void
    */
    public function register()
    {
        //
    }
}
```

Una vez que el manejador de la sesión ha sido registrado, puedes usar el manejador `mongo` en tu archivo de configuración `config/session.php`.