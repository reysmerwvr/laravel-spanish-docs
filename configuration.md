# Configuración

- [Introducción](#introduction)
- [Configuración Del Entorno](#environment-configuration)
    - [Recuperar La Configuración Del Entorno](#retrieving-environment-configuration)
    - [Determinando El Entorno Actual](#determining-the-current-environment)
- [Acceder A Valores De Configuración](#accessing-configuration-values)
- [Almacenamiento En Caché De La Configuración](#configuration-caching)
- [Modo De Mantenimiento](#maintenance-mode)

<a name="introduction"></a>
## Introducción

Todos los archivos de configuración para el framework Laravel están almacenados en el directorio `config`. Cada opción está documentada, así que no dude en consultar los archivos y familiarizarse con las opciones disponibles para usted.

<a name="environment-configuration"></a>
## Configuración Del Entorno

A menudo es útil tener diferentes valores de configuración basados en el entorno en el que se ejecuta la aplicación. Por ejemplo, es posible que desee utilizar un servidor de caché diferente localmente que en el servidor de producción.

Para hacer esto sencillo, Laravel utiliza la librería de PHP [DotEnv](https://github.com/vlucas/phpdotenv) por Vance Lucas. En una nueva instalación de Laravel, el directorio raíz de su aplicación contendrá un archivo `.env.example`. Si instala Laravel por medio de Composer, este archivo será renombrado automáticamente a `.env`. De lo contrario, usted deberá renombrar el archivo manualmente.

Su archivo `.env` deberá omitirse en el controlador de versiones sde su aplicación, ya que cada desarrollador / servidor utilizando su aplicación puede requerir una configuración diferente del entorno. Además, esto sería un riesgo de seguridad en caso de que un intruso obtenga acceso al repositorio de control de versiones de su aplicación.

Si está desarrollando con un equipo, es posible que desee continuar incluyendo el archivo `.env.example` en su aplicación. Al poner valores de ejemplo en el archivo de configuración de muestra, otros desarrolladores en su equipo podrán ver claramente cuales variables de entorno se necesitan para ejecutar su aplicación. También puede crear un archivo `.env.testing`. Este archivo sobreescribirá el archivo `.env` al ejecutar pruebas con PHPUnit o al ejecutar comandos de Artisan con la opción `--env=testing`.

> {tip} Cualquier variable en su archivo `.env` puede ser anulada por variables de entorno externas tales como variables de entorno de nivel de servidor o de nivel de sistema.

<a name="retrieving-environment-configuration"></a>
### Recuperar La Configuración Del Entorno

Todas las variables listadas en este archivo van a ser cargadas en la variable super-golbal de PHP `$_ENV` cuando su aplicación reciba una solicitud. Sin embargo, puede utilizar el helper `env` para recuperar valores de estas variables en sus archivos de configuración. De hecho, si revisa los archivos de configuración de Laravel, podrá notar que varias de estas opciones ya están utilizando este helper:

    'debug' => env('APP_DEBUG', false),

El segundo valor pasado a la función `env` es el "valor predeterminado". Este valor será utilizado si no se encuentra una variable de entorno existente para la clave proporcionada.

<a name="determining-the-current-environment"></a>
### Determinando El Entorno Actual

El entorno actual de la aplicación es determinado por medio de la variable `APP_ENV` desde su archivo `.env`. Puede acceder a este valor por medio del método `environment` del [facade](/docs/{{version}}/facades) `App`:

    $environment = App::environment();

También puede pasar argumentos al método `environment` para verificar si el entorno coincide con un valor determinado. El método va a retornar `true` si el entorno coincide con cualquiera de los valores dados:

    if (App::environment('local')) {
        // The environment is local
    }

    if (App::environment(['local', 'staging'])) {
        // The environment is either local OR staging...
    }

> {tip} La detección del entorno actual de la aplicación puede ser anulada por una variable de entorno `APP_ENV` a nivel servidor. Esto puede ser útil cuando necesite compartir la misma aplicación para diferentes configuraciones de entorno, para que pueda configurar un host determinado para que coincida con un entorno determinado en las configuraciones de sus servidor.

<a name="accessing-configuration-values"></a>
## Acceder A Valores De Configuración

Puede acceder fácilmente a sus valores de configuración utilizando la funcion helper global `config` desde cualquier lugar de su aplicación. Se puede acceder a los valores de configuración usanto la sintaxis de "punto", que incluye el nombre del archivo y la opción a la que se desea acceder. También puede especificar un valor predeterminado que se devolverá si la opción de configuración no existe:

    $value = config('app.timezone');

Para establecer valores de configuración en tiempo de ejecución, pase un arreglo al helper `config`:

    config(['app.timezone' => 'America/Chicago']);

<a name="configuration-caching"></a>
## Almacenamiento En Caché De La Configuración

Para dar a su aplicación un aumento de velocidad, debe almacenar en caché todos sus archivos de configuración en un solo archivo usando el comando de Artisan `config:cache`. Esto combinará todas las opciónes de configuracieon para su aplicación en un solo archivo que será cargado rápidamente por el framework.

Usualmente debería ejecutar el comando `php artisan config:cache` como parte de su rutina de deploy a producción. El comando no se debe ejecutar durante el desarrollo local ya que las opciones de configuración con frecuencia deberán cambiarse durante el desarrollo de su aplicación.

> {note} Si ejecuta el comando `config:cache` durante el proceso de deploy, debe asegurarse de llamar solo a la función `env` desde sus archivos de configuración. Una vez que la configuración se ha almacenado en caché, el archivo `.env` no será cargado y todas las llamadas a la función `env` retornarán `null`.

<a name="maintenance-mode"></a>
## Modo De Mantenimiento

Cuando su aplicación se encuentre en modo de mantenimiento, se mostrará una vista personalizada para todas las solicitudes en su aplicación. Esto facilita la "desactivación" de su aplicación mientras se está actualizando o cuando se realiza mantenimiento. Se incluye una verificación de modo de mantenimiento en el stack de middleware predeterminado para su aplicación. Si la aplicación está en modo de mantenimiento, una excepción `MaintenanceModeException` será lanzada con un código de estatus 503.

Para habilitar el modo de mantenimiento, ejecute el comando de Artisan `down`:

    php artisan down

También puede proporcionar las opciones `message` y `retry` al comando `down`. El valor de `message` se puede usar para mostrar o registrar un mensaje personalizado, mientras que el valor de `retry` se establecerá como el valor de cabecera HTTP `Retry-After`:

    php artisan down --message="Upgrading Database" --retry=60

Para deshabilitar el modo de mantenimiento, utilice el comando `up`:

    php artisan up

> {tip} Puede personalizar el template predeterminado del modo de mantenimiento al definir su propio template en `resources/views/errors/503.blade.php`.

#### Modo De Mantenimiento Y Colas

Mientras su aplicación esté en modo de mantenimiento, no se manejarán [trabajos en cola](/docs/{{version}}/queues). Los trabajos continuarán siendo manejados de forma normal una vez que la aplicación esté fuera del modo de mantenimiento.

#### Alternativas Al Modo De Mantenimiento

Como el modo de mantenimiento requiere que su aplicación tenga varios segundos de tiempo de inactividad, considere alternativas como [Envoyer](https://envoyer.io) para lograr hacer deploy de Laravel sin tiempo de inactividad.
