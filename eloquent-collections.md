::: v-pre

# Eloquent: Colecciones

- [Introducción](#introduction)
- [Métodos Disponibles](#available-methods)
- [Colecciones Personalizadas](#custom-collections)

<a name="introduction"></a>
## Introducción

Todos los conjuntos de multi-resultados retornados por Eloquent son instancias del objeto `Illuminate\Database\Eloquent\Collection`, incluyendo los resultados obtenidos por medio del método `get` o accedidos por medio de una relación. El objeto de la colección Eloquent extiende la [collección base](/docs/{{version}}/collections) de Laravel, así hereda naturalmente docenas de métodos usados para trabajar fluidamente con el arreglo subyacente de modelos de Eloquent.

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
Mientras los métodos de colección de Eloquent devuelven una nueva instancia de una colección de Eloquent, los métodos `pluck`, `keys`, `zip`, `collapse`, `flatten` y `flip` devuelven una instancia de [colección base](/docs/{{version}}/collections). De igual forma, si una operación devuelve una colección que no contiene modelos Eloquent, será automáticamente convertida a una colección base.
:::

<a name="available-methods"></a>
## Métodos Disponibles

### La Colección Base

Todas las colecciones de Eloquent extienden el objeto de [colección de Laravel](/docs/{{version}}/collections) base; sin embargo, heredan todos los métodos poderosos proporcionados por la clase de colección base:

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

[all](/docs/{{version}}/collections#method-all)
[average](/docs/{{version}}/collections#method-average)
[avg](/docs/{{version}}/collections#method-avg)
[chunk](/docs/{{version}}/collections#method-chunk)
[collapse](/docs/{{version}}/collections#method-collapse)
[combine](/docs/{{version}}/collections#method-combine)
[concat](/docs/{{version}}/collections#method-concat)
[contains](/docs/{{version}}/collections#method-contains)
[containsStrict](/docs/{{version}}/collections#method-containsstrict)
[count](/docs/{{version}}/collections#method-count)
[crossJoin](/docs/{{version}}/collections#method-crossjoin)
[dd](/docs/{{version}}/collections#method-dd)
[diff](/docs/{{version}}/collections#method-diff)
[diffKeys](/docs/{{version}}/collections#method-diffkeys)
[dump](/docs/{{version}}/collections#method-dump)
[each](/docs/{{version}}/collections#method-each)
[eachSpread](/docs/{{version}}/collections#method-eachspread)
[every](/docs/{{version}}/collections#method-every)
[except](/docs/{{version}}/collections#method-except)
[filter](/docs/{{version}}/collections#method-filter)
[first](/docs/{{version}}/collections#method-first)
[flatMap](/docs/{{version}}/collections#method-flatmap)
[flatten](/docs/{{version}}/collections#method-flatten)
[flip](/docs/{{version}}/collections#method-flip)
[forget](/docs/{{version}}/collections#method-forget)
[forPage](/docs/{{version}}/collections#method-forpage)
[get](/docs/{{version}}/collections#method-get)
[groupBy](/docs/{{version}}/collections#method-groupby)
[has](/docs/{{version}}/collections#method-has)
[implode](/docs/{{version}}/collections#method-implode)
[intersect](/docs/{{version}}/collections#method-intersect)
[isEmpty](/docs/{{version}}/collections#method-isempty)
[isNotEmpty](/docs/{{version}}/collections#method-isnotempty)
[keyBy](/docs/{{version}}/collections#method-keyby)
[keys](/docs/{{version}}/collections#method-keys)
[last](/docs/{{version}}/collections#method-last)
[map](/docs/{{version}}/collections#method-map)
[mapInto](/docs/{{version}}/collections#method-mapinto)
[mapSpread](/docs/{{version}}/collections#method-mapspread)
[mapToGroups](/docs/{{version}}/collections#method-maptogroups)
[mapWithKeys](/docs/{{version}}/collections#method-mapwithkeys)
[max](/docs/{{version}}/collections#method-max)
[median](/docs/{{version}}/collections#method-median)
[merge](/docs/{{version}}/collections#method-merge)
[min](/docs/{{version}}/collections#method-min)
[mode](/docs/{{version}}/collections#method-mode)
[nth](/docs/{{version}}/collections#method-nth)
[only](/docs/{{version}}/collections#method-only)
[pad](/docs/{{version}}/collections#method-pad)
[partition](/docs/{{version}}/collections#method-partition)
[pipe](/docs/{{version}}/collections#method-pipe)
[pluck](/docs/{{version}}/collections#method-pluck)
[pop](/docs/{{version}}/collections#method-pop)
[prepend](/docs/{{version}}/collections#method-prepend)
[pull](/docs/{{version}}/collections#method-pull)
[push](/docs/{{version}}/collections#method-push)
[put](/docs/{{version}}/collections#method-put)
[random](/docs/{{version}}/collections#method-random)
[reduce](/docs/{{version}}/collections#method-reduce)
[reject](/docs/{{version}}/collections#method-reject)
[reverse](/docs/{{version}}/collections#method-reverse)
[search](/docs/{{version}}/collections#method-search)
[shift](/docs/{{version}}/collections#method-shift)
[shuffle](/docs/{{version}}/collections#method-shuffle)
[slice](/docs/{{version}}/collections#method-slice)
[some](/docs/{{version}}/collections#method-some)
[sort](/docs/{{version}}/collections#method-sort)
[sortBy](/docs/{{version}}/collections#method-sortby)
[sortByDesc](/docs/{{version}}/collections#method-sortbydesc)
[splice](/docs/{{version}}/collections#method-splice)
[split](/docs/{{version}}/collections#method-split)
[sum](/docs/{{version}}/collections#method-sum)
[take](/docs/{{version}}/collections#method-take)
[tap](/docs/{{version}}/collections#method-tap)
[toArray](/docs/{{version}}/collections#method-toarray)
[toJson](/docs/{{version}}/collections#method-tojson)
[transform](/docs/{{version}}/collections#method-transform)
[union](/docs/{{version}}/collections#method-union)
[unique](/docs/{{version}}/collections#method-unique)
[uniqueStrict](/docs/{{version}}/collections#method-uniquestrict)
[unless](/docs/{{version}}/collections#method-unless)
[values](/docs/{{version}}/collections#method-values)
[when](/docs/{{version}}/collections#method-when)
[where](/docs/{{version}}/collections#method-where)
[whereStrict](/docs/{{version}}/collections#method-wherestrict)
[whereIn](/docs/{{version}}/collections#method-wherein)
[whereInStrict](/docs/{{version}}/collections#method-whereinstrict)
[whereNotIn](/docs/{{version}}/collections#method-wherenotin)
[whereNotInStrict](/docs/{{version}}/collections#method-wherenotinstrict)
[zip](/docs/{{version}}/collections#method-zip)

</div>

<a name="custom-collections"></a>
## Colecciones Personalizadas

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