# Notas de Lanzamiento

- [Esquema de Versiones](#versioning-scheme)
- [Política de Soporte](#support-policy)
- [Laravel 5.8](#laravel-5.8)

<a name="versioning-scheme"></a>
## Esquema de Versiones

El esquema de versiones de Laravel mantiene la siguiente convención: `paradigma.mayor.menor`. Los lanzamientos mayores del framework se publican cada seis meses (febrero y agosto), mientras que los lanzamientos menores se liberan cada semana. Los lanzamientos menores **nunca** deben contener cambios de ruptura (breaking changes).

Cuando haces referencia al framework Laravel o sus componentes desde tu aplicación o paquete, debes utilizar siempre una restricción de versión como `5.7.*`, ya que las versiones mayores de Laravel no incluyen cambios de ruptura. Sin embargo, nos esforzamos por asegurarnos siempre de que puedas actualizar a una nueva versión mayor en un día o menos.

Los lanzamientos de cambios de paradigma están separados por muchos años y representan cambios fundamentales en la arquitectura y las convenciones del framework. Actualmente, no hay ningún cambio de paradigma en desarrollo.

<a name="support-policy"></a>
## Política De Soporte

Para las versiones LTS, como Laravel 5.5, se proporcionan correcciones de errores durante 2 años y correcciones de seguridad por 3 años. Estas versiones proporcionan la ventana más larga de soporte y mantenimiento. Para las versiones generales, las correcciones de errores se proporcionan durante 6 meses y las correcciones de seguridad durante 1 año. Para todos los componentes adicionales, incluyendo Lumen, solo la última versión recibe correcciones de errores.

| Versión | Lanzamiento | Corrección de errores hasta | Correcciones de seguridad hasta |
| --- | --- | --- | --- |
| 5.0 | 4 de febrero, 2015 | 4 de agosto, 2015 | 4 de febrero, 2016 |
| 5.1 (LTS) | 9 de junio, 2015 | 9 de junio, 2017 | 9 de junio, 2018 |
| 5.2 | 21 de diciembre, 2015 | 21 de junio, 2016 | 21 de diciembre, 2016 |
| 5.3 | 23 de agosto, 2016 | 23 de febrero, 2017 | 23 de agosto, 2017 |
| 5.4 | 24 de enero, 2017 | 24 de julio, 2017 | 24 de enero, 2018 |
| 5.5 (LTS) | 30 de agosto, 2017 | 30 de agosto, 2019 | 30 de agosto, 2020 |
| 5.6 | 7 de febrero, 2018 | 7 de agosto, 2018 | 7 de febrero, 2019 |
| 5.7 | 4 de septiembre, 2018 | 4 de marzo, 2019 | 4 de septiembre, 2019 |
| 5.8 | 26 de febrero, 2019 | 26 de agosto, 2019 | 26 de febrero, 2020 |

<a name="laravel-5.8"></a>
## Laravel 5.8

Laravel 5.8 continúa las mejoras realizadas en Laravel 5.7 con la introducción de relaciones "has-one-through" (uno a través) en Eloquent, mejoras a la validación de correos electrónicos, registro automático de políticas de autorización basado en convenciones, driver para caché y sesiones con DynamoDB, mejoras a la configuración de la zona horaria para las tareas programadas, soporte para asignar múltiples guards autenticación a canales de broadcast, cumplimento de PSR-16 para drivers de caché, mejoras al comando `artisan serve`, soporte para PHPUnit 8.0, soporte para Carbon 2.0, soporte para Pheanstalk 4.0 y una variedad de otras correcciones de errores y mejoras de usabilidad.

### Relaciones `HasOneThrough` De Eloquent

Eloquent ahora proporciona soporte para el tipo de relación `hasOneThrough`. Por ejemplo, imagina un modelo Supplier que tiene un (`hasOne`) modelo Account, y un modelo Account tiene un modelo AccountHistory. Puedes usar una relación `hasOneThrough` para acceder al historial de cuenta de un proveedor a través del modelo Account:

    /**
     * Get the account history for the supplier.
     */
    public function accountHistory()
    {
        return $this->hasOneThrough(AccountHistory::class, Account::class);
    }

### Autodescubrimiento De Políticas De Autorización

Cuando se utiliza Laravel 5.7, cada [política de autorización](/docs/{{version}}/authorization#creating-policies) debía ser asociada explícitamente y registrada en el `AuthServiceProvider` de tu aplicación:

    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        'App\User' => 'App\Policies\UserPolicy',
    ];

Laravel 5.8 introduce el autodescubrimiento de políticas siempre que el modelo y la política sigan las convenciones estándar de nomenclatura de Laravel. Específicamente, las políticas deben estar en un directorio `Policies` debajo del directorio que contiene los modelos. Así, por ejemplo, los modelos pueden colocarse en el directorio `app` mientras que las políticas pueden ubicarse en el directorio `app/Policies`. Además, el nombre de la política debe coincidir con el nombre del modelo y tener un sufijo `Policy`. Entonces, un modelo `User` corresponderá a una clase` UserPolicy`.

Si deseas proporcionar tu propia lógica para el descubrimiento de políticas, puedes registrar un callback personalizado utilizando el método `Gate::guessPolicyNamesUsing`. Normalmente, este método debe llamarse desde el `AuthServiceProvider` de tu aplicación:

    use Illuminate\Support\Facades\Gate;

    Gate::guessPolicyNamesUsing(function ($modelClass) {
        // return policy class name...
    });

> {note} Cualquier política que se asigne explícitamente en su `AuthServiceProvider` tendrá prioridad sobre cualquier posible política de autodescubrimiento.

### Cumplimiento de PSR-16 para caché

Para permitir un tiempo de caducidad más granular al almacenar elementos y cumplir con el estándar de almacenamiento en caché PSR-16, el tiempo de vida del elemento de caché ha cambiado de minutos a segundos. Los métodos `put`, `putMany`, `add`, `remember` y `setDefaultCacheTime` de la clase `Illuminate\Cache\Repository` y sus clases extendidas, así como el método `put` de cada almacén de caché se actualizaron con este comportamiento modificado. Visita el [PR relacionado](https://github.com/laravel/framework/pull/27276) para más información.

Si estás pasando un número entero a cualquiera de estos métodos, debes actualizar tu código para asegurarte de que ahora está pasando la cantidad de segundos que deseas que el elemento permanezca en el caché. Alternativamente, puedes pasar una instancia de `DateTime` que indique cuándo debe expirar el elemento:

    // Laravel 5.7 - Store item for 30 minutes...
    Cache::put('foo', 'bar', 30);

    // Laravel 5.8 - Store item for 30 seconds...
    Cache::put('foo', 'bar', 30);

    // Laravel 5.7 / 5.8 - Store item for 30 seconds...
    Cache::put('foo', 'bar', now()->addSeconds(30));

### Múltiples Guards de Autentificación para Broadcast

En versiones anteriores de Laravel, los canales de transmisión privados y de presencia autenticaban al usuario a través de la protección de autenticación predeterminada de tu aplicación. A partir de Laravel 5.8, ahora puedes asignar múltiples "guards" (guardias) que deben autenticar la solicitud entrante:

    Broadcast::channel('channel', function() {
        // ...
    }, ['guards' => ['web', 'admin']])

### Token Guard Token Hashing

El `token` guard de Laravel, que proporciona autenticación de API básica, ahora admite el almacenamiento de tokens de API como hashes SHA-256. Esto proporciona una seguridad mejorada sobre el almacenamiento de tokens de texto sin formato. Para obtener más información sobre los tokens con hash, revisa la [documentación de autenticación API](/docs/{{version}}/api-authentication).

> **Nota:** Si bien Laravel viene con una protección de autenticación simple basada en token, te recomendamos encarecidamente que consideres usar [Laravel Passport](/docs/{{version}}/passport) Para aplicaciones de producción robustas que ofrecen autenticación API.

### Mejoras a la Validación de Correos Electrónicos

Laravel 5.8 introduce mejoras en la lógica de validación de correos electrónicos subyacente del validador al adoptar el paquete `egulias/email-validator` utilizado por SwiftMailer. La lógica de validación de correos electrónicos anterior de Laravel a veces consideraba que los correos electrónicos válidos, como `example@bär.se`, eran inválidos.

### Zona Horaria Predetermina Para Las Tareas Programadas

Laravel te permite personalizar la zona horaria de una tarea programada usando el método `timezone`:

    $schedule->command('inspire')
             ->hourly()
             ->timezone('America/Chicago');

Sin embargo, esto puede volverse engorroso y repetitivo si estás especificando la misma zona horaria para todas sus tareas programadas. Por esa razón, ahora puede definir un método `scheduleTimezone` en su archivo `app/Console/Kernel.php`. Este método debe devolver la zona horaria predeterminada que debe asignarse a todas las tareas programadas:

    /**
     * Get the timezone that should be used by default for scheduled events.
     *
     * @return \DateTimeZone|string|null
     */
    protected function scheduleTimezone()
    {
        return 'America/Chicago';
    }

### Eventos Para Modelos Pivote O Tabla intermedia 

En versiones anteriores de Laravel, los eventos del modelo Eloquent no se distribuían al adjuntar, separar o sincronizar modelos personalizados de tabla intermedia / pivote de una relación de muchos a muchos. Cuando usas [modelos personalizados para tablas intermedias](/docs/{{version}}/eloquent-relationships#defining-custom-intermediate-table-models) en Laravel 5.8, estos eventos ahora serán enviados.

### Mejoras Al Método Call De Artisan

Laravel te permite invocar comandos de Artisan a través del método `Artisan::call`. En versiones anteriores de Laravel, las opciones del comando se pasan a través de un arreglo como el segundo parámetro del método.

    use Illuminate\Support\Facades\Artisan;

    Artisan::call('migrate:install', ['database' => 'foo']);

Sin embargo, Laravel 5.8 te permite pasar el comando completo, incluidas las opciones, en el primer parámetro del método con una cadena:

    Artisan::call('migrate:install --database=foo');

### Métodos De Pruebas Mock Y Spy

Con el fin de hacer que los objetos de mocking sean más convenientes, se han agregado los nuevos métodos `mock` y` spy` a la clase de prueba base de Laravel. Estos métodos vinculan automáticamente la clase simulada en el contenedor. Por ejemplo: 

    // Laravel 5.7
    $this->instance(Service::class, Mockery::mock(Service::class, function ($mock) {
        $mock->shouldReceive('process')->once();
    }));

    // Laravel 5.8
    $this->mock(Service::class, function ($mock) {
        $mock->shouldReceive('process')->once();
    });

### Preservación De Llaves Para Recursos Eloquent

Al devolver una [colección de recursos Eloquent](/docs/{{version}}/eloquent-resources) desde una ruta, Laravel restablece las llaves de la colección para que estén en orden numérico simple:

    use App\User;
    use App\Http\Resources\User as UserResource;

    Route::get('/user', function () {
        return UserResource::collection(User::all());
    });

Al usar Laravel 5.8, puedes agregar una propiedad `preserveKeys` a tu clase de recurso que indica si se deben conservar las llaves de la colección. De forma predeterminada, y para mantener la coherencia con las versiones anteriores de Laravel, las llaves se restablecerán de forma predeterminada:

    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Resources\Json\JsonResource;

    class User extends JsonResource
    {
        /**
         * Indicates if the resource's collection keys should be preserved.
         *
         * @var bool
         */
        public $preserveKeys = true;
    }

Cuando la propiedad `preserveKeys` se establece en `true`, las llaves de la colección se conservarán:

    use App\User;
    use App\Http\Resources\User as UserResource;

    Route::get('/user', function () {
        return UserResource::collection(User::all()->keyBy->id);
    });

### Método De Orden Superior `orWhere` Para Eloquent

En versiones anteriores de Laravel, la combinación de múltiples scopes de modelo Eloquent a través de un operador de consulta `or` requería el uso de Closure callbacks:

    // scopePopular and scopeActive methods defined on the User model...
    $users = App\User::popular()->orWhere(function (Builder $query) {
        $query->active();
    })->get();

Laravel 5.8 introduce un método de "orden superior" `orWhere` que te permite encadenar estos scopes con fluidez sin el uso de Clousures:

    $users = App\User::popular()->orWhere->active()->get();

### Mejoras Al Comando Artisan Serve

En versiones anteriores de Laravel, el comando `serve` de Artisan levantaría tu aplicación en el puerto `8000`. Si otro proceso del comando `serve` ya estaba escuchando en este puerto, un intento de levantar una segunda aplicación a través de `serve` fallaría. A partir de Laravel 5.8, `serve` ahora buscará los puertos disponibles hasta el puerto `8009`, lo que te permite levantar múltiples aplicaciones a la vez.

### Mapeo de Archivos Blade

Al compilar plantillas Blade, Laravel ahora agrega un comentario en la parte superior del archivo compilado que contiene la ruta a la plantilla Blade original.

### Drivers de DynamoDB Para Cache Y Sesión

Laravel 5.8 introduce [DynamoDB](https://aws.amazon.com/dynamodb/) drivers para cache y sesión. DynamoDB es una base de datos NoSQL sin servidor proporcionada por Amazon Web Services. La configuración predeterminada para el driver de caché `dynamodb` se puede encontrar en el [archivo de configuración para cache](https://github.com/laravel/laravel/blob/master/config/cache.php) de Laravel 5.8.

### Soporte para Carbon 2.0

Laravel 5.8 proporciona soporte para la versión `~ 2.0` del paquete de manipulación de fechas Carbon.

### Soporte para Pheanstalk 4.0

Laravel 5.8 proporciona soporte para la versión `~ 4.0` del paquete de colas Pheanstalk. Si estás utilizando el paquete Pheanstalk en tu aplicación, actualiza tu paquete a la versión `~ 4.0` a través de Composer.
