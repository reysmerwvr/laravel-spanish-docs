# Eloquent: Relaciones

- [Introducción](#introduction)
- [Definiendo Relaciones](#defining-relationships)
    - [Una A Una](#one-to-one)
    - [Una A Muchos](#one-to-many)
    - [Una A Muchos (Inverso)](#one-to-many-inverse)
    - [Muchos A Muchos](#many-to-many)
    - [Tiene Muchos a Través de](#has-many-through)
    - [Relaciones Polimórficas](#polymorphic-relations)
    - [Relaciones Polimórficas Muchos a Muchos](#many-to-many-polymorphic-relations)
- [Consultando Relaciones](#querying-relations)
    - [Métodos de Relación Vs. Propiedades Dinámicas](#relationship-methods-vs-dynamic-properties)
    - [Consultando la Existencia de Relación](#querying-relationship-existence)
    - [Consultando la Ausencia de Relación](#querying-relationship-absence)
    - [Contando Modelos Relacionados](#counting-related-models)
- [Precarga](#eager-loading)
    - [Restringiendo Precargas](#constraining-eager-loads)
    - [Precarga Diferida](#lazy-eager-loading)
- [Insertando & Actualizando Modelos Relacionados](#inserting-and-updating-related-models)
    - [El Método `save`](#the-save-method)
    - [El Método `create`](#the-create-method)
    - [Actualizando Relaciones Pertenece a](#updating-belongs-to-relationships)
    - [Actualizando Relaciones Muchos a Muchos](#updating-many-to-many-relationships)
- [Tocando Marcas de Tiempo del Padre](#touching-parent-timestamps)

<a name="introduction"></a>
## Introducción

Las tablas de Base de datos frecuentemente estan relacionadas a otra tabla. Por ejemplo, un post de blog puede tener muchos comentarios o un pedido podría estar relacionado al usuario que lo colocó. Eloquent hace que manejar y trabajar con estas relaciones sea fácil, y soporta varios tipos de relaciones:

- [Una a Una](#one-to-one)
- [Una a Muchos](#one-to-many)
- [Muchos a Muchos](#many-to-many)
- [Muchos a Través de](#has-many-through)
- [Relaciones Polimórficas](#polymorphic-relations)
- [Relaciones Polimórficas Muchos a Muchos](#many-to-many-polymorphic-relations)

<a name="defining-relationships"></a>
## Definiendo Relaciones

Las relaciones de Eloquent se definen como métodos en tus clases de modelo de Eloquent. Debido a que, como los mismos modelos Eloquent, las relaciones también sirven como poderosos [constructores de consultas](/docs/{{version}}/queries), el definir las relaciones como métodos proporciona el encadenamiento de métodos y capacidades de consultar. Por ejemplo, podemos encadenar restricciones adicionales en esta relación `posts`:

    $user->posts()->where('active', 1)->get();

Pero, antes de hurgar demasiado profundo usando las relaciones, vamos a aprender a definir cada tipo.

<a name="one-to-one"></a>
### Una a Una

Una relación una a una es una relación muy sencilla. Por ejemplo, un modelo `User` podría estar asociado con uno `Phone`. Para definir esta relación, colocaremos un método `phone` en el modelo `User`. El método `phone` debería ejecutar el método `hasOne` y devolvería su resultado:

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

El primer argumento pasado al método `hasOne` es el nombre del modelo relacionado. Una vez que la relación es definida, podemos obtener el registro relacionado usando propiedades dinámicas de Eloquent. Las propiedades dinámicas permiten que accedas a métodos de relación como si fueran propiedades definidas en el modelo:

    $phone = User::find(1)->phone;

Eloquent determina la clave foránea de la relación en base al nombre del modelo. En este caso, se asume automáticamente que el modelo `Phone` tenga una clave foránea `user_id`. Si deseas sobrescribir esta convención, puedes pasar un segundo argumento al método `hasOne`:

    return $this->hasOne('App\Phone', 'foreign_key');

Adicionalmente, Eloquent asume que la clave foránea debería tener un valor que coincida con la columna `id` (o `$primaryKey` personalizada) del padre. En otras palabras, Eloquent buscará el valor de la columna `id` del usuario en la columna `user_id` de `Phone`. Si prefieres que la relación use un valor distinto de `id`, puedes pasar un tercer argumento al método `hasOne` especificando tu clave personalizada:

    return $this->hasOne('App\Phone', 'foreign_key', 'local_key');

#### Definiendo el Inverso de la Relación

Así, podemos acceder al modelo `Phone` de nuestro `User`. Ahora, vamos a definir una relación en el modelo `Phone` que nos permitirá accdeder al `User` que posee el teléfono. Podemos definir el inverso de una relación `hasOne` usando el método `belongsTo`:

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

En el ejemplo anterior, Eloquent intentará hacer coincidir el `user_id` del modelo `Phone` con un `id` en el modelo `User`. Eloquent determina el nombre de la clave foránea de forma predeterminada al examinar el nombre del método de la relación y agregando el sufijo al nombre del método con `_id`. Sin embargo, si la clave foránea en el modelo `Phone` no es `user_id`, puedes pasar un nombre de clave personalizada como segundo argumento al método `belongsTo`: 

    /**
     * Get the user that owns the phone.
     */
    public function user()
    {
        return $this->belongsTo('App\User', 'foreign_key');
    }

Si tu modelo padre no usa `id` como su clave primaria, o deseas hacer join al modelo hijo con una columna diferente, puedes pasar un tercer argumento al método `belongsTo` especificando la clave personalizada de tu tabla padre:

    /**
     * Get the user that owns the phone.
     */
    public function user()
    {
        return $this->belongsTo('App\User', 'foreign_key', 'other_key');
    }

<a name="one-to-many"></a>
### Una a Muchos

Una relación "una-a-muchos" es usada para definir relaciones donde un solo modelo posee cualquier cantidad de otros modelos. Por ejemplo, un post de blog puede tener un número infinito de comentarios. Al igual que todas las demás relaciones de Eloquent, las relaciones una-a-muchas son definidas al colocar una función en tu modelo Eloquent:

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

Recuerda, Eloquent determinará automáticamente la columna de clave foránea apropiada en el modelo `Comment`. Por convención, Eloquent tomará el nombre "snake_case" del modelo que la contiene y le agregará el sufijo `_id`. Para este ejemplo, Eloquent asumirá que la clave foránea del modelo `Comment` es `post_id`.

Una vez que la relación ha sido definida, podemos acceder a la colección de comentarios al acceder a la propiedad `comments`. Recuerda, ya que Eloquent proporciona "propiedades dinámicas", podemos acceder a los métodos de la relación como si fueran definidos como propiedades en el modelo:

    $comments = App\Post::find(1)->comments;

    foreach ($comments as $comment) {
        //
    }

Ciertamente, ya que todas las relaciones también sirven como constructores de consultas, puedes agregar restricciones adicionales a cuyos comentarios sean obtenidos ejecutando el método `comments` y encadenando condiciones en la consulta:

    $comment = App\Post::find(1)->comments()->where('title', 'foo')->first();

Igual que el método `hasOne`, también puedes sobrescribir las claves foráneas y locales al pasar argumentos adicionales al método `hasMany`:

    return $this->hasMany('App\Comment', 'foreign_key');

    return $this->hasMany('App\Comment', 'foreign_key', 'local_key');

<a name="one-to-many-inverse"></a>
### Una a Muchos (Inverso)

Ahora que puedes acceder a todos los comentarios de un post, vamos a definir una relación para permitir a un comentario acceder a su post padre. Para definir el inverso de una relación `hasMany`, define una función de relación en el modelo hijo que ejecute el método `belongsTo`:

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

Una vez que la relación ha sido definida, podemos obtener el modelo `Post` para un `Comment` accediendo a la "propiedad dinámica" `post`:

    $comment = App\Comment::find(1);

    echo $comment->post->title;

En el ejemplo anterior, Eloquent tratará de hacer coincidir el `post_id` del modelo `Comment` con un `id` en el modelo `Post`. Eloquent determina el nombre de la clave foránea predeterminado examinando el nombre del método de la relación y agregando un sufijo `_` al nombre del método, seguido del nombre de la coluna principal de la llave. Sin embargo, si la clave foránea en el modelo `Comment` no es `post_id`, puedes pasar un nombre de clave personalizado como segundo argumento al método `belongsTo`:

    /**
     * Get the post that owns the comment.
     */
    public function post()
    {
        return $this->belongsTo('App\Post', 'foreign_key');
    }

Si tu modelo padre no usa `id` como su clave primaria, o deseas hacer join al modelo hijo con una columna diferente, puedes pasar un tercer argumento al método `belongsTo` especificando la clave personalizada de tu tabla padre.

    /**
     * Get the post that owns the comment.
     */
    public function post()
    {
        return $this->belongsTo('App\Post', 'foreign_key', 'other_key');
    }

<a name="many-to-many"></a>
### Muchos a Muchos

Las relaciones muchos-a-muchos son ligeramente más complicadas que las relaciones `hasOne` y `hasMany`. Un ejemplo de tal relación es un usuario con muchos roles, donde los roles también son compartidos por otros usuarios. Por ejemplo, muchos usuarios pueden tener el rol "Admin". Para definir esta relación, tres tablas de bases de datos son necesitadas: `users`, `roles`, y `role_user`. La tabla `role_user` es derivada del orden alfabético de los nombres de modelo relacionados y contiene las columnas `user_id` y `role_id`.

Las relaciones Muchos-a-Muchos son definidas escribiendo un método que devuelve el resultado del método `belongsToMany`. Por ejemplo, vamos a definir el método `roles` en nuestro modelo `User`:

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

Una vez que la relación es definida, puedes acceder a los roles del usuario usando la propiedad dinámica `roles`:

    $user = App\User::find(1);

    foreach ($user->roles as $role) {
        //
    }

Ciertamente, como con los otros tipos de relación, puedes ejecutar el método `roles` para continuar encadenando las restricciones de consulta en la relación:

    $roles = App\User::find(1)->roles()->orderBy('name')->get();

Como mencionamos previamente, para determinar el nombre de la tabla asociativa, Eloquent juntará los dos nombres de modelo en orden alfabético. Sin embargo, eres libre de sobrescribir esta convención. Puedes hacer eso pasando un segundo argumento al método `belongsToMany`:

    return $this->belongsToMany('App\Role', 'role_user');

Además de personalizar el nombre de la tabla asociativa, también puedes personalizar los nombres de columna de las claves en la tabla pasando argumentos adicionales al método `belongsToMany`. El tercer argumento es el nombre de clave foránea del modelo en el cual estas definiendo la relación, mientras el cuarto argumento es el nombre de la clave foránea del modelo que estás asociando:

    return $this->belongsToMany('App\Role', 'role_user', 'user_id', 'role_id');

#### Definiendo el Inverso de la Relación

Para definir el inverso de una relación muchos-a-muchos, puedes colocar otra ejecución de `belongsToMany` en tu modelo relacionado. Para continuar con nuestro ejemplo de roles de usuario, vamos a definir el método `users` en el modelo `Role`:

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

Como puedes ver, la relación es definida exactamente de la misma forma que su contraparte `User`, con la excepción de que referencia al modelo `App\User`. Ya que estamos reusando el método `belongsToMany`, todas las tablas y opciones de personalización de claves usuales están disponibles al momento de definir el inverso de las relaciones muchos-a-muchos.

#### Obteniendo Columnas de Tablas Intermedias

Como ya has aprendido, trabajar con relaciones muchos-a-muchos requiere la presencia de una tabla intermedia. Eloquent proporciona algunas formas muy útiles de interactuar con esta tabla. Por ejemplo, vamos a asumir que nuestro objeto `User` tiene muchos objetos `Role` al que esté relacionado. Después de acceder a esta relación, podemos acceder a la tabla intermedia usando el atributo `pivot` en los modelos:

    $user = App\User::find(1);

    foreach ($user->roles as $role) {
        echo $role->pivot->created_at;
    }

Nota que a cada modelo `Role` que obtenemos le es asignado automáticamente un atributo `pivot`. Este atributo contiene un modelo que representa la tabla intermedia y puede ser usado como cualquier otro modelo de Eloquent.

De forma predeterminada, solo las claves del modelo estarán presentes en el objeto `pivot`. Si tu tabla pivote contiene atributos extras, debes especificarlos cuando definas la relación.

    return $this->belongsToMany('App\Role')->withPivot('column1', 'column2');

Si quieres que tu tabla pivote automáticamente mantenga las marcas de tiempo `created_at` y `updated_at`, usa el método `withTimestamps` en la definición de la relación:

    return $this->belongsToMany('App\Role')->withTimestamps();

#### Personalizando el Nombre del Atributo `pivot`
 
Como se notó recientemente, los atributos de la tabla intermedia pueden ser accedidos en modelos usando el atributo `pivot`. Sin embargo, eres libre de personalizar el nombre de este atributo para que refleje mejor su propósito dentro de tu aplicación.

Por ejemplo, si tu aplicación contiene usuarios que pueden suscribirse a podcasts, probablemente tengas una relación muchos-a-muchos entre usuarios y podcasts. Si este es el caso, puedes desear renombrar tu tabla pivote intermedia como `subscription` en lugar de `pivot`. Esto puede ser hecho usando el método `as` al momento de definir la relación:

    return $this->belongsToMany('App\Podcast')
                    ->as('subscription')
                    ->withTimestamps();

Una vez que esto es hecho, puedes acceder a los datos de la tabla intermedia usando el nombre personalizado:

    $users = User::with('podcasts')->get();

    foreach ($users->flatMap->podcasts as $podcast) {
        echo $podcast->subscription->created_at;
    }

#### Filtrando Relaciones por Medio de Columnas de Tabla

También puedes filtrar los resultados devueltos por `belongsToMany` usando los métodos `wherePivot` y `wherePivotIn` al momento de definir la relación:

    return $this->belongsToMany('App\Role')->wherePivot('approved', 1);

    return $this->belongsToMany('App\Role')->wherePivotIn('priority', [1, 2]);

#### Definiendo Modelos de Tablas Intermedias Personalizadas

Si prefieres definir un modelo personalizado para representar la tabla intermedia de tu relación, puedes ejecutar el método `using` al momento de definir la relación. Los modelos pivot muchos-a-muchos personalizados deben extender la clase `Illuminate\Database\Eloquent\Relations\Pivot` mientras que los modelos polimórficos muchos-a-muchos deben extender la clase `Illuminate\Database\Eloquent\Relations\MorphPivot`. Por ejemplo, podemos definir un `Role` que use un modelo pivote `UserRole` personalizado:

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
            return $this->belongsToMany('App\User')->using('App\UserRole');
        }
    }

Al momento de definir el modelo `UserRole`, extenderemos la clase `Pivot`:

    <?php

    namespace App;

    use Illuminate\Database\Eloquent\Relations\Pivot;

    class UserRole extends Pivot
    {
        //
    }

<a name="has-many-through"></a>
### Tiene Muchos a Través de

La relación "tiene-muchos-a-través-de" proporciona una abreviación conveniente para acceder a relaciones distantes por medio de una relación intermedia. Por ejemplo, un modelo `Country` podría tener muchos modelos `Post` a través de un modelo `User` intermedio. En este ejemplo, podrías traer todos los posts de blog para un país dado. Vamos a buscar las tablas requeridas para definir esta relación:

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

Aunque los `posts` no contienen una columna `country_id`, la relación `hasManyThrough` proporciona acceso a los posts de un país por medio de `$country->posts`. Para ejecutar esta consulta, Eloquent inspecciona el `country_id` de la tabla intermedia `users`. Después de encontrar los ID de usuario que coincidan, serán usados para consultar la tabla `posts`.

Ahora que hemos examinado la estructura de la tabla para la relación, vamos a definirla en el modelo `Country`:

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

El primer argumento pasado al método `hasManyThrough` es el nombre del modelo final que deseamos acceder, mientras que el segundo argumento es el nombre del modelo intermedio.

Las convenciones de clave foránea típicas de Eloquent serán usadas al momento de ejecutar las consultas de la relación. Si prefieres personalizar las claves de la relación, puedes pasarlos como tercer y cuarto argumentos del método `hasManyThrough`. El tercer argumento es el nombre de la clave foránea en el modelo intermedio. El cuarto argumento es el nombre de la clave foránea en el modelo final. El quinto argumento es la clave local, mientras el sexto argumento es la clave local del modelo intermedio:

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

<a name="polymorphic-relations"></a>
### Relaciones Polimórficas

#### Estructura de Tabla

Las relaciones polimórficas permiten que un modelo pertenezca a más de un modelo distinto en una sola asociación. Por ejemplo, imagina que los usuarios de tu aplicación pueden "comentar" posts y videos. Usando relaciones polimórficas, puedes usar una sola tabla `comments` para ambos escenarios. Primero, vamos a examinar la estructura de la tabla requerida para construir esta relación:

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

Dos columnas importantes a notar son las columnas `commentable_id` y `commentable_type` en la tabla `comments`. La columna `commentable_id` contendrá el valor ID del post o video, mientras la columna `commentable_type` contendrá el nombre de la clase del modelo dueño. La columna `commentable_type` es la forma como el ORM determina cual "tipo" de modelo dueño devolver al momento de acceder la relación `commentable`.

#### Estructura del Modelo

Seguido, vamos a examinar las definiciones de modelo necesarias para construir esta relación:

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

#### Obteniendo Relaciones Polimórficas

Una vez que definas tus tablas de base de datos y los modelos, puedes accesar a las relaciones por medio de tus modelos. Por ejemplo, para acceder a todos los comentarios de un post, podemos usar la propiedad dinámica `comments`:

    $post = App\Post::find(1);

    foreach ($post->comments as $comment) {
        //
    }

También puedes obtener el propietario de una relación polimórfica desde el modelo polimórfico accediendo al nombre del método que ejecuta a `morphTo`. En nuestro caso, ese es el método `commentable` en el modelo `Comment`. Accederemos a ese método como una propiedad dinámica:

    $comment = App\Comment::find(1);

    $commentable = $comment->commentable;

La relación `commentable` en el modelo `Comment` devolverá o una instancia de `Post` o `Video`, dependiendo de cual tipo de modelo posea el comentario.

#### Tipos Polimórficos Personalizados

De forma predeterminada, Laravel usará el nombre de la clase totalmente cualificada para almacenar el tipo de modelo relacionado. Por ejemplo, en el ejemplo dado anteriormente donde un `Comment` puede pertenecer a un `Post` o a un `Video`, el `commentable_type` predeterminado sería o `App\Post` o `App\Video`, respectivamente. Sin embargo, puedes desear desacoplar tu base de datos de la estructura interna de tu aplicación. En ese caso, puedes definir una relación de "morph map" para instruir a Eloquent para que use un nombre personalizado para cada modelo en lugar del nombre de la clase:

    use Illuminate\Database\Eloquent\Relations\Relation;

    Relation::morphMap([
        'posts' => 'App\Post',
        'videos' => 'App\Video',
    ]);

Puedes registrar `morphMap` en la función `boot` de tu `AppServiceProvider` o crear un proveedor de servicio separado si lo deseas.

<a name="many-to-many-polymorphic-relations"></a>
### Relaciones Polimórficas Muchas a Muchas

#### Estructura de Tabla

En adición a las relaciones polimórficas tradicionales, también puedes definir relaciones polimórficas "muchos a muchos". Por ejemplo, un modelo `Post` y `Video` de un blog podría compartir una relación polimórfica con un modelo `Tag`. Usando una relación polimórfica muchos-a-muchos permitirá que tengas una lista de etiquetas únicas que son compartidas a través de posts y videos de blog. Primero, vamos a examinar la estructura de la tabla:

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

#### Estructura del Modelo

Seguidamente, estamos listos para definir las relaciones en el modelo. Ambos modelos `Post` y `Video` tendrán un método `tags` que ejecuta el método `morphToMany` en la clase base de Eloquent:

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

#### Definiendo el Inverso de la Relación

Siguiendo, en el modelo `Tag`, deberías definir un método para cada uno de sus modelos relacionados. Así, para este ejemplo, definiremos un método `posts` y un método `videos`:

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

#### Obteniendo la Relación

Una vez que tu tabla en la base de datos y modelos son definidos, puedes acceder las relaciones por medio de tus modelos. Por ejemplo, para acceder a todos los tags de un post, puedes usar la propiedad dinámica `tags`:

    $post = App\Post::find(1);

    foreach ($post->tags as $tag) {
        //
    }

También puedes obtener el propietario de una relación polimórfica desde el modelo polimórfico accediendo al nombre del método que ejecutó la llamada a `morphedByMany`. En nuestro caso, esos son los métodos `posts` o `videos` en el modelo `Tag`. Así, accederemos a esos métodos como propiedades dinámicas:

    $tag = App\Tag::find(1);

    foreach ($tag->videos as $video) {
        //
    }

<a name="querying-relations"></a>
## Consultando Relaciones

Ya que todos los tipos de relaciones Eloquent son definidas por medio de métodos, puedes ejecutar esos métodos para obtener una instancia de la relación sin ejecutar realmente las consultas de la relación. En adición, todos los tipos de relaciones Eloquent también sirven como [constructores de consultas](/docs/{{version}}/queries), permitiendo que continues encadenando restricciones dentro de la consulta de la relación antes de ejecutar finalmente el SQL contra la base de datos.

Por ejemplo, imagina un sistema de blog en el cual un modelo `User` tiene muchos modelos `Post` asociados:

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

Puedes consultar la relación `posts` y agregar limitaciones a la relación de la siguiente forma:

    $user = App\User::find(1);

    $user->posts()->where('active', 1)->get();

Puedes usar cualquiera de los métodos de [constructor de consultas](/docs/{{version}}/queries) y así asegurate de revisar la documentación del constructor de consultas para aprender sobre todos los métodos que estan disponibles para ti.

<a name="relationship-methods-vs-dynamic-properties"></a>
### Métodos de Relación Vs. Propiedades Dinámicas

Si no necesitas agregar restricciones adicionales a una consulta de relación de Eloquent, puedes acceder a la relación como si fuera una propiedad. Por ejemplo, continuando con el uso de nuestros modelos de ejemplo `User` y `Post`, podemos acceder a todos los posts de un usuario como sigue:

    $user = App\User::find(1);

    foreach ($user->posts as $post) {
        //
    }

Las propiedades dinámicas son de "carga diferida", significa que ellas cargarán solamente los datos de su relación cuando realmente las accedas. Debido a esto, los desarrolladores con frecuencia usan [carga previa](#eager-loading) para pre-cargar las relaciones que ellos saben que serán accedidas después de cargar el modelo. La carga previa proporciona una reducción significativa en consultas SQL que deben ser ejecutadas para cargar las relaciones de un modelo.

<a name="querying-relationship-existence"></a>
### Consultando la Existencia de una Relación

Cuando accedes a los registros de un modelo, puedes desear limitar sus resultados basados en la existencia de una relación. Por ejemplo, imagina que quieres obtener todos los posts de blog que tienen al menos un comentario. Para hacer eso, puedes pasar el nombre de la relación a los métodos `has` y `orHas`:

    // Retrieve all posts that have at least one comment...
    $posts = App\Post::has('comments')->get();

También puedes especificar un operador y la cuenta para optimizar más la consulta:

    // Retrieve all posts that have three or more comments...
    $App/posts = Post::has('comments', '>=', 3)->get();

Las instrucciones `has` anidadas también pueden ser construidas usando la notación de "punto". Por ejemplo, puedes obtener todos los posts que tienen al menos un comentario con votos:

    // Retrieve all posts that have at least one comment with votes...
    $App/posts = Post::has('comments.votes')->get();

Incluso si necesitas más potencia, puedes usar los métodos `whereHas` y `orWhereHas` para poner condiciones "where" en tus consultas `has`. Estos métodos permiten que agregues restricciones personalizadas a una restricción de relación, tal como verificar el contenido de un comentario:

    // Retrieve all posts with at least one comment containing words like foo%
    $App/posts = Post::whereHas('comments', function ($query) {
        $query->where('content', 'like', 'foo%');
    })->get();

<a name="querying-relationship-absence"></a>
### Consultando la Ausencia de una Relación

Al momento de acceder a los registros de un modelo, puedes desear limitar tus resultados en base a la ausencia de una relación. Por ejemplo, imagina que quieras obtener todos los posts de blogs que **no** tienen algún comentario. Para hacer eso, puedes pasar el nombre de la relación a los métodos `doesntHave` y `orDoesntHave`:

    $posts = App\Post::doesntHave('comments')->get();

Incluso si necesitas más potencia, puedes usar los métodos `whereDoesntHave` y `orWhereDoesntHave` para poner condiciones "where" en tus consultas `doesntHave`. Estos métodos permiten que agregues restricciones personalizadas a una restricción de relación, tal como verificar el contenido de un comentario:

    $posts = Post::whereDoesntHave('comments', function ($query) {
        $query->where('content', 'like', 'foo%');
    })->get();

Puedes usar notación "de puntos" para ejecutar una consulta contra una relación anidada. Por ejemplo, la siguiente consulta entregará todos los posts con comentarios de autores que no están vetados:

    $posts = App\Post::whereDoesntHave('comments.author', function ($query) {
        $query->where('banned', 1);
    })->get();

<a name="counting-related-models"></a>
### Contando Modelos Relacionados

si quieres contar el número de resultados de una relación sin cargarlos realmente puedes usar el método `withCount`, el cual coloca una columna `{relation}_count` en tus modelos resultantes. Por ejemplo:

    $posts = App\Post::withCount('comments')->get();

    foreach ($posts as $post) {
        echo $post->comments_count;
    }

Puedes agregar las "cuentas" para múltiples relaciones así como también agregar restricciones a las consultas:

    $posts = Post::withCount(['votes', 'comments' => function ($query) {
        $query->where('content', 'like', 'foo%');
    }])->get();

    echo $posts[0]->votes_count;
    echo $posts[0]->comments_count;

También puedes poner alias al resultado de la cuenta de la relación, permitiendo múltiples cuentas en la misma relación:

    $posts = App/post::withCount([
        'comments',
        'comments as pending_comments_count' => function ($query) {
            $query->where('approved', false);
        }
    ])->get();

    echo $posts[0]->comments_count;

    echo $posts[0]->pending_comments_count;

<a name="eager-loading"></a>
## Carga Previa

Al momento de acceder a las relaciones Eloquent como propiedades, los datos de la relación son "cargados diferidamente". Esto significa que los datos de la relación no son cargados realmente hasta que primero accedas a la propiedad. Sin embargo, Eloquent puede "cargar previamente" las relaciones al mismo tiempo que consultas el modelo padre. La carga previa alivia el problema de la consulta N + 1. Para ilustrar el problema de la consulta N + 1, considera un modelo `Book` que está relacionado a `Author`:

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

Ahora, vamos a obtener todos los libros y sus autores:

    $books = App\Book::all();

    foreach ($books as $book) {
        echo $book->author->name;
    }

Este ciclo ejecutará una consulta para obtener todos los libros en la tabla, despues otra consulta para cada libro para obtener el autor. Así, si tenemos 25 libros, este ciclo debería ejecutar 26 consultas: 1 para el libro original y 25 consultas adicionales para obtener el autor de cada libro.

Afortunadamente, podemos usar la carga previa para reducir esta operación a solo 2 consultas. Al momento de consultar, puedes especificar cuales relaciones deberían ser pre-cargadas usando el método `with`:

    $books = App\Book::with('author')->get();

    foreach ($books as $book) {
        echo $book->author->name;
    }

Para esta operación, solo dos consultas serán ejecutadas:

    select * from books

    select * from authors where id in (1, 2, 3, 4, 5, ...)

#### Carga Previa de Múltiples Relaciones

Algunas veces puedes necesitar la carga previa de varias relaciones diferentes en una operación única. Para hacer eso, pasa sólo los argumentos adicionales al método `with`:

    $books = App\Book::with(['author', 'publisher'])->get();

#### Carga Previa Anidada

Para pre-cargar relaciones anidadas, puedes usar la sintaxis de "punto". Por ejemplo, vamos a pre-cargar todos los autores de los libros y todos los contactos personales del autor en una instrucción de Eloquent:

    $books = App\Book::with('author.contacts')->get();

#### Cargando previamente Columnas Específicas

No siempre prodrás necesitar cada columna de la relación que estás obteniendo. Por esta razón, Eloquent permite que especifiques cuales columnas de la relación te gustaría obtener:

    $users = App\Book::with('author:id,name')->get();

> {note} Al momento de usar esta característica, siempre deberías incluir la columna `id` en la lista de columnas que deseas obtener.

<a name="constraining-eager-loads"></a>
### Restringiendo Cargas Previas

Algunas veces puedes desear cargar previamente una relación, pero también especificar restricciones de consulta para la consulta de carga previa. Aquí está un ejemplo:

    $users = App\User::with(['posts' => function ($query) {
        $query->where('title', 'like', '%first%');
    }])->get();

En este ejemplo, Eloquent solamente precargará los posts donde la columna `title` del post contenga la palabra `first`. Ciertamente, puedes ejecutar otros métodos de [constructor de consulta](/docs/{{version}}/queries) para personalizar más la operación de carga previa:

    $users = App\User::with(['posts' => function ($query) {
        $query->orderBy('created_at', 'desc');
    }])->get();

<a name="lazy-eager-loading"></a>
### Carga Previa Diferida

Algunas veces puedes necesitar pre-cargar una relación después de que el modelo padre ya ha sido obtenido. Por ejemplo, esto puede ser útil si necesitas decidir dinámicamente si se cargan modelos relacionados:

    $books = App\Book::all();

    if ($someCondition) {
        $books->load('author', 'publisher');
    }

Si necesitas establecer restricciones de consultas adicionales en la consulta de carga previa, puedes pasar un arreglo clave=>valor con las relaciones que deseas cargar. Los valores del arreglo deberían ser instancias `Closure` las cuales reciben las instancias de consultas:

    $books->load(['author' => function ($query) {
        $query->orderBy('published_date', 'asc');
    }]);

Para cargar una relación solamente cuando aún no ha sido cargada, usa el método `loadMissing`:

    public function format(Book $book)
    {
        $book->loadMissing('author');

        return [
            'name' => $book->name,
            'author' => $book->author->name
        ];
    }

<a name="inserting-and-updating-related-models"></a>
## Insertando & Actualizando Modelos Relacionados

<a name="the-save-method"></a>
### El Método Save

Eloquent proporciona métodos convenientes para agregar nuevos modelos a las relaciones. Por ejemplo, quizá necesites insertar un nuevo `Comment` para un modelo `Post`. En lugar de establecer manualmente el atributo `post_id` en el `Comment`, puedes insertar el `Comment` directamente con el método `save` de la relación:

    $comment = new App\Comment(['message' => 'A new comment.']);

    $post = App\Post::find(1);

    $post->comments()->save($comment);

Nota que no accedimos a la relación `comments` como una propiedad dinámica. En su lugar, ejecutamos el método `comments` para obtener una instancia de la relación. El método `save` automáticamente agregará el valor `post_id` apropiado al nuevo modelo `Comment`.

Si necesitas guardar múltiples modelos relacionados, puedes usar el método `saveMany`:

    $post = App\Post::find(1);

    $post->comments()->saveMany([
        new App\Comment(['message' => 'A new comment.']),
        new App\Comment(['message' => 'Another comment.']),
    ]);

<a name="the-push-method"></a>
#### Guardando Modelos y Relaciones Recursivamente

SI quieres hacer `save` a tu modelo y a todas sus relaciones asociadas, puedes usar el método `push`:

    $post = App\Post::find(1);

    $post->comments[0]->message = 'Message';
    $post->comments[0]->author->name = 'Author Name';

    $post->push();

<a name="the-create-method"></a>
### El Método Create

En adición a los métodos `save` y `saveMany`, también puedes usar el método `create`, el cual acepta un arreglo de atributos, crea un modelo y lo inserta dentro de la base de datos. Otra vez, la diferencia entre `save` y `create` es que `save` acepta una instancia de modelo Eloquent llena mientras `create` acepta un `array` PHP plano:

    $post = App\Post::find(1);

    $comment = $post->comments()->create([
        'message' => 'A new comment.',
    ]);

> {tip} Antes de usar el método `create`, asegurate de revisar la documentación sobre los atributos de [asignación en masa](/docs/{{version}}/eloquent#mass-assignment).

Puedes usar el método `createMany` para crear múltiples modelos relacionados:

    $post = App\Post::find(1);

    $post->comments()->createMany([
        [
            'message' => 'A new comment.',
        ],
        [
            'message' => 'Another new comment.',
        ],
    ]);

También puedes usar los métodos `findOrNew`, `firstOrNew`, `firstOrCreate` y `updateOrCreate` para [crear y actualizar modelos en relaciones](https://laravel.com/docs/{{version}}/eloquent#other-creation-methods).

<a name="updating-belongs-to-relationships"></a>
### Actualizar Relación Pertenece A

Al momento de actualizar una relación `belongsTo`, puedes usar el método `associate`. Este método establecerá la clave foránea en el modelo hijo:

    $account = App\Account::find(10);

    $user->account()->associate($account);

    $user->save();

Al momento de remover una relación `belongsTo`, puedes usar el método `dissociate`. Este método establecerá la clave foránea de la relación a `null`:

    $user->account()->dissociate();

    $user->save();

<a name="default-models"></a>
#### Modelos Predeterminados

La relación `belongsTo` te permite definir un modelo predeterminado que será regresado si la relación dada es `null`. A este patrón se le refiere comúnmente como  [Null Object pattern](https://en.wikipedia.org/wiki/Null_Object_pattern) y puede ayudar a remover chequeos condicionales en tu código. EN el ejemplo siguiente, la relación `user` devolverá un modelo `App\User` vacío si no hay un `user` adjunto a la publicación:

    /**
     * Get the author of the post.
     */
    public function user()
    {
        return $this->belongsTo('App\User')->withDefault();
    }

Para poblar el modelo predeterminado con atributos, puedes pasar un arreglo o Closure al método `withDefault`:

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

<a name="updating-many-to-many-relationships"></a>
### Relaciones Muchos a Muchos

#### Atando / Desatando

Eloquent también proporciona unos cuantas métodos helper para hacer que el trabajo con los modelos relacionados sea más conveniente. Por ejemplo, vamos a imaginar que un usuario tiene muchos roles y un rol puede tener muchos usuarios. Para atar un rol a un usuario insertando un registro en la tabla intermedia que vincula los modelos, usa el método `attach`:

    $user = App\User::find(1);

    $user->roles()->attach($roleId);

Al momento de atar una relación a un modelo, también puedes pasar un arreglo de datos adicionales para ser insertados dentro de la tabla intermedia:

    $user->roles()->attach($roleId, ['expires' => $expires]);

Ciertamente, algunas veces puede ser necesario remover un rol de un usuario. Para remover un registro de una relación muchos-a-muchos, usa el método `detach`. El método `detach` removerá el registro apropiado de la tabla intermedia; sin embargo, ambos modelos permanecerán en la base de datos:

    // Detach a single role from the user...
    $user->roles()->detach($roleId);

    // Detach all roles from the user...
    $user->roles()->detach();

Por conveniencia, `attach` y `detach` también aceptan arreglos de IDs como entrada:

    $user = App\User::find(1);

    $user->roles()->detach([1, 2, 3]);

    $user->roles()->attach([
        1 => ['expires' => $expires],
        2 => ['expires' => $expires]
    ]);

#### Sincronizando Asociaciones

También puedes usar el método `sync` para construir asociaciones muchos-a-muchos. El método `sync` acepta un arreglo de IDs para colocar en la tabla intermedia. Algunos IDs que no estén en el arreglo dado serán removidos de la tabla intermedia. Por tanto, después que esta operación se complete, solamente los IDs en el arreglo dado existirán en la tabla intermedia:

    $user->roles()->sync([1, 2, 3]);

También puedes pasar valores adicionales de tabla intermedia con los IDs:

    $user->roles()->sync([1 => ['expires' => true], 2, 3]);

Si no quieres desatar IDs existentes, puedes usar el método `syncWithoutDetaching`:

    $user->roles()->syncWithoutDetaching([1, 2, 3]);

#### Cambiando Asociaciones

La relación muchos-a-muchos también proporciona un método `toggle` el cual "cambia" el estado adjunto de los IDs dados. Si el ID está actualmente atado, será desatado. De igual forma, si está actualmente desatado, será atado:

    $user->roles()->toggle([1, 2, 3]);

#### Guardando Datos Adicionales en una Tabla Pivote

Al momento de trabajar con una relación muchos-a-muchos, el método `save` acepta un arreglo de atributos adicionales de tabla intermedia como su segundo argumento:

    App\User::find(1)->roles()->save($role, ['expires' => $expires]);

#### Actualizando un Registro en una Tabla Pivote

Si necesitas actualizar una fila existente en tu tabla pivote, puedes usar el método `updateExistingPivot`. Este método acepta la clave foránea del registro pivote y un arreglo de atributos para actualizar:

    $user = App\User::find(1);

    $user->roles()->updateExistingPivot($roleId, $attributes);

<a name="touching-parent-timestamps"></a>
## Tocando Marcas de Tiempo del Padre

Cuando un modelo `belongsTo` o `belongsToMany` a otro modelo, tal como un `Comment` el cual pertenece a un `Post`, algunas veces es útil actualizar la marca de tiempo del padre cuando el modelo hijo es actualizado. Por ejemplo, cuando un modelo `Comment` es actualizado, puedes querer "tocar" automáticamente la marca de tiempo `updated_at` del `Post` que lo posee. Eloquent hace esto fácil. Simplemente agrega una propiedad `touches` conteniendo los nombres de las relaciones al modelo hijo:

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

Ahora, cuando actualices un `Comment`, el `Post` que lo posee tendrá su columna `updated_at` actualizada también, haciendolo más conveniente para saber cuando invalidar un cache del modelo `Post`:

    $comment = App\Comment::find(1);

    $comment->text = 'Edit to this comment!';

    $comment->save();
