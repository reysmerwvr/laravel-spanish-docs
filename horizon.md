::: v-pre

# Laravel Horizon

- [Introducción](#introduction)
- [Actualización de Horizon](#upgrading)
- [Instalación](#installation)
    - [Configuración](#configuration)
    - [Autorización Del Dashboard](#dashboard-authorization)
- [Ejecutando Horizon](#running-horizon)
    - [Usando Horizon](#deploying-horizon)
- [Etiquetas](#tags)
- [Notificaciones](#notifications)
- [Métricas](#metrics)

<a name="introduction"></a>
## Introducción

Horizon proporciona un bonito panel de control y sistema de configuración controlado por código para Laravel, potenciado por colas de Redis. Horizon te permite monitorear fácilmente métricas claves de tu sistema de colas tales como tasa de rendimiento, tiempo de ejecución y fallas de tareas.

Toda la configuración de tu worker es almacenada en un solo archivo de configuración sencillo, permitiendo que tu configuración quede en el código fuente donde tu equipo completo pueda colaborar.

<p align="center">
<img src="https://res.cloudinary.com/dtfbvvkyp/image/upload/v1537195039/photos/Test.png" width="600" height="481">
</p>

<a name="installation"></a>
## Instalación

::: danger Nota
Debes asegurarte de que tu driver de cola está establecido a `redis` en tu archivo de configuración `queue`.
:::

Puedes usar Composer para instalar Horizon en tu proyecto de Laravel:

```php
composer require laravel/horizon
```

Después de instalar Horizon, publica sus assets usando el comando Artisan `horizon:install`:

```php
php artisan horizon:install
```

Debes también crear la tabla `failed_jobs` que Laravel usará para almacenar cualquier [trabajo en cola fallido](/docs/{{version}}/queues#dealing-with-failed-jobs):

```php
php artisan queue:failed-table

php artisan migrate
```

<a name="upgrading"></a>
#### Actualización De Horizon
    
Al actualizar a una nueva versión mayor de Horizon, es importante que revises cuidadosamente [la guía de actualización](https://github.com/laravel/horizon/blob/master/UPGRADE.md).

Además, debes volver a publicar los assets de Horizon:

```php
php artisan horizon:assets
```

<a name="configuration"></a>
### Configuración

Después de publicar los assets de Horizon, su principal archivo de configuración será colocado en `config/horizon.php`. Este archivo de configuración permite que configures las opciones del worker y cada opción de configuración incluye una descripción de su propósito, así que asegurate de explorar con gran detalle este archivo.

#### Opciones de Balance

Horizon permite que elijas entre tres estrategias de balance: `simple`, `auto` y `false`. La estrategia `simple`, que es la opción por defecto del archivo de configuración, divide los trabajos entrantes de manera uniforme entre procesos:

```php
'balance' => 'simple',
```

La estrategia `auto` ajusta el número de procesos trabajadores por cola basado en la carga de trabajo de la cola. Por ejemplo, si tu cola `notifications` tiene 1.000 trabajos esperando mientras tu cola `render` está vacía, Horizon asignará mas trabajadores a tu cola `notifications` hasta que esté vacía. Cuando la opción `balance` esté establecida a `false`, el comportamiento predeterminado de Laravel será usado, el cual procesa las colas en el orden que son listadas en tu configuración.

#### Recorte De Trabajos

El archivo de configuración `horizon` te permite configurar cuánto tiempo los trabajos de recientes y fallidos deben ser persistidos (en minutos). Por defecto, los trabajos recientes son mantenidos por una hora mientras que los trabajos fallidos son mantenidos por una semana:

```php
'trim' => [
    'recent' => 60,
    'failed' => 10080,
],
```

<a name="dashboard-authorization"></a>
### Autorización Del Dashboard

Horizon muestra un dashboard o panel de control en `/horizon`. Por defecto, sólo serás capaz de acceder a este dashboard en el entorno `local`. Dentro de tu archivo `app/Providers/HorizonServiceProvider.php`, hay un método `gate`. Este gate de autorización controla el acceso a Horizon en entornos **no locales**. Eres libre de modificar este gate como sea necesario para restringir el acceso a tu instalación de Horizon:

```php
/**
* Register the Horizon gate.
*
* This gate determines who can access Horizon in non-local environments.
*
* @return void
*/
protected function gate()
{
    Gate::define('viewHorizon', function ($user) {
        return in_array($user->email, [
            'taylor@laravel.com',
        ]);
    });
}
```

<a name="running-horizon"></a>
## Ejecutando Horizon

Una vez que has configurado tus workers en el archivo de configuración `config/horizon.php`, puedes ejecutar Horizon usando el comando Artisan `horizon`. Este único comando iniciará todos tus workers configurados:

```php
php artisan horizon
```

Puedes pausar los procesos de Horizon e instruirlo para continuar procesando trabajos usando los comandos Artisan `horizon:pause` y `horizon:continue`:

```php
php artisan horizon:pause

php artisan horizon:continue
```

Puedes terminar elegantemente el proceso maestro de Horizon en tu máquina usando el comando Artisan `horizon:terminate`. Cualquiera de los trabajos que Horizon esté procesando actualmente será completado y después Horizon parará:

```php
php artisan horizon:terminate
```

<a name="deploying-horizon"></a>
### Usando Horizon

Si estás usando Horizon en un servidor activo, deberías configurar un monitor de proceso para monitorear el comando `php artisan horizon` y reiniciarlo si éste sale inesperadamente. Al momento de usar código reciente en tu servidor, necesitarás instruir el proceso maestro de Horizon para que termine así puede ser reiniciado por tu monitor de proceso y recibir tu cambios de código.

#### Configuración de Supervisor

Si estás usando el monitor de procesos de Supervisor para administrar tu proceso `horizon`, el siguiente archivo de configuración debería ser suficiente:

```php
[program:horizon]
process_name=%(program_name)s
command=php /home/forge/app.com/artisan horizon
autostart=true
autorestart=true
user=forge
redirect_stderr=true
stdout_logfile=/home/forge/app.com/horizon.log
```

::: tip
Si no estás cómodo administrando tus propios servidores, considera usar [Laravel Forge](https://forge.laravel.com). Forge aprovisiona tus propios servidores PHP 7+ con todo lo que necesitas para administrar modernas aplicaciones robustas de Laravel con Horizon.
:::

<a name="tags"></a>
## Etiquetas

Horizon permite que asignes “etiquetas” a los trabajos, incluyendo correos válidos, difusiones de eventos, notificaciones y listeners de eventos encolados. De hecho, Horizon etiquetará inteligente y automáticamente la mayoría de los trabajos dependiendo de los modelos Eloquent que estén adjuntos al trabajo. Por ejemplo, echemos un vistazo al siguiente worker:

```php
<?php

namespace App\Jobs;

use App\Video;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class RenderVideo implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
    * The video instance.
    *
    * @var \App\Video
    */
    public $video;

    /**
    * Create a new job instance.
    *
    * @param  \App\Video  $video
    * @return void
    */
    public function __construct(Video $video)
    {
        $this->video = $video;
    }

    /**
    * Execute the job.
    *
    * @return void
    */
    public function handle()
    {
        //
    }
}
```

Si este trabajo es encolado con una instancia `App\Video` que tenga un `id` de `1`, recibirá automáticamente la etiqueta `App\Video:1`. Esto es debido a que Horizon examinará las propiedades del trabajo para cualquier modelo Eloquent. Si los modelos Eloquent son encontrados, Horizon etiquetará inteligentemente el trabajo usando el nombre de la clase y la clave primaria del modelo.

```php
$video = App\Video::find(1);

App\Jobs\RenderVideo::dispatch($video);
```

#### Manually Tagging

Si prefieres definir manualmente las etiquetas para uno de tus objetos encolables, puedes definir un método `tags` en la clase:

```php
class RenderVideo implements ShouldQueue
{
    /**
    * Get the tags that should be assigned to the job.
    *
    * @return array
    */
    public function tags()
    {
        return ['render', 'video:'.$this->video->id];
    }
}
```

<a name="notifications"></a>
## Notificaciones

> **Note:** Al momento de configurar Horizon para enviar notificaciones de Slack o SMS, también deberías revisar los [prerequisitos para el manejador de notificaciones relevante](https://laravel.com/docs/{{version}}/notifications).

Si prefieres ser notificado cuando una de tus colas tenga un largo tiempo de inactividad, puedes usar los métodos `Horizon::routeMailNotificationsTo`, `Horizon::routeSlackNotificationsTo` y `Horizon::routeSmsNotificationsTo`. Puedes ejecutar estos métodos desde el `HorizonServiceProvider` de tu aplicación:

```php
Horizon::routeMailNotificationsTo('example@example.com');
Horizon::routeSlackNotificationsTo('slack-webhook-url', '#channel');
Horizon::routeSmsNotificationsTo('15556667777');
```

#### Configurando las Notificaciones de Umbrales de Tiempo de Inactividad

Puedes configurar cuántos segundos son considerados un "tiempo de inactividad" dentro de tu archivo de configuración `config/horizon.php`. La opción de configuración `waits` dentro de este archivo permite que controles el umbral de tiempo de inactividad para cada combinación conexión / cola:

```php
'waits' => [
    'redis:default' => 60,
],
```

<a name="metrics"></a>
## Métricas

Horizon incluye un panel de métricas, el cual proporciona información de tus tiempos de trabajo y de espera en cola y tasa de rendimiento. Con el propósito de agregar contenido a este panel, deberías configurar el comando Artisan `snapshot` de Horizon para que se ejecute cada 5 minutos por medio del [planificador](/docs/{{version}}/scheduling) de tu aplicación:

```php
/**
* Define the application's command schedule.
*
* @param  \Illuminate\Console\Scheduling\Schedule  $schedule
* @return void
*/
protected function schedule(Schedule $schedule)
{
    $schedule->command('horizon:snapshot')->everyFiveMinutes();
}
```