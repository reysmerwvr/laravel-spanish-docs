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
- [Authenticar Usuarios Manualmente](#authenticating-users)
    - [Recordar Usuarios](#remembering-users)
    - [Otros MÉtodos De Autenticación](#other-authentication-methods)
- [Autenticación Básica HTTP](#http-basic-authentication)
    - [Autenticación Básica HTTP Sin Estado](#stateless-http-basic-authentication)
- [Autenticar Con Redes Sociales](https://github.com/laravel/socialite)
- [Agregar Guards Personalizados](#adding-custom-guards)
- [Agregar User Providers Personalizados](#adding-custom-user-providers)
    - [El Contrato De Proveedor De Usuario](#the-user-provider-contract)
    - [El Contrato Authenticatable](#the-authenticatable-contract)
- [Eventos](#events)

<a name="introduction"></a>
## Introducción

> {tip} **¿Quiere comenzar rápido?** Solo ejecute `php artisan make:auth` y `php artisan migrate` en una nueva aplicación de Laravel. Luego, diríjase en su navegador a `http://tu-app.dev/register` o cualquier otra URL asignada a su aplicación. ¡Estos dos comandos se encargarán de generar todo el sistema de autenticación!

Laravel hace la implementación de la autenticación algo muy sencillo. De hecho, casi todo se configura por usted por default. El archivo de configuración de la autenticación está localizado en `config/auth.php`, el cuál contiene varias opciones bien documentadas para ajustar el comportmiento de los servicios de autenticación.

En esencia, las comodidades de la autenticación de Laravel están compuestas de `guards` y `providers`. Los Guards definen cómo los usuarios son autenticados para cada petición. Por ejemplo, Laravel contiene un guard `session` el cál mantiene el estado utilizando el almacenamiento de sesión y las cookies.

Los Providers definen cómo se recuperan los usuarios de su almacenamiento persistente. Laravel cuenta con soporte para recuperar los usuarios utilizando Eloquent y el constructor de consultas de la base de datos. Sin embargo, usted es libre de definir los proveedores adicionales que requiera su aplicación.

¡No se preocupe si esto suena confuso por el momento! Muchas aplicaciones nunca necesitarán modificar la configuración predeterminada de la autenticación.

<a name="introduction-database-considerations"></a>
### Consideraciones De La Base De Datos

De manera predeterminada, Laravel incluye un [Modelo de Eloquent](/docs/{{version}}/eloquent) `App\User` en su directorio `app`. Este modelo puede ser utilizado por el controlador de autenticación predeterminado de Eloquent. Si su aplicación no utiliza Eloquent, deberá utilizar el controlador de autenticación `database` el cuál utiliza el constructor de consultas de Laravel.

Al crear el esquema de la base de datos para el modelo `App\User`, asegúrese de que la columna password sea de al menos 60 caracteres de longitud. Mantener una longitud de columna de cadena predeterminada a 255 caracteres sería una buena opción.

Además, debe verificar que su tabla `users` (o equivalente) contenga un campo nulo, de tipo cadena llamado `remember_token` de 100 caracteres. Esta columna se usará para almacenar un token para los usuarios que selecciónen la opción "remember me" cuando inicien sesión en su aplicación.

<a name="authentication-quickstart"></a>
## Inicio Rápido De Autenticación

Laravel viene con varios controladores de autenticación preconstruidos, los cuales están localizados en el namespace `App\Http\Controllers\Auth`. El `RegisterController` maneja el registro de usuarios nuevos, el `LoginController` maneja la autenticación, el `ForgotPasswordController` maneja el envío de e-mails para reestablecer la contraseña, y el `ResetPasswordController` contiene la lógica para reiniciar contraseñas. Cada uno de estos controladores utiliza un trait para incluir los métodos necesarios. En la mayoría de los casos no tendrá que modificar estos controladores en absoluto.

<a name="included-routing"></a>
### Enrutamiento

Laravel proporciona una manera rápida de generar todas las rutas y vistas que necesitas para la autenticación con un simple comando:

    php artisan make:auth

Este comando debe ser utilizado en aplicaciones nuevas e instalará vistas de diseño, registro e inicio de sesión, así como todas las rutas necesarias para la autenticación. También será generado un `HomeController` que se encargará de manejar las peticiones posteriores al login como mostrar el dashboard de la aplicación.

<a name="included-views"></a>
### Vistas

Como se mencionó en la sección anterior, el comando `php artisan make:auth` creará todas las vistas que se necesiten para la autenticación y las colocará en el directorio `resources/views/auth`.

El comando `make:auth` también creará el directorio `resources/views/layouts`, el cuál contendrá la plantilla base para su aplicación. Todas estas vistas usan el framework de CSS Bootstrap, pero usted es libre de modificarlo a sus preferencias.

<a name="included-authenticating"></a>
### Autenticando

Ahora que ya tiene sus rutas y vistas configuradas para los controladores de autenticación incluidos con el framework, ¡está listo para registrar y autenticar usuarios nuevos para su aplicación! Puede acceder a su aplicación en el navegador ya que los controladores de autenticación contienen la lógica (a través de traits) para autenticar usuarios existentes y almacenar usuarios nuevos en la base de datos.

#### Personalizar Rutas

Cuando un usuarios se ha autenticado exitosamente, será redirigido a la URI `/home`. Usted puede personalizar la redirección la ubicación de redireccionamiento post-autenticación deginiendo una propiedad `redirectTo` en `LoginController`, `RegisterController` y `ResetPasswordController`:

    protected $redirectTo = '/';

Si la ruta de redireccionamiento necesita generar lógica personalizada puede definir un método `redirectTo` en lugar de una propiedad `redirectTo`:

    protected function redirectTo()
    {
        return '/path';
    }

> {tip} El método `redirectTo` toma precedencia sobre el atributo `redirectTo`.

#### Personalizar Usuario

Por defecto, Laravel utiliza el campo `email` para la autenticación. Si desea modificar esto, puede definir un método `username` en su `LoginController`:

    public function username()
    {
        return 'username';
    }

#### Personalizar Guard

También puede personalizar el "guard" que es utilizado para autenticar y registrar usuarios. Para empezar, defina un método `guard` en su `LoginController`, `RegisterController` y `ResetPasswordController`. Este método debe devolver una instancia de guard:

    use Illuminate\Support\Facades\Auth;

    protected function guard()
    {
        return Auth::guard('guard-name');
    }

#### Validación / Personalizar Almacenamiento

Para modificar los campos del formulario que son requeridos cuando se registren usuarios nuevos en su aplicación, o para personalizar cómo los nuevos usuarios son almacenados en su base de datos, puede modificar la clase `RegisterController`. Esta clase es responsable de validar y crear usuarios nuevos en su aplicación.

El método `validator` de `RegisterController` contiene las reglas de validación para los usuarios nuevos de su aplicación. Usted es libre de modificar ese metodo a según le convenga.

El método `create` de `RegisterController` es responsable de crear registros nuevos de `App\User` en su base de datos usando el [ORM Eloquent](/docs/{{version}}/eloquent). Uset es libre de modificar este método de acuerdo a las necesidades de su base de datos.

<a name="retrieving-the-authenticated-user"></a>
### Recuperando El Usuario Autenticado

Puede acceder al usuario autenticado por medio del facade `Auth`:

    use Illuminate\Support\Facades\Auth;

    // Get the currently authenticated user...
    $user = Auth::user();

    // Get the currently authenticated user's ID...
    $id = Auth::id();

Alternaticamente, una vez que el usuario haya sido autenticado, puede aceder al usuario autenticado por una instancia de `Illuminate\Http\Request`. Recuerde que las clases de tipo insinuado serán inyectadas automáticamente en los métodos de su controlador:

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

#### Determinar Si El Usuario Actual Está Autenticado

Para determinar si el usuario actual está loggeado en su aplicación, puede usar el método `check` del facade `Auth`, el cuál devolverá `true` si el usuario está autenticado:

    use Illuminate\Support\Facades\Auth;

    if (Auth::check()) {
        // The user is logged in...
    }

> {tip} Aún cuando es posible determinar su un usuario está autenticado utilizando el método `check`, típicamente deberá usar un middleware para verificar que el usuario está autenticado antes de permitir al usuario acceder a ciertas rutas / controladores. Para aprender más acerca de esto, vea la documentación para [proteger rutas](/docs/{{version}}/authentication#protecting-routes).

<a name="protecting-routes"></a>
### Proteger Rutas

Puede utilizar [middleware de rutas] para permiitir acceder a ciertas rutas a los usuarios autenticados. Laravel incluye un middleware `auth`, el cual está definido en `Illuminate\Auth\Middleware\Authenticate`. Ya que este middleware está registrado en su kernel HTTP, todo lo que necesita hacer es adjuntar el middleware a la definición de la ruta:

    Route::get('profile', function () {
        // Only authenticated users may enter...
    })->middleware('auth');

Desde luego, si está utilizando [controladores](/docs/{{version}}/controllers), puede hacer una llamada al método `middleware` desde el constructor de su controlador en lugar de adjuntarlo a la definición de la ruta:

    public function __construct()
    {
        $this->middleware('auth');
    }

#### Especificar Un Guard

Cuando adjunte el middleware `auth` a una ruta, también puede especificar cual guard deberá ser utilizado para autenticar al usuario. El guard especificado deberá corresponder a una de las llaves en el arreglo `guards` del archivo de configuración `auth.php`:

    public function __construct()
    {
        $this->middleware('auth:api');
    }

<a name="login-throttling"></a>
### Regulación De Inicio De Sesión

Si está utilizando la clase `LoginController` incorporada a Laravel, el trait `Illuminate\Foundation\Auth\ThrottlesLogins` se encontrará incluído en su controlador. De manera predeterminada, el usuario no será capaz de iniciar sesión durante un minuto si falla al proveer las credenciales correctas después de varios intentos. El regulador (o throttle) es único para el username / dirección de e-mail del usuario y su dirección IP.

<a name="authenticating-users"></a>
## Authenticar Usuarios Manualmente

Desde luego, no está obligado a utilizar los controladores de autenticación incluidos en Laravel. Si desea eliminar estos controladores, tendrá que encargarse de administrar la autenticación de usuarios utilizando las clases de autenticación de Laravel directamente. No se preocupe, ¡es algo sencillo!.

Vamos a acceder a los servicios de autenticación de Laravel por medio del [facade](/docs/{{version}}/facades), así que hay que asegurarnos de iportar el facade `Auth` al inicio de la clase. Después, veamos el método `attempt`:

    <?php

    namespace App\Http\Controllers;

    use Illuminate\Support\Facades\Auth;

    class LoginController extends Controller
    {
        /**
         * Handle an authentication attempt.
         *
         * @return Response
         */
        public function authenticate()
        {
            if (Auth::attempt(['email' => $email, 'password' => $password])) {
                // Authentication passed...
                return redirect()->intended('dashboard');
            }
        }
    }

El método `attempt` acepta un arrelgo de pares llave / valor como primer argumento. los valores en el arreglo serán utilizados para encontrar el usuario en la tabla de su base de datos. Así que, en el ejemplo anterior, el usuario se obtiene por el valor de la columna `email`. Si se encuenra el usuario, la contraseña encriptada obtenida de la base de datos será comparada con el valor `password` pasado al método en el arreglo. No debe encriptar la contraseña especificada para el valor `password`, ya qu el framework automáticamente va a encriptarlo antes de compararlo con la contraseña almacenada en la base de datos. Si dos contraseñas encriptadas coinciden, se iniciará una sesión autenticada para el usuario.

El método `attempt` va a devolver `true` si la autenticación fue exitosa. De otra forma, devolverá `false`.

El método `intended` del redirector va a redirigir al usuario a la URL que intentaba acceder antes de ser interceptado por el middleware de autenticación. Una URI de fallback puede ser proporcionada al método en caso de que el destino solicitado no esté disponible.

#### Especificar Condiciones Adicionales

Si lo desea, puede agregar condiciones extra a la consulta de autenticación además del e-mail del usuario y su contraseña. Por ejemplo, podemos verificar que un usuario esté marcado como "active":

    if (Auth::attempt(['email' => $email, 'password' => $password, 'active' => 1])) {
        // The user is active, not suspended, and exists.
    }

> {note} En estos ejemplos, `email` no es una opción requerida, solamente es utilizado como ejemplo. Debe utilizar cualquier columna que corresponda a "username" en su base de datos.

#### Acceso A Instancias Específicas De Guard

PUede especificar que instancia de guard desea usar utilizando el método `guard` en el facade `Auth`. Esto le permitirá administrar la autentincación para partes separadas de su aplicación utilizando modelos autenticables o tablas de usuarios independientes.

El nombre del guard pasado al método `guard` deberá corresponder a uno de los guards configurados en su archivo de configuración `auth.php`:

    if (Auth::guard('admin')->attempt($credentials)) {
        //
    }

#### Cerrar Sesión

Para desconectar usuarios de su aplicación, debe utilizar el método `logout` del facade `Auth`. Esto va a borrar la información de autenticación en la sesión del usuario:

    Auth::logout();

<a name="remembering-users"></a>
### Recordar Usuarios

Si desea proporcionar la funcionalidad de "recordarme" en su aplicación, podrá pasar un valor booleano como segundo argumento al método `attempt`, que mantendrá al usuario autenticado indefinidamente, o hasta que cierre su sesión manualmente. Desde luego, su tabla `users` deberá incluir una columna de tipo string llamada `remember_token`, que erá utilizada para almacenar el token "recordarme".

    if (Auth::attempt(['email' => $email, 'password' => $password], $remember)) {
        // The user is being remembered...
    }

> {tip} Si está utilizando el `LoginController` integrado a su instalación de Laravel, la lógica apropiada para "recordar" usuarios ya se encontrará implementada por los traits utilizados po el controlador.

Si está "recordando" usuarios, puede utilizar el método `viaRemember` para determinar si el usuario se ha autenticado utilizando la cookie "recordarme":

    if (Auth::viaRemember()) {
        //
    }

<a name="other-authentication-methods"></a>
### Otros Métodos De Autenticación

#### Autenticar Una Instancia De Usuario

Si necesita registrar una instancia de usuario existente en su aplicación, puede llamar al método `login` con la instancia de usuario. El objeto proporcionado deberá ser una implementación del [contract](/docs/{{version}}/contracts) `Illuminate\Contracts\Auth\Authenticatable`. Desde luego, el modelo `App\User` incluido en Laravel ya implementa esta interface:

    Auth::login($user);

    // Login and "remember" the given user...
    Auth::login($user, true);

Desde luego, puede especificar la instancia de guard que desee utilizar:

    Auth::guard('admin')->login($user);

#### Autenticar Un Usuario Por ID

Para autenticar un usuario en su aplicación por su ID, debe usar el método `loginUsingId`. Este método acepta la llave primaria del usuario que desea autenticar:

    Auth::loginUsingId(1);

    // Login and "remember" the given user...
    Auth::loginUsingId(1, true);

#### Autenticar Un Usuario Una Vez

Puede utilizar el método `once` para autenticar un usuario en su aplicación para una única solicitud. No se utilizarán sesiones o cookies, lo que significa que este método puede ser bastante útil al construir una API sin estado:

    if (Auth::once($credentials)) {
        //
    }

<a name="http-basic-authentication"></a>
## Autenticación Básica HTTP

La [Autenticación Básica HTTP](https://en.wikipedia.org/wiki/Basic_access_authentication) proporciona una manera rápida de autenticar usuarios a su aplicación sin configurar una página de "login" dedicada. Para iniciar, adjunte el [middleware](/docs/{{version}}/middleware) `auth.basic` a su ruta. El middleware `auth.basic` está incluido en el framework de Laravel, por lo que no hay necesidad de definirlo:

    Route::get('profile', function () {
        // Only authenticated users may enter...
    })->middleware('auth.basic');

Una vez que el middleware haya sido adjuntado a la ruta, se le preguntará automáticamente por las credenciales al acceder a la ruta desde su navegador. Por defecto, el middleware `auth.basic` va a usar la columna `email` en el registro del usuario como "username".

#### Una Nota Sobre FastCGI

If you are using PHP FastCGI, HTTP Basic authentication may not work correctly out of the box. The following lines should be added to your `.htaccess` file:

Si está usando PHP FastCGI, la Autentincación Básica HTTP podría no funcionar correctamente por default. Las siguientes líneas deberán ser agregadas a su archivo `.htaccess`:

    RewriteCond %{HTTP:Authorization} ^(.+)$
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

<a name="stateless-http-basic-authentication"></a>
### Autenticación Básica HTTP Sin Estado

También puede utilizar la Autenticación Básica HTTP sin establecer una cookie de identificación en la sesión, esto es particularmente útil para la autenticacíon API. Para hacer esto [defina un middleware](/docs/{{version}}/middleware) que llame al método `onceBasic`. Si el método no devuelve ninguna respuesta, la petición puede pasarse a la aplicación:

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

A continuación [registre el middleware de ruta](/docs/{{version}}/middleware#registering-middleware) y adjúntelo a la ruta:

    Route::get('api/user', function () {
        // Only authenticated users may enter...
    })->middleware('auth.basic.once');

<a name="adding-custom-guards"></a>
## Agregar Guards Personalizados

Puede definir su propio guard de autenticación utilizando el método `extend` en el facade `Auth`. Debe colocar la llamada a este método `extend` en el [service provider](/docs/{{version}}/providers). Ya que Laravel cuenta con un `AuthServiceProvider`, puede colocar el código en ese provider:

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

Como puede ver en el ejemplo anterior, el callback pasado al método `extend` deberá retornar una implementación de `Illuminate\Contracts\Auth\Guard`. Esta interfaz contiene algunos métodos que tendrá que implementar para definir u guard personalizado. Una vez que su guard personalizado haya sido definido, podrá utilizar este guard en la configuración `guards` de su archivo de configuración `auth.php`:

    'guards' => [
        'api' => [
            'driver' => 'jwt',
            'provider' => 'users',
        ],
    ],

<a name="adding-custom-user-providers"></a>
## Agregar User Providers Personalizados

Si no está utilizando una base de datos relacional tradicional para almacenar sus usuarios, deberá extender Laravel con su propio proveedor de autenticación. Usaremos el método `provider` en el facade `Auth` para definir un proveedor de usuarios personalizado:

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

Después de haber registrado el proveedor utilizando el método `provider`, puede cambiar al nuevo proveedor de usuarios en su archivo de configuración `auth.php`. Primero, defina un `provider` que utilice su nuevo controlador:

    'providers' => [
        'users' => [
            'driver' => 'riak',
        ],
    ],

Finalmente, puede utilizar este proveedor en su configuración `guards`:

    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],
    ],

<a name="the-user-provider-contract"></a>
### El Contrato De Proveedor De Usuario

Las implementaciones `Illuminate\Contracts\Auth\UserProvider` son responsables solamente de obtener una implementación de `Illuminate\Contracts\Auth\Authenticatable` desde un sistema de almacenamiento persistente, como MySQL, Riak, etc. Estas dos interfaces permiten a los mecanismos de autenticación de Laravel continuar funcionando independientemente de cómo esté almacenada la información del usuario o qué tipo de clase es utilizado para representarlo.

Echemos un vistaso al contract `Illuminate\Contracts\Auth\UserProvider`:

    <?php

    namespace Illuminate\Contracts\Auth;

    interface UserProvider {

        public function retrieveById($identifier);
        public function retrieveByToken($identifier, $token);
        public function updateRememberToken(Authenticatable $user, $token);
        public function retrieveByCredentials(array $credentials);
        public function validateCredentials(Authenticatable $user, array $credentials);

    }

La función `retrieveById` generalmente recibe una clave que representa al usuario, como un ID auto-incrementable de una base de datos MySQL. La implementación `Authenticatable` que coincida con el ID deberá ser recuperado y retornado por el método.

La función `retireveByToken` recupera un usuario por su `$identifier` único y su `$token` "recordar datos", almacenados en el campo `remember_token`. Como en el método anterior, la implementación `Authenticatable` deberá ser retornado.

El método `updateRememberToken` actualiza el campo `$user` y `remember_token` con el nuevo `$token`. El nuevo token puede ser ya sea un token nuevo, asignado en un inicio de sesión con "recordar datos", o cuando el usuario ciere su sesión.

El método `retrieveByCredentials` recupera el arreglo de credenciales pasadas al método `Auth::attempt` cuando intenta loguearse a la aplicación. El método "consulta" el almacenamiento persistente en busca de las credenciales que coincidan con las del usuario. Típicamente, este método va a ejecutar una consulta con una condición "where" en `$credentials['username']`. El método deberá retornar una implementación de `Authenticatable`. **Este método no debe intentar realizar ninguna validación o autenticación por contraseña.**

El método `validateCredentials` deberá comparar el `$user` proporcionado con sus `$credentials` para autenticar el usuario. Por ejemplo, este método puede utilizar `Hash::check` para comparar los valores de `$user->getAuthPassword()` al valor de `$credentials['password']`. Este método deberá retornar `true` o `false` indicando si la contraseña es válida o no.

<a name="the-authenticatable-contract"></a>
### El Contrato Authenticatable

Ahora que hemos explorado cada uno de los métodos en `UserProvider`, vamos a echar un vistaso al contract `Authenticatable`. Recuerde, el proveedor deberá retornar implementaciones de esta interfaz desde los métodos `retrieveById` y `retrieveByCredentials`:

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

Esta interfaz es simple. El método `getAuthIdentifierName` debe retornar el nombre del campo "llave primaria" del usuario y el método `getAuthIdentifier` deberá retornar la "llave primaria" del usuario. En un back-end MySQL, nuevamente, esto deberá ser la llave auto-incrementable. El método `getAuthPassword` deberá retornar la contraseña encriptada del usuario. Esta interfaz permite que el sistema de autenticación funcione con cualquier clase de usuario, independientemente de qué capa de abstracción o qué ORM se está utilizando. Por defecto, Laravel incluye una clase `User` en el directorio `app` que implementa esta interfaz, por lo que puede consutar esta clase para obtener un ejemplo de implementación.

<a name="events"></a>
## Eventos

Laravel genera una variedad de [eventos](/docs/{{version}}/events) durante el proceso de autenticación. Puede adjuntar listeners a estos eventos en su  `EventServiceProvider`:

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
