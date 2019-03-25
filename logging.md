::: v-pre

# Registro (Logging)

- [Introducción](#introduction)
- [Configuración](#configuration)
    - [Construyendo Stacks de Registros](#building-log-stacks)
- [Escribiendo Mensajes de Registro](#writing-log-messages)
    - [Escribiendo a Canales Específicos](#writing-to-specific-channels)
- [Configuración Avanzada del Canal Monolog](#advanced-monolog-channel-customization)
    - [Personalizando Monolog para Canales](#customizing-monolog-for-channels)
    - [Creando Canales de Manejador para Monolog](#creating-monolog-handler-channels)
    - [Creando Canales Mediante Factories](#creating-channels-via-factories)

<a name="introduction"></a>
## Introducción

Para ayudarte a aprender más acerca de lo que está sucediendo dentro de tu aplicación, Laravel proporciona un robusto servicio de registro que te permite registrar mensajes en archivos, en el registro de errores del sistema e incluso en Slack para notificar a todo tu equipo.

De forma interna, Laravel usa la biblioteca [Monolog](https://github.com/Seldaek/monolog), que proporciona soporte para una variedad de poderosos manejadores de registros. Laravel hace que sea pan comido configurar dichos manejadores, permitiéndote mezclar y juntarlos para personalizar el manejo de registros en tu aplicación.

<a name="configuration"></a>
## Configuración

Toda la configuración para el sistema de registros de tu aplicación se encuentra en el archivo de configuración `config/logging.php`. Este archivo te permite configurar los canales de registros de tu aplicación, así que asegurarte de revisar cada uno de los canales disponibles y sus opciones. Revisaremos algunas opciones comunes a continuación.

Por defecto, Laravel usara el canal `stack` al registrar mensajes. El canal `stack` es usado para agregar múltiples canales de registros en un solo canal. Para más información sobre construir stacks, revisa la [documentación debajo](#building-log-stacks).

#### Configurando el Nombre del Canal

Por defecto, Monolog es instanciado con un "nombre de canal" que concuerda con el entorno actual, como `production` o `local`. Para cambiar este valor, agrega una opción `name` a la configuración de tu canal:

```php
'stack' => [
    'driver' => 'stack',
    'name' => 'channel-name',
    'channels' => ['single', 'slack'],
],
```

#### Drivers de Canales Disponibles

Nombre | Descripción
------------- | -------------
`stack` | Wrapper para facilitar la creación de canales "multi-canales"
`single` | Canal de registro de un sólo archivo o ubicación (`StreamHandler`)
`daily` | Driver de Monolog basado en `RotatingFileHandler` que rota diariamente
`slack` | Driver de Monolog basado en `SlackWebhookHandler`
`papertrail` | Driver de Monolog basado en  `SyslogUdpHandler`
`syslog` | Driver de Monolog basado en `SyslogHandler`
`errorlog` | Driver de Monolog basado en `ErrorLogHandler`
`monolog` | Driver factory de Monolog que puede usar cualquier manejador de Monolog soportado
`custom` | Driver que llama a un factory especificado para crear un canal

::: tip 
Comprueba la documentación en [personalización avanzada de canales](#advanced-monolog-channel-customization) para aprender más sobre `monolog` y drivers `personalizados`.
:::

#### Configuración De Los Canales Single y Daily

Los canales `single` y `daily` tienen tres opciones de configuración opcionales: `bubble`, `permission` y `locking`.

Nombre | Descripción | Default
------------- | ------------- | -------------
`bubble` | Indica si los mensajes deberían llegar a otros canales después de ser manejados | `true`
`permission` | Los permisos del archivo de registro | `644`
`locking` | Intenta bloquear el archivo de registro antes de escribirlo | `false`

#### Configurando El Canal De Papertrail

El canal `papertrail` requiere de las opciones de configuración `url` y `port`. Puedes obtener estos valores desde [Papertrail](https://help.papertrailapp.com/kb/configuration/configuring-centralized-logging-from-php-apps/#send-events-from-php-app)

#### Configurando el Canal de Slack

El canal `slack` requiere una opción de configuración `url`. Esta URL debe coincidir con una URL de un [webhook entrante](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks) que has configurado para tu equipo de Slack.

<a name="building-log-stacks"></a>
### Construyendo Stacks de Registros

Como mencionamos anteriormente, el driver `stack` permite que combines múltiples canales en un sólo canal de registro. Para ilustrar cómo usar stacks de registros, vamos a echar un vistazo a un ejemplo de configuración que podrías ver en una aplicación en producción:

```php
'channels' => [
    'stack' => [
        'driver' => 'stack',
        'channels' => ['syslog', 'slack'],
    ],

    'syslog' => [
        'driver' => 'syslog',
        'level' => 'debug',
    ],

    'slack' => [
        'driver' => 'slack',
        'url' => env('LOG_SLACK_WEBHOOK_URL'),
        'username' => 'Laravel Log',
        'emoji' => ':boom:',
        'level' => 'critical',
    ],
],
```

Vamos a examinar esta configuración. Primero, observa que nuestro canal `stack` agrega dos canales más mediante su opción `channels`: `syslog` y `slack`. Entonces, al registrar mensajes, ambos canales tendrán la oportunidad de registrar el mensaje.

#### Niveles de Registro

Observa la opción de configuración `level` presente en la configuración de los canales `syslog` y `slack` en el ejemplo superior. Esta opción determina el "nivel" mínimo que un mensaje debe tener para poder ser registrado por el canal. Monolog, que hace funcionar los servicios de registros de Laravel, ofrece todos los niveles de registro definidos en la [especificación RFC 5424](https://tools.ietf.org/html/rfc5424): **emergency**, **alert**, **critical**, **error**, **warning**, **notice**, **info** y **debug**.

Así que, imagina que registramos un mensaje usando el método `debug`:

```php
Log::debug('An informational message.');
```

Dada nuestra configuración, el canal `syslog` escribirá el mensaje al registro del sistema; sin embargo, dado que el mensaje de error no es `critical` o superior, no será enviado a Slack. Sin embargo, si registramos un mensaje `emergency`, será enviado tanto al registro del sistema como a Slack dado que el nivel `emergency` está por encima de nuestro umbral mínimo para ambos canales:

```php
Log::emergency('The system is down!');
```

<a name="writing-log-messages"></a>
## Escribiendo Mensajes de Error

Puedes escribir información a los registros usando el [facade](/docs/{{version}}/facades) `Log`. Como mencionamos anteriormente, el registrador proporciona los ocho niveles de registro definidos en la [especificación RFC 5424](https://tools.ietf.org/html/rfc5424): **emergency**, **alert**, **critical**, **error**, **warning**, **notice**, **info** y **debug**:

```php
Log::emergency($message);
Log::alert($message);
Log::critical($message);
Log::error($message);
Log::warning($message);
Log::notice($message);
Log::info($message);
Log::debug($message);
```

Así que, podrías llamar a cualquiera de esos métodos para registrar un mensaje para el nivel correspondiente. Por defecto, el mensaje será escrito al canal de registro por defecto tal y como está configurado en tu archivo de configuración `config/logging.php`:

```php
<?php

namespace App\Http\Controllers;

use App\User;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;

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
        Log::info('Showing user profile for user: '.$id);

        return view('user.profile', ['user' => User::findOrFail($id)]);
    }
}
```

#### Información Contextual

Un arreglo de datos contextuales puede ser pasado a los métodos de registro. Estos datos contextuales serán formateados y mostrados con el mensaje registrado:

```php
Log::info('User failed to login.', ['id' => $user->id]);
```

<a name="writing-to-specific-channels"></a>
### Escribiendo a Canales Específicos

Algunas veces podrías querer registrar un mensaje a un canal aparte del canal por defecto de tu aplicación. Podrías usar el método `channel` en el facade `Log` para retornar y registrar a cualquier canal definido en tu archivo de configuración:

```php
Log::channel('slack')->info('Something happened!');
```

Si quisieras crear un stack de registro a la carta consistiendo de múltiples canales, puedes usar el método `stack`:

```php
Log::stack(['single', 'slack'])->info('Something happened!');
```

<a name="advanced-monolog-channel-customization"></a>
## Personalización Avanzada de Canales de Monolog

<a name="customizing-monolog-for-channels"></a>
### Personalizando Monolog para Canales

Algunas veces puede que necesites un control total sobre la forma en la que Monolog es configurado para un canal existente. Por ejemplo, podrías querer configurar una implementación personalizada para `FormatterInterface` de Monolog para los manejadores de un canal dado.

Para comenzar, define un arreglo `tap` en la configuración del canal. El arreglo `tap` debe contener una lista de clases que deben tener una oportunidad de personalizar (o hacerle "tap") a la instancia de Monolog luego de que es creada:

```php
'single' => [
    'driver' => 'single',
    'tap' => [App\Logging\CustomizeFormatter::class],
    'path' => storage_path('logs/laravel.log'),
    'level' => 'debug',
],
```

Una vez que has configurado la opción `tap` en tu canal, estás listo para definir la clase que personalizará tu instancia de Monolog. Esta clase sólo necesita un método: `__invoke`, que recibe una instancia `Illuminate\Log\Logger`. La instancia `Illuminate\Log\Logger` redirige todas las llamadas de métodos a la instancia base de Monolog:

```php
<?php

namespace App\Logging;

class CustomizeFormatter
{
    /**
    * Customize the given logger instance.
    *
    * @param  \Illuminate\Log\Logger  $logger
    * @return void
    */
    public function __invoke($logger)
    {
        foreach ($logger->getHandlers() as $handler) {
            $handler->setFormatter(...);
        }
    }
}
```

::: tip
Todas tus clases "tap" son resultas por el [contenedor de servicios](/docs/{{version}}/container), así que cualquier dependencia del constuctor que requieran será inyectada automáticamente.
:::

<a name="creating-monolog-handler-channels"></a>
### Creando Canales para Manejadores de Monolog

Monolog tiene una variedad de [manejadores disponibles](https://github.com/Seldaek/monolog/tree/master/src/Monolog/Handler). En algunos casos, el tipo de registro que quieres crear es simplemente un driver de Monolog con una instancia de un handler en específico. Estos canales pueden ser creados usando el driver `monolog`.

Al usar el driver `monolog`, la opción de configuración `handler` es usada para especificar que handler será instanciado. Opcionalmente, cualquier parametros del constructor que el handler necesite puede ser especificado usando la opción de configuración `with`:

```php
'logentries' => [
    'driver'  => 'monolog',
    'handler' => Monolog\Handler\SyslogUdpHandler::class,
    'with' => [
        'host' => 'my.logentries.internal.datahubhost.company.com',
        'port' => '10000',
    ],
],
```

#### Formateadores de Monolog

Al usar el driver `monolog`, `LineFormatter` de Monolog será usado como formateador por defecto. Sin embargo, puedes personalizar el tipo de formateador pasado al manejador usando las opciones de configuración `formatter` y `formatter_with`:

```php
'browser' => [
    'driver' => 'monolog',
    'handler' => Monolog\Handler\BrowserConsoleHandler::class,
    'formatter' => Monolog\Formatter\HtmlFormatter::class,
    'formatter_with' => [
        'dateFormat' => 'Y-m-d',
    ],
],
```

Si estás usando un manejador de Monolog que es capaz de proveer su propio formateador, puedes establecer el valor de la opción de configuración `formatter` a `default`:

```php
'newrelic' => [
    'driver' => 'monolog',
    'handler' => Monolog\Handler\NewRelicHandler::class,
    'formatter' => 'default',
],
```

<a name="creating-channels-via-factories"></a>
### Creando Canales Mediante Factories

Si quieres definir un canal personalizado completo en el que tienes control total sobre la instanciación y configuración de Monolog, puedes especificar un driver personalizado en tu archivo de configuración `config/logging.php`. Tu configuración debe incluir una opción `via` que apunte a la clase factory que será invocada para crear la instancia de Monolog:

```php
'channels' => [
    'custom' => [
        'driver' => 'custom',
        'via' => App\Logging\CreateCustomLogger::class,
    ],
],
```

Una vez que has configurado el canal personalizado, estás listo para definir la clase que creará tu instancia de Monolog. Esta clase sólo necesita un método: `__invoke`, el cual debe retornar una instancia de Monolog:

```php
<?php

namespace App\Logging;

use Monolog\Logger;

class CreateCustomLogger
{
    /**
    * Create a custom Monolog instance.
    *
    * @param  array  $config
    * @return \Monolog\Logger
    */
    public function __invoke(array $config)
    {
        return new Logger(...);
    }
}
```