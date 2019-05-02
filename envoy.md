::: v-pre

# Laravel Envoy

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
    - [Discord](#discord)

<a name="introduction"></a>
## Introducción

[Laravel Envoy](https://github.com/laravel/envoy) proporciona una sintaxis limpia y mínima para definir las tareas comunes que ejecutas en tus servidores remotos. Utilizando el estilo de sintaxis de Blade, puedes configurar fácilmente tareas para deploy, comandos de Artisan y más. Envoy solamente es compatible con sistemas operativos Mac y Linux.

<a name="installation"></a>
### Instalación

Primero, instala Envoy utilizando el comando de composer `global require`:

```php
composer global require laravel/envoy
```

Dado que las librerías globales de Composer ocasionalmente pueden causar conflictos en la versión del paquete, puedes considerar utilizar `cgr`, el cual es un reemplazo directo para el comando `composer global require`. Las instrucciones de instalación de la librería `gcr` pueden ser [encontradas en GitHub](https://github.com/consolidation-org/cgr).

::: danger Nota
Asegurate de colocar el directorio `~/.composer/vendor/bin` en tu PATH para que el ejecutable `envoy` pueda ser localizado cuando se ejecute el comando `envoy` en tu terminal.
:::

#### Actualizar Envoy

También puedes usar Composer para mantener tu instalación de Envoy actualizada. Ejecutar el comando `composer global update` actualizará todos tus paquetes de Composer instalados globalmente:

```php
composer global update
```

<a name="writing-tasks"></a>
## Escribir Tareas

Todas tus tareas de Envoy deberán definirse en un archivo `Envoy.blade.php` en la raíz de tu proyecto. Aquí un ejemplo para comenzar:

```php
@servers(['web' => ['user@192.168.1.1']])

@task('foo', ['on' => 'web'])
    ls -la
@endtask
```

Como puedes ver, un arreglo `@servers` es definido en la parte superior del archivo, permitiéndote hacer referencia a estos servidores en la opción `on` en la declaración de tus tareas. Dentro de tus declaraciones `@task`, deberás colocar el código Bash que se deberá ejecutar en tu servidor una vez que la tarea sea ejecutada.

Puedes forzar que un script se ejecute localmente especificando la dirección IP del servidor como `127.0.0.1`:

```php
@servers(['localhost' => '127.0.0.1'])
```

<a name="setup"></a>
### Setup

En ocasiones, puede que necesites ejecutar algún código PHP antes de tus tareas de Envoy. Puedes hacer uso de la directiva `@setup` para declarar variables y hacer uso de PHP en general antes de que tus otras tareas sean ejecutadas:

```php
@setup
    $now = new DateTime();

    $environment = isset($env) ? $env : "testing";
@endsetup
```

Si necesitas de otros archivos PHP antes de ejecutar tus tareas, puedes utilizar la directiva `@include` en la parte superior de tu archivo `Envoy.blade.php`:

```php
@include('vendor/autoload.php')

@task('foo')
    # ...
@endtask
```

<a name="variables"></a>
### Variables

Si es necesario, puedes pasar valores de opciones a las tareas de Envoy usando la línea de comandos:

```php
envoy run deploy --branch=master
```

Puedes acceder a las opciones en tus tareas por medio de la sintaxis "echo" de Blade. También puedes usar declaraciones `if` y bucles dentro de tus tareas. Por ejemplo, para verificar la presencia de la variable `$branch` antes de ejecutar el comando `git pull`:

```php
@servers(['web' => '192.168.1.1'])

@task('deploy', ['on' => 'web'])
    cd site

    @if ($branch)
        git pull origin {{ $branch }}
    @endif

    php artisan migrate
@endtask
```

<a name="stories"></a>
### Historias

Las historias agrupan un conjunto de tareas con un nombre único y conveniente, permitiendo agrupar tareas pequeñas enfocandose en tareas más grandes. Por ejemplo, una historia `deploy` puede ejecutar las tareas `git` y `composer` al listar los nombres de las tareas en tu definición:

```php
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
```

Una vez que hayas finalizado de escribir tu historia, puedes ejecutarla como una tarea típica:

```php
envoy run deploy
```

<a name="multiple-servers"></a>
### Múltiples Servidores

Envoy te permite fácilmente ejecutar tareas a través de múltiples servidores. Primero, agrega servidores adicionales a tu declaración `@servers`. A cada servidor se le debe asignar un nombre único. Una vez definidos los servidores adicionales, deberás indicar en cuáles servidores se van a ejecutar las tareas, esto puede hacerse en el arreglo `on` de cada tarea:

```php
@servers(['web-1' => '192.168.1.1', 'web-2' => '192.168.1.2'])

@task('deploy', ['on' => ['web-1', 'web-2']])
    cd site
    git pull origin {{ $branch }}
    php artisan migrate
@endtask
```

#### Ejecución Paralela

Por defecto, las tareas serán ejecutadas en cada servidor en serie. En otras palabras, una tarea finaliza su ejecución en el primer servidor antes de proceder a ejecutarse en el segundo servidor. Si deseas ejecutar una tarea a través de múltiples servidores en paralelo, agrega la opción `parallel` a la declaración de tu tarea:

```php
@servers(['web-1' => '192.168.1.1', 'web-2' => '192.168.1.2'])

@task('deploy', ['on' => ['web-1', 'web-2'], 'parallel' => true])
    cd site
    git pull origin {{ $branch }}
    php artisan migrate
@endtask
```

<a name="running-tasks"></a>
## Ejecutar Tareas

Para ejecutar una tarea o historia que esté definida en tu archivo `Envoy.blade.php`, ejecuta el comando de Envoy `run`, pasando el nombre de la tarea o historia que deseas ejecutar. Envoy va a ejecutar la tarea y mostrará el resultado de los servidores mientras se ejecuta la tarea:

```php
envoy run deploy
```

<a name="confirming-task-execution"></a>
### Confirmar Ejecución De Tarea

Si deseas que se solicite confirmación antes de ejecutar una tarea en tus servidores, deberás añadir la directiva `confirm` a la declaración de tu tarea. Esta opción es particularmente útil para operaciones destructivas:

```php
@task('deploy', ['on' => 'web', 'confirm' => true])
    cd site
    git pull origin {{ $branch }}
    php artisan migrate
@endtask
```

<a name="notifications"></a>
## Notificaciones

<a name="slack"></a>
### Slack

Envoy también permite enviar notificaciones a [Slack](https://slack.com) después de ejecutar cada tarea. La directiva `@slack` acepta una URL de webhook a Slack y un nombre de canal. Puedes recuperar tu URL de webhook creando una integración "Incoming WebHooks" en el panel de control de Slack. Debes pasar la URL de webhook completa en la directiva `@slack`:

```php
@finished
    @slack('webhook-url', '#bots')
@endfinished
```

Puedes proporcionar uno de los siguientes como el argumento del canal:

- Para enviar notificaciones a un canal: `#canal`
- Para enviar notificaciones a un usuario: `@usuario`

<a name="discord"></a>
### Discord

Envoy también soporta el envío de notificaciones a [Discord](https://discord.com) después de que cada tarea es ejecutada. La dirctiva `@discord` acepta una URL WebHook y un mensaje de Discord. Puedes recuperar tu URL webhook creando una "Webhook" en los ajustes de tu servidor y seleccionando en cuál canal publicar la webhook. También deberías pasar la URL de Webhook completa en la directiva `@discord`:  

```php
@finished
    @discord('discord-webhook-url')
@endfinished
```