::: v-pre

# Enrutamiento

- [Enrutamiento Básico](#basic-routing)
    - [Redireccionar Rutas](#redirect-routes)
    - [Las Rutas de Vistas](#view-routes)
- [Los Parámetros de Rutas](#route-parameters)
    - [Los Parámetros Requeridos](#required-parameters)
    - [Los Parámetros Opcionales](#parameters-optional-parameters)
    - [Las Restricciones de Expresiones Regulares](#parameters-regular-expression-constraints)
- [Las Rutas Nombradas](#named-routes)
- [Los Grupos de Ruta](#route-groups)
    - [Los Middleware](#route-group-middleware)
    - [Los Espacios de Nombres](#route-group-namespaces)
    - [Enrutamiento de subdominios](#route-group-sub-domain-routing)
    - [Los Prefijos de Ruta](#route-group-prefixes)
    - [Los Prefijos por Nombre de Ruta](#route-group-name-prefixes)
- [Enlazamiento De Modelo De Ruta (Route Model Binding)](#route-model-binding)
    - [Enlazamiento Implícito](#implicit-binding)
    - [Enlazamiento Explícito](#explicit-binding)
- [Rutas Fallback](#fallback-routes)
- [Límite de Rango](#rate-limiting)
- [La Suplantación del Método del Formulario](#form-method-spoofing)
- [Accediendo la Ruta Actual](#accessing-the-current-route)

<a name="basic-routing"></a>
## Enrutamiento Básico

Las rutas de Laravel más básicas aceptan una URI y una `Closure`, proporcionando un método muy fácil y expresivo de definición de rutas:

```php
Route::get('foo', function () {
    return 'Hello World';
});
```

#### Los Archivos de Ruta Predeterminados

Todas las rutas de Laravel están definidas en tus archivos de ruta, los cuales están localizados en el directorio `routes`. Estos archivos son cargados automáticamente por el framework. El archivo `routes\web.php` define rutas que son para tu interface web. Estas rutas son asignadas al grupo de middleware `web`, el cual proporciona características como estado de sesión y protección CSRF. Las rutas en `routes\api.php` son independientes de estado y son asignadas al grupo de middleware `api`.

Para las principales aplicaciones, empezarás definiendo rutas en tu archivo `routes/web.php`. Las rutas definidas en `routes/web.php` pueden ser accedidas colocando la URL de la ruta definida en tu navegador. Por ejemplo, puede acceder a la siguiente ruta al navegar a `http://your-app.dev/user` en tu navegador:

```php
Route::get('/user', 'UserController@index');
```

Las rutas definidas en el archivo `routes/api.php` son agrupadas dentro de un grupo de ruta por el `RouteServiceProvider`.Dentro de este grupo, el prefijo de URI `/api` es aplicado automáticamente de modo que no es necesario aplicarlo manualmente en todas las rutas en el archivo. Puedes modificar el prefijo y otras opciones de grupos de ruta al modificar tu clase `RouteServiceProvider`.

#### Métodos Disponibles del Enrutador

El enrutador permite que registres rutas que responden a cualquier verbo HTTP:

```php
Route::get($uri, $callback);
Route::post($uri, $callback);
Route::put($uri, $callback);
Route::patch($uri, $callback);
Route::delete($uri, $callback);
Route::options($uri, $callback);
```

Algunas veces puede que necesites registrar una ruta que responda a verbos HTTP múltiples. Puedes hacerlo usando el método `match`. También, puedes incluso registrar una ruta que responda a todos los verbos HTTP usando el método `any`:

```php
Route::match(['get', 'post'], '/', function () {
    //
});

Route::any('foo', function () {
    //
});
```

#### Protección CSRF

Cualquiera de los formularios HTML que apunten a rutas `POST`, `PUT`, or `DELETE` que sean definidas en el archivo de rutas `web` deberían incluir un campo de token CSRF. De otra manera, la solicitud será rechazada. Puedes leer más sobre protección CSRF en la [documentación de CSRF](/docs/{{version}}/csrf):

```php
<form method="POST" action="/profile">
    {{ csrf_field() }}
    ...
</form>
```

<a name="redirect-routes"></a>
### Redireccionar Rutas

Si estás definiendo una ruta que redirecciona a otra URI, puedes usar el método `Route::redirect`. Este método proporciona una forma abreviada conveniente de modo que no tengas que definir una ruta completa o de controlador para ejecutar una redirección básica:

```php
Route::redirect('/here', '/there');
```

Por defecto, `Route::redirect` retorna un código de estado `302`. Puedes personalizar el código de estado usando el tercer parámetro opcional:

```php
Route::redirect('/here', '/there', 301);
```
    
Puedes usar el método `Route::permanentRedirect` para retornar un código de estado `301`:

```php
Route::permanentRedirect('/here', '/there');
```

<a name="view-routes"></a>
### Rutas de Vista

Si tu ruta necesita solamente devolver una vista, puedes usar el método `Route::view`. Igual que el método `redirect`, este método proporciona una forma abreviada básica de modo que no tengas que definir una ruta completa o de controlador. El método `view` acepta una URI como su primer argumento y un nombre de vista como su segundo argumento.  Además, puedes proporcionar una arreglo de datos para pasar a la vista como un tercer argumento opcional:

```php
Route::view('/welcome', 'welcome');

Route::view('/welcome', 'welcome', ['name' => 'Taylor']);
```

<a name="route-parameters"></a>
## Parámetros de Ruta

<a name="required-parameters"></a>
### Parámetros Requeridos

Con frecuencia necesitarás capturar segmentos de la URI dentro de tu ruta. Por ejemplo, puedes necesitar capturar un ID de usuario de la URL. Puedes hacer eso al definir los parámetros de ruta:

```php
Route::get('user/{id}', function ($id) {
    return 'User '.$id;
});
```

Puedes definir tantos parámetros de ruta como requieras para tu ruta:

```php
Route::get('posts/{post}/comments/{comment}', function ($postId, $commentId) {
    //
});
```

Los parámetros de ruta siempre son encerrados dentro de `{}`, deberían consistir de caracteres alfabéticos y no pueden contener un caracter `-`. En lugar de usar el caracter `-`, use el guión bajo (`_`). Los parámetros de ruta son inyectados dentro de las funciones de retorno de ruta / controlador en base a su orden - los nombres de los argumentos de la función de retorno / controlador no importan.

<a name="parameters-optional-parameters"></a>
### Parámetros Opcionales

Ocasionalmente puede que necesites especificar un parámetro de ruta, pero que aparezca como un parámetro opcional de esa ruta. Puedes hacer eso al colocar un signo de interrogación `?` después del nombre del parámetro. Asegúrate de dar un valor por defecto a la variable correspondiente de la ruta.

```php
Route::get('user/{name?}', function ($name = null) {
    return $name;
});

Route::get('user/{name?}', function ($name = 'John') {
    return $name;
});
```

<a name="parameters-regular-expression-constraints"></a>
### Restricciones Con Expresiones Regulares

Puedes restringir el formato de tus parámetros de ruta usando el método `where` en una instancia de ruta. El método `where` acepta el nombre del parámetro y una expresión regular que defina cómo el parámetro debería estar conformado:

```php
Route::get('user/{name}', function ($name) {
    //
})->where('name', '[A-Za-z]+');

Route::get('user/{id}', function ($id) {
    //
})->where('id', '[0-9]+');

Route::get('user/{id}/{name}', function ($id, $name) {
    //
})->where(['id' => '[0-9]+', 'name' => '[a-z]+']);
```

<a name="parameters-global-constraints"></a>
#### Restricciones Globales

Si prefieres que un parámetro de ruta siempre esté restringido por una expresión regular dada, puedes usar el método `pattern`. Deberías definir estos patrones en el método `boot` de tu `RouteServiceProvider`:

```php
/**
* Definir los enlaces de modelo de tus rutas, patrones, filtros, etc.
*
* @return void
*/
public function boot()
{
    Route::pattern('id', '[0-9]+');

    parent::boot();
}
```

Una vez que el patrón ha sido definido, es aplicado automáticamente a todas las rutas que usen ese nombre de parámetro:

```php
Route::get('user/{id}', function ($id) {
    // Only executed if {id} is numeric...
});
```

<a name="parameters-encoded-forward-slashes"></a>
#### Slashes Codificados
	
El componente de rutas de Laravel permite todos los caracteres excepto `/`. Debes explícitamente permitir que `/` sea parte de tu placeholder usando una expresión regular de la condición `where`:

```php
Route::get('search/{search}', function ($search) {
    return $search;
})->where('search', '.*');
```

::: danger Nota
Los slashes codificados sólo están soportados dentro del último segmento de la ruta.
:::

<a name="named-routes"></a>
## Rutas Nombradas

Las rutas nombradas permiten la generación de URLs o redirecciones para rutas específicas de una forma conveniente. Puedes especificar un nombre para una ruta al encadenar el método `name` en la definición de la ruta:

```php
Route::get('user/profile', function () {
    //
})->name('profile');
```

También puedes especificar los nombes de ruta para acciones de controlador:

```php
Route::get('user/profile', 'UserController@showProfile')->name('profile');
```

#### Generación de URLs para las Rutas Nombradas

Una vez que has asignado un nombre a una ruta dada, puedes usar el nombre de la ruta cuando estás generando URLs o redireccionas por medio de la función `route` global:

```php
// Generating URLs...
$url = route('profile');

// Generando Redirecciones...
return redirect()->route('profile');
```

Si la ruta nombrada posee parámetros, puedes pasar los parámetros como el segundo argumento de la función `route`. Los parámetros dados serán insertados automáticamente dentro de la URL en sus posiciones correctas:

```php
Route::get('user/{id}/profile', function ($id) {
    //
})->name('profile');

$url = route('profile', ['id' => 1]);
```

#### Inspeccionando la Ruta Actual

Si requieres determinar si la solicitud actual fue enrutada por una ruta nombrada dada, puedes usar el método `named` en una instancia de Ruta. Por ejemplo, puedes verficar el nombre de ruta actual desde el middleware de una ruta.

```php
/**
* Manejar una solicitud entrante.
*
* @param  \Illuminate\Http\Request  $request
* @param  \Closure  $next
* @return mixed
*/
public function handle($request, Closure $next)
{
    if ($request->route()->named('profile')) {
        //
    }

    return $next($request);
}
```

<a name="route-groups"></a>
## Los Grupos de Ruta

Los grupos de ruta permiten que tu compartas atributos de ruta, tales como los middleware o los espacios de nombres, a través de un número grande de rutas sin necesidad de definir esos atributos en cada ruta individual. Los atributos compartidos son especificados en un formato de arreglo como el primer parámetro al método `Route::group`.

Los grupos anidados intentan "fusionar" de forma inteligente los atributos al grupo de sus padres. Los middleware y condiciones `where` son mezcladas (merged) mientras que los nombres, nombres de espacio y prefijos son agregados (appended). Las delimitaciones de nombres de espacio y los slashes en los prefijos de URLs son automáticamente agregados cuando es apropiado.

<a name="route-group-middleware"></a>
### Los Middleware

Para asignar los middleware a todas las rutas dentro de un grupo, puedes usar el método `middleware` antes de la definición del grupo. Los middleware son ejecutados en base al orden en el cual son listados en el arreglo:

```php
Route::middleware(['first', 'second'])->group(function () {
    Route::get('/', function () {
        // Uses first & second Middleware
    });

    Route::get('user/profile', function () {
        // Uses first & second Middleware
    });
});
```

<a name="route-group-namespaces"></a>
### Los Espacios de Nombres

Otro uso común para los grupos de ruta es la asignación del mismo espacio de nombre de PHP a un grupo de controladores usando el métod `namespace`:

```php
Route::namespace('Admin')->group(function () {
    // Controladores dentro del espacio de nombre "App\Http\Controllers\Admin"
});
```

Recuerda que por defecto, el `RouteServiceProvider` incluye tus archivos de ruta dentro de un grupo de espacio de nombre, permitiéndote que registres rutas de controlador sin especificar el prefijo de espacio de nombre `App\Http\Controllers` completo. Así, puedes necesitar especificar solamente la porción del espacio de nombre que viene después del espacio de nombre `App\Http\Controllers` base.

<a name="route-group-sub-domain-routing"></a>
### El Enrutamiento de Sub-Dominio

Los grupos de ruta también pueden ser usados para manejar enrutamiento de sub-dominio.  Los Sub-dominios pueden ser asignados a parámetros de ruta justamente como URIs de ruta, permitiendote que captures una porción del sub-dominio para uso en tu ruta o controlador. El sub-dominio puede ser especificado al ejecutar el método `domain` antes de definir el grupo.

```php
Route::domain('{account}.myapp.com')->group(function () {
    Route::get('user/{id}', function ($account, $id) {
        //
    });
});
```

<a name="route-group-prefixes"></a>
### Prefijos de Rutas

El método `prefix` puede ser usado para poner un prefijo a cada ruta en el grupo con una URI dada. Por ejemplo, puedes desear poner un prefijo a todas las URIs de ruta dentro del grupo con `admin`:

```php
Route::prefix('admin')->group(function () {
    Route::get('users', function () {
        // Coincide con la URL "/admin/users"
    });
});
```

<a name="route-group-name-prefixes"></a>
### Los Prefijos de Nombre de Ruta

El método `name` puede ser usado para poner prefijo a cada nombre de ruta en el grupo con una cadena dada. Por ejemplo, puedes desear poner prefijo a todos los nombres de ruta agrupados con `admin`. La cadena dada es prefijada al nombre de ruta exactamente cómo es especificada, así que nos aseguraremos de proporcionar el caracter de terminación `.` en el prefijo:

```php
Route::name('admin.')->group(function () {
    Route::get('users', function () {
        // Nombre asignado de ruta "admin.users"...
    });
});
```

<a name="route-model-binding"></a>
## Enlazamiento De Modelo De Ruta (Route Model Binding)

Cuando estamos inyectando un ID de modelo a una ruta o acción de controlador, usualmente consultarás para obtener el modelo que corresponde a esa ID. El enlazamiento de modelo de ruta de Laravel proporciona una forma conveniente de inyectar directamente las instancias del modelo en tus rutas. Por ejemplo, en lugar de inyectar un ID de usuario, puedes inyectar la instancia del modelo `User` completa que coincida con el ID dado.

<a name="implicit-binding"></a>
### Enlazamiento Implícito

Laravel resuelve automáticamente los modelos de Eloquent en rutas o acciones de controlador cuyos nombres de variables declaradas coincidan con un nombre de segmento de ruta. Por ejemplo:

```php
Route::get('api/users/{user}', function (App\User $user) {
    return $user->email;
});
```

Debido a que la variable `$user` está declarada como el modelo de Eloquent `App\User` y el nombre de variable coincide con el segmento de URI `{user}`, Laravel inyectará automáticamente la instancia del modelo que tenga un ID coincidiendo con el valor correspondiente en la URI de la solicitud. Si una instancia del modelo que coincida no es encontrada en la base de datos, una respuesta HTTP 400 será generada automáticamente.

#### Personalizando el Nombre de Clave

Si prefieres que el enlazamiento del modelo use una columna de base de datos distinta del `id` cuando estás obteniendo una clase de modelo dada, puedes sobreescribir el método `getRouteKeyName` en el módelo de Eloquent:

```php
/**
* Obtener la clave de la ruta para el modelo.
*
* @return string
*/
public function getRouteKeyName()
{
    return 'slug';
}
```

<a name="explicit-binding"></a>
### Enlazamiento Explícito

Para registrar un enlazamiento explícito, usa el método `model` del enrutador para especificar la clase para un parámetro dado. Deberías definir tu enlazamiento del modelo explícito en el método `boot` de la clase `RouteServiceProvider`:

```php
public function boot()
{
    parent::boot();

    Route::model('user', App\User::class);
}
```

Seguido, define una ruta que contenga un parámetro `{user}`:

```php
Route::get('profile/{user}', function (App\User $user) {
    //
});
```

Debido a que hemos enlazado todos los parámetros de `{user}` al modelo `App\User`, una instancia `User` será inyectada dentro de la ruta. Así, por ejemplo, una solicitud a `profile/1` inyectará la instancia de la base de datos la cual tiene una ID de `1`.

Si una instancia de modelo que coincida no es encontrada en la base de datos, una respuesta HTTP 404 será generada automáticamente.

#### Personalizando la Lógica de Resolución

Si deseas usar tu propia lógica de resolución, puedes usar el método `Route::bind`. La `Closure` que pases al método `bind` recibirá el valor del segmento de URI y debería devolver la instancia de la clase que debería ser inyectada dentro de la ruta:

```php
/**
* Bootstrap any application services.
*
* @return void
*/
public function boot()
{
    parent::boot();

    Route::bind('user', function ($value) {
        return App\User::where('name', $value)->first() ?? abort(404);
    });
}
```

Como alternativa, puedes sobreescribir el método `resolveRouteBinding` en tu modelo Eloquent. Este método recibirá el valor del segmento URI y debe devolver la instancia de la clase que se debe inyectar en la ruta:

```php
/**
* Retrieve the model for a bound value.
*
* @param  mixed  $value
* @return \Illuminate\Database\Eloquent\Model|null
*/
public function resolveRouteBinding($value)
{
    return $this->where('name', $value)->first() ?? abort(404);
}
```

<a name="fallback-routes"></a>
## Rutas Fallback

Usando el método `Route::fallback`, puedes definir una ruta que será ejecutada cuando ninguna otra ruta coincida con la petición entrante. Típicamente, las peticiones no gestionadas automáticamente mostrarán una página 404 a través del manejador de excepciones de tu aplicación. Sin embargo, ya que puedes definir la ruta `fallback` dentro de tu archivo `routes/web.php`, todo middleware en el grupo `web` aplicará a la ruta. Eres libre de añadir middleware adicionales a esta ruta de ser necesario:

```php
Route::fallback(function () {
    //
});
```

::: danger Nota
La ruta alternativa siempre debe ser la última ruta registrada por tu aplicación.
:::

<a name="rate-limiting"></a>
## Límite de Rango

Laravel incluye un [middleware](/docs/{{version}}/middleware) para limitar el rango de acceso a rutas dentro de tu aplicación. Para empezar, asigna el middleware `throttle` a una ruta o grupo de rutas. EL middleware `throttle` acepta dos parámetros que determinan el máximo número de peticiones que pueden hacerse en un número de minutos dado. Por ejemplo, específiquemos que un usuario autenticado puede acceder al siguiente grupo de rutas sesenta veces por minuto:

```php
Route::middleware('auth:api', 'throttle:60,1')->group(function () {
    Route::get('/user', function () {
        //
    });
});
```

#### Limite de Rango Dinámico

Puedes especificar un máximo de peticiones dinámicas basado en un atribto del modelo `User` autenticado. Por ejemplo, si tu modelo `User` contiene un atributo `rate_limit`, puedes pasar el nombre del atributo al middleware `throttle` de modo que sea usado para calcular el conteo máximo de peticiones:

```php
Route::middleware('auth:api', 'throttle:rate_limit,1')->group(function () {
    Route::get('/user', function () {
        //
    });
});
```

<a name="form-method-spoofing"></a>
## La Suplantación de Método del Formulario

Los formularios HTML no soportan acciones `PUT`, `PATCH` o `DELETE`. Así que, cuando estés definiendo rutas `PUT`, `PATCH` o `DELETE` que son llamadas desde un formulario HTML, necesitarás agregar un campo `_method` oculto para el formulario. El valor enviado con el campo `_method` será usado como el método de solicitud HTTP:

```php
<form action="/foo/bar" method="POST">
    <input type="hidden" name="_method" value="PUT">
    <input type="hidden" name="_token" value="{{ csrf_token() }}">
</form>
```

Puedes usar la directiva Blade `@method` para generar la entrada `_method`:

```php
<form action="/foo/bar" method="POST">
    @method('PUT')
    @csrf
</form>
```

<a name="accessing-the-current-route"></a>
## Accesando la Ruta Actual

Puedes usar los métodos `current`, `currentRouteName`, y `currentRouteAction` en la clase facade `Route` para accesar la información sobre el manejador de ruta de la solicitud entrante:

```php
$route = Route::current();

$name = Route::currentRouteName();

$action = Route::currentRouteAction();
```

Consulta la documentación de la API sobre la [clase subyacente de la clase facade `Route`](https://laravel.com/api/{{version}}/Illuminate/Routing/Router.html) y la [instancia de ruta](https://laravel.com/api/{{version}}/Illuminate/Routing/Route.html) para revisar todos los métodos disponibles.