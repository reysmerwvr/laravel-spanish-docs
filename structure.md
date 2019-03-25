::: v-pre

# Estructura de Directorios

- [Introducción](#introduction)
- [Directorio Raíz](#the-root-directory)
    - [Directorio `app`](#the-root-app-directory)
    - [Directorio `bootstrap`](#the-bootstrap-directory)
    - [Directorio `config`](#the-config-directory)
    - [Directorio `database`](#the-database-directory)
    - [Directorio `public`](#the-public-directory)
    - [Directorio `resources`](#the-resources-directory)
    - [Directorio `routes`](#the-routes-directory)
    - [Directorio `storage`](#the-storage-directory)
    - [Directorio `tests`](#the-tests-directory)
    - [Directorio `vendor`](#the-vendor-directory)
- [Directorio App](#the-app-directory)
	- [Directorio `Broadcasting`](#the-broadcasting-directory)
    - [Directorio `Console`](#the-console-directory)
    - [Directorio `Events`](#the-events-directory)
    - [Directorio `Exceptions`](#the-exceptions-directory)
    - [Directorio `Http`](#the-http-directory)
    - [Directorio `Jobs`](#the-jobs-directory)
    - [Directorio `Listeners`](#the-listeners-directory)
    - [Directorio `Mail`](#the-mail-directory)
    - [Directorio `Notifications`](#the-notifications-directory)
    - [Directorio `Policies`](#the-policies-directory)
    - [Directorio `Providers`](#the-providers-directory)
    - [Directorio `Rules`](#the-rules-directory)

<a name="introduction"></a>
## Introducción

La estructura por defecto de aplicación de Laravel está pensada para proporcionar un buen punto de inicio tanto para grandes y pequeñas aplicaciones. Pero, eres libre de organizar tu aplicación como quieras. Laravel no impone casi ninguna restricción sobre donde una clase es ubicada - siempre y cuando Composer pueda cargar automáticamente la clase.

#### ¿Donde Está el Directorio de Modelos?

Al comenzar con Laravel, muchos desarrolladores son confundidos por la falta de un directorio `models`. Sin embargo, la falta de dicho directorio es intencional. Encontramos la palabra "models" ambigua dado que significa muchas cosas diferentes para muchas personas. Algunos desarrolladores se refieren al "modelo" de una aplicación como la totalidad de toda su lógica de negocio, mientras que otros se refieren a los "modelos" como clases que interactuan con una base de datos relacional.

Por esta razón, elegimos ubicar los modelos de Eloquent por defecto en el directorio `app` y permitir al desarrollar ubicarlos en algun otro sitio si así lo eligen.

<a name="the-root-directory"></a>
## Directorio Raíz

<a name="the-root-app-directory"></a>
#### Directorio App

El directorio `app` contiene el código prinicipal de tu aplicación. Exploraremos este directorio con más detalle pronto; sin embargo, casi todas las clases en tu aplicación estarán en este directorio.

<a name="the-bootstrap-directory"></a>
#### Directorio Bootstrap

El directorio `bootstrap` contiene el archivo `app.php` que maqueta el framework. Este directorio también almacena un directorio `cache` que contiene archivos generados por el framework para optimización de rendimiento como los archivos de cache de rutas y servicios.

<a name="the-config-directory"></a>
#### Directorio Config

El directorio `config`, como el nombre implica, contiene todos los archivos de configuración de tu aplicación. Es una buena idea leer todos estos archivos y familiarizarte con todas las opciones disponibles para ti.

<a name="the-database-directory"></a>
#### Directorio Database

El directorio `database` contiene las migraciones de tu base de datos, model factories y seeders. Si lo deseas, puedes también usar este directorio para almacenar una base de datos SQLite.

<a name="the-public-directory"></a>
#### Directorio Public

El directorio `public` contiene el archivo `index.php`, el cual es el punto de acceso para todas las solicitudes llegan a tu aplicación y configura la autocarga. Este directorio también almacena tus assets, tales como imagenes, JavaScript y CSS.

<a name="the-resources-directory"></a>
#### Directorio Resources

El directorio `resources` contiene tus vistas así como también tus assets sin compilar tales como LESS, Sass o JavaScript. Este directorio también almacena todos tus archivos de idioma.

<a name="the-routes-directory"></a>
#### Directorio Routes

El directorio `routes` contiene todas las definiciones de rutas para tu aplicación. Por defecto, algunos archivos de rutas son incluidos con Laravel: `web.php`, `api.php`, `console.php` y `channels.php`.

El archivo `web.php` contiene rutas que `RouteServiceProvider` coloca en el grupo de middleware `web`, que proporciona estado de sesión, protección CSRF y encriptación de cookies. Si tu aplicación no ofrece una API sin estado, todas tus rutas probablemente serán definidas en el archivo `web.php`.

El archivo `api.php` contiene rutas que `RouteServiceProvider` coloca en el grupo de middleware `api`, que proporcionan limitación de velocidad. Estas rutas están pensadadas para no tener estado, así que las solicitudes que llegan a la aplicación a través de estas rutas están pensadas para ser autenticadas mediante tokens y no tendrán acceso al estado de sesión.

El archivo `console.php` es donde puedes definir todas los comandos basados en Closures de tu aplicación. Cada Closure está enlazado a una instancia de comando permitiendo una forma simple de interactuar con los métodos de entrada y salida de cada comando. Aunque este archivo no define ninguna ruta HTTP, sí define puntos de entrada en consola (rutas) a tu aplicación.

El archivo `channels.php` es donde puedes registrar todos los canales de transmisión de eventos que tu aplicación soporta.

<a name="the-storage-directory"></a>
#### Directorio Storage

El directorio `storage` contiene tus plantillas compiladas de Blade, sesiones basadas en archivos, archivos de caches y otros archivos generados por el framework. Este directorio está segregado en los directorios `app`, `framework` y `logs`. El directorio `app` puede ser usado para almacenar cualquier archivo generado por tu aplicación. El directorio `framework` es usado para almacenar archivos generados por el framework y cache. Finalmente, el directorio `logs` contiene los archivos de registros de tu aplicación.

El directorio `storage/app/public` puede ser usado para almacenar archivos generados por el usario, tales como imagenes de perfil, que deberían ser accesibles públicamente. Debes crear un enlace simbólico en `public/storage` que apunte a este directorio. Puedes crear el enlace usando el comando `php artisan storage:link`.

<a name="the-tests-directory"></a>
#### El Directorio Tests

El directorio `tests` contiene tus pruebas automatizadas. Una prueba de ejemplo de [PHPUnit](https://phpunit.de/) es proporcionada. Cada clase de prueba debe estar precedida por la palabra `Test`. Puedes ejecutar tus pruebas usando los comandos `phpunit` o `php vendor/bin/phpunit`.

<a name="the-vendor-directory"></a>
#### Directorio Vendor

El directorio `vendor` contiene tus dependencias de [Composer](https://getcomposer.org).

<a name="the-app-directory"></a>
## Directorio App

La mayoría de tu aplicación está almacenada el directorio `app`. Por defecto, este directorio está regido por el nombre de espacio `App` y es cargado automáticamente por Composer usando el [estándar de autocarga PSR-4](https://www.php-fig.org/psr/psr-4/).

El directorio `app` contiene una variedad de directorios adicionales tales como `Console`, `Http` y `Providers`. Piensa en los directorios `Console` y `Http` como si proporcionaran una API al núcleo de tu aplicación, pero no contienen lógica de la aplicación como tal. En otras palabras, son dos formas de emtir comandos a tu aplicación. El directorio `Console` contiene todos tus comandos de Artisan, mientras que el directorio `Http` contiene tus controladores, middleware y solicitudes.

Una variedad de otros directorios serán generados dentro del directorio `app` cuando uses los comandos `make` de Artisan para generar clases. Así que, por ejemplo, el directorio `app/Jobs` no existirá hasta que ejecutes el comando de Artisan `make:job` para generar una clase job.

::: tip
Muchas de las clases en el directorio `app` pueden ser generadas por Artisan mediante comandos. Para ver los comandos disponibles, ejecuta el comando `php artisan list make` en tu terminal.
:::

<a name="the-broadcasting-directory"></a>
#### The Broadcasting Directory

El directorio `Broadcasting` contiene todas las clases de broadcast de tu aplicación. Estas clases son generadas usando el comando `make:channel`. Este directorio no existe por defecto, pero será creado para ti cuando crees tu primer canal. Para aprender más sobre canales, revisa la documentación sobre [broadcasting de eventos](/docs/5.8/broadcasting).

<a name="the-console-directory"></a>
#### El Directorio Console

El directorio `Console` contiene todos los comandos personalizados de Artisan para tu aplicación. Estos comandos pueden ser generados usando el comando `make:command`. Este directorio también almacena el kernel de tu consola, que es donde tus comandos personalizados de Artisan son registrados y tus [tareas programadas](/docs/5.8/scheduling) son definidas.

<a name="the-events-directory"></a>
#### Directorio Events

Este directorio no existe por defecto, pero será creado para ti por los comandos de Artisan `event:generate` y `make:event`. El directorio `Events` almacena [clases de eventos](/docs/5.8/events). Los eventos pueden ser usados para alertar a otras partes de tu aplicación que una acción dada ha ocurrido, proporcionando una gran cantidad de flexibilidad y desacoplamiento.

<a name="the-exceptions-directory"></a>
#### Directorio Exceptions

El directorio `Exceptions` contiene el manejador de excepciones de tu aplicación y también es un buen lugar para colocar cualquier excepción lanzada por tu aplicación. Si te gustaría personalizar cómo las excepciones son mostradas o renderizadas, debes modificar la clase `Handler` en este directorio.

<a name="the-http-directory"></a>
#### Directorio Http

El directorio `Http` contiene tus controladores, middleware y form requests. Casi toda la lógica para manejar las solicitudes que llegan a tu aplicación serán colocadas en este directorio.

<a name="the-jobs-directory"></a>
#### Directorio Jobs

Este directorio no existe por defecto, pero será creado para ti si ejecutas el comando de Artisan `make:job`. El directorio `Jobs` almacena las [colas de trabajos](/docs/5.8/queues) para tu aplicación. Los trabajos pueden ser encolados por tu aplicación o ejecutados sincrónicamente dentro del ciclo de vida actual de la solicitud. Los trabajos que son ejecutados sincrónicamente durante la solicitud actual son algunas veces referidos como "comandos" dado que son una implementación del [patrón de comandos](https://en.wikipedia.org/wiki/Command_pattern).

<a name="the-listeners-directory"></a>
#### Directorio Listeners

Este directorio no existe por defecto, pero será creado para ti si ejecutas los comandos de Artisan `event:generate` o `make:listener`. El directorio `Listeners` contiene las clases que manejan tus [eventos](/docs/5.8/events). Los listeners de eventos reciben una instancia de evento y realizan la lógica en respuesta al evento siendo ejecutado. Por ejemplo, un evento `UserRegistered` puede ser manejado por un listener `SendWelcomeEmail`.

<a name="the-mail-directory"></a>
#### Directorio Mail

Este directorio no existe por defecto, pero será creado para ti si ejecutas el comando de artisan `make:mail`. El directorio `Mail` contiene todas tus clases que representan correos electrónicos enviados por tu aplicación. Los objetos de correo te permiten encapsular toda la lógica para construir un correo en una única y sencilla clase y que puede ser enviado usando el método `Mail::send`.

<a name="the-notifications-directory"></a>
#### Directorio Notifications

Este directorio no existe por defecto, pero será creado para ti si ejecutas el comando de Artisan `make:notification`. El directorio `Notifications` contiene todas las notificaciones "transaccionales" que son enviadas por tu aplicación, tales como notificaciones sencillas sobre eventos que ocurren dentro de tu aplicación. Las características de notifcaciones de Laravel abstrae el envío de notificaciones sobre una variedad de drivers como email, Slack, SMS o almacenados en la base de datos.

<a name="the-policies-directory"></a>
#### Directorio Policies

Este directorio no existe por defecto, pero será creado para ti si ejecutas el comando de Artisan `make:policy`. El directorio `Policies` contiene las clases de las políticas de autorización de tu aplicación. Las políticas son usadas para determinar si un usuario puede realizar una acción dada contra un recurso. Para más información, revisa la [documentación sobre autorización][authorization documentation](/docs/5.8/authorization).

<a name="the-providers-directory"></a>
#### Directorio Providers

El directorio `Providers` contiene todos los [proveedores de servicios](/docs/5.8/providers) para tu aplicación. Los proveedores de servicios maquetan tu aplicación al enlazar servicios en el contenedor de servicios, registrando eventos o realizando cualquier otra tarea para preparar tu aplicación para solicitudes entrantes.

En una aplicación de Laravel nueva, este directorio ya contendrá algunos proveedores. Eres libre de agregar tus propios proveedores a este directorio según sea necesario.

<a name="the-rules-directory"></a>
#### Directorio Rules

Este directorio no existe por defecto, pero será creado para ti si ejecutas el comando de Artisan `make:rule`. El directorio `Rules` contiene los objetos para las reglas de validación personalizadas de tu aplicación. Las reglas son usadas para encapsular lógica de validación complicada en un simple objeto. Para más información, revisa la [documentación sobre validación](/docs/5.8/validation).