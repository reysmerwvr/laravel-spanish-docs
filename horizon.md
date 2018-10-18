# Laravel Horizon

- [Introducción](#introduction)
- [Instalación](#installation)
    - [Configuración](#configuration)
    - [Autenticación Dashboard](#dashboard-authentication)
- [Ejecutando Horizon](#running-horizon)
    - [Usando Horizon](#deploying-horizon)
- [Etiquetas](#tags)
- [Notificaciones](#notifications)
- [Métricas](#metrics)

<a name="introduction"></a>
## Introducción

Horizon proporciona un bonito panel de control y sistema de configuración controlada por código para tu Laravel potenciado por colas Redis. Horizon te permite monitorear fácilmente métricas claves de tu sistema de colas tales como tasa de rendimiento, tiempo de ejecución, y fallas de tareas.

Toda la configuración de tu trabajador es almacenada en un solo, archivo de configuración sencillo, permitiendo que tu configuración quede en control de código fuente donde tu equipo completo pueda colaborar.

<a name="installation"></a>
## Instalación

> {note} Debido a su uso de señales de procesos asincrónicos, Horizon requiere PHP 7.1+.

Puedes usar Composer para instalar Horizon en tu proyecto de Laravel:

    composer require laravel/horizon

Después de instalar Horizon, publica sus assets usando el comando Artisan `vendor:publish`:

    php artisan vendor:publish --provider="Laravel\Horizon\HorizonServiceProvider"

<a name="configuration"></a>
### Configuración

Después de publicar los assets de Horizon, su archivo de configuración primario será colocado en `config/horizon.php`. Este archivo de configuración permite que configures tus opciones de trabajador y cada opción de configuración incluye una descripción de su propósito, así que asegurate de explorar con gran detalle este archivo.

#### Opciones de Balance

Horizon permite que elijas entre tres estrategias de balance: `simple`, `auto`, y `false`. La estrategia `simple`, la cual es la predeterminada, separa los trabajos entrantes equitativamente entre procesos:

    'balance' => 'simple',

La estrategia `auto` ajusta el número de procesos trabajadores por cola basado en la carga de trabajo de la cola. Por ejemplo, si tu cola `notifications` tiene 1.000 trabajos esperando mientras tu cola `render` está vacía, Horizon asignará mas trabajadores a tu cola `notifications` hasta que esté vacía. Cuando la opción `balance` esté establecida a `false`, el comportamiento predeterminado de Laravel será usado, el cuál procesa las colas en el orden que son listadas en tu configuración.

<a name="dashboard-authentication"></a>
### Autenticación del Panel de Control

Horizon revela un panel de control en `/horizon`. De forma predeterminada, solamente serás capaz de acceder este panel en el entorno `local`. Para definir una política de acceso más específica para el panel, deberías usar el método `Horizon::auth`. El método `auth` acepta una función de retorno la cual debería devolver `true` o `false`, indicando si el usuario debería haber accedido al panel de Horizon:

    Horizon::auth(function ($request) {
        // return true / false;
    });

<a name="running-horizon"></a>
## Ejecutando Horizon

Una vez que has configurado tus trabajadores en el archivo de configuración `config/horizon.php`, puedes empezar Horizon usando el comando Artisan `horizon`. Este único comando iniciará todos tus trabajadores configurados:

    php artisan horizon

Puedes pausar los procesos de Horizon e instruirlo para continuar procesando trabajos usando los comandos Artisan `horizon:pause` y `horizon:continue`:

    php artisan horizon:pause

    php artisan horizon:continue

Puedes terminar elegantemente el proceso maestro de Horizon en tu máquina usando el comando Artisan `horizon:terminate`. Cualquiera de los trabajos que Horizon este procesando actualmente será completado y después Horizon saldrá:

    php artisan horizon:terminate

<a name="deploying-horizon"></a>
### Usando Horizon

Si estás usando Horizon en un servidor activo, deberías configurar un monitor de proceso para monitorear el comando `php artisan horizon` y reiniciarlo si éste sale inesperadamente. Al momento de usar código reciente en tu servidor, necesitarás instruir el proceso maestro de Horizon para que termine así puede ser reiniciado por tu monitor de proceso y recibir tu cambios de código.

Puedes terminar elegantemente el proceso maestro de Horizon en tu máquina usando el comando Artisan `horizon:terminate`. Cualquiera de los trabajos que Horizon este procesando actualmente será completado y después Horizon saldrá:

    php artisan horizon:terminate

#### Configuración de Supervisor

Si estas usando el monitor de procesos de Supervisor para administrar tu proceso `horizon`, el siguiente archivo de configuración debería ser suficiente:

    [program:horizon]
    process_name=%(program_name)s
    command=php /home/forge/app.com/artisan horizon
    autostart=true
    autorestart=true
    user=forge
    redirect_stderr=true
    stdout_logfile=/home/forge/app.com/horizon.log

> {tip} Si no estás cómodo administrando tus propios servidores, considera usar [Laravel Forge](https://forge.laravel.com). Forge aprovisiona tus propios servidores PHP 7+ con todas las cosas que necesitas para administrar modernas, aplicaciones robustas de Laravel con Horizon.

<a name="tags"></a>
## Etiquetas

Horizon permite que asignes “etiquetas” a los trabajos, incluyendo correos válidos, difusiones de eventos, notificaciones, y listeners de eventos encolados. De hecho, Horizon etiquetará inteligentemente y automáticamente la mayoría de los trabajos dependiendo de los modelos Eloquent que estén adjuntos al trabajo. Por ejemplo, echemos un vistazo en el siguiente trabajo:

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

Si este trabajo es encolado con una instancia `App\Video` que tenga un `id` de `1`, recibirá automáticamente la etiqueta `App\Video:1`. Esto es debido a que Horizon examinará las propiedades del trabajo para cualquier modelo Eloquent. Si los modelos Eloquent son encontrados, Horizon etiquetará inteligentemente el trabajo usando el nombre de la clase y la clave primaria del modelo.

    $video = App\Video::find(1);

    App\Jobs\RenderVideo::dispatch($video);

#### Manually Tagging

Si prefieres definir manualmente las etiquetas para uno de tus objetos encolables, puedes definir un método `tags` en la clase:

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

<a name="notifications"></a>
## Notificaciones

> **Note:** Antes de usar las notificaciones, deberías agregar el paquete de Composer `guzzlehttp/guzzle` a tu proyecto. Al momento de configurar Horizon para enviar notificaciones SMS, también deverías revisar los [prerequisitos para el manejador de notificación Nexmo](https://laravel.com/docs/5.5/notifications#sms-notifications).

Si prefieres ser notificado cuando una de tus colas tenga un largo tiempo de inactividad, puedes usar los métodos `Horizon::routeMailNotificationsTo`, `Horizon::routeSlackNotificationsTo`, y `Horizon::routeSmsNotificationsTo`. Puedes ejecutar estos métodos desde tu `AppServiceProvider` de tu aplicación:

    Horizon::routeMailNotificationsTo('example@example.com');
    Horizon::routeSlackNotificationsTo('slack-webhook-url', '#channel');
    Horizon::routeSmsNotificationsTo('15556667777');

#### Configurando los Umbrales de Tiempo de Inactividad de Notificación

Puedes configurar cuantos segundos son considerados un "tiempo de inactividad" dentro de tu archivo de configuración `config/horizon.php`. La opción de configuración `waits` dentro de este archivo permite que controles el umbral de tiempo de inactividad para cada combinación conexión / cola:

    'waits' => [
        'redis:default' => 60,
    ],

<a name="metrics"></a>
## Métricas

Horizon incluye un panel de métricas el cual proporciona información de tus tiempos de trabajo y de espera en cola y tasa de rendimiento. Con el propósito de popular este panel, deberías configurar el comando Artisan `snapshot` de Horizon para que se ejecute cada 5 minutos por medio del [planificador](/docs/{{version}}/scheduling) de tu aplicación:

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
