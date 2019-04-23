::: v-pre

# Eloquent: Recursos API

- [Introducción](#introduction)
- [Generación de Recursos](#generating-resources)
- [Descripción General del Concepto](#concept-overview)
    - [Colecciones de Recursos](#resource-collections)
- [Escritura de Recursos](#writing-resources)
    - [Envoltura de datos](#data-wrapping)
    - [Paginación](#pagination)
    - [Atributos Condicionales](#conditional-attributes)
    - [Relaciones Condicionales](#conditional-relationships)
    - [Añadiendo Metadatos](#adding-meta-data)
- [Respuestas de recursos](#resource-responses)

<a name="introduction"></a>
## Introducción

Al crear una API, es posible que necesites una capa de transformación que se ubique entre tus modelos Eloquent y las respuestas JSON que realmente se devuelven a los usuarios de tu aplicación. Las clases de recursos de Laravel te permiten transformar tus modelos y colecciones de modelos de forma expresiva y sencilla en JSON.

<a name="generating-resources"></a>
## Generación de Recursos

Para generar un clase recurso, puedes usar el comando de Artisan `make:resource`. Por defecto, los recursos estará localizado en el directorio `app/Http/Resources` de tu aplicación. Los Recursos extiende de la clase `Illuminate\Http\Resources\Json\JsonResource`:

```php
php artisan make:resource User
```

#### Colecciones de Recurso

Además de generar recursos que transforman modelos individuales, puedes generar recursos que sean responsables de transformar colecciones de modelos. Esto permite que tu respuesta incluya enlaces y otra metainformación relevante para una colección completa de un recurso determinado.

Para crear una colección de recursos, debes utilizar la opción `--collection` al crear el recurso. O, incluir la palabra `Colección` en el nombre del recurso que le indicará a Laravel que debe crear un recurso de colección. Los recursos de colección extienden la clase `Illuminate\Http\Resources\Json\ResourceCollection`:

```php
php artisan make:resource Users --collection

php artisan make:resource UserCollection
```

<a name="concept-overview"></a>
## Descripción General del Concepto

::: tip
Esta es una explicación general de recursos y colecciones de recursos. Te recomendamos que leas las otras secciones de esta documentación para obtener una comprensión más profunda de la personalización y el poder que te ofrecen los recursos.
:::

Antes de sumergirse en todas las opciones disponibles para escribir recursos, primero analicemos cómo se utilizan los recursos dentro de Laravel. Una clase de recurso representa un modelo único que debe transformarse en una estructura JSON. Por ejemplo, aquí hay una clase de recurso `User` simple:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class User extends JsonResource
{
    /**
    * Transform the resource into an array.
    *
    * @param  \Illuminate\Http\Request  $request
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
```

Cada clase de recurso define un método `toArray` que devuelve el arreglo de atributos que deben convertirse a JSON al enviar la respuesta. Observa que podemos acceder a las propiedades del modelo directamente desde la variable `$this`. Esto es porque la clase del recurso va a redirigir de manera automática el acceso de propiedades y métodos al modelo asignado. Una vez que se define el recurso, se puede devolver desde una ruta o controlador:

```php
use App\User;
use App\Http\Resources\User as UserResource;

Route::get('/user', function () {
    return new UserResource(User::find(1));
});
```

<a name="resource-collections"></a>
### Colecciones de Recurso

Si estás devolviendo una colección de recursos o una respuesta paginada, puedes usar el método `collection` al crear la instancia de recursos en tu ruta o controlador:

```php
use App\User;
use App\Http\Resources\User as UserResource;

Route::get('/user', function () {
    return UserResource::collection(User::all());
});
```

Observa que esto no permite ninguna adición de metadatos que pueden necesitar ser retornados con la colección. Si deseas personalizar la respuesta de la colección de recursos, puedes crear un recurso dedicado para representar la colección:

```php
php artisan make:resource UserCollection
```

Una vez que se ha generado la clase de colección de recursos, puedes definir fácilmente los metadatos que deben incluirse con la respuesta:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
    * Transform the resource collection into an array.
    *
    * @param  \Illuminate\Http\Request  $request
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
```

Después de definir tu colección de recursos, ésta la puedes devolver desde una ruta o controlador:

```php
use App\User;
use App\Http\Resources\UserCollection;

Route::get('/users', function () {
    return new UserCollection(User::all());
});
```

#### Preservando La Colección De LLaves

Cuando se retorna un recurso de colección desde una ruta, Laravel reinicia las llaves de la colección para que éstas estén en un simple orden numérico. Sin embargo, puedes añadir una propiedad `preserveKeys` a tu clase de recurso indicando si esta colección de llaves debería preservarse:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class User extends JsonResource
{
    /**
    * Indicates if the resource's collection keys should be preserved.
    *
    * @var bool
    */
    public $preserveKeys = true;
}
```

Cuando la propiedad `preserveKeys` es colocada en `true`, la colección de llaves será preservada:

```php
use App\User;
use App\Http\Resources\User as UserResource;

Route::get('/user', function () {
    return UserResource::collection(User::all()->keyBy->id);
});
```

#### Personalización de la Clase de Recurso Subyacente

Normalmente, la propiedad `$this->collection` de una colección de recursos se rellena automáticamente con el resultado de la asignación de cada elemento de la colección a su clase de recurso singular. Se asume que la clase de recurso singular es el nombre de clase de la colección sin la cadena `Collection` al final.

Por ejemplo, `UserCollection` intentará asignar las instancias de usuario dadas al recurso `User`. Para personalizar este comportamiento, puedes anular la propiedad `$collects` de tu colección de recursos:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
    * The resource that this resource collects.
    *
    * @var string
    */
    public $collects = 'App\Http\Resources\Member';
}
```

<a name="writing-resources"></a>
## Escritura de Recursos

::: tip
Si no has leído la [descripción general del concepto](#concept-overview), te recomendamos que lo hagas antes de continuar con esta documentación.
:::

En esencia, los recursos son simples. Solo necesitan transformar un modelo dado en un arreglo. Por lo tanto, cada recurso contiene un método `toArray` que traduce los atributos de tu modelo en un arreglo amigable con la API que se puede devolver a sus usuarios:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class User extends JsonResource
{
    /**
    * Transform the resource into an array.
    *
    * @param  \Illuminate\Http\Request  $request
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
```

Una vez que has definido un recurso, lo puedes devolver directamente desde una ruta o controlador:

```php
use App\User;
use App\Http\Resources\User as UserResource;

Route::get('/user', function () {
    return new UserResource(User::find(1));
});
```

#### Relaciones

Si deseas incluir recursos relacionados en tu respuesta, puedes agregarlos al arreglo devuelto por tu método `toArray`. En este ejemplo, usaremos el método `collection` del recurso `Post` para agregar las publicaciones del blog del usuario a la respuesta del recurso:

```php
/**
* Transform the resource into an array.
*
* @param  \Illuminate\Http\Request  $request
* @return array
*/
public function toArray($request)
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'posts' => PostResource::collection($this->posts),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

::: tip
Si deseas incluir relaciones solo cuando ya se han cargado, consulte la documentación sobre [relaciones condicionales](#conditional-relationships).
:::

#### Colecciones de Recurso

Si bien los recursos traducen un modelo único en un arreglo, las colecciones de recursos traducen una colección de modelos en un arreglo. No es absolutamente necesario definir una clase de colección de recursos para cada uno de los tipos de modelo ya que todos los recursos proporcionan un método `collection` para generar una colección de recursos "ad-hoc" sobre la marcha:

```php
use App\User;
use App\Http\Resources\User as UserResource;

Route::get('/user', function () {
    return UserResource::collection(User::all());
});
```

Sin embargo, si necesitas personalizar los metadatos devueltos con la colección, será necesario definir una colección de recursos:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
    * Transform the resource collection into an array.
    *
    * @param  \Illuminate\Http\Request  $request
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
```

Al igual que los recursos singulares, las colecciones de recursos se pueden devolver directamente desde las rutas o los controladores:

```php
use App\User;
use App\Http\Resources\UserCollection;

Route::get('/users', function () {
    return new UserCollection(User::all());
});
```

<a name="data-wrapping"></a>
### Envoltura de datos

Por defecto, tu recurso más externo está envuelto en una clave `data` cuando la respuesta del recurso se convierte a JSON. Entonces, por ejemplo, una respuesta típica de colección de recursos se parece a lo siguiente:

```php
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
```    

Si deseas deshabilitar la envoltura del recurso más externo, puede usar el método `withoutWrapping` en la clase de recurso base. Por lo general, debes llamar a este método desde su `AppServiceProvider` u otro [proveedor de servicios](/docs/{{version}}/providers) que se carga en cada solicitud a tu aplicación:

```php
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
```

::: danger Nota
El método `withoutWrapping` solo afecta a la respuesta más externa y no eliminará las claves` data` que agregues manualmente a tus propias colecciones de recursos.
:::

### Envoltura de recursos anidados

Tienes total libertad para determinar cómo se envuelven las relaciones de tus recursos. Si deseas que todas las colecciones de recursos se envuelvan en una clave `data`, independientemente de su anidamiento, debes definir una clase de colección de recursos para cada recurso y devolver la colección dentro de una clave` data`.

Puedes que te estés preguntando si esto hará que tu recurso más externo se incluya en dos claves `data`. No te preocupes, Laravel nunca permitirá que tus recursos se envuelvan por error, por lo que no tienes que preocuparte por el nivel de anidamiento de la colección de recursos que estás transformando:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class CommentsCollection extends ResourceCollection
{
    /**
    * Transform the resource collection into an array.
    *
    * @param  \Illuminate\Http\Request  $request
    * @return array
    */
    public function toArray($request)
    {
        return ['data' => $this->collection];
    }
}
```

### Envoltura de Datos y Paginación

Al devolver colecciones paginadas en una respuesta de recursos, Laravel ajustará tus datos de recursos en una clave `data` incluso si se ha llamado al método` withoutWrapping`. Esto se debe a que las respuestas paginadas siempre contienen claves `meta` y` links` con información sobre el estado del paginador:

```php
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
```

<a name="pagination"></a>
### Paginación

Siempre puedes pasar una instancia del paginador al método `collection` de un recurso o a una colección de recursos personalizada:

```php
use App\User;
use App\Http\Resources\UserCollection;

Route::get('/users', function () {
    return new UserCollection(User::paginate());
});
```

Las respuestas paginadas siempre contienen claves `meta` y `links` con información sobre el estado del paginador:

```php
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
```

<a name="conditional-attributes"></a>
### Atributos Condicionales

En ocasiones, es posible que desees incluir solo un atributo en una respuesta de recurso si se cumple una condición determinada. Por ejemplo, es posible que desee incluir solo un valor si el usuario actual es un "administrador". Laravel proporciona una variedad de métodos de ayuda para ayudarlo en esta situación. El método `when` se puede usar para agregar condicionalmente un atributo a una respuesta de recurso:

```php
/**
* Transform the resource into an array.
*
* @param  \Illuminate\Http\Request  $request
* @return array
*/
public function toArray($request)
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'secret' => $this->when(Auth::user()->isAdmin(), 'secret-value'),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

En este ejemplo, la clave `secret` solo se devolverá en la respuesta final del recurso si el método `isAdmin` del usuario autenticado devuelve `true`. Si el método devuelve `false`, la clave `secret` se eliminará de la respuesta del recurso por completo antes de que se envíe de nuevo al cliente. El método `when` te permite definir expresivamente tus recursos sin tener que recurrir a sentencias condicionales al construir el arreglo.

El método `when` también acepta un Closure como segundo argumento, lo que te permite calcular el valor resultante solo si la condición dada es` true`:

```php
'secret' => $this->when(Auth::user()->isAdmin(), function () {
    return 'secret-value';
}),
```

#### Fusionar atributos condicionales

En ocasiones, es posible que tenga varios atributos que solo deben incluirse en la respuesta del recurso según la misma condición. En este caso, puede usar el método `mergeWhen` para incluir los atributos en la respuesta solo cuando la condición dada es `true`:

```php
/**
* Transform the resource into an array.
*
* @param  \Illuminate\Http\Request  $request
* @return array
*/
public function toArray($request)
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        $this->mergeWhen(Auth::user()->isAdmin(), [
            'first-secret' => 'value',
            'second-secret' => 'value',
        ]),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

Nuevamente, si la condición dada es `false`, estos atributos se eliminarán de la respuesta del recurso por completo antes de que se envíe al cliente.

::: danger Nota
El método `mergeWhen` no debe usarse dentro de arreglos que mezclen claves de cadenas de caracteres y claves numéricas. Además, no se debe utilizar dentro de arreglos con claves numéricas que no están ordenadas secuencialmente.
:::

<a name="conditional-relationships"></a>
### Relaciones Condicionales

Además de cargar condicionalmente los atributos, puedes incluir condicionalmente relaciones en tus respuestas de recursos en función de si la relación ya se ha cargado en el modelo. Esto permite que tu controlador decida qué relaciones deben cargarse en el modelo y tu recurso puede incluirlas fácilmente solo cuando realmente se hayan cargado.

Fundamentalmente, esto hace que sea más fácil evitar los problemas de consulta "N + 1" dentro de tus recursos. El método `whenLoaded` puede usarse para cargar condicionalmente una relación. Para evitar cargar relaciones innecesariamente, este método acepta el nombre de la relación en lugar de la relación en sí:

```php
/**
* Transform the resource into an array.
*
* @param  \Illuminate\Http\Request  $request
* @return array
*/
public function toArray($request)
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'posts' => PostResource::collection($this->whenLoaded('posts')),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

En este ejemplo, si la relación no se ha cargado, la clave `posts` se eliminará de la respuesta del recurso por completo antes de que se envíe al cliente.

#### Información de Pivote Condicional

Además de incluir condicionalmente la información de la relación en tus respuestas de recursos, puedes incluir condicionalmente datos de las tablas intermedias de relaciones de muchos a muchos utilizando el método `whenPivotLoaded`. El método `whenPivotLoaded` acepta el nombre de la tabla pivote como su primer argumento. El segundo argumento debe ser un Closure que defina el valor que se devolverá si la información pivote está disponible en el modelo:

```php
/**
* Transform the resource into an array.
*
* @param  \Illuminate\Http\Request  $request
* @return array
*/
public function toArray($request)
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'expires_at' => $this->whenPivotLoaded('role_user', function () {
            return $this->pivot->expires_at;
        }),
    ];
}
```

Si tu tabla intermedia utiliza un accesador distinto de `pivot`, puede usar el método` whenPivotLoadedAs`:

```php
/**
* Transform the resource into an array.
*
* @param  \Illuminate\Http\Request  $request
* @return array
*/
public function toArray($request)
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'expires_at' => $this->whenPivotLoadedAs('subscription', 'role_user', function () {
            return $this->subscription->expires_at;
        }),
    ];
}
```

<a name="adding-meta-data"></a>
### Añadiendo Metadatos

Algunos estándares de API de JSON requieren la adición de metadatos a tus respuestas de recursos y colecciones de recursos. Esto a menudo incluye cosas como `links` al recurso o recursos relacionados, o metadatos sobre el recurso en sí. Si necesitas devolver metadatos adicionales sobre un recurso, inclúyelos en tu método `toArray`. Por ejemplo, puedes incluir información de `link` al transformar una colección de recursos:

```php
/**
* Transform the resource into an array.
*
* @param  \Illuminate\Http\Request  $request
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
```

Al devolver metadatos adicionales de sus recursos, nunca tendrás que preocuparte por anular accidentalmente las claves `links` o` meta` que Laravel agrega automáticamente al devolver las respuestas paginadas. Cualquier `links` adicional que definas se fusionará con los enlaces proporcionados por el paginador.

#### Metadatos de nivel superior

A veces, es posible que desees incluir solo ciertos metadatos con una respuesta de recurso si el recurso es el recurso más externo que se devuelve. Por lo general, esto incluye información meta sobre la respuesta como un todo. Para definir estos metadatos, agrega un método `with` a tu clase de recurso. Este método debería devolver un arreglo de metadatos que se incluirá con la respuesta del recurso solo cuando el recurso sea el recurso más externo que se está llamando:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
    * Transform the resource collection into an array.
    *
    * @param  \Illuminate\Http\Request  $request
    * @return array
    */
    public function toArray($request)
    {
        return parent::toArray($request);
    }

    /**
    * Get additional data that should be returned with the resource array.
    *
    * @param  \Illuminate\Http\Request  $request
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
```

#### Añadiendo metadatos al construir recursos

También puedes agregar datos de nivel superior al construir de instancias de recursos en tu ruta o controlador. El método `additional`, que está disponible en todos los recursos, acepta un arreglo de datos que deberían agregarse a la respuesta del recurso:

```php
return (new UserCollection(User::all()->load('roles')))
                ->additional(['meta' => [
                    'key' => 'value',
                ]]);
```

<a name="resource-responses"></a>
## Respuestas de Recurso

Como ya has leído, los recursos pueden devolverse directamente desde las rutas y los controladores:

```php
use App\User;
use App\Http\Resources\User as UserResource;

Route::get('/user', function () {
    return new UserResource(User::find(1));
});
```

Sin embargo, a veces es posible que necesites personalizar la respuesta HTTP saliente antes de enviarla al cliente. Hay dos maneras de lograr esto. Primero, puedes encadenar el método `response` en el recurso. Este método devolverá una instancia de `Illuminate\Http\Response`, que te permite un control total de los encabezados de la respuesta:

```php
use App\User;
use App\Http\Resources\User as UserResource;

Route::get('/user', function () {
    return (new UserResource(User::find(1)))
                ->response()
                ->header('X-Value', 'True');
});
```

Alternativamente, puedes definir un método `withResponse` dentro del propio recurso. Este método se llamará cuando el recurso se devuelva como el recurso más externo en una respuesta:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class User extends JsonResource
{
    /**
    * Transform the resource into an array.
    *
    * @param  \Illuminate\Http\Request  $request
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
    * @param  \Illuminate\Http\Request  $request
    * @param  \Illuminate\Http\Response  $response
    * @return void
    */
    public function withResponse($request, $response)
    {
        $response->header('X-Value', 'True');
    }
}
```