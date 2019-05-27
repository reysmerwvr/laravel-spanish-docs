::: v-pre

# Proveedores de Servicios

- [Introducción](#introduction)
- [Escribiendo Proveedores de Servicios](#writing-service-providers)
    - [Método Register](#the-register-method)
    - [Método Boot](#the-boot-method)
- [Registrando Proveedores](#registering-providers)
- [Proveedores Diferidos](#deferred-providers)

<a name="introduction"></a>
## Introducción

Los proveedores de servicios son la parte central de la maquetación de una aplicación Laravel. Tu propia aplicación, así como todos los servicios principales de Laravel son maquetados usando proveedores de servicios.

Pero, ¿qué queremos decir por "maquetación"? En general, nos referimos a **registrar** cosas, incluyendo registrar enlaces de contenedores de servicios, listeners de eventos, middleware e incluso rutas. Los proveedores de servicios son el lugar principal para configurar tu aplicación.

Si abres el archivo `config/app.php` incluido con Laravel, verás un arreglo `providers`. Estos son todos los proveedores de servicio que serán cargados para tu aplicación. Observa que muchos de éstos son proveedores "diferidos", lo que significa que no serán cargados en cada solicitud, sino sólo cuando los servicios que proporcionan sean necesarios.

En este resumen aprendarás a escribir tus propios proveedores de servicio y registrarlos en tu aplicación de Laravel. 

<a name="writing-service-providers"></a>
## Escribiendo Proveedores de Servicios

Todos los proveedores de servicios extienden de la clase `Illuminate\Support\ServiceProvider`. La mayoría de los proveedores de servicio contienen un método `register` y `boot`. Dentro del método `register`, debes **enlazar cosas sólo al [contenedor de servicios](/docs/5.8/container)**. Nunca debes tratar de registrar ningún listener de eventos, rutas o cualquier otra pieza de funcionalidad dentro del método `register`.

La línea de comandos Artisan puede generar un nuevo proveedor mediante el comando `make:provider`:

```php
php artisan make:provider RiakServiceProvider
```

<a name="the-register-method"></a>
### Método Register

Como mencionamos anteriormente, dentro del método `register`, debes sólo enlazar cosas al [contenedor de servicio](/docs/5.8/container). Nunca debes intentar registrar ningún listener de eventos, rutas o cualquier otra pieza de funcionalidad dentro del método `register`. De lo contrario, puedes accidentalmente usar un servicio que es proporcionado por un proveedor de servicio que no aún no  se ha cargado.

Vamos a echar un vistazo a un proveedor de servicio básico. Dentro de cualquiera de los métodos de tu proveedor de servicios, siempre tienes acceso a la propiedad `$app` que proporciona acceso al contenedor de servicios:

```php
<?php

namespace App\Providers;

use Riak\Connection;
use Illuminate\Support\ServiceProvider;

class RiakServiceProvider extends ServiceProvider
{
    /**
    * Register bindings in the container.
    *
    * @return void
    */
    public function register()
    {
        $this->app->singleton(Connection::class, function ($app) {
            return new Connection(config('riak'));
        });
    }
}
```

Este proveedor de servicios sólo define un método `register` y usa dicho método para definir una implementación de `Riak\Connection` en el contenedor de servicios. Si no entiendes cómo el contenedor de servicios funciona, revisa [su documentación](/docs/5.8/container).

#### Propiedades `bindings` y `singletons`

Si tu proveedor de servicios registra muchos bindings simples, puedes querer usar las propiedades `bindings` y `singletons` en lugar de manualmente registrar cada binding de contenedor. Cuando el proveedor de servicios es cargado por el framework, automáticamente comprobará dichas propiedades y registrará sus bindings:

```php
<?php

namespace App\Providers;

use App\Contracts\ServerProvider;
use App\Contracts\DowntimeNotifier;
use Illuminate\Support\ServiceProvider;
use App\Services\PingdomDowntimeNotifier;
use App\Services\DigitalOceanServerProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
    * All of the container bindings that should be registered.
    *
    * @var array
    */
    public $bindings = [
        ServerProvider::class => DigitalOceanServerProvider::class,
    ];

    /**
    * All of the container singletons that should be registered.
    *
    * @var array
    */
    public $singletons = [
        DowntimeNotifier::class => PingdomDowntimeNotifier::class,
    ];
}
```

<a name="the-boot-method"></a>
### Método Boot

Entonces, ¿qué sucede si necesitamos registrar un [view composer](/docs/5.8/views#view-composers) dentro de nuestro proveedor de servicios? Esto debería ser hecho dentro del método `boot`. **Este método es llamado luego de que todos los demás proveedores de servicio sean registrados**, lo que quiere decir que tienes acceso a todos los demás proveedores de servicio que han sido registrados por el framework:

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class ComposerServiceProvider extends ServiceProvider
{
    /**
    * Bootstrap any application services.
    *
    * @return void
    */
    public function boot()
    {
        view()->composer('view', function () {
            //
        });
    }
}
```

#### Inyección de Dependencias en el Método Boot

Puedes escribir manualmente las dependencias para el método `boot` de tu proveedor de servicios. El [contenedor de servicios](/docs/5.8/container) inyectará automáticamente cualquier dependencia que necesites:

```php
use Illuminate\Contracts\Routing\ResponseFactory;

public function boot(ResponseFactory $response)
{
    $response->macro('caps', function ($value) {
        //
    });
}
```

<a name="registering-providers"></a>
## Registrando Proveedores

Todos los proveedores de servicios son registrados en el archivo de configuración `config/app.php`. Este archivo contiene un arreglo `providers` donde puedes listar los nombres de clase de tus proveedores de servicios. Por defecto, una serie de proveedores de servicios principales de Laravel son listados en este arreglo. Estos proveedores maquetan los componentes principales de Laravel, como mailer, queue, cache entre otros.

Para registrar tu proveedor, agregalo al arreglo:

```php
'providers' => [
    // Other Service Providers

    App\Providers\ComposerServiceProvider::class,
],
```

<a name="deferred-providers"></a>
## Proveedores Diferidos

Si tu proveedor **sólo** está registrando enlaces en el [contenedor de servicios](/docs/5.8/container), puedes elegir diferir su registro hasta que uno de los enlaces registrados sea necesario. Diferir la carga de dicho proveedor mejorará el rendimiento de tu aplicación, ya que no es cargado desde el sistema de archivos en cada solicitud.

Laravel compila y almacena una lista de todos los servicios suministrados por proveedores de servicios diferidos, junto con el nombre de clase de su proveedor de servicio. Luego, sólo cuando intentas resolver uno de estos servicios Laravel carga el proveedor de servicio.

Para diferir la carga de un proveedor, Implementa la interfaz `\Illuminate\Contracts\Support\DeferrableProvider` y define un método `provides`. El método `provides` debe retornar los enlaces del contenedor de servicio registrados por el proveedor:

```php
<?php

namespace App\Providers;

use Riak\Connection;
use Illuminate\Support\ServiceProvider;
use Illuminate\Contracts\Support\DeferrableProvider;

class RiakServiceProvider extends ServiceProvider implements DeferrableProvider
{
    /**
    * Register the service provider.
    *
    * @return void
    */
    public function register()
    {
        $this->app->singleton(Connection::class, function ($app) {
            return new Connection($app['config']['riak']);
        });
    }

    /**
    * Get the services provided by the provider.
    *
    * @return array
    */
    public function provides()
    {
        return [Connection::class];
    }
}
```