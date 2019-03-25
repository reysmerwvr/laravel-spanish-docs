::: v-pre

# Vistas

- [Creando Vistas](#creating-views)
- [Pasando Datos a las Vistas](#passing-data-to-views)
    - [Compartiendo Datos con Todas las Vistas](#sharing-data-with-all-views)
- [View Composers](#view-composers)

<a name="creating-views"></a>
## Creando Vistas

::: tip 
Para buscar más información sobre ¿Cómo escribir plantillas de Blade? Revisa la [documentación de Blade](/docs/{{version}}/blade) completa para comenzar.
:::

Las vistas contienen el HTML servido por tu aplicación y separa la lógica de tu controlador/aplicación de la lógica de presentación. Las vistas son almacenadas en el directorio `resources/views`. Una vista sencilla podría lucir de esta forma:

```php
<!-- View stored in resources/views/greeting.blade.php -->

<html>
    <body>
        <h1>Hello, {{ $name }}</h1>
    </body>
</html>
```

Ya que esta vista es almacenada en `resources/views/greeting.blade.php`, podemos devolverla usando el helper global `view`, de la siguiente forma:

```php
Route::get('/', function () {
    return view('greeting', ['name' => 'James']);
});
```

Como puedes ver, el primer argumento pasado al helper `view` corresponde al nombre del archivo de la vista en el directorio `resources/views`. El segundo argumento es un arreglo de datos que debería estar disponible para la vista. En este caso, estamos pasando la variable `name`, la cual es mostrada en la vista usando la [sintaxis de Blade](/docs/{{version}}/blade).

Las vistas también pueden estar anidadas dentro de sub-directorios del directorio `resources/views`. La notación de "Punto" puede ser usada para referenciar vistas anidadas. Por ejemplo, si tu vista está almacenada en `resources/views/admin/profile.blade.php`, puedes hacer referencia a esta de la siguiente forma:

```php
return view('admin.profile', $data);
```

#### Determinando Si una Vista Existe

Si necesitas determinar si una vista existe, puedes usar la clase facade `View`. El método `exists` devolverá `true` si la vista existe:

```php
use Illuminate\Support\Facades\View;

if (View::exists('emails.customer')) {
    //
}
```

#### Creando la Primera Vista Disponible

Usando el método `first`, puedes crear la primera vista que existe en un arreglo de vistas dado. Esto es útil si tu aplicación o paquete permite que las vistas sean personalizadas o sobrescritas:

```php
return view()->first(['custom.admin', 'admin'], $data);
```

También puedes ejecutar este método por medio de la clase [facade](/docs/{{version}}/facades) `View`:

```php
use Illuminate\Support\Facades\View;

return View::first(['custom.admin', 'admin'], $data);
```

<a name="passing-data-to-views"></a>
## Pasando Datos a las Vistas

Como viste en los ejemplos previos, puedes pasar un arreglo de datos a las vistas:

```php
return view('greetings', ['name' => 'Victoria']);
```

Al momento de pasar información de esta manera, los datos deberían ser un arreglo con pares clave / valor. Dentro de tu vista, entonces puedes acceder a cada valor usando su clave correspondiente, tal como `<?php echo $key; ?>`. Como una alternativa a pasar un arreglo completo de datos a la función helper `view`, puedes usar el método `with` para agregar partes individuales de datos a la vista:

```php
return view('greeting')->with('name', 'Victoria');
```

<a name="sharing-data-with-all-views"></a>
#### Compartiendo Datos con Todas las Vistas

Ocasionalmente, puedes necesitar compartir una pieza de datos con todas las vistas que son renderizadas por tu aplicación. Puedes hacer eso usando el método `share` de la clase facade `View`. Típicamente, deberías colocar las ejecuciones a `share` dentro del método `boot` de un proveedor de servicio. Eres libre de agregarlos al `AppServiceProvider` o generar un proveedor de servicio diferente para alojarlos:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\View;

class AppServiceProvider extends ServiceProvider
{
    /**
    * Bootstrap any application services.
    *
    * @return void
    */
    public function boot()
    {
        View::share('key', 'value');
    }

    /**
    * Register the service provider.
    *
    * @return void
    */
    public function register()
    {
        //
    }
}
```

<a name="view-composers"></a>
## View Composers

Los view composers son funciones de retorno o métodos de clase que son ejecutados cuando una vista es renderizada. Si tienes datos que quieres que estén enlazados a una vista cada vez que la vista es renderizada, un view composer puede ayudarte a organizar esa lógica dentro de una sola ubicación.

Para este ejemplo, vamos a registrar los View Composers dentro de un [proveedor de servicio](/docs/{{version}}/providers). Usaremos la clase facade `View` para acceder a la implementación de contrato `Illuminate\Contracts\View\Factory` subyacente. Recuerda, Laravel no incluye un directorio predeterminado para los View Composers. Eres libre de organizarlos del modo que desees. Por ejemplo, podrías crear un directorio `app/Http/View/Composers`:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class ComposerServiceProvider extends ServiceProvider
{
    /**
    * Register bindings in the container.
    *
    * @return void
    */
    public function boot()
    {
        // Using class based composers...
        View::composer(
            'profile', 'App\Http\View\Composers\ProfileComposer'
        );

        // Using Closure based composers...
        View::composer('dashboard', function ($view) {
            //
        });
    }

    /**
    * Register the service provider.
    *
    * @return void
    */
    public function register()
    {
        //
    }
}
```

::: note
Recuerda, si creas un nuevo proveedor de servicio para contener tus registros de View Composers, necesitarás agregar el proveedor de servicio al arreglo `providers` en el archivo de configuración `config/app.php`.
:::

Ahora que hemos registrado el Composer, el método `ProfileComposer@compose` será ejecutado cada vez que la vista `profile` esté siendo renderizada. Así que, vamos a definir la clase composer:

```php
<?php

namespace App\Http\View\Composers;

use Illuminate\View\View;
use App\Repositories\UserRepository;

class ProfileComposer
{
    /**
    * The user repository implementation.
    *
    * @var UserRepository
    */
    protected $users;

    /**
    * Create a new profile composer.
    *
    * @param  UserRepository  $users
    * @return void
    */
    public function __construct(UserRepository $users)
    {
        // Dependencies automatically resolved by service container...
        $this->users = $users;
    }

    /**
    * Bind data to the view.
    *
    * @param  View  $view
    * @return void
    */
    public function compose(View $view)
    {
        $view->with('count', $this->users->count());
    }
}
```

Justo antes de que la vista sea renderizada, el método `compose` del Composer es ejecutado con la instancia `Illuminate\View\View`. Puedes usar el método `with` para enlazar datos a la vista.

::: tip
Todos los View Composers son resueltos por medio del [contenedor de servicio](/docs/{{version}}/container), de modo que puedas colocar la referencia a cualquiera de las dependencias que necesites dentro de un constructor del Composer.
:::

#### Adjuntando un Composer a Múltiples Vistas

Puedes adjuntar un View Composer a múltiples vistas de una vez al pasar un arreglo de vistas como primer argumento del método `composer`:

```php
View::composer(
    ['profile', 'dashboard'],
    'App\Http\View\Composers\MyViewComposer'
);
```

El método `composer` también acepta el caracter `*` como un comodín, permitiendo que adjuntes un Composer a todas las vistas:

```php
View::composer('*', function ($view) {
    //
});
```

#### View Creators

**View Creators** (creadores de vistas) son muy similares a los View Composers; sin embargo, son ejecutados inmediatamente después de que la vista sea instanciada en lugar de esperar hasta que la vista sea renderizada. Para registrar un View Creator, usa el método `creator`:

```php
View::creator('profile', 'App\Http\View\Creators\ProfileCreator');
```