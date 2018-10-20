# Eloquent: API Resources

- [Introducción](#introduction)
- [Generando Recursos](#generating-resources)
- [Resumen de Concepto](#concept-overview)
- [Escribiendo Recursos](#writing-resources)
    - [Envoltorio de Datos](#data-wrapping)
    - [Paginación](#pagination)
    - [Atributos Condicionales](#conditional-attributes)
    - [Relaciones Condicionales](#conditional-relationships)
    - [Agregando Meta Datos](#adding-meta-data)
- [Respuestas de Recursos](#resource-responses)

<a name="introduction"></a>
## Introducción

Al momento de construir una API, puedes necesitar una capa de transformación que se coloque entre tus modelos de Eloquent y las respuestas JSON que son devueltas realmente a los usuarios de tu aplicación. Las clases de recursos de Laravel permiten que transformes expresivamente y fácilmente tus modelos y colecciones de modelos en JSON.

<a name="generating-resources"></a>
## Generando Recursos

Para generar una clase de recurso, puedes usar el comando Artisan `make:resource`. De forma predeterminada, los recursos serán colocados en el directorio `app/Http/Resources` de tu aplicación. Los recursos extienden la clase `Illuminate\Http\Resources\Json\Resource`:

    php artisan make:resource UserResource

#### Colecciones de Recursos

Además de generar recursos que transforman los modelos individuales, puedes generar recursos que sean responsables de transformar colecciones de modelos. Esto permite que tu respuesta incluya enlaces y otra meta información que sea relevante a una colección entera de un recurso dado.

Para crear una colección de recursos, deberías usar el indicador `--collection` al momento de crear el recurso. O, incluir la palabra `Collection` en el nombre del recurso, lo que le indicará a Laravel que debería crear un recurso de colección. Los recursos de colección extienden la clase `Illuminate\Http\Resources\Json\ResourceCollection`:

    php artisan make:resource Users --collection

    php artisan make:resource UserCollection

<a name="concept-overview"></a>
## Resumen de Concepto

> {tip} Esto es un resumen del último nivel de recursos y colecciones de recursos. Es aconsejable que leas las otras secciones de esta documentación para que ganes un conocimiento más a fondo de la personalización y la potencia que te ofrecen los recursos.

Antes de profundizar en todas las opciones disponibles para tí al momento de escribir recursos, primero vamos a echar un vistazo a como los recursos son usados dentro de Laravel. Una clase de recurso representa un solo modelo que necesita ser transformado en una estructura JSON. Por ejemplo, aquí está una clase `UserResource` básica:

    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Resources\Json\Resource;

    class UserResource extends Resource
    {
        /**
         * Transform the resource into an array.
         *
         * @param  \Illuminate\Http\Request
         * @return array
         */
        public function toArray($request)
        {
            return [
                'id' => $this->id,
                'name' => $this->name,
                'email' => $this->email,
                'created_at' => $this->created_at,
                'updated_at' => $this->updated_at,
            ];
        }
    }

Cada clase de recurso define un método `toArray` el cual devuelve el arreglo de atributos que debería ser convertido a JSON al momento de enviar la respuesta. Observa que podemos acceder a las propiedades del modelo directamente desde la variable `$this`. Esto es debido a que una clase de  recurso representará automáticamente la propiedad y método que acceden al modelo subyacente para un acceso conveniente. Una vez que el recurso es definido, puede ser devuelto desde una ruta o controlador:

    use App\User;
    use App\Http\Resources\UserResource;

    Route::get('/user', function () {
        return new UserResource(User::find(1));
    });

### Colecciones de Recursos

Si estás devolviendo una colección de recursos o una respuesta paginada, puedes usar el método `collection` al momento de crear la instancia de recurso en tu ruta o controlador:

    use App\User;
    use App\Http\Resources\UserResource;

    Route::get('/user', function () {
        return UserResource::collection(User::all());
    });

Ciertamente, esto no permite alguna adición de meta datos que pueda necesitar ser devuelta con la colección. Si prefieres personalizar la respuesta de colección de recursos, puedes crear un recurso dedicado para representar la colección:

    php artisan make:resource UserCollection

Una vez que la clase de colección de recursos ha sido generada, puedes definir fácilmente cualquiera de los meta datos que deberían estar incluidos con la respuesta:

    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Resources\Json\ResourceCollection;

    class UserCollection extends ResourceCollection
    {
        /**
         * Transform the resource collection into an array.
         *
         * @param  \Illuminate\Http\Request
         * @return array
         */
        public function toArray($request)
        {
            return [
                'data' => $this->collection,
                'links' => [
                    'self' => 'link-value',
                ],
            ];
        }
    }

Despues de definir tu colección de recursos, esta puede ser devuelta desde una ruta o controlador:

    use App\User;
    use App\Http\Resources\UserCollection;

    Route::get('/users', function () {
        return new UserCollection(User::all());
    });

<a name="writing-resources"></a>
## Escribiendo Recursos

> {tip} Si no has leído el [resumen de concepto](#concept-overview), es aconsejable que lo hagas antes de proceder con esta documentación.

En esencia, los recursos son sencillos. Solamente necesitan transformar un modelo dado en un arreglo. Así, cada recurso contiene un método `toArray` el cual traduce los atributos de tu modelo en un arreglo amigable para API que puede ser retornado a tus usuarios:

    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Resources\Json\Resource;

    class UserResource extends Resource
    {
        /**
         * Transform the resource into an array.
         *
         * @param  \Illuminate\Http\Request
         * @return array
         */
        public function toArray($request)
        {
            return [
                'id' => $this->id,
                'name' => $this->name,
                'email' => $this->email,
                'created_at' => $this->created_at,
                'updated_at' => $this->updated_at,
            ];
        }
    }

Una vez que un recurso ha sido definido, puede ser devuelto directamente desde una ruta o controlador:

    use App\User;
    use App\Http\Resources\UserResource;

    Route::get('/user', function () {
        return new UserResource(User::find(1));
    });

#### Relaciones

Si prefieres incluir recursos relacionados en tu respuesta, puedes agregarlos al arreglo devuelto por tu método `toArray`. En este ejemplo, usaremos el método `collection` del recurso `Post` para agregar los posts de blog de usuario a la respuesta de recurso:

    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'posts' => Post::collection($this->posts),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

> {tip} Si prefieres incluir solamente relaciones cuando ya han sido cargadas, revisa la documentación sobre [relaciones condicionales](#conditional-relationships).

#### Colecciones de Recursos

Mientras los recursos traducen un solo modelo dentro de un arreglo, las colecciones de recursos traducen una colección de modelos dentro de un arreglo. No es absolutamente necesario definir una clase de colección de recursos para cada uno de tus tipos de modelo ya que todos los recursos proporcionan un método `collection` para generar una colección de recursos "para que esto se haga" en el momento:

    use App\User;
    use App\Http\Resources\UserResource;

    Route::get('/user', function () {
        return UserResource::collection(User::all());
    });

Sin embargo, si necesitas personalizar los meta datos devueltos con la colección, será necesario que definas una colección de recursos:

    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Resources\Json\ResourceCollection;

    class UserCollection extends ResourceCollection
    {
        /**
         * Transform the resource collection into an array.
         *
         * @param  \Illuminate\Http\Request
         * @return array
         */
        public function toArray($request)
        {
            return [
                'data' => $this->collection,
                'links' => [
                    'self' => 'link-value',
                ],
            ];
        }
    }

Al igual que los recursos singulares, las colecciones de recursos pueden ser devueltas directamente desde las rutas o controladores:

    use App\User;
    use App\Http\Resources\UserCollection;

    Route::get('/users', function () {
        return new UserCollection(User::all());
    });

<a name="data-wrapping"></a>
### Envoltorio de Datos

De forma predeterminada, tu recurso más externo es envuelto en una clave `data` cuando la respuesta del recurso es convertida a JSON. Así, por ejemplo, una respuesta de colección de recurso típica luce como lo siguiente:

    {
        "data": [
            {
                "id": 1,
                "name": "Eladio Schroeder Sr.",
                "email": "therese28@example.com",
            },
            {
                "id": 2,
                "name": "Liliana Mayert",
                "email": "evandervort@example.com",
            }
        ]
    }

Si prefieres deshabilitar el envoltorio del recurso más externo, puedes usar el método `withoutWrapping` en la clase de recurso base. Típicamente, deberías ejecutar este método desde tu `AppServiceProvider` u otro [proveedor de servicio](/docs/{{version}}/providers) que sea cargado en cada solicitud de tu aplicación:

    <?php

    namespace App\Providers;

    use Illuminate\Support\ServiceProvider;
    use Illuminate\Http\Resources\Json\Resource;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Perform post-registration booting of services.
         *
         * @return void
         */
        public function boot()
        {
            Resource::withoutWrapping();
        }

        /**
         * Register bindings in the container.
         *
         * @return void
         */
        public function register()
        {
            //
        }
    }

> {note} El método `withoutWrapping` afecta solamente la respuesta más externa y no removerá las claves de `data` que agregaste manualmente a tus propias colecciones de recursos.

### Envolviendo Recursos Anidados

Tienes total libertad para determinar la forma en la que tus relaciones de recursos son envueltas. Si prefieres que todas las colecciones de recursos sean envueltas en una clave `data`, a pesar de las dificultades de su anidamiento, deberías definir una clase de colección de recursos para cada recurso y devolver la colección dentro de una clave `data`.

Ciertamente, puedes estar preguntandote si esto causará que tus recursos más externos sean envueltos en dos claves `data`. No te preocupes, Laravel nunca permitirá que tus recursos sean envueltos doblemente por accidente, como consecuencia no tienes que estar preocupado sobre el nivel de anidamiento de la colección de recursos que estás transformando:

    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Resources\Json\ResourceCollection;

    class CommentsCollection extends ResourceCollection
    {
        /**
         * Transform the resource collection into an array.
         *
         * @param  \Illuminate\Http\Request
         * @return array
         */
        public function toArray($request)
        {
            return ['data' => $this->collection];
        }
    }

### Envoltorio de Datos y Paginación

Al momento de devolver colecciones paginadas en una respuesta de recurso, Laravel envolverá tus datos de recursos en una clave `data` incluso si el método `withoutWrapping` ha sido ejecutado. Esto es porque las respuestas paginadas siempre contienen las claves `meta` y `links` con información sobre el estado del paginador:

    {
        "data": [
            {
                "id": 1,
                "name": "Eladio Schroeder Sr.",
                "email": "therese28@example.com",
            },
            {
                "id": 2,
                "name": "Liliana Mayert",
                "email": "evandervort@example.com",
            }
        ],
        "links":{
            "first": "http://example.com/pagination?page=1",
            "last": "http://example.com/pagination?page=1",
            "prev": null,
            "next": null
        },
        "meta":{
            "current_page": 1,
            "from": 1,
            "last_page": 1,
            "path": "http://example.com/pagination",
            "per_page": 15,
            "to": 10,
            "total": 10
        }
    }

<a name="pagination"></a>
### Paginación

Siempre puedes pasar una instancia de paginador al método `collection` de un recurso o una colección de recursos personalizada:

    use App\User;
    use App\Http\Resources\UserCollection;

    Route::get('/users', function () {
        return new UserCollection(User::paginate());
    });

Las respuestas paginadas siempre contienen las claves `meta` y `links` con información sobre el estado del paginador:

    {
        "data": [
            {
                "id": 1,
                "name": "Eladio Schroeder Sr.",
                "email": "therese28@example.com",
            },
            {
                "id": 2,
                "name": "Liliana Mayert",
                "email": "evandervort@example.com",
            }
        ],
        "links":{
            "first": "http://example.com/pagination?page=1",
            "last": "http://example.com/pagination?page=1",
            "prev": null,
            "next": null
        },
        "meta":{
            "current_page": 1,
            "from": 1,
            "last_page": 1,
            "path": "http://example.com/pagination",
            "per_page": 15,
            "to": 10,
            "total": 10
        }
    }

<a name="conditional-attributes"></a>
### Atributos Condicionales

Algunas veces puedes querer incluir un atributo en una respuesta de recurso solamente si una condición dada es cumplida. Por ejemplo, puedes querer incluir solamente un valor si el usuario actual es un "administrador". Laravel proporciona una variedad de métodos helper para asistirte en esta situación. El método `when` puede ser usado para agregar condicionalmente un atributo a una respuesta de recurso:

    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'secret' => $this->when($this->isAdmin(), 'secret-value'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

En este ejemplo, la clave `secret` solamente será devuelta en la respuesta final si el método `$this->isAdmin()` devuelve `true`. Si el método devuelve `false`, la clave `secret` será removida completamente de la respuesta del recurso antes de que sea enviada de regreso al cliente. El método `when` permite que definas expresivamente tus recursos sin usar como último recurso instrucciones condicionales al momento de construir el arreglo.

El método `when` también acepta una Closure como su segundo argumento, permitiéndote calcular el valor resultante solamente si la condición dada es `true`:

    'secret' => $this->when($this->isAdmin(), function () {
        return 'secret-value';
    }),

> {tip} Recuerda, las ejecuciones de métodos sobre los recursos representan la instancia del modelo subyacente. Así que, en este caso, el método `isAdmin` está representando al modelo Eloquent subyacente que fue dado originalmente al recurso.

#### Mezclando Atributos Condicionales

Algunas veces puedes tener varios atributos que deberían ser incluidos solamente en la respuesta del recurso en base a la misma condición. En este caso, puedes usar el método `mergeWhen` para incluir los atributos en la respuesta solamente cuando la condición dada sea `true`:

    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            $this->mergeWhen($this->isAdmin(), [
                'first-secret' => 'value',
                'second-secret' => 'value',
            ]),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

Otra vez, si la condición dada es `false`, estos atributos serán removidos completamente de la respuesta del recurso antes de que sea enviada al cliente.

> {note} El método `mergeWhen` no debería ser usado dentro de arreglos que mezclan claves de cadenas y numéricas. Tampoco debería ser usadas dentro de arreglos con claves numéricas que no estén ordenados secuencialmente.

<a name="conditional-relationships"></a>
### Relaciones Condicionales

Además de cargar atributos condicionalmente, puedes incluir relaciones condicionalmente en tus respuestas de recursos dependiendo de si la relaciones ya han sido cargadas en el modelo. Esto permite que tu controlador decida cuáles relaciones deberían ser cargadas en el modelo y tu recurso pueda incluirlos fácilmente cuando hayan sido cargados realmente.

Finalmente, esto hace que sea más fácil evitar los problemas de consulta "N+1" dentro de tus recursos. El método `whenLoaded` puede ser usado para cargar una relación condicionalmente. Con el propósito de evitar cargar innecesariamente las relaciones, este método acepta el nombre de la relación en lugar de la relación misma:

    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'posts' => Post::collection($this->whenLoaded('posts')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

En este ejemplo, si la relación no ha sido cargada, la clave `posts` será removida completamenta de la respuesta de recurso antes de que sea enviada al cliente.

#### Información de Pivote Condicional

Además de información de relación que se incluye condicionalmente en tus respuestas de recurso, condicionalmente puedes incluir datos de las tablas intermedias de las relaciones muchos-a-muchos usando el método `whenPivotLoaded`. El método `whenPivotLoaded` acepta el nombre de la tabla pivote como su primer argumento. El segundo argumento debería ser una Closure que defina el valor a ser devuelto si la información pivote está disponible en el modelo:

    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'expires_at' => $this->whenPivotLoaded('role_users', function () {
                return $this->pivot->expires_at;
            }),
        ];
    }

<a name="adding-meta-data"></a>
### Agregando Meta Datos

Algunos estándares API de JSON requieren la adición de meta datos en tus respuestas de recursos y colecciones de recursos. Esto incluye frecuentemente cosas como `links` del recurso o recursos relacionados o meta datos sobre el mismo recurso. Si necesitas devolver meta datos adicionales sobre un recurso, inclúyelo en tu método `toArray`. Por ejemplo, podrías incluir información de `link` al momento de transformar una colección de recursos:

    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'data' => $this->collection,
            'links' => [
                'self' => 'link-value',
            ],
        ];
    }

Al momento de devolver meta datos adicionales de tus recursos, nunca tienes que preocupate acerca de sobrescribir accidentalmente las claves `links` o `meta` que son agregadas automáticamente por Laravel al momento de devolver respuestas paginadas. Cualquiera de los `links` adicionales que definas serán mezclados con los enlaces proporcionados por el paginador.

#### Meta Datos del Nivel más Alto

Algunas veces puedes querer incluir ciertos meta datos solamente con una respuesta de recurso si el recurso es el recurso más externo que está siendo devuelto. Típicamente, esto incluye meta información sobre la respuesta como un todo. Para definir este meta dato, agrega un método `with` a tu clase de recurso. Este método debería devolver un arreglo de meta datos a ser incluido con la respuesta del recurso solamente cuando el recurso es el recurso más externo que esta siendo renderizado.

    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Resources\Json\ResourceCollection;

    class UserCollection extends ResourceCollection
    {
        /**
         * Transform the resource collection into an array.
         *
         * @param  \Illuminate\Http\Request
         * @return array
         */
        public function toArray($request)
        {
            return parent::toArray($request);
        }

        /**
         * Get additional data that should be returned with the resource array.
         *
         * @param \Illuminate\Http\Request  $request
         * @return array
         */
        public function with($request)
        {
            return [
                'meta' => [
                    'key' => 'value',
                ],
            ];
        }
    }

#### Agregando Meta Datos Al Momento de Construir Recursos

También puedes agregar datos de nivel más alto al momento de construir instancias de recursos en tu ruta o controlador. El método `additional`, el cual está disponible en todos los recursos, acepta un arreglo de datos que debería ser agregado a la respuesta del recurso: 

    return (new UserCollection(User::all()->load('roles')))
                    ->additional(['meta' => [
                        'key' => 'value',
                    ]]);

<a name="resource-responses"></a>
## Respuestas de Recursos

Como ya has leído, los recursos pueden ser devueltos directamente desde rutas y controladores:

    use App\User;
    use App\Http\Resources\UserResource;

    Route::get('/user', function () {
        return new UserResource(User::find(1));
    });

Sin embargo, algunas veces puedes necesitar personalizar la respuesta HTTP que sale antes de que sea enviada al cliente. Hay dos formas para cumplir esto. Primero, puedes encadenar el método `response` junto al recurso. Este método devolverá una instancia `Illuminate\Http\Response`, permitiendote controlar totalmente los encabezados de la respuesta:

    use App\User;
    use App\Http\Resources\UserResource;

    Route::get('/user', function () {
        return (new UserResource(User::find(1)))
                    ->response()
                    ->header('X-Value', 'True');
    });

Alternativamente, puedes definir un método `withResponse` dentro del mismo recurso. Este método será ejecutado cuando el recurso sea devuelto como el recurso más externo en la respuesta:

    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Resources\Json\Resource;

    class UserResource extends Resource
    {
        /**
         * Transform the resource into an array.
         *
         * @param  \Illuminate\Http\Request
         * @return array
         */
        public function toArray($request)
        {
            return [
                'id' => $this->id,
            ];
        }

        /**
         * Customize the outgoing response for the resource.
         *
         * @param  \Illuminate\Http\Request
         * @param  \Illuminate\Http\Response
         * @return void
         */
        public function withResponse($request, $response)
        {
            $response->header('X-Value', 'True');
        }
    }
