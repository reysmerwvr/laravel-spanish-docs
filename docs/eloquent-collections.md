::: v-pre

# Eloquent: Colecciones

- [Introducción](#introduction)
- [Métodos disponibles](#available-methods)
- [Colecciones personalizadas](#custom-collections)

<a name="introduction"></a>
## Introducción

Todos los conjuntos de multi-resultados retornados por Eloquent son instancias del objeto `Illuminate\Database\Eloquent\Collection`, incluyendo los resultados obtenidos por medio del método `get` o accedidos por medio de una relación. El objeto de la colección Eloquent extiende la [collección base](/collections.html) de Laravel, así hereda naturalmente docenas de métodos usados para trabajar fluidamente con el arreglo subyacente de modelos de Eloquent.

Todas las colecciones tambien sirven como iteradores, permitiendo que iteres sobre ellas como si fueran simples arreglos de PHP:

```php
$users = App\User::where('active', 1)->get();

foreach ($users as $user) {
    echo $user->name;
}
```

Sin embargo, las colecciones son mucho más poderosas que los arreglos y exponen una variedad de mapeos / reduce operaciones que pueden ser encadenadas usando una interfaz intuitiva. Por ejemplo, vamos a remover todos los modelos inactivos y traeremos el primer nombre para cada usuario restante:

```php
$users = App\User::all();

$names = $users->reject(function ($user) {
    return $user->active === false;
})
->map(function ($user) {
    return $user->name;
});
```

::: danger Nota
Mientras los métodos de colección de Eloquent devuelven una nueva instancia de una colección de Eloquent, los métodos `pluck`, `keys`, `zip`, `collapse`, `flatten` y `flip` devuelven una instancia de [colección base](/collections.html). De igual forma, si una operación devuelve una colección que no contiene modelos Eloquent, será automáticamente convertida a una colección base.
:::

<a name="available-methods"></a>
## Métodos Disponibles

### La colección base

Todas las colecciones de Eloquent extienden el objeto de [colección de Laravel](/collections.html) base; sin embargo, heredan todos los métodos poderosos proporcionados por la clase de colección base:

Adicionalmente, la clase `Illuminate\Database\Eloquent\Collection` proporciona una serie de métodos para ayudarte a administrar tus colecciones de modelos. La mayoría de los métodos retornan instancias de `Illuminate\Database\Eloquent\Collection`; sin embargo, algunos métodos retornan una instancia base `Illuminate\Support\Collection`.

#### `contains($key, $operator = null, $value = null)`

El método `contains` puede ser usado para determinar si una instancia de modelo dada es contenida por la colección. Este método acepta una clave primaria o una instancia de modelo:

```php
$users->contains(1);

$users->contains(User::find(1));
```

#### `diff($items)`

El método `diff` retorna todos los modelos que no están presentes en la colección dada:

```php
use App\User;

$users = $users->diff(User::whereIn('id', [1, 2, 3])->get());
```

#### `except($keys)`

El método `except` retorna todos los modelos que no tienen las claves primarias dadas:

```php
$users = $users->except([1, 2, 3]);
```

#### `find($key)` {#collection-method .first-collection-method}

El método `find` encuentra un modelo que tienen una clave primaria dada. Si `$key` es una instancia de modelo, `find` intentará retornar un modelo que coincida con la clave primaria. Si `$key` es un arreglo de claves, `find` retornará todos los modelos que coincidan con las `$keys` usando `whereIn()`:

```php
$users = User::all();

$user = $users->find(1);
```

#### `fresh($with = [])`

El método `fresh` retorna una instancia nueva de cada modelo en la colección desde la base de datos. Adicionalmente, cualquier relación especificada será cargada por adelantado:

```php
$users = $users->fresh();

$users = $users->fresh('comments');
```

#### `intersect($items)`

El método `intersect` retorna todos los modelos que también están presentes en la colección dada:

```php
use App\User;

$users = $users->intersect(User::whereIn('id', [1, 2, 3])->get());
```

#### `load($relations)`

El método `load` carga por adelantado las relaciones dadas para todos los modelos en la colección:

```php
$users->load('comments', 'posts');

$users->load('comments.author');
```

#### `loadMissing($relations)`

El método `loadMissing` carga por adelantado las relaciones dadas para todos los modelos en la colección si las relaciones aún no han sido cargadas:

```php
$users->loadMissing('comments', 'posts');

$users->loadMissing('comments.author');
```

#### `modelKeys()`

El método `modelKeys` retorna las claves primarias para todos los modelos en la colección:

```php
$users->modelKeys();

// [1, 2, 3, 4, 5]
```

#### `makeVisible($attributes)`

El método `makeVisible` hace visibles los atributos que normalmente están "ocultados" en cada modelo de la colección:

```php
$users = $users->makeVisible(['address', 'phone_number']);
```

#### `makeHidden($attributes)`

El método `makeHidden` oculta los atributos que normalmente están "visibles" en cada modelo de la colección:

```php
$users = $users->makeHidden(['address', 'phone_number']);
```

#### `only($keys)`

El método `only` retorna todos los modelos que tienen las claves primarias dadas:

```php
$users = $users->only([1, 2, 3]);
```

#### `unique($key = null, $strict = false)`

El método `unique` retorna todos los modelos únicos en la colección. Cualquier modelo del mismo tipo con las mismas claves primarias que otro modelo en la colección es removido.

```php
$users = $users->unique();
```

<a name="custom-collections"></a>
## Colecciones personalizadas

Si necesitas usar un objeto `Collection` personalizado con tus propios métodos de extensión, puedes sobrescribir el método `newCollection` en tu modelo:

```php
<?php

namespace App;

use App\CustomCollection;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
        * Create a new Eloquent Collection instance.
        *
        * @param  array  $models
        * @return \Illuminate\Database\Eloquent\Collection
        */
    public function newCollection(array $models = [])
    {
        return new CustomCollection($models);
    }
}
```

Una vez que has definido un método `newCollection`, recibirás una instancia de tu colección personalizada cada vez que Eloquent devuelva una instancia `Collection` de ese modelo. Si prefieres usar una colección personalizada para cada modelo en tu aplicación, deberías sobrescribir el método `newCollection` en una clase del modelo base que es extendida por todos tus modelos.