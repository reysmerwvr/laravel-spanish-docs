# Controladores

- [Introducción](#introduction)
- [Controladores Básicos](#basic-controllers)
    - [Definiendo Controladores](#defining-controllers)
    - [Controladores & Espacios de Nombres](#controllers-and-namespaces)
    - [Controladores de Acción Única](#single-action-controllers)
- [Middleware de Controlador](#controller-middleware)
- [Controladores de Recursos](#resource-controllers)
    - [Rutas de Recursos Parciales](#restful-partial-resource-routes)
    - [Nombrando Rutas de Recursos](#restful-naming-resource-routes)
    - [Nombrando Parámetros de Rutas de Recursos](#restful-naming-resource-route-parameters)
    - [Localizando URIs de Recursos](#restful-localizing-resource-uris)
    - [Suplementando Controladores de Recursos](#restful-supplementing-resource-controllers)
- [Inyección de Dependencias & Controladores](#dependency-injection-and-controllers)
- [Cacheando Rutas](#route-caching)

<a name="introduction"></a>
## Introducción

En lugar de definir toda la lógica de manejo de solicitud como Closures en archivos de ruta, puedes desear organizar este comportamiento usando clases Controller. Los controladores pueden agrupar la lógica de manejo de solicitud relacionada dentro de una sola clase. Los controladores son almacenados en el directorio `app/Http/Controllers`.

<a name="basic-controllers"></a>
## Controladores Básicos

<a name="defining-controllers"></a>
### Definiendo Controladores

Debajo está un ejemplo de una clase de controlador básica. Nota que el controlador extiende la clase de controlador base incluida con Laravel. La clase base proporciona unos cuantos métodos de conveniencia tal como el método `middleware`, el cual puede ser usado para conectar un middleware a acciones de controlador:

    <?php

    namespace App\Http\Controllers;

    use App\User;
    use App\Http\Controllers\Controller;

    class UserController extends Controller
    {
        /**
         * Show the profile for the given user.
         *
         * @param  int  $id
         * @return Response
         */
        public function show($id)
        {
            return view('user.profile', ['user' => User::findOrFail($id)]);
        }
    }

Puedes definir una ruta a esta acción de controlador de esta forma:

    Route::get('user/{id}', 'UserController@show');

Ahora, cuando una solicitud coincide con la URI de la ruta especificada, el método `show` de la clase `UserController` será ejecutado. Ciertamente, los parámetros de ruta también serán pasados al método.

> {tip} Los controladores no son **obligatorios** para extender una clase base. Sin embargo, no tendrás acceso a características de conveniencia tales como los métodos `middleware`, `validate`, y `dispatch`.

<a name="controllers-and-namespaces"></a>
### Controladores & Espacios de Nombres

Es muy importante notar que no necesitamos especificar el espacio de nombre completo del controlador al momento de definir la ruta del controlador. Debido a que el `RouteServiceProvider` carga sus archivos de ruta dentro de un grupo de ruta que contiene el espacio de nombre, solamente necesitaremos la porción del nombre de la clase que viene después de la porción `App\Http\Controllers` del espacio de nombre.

Si eliges anidar tus controladores dentro del directorio `App\Http\Controllers`, usa el nombre de clase específico relativo al espacio de nombre raíz `App\Http\Controllers`. Así, si tu clase de controlador completa es `App\Http\Controllers\Photos\AdminController`, deberías registrar rutas al controlador de esta forma:

    Route::get('foo', 'Photos\AdminController@method');

<a name="single-action-controllers"></a>
### Controladores de Acción Única

Si prefieres definir un controlador que maneja solamente una acción única, debes colocar un método `__invoke` único en el controlador:

    <?php

    namespace App\Http\Controllers;

    use App\User;
    use App\Http\Controllers\Controller;

    class ShowProfile extends Controller
    {
        /**
         * Show the profile for the given user.
         *
         * @param  int  $id
         * @return Response
         */
        public function __invoke($id)
        {
            return view('user.profile', ['user' => User::findOrFail($id)]);
        }
    }

Al momento de registrar rutas para controladores de acción única, no necesitarás especificar un método:

    Route::get('user/{id}', 'ShowProfile');

<a name="controller-middleware"></a>
## Middleware de Controlador

Los [Middleware](/docs/{{version}}/middleware) pueden ser asignados a las rutas del controlador en tus archivos de ruta:

    Route::get('profile', 'UserController@show')->middleware('auth');

Sin embargo, es más conveniente especificar los middleware dentro del constructor de tu controlador. Usando el método `middleware` del constructor de tu controlador, puedes asignar fácilmente los middleware a la acción del controlador. Incluso puedes restringir los middleware a sólo ciertos métodos en la clase del controlador:

    class UserController extends Controller
    {
        /**
         * Instantiate a new controller instance.
         *
         * @return void
         */
        public function __construct()
        {
            $this->middleware('auth');

            $this->middleware('log')->only('index');

            $this->middleware('subscribed')->except('store');
        }
    }

También los controladores permiten que registres  los middleware usando una Closure. Esto proporciona una forma conveniente de definir un middleware para un solo controlador sin definir una clase middleware completa:

    $this->middleware(function ($request, $next) {
        // ...

        return $next($request);
    });

> {tip} Puedes asignar los middleware a un subconjunto de acciones de controlador, esto puede indicar que tu controlador está creciendo demasiado. En lugar de esto, considera dividir tu controlador en varios controladores más pequeños.

<a name="resource-controllers"></a>
## Controladores de Recursos

El enrutamiento de recurso de Laravel asigna las rutas típicas "CRUD" a un controlador con una sola línea de código. Por ejemplo, puedes desear crear un controlador que maneje todas las solicitudes HTTP para "fotos" almacenadas por tu aplicación. Usando el comando Artisan `make:controller`, podemos crear fácilmente tal controlador:

    php artisan make:controller PhotoController --resource

Este comando generará un controlador en `app/Http/Controllers/PhotoController.php`. El controlador contendrá un método para cada una de las operaciones de recursos disponibles.

Seguidamente, puedes registrar una ruta de recurso genérica al controlador:

    Route::resource('photos', 'PhotoController');

Esta declaración de ruta única crea varias rutas para manejar una variedad de acciones del recurso. El controlador generado ya tendrá los métodos separados para cada una de las acciones, incluyendo comentarios que te informan de los verbos HTTP y URIs que manejan.

Puedes registrar muchos controladores de recursos a la vez pasando un arreglo al método `resources`:


    Route::resources([
        'photos' => 'PhotoController',
        'posts' => 'PostController'
    ]);

#### Acciones manejadas por el Controlador de Recursos

Tipo      | URI                    | Acción       | Nombre de la Ruta
----------|----------------------- |--------------|---------------------
GET       | `/photos`              | índice       | photos.index
GET       | `/photos/create`       | crear        | photos.create
POST      | `/photos`              | guardar      | photos.store
GET       | `/photos/{photo}`      | mostrar      | photos.show
GET       | `/photos/{photo}/edit` | editar       | photos.edit
PUT/PATCH | `/photos/{photo}`      | actualizar   | photos.update
DELETE    | `/photos/{photo}`      | eliminar     | photos.destroy

#### Especificando el Modelo de Recurso

Si estás usando el enlazamiento de modelo de ruta y prefieres los métodos del controlador de recursos para traspasar una instancia de modelo, puedes usar la opción `--model` al momento de generar el controlador:

    php artisan make:controller PhotoController --resource --model=Photo

#### Suplantando los Métodos de Formulario

Debido a que los formularios no pueden hacer solicitudes `PUT`, `PATCH`, o `DELETE`, necesitarás agregar un campo `_method` oculto para suplantar estos verbos HTTP. El helper `method_field` puede crear este campo para ti:

    {{ method_field('PUT') }}

<a name="restful-partial-resource-routes"></a>
### Rutas de Recursos Parciales

Al momento de declarar una ruta de recurso, puedes especificar un subconjunto de acciones que el controlador debería manejar en lugar de conjunto completo de acciones por defecto.

    Route::resource('photo', 'PhotoController', ['only' => [
        'index', 'show'
    ]]);

    Route::resource('photo', 'PhotoController', ['except' => [
        'create', 'store', 'update', 'destroy'
    ]]);

#### Rutas de Recursos para APIs

Al momento de declarar rutas de recursos que serán consumidas por APIs, normalmente te gustará excluir rutas que presentan plantillas HTML tales como `create` y `edit`. Por conveniencia, puedes usar el método `apiResource` para excluir automáticamente estas dos rutas:

    Route::apiResource('photo', 'PhotoController');

Puedes registrar muchos controladores de recursos de API de una sola vez pasando un arreglo al método `apiResources`:

    Route::apiResources([
        'photos' => 'PhotoController',
        'posts' => 'PostController'
    ]);

<a name="restful-naming-resource-routes"></a>
### Nombrando Rutas de Recursos

De forma predeterminada, todas las acciones de controlador de recursos tienen un nombre de ruta; sin embargo, puedes sobrescribir esos nombres al pasar un arreglo de nombres con tus opciones:

    Route::resource('photo', 'PhotoController', ['names' => [
        'create' => 'photo.build'
    ]]);

<a name="restful-naming-resource-route-parameters"></a>
### Nombrando Parámetros de Rutas de Recursos

De forma predeterminada, `Route::resource` creará los parámetros de ruta para tus rutas de recursos basado en la versión "singularizada" del nombre de recurso. Puedes sobrescribir fácilmente esto para cada recurso pasando `parameters` en el arreglo de opciones. El arreglo de opciones debería ser un arreglo asociativo de nombres de recursos y nombres de parámetros: 

    Route::resource('user', 'AdminUserController', ['parameters' => [
        'user' => 'admin_user'
    ]]);

El ejemplo anterior genera las URIs siguientes para la ruta `show` del recurso:

    /user/{admin_user}

<a name="restful-localizing-resource-uris"></a>
### Localizando URIs de Recursos

De forma predeterminada, `Route::resource` creará URIs de recursos usando verbos en Inglés. Si necesitas localizar los verbos de acción `create` y `edit`, puedes usar el método `Route::resourceVerbs`. Esto puede ser hecho en el método `boot` de tu `AppServiceProvider`:

    use Illuminate\Support\Facades\Route;

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Route::resourceVerbs([
            'create' => 'crear',
            'edit' => 'editar',
        ]);
    }

Una vez que los verbos han sido personalizados, un registro de ruta de recurso tal como `Route::resource('fotos', 'PhotoController')` producirá las siguientes URIs:

    /fotos/crear

    /fotos/{foto}/editar

<a name="restful-supplementing-resource-controllers"></a>
### Suplementando Controladores de Recursos

Si necesitas agregar rutas adicionales para un controlador de recursos más allá del conjunto predeterminado de rutas de recursos, deberías definir esas rutas antes de que ejecutes `Route::resource`; de otra forma, las rutas definidas por el método `resource` pueden tomar precedencia involuntariamente sobre tus rutas suplementarias:

    Route::get('photos/popular', 'PhotoController@method');

    Route::resource('photos', 'PhotoController');

> {tip} Recuerda mantener la lógica de tus controladores enfocada. Si te encuentras a ti mismo necesitando rutinariamente métodos fuera del conjunto típico de acciones de recurso, considera dividir tu controlador en dos controladores más pequeños.

<a name="dependency-injection-and-controllers"></a>
## Inyección de Dependencia & Controladores

#### Inyección de Constructor

El [contenedor de servicio](/docs/{{version}}/container) de Laravel es usado para resolver todos los controladores de Laravel. Como resultado, estás habilitado para adjuntar cualquier dependencia que tu controlador pueda necesitar en su constructor. Las dependencias declaradas serán automáticamente resueltas e inyectadas dentro de la instancia del controlador:

    <?php

    namespace App\Http\Controllers;

    use App\Repositories\UserRepository;

    class UserController extends Controller
    {
        /**
         * The user repository instance.
         */
        protected $users;

        /**
         * Create a new controller instance.
         *
         * @param  UserRepository  $users
         * @return void
         */
        public function __construct(UserRepository $users)
        {
            $this->users = $users;
        }
    }

Ciertamente, también puedes adjuntar cualquier [Contrato de Laravel](/docs/{{version}}/contracts). Si el contenedor puede resolverlo, puedes adjuntarlo. Dependiendo de tu aplicación, inyectar tus dependencias dentro de tu controlador puede proporcionar mejo capacidad para pruebas.

#### Inyección de Métodos

Adicional a la inyección de constructor, también puedes adjuntar dependencias sobre los métodos de tu controlador. Un caso de uso común para la inyección de método está inyectando la instancia `Illuminate\Http\Request` dentro de tus métodos de controlador:

    <?php

    namespace App\Http\Controllers;

    use Illuminate\Http\Request;

    class UserController extends Controller
    {
        /**
         * Store a new user.
         *
         * @param  Request  $request
         * @return Response
         */
        public function store(Request $request)
        {
            $name = $request->name;

            //
        }
    }

Si tu método de controlador también está esperando entrada de un parámetro de ruta, lista tus argumentos de ruta después de tus otras dependencias. Por ejemplo, si tu ruta es definida como esto:

    Route::put('user/{id}', 'UserController@update');

Aún puedes adjuntar la clase `Illuminate\Http\Request` y acceder a tu parámetro `id` al definir tu método de controlador de la siguiente manera:

    <?php

    namespace App\Http\Controllers;

    use Illuminate\Http\Request;

    class UserController extends Controller
    {
        /**
         * Update the given user.
         *
         * @param  Request  $request
         * @param  string  $id
         * @return Response
         */
        public function update(Request $request, $id)
        {
            //
        }
    }

<a name="route-caching"></a>
## Cacheo de Rutas

> {note} Las rutas basadas en Closure no pueden ser cacheadas. Para usar cacheo de rutas, debes convertir cualquiera de las rutas Closure a clases de controlador.

Si tu aplicación está usando exclusivamente rutas basadas en controlador, deberías tomar ventaja del cacheo de rutas de Laravel. Usar la cache de rutas reducirá drásticamente la cantidad de tiempo que toma registrar todas las rutas de tu aplicación. En algunos casos, incluso la rapidez de tu registro de rutas puede llegar a ser hasta 100 veces más rápida.

    php artisan route:cache

Después de ejecutar este comando, tu archivo de rutas cacheado será cargado en cada solicitud. Recuerda, si agregas cualquier ruta nueva necesitarás generar un cache de ruta nuevo. Debido a esto, deberías ejecutar solamente el comando `route:cache` durante la implementación del proyecto.

Puedes usar el comando `route:clear` para limpiar el cache de ruta:

    php artisan route:clear
