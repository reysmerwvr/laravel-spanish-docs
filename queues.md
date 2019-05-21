::: v-pre

# Colas De Trabajo

- [Introducción](#introduction)
    - [Conexiones Vs. Colas](#connections-vs-queues)
    - [Notas Y Requisitos Previos de Driver](#driver-prerequisites)
- [Creación De Trabajos](#creating-jobs)
    - [Generación De Clases De Trabajos](#generating-job-classes)
    - [Estructura De Clases](#class-structure)
- [Despachar Trabajos](#dispatching-jobs)
    - [Despacho Postergado](#delayed-dispatching)
    - [Envío Sincrónico](#synchronous-dispatching)
    - [Encadenamiento De Trabajos](#job-chaining)
    - [Personalizar La Cola Y Conexión](#customizing-the-queue-and-connection)
    - [Especificar Intentos Máximos De Trabajos / Valores De Timeout](#max-job-attempts-and-timeout)
    - [Límites De Rango](#rate-limiting)
    - [Manejo De Errores](#error-handling)
- [Closures De Colas](#queueing-closures)
- [Ejecutar El Worker De Cola](#running-the-queue-worker)
    - [Prioridades En Cola](#queue-priorities)
    - [Workers de Cola Y Despliegue](#queue-workers-and-deployment)
    - [Expiraciones De Trabajo Y Tiempos De Espera](#job-expirations-and-timeouts)
- [Configuración de Supervisor](#supervisor-configuration)
- [Manejo De Trabajos Fallidos](#dealing-with-failed-jobs)
    - [Remediando Trabajos Fallidos](#cleaning-up-after-failed-jobs)
    - [Eventos De Trabajos Fallidos](#failed-job-events)
    - [Reintentando Trabajos Fallidos](#retrying-failed-jobs)
    - [Ignorando Modelos Faltantes](#ignoring-missing-models)
- [Eventos De Trabajo](#job-events)

<a name="introduction"></a>
## Introducción

::: tip
Laravel ahora ofrece Horizon, un hermoso tablero y sistema de configuración para las colas motorizadas por Redis. Entra en [Horizon documentation](/docs/{{version}}/horizon) para más inormación.
:::

Las colas de Laravel brindan una API unificada a través de una variedad de backends de cola diferentes como Beanstalk, Amazon SQS, Redis, o incluso una base de datos relacional. Las colas permiten diferir el procesamiento de una tarea que consume tiempo, como enviar un correo electrónico, para un momento posterior. Diferir estas tareas acelera drásticamente las solicitudes web en tu aplicación.

La configuración de cola está almacenada en `config/queue.php`. En este archivo encontrarás configuraciones de conexión para cada driver de cola incluido en el framework, que comprende una base de datos, [Beanstalkd](https://kr.github.io/beanstalkd/), [Amazon SQS](https://aws.amazon.com/sqs/), [Redis](https://redis.io), y un controlador sincrónico que ejecutará trabajos inmediatamente (para uso local). Un driver de cola `null` también está incluido, que descarta los trabajos completados de la cola.

<a name="connections-vs-queues"></a>
### Conexiones Vs. COlas

Antes de empezar con las colas de Laravel, es importante entender la distinción entre "conexiones" y "colas". En tu archivo `config/queue.php`, hay una opción de configuración `connections`. Esta opción define una conexión particular a un servicio de backend como Amazon SQS, Beanstalk o Redis. Sin embargo, cualquier conexión de cola dada puede tener múltiples "colas" las cuales pueden ser considerarse como diferentes pilas de trabajos en espera.

Ten en cuenta que cada ejemplo de configuración de conexión en el archivo `queue` contiene un atributo `queue`. Ésta es la cola por defecto a la cual los trabajos serán despachados cuando son enviados a una conexión dada. En otras palabras, si despachas un trabajo sin definir explícitamente a cuál cola debe ser despachado, el trabajo será colocado en la cola definida en el atributo `queue` de la configuración de conexión:

```php
// This job is sent to the default queue...
Job::dispatch();

// This job is sent to the "emails" queue...
Job::dispatch()->onQueue('emails');
```

Algunas aplicaciones quizá no necesiten nunca insertar trabajos en múltiples colas, prefiriendo en su lugar tener una cola simple. Sin embargo, empujar trabajos a múltiples colas puede ser especialmente útil para aplicaciones que deseen priorizar o segmentar el procesamiento de sus trabajos, puesto que el worker de cola de Laravel permite especificar cuáles colas deben ser procesadas de acuerdo a su prioridad. Por ejemplo, si se insertan trabajos a una cola `high` se puede ejecutar un worker que les dé mayor prioridad de procesamiento:

```php
php artisan queue:work --queue=high,default
```

<a name="driver-prerequisites"></a>
### Notas Y Requisitos Previos de Driver

#### Base De Datos

Para utilizar el driver de cola `database`, necesitarás una tabla de base de datos para mantener los trabajos. Para generar una migración que crea esta tabla, ejecute el comando Artisan `queue:table`. Una vez creada la migración, puede migrar la base de datos mediante el comando `migrate`:

```php
php artisan queue:table

php artisan migrate
```

#### Redis

Para usar el controlador de cola `redis`, debes configurar una conexión a una base de datos Redis en tu archivo `config/database.php`.

**Redis Cluster**

Si tu conexión de cola Redis usa un Redis Cluster, tus nombres de cola deben contener un [key hash tag](https://redis.io/topics/cluster-spec#keys-hash-tags). Esto es requerido para asegurar que todas las llaves Redis para una determinada cola sean colocadas en el mismo hash slot:

```php
'redis' => [
    'driver' => 'redis',
    'connection' => 'default',
    'queue' => '{default}',
    'retry_after' => 90,
],
```

**Bloqueo**

Al usar la cola Redis, se puede usar la opción de configuración `block_for` para especificar por cuánto tiempo debería esperar el controlador para que un trabajo esté disponible antes de repetirse a través del bucle del worker y volver a consultar la base de datos Redis.

Ajustar este valor en la carga de cola puede ser más eficiente que consultar continuamente la base de datos Redis buscando nuevos trabajos. Por ejemplo, puedes establecer el valor en `5` para indicar que el controlador debe bloquearse por cinco segundos mientras espera a que un trabajo esté disponible:

```php
'redis' => [
    'driver' => 'redis',
    'connection' => 'default',
    'queue' => 'default',
    'retry_after' => 90,
    'block_for' => 5,
],
```

#### Requisitos Previos Para Otros Controladores

Las siguientes dependencias son necesarias para sus controladores respectivos:

- Amazon SQS: `aws/aws-sdk-php ~3.0`
- Beanstalkd: `pda/pheanstalk ~4.0`
- Redis: `predis/predis ~1.0`

<a name="creating-jobs"></a>
## Creación De Trabajos

<a name="generating-job-classes"></a>
### Generación De Clases De Trabajos

Por defecto, todos los trabajos que se pueden poner en cola para la aplicación son almacenados en el directorio `app/Jobs`. Si `app/Jobs` no existe, será creado cuando se ejecute el comando Artisan `make:job`. Puedes generar un nuevo trabajo en cola utilizando la CLI Artisan:

```php
php artisan make:job ProcessPodcast
```

La clase generada implementará la interfaz `Illuminate\Contracts\Queue\ShouldQueue`, indicando a Laravel que el trabajo debe ser insertado a la cola de forma asíncrona.

<a name="class-structure"></a>
### Estructura De Clases

Las clases de trabajo son muy sencillas, normalmente contienen  un único método `handle` que se llama cuando la cola procesa el trabajo. Para empezar, echemos un vistazo a una clase de trabajo de ejemplo. En este ejemplo, vamos a pretender que administramos un servicio de publicación de podcasts y necesitamos procesar los archivos de podcast cargados antes de que se publiquen:

```php
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
```

En este ejemplo, ten en cuenta que hemos podido pasar un [modelo Eloquent](/docs/{{version}}/eloquent) directamente hacia el constructor del trabajo en cola. Debido al trait `SerializesModels` que el trabajo está usando, los modelos Eloquent serán serializados y deserializados correctamente cuando el trabajo se esté procesando. Si tu trabajo en cola acepta un modelo Eloquent en su constructor, sólo el identificador para el modelo será serializado en la cola. Cuando el trabajo se maneja realmente, el sistema de cola volverá a recuperar automáticamente la instancia del modelo completo de la base de datos. Todo es totalmente transparente a tu aplicación y previene inconvenientes que pueden surgir de serializar instancias Eloquent completas.

El método `handle` es llamado cuando el trabajo es procesado por la cola. Ten en cuenta que podemos declarar el tipo de dependencias en el método `handle` del trabajo. El [contenedor de servicios](/docs/{{version}}/container) de Laravel automáticamente inyecta estas dependencias.

Si te gustaría tomar control sobre cómo el contenedor inyecta dependencias en el método `handle`, puedes usar el método `bindMethod` del contenedor. El método `bindMethod` acepta una función de retorno (callback) que recibe el trabajo y el contenedor. Dentro del callback, eres libre de invocar al método `handle` de la forma que desees. Típicamente, deberías llamar a este método desde un [proveedor de servicios](/docs/{{version}}/providers):
	
```php 
use App\Jobs\ProcessPodcast;

$this->app->bindMethod(ProcessPodcast::class.'@handle', function ($job, $app) {
    return $job->handle($app->make(AudioProcessor::class));
});
```

::: danger Nota
Los datos binarios, como los contenidos de imagen, deben ser pasados a través de la función `base64_encode` antes de ser pasados a un trabajo en cola. De otra forma, el trabajo podría no serializarse correctamente a JSON cuando es colocado en la cola.
:::

<a name="dispatching-jobs"></a>
## Despachar Trabajos

Una vez escrita la clase de trabajo, se puede despachar usando el método `dispatch` en el mismo trabajo. Los argumentos pasados a `dispatch` serán entregados al constructor de trabajos:

```php
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
```

<a name="delayed-dispatching"></a>
### Despacho Postergado

Si quieres postergar la ejecución de un trabajo en cola, puedes utilizar el método `delay` al despachar un trabajo. Por ejemplo, especifiquemos que un trabajo no debería estar disponible para procesamiento hasta 10 minutos después que haya sido despachado:

```php
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
```

::: danger Nota
El servicio de cola Amazon SQS tiene un tiempo máximo de retraso de 15 minutos.
:::

<a name="synchronous-dispatching"></a>
### Despacho Sincrónico

Si deseas enviar un trabajo inmediatamente (sincrónicamente), puedes usar el método `dispatchNow`. Al usar este método, el trabajo no se pondrá en cola y se ejecutará inmediatamente dentro del proceso actual:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Jobs\ProcessPodcast;
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

        ProcessPodcast::dispatchNow($podcast);
    }
}
```

<a name="job-chaining"></a>
### Encadenamiento De Trabajos

El encadenamiento de trabajos te permite especificar una lista de trabajos en cola que deben ser ejecutados en secuencia. Si un trabajo en la secuencia falla, el resto no será ejecutado. Para ejecutar una cadena de trabajos en cola, puedes utilizar el método `withChain` en cualquier trabajo a enviar:

```php
ProcessPodcast::withChain([
    new OptimizePodcast,
    new ReleasePodcast
])->dispatch();
```

::: danger Nota
La eliminación de trabajos mediante el método `$this->delete()` no impedirá que se procesen los trabajos encadenados. La cadena sólo dejará de ejecutarse si falla un trabajo en la cadena.
:::

#### Cola Y Conexión En Cadena

Si quieres especificar la cola y conexión por defecto que debe ser usada para los trabajos encadenados, se puede usar los métodos  `allOnConnection` and `allOnQueue`. Estos métodos especifican la conexión y nombre de cola que debe ser usado a menos que el trabajo en cola sea asignado explícitamente a una diferente conexión / cola:

```php
ProcessPodcast::withChain([
    new OptimizePodcast,
    new ReleasePodcast
])->dispatch()->allOnConnection('redis')->allOnQueue('podcasts');
```

<a name="customizing-the-queue-and-connection"></a>
### Personalizar La Cola Y La Conexión

#### Despachar A Una Cola Específica

Al insertar trabajos en diferentes colas, puedes "categorizar" los trabajos en cola e incluso priorizar cuántos workers son asignados a las distintas colas. Sin embargo, es preciso resaltar que esto no inserta trabajos en diferentes "conexiones" de cola definidas en el archivo de configuración de colas, sino en colas específicas dentro de una sola conexión. Para especificar la cola, se usa el método `onQueue` al despachar un trabajo:

```php
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
```

#### Despachar A Una Conexión Específica

Si estás trabajando con múltiples conexiones de cola, puedes especificar en cuál conexión deseas insertar un trabajo. Para especificar la conexión, utiliza el método `onConnection` al despachar el trabajo:

```php
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
```

Puedes encadenar los métodos `onConnection` y `onQueue` para especificar la conexión y cola de un trabajo:

```php
ProcessPodcast::dispatch($podcast)
                ->onConnection('sqs')
                ->onQueue('processing');
```

<a name="max-job-attempts-and-timeout"></a>
### Especificar Intentos Máximos De Un Trabajo Y Valores De Tiempos De Espera (Timeout)

#### Número De Intentos Máximo

Una forma de especificar el número máximo de veces que un trabajo puede ser intentado es mediante la opción `--tries` en la línea de comandos Artisan:

```php
php artisan queue:work --tries=3
```

Sin embargo, puedes tomar un camino más granular definiendo el número máximo de intentos dentro de la clase de trabajos. Si el número máximo de intentos está especificado en el trabajo, precederá sobre el valor provisto en la línea de comandos:

```php
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
```

<a name="time-based-attempts"></a>
#### Intentos Basados En Tiempo

Como alternativa a definir cuántas veces un trabajo puede ser intentado antes de que falle, puedes definir en qué momento el trabajo debería pasar a tiempo de espera (timeout). Esto permite intentar un trabajo cualquier cantidad de veces dentro de un marco de tiempo dado. Para definir el momento en el que un trabajo debería pasar a timeout, se agrega un método `retryUntil` en la clase de trabajos:

```php
/**
* Determine the time at which the job should timeout.
*
* @return \DateTime
*/
public function retryUntil()
{
    return now()->addSeconds(5);
}
```

::: tip
También puedes definir un método `retryUntil` en los listeners de eventos en cola.
:::

#### Tiempo De Espera (Timeout)

::: danger Nota
La característica `timeout` está optimizada para PHP 7.1+ y la extensión `pcntl`.
:::

De igual modo, el número máximo de segundos para ejecutar un trabajo pueden ser especificados usando la opción `--timeout` en la línea de comandos Artisan:

```php
php artisan queue:work --timeout=30
```

Sin embargo, es posible querer definir el número máximo de segundos para ejecutar un trabajo dentro de su clase. Si el timeout está especificado en el trabajo, prevalecerá sobre cualquier otro timeout especificado en la línea de comandos:

```php
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
```

<a name="rate-limiting"></a>
### Límite De Rango

::: danger Nota
Esta característica requiere que la aplicación pueda interactuar con un [Redis server](/docs/{{version}}/redis).
:::

Si tu aplicación interactúa con Redis, puedes regular los trabajos en cola por tiempo o concurrencia. Esta característica puede ser de ayuda cuando los trabajos en cola interactúan con APIs que también poseen límite de frecuencia. 

Por ejemplo, usando el método `throttle`, puedes regular cierto tipo de trabajo para que se ejecute sólo diez veces por minuto. Si no se puede obtener un bloqueo, normalmente debes liberar el trabajo de vuelta a la cola para que pueda volver a intentarlo más tarde:

```php
Redis::throttle('key')->allow(10)->every(60)->then(function () {
    // Job logic...
}, function () {
    // Could not obtain lock...

    return $this->release(10);
});
```

::: tip
En el ejemplo anterior, `key` puede ser cualquier cadena que identifique únicamente el tipo de trabajo que se quiere limitar. Por ejemplo, puedes desear construir la key basada en el nombre de clase del trabajo y las IDS de los modelos Eloquent en los cuáles opera.
:::

::: danger Nota
Liberar un trabajo limitado de vuelta a la cola seguirá incrementando el número total de `intentos` del trabajo.
:::

Alternativamente, puedes especificar el número máximo de workers que pueden procesar simultáneamente un trabajo determinado. Esto puede ser útil cuando un trabajo en cola está modificando un recurso que solo debe ser modificado por un trabajo a la vez. Por ejemplo, utilizando el método `funnel`, puedes limitar los trabajos de un tipo dado para que solo sean procesados por un worker a la vez:

```php
Redis::funnel('key')->limit(1)->then(function () {
    // Job logic...
}, function () {
    // Could not obtain lock...

    return $this->release(10);
});
```

::: tip
Al utilizar límite de frecuencias, el número de intentos que el trabajo necesitará para ejecutarse exitosamente puede ser difícil de determinar. Por lo tanto, es útil combinar límite de frecuencias con [intentos basados en el tiempo](#time-based-attempts).
:::

<a name="error-handling"></a>
### Manejo De Errores

Si una excepción es lanzada mientras el trabajo está siendo procesado, el trabajo será automáticamente liberado a la cola para que pueda ser intentado de nuevo. EL trabajo continuará siendo liberado hasta que haya sido intentado el número de veces máximo permitido por tu aplicación. El número máximo de intentos es definido por la opción `--tries` usada en el comando Artisan `queue:work`. De forma alterna, el número máximo de intentos puede ser definido en la clase de trabajos en sí. Más información acerca de ejecutar el worker de cola [se puede encontrar a continuación](#running-the-queue-worker).

<a name="queueing-closures"></a>
## Closures De Colas

En lugar de enviar una clase de trabajo a la cola, también puedes enviar una Closure. Esto es ideal para tareas rápidas y simples que deben ejecutarse fuera del ciclo de solicitud actual:

```php
$podcast = App\Podcast::find(1);

dispatch(function () use ($podcast) {
    $podcast->publish();
});
```

Al enviar Closures a la cola, el contenido del código del Closure está firmado criptográficamente para que no se pueda modificar en tránsito.

<a name="running-the-queue-worker"></a>
## Ejecutar El Worker De Cola

Laravel incluye un worker de cola que procesará trabajos nuevos a medida que éstos son insertados en la cola. Puedes ejecutar el worker usando el comando Artisan `queue:work`. Ten en cuenta que una vez iniciado `queue:work`, continuará ejecutándose hasta que sea detenido manualmente o hasta que la terminal sea cerrada:

```php
php artisan queue:work
```

::: tip
Para mantener el proceso `queue:work` ejecutado permanentemente en segundo plano, debes usar un monitor de procesos como [Supervisor](#supervisor-configuration) para asegurar que el worker de cola no deja de ejecutarse.
:::

Recuerda, los workers en cola son procesos de larga duración y almacenan el estado de la aplicación iniciada en la memoria. Como resultado, no notarán cambios en la base de código después de que se han iniciado. Por lo tanto, durante el proceso de despliegue, asegúrate de [reiniciar los workers de cola](#queue-workers-and-deployment).

#### Especificando La Conexión Y Cola

También puedes especificar qué conexión de cola debe utilizar el worker. El nombre de conexión pasado al comando `work` debe corresponder a una de las conexiones definidas en tu archivo de configuración `config/queue.php`:

```php
php artisan queue:work redis
```

Puedes personalizar tu worker de colas más allá al solo procesar colas particulares para una conexión dada. Por ejemplo, si todos tus correos electrónicos son procesados en una cola `emails` en tu cola de conexión `redis`, puedes emitir el siguiente comando para iniciar un worker que solo procesa dicha cola:

```php
php artisan queue:work redis --queue=emails
```

#### Procesar Un Sólo Trabajo

La opción `--once` puede ser usada para indicarle al worker procesar sólo un trabajo de la cola:

```php
php artisan queue:work --once
```

#### Procesar Todos Los Trabajos En Cola Y Luego Salir

La opción `--stop-when-empty` puede ser usada para indicarle al worker procesar todos los trabajos y luego salir elegantemente. Esta opción puede ser útil al trabajar colas de Laravel con un contenedor Docker si deseas desactivar el contenedor cuando la cola esté vacía:

```php
php artisan queue:work --stop-when-empty
```

#### Consideraciones De Recursos

Los Daemon de workers de cola no "reinician" el framework antes de procesar cada trabajo. Por lo tanto, debes liberar cualquier recurso pesado luego de que cada trabajo sea completado. Por ejemplo, si estás realizando manipulación de imágenes con la librería GD, debes liberar la memoria cuando se termine con `imagedestroy`.

<a name="queue-priorities"></a>
### Prioridades De Cola

A veces puedes desear priorizar cómo se procesan las colas. Por ejemplo, en tu `config/queue.php` puedes establecer la `queue` predeterminada para tu conexión `redis` en `low`. Sin embargo, ocasionalmente puedes desear insertar un trabajo en una cola de prioridad `high` de esta forma:

```php
dispatch((new Job)->onQueue('high'));
```

Para iniciar un worker que verifique que todos los trabajos en la cola `high` sean procesados antes de continuar con los tabajos en `low`, pasa una lista de nombres de colas delimitada por comas al comando `work`:

```php
php artisan queue:work --queue=high,low
```

<a name="queue-workers-and-deployment"></a>
### Workers De Cola Y Despliegue

Debido a que los workers de cola son procesos de vida útil larga, no detectarán cambios en el código sin ser reiniciados.  Así que la forma más sencilla de poner en producción una aplicación utilizando workers de cola es reiniciando los workers durante el proceso de despliegue. Puedes con elegancia reiniciar todos los workers ejecutando el comando `queue:restart`:

```php
php artisan queue:restart
```

Este comando indicará a todos los workers de cola que "mueran" luego de terminar el procesamiento de su trabajo actual para que ningún trabajo existente se pierda. Como los workers de cola morirán cuando se ejecute el comando `queue:restart`, un administrador de procesos debe estar en ejecución, como [Supervisor](#supervisor-configuration) para reiniciar automáticamente los workers de la cola.

::: tip
La cola utiliza [caché](/docs/{{version}}/cache) para almacenar señales de reinicio, por lo que debes verificar si un driver de caché está configurado debidamente en tu aplicación antes de utilizar esta característica.
:::

<a name="job-expirations-and-timeouts"></a>
### Expiraciones De Trabajo Y Tiempos De Espera

#### Expiración De Trabajos

En tu archivo de configuración `config/queue.php`, cada conexión de cola define una opción `retry_after`. Esta opción especifica cuántos segundos debe esperar la conexión de cola antes de reintentar un trabajo que está siendo procesado. Por ejemplo, si el valor de `retry_after` es establecido en `90`, el trabajo será liberado de nuevo a la cola si se ha estado procesando por 90 segundos sin haber sido eliminado. Generalmente, debes fijar el valor de `retry_after` al número máximo de segundos que le toma razonablemente a tus trabajos ser completamente procesados.

::: danger Nota
La única conexión de cola que no contiene un valor `retry_after` es Amazon SQS. SQS reintentará el trabajo basándose en el [Default Visibility Timeout](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/AboutVT.html) que es administrado dentro de la consola de AWS.
:::

#### Worker Timeouts

El comando Artisan `queue:work` expone una opción `--timeout`. `--timeout` especifica qué tanto el proceso maestro de cola de Laravel esperará antes de detener un worker de cola hijo que está procesando un trabajo. A veces un proceso de cola hijo puede "congelarse" por varias razones, como una llamada HTTP externa que no responde. La opción `--timeout` remueve los procesos congelados que han excedido el tiempo límite especificado:

```php
php artisan queue:work --timeout=60
```

La opción de configuración `retry_after` y la opción CLI `--timeout` son diferentes, pero trabajan juntas para asegurar que los trabajos no se pierdan y que los trabajos se procesen exitosamente sólo una vez.

::: danger Nota
El valor `--timeout` siempre debe ser al menos unos segundos menor que el valor de configuración `retry_after`. Esto asegurará que un worker procesando un trabajo determinado siempre sea detenido antes que el trabajo se reintente. Si la opción `--timeout` es mayor al valor de configuración `retry_after`, los trabajos podrían ser procesados dos veces.
:::

#### Duración De Descanso del Worker

Cuando hay trabajos disponibles en cola, el worker seguirá procesando trabajos sin retraso entre ellos. Sin embargo, la opción `sleep` determina por cuánto tiempo "dormirá" el worker si no hay nuevos trabajos disponibles. Mientras duerme, el worker no procesará trabajos nuevos - los trabajos serán procesados luego de que el worker despierte.

```php
php artisan queue:work --sleep=3
```

<a name="supervisor-configuration"></a>
## Configuración De Supervisor

#### Instalar Supervisor

Supervisor es un monitor de procesos para el sistema operativo Linux y reiniciará automáticamente tu proceso `queue:work` si éste falla. Para instalar Supervisor en Ubuntu, se puede usar el siguiente comando:

```php
sudo apt-get install supervisor
```

::: tip
Si configurar Supervisor por ti mismo suena abrumador, considera usar [Laravel Forge](https://forge.laravel.com), el cual instalará y configurará Supervisor automáticamente para tus proyectos en Laravel.
:::

#### Configurar Supervisor

Los archivos de configuración de Supervisor están almacenados generalmente en el directorio `/etc/supervisor/conf.d`. Dentro de este directorio, puedes crear cualquier número de archivos de configuración que le instruyan a Supervisor cómo monitorear los procesos.  Por ejemplo, creemos un archivo de configuración `laravel-worker.conf` que inicie y monitoree el proceso `queue:work`:

```php
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /home/forge/app.com/artisan queue:work sqs --sleep=3 --tries=3
autostart=true
autorestart=true
user=forge
numprocs=8
redirect_stderr=true
stdout_logfile=/home/forge/app.com/worker.log
```

En este ejemplo, la directiva `numprocs` le indicará a Supervisor ejecutar ocho procesos `queue:work` y monitorearlos todos, reiniciándolos automáticamente si fallan. Debes cambiar la porción `queue:work sqs` de la directiva `command` para reflejar la conexión de cola deseada.

#### Iniciar Supervisor

Una vez que el archivo de configuración haya sido creado, puedes actualizar la configuración de Supervisor e iniciar los procesos usando los siguientes comandos:

```php
sudo supervisorctl reread

sudo supervisorctl update

sudo supervisorctl start laravel-worker:*
```

Para más información acerca de Supervisor, consulta [la documentación de Supervisor](http://supervisord.org/index.html).

<a name="dealing-with-failed-jobs"></a>
## Manejo De Trabajos Fallidos

Algunas veces los trabajos en cola fallarán. Esto no es problema, ¡las cosas no siempre salen como esperamos! Laravel incluye una forma conveniente de especificar el número máximo de veces que un trabajo debe ser intentado. Luego que un trabajo haya excedido esta cantidad de intentos, será insertado en la tabla de base de datos `failed_jobs`. Para crear una migración para la tabla `failed_jobs` puedes usar el comando `queue:failed-table`:

```php
php artisan queue:failed-table

php artisan migrate
```

Entonces, al ejecutar el [worker de cola](#running-the-queue-worker), debes especificar el número máximo de intentos que un trabajo debe intentarse usando la opción `--tries` en el comando `queue:work` Si no especificas un valor para `--tries` los trabajos se intentarán indefinidamente:

```php
php artisan queue:work redis --tries=3
```

<a name="cleaning-up-after-failed-jobs"></a>
### Limpiar Después De Un Trabajo Fallido

Se puede definir un método `failed` directamente en la clase de trabajo, permitiendo realizar una limpieza específica de trabajo cuando una falla ocurre. Esta es la ubicación perfecta para enviar una alerta a tus usuarios o revertir cualquier acción realizada por el trabajo. La `Exception` que causó la falla en el trabajo será pasada al método `failed`:

```php
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
```

<a name="failed-job-events"></a>
### Eventos De Trabajo Fallido

Si quieres registrar un evento para ser llamado cuando un trabajo falle, puedes usar el método `Queue::failing`. Este evento representa una gran oportunidad para notificarle a tu equipo por correo electrónico o por [Slack](https://www.slack.com). Por ejemplo, puedes adjuntar una respuesta a este evento desde el `AppServiceProvider` incluido en Laravel:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Queue;
use Illuminate\Queue\Events\JobFailed;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
    * Register the service provider.
    *
    * @return void
    */
    public function register()
    {
        //
    }

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
}
```

<a name="retrying-failed-jobs"></a>
### Reintentando Trabajos Fallidos

Para visualizar todos los trabajos fallidos insertados en la tabla de base de datos `failed_jobs` se puede usar el comando Artisan `queue:failed`:

```php
php artisan queue:failed
```

El comando `queue:failed` listará la ID del trabajo, su conexión, cola y el tiempo en el cual falló. La ID del trabajo puede ser usada para reintentar el trabajo fallido. Por ejemplo, para reintentar un trabajo fallido con una ID `5`, ejecuta el siguiente comando:

```php
php artisan queue:retry 5
```

Para reintentar todos tus trabajos fallidos, ejecuta el comando `queue:retry` y pasa `all` como ID:

```php
php artisan queue:retry all
```

Si deseas borrar un trabajo fallido, puedes usar el comando `queue:forget`:

```php
php artisan queue:forget 5
```

Para eliminar todos los trabajos fallidos, puedes usar el comando `queue:flush`:

```php
php artisan queue:flush
```

<a name="ignoring-missing-models"></a>
### Ignorando Modelos Faltantes

Cuando inyectas un modelo Eloquent en un trabajo, se serializa automáticamente antes de colocarlo en la cola y se restaura cuando se procesa el trabajo. Sin embargo, si el modelo ha sido eliminado mientras el trabajo estaba esperando a ser procesado por un trabajador, tu trabajo puede fallar con la excepción `ModelNotFoundException`.

Por conveniencia, puedes elegir eliminar automáticamente los trabajos con modelos faltantes configurando la propiedad `deleteWhenMissingModels` de tu trabajo en `true`:

```php
/**
* Delete the job if its models no longer exist.
*
* @var bool
*/
public $deleteWhenMissingModels = true;
```

<a name="job-events"></a>
## Eventos De Trabajo

Usando los métodos `before` y `after` en la [facade](/docs/{{version}}/facades) `Queue`, puedes especificar funciones de retorno (callbacks) para que sean ejecutadas antes o después de que un trabajo en cola sea procesado. Estas callbacks son una gran oportunidad para realizar registro adicional o incrementar estadísticas para un panel de control. Generalmente, debes llamar a estos métodos desde un [proveedor de servicios](/docs/{{version}}/providers). Por ejemplo puedes usar  `AppServiceProvider`, incluido en Laravel:

```php
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
```

Usando el método `looping` en la [facade](/docs/{{version}}/facades) `Queue`, puedes especificar funciones de retorno (callbacks) que se ejecuten antes que el worker intente recuperar un trabajo de una cola. Por ejemplo, quizás necesites registrar una Closure para deshacer cualquier transacción abierta por un trabajo fallido anteriormente:

```php
Queue::looping(function () {
    while (DB::transactionLevel() > 0) {
        DB::rollBack();
    }
});
```