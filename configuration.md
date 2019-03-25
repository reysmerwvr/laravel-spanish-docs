::: v-pre

# Configuración

- [Introducción](#introduction)
- [Configuración Del Entorno](#environment-configuration)
    - [Tipos De Variables De Entorno](#environment-variable-types)
    - [Recuperar La Configuración Del Entorno](#retrieving-environment-configuration)
    - [Determinando El Entorno Actual](#determining-the-current-environment)
    - [Ocultar Variables De Entornos A Páginas De Depuración](#hiding-environment-variables-from-debug)
- [Acceder A Valores De Configuración](#accessing-configuration-values)
- [Almacenamiento En Caché De La Configuración](#configuration-caching)
- [Modo De Mantenimiento](#maintenance-mode)

<a name="introduction"></a>
## Introducción

Todos los archivos de configuración para el framework Laravel están almacenados en el directorio `config`. Cada opción está documentada, así que no dudes en consultar los archivos y familiarizarte con las opciones disponibles para ti.

<a name="environment-configuration"></a>
## Configuración Del Entorno

A menudo es útil tener diferentes valores de configuración basados en el entorno en el que se ejecuta la aplicación. Por ejemplo, es posible que desees utilizar un servidor de caché localmente diferente al servidor que usas en producción.

Para hacer esto sencillo, Laravel utiliza la librería de PHP [DotEnv](https://github.com/vlucas/phpdotenv) por Vance Lucas. En una nueva instalación de Laravel, el directorio raíz de tu aplicación contendrá un archivo `.env.example`. Si instalas Laravel por medio de Composer, este archivo será renombrado automáticamente a `.env`. De lo contrario, deberás renombrar el archivo manualmente.

Tu archivo `.env` deberá omitirse en el sistema de control de versiones de tu aplicación, ya que cada desarrollador / servidor que usa tu aplicación puede requerir una configuración de entorno diferente. Además, esto sería un riesgo de seguridad en caso de que un intruso obtenga acceso al repositorio de control de versiones de tu aplicación.

Si estás desarrollando con un equipo, es posible que desees continuar incluyendo el archivo `.env.example` en tu aplicación. Al poner valores de ejemplo (placeholder) en el archivo de configuración `.env.example`, otros desarrolladores en tu equipo podrán ver claramente cuáles variables de entorno se necesitan para ejecutar tu aplicación. También puedes crear un archivo `.env.testing`. Este archivo sobrescribirá el archivo `.env` al ejecutar pruebas con PHPUnit o al ejecutar comandos de Artisan con la opción `--env=testing`.

::: tip
Cualquier variable en tu archivo `.env` puede ser anulada por variables de entorno externas tales como variables de entorno de nivel de servidor o de nivel de sistema.
:::

<a name="environment-variable-types"></a>
### Tipos De Variables De Entorno

Todas las variables en tus archivos `.env` se traducen como cadenas, así que algunos valores reservados han sido creados para permitirte retornar un rango más amplio de tipos desde la función `env()`:

Valor en `.env`  | Valor en `env()`
------------- | -------------
true | (booleano) true
(true) | (booleano) true
false | (booleano) false
(false) | (booleano) false
empty | (cadena) ''
(empty) | (cadena) ''
null | (null) null
(null) | (null) null

Si necesitas definir una variable de entorno con un valor que contiene espacios, puedes hacerlo  encerrando el valor en comillas dobles.

```php
APP_NAME="My Application"
```

<a name="retrieving-environment-configuration"></a>
### Recuperar La Configuración Del Entorno

Todas las variables listadas en este archivo van a ser cargadas en la variable super-global de PHP `$_ENV` cuando tu aplicación reciba una solicitud. Sin embargo, puedes utilizar el helper `env` para recuperar valores de estas variables en tus archivos de configuración. De hecho, si revisas los archivos de configuración de Laravel, podrás notar que varias de estas opciones ya están utilizando este helper:

```php
'debug' => env('APP_DEBUG', false),
```

El segundo valor pasado a la función `env` es el "valor predeterminado". Este valor será utilizado si no se encuentra una variable de entorno existente para la clave proporcionada.

<a name="determining-the-current-environment"></a>
### Determinando El Entorno Actual

El entorno actual de la aplicación es determinado por medio de la variable `APP_ENV` desde tu archivo `.env`. Puedes acceder a este valor por medio del método `environment` del [facade](/docs/5.8/facades) `App`:

```php
$environment = App::environment();
```

También puedes pasar argumentos al método `environment` para verificar si el entorno coincide con un valor determinado. El método va a retornar `true` si el entorno coincide con cualquiera de los valores dados:

```php
if (App::environment('local')) {
    // The environment is local
}

if (App::environment(['local', 'staging'])) {
    // The environment is either local OR staging...
}
```

::: tip 
La detección del entorno actual de la aplicación puede ser anulada por una variable de entorno `APP_ENV` a nivel del servidor. Esto puede ser útil cuando necesites compartir la misma aplicación para diferentes configuraciones de entorno, para que puedas configurar un host determinado para que coincida con un entorno determinado en las configuraciones de tu servidor.
:::

<a name="hiding-environment-variables-from-debug"></a>
### Ocultar Variables De Entornos A Páginas De Depuración

Cuando una excepción no es capturada y la variable de entorno `APP_DEBUG` es igual a `true`, la página de depuración mostrará todas las variables de entorno y sus contenidos. En algunos casos vas a querer ocultar ciertas variables. Puedes hacer esto actualizando la opción `debug_blacklist` en tu archivo de configuración `config/app.php`.

Algunas variables están disponibles tanto en las variables de entorno y en los datos del servidor / petición. Por lo tanto, puede que necesites ocultarlos tanto para `$_ENV` como `$_SERVER`:

```php
return [

    // ...

    'debug_blacklist' => [
        '_ENV' => [
            'APP_KEY',
            'DB_PASSWORD',
        ],

        '_SERVER' => [
            'APP_KEY',
            'DB_PASSWORD',
        ],

        '_POST' => [
            'password',
        ],
    ],
];
```

<a name="accessing-configuration-values"></a>
## Acceder A Valores De Configuración

Puedes acceder fácilmente a tus valores de configuración utilizando la funcion helper global `config` desde cualquier lugar de tu aplicación. Se puede acceder a los valores de configuración usanto la sintaxis de "punto", que incluye el nombre del archivo y la opción a la que deseas acceder. También puedes especificar un valor predeterminado que se devolverá si la opción de configuración no existe:

```php
$value = config('app.timezone');
```

Para establecer valores de configuración en tiempo de ejecución, pasa un arreglo al helper `config`:

```php
config(['app.timezone' => 'America/Chicago']);
```

<a name="configuration-caching"></a>
## Almacenamiento En Caché De La Configuración

Para dar a tu aplicación un aumento de velocidad, debes almacenar en caché todos tus archivos de configuración en un solo archivo usando el comando de Artisan `config:cache`. Esto combinará todas las opciónes de configuracieon para tu aplicación en un solo archivo que será cargado rápidamente por el framework.

Usualmente deberías ejecutar el comando `php artisan config:cache` como parte de tu rutina de despliegue a producción. El comando no se debe ejecutar durante el desarrollo local ya que las opciones de configuración con frecuencia deberán cambiarse durante el desarrollo de tu aplicación.

::: danger Nota
Si ejecutas el comando `config:cache` durante el proceso de despliegue, debes asegurarte de llamar solo a la función `env` desde tus archivos de configuración. Una vez que la configuración se ha almacenado en caché, el archivo `.env` no será cargado y todas las llamadas a la función `env` retornarán `null`.
:::

<a name="maintenance-mode"></a>
## Modo De Mantenimiento

Cuando tu aplicación se encuentre en modo de mantenimiento, se mostrará una vista personalizada para todas las solicitudes en tu aplicación. Esto facilita la "desactivación" de tu aplicación mientras se está actualizando o cuando se realiza mantenimiento. Se incluye una verificación de modo de mantenimiento en la pila de middleware predeterminada para tu aplicación. Si la aplicación está en modo de mantenimiento, una excepción `MaintenanceModeException` será lanzada con un código de estado 503.

Para habilitar el modo de mantenimiento, ejecuta el comando de Artisan `down`:

```php
php artisan down
```

También puedes proporcionar las opciones `message` y `retry` al comando `down`. El valor de `message` se puede usar para mostrar o registrar un mensaje personalizado, mientras que el valor de `retry` se establecerá como el valor de cabecera HTTP `Retry-After`:

```php
php artisan down --message="Upgrading Database" --retry=60
```

Incluso en modo de mantenimiento, se les puede permitir acceder a la aplicación a direcciones IP  o redes específicas usando la opción `allow` del comando:

```php
php artisan down --allow=127.0.0.1 --allow=192.168.0.0/16
```

Para deshabilitar el modo de mantenimiento, usa el comando `up`:

```php
php artisan up
```

::: tip
Puedes personalizar la plantilla predeterminada del modo de mantenimiento al definir tu propia plantilla en `resources/views/errors/503.blade.php`.
:::

#### Modo De Mantenimiento Y Colas

Mientras tu aplicación esté en modo de mantenimiento, no se manejarán [trabajos en cola](/docs/5.8/queues). Los trabajos continuarán siendo manejados de forma normal una vez que la aplicación esté fuera del modo de mantenimiento.

#### Alternativas Al Modo De Mantenimiento

Como el modo de mantenimiento requiere que tu aplicación tenga varios segundos de tiempo de inactividad, considera alternativas como [Envoyer](https://envoyer.io) para lograr hacer deploy de Laravel sin tiempo de inactividad.