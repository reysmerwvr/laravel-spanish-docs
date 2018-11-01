# Queues

- [Introducción](#introduction)
    - [Conexiones Vs. Colas](#connections-vs-queues)
    - [Prerrequisitos De COntroladores](#driver-prerequisites)
- [Crear Trabajos](#creating-jobs)
    - [Generar Clases De Trabajos](#generating-job-classes)
    - [Estructura De Clases](#class-structure)
- [Despachar TRabajos](#dispatching-jobs)
    - [Despacho POstergado](#delayed-dispatching)
    - [Encadenamiento De Trabajos](#job-chaining)
    - [Personalizar La Cola Y COnexión](#customizing-the-queue-and-connection)
    - [Especificar Intentos Máximos De Trabajos / Valores De Timeout](#max-job-attempts-and-timeout)
    - [Límites De Rango](#rate-limiting)
    - [Manejo De Errores](#error-handling)
- [Ejecutar El Worker De Cola](#running-the-queue-worker)
    - [Prioridades En Cola](#queue-priorities)
    - [Workers de Cola Y Su Implementación](#queue-workers-and-deployment)
    - [Expiraciones Y Timeouts de Trabajos](#job-expirations-and-timeouts)
- [COnfiguración de Supervisor](#supervisor-configuration)
- [Manejo De Trabajos Fallidos](#dealing-with-failed-jobs)
    - [Remediando Trabajos Fallidos](#cleaning-up-after-failed-jobs)
    - [Eventos De Trabajos Fallidos](#failed-job-events)
    - [Reintentando Trabajos Fallidos](#retrying-failed-jobs)
- [Eventos De Trabajo](#job-events)

<a name="introduction"></a>
## Introducción

> {tip} Laravel ahora ofrece Horizon, un hermoso tablero y sistema de configuración para las colas motorizadas por Redis. Entra en [Horizon documentation](/docs/{{version}}/horizon) para más inormación.

Las colas de Laravel brinadan una API unificada a través de una variedad de backends de cola diferentes, como Beanstalk, Amazon SQS, Redis, o incluso una base de datos relacional. Las colas permiten diferir el procesamiento de una tarea que consume tiempo, como enviar un correo electrónico, para un momento posterior. Diferir estas tareas acelera drásticamente las solicitudes web en tu aplicación.

La configuración d cola está almacenada en `config/queue.php`. En este archivo encontrarás configuraciones de conexión para cada controlador de cola incluido con la estructura, que incluye una base de datos, [Beanstalkd](https://kr.github.io/beanstalkd/), [Amazon SQS](https://aws.amazon.com/sqs/), [Redis](https://redis.io), y un controlador sincrónico que ejecutará trabajos inmediatamente (para uso local). Un controlador de cola `null` también está incluido, que descarta trabajos completados de la cola.

<a name="connections-vs-queues"></a>
### Conexiones Vs. COlas

Antes de empezar con las colas de Laravel, es importante entender la distinción entre "conexiones" y "colas". En tu archivo `config/queue.php`, hay una opción de configuración `connections`. Esta opción define una conexión particular a un servicio de backend como Amazon SQS, Beanstalk, o Redis. SIn embargo, cualquier conexión de cola dada puede tener múltiples "colas" las cuales pueden ser imaginadas como diferentes pilas de trabajos en espera.

Nótese que cada ejemplo de configuración de conexión en el archivo `queue` contiene un atributo `queue`. ESta es la cola por defecto a la cual los trabajos serán despachados cuando son enviados a una conexión dada. EN otras palabras, si despachas un trabajo si definir explícitamente a cuál cola debe ser despachado, el trabajo será colocado en la cola definida en el atributo `queue` de la configuración de conexión:

    // This job is sent to the default queue...
    Job::dispatch();

    // This job is sent to the "emails" queue...
    Job::dispatch()->onQueue('emails');

Algunas aplicaciones quizá no necesiten nunca empujar trabajos a múltiples colas, prefiriendo en su lugar tener una cola sencilla. Sin embargo, empujar trabajos a múltiples colas puede ser especialmente útil para aplicaciones que deseen priorizar o segmentar el procesamiento de sus trabajos, puesto que el worker de cola de Laravel permite especificar cuáles colas deben ser procesadas de acuerdo a su prioridad. Por ejemplo, si se empujan trabajos a una cola `high` se puede ejecutar un worker que les dé mayor prioridad de procesamiento:

    php artisan queue:work --queue=high,default

<a name="driver-prerequisites"></a>
### Prerrequisitos de Controladores

#### Database

Para utilizar el controlador de cola `database` queue driver, you will need a database table to hold the jobs. To generate a migration that creates this table, run the `queue:table` Artisan command. Once the migration has been created, you may migrate your database using the `migrate` command:

    php artisan queue:table

    php artisan migrate

#### Redis

Para usar el controlador de cola `redis`, debes configurar una conexión a una base de datos Redis en tu archivo `config/database.php`.

Si tu conexión de cola Redis usa un Redis Cluster, tus nombres de cola deben contener un [key hash tag](https://redis.io/topics/cluster-spec#keys-hash-tags). Esto es requerido para asegurar que todas las llaves Redis para una determinada cola sean colocadas en el mismo hash slot:

    'redis' => [
        'driver' => 'redis',
        'connection' => 'default',
        'queue' => '{default}',
        'retry_after' => 90,
    ],

#### Prerrequisitos Para Otros COntroladores

Las siguientes dependencias son necesarias para sus controladores respectivos:

<div class="content-list" markdown="1">
- Amazon SQS: `aws/aws-sdk-php ~3.0`
- Beanstalkd: `pda/pheanstalk ~3.0`
- Redis: `predis/predis ~1.0`
</div>

<a name="creating-jobs"></a>
## Crear Trabajos

<a name="generating-job-classes"></a>
### Generar Clases de Trabajos

Por defecto, todos los trabajos que se pueden poner en cola para la aplicación son almacenados en el directorio `app/Jobs`. Si `app/Jobs` no existe, será creado cuando se ejecute el comando Artisan `make:job`. Puede que sea necesario generar un nuevo trabajo en cola usando Artisan CLI:

    php artisan make:job ProcessPodcast

La clase generada implementará la interfaz `Illuminate\Contracts\Queue\ShouldQueue`, indicando a Laravel que el trabajo debe ser empujado a la cola de forma asíncrona.

<a name="class-structure"></a>
### Estructura De Clases

Las clases de trabajos son muy sencillas, normalmente contienen un único método `handle` que es llamado cuando el trabajo es procesado por la cola. Para empezar, observemos un ejemplo de clase de trabajos. En este ejemplo, asumiremos que manejamos un servicio de publicación de podcasts y necesitamos procesar los archivos del podcast subido antes de que sean publicados:

    <?php

    namespace App\Jobs;

    use App\Podcast;
    use App\AudioProcessor;
    use Illuminate\Bus\Queueable;
    use Illuminate\Queue\SerializesModels;
    use Illuminate\Queue\InteractsWithQueue;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Foundation\Bus\Dispatchable;

    class ProcessPodcast implements ShouldQueue
    {
        use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

        protected $podcast;

        /**
         * Create a new job instance.
         *
         * @param  Podcast  $podcast
         * @return void
         */
        public function __construct(Podcast $podcast)
        {
            $this->podcast = $podcast;
        }

        /**
         * Execute the job.
         *
         * @param  AudioProcessor  $processor
         * @return void
         */
        public function handle(AudioProcessor $processor)
        {
            // Process uploaded podcast...
        }
    }

En este ejemplo, nótese que somos capaces de pasar un [Eloquent model](/docs/{{version}}/eloquent) directamente hacia el constructor del trabajo en cola. Debido al atributo `SerializesModels` que el trabajo está usando, los modelos ELoquent serán serializados y deserializados grácilmente cuando el trabajo se esté procesando. Si tu trabajo en cola acepta un modelo Eloquent en su constructor, sólo el identificador para el modelo será serializado en la cola. Cuando el trabajo esté manejado, el sistema de colas re-recuperará automáticamente la instancia completa del modelo desde la base de datos. Todo es totalmente transparente a tu aplicación y previene inconvenientes que pueden surgir de serializar instancias Eloquent completas.

El método `handle` es llamado cuando el trabajo es procesado por la cola. Nótese que somos capaces de sugerir dependencias en el método `handle` del trabajo. El [service container](/docs/{{version}}/container) de Laravel automáticamente inyecta estas dependencias.

> {note} Los datos binarios, como los contenidos de imagen, deben ser pasados a través de la función `base64_encode` antes de ser pasados a un trabajo en cola. De otra forma, el trabajo podría no serializar correctamente a JSON cuando es colocado en la cola.

<a name="dispatching-jobs"></a>
## Despachar Trabajos

Una vez escrita la clase de trabajo, se puede dspachar usando el método `dispatch` en el mismo trabajo. Los argumentos pasados a `dispatch` serán dados al constructor de trabajos:

    <?php

    namespace App\Http\Controllers;

    use App\Jobs\ProcessPodcast;
    use Illuminate\Http\Request;
    use App\Http\Controllers\Controller;

    class PodcastController extends Controller
    {
        /**
         * Store a new podcast.
         *
         * @param  Request  $request
         * @return Response
         */
        public function store(Request $request)
        {
            // Create podcast...

            ProcessPodcast::dispatch($podcast);
        }
    }

<a name="delayed-dispatching"></a>
### Despacho Postergado

Si se quiere postergar la ejecución de un trabajo en cola, se puede utilizar el método `delay` al despachar un trabajo. Por ejemplo, especifiquemos que un trabajo no debería estar disponible para procesamiento hasta 10 minutos después que haya sido despachado:

    <?php

    namespace App\Http\Controllers;

    use App\Jobs\ProcessPodcast;
    use Illuminate\Http\Request;
    use App\Http\Controllers\Controller;

    class PodcastController extends Controller
    {
        /**
         * Store a new podcast.
         *
         * @param  Request  $request
         * @return Response
         */
        public function store(Request $request)
        {
            // Create podcast...

            ProcessPodcast::dispatch($podcast)
                    ->delay(now()->addMinutes(10));
        }
    }

> {note} El servicio de cola Amazon SQS tiene un tiempo máximo de retraso de 15 minutos.

<a name="job-chaining"></a>
### Job Chaining

Job chaining allows you to specify a list of queued jobs that should be run in sequence. If one job in the sequence fails, the rest of the jobs will not be run. To execute a queued job chain, you may use the `withChain` method on any of your dispatchable jobs:

    ProcessPodcast::withChain([
        new OptimizePodcast,
        new ReleasePodcast
    ])->dispatch();

<a name="customizing-the-queue-and-connection"></a>
### Customizing The Queue & Connection

#### Dispatching To A Particular Queue

By pushing jobs to different queues, you may "categorize" your queued jobs and even prioritize how many workers you assign to various queues. Keep in mind, this does not push jobs to different queue "connections" as defined by your queue configuration file, but only to specific queues within a single connection. To specify the queue, use the `onQueue` method when dispatching the job:

    <?php

    namespace App\Http\Controllers;

    use App\Jobs\ProcessPodcast;
    use Illuminate\Http\Request;
    use App\Http\Controllers\Controller;

    class PodcastController extends Controller
    {
        /**
         * Store a new podcast.
         *
         * @param  Request  $request
         * @return Response
         */
        public function store(Request $request)
        {
            // Create podcast...

            ProcessPodcast::dispatch($podcast)->onQueue('processing');
        }
    }

#### Dispatching To A Particular Connection

If you are working with multiple queue connections, you may specify which connection to push a job to. To specify the connection, use the `onConnection` method when dispatching the job:

    <?php

    namespace App\Http\Controllers;

    use App\Jobs\ProcessPodcast;
    use Illuminate\Http\Request;
    use App\Http\Controllers\Controller;

    class PodcastController extends Controller
    {
        /**
         * Store a new podcast.
         *
         * @param  Request  $request
         * @return Response
         */
        public function store(Request $request)
        {
            // Create podcast...

            ProcessPodcast::dispatch($podcast)->onConnection('sqs');
        }
    }

Of course, you may chain the `onConnection` and `onQueue` methods to specify the connection and the queue for a job:

    ProcessPodcast::dispatch($podcast)
                  ->onConnection('sqs')
                  ->onQueue('processing');

<a name="max-job-attempts-and-timeout"></a>
### Specifying Max Job Attempts / Timeout Values

#### Max Attempts

One approach to specifying the maximum number of times a job may be attempted is via the `--tries` switch on the Artisan command line:

    php artisan queue:work --tries=3

However, you may take a more granular approach by defining the maximum number of attempts on the job class itself. If the maximum number of attempts is specified on the job, it will take precedence over the value provided on the command line:

    <?php

    namespace App\Jobs;

    class ProcessPodcast implements ShouldQueue
    {
        /**
         * The number of times the job may be attempted.
         *
         * @var int
         */
        public $tries = 5;
    }

<a name="time-based-attempts"></a>
#### Time Based Attempts

As an alternative to defining how many times a job may be attempted before it fails, you may define a time at which the job should timeout. This allows a job to be attempted any number of times within a given time frame. To define the time at which a job should timeout, add a `retryUntil` method to your job class:

    /**
     * Determine the time at which the job should timeout.
     *
     * @return \DateTime
     */
    public function retryUntil()
    {
        return now()->addSeconds(5);
    }

> {tip} You may also define a `retryUntil` method on your queued event listeners.

#### Timeout

> {note} The `timeout` feature is optimized for PHP 7.1+ and the `pcntl` PHP extension.

Likewise, the maximum number of seconds that jobs can run may be specified using the `--timeout` switch on the Artisan command line:

    php artisan queue:work --timeout=30

However, you may also define the maximum number of seconds a job should be allowed to run on the job class itself. If the timeout is specified on the job, it will take precedence over any timeout specified on the command line:

    <?php

    namespace App\Jobs;

    class ProcessPodcast implements ShouldQueue
    {
        /**
         * The number of seconds the job can run before timing out.
         *
         * @var int
         */
        public $timeout = 120;
    }

<a name="rate-limiting"></a>
### Rate Limiting

> {note} This feature requires that your application can interact with a [Redis server](/docs/{{version}}/redis).

If your application interacts with Redis, you may throttle your queued jobs by time or concurrency. This feature can be of assistance when your queued jobs are interacting with APIs that are also rate limited. For example, using the `throttle` method, you may throttle a given type of job to only run 10 times every 60 seconds. If a lock can not be obtained, you should typically release the job back onto the queue so it can be retried later:

    Redis::throttle('key')->allow(10)->every(60)->then(function () {
        // Job logic...
    }, function () {
        // Could not obtain lock...

        return $this->release(10);
    });

> {tip} In the example above, the `key` may be any string that uniquely identifies the type of job you would like to rate limit. For example, you may wish to construct the key based on the class name of the job and the IDs of the Eloquent models it operates on.

Alternatively, you may specify the maximum number of workers that may simultaneously process a given job. This can be helpful when a queued job is modifying a resource that should only be modified by one job at a time. For example, using the `funnel` method, you may limit jobs of a given type to only be processed by one worker at a time:

    Redis::funnel('key')->limit(1)->then(function () {
        // Job logic...
    }, function () {
        // Could not obtain lock...

        return $this->release(10);
    });

> {tip} When using rate limiting, the number of attempts your job will need to run successfully can be hard to determine. Therefore, it is useful to combine rate limiting with [time based attempts](#time-based-attempts).

<a name="error-handling"></a>
### Error Handling

If an exception is thrown while the job is being processed, the job will automatically be released back onto the queue so it may be attempted again. The job will continue to be released until it has been attempted the maximum number of times allowed by your application. The maximum number of attempts is defined by the `--tries` switch used on the `queue:work` Artisan command. Alternatively, the maximum number of attempts may be defined on the job class itself. More information on running the queue worker [can be found below](#running-the-queue-worker).

<a name="running-the-queue-worker"></a>
## Running The Queue Worker

Laravel includes a queue worker that will process new jobs as they are pushed onto the queue. You may run the worker using the `queue:work` Artisan command. Note that once the `queue:work` command has started, it will continue to run until it is manually stopped or you close your terminal:

    php artisan queue:work

> {tip} To keep the `queue:work` process running permanently in the background, you should use a process monitor such as [Supervisor](#supervisor-configuration) to ensure that the queue worker does not stop running.

Remember, queue workers are long-lived processes and store the booted application state in memory. As a result, they will not notice changes in your code base after they have been started. So, during your deployment process, be sure to [restart your queue workers](#queue-workers-and-deployment).

#### Processing A Single Job

The `--once` option may be used to instruct the worker to only process a single job from the queue:

    php artisan queue:work --once

#### Specifying The Connection & Queue

You may also specify which queue connection the worker should utilize. The connection name passed to the `work` command should correspond to one of the connections defined in your `config/queue.php` configuration file:

    php artisan queue:work redis

You may customize your queue worker even further by only processing particular queues for a given connection. For example, if all of your emails are processed in an `emails` queue on your `redis` queue connection, you may issue the following command to start a worker that only processes only that queue:

    php artisan queue:work redis --queue=emails

#### Resource Considerations

Daemon queue workers do not "reboot" the framework before processing each job. Therefore, you should free any heavy resources after each job completes. For example, if you are doing image manipulation with the GD library, you should free the memory with `imagedestroy` when you are done.

<a name="queue-priorities"></a>
### Queue Priorities

Sometimes you may wish to prioritize how your queues are processed. For example, in your `config/queue.php` you may set the default `queue` for your `redis` connection to `low`. However, occasionally you may wish to push a job to a `high` priority queue like so:

    dispatch((new Job)->onQueue('high'));

To start a worker that verifies that all of the `high` queue jobs are processed before continuing to any jobs on the `low` queue, pass a comma-delimited list of queue names to the `work` command:

    php artisan queue:work --queue=high,low

<a name="queue-workers-and-deployment"></a>
### Queue Workers & Deployment

Since queue workers are long-lived processes, they will not pick up changes to your code without being restarted. So, the simplest way to deploy an application using queue workers is to restart the workers during your deployment process. You may gracefully restart all of the workers by issuing the `queue:restart` command:

    php artisan queue:restart

This command will instruct all queue workers to gracefully "die" after they finish processing their current job so that no existing jobs are lost. Since the queue workers will die when the `queue:restart` command is executed, you should be running a process manager such as [Supervisor](#supervisor-configuration) to automatically restart the queue workers.

> {tip} The queue uses the [cache](/docs/{{version}}/cache) to store restart signals, so you should verify a cache driver is properly configured for your application before using this feature.

<a name="job-expirations-and-timeouts"></a>
### Job Expirations & Timeouts

#### Job Expiration

In your `config/queue.php` configuration file, each queue connection defines a `retry_after` option. This option specifies how many seconds the queue connection should wait before retrying a job that is being processed. For example, if the value of `retry_after` is set to `90`, the job will be released back onto the queue if it has been processing for 90 seconds without being deleted. Typically, you should set the `retry_after` value to the maximum number of seconds your jobs should reasonably take to complete processing.

> {note} The only queue connection which does not contain a `retry_after` value is Amazon SQS. SQS will retry the job based on the [Default Visibility Timeout](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/AboutVT.html) which is managed within the AWS console.

#### Worker Timeouts

The `queue:work` Artisan command exposes a `--timeout` option. The `--timeout` option specifies how long the Laravel queue master process will wait before killing off a child queue worker that is processing a job. Sometimes a child queue process can become "frozen" for various reasons, such as an external HTTP call that is not responding. The `--timeout` option removes frozen processes that have exceeded that specified time limit:

    php artisan queue:work --timeout=60

The `retry_after` configuration option and the `--timeout` CLI option are different, but work together to ensure that jobs are not lost and that jobs are only successfully processed once.

> {note} The `--timeout` value should always be at least several seconds shorter than your `retry_after` configuration value. This will ensure that a worker processing a given job is always killed before the job is retried. If your `--timeout` option is longer than your `retry_after` configuration value, your jobs may be processed twice.

#### Worker Sleep Duration

When jobs are available on the queue, the worker will keep processing jobs with no delay in between them. However, the `sleep` option determines how long the worker will "sleep" if there are no new jobs available. While sleeping, the worker will not process any new jobs - the jobs will be processed after the worker wakes up again.

    php artisan queue:work --sleep=3

<a name="supervisor-configuration"></a>
## Supervisor Configuration

#### Installing Supervisor

Supervisor is a process monitor for the Linux operating system, and will automatically restart your `queue:work` process if it fails. To install Supervisor on Ubuntu, you may use the following command:

    sudo apt-get install supervisor

> {tip} If configuring Supervisor yourself sounds overwhelming, consider using [Laravel Forge](https://forge.laravel.com), which will automatically install and configure Supervisor for your Laravel projects.

#### Configuring Supervisor

Supervisor configuration files are typically stored in the `/etc/supervisor/conf.d` directory. Within this directory, you may create any number of configuration files that instruct supervisor how your processes should be monitored. For example, let's create a `laravel-worker.conf` file that starts and monitors a `queue:work` process:

    [program:laravel-worker]
    process_name=%(program_name)s_%(process_num)02d
    command=php /home/forge/app.com/artisan queue:work sqs --sleep=3 --tries=3
    autostart=true
    autorestart=true
    user=forge
    numprocs=8
    redirect_stderr=true
    stdout_logfile=/home/forge/app.com/worker.log

In this example, the `numprocs` directive will instruct Supervisor to run 8 `queue:work` processes and monitor all of them, automatically restarting them if they fail. Of course, you should change the `queue:work sqs` portion of the `command` directive to reflect your desired queue connection.

#### Starting Supervisor

Once the configuration file has been created, you may update the Supervisor configuration and start the processes using the following commands:

    sudo supervisorctl reread

    sudo supervisorctl update

    sudo supervisorctl start laravel-worker:*

For more information on Supervisor, consult the [Supervisor documentation](http://supervisord.org/index.html).

<a name="dealing-with-failed-jobs"></a>
## Dealing With Failed Jobs

Sometimes your queued jobs will fail. Don't worry, things don't always go as planned! Laravel includes a convenient way to specify the maximum number of times a job should be attempted. After a job has exceeded this amount of attempts, it will be inserted into the `failed_jobs` database table. To create a migration for the `failed_jobs` table, you may use the `queue:failed-table` command:

    php artisan queue:failed-table

    php artisan migrate

Then, when running your [queue worker](#running-the-queue-worker), you should specify the maximum number of times a job should be attempted using the `--tries` switch on the `queue:work` command. If you do not specify a value for the `--tries` option, jobs will be attempted indefinitely:

    php artisan queue:work redis --tries=3

<a name="cleaning-up-after-failed-jobs"></a>
### Cleaning Up After Failed Jobs

You may define a `failed` method directly on your job class, allowing you to perform job specific clean-up when a failure occurs. This is the perfect location to send an alert to your users or revert any actions performed by the job. The `Exception` that caused the job to fail will be passed to the `failed` method:

    <?php

    namespace App\Jobs;

    use Exception;
    use App\Podcast;
    use App\AudioProcessor;
    use Illuminate\Bus\Queueable;
    use Illuminate\Queue\SerializesModels;
    use Illuminate\Queue\InteractsWithQueue;
    use Illuminate\Contracts\Queue\ShouldQueue;

    class ProcessPodcast implements ShouldQueue
    {
        use InteractsWithQueue, Queueable, SerializesModels;

        protected $podcast;

        /**
         * Create a new job instance.
         *
         * @param  Podcast  $podcast
         * @return void
         */
        public function __construct(Podcast $podcast)
        {
            $this->podcast = $podcast;
        }

        /**
         * Execute the job.
         *
         * @param  AudioProcessor  $processor
         * @return void
         */
        public function handle(AudioProcessor $processor)
        {
            // Process uploaded podcast...
        }

        /**
         * The job failed to process.
         *
         * @param  Exception  $exception
         * @return void
         */
        public function failed(Exception $exception)
        {
            // Send user notification of failure, etc...
        }
    }

<a name="failed-job-events"></a>
### Failed Job Events

If you would like to register an event that will be called when a job fails, you may use the `Queue::failing` method. This event is a great opportunity to notify your team via email or [HipChat](https://www.hipchat.com). For example, we may attach a callback to this event from the `AppServiceProvider` that is included with Laravel:

    <?php

    namespace App\Providers;

    use Illuminate\Support\Facades\Queue;
    use Illuminate\Queue\Events\JobFailed;
    use Illuminate\Support\ServiceProvider;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Bootstrap any application services.
         *
         * @return void
         */
        public function boot()
        {
            Queue::failing(function (JobFailed $event) {
                // $event->connectionName
                // $event->job
                // $event->exception
            });
        }

        /**
         * Register the service provider.
         *
         * @return void
         */
        public function register()
        {
            //
        }
    }

<a name="retrying-failed-jobs"></a>
### Retrying Failed Jobs

To view all of your failed jobs that have been inserted into your `failed_jobs` database table, you may use the `queue:failed` Artisan command:

    php artisan queue:failed

The `queue:failed` command will list the job ID, connection, queue, and failure time. The job ID may be used to retry the failed job. For instance, to retry a failed job that has an ID of `5`, issue the following command:

    php artisan queue:retry 5

To retry all of your failed jobs, execute the `queue:retry` command and pass `all` as the ID:

    php artisan queue:retry all

If you would like to delete a failed job, you may use the `queue:forget` command:

    php artisan queue:forget 5

To delete all of your failed jobs, you may use the `queue:flush` command:

    php artisan queue:flush

<a name="job-events"></a>
## Job Events

Using the `before` and `after` methods on the `Queue` [facade](/docs/{{version}}/facades), you may specify callbacks to be executed before or after a queued job is processed. These callbacks are a great opportunity to perform additional logging or increment statistics for a dashboard. Typically, you should call these methods from a [service provider](/docs/{{version}}/providers). For example, we may use the `AppServiceProvider` that is included with Laravel:

    <?php

    namespace App\Providers;

    use Illuminate\Support\Facades\Queue;
    use Illuminate\Support\ServiceProvider;
    use Illuminate\Queue\Events\JobProcessed;
    use Illuminate\Queue\Events\JobProcessing;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Bootstrap any application services.
         *
         * @return void
         */
        public function boot()
        {
            Queue::before(function (JobProcessing $event) {
                // $event->connectionName
                // $event->job
                // $event->job->payload()
            });

            Queue::after(function (JobProcessed $event) {
                // $event->connectionName
                // $event->job
                // $event->job->payload()
            });
        }

        /**
         * Register the service provider.
         *
         * @return void
         */
        public function register()
        {
            //
        }
    }

Using the `looping` method on the `Queue` [facade](/docs/{{version}}/facades), you may specify callbacks that execute before the worker attempts to fetch a job from a queue. For example, you might register a Closure to rollback any transactions that were left open by a previously failed job:

    Queue::looping(function () {
        while (DB::transactionLevel() > 0) {
            DB::rollBack();
        }
    });
