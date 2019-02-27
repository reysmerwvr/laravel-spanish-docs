# Guía de Actualización

- [Actualizando de 5.7.0 desde 5.6](#upgrade-5.7.0)

<a name="upgrade-5.7.0"></a>
## Actualizando de 5.7.0 desde 5.6

#### Tiempo Estimado de Actualización: 10 - 15 Minutos

> {note} Intentamos documentar cada posible cambio de ruptura. Dado que algunos de estos cambios de ruptura se encuentran en partes oscuras del framework, solo una parte de estos cambios puede afectar tu aplicación.

### Actualizando Dependencias

Actualiza tu dependencia `laravel/framework` a `5.7.*` en tu archivo `composer.json`.

Si estás utilizando Laravel Passport, debes actualizar tu dependencia, `laravel/passport` a `^7.0` en tu archivo `composer.json`.

Luego examina los paquetes de terceros consumidos por tu aplicación y verificar que estés utilizando la versión adecuada para soportar Laravel 5.7.

### Aplicación

#### El método `register`

**Probabilidad de impacto: Muy Bajo**

El argumento no utilizado `options` de la clase `Illuminate\Foundation\Application` se ha eliminado. Si estás sobreescribiendo este método, debes actualizar la firma de su método:

    /**
     * Register a service provider with the application.
     *
     * @param  \Illuminate\Support\ServiceProvider|string  $provider
     * @param  bool   $force
     * @return \Illuminate\Support\ServiceProvider
     */
    public function register($provider, $force = false);

### Artisan

#### Conexión de Trabajo Programada y Colas

**Probabilidad de impacto: Bajo**

El método `$schedule->job` ahora respeta las propiedades `queue` y `connection` en la clase de trabajo si una conexión / trabajo no se pasa explícitamente al método `job`.

En general, esto debería considerarse una corrección de error; sin embargo, se muestra como un cambio importante de precaución. [Por favor, háganos saber si tienes algún problema relacionado con este cambio](https://github.com/laravel/framework/pull/25216)

### Archivos Assets

#### Directorio Asset aplanado

**Probabilidad de impacto: Ninguna**

Para nuevas aplicaciones con Laravel 5.7, el diretorio assets que contiene los scripts y estilos ha sido aplanado dentro del directorio `resources`. Esto **NO** afectará las aplicaciones existentes y no es requerido que lo cambies en tus aplicaciones existentes.

Sin embargo, si deseas hacer este cambio, debes mover todos los archivos desde el directorio`resources/assets/*` al directorio superior:

- De `resources/assets/js/*` a `resources/js/*`
- De `resources/assets/sass/*` a `resources/sass/*`

Luego, actualizar cualquier referencia a los viejos directorios en tu archivo `webpack.mix.js`:

    mix.js('resources/js/app.js', 'public/js')
       .sass('resources/sass/app.scss', 'public/css');

#### Directorio `svg` Agregado

**Probabilidad de impacto: Muy Alto**

Se agregó el nuevo directorio, `svg`, al directorio `public`. Este contiene cuatro archivos svg: `403.svg`, `404.svg`, `500.svg` y `503.svg`, los cuales son mostrados en sus respectivas páginas de error.

Puedes obtener los archivos [de GitHub](https://github.com/laravel/laravel/tree/5.7/public/svg).

### Autenticación

#### El Middleware `Authenticate`

**Probabilidad de impacto: Bajo**

El método `authenticate` del middleware `Illuminate\Auth\Middleware\Authenticate` ha sido actualizado para aceptar el `$request` entrante como su primer argumento. Si estás sobreescribiendo este método en tu propio middleware `Authenticate`, debes actualizar la firma de tu middleware:

    /**
     * Determine if the user is logged in to any of the given guards.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  array  $guards
     * @return void
     *
     * @throws \Illuminate\Auth\AuthenticationException
     */
    protected function authenticate($request, array $guards)

#### El trait `ResetsPasswords`

**Probabilidad de impacto: Bajo**

El método protected `sendResetResponse` del trait `ResetsPasswords` ahora acepta la `Illuminate\Http\Request` entrante como su primer argumento. Si estás sobreescribiendo este método, debes actualizar la firma de tu método:

    /**
     * Get the response for a successful password reset.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $response
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    protected function sendResetResponse(Request $request, $response)

#### El trait `SendsPasswordResetEmails`

**Probabilidad de impacto: Bajo**

El método protected `sendResetLinkResponse` del trait `SendsPasswordResetEmails` ahora acepta la `Illuminate\Http\Request` entrante como su primer argumento. Si estás sobreescribiendo este método, debes actualizar la firma de tu método:

    /**
     * Get the response for a successful password reset link.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $response
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    protected function sendResetLinkResponse(Request $request, $response)

### Autorización

#### El Contrato `Gate`

**Probabilidad de impacto: Muy Bajo**

La visibilidad del método `raw` ha sido cambiada de `protected` a `public`. Además, [fue agregado al contrato `Illuminate\Contracts\Auth\Access\Gate`](https://github.com/laravel/framework/pull/25143):

    /**
     * Get the raw result from the authorization callback.
     *
     * @param  string  $ability
     * @param  array|mixed  $arguments
     * @return mixed
     */
    public function raw($ability, $arguments = []);

Si estás implementando esta interfaz, debes agregar este método a tu implementación.

#### El Evento `Login`

**Probabilidad de impacto: Muy Bajo**

El método `__construct` del evento `Illuminate\Auth\Events\Login` tiene un nuevo argumento `$guard`:

    /**
     * Create a new event instance.
     *
     * @param  string  $guard
     * @param  \Illuminate\Contracts\Auth\Authenticatable  $user
     * @param  bool  $remember
     * @return void
     */
    public function __construct($guard, $user, $remember)

Si estás despachando este evento manualmente dentro de tu aplicación, deberás pasar este nuevo argumento al constructor del evento. El siguiente ejemplo pasa el guard por defecto del framework al evento de inicio de sesión:

    use Illuminate\Auth\Events\Login;

    event(new Login(config('auth.defaults.guard'), $user, $remember))

### Blade

#### El Operador `or`

**Probabilidad de impacto: Alto**

El operador de Blade "or" ha sido eliminado en favor del operador incorporado de PHP `??` (null coalesce), el cual tiene el mismo propósito y funcionalidad:

    // Laravel 5.6...
    {{ $foo or 'default' }}

    // Laravel 5.7...
    {{ $foo ?? 'default' }}

### Cache

**Probabilidad de impacto: Muy Alto**

Se ha agregado un nuevo directorio `data` a `storage/framework/cache`. Debes crear este directorio en tu propia aplicación:

    mkdir -p storage/framework/cache/data

Luego, añadirle un archivo [.gitignore](https://github.com/laravel/laravel/blob/76369205c8715a4a8d0d73061aa042a74fd402dc/storage/framework/cache/data/.gitignore) en el nuevo directorio creado `data`:

    cp storage/framework/cache/.gitignore storage/framework/cache/data/.gitignore

Finalmente, garantizar que el archivo [storage/framework/cache/.gitignore](https://github.com/laravel/laravel/blob/76369205c8715a4a8d0d73061aa042a74fd402dc/storage/framework/cache/.gitignore) esté actualizado de la siguiente manera:

    *
    !data/
    !.gitignore

### Carbon

**Probabilidad de impacto: Muy Bajo**

Las "macros" de Carbon ahora son manejadas por la biblioteca de Carbon directamente en lugar de la extensión de Laravel de la biblioteca. No esperamos que esto rompa tu código; sin embargo, [háganos saber de cualquier problema que encuentres relacionado con este cambio](https://github.com/laravel/framework/pull/23938).

### Colecciones

#### The `split` Method

**Probabilidad de impacto: Bajo**

El método `split` [se ha actualizado para devolver siempre el número solicitado de "grupos"](https://github.com/laravel/framework/pull/24088), a menos que el número total de artículos en la colección original sea menor que el recuento de colección solicitado. En general, esto debería considerarse una corrección de errores; sin embargo, está listado como un cambio de ruptura por precaución.

### Cookie

#### Firma del Método en el Contrato `Factory`

**Probabilidad de impacto: Muy Bajo**

Las firmas de los métodos `make` y `forever`de la interfaz `Illuminate\Contracts\Cookie\Factory` [han sido cambiadas](https://github.com/laravel/framework/pull/23200). Si estás implementando esta interfaz, debes actualizar estos métodos en su implementación.

### Base de Datos

#### El método de Migración `softDeletesTz`

**Probabilidad de impacto: Bajo**

El método del constructor de la tabla de esquemas `softDeletesTz` ahora acepta el nombre de la columna como su primer argumento, mientras que la `$precision` se ha movido a la posición del segundo argumento:

    /**
     * Add a "deleted at" timestampTz for the table.
     *
     * @param  string  $column
     * @param  int  $precision
     * @return \Illuminate\Support\Fluent
     */
    public function softDeletesTz($column = 'deleted_at', $precision = 0)

#### El Contracto `ConnectionInterface`

**Probabilidad de impacto: Muy Bajo**

Las firmas de los métodos `select` y` selectOne` del contrato `Illuminate\Contracts\Database\ConnectionInterface` se han actualizado para adaptarse al nuevo argumento `$useReadPdo`:

    /**
     * Run a select statement and return a single result.
     *
     * @param  string  $query
     * @param  array   $bindings
     * @param  bool  $useReadPdo
     * @return mixed
     */
    public function selectOne($query, $bindings = [], $useReadPdo = true);

    /**
     * Run a select statement against the database.
     *
     * @param  string  $query
     * @param  array   $bindings
     * @param  bool  $useReadPdo
     * @return array
     */
    public function select($query, $bindings = [], $useReadPdo = true);

Además, se agregó el método `cursor` al contrato:

    /**
     * Run a select statement against the database and returns a generator.
     *
     * @param  string  $query
     * @param  array  $bindings
     * @param  bool  $useReadPdo
     * @return \Generator
     */
    public function cursor($query, $bindings = [], $useReadPdo = true);

Si estás implementando esta interfaz, debes agregar este método a tu implementación.

#### Salida del Comando de Migración

**Probabilidad de impacto: Muy Bajo**

Los comandos de migración principales se han [actualizado para establecer la instancia de salida de la clase migrator](https://github.com/laravel/framework/pull/24811). Si estás sobreescribiendo o extendiendo los comandos de migración, deberías eliminar las referencias a`$this->migrator->getNotes()` y usar `$this->migrator->setOutput($this->output)` en su lugar.

#### Prioridad del controlador de SQL Server

**Probabilidad de impacto: Bajo**

Antes de Laravel 5.7, el controlador `PDO_DBLIB` se usaba como el controlador predeterminado de SQL Server PDO. Este controlador es considerado obsoleto por Microsoft. A partir de Laravel 5.7, `PDO_SQLSRV` se usará como el controlador por defecto, si está disponible. Alternativamente, puedes elegir usar el controlador `PDO_ODBC`:

    'sqlsrv' => [
        // ...
        'odbc' => true,
        'odbc_datasource_name' => 'your-odbc-dsn',
    ],

Si ninguno de estos controladores está disponible, Laravel usará el controlador `PDO_DBLIB`.

#### Claves foráneas de SQLite

**Probabilidad de impacto: Medio**

SQLite no soporta la eliminación de claves foráneas. Por esa razón, el uso del método `dropForeign` en una tabla ahora lanza una excepción. En general, esto debería considerarse una corrección de errores; sin embargo, está listado como un cambio de ruptura por precaución.

Si ejecutas tus migraciones en múltiples tipos de bases de datos, considera usar `DB::getDriverName()` en tus migraciones para omitir los métodos para clave foráneas no compatibles para SQLite.


### Depuración

#### Clases Dumper

**Probabilidad de impacto: Muy Bajo**

Las clases `Illuminate\Support\Debug\Dumper` y `Illuminate\Support\Debug\HtmlDumper` se han eliminado para utilizar los dumpers de variables nativas de Symfony: `Symfony\Component\VarDumper\VarDumper` y `Symfony\Component\VarDumper\Dumper\HtmlDumper`.

### Eloquent

#### Los Métodos `latest` / `oldest`

**Probabilidad de impacto: Bajo**

Los métodos `latest` y `oldest` del constructor de consultas de Eloquent se han actualizado para respetar las columnas de marca de tiempo personalizadas "created at" que se pueden especificar en tus modelos de Eloquent. En general, esto debería considerarse una corrección de errores; sin embargo, está listado como un cambio de ruptura por precaución.

#### El Método `wasChanged`

**Probabilidad de impacto: Muy Bajo**

Los cambios de un modelo Eloquent ahora están disponibles para el método `wasChanged` **antes** de activar el evento del modelo` updated`. En general, esto debería considerarse una corrección de errores; sin embargo, está listado como un cambio de ruptura por precaución. [Por favor, haznos saber si encuentras algún problema relacionado con este cambio.](https://github.com/laravel/framework/pull/25026).

#### Valores especiales flotantes de PostgreSQL

**Probabilidad de impacto: Bajo**

PostgreSQL soporta los valores flotantes `Infinity`, `-Infinity` y `NaN`. Antes de Laravel 5.7, estos se convertían a `0` cuando el tipo de conversión de Eloquent para la columna era` float`, `double` o` real`.

A partir de Laravel 5.7, estos valores se convertirán a las constantes de PHP `INF`, `-INF` y `NAN` correspondientes.

### Email Verification

**Probabilidad de impacto: Opcional**

Si eliges utilizar los nuevos [servicios de verificación de correo electrónico de Laravel](/docs/{{version}}/verification), necesitarás agregar scaffolding adicionales a tu aplicación. Primero, agrega el `VerificationController` a tu aplicación: [App\Http\Controllers\Auth\VerificationController](https://github.com/laravel/laravel/blob/5.7/app/Http/Controllers/Auth/VerificationController.php).

También deberás modificar tu modelo `App\User` para implementar el contrato` MustVerifyEmail`:

    <?php

    namespace App;

    use Illuminate\Notifications\Notifiable;
    use Illuminate\Contracts\Auth\MustVerifyEmail;
    use Illuminate\Foundation\Auth\User as Authenticatable;

    class User extends Authenticatable implements MustVerifyEmail
    {
        use Notifiable;

        // ...
    }

Para utilizar el middleware `verified` de modo que solo los usuarios verificados puedan acceder a una ruta determinada, deberás actualizar la propiedad `$routeMiddleware` de tu archivo `app/Http/Kernel.php` para incluir el nuevo middleware:

    // Within App\Http\Kernel Class...

    protected $routeMiddleware = [
        'auth' => \Illuminate\Auth\Middleware\Authenticate::class,
        'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
        'bindings' => \Illuminate\Routing\Middleware\SubstituteBindings::class,
        'can' => \Illuminate\Auth\Middleware\Authorize::class,
        'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
        'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
        'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
    ];

También necesitarás la vista de verificación. Esta vista debe colocarse en `resources/views/auth/verify.blade.php`. Puedes obtener el contenido de la vista [en GitHub](https://github.com/laravel/framework/blob/5.7/src/Illuminate/Auth/Console/stubs/make/views/auth/verify.stub).

Después, tu tabla de usuario debe contener una columna `email_verified_at` para almacenar la fecha y la hora en que se verificó la dirección de correo electrónico:

    $table->timestamp('email_verified_at')->nullable();

Para enviar el correo electrónico cuando un usuario es registrado, debes registrar los siguientes eventos y oyentes en tu clase [App\Providers\EventServiceProvider](https://github.com/laravel/laravel/blob/5.7/app/Providers/EventServiceProvider.php):

    use Illuminate\Auth\Events\Registered;
    use Illuminate\Auth\Listeners\SendEmailVerificationNotification;

    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
    ];

Finalmente, al llamar al método `Auth::routes`, debes pasar la opción `verify` al método:

    Auth::routes(['verify' => true]);

### Sistema de archivos

#### Métodos del Contrato `Filesystem`

**Probabilidad de impacto: Bajo**

Los métodos `readStream` y` writeStream` [se han agregado al contrato `Illuminate\Contracts\Filesystem\Filesystem`](https://github.com/laravel/framework/pull/23755). Si estás implementando esta interfaz, debes agregar estos métodos a tu implementación.

### Hashing

#### Método `Hash::check`

**Probabilidad de impacto: Ninguno**

El método `check` ahora **opcionalmente** verifica si el algoritmo del hash coincide con el algoritmo configurado.

### Mail

#### Conversión de Variables Dinámicas de Mailable

**Probabilidad de impacto: Bajo**

Las variables que se pasan dinámicamente a vistas mailables [ahora son automáticamente convertidas a camel case](https://github.com/laravel/framework/pull/24232), lo que hace que las variables dinámicas de Mailable tengan un comportamiento compatible con las variables dinámicas de la vista. Las variables dinámicas de Mailable no son una función documentada de Laravel, por lo que la probabilidad de impacto en tu aplicación es baja.

#### Tema de la Plantilla

**Probabilidad de impacto: Medio**

Si has personalizado los estilos de tema por defecto que se utilizan para las plantillas Markdown de las mailable, deberás volver a publicar y nuevamente realizar las personalizaciones. Las clases de colores de los botones han sido renombradas de 'blue', 'green', y 'red' a 'primary', 'success' y 'error'.

### Colas

#### Variable de Entorno `QUEUE_DRIVER`

**Probabilidad de impacto: Muy Bajo**

La variable de entorno `QUEUE_DRIVER` ha sido renombrada a `QUEUE_CONNECTION`. Esto no debería afectar a las aplicaciones existentes que estás actualizando, a menos que modifiques intencionalmente tu archivo de configuración `config/queue.php` para que coincida con el de Laravel 5.7.

#### Opciones de `WorkCommand`

**Probabilidad de impacto: Muy Bajo**

La opción `stop-when-empty` se agregó a `WorkCommand`. Si extiendes este comando, debes agregar `stop-when-empty` a la propiedad `$signature` de tu clase.

### Rutas

#### El Método `Route::redirect`

**Probabilidad de impacto: Alto**

El método `Route::redirect` ahora devuelve una redirección de código de estado HTTP `302`. El método `permanentRedirect` se ha agregado para permitir redirecciones `301`.

    // Return a 302 redirect...
    Route::redirect('/foo', '/bar');

    // Return a 301 redirect...
    Route::redirect('/foo', '/bar', 301);

    // Return a 301 redirect...
    Route::permanentRedirect('/foo', '/bar');

#### El Método `addRoute`

**Probabilidad de impacto: Bajo**

El método `addRoute` de la clase `Illuminate\Routing\Router` se ha cambiado de `protected` a` public`.

### Validación

#### Datos de Validación Anidados

**Probabilidad de impacto: Medio**

En versiones anteriores de Laravel, el método `validate` no devolvía los datos correctos para las reglas de validación anidadas. Esto se ha corregido en Laravel 5.7:

    $data = Validator::make([
        'person' => [
            'name' => 'Taylor',
            'job' => 'Developer'
        ]
    ], ['person.name' => 'required'])->validate();

    dump($data);

    // Prior Behavior...
    ['person' => ['name' => 'Taylor', 'job' => 'Developer']]

    // New Behavior...
    ['person' => ['name' => 'Taylor']]

#### The `Validator` Contract

**Probabilidad de impacto: Muy Bajo**

El método `validate` [se agregó al contrato `Illuminate\Contracts\Validation\Validator`](https://github.com/laravel/framework/pull/25128):

    /**
     * Run the validator's rules against its data.
     *
     * @return array
     */
    public function validate();

Si estás implementando esta interfaz, debes agregar este método a tu implementación.

### Pruebas

**Likelihood of Impact: Medio**

Laravel 5.7 introduce herramientas de prueba mejoradas para los comandos de Artisan. Por defecto, la salida del comando de Artisan ahora se simula (mock). Si dependes del método `artisan` para ejecutar comandos como parte de tu prueba, debes usar `Artisan::call` o definir `public $mockConsoleOutput = false` como una propiedad en tu clase de prueba.

### Misceláneo

También te animamos a ver los cambios en el `laravel/laravel` [repositorio de GitHub](https://github.com/laravel/laravel). Si bien muchos de estos cambios no son necesarios, es posible que desees mantener estos archivos sincronizados con tu aplicación. Algunos de estos cambios se tratarán en esta guía de actualización, pero otros, como los cambios en los archivos de configuración o los comentarios, no lo estarán. Puede ver fácilmente los cambios con la [herramienta de comparación GitHub](https://github.com/laravel/laravel/compare/5.6...5.7) y eligir qué actualizaciones son importantes para ti.
