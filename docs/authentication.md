::: v-pre

# Autenticación

- [Introducción](#introduction)
    - [Consideraciones De La Base De Datos](#introduction-database-considerations)
- [Inicio Rápido De Autenticación](#authentication-quickstart)
    - [Enrutamiento](#included-routing)
    - [Vistas](#included-views)
    - [Autenticando](#included-authenticating)
    - [Recuperando El Usuario Autenticado](#retrieving-the-authenticated-user)
    - [Proteger Rutas](#protecting-routes)
    - [Regulación De Inicio De Sesión](#login-throttling)
- [Autenticar Usuarios Manualmente](#authenticating-users)
    - [Recordar Usuarios](#remembering-users)
    - [Otros Métodos De Autenticación](#other-authentication-methods)
- [Autenticación HTTP Básica](#http-basic-authentication)
    - [Autenticación HTTP Básica Sin Estado](#stateless-http-basic-authentication)
- [Cerrar Sesión](#logging-out)
    - [Invalidar Sesiones En Otros Dispositivos](#invalidating-sessions-on-other-devices)    
- [Autenticar Con Redes Sociales](https://github.com/laravel/socialite)
- [Agregar Guards Personalizados](#adding-custom-guards)
    - [Guards De Closures De Peticiones](#closure-request-guards)
- [Agregar User Providers Personalizados](#adding-custom-user-providers)
    - [La Interfaz UserProvider](#the-user-provider-contract)
    - [La Interfaz Authenticatable](#the-authenticatable-contract)
- [Eventos](#events)

<a name="introduction"></a>
## Introducción

::: tip
**¿Quieres comenzar rápido?** Simplemente ejecuta `php artisan make:auth` y `php artisan migrate` en una nueva aplicación de Laravel. Luego, dirigete en tu navegador a `http://tu-app.test/register` o cualquier otra URL asignada a tu aplicación. ¡Estos dos comandos se encargarán de generar todo el sistema de autenticación!
:::

Laravel hace la implementación de la autenticación algo muy sencillo. De hecho, casi todo se configura para ti por defecto. El archivo de configuración de la autenticación está localizado en `config/auth.php`, el cual contiene varias opciones bien documentadas para ajustar el comportmiento de los servicios de autenticación.

En esencia, las características de la autenticación de Laravel están compuestas de "guards" (guardias) y "providers" (proveedores). Los Guards definen cómo los usuarios son autenticados para cada petición. Por ejemplo, Laravel contiene un guard `session` el cual mantiene el estado utilizando el almacenamiento de sesión y las cookies.

Los proveedores definen cómo se retornan los usuarios de tu almacenamiento persistente. Laravel cuenta con soporte para recuperar los usuarios utilizando Eloquent y el constructor de consultas de la base de datos. Sin embargo, eres libre de definir los proveedores adicionales que requiera tu aplicación.

¡No te preocupes si esto suena confuso por el momento! Muchas aplicaciones nunca necesitarán modificar la configuración predeterminada de la autenticación.

<a name="introduction-database-considerations"></a>
### Consideraciones De La Base De Datos

De manera predeterminada, Laravel incluye un [Modelo de Eloquent](/docs/{{version}}/eloquent) `App\User` en tu directorio `app`. Este modelo puede ser utilizado por el controlador de autenticación predeterminado de Eloquent. Si tu aplicación no utiliza Eloquent, deberás utilizar el controlador de autenticación `database` el cual utiliza el constructor de consultas (query builder) de Laravel.

Al crear el esquema de la base de datos para el modelo `App\User`, asegurate de que la columna password sea de al menos 60 caracteres de longitud. Mantener una longitud de columna de cadena predeterminada a 255 caracteres sería una buena opción.

Además, debes verificar que tu tabla `users` (o equivalente) contenga un campo nulo, de tipo cadena llamado `remember_token` de 100 caracteres. Esta columna se usará para almacenar un token para los usuarios que seleccionen la opción "remember me" (recuérdame) cuando inicien sesión en tu aplicación.

<a name="authentication-quickstart"></a>
## Inicio Rápido De Autenticación

Laravel viene con varios controladores de autenticación preconstruidos, los cuales están localizados en el nombre de espacio `App\Http\Controllers\Auth`. `RegisterController` maneja el registro de usuarios nuevos, `LoginController` maneja la autenticación, `ForgotPasswordController` maneja el envío de correos electrónicos para restablecer la contraseña y el `ResetPasswordController` contiene la lógica para reiniciar contraseñas. Cada uno de estos controladores utiliza un trait para incluir los métodos necesarios. En la mayoría de los casos no tendrás que modificar estos controladores en lo absoluto.

<a name="included-routing"></a>
### Enrutamiento

Laravel proporciona una manera rápida de generar todas las rutas y vistas que necesitas para la autenticación con un simple comando:

```php
php artisan make:auth
```

Este comando debe ser utilizado en aplicaciones nuevas e instalará vistas de diseño, registro e inicio de sesión, así como todas las rutas necesarias para la autenticación. También será generado un `HomeController` que se encargará de manejar las peticiones posteriores al login, como mostrar el dashboard de la aplicación.

::: tip
Si tu aplicación no necesita registro, puedes desactivarlo eliminando el recién creado `RegisterController` y modificando tu declaración de ruta: `Auth::routes(['register' => false]);`.
:::

<a name="included-views"></a>
### Vistas

Como se mencionó en la sección anterior, el comando `php artisan make:auth` creará todas las vistas que se necesiten para la autenticación y las colocará en el directorio `resources/views/auth`.

El comando `make:auth` también creará el directorio `resources/views/layouts`, el cual contendrá la plantilla base para tu aplicación. Todas estas vistas usan el framework de CSS Bootstrap, pero eres libre de modificarlo en base a tus preferencias.

<a name="included-authenticating"></a>
### Autenticación

Ahora que ya tienes tus rutas y vistas configuradas para los controladores de autenticación incluidos con el framework, ¡estás listo para registrar y autenticar usuarios nuevos para tu aplicación! Puedes acceder a tu aplicación en el navegador ya que los controladores de autenticación contienen la lógica (a través de traits) para autenticar usuarios existentes y almacenar usuarios nuevos en la base de datos.

#### Personalizar Rutas

Cuando un usuario se ha autenticado exitosamente, será redirigido a la URI `/home`. Puedes personalizar la ubicación de redireccionamiento post-autenticación definiendo una propiedad `redirectTo` en `LoginController`, `RegisterController`, `ResetPasswordController` y `VerificationController`:

```php
protected $redirectTo = '/';
```

Luego, debes modificar el método `handle` del middleware `RedirectIfAuthenticated` para usar tu nueva URI al redirigir al usuario.

Si la ruta de redireccionamiento necesita generar lógica personalizada puedes definir un método `redirectTo` en lugar de una propiedad `redirectTo`:

```php
protected function redirectTo()
{
    return '/path';
}
```

::: tip
El método `redirectTo` toma precedencia sobre el atributo `redirectTo`.
:::

#### Personalizar Usuario

Por defecto, Laravel utiliza el campo `email` para la autenticación. Si deseas modificar esto, puedes definir un método `username` en `LoginController`:

```php
public function username()
{
    return 'username';
}
```

#### Personalizar Guard

También puedes personalizar el "guard" que es utilizado para autenticar y registrar usuarios. Para empezar, define un método `guard` en `LoginController`, `RegisterController` y `ResetPasswordController`. Este método debe devolver una instancia de guard:

```php
use Illuminate\Support\Facades\Auth;

protected function guard()
{
    return Auth::guard('guard-name');
}
```

#### Validación / Personalizar Almacenamiento

Para modificar los campos del formulario que son requeridos cuando se registren usuarios nuevos en tu aplicación, o para personalizar cómo los nuevos usuarios son almacenados en tu base de datos, puedes modificar la clase `RegisterController`. Esta clase es responsable de validar y crear usuarios nuevos en tu aplicación.

El método `validator` de `RegisterController` contiene las reglas de validación para los usuarios nuevos de tu aplicación. Eres libre de modificar este metodo según te convenga.

El método `create` de `RegisterController` es responsable de crear registros nuevos de `App\User` en tu base de datos usando el [ORM Eloquent](/docs/{{version}}/eloquent). Eres libre de modificar este método de acuerdo a las necesidades de tu base de datos.

<a name="retrieving-the-authenticated-user"></a>
### Recuperando El Usuario Autenticado

Puedes acceder al usuario autenticado por medio del facade `Auth`:

```php
use Illuminate\Support\Facades\Auth;

// Get the currently authenticated user...
$user = Auth::user();

// Get the currently authenticated user's ID...
$id = Auth::id();
```

Alternativamente, una vez que el usuario haya sido autenticado, puedes aceder al usuario autenticado mediante una instancia de `Illuminate\Http\Request`. Recuerda que las clases a las cuales se le declaren el tipo serán inyectadas automáticamente en los métodos de tu controlador:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
        * Update the user's profile.
        *
        * @param  Request  $request
        * @return Response
        */
    public function update(Request $request)
    {
        // $request->user() returns an instance of the authenticated user...
    }
}
```

#### Determinar Si El Usuario Actual Está Autenticado

Para determinar si el usuario actual está loggeado en tu aplicación, puedes usar el método `check` del facade `Auth`, el cual devolverá `true` si el usuario está autenticado:

```php
use Illuminate\Support\Facades\Auth;

if (Auth::check()) {
    // The user is logged in...
}
```

::: tip
Aún cuando es posible determinar si un usuario está autenticado utilizando el método `check`, típicamente deberás usar un middleware para verificar que el usuario está autenticado antes de permitir al usuario acceder a ciertas rutas / controladores. Para aprender más acerca de esto, echa un vistazo a la documentación para [proteger rutas](/docs/{{version}}/authentication#protecting-routes).
:::

<a name="protecting-routes"></a>
### Proteger Rutas

Puedes utilizar [middleware de rutas](/docs/{{version}}/middleware) para permitir acceder a ciertas rutas a los usuarios autenticados. Laravel incluye un middleware `auth`, el cual está definido en `Illuminate\Auth\Middleware\Authenticate`. Ya que este middleware está registrado en tu kernel HTTP, todo lo que necesitas hacer es adjuntar el middleware a la definición de la ruta:

```php
Route::get('profile', function () {
    // Only authenticated users may enter...
})->middleware('auth');
```

Si estás utilizando [controladores](/docs/{{version}}/controllers), puedes hacer una llamada al método `middleware` desde el constructor de tu controlador en lugar de adjuntarlo a la definición de la ruta:

```php
public function __construct()
{
    $this->middleware('auth');
}
```

#### Redireccionar Usuarios No Autenticados

Cuando el middleware `auth` detecta un usuario no autorizado, redirigirá al usuario a la [ruta nombrada](/docs/{{version}}/routing#named-routes) `login`. Puedes modificar este comportamiento actualizando la función `redirectTo` en tu archivo `app/Http/Middleware/Authenticate.php`:

```php
/**
* Get the path the user should be redirected to.
*
* @param  \Illuminate\Http\Request  $request
* @return string
*/
protected function redirectTo($request)
{
    return route('login');
}
```

#### Especificar Un Guard

Cuando adjuntes el middleware `auth` a una ruta, también puedes especificar cual guard deberá ser utilizado para autenticar al usuario. El guard especificado deberá corresponder a una de las llaves en el arreglo `guards` del archivo de configuración `auth.php`:

```php
public function __construct()
{
    $this->middleware('auth:api');
}
```

<a name="login-throttling"></a>
### Regulación De Inicio De Sesión

Si estás utilizando la clase `LoginController` incorporada en Laravel, el trait `Illuminate\Foundation\Auth\ThrottlesLogins` se encontrará incluído en tu controlador. De manera predeterminada, el usuario no será capaz de iniciar sesión durante un minuto si falla al proveer las credenciales correctas después de varios intentos. El regulador (o throttle) es único para el nombre de usuario / dirección de correo electrónico del usuario y su dirección IP.

<a name="authenticating-users"></a>
## Autenticar Usuarios Manualmente

Nota que no estás obligado a utilizar los controladores de autenticación incluidos en Laravel. Si deseas eliminar estos controladores, tendrás que encargarte de administrar la autenticación de usuarios utilizando las clases de autenticación de Laravel directamente. No te preocupes, ¡es algo sencillo!.

Vamos a acceder a los servicios de autenticación de Laravel por medio del [facade](/docs/{{version}}/facades), así que hay que asegurarnos de importar el facade `Auth` al inicio de la clase. Después, veamos el método `attempt`:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    /**
    * Handle an authentication attempt.
    *
    * @param  \Illuminate\Http\Request $request
    *
    * @return Response
    */
    public function authenticate(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {
            // Authentication passed...
            return redirect()->intended('dashboard');
        }
    }
}
```

El método `attempt` acepta un arreglo de pares llave / valor como primer argumento. Los valores en el arreglo serán utilizados para encontrar el usuario en la tabla de tu base de datos. Así que, en el ejemplo anterior, el usuario se obtiene por el valor de la columna `email`. Si se encuentra el usuario, la contraseña encriptada obtenida de la base de datos será comparada con el valor `password` pasado al método en el arreglo. No debes encriptar la contraseña especificada para el valor `password`, ya que el framework automáticamente va a encriptarlo antes de compararlo con la contraseña almacenada en la base de datos. Si dos contraseñas encriptadas coinciden, se iniciará una sesión autenticada para el usuario.

El método `attempt` va a devolver `true` si la autenticación fue exitosa. De otra forma, devolverá `false`.

El método `intended` del redireccionador va a redirigir al usuario a la URL que intentaba acceder antes de ser interceptado por el middleware de autenticación. Una URI de fallback puede ser proporcionada al método en caso de que el destino solicitado no esté disponible.

#### Especificar Condiciones Adicionales

Si lo deseas, puedes agregar condiciones extras a la consulta de autenticación además del correo electrónico del usuario y su contraseña. Por ejemplo, podemos verificar que un usuario esté marcado como "active":

```php
if (Auth::attempt(['email' => $email, 'password' => $password, 'active' => 1])) {
    // The user is active, not suspended, and exists.
}
```

> {nota} En estos ejemplos, `email` no es una opción requerida, solamente es utilizado como ejemplo. Debes utilizar cualquier columna que corresponda a "username" en tu base de datos.

#### Acceso A Instancias Específicas De Guard

Puedes especificar que instancia de guard deseas usar utilizando el método `guard` en el facade `Auth`. Esto te permitirá administrar la autentincación para partes separadas de tu aplicación utilizando modelos autenticables o tablas de usuarios independientes.

El nombre del guard pasado al método `guard` deberá corresponder a uno de los guards configurados en tu archivo de configuración `auth.php`:

```php
if (Auth::guard('admin')->attempt($credentials)) {
    //
}
```

#### Cerrar Sesión

Para desconectar usuarios de tu aplicación, debes utilizar el método `logout` del facade `Auth`. Esto va a borrar la información de autenticación en la sesión del usuario:

    Auth::logout();

<a name="remembering-users"></a>
### Recordar Usuarios

Si desea proporcionar la funcionalidad de "recordarme" en tu aplicación, puedes pasar un valor booleano como segundo argumento al método `attempt`, que mantendrá al usuario autenticado indefinidamente, o hasta que cierre su sesión manualmente. Tu tabla `users` deberá incluir una columna de tipo string llamada `remember_token`, que será utilizada para almacenar el token de "recordarme".

```php
if (Auth::attempt(['email' => $email, 'password' => $password], $remember)) {
    // The user is being remembered...
}
```

::: tip
Si estás utilizando el `LoginController` integrado en tu instalación de Laravel, la lógica apropiada para "recordar" usuarios ya se encontrará implementada por los traits utilizados por el controlador.
:::

Si estás "recordando" usuarios, puedes utilizar el método `viaRemember` para determinar si el usuario se ha autenticado utilizando la cookie "recordarme":

```php
if (Auth::viaRemember()) {
    //
}
```

<a name="other-authentication-methods"></a>
### Otros Métodos De Autenticación

#### Autenticar Una Instancia De Usuario

Si necesitas registrar una instancia de usuario existente en tu aplicación, puedes llamar al método `login` con la instancia de usuario. El objeto proporcionado deberá ser una implementación de la [interfaz](/docs/{{version}}/contracts) `Illuminate\Contracts\Auth\Authenticatable`. El modelo `App\User` incluido en Laravel ya implementa esta interfaz:

```php
Auth::login($user);

// Login and "remember" the given user...
Auth::login($user, true);
```

Puedes especificar la instancia de guard que desees utilizar:

```php
Auth::guard('admin')->login($user);
```

#### Autenticar Un Usuario Por ID

Para autenticar un usuario en tu aplicación por su ID, debes usar el método `loginUsingId`. Este método acepta la clave primaria del usuario que deseas autenticar:

```php
Auth::loginUsingId(1);

// Login and "remember" the given user...
Auth::loginUsingId(1, true);
```

#### Autenticar Un Usuario Una Vez

Puedes utilizar el método `once` para autenticar un usuario en tu aplicación para una única solicitud. No se utilizarán sesiones o cookies, lo que significa que este método puede ser bastante útil al construir una API sin estado:

```php
if (Auth::once($credentials)) {
    //
}
```

<a name="http-basic-authentication"></a>
## Autenticación HTTP Básica

La [Autenticación HTTP Básica](https://en.wikipedia.org/wiki/Basic_access_authentication) proporciona una manera rápida de autenticar usuarios en tu aplicación sin configurar una página de "login" dedicada. Para iniciar, adjunta el [middleware](/docs/{{version}}/middleware) `auth.basic` a tu ruta. El middleware `auth.basic` está incluido en el framework de Laravel, por lo que no hay necesidad de definirlo:

```php
Route::get('profile', function () {
    // Only authenticated users may enter...
})->middleware('auth.basic');
```

Una vez que el middleware haya sido adjuntado a la ruta, se preguntará automáticamente por las credenciales al acceder a la ruta desde tu navegador. Por defecto, el middleware `auth.basic` va a usar la columna `email` en el registro del usuario como "nombre de usuario".

#### Una Nota Sobre FastCGI

Si estás usando PHP FastCGI, la Autentincación Básica HTTP podría no funcionar correctamente por defecto. Las siguientes líneas deberán ser agregadas a tu archivo `.htaccess`:

```php
RewriteCond %{HTTP:Authorization} ^(.+)$
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
```

<a name="stateless-http-basic-authentication"></a>
### Autenticación HTTP Básica Sin Estado

También puedes utilizar la Autenticación HTTP Básica sin establecer una cookie de identificación en la sesión, esto es particularmente útil para la autenticacíon API. Para hacer esto [define un middleware](/docs/{{version}}/middleware) que llame al método `onceBasic`. Si el método no devuelve ninguna respuesta, la petición puede pasarse a la aplicación:

```php
<?php

namespace App\Http\Middleware;

use Illuminate\Support\Facades\Auth;

class AuthenticateOnceWithBasicAuth
{
    /**
    * Handle an incoming request.
    *
    * @param  \Illuminate\Http\Request  $request
    * @param  \Closure  $next
    * @return mixed
    */
    public function handle($request, $next)
    {
        return Auth::onceBasic() ?: $next($request);
    }

}
```

A continuación [registra el middleware de ruta](/docs/{{version}}/middleware#registering-middleware) y adjúntalo a la ruta:

```php
Route::get('api/user', function () {
    // Only authenticated users may enter...
})->middleware('auth.basic.once');
```

<a name="logging-out"></a>
## Logging Out

Para manualmente cerrar la sesión de un usuario en tu aplicación, puedes usar el método `logout` en el facade `Auth`. Esto limpiará la información de autenticación en la sesión del usuario:

```php
use Illuminate\Support\Facades\Auth;

Auth::logout();
```

<a name="invalidating-sessions-on-other-devices"></a>
### Invalidando Sesiones En Otros Dispositivos

Laravel también proporciona un mecanismo para invalidar y "sacar" las sesiones de un usuario que están activas en otros dispositivos sin invalidar la sesión en el dispositivo actual. Antes de comenzar, debes asegurarte de que el middleware `Illuminate\Session\Middleware\AuthenticateSession` está presente y no está comentado en tu clase `app/Http/Kernel.php` del grupo de middleware `web`:

```php
'web' => [
    // ...
    \Illuminate\Session\Middleware\AuthenticateSession::class,
    // ...
]
```

Luego, puedes usar el método `logoutOtherDevices` en el facade `Auth`. Este método requiere que el usuario proporcione su contraseña actual, que tu aplicación debe aceptar mediante un campo de formulario:

```php
use Illuminate\Support\Facades\Auth;

Auth::logoutOtherDevices($password);
```

::: danger Nota 
Cuando el método `logoutOtherDevices` es invocado, las otras sesiones del usuario serán invalidadas completamente, lo que quiere decir que serán "sacadas" de todos los guards en los que previamente estaban autenticadas.
:::

<a name="adding-custom-guards"></a>
## Agregar Guards Personalizados

Puedes definir tu propio guard de autenticación utilizando el método `extend` en el facade `Auth`. Debes colocar la llamada a este método `extend` en el [proveedor de servicios](/docs/{{version}}/providers). Ya que Laravel cuenta con un `AuthServiceProvider`, puedes colocar el código en ese proveedor:

```php
<?php

namespace App\Providers;

use App\Services\Auth\JwtGuard;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
    * Register any application authentication / authorization services.
    *
    * @return void
    */
    public function boot()
    {
        $this->registerPolicies();

        Auth::extend('jwt', function ($app, $name, array $config) {
            // Return an instance of Illuminate\Contracts\Auth\Guard...

            return new JwtGuard(Auth::createUserProvider($config['provider']));
        });
    }
}
```

Como puedes ver en el ejemplo anterior, el callback pasado al método `extend` deberá retornar una implementación de `Illuminate\Contracts\Auth\Guard`. Esta interfaz contiene algunos métodos que tendrás que implementar para definir un guard personalizado. Una vez que tu guard personalizado haya sido definido, podrás utilizar este guard en la configuración `guards` de tu archivo de configuración `auth.php`:

```php
'guards' => [
    'api' => [
        'driver' => 'jwt',
        'provider' => 'users',
    ],
],
```

<a name="closure-request-guards"></a>
### Guards De Closures De Peticiones

La forma más sencilla de implementar un sistema de autenticación basado en peticiones HTTP es usando el método `Auth:viaRequest`. Este método te permite definir rápidamente tu proceso de autenticación usando sólo un Closure.

Para comenzar, llama al método `Auth::viaRequest` dentro del método `boot` de tu `AuthServiceProvider`. El método `viaRequest` acepta el nombre de un driver de autenticación como su primer argumento. Este nombre puede ser cualquier cadena que describa tu guard personalizado. El segundo argumento pasado al método método debe ser un Closure que reciba la petición HTTP entrante y retorne una instancia de usuario o, si la autenticación falla, `null`:

```php
use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
* Register any application authentication / authorization services.
*
* @return void
*/
public function boot()
{
    $this->registerPolicies();

    Auth::viaRequest('custom-token', function ($request) {
        return User::where('token', $request->token)->first();
    });
}
```

Una vez que tu driver de autenticación personalizado ha sido definido, usalo como un driver dentro de la configuración de `guards` de tu archivo de configuración `auth.php`:

```php
'guards' => [
    'api' => [
        'driver' => 'custom-token',
    ],
],
```

<a name="adding-custom-user-providers"></a>
## Agregar User Providers Personalizados

Si no estás utilizando una base de datos relacional tradicional para almacenar a tus usuarios, deberás extender Laravel con tu propio proveedor de autenticación. Usaremos el método `provider` en el facade `Auth` para definir un proveedor de usuarios personalizado:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Auth;
use App\Extensions\RiakUserProvider;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
    * Register any application authentication / authorization services.
    *
    * @return void
    */
    public function boot()
    {
        $this->registerPolicies();

        Auth::provider('riak', function ($app, array $config) {
            // Return an instance of Illuminate\Contracts\Auth\UserProvider...

            return new RiakUserProvider($app->make('riak.connection'));
        });
    }
}
```

Después de haber registrado el proveedor utilizando el método `provider`, puedes cambiar al nuevo proveedor de usuarios en tu archivo de configuración `auth.php`. Primero, define un `provider` que utilice tu nuevo controlador:

```php
'providers' => [
    'users' => [
        'driver' => 'riak',
    ],
],
```

Finalmente, puedes utilizar este proveedor en tu configuración de `guards`:

```php
'guards' => [
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],
],
```

<a name="the-user-provider-contract"></a>
### La Interfaz UserProvider

Las implementaciones `Illuminate\Contracts\Auth\UserProvider` son responsables solamente de obtener una implementación de `Illuminate\Contracts\Auth\Authenticatable` desde un sistema de almacenamiento persistente, como MySQL, Riak, etc. Estas dos interfaces permiten a los mecanismos de autenticación de Laravel continuar funcionando independientemente de cómo esté almacenada la información del usuario o qué tipo de clase es utilizado para representarlo.

Echemos un vistaso a la interfaz `Illuminate\Contracts\Auth\UserProvider`:

```php
<?php

namespace Illuminate\Contracts\Auth;

interface UserProvider {

    public function retrieveById($identifier);
    public function retrieveByToken($identifier, $token);
    public function updateRememberToken(Authenticatable $user, $token);
    public function retrieveByCredentials(array $credentials);
    public function validateCredentials(Authenticatable $user, array $credentials);

}
```

La función `retrieveById` generalmente recibe una clave que representa al usuario, como un ID auto-incrementable de una base de datos MySQL. La implementación `Authenticatable` que coincida con el ID deberá ser recuperado y retornado por el método.

La función `retireveByToken` recupera un usuario por su `$identifier` único y su `$token` "recordar datos", almacenados en el campo `remember_token`. Como en el método anterior, la implementación `Authenticatable` deberá ser retornado.

El método `updateRememberToken` actualiza el campo `$user` y `remember_token` con el nuevo `$token`. Un nuevo token es asignado en un inicio de sesión con "recordar datos" o cuando el usuario cierre su sesión.

El método `retrieveByCredentials` recupera el arreglo de credenciales pasadas al método `Auth::attempt` cuando intenta loguearse a la aplicación. El método "consulta" el almacenamiento persistente en busca de las credenciales que coincidan con las del usuario. Típicamente, este método va a ejecutar una consulta con una condición "where" en `$credentials['username']`. El método deberá retornar una implementación de `Authenticatable`. **Este método no debe intentar realizar ninguna validación o autenticación por contraseña.**

El método `validateCredentials` deberá comparar el `$user` proporcionado con sus `$credentials` para autenticar el usuario. Por ejemplo, este método puede utilizar `Hash::check` para comparar los valores de `$user->getAuthPassword()` al valor de `$credentials['password']`. Este método deberá retornar `true` o `false` indicando si la contraseña es válida o no.

<a name="the-authenticatable-contract"></a>
### La Interfaz Authenticatable

Ahora que hemos explorado cada uno de los métodos en `UserProvider`, vamos a echar un vistazo a la interfaz `Authenticatable`. Recuerda, el proveedor deberá retornar implementaciones de esta interfaz desde los métodos `retrieveById`, `retrieveByToken` y `retrieveByCredentials`:

```php
<?php

namespace Illuminate\Contracts\Auth;

interface Authenticatable {

    public function getAuthIdentifierName();
    public function getAuthIdentifier();
    public function getAuthPassword();
    public function getRememberToken();
    public function setRememberToken($value);
    public function getRememberTokenName();

}
```

Esta interfaz es simple. El método `getAuthIdentifierName` debe retornar el nombre del campo "clave primaria" del usuario y el método `getAuthIdentifier` deberá retornar la "clave primaria" del usuario. En un backend MySQL, nuevamente, esto deberá ser la clave auto-incrementable. El método `getAuthPassword` deberá retornar la contraseña encriptada del usuario. Esta interfaz permite que el sistema de autenticación funcione con cualquier clase de usuario, independientemente de qué capa de abstracción o qué ORM se está utilizando. Por defecto, Laravel incluye una clase `User` en el directorio `app` que implementa esta interfaz, por lo que puedes consultar esta clase para obtener un ejemplo de implementación.

<a name="events"></a>
## Eventos

Laravel genera una variedad de [eventos](/docs/{{version}}/events) durante el proceso de autenticación. Puedes adjuntar listeners a estos eventos en tu `EventServiceProvider`:

```php
/**
* The event listener mappings for the application.
*
* @var array
*/
protected $listen = [
    'Illuminate\Auth\Events\Registered' => [
        'App\Listeners\LogRegisteredUser',
    ],

    'Illuminate\Auth\Events\Attempting' => [
        'App\Listeners\LogAuthenticationAttempt',
    ],

    'Illuminate\Auth\Events\Authenticated' => [
        'App\Listeners\LogAuthenticated',
    ],

    'Illuminate\Auth\Events\Login' => [
        'App\Listeners\LogSuccessfulLogin',
    ],

    'Illuminate\Auth\Events\Failed' => [
        'App\Listeners\LogFailedLogin',
    ],

    'Illuminate\Auth\Events\Logout' => [
        'App\Listeners\LogSuccessfulLogout',
    ],

    'Illuminate\Auth\Events\Lockout' => [
        'App\Listeners\LogLockout',
    ],

    'Illuminate\Auth\Events\PasswordReset' => [
        'App\Listeners\LogPasswordReset',
    ],
];
```