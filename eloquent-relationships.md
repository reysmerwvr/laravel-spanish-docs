::: v-pre

# Eloquent: Relaciones

- [Introducción](#introduction)
- [Definiendo Relaciones](#defining-relationships)
    - [Uno A Uno](#one-to-one)
    - [Uno A Muchos](#one-to-many)
    - [Uno A Muchos (Inverso)](#one-to-many-inverse)
    - [Muchos A Muchos](#many-to-many)
    - [Definiendo Modelos de Tabla Intermedia Personalizados](#defining-custom-intermediate-table-models)
    - [Tiene Uno A Través De](#has-one-through)
    - [Tiene Muchos a Través de](#has-many-through)
- [Relaciones Polimórficas](#polymorphic-relationships)
    - [Uno A Uno](#one-to-one-polymorphic-relations)
    - [Uno A Muchos](#one-to-many-polymorphic-relations)
    - [Muchos A Muchos](#many-to-many-polymorphic-relations)
    - [Tipos Polimórficos Personalizados](#custom-polymorphic-types)
- [Consultando Relaciones](#querying-relations)
    - [Métodos De Relación Vs. Propiedades Dinámicas](#relationship-methods-vs-dynamic-properties)
    - [Consultando La Existencia De Relación](#querying-relationship-existence)
    - [Consultando La Ausencia De Relación](#querying-relationship-absence)
    - [Contando Modelos Relacionados](#counting-related-models)
- [Precarga (Eager Loading)](#eager-loading)
    - [Restringiendo Precargas](#constraining-eager-loads)
    - [Precarga Diferida (Lazy Eager Loading)](#lazy-eager-loading)
- [Insertando Y Actualizando Modelos Relacionados](#inserting-and-updating-related-models)
    - [El Método `save`](#the-save-method)
    - [El Método `create`](#the-create-method)
    - [Actualizando Relaciones Pertenece A (BelongsTo)](#updating-belongs-to-relationships)
    - [Actualizando Relaciones Muchos A Muchos](#updating-many-to-many-relationships)
- [Tocando Marcas De Tiempo Del Padre](#touching-parent-timestamps)

<a name="introduction"></a>
## Introducción

Las tablas de base de datos frecuentemente están relacionadas a otra tabla. Por ejemplo, un post de un blog puede tener muchos comentarios o un pedido podría estar relacionado al usuario que lo ordenó. Eloquent hace que manejar y trabajar con estas relaciones sea fácil y soporta varios tipos de relaciones:

- [Uno a Uno](#one-to-one)
- [Uno a Muchos](#one-to-many)
- [Muchos a Muchos](#many-to-many)
- [Uno a Través de](#has-one-through)
- [Muchos a Través de](#has-many-through)
- [Uno a Uno (Polimórfica)](#one-to-one-polymorphic-relations)
- [Uno a Muchos (Polimórfica)](#one-to-many-polymorphic-relations)
- [Muchos a Muchos (Polimórfica)](#many-to-many-polymorphic-relations)

<a name="defining-relationships"></a>
## Definiendo Relaciones

Las relaciones de Eloquent se definen como métodos en tus clases de modelo de Eloquent. Debido a que, como los mismos modelos Eloquent, las relaciones también sirven como poderosos [constructores de consultas](/docs/{{version}}/queries), puesto que definir relaciones como métodos proporciona potentes capacidades de encadenamiento de métodos y consultas. Por ejemplo, podemos encadenar restricciones adicionales en esta relación `posts`:

```php
$user->posts()->where('active', 1)->get();
```

Pero, antes de profundizar demasiado en el uso de relaciones, aprendamos cómo definir cada tipo.

<a name="one-to-one"></a>
### Uno A Uno

Una relación de uno a uno es una relación muy sencilla. Por ejemplo, un modelo `User` podría estar asociado con un `Phone`. Para definir esta relación, colocaremos un método `phone` en el modelo `User`. El método `phone` debería llamar al método `hasOne` y devolver su resultado:

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
    * Get the phone record associated with the user.
    */
    public function phone()
    {
        return $this->hasOne('App\Phone');
    }
}
```

El primer argumento pasado al método `hasOne` es el nombre del modelo relacionado. Una vez que la relación es definida, podemos obtener el registro relacionado usando propiedades dinámicas de Eloquent. Las propiedades dinámicas permiten que accedas a métodos de relación como si fueran propiedades definidas en el modelo:

```php
$phone = User::find(1)->phone;
```

Eloquent determina la clave foránea de la relación en base al nombre del modelo. En este caso, se asume automáticamente que el modelo `Phone` tenga una clave foránea `user_id`. Si deseas sobrescribir esta convención, puedes pasar un segundo argumento al método `hasOne`:

```php
return $this->hasOne('App\Phone', 'foreign_key');
```

Adicionalmente, Eloquent asume que la clave foránea debería tener un valor que coincida con la columna `id` (o `$primaryKey` personalizada) del padre. En otras palabras, Eloquent buscará el valor de la columna `id` del usuario en la columna `user_id` de `Phone`. Si prefieres que la relación use un valor distinto de `id`, puedes pasar un tercer argumento al método `hasOne` especificando tu clave personalizada:

```php
return $this->hasOne('App\Phone', 'foreign_key', 'local_key');
```

#### Definiendo El Inverso De La Relación

Así, podemos acceder al modelo `Phone` desde nuestro `User`. Ahora, vamos a definir una relación en el modelo `Phone` que nos permitirá accdeder al `User` que posee el teléfono. Podemos definir el inverso de una relación `hasOne` usando el método `belongsTo`:

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Phone extends Model
{
    /**
    * Get the user that owns the phone.
    */
    public function user()
    {
        return $this->belongsTo('App\User');
    }
}
```

En el ejemplo anterior, Eloquent intentará hacer coincidir el `user_id` del modelo `Phone` con un `id` en el modelo `User`. Eloquent determina el nombre de la clave foránea de forma predeterminada al examinar el nombre del método de la relación y agregando el sufijo al nombre del método con `_id`. Sin embargo, si la clave foránea en el modelo `Phone` no es `user_id`, puedes pasar un nombre de clave personalizada como segundo argumento al método `belongsTo`: 

```php
/**
* Get the user that owns the phone.
*/
public function user()
{
    return $this->belongsTo('App\User', 'foreign_key');
}
```

Si tu modelo padre no usa `id` como su clave primaria, o deseas hacer join al modelo hijo con una columna diferente, puedes pasar un tercer argumento al método `belongsTo` especificando la clave personalizada de tu tabla padre:

```php
/**
* Get the user that owns the phone.
*/
public function user()
{
    return $this->belongsTo('App\User', 'foreign_key', 'other_key');
}
```

<a name="one-to-many"></a>
### Uno A Muchos

Una relación de "uno-a-muchos" es usada para definir relaciones donde un solo modelo posee cualquier cantidad de otros modelos. Por ejemplo, un post de un blog puede tener un número infinito de comentarios. Al igual que todas las demás relaciones de Eloquent, las relaciones uno-a-muchos son definidas al colocar una función en tu modelo Eloquent:

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    /**
    * Get the comments for the blog post.
    */
    public function comments()
    {
        return $this->hasMany('App\Comment');
    }
}
```

Recuerda, Eloquent determinará automáticamente la columna de clave foránea apropiada en el modelo `Comment`. Por convención, Eloquent tomará el nombre "snake_case" del modelo que la contiene y le agregará el sufijo `_id`. Para este ejemplo, Eloquent asumirá que la clave foránea del modelo `Comment` es `post_id`.

Una vez que la relación ha sido definida, podemos acceder a la colección de comentarios al acceder a la propiedad `comments`. Recuerda, ya que Eloquent proporciona "propiedades dinámicas", podemos acceder a los métodos de la relación como si fueran definidos como propiedades en el modelo:

```php
$comments = App\Post::find(1)->comments;

foreach ($comments as $comment) {
    //
}
```

Debido a que todas las relaciones también sirven como constructores de consultas (query builders), puedes agregar restricciones adicionales a cuyos comentarios sean obtenidos ejecutando el método `comments` y encadenando condiciones en la consulta:

```php
$comment = App\Post::find(1)->comments()->where('title', 'foo')->first();
```

Igual que el método `hasOne`, también puedes sobrescribir las claves foráneas y locales al pasar argumentos adicionales al método `hasMany`:

```php
return $this->hasMany('App\Comment', 'foreign_key');

return $this->hasMany('App\Comment', 'foreign_key', 'local_key');
```

<a name="one-to-many-inverse"></a>
### Uno A Muchos (inverso)

Ahora que puedes acceder a todos los comentarios de un post, vamos a definir una relación para permitir a un comentario acceder a su post padre. Para definir el inverso de una relación `hasMany`, define una función de relación en el modelo hijo que ejecute el método `belongsTo`:

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    /**
    * Get the post that owns the comment.
    */
    public function post()
    {
        return $this->belongsTo('App\Post');
    }
}
```

Una vez que la relación ha sido definida, podemos obtener el modelo `Post` para un `Comment` accediendo a la "propiedad dinámica" de `post`:

```php
$comment = App\Comment::find(1);

echo $comment->post->title;
```

En el ejemplo anterior, Eloquent tratará de hacer coincidir el `post_id` del modelo `Comment` con un `id` en el modelo `Post`. Eloquent determina el nombre de la clave foránea por defecto, examinando el nombre del método de la relación y agregando un sufijo `_` al nombre del método, seguido del nombre de la columna principal de la llave. Sin embargo, si la clave foránea en el modelo `Comment` no es `post_id`, puedes pasar un nombre de clave personalizado como segundo argumento al método `belongsTo`:

```php
/**
* Get the post that owns the comment.
*/
public function post()
{
    return $this->belongsTo('App\Post', 'foreign_key');
}
```

Si tu modelo padre no usa `id` como su clave primaria, o deseas hacer join al modelo hijo con una columna diferente, puedes pasar un tercer argumento al método `belongsTo` especificando la clave personalizada de tu tabla padre.

```php
/**
* Get the post that owns the comment.
*/
public function post()
{
    return $this->belongsTo('App\Post', 'foreign_key', 'other_key');
}
```

<a name="many-to-many"></a>
### Muchos A Muchos

Las relaciones de muchos-a-muchos son ligeramente más complicadas que las relaciones `hasOne` y `hasMany`. Un ejemplo de tal relación es un usuario con muchos roles, donde los roles también son compartidos por otros usuarios. Por ejemplo, muchos usuarios pueden tener el rol "Admin". Para definir esta relación, tres tablas de bases de datos son necesitadas: `users`, `roles`, y `role_user`. La tabla `role_user` es derivada del orden alfabético de los nombres de modelo relacionados y contiene las columnas `user_id` y `role_id`.

Las relaciones de muchos-a-muchos son definidas escribiendo un método que devuelve el resultado del método `belongsToMany`. Por ejemplo, vamos a definir el método `roles` en nuestro modelo `User`:

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
    * The roles that belong to the user.
    */
    public function roles()
    {
        return $this->belongsToMany('App\Role');
    }
}
```

Una vez que la relación es definida, puedes acceder a los roles del usuario usando la propiedad dinámica `roles`:

```php
$user = App\User::find(1);

foreach ($user->roles as $role) {
    //
}
```

Como con los otros tipos de relación, puedes ejecutar el método `roles` para continuar encadenando las restricciones de consulta en la relación:

```php
$roles = App\User::find(1)->roles()->orderBy('name')->get();
```

Como mencionamos previamente, para determinar el nombre de la tabla asociativa, Eloquent juntará los dos nombres de modelo en orden alfabético. Sin embargo, eres libre de sobrescribir esta convención. Puedes hacer eso pasando un segundo argumento al método `belongsToMany`:

```php
return $this->belongsToMany('App\Role', 'role_user');
```

Además de personalizar el nombre de la tabla asociativa, también puedes personalizar los nombres de columna de las claves en la tabla pasando argumentos adicionales al método `belongsToMany`. El tercer argumento es el nombre de clave foránea del modelo en el cual estás definiendo la relación, mientras el cuarto argumento es el nombre de la clave foránea del modelo que estás asociando:

```php
return $this->belongsToMany('App\Role', 'role_user', 'user_id', 'role_id');
```

#### Definiendo El Inverso De La Relación

Para definir el inverso de una relación de muchos-a-muchos, puedes colocar otra llamada de `belongsToMany` en tu modelo relacionado. Para continuar con nuestro ejemplo de roles de usuario, vamos a definir el método `users` en el modelo `Role`:

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    /**
    * The users that belong to the role.
    */
    public function users()
    {
        return $this->belongsToMany('App\User');
    }
}
```

Como puedes ver, la relación es definida exactamente de la misma forma que su contraparte `User`, con la excepción de que referencia al modelo `App\User`. Ya que estamos reusando el método `belongsToMany`, todas las tablas y opciones de personalización de claves usuales están disponibles al momento de definir el inverso de las relaciones de muchos-a-muchos.

#### Obteniendo Columnas De Tablas Intermedias (Pivote)

Como ya has aprendido, trabajar con relaciones de muchos-a-muchos requiere la presencia de una tabla intermedia o pivote. Eloquent proporciona algunas formas muy útiles de interactuar con esta tabla. Por ejemplo, vamos a asumir que nuestro objeto `User` tiene muchos objetos `Role` al que está relacionado. Después de acceder a esta relación, podemos acceder a la tabla intermedia usando el atributo `pivot` en los modelos:

```php
$user = App\User::find(1);

foreach ($user->roles as $role) {
    echo $role->pivot->created_at;
}
```

Ten en cuenta que a cada modelo `Role` que obtenemos se le asigna automáticamente un atributo `pivot`. Este atributo contiene un modelo que representa la tabla intermedia y puede ser usado como cualquier otro modelo de Eloquent.

De forma predeterminada, solo las claves del modelo estarán presentes en el objeto `pivot`. Si tu tabla pivote contiene atributos extras, debes especificarlos cuando definas la relación.

```php
return $this->belongsToMany('App\Role')->withPivot('column1', 'column2');
```

Si quieres que tu tabla pivote automáticamente mantenga las marcas de tiempo `created_at` y `updated_at`, usa el método `withTimestamps` en la definición de la relación:

```php
return $this->belongsToMany('App\Role')->withTimestamps();
```

#### Personalizando El Nombre Del Atributo `pivot`
 
Como se señaló anteriormente, los atributos de la tabla intermedia pueden ser accedidos en modelos usando el atributo `pivot`. Sin embargo, eres libre de personalizar el nombre de este atributo para que refleje mejor su propósito dentro de tu aplicación.

Por ejemplo, si tu aplicación contiene usuarios que pueden suscribirse a podcasts, probablemente tengas una relación de muchos-a-muchos entre usuarios y podcasts. Si éste es el caso, puedes desear renombrar tu tabla pivote intermedia como `subscription` en lugar de `pivot`. Esto puede ser hecho usando el método `as` al momento de definir la relación:

```php
return $this->belongsToMany('App\Podcast')
                ->as('subscription')
                ->withTimestamps();
```

Una vez hecho esto, puedes acceder a los datos de la tabla intermedia usando el nombre personalizado:

```php
$users = User::with('podcasts')->get();

foreach ($users->flatMap->podcasts as $podcast) {
    echo $podcast->subscription->created_at;
}
```

#### Filtrando Relaciones A Través De Columnas De Tablas Intermedias

También puedes filtrar los resultados devueltos por `belongsToMany` usando los métodos `wherePivot` y `wherePivotIn` al momento de definir la relación:

```php
return $this->belongsToMany('App\Role')->wherePivot('approved', 1);

return $this->belongsToMany('App\Role')->wherePivotIn('priority', [1, 2]);
```

<a name="defining-custom-intermediate-table-models"></a>
### Definiendo Modelos De Tabla Intermedia Personalizados

Si prefieres definir un modelo personalizado para representar la tabla intermedia o pivote de tu relación, puedes ejecutar el método `using` al momento de definir la relación. Los modelos de tablas intermedias de muchos-a-muchos personalizados deben extender la clase `Illuminate\Database\Eloquent\Relations\Pivot` mientras que los modelos polimórficos muchos-a-muchos deben extender la clase `Illuminate\Database\Eloquent\Relations\MorphPivot`. Por ejemplo, podemos definir un `Role` que use un modelo pivote `RoleUser` personalizado:

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    /**
    * The users that belong to the role.
    */
    public function users()
    {
        return $this->belongsToMany('App\User')->using('App\RoleUser');
    }
}
```

Al momento de definir el modelo `RoleUser`, extenderemos la clase `Pivot`:

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Relations\Pivot;

class RoleUser extends Pivot
{
    //
}
```

Puedes combinar `using` y `withPivot` para retornar columnas de la tabla intermedia. Por ejemplo, puedes retornar las columnas `created_by` y `updated_by` desde la tabla pivote `RoleUser` pasando los nombres de las columnas al método `withPivot`:

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    /**
    * The users that belong to the role.
    */
    public function users()
    {
        return $this->belongsToMany('App\User')
                        ->using('App\RoleUser')
                        ->withPivot([
                            'created_by',
                            'updated_by'
                        ]);
    }
}
```

#### Modelos De Pivote Personalizados E IDs Incrementales

Si has definido una relación de muchos a muchos que usa un modelo de pivote personalizado, y ese modelo de pivote tiene una clave primaria de incremento automático, debes asegurarte de que su clase de modelo de pivote personalizado defina una propiedad `incrementing` que se establece en` true `.

```php
/**
* Indicates if the IDs are auto-incrementing.
*
* @var bool
*/
public $incrementing = true;
```

<a name="has-one-through"></a>
### Tiene Uno A Través De (hasOneThrough)

La relación "tiene uno a través" vincula los modelos a través de una única relación intermedia. 
Por ejemplo, si cada proveedor (supplier) tiene un usuario (user) y cada usuario está asociado con un registro del historial (history) de usuarios, entonces el modelo del proveedor puede acceder al historial del usuario _a través_ del usuario. Veamos las tablas de base de datos necesarias para definir esta relación:

```php
users
    id - integer
    supplier_id - integer

suppliers
    id - integer

history
    id - integer
    user_id - integer
```

Aunque la tabla `history` no contiene una columna` supplier_id`, la relación `hasOneThrough` puede proporcionar acceso al historial del usuario desde el modelo del proveedor. Ahora que hemos examinado la estructura de la tabla para la relación, vamos a definirla en el modelo `Supplier`:

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    /**
    * Get the user's history.
    */
    public function userHistory()
    {
        return $this->hasOneThrough('App\History', 'App\User');
    }
}
```

El primer argumento pasado al método `hasOneThrough` es el nombre del modelo final al que queremos acceder, mientras que el segundo argumento es el nombre del modelo intermedio.

Se utilizarán las convenciones típicas de clave foránea de Eloquent al realizar las consultas de la relación. Si deseas personalizar las claves de la relación, puedes pasarlas como el tercer y cuarto argumento al método `hasOneThrough`. El tercer argumento es el nombre de la clave foránea en el modelo intermedio. El cuarto argumento es el nombre de la clave foránea en el modelo final. El quinto argumento es la clave local, mientras que el sexto argumento es la clave local del modelo intermedio:

```php
class Supplier extends Model
{
    /**
    * Get the user's history.
    */
    public function userHistory()
    {
        return $this->hasOneThrough(
            'App\History',
            'App\User',
            'supplier_id', // Foreign key on users table...
            'user_id', // Foreign key on history table...
            'id', // Local key on suppliers table...
            'id' // Local key on users table...
        );
    }
}   
```

<a name="has-many-through"></a>
### Tiene Muchos A Través De (hasManyThrough)

La relación "tiene-muchos-a-través-de" proporciona una abreviación conveniente para acceder a relaciones distantes por medio de una relación intermedia. Por ejemplo, un modelo `Country` podría tener muchos modelos `Post` a través de un modelo `User` intermedio. En este ejemplo, podrías traer todos los posts de un blog para un país dado. Vamos a buscar las tablas requeridas para definir esta relación:

```php
countries
    id - integer
    name - string

users
    id - integer
    country_id - integer
    name - string

posts
    id - integer
    user_id - integer
    title - string
```

Aunque los `posts` no contienen una columna `country_id`, la relación `hasManyThrough` proporciona acceso a los posts de un país por medio de `$country->posts`. Para ejecutar esta consulta, Eloquent inspecciona el `country_id` de la tabla intermedia `users`. Después de encontrar los ID de usuario que coincidan, serán usados para consultar la tabla `posts`.

Ahora que hemos examinado la estructura de la tabla para la relación, vamos a definirla en el modelo `Country`:

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    /**
    * Get all of the posts for the country.
    */
    public function posts()
    {
        return $this->hasManyThrough('App\Post', 'App\User');
    }
}
```

El primer argumento pasado al método `hasManyThrough` es el nombre del modelo final que deseamos acceder, mientras que el segundo argumento es el nombre del modelo intermedio.

Las convenciones de clave foránea típicas de Eloquent serán usadas al momento de ejecutar las consultas de la relación. Si prefieres personalizar las claves de la relación, puedes pasarlos como tercer y cuarto argumentos del método `hasManyThrough`. El tercer argumento es el nombre de la clave foránea en el modelo intermedio. El cuarto argumento es el nombre de la clave foránea en el modelo final. El quinto argumento es la clave local, mientras el sexto argumento es la clave local del modelo intermedio:

```php
class Country extends Model
{
    public function posts()
    {
        return $this->hasManyThrough(
            'App\Post',
            'App\User',
            'country_id', // Foreign key on users table...
            'user_id', // Foreign key on posts table...
            'id', // Local key on countries table...
            'id' // Local key on users table...
        );
    }
}
```

<a name="polymorphic-relationships"></a>
## Relaciones Polimórficas

Una relación polimórfica permite que el modelo objetivo pertenezca a más de un tipo de modelo usando una sola asociación.

<a name="one-to-one-polymorphic-relations"></a>
### Una A Una (Polimórfica)

#### Estructura De Tabla

Una relación polimorfica de uno-a-uno es similar a una relación de uno-a-uno simple; sin embargo, el modelo objetivo puede pertenecer a más de un tipo de modelo en una sola asociación. Por ejemplo, un `Post` de un blog y un `User` pueden compartir una relación polimórfica con un modelo `Image`. Usando una relación polimórfica de uno-a-uno te permite tener una sola lista de imagenes únicas que son usadas tanto los posts del blog como por las cuentas de los usuarios. Primero, vamos a examinar la estructura de la tabla:

```php
posts
    id - integer
    name - string

users
    id - integer
    name - string

images
    id - integer
    url - string
    imageable_id - integer
    imageable_type - string
```

Observa las columnas `imageable_id` y `imageable_type` en la tabla `images`. La columna `imageable_id` contendrá el valor del ID del post o el usuario, mientras que la columna `imageable_type` contendrá el nombre de clase del modelo padre. La columna `imageable_type` es usada por Eloquent para determinar cuál "tipo" de modelo padre retornar al acceder a la relación `imageable`.

#### Estructura Del Modelo

A continuación, vamos a examinar las definiciones de modelo necesarias para construir esta relación:

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Image extends Model
{
    /**
    * Get all of the owning imageable models.
    */
    public function imageable()
    {
        return $this->morphTo();
    }
}

class Post extends Model
{
    /**
    * Get the post's image.
    */
    public function image()
    {
        return $this->morphOne('App\Image', 'imageable');
    }
}

class User extends Model
{
    /**
    * Get the user's image.
    */
    public function image()
    {
        return $this->morphOne('App\Image', 'imageable');
    }
}
```

#### Retornando La Relación

Una vez que tu base de datos y modelos son definidos, puedes acceder a las relaciones mediante tus modelos. Por ejemplo, para retornar la imagen para un post, podemos usar la propiedad dinámica `image`:

```php
$post = App\Post::find(1);

$image = $post->image;
```

Puedes también retornar el padre del modelo polimórfico accediendo al nombre del método que realiza la llamada a `morphTo`. En nuestro caso, éste es el método `imageable` en el modelo `Image`. Entonces, accederemos al método como una propiedad dinámica:

```php
$image = App\Image::find(1);

$imageable = $image->imageable;
```

La relación `imageable` en el modelo `Image` retornar ya sea una instancia de `Post` o `User`, dependiendo del tipo de modelo que posea la imagen.

<a name="one-to-many-polymorphic-relations"></a>
### Uno A Muchos (Polimórfica)

#### Estructura De Tabla

Una relación polimórfica de uno-a-muchos es similar a una relación de uno-a-muchos sencilla; sin embargo, el modelo objetivo puede pertenecer a más de un tipo de modelo en una sola asociación. Por ejemplo, imagina que usuarios de tu aplicación pueden comentar tanto en posts como en videos. Usando relaciones polimórficas, puedes usar una sola tabla `comments` para ambos escenarios. Primero, vamos a examinar la estructura de tabla requerida para esta relación:

```php
posts
    id - integer
    title - string
    body - text

videos
    id - integer
    title - string
    url - string

comments
    id - integer
    body - text
    commentable_id - integer
    commentable_type - string
```

#### Estructura De Modelo

A continuación, vamos a examinar las definiciones de modelos necesarias para construir esta relación:

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    /**
    * Get all of the owning commentable models.
    */
    public function commentable()
    {
        return $this->morphTo();
    }
}

class Post extends Model
{
    /**
    * Get all of the post's comments.
    */
    public function comments()
    {
        return $this->morphMany('App\Comment', 'commentable');
    }
}

class Video extends Model
{
    /**
    * Get all of the video's comments.
    */
    public function comments()
    {
        return $this->morphMany('App\Comment', 'commentable');
    }
}
```

#### Retornando La Relación

Una vez que tu base de datos y modelos son definidos, puedes acceder a las relaciones mediante tus modelos. Por ejemplo, para acceder a todos los comentarios de un post podemos usar la propiedad dinámica `comments`:

```php
$post = App\Post::find(1);

foreach ($post->comments as $comment) {
    //
}
```

También puedes retornar al propietario de una relación polimórfica desde un modelo polimórfico accediendo al nombre del método que realiza la llamada a `morphTo`. En nuestro caso, éste es el método `commentable` en el modelo `Comment`. Así que, accederemos a dicho método como una propiedad dinámica:

```php
$comment = App\Comment::find(1);

$commentable = $comment->commentable;
```

La relación `commentable` en el modelo `Comment` retornará ya sea una instancia `Post` o `Video`, dependiendo de qué tipo de modelo es el propietario del comentario.

<a name="many-to-many-polymorphic-relations"></a>
### Muchos A Muchos (Polimórfica)

#### Estructura De Tabla

Las relaciones polimórficas de muchos-a-muchos son un poco más complicadas que las relaciones `morphOne` y `morphMany`. Por ejemplo, un modelo `Post` de un blog y un modelo `Video` pueden compartir una relación polimórfica con un modelo `Tag`. Usando una relación polimórfica de muchos-a-muchos te permite tener una única lista de etiquetas que son compartidas a través de posts y videos. Primero, vamos a examinar la estructura de tabla:

```php
posts
    id - integer
    name - string

videos
    id - integer
    name - string

tags
    id - integer
    name - string

taggables
    tag_id - integer
    taggable_id - integer
    taggable_type - string
```

#### Estructura Del Modelo

Seguidamente, estamos listos para definir las relaciones en el modelo. Ambos modelos `Post` y `Video` tendrán un método `tags` que ejecuta el método `morphToMany` en la clase base de Eloquent:

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    /**
    * Get all of the tags for the post.
    */
    public function tags()
    {
        return $this->morphToMany('App\Tag', 'taggable');
    }
}
```

#### Definiendo El Inverso De La Relación

A continuación, en el modelo `Tag`, debes definir un método para cada uno de sus modelos relacionados. Así, para este ejemplo, definiremos un método `posts` y un método `videos`:

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    /**
    * Get all of the posts that are assigned this tag.
    */
    public function posts()
    {
        return $this->morphedByMany('App\Post', 'taggable');
    }

    /**
    * Get all of the videos that are assigned this tag.
    */
    public function videos()
    {
        return $this->morphedByMany('App\Video', 'taggable');
    }
}
```

#### Obteniendo La Relación

Una vez que tu tabla en la base de datos y modelos son definidos, puedes acceder las relaciones por medio de tus modelos. Por ejemplo, para acceder a todos los tags de un post, puedes usar la propiedad dinámica `tags`:

```php
$post = App\Post::find(1);

foreach ($post->tags as $tag) {
    //
}
```

También puedes obtener el propietario de una relación polimórfica desde el modelo polimórfico accediendo al nombre del método que ejecutó la llamada a `morphedByMany`. En nuestro caso, estos son los métodos `posts` o `videos` en el modelo `Tag`. Así, accederemos a esos métodos como propiedades dinámicas:

```php
$tag = App\Tag::find(1);

foreach ($tag->videos as $video) {
    //
}
```

<a name="custom-polymorphic-types"></a>
### Tipos Polimórficos Personalizados

Por defecto, Laravel usará el nombre completo de clase para almacenar el tipo del modelo relacionado. Por ejemplo, dado el ejemplo uno-a-muchos de arriba donde un `Comment` puede pertenecer a un `Post` o a un `Video`, el `commentable_type` por defecto será `App\Post` o `App\Video`, respectivamente. Sin embargo, puedes querer desacoplar tu base de datos de la estructura interna de tu aplicación. En dicho caso, puedes definir un "mapa de morfología (morph map)" para indicarle a Eloquent que use un nombre personalizado para cada modelo en lugar del nombre de la clase:

```php
use Illuminate\Database\Eloquent\Relations\Relation;

Relation::morphMap([
    'posts' => 'App\Post',
    'videos' => 'App\Video',
]);
```

Puedes registar el `morphMap` en la función `boot` de tu `AppServiceProvider` o crear un proveedor de servicios separado si lo deseas.   

<a name="querying-relations"></a>
## Consultando Relaciones

Ya que todos los tipos de relaciones Eloquent son definidas por medio de métodos, puedes ejecutar esos métodos para obtener una instancia de la relación sin ejecutar realmente las consultas de la relación. Además, todos los tipos de relaciones Eloquent también sirven como [constructores de consultas](/docs/{{version}}/queries), permitiendo que continues encadenando restricciones dentro de la consulta de la relación antes de ejecutar finalmente el SQL contra la base de datos.

Por ejemplo, imagina un sistema de blog en el cual un modelo `User` tiene muchos modelos `Post` asociados:

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
    * Get all of the posts for the user.
    */
    public function posts()
    {
        return $this->hasMany('App\Post');
    }
}
```

Puedes consultar la relación `posts` y agregar limitaciones a la relación de la siguiente forma:

```php
$user = App\User::find(1);

$user->posts()->where('active', 1)->get();
```

Puedes usar cualquiera de los métodos de [constructor de consultas](/docs/{{version}}/queries) y así que asegúrate de revisar la documentación del constructor de consultas para aprender sobre todos los métodos disponibles.

<a name="relationship-methods-vs-dynamic-properties"></a>
### Métodos De Relación Vs. Propiedades Dinámicas

Si no necesitas agregar restricciones adicionales a una consulta de relación de Eloquent, puedes acceder a la relación como si fuera una propiedad. Por ejemplo, continuando con el uso de nuestros modelos de ejemplo `User` y `Post`, podemos acceder a todos los posts de un usuario como sigue:

```php
$user = App\User::find(1);

foreach ($user->posts as $post) {
    //
}
```

Las propiedades dinámicas son de "carga diferida (lazy loading)", lo que significa que cargarán solamente los datos de su relación cuando realmente accedas a ellas. Debido a esto, los desarrolladores con frecuencia usan [carga previa (eager loading)](#eager-loading) para precargar las relaciones que ellos saben que serán accedidas después de cargar el modelo. La carga previa proporciona una reducción significativa en consultas SQL que deben ser ejecutadas para cargar las relaciones de un modelo.

<a name="querying-relationship-existence"></a>
### Consultando La Existencia De Una Relación

Cuando accedes a los registros de un modelo, puedes desear limitar sus resultados basados en la existencia de una relación. Por ejemplo, imagina que quieres obtener todos los posts de blog que tienen al menos un comentario. Para hacer eso, puedes pasar el nombre de la relación a los métodos `has` y `orHas`:

```php
// Retrieve all posts that have at least one comment...
$posts = App\Post::has('comments')->get();
```

También puedes especificar un operador y la cantidad para personalizar aún más la consulta:

```php
// Retrieve all posts that have three or more comments...
$App/posts = Post::has('comments', '>=', 3)->get();
```

Las instrucciones `has` anidadas también pueden ser construidas usando la notación de "punto". Por ejemplo, puedes obtener todos los posts que tienen al menos un comentario con votos:

```php
// Retrieve posts that have at least one comment with votes...
$App/posts = Post::has('comments.votes')->get();
```

Incluso si necesitas más potencia, puedes usar los métodos `whereHas` y `orWhereHas` para poner condiciones "where" en tus consultas `has`. Estos métodos permiten que agregues restricciones personalizadas a una restricción de relación, tal como verificar el contenido de un comentario:

```php
use Illuminate\Database\Eloquent\Builder;

// Retrieve posts with at least one comment containing words like foo%
$posts = App\Post::whereHas('comments', function (Builder $query) {
    $query->where('content', 'like', 'foo%');
})->get();

// Retrieve posts with at least ten comments containing words like foo%
$posts = App\Post::whereHas('comments', function (Builder $query) {
    $query->where('content', 'like', 'foo%');
}, '>=', 10)->get();
```

<a name="querying-relationship-absence"></a>
### Consultando La Ausencia De Una Relación

Al momento de acceder a los registros de un modelo, puedes desear limitar tus resultados en base a la ausencia de una relación. Por ejemplo, imagina que quieras obtener todos los posts de blogs que **no** tienen algún comentario. Para hacer eso, puedes pasar el nombre de la relación a los métodos `doesntHave` y `orDoesntHave`:

```php
$posts = App\Post::doesntHave('comments')->get();
```

Incluso si necesitas más potencia, puedes usar los métodos `whereDoesntHave` y `orWhereDoesntHave` para poner condiciones "where" en tus consultas `doesntHave`. Estos métodos permiten que agregues restricciones personalizadas a una restricción de relación, tal como verificar el contenido de un comentario:

```php
use Illuminate\Database\Eloquent\Builder;

$posts = Post::whereDoesntHave('comments', function (Builder $query) {
    $query->where('content', 'like', 'foo%');
})->get();
```

Puedes usar notación "de puntos" para ejecutar una consulta contra una relación anidada. Por ejemplo, la siguiente consulta entregará todos los posts con comentarios de autores que no están vetados:

```php
use Illuminate\Database\Eloquent\Builder;

$posts = App\Post::whereDoesntHave('comments.author', function (Builder $query) {
    $query->where('banned', 1);
})->get();
```

<a name="counting-related-models"></a>
### Contando Modelos Relacionados

Si quieres contar el número de resultados de una relación sin cargarlos realmente puedes usar el método `withCount`, el cual coloca una columna `{relation}_count` en tus modelos resultantes. Por ejemplo:

```php
$posts = App\Post::withCount('comments')->get();

foreach ($posts as $post) {
    echo $post->comments_count;
}
```

Puedes agregar las "cuentas" para múltiples relaciones así como también agregar restricciones a las consultas:

```php
$posts = Post::withCount(['votes', 'comments' => function ($query) {
    $query->where('content', 'like', 'foo%');
}])->get();

echo $posts[0]->votes_count;
echo $posts[0]->comments_count;
```

También puedes poner un alias al resultado de la cuenta de la relación, permitiendo múltiples cuentas en la misma relación:

```php
$posts = App/post::withCount([
    'comments',
    'comments as pending_comments_count' => function ($query) {
        $query->where('approved', false);
    }
])->get();

echo $posts[0]->comments_count;

echo $posts[0]->pending_comments_count;
```

Si estás combinando `withCount` con una instrucción `select`, asegúrate de llamar a `withCount` después del método `select`:

```php
$posts = App\Post::select(['title', 'body'])->withCount('comments');

echo $posts[0]->title;
echo $posts[0]->body;
echo $posts[0]->comments_count;
```

<a name="eager-loading"></a>
## Carga Previa (Eager Loading)

Al momento de acceder a las relaciones Eloquent como propiedades, los datos de la relación son "cargados diferidamente (lazy loading)". Esto significa que los datos de la relación no son cargados realmente hasta que primero accedas a la propiedad. Sin embargo, Eloquent puede "cargar previamente (eager loading)" las relaciones al mismo tiempo que consultas el modelo padre. La carga previa alivia el problema de la consulta N + 1. Para ilustrar el problema de la consulta N + 1, considera un modelo `Book` que está relacionado a `Author`:

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    /**
    * Get the author that wrote the book.
    */
    public function author()
    {
        return $this->belongsTo('App\Author');
    }
}
```

Ahora, vamos a obtener todos los libros y sus autores:

```php
$books = App\Book::all();

foreach ($books as $book) {
    echo $book->author->name;
}
```

Este ciclo ejecutará una consulta para obtener todos los libros en la tabla, despues otra consulta para cada libro para obtener el autor. Así, si tenemos 25 libros, este ciclo debería ejecutar 26 consultas: 1 para el libro original y 25 consultas adicionales para obtener el autor de cada libro.

Afortunadamente, podemos usar la carga previa para reducir esta operación a solo 2 consultas. Al momento de consultar, puedes especificar cuáles relaciones deberían ser precargadas usando el método `with`:

```php
$books = App\Book::with('author')->get();

foreach ($books as $book) {
    echo $book->author->name;
}
```

Para esta operación, solo dos consultas serán ejecutadas:

```php
select * from books

select * from authors where id in (1, 2, 3, 4, 5, ...)
```

#### Carga Previa De Múltiples Relaciones

Algunas veces puedes necesitar la carga previa de varias relaciones diferentes en una operación única. Para hacer eso, pasa sólo los argumentos adicionales al método `with`:

```php
$books = App\Book::with(['author', 'publisher'])->get();
```

#### Carga Previa Anidada

Para precargar relaciones anidadas, puedes usar la sintaxis de "punto". Por ejemplo, vamos a precargar todos los autores de los libros y todos los contactos personales del autor en una instrucción de Eloquent:

```php
$books = App\Book::with('author.contacts')->get();
```

#### Cargando previamente Columnas Específicas

No siempre necesitas todas las columna de las relaciones que estás obteniendo. Por esta razón, Eloquent te permite que especificar cuáles columnas de la relación te gustaría obtener:

```php
$users = App\Book::with('author:id,name')->get();
```

::: danger Nota
Al momento de usar esta característica, siempre debes incluir la columna `id` en la lista de columnas que deseas obtener.
:::

<a name="constraining-eager-loads"></a>
### Restringiendo Cargas Previas

Algunas veces puedes desear cargar previamente una relación, pero también especificar condiciones de consulta para la consulta de carga previa. Aquí está un ejemplo:

```php
$users = App\User::with(['posts' => function ($query) {
    $query->where('title', 'like', '%first%');
}])->get();
```

En este ejemplo, Eloquent solamente precargará los posts donde la columna `title` del post contenga la palabra `first`. Puedes ejecutar otros métodos del [constructor de consulta](/docs/{{version}}/queries) para personalizar más la operación de carga previa:

```php
$users = App\User::with(['posts' => function ($query) {
    $query->orderBy('created_at', 'desc');
}])->get();
```

::: danger Nota
Los métodos del constructor de consultas `limit` y `take` no se pueden usar al restringir las cargas previas.
:::

<a name="lazy-eager-loading"></a>
### Carga Previa Diferida (Lazy Eager Loading)

Algunas veces puedes necesitar precargar una relación después de que el modelo padre ya ha sido obtenido. Por ejemplo, esto puede ser útil si necesitas decidir dinámicamente si se cargan modelos relacionados:

```php
$books = App\Book::all();

if ($someCondition) {
    $books->load('author', 'publisher');
}
```

Si necesitas establecer restricciones de consultas adicionales en la consulta de carga previa, puedes pasar un arreglo clave / valor con las relaciones que deseas cargar. Los valores del arreglo deberían ser instancias de `Closure`, las cuales reciben la instancia de consulta:

```php
$books->load(['author' => function ($query) {
    $query->orderBy('published_date', 'asc');
}]);
```

Para cargar una relación solo cuando aún no se ha cargado, usa el método `loadMissing`:

```php
public function format(Book $book)
{
    $book->loadMissing('author');

    return [
        'name' => $book->name,
        'author' => $book->author->name
    ];
}
```

#### Carga Previa Diferida Anidada Y `morphTo`

Si deseas cargar previamente una relación `morphTo`, así como relaciones anidadas en las diversas entidades que pueden ser devueltas por esa relación, puedes usar el método` loadMorph`.

Este método acepta el nombre de la relación `morphTo` como su primer argumento, y un arreglo de pares modelo / relación como su segundo argumento. Para ayudar a ilustrar este método, consideremos el siguiente modelo:

```php
<?php

use Illuminate\Database\Eloquent\Model;

class ActivityFeed extends Model
{
    /**
    * Get the parent of the activity feed record.
    */
    public function parentable()
    {
        return $this->morphTo();
    }
}
```

En este ejemplo, asumamos que los modelos `Event`, `Photo` y `Post` pueden crear modelos `ActivityFeed`. Además, supongamos que los modelos `Event` pertenecen a un modelo `Calendar`, los modelos `Photo` están asociados con los modelos `Tag` y los modelos `Post` pertenecen a un modelo` Author`.

Usando estas definiciones y relaciones de modelo, podemos recuperar instancias de modelo `ActivityFeed` y cargar previamente todos los modelos `parentables` y sus respectivas relaciones anidadas:

```php
$activities = ActivityFeed::with('parentable')
    ->get()
    ->loadMorph('parentable', [
        Event::class => ['calendar'],
        Photo::class => ['tags'],
        Post::class => ['author'],
    ]);
```

<a name="inserting-and-updating-related-models"></a>
## Insertando Y Actualizando Modelos Relacionados

<a name="the-save-method"></a>
### El Método Save

Eloquent proporciona métodos convenientes para agregar nuevos modelos a las relaciones. Por ejemplo, quizá necesites insertar un nuevo `Comment` para un modelo `Post`. En lugar de establecer manualmente el atributo `post_id` en el `Comment`, puedes insertar el `Comment` directamente con el método `save` de la relación:

```php
$comment = new App\Comment(['message' => 'A new comment.']);

$post = App\Post::find(1);

$post->comments()->save($comment);
```

Observa que no accedimos a la relación `comments` como una propiedad dinámica. En su lugar, ejecutamos el método `comments` para obtener una instancia de la relación. El método `save` automáticamente agregará el valor `post_id` apropiado al nuevo modelo `Comment`.

Si necesitas guardar múltiples modelos relacionados, puedes usar el método `saveMany`:

```php
$post = App\Post::find(1);

$post->comments()->saveMany([
    new App\Comment(['message' => 'A new comment.']),
    new App\Comment(['message' => 'Another comment.']),
]);
```

<a name="the-push-method"></a>
#### Guardando Modelos Y Relaciones Recursivamente

SI quieres hacer `save` a tu modelo y a todas sus relaciones asociadas, puedes usar el método `push`:

```php
$post = App\Post::find(1);

$post->comments[0]->message = 'Message';
$post->comments[0]->author->name = 'Author Name';

$post->push();
```

<a name="the-create-method"></a>
### El Método Create

En adición a los métodos `save` y `saveMany`, también puedes usar el método `create`, el cual acepta un arreglo de atributos, crea un modelo y lo inserta dentro de la base de datos. Otra vez, la diferencia entre `save` y `create` es que `save` acepta una instancia de modelo Eloquent llena mientras `create` acepta un `array` PHP plano:

```php
$post = App\Post::find(1);

$comment = $post->comments()->create([
    'message' => 'A new comment.',
]);
```

::: tip
Antes de usar el método `create`, asegurate de revisar la documentación sobre la [asignación masiva de atributos](/docs/{{version}}/eloquent#mass-assignment).
:::

Puedes usar el método `createMany` para crear múltiples modelos relacionados:

```php
$post = App\Post::find(1);

$post->comments()->createMany([
    [
        'message' => 'A new comment.',
    ],
    [
        'message' => 'Another new comment.',
    ],
]);
```

También puedes usar los métodos `findOrNew`, `firstOrNew`, `firstOrCreate` y `updateOrCreate` para [crear y actualizar modelos en relaciones](https://laravel.com/docs/{{version}}/eloquent#other-creation-methods).

<a name="updating-belongs-to-relationships"></a>
### Actualizar Relación Pertenece A (belongsTo)

Al momento de actualizar una relación `belongsTo`, puedes usar el método `associate`. Este método establecerá la clave foránea en el modelo hijo:

```php
$account = App\Account::find(10);

$user->account()->associate($account);

$user->save();
```

Al momento de eliminar una relación `belongsTo`, puedes usar el método `dissociate`. Este método establecerá la clave foránea de la relación a `null`:

```php
$user->account()->dissociate();

$user->save();
```

<a name="default-models"></a>
#### Modelos Predeterminados

La relación `belongsTo` te permite definir un modelo predeterminado que se devolverá si la relación dada es `null`. A este patrón se le conoce comúnmente como [patrón Null Object](https://en.wikipedia.org/wiki/Null_Object_pattern) y puede ayudar a quitar comprobaciones condicionales en tu código. En el ejemplo siguiente, la relación `user` devolverá un modelo `App\User` vacío si no hay un `user` adjunto a la publicación:

```php
/**
* Get the author of the post.
*/
public function user()
{
    return $this->belongsTo('App\User')->withDefault();
}
```

Para rellenar el modelo predeterminado con atributos, puedes pasar un arreglo o Closure al método `withDefault`:

```php
/**
* Get the author of the post.
*/
public function user()
{
    return $this->belongsTo('App\User')->withDefault([
        'name' => 'Guest Author',
    ]);
}

/**
* Get the author of the post.
*/
public function user()
{
    return $this->belongsTo('App\User')->withDefault(function ($user) {
        $user->name = 'Guest Author';
    });
}
```

<a name="updating-many-to-many-relationships"></a>
### Relaciones Muchos A Muchos

#### Adjuntando (Attach) / Quitando (Detach)

Eloquent también proporciona unos cuantas métodos helper para hacer que el trabajo con los modelos relacionados sea más conveniente. Por ejemplo, vamos a imaginar que un usuario tiene muchos roles y un rol puede tener muchos usuarios. Para adjuntar un rol a un usuario insertando un registro en la tabla intermedia que vincula los modelos, usa el método `attach`:

```php
$user = App\User::find(1);

$user->roles()->attach($roleId);
```

Al momento de adjuntar una relación a un modelo, también puedes pasar un arreglo de datos adicionales para ser insertados dentro de la tabla intermedia:

```php
$user->roles()->attach($roleId, ['expires' => $expires]);
```

Algunas veces puede ser necesario quitar un rol de un usuario. Para remover un registro de una relación de muchos-a-muchos, usa el método `detach`. El método `detach` eliminará el registro apropiado de la tabla intermedia; sin embargo, ambos modelos permanecerán en la base de datos:

```php
// Detach a single role from the user...
$user->roles()->detach($roleId);

// Detach all roles from the user...
$user->roles()->detach();
```

Por conveniencia, `attach` y `detach` también aceptan arreglos de IDs como entrada:

```php
$user = App\User::find(1);

$user->roles()->detach([1, 2, 3]);

$user->roles()->attach([
    1 => ['expires' => $expires],
    2 => ['expires' => $expires]
]);
```

#### Sincronizando Asociaciones

También puedes usar el método `sync` para construir asociaciones muchos-a-muchos. El método `sync` acepta un arreglo de IDs para colocar en la tabla intermedia. Algunos IDs que no estén en el arreglo dado serán removidos de la tabla intermedia. Por tanto, después que esta operación se complete, solamente los IDs en el arreglo dado existirán en la tabla intermedia:

```php
$user->roles()->sync([1, 2, 3]);
```

También puedes pasar valores adicionales de tabla intermedia con los IDs:

```php
$user->roles()->sync([1 => ['expires' => true], 2, 3]);
```

Si no quieres desatar IDs existentes, puedes usar el método `syncWithoutDetaching`:

```php
$user->roles()->syncWithoutDetaching([1, 2, 3]);
```

#### Alternar Asociaciones

La relación de muchos-a-muchos también proporciona un método `toggle` el cual "alterna" el estado adjunto de los IDs dados. Si el ID está actualmente adjuntado, será removido. De igual forma, si está actualmente removido, será adjuntado:

```php
$user->roles()->toggle([1, 2, 3]);
```

#### Guardando Datos Adicionales En Una Tabla Pivote

Al momento de trabajar con una relación de muchos-a-muchos, el método `save` acepta un arreglo de atributos adicionales de tabla intermedia como su segundo argumento:

```php
App\User::find(1)->roles()->save($role, ['expires' => $expires]);
```

#### Actualizando un Registro en una Tabla Pivote

Si necesitas actualizar una fila existente en tu tabla pivote, puedes usar el método `updateExistingPivot`. Este método acepta la clave foránea del registro pivote y un arreglo de atributos para actualizar:

```php
$user = App\User::find(1);

$user->roles()->updateExistingPivot($roleId, $attributes);
```

<a name="touching-parent-timestamps"></a>
## Tocando Marcas De Tiempo Del Padre

Cuando un modelo `belongsTo` o `belongsToMany` a otro modelo, tal como un `Comment` el cual pertenece a un `Post`, algunas veces es útil actualizar la marca de tiempo del padre cuando el modelo hijo es actualizado. Por ejemplo, cuando un modelo `Comment` es actualizado, puedes querer "tocar" automáticamente la marca de tiempo `updated_at` del `Post` que lo posee. Eloquent hace esto fácil. Simplemente agrega una propiedad `touches` conteniendo los nombres de las relaciones al modelo hijo:

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    /**
    * All of the relationships to be touched.
    *
    * @var array
    */
    protected $touches = ['post'];

    /**
    * Get the post that the comment belongs to.
    */
    public function post()
    {
        return $this->belongsTo('App\Post');
    }
}
```

Ahora, cuando actualices un `Comment`, el `Post` que lo posee tendrá su columna `updated_at` actualizada también, haciéndolo más conveniente para saber cuándo invalidar una caché del modelo `Post`:

```php
$comment = App\Comment::find(1);

$comment->text = 'Edit to this comment!';

$comment->save();
```