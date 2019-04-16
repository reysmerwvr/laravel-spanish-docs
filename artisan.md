::: v-pre

# Consola Artisan

- [Introducción](#introduction)
    - [Tinker (REPL)](#tinker)
- [Escritura de Comandos](#writing-commands)
    - [Generación de Comandos](#generating-commands)
    - [Estructura de un Comando](#command-structure)
    - [Comandos de Función Anónima (Closure)](#closure-commands)
- [Definición de Expectativas de Entrada](#defining-input-expectations)
    - [Argumentos](#arguments)
    - [Opciones](#options)
    - [Arreglos como entradas](#input-arrays)
    - [Descripciones de Entrada ](#input-descriptions)
- [Entrada/Salida de Comandos](#command-io)
    - [Recuperación de Entradas](#retrieving-input)
    - [Solicitud de Entradas](#prompting-for-input)
    - [Escritura de Salida](#writing-output)
- [Registro de Comandos](#registering-commands)
- [Ejecución de Comandos de Forma Programática](#programmatically-executing-commands)
    - [Llamando Comandos Desde Otros Comandos](#calling-commands-from-other-commands)

<a name="introduction"></a>
## Introducción

Artisan es la interfaz de línea de comando incluida con Laravel. Provee un número de comandos útiles que pueden ayudarte mientras construyes tu aplicación. Para ver una lista de todos los comandos Artisan disponibles, puedes usar el comando `list`:

```php
php artisan list
```

También cada comando incluye una "ayuda" en pantalla, la cual muestra y describe los argumentos y opciones disponibles. Para ver una pantalla de ayuda, coloca `help` antes del nombre del comando:

```php
php artisan help migrate
```

### Tinker REPL

Todas las aplicaciones de Laravel incluyen Tinker, un REPL desarrollado usando el paquete [PsySH](https://github.com/bobthecow/psysh). Tinker te permite interactuar con toda tu aplicación de Laravel en la línea de comando, incluyendo el ORM Eloquent, colas de trabajo, eventos, entre otros. Para entrar en el entorno de Tinker, ejecuta el comando de Artisan `tinker`:

```php
php artisan tinker
```

Puedes publicar el archivo de configuración de Tinker usando el comando vendor:publish:

```php
php artisan vendor:publish --provider="Laravel\Tinker\TinkerServiceProvider"
```

#### Lista Blanca de Comandos

Tinker utiliza una lista blanca para determinar qué comandos de Artisan pueden ejecutarse dentro de su shell. Por defecto, puedes ejecutar los comandos `clear-compiled`, `down`, `env`, `inspire`, `migrate`, `optimize` y `up`. Si deseas hacer una lista blanca de más comandos, puede agregarlos al arreglo `command` en tu archivo de configuración `tinker.php`:

```php
'commands' => [
    // App\Console\Commands\ExampleCommand::class,
],
```

#### Lista Negra de Alias

Por lo general, Tinker automáticamente asigna alias a las clases según las necesites en Tinker. Sin embargo, es posible que desees que nunca se agreguen alias a algunas clases. Puedes lograr esto listando las clases en el arreglo `dont_alias` de tu archivo de configuración `tinker.php`:

```php
'dont_alias' => [
    App\User::class,
],
```

<a name="writing-commands"></a>
## Escritura de Comandos

Además de los comandos proporcionados por Artisan, también puedes crear tus propios comandos personalizados. Los comandos son típicamente almacenados en el directorio `app/Console/Commands`; sin embargo, eres libre de escoger tu propia ubicación de almacenamiento, siempre y cuando tus comandos puedan ser cargados por Composer.

<a name="generating-commands"></a>
### Generación de Comandos

Para crear un nuevo comando, usa el comando Artisan `make:command`. Este comando creará una nueva clase de comando en el directorio `app/Console/Commands`. No te preocupes si este directorio no existe en tu aplicación, pues éste será creado la primera vez que ejecutes el comando Artisan `make:command`. El comando generado incluirá el conjunto de propiedades y métodos por defecto que están presentes en todos los comandos:

```php
php artisan make:command SendEmails
```

<a name="command-structure"></a>
### Estructura de un Comando

Después de generar tu comando, debes rellenar las propiedades `signature` y `description` de la clase, las cuales serán usadas cuando se muestra tu comando en la pantalla `list`. El método `handle` será llamado cuando tu comando es ejecutado. Puedes colocar tu lógica del comando en este método.

::: tip
Para una mayor reutilización del código, es una buena práctica mantener ligeros tus comandos de consola y dejar que se remitan a los servicios de aplicaciones para llevar a cabo sus tareas. En el siguiente ejemplo, toma en cuenta que inyectamos una clase de servicio para hacer el "trabajo pesado" de enviar los correos electrónicos.
:::

Echemos un vistazo a un comando de ejemplo. Observa que podemos inyectar cualquier dependencia que necesitemos en el método `handle()` del comando. El [contenedor de servicios](/docs/{{version}}/container) de Laravel automáticamente inyectará todas las dependencias cuyos tipos (interfaces y/o clases) estén asignados en los parámetros del constructor (type-hinting):

```php
<?php

namespace App\Console\Commands;

use App\User;
use App\DripEmailer;
use Illuminate\Console\Command;

class SendEmails extends Command
{
    /**
    * The name and signature of the console command.
    *
    * @var string
    */
    protected $signature = 'email:send {user}';

    /**
    * The console command description.
    *
    * @var string
    */
    protected $description = 'Send drip e-mails to a user';

    /**
    * Create a new command instance.
    *
    * @return void
    */
    public function __construct()
    {
        parent::__construct();
    }

    /**
    * Execute the console command.
    *
    * @param  \App\DripEmailer  $drip
    * @return mixed
    */
    public function handle(DripEmailer $drip)
    {
        $drip->send(User::find($this->argument('user')));
    }
}
```

<a name="closure-commands"></a>
### Comandos usando una función anónima (Closure)

Los comandos basados en Closure proporcionan una alternativa para definir comandos de consola como clases. De la misma manera que los Closures de rutas son una alternativa para los controladores, piensa en los Closures de comandos como una alternativa a las clases de comandos. Dentro del método `commands` de tu archivo `app/Console/Kernel.php`, Laravel carga el archivo `routes/console.php`:

```php
/**
* Register the Closure based commands for the application.
*
* @return void
*/
protected function commands()
{
    require base_path('routes/console.php');
}
```

Aunque este archivo no define rutas HTTP, define los puntos de entrada (rutas) a tu aplicación basados en consola. Dentro de este archivo, puedes definir todas sus rutas basadas en Closure usando el método `Artisan::command`. El método `command` acepta dos argumentos: la [firma del comando](#defining-input-expectations) y un Closure, el cual recibe los argumentos y opciones de los comandos:

```php
Artisan::command('build {project}', function ($project) {
    $this->info("Building {$project}!");
});
```

El Closure está vinculado a la instancia del comando subyacente, así tienes acceso completo a todos los métodos helper a los que normalmente podrías acceder en una clase de comando completa.

#### Determinación de tipos (Type-Hinting) de Dependencias

Además de recibir los argumentos y opciones de tu comando, en los Closures de comandos puedes también determinar los tipos de las dependencias adicionales que te gustaría resolver del [contenedor de servicios](/docs/{{version}}/container):

```php
use App\User;
use App\DripEmailer;

Artisan::command('email:send {user}', function (DripEmailer $drip, $user) {
    $drip->send(User::find($user));
});
```

#### Descripciones de un Closure de Comando

Al definir un comando basado en Closure, puedes usar el método `describe` para agregar una descripción al comando. Esta descripción será mostrada cuando ejecutes los comandos `php artisan list` o `php artisan help`:

```php
Artisan::command('build {project}', function ($project) {
    $this->info("Building {$project}!");
})->describe('Build the project');
```

<a name="defining-input-expectations"></a>
## Definición de Expectativas de Entrada

Al escribir comandos de consola, es común recopilar información del usuario a través de argumentos u opciones. Laravel hace que sea muy conveniente definir la entrada que esperas del usuario usando la propiedad `signature` en tus comandos. La propiedad `signature` te permite definir el nombre, los argumentos y las opciones para el comando en una sintaxis tipo ruta simple y expresiva.

<a name="arguments"></a>
### Argumentos

Todos los argumentos y opciones suministrados por el usuario están envueltos en llaves. En el siguiente ejemplo, el comando define un argumento **obligatorio** `user`:

```php
/**
* The name and signature of the console command.
*
* @var string
*/
protected $signature = 'email:send {user}';
```

También puedes hacer que los argumentos sean opcionales y definir valores predeterminados para los argumentos:

```php
// Optional argument...
email:send {user?}

// Optional argument with default value...
email:send {user=foo}
```

<a name="options"></a>
### Opciones

Las opciones, como los argumentos, son otra forma de entrada de usuario. Las opciones son prefijadas por dos guiones (`--`) cuando se especifican en la línea de comando. Hay dos tipos de opciones: aquellas que reciben un valor y las que no. Las opciones que no reciban un valor se comportarán como un "interruptor" booleano. Echemos un vistazo a un ejemplo de este tipo de opción:

```php
/**
* The name and signature of the console command.
*
* @var string
*/
protected $signature = 'email:send {user} {--queue}';
```

En este ejemplo, la opción `--queue` puede ser especificada cuando ejecutas el comando Artisan. Si la opción `--queue` es pasada, su valor será `true`. En caso contrario, el valor será `false`:

```php
php artisan email:send 1 --queue
```

<a name="options-with-values"></a>
#### Opciones Con Valores

Vamos a ver una opción que espera un valor. Si el usuario debe especificar un valor para una opción, agrega como sufijo el signo `=` al nombre de la opción:

```php
/**
* The name and signature of the console command.
*
* @var string
*/
protected $signature = 'email:send {user} {--queue=}';
```

En este ejemplo, el usuario puede pasar un valor para la opción, de esta manera:

```php
php artisan email:send 1 --queue=default
```

Puedes asignar valores por defecto a las opciones especificando el valor predeterminado después del nombre de la opción. Si ningún valor es pasado por el usuario, el valor por defecto será usado:

```php
email:send {user} {--queue=default}
```

<a name="option-shortcuts"></a>
#### Atajos de opciones

Para asignar un atajo cuando defines una opción, puedes especificarlo antes del nombre de la opción y usar un delimitador `|` para separar el atajo del nombre completo de la opción:

```php
email:send {user} {--Q|queue}
```

<a name="input-arrays"></a>
### Arreglos como entradas

Si deseas definir argumentos u opciones para esperar entradas de arreglos, puedes usar el carácter `*`. Primero, vamos a ver un ejemplo que especifica un arreglo como argumento:

```php
email:send {user*}
```

Al llamar a este método, los argumentos `user` pueden pasarse en orden a la línea de comando. Por ejemplo, el siguiente comando establecerá el valor de `user` como `['foo', 'bar']`:

```php
php artisan email:send foo bar
```

Al definir una opción que espera un arreglo como entrada, cada valor de la opción pasado al comando debería ser prefijado con el nombre de la opción:

```php
    email:send {user} {--id=*}

    php artisan email:send --id=1 --id=2
```

<a name="input-descriptions"></a>
### Descripciones de Entrada

Puedes asignar descripciones para los argumentos y opciones de entrada separando el parámetro de la opción usando dos puntos `:`. Si necesitas un poco más de espacio para definir tu comando, no dudes en extender la definición a través de múltiples líneas:

```php
/**
* The name and signature of the console command.
*
* @var string
*/
protected $signature = 'email:send
                        {user : The ID of the user}
                        {--queue= : Whether the job should be queued}';
```

<a name="command-io"></a>
## Entrada y salida (E/S) de Comandos

<a name="retrieving-input"></a>
### Recuperación de Entrada

Cuando tu comando es ejecutado, obviamente necesitarás acceder a los valores de los argumentos y opciones aceptados por tu comando. Para ello, puedes usar los métodos `argument` y `option`:

```php
/**
* Execute the console command.
*
* @return mixed
*/
public function handle()
{
    $userId = $this->argument('user');

    //
}
```

Si necesitas recuperar todos los argumentos como un arreglo, llama al método `arguments`:

```php
$arguments = $this->arguments();
```

Las opciones pueden ser recuperadas con tanta facilidad como argumentos utilizando el método `option`. Para recuperar todas las opciones como un arreglo, llama al método `options`:

```php
// Retrieve a specific option...
$queueName = $this->option('queue');

// Retrieve all options...
$options = $this->options();
```

Si el argumento o la opción no existe, será retornado `null`.

<a name="prompting-for-input"></a>
### Solicitud de Entrada

Además de mostrar salidas, puedes también pedir al usuario que proporcione información durante la ejecución del comando. El método `ask` le indicará al usuario la pregunta dada, aceptará su entrada, y luego devolverá la entrada del usuario a tu comando:

```php
/**
* Execute the console command.
*
* @return mixed
*/
public function handle()
{
    $name = $this->ask('What is your name?');
}
```

El método `secret` es similar a `ask`, pero la entrada del usuario no será visible para ellos cuando la escriban en la consola. Este método es útil cuando se solicita información confidencial tal como una contraseña:

```php
$password = $this->secret('What is the password?');
```

#### Pedir confirmación

Si necesitas pedirle al usuario una simple confirmación, puedes usar el método `confirm`. Por defecto, este método devolverá `false`. Sin embargo, si el usuario ingresa `y` o `yes` en respuesta a la solicitud, el método devolverá `true`.

```php
if ($this->confirm('Do you wish to continue?')) {
    //
}
```

#### Autocompletado

El método `anticipate` puede ser usado para proporcionar autocompletado para posibles opciones. El usuario aún puede elegir cualquier respuesta, independientemente de las sugerencias de autocompletado:

```php
$name = $this->anticipate('What is your name?', ['Taylor', 'Dayle']);
```

#### Preguntas de selección múltiple

Si necesitas darle al usuario un conjunto de opciones predefinadas, puedes usar el método `choice`. Puedes establecer el índice del valor predeterminado del arreglo que se devolverá si no se escoge ninguna opción:

```php
$name = $this->choice('What is your name?', ['Taylor', 'Dayle'], $defaultIndex);
```

<a name="writing-output"></a>
### Escritura de Salida

Para enviar datos de salida a la consola, usa los métodos `line`, `info`, `comment`, `question` y `error`. Cada uno de estos métodos usará colores ANSI apropiados para su propósito. Por ejemplo, vamos a mostrar alguna información general al usuario. Normalmente, el método `info` se mostrará en la consola como texto verde:

```php
/**
* Execute the console command.
*
* @return mixed
*/
public function handle()
{
    $this->info('Display this on the screen');
}
```

Para mostrar un mensaje de error, usa el método `error`. El texto del mensaje de error es típicamente mostrado en rojo:

```php
$this->error('Something went wrong!');
```

Si desea mostrar la salida de consola sin color, usa el método `line`:

```php
$this->line('Display this on the screen');
```

#### Diseños de tabla

El método `table` hace que sea fácil formatear correctamente varias filas / columnas de datos. Simplemente pasa los encabezados y filas al método. El ancho y la altura se calcularán dinámicamente en función de los datos dados:

```php
$headers = ['Name', 'Email'];

$users = App\User::all(['name', 'email'])->toArray();

$this->table($headers, $users);
```

#### Barras de progreso

Para tareas de larga ejecución, podría ser útil mostrar un indicador de progreso. Usando el objeto de salida, podemos iniciar, avanzar y detener la Barra de Progreso. Primero, define el número total de pasos por los que el proceso pasará. Luego, avanza la barra de progreso después de procesar cada elemento:

```php
$users = App\User::all();

$bar = $this->output->createProgressBar(count($users));

$bar->start();

foreach ($users as $user) {
    $this->performTask($user);

    $bar->advance();
}

$bar->finish();
```

Para opciones más avanzadas, verifica la [documentación del componente Progress Bar de Symfony](https://symfony.com/doc/current/components/console/helpers/progressbar.html).

<a name="registering-commands"></a>
## Registro de Comandos

Debido a la llamada al método `load` en el método `commands` del kernel de tu consola, todos los comandos dentro del directorio `app/Console/Commands` se registrarán automáticamente con Artisan. De hecho, puedes realizar llamadas adicionales al método `load` para escanear otros directorios en busca de comandos Artisan:

```php
/**
* Register the commands for the application.
*
* @return void
*/
protected function commands()
{
    $this->load(__DIR__.'/Commands');
    $this->load(__DIR__.'/MoreCommands');

    // ...
}
```

También puedes registrar comandos manualmente agregando su nombre de clase en la propiedad `$commands` de tu archivo `app/Console/Kernel.php`. Cuando Artisan arranca, todos los comandos listados en esta propiedad serán resueltos por el [contenedor de servicios](/docs/{{version}}/container) y serán registrados con Artisan:

```php
protected $commands = [
    Commands\SendEmails::class
];
```

<a name="programmatically-executing-commands"></a>
## Ejecución de Comandos de Forma Programática

En ocasiones, es posible que desees ejecutar un comando de Artisan fuera de la interfaz de línea de comandos (CLI). Por ejemplo, puedes desear ejecutar un comando Artisan de una ruta o controlador. Puedes usar el método `call` en el facade `Artisan` para lograr esto. El método `call` acepta el nombre o la clase del comando como primer argumento y un arreglo de parámetros del comando como segundo argumento. El código de salida será devuelto:

```php
Route::get('/foo', function () {
    $exitCode = Artisan::call('email:send', [
        'user' => 1, '--queue' => 'default'
    ]);

    //
});
```

Alternativamente, puedes pasar todo el comando de Artisan para el metodo `call` como una cadena: 

```php
Artisan::call('email:send 1 --queue=default');
```

Usando el método `queue` en el facade `Artisan`, puedes incluso poner en cola comandos Artisan para ser procesados en segundo plano por tus [queue workers](/docs/{{version}}/queues). Antes de usar este método, asegurate que tengas configurado tu cola y se esté ejecutando un oyente de cola (queue listener):

```php
Route::get('/foo', function () {
    Artisan::queue('email:send', [
        'user' => 1, '--queue' => 'default'
    ]);

    //
});
```

También puedes especificar la conexión o cola a la que debes enviar el comando Artisan:

```php
Artisan::queue('email:send', [
    'user' => 1, '--queue' => 'default'
])->onConnection('redis')->onQueue('commands');
```

#### Pasando valores de tipo Arreglo

Si tu comando define una opción que acepta un arreglo, puedes pasar un arreglo de valores a la opción:

```php
Route::get('/foo', function () {
    $exitCode = Artisan::call('email:send', [
        'user' => 1, '--id' => [5, 13]
    ]);
});
```

#### Pasando valores Booleanos

Si necesitas especificar el valor de una opción que no acepta valores de tipo cadena, tal como la opción `--force` en el comando `migrate:refresh`, debes pasar `true` o `false`:

```php
$exitCode = Artisan::call('migrate:refresh', [
    '--force' => true,
]);
```

<a name="calling-commands-from-other-commands"></a>
### Llamado de Comandos Desde Otros Comandos

Algunas veces puedes desear llamar otros comandos desde un comando Artisan existente. Puedes hacerlo usando el método `call`. Este método acepta el nombre del comando y un arreglo de parámetros del comando:

```php
/**
* Execute the console command.
*
* @return mixed
*/
public function handle()
{
    $this->call('email:send', [
        'user' => 1, '--queue' => 'default'
    ]);

    //
}
```

Si deseas llamar a otro comando de consola y eliminar toda su salida, puedes usar el método `callSilent`. Este método tiene la misma firma que el método `call`:

```php
$this->callSilent('email:send', [
    'user' => 1, '--queue' => 'default'
]);
```