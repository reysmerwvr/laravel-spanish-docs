::: v-pre

# Eloquent: Serialización

- [Introducción](#introduction)
- [Serializando Modelos y Colecciones](#serializing-models-and-collections)
    - [Serializando a Arreglos](#serializing-to-arrays)
    - [Serializando a JSON](#serializing-to-json)
- [Ocultando Atributos de JSON](#hiding-attributes-from-json)
- [Añadiendo Valores a JSON](#appending-values-to-json)
- [Serialización de Fechas](#date-serialization)

<a name="introduction"></a>
## Introducción

Al momento de construir APIs JSON, con frecuencia necesitas convertir tus modelos y relaciones a arreglos o JSON. Eloquent incluye métodos convenientes para hacer estas conversiones, también como controlar cuáles atributos están incluidos en tus serializaciones.

<a name="serializing-models-and-collections"></a>
## Serializando Modelos y Colecciones

<a name="serializing-to-arrays"></a>
### Serializando a Arreglos

Para convertir un modelo y sus [relaciones](/docs/{{version}}/eloquent-relationships) cargadas a un arreglo, debes usar el método `toArray`. Este método es recursivo, ya que todos los atributos y todas las relaciones (incluyendo las relaciones de relaciones) serán convertidas a arreglos:

```php
$user = App\User::with('roles')->first();

return $user->toArray();
```

También puedes convertir [colecciones](/docs/{{version}}/eloquent-collections) completas de modelos en arreglos:

```php
$users = App\User::all();

return $users->toArray();
```

<a name="serializing-to-json"></a>
### Serializando a JSON

Para convertir un modelo a JSON, deberías usar el método `toJson`. Igual que `toArray`, el método `toJson` es recursivo, así todos los atributos y relaciones serán convertidas a JSON. También puedes especificar las opciones de codificación JSON [soportadas por PHP](https://secure.php.net/manual/en/function.json-encode.php):

```php
$user = App\User::find(1);

return $user->toJson();

return $user->toJson(JSON_PRETTY_PRINT);
```

Alternativamente, puedes convertir un modelo o colección en una cadena, la cual ejecutará automáticamente el método `toJson` sobre el modelo o colección:

```php
$user = App\User::find(1);

return (string) $user;
```

Debido a que los modelos y colecciones son convertidos a JSON al momento de conversión a una cadena, puedes devolver objetos de Eloquent directamente desde las rutas o controladores de tu aplicación:

```php
Route::get('users', function () {
    return App\User::all();
});
```

#### Relaciones

Cuando un modelo de Eloquent es convertido a JSON, las relaciones que sean cargadas serán incluidas automáticamente como atributos en el objeto JSON. Además, aunque los métodos de relación de Eloquent sean definidos usando "camel case", un atributo JSON de la relación en su lugar se verá como "snake case".

<a name="hiding-attributes-from-json"></a>
## Ocultando Atributos de JSON

Algunas veces puedes querer limitar los atributos, tales como contraseñas, que están incluidos en la representación de arreglo o JSON de tu modelo. Para hacer eso, agrega una propiedad `$hidden` en tu modelo:

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
    * The attributes that should be hidden for arrays.
    *
    * @var array
    */
    protected $hidden = ['password'];
}
```

::: danger Nota
Al momento de ocultar relaciones, usa el nombre de método de la relación.
:::

Alternativamente, puedes usar la propiedad `visible` para definir una lista blanca de atributos que deberían ser incluidos en la representación de arreglo y JSON de tu modelo. Todos los demás atributos estarán ocultos cuando el modelo sea convertido a un arreglo o JSON:

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
    * The attributes that should be visible in arrays.
    *
    * @var array
    */
    protected $visible = ['first_name', 'last_name'];
}
```

#### Modificando la Visibilidad de Atributos Temporalmente

Si prefieres hacer visible algunos atributos típicamente ocultos en una instancia de modelo dado, puedes usar el método `makeVisible`. El método `makeVisible` devuelve la instancia de modelo para encadenar métodos de forma conveniente:

```php
return $user->makeVisible('attribute')->toArray();
```

De igual manera, si prefieres ocultar algunos atributos típicamente visibles en una instancia de modelo dado, puedes usar el método `makeHidden`.

```php
return $user->makeHidden('attribute')->toArray();
```

<a name="appending-values-to-json"></a>
## Añadiendo Valores a JSON

Ocasionalmente, al momento de convertir modelos a un arreglo o JSON, puedes querer agregar atributos que no tienen una columna correspondiente en tu base de datos. Para hacer eso, primero define un [accesador](/docs/{{version}}/eloquent-mutators) para el valor:

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
    * Get the administrator flag for the user.
    *
    * @return bool
    */
    public function getIsAdminAttribute()
    {
        return $this->attributes['admin'] == 'yes';
    }
}
```

Después de crear el accesador, agrega el nombre del atributo a la propiedad `appends` en el modelo. Nota que los nombres de atributo son referenciados típicamente en "snake_case", aun cuando el accesador sea definido usando "camel case":

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
    * The accessors to append to the model's array form.
    *
    * @var array
    */
    protected $appends = ['is_admin'];
}
```

Una vez que el atributo ha sido agregado a la lista `appends`, será incluido en ambas representaciones de arreglo y JSON del modelo. Los atributos en el arreglo `appends` también respetarán las configuraciones `visible` y `hidden` configuradas en el modelo.

#### Añadiendo en tiempo de ejecución

Puedes indicar una única instancia de modelo que agregue atributos utilizando el método `append`. También usar el método `setAppends` para sobrescribir el arreglo completo de propiedades adjuntadas para una instancia de un modelo dado:

```php
return $user->append('is_admin')->toArray();

return $user->setAppends(['is_admin'])->toArray();
```

<a name="date-serialization"></a>
## Serialización de Fecha

#### Personalizar el Formato de la Fecha por Atributo

Puedes personalizar el formato de serialización de atributos de fecha de Eloquent individuales especificando el formato de la fecha en la [declaración de la conversión](/docs/{{version}}/eloquent-mutators#attribute-casting):

```php
protected $casts = [
    'birthday' => 'date:Y-m-d',
    'joined_at' => 'datetime:Y-m-d H:00',
];
```

#### Personalización Global Mediante Carbon

Laravel extiende la biblioteca de fechas [Carbon](https://github.com/briannesbitt/Carbon) con el propósito de proporcionar la personalización conveniente del formato de serialización de Carbon. Para personalizar la forma en que todas las fechas Carbon a través de tu aplicación sean serializadas, usa el método `Carbon::serializeUsing`. El método `serializeUsing` acepta una Closure la cual devuelve una representación en forma de cadena de la fecha para la serialización JSON:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Carbon;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
    * Perform post-registration booting of services.
    *
    * @return void
    */
    public function boot()
    {
        Carbon::serializeUsing(function ($carbon) {
            return $carbon->format('U');
        });
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