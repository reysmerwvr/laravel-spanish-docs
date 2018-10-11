# Ejecutor De Tareas Envoy

- [Introducción](#introduction)
    - [Instalación](#installation)
- [Escribir Tareas](#writing-tasks)
    - [Setup](#setup)
    - [Variables](#variables)
    - [Historias](#stories)
    - [Múltiples Servidores](#multiple-servers)
- [Ejecutar Tareas](#running-tasks)
    - [Confirmar Ejecución De Tarea](#confirming-task-execution)
- [Notificaciones](#notifications)
    - [Slack](#slack)

<a name="introduction"></a>
## Introducción

[Laravel Envoy](https://github.com/laravel/envoy) proporciona una sintaxis limpia y minima para definir las tareas comunes que ejecuta en sus servidores remotos. Utilizando el estilo de sintaxis de Blade, puede configurar fácilmente tareas para deploy, comandos de Artisan y más. Envoy solamente es compatible en sistemas operativos Mac y Linux.

<a name="installation"></a>
### Instalación

Primero, instale Envoy utilizando el comando de composer `global require`:

    composer global require laravel/envoy

Dado que las librerías globales de Composer ocasionalmente pueden causar conflictos en la versión del paquete, puede considerar utilizar `cgr`, el cuál es un remplazo directo para el comando `composer global require`. Las instrucciones de instalación de la librería `gcr` pueden ser [localizadas en GitHub](https://github.com/consolidation-org/cgr).

> {note} Asegúrese de colocar el directorio `~/.composer/vendor/bin` en su PATH para que el ejecutable `envoy` pueda ser localizado cuando se ejecute el comando `envoy` en su terminal.

#### Actualizar Envoy

You may also use Composer to keep your Envoy installation up to date. Issuing the `composer global update` command will update all of your globally installed Composer packages:

    composer global update

<a name="writing-tasks"></a>
## Escribir Tareas

Todas sus tareas de envoy deberán definirse en un archivo `Envoy.blade.php` en la raíz de su proyecto. Aquí un ejemplo para comenzar:

    @servers(['web' => ['user@192.168.1.1']])

    @task('foo', ['on' => 'web'])
        ls -la
    @endtask

Como puede ver, un arreglo de `@servers` es definido en la parte superior del archivo, permitiéndloe hacer referencia a estos servidores en la opción `on` en la declaración de sus tareas. Dentro de sus declaraciones `@task`, deberá colocar el código Bash que se deberá ejecutar en su servidor una vez que la tarea sea ejecutada.

Puede forzar que un script se ejecute localmente especificando la dirección IP del servidor como `127.0.0.1`:

    @servers(['localhost' => '127.0.0.1'])

<a name="setup"></a>
### Setup

En ocasiones, puede que necesite ejecutar algún código PHP antes de sus tareas de Envoy. Puede hacer uso de la directiva `@setup` para declarar variables y hacer uso de PHP en general antes de que sus otras tareas sean ejecutadas:

    @setup
        $now = new DateTime();

        $environment = isset($env) ? $env : "testing";
    @endsetup

Si necesita de otros archivos PHP antes de ejecutar sus tareas, puede utilizar la directiva `@include` en la parte superior de su archivo `Envoy.blade.php`:

    @include('vendor/autoload.php')

    @task('foo')
        # ...
    @endtask

<a name="variables"></a>
### Variables

Si es necesario, puede pasar valores de opciones a las tareas de Envoy usando la línea de comandos:

    envoy run deploy --branch=master

Puede acceder a las opciones en sus tareas por medio de la sintaxis "echo" de Blade. Por supuesto, también puede usar declaraciones y bucles `if` dentro de sus tareas. Por ejemplo, Para verificar la presencia de la variable `$branch` antes de ejecutar el comando `git pull`:

    @servers(['web' => '192.168.1.1'])

    @task('deploy', ['on' => 'web'])
        cd site

        @if ($branch)
            git pull origin {{ $branch }}
        @endif

        php artisan migrate
    @endtask

<a name="stories"></a>
### Historias

Las historias agrupan un conjunto de tareas con un nombre único y conveniente, permitiendo agrupar tareas pequeñas enfocandose en tareas más grandes. Por ejemplo, una historia `deploy` puede ejecutar las tareas `git` y `composer` al listar los nombres de las tareas en su definición:

    @servers(['web' => '192.168.1.1'])

    @story('deploy')
        git
        composer
    @endstory

    @task('git')
        git pull origin master
    @endtask

    @task('composer')
        composer install
    @endtask

Una vez que haya finalizado de escribir su historia, puede ejecutarla como una tarea típica:

    envoy run deploy

<a name="multiple-servers"></a>
### Múltiples Servidores

Envoy le permite fácilemnte ejecutar tareas a través de múltiples servidores. Primero, agregue servidores adicionales a su declaración `@servers`. A cada servidor se le debe asignar un nombre único. Una vez definidos los servidores adicionales, deberá indicar en cuáles servidores se van a ejecutar las tareas, esto puede hacerse en el arreglo `on` de cada tarea:

    @servers(['web-1' => '192.168.1.1', 'web-2' => '192.168.1.2'])

    @task('deploy', ['on' => ['web-1', 'web-2']])
        cd site
        git pull origin {{ $branch }}
        php artisan migrate
    @endtask

#### Ejecución Paralela

Por defecto, las tareas serán ejecutadas en cada servidor en serie. En otras palabras, una tarea finaliza su ejecución en el primer servidor antes de proceder a ejecutarse en el segundo servidor. Si desea ejecutar una tarea a través de múltiples servidores en paralelo, agregue la opción `parallel` a la declaración de su tarea:

    @servers(['web-1' => '192.168.1.1', 'web-2' => '192.168.1.2'])

    @task('deploy', ['on' => ['web-1', 'web-2'], 'parallel' => true])
        cd site
        git pull origin {{ $branch }}
        php artisan migrate
    @endtask

<a name="running-tasks"></a>
## Ejecutar Tareas

Para ejecutar una tarea o historia que esté definida en su archivo `Envoy.blade.php`, ejecute el comando de Envoy `run`, pasando el nombre de la tarea o historia que desee ejecutar. Envoy va a ejecutar la tarea y mostrará el resultado de los servidores mientras se ejecuta la tarea:

    envoy run task

<a name="confirming-task-execution"></a>
### Confirmar Ejecución De Tarea

Si desea que se le solicite confirmación antes de ejecutar una tarea en sus servidores, deberá añadir la directiva `confirm` a la declaración de su tarea. Esta opción es particularmente útil para operaciones destructivas:

    @task('deploy', ['on' => 'web', 'confirm' => true])
        cd site
        git pull origin {{ $branch }}
        php artisan migrate
    @endtask

<a name="notifications"></a>
<a name="hipchat-notifications"></a>
## Notificaciones

<a name="slack"></a>
### Slack

Envoy también permite enviar notificaciones a [Slack](https://slack.com) después de ejecutar cada tarea. La directiva `@slack`acepta una URL de webhook a Slack y un nombre de canal. Puede recuperar su URL de webhook creando una integración "Incoming WebHooks" en el panel de control de su Slack. Debe pasar la URL de webhook completa en la directiva `@slack`:

    @finished
        @slack('webhook-url', '#bots')
    @endfinished

Puede proporcionar uno de los siguientes como   el argumento del canal:

<div class="content-list" markdown="1">
- Para enviar notificaciones a un canal: `#canal`
- Para enviar notificaciones a un usuario: `@usuario`
</div>

