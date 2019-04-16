::: v-pre

# Collecciones

- [Introducción](#introduction)
    - [Creando Collecciones](#creating-collections)
    - [Extendiendo Collecciones](#extending-collections)
- [Métodos Disponibles](#available-methods)
- [Mensajes De Orden Superior](#higher-order-messages)

<a name="introduction"></a>
## Introducción

La clase `Illuminate\Support\Collection` provee una interfaz fluida y conveniente para trabajar con arreglos de datos. Por ejemplo, mira el siguiente código. Usaremos la función helper `collect` para crear una nueva instancia de `Collection` pasando un arreglo como parámetro, se ejecuta la función `strtoupper` en cada elemento y luego elimina todos los elementos vacíos:

```php
$collection = collect(['taylor', 'abigail', null])->map(function ($name) {
    return strtoupper($name);
})
->reject(function ($name) {
    return empty($name);
});
```

Como puedes ver, la clase `Collection` te permite encadenar sus métodos para realizar un mapeo fluido y reducir el arreglo subyacente. En general, las colecciones son inmutables, es decir, cada método de `Collection` retorna una nueva instancia de `Collection`.

<a name="creating-collections"></a>
### Creando Colecciones

Como se ha mencionado más arriba, el helper `collect` retorna una nueva instancia de `Illuminate\Support\Collection` para el arreglo dado. Entonces, crear una colección es tan simple como:

```php
$collection = collect([1, 2, 3]);
```

::: tip
Las respuestas de [Eloquent](/docs/{{version}}/eloquent) siempre retornan una instancia de `Collection`.
:::

<a name="extending-collections"></a>
### Extendiendo Colecciones

Las colecciones son "macroable", es decir, te permite agregar métodos adicionales a la clase `Collection` en tiempo de ejecución. Por ejemplo, el siguiente código agrega un método `toUpper` a la clase `Collection`:

```php
use Illuminate\Support\Str;

Collection::macro('toUpper', function () {
    return $this->map(function ($value) {
        return Str::upper($value);
    });
});

$collection = collect(['first', 'second']);

$upper = $collection->toUpper();

// ['FIRST', 'SECOND']
```

Por lo general, los macros para una colección se declaran en un [proveedor de servicios](/docs/{{version}}/providers).

<a name="available-methods"></a>
## Métodos Disponibles

Por el resto de esta documentación, discutiremos cada método disponible en la clase `Collection`. Recuerda, todos estos métodos pueden estar encadenados a la manipulación fluida del arreglo subyacente. Además, casi todos los métodos devuelven una nueva instancia de `Collection`, lo que te permite conservar la copia original de la colección cuando sea necesario:

<style>
    #collection-method-list > p {
        column-count: 3; -moz-column-count: 3; -webkit-column-count: 3;
        column-gap: 2em; -moz-column-gap: 2em; -webkit-column-gap: 2em;
    }

    #collection-method-list a {
        display: block;
    }
</style>

<div id="collection-method-list" markdown="1">

[all](#method-all)
[average](#method-average)
[avg](#method-avg)
[chunk](#method-chunk)
[collapse](#method-collapse)
[combine](#method-combine)
[concat](#method-concat)
[contains](#method-contains)
[containsStrict](#method-containsstrict)
[count](#method-count)
[countBy](#method-countBy)
[crossJoin](#method-crossjoin)
[dd](#method-dd)
[diff](#method-diff)
[diffAssoc](#method-diffassoc)
[diffKeys](#method-diffkeys)
[dump](#method-dump)
[each](#method-each)
[eachSpread](#method-eachspread)
[every](#method-every)
[except](#method-except)
[filter](#method-filter)
[first](#method-first)
[firstWhere](#method-first-where)
[flatMap](#method-flatmap)
[flatten](#method-flatten)
[flip](#method-flip)
[forget](#method-forget)
[forPage](#method-forpage)
[get](#method-get)
[groupBy](#method-groupby)
[has](#method-has)
[implode](#method-implode)
[intersect](#method-intersect)
[intersectByKeys](#method-intersectbykeys)
[isEmpty](#method-isempty)
[isNotEmpty](#method-isnotempty)
[join](#method-join)
[keyBy](#method-keyby)
[keys](#method-keys)
[last](#method-last)
[macro](#method-macro)
[make](#method-make)
[map](#method-map)
[mapInto](#method-mapinto)
[mapSpread](#method-mapspread)
[mapToGroups](#method-maptogroups)
[mapWithKeys](#method-mapwithkeys)
[max](#method-max)
[median](#method-median)
[merge](#method-merge)
[min](#method-min)
[mode](#method-mode)
[nth](#method-nth)
[only](#method-only)
[pad](#method-pad)
[partition](#method-partition)
[pipe](#method-pipe)
[pluck](#method-pluck)
[pop](#method-pop)
[prepend](#method-prepend)
[pull](#method-pull)
[push](#method-push)
[put](#method-put)
[random](#method-random)
[reduce](#method-reduce)
[reject](#method-reject)
[reverse](#method-reverse)
[search](#method-search)
[shift](#method-shift)
[shuffle](#method-shuffle)
[slice](#method-slice)
[some](#method-some)
[sort](#method-sort)
[sortBy](#method-sortby)
[sortByDesc](#method-sortbydesc)
[sortKeys](#method-sortkeys)
[sortKeysDesc](#method-sortkeysdesc)
[splice](#method-splice)
[split](#method-split)
[sum](#method-sum)
[take](#method-take)
[tap](#method-tap)
[times](#method-times)
[toArray](#method-toarray)
[toJson](#method-tojson)
[transform](#method-transform)
[union](#method-union)
[unique](#method-unique)
[uniqueStrict](#method-uniquestrict)
[unless](#method-unless)
[unlessEmpty](#method-unlessempty)
[unlessNotEmpty](#method-unlessnotempty)
[unwrap](#method-unwrap)
[values](#method-values)
[when](#method-when)
[whenEmpty](#method-whenempty)
[whenNotEmpty](#method-whennotempty)
[where](#method-where)
[whereStrict](#method-wherestrict)
[whereBetween](#method-wherebetween)
[whereIn](#method-wherein)
[whereInStrict](#method-whereinstrict)
[whereInstanceOf](#method-whereinstanceof)
[whereNotBetween](#method-wherenotbetween)
[whereNotIn](#method-wherenotin)
[whereNotInStrict](#method-wherenotinstrict)
[wrap](#method-wrap)
[zip](#method-zip)

</div>

<a name="method-listing"></a>
## Lista de Métodos

<style>
    #collection-method code {
        font-size: 14px;
    }

    #collection-method:not(.first-collection-method) {
        margin-top: 50px;
    }
</style>

<a name="method-all"></a>
#### `all()` {#collection-method .first-collection-method}

El método `all` devuelve el arreglo subyacente representado por la colección:

```php
collect([1, 2, 3])->all();

// [1, 2, 3]
```

<a name="method-average"></a>
#### `average()` {#collection-method}

Alias del método [`avg`](#method-avg).

<a name="method-avg"></a>
#### `avg()` {#collection-method}

El método `avg` retorna el [promedio](https://en.wikipedia.org/wiki/Average) de una llave dada:

```php
$average = collect([['foo' => 10], ['foo' => 10], ['foo' => 20], ['foo' => 40]])->avg('foo');

// 20

$average = collect([1, 1, 2, 4])->avg();

// 2
```

<a name="method-chunk"></a>
#### `chunk()` {#collection-method}

El método `chunk` divide la colección en múltiples colecciones más pequeñas de un tamaño dado:

```php
$collection = collect([1, 2, 3, 4, 5, 6, 7]);

$chunks = $collection->chunk(4);

$chunks->toArray();

// [[1, 2, 3, 4], [5, 6, 7]]
```

Este método es especialmente útil en las [vistas](/docs/{{version}}/views) cuando se trabaja con un sistema de grillas como el de [Bootstrap](https://getbootstrap.com/docs/4.1/layout/grid/). Imagina que tienes una colección de modelos [Eloquent](/docs/{{version}}/eloquent) y quieres mostrar en una grilla lo siguiente:

```php
@foreach ($products->chunk(3) as $chunk)
    <div class="row">
        @foreach ($chunk as $product)
            <div class="col-xs-4">{{ $product->name }}</div>
        @endforeach
    </div>
@endforeach
```

<a name="method-collapse"></a>
#### `collapse()` {#collection-method}

El método `collapse` contrae una colección de arreglos en una sola colección plana:

```php
$collection = collect([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);

$collapsed = $collection->collapse();

$collapsed->all();

// [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

<a name="method-combine"></a>
#### `combine()` {#collection-method}

El método `combine` combina las llaves de la colección con los valores de otro arreglo o colección:

```php
$collection = collect(['name', 'age']);

$combined = $collection->combine(['George', 29]);

$combined->all();

// ['name' => 'George', 'age' => 29]
```

<a name="method-concat"></a>
#### `concat()` {#collection-method}

El método `concat` concatena un arreglo dado o valores de una colección al final de la colección:

```php
$collection = collect(['John Doe']);

$concatenated = $collection->concat(['Jane Doe'])->concat(['name' => 'Johnny Doe']);

$concatenated->all();

// ['John Doe', 'Jane Doe', 'Johnny Doe']
```

<a name="method-contains"></a>
#### `contains()` {#collection-method}

El método `contains` determina si la colección contiene un elemento dado:

```php
$collection = collect(['name' => 'Desk', 'price' => 100]);

$collection->contains('Desk');

// true

$collection->contains('New York');

// false
```

También puedes pasar la llave y el valor al método `contains`, que determinará si existe en la colección:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
]);

$collection->contains('product', 'Bookcase');

// false
```

Finalmente, también puedes pasar una función de retorno al método `contains` para realizar tu propia comprobación:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->contains(function ($value, $key) {
    return $value > 5;
});

// false
```

El método `contains` utiliza comparaciones "flexibles" (loose) al verificar valores de elementos, lo que significa que una cadena con un valor entero se considerará igual a un entero del mismo valor. Usa el método [`containsStrict`](#method-containsstrict) si deseas una comparación "estricta".

<a name="method-containsstrict"></a>
#### `containsStrict()` {#collection-method}

Este método funciona igual que el método [`contains`](#method-contains); sin embargo, todos los valores se comparan utilizando comparaciones "estrictas".

<a name="method-count"></a>
#### `count()` {#collection-method}

El método `count` devuelve la cantidad total de elementos en la colección:

```php
$collection = collect([1, 2, 3, 4]);

$collection->count();

// 4
```

<a name="method-countBy"></a>
#### `countBy()` {#collection-method}

El método `count By` cuenta las ocurrencias de valores en la colección. Por defecto, el método cuenta las ocurrencias de cada elemento:

```php
$collection = collect([1, 2, 2, 2, 3]);

$counted = $collection->countBy();

$counted->all();

// [1 => 1, 2 => 3, 3 => 1]
```

Sin embargo, puedes pasar una función de retorno (callback) al método `countBy` para contar todos los elementos por un valor personalizado:

```php
$collection = collect(['alice@gmail.com', 'bob@yahoo.com', 'carlos@gmail.com']);

$counted = $collection->countBy(function ($email) {
    return substr(strrchr($email, "@"), 1);
});

$counted->all();

// ['gmail.com' => 2, 'yahoo.com' => 1]
```

<a name="method-crossjoin"></a>
#### `crossJoin()` {#collection-method}

El método `crossJoin` realiza un join cruzado entre los valores de la colección y los arreglos o colecciones dadas, devolviendo un producto cartesiano con todas las permutaciones posibles:

```php
$collection = collect([1, 2]);

$matrix = $collection->crossJoin(['a', 'b']);

$matrix->all();

/*
    [
        [1, 'a'],
        [1, 'b'],
        [2, 'a'],
        [2, 'b'],
    ]
*/

$collection = collect([1, 2]);

$matrix = $collection->crossJoin(['a', 'b'], ['I', 'II']);

$matrix->all();

/*
    [
        [1, 'a', 'I'],
        [1, 'a', 'II'],
        [1, 'b', 'I'],
        [1, 'b', 'II'],
        [2, 'a', 'I'],
        [2, 'a', 'II'],
        [2, 'b', 'I'],
        [2, 'b', 'II'],
    ]
*/
```

<a name="method-dd"></a>
#### `dd()` {#collection-method}

El método `dd` muestra los elementos de la colección y finaliza la ejecución del script:

```php
$collection = collect(['John Doe', 'Jane Doe']);

$collection->dd();

/*
    Collection {
        #items: array:2 [
            0 => "John Doe"
            1 => "Jane Doe"
        ]
    }
*/
```

Si no quieres dejar de ejecutar el script, usa el método [`dump`](#method-dump).

<a name="method-diff"></a>
#### `diff()` {#collection-method}

El método `diff` compara la colección con otra colección o una `arreglo` simple de PHP basado en sus valores. Este método devolverá los valores en la colección original que no están presentes en la colección dada:

```php
$collection = collect([1, 2, 3, 4, 5]);

$diff = $collection->diff([2, 4, 6, 8]);

$diff->all();

// [1, 3, 5]
```

<a name="method-diffassoc"></a>
#### `diffAssoc()` {#collection-method}

El método `diffAssoc` compara la colección con otra colección o un `arreglo` simple de PHP basado en sus claves y valores. Este método devolverá los pares clave / valor en la colección original que no están presentes en la colección dada:

```php
$collection = collect([
    'color' => 'orange',
    'type' => 'fruit',
    'remain' => 6
]);

$diff = $collection->diffAssoc([
    'color' => 'yellow',
    'type' => 'fruit',
    'remain' => 3,
    'used' => 6
]);

$diff->all();

// ['color' => 'orange', 'remain' => 6]
```

<a name="method-diffkeys"></a>
#### `diffKeys()` {#collection-method}

El método `diffKeys` compara la colección con otra colección o un `arreglo` de PHP simple en base a sus claves. Este método devolverá los pares clave / valor en la colección original que no están presentes en la colección dada:

```php
$collection = collect([
    'one' => 10,
    'two' => 20,
    'three' => 30,
    'four' => 40,
    'five' => 50,
]);

$diff = $collection->diffKeys([
    'two' => 2,
    'four' => 4,
    'six' => 6,
    'eight' => 8,
]);

$diff->all();

// ['one' => 10, 'three' => 30, 'five' => 50]
```

<a name="method-dump"></a>
#### `dump()` {#collection-method}

El método `dump` volca los elementos de la colección:

```php
$collection = collect(['John Doe', 'Jane Doe']);

$collection->dump();

/*
    Collection {
        #items: array:2 [
            0 => "John Doe"
            1 => "Jane Doe"
        ]
    }
*/
```

Si deseas detener la ejecución del script después de volcar la colección, use el método [`dd`](#method-dd).

<a name="method-each"></a>
#### `each()` {#collection-method}

El método `each` itera sobre los elementos de la colección y pasa cada elemento a una función de retorno (callback):

```php
$collection->each(function ($item, $key) {
    //
});
```

Si deseas detener la iteración a través de los elementos, puedes devolver `false` en la función de retorno (callback):

```php
$collection->each(function ($item, $key) {
    if (/* some condition */) {
        return false;
    }
});
```

<a name="method-eachspread"></a>
#### `eachSpread()` {#collection-method}

El método `eachSpread` itera sobre los elementos de la colección, pasando cada valor de elemento anidado a la función de retorno (callback):

```php
$collection = collect([['John Doe', 35], ['Jane Doe', 33]]);

$collection->eachSpread(function ($name, $age) {
    //
});
```

Puedes detener la iteración a través de los elementos al devolver `false` en la función de retorno (callback):

```php
$collection->eachSpread(function ($name, $age) {
    return false;
});
```

<a name="method-every"></a>
#### `every()` {#collection-method}

El método `every` se puede usar para verificar que todos los elementos de una colección pasen una comprobación dada a través de una función de retorno (callback):

```php
collect([1, 2, 3, 4])->every(function ($value, $key) {
    return $value > 2;
});

// false
```

Si la colección está vacía, `every` devolverá true:

```php
$collection = collect([]);

$collection->every(function($value, $key) {
    return $value > 2;
});

// true
```

<a name="method-except"></a>
#### `except()` {#collection-method}

El método `except` devuelve todos los elementos de la colección, excepto aquellos con las llaves especificadas:

```php
$collection = collect(['product_id' => 1, 'price' => 100, 'discount' => false]);

$filtered = $collection->except(['price', 'discount']);

$filtered->all();

// ['product_id' => 1]
```

Para hacer lo contrario a `except`, vea el método [only](#method-only).

<a name="method-filter"></a>
#### `filter()` {#collection-method}

El método `filter` filtra la colección usando una función de retorno (callback), manteniendo solo los elementos que pasan la comprobación dada:

```php
$collection = collect([1, 2, 3, 4]);

$filtered = $collection->filter(function ($value, $key) {
    return $value > 2;
});

$filtered->all();

// [3, 4]
```

Si no se proporciona una función de retorno, se eliminarán todos los elementos de la colección que son equivalentes a `false`:

```php
$collection = collect([1, 2, 3, null, false, '', 0, []]);

$collection->filter()->all();

// [1, 2, 3]
```

Para hacer lo contrario a `filter`, echa un vistazo al método [reject](#method-reject).

<a name="method-first"></a>
#### `first()` {#collection-method}

El método `first` devuelve el primer elemento de la colección que pasa la comprobación en una función de retorno (callback) dada:

```php
collect([1, 2, 3, 4])->first(function ($value, $key) {
    return $value > 2;
});

// 3
```

También puedes llamar al método `first` sin argumentos para obtener el primer elemento de la colección. Si la colección está vacía, se devuelve `null`:

```php
collect([1, 2, 3, 4])->first();

// 1
```

<a name="method-first-where"></a>
#### `firstWhere()` {#collection-method}

El método `firstWhere` devuelve el primer elemento de la colección con la clave y el valor proporcionado:

```php
$collection = collect([
    ['name' => 'Regena', 'age' => null],
    ['name' => 'Linda', 'age' => 14],
    ['name' => 'Diego', 'age' => 23],
    ['name' => 'Linda', 'age' => 84],
]);

$collection->firstWhere('name', 'Linda');

// ['name' => 'Linda', 'age' => 14]
```

También puedes llamar al método `firstWhere` con un operador:

```php
$collection->firstWhere('age', '>=', 18);

// ['name' => 'Diego', 'age' => 23]
```

Similar al método [where](#method-where), puedes pasar un argumento al método `firstWhere`. En este escenario, el método `firstWhere` retornará el primer elemento donde el valor de la clave dada es "verídico":

```php
$collection->firstWhere('age');

// ['name' => 'Linda', 'age' => 14]
```

<a name="method-flatmap"></a>
#### `flatMap()` {#collection-method}

El método `flatMap` itera a través de la colección y pasa cada valor a una función de retorno (callback). La función de retorno es libre de modificar el elemento y devolverlo, formando así una nueva colección de elementos modificados. Entonces, el arreglo se aplana a un solo nivel:

```php
$collection = collect([
    ['name' => 'Sally'],
    ['school' => 'Arkansas'],
    ['age' => 28]
]);

$flattened = $collection->flatMap(function ($values) {
    return array_map('strtoupper', $values);
});

$flattened->all();

// ['name' => 'SALLY', 'school' => 'ARKANSAS', 'age' => '28'];
```

<a name="method-flatten"></a>
#### `flatten()` {#collection-method}

El método `flatten` aplana una colección multidimensional en una de una sola dimensión:

```php
$collection = collect(['name' => 'taylor', 'languages' => ['php', 'javascript']]);

$flattened = $collection->flatten();

$flattened->all();

// ['taylor', 'php', 'javascript'];
```

Opcionalmente, puedes pasarle a la función un argumento de "profundidad":

```php
$collection = collect([
    'Apple' => [
        ['name' => 'iPhone 6S', 'brand' => 'Apple'],
    ],
    'Samsung' => [
        ['name' => 'Galaxy S7', 'brand' => 'Samsung']
    ],
]);

$products = $collection->flatten(1);

$products->values()->all();

/*
    [
        ['name' => 'iPhone 6S', 'brand' => 'Apple'],
        ['name' => 'Galaxy S7', 'brand' => 'Samsung'],
    ]
*/
```

En este ejemplo, al llamar a `flatten` sin proporcionar la profundidad también se aplanarían los arreglos anidados, lo que da como resultado` ['iPhone 6S', 'Apple', 'Galaxy S7', 'Samsung']`. Proporcionar una profundidad te permite restringir los niveles de arreglos anidados que se aplanarán.

<a name="method-flip"></a>
#### `flip()` {#collection-method}

El método `flip` intercambia las llaves de la colección con sus valores correspondientes:

```php
$collection = collect(['name' => 'taylor', 'framework' => 'laravel']);

$flipped = $collection->flip();

$flipped->all();

// ['taylor' => 'name', 'laravel' => 'framework']
```

<a name="method-forget"></a>
#### `forget()` {#collection-method}

El método `forget` elimina un elemento de la colección por su clave:

```php
$collection = collect(['name' => 'taylor', 'framework' => 'laravel']);

$collection->forget('name');

$collection->all();

// ['framework' => 'laravel']
```

::: danger Nota
A diferencia de la mayoría de métodos de una colección, `forget` no devuelve una nueva colección modificada; modifica la colección a la que se llama.
:::

<a name="method-forpage"></a>
#### `forPage()` {#collection-method}

El método `forPage` devuelve una nueva colección que contiene los elementos que estarían presentes en un número de página determinado. El método acepta el número de página como su primer argumento y la cantidad de elementos para mostrar por página como su segundo argumento:

```php
$collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9]);

$chunk = $collection->forPage(2, 3);

$chunk->all();

// [4, 5, 6]
```

<a name="method-get"></a>
#### `get()` {#collection-method}

El método `get` devuelve el elemento en una clave determinada. Si la clave no existe, se devuelve `null`:

```php
$collection = collect(['name' => 'taylor', 'framework' => 'laravel']);

$value = $collection->get('name');

// taylor
```

Opcionalmente, puedes pasar un valor predeterminado como segundo argumento:

```php
$collection = collect(['name' => 'taylor', 'framework' => 'laravel']);

$value = $collection->get('foo', 'default-value');

// default-value
```

Incluso puedes pasar una función de retorno (callback) como el valor por defecto. El resultado de la función de retorno se devolverá si la clave especificada no existe:

```php
$collection->get('email', function () {
    return 'default-value';
});

// default-value
```

<a name="method-groupby"></a>
#### `groupBy()` {#collection-method}

El método `groupBy` agrupa los elementos de la colección con una clave determinada:

```php
$collection = collect([
    ['account_id' => 'account-x10', 'product' => 'Chair'],
    ['account_id' => 'account-x10', 'product' => 'Bookcase'],
    ['account_id' => 'account-x11', 'product' => 'Desk'],
]);

$grouped = $collection->groupBy('account_id');

$grouped->toArray();

/*
    [
        'account-x10' => [
            ['account_id' => 'account-x10', 'product' => 'Chair'],
            ['account_id' => 'account-x10', 'product' => 'Bookcase'],
        ],
        'account-x11' => [
            ['account_id' => 'account-x11', 'product' => 'Desk'],
        ],
    ]
*/
```

Además de pasar una clave, también puedes pasar una función de retorno (callback). La función de retorno debe devolver el valor de la clave por la que deseas agrupar:

```php
$grouped = $collection->groupBy(function ($item, $key) {
    return substr($item['account_id'], -3);
});

$grouped->toArray();

/*
    [
        'x10' => [
            ['account_id' => 'account-x10', 'product' => 'Chair'],
            ['account_id' => 'account-x10', 'product' => 'Bookcase'],
        ],
        'x11' => [
            ['account_id' => 'account-x11', 'product' => 'Desk'],
        ],
    ]
*/
```

Además de pasar una clave, también puedes pasar una función de retorno (callback). La función de retorno debe devolver el valor de la clave por la que deseas agrupar:

```php
$data = new Collection([
    10 => ['user' => 1, 'skill' => 1, 'roles' => ['Role_1', 'Role_3']],
    20 => ['user' => 2, 'skill' => 1, 'roles' => ['Role_1', 'Role_2']],
    30 => ['user' => 3, 'skill' => 2, 'roles' => ['Role_1']],
    40 => ['user' => 4, 'skill' => 2, 'roles' => ['Role_2']],
]);

$result = $data->groupBy([
    'skill',
    function ($item) {
        return $item['roles'];
    },
], $preserveKeys = true);

/*
[
    1 => [
        'Role_1' => [
            10 => ['user' => 1, 'skill' => 1, 'roles' => ['Role_1', 'Role_3']],
            20 => ['user' => 2, 'skill' => 1, 'roles' => ['Role_1', 'Role_2']],
        ],
        'Role_2' => [
            20 => ['user' => 2, 'skill' => 1, 'roles' => ['Role_1', 'Role_2']],
        ],
        'Role_3' => [
            10 => ['user' => 1, 'skill' => 1, 'roles' => ['Role_1', 'Role_3']],
        ],
    ],
    2 => [
        'Role_1' => [
            30 => ['user' => 3, 'skill' => 2, 'roles' => ['Role_1']],
        ],
        'Role_2' => [
            40 => ['user' => 4, 'skill' => 2, 'roles' => ['Role_2']],
        ],
    ],
];
*/
```

<a name="method-has"></a>
#### `has()` {#collection-method}

El método `has` determina si existe una clave dada en la colección:

```php
$collection = collect(['account_id' => 1, 'product' => 'Desk', 'amount' => 5]);

$collection->has('product');

// true

$collection->has(['product', 'amount']);

// true

$collection->has(['amount', 'price']);

// false
```

<a name="method-implode"></a>
#### `implode()` {#collection-method}

El método `implode` une a los elementos de una colección. Sus argumentos dependen del tipo de elemento en la colección. Si la colección contiene arreglos u objetos, debes pasar la clave de los atributos que deseas unir y la cadena que deseas colocar entre los valores:

```php
$collection = collect([
    ['account_id' => 1, 'product' => 'Desk'],
    ['account_id' => 2, 'product' => 'Chair'],
]);

$collection->implode('product', ', ');

// Desk, Chair
```

Si la colección contiene cadenas simples o valores numéricos, pasa el separador como único argumento para el método:

```php
collect([1, 2, 3, 4, 5])->implode('-');

// '1-2-3-4-5'
```

<a name="method-intersect"></a>
#### `intersect()` {#collection-method}

El método `intersect` elimina cualquier valor de la colección original que no esté presente en el arreglo o colección dada. La colección resultante conservará las claves de la colección original:

```php
$collection = collect(['Desk', 'Sofa', 'Chair']);

$intersect = $collection->intersect(['Desk', 'Chair', 'Bookcase']);

$intersect->all();

// [0 => 'Desk', 2 => 'Chair']
```

<a name="method-intersectbykeys"></a>
#### `intersectByKeys()` {#collection-method}

El método `intersectByKeys` elimina cualquier clave de la colección original que no esté presente en el arreglo o colección dada:

```php
$collection = collect([
    'serial' => 'UX301', 'type' => 'screen', 'year' => 2009
]);

$intersect = $collection->intersectByKeys([
    'reference' => 'UX404', 'type' => 'tab', 'year' => 2011
]);

$intersect->all();

// ['type' => 'screen', 'year' => 2009]
```

<a name="method-isempty"></a>
#### `isEmpty()` {#collection-method}

El método `isEmpty` devuelve` true` si la colección está vacía; de lo contrario, se devuelve `false`:

```php
collect([])->isEmpty();

// true
```

<a name="method-isnotempty"></a>
#### `isNotEmpty()` {#collection-method}

El método `isNotEmpty` devuelve `true` si la colección no está vacía; de lo contrario, se devuelve `false`:

```php
collect([])->isNotEmpty();

// false
```

<a name="method-join"></a>
#### `join()` {#collection-method}

El método `join` une los valores de la colección con una cadena:

```php
collect(['a', 'b', 'c'])->join(', '); // 'a, b, c'
collect(['a', 'b', 'c'])->join(', ', ', and '); // 'a, b, and c'
collect(['a', 'b'])->join(', ', ' and '); // 'a and b'
collect(['a'])->join(', ', ' and '); // 'a'
collect([])->join(', ', ' and '); // ''
```

<a name="method-keyby"></a>
#### `keyBy()` {#collection-method}

El método `keyBy` agrupa una colección por claves indicando una clave como párametro. Si varios elementos tienen la misma clave, solo el último aparecerá en la nueva colección:

```php
$collection = collect([
    ['product_id' => 'prod-100', 'name' => 'Desk'],
    ['product_id' => 'prod-200', 'name' => 'Chair'],
]);

$keyed = $collection->keyBy('product_id');

$keyed->all();

/*
    [
        'prod-100' => ['product_id' => 'prod-100', 'name' => 'Desk'],
        'prod-200' => ['product_id' => 'prod-200', 'name' => 'Chair'],
    ]
*/
```

También puedes pasar una función de retorno (callback) al método. La función debe devolver el valor de la clave de la colección:

```php
$keyed = $collection->keyBy(function ($item) {
    return strtoupper($item['product_id']);
});

$keyed->all();

/*
    [
        'PROD-100' => ['product_id' => 'prod-100', 'name' => 'Desk'],
        'PROD-200' => ['product_id' => 'prod-200', 'name' => 'Chair'],
    ]
*/
```

<a name="method-keys"></a>
#### `keys()` {#collection-method}

El método `keys` devuelve todas las claves de la colección:

```php
$collection = collect([
    'prod-100' => ['product_id' => 'prod-100', 'name' => 'Desk'],
    'prod-200' => ['product_id' => 'prod-200', 'name' => 'Chair'],
]);

$keys = $collection->keys();

$keys->all();

// ['prod-100', 'prod-200']
```

<a name="method-last"></a>
#### `last()` {#collection-method}

El método `last` devuelve el último elemento de la colección que pasa una condición dentro de una función de retorno (callback):

```php
collect([1, 2, 3, 4])->last(function ($value, $key) {
    return $value < 3;
});

// 2
```

También puedes llamar al método `last` sin parámetros para obtener el último elemento de la colección. Si la colección está vacía, se devuelve `null`:

```php
collect([1, 2, 3, 4])->last();

// 4
```

<a name="method-macro"></a>
#### `macro()` {#collection-method}

El método estático `macro` te permite agregar métodos a la clase `Collection` en tiempo de ejecución. Consulta la documentación en [Extendiendo Colecciones](#extending-collections) para mas información.

<a name="method-make"></a>
#### `make()` {#collection-method}

El método estático `make` crea una nueva instancia de `Collection`. Más información en la sección de [Creando Colecciones](#creating-collections).

<a name="method-map"></a>
#### `map()` {#collection-method}

El método `map` itera a través de la colección y pasa cada valor a una función de retorno. La función de retorno es libre de modificar el elemento y devolverlo, formando así una nueva colección de elementos modificados:

```php
$collection = collect([1, 2, 3, 4, 5]);

$multiplied = $collection->map(function ($item, $key) {
    return $item * 2;
});

$multiplied->all();

// [2, 4, 6, 8, 10]
```

::: danger Nota
Como la mayoría de los otros métodos de colecciones, `map` devuelve una nueva instancia de colección; no modifica la colección a la que se llama. Si quieres transformar la colección original, usa el método [`transform`](#method-transform).
:::

<a name="method-mapinto"></a>
#### `mapInto()` {#collection-method}

El método `mapInto()` itera sobre la colección, creando una nueva instancia de la clase dada pasando el valor al constructor:

```php
class Currency
{
    /**
    * Create a new currency instance.
    *
    * @param  string  $code
    * @return void
    */
    function __construct(string $code)
    {
        $this->code = $code;
    }
}

$collection = collect(['USD', 'EUR', 'GBP']);

$currencies = $collection->mapInto(Currency::class);

$currencies->all();

// [Currency('USD'), Currency('EUR'), Currency('GBP')]
```

<a name="method-mapspread"></a>
#### `mapSpread()` {#collection-method}

El método `mapSpread` itera sobre los elementos de la colección, pasando cada valor de elemento anidado a la función de retorno pasada como parámetro. La función de retorno es libre de modificar el elemento y devolverlo, formando así una nueva colección de elementos modificados:

```php
$collection = collect([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

$chunks = $collection->chunk(2);

$sequence = $chunks->mapSpread(function ($even, $odd) {
    return $even + $odd;
});

$sequence->all();

// [1, 5, 9, 13, 17]
```

<a name="method-maptogroups"></a>
#### `mapToGroups()` {#collection-method}

El método `mapToGroups` agrupa los elementos de la colección por la función de retorno dada. La función de retorno debería devolver un arreglo asociativo que contenga una única clave / valor, formando así una nueva colección de valores agrupados:

```php
$collection = collect([
    [
        'name' => 'John Doe',
        'department' => 'Sales',
    ],
    [
        'name' => 'Jane Doe',
        'department' => 'Sales',
    ],
    [
        'name' => 'Johnny Doe',
        'department' => 'Marketing',
    ]
]);

$grouped = $collection->mapToGroups(function ($item, $key) {
    return [$item['department'] => $item['name']];
});

$grouped->toArray();

/*
    [
        'Sales' => ['John Doe', 'Jane Doe'],
        'Marketing' => ['Johnny Doe'],
    ]
*/

$grouped->get('Sales')->all();

// ['John Doe', 'Jane Doe']
```

<a name="method-mapwithkeys"></a>
#### `mapWithKeys()` {#collection-method}

El método `mapWithKeys` itera a través de la colección y pasa cada valor a la función de retorno dada. La función de retorno debe devolver un arreglo asociativo que contiene una unica clave / valor:

```php
$collection = collect([
    [
        'name' => 'John',
        'department' => 'Sales',
        'email' => 'john@example.com'
    ],
    [
        'name' => 'Jane',
        'department' => 'Marketing',
        'email' => 'jane@example.com'
    ]
]);

$keyed = $collection->mapWithKeys(function ($item) {
    return [$item['email'] => $item['name']];
});

$keyed->all();

/*
    [
        'john@example.com' => 'John',
        'jane@example.com' => 'Jane',
    ]
*/
```

<a name="method-max"></a>
#### `max()` {#collection-method}

El método `max` devuelve el valor máximo de una clave determinada:

```php
$max = collect([['foo' => 10], ['foo' => 20]])->max('foo');

// 20

$max = collect([1, 2, 3, 4, 5])->max();

// 5
```

<a name="method-median"></a>
#### `median()` {#collection-method}

El método `median` devuelve el [valor medio](https://en.wikipedia.org/wiki/Median) de una clave dada:

```php
$median = collect([['foo' => 10], ['foo' => 10], ['foo' => 20], ['foo' => 40]])->median('foo');

// 15

$median = collect([1, 1, 2, 4])->median();

// 1.5
```

<a name="method-merge"></a>
#### `merge()` {#collection-method}

El método `merge` combina el arreglo o colección dada con la colección original. Si una clave en los elementos dados coincide con una clave de la colección original, el valor de los elementos dados sobrescribirá el valor en la colección original:

```php
$collection = collect(['product_id' => 1, 'price' => 100]);

$merged = $collection->merge(['price' => 200, 'discount' => false]);

$merged->all();

// ['product_id' => 1, 'price' => 200, 'discount' => false]
```

Si las llaves de los elementos son numéricas, los valores se agregarán al final de la colección:

```php
$collection = collect(['Desk', 'Chair']);

$merged = $collection->merge(['Bookcase', 'Door']);

$merged->all();

// ['Desk', 'Chair', 'Bookcase', 'Door']
```

<a name="method-min"></a>
#### `min()` {#collection-method}

El método `min` devuelve el valor mínimo de una llave determinada:

```php
$min = collect([['foo' => 10], ['foo' => 20]])->min('foo');

// 10

$min = collect([1, 2, 3, 4, 5])->min();

// 1
```

<a name="method-mode"></a>
#### `mode()` {#collection-method}

El método `mode` devuelve el [valor moda](https://en.wikipedia.org/wiki/Mode_(statistics)) de una clave dada:

```php
$mode = collect([['foo' => 10], ['foo' => 10], ['foo' => 20], ['foo' => 40]])->mode('foo');

// [10]

$mode = collect([1, 1, 2, 4])->mode();

// [1]
```

<a name="method-nth"></a>
#### `nth()` {#collection-method}

El método `nth` crea una nueva colección que consiste en cada elemento n-ésimo:

```php
$collection = collect(['a', 'b', 'c', 'd', 'e', 'f']);

$collection->nth(4);

// ['a', 'e']
```

Opcionalmente puedes pasar un desplazamiento como segundo argumento:

```php
$collection->nth(4, 1);

// ['b', 'f']
```

<a name="method-only"></a>
#### `only()` {#collection-method}

El método `only` devuelve los elementos de la colección con las claves especificadas:

```php
$collection = collect(['product_id' => 1, 'name' => 'Desk', 'price' => 100, 'discount' => false]);

$filtered = $collection->only(['product_id', 'name']);

$filtered->all();

// ['product_id' => 1, 'name' => 'Desk']
```

Para hacer lo inverso a `only`, usa el método [except](#method-except).

<a name="method-pad"></a>
#### `pad()` {#collection-method}

El método `pad` llenará el arreglo con el valor dado hasta que el arreglo alcance el tamaño especificado. Este método se comporta como la función [array_pad](https://secure.php.net/manual/en/function.array-pad.php) de PHP.

Para rellenar a la izquierda, debes especificar un tamaño negativo. No se realizará ningún relleno si el valor absoluto del tamaño dado es menor o igual que la longitud del arreglo:

```php
$collection = collect(['A', 'B', 'C']);

$filtered = $collection->pad(5, 0);

$filtered->all();

// ['A', 'B', 'C', 0, 0]

$filtered = $collection->pad(-5, 0);

$filtered->all();

// [0, 0, 'A', 'B', 'C']
```

<a name="method-partition"></a>
#### `partition()` {#collection-method}

El método `partition` se puede combinar con la función PHP `list` para separar los elementos que pasan una comprobación dada de aquellos que no lo hacen:

```php
$collection = collect([1, 2, 3, 4, 5, 6]);

list($underThree, $equalOrAboveThree) = $collection->partition(function ($i) {
    return $i < 3;
});

$underThree->all();

// [1, 2]

$equalOrAboveThree->all();

// [3, 4, 5, 6]
```

<a name="method-pipe"></a>
#### `pipe()` {#collection-method}

El método `pipe` pasa la colección a una función de retorno y devuelve el resultado:

```php
$collection = collect([1, 2, 3]);

$piped = $collection->pipe(function ($collection) {
    return $collection->sum();
});

// 6
```

<a name="method-pluck"></a>
#### `pluck()` {#collection-method}

El método `pluck` recupera todos los valores para una llave dada:

```php
$collection = collect([
    ['product_id' => 'prod-100', 'name' => 'Desk'],
    ['product_id' => 'prod-200', 'name' => 'Chair'],
]);

$plucked = $collection->pluck('name');

$plucked->all();

// ['Desk', 'Chair']
```

También puedes especificar cómo deseas que se coloquen las llaves:

```php
$plucked = $collection->pluck('name', 'product_id');

$plucked->all();

// ['prod-100' => 'Desk', 'prod-200' => 'Chair']
```

Si existen llaves duplicadas, el último elemento que coincida será insertado en la colección recuperada:

```php
$collection = collect([
    ['brand' => 'Tesla',  'color' => 'red'],
    ['brand' => 'Pagani', 'color' => 'white'],
    ['brand' => 'Tesla',  'color' => 'black'],
    ['brand' => 'Pagani', 'color' => 'orange'],
]);

$plucked = $collection->pluck('color', 'brand');

$plucked->all();

// ['Tesla' => 'black', 'Pagani' => 'orange']
```

<a name="method-pop"></a>
#### `pop()` {#collection-method}

El método `pop` elimina y devuelve el último elemento de la colección:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->pop();

// 5

$collection->all();

// [1, 2, 3, 4]
```

<a name="method-prepend"></a>
#### `prepend()` {#collection-method}

El método `prepend` agrega un elemento al comienzo de la colección:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->prepend(0);

$collection->all();

// [0, 1, 2, 3, 4, 5]
```

También puedes pasar un segundo argumento para establecer la clave del elemento antepuesto:

```php
$collection = collect(['one' => 1, 'two' => 2]);

$collection->prepend(0, 'zero');

$collection->all();

// ['zero' => 0, 'one' => 1, 'two' => 2]
```

<a name="method-pull"></a>
#### `pull()` {#collection-method}

El método `pull` elimina y devuelve un elemento de la colección por su clave:

```php
$collection = collect(['product_id' => 'prod-100', 'name' => 'Desk']);

$collection->pull('name');

// 'Desk'

$collection->all();

// ['product_id' => 'prod-100']
```

<a name="method-push"></a>
#### `push()` {#collection-method}

El método `push` agrega un elemento al final de la colección:

```php
$collection = collect([1, 2, 3, 4]);

$collection->push(5);

$collection->all();

// [1, 2, 3, 4, 5]
```

<a name="method-put"></a>
#### `put()` {#collection-method}

El método `put` establece la clave y el valor dado en la colección:

```php
$collection = collect(['product_id' => 1, 'name' => 'Desk']);

$collection->put('price', 100);

$collection->all();

// ['product_id' => 1, 'name' => 'Desk', 'price' => 100]
```

<a name="method-random"></a>
#### `random()` {#collection-method}

El método `random` devuelve un elemento aleatorio de la colección:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->random();

// 4 - (retrieved randomly)
```

Opcionalmente, puedes pasar un número entero a `random` para especificar cuántos elementos deseas recuperar al azar. Siempre se devuelve una colección de valores cuando se pasa explícitamente la cantidad de valores que deseas recibir:

```php
$random = $collection->random(3);

$random->all();

// [2, 4, 5] - (retrieved randomly)
```

Si la colección tiene un númeno menor de elementos al solicitado, el método arrojará un `InvalidArgumentException`.

<a name="method-reduce"></a>
#### `reduce()` {#collection-method}

El método `reduce` reduce la colección a un solo valor, pasando el resultado de cada iteración a la iteración siguiente:

```php
$collection = collect([1, 2, 3]);

$total = $collection->reduce(function ($carry, $item) {
    return $carry + $item;
});

// 6
```

El valor de `$carry` en la primera iteración es `null`; sin embargo, puedes especificar su valor inicial pasando un segundo argumento a reducir:

```php
$collection->reduce(function ($carry, $item) {
    return $carry + $item;
}, 4);

// 10
```

<a name="method-reject"></a>
#### `reject()` {#collection-method}

El método `reject` filtra la colección usando una función de retorno. La función de retorno debe devolver `true` si el elemento debe eliminarse de la colección resultante:

```php
$collection = collect([1, 2, 3, 4]);

$filtered = $collection->reject(function ($value, $key) {
    return $value > 2;
});

$filtered->all();

// [1, 2]
```

Para el inverso del método `reject`, ve el método [`filter`](#method-filter).

<a name="method-reverse"></a>
#### `reverse()` {#collection-method}

El método `reverse` invierte el orden de los elementos de la colección, conservando las claves originales:

```php
$collection = collect(['a', 'b', 'c', 'd', 'e']);

$reversed = $collection->reverse();

$reversed->all();

/*
    [
        4 => 'e',
        3 => 'd',
        2 => 'c',
        1 => 'b',
        0 => 'a',
    ]
*/
```

<a name="method-search"></a>
#### `search()` {#collection-method}

El método `search` busca en la colección el valor dado y devuelve su clave si se encuentra. Si el valor no se encuentra, se devuelve `false`.

```php
$collection = collect([2, 4, 6, 8]);

$collection->search(4);

// 1
```

La búsqueda se realiza usando una comparación "flexible" (loose), lo que significa que una cadena con un valor entero se considerará igual a un número entero del mismo valor. Para usar una comparación "estricta", pasa `true` como segundo parámetro del método:

```php
$collection->search('4', true);

// false
```

Alternativamente, puedes pasar tu propia función de retorno para buscar el primer elemento que pase la validación:

```php
$collection->search(function ($item, $key) {
    return $item > 5;
});

// 2
```

<a name="method-shift"></a>
#### `shift()` {#collection-method}

El método `shift` elimina y devuelve el primer elemento de la colección:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->shift();

// 1

$collection->all();

// [2, 3, 4, 5]
```

<a name="method-shuffle"></a>
#### `shuffle()` {#collection-method}

El método `shuffle` mezcla aleatoriamente los elementos en la colección:

```php
$collection = collect([1, 2, 3, 4, 5]);

$shuffled = $collection->shuffle();

$shuffled->all();

// [3, 2, 5, 1, 4] - (generated randomly)
```

<a name="method-slice"></a>
#### `slice()` {#collection-method}

El método `slice` devuelve una porción de la colección que comienza en el índice pasado como parámetro:

```php
$collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

$slice = $collection->slice(4);

$slice->all();

// [5, 6, 7, 8, 9, 10]
```

Si deseas limitar el tamaño de la porción devuelta, pase el tamaño deseado como segundo argumento para el método:

```php
$slice = $collection->slice(4, 2);

$slice->all();

// [5, 6]
```

El segmento devuelto conservará las claves de forma predeterminada. Si no deseas conservar las claves originales, puedes usar el método [`values`](#method-values) para volverlos a indexar.

<a name="method-some"></a>
#### `some()` {#collection-method}

Alias para el método [`contains`](#method-contains).

<a name="method-sort"></a>
#### `sort()` {#collection-method}

El método `sort` ordena la colección. La colección ordenada conserva las claves del arreglo original, por lo que en este ejemplo utilizaremos el método [`values`](#method-values) para restablecer las claves de los índices numerados consecutivamente:

```php
$collection = collect([5, 3, 1, 2, 4]);

$sorted = $collection->sort();

$sorted->values()->all();

// [1, 2, 3, 4, 5]
```

Si tus necesidades de ordenamiento son más avanzadas, puedes pasar una funión de retorno a `sort` con tu propio algoritmo. Consulta la documentación de PHP en [`uasort`](https://secure.php.net/manual/en/function.uasort.php#refsect1-function.uasort-parameters), que es lo que llama el método `sort` de la colección.

::: tip
Si necesitas ordenar una colección de matrices u objetos anidados, consulta los métodos [`sortBy`](#method-sortby) y [`sortByDesc`](#method-sortbydesc).
:::

<a name="method-sortby"></a>
#### `sortBy()` {#collection-method}

El método `sortBy` ordena la colección con la clave dada. La colección ordenada conserva las claves del arreglo original, por lo que en este ejemplo utilizaremos el método [`values`](#method-values) para restablecer las claves de los índices numerados consecutivamente:

```php
$collection = collect([
    ['name' => 'Desk', 'price' => 200],
    ['name' => 'Chair', 'price' => 100],
    ['name' => 'Bookcase', 'price' => 150],
]);

$sorted = $collection->sortBy('price');

$sorted->values()->all();

/*
    [
        ['name' => 'Chair', 'price' => 100],
        ['name' => 'Bookcase', 'price' => 150],
        ['name' => 'Desk', 'price' => 200],
    ]
*/
```

Puedes también pasar tu propia función de retorno para determinar como ordenar los valores de la colección:

```php
$collection = collect([
    ['name' => 'Desk', 'colors' => ['Black', 'Mahogany']],
    ['name' => 'Chair', 'colors' => ['Black']],
    ['name' => 'Bookcase', 'colors' => ['Red', 'Beige', 'Brown']],
]);

$sorted = $collection->sortBy(function ($product, $key) {
    return count($product['colors']);
});

$sorted->values()->all();

/*
    [
        ['name' => 'Chair', 'colors' => ['Black']],
        ['name' => 'Desk', 'colors' => ['Black', 'Mahogany']],
        ['name' => 'Bookcase', 'colors' => ['Red', 'Beige', 'Brown']],
    ]
*/
```

<a name="method-sortbydesc"></a>
#### `sortByDesc()` {#collection-method}

Este método tiene la misma funcionalidad que el método [`sortBy`](#method-sortby), pero ordenará la colección en el orden opuesto.

<a name="method-sortkeys"></a>
#### `sortKeys()` {#collection-method}

The `sortKeys` method ordena la colección por las llaves del arrelgo asociativo subyacente:

```php
$collection = collect([
    'id' => 22345,
    'first' => 'John',
    'last' => 'Doe',
]);

$sorted = $collection->sortKeys();

$sorted->all();

/*
    [
        'first' => 'John',
        'id' => 22345,
        'last' => 'Doe',
    ]
*/
```

<a name="method-sortkeysdesc"></a>
#### `sortKeysDesc()` {#collection-method}

Este método tiene la misma funcionalidad que el método [`sortKeys`](#method-sortkeys), pero ordenará la colección en el orden opuesto.

<a name="method-splice"></a>
#### `splice()` {#collection-method}

El método `splice` elimina y devuelve una porción de elementos comenzando en el índice especificado:

```php
$collection = collect([1, 2, 3, 4, 5]);

$chunk = $collection->splice(2);

$chunk->all();

// [3, 4, 5]

$collection->all();

// [1, 2]
```

Puedes pasar un segundo parámetro para limitar el tamaño del fragmento resultante:

```php
$collection = collect([1, 2, 3, 4, 5]);

$chunk = $collection->splice(2, 1);

$chunk->all();

// [3]

$collection->all();

// [1, 2, 4, 5]
```

Además, puedes pasar un tercer parámetro que contenga los nuevos elementos para reemplazar los elementos eliminados de la colección:

```php
$collection = collect([1, 2, 3, 4, 5]);

$chunk = $collection->splice(2, 1, [10, 11]);

$chunk->all();

// [3]

$collection->all();

// [1, 2, 10, 11, 4, 5]
```

<a name="method-split"></a>
#### `split()` {#collection-method}

El método `split` divide una colección en el número de grupos dado:

```php
$collection = collect([1, 2, 3, 4, 5]);

$groups = $collection->split(3);

$groups->toArray();

// [[1, 2], [3, 4], [5]]
```

<a name="method-sum"></a>
#### `sum()` {#collection-method}

El método `sum` devuelve la suma de todos los elementos de la colección:

```php
collect([1, 2, 3, 4, 5])->sum();

// 15
```

Si la colección contiene arreglos u objetos anidados, debes pasar una clave para determinar qué valores sumar:

```php
$collection = collect([
    ['name' => 'JavaScript: The Good Parts', 'pages' => 176],
    ['name' => 'JavaScript: The Definitive Guide', 'pages' => 1096],
]);

$collection->sum('pages');

// 1272
```

Además, puedes pasar una función de retorno para determinar qué valores de la colección sumar:

```php
$collection = collect([
    ['name' => 'Chair', 'colors' => ['Black']],
    ['name' => 'Desk', 'colors' => ['Black', 'Mahogany']],
    ['name' => 'Bookcase', 'colors' => ['Red', 'Beige', 'Brown']],
]);

$collection->sum(function ($product) {
    return count($product['colors']);
});

// 6
```

<a name="method-take"></a>
#### `take()` {#collection-method}

El método `take` devuelve una nueva colección con el número especificado de elementos:

```php
$collection = collect([0, 1, 2, 3, 4, 5]);

$chunk = $collection->take(3);

$chunk->all();

// [0, 1, 2]
```

También puedes pasar un número entero negativo para tomar la cantidad especificada de elementos del final de la colección:

```php
$collection = collect([0, 1, 2, 3, 4, 5]);

$chunk = $collection->take(-2);

$chunk->all();

// [4, 5]
```

<a name="method-tap"></a>
#### `tap()` {#collection-method}

El método `tap` pasa la colección a la función de retorno dada, lo que te permite "aprovechar" la colección en un punto específico y hacer algo con los elementos sin afectar a la propia colección:

```php
collect([2, 4, 3, 1, 5])
    ->sort()
    ->tap(function ($collection) {
        Log::debug('Values after sorting', $collection->values()->toArray());
    })
    ->shift();

// 1
```

<a name="method-times"></a>
#### `times()` {#collection-method}

El método estático `times` crea una nueva colección invocando una función de retorno y la cantidad determinada de veces:

```php
$collection = Collection::times(10, function ($number) {
    return $number * 9;
});

$collection->all();

// [9, 18, 27, 36, 45, 54, 63, 72, 81, 90]
```

Este método puede ser útil cuando se combina con Factories para crear modelos [Eloquent](/docs/{{version}}/eloquent):

```php
$categories = Collection::times(3, function ($number) {
    return factory(Category::class)->create(['name' => "Category No. $number"]);
});

$categories->all();

/*
    [
        ['id' => 1, 'name' => 'Category #1'],
        ['id' => 2, 'name' => 'Category #2'],
        ['id' => 3, 'name' => 'Category #3'],
    ]
*/
```

<a name="method-toarray"></a>
#### `toArray()` {#collection-method}

El método `toArray` convierte la colección en un simple `array` de PHP. Si los valores de la colección son modelos [Eloquent](/docs/{{version}}/eloquent), los modelos también se convertirán en arreglos:

```php
$collection = collect(['name' => 'Desk', 'price' => 200]);

$collection->toArray();

/*
    [
        ['name' => 'Desk', 'price' => 200],
    ]
*/
```

::: danger Nota
`toArray` también convierte todos los objetos anidados de la colección que son una instancia de `Arrayable` en un arreglo. En cambio, si deseas obtener el arreglo subyacente sin procesar, usa el método [`all`](#method-all).
:::

<a name="method-tojson"></a>
#### `toJson()` {#collection-method}

El método `toJson` convierte la colección en una cadena serializada JSON:

```php
$collection = collect(['name' => 'Desk', 'price' => 200]);

$collection->toJson();

// '{"name":"Desk", "price":200}'
```

<a name="method-transform"></a>
#### `transform()` {#collection-method}

El método `transform` itera sobre la colección y llama a la función de retorno dada con cada elemento de la colección. Los elementos en la colección serán reemplazados por los valores devueltos de la función de retorno:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->transform(function ($item, $key) {
    return $item * 2;
});

$collection->all();

// [2, 4, 6, 8, 10]
```

::: danger Nota 
A diferencia de la mayoría de otros métodos de las colecciones, `transform` modifica la colección en sí. Si deseas crear una nueva colección en su lugar, usa el método [`map`](#method-map).
:::

<a name="method-union"></a>
#### `union()` {#collection-method}

El método `union` agrega el arreglo dado a la colección. Si el arreglo contiene claves que ya están en la colección original, se preferirán los valores de la colección original:

```php
$collection = collect([1 => ['a'], 2 => ['b']]);

$union = $collection->union([3 => ['c'], 1 => ['b']]);

$union->all();

// [1 => ['a'], 2 => ['b'], 3 => ['c']]
```

<a name="method-unique"></a>
#### `unique()` {#collection-method}

El método `unique` devuelve todos los elementos únicos en la colección. La colección devuelta conserva las claves del arreglo original, por lo que en este ejemplo utilizaremos el método [`values`](#method-values) para restablecer las llaves de los índices numerados consecutivamente:

```php
$collection = collect([1, 1, 2, 2, 3, 4, 2]);

$unique = $collection->unique();

$unique->values()->all();

// [1, 2, 3, 4]
```

Al tratar con arreglos u objetos anidados, puedes especificar la clave utilizada para determinar la singularidad:

```php
$collection = collect([
    ['name' => 'iPhone 6', 'brand' => 'Apple', 'type' => 'phone'],
    ['name' => 'iPhone 5', 'brand' => 'Apple', 'type' => 'phone'],
    ['name' => 'Apple Watch', 'brand' => 'Apple', 'type' => 'watch'],
    ['name' => 'Galaxy S6', 'brand' => 'Samsung', 'type' => 'phone'],
    ['name' => 'Galaxy Gear', 'brand' => 'Samsung', 'type' => 'watch'],
]);

$unique = $collection->unique('brand');

$unique->values()->all();

/*
    [
        ['name' => 'iPhone 6', 'brand' => 'Apple', 'type' => 'phone'],
        ['name' => 'Galaxy S6', 'brand' => 'Samsung', 'type' => 'phone'],
    ]
*/
```

También puedes pasar una función de retorno para determinar la singularidad del elemento:

```php
$unique = $collection->unique(function ($item) {
    return $item['brand'].$item['type'];
});

$unique->values()->all();

/*
    [
        ['name' => 'iPhone 6', 'brand' => 'Apple', 'type' => 'phone'],
        ['name' => 'Apple Watch', 'brand' => 'Apple', 'type' => 'watch'],
        ['name' => 'Galaxy S6', 'brand' => 'Samsung', 'type' => 'phone'],
        ['name' => 'Galaxy Gear', 'brand' => 'Samsung', 'type' => 'watch'],
    ]
*/
```

El método `unique` utiliza comparaciones "flexibles" (loose) al verificar valores de elementos, lo que significa que una cadena con un valor entero se considerará igual a un entero del mismo valor. Usa el método [`uniqueStrict`](#method-uniquestrict) para filtrar usando una comparación "estricta".

<a name="method-uniquestrict"></a>
#### `uniqueStrict()` {#collection-method}

Este método tiene la misma funcionalidad que el método [`unique`](#method-unique); sin embargo, todos los valores se comparan utilizando comparaciones "estrictas".

<a name="method-unless"></a>
#### `unless()` {#collection-method}

El método `unless` ejecutará una función de retorno a menos que el primer argumento dado al método se evalúe como `true`:

```php
$collection = collect([1, 2, 3]);

$collection->unless(true, function ($collection) {
    return $collection->push(4);
});

$collection->unless(false, function ($collection) {
    return $collection->push(5);
});

$collection->all();

// [1, 2, 3, 5]
```

Para hacer lo inverso a `unless`, usa el método [`when`](#method-when).

<a name="method-unlessempty"></a>
#### `unlessEmpty()` {#collection-method}

Alias para el método [`whenNotEmpty`](#method-whennotempty).

<a name="method-unlessnotempty"></a>
#### `unlessNotEmpty()` {#collection-method}

Alias para el método [`whenEmpty`](#method-whenempty).

<a name="method-unwrap"></a>
#### `unwrap()` {#collection-method}

El método estático `unwrap` devuelve los elementos subyacentes de la colección del valor dado cuando corresponda:

```php
Collection::unwrap(collect('John Doe'));

// ['John Doe']

Collection::unwrap(['John Doe']);

// ['John Doe']

Collection::unwrap('John Doe');

// 'John Doe'
```

<a name="method-values"></a>
#### `values()` {#collection-method}

El método `values` devuelve una nueva colección con las claves restablecidas en enteros consecutivos:

```php
$collection = collect([
    10 => ['product' => 'Desk', 'price' => 200],
    11 => ['product' => 'Desk', 'price' => 200]
]);

$values = $collection->values();

$values->all();

/*
    [
        0 => ['product' => 'Desk', 'price' => 200],
        1 => ['product' => 'Desk', 'price' => 200],
    ]
*/
```

<a name="method-when"></a>
#### `when()` {#collection-method}

El método `when` ejecutará una función de retorno cuando el primer argumento dado al método se evalúa como `true`:

```php
$collection = collect([1, 2, 3]);

$collection->when(true, function ($collection) {
    return $collection->push(4);
});

$collection->when(false, function ($collection) {
    return $collection->push(5);
});

$collection->all();

// [1, 2, 3, 4]
```

Para hacer lo inverso a `when`, usa el método [`unless`](#method-unless).

<a name="method-whenempty"></a>
#### `whenEmpty()` {#collection-method}

El método `whenEmpty` ejecutará la función de retorno dada cuando la colección esté vacía:

```php
$collection = collect(['michael', 'tom']);

$collection->whenEmpty(function ($collection) {
    return $collection->push('adam');
});

$collection->all();

// ['michael', 'tom']


$collection = collect();

$collection->whenEmpty(function ($collection) {
    return $collection->push('adam');
});

$collection->all();

// ['adam']


$collection = collect(['michael', 'tom']);

$collection->whenEmpty(function($collection) {
    return $collection->push('adam');
}, function($collection) {
    return $collection->push('taylor');
});

$collection->all();

// ['michael', 'tom', 'taylor']
```

Para el inverso de `whenEmpty`, ve el método [`whenNotEmpty`](#method-whennotempty).

<a name="method-whennotempty"></a>
#### `whenNotEmpty()` {#collection-method}

El método `whenNotEmpty` ejecutará la función de retorno dada cuando la colección no esté vacía:

```php
$collection = collect(['michael', 'tom']);

$collection->whenNotEmpty(function ($collection) {
    return $collection->push('adam');
});

$collection->all();

// ['michael', 'tom', 'adam']


$collection = collect();

$collection->whenNotEmpty(function ($collection) {
    return $collection->push('adam');
});

$collection->all();

// []


$collection = collect();

$collection->whenNotEmpty(function($collection) {
    return $collection->push('adam');
}, function($collection) {
    return $collection->push('taylor');
});

$collection->all();

// ['taylor']
```

Para el inverso de `whenNotEmpty`, ve el método [`whenEmpty`](#method-whenempty).

<a name="method-where"></a>
#### `where()` {#collection-method}

El método `where` filtra la colección por clave y valor pasados como parámetros:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
    ['product' => 'Bookcase', 'price' => 150],
    ['product' => 'Door', 'price' => 100],
]);

$filtered = $collection->where('price', 100);

$filtered->all();

/*
    [
        ['product' => 'Chair', 'price' => 100],
        ['product' => 'Door', 'price' => 100],
    ]
*/
```

El método `where` usa comparaciones "flexibles" (loose) al verificar valores de elementos, lo que significa que una cadena con un valor entero se considerará igual a un entero del mismo valor. Usa el método [`whereStrict`](#method-wherestrict) para hacer comparaciones "estrictas".

<a name="method-wherestrict"></a>
#### `whereStrict()` {#collection-method}

Este método tiene la misma funcionalidad que el método [`where`](#method-where); sin embargo, todos los valores se comparan utilizando comparaciones "estrictas".

<a name="method-wherebetween"></a>
#### `whereBetween()` {#collection-method}

El método `whereBetween` filtra la colección dentro de un rango dado:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 80],
    ['product' => 'Bookcase', 'price' => 150],
    ['product' => 'Pencil', 'price' => 30],
    ['product' => 'Door', 'price' => 100],
]);

$filtered = $collection->whereBetween('price', [100, 200]);

$filtered->all();

/*
    [
        ['product' => 'Desk', 'price' => 200],
        ['product' => 'Bookcase', 'price' => 150],
        ['product' => 'Door', 'price' => 100],
    ]
*/
```

<a name="method-wherein"></a>
#### `whereIn()` {#collection-method}

El método `whereIn` filtra la colección por una clave / valor contenida dentro del arreglo dado:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
    ['product' => 'Bookcase', 'price' => 150],
    ['product' => 'Door', 'price' => 100],
]);

$filtered = $collection->whereIn('price', [150, 200]);

$filtered->all();

/*
    [
        ['product' => 'Bookcase', 'price' => 150],
        ['product' => 'Desk', 'price' => 200],
    ]
*/
```

El método `whereIn` usa comparaciones "flexibles" (loose) al verificar valores de elementos, lo que significa que una cadena con un valor entero se considerará igual a un número entero del mismo valor. Usa el método  [`whereInStrict`](#method-whereinstrict) para hacer comparaciones "estrictas".

<a name="method-whereinstrict"></a>
#### `whereInStrict()` {#collection-method}

Este método tiene la misma funcionalidad que el método [`whereIn`](#method-wherein); sin embargo, todos los valores se comparan utilizando comparaciones "estrictas".

<a name="method-whereinstanceof"></a>
#### `whereInstanceOf()` {#collection-method}

El método `whereInstanceOf` filtra la colección por un tipo de clase dado:

```php
$collection = collect([
    new User,
    new User,
    new Post,
]);

return $collection->whereInstanceOf(User::class);
```

<a name="method-wherenotbetween"></a>
#### `whereNotBetween()` {#collection-method}

El método `whereNotBetween` filtra la colección fuera de un rango dado:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 80],
    ['product' => 'Bookcase', 'price' => 150],
    ['product' => 'Pencil', 'price' => 30],
    ['product' => 'Door', 'price' => 100],
]);

$filtered = $collection->whereNotBetween('price', [100, 200]);

$filtered->all();

/*
    [
        ['product' => 'Chair', 'price' => 80],
        ['product' => 'Pencil', 'price' => 30],
    ]
*/
```

<a name="method-wherenotin"></a>
#### `whereNotIn()` {#collection-method}

El método `whereNotIn` filtra la colección por una clave / valor que no está contenida dentro del arreglo dado:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
    ['product' => 'Bookcase', 'price' => 150],
    ['product' => 'Door', 'price' => 100],
]);

$filtered = $collection->whereNotIn('price', [150, 200]);

$filtered->all();

/*
    [
        ['product' => 'Chair', 'price' => 100],
        ['product' => 'Door', 'price' => 100],
    ]
*/
```

El método `whereNotIn` utiliza comparaciones "flexibles" (loose) cuando se comprueban los valores de los elementos, lo que significa que una cadena con un valor entero se considerará igual a un número entero del mismo valor. Usa el método [`whereNotInStrict`](#method-wherenotinstrict) para hacer comparaciones "estrictas".

<a name="method-wherenotinstrict"></a>
#### `whereNotInStrict()` {#collection-method}

Este método tiene la misma funcionalidad que el método [`whereNotIn`](#method-wherenotin); sin embargo, todos los valores se comparan utilizando comparaciones "estrictas".

<a name="method-wrap"></a>
#### `wrap()` {#collection-method}

El método estático `wrap` envuelve el valor dado en una colección cuando corresponda:

```php
$collection = Collection::wrap('John Doe');

$collection->all();

// ['John Doe']

$collection = Collection::wrap(['John Doe']);

$collection->all();

// ['John Doe']

$collection = Collection::wrap(collect('John Doe'));

$collection->all();

// ['John Doe']
```

<a name="method-zip"></a>
#### `zip()` {#collection-method}

El método `zip` combina los valores del arreglo con los valores de la colección original en el índice correspondiente:

```php
$collection = collect(['Chair', 'Desk']);

$zipped = $collection->zip([100, 200]);

$zipped->all();

// [['Chair', 100], ['Desk', 200]]
```

<a name="higher-order-messages"></a>
## Mensajes de Orden Superior

Las colecciones también brindan soporte para "mensajes de orden superior", que son atajos para realizar acciones comunes en las colecciones. Los métodos de recopilación que proporcionan mensajes de orden superior son: [`average`](#method-average), [`avg`](#method-avg), [`contains`](#method-contains), [`each`](#method-each), [`every`](#method-every), [`filter`](#method-filter), [`first`](#method-first), [`flatMap`](#method-flatmap), [`groupBy`](#method-groupby), [`keyBy`](#method-keyby), [`map`](#method-map), [`max`](#method-max), [`min`](#method-min), [`partition`](#method-partition), [`reject`](#method-reject), [`some`](#method-some), [`sortBy`](#method-sortby), [`sortByDesc`](#method-sortbydesc), [`sum`](#method-sum), and [`unique`](#method-unique).

Ee puede acceder a cada mensaje de orden superior como una propiedad dinámica en una instancia de colección. Por ejemplo, usemos el mensaje `each` de orden superior para llamar a un método en cada objeto dentro de una colección:

```php
$users = User::where('votes', '>', 500)->get();

$users->each->markAsVip();
```

Del mismo modo, podemos usar el mensaje de orden superior `sum` para reunir el número total de "votos" para una colección de usuarios:

```php
$users = User::where('group', 'Development')->get();

return $users->sum->votes;
```