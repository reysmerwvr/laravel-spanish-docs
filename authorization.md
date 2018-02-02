# Authorization

- [Introducción](#introduction)
- [Gates](#gates)
    - [Escribiendo Gates](#writing-gates)
    - [Autorizando acciones](#authorizing-actions-via-gates)
- [Creando Policies](#creating-policies)
    - [Generando Policies](#generating-policies)
    - [Registrando Policies](#registering-policies)
- [Escribiendo Policies](#writing-policies)
    - [Métodos de Policy](#policy-methods)
    - [Métodos sin Modelos](#methods-without-models)
    - [Filtros de Policy](#policy-filters)
- [Autorizando acciones usando Policies](#authorizing-actions-using-policies)
    - [Vía el Modelo de Usuario](#via-the-user-model)
    - [Vía Middleware](#via-middleware)
    - [Vía Helpers del Controlador](#via-controller-helpers)
    - [Vía Plantillas de Blade](#via-blade-templates)

<a name="introduction"></a>
## Introducción

Además de proveer servicios de [autenticación](/docs/{{version}}/authentication) por defecto, Laravel además provee una forma simple de autorizar acciones del usuario contra un recurso dado. Como con la autenticación, el enfoque de Laravel para la autorización es simple, y hay dos maneras principales de autorizar acciones: **gates** y **policies**.

Piensa en los gates y policies como rutas y controladores. Los Gates proveen una manera simple, basada en funciones anónimas, para definir las reglas de autorización; mientras que los policies, como los controladores, agrupan la lógica para un modelo o recurso en específico. Vamos a explorar los gates primero y luego los policies.

No necesitas elegir entre el uso exclusivo de gates o de policies cuando construyas una aplicación. Lo más probable es que la mayoría de las aplicaciones contengan una mezcla de gates y de policies ¡Y eso está completamente bien! Los gates son más aplicables a acciones que no estén relacionadas a ningún modelo o recurso, como por ejemplo ver un tablero en el panel de administración. Por otro lado, los policies deberan ser usados cuando desees autorizar una acción para un modelo o recurso en particular.

<a name="gates"></a>
## Gates

<a name="writing-gates"></a>
### Escribiendo Gates

Los gates son funciones anónimas (Closures) que determinan si un usuario está autorizado para ejecutar una acción dada y típicamente son definidos en la clase `App\Providers\AuthServiceProvider` usando el facade `Gate`. Los gates siempre reciben la instancia del usuario conectado como el primer argumento y pueden, opcionalmente, recibir argumentos adicionales que sean relevantes, como por ejemplo un modelo de Eloquent:

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        Gate::define('update-post', function ($user, $post) {
            return $user->id == $post->user_id;
        });
    }

Los gates además pueden ser definidos escribiendo la clase y método a llamar como una cadena de texto `Class@method`, como cuando definimos controladores en las rutas:

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        Gate::define('update-post', 'PostPolicy@update');
    }

#### Gates de Recursos

También puedes definir las habilidades de múltiples gates a la vez usando el método `resource`:

    Gate::resource('posts', 'PostPolicy');

Esto es idéntico a definir los siguientes Gates uno por uno:

    Gate::define('posts.view', 'PostPolicy@view');
    Gate::define('posts.create', 'PostPolicy@create');
    Gate::define('posts.update', 'PostPolicy@update');
    Gate::define('posts.delete', 'PostPolicy@delete');

Por defecto, las habilidades `view`, `create`, `update`, y `delete` serán definidas. Además puedes sobrescribir o agregar a las habilidades por defecto pasando un arreglo como tercer argumento al método `resource`. Las llaves del arreglo definen los nombre de las habilidades mientras que los valores definen los nombres de los métodos. Por ejemplo, el siguiente código creará dos nuevas definiciones de Gate - `posts.image` y `posts.photo`:

    Gate::resource('posts', 'PostPolicy', [
        'image' => 'updateImage',
        'photo' => 'updatePhoto',
    ]);

<a name="authorizing-actions-via-gates"></a>
### Autorizando Acciones

Para autorizar una acción usando gates, deberías usar los métodos `allows` o `denies`. Nota que no necesitas pasar el usuario autenticado cuando llames a estos métodos. Laravel se ocupará de esto por ti de forma automática:

    if (Gate::allows('update-post', $post)) {
        // The current user can update the post...
    }

    if (Gate::denies('update-post', $post)) {
        // The current user can't update the post...
    }

Si quisieras determinar si un usuario en particular está autorizado para ejecutar una acción, puedes llamar al método `forUser` del facade `Gate`:

    if (Gate::forUser($user)->allows('update-post', $post)) {
        // The user can update the post...
    }

    if (Gate::forUser($user)->denies('update-post', $post)) {
        // The user can't update the post...
    }

<a name="creating-policies"></a>
## Creando Policies

<a name="generating-policies"></a>
### Generando Policies

Los policies son clases que organizan la lógica de autorización para un modelo o recurso en particular. Por ejemplo, si tu aplicación es un blog, puedes tener un modelo `Post` con su correspondiente `PostPolicy` para autorizar acciones de usuario como crear o actualizar posts.

Puedes generar un policy usando el comando `make:policy` [artisan command](/docs/{{version}}/artisan). El policy generado será ubicado en el directorio `app/Policies`. Si el directorio no existe en tu aplicación, Laravel lo creará por ti:

    php artisan make:policy PostPolicy

El comando `make:policy` generar una clase de policy vacía. Si quieres generar una clase con los métodos de política para un "CRUD" básico ya incluidos en la clase, puedes especificar la opción `--model` al ejecutar el comando:

    php artisan make:policy PostPolicy --model=Post

> {tip} Todas las políticas son resueltas a través del [contenedor de servicios de Laravel](/docs/{{version}}/container), lo que te permite especificar las dependencias necesarias en el constructor del policy y estas serán automaticamente inyectadas.

<a name="registering-policies"></a>
### Registrando Policies

Una vez que el policy exista, este necesita ser registradoo. La clase `AuthServiceProvider` incluída con las aplicaciones de Laravel contiene una propiedad `policies` que mapea tus modelos de Eloquent a sus policies correspondientes. Registrar un policy le indicará a Laravel qué policy utilizar para autorizar acciones contra un modelo dado:

    <?php

    namespace App\Providers;

    use App\Post;
    use App\Policies\PostPolicy;
    use Illuminate\Support\Facades\Gate;
    use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

    class AuthServiceProvider extends ServiceProvider
    {
        /**
         * The policy mappings for the application.
         *
         * @var array
         */
        protected $policies = [
            Post::class => PostPolicy::class,
        ];

        /**
         * Register any application authentication / authorization services.
         *
         * @return void
         */
        public function boot()
        {
            $this->registerPolicies();

            //
        }
    }

<a name="writing-policies"></a>
## Escribiendo Policies

<a name="policy-methods"></a>
### Métodos Policy

Una vez que el policy haya sido registrado, puedes agregar métodos para cada acción a autorizar. Por ejemplo, vamos a definir un método `update` en nuestro `PostPolicy` para detirminar si un `User` dado puede actualizar una instancia de un `Post`.

El método `update` recibirá una instancia de `User` y de `Post` como sus argumentos y debería retornar `true` o `false` indicando si el usuario está autorizado para actualizar el `Post` o no. En el siguiente ejemplo, vamos a verificar si el `id` del usuario concuerda con el atributo `user_id` del post:

    <?php

    namespace App\Policies;

    use App\User;
    use App\Post;

    class PostPolicy
    {
        /**
         * Determine if the given post can be updated by the user.
         *
         * @param  \App\User  $user
         * @param  \App\Post  $post
         * @return bool
         */
        public function update(User $user, Post $post)
        {
            return $user->id === $post->user_id;
        }
    }

Puedes continuar definiendo métodos adicionales en el policy como sea necesario para las diferentes acciones que este autorice. Por ejemplo, puedes definir métodos `view` o `delete` para autorizar varias acciones de `Post`, pero recuerda que eres libre de darle los nombres que quieras a los métodos del policy.

> {tip} Si usas la opción `--model` cuando generes tu policy con el comando de Artisan, este contendrá métodos para las acciones `view`, `create`, `update` y `delete`.

<a name="methods-without-models"></a>
### Métodos sin Modelos

Algunos métodos de políticas solo reciben el usuario autenticado y no una instancia del modelo que autorizan. Esta situación es común cuando autorizamos acciones `create`. Por ejemplo, si estás creando un blog, puedes querer revisar si un usuario está autorizado para crear nuevos posts o no.

Cuando definas métodos de policy que no recibirán una instancia de otro modelo, así como el método `create`, debes definir el método con el usuario como único parámetro: 

    /**
     * Determine if the given user can create posts.
     *
     * @param  \App\User  $user
     * @return bool
     */
    public function create(User $user)
    {
        //
    }

<a name="policy-filters"></a>
### Filtros de Policy

Es posible que quieras autorizar todas las acciones para algunos usuarios en un policy dado. Para lograr esto, define un método `before` en el policy. El método `before` será ejecutado antes de los otros métodos en el policy, dándote la oportunidad de autorizar la acción antes que el método destinado del policy sea llamado. Esta característica es comunmente usada para otorgar autorización a los administradores de la aplicación para que ejecuten cualquier acción:

    public function before($user, $ability)
    {
        if ($user->isSuperAdmin()) {
            return true;
        }
    }

Si quisieras denegar todas las autorizaciones para un usuario deberías retornar `false` en el método `before`. Si retornas `null`, la decisión de autorización recaerá sobre el método del policy.

> {note} El método `before` de una clase policy no será llamado si la clase no contiene un método con un nombre que concuerde con el nombre de la habilidad siendo revisada.

<a name="authorizing-actions-using-policies"></a>
## Autorizando Acciones Usando Policies

<a name="via-the-user-model"></a>
### Vía el Modelo User

El modelo `User` que se incluye por defecto en tu aplicación de Laravel trae dos métodos para autorizar acciones: `can` y `cant` (puede y no puede). El método `can` acepta el nombre de la acción que deseas autorizar y el modelo relevante. Por ejemplo, vamos a determinar si un usuario está autorizado para actualizar un `Post` dado:

    if ($user->can('update', $post)) {
        //
    }

Si un [policy está registrado](#registering-policies) para el modelo dado, el método `can` automáticamente llamará al policy apropiado y retornará un resultado boleano. Si no se ha registrado un policy para el modelo dado, el método `can` intentará llamar al Gate basado en Closures que coincida con la acción dada.

#### Actions That Don't Require Models

Remember, some actions like `create` may not require a model instance. In these situations, you may pass a class name to the `can` method. The class name will be used to determine which policy to use when authorizing the action:

    use App\Post;

    if ($user->can('create', Post::class)) {
        // Executes the "create" method on the relevant policy...
    }

<a name="via-middleware"></a>
### Via Middleware

Laravel includes a middleware that can authorize actions before the incoming request even reaches your routes or controllers. By default, the `Illuminate\Auth\Middleware\Authorize` middleware is assigned the `can` key in your `App\Http\Kernel` class. Let's explore an example of using the `can` middleware to authorize that a user can update a blog post:

    use App\Post;

    Route::put('/post/{post}', function (Post $post) {
        // The current user may update the post...
    })->middleware('can:update,post');

In this example, we're passing the `can` middleware two arguments. The first is the name of the action we wish to authorize and the second is the route parameter we wish to pass to the policy method. In this case, since we are using [implicit model binding](/docs/{{version}}/routing#implicit-binding), a `Post` model will be passed to the policy method. If the user is not authorized to perform the given action, a HTTP response with a `403` status code will be generated by the middleware.

#### Acciones que no requieren modelos

Como mencionamos antes, algunas acciones como `create` pueden no requerir de una instancia de un modelo. En estas situaciones, puedes pasar el nombre de la clase al middleware. El nombre de la clase será usado para determinar cual política usar para autorizar la acción: 

    Route::post('/post', function () {
        // The current user may create posts...
    })->middleware('can:create,App\Post');

<a name="via-controller-helpers"></a>
### Vía Helpers de Controladores

Además de proveer métodos útiles en el modelo `User`, Laravel también provee un método muy útil llamado `authorize` en cualquier controlador que extienda la clase base `App\Http\Controllers\Controller`. Como el método `can`, este método acepta el nombre de la acción que quieras autorizar y el modelo relevante. Si la acción no es autorizada, el método `authorize` arrojará una excepción de tipo `Illuminate\Auth\Access\AuthorizationException`, la cual será convertida por el manejador de excepciones por defecto de Laravel en una respuesta HTTP con un código `403`:

    <?php

    namespace App\Http\Controllers;

    use App\Post;
    use Illuminate\Http\Request;
    use App\Http\Controllers\Controller;

    class PostController extends Controller
    {
        /**
         * Update the given blog post.
         *
         * @param  Request  $request
         * @param  Post  $post
         * @return Response
         */
        public function update(Request $request, Post $post)
        {
            $this->authorize('update', $post);

            // The current user can update the blog post...
        }
    }
    
Por lo tanto, no necesitas agregar un condicional cuando usas el método `authorize` en el controlador. 

#### Acciones que no requieren modelos

Como hemos discutido previamente, algunas acciones como `create` pueden no requerir una instancia de un modelo. En estas situaciones, puedes pasar el nombre de la clase al método `authorize`. El nombre de la clase determinará la política a usar para autorizar la acción: 

    /**
     * Create a new blog post.
     *
     * @param  Request  $request
     * @return Response
     */
    public function create(Request $request)
    {
        $this->authorize('create', Post::class);

        // The current user can create blog posts...
    }

<a name="via-blade-templates"></a>
### Vía Plantillas de Blade

Cuando escribas plantillas de Blade, puedes querer mostrar una porción de la página solo si el usuario está autorizado para ejecutar una acción determinada. Por ejemplo, puedes querer mostrar un formulario para actualizar un post solo si el usuario puede actuaizar el post. En situaciones así, puedes usar las directivas `@can` y `@cannot`:

    @can('update', $post)
        <!-- The Current User Can Update The Post -->
    @elsecan('create', App\Post::class)
        <!-- The Current User Can Create New Post -->
    @endcan

    @cannot('update', $post)
        <!-- The Current User Can't Update The Post -->
    @elsecannot('create', App\Post::class)
        <!-- The Current User Can't Create New Post -->
    @endcannot

Estas directivas son accesos directos convenientes para no tener que escribir sentencias `@if` y `@unless`. Las sentencias `@can` y `@cannot` de arriba son equivalentes a las siguientes sentencias, respectivamente:

    @if (Auth::user()->can('update', $post))
        <!-- The Current User Can Update The Post -->
    @endif

    @unless (Auth::user()->can('update', $post))
        <!-- The Current User Can't Update The Post -->
    @endunless

#### Acciones que no requieren modelos

Así como otros métodos de autorización, puedes pasar el nombre de una clase a las directivas `@can` y `@cannot` si la acción no requiere una instancia de un modelo:

    @can('create', App\Post::class)
        <!-- The Current User Can Create Posts -->
    @endcan

    @cannot('create', App\Post::class)
        <!-- The Current User Can't Create Posts -->
    @endcannot
