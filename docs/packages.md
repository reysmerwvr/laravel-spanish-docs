::: v-pre

# Desarrollo de Paquetes

- [Introducción](#introduction)
    - [Una nota sobre Facades](#a-note-on-facades)
- [Descubrimiento de Paquetes](#package-discovery)
- [Proveedores de Servicios](#service-providers)
- [Recursos](#resources)
    - [Configuración](#configuration)
    - [Migraciones](#migrations)
    - [Rutas](#routes)
    - [Traducciones](#translations)
    - [Vistas](#views)
- [Comandos](#commands)
- [Archivos Públicos](#public-assets)
- [Publicar Grupos de Archivos](#publishing-file-groups)

<a name="introduction"></a>
## Introducción

Los paquetes son la forma principal de agregar funcionalidad a Laravel. Los paquetes pueden ser cualquier cosa, desde una estupenda manera de trabajar con fechas como [Carbon](https://github.com/briannesbitt/Carbon), o un framework completo de pruebas BDD como [Behat](https://github.com/Behat/Behat).

Hay diferentes tipos de paquetes. Algunos paquetes son independientes, lo que significa que funcionan con cualquier framework de PHP. Carbon y Behat son ejemplos de paquetes independientes. Cualquiera de estos paquetes se puede usar con Laravel simplemente solicitándolos en el archivo `composer.json`.

Por otro lado, otros paquetes están específicamente destinados para su uso con Laravel. Estos paquetes pueden tener rutas, controladores, vistas y configuraciones específicamente diseñadas para mejorar una aplicación Laravel. Esta guía cubre principalmente el desarrollo de aquellos paquetes que son específicos de Laravel.

<a name="a-note-on-facades"></a>
### Una nota sobre Facades

Al escribir una aplicación Laravel, generalmente no importa si usas interfaces o facades ya que ambos brindan niveles esencialmente iguales de capacidad de pruebas. Sin embargo, al escribir paquetes, tu paquete normalmente no tendrá acceso a todos las funciones helpers de prueba de Laravel. Si deseas escribir pruebas para el paquete como si existiera dentro de una típica aplicación Laravel puedes usar el paquete [Orchestral Testbench](https://github.com/orchestral/testbench).

<a name="package-discovery"></a>
## Descubrimiento de Paquetes

En el archivo de configuración `config/app.php` de una aplicación Laravel, la opción `providers` define una lista de proveedores de servicios que Laravel debe cargar. Cuando alguien instala tu paquete normalmente querrás que tu proveedor de servicio sea incluido en esta lista. En lugar de requerir que los usuarios agreguen manualmente su proveedor de servicios a la lista, puede definir el proveedor en la sección `extra` del archivo `composer.json` de tu paquete. Además de los proveedores de servicios, también puedes enumerar los [facades](/docs/{{version}}/facades) que desees registrar:

```php
"extra": {
    "laravel": {
        "providers": [
            "Barryvdh\\Debugbar\\ServiceProvider"
        ],
        "aliases": {
            "Debugbar": "Barryvdh\\Debugbar\\Facade"
        }
    }
},
```

Una vez que tu paquete se haya configurado para su descubrimiento, Laravel registrará automáticamente sus proveedores de servicios y facades cuando esté instalado, creando una experiencia de instalación conveniente para los usuarios de tu paquete.

### Exclusión Del Descubrimiento De Paquetes

Si eres es el consumidor de un paquete y deseas deshabilitar el descubrimiento de paquetes para un paquete, puedes incluir el nombre del paquete en la sección `extra` del archivo `composer.json` de tu aplicación Laravel:

```php
"extra": {
    "laravel": {
        "dont-discover": [
            "barryvdh/laravel-debugbar"
        ]
    }
},
```

Puede deshabilitar el descubrimiento de paquetes para todos los paquetes que usan el carácter `*` dentro de la directiva `dont-discover` de tu aplicación:

```php
"extra": {
    "laravel": {
        "dont-discover": [
            "*"
        ]
    }
},
```

<a name="service-providers"></a>
## Proveedores de Servicios

Los [Proveedores de Servicios](/docs/{{version}}/providers) son la conexión entre tu paquete y Laravel. Un proveedor de servicios es responsable de enlazar cosas a Laravel con el [Contenedor de Servicios](/docs/{{version}}/container) e informar a Laravel dónde cargar los recursos del paquete como vistas y archivos de configuración y de configuración regional.

Un Proveedor de Servicios extiende de la clase `Illuminate\Support\ServiceProvider` y contiene dos métodos: `register` y `boot`. La clase base `ServiceProvider` está ubicada en `illuminate/support`, donde debemos especificar todas las dependencias de nuestro paquete. Para obtener más información sobre la estructura y el propósito de los proveedores de servicios, visita su [documentación](/docs/{{version}}/providers).

<a name="resources"></a>
## Recursos

<a name="configuration"></a>
### Configuración

Por lo general, deberás publicar el archivo de configuración de tu paquete en el propio directorio `config` de la aplicación. Esto permitirá a los usuarios anular fácilmente sus opciones de configuración predeterminadas. Para permitir que se publiquen sus archivos de configuración, debes llamar al método `publishes` desde el método `boot` de tu proveedor de servicios:

```php
/**
* Perform post-registration booting of services.
*
* @return void
*/
public function boot()
{
    $this->publishes([
        __DIR__.'/path/to/config/courier.php' => config_path('courier.php'),
    ]);
}
```

Ahora, cuando los usuarios de tu paquete ejecutan el comando `vendor:publish` de Laravel, su archivo se copiará a la ubicación de publicación especificada. Una vez que se haya publicado su configuración, se podrá acceder a sus valores como cualquier otro archivo de configuración:

```php
$value = config('courier.option');
```

::: danger Nota
No debes definir funciones anónimas en tus archivos de configuración ya que no se pueden serializar correctamente cuando los usuarios ejecutan el comando Artisan `config:cache`.
:::

#### Configuración predeterminada del paquete

También puedes fusionar tu propio archivo de configuración de paquete con la copia publicada de la aplicación. Esto permitirá que los usuarios definan solo las opciones que realmente desean anular en la copia publicada de la configuración. Para fusionar las configuraciones, use el método `mergeConfigFrom` dentro del método `register` de tu proveedor de servicios:

```php
/**
* Register bindings in the container.
*
* @return void
*/
public function register()
{
    $this->mergeConfigFrom(
        __DIR__.'/path/to/config/courier.php', 'courier'
    );
}
```

::: danger Nota
Este método solo combina el primer nivel de la matriz de configuración. Si los usuarios definen parcialmente una matriz de configuración multidimensional las opciones faltantes no se fusionarán.
:::

<a name="routes"></a>
### Rutas

Si tu paquete contiene rutas, puede cargarlas usando el método `loadRoutesFrom`. Este método determinará automáticamente si las rutas de la aplicación se almacenan en caché y no cargarán el archivo de rutas si las rutas ya se han almacenado en caché:

```php
/**
* Perform post-registration booting of services.
*
* @return void
*/
public function boot()
{
    $this->loadRoutesFrom(__DIR__.'/routes.php');
}
```

<a name="migrations"></a>
### Migraciones

Si tu paquete contiene [migraciones de base de datos](/docs/{{version}}/migraciones), puedes usar el método `loadMigrationsFrom` para informarle a Laravel cómo cargarlas. El método `loadMigrationsFrom` acepta la ruta a las migraciones de tu paquete como su único argumento:

```php
/**
* Perform post-registration booting of services.
*
* @return void
*/
public function boot()
{
    $this->loadMigrationsFrom(__DIR__.'/path/to/migrations');
}
```

Una vez que se hayan registrado las migraciones de tu paquete, éstas se ejecutarán automáticamente cuando se utilize el comando `php artisan migrate`. Cabe destacar que no es necesario exportarlas al directorio principal de las migraciones en la aplicación.

<a name="translations"></a>
### Traducciones

Si tu paquete contiene [archivos de traducción](/docs/{{version}}/localization) puedes usar el método `loadTranslationsFrom` para informarle a Laravel cómo cargarlos. Por ejemplo, si tu paquete se llama `courier`, debes agregar lo siguiente al método` boot` de tu proveedor de servicios:

```php
/**
* Perform post-registration booting of services.
*
* @return void
*/
public function boot()
{
    $this->loadTranslationsFrom(__DIR__.'/path/to/translations', 'courier');
}
```

Las traducciones de paquetes se referencian usando la convención de sintaxis `package::file.line`. Por lo tanto, puedes cargar la línea `welcome` del paquete `courier` del archivo `messages` de la siguiente manera:

```php
echo trans('courier::messages.welcome');
```

#### Publicación de Traducciones

Si deseas publicar las traducciones de tu paquete en el directorio `resources/lang/vendor` de la aplicación, puedes usar el método `publishes` del proveedor de servicios. El método `publishes` acepta un arreglo de rutas de paquetes y sus ubicaciones de publicación deseadas. Por ejemplo, para publicar los archivos de traducción para el paquete `courier`, puedes hacer lo siguiente:

```php
/**
* Perform post-registration booting of services.
*
* @return void
*/
public function boot()
{
    $this->loadTranslationsFrom(__DIR__.'/path/to/translations', 'courier');

    $this->publishes([
        __DIR__.'/path/to/translations' => resource_path('lang/vendor/courier'),
    ]);
}
```

Ahora, cuando los usuarios de tu paquete ejecutan el comando Artisan `vendor:publish` de Laravel, las traducciones de tu paquete se publicarán en la ubicación de publicación especificada.

<a name="views"></a>
### Vistas

Para registrar las [vistas](/docs/{{version}}/views) de tu paquete con Laravel necesitas decirle a Laravel dónde están ubicadas. Puedes hacerlo utilizando el método `loadViewsFrom` del proveedor de servicios. El método `loadViewsFrom` acepta dos argumentos: la ruta a sus plantillas de vista y el nombre de tu paquete. Por ejemplo, si el nombre de tu paquete es `courier`, debe agregar lo siguiente al método `boot` de tu proveedor de servicios:

```php
/**
* Perform post-registration booting of services.
*
* @return void
*/
public function boot()
{
    $this->loadViewsFrom(__DIR__.'/path/to/views', 'courier');
}
```

Las vistas de paquete se referencian usando la convención de sintaxis `package::view`. Entonces, una vez que tu ruta de vista se registra en un proveedor de servicios, puedes cargar la vista `admin` del paquete `courier` de la siguiente manera:

```php
Route::get('admin', function () {
    return view('courier::admin');
});
```

#### Desactivar Vistas del Paquete

Cuando utilizas el método `loadViewsFrom`, Laravel en realidad registra dos ubicaciones para sus vistas: el directorio `resources/views/vendor` de la aplicación y el directorio que tu especificas. Entonces, usando el ejemplo `courier`, Laravel primero comprobará si el desarrollador ha proporcionado una versión personalizada de la vista en `resources/views/vendor/courier`. Entonces, si la vista no se ha personalizado, Laravel buscará en el directorio de las vistas del paquete que has colocado en el método `loadViewsFrom`. Esto facilita a los usuarios del paquete personalizar o anular las vistas de tu paquete.

#### Publicación de Vistas

Si desea que tus vistas estén disponibles para su publicación en el directorio `resources/views/vendor` de la aplicación, puedes usar el método` publishes` del proveedor de servicios. El método `publishes` acepta una matriz de rutas de vista de paquete y sus ubicaciones de publicación deseadas:

```php
/**
* Perform post-registration booting of services.
*
* @return void
*/
public function boot()
{
    $this->loadViewsFrom(__DIR__.'/path/to/views', 'courier');

    $this->publishes([
        __DIR__.'/path/to/views' => resource_path('views/vendor/courier'),
    ]);
}
```

Ahora, cuando los usuarios de su paquete ejecutan el comando Artisan `vendor:publish` de Laravel, las vistas de su paquete se copiarán en la ubicación especificada.

<a name="commands"></a>
## Comandos

Para registrar los comandos Artisan de tu paquete con Laravel puedes usar el método `commands`. Este método espera un arreglo con los nombres de clases de comando. Una vez que los comandos han sido registrados, puedes ejecutarlos usando [Artisan CLI](/docs/{{version}}/artisan):

```php
/**
* Bootstrap the application services.
*
* @return void
*/
public function boot()
{
    if ($this->app->runningInConsole()) {
        $this->commands([
            FooCommand::class,
            BarCommand::class,
        ]);
    }
}
```

<a name="public-assets"></a>
## Archivos Públicos

Tu paquete puede tener archivos como JavaScript, CSS e imágenes. Para publicar estos archivos en el directorio `public` de la aplicación debes usar el método `publishes` del proveedor de servicios. En este ejemplo, también agregaremos una etiqueta de grupo de archivos `public`, que se puede usar para publicar grupos de archivos relacionados:

```php
/**
* Perform post-registration booting of services.
*
* @return void
*/
public function boot()
{
    $this->publishes([
        __DIR__.'/path/to/assets' => public_path('vendor/courier'),
    ], 'public');
}
```

Ahora, cuando los usuarios de tu paquete ejecuten el comando `vendor:publish` tus archivos se copiarán en la ubicación especificada. Como normalmente necesitarás sobrescribir los archivos cada vez que se actualice el paquete, puedes usar el indicador `--force`:

```php
php artisan vendor:publish --tag=public --force
```

<a name="publishing-file-groups"></a>
## Publicar Grupos de Archivos

Es posible que desees publicar grupos de archivos y recursos de paquetes por separado. Por ejemplo, es posible que desees permitir que los usuarios publiquen los archivos de configuración de su paquete sin verse obligados a publicar los archivos de tu paquete. Puede hacer esto "etiquetándolos" cuando llames al método `publishes` del proveedor de servicios de un paquete. Por ejemplo, usemos etiquetas para definir dos grupos de publicación en el método `boot` de un proveedor de servicios de paquetes:

```php
/**
* Perform post-registration booting of services.
*
* @return void
*/
public function boot()
{
    $this->publishes([
        __DIR__.'/../config/package.php' => config_path('package.php')
    ], 'config');

    $this->publishes([
        __DIR__.'/../database/migrations/' => database_path('migrations')
    ], 'migrations');
}
```

Ahora tus usuarios pueden publicar estos grupos por separado al hacer referencia a su etiqueta cuando ejecuten el comando `vendor:publish`:

```php
php artisan vendor:publish --tag=config
```