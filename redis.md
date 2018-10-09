# Redis

- [Introducción](#introduction)
    - [Configuración](#configuration)
    - [Predis](#predis)
    - [PhpRedis](#phpredis)
- [Interactuar Con Redis](#interacting-with-redis)
    - [Canalizar Comandos](#pipelining-commands)
- [Pub / Sub](#pubsub)

<a name="introduction"></a>
## Introducción

[Redis](https://redis.io) es un almacenamiento de llave-valor avanzado de código abierto. A menudo se le denomina como un servidor de estructura de datos ya que las llaves pueden contener [cadenas](https://redis.io/topics/data-types#strings), [hashes](https://redis.io/topics/data-types#hashes), [listas](https://redis.io/topics/data-types#lists), [sets](https://redis.io/topics/data-types#sets), y [sets ordenados](https://redis.io/topics/data-types#sorted-sets).

Antes de utilizar Redis con Laravel, deberá instalar el paquete `predis/predis` por medio de Composer:

    composer require predis/predis

Alternativamente, puede instalar la extensión de PHP [PhpRedis](https://github.com/phpredis/phpredis) por medio de PECL. La extensión puede ser más compleja de instalar pero puede ofrecer un mejor rendimiento para las aplicaciones que hacen uso extensivo de Redis.

<a name="configuration"></a>
### Configuración

La configuración de redis para su aplicación está ubicada en el archivo de cofiguración `config/database`. Dentro de este archivo, podrá ver el arreglo `redis` que contiene los servidores de Redis utilizados por su aplicación:

    'redis' => [

        'client' => 'predis',

        'default' => [
            'host' => env('REDIS_HOST', 'localhost'),
            'password' => env('REDIS_PASSWORD', null),
            'port' => env('REDIS_PORT', 6379),
            'database' => 0,
        ],

    ],

La configuración del servidor por defecto deberá ser suficiente para el desarrollo. Sin embargo, puede modificar este arreglo según su entorno. Cada servidor de Redis definido en su configuración debe contener un nombre, host y puerto.

#### Configuración De Clusters

Si su aplicación está utilizando un cluster de servidores Redis, debe definir este cluster en la llave `clusters` de su configuración de Redis:

    'redis' => [

        'client' => 'predis',

        'clusters' => [
            'default' => [
                [
                    'host' => env('REDIS_HOST', 'localhost'),
                    'password' => env('REDIS_PASSWORD', null),
                    'port' => env('REDIS_PORT', 6379),
                    'database' => 0,
                ],
            ],
        ],

    ],

Por default, los clusters realizarán la división del lado del cliente en sus nodos, permitiéndole agrupar nodos y crear una gran cantidad de RAM disponible. Sin embargo, tenga en cuenta que la división del lado del cliente no gestiona el failover; por lo tanto, es principalmente adecuado para datos en caché que estén disponibles desde otro almacenamiento de datos primario. Su desea utilizar el agrupamiento nativo de Redis, debe especificarlo en la llave `options` de su configuración de Redis:

    'redis' => [

        'client' => 'predis',

        'options' => [
            'cluster' => 'redis',
        ],

        'clusters' => [
            // ...
        ],

    ],

<a name="predis"></a>
### Predis

Además de las opciones predeterminadas de la configuración del servidor `host`, `port`, `database` y `password`, Predis admite [parámetros de conexión](https://github.com/nrk/predis/wiki/Connection-Parameters) adicionales que pueden ser definidos para cada uno de sus servidores Redis. Para utilizar estas opciones de configuración adicionales, agréguelos a la configuración del servidor Redis en el archivo de configuración `config/database.php`:

    'default' => [
        'host' => env('REDIS_HOST', 'localhost'),
        'password' => env('REDIS_PASSWORD', null),
        'port' => env('REDIS_PORT', 6379),
        'database' => 0,
        'read_write_timeout' => 60,
    ],

<a name="phpredis"></a>
### PhpRedis

> {note} Si desea tener la extensión de PHP PhpRedis istalada por medio de PECL, deberá renombrar el alias `Redis` en su archivo de configuración `config/app.php`.

Para utilizar la extensión PhpRedis, deberá cambiar la opción `client` de su configuración de Redis a `phpredis`. Puede encontrar esta opción en su archivo de cnofiguración `config/database.php`:

    'redis' => [

        'client' => 'phpredis',

        // Rest of Redis configuration...
    ],

Además de las opciones predeterminadas de configuración del servidor `host`, `port`, `database`, y `password`, PhpRedis admite los siguientes parametros de conexión adicionales: `persistent`, `prefix`, `read_timeout` y `timeout`. Puede agregar cualquiera de estas opciones a la configuración del servidor de Redis en el archivo de configuración `config/database.php`:

    'default' => [
        'host' => env('REDIS_HOST', 'localhost'),
        'password' => env('REDIS_PASSWORD', null),
        'port' => env('REDIS_PORT', 6379),
        'database' => 0,
        'read_timeout' => 60,
    ],

<a name="interacting-with-redis"></a>
## Interactuar Con Redis

Puede interactuar con Redis llamando varios métodos en el [facade](/docs/{{version}}/facades) `Redis`. El facade `Redis` admite métodos dinámicos, lo que significa que puede llamar cualquier [comando de Redis](https://redis.io/commands) en el facade y el comando será pasado directamente a Redis. En este ejemplo, vamos a llamar al comando `GET` de Redis llamando al método `get` en el facade `Redis`:

    <?php

    namespace App\Http\Controllers;

    use App\Http\Controllers\Controller;
    use Illuminate\Support\Facades\Redis;

    class UserController extends Controller
    {
        /**
         * Show the profile for the given user.
         *
         * @param  int  $id
         * @return Response
         */
        public function showProfile($id)
        {
            $user = Redis::get('user:profile:'.$id);

            return view('user.profile', ['user' => $user]);
        }
    }

Desde luego, como lo mencionamos anteriormente, puede llamar cualquier comando de redis en el facade `Redis`. Laravel utiliza métodos mágicos para pasar los comandos al servidor de Redis, para que pase los argumentos que espera el comando de Redis:

    Redis::set('name', 'Taylor');

    $values = Redis::lrange('names', 5, 10);

Alternativamente, también puede pasar comandos al servidor usando el método `command`, el cuál acepta el nombre del comando como primer argumento, y un arreglo de valores como segundo argumento:

    $values = Redis::command('lrange', ['name', 5, 10]);

#### Utilizar Múltiples Conexiones De Redis

Puede obtener una instancia de redis llamando al método `Redis::connection`:

    $redis = Redis::connection();

Esto le dará una instancia del servidor Redis predeterminado. También puede pasar la conexión o nombre del cluster al método `connection` para obtener un servidor o cluster en específico según lo definido en su configuración de Redis:

    $redis = Redis::connection('my-connection');

<a name="pipelining-commands"></a>
### Canalizar Comandos

La canalización debe ser utilizada cuando envíe muchos comandos al servidor en una sola operación. El método `pipeline` acepta un argumento: un `Closure` que reciba una instancia de Redis. pPuede emitir todos sus comandos a esta instancia de Redis y después éstos serán ejecutados dentro de una sola operación:

    Redis::pipeline(function ($pipe) {
        for ($i = 0; $i < 1000; $i++) {
            $pipe->set("key:$i", $i);
        }
    });

<a name="pubsub"></a>
## Pub / Sub

Laravel proporciona una interfaz conveniente para los comandos `publish` y `subscribe` de Redis. Estos comandos de Redis le permiten escuchar mensajes en un "canal" dado. Puede publicar mensajes en el canal desde otra aplicación, o incluso utilizando otro lenguaje de programación, lo que permite una comunicación sencilla entre aplicaciones y procesos.

Primero, configuremos un listener para el canal usando el método `subscribe`. Vamos a colocar una llamada a este método en un [comando de Artisan](/docs/{{version}}/artisan) ya que llamar al método `subscribe` comienza un proceso de larga ejecución:

    <?php

    namespace App\Console\Commands;

    use Illuminate\Console\Command;
    use Illuminate\Support\Facades\Redis;

    class RedisSubscribe extends Command
    {
        /**
         * The name and signature of the console command.
         *
         * @var string
         */
        protected $signature = 'redis:subscribe';

        /**
         * The console command description.
         *
         * @var string
         */
        protected $description = 'Subscribe to a Redis channel';

        /**
         * Execute the console command.
         *
         * @return mixed
         */
        public function handle()
        {
            Redis::subscribe(['test-channel'], function ($message) {
                echo $message;
            });
        }
    }

Ahora podemos publicar mensajes en el canal usando el método `publish`:

    Route::get('publish', function () {
        // Route logic...

        Redis::publish('test-channel', json_encode(['foo' => 'bar']));
    });

#### Suscripciones De Comodines

Usando el método `psubscribe`, puede suscribirse a un canal comodín, el cuál puede ser útil para capturar todos los mensajes en todos los canales. El nombre del canal `$channel` será pasado como segundo argumento al callback `Closure` proporcionado:

    Redis::psubscribe(['*'], function ($message, $channel) {
        echo $message;
    });

    Redis::psubscribe(['users.*'], function ($message, $channel) {
        echo $message;
    });
