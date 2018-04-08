# Vistas

- [Creando Vistas](#creating-views)
- [Pasando Datos a las Vistas](#passing-data-to-views)
    - [Compartiendo Datos con Todas las Vistas](#sharing-data-with-all-views)
- [Compositores de Vistas](#view-composers)

<a name="creating-views"></a>
## Creando Vistas

> {tip} Para buscar más información sobre ¿Cómo escribir plantillas de Blade? Revisa la [documentación de Blade](/docs/{{version}}/blade) completa para empezar.

Las vistas contienen el HTML servido por tu aplicación y separa la lógica de tu controlador / aplicación de tu lógica de tu presentación. Las vistas son almacenadas en el directorio `resources/views`. Una vista sencilla podría lucir como esta:

    <!-- View stored in resources/views/greeting.blade.php -->

    <html>
        <body>
            <h1>Hello, {{ $name }}</h1>
        </body>
    </html>

Ya que esta vista es almacenada en `resources/views/greeting.blade.php`, podemos devolverla usando el helper global `view` como sigue:

    Route::get('/', function () {
        return view('greeting', ['name' => 'James']);
    });

Como puedes ver, el primer argumento pasado al helper `view` corresponde al nombre del archivo de la vista en el directorio `resources/views`. El segundo argumento es un array de datos que debería estar disponible para la vista. En este caso, estamos pasando la variable `name`, la cual es mostrada en la vista usando [sintaxis de Blade](/docs/{{version}}/blade).

Ciertamente, las vistas también pueden estar anidadas dentro de sub-directorios del directorio `resources/views`. La notación de "Punto" puede ser usada para referenciar vistas anidadas. Por ejemplo, si tu vista es almacenada en `resources/views/admin/profile.blade.php`, puedes referenciarla como sigue:

    return view('admin.profile', $data);

#### Determinando Si una Vista Existe

Si necesitas determinar si una vista existe, puedes usar la clase facade `View`. El método `exists` devolverá `true` si la vista existe:

    use Illuminate\Support\Facades\View;

    if (View::exists('emails.customer')) {
        //
    }

#### Creando la Primera Vista Disponible

Usando el método `first`, puedes crear la primera vista que existe en un arreglo dado de vistas. Esto es útli si tu aplicación o paquete permite que las vistas sean personalizadas o sobreescritas:

    return view()->first(['custom.admin', 'admin'], $data);

Ciertamente, también puedes ejecutar este método por medio de la clase [facade](/docs/{{version}}/facades) `View`:

    use Illuminate\Support\Facades\View;

    return View::first(['custom.admin', 'admin'], $data);

<a name="passing-data-to-views"></a>
## Pasando Datos a las Vistas

Como viste en los ejemplos previos, puedes pasar un arreglo de datos a las vistas:

    return view('greetings', ['name' => 'Victoria']);

Al momento de pasar información de esta manera, los datos deberían ser un arreglo con pares clave / valor. Dentro de tu vista, entonces puedes acceder a cada valor usando su correspondiente clave, tal como `<?php echo $key; ?>`. Como una alternativa a pasar un arreglo completo de datos a la función helper `view`, puedes usar el método `with` para agregar partes individuales de datos a la vista:

    return view('greeting')->with('name', 'Victoria');

<a name="sharing-data-with-all-views"></a>
#### Compartiendo Datos con Todas las Vistas

Ocasionalmente, puedes necesitar compartir una pieza de datos con todas las vistas que son renderizadas por tu aplicación. Puedes hacer eso usando el método `share` de la clase facade de vista. Típicamente, deberías colocar las ejecuciones a `share` dentro del método `boot` de un proveedor de servicio. Eres libre de agregarlos al `AppServiceProvider` o generar un proveedor de servicio diferente para alojarlos:

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

<a name="view-composers"></a>
## Compositores de Vista

Los compositores de vista son funciones de retorno o métodos de clase que son ejecutados cuando una vista es renderizada. Si tienes datos que quieres que estén enlazados a una vista cada vez que la vista es renderizada, un compositor de vistas puede ayudarte a organizar esa lógica dentro de una sola ubicación.

Para este ejemplo, vamos a registrar los compositores de vista dentro de un [proveedor de servicio](/docs/{{version}}/providers). Usaremos la clase facade `View` para acceder a la implementación de contrato `Illuminate\Contracts\View\Factory` subyacente. Recuerda, Laravel no incluye un directorio predeterminado para los compositores de vista. Eres libre de organizarlos del modo que desees. Por ejemplo, podrías crear un directorio `app/Http/ViewComposers`:

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
                'profile', 'App\Http\ViewComposers\ProfileComposer'
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

> {note} Recuerda, si creas un nuevo proveedor de servicio para contener tus registros de compositor de vista, necesitarás agregar el proveedor de servicio al arreglo `providers` en el archivo de configuración `config/app.php`.

Ahora que hemos registrado el compositor, el método `ProfileComposer@compose` será ejecutado cada vez que la vista `profile` está siendo renderizada. Así que, vamos a definir la clase composer:

    <?php

    namespace App\Http\ViewComposers;

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

Justo antes de que la vista sea renderizada, el método `compose` del compositor es ejecutado con la instancia `Illuminate\View\View`. Puedes usar el método `with` para enlazar datos a la vista.

> {tip} Todos los compositores de vista son resueltos por medio del [contenedor de servicio](/docs/{{version}}/container), de modo que puedas colocar la referencia a cualquiera de las dependencias que necesites dentro de un constructor del compositor.

#### Adjuntando un Compositor a Múltiples Vistas

Puedes adjuntar un compositor de vista a múltiples vistas de una vez al pasar un arreglo de vistas como primer argumento del método `composer`:

    View::composer(
        ['profile', 'dashboard'],
        'App\Http\ViewComposers\MyViewComposer'
    );

El método `composer` también acepta el caracter `*` como un comodín, permitiendo que adjuntes un compositor a todas las vistas:

    View::composer('*', function ($view) {
        //
    });

#### View Creators

**Los creadores** de vista son muy similares a los compositores de vista; sin embargo, son ejecutados inmediatamente después que la vista es instanciada en lugar de esperar hasta que la vista esté cercana a renderizar. Para registrar una creador de vista, usa el método `creator`:

    View::creator('profile', 'App\Http\ViewCreators\ProfileCreator');
