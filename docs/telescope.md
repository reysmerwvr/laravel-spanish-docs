::: v-pre

# Laravel Telescope

- [Introducción](#introduction)
- [Instalación](#installation)
    - [Configuración](#configuration)
    - [Remover datos de entradas de Telescope](#data-pruning)
    - [Personalizar la migración](#migration-customization)
- [Autorización para el panel de control](#dashboard-authorization)
- [Filtros](#filtering)
    - [Entradas](#filtering-entries)
    - [Lotes](#filtering-batches)
- [Etiquetado](#tagging)
    - [Agregar etiquetas personalizadas](#tagging-adding)
- [Observadores disponibles](#available-watchers)
    - [Observador De caché](#cache-watcher)
    - [Observador De comandos](#command-watcher)
    - [Observador De variables](#dump-watcher)
    - [Observador De eventos](#event-watcher)
    - [Observador De excepciones](#exception-watcher)
    - [Observador De gates](#gate-watcher)
    - [Observador De trabajos](#job-watcher)
    - [Observador De registros (log)](#log-watcher)
    - [Observador De correos](#mail-watcher)
    - [Observador De modelos](#model-watcher)
    - [Observador De notificaciones](#notification-watcher)
    - [Observador De consultas De Bases De Datos](#query-watcher)
    - [Observador De Redis](#redis-watcher)
    - [Observador De solicitudes (request)](#request-watcher)
    - [Observador De tareas programadas](#schedule-watcher)

<a name="introduction"></a>
## Introducción

Telescope de Laravel es un elegante asistente para depurar código para el framework de Laravel. Telescope proporciona información detallada de las solicitudes entrantes de tu aplicación, excepciones, entradas de log, consultas de bases de datos, trabajos en cola, correos, notificaciones, operaciones de caché, tareas programadas, valores de variables y mucho más. Telescope acompaña maravillosamente tu entorno de desarrollo de Laravel.

<p align="center">
<img src="https://res.cloudinary.com/dtfbvvkyp/image/upload/v1539110860/Screen_Shot_2018-10-09_at_1.47.23_PM.png" width="600" height="347">
</p>

<a name="installation"></a>
## Instalación

Puedes usar Composer para instalar Telescope dentro de tu proyecto de Laravel:

```php
composer require laravel/telescope
```

Después de instalar Telescope, publica sus recursos usando el comando Artisan `telescope:install`. Después de instalar Telescope, también deberías ejecutar el comando `migrate`:

```php
php artisan telescope:install

php artisan migrate
```

#### Actualizando Telescope

Si haces una actualización de Telescope, deberías volver a publicar los recursos de Telescope:

```php
php artisan telescope:publish
```

### Instalando únicamente en entornos específicos

Si planeas usar Telescope solamente para apoyar tu desarrollo local, puedes instalar Telescope usando la bandera `--dev`:

```php
composer require laravel/telescope --dev
```

Después de ejecutar `telescope:install`, deberías remover el registro de proveedor de servicio `TelescopeServiceProvider` de tu archivo de configuración `app`. En su lugar, registra manualmente el proveedor de servicio en el método `register` de tu `AppServiceProvider`:

```php
use App\Providers\TelescopeServiceProvider;

/**
* Register any application services.
*
* @return void
*/
public function register()
{
    if ($this->app->isLocal()) {
        $this->app->register(TelescopeServiceProvider::class);
    }
}
```

<a name="migration-customization"></a>
### Personalización de la migración

Si no vas a usar las migraciones predeterminadas de Telescope, deberías ejecutar el método `Telescope::ignoreMigrations` en el método `register` de tu `AppServiceProvider`. Puedes exportar las migraciones predeterminadas usando el comando `php artisan vendor:publish --tag=telescope-migrations`.

<a name="configuration"></a>
### Configuración

Después de publicar los recursos de Telescope, su archivo de configuración principal estará ubicado en `config/telescope.php`. Este archivo de configuración permite que configures tus opciones de observador (watcher) y cada opción de configuración incluye una descripción de su propósito, así que asegúrate de examinar meticulosamente este archivo.

Si lo deseas, puedes deshabilitar completamente la colección de datos de Telescope usando la opción de configuración `enabled`:

```php
'enabled' => env('TELESCOPE_ENABLED', true),
```

<a name="data-pruning"></a>
### Remover datos de entradas de Telescope

Sin la remoción, la tabla `telescope_entries` puede acumular registros muy rápidamente. Para mitigar esto, deberías programar el comando `telescope:prune` para que se ejecute diariamente:

```php
$schedule->command('telescope:prune')->daily();
```

De forma predeterminada, aquellas entradas con más de 24 horas serán removidas. Puedes usar la opción `hours` al momento de ejecutar el comando para indicar cuánto tiempo retiene los datos Telescope. Por ejemplo, el siguiente comando eliminará todos los registros con más de 48 horas desde que fueron creados.

```php
$schedule->command('telescope:prune --hours=48')->daily();
```

<a name="dashboard-authorization"></a>
## Autorización para el panel de control

Telescope viene con un panel de control en `/telescope`. De forma predeterminada, solamente serás capaz de acceder este panel de control en el entorno `local`. Dentro de tu archivo `app/Providers/TelescopeServiceProvider.php`, hay un método `gate`. Esta gate de autorización controla el acceso a Telescope en los entornos **que no son locales**. Eres libre de modificar este gate de acuerdo a tus necesidades para restringir el acceso a tu instalación de Telescope:

```php
/**
* Register the Telescope gate.
*
* This gate determines who can access Telescope in non-local environments.
*
* @return void
*/
protected function gate()
{
    Gate::define('viewTelescope', function ($user) {
        return in_array($user->email, [
            'taylor@laravel.com',
        ]);
    });
}
```

<a name="filtering"></a>
## Filtros

<a name="filtering-entries"></a>
### Entradas

Puedes filtrar los datos que son guardados por Telescope por medio de la función de retorno (callback) `filter`  que está registrada en tu `TelescopeServiceProvider`. De forma predeterminada, esta función de retorno guarda todos los datos en el entorno `local` y las excepciones, trabajos que fallan, tareas programadas, y datos de las etiquetas monitoreadas en los demás entornos.

```php
/**
* Register any application services.
*
* @return void
*/
public function register()
{
    $this->hideSensitiveRequestDetails();

    Telescope::filter(function (IncomingEntry $entry) {
        if ($this->app->isLocal()) {
            return true;
        }

        return $entry->isReportableException() ||
            $entry->isFailedJob() ||
            $entry->isScheduledTask() ||
            $entry->hasMonitoredTag();
    });
}
```

<a name="filtering-batches"></a>
### Lotes

Mientras la función de retorno `filter` filtra datos por entradas individuales, puedes usar el método `filterBatch` para registrar una función de retorno que filtra todos los datos para un comando de consola o solicitud dado. Si la función de retorno devuelve `true`, la totalidad de las entradas son guardadas por Telescope:

```php
use Illuminate\Support\Collection;

/**
* Register any application services.
*
* @return void
*/
public function register()
{
    $this->hideSensitiveRequestDetails();

    Telescope::filterBatch(function (Collection $entries) {
        if ($this->app->isLocal()) {
            return true;
        }

        return $entries->contains(function ($entry) {
            return $entry->isReportableException() ||
                $entry->isFailedJob() ||
                $entry->isScheduledTask() ||
                $entry->hasMonitoredTag();
            });
    });
}
```

<a name="tagging"></a>
## Etiquetado

Telescope te permite buscar entradas por "etiqueta". A menudo, las etiquetas son nombres de clases de modelos de Eloquent o IDs de usuarios autenticados que Telescope automáticamente agrega a entradas. Ocasionalmente, puede que quieras adjuntar tus propias etiquetas personalizadas a entradas. Para lograr esto, puedes usar el método `Telescope::tag`. El método `tags` acepta un callback que debe retornar un arreglo de etiquetas. Las etiquetas retornadas por el callback se fusionarán con cualquier etiqueta que Telescope automáticamente agregaría a la entrada. Debes llamar al método `tags` dentro de tu `TelescopeServiceProvider`:

```php
use Laravel\Telescope\Telescope;
/**
* Register any application services.
*
* @return void
*/
public function register()
{
    $this->hideSensitiveRequestDetails();
    Telescope::tag(function (IncomingEntry $entry) {
        if ($entry->type === 'request') {
            return ['status:'.$entry->content['response_status']];
        }
        return [];
    });
}
```

<a name="available-watchers"></a>
## Observadores disponibles

Los observadores de Telescope coleccionan los datos de la aplicación cuando una solicitud o comando de consola es ejecutado. Puedes personalizar la lista de observadores que deseas habilitar dentro de tu archivo de configuración `config/telescope.php`:

```php
'watchers' => [
    Watchers\CacheWatcher::class => true,
    Watchers\CommandWatcher::class => true,
    ...
],
```

Algunos observadores también permiten que agregues opciones de personalización extra:

```php
'watchers' => [
    Watchers\QueryWatcher::class => [
        'enabled' => env('TELESCOPE_QUERY_WATCHER', true),
        'slow' => 100,
    ],
    ...
],
```

<a name="cache-watcher"></a>
### Observador de caché

El observador de caché (Cache Watcher) guarda datos cuando una clave está presente, falta, es actualizada u olvidada en caché.

<a name="command-watcher"></a>
### Observador de comandos

El observador de comandos (command watcher) guarda los argumentos, opciones, códigos de salida, información enviada a la pantalla cada vez que se ejecuta un comando Artisan. Si deseas excluir ciertos comandos para que no sean grabados por el observador, puedes especificar el comando junto con la opción `ignore` en tu archivo `config/telescope.php`:

```php
'watchers' => [
    Watchers\CommandWatcher::class => [
        'enabled' => env('TELESCOPE_COMMAND_WATCHER', true),
        'ignore' => ['key:generate'],
    ],
    ...
],
```

<a name="dump-watcher"></a>
### Observador de variables

El observador de variables (dump watcher) guarda y muestra los valores de tus variables en Telescope. Al momento de usar Laravel, los valores de las variables pueden ser mostrados usando la función global `dump`. La pestaña del observador de variables debe estar abierta en un navegador para que los valores sean guardados, de lo contrario serán ignorados por el observador.

<a name="event-watcher"></a>
### Observador de eventos

El observador de eventos (event watcher) guarda la carga, oyentes (listeners) y los datos de difusión (broadcast) para cualquier evento que sea despachado por tu aplicación. Los eventos internos del framework de Laravel son ignorados por el observador de eventos.

<a name="exception-watcher"></a>
### Observador de excepciones

El observador de excepciones (exception watcher) guarda los datos y el seguimiento de la pila para cualquier excepción reportable que sea lanzada por tu aplicación.

<a name="gate-watcher"></a>
### Observador de gates

El observador de gate (gate watcher) guarda los datos y el resultado de verificaciones de gates y políticas hechas por tu aplicación. Si deseas excluir ciertas habilidades para que no sean guardadas por el observador, puedes especificar aquellas en la opción `ignore_abilities` en tu archivo `config/telescope.php`:

```php
'watchers' => [
    Watchers\GateWatcher::class => [
        'enabled' => env('TELESCOPE_GATE_WATCHER', true),
        'ignore_abilities' => ['viewNova'],
    ],
    ...
],
```

<a name="job-watcher"></a>
### Observador de trabajos

El observador de trabajos (job watcher) guarda los datos y estado de los trabajos despachado por tu aplicación.

<a name="log-watcher"></a>
### Observador de registros

El observador de registros (log watcher) guarda datos de los registros escritos por tu aplicación.

<a name="mail-watcher"></a>
### Observador de correos

El observador de correos (mail watcher) permite que veas una pre-visualización en el navegador de los correos junto con sus datos adjuntados. También puedes descargar los correos como un archivo `.eml`.

<a name="model-watcher"></a>
### Observador de modelos

El observador de modelos (model watcher) guarda los cambios del modelo cada vez que se despacha un evento `created`, `updated`, `restored`, o `deleted` de Eloquent. Puedes especificar cuáles eventos de modelos deberían ser guardados por medio de la opción `events` del observador:

```php
'watchers' => [
    Watchers\ModelWatcher::class => [
        'enabled' => env('TELESCOPE_MODEL_WATCHER', true),
        'events' => ['eloquent.created*', 'eloquent.updated*'],
    ],
    ...
],
```

<a name="notification-watcher"></a>
### Observador de notificaciones

El observador de notificaciones (notification watcher) guarda todas las notificaciones enviadas por tu aplicación. Si la notificación dispara un correo y tienes el observador de correos habilitado, el correo también estará disponible para pre-visualizar en la pantalla del observador de correos.

<a name="query-watcher"></a>
### Observador de consultas de bases de datos

El observador de consultas de bases de datos (query watcher) guarda los comandos SQL, enlaces, y tiempo de ejecución para todas las consultas de bases de datos que sean ejecutadas por tu aplicación. El observador también coloca una etiqueta `slow` a las consultas más lentas, aquellas que tardan más de 100 micro segundos. Puedes personalizar el umbral para las consultas lentas usando la opción `slow` del observador:

```php
'watchers' => [
    Watchers\QueryWatcher::class => [
        'enabled' => env('TELESCOPE_QUERY_WATCHER', true),
        'slow' => 50,
    ],
    ...
],
```

<a name="redis-watcher"></a>
### Observador de Redis

::: danger Nota
Los eventos de Redis deben ser habilitados por el observador de Redis (Redis watcher) para que funcione de forma correcta. Puedes habilitar los eventos de Redis ejecutando `Redis::enableEvents()` en el método `boot` de tu archivo `app/Providers/AppServiceProvider.php`.
:::

El observador de Redis (redis watcher) guarda todos los comandos de Redis ejecutados por tu aplicación. Si estás usando Redis para el almacenamiento de caché, también los comandos de caché serán guardados por el observador de Redis.

<a name="request-watcher"></a>
### Observador de solicitudes

El observador de solicitudes (request watcher) guarda la solicitud, encabezados, la sesión y los datos de respuesta asociados con las solicitudes manejadas por la aplicación. Puedes limitar tus datos de respuesta por medio de la opción `size_limit` (en KB):

```php
'watchers' => [
    Watchers\RequestWatcher::class => [
        'enabled' => env('TELESCOPE_REQUEST_WATCHER', true),
        'size_limit' => env('TELESCOPE_RESPONSE_SIZE_LIMIT', 64),
    ],
    ...
],
```

<a name="schedule-watcher"></a>
### Observador de tareas programadas

El observador de tareas programadas (schedule watcher) guarda el comando y la información enviada a la pantalla de las tareas programadas que ejecuta tu aplicación.