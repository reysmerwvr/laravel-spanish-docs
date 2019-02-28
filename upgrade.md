# Guía de actualización 

- [Actualizando de 5.8.0 desde 5.7](#upgrade-5.8.0)

<a name="high-impact-changes"></a>
## Cambios de alto impacto 

<div class="content-list" markdown="1">
- [Cache TTL In Seconds](#cache-ttl-in-seconds)
- [Cache Lock Safety Improvements](#cache-lock-safety-improvements)
- [Markdown File Directory Change](#markdown-file-directory-change)
- [Nexmo / Slack Notification Channels](#nexmo-slack-notification-channels)
</div>

<a name="medium-impact-changes"></a>
## Cambios De Mediano Impacto

<div class="content-list" markdown="1">
- [Container Generators & Tagged Services](#container-generators)
- [SQLite Version Constraints](#sqlite)
- [Prefer String And Array Classes Over Helpers](#string-and-array-helpers)
- [Deferred Service Providers](#deferred-service-providers)
- [PSR-16 Conformity](#psr-16-conformity)
- [Model Names Ending With Irregular Plurals](#model-names-ending-with-irregular-plurals)
- [Pheanstalk 4.0](#pheanstalk-4)
</div>

<a name="upgrade-5.8.0"></a>
## Actualizando de 5.8.0 desde 5.7

#### Tiempo Estimado De Actualización: 1 Hora

>{note} Tratamos de documentar cada cambio significativo. Debido a que alguno de estos cambios significativos estan en partes ocultas dentro del framework solo una porción de estos cambios podria afectar tu aplicación. 

<a name="updating-dependencies"></a>
### Dependencias de atualización

Actualiza tu dependencia `laravel/framework` a  `5.8.*` en tu archivo `composer.json`.

Luego, Examine cualquier paquete de terceros que sean consumidos por su aplicación y verifique que esten usando la version con soporte para Laravel 5.8. 

<a name="the-application-contract"></a>
### Contrato de la `Aplicación` (The `Application` Contract)

#### El Metodo `environment` (The `environment` Method )

**Probabilidad De Impacto: Muy Baja** 

La firma del método `environment` del contrato` Illuminate / Contracts / Foundation / Application`  [ha cambiado](https://github.com/laravel/framework/pull/26296). Si está implementando este contrato en su aplicación, debe actualizar la firma del método:

    /**
     * Get or check the current application environment.
     *
     * @param  string|array  $environments
     * @return string|bool
     */
    public function environment(...$environments);

#### Métodos Añadidos

**Probabilidad De Impacto: Muy Baja**

Los métodos `bootstrapPath`, `configPath`, `databasePath`, `environmentPath`, `resourcePath`, `storagePath`, `resolveProvider`, `bootstrapWith`, `configurationIsCached`, `detectEnvironment`, `environmentFile`, `environmentFilePath`, `getCachedConfigPath`, `getCachedRoutesPath`, `getLocale`, `getNamespace`, `getProviders`, `hasBeenBootstrapped`, `loadDeferredProviders`, `loadEnvironmentFrom`, `routesAreCached`, `setLocale`, `shouldSkipMiddleware` y `terminate`  [Fueron añadidos a `Illuminate/Contracts/Foundation/Application` contract](https://github.com/laravel/framework/pull/26477).

En el evento poco probable de que usted implemente esta interfaz, Deberia añadir estos métodos a la implementación. 

<a name="authentication"></a>
### Autenticación 

#### Restablecimiento De Contraseña Notificación Parámetro De Ruta

**Probabilidad De Impacto: Muy Baja**

Cuando un usuario solicita un enlace para restablecer su contraseña, Laravel genera la URL utilizando el ayudante `route` para crear una URL a la ruta denominada` password.reset`. Cuando se usa Laravel 5.7, el token se pasa al ayudante `route` sin un nombre explícito, de manera que:

    route('password.reset', $token);

Cuando se usa Laravel 5.8, el token se pasa al ayudante `route` como un parámetro explícito:

    route('password.reset', ['token' => $token]);

Por lo tanto, si está definiendo su propia ruta `password.reset`, debe asegurarse de que contenga un parámetro` {token} `en su URI.

<a name="cache"></a>
### Cache

<a name="cache-ttl-in-seconds"></a>
#### TTL in seconds

**Probabilidad De Impacto: Muy Alta**

Para permitir un tiempo de caducidad más granular al almacenar elementos, el tiempo de vida del elemento de caché ha cambiado de minutos a segundos. Se actualizaron los métodos `put`,` putMany`, `add`,` remember` y `setDefaultCacheTime` de la clase` Illuminate \ Cache \ Repository` y sus clases extendidas, así como el método `put` de cada tienda de caché Con este comportamiento cambiado. Consulte [las PR relacionadas](https://github.com/laravel/framework/pull/27276) para obtener más información.

Si está pasando un número entero a cualquiera de estos métodos, debe actualizar su código para asegurarse de que ahora está pasando la cantidad de segundos que desea que el elemento permanezca en el caché. Alternativamente, puede pasar una instancia de `DateTime` que indica cuándo debe expirar el elemento:

    // Laravel 5.7 - Store item for 30 minutes...
    Cache::put('foo', 'bar', 30);

    // Laravel 5.8 - Store item for 30 seconds...
    Cache::put('foo', 'bar', 30);

    // Laravel 5.7 / 5.8 - Store item for 30 seconds...
    Cache::put('foo', 'bar', now()->addSeconds(30));

> {tip} este cambio hace que el sistema de caché Laravel sea totalmente compatible con el [estándar de la libreria de almacenamiento en caché PSR-16](https://www.php-fig.org/psr/psr-16/)

<a name="psr-16-conformity"></a>
#### Conformidad PSR-16 (PSR-16 Conformity)

**Probabilidad De Impacto: Media**

Además de los cambios de valor de retorno de arriba, el argumento TTL de los métodos `put`,` putMany` y `add` de la clase` Illuminate \ Cache \ Repository` se actualizó para cumplir mejor con la especificación del PSR-16. El nuevo comportamiento proporciona un valor predeterminado de `null`, por lo que una llamada sin especificar un TTL dará como resultado el almacenamiento del elemento de caché para siempre. Además, el almacenamiento de elementos de caché con un TTL de 0 o inferior eliminará los elementos del caché. Vea el [PR Relacionado](https://github.com/laravel/framework/pull/27217) Para mas información.

El evento `KeyWritten` [Fue Actualizado tambien](https://github.com/laravel/framework/pull/27265) con esos cambios.

<a name="cache-lock-safety-improvements"></a>
#### Mejoras de seguridad de bloqueo

**Probabilidad De Impacto: Alta**

En laravel 5.7 y versiones anteriores, las caracteristica "atomic lock" proporcionada por algunos controladores de cache podría tener un comportamiento no deseado llevando a la liberacion prematura de los bloqueos

Por ejemplo: **cliente A** adquiere un bloqueo `foo` con una expiración de 10 segundos. Al **cliente A** realmente le toma 20 segundos finalizar esta tarea. El bloqueo es liberado automaticamente por el cache del sistema y en 10 segudos dentro del tiempo de procesamiento de **Del Cliente A**. El **Cliente B** adquiere un bloqueo `foo`. El **Client A** finalmente termina su tarea y libera el bloqueo `foo`, inadvertidamente liberando el tiempo en espera **Del Cliente B** . Ahora el **Client C** es capaz de adquirir un bloqueo. 

A manera de mitigar este escenario, los bloqueos ahora son generados con un "token de alcance" lo que permite al framework asegurarse de que, en circunstancias normales, solo el propietario de bloqueo pueda liberar el bloqueo.

Si estas usando el método `Cache::lock()->get(Closure)` de interaccióm con bloqueos, no se requiere de cambios: 

    Cache::lock('foo', 10)->get(function () {
        // Lock will be released safely automatically...
    });

Sin embargo, si está llamando manualmente a `Cache :: lock () -> release ()`, debe actualizar su código para mantener una instancia del bloqueo. Luego, una vez que haya terminado de realizar su tarea, puede llamar al método `release` en ** la misma instancia de bloqueo **. Por ejemplo:

    if ($lock = Cache::lock('foo', 10)->get()) {
        // Perform task...

        $lock->release();
    }

A veces, es posible que desee adquirir un bloqueo en un proceso y liberarlo en otro proceso. Por ejemplo, puede adquirir un bloqueo durante una solicitud web y desea liberar el bloqueo al final de un trabajo en cola que se activa con esa solicitud. En este escenario, debe pasar el "token de propietario" del ámbito del bloqueo al trabajo en cola para que el trabajo pueda volver a crear una instancia del bloqueo utilizando el token dado:

    // Within Controller...
    $podcast = Podcast::find(1);

    if ($lock = Cache::lock('foo', 120)->get()) {
        ProcessPodcast::dispatch($podcast, $lock->owner());
    }

    // Within ProcessPodcast Job...
    Cache::restoreLock('foo', $this->owner)->release();

Si le gustaria liberar un bloqueo sin respetar a su propietario actual, puede usar el método `forceRelease`: 

    Cache::lock('foo')->forceRelease();

####  Los Contratos De `Repository` Y `Store`

**Probabilidad De Impacto: Muy Baja**

Para cumplir con el `PSR-16` los valores de retorno de los métodos` put` y `forever` del contrato` Illuminate \ Contracts \ Cache \ Repository` y los valores de retorno del `put`,` putMany` y los métodos `forever` del contrato` Illuminate \ Contracts \ Cache \ Store` [se han cambiado](https://github.com/laravel/framework/pull/26726) de `void` a` bool`.

<a name="collections"></a>
### Colecciones 

#### El Método `firstWhere`

**Probabilidad De Impacto: Muy Baja**

La firma del método `firstWhere` [ha cambiado](https://github.com/laravel/framework/pull/26261) para coincidir con la firma del método` where`. Si está anulando este método, debe actualizar la firma del método para que coincida con su padre:

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

El método `terminate` [se ha agregado al contrato` Illuminate / Contracts / Console / Kernel`](https://github.com/laravel/framework/pull/26393). Si está implementando esta interfaz, debe agregar este método a su implementación.

<a name="container"></a>
### Contenedor

<a name="container-generators"></a>
#### Generadores Y Servicios Etiquetados

**Probabilidad De Impacto: Media**

El método `tagged` del contenedor ahora utiliza generadores de PHP para crear una instancia vaga de los servicios con una etiqueta determinada. Esto proporciona una mejora en el rendimiento si no está utilizando todos los servicios etiquetados.

Debido a este cambio, el método `tagged` ahora devuelve un` iterable` en lugar de un `array`. Si está insinuando el valor de retorno de este método, debe asegurarse de que su sugerencia de tipo cambie a 'iterable'.

Además, ya no es posible acceder directamente a un servicio etiquetado por su valor de compensación de matriz, como `$ container-> tagged ('foo') [0]`.

#### El Método `resolve` 

**Probabilidad De Impacto: Muy Baja**

El método `resolver` [ahora acepta](https://github.com/laravel/framework/pull/27066) un nuevo parámetro booleano que indica si los eventos de (resolución de devoluciones de llamada) deben activarse / ejecutarse durante la creación de instancias de un objeto. Si está anulando este método, debe actualizar la firma del método para que coincida con su principal.

#### El Método `addContextualBinding` 

**Probabilidad De Impacto: Muy Baja**

El método `addContextualBinding` [se agregó al contrato` Illuminate \ Contracts \ Container \ Container`](https://github.com/laravel/framework/pull/26551). Si está implementando esta interfaz, debe agregar este método a su implementación.

#### El Método `tagged` 

**Probabilidad De Impacto: Baja**

La firma del método `tagged` [ha sido cambiada](https://github.com/laravel/framework/pull/26953) y ahora devuelve un` iterable` en lugar de un `array`. Si tiene algún tipo de referencia en su código, algún parámetro que obtiene el valor de retorno de este método con `array`, debe modificar la sugerencia de tipo a` iterable`.

#### El Método  `flush`

**Probabilidad De Impacto: Muy Baja**

El método `flush` [se agregó al contrato` Illuminate \ Contracts \ Container \ Container`](https://github.com/laravel/framework/pull/26477). Si está implementando esta interfaz, debe agregar este método a su implementación.

<a name="database"></a>
### Database

#### Valores No Citados MySQL JSON 

**Probabilidad De Impacto: Baja**

El generador de consultas ahora devolverá valores JSON no citados al usar MySQL y MariaDB. Este comportamiento es consistente con las otras bases de datos soportadas:

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

A partir de Laravel 5.8, la [versión SQLite soportada más antigua](https://github.com/laravel/framework/pull/25995) es SQLite 3.7.11. Si está utilizando una versión anterior de SQLite, debe actualizarla (se recomienda SQLite 3.8.8+).

<a name="eloquent"></a>
### Eloquent

<a name="model-names-ending-with-irregular-plurals"></a>
#### Modelos De Nombre Que Terminan Con Plurales Irregulares

**Probabilidad De Impacto: Media**

A partir de Laravel 5.8, los nombres de modelos de múltiples palabras que terminan en una palabra con un plural irregular [ahora están correctamente pluralizados](https://github.com/laravel/framework/pull/26421).

    // Laravel 5.7...
    App\Feedback.php -> feedback (correctly pluralized)
    App\UserFeedback.php -> user_feedbacks (incorrectly pluralized)

    // Laravel 5.8
    App\Feedback.php -> feedback (correctly pluralized)
    App\UserFeedback.php -> user_feedback (correctly pluralized)

Si tiene un modelo incorrectamente pluralizado, puede continuar usando el nombre de la tabla anterior definiendo una propiedad `$ table` en su modelo:

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'user_feedbacks';

#### El Método `loadCount` 

**Probabilidad De Impacto: Baja**

Se ha agregado un método `loadCount` a la base` Illuminate \ Database \ Eloquent \ Model`. Si su aplicación también define un método `loadCount`, puede entrar en conflicto con la definición de Eloquent.

#### El Método `originalIsEquivalent` 

**Probabilidad De Impacto: Muy Baja**

El método `originalIsEquivalent` del rasgo` Illuminate \ Database \ Eloquent \ Concerns \ HasAttributes` [ha sido cambiado](https://github.com/laravel/framework/pull/26391) de `protected` a` public`.

#### Casting Automático Soft-Deleted De La Propiedad `deleted_at` 

**Probabilidad De Impacto: Baja**

La propiedad `deleted_at` [ahora se convertirá automáticamente](https://github.com/laravel/framework/pull/26985) en una instancia de` Carbon` cuando su modelo Eloquent use el rasgo `Illuminate \ Database \ Eloquent \ SoftDeletes`. Puede anular este comportamiento escribiendo su descriptor de acceso personalizado para esa propiedad o agregándolo manualmente al atributo `casts`:

    protected $casts = ['deleted_at' => 'string'];

#### Método BelongsTo `getForeignKey` 

**Probabilidad De Impacto: Baja**

Los métodos `getForeignKey` y` getQualifiedForeignKey` de la relación `BelongsTo` han sido renombrados a` getForeignKeyName` y `getQualifiedForeignKeyName` respectivamente, haciendo que los nombres de los métodos sean consistentes con las otras relaciones ofrecidas por Laravel.

<a name="events"></a>
### Events

#### El Método `fire` 

**Probabilidad De Impacto: Baja**

El método `fire` (que fue desaprobado en Laravel 5.4) de la clase` Illuminate / Events / Dispatcher` [ha sido eliminado](https://github.com/laravel/framework/pull/26392).
Deberia usar el método `dispatch` en su lugar.

<a name="exception-handling"></a>
### Manejo De Excepciones 

#### El Contrato de `ExceptionHandler` 

**Probabilidad De Impacto: Baja**

El método `shouldReport` [se ha agregado al contrato` Illuminate \ Contracts \ Debug \ ExceptionHandler`](https://github.com/laravel/framework/pull/26193). Si está implementando esta interfaz, debe agregar este método a su implementación.

#### El Método `renderHttpException`

**Probabilidad De Impacto: Baja**

La firma del método `renderHttpException` de la clase` Illuminate \ Foundation \ Exceptions \ Handler` [ha cambiado](https://github.com/laravel/framework/pull/25975). Si está anulando este método en su manejador de excepciones, debe actualizar la firma del método para que coincida con su padre:

    /**
     * Render the given HttpException.
     *
     * @param  \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface  $e
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function renderHttpException(HttpExceptionInterface $e);

<a name="facades"></a>
### Facades

#### Resolución De Servicios Facade

**Probabilidad De Impacto: Baja**

El método `getFacadeAccessor` ahora puede [solo devolver el valor de cadena que representa el identificador del contenedor del servicio](https://github.com/laravel/framework/pull/25525). Anteriormente, este podía devolver una instancia de objeto.

<a name="mail"></a>
### Correo

<a name="markdown-file-directory-change"></a>
<a name="markdown-file-directory-change"></a>
### Cambio de Directorio de Archivos Markdown

**Probabilidad De Impacto: Alta**

Si ha publicado los componentes de correo de Markdown de Laravel usando el comando `vendor: publish`, debe cambiar el nombre del directorio` / resources / views / vendor / mail / markdown` a `text`.

Además, el método `markdownComponentPaths` [ha sido renombrado](https://github.com/laravel/framework/pull/26938) a` textComponentPaths`. Si está anulando este método, debe actualizar el nombre del método para que coincida con su padre.

#### Método De Cambios De Firma En La Clase `PendingMail`

**Probabilidad De Impacto: Muy Baja**

Los métodos `send`,` sendNow`, `queue`,` later` y `fill` de la clase` Illuminate \ Mail \ PendingMail` [se han cambiado] (https://github.com/laravel/framework/pull / 26790) para aceptar una instancia `Illuminate \ Contracts \ Mail \ Mailable` en lugar de` Illuminate \ Mail \ Mailable`. Si está anulando algunos de estos métodos, debe actualizar su firma para que coincida con su padre.

<a name="queue"></a>
### Cola

<a name="pheanstalk-4"></a>
#### Pheanstalk 4.0

**Probabilidad De Impacto: Media**

Laravel 5.8 proporciona soporte para la versión `~ 4.0` de las librerias de colas Pheanstalk. Si está utilizando la libreria Pheanstalk en su aplicación, actualice sus librerias a la versión `~ 4.0` a través de Composer.

#### El Contrato `Job` 

**Probabilidad De Impacto: Muy Baja**

Los métodos `isReleased`,` hasFailed` y `markAsFailed` [se han agregado al contrato` Illuminate \ Contracts \ Queue \ Job`](https://github.com/laravel/framework/pull/26908). Si está implementando esta interfaz, debe agregar estos métodos a su implementación.

#### Las Clases  `Job::failed` Y `FailingJob` 

**Probabilidad De Impacto: Muy Baja**

Cuando un trabajo en cola falló en Laravel 5.7, el trabajador de la cola ejecutó el método `FailingJob :: handle`. En Laravel 5.8, la lógica contenida en la clase `FailingJob` se ha movido a un método` fail` directamente en la clase de trabajo. Debido a esto, se ha agregado un método `fail` al contrato` Illuminate \ Contracts \ Queue \ Job`.

La clase base `Illuminate \ Queue \ Jobs \ Job` contiene la implementación de` fail` y el código de aplicación típico no requiere cambios de código. Sin embargo, si está creando un controlador de cola personalizado que utiliza una clase de trabajo que ** no ** extiende la clase de trabajo base ofrecida por Laravel, debe implementar el método `fail` manualmente en su clase de trabajo personalizado. Puede referirse a la clase de trabajo base de Laravel como una implementación de referencia.

Este cambio permite que los controladores de cola personalizados tengan más control sobre el proceso de eliminación de trabajos.

#### Redis Blocking Pop

**Probabilidad De Impacto: Muy Baja**

El uso de la función de "bloqueo emergente" del controlador de cola Redis ahora es seguro. Anteriormente, había una pequeña posibilidad de que un trabajo en cola pudiera perderse si el servidor o el trabajador de Redis fallaba al mismo tiempo que se recuperaba el trabajo. Para hacer que el bloqueo de los pops sea seguro, se crea una nueva lista de Redis con el sufijo `:notify` para cada cola de Laravel.

<a name="requests"></a>
### Solicitudes (Requests)

#### The `TransformsRequest` Middleware

**Probabilidad De Impacto: Baja**

El método `transform` del middleware` Illuminate \ Foundation \ Http \ Middleware \ TransformsRequest` ahora recibe la clave de entrada de solicitud "completamente calificada" cuando la entrada es una matriz:

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

El método `previous` [se ha agregado al contrato` Illuminate \ Contracts \ Routing \ UrlGenerator`](https://github.com/laravel/framework/pull/25616). Si está implementando esta interfaz, debe agregar este método a su implementación.

#### La Propiedad `cachedSchema` De` Illuminate / Routing / UrlGenerator`

**Probabilidad De Impacto: Muy Baja**

El nombre de la propiedad `$ cachedSchema` (que ha quedado en desuso en Laravel` 5.7`) de `Illuminate / Routing / UrlGenerator` [se ha cambiado a](https://github.com/laravel/framework/pull/26728)` $ cachedScheme`.

<a name="sessions"></a>
### Sessions

#### El middleware `StartSession`

**Probabilidad De Impacto: Muy Baja**

La lógica de persistencia de la sesión se ha [movido del método `terminate ()` al método `handle ()`](https://github.com/laravel/framework/pull/26410). Si está anulando uno o ambos de estos métodos, debe actualizarlos para reflejar estos cambios.

<a name="support"></a>
### Soporte 

<a name="string-and-array-helpers"></a>
#### Preferir Clases String Y Array Sobre Helpers

**Probabilidad De Impacto: Media**

Todos los helpers globales `array_ *` y `str_ *` [han sido desaprobados](https://github.com/laravel/framework/pull/26898). Debe usar los métodos `Illuminate \ Support \ Arr` y` Illuminate \ Support \ Str` directamente.

El impacto de este cambio se ha marcado como "medio" desde que los ayudantes (helpers) se han trasladado al nuevo paquete [laravel / helpers](https://github.com/laravel/helpers) que ofrece una capa de compatibilidad hacia atrás para todos los matriz global y funciones de cadena.

<a name="deferred-service-providers"></a>
#### Proveedores De Servicios Diferidos

**Probabilidad De Impacto: Media**

La propiedad booleana `defer` en el proveedor de servicios que se usa para indicar si un proveedor está diferido [ha quedado en desuso](https://github.com/laravel/framework/pull/27067). Para marcar el proveedor de servicios como diferido, debe implementar el contrato `Illuminate \ Contracts \ Support \ DeferrableProvider`.

<a name="testing"></a>
### Probando (Testing)

#### PHPUnit 8

**Probabilidad De Impacto: Opcional**

De forma predeterminada, Laravel 5.8 usa PHPUnit 7. Sin embargo, opcionalmente puede actualizar a PHPUnit 8, que requiere PHP> = 7.2. Además, lea la lista completa de cambios en [el anuncio de la versión de PHPUnit 8](https://phpunit.de/announcements/phpunit-8.html).

Cuando se utiliza PHPUnit 8, los métodos `setUp` y` tearDown` requieren un tipo de retorno nulo:

    public function setUp(): void
    public function tearDown(): void

<a name="validation"></a>
### Validación

#### El Contrato `Validator` 

**Probabilidad De Impacto: Muy Baja**

El método `validated` [se agregó al contrato` Illuminate \ Contracts \ Validation \ Validator`](https://github.com/laravel/framework/pull/26419):

    /**
     * Get the attributes and values that were validated.
     *
     * @return array
     */
    public function validated();

Si está implementando esta interfaz, debe agregar este método a su implementación.

#### El rasgo `ValidatesAttributes`

***Probabilidad De Impacto: Muy Baja**

Los métodos `parseTable`,` getQueryColumn` y `requireParameterCount` de los rasgos` Illuminate \ Validation \ Concerns \ ValidatesAttributes` se han cambiado de `protected` a` public`.

#### La Clase `DatabasePresenceVerifier` 

**Probabilidad De Impacto: Muy Baja**

El método `table` de la clase` Illuminate \ Validation \ DatabasePresenceVerifier` se ha cambiado de `protected` a` public`.

#### La Clase `Validator` 

**Probabilidad De Impacto: Muy Baja**

El método `getPresenceVerifierFor` de la clase` Illuminate \ Validation \ Validator` [ha sido cambiado](https://github.com/laravel/framework/pull/26717) de `protected` a` public`.

#### Validación De Correo Electrónico

**Probabilidad De Impacto: Muy Baja**

La regla de validación de correo electrónico ahora comprueba si el correo electrónico es compatible con [RFC5630](https://tools.ietf.org/html/rfc6530), lo que hace que la lógica de validación sea coherente con la lógica utilizada por SwiftMailer. En Laravel `5.7`, la regla` email` solo verificó que el correo electrónico era compatible con [RFC822](https://tools.ietf.org/html/rfc822).

Por lo tanto, cuando se usa Laravel 5.8, los correos electrónicos que antes se consideraban incorrectamente no válidos ahora se considerarán válidos (por ejemplo, `hej @ bär.se`). En general, esto debería considerarse una corrección de errores; sin embargo, está listado como un cambio de ruptura por precaución. [Por Favor Háganos saber si tiene algún problema relacionado con este cambio](https://github.com/laravel/framework/pull/26503).

<a name="view"></a>
### Vista (View)

#### El Método `getData` 

**Probabilidad De Impacto: Muy Baja**

El método `getData` [se agregó al contrato` Illuminate \ Contracts \ View \ View`](https://github.com/laravel/framework/pull/26754). Si está implementando esta interfaz, debe agregar este método a su implementación.

<a name="notifications"></a>
### Notificaciones

<a name="nexmo-slack-notification-channels"></a>
#### Canales De Notificación Nexmo/ Slack (Nexmo / Slack Notification Channels) 

**Probabilidad De Impacto: Alta**

The Nexmo and Slack Notification channels have been extracted into first-party packages. To use these channels in your application, require the following packages:// Los canales de notificación de Nexmo y Slack se han extraído en paquetes de primera parte (first-party packages). Para usar estos canales en su aplicación, requiera los siguientes paquetes:

    composer require laravel/nexmo-notification-channel
    composer require laravel/slack-notification-channel

<a name="miscellaneous"></a>
### Varios (Miscellaneous)

También le recomendamos que vea los cambios en `laravel / laravel` [repositorio de GitHub](https://github.com/laravel/laravel). Si bien muchos de estos cambios no son necesarios, es posible que desee mantener estos archivos sincronizados con su aplicación. Algunos de estos cambios se tratarán en esta guía de actualización, pero otros, como los cambios en los archivos de configuración o los comentarios, no lo estarán. Puede ver fácilmente los cambios con la [herramienta de comparación GitHub](https://github.com/laravel/laravel/compare/5.7...master) y elegir qué actualizaciones son importantes para usted.
