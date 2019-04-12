::: v-pre

# Autorización

- [Introducción](#introduction)
- [Gates](#gates)
    - [Escribiendo Gates](#writing-gates)
    - [Autorizando acciones](#authorizing-actions-via-gates)
    - [Interceptando Comprobaciones De Gates](#intercepting-gate-checks)
- [Creando Políticas](#creating-policies)
    - [Generando Políticas](#generating-policies)
    - [Registrando Políticas](#registering-policies)
- [Escribiendo Políticas](#writing-policies)
    - [Métodos de Política](#policy-methods)
    - [Métodos sin Modelos](#methods-without-models)
    - [Usuarios Invitados](#guest-users)
    - [Filtros de Política](#policy-filters)
- [Autorizando acciones usando Políticas](#authorizing-actions-using-policies)
    - [Vía el Modelo de Usuario](#via-the-user-model)
    - [Vía Middleware](#via-middleware)
    - [Vía Helpers del Controlador](#via-controller-helpers)
    - [Vía Plantillas de Blade](#via-blade-templates)

<a name="introduction"></a>
## Introducción

Además de proveer servicios de [autenticación](/docs/{{version}}/authentication) por defecto, Laravel además provee una forma simple de autorizar acciones del usuario contra un recurso dado. Como con la autenticación, el enfoque de Laravel para la autorización es simple, y hay dos maneras principales de autorizar acciones: **gates** y **policies** (puertas y políticas).

Piensa en los gates y políticas como rutas y controladores. Los Gates proveen una manera simple, basada en funciones anónimas, para definir las reglas de autorización; mientras que las políticas, como los controladores, agrupan la lógica para un modelo o recurso en específico. Vamos a explorar los gates primero y luego las políticas.

No necesitas elegir entre el uso exclusivo de gates o de políticas cuando construyas una aplicación. Lo más probable es que la mayoría de las aplicaciones contengan una mezcla de gates y de políticas ¡Y eso está completamente bien! Los gates son más aplicables a acciones que no estén relacionadas a ningún modelo o recurso, como por ejemplo ver un tablero en el panel de administración. Por otro lado, las políticas deberan ser usadas cuando desees autorizar una acción para un modelo o recurso en particular.

<a name="gates"></a>
## Gates

<a name="writing-gates"></a>
### Escribiendo Gates

Los gates son funciones anónimas (Closures) que determinan si un usuario está autorizado para ejecutar una acción dada y típicamente son definidos en la clase `App\Providers\AuthServiceProvider` usando el facade `Gate`. Los gates siempre reciben la instancia del usuario conectado como el primer argumento y pueden, opcionalmente, recibir argumentos adicionales que sean relevantes, como por ejemplo un modelo de Eloquent:

```php
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
```

Los gates además pueden ser definidos escribiendo la clase y método a llamar como una cadena de texto `Class@method`, como cuando definimos controladores en las rutas:

```php
/**
* Register any authentication / authorization services.
*
* @return void
*/
public function boot()
{
    $this->registerPolicies();

    Gate::define('update-post', 'App\Policies\PostPolicy@update');
}
```

#### Gates de Recursos

También puedes definir las habilidades de múltiples gates a la vez usando el método `resource`:

```php
Gate::resource('posts', 'App\Policies\PostPolicy');
```

Esto es idéntico a definir los siguientes Gates uno por uno:

```php
Gate::define('posts.view', 'App\Policies\PostPolicy@view');
Gate::define('posts.create', 'App\Policies\PostPolicy@create');
Gate::define('posts.update', 'App\Policies\PostPolicy@update');
Gate::define('posts.delete', 'App\Policies\PostPolicy@delete');
```

Por defecto, las habilidades `view`, `create`, `update`, y `delete` serán definidas. Además puedes sobrescribir las habilidades por defecto pasando un arreglo como tercer argumento al método `resource`. Las llaves del arreglo definen los nombre de las habilidades mientras que los valores definen los nombres de los métodos. Por ejemplo, el siguiente código creará dos nuevas definiciones de Gate - `posts.image` y `posts.photo`:

```php
Gate::resource('posts', 'PostPolicy', [
    'image' => 'updateImage',
    'photo' => 'updatePhoto',
]);
```

<a name="authorizing-actions-via-gates"></a>
### Autorizando Acciones

Para autorizar una acción usando gates, deberías usar los métodos `allows` o `denies`. Nota que no necesitas pasar el usuario autenticado cuando llames a estos métodos. Laravel se ocupará de esto por ti de forma automática:

```php
if (Gate::allows('update-post', $post)) {
    // The current user can update the post...
}

if (Gate::denies('update-post', $post)) {
    // The current user can't update the post...
}
```

Si quisieras determinar si un usuario en particular está autorizado para ejecutar una acción, puedes llamar al método `forUser` del facade `Gate`:

```php
if (Gate::forUser($user)->allows('update-post', $post)) {
    // The user can update the post...
}

if (Gate::forUser($user)->denies('update-post', $post)) {
    // The user can't update the post...
}
```

<a name="intercepting-gate-checks"></a>
#### Interceptando Comprobaciones De Gates

Algunas veces, puedes querer otorgar todas las habilidades a un usuario en especifico. Puedes usar el método `before` para definir un callback que es ejecutado antes de todas las demás comprobaciones de autorización:

```php
Gate::before(function ($user, $ability) {
    if ($user->isSuperAdmin()) {
        return true;
    }
});
```

Si el callback `before` retorna un resultado que no es null dicho resultado será considerado el resultado de la comprobación.

Puedes usar el método `after` para definir un callback que será ejecutado luego de todas las demás comprobaciones de autorización:

```php
Gate::after(function ($user, $ability, $result, $arguments) {
    if ($user->isSuperAdmin()) {
        return true;
    }
});
```

Similar a la comprobación `before`, si el callback `after` retorna un resultado que no sea null dicho resultado será considerado el resultado de la comprobación.

<a name="creating-policies"></a>
## Creando Políticas

<a name="generating-policies"></a>
### Generando Políticas

Los políticas son clases que organizan la lógica de autorización para un modelo o recurso en particular. Por ejemplo, si tu aplicación es un blog, puedes tener un modelo `Post` con su correspondiente `PostPolicy` para autorizar acciones de usuario como crear o actualizar posts.

Puedes generar una política usando el comando `make:policy` [artisan command](/docs/{{version}}/artisan). La política generada será ubicada en el directorio `app/Policies`. Si el directorio no existe en tu aplicación, Laravel lo creará por ti:

```php
php artisan make:policy PostPolicy
```

El comando `make:policy` generar una clase de política vacía. Si quieres generar una clase con los métodos de política para un "CRUD" básico ya incluidos en la clase, puedes especificar la opción `--model` al ejecutar el comando:

```php
php artisan make:policy PostPolicy --model=Post
```

::: tip
Todas las políticas son resueltas a través del [contenedor de servicios de Laravel](/docs/{{version}}/container), lo que te permite especificar las dependencias necesarias en el constructor de la política y estas serán automaticamente inyectadas.
:::

<a name="registering-policies"></a>
### Registrando Políticas

Una vez que la política exista, ésta necesita ser registrada. La clase `AuthServiceProvider` incluída con las aplicaciones de Laravel contiene una propiedad `policies` que mapea tus modelos de Eloquent a sus políticas correspondientes. Registrar una política le indicará a Laravel qué política utilizar para autorizar acciones contra un modelo dado:

```php
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
```

#### Política De Auto-Descubrimiento

En lugar de registrar manualmente politicas de modelos, Laravel puede auto-descubrir politicas siempre y cuando el modelo y la politica sigan la convención de nombre estándar de Laravel. Especificamente, las politicas deben estar en un directorio `Policies` dentro del directorio que contiene los modelos. Así que, por ejemplo, los modelos pueden ser ubicados en el directorio `app` mientras que las politicas pueden tener un sufijo. Así que, un modelo `User` corresponderá a una clase `UserPolicy`.

Si te gustaría proporcionar tu propia lógica para descubrir politicas, puedes registar un callback personalizado usando el método `Gate::guessPolicyNamesUsing`. Típicamente, este método debe ser llamado desde el método `boot` del `AuthServiceProvider` de tu aplicación:

```php
use Illuminate\Support\Facades\Gate;

Gate::guessPolicyNamesUsing(function ($modelClass) {
    // return policy class name...
});
```

::: danger Nota
Cualquier politica que está explicitamente mapeada en tu `AuthServiceProvider` tendrá precendencia sobre cualquier posible politica auto-descubierta.
:::

<a name="writing-policies"></a>
## Escribiendo Políticas

<a name="policy-methods"></a>
### Métodos de Política

Una vez que la política haya sido registrada, puedes agregar métodos para cada acción a autorizar. Por ejemplo, vamos a definir un método `update` en nuestro `PostPolicy` para detirminar si un `User` dado puede actualizar una instancia de un `Post`.

El método `update` recibirá una instancia de `User` y de `Post` como sus argumentos y debería retornar `true` o `false` indicando si el usuario está autorizado para actualizar el `Post` o no. En el siguiente ejemplo, vamos a verificar si el `id` del usuario concuerda con el atributo `user_id` del post:

```php
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
```

Puedes continuar definiendo métodos adicionales en la política como sea necesario para las diferentes acciones que esté autorice. Por ejemplo, puedes definir métodos `view` o `delete` para autorizar varias acciones de `Post`, pero recuerda que eres libre de darle los nombres que quieras a los métodos de la política.

::: tip
Si usas la opción `--model` cuando generes tu política con el comando de Artisan, éste contendrá métodos para las acciones `view`, `create`, `update`, `delete`, `restore` y `forceDelete`.
:::

<a name="methods-without-models"></a>
### Métodos sin Modelos

Algunos métodos de políticas solo reciben el usuario autenticado y no una instancia del modelo que autorizan. Esta situación es común cuando autorizamos acciones `create`. Por ejemplo, si estás creando un blog, puedes querer revisar si un usuario está autorizado para crear nuevos posts o no.

Cuando definas métodos de política que no recibirán una instancia de otro modelo, así como el método `create`, debes definir el método con el usuario como único parámetro: 

```php
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
```

<a name="guest-users"></a>
### Usuarios Invitados

Por defecto, todos los gates y políticas automáticamente retornan `false` si la petición HTTP entrante no fue iniciada por un usuario autenticado. Sin embargo, puedes permitir que estas comprobaciones de autorización sean pasadas a tus gates y políticas con una declaración de tipo "opcional" o suministrando un valor por defecto `null` para la definición del argumento de usuario:

```php
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
    public function update(?User $user, Post $post)
    {
        return $user->id === $post->user_id;
    }
}
```

<a name="policy-filters"></a>
### Filtros de Política

Es posible que quieras autorizar todas las acciones para algunos usuarios en un política dada. Para lograr esto, define un método `before` en la política. El método `before` será ejecutado antes de los otros métodos en la política, dándote la oportunidad de autorizar la acción antes que el método destinado de la política sea llamado. Esta característica es comunmente usada para otorgar autorización a los administradores de la aplicación para que ejecuten cualquier acción:

```php
public function before($user, $ability)
{
    if ($user->isSuperAdmin()) {
        return true;
    }
}
```

Si quisieras denegar todas las autorizaciones para un usuario deberías retornar `false` en el método `before`. Si retornas `null`, la decisión de autorización recaerá sobre el método de la política.

::: danger Nota
El método `before` de una clase política no será llamado si la clase no contiene un método con un nombre que concuerde con el nombre de la habilidad siendo revisada.
:::

<a name="authorizing-actions-using-policies"></a>
## Autorizando Acciones Usando Políticas

<a name="via-the-user-model"></a>
### Vía el Modelo User

El modelo `User` que se incluye por defecto en tu aplicación de Laravel trae dos métodos para autorizar acciones: `can` y `cant` (puede y no puede). El método `can` acepta el nombre de la acción que deseas autorizar y el modelo relevante. Por ejemplo, vamos a determinar si un usuario está autorizado para actualizar un `Post` dado:

```php
if ($user->can('update', $post)) {
    //
}
```

Si una [política está registrado](#registering-policies) para el modelo dado, el método `can` automáticamente llamará a la política apropiada y retornará un resultado boleano. Si no se ha registrado una política para el modelo dado, el método `can` intentará llamar al Gate basado en Closures que coincida con la acción dada.

#### Acciones que no requieren modelos

Recuerda, algunas acciones como `create` pueden no requerir de la instancia de un modelo. En estas situaciones, puedes pasar el nombre de una clase al método `can`. El nombre de la clase ser usado para determinar cuál política usar cuando se autorice la acción:

```php
use App\Post;

if ($user->can('create', Post::class)) {
    // Executes the "create" method on the relevant policy...
}
```

<a name="via-middleware"></a>
### Vía Middleware

Laravel incluye un middleware que puede autorizar acciones antes de que la petición entrante alcance tus rutas o controladores. Por defecto, el middleware `Illuminate\Auth\Middleware\Authorize` es asignado a la llave `can` de tu clase `App\Http\Kernel`. Vamos a explorar un ejemplo usando el middleware `can` para autorizar que un usuario pueda actualizar un post de un blog:

```php
use App\Post;

Route::put('/post/{post}', function (Post $post) {
    // The current user may update the post...
})->middleware('can:update,post');
```

En este ejemplo, estamos pasando al middleware `can` dos argumentos, el primero es el nombre de la acción que deseamos autorizar y el segundo es el parámetro de la ruta que deseamos pasar al método de la política. En este caso, como estamos usando [implicit model binding](/docs/{{version}}/routing#implicit-binding), un modelo `Post` ser pasado al método de la política. Si el usuario no está autorizado a ejecutar la acción dada, el middleware generará una respuesta HTTP con el código de estatus `403`.

#### Acciones que no requieren modelos

Como mencionamos antes, algunas acciones como `create` pueden no requerir de una instancia de un modelo. En estas situaciones, puedes pasar el nombre de la clase al middleware. El nombre de la clase será usado para determinar cuál política usar para autorizar la acción:

```php
Route::post('/post', function () {
    // The current user may create posts...
})->middleware('can:create,App\Post');
```

<a name="via-controller-helpers"></a>
### Vía Helpers de Controladores

Además de proveer métodos útiles en el modelo `User`, Laravel también provee un método muy útil llamado `authorize` en cualquier controlador que extienda la clase base `App\Http\Controllers\Controller`. Como el método `can`, este método acepta el nombre de la acción que quieras autorizar y el modelo relevante. Si la acción no es autorizada, el método `authorize` arrojará una excepción de tipo `Illuminate\Auth\Access\AuthorizationException`, la cual será convertida por el manejador de excepciones por defecto de Laravel en una respuesta HTTP con un código `403`:

```php
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
    * @throws \Illuminate\Auth\Access\AuthorizationException
    */
    public function update(Request $request, Post $post)
    {
        $this->authorize('update', $post);

        // The current user can update the blog post...
    }
}
```

#### Acciones que no requieren modelos

Como hemos discutido previamente, algunas acciones como `create` pueden no requerir una instancia de un modelo. En estas situaciones, puedes pasar el nombre de la clase al método `authorize`. El nombre de la clase determinará la política a usar para autorizar la acción: 

```php
/**
* Create a new blog post.
*
* @param  Request  $request
* @return Response
* @throws \Illuminate\Auth\Access\AuthorizationException
*/
public function create(Request $request)
{
    $this->authorize('create', Post::class);

    // The current user can create blog posts...
}
```

#### Autorizando Controladores De Recursos

Si estás utilizando [controladores de recursos](/docs/{{version}}/controllers#resource-controllers), puedes hacer uso del método `authorizeResource` en el constructor del controlador. Este método agregará la definición de middleware `can` apropiada a los métodos del controlador de recursos.

El método `authorizeResource` acepta el nombre de clase del modelo como primer argumento y el nombre del parametro de ruta / petición que contendrá el ID del modelo como segundo argumento:

```php
<?php

namespace App\Http\Controllers;

use App\Post;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class PostController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Post::class, 'post');
    }
}
```

::: tip
Puedes usar el comando `make:policy` con la opción `--model` para rápidamente generar una clase de política para un modelo dado: `php artisan make:policy PostPolicy --model=Post`.
:::

<a name="via-blade-templates"></a>
### Vía Plantillas de Blade

Cuando escribas plantillas de Blade, puedes querer mostrar una porción de la página solo si el usuario está autorizado para ejecutar una acción determinada. Por ejemplo, puedes querer mostrar un formulario para actualizar un post solo si el usuario puede actualizar el post. En situaciones así, puedes usar las directivas `@can` y `@cannot`:

```php
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
```

Estas directivas son accesos directos convenientes para no tener que escribir sentencias `@if` y `@unless`. Las sentencias `@can` y `@cannot` de arriba son equivalentes a las siguientes sentencias, respectivamente:

```php
@if (Auth::user()->can('update', $post))
    <!-- The Current User Can Update The Post -->
@endif

@unless (Auth::user()->can('update', $post))
    <!-- The Current User Can't Update The Post -->
@endunless
```

#### Acciones que no requieren modelos

Así como otros métodos de autorización, puedes pasar el nombre de una clase a las directivas `@can` y `@cannot` si la acción no requiere una instancia de un modelo:

```php
@can('create', App\Post::class)
    <!-- The Current User Can Create Posts -->
@endcan

@cannot('create', App\Post::class)
    <!-- The Current User Can't Create Posts -->
@endcannot
```