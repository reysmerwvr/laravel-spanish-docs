# Guía De Actualización

- [Actualizando de 5.8.0 desde 5.7](#upgrade-5.8.0)

<a name="high-impact-changes"></a>
## Cambios De Alto Impacto

<div class="content-list" markdown="1">
- [TTL De Caché En Segundos](#cache-ttl-in-seconds)
- [Mejoras De Seguridad De Bloqueo De Caché](#cache-lock-safety-improvements)
- [Parseo De Variables De Entorno](#environment-variable-parsing)
- [Cambio de Directorio de Archivos Markdown](#markdown-file-directory-change)
- [Canales De Notificación Nexmo / Slack](#nexmo-slack-notification-channels)
</div>

<a name="medium-impact-changes"></a>
## Cambios De Mediano Impacto

<div class="content-list" markdown="1">
- [Generadores Y Servicios Etiquetados De Container](#container-generators)
- [Restricciones de la versión de SQLite](#sqlite)
- [Preferir Clases String Y Array Sobre Helpers](#string-and-array-helpers)
- [Proveedores De Servicios Diferidos](#deferred-service-providers)
- [Cumplimiento de PSR-16](#psr-16-conformity)
- [Modelos De Nombre Que Terminan Con Plurales Irregulares](#model-names-ending-with-irregular-plurals)
- [Modelos Personalizados Para Pivote Con IDs Incrementales](#custom-pivot-models-with-incrementing-ids)
- [Pheanstalk 4.0](#pheanstalk-4)
</div>

<a name="upgrade-5.8.0"></a>
## Actualizando de 5.8.0 desde 5.7

#### Tiempo Estimado De Actualización: 1 Hora

>{note} Tratamos de documentar cada cambio significativo. Debido a que alguno de estos cambios significativos están en partes ocultas dentro del framework solo una porción de estos cambios podria afectar tu aplicación. 

<a name="updating-dependencies"></a>
### Actualización De Dependencias

Actualiza tu dependencia `laravel/framework` a  `5.8.*` en tu archivo `composer.json`.

Luego, examina cualquier paquete de terceros que sean consumidos por tu aplicación y verifica que estén usando la versión con soporte para Laravel 5.8.

<a name="the-application-contract"></a>
### El Contrato `Aplicación`

#### El Método `environment`

**Probabilidad De Impacto: Muy Baja** 

La firma del método `environment` del contrato `Illuminate/Contracts/Foundation/Application` [ha cambiado](https://github.com/laravel/framework/pull/26296). Si estás implementando este contrato en tu aplicación, debes actualizar la firma del método:

    /**
     * Get or check the current application environment.
     *
     * @param  string|array  $environments
     * @return string|bool
     */
    public function environment(...$environments);

#### Métodos Añadidos

**Probabilidad De Impacto: Muy Baja**

Los métodos `bootstrapPath`, `configPath`, `databasePath`, `environmentPath`, `resourcePath`, `storagePath`, `resolveProvider`, `bootstrapWith`, `configurationIsCached`, `detectEnvironment`, `environmentFile`, `environmentFilePath`, `getCachedConfigPath`, `getCachedRoutesPath`, `getLocale`, `getNamespace`, `getProviders`, `hasBeenBootstrapped`, `loadDeferredProviders`, `loadEnvironmentFrom`, `routesAreCached`, `setLocale`, `shouldSkipMiddleware` y `terminate`  [Fueron añadidos a la interfaz `Illuminate/Contracts/Foundation/Application`](https://github.com/laravel/framework/pull/26477).

En el caso poco probable de que implementes esta interfaz, debes añadir estos métodos a la implementación. 

<a name="authentication"></a>
### Autenticación 

#### Parámetro De Ruta De La Notificación De Restablecimiento De Contraseña  

**Probabilidad De Impacto: Muy Baja**

Cuando un usuario solicita un enlace para restablecer su contraseña, Laravel genera la URL utilizando el helper `route` para crear una URL a la ruta denominada` password.reset`. Cuando se usa Laravel 5.7, el token se pasa al helper `route` sin un nombre explícito, de manera que:

    route('password.reset', $token);

Pero cuando se usa Laravel 5.8, el token se pasa al helper `route` como un parámetro explícito:

    route('password.reset', ['token' => $token]);

Por lo tanto, si estás definiendo tu propia ruta `password.reset`, debes asegurarte de que contenga un parámetro` {token} `en tu URI.

#### Nueva Longitud De Contraseña Por Defecto

**Probabilidad De Impacto: Baja**

La longitud de la contraseña requerida al elegir o restablecer una contraseña se [cambió a al menos ocho caracteres](https://github.com/laravel/framework/pull/25957).

<a name="cache"></a>
### Caché

<a name="cache-ttl-in-seconds"></a>
#### TTL En Segundos

**Probabilidad De Impacto: Muy Alta**

Para permitir un tiempo de caducidad más granular al almacenar elementos, el tiempo de vida del elemento de caché ha cambiado de minutos a segundos. Se actualizaron los métodos `put`,` putMany`, `add`,` remember` y `setDefaultCacheTime` de la clase `Illuminate\Cache\Repository` y sus clases extendidas, así como el método `put` de cada almacenamiento de caché se actualizaron con este comportamiento cambiado. Consulte [los PR relacionados](https://github.com/laravel/framework/pull/27276) para obtener más información.

Si estás pasando un número entero a cualquiera de estos métodos, debes actualizar tu código para asegurarte que ahora estás pasando la cantidad de segundos que deseas que el elemento permanezca en el caché. Alternativamente, puedes pasar una instancia de `DateTime` que indica cuándo debe expirar el elemento:

    // Laravel 5.7 - Store item for 30 minutes...
    Cache::put('foo', 'bar', 30);

    // Laravel 5.8 - Store item for 30 seconds...
    Cache::put('foo', 'bar', 30);

    // Laravel 5.7 / 5.8 - Store item for 30 seconds...
    Cache::put('foo', 'bar', now()->addSeconds(30));

> {tip} Este cambio hace que el sistema de caché Laravel sea totalmente compatible con el [estándar de la libreria de almacenamiento en caché PSR-16](https://www.php-fig.org/psr/psr-16/)

<a name="psr-16-conformity"></a>
#### Cumplimiento de PSR-16

**Probabilidad De Impacto: Media**

Además de [los cambios de valor de retorno descritos abajo](#the-repository-and-store-contracts), el argumento TTL de los métodos `put`,` putMany` y `add` de la clase `Illuminate\Cache\Repository` se actualizó para cumplir mejor con la especificación del PSR-16. El nuevo comportamiento proporciona un valor predeterminado de `null`, por lo que una llamada sin especificar un TTL dará como resultado el almacenamiento del elemento de caché para siempre. Además, el almacenamiento de elementos de caché con un TTL de 0 o inferior eliminará los elementos del caché. Vea el [PR Relacionado](https://github.com/laravel/framework/pull/27217) Para más información.

El evento `KeyWritten` [también fue actualizado](https://github.com/laravel/framework/pull/27265) con esos cambios.

<a name="cache-lock-safety-improvements"></a>
#### Mejoras De Seguridad De Bloqueo

**Probabilidad De Impacto: Alta**

En laravel 5.7 y versiones anteriores, la característica "atomic lock" proporcionada por algunos controladores de caché podría tener un comportamiento no deseado llevando a la liberación prematura de los bloqueos.

Por ejemplo: **cliente A** adquiere un bloqueo `foo` con una expiración de 10 segundos. Al **cliente A** realmente le toma 20 segundos finalizar esta tarea. El bloqueo es liberado automáticamente por el caché del sistema y en 10 segudos dentro del tiempo de procesamiento de **Del Cliente A**. El **Cliente B** adquiere un bloqueo `foo`. El **Client A** finalmente termina su tarea y libera el bloqueo `foo`, inadvertidamente liberando el tiempo en espera **Del Cliente B** . Ahora el **Client C** es capaz de adquirir un bloqueo. 

A manera de mitigar este escenario, los bloqueos ahora son generados con un "token de alcance" lo que permite al framework asegurarse de que, en circunstancias normales, solo el propietario de bloqueo pueda liberar el bloqueo.

Si estás usando el método `Cache::lock()->get(Closure)` de interacción con bloqueos, no se requiere de cambios: 

    Cache::lock('foo', 10)->get(function () {
        // Lock will be released safely automatically...
    });

Sin embargo, si estás llamando manualmente a `Cache::lock()->release()`, debes actualizar tu código para mantener una instancia del bloqueo. Luego, una vez que hayas terminado de realizar tu tarea, puedes llamar al método `release` en **la misma instancia de bloqueo**. Por ejemplo:

    if ($lock = Cache::lock('foo', 10)->get()) {
        // Perform task...

        $lock->release();
    }

A veces, es posible que desees adquirir un bloqueo en un proceso y liberarlo en otro proceso. Por ejemplo, puede adquirir un bloqueo durante una solicitud web y deseas liberar el bloqueo al final de un trabajo en cola que se activa con esa solicitud. En este escenario, debes pasar el "token de propietario" del ámbito del bloqueo al trabajo en cola para que el trabajo pueda volver a crear una instancia del bloqueo utilizando el token dado:

    // Within Controller...
    $podcast = Podcast::find(1);

    if ($lock = Cache::lock('foo', 120)->get()) {
        ProcessPodcast::dispatch($podcast, $lock->owner());
    }

    // Within ProcessPodcast Job...
    Cache::restoreLock('foo', $this->owner)->release();

Si deseas liberar un bloqueo sin respetar a su propietario actual, puedes usar el método `forceRelease`: 

    Cache::lock('foo')->forceRelease();

<a name="the-repository-and-store-contracts"></a>
####  Los Contratos `Repository` Y `Store`

**Probabilidad De Impacto: Muy Baja**

Para cumplir con el `PSR-16` los valores de retorno de los métodos` put` y `forever` del contrato `Illuminate\Contracts\Cache\Repository` y los valores de retorno del `put`,` putMany` y los métodos `forever` del contrato `Illuminate\Contracts\Cache\Store` [se han cambiado](https://github.com/laravel/framework/pull/26726) de `void` a` bool`.

<a name="collections"></a>
### Colecciones 

#### El Método `firstWhere`

**Probabilidad De Impacto: Muy Baja**

La firma del método `firstWhere` [ha cambiado](https://github.com/laravel/framework/pull/26261) para coincidir con la firma del método` where`. Si estás sobreescribiendo este método, debes actualizar la firma del método para que coincida con su padre:

    /**
     * Get the first item by the given key value pair.
     *
     * @param  string  $key
     * @param  mixed  $operator
     * @param  mixed  $value
     * @return mixed
     */
    public function firstWhere($key, $operator = null, $value = null);

<a name="console"></a>
### Consola

#### El Contrato `Kernel` 

**Probabilidad De Impacto: Muy Baja**

El método `terminate` [se ha agregado al contrato `Illuminate/Contracts/Console/Kernel`](https://github.com/laravel/framework/pull/26393). Si estás implementando esta interfaz, debes agregar este método a tu implementación.

<a name="container"></a>
### Contenedor

<a name="container-generators"></a>
#### Generadores Y Servicios Etiquetados

**Probabilidad De Impacto: Media**

El método `tagged` del contenedor ahora utiliza generadores de PHP para crear una instancia "vaga" (lazy) de los servicios con una etiqueta determinada. Esto proporciona una mejora en el rendimiento si no estás utilizando todos los servicios etiquetados.

Debido a este cambio, el método `tagged` ahora devuelve un `iterable` en lugar de un `array`. Si estás declarando el tipo del valor de retorno de este método, debes asegurarte de que la declaración del tipo cambie a `iterable`.

Además, ya no es posible acceder directamente a un servicio etiquetado por su valor en el arreglo, como por ejemplo `$container->tagged('foo')[0]`.

#### El Método `resolve` 

**Probabilidad De Impacto: Muy Baja**

El método `resolver` [ahora acepta](https://github.com/laravel/framework/pull/27066) un nuevo parámetro booleano que indica si los eventos de (resolución de callbacks) deben activarse / ejecutarse durante la creación de instancias de un objeto. Si estás sobreescribiendo este método, debes actualizar la firma del método para que coincida con su padre.

#### El Método `addContextualBinding`

**Probabilidad De Impacto: Muy Baja**

El método `addContextualBinding` [se agregó al contrato `Illuminate\Contracts\Container\Container`](https://github.com/laravel/framework/pull/26551). Si estás implementando esta interfaz, debes agregar este método a tu implementación.

#### El Método `tagged` 

**Probabilidad De Impacto: Baja**

La firma del método `tagged` [ha sido cambiada](https://github.com/laravel/framework/pull/26953) y ahora devuelve un `iterable` en lugar de un `array`. Si en tu código has declarado el tipo de algún parámetro que obtiene el valor de retorno de este método con `array`, debes modificar la declaración de tipo a `iterable`.

#### El Método `flush`

**Probabilidad De Impacto: Muy Baja**

El método `flush` [se agregó al contrato `Illuminate\Contracts\Container\Container`](https://github.com/laravel/framework/pull/26477). Si estás implementando esta interfaz, debes agregar este método a tu implementación.

<a name="database"></a>
### Base De Datos

#### Valores No Citados MySQL JSON 

**Probabilidad De Impacto: Baja**

El constructor de consultas ahora devolverá valores JSON no citados al usar MySQL y MariaDB. Este comportamiento es consistente con las otras bases de datos soportadas:

    $value = DB::table('users')->value('options->language');

    dump($value);

    // Laravel 5.7...
    '"en"'

    // Laravel 5.8...
    'en'

Como resutlado el operador `->>` ya no es soportado ni necesario.

<a name="sqlite"></a>
#### SQLite

**Probabilidad De Impacto: Media**

A partir de Laravel 5.8, la [versión SQLite soportada más antigua](https://github.com/laravel/framework/pull/25995) es SQLite 3.7.11. Si estás utilizando una versión anterior de SQLite, debe actualizarla (se recomienda SQLite 3.8.8+).

<a name="eloquent"></a>
### Eloquent

<a name="model-names-ending-with-irregular-plurals"></a>
#### Modelos De Nombre Que Terminan Con Plurales Irregulares

**Probabilidad De Impacto: Media**

A partir de Laravel 5.8, los nombres de modelos de múltiples palabras que terminan en una palabra con un plural irregular [ahora están correctamente pluralizados (solo válido para inglés)](https://github.com/laravel/framework/pull/26421).

    // Laravel 5.7...
    App\Feedback.php -> feedback (correctly pluralized)
    App\UserFeedback.php -> user_feedbacks (incorrectly pluralized)

    // Laravel 5.8
    App\Feedback.php -> feedback (correctly pluralized)
    App\UserFeedback.php -> user_feedback (correctly pluralized)

Si tienes un modelo incorrectamente pluralizado, puedes continuar usando el nombre de la tabla anterior definiendo una propiedad `$table` en tu modelo:

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'user_feedbacks';

<a name="custom-pivot-models-with-incrementing-ids"></a>
#### Modelos Personalizados Para Pivote Con IDs Incrementales

Si has definido una relación de muchos a muchos que usa un modelo personalizado para tablas pivote, y ese modelo tiene una clave primaria autoincremental, debes asegurarte de que tu clase de modelo personalizado para pivote defina una propiedad `incrementing` que se establece en `true`:

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = true;

#### El Método `loadCount` 

**Probabilidad De Impacto: Baja**

Se ha agregado un método `loadCount` a la clase base `Illuminate\Database\Eloquent\Model`. Si tu aplicación también define un método `loadCount`, puede entrar en conflicto con la definición de Eloquent.

#### El Método `originalIsEquivalent` 

**Probabilidad De Impacto: Muy Baja**

El método `originalIsEquivalent` del trait `Illuminate\Database\Eloquent\Concerns\HasAttributes` [ha sido cambiado](https://github.com/laravel/framework/pull/26391) de `protected` a `public`.

#### Conversión (Casting) Automática De La Propiedad Soft-Deleted `deleted_at` 

**Probabilidad De Impacto: Baja**

La propiedad `deleted_at` [ahora se convertirá automáticamente](https://github.com/laravel/framework/pull/26985) en una instancia de` Carbon` cuando tu modelo Eloquent use el trait `Illuminate\Database\Eloquent\SoftDeletes`. Puedes sobreescribir este comportamiento escribiendo tu accesador personalizado para esa propiedad o agregándolo manualmente al atributo `casts`:

    protected $casts = ['deleted_at' => 'string'];

#### Métodos `getForeignKey` Y `getOwnerKey` De BelongsTo

**Probabilidad De Impacto: Baja**

Los métodos `getForeignKey`, `getQualifiedForeignKey` y `getOwnerKey` de la relación `BelongsTo` han sido renombrados a `getForeignKeyName`, `getQualifiedForeignKeyName` y `getOwnerKeyName`  respectivamente, haciendo que los nombres de los métodos sean consistentes con las otras relaciones ofrecidas por Laravel.

<a name="#environment-variable-parsing"></a>
### Parseo De Variables De Entorno

**Probabilidad de Impacto: Alto**

El paquete [phpdotenv](https://github.com/vlucas/phpdotenv) que es usado para parsear archivos .env ha liberado una nueva versión, que podría impactar en los resultados retornados desde el helper `env`. Especificamente, el carácter `#` en un valor sin comillas ahora será considerado como un comentario en lugar de parte del valor.

Comportamiento anterior:

    ENV_VALUE=foo#bar

    env('ENV_VALUE'); // foo#bar

Nuevo comportamiento:

    ENV_VALUE=foo#bar
    env('ENV_VALUE'); // foo

Para mantener el comportamiento anterior, puedes envolver los valores de entorno en comillas:

    ENV_VALUE="foo#bar"

    env('ENV_VALUE'); // foo#bar

Para más información, por favor revisa la [guía de actualización de phpdotenv](https://github.com/vlucas/phpdotenv/blob/master/UPGRADING.md)

<a name="events"></a>
### Eventos

#### El Método `fire` 

**Probabilidad De Impacto: Baja**

El método `fire` (que fue puesto en desuso en Laravel 5.4) de la clase `Illuminate/Events/Dispatcher` [ha sido eliminado](https://github.com/laravel/framework/pull/26392). 
Debes usar el método `dispatch` en su lugar.

<a name="exception-handling"></a>
### Manejo De Excepciones 

#### El Contrato de `ExceptionHandler` 

**Probabilidad De Impacto: Baja**

El método `shouldReport` [se ha agregado al contrato `Illuminate\Contracts\Debug\ExceptionHandler`](https://github.com/laravel/framework/pull/26193). Si estás implementando esta interfaz, debes agregar este método a tu implementación.

#### El Método `renderHttpException`

**Probabilidad De Impacto: Baja**

La firma del método `renderHttpException` de la clase `Illuminate\Foundation\Exceptions\Handler` [ha cambiado](https://github.com/laravel/framework/pull/25975). Si está sobreescribiendo este método en tu manejador de excepciones, debes actualizar la firma del método para que coincida con su padre:

    /**
     * Render the given HttpException.
     *
     * @param  \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface  $e
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function renderHttpException(HttpExceptionInterface $e);

<a name="mail"></a>
### Correo electrónico

<a name="markdown-file-directory-change"></a>
<a name="markdown-file-directory-change"></a>
### Cambio de Directorio de Archivos Markdown

**Probabilidad De Impacto: Alta**

Si has publicado los componentes de correo de Markdown de Laravel usando el comando `vendor: publish`, debes cambiar el nombre del directorio `/resources/views/vendor/mail/markdown` a `text`.

Además, el método `markdownComponentPaths` [ha sido renombrado](https://github.com/laravel/framework/pull/26938) a `textComponentPaths`. Si estás anulando este método, debes actualizar el nombre del método para que coincida con su padre.

#### Cambio De Firma En Métodos De La Clase `PendingMail`

**Probabilidad De Impacto: Muy Baja**

Los métodos `send`,` sendNow`, `queue`,` later` y `fill` de la clase `Illuminate\Mail\PendingMail` [se han cambiado](https://github.com/laravel/framework/pull/26790) para aceptar una instancia `Illuminate\Contracts\Mail\Mailable` en lugar de `Illuminate\Mail\Mailable`. Si estás sobreescribiendo algunos de estos métodos, debes actualizar su firma para que coincida con su padre.

<a name="queue"></a>
### Colas

<a name="pheanstalk-4"></a>
#### Pheanstalk 4.0

**Probabilidad De Impacto: Media**

Laravel 5.8 proporciona soporte para la versión `~ 4.0` de los paquetes de colas Pheanstalk. Si estás utilizando el paquetes de terceros Pheanstalk en tu aplicación, actualiza tus paquetes a la versión `~ 4.0` a través de Composer.

#### El Contrato `Job` 

**Probabilidad De Impacto: Muy Baja**

Los métodos `isReleased`,` hasFailed` y `markAsFailed` [se han agregado al contrato `Illuminate\Contracts\Queue\Job`](https://github.com/laravel/framework/pull/26908). Si estás implementando esta interfaz, debes agregar estos métodos a tu implementación.

#### Las Clases `Job::failed` Y `FailingJob` 

**Probabilidad De Impacto: Muy Baja**

Cuando un trabajo en cola falla en Laravel 5.7, el worker de la cola ejecuta el método `FailingJob::handle`. En Laravel 5.8, la lógica contenida en la clase `FailingJob` se ha movido al método `fail` directamente en la misma clase de trabajo. Debido a esto, se ha agregado un método `fail` al contrato `Illuminate\Contracts\Queue\Job`.

La clase base `Illuminate\Queue\Jobs\Job` contiene la implementación de `fail` así que una aplicación típica no debe requerir cambios de código. Sin embargo, si estás creando un worker de cola personalizado que utiliza una clase de trabajo que **no** extiende la clase de trabajo base ofrecida por Laravel, debes implementar el método `fail` manualmente en tu clase de trabajo personalizado. Puedes revisar la clase de trabajo base de Laravel como una implementación de referencia.

Este cambio permite que los workers de cola personalizados tengan más control sobre el proceso de eliminación de trabajos.

#### Redis Blocking Pop

**Probabilidad De Impacto: Muy Baja**

El uso de la función de "bloqueo emergente" del driver de cola Redis ahora es seguro. Anteriormente, había una pequeña posibilidad de que un trabajo en cola pudiera perderse si el servidor o el trabajador de Redis fallaba al mismo tiempo que se recuperaba el trabajo. Para hacer que el bloqueo emergente sea seguro, se crea una nueva lista de Redis con el sufijo `:notify` para cada cola de Laravel.

<a name="requests"></a>
### Solicitudes (Requests)

#### The `TransformsRequest` Middleware

**Probabilidad De Impacto: Baja**

El método `transform` del middleware `Illuminate\Foundation\Http\Middleware\TransformsRequest` ahora recibe la clave de entrada de solicitud "fully-qualified" cuando la entrada es un arreglo:

    'employee' => [
        'name' => 'Taylor Otwell',
    ],

    /**
     * Transform the given value.
     *
     * @param  string  $key
     * @param  mixed  $value
     * @return mixed
     */
    protected function transform($key, $value)
    {
        dump($key); // 'employee.name' (Laravel 5.8)
        dump($key); // 'name' (Laravel 5.7)
    }

<a name="routing"></a>
### Enrutamiento (Routing)

#### El Contrato `UrlGenerator` 

**Probabilidad De Impacto: Muy Baja**

El método `previous` [se ha agregado al contrato `Illuminate\Contracts\Routing\UrlGenerator`](https://github.com/laravel/framework/pull/25616). Si estás implementando esta interfaz, debes agregar este método a tu implementación.

#### La Propiedad `cachedSchema` De `Illuminate/Routing/UrlGenerator`

**Probabilidad De Impacto: Muy Baja**

El nombre de la propiedad `$cachedSchema` (que ha quedado en desuso en Laravel` 5.7`) de `Illuminate/Routing/UrlGenerator` [se ha cambiado a](https://github.com/laravel/framework/pull/26728) `$cachedScheme`.

<a name="sessions"></a>
### Sesiones

#### El middleware `StartSession`

**Probabilidad De Impacto: Muy Baja**

La lógica de persistencia de la sesión se ha [movido del método `terminate()` al método `handle()`](https://github.com/laravel/framework/pull/26410). Si estás sobreescribiendo uno o ambos de estos métodos, debes actualizarlos para reflejar estos cambios.

<a name="support"></a>
### Soporte 

<a name="string-and-array-helpers"></a>
#### Preferir Clases String Y Array Sobre Helpers

**Probabilidad De Impacto: Media**

Todos los helpers globales `array_ *` y `str_ *` [han sido puestos en desuso](https://github.com/laravel/framework/pull/26898). Debe usar los métodos de `Illuminate\Support\Arr` y `Illuminate\Support\Str` directamente.

El impacto de este cambio se ha marcado como "medio" desde que las funciones helpers se han trasladado al nuevo paquete [laravel/helpers](https://github.com/laravel/helpers) que ofrece una capa de compatibilidad hacia atrás para todos las funciones globales de arreglos y de cadenas.

<a name="deferred-service-providers"></a>
#### Proveedores De Servicios Diferidos

**Probabilidad De Impacto: Media**

La propiedad booleana `defer` en el proveedor de servicios que se usa para indicar si un proveedor está diferido [ha quedado en desuso](https://github.com/laravel/framework/pull/27067). Para marcar el proveedor de servicios como diferido, debes implementar el contrato `Illuminate\Contracts\Support\DeferrableProvider`.

#### Helper De Sólo Lectura `env`

**Probabilidad De Impacto: Bajo**

Anteriormente, el helper `env` podia retornar valores de variables de entorno que eran cambiadas en tiempo de ejecución. En Laravel 5.8, el helper `env` trata a las variables de entorno como inmutables. Si quisieras cambiar una variable de entorno en tiempo de ejecución, considera usar un valor de configuración que puede ser retornado usando el helper `config`:

Comportamiento anterior:

    dump(env('APP_ENV')); // local

    putenv('APP_ENV=staging');

    dump(env('APP_ENV')); // staging

Nuevo comportamiento:

    dump(env('APP_ENV')); // local

    putenv('APP_ENV=staging');

    dump(env('APP_ENV')); // local

<a name="testing"></a>
### Pruebas

#### Los metodos `setUp` Y `tearDown`

Los métodos `setUp` y` tearDown` ahora requieren un tipo de retorno nulo:

    protected function setUp(): void
    protected function tearDown(): void

#### PHPUnit 8

**Probabilidad De Impacto: Opcional**

De forma predeterminada, Laravel 5.8 usa PHPUnit 7. Sin embargo, opcionalmente puedes actualizar a PHPUnit 8, que requiere PHP> = 7.2. Además, lee la lista completa de cambios en [el anuncio de la versión de PHPUnit 8](https://phpunit.de/announcements/phpunit-8.html).

<a name="validation"></a>
### Validación

#### El Contrato `Validator` 

**Probabilidad De Impacto: Muy Baja**

El método `validated` [se agregó al contrato `Illuminate\Contracts\Validation\Validator`](https://github.com/laravel/framework/pull/26419):

    /**
     * Get the attributes and values that were validated.
     *
     * @return array
     */
    public function validated();

Si estás implementando esta interfaz, debes agregar este método a tu implementación.

#### El trait `ValidatesAttributes`

**Probabilidad De Impacto: Muy Baja**

Los métodos `parseTable`,` getQueryColumn` y `requireParameterCount` del trait `Illuminate\Validation\Concerns\ValidatesAttributes` se han cambiado de `protected` a` public`.

#### La Clase `DatabasePresenceVerifier` 

**Probabilidad De Impacto: Muy Baja**

El método `table` de la clase `Illuminate\Validation\DatabasePresenceVerifier` se ha cambiado de `protected` a` public`.

#### La Clase `Validator` 

**Probabilidad De Impacto: Muy Baja**

El método `getPresenceVerifierFor` de la clase `Illuminate\Validation\Validator` [ha sido cambiado](https://github.com/laravel/framework/pull/26717) de `protected` a` public`.

#### Validación De Correo Electrónico

**Probabilidad De Impacto: Muy Baja**

La regla de validación de correo electrónico ahora comprueba si el correo electrónico es compatible con [RFC5630](https://tools.ietf.org/html/rfc6530), lo que hace que la lógica de validación sea coherente con la lógica utilizada por SwiftMailer. En Laravel `5.7`, la regla` email` solo verificaba que el correo electrónico era compatible con [RFC822](https://tools.ietf.org/html/rfc822).

Por lo tanto, cuando se usa Laravel 5.8, los correos electrónicos que antes se consideraban incorrectamente no válidos ahora se considerarán válidos (por ejemplo, `hej@bär.se`). En general, esto debería considerarse una corrección de errores; sin embargo, está listado como un cambio de ruptura por precaución. [Por favor háznos saber si tienes algún problema relacionado con este cambio](https://github.com/laravel/framework/pull/26503).

<a name="view"></a>
### Vistas

#### El Método `getData` 

**Probabilidad De Impacto: Muy Baja**

El método `getData` [se agregó al contrato `Illuminate\Contracts\View\View`](https://github.com/laravel/framework/pull/26754). Si estás implementando esta interfaz, debes agregar este método a tu implementación.

<a name="notifications"></a>
### Notificaciones

<a name="nexmo-slack-notification-channels"></a>
#### Canales De Notificación Nexmo / Slack

**Probabilidad De Impacto: Alta**

Los canales de notificación de Nexmo y Slack se han extraído en paquetes oficiales. Para usar estos canales en su aplicación, requiera los siguientes paquetes:

    composer require laravel/nexmo-notification-channel
    composer require laravel/slack-notification-channel

<a name="miscellaneous"></a>
### Miseláneaos

También te recomendamos que veas los cambios en el repositorio `laravel/laravel` [de GitHub](https://github.com/laravel/laravel). Si bien muchos de estos cambios no son necesarios, es posible que desees mantener estos archivos sincronizados con tu aplicación. Algunos de estos cambios se tratarán en esta guía de actualización, pero otros, como los cambios en los archivos de configuración o los comentarios, no lo estarán. Puedes ver fácilmente los cambios con la [herramienta de comparación GitHub](https://github.com/laravel/laravel/compare/5.7...master) y elegir qué actualizaciones son importantes para ti.
