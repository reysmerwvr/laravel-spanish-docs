::: v-pre

# Scout para Laravel

- [Introducción](#introduction)
- [Instalación](#installation)
    - [Colas](#queueing)
    - [Requisitos Previos Del Driver](#driver-prerequisites)
- [Configuración](#configuration)
    - [Configurando Índices De Modelo](#configuring-model-indexes)
    - [Configurando Datos De Búsqueda](#configuring-searchable-data)
    - [Configurando La ID Del Modelo](#configuring-the-model-id)
- [Indexando](#indexing)
    - [Importación en Lote (Batch)](#batch-import)
    - [Agregando Registros](#adding-records)
    - [Actualizando Registros](#updating-records)
    - [Eliminando Registros](#removing-records)
    - [Pausando Indexamiento](#pausing-indexing)
    - [Instancias De Modelos Searchable Condicionales](#conditionally-searchable-model-instances)
- [Búsqueda](#searching)
    - [Cláusulas Where](#where-clauses)
    - [Paginación](#pagination)
    - [Eliminación Lógica](#soft-deleting)
    - [Personalizando Motores De Búsqueda](#customizing-engine-searches)
- [Motores Personalizados](#custom-engines)
- [Macros De Constructor (Builder)](#builder-macros)

<a name="introduction"></a>
## Introducción

Laravel Scout proporciona una sencilla solución para agregar búsquedas de texto completo a tus [modelos Eloquent](/docs/{{version}}/eloquent). Usando observadores de modelo, Scout mantendrá automáticamente tus índices de búsqueda sincronizados con tus registros de Eloquent.

Actualmente, Scout viene con el controlador (driver) [Algolia](https://www.algolia.com/); sin embargo, la escritura de controladores personalizados es simple y eres libre de extender Scout con tus propias implementaciones de búsqueda.

<a name="installation"></a>
## Instalación

Primero, instala Scout por medio del paquete administrador de Composer:

```php
composer require laravel/scout
```

Después de instalar Scout, debes publicar la configuración de Scout usando el comando Artisan `vendor:publish`. Este comando publicará el archivo de configuración `scout.php` en tu directorio `config`:

```php
php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"
```

Finalmente, agrega el trait `Laravel\Scout\Searchable` al modelo en el que te gustaría hacer búsquedas. Este trait registrará un observador de modelo para mantener sincronizado con tu controlador de búsqueda:

```php
<?php

namespace App;

use Laravel\Scout\Searchable;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use Searchable;
}
```

<a name="queueing"></a>
### Colas

Aunque no es estrictamente necesario para usar Scout, deberías considerar fuertemente configurar un [controlador de cola](/docs/{{version}}/queues) antes de usar el paquete. La ejecución de un trabajador (worker) de cola permitirá a Scout poner en cola todas las operaciones que sincronizan la información de tu modelo con tus índices de búsqueda, proporcionando mejores tiempos de respuesta para la interfaz web de tu aplicación.

Una vez que hayas configurado tu controlador de cola, establece el valor de la opción `queue` en tu archivo de configuración `config/scout.php` a `true`:

```php
'queue' => true,
```

<a name="driver-prerequisites"></a>
### Requisitos Previos Del Driver

#### Algolia

Al usar el controlador Algolia, debes configurar tus credenciales `id` y `secret` en tu archivo de configuración `config/scout.php`. Una vez que tus credenciales han sido configuradas, también necesitarás instalar Algolia PHP SDK por medio del gestor de paquetes Composer:

```php
composer require algolia/algoliasearch-client-php:^2.2
```

<a name="configuration"></a>
## Configuración

<a name="configuring-model-indexes"></a>
### Configurando Índices De Modelo

Cada modelo Eloquent es sincronizado con un "índice" de búsqueda dado, el cual contiene todos los registros que pueden ser encontrados para ese modelo. En otras palabras, puedes pensar en cada índice como una tabla MySQL. De forma predeterminada, cada modelo será persistido en un índice que coincida con el típico nombre de la "tabla" del modelo. Típicamente, esta es la forma plural del nombre del modelo; sin embargo, eres libre de personalizar el índice del modelo sobrescribiendo el método `searchableAs` en el modelo:

```php
<?php

namespace App;

use Laravel\Scout\Searchable;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use Searchable;

    /**
    * Get the index name for the model.
    *
    * @return string
    */
    public function searchableAs()
    {
        return 'posts_index';
    }
}
```

<a name="configuring-searchable-data"></a>
### Configuración De Datos De Búsqueda

De forma predeterminada, la forma `toArray` completa de un modelo dado será persistida en su índice de búsqueda. Si prefieres personalizar los datos que son sincronizados en el índice de búsqueda, puedes sobrescribir el método `toSearchableArray` en el modelo:

```php
<?php

namespace App;

use Laravel\Scout\Searchable;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use Searchable;

    /**
    * Get the indexable data array for the model.
    *
    * @return array
    */
    public function toSearchableArray()
    {
        $array = $this->toArray();

        // Customize array...

        return $array;
    }
}
```

<a name="configuring-the-model-id"></a>
### Configurando El ID Del Modelo

Por defecto, Scout usará la clave primaria del modelo como su ID única, almacenada en el índice de búsqueda. Si necesitas personalizar este comportamiento, se puede sobrescribir el método `getScoutKey` en el modelo:

```php
<?php

namespace App;

use Laravel\Scout\Searchable;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    use Searchable;

    /**
    * Get the value used to index the model.
    *
    * @return mixed
    */
    public function getScoutKey()
    {
        return $this->email;
    }
}
```

<a name="indexing"></a>
## Indexando

<a name="batch-import"></a>
### Importación en Lote (Batch)

Si estás instalando Scout en un proyecto existente, puede que ya tengas registros de base de datos que necesites importar dentro de tu manejador de búsqueda. Scout proporciona un comando Artisan `import` que puedes usar para importar todos tus registros existentes a tus índices de búsqueda:

```php
php artisan scout:import "App\Post"
```

The `flush` command may be used to remove all of a model's records from your search indexes:

```php
php artisan scout:flush "App\Post"
```

<a name="adding-records"></a>
### Agregando Registros

Una vez que has agregado el trait `Laravel\Scout\Searchable` a tu modelo, todo lo que necesitas hacer es llamar a `save` en una instancia de modelo y será agregada automáticamente a tu índice de búsqueda. Si has configurado Scout para [usar colas](#queueing) esta operación será ejecutada en segundo plano por tu worker de cola:

```php
$order = new App\Order;

// ...

$order->save();
```

#### Agregando Por Medio de Consulta

Si prefieres agregar una colección de modelos a tu índice de búsqueda por medio de una consulta Eloquent, puedes encadenar el método `searchable` con una consulta Eloquent. El método `searchable` [dividirá (chunk) los resultados](/docs/{{version}}/eloquent#chunking-results) de la consulta y agregará los registros a tu índice de búsqueda. Otra vez, si has configurado Scout para usar colas, todos estas porciones serán agregadas en segundo plano por tus workers de cola:

```php
// Agregando Por Medio de consulta Eloquent...
App\Order::where('price', '>', 100)->searchable();

// Puedes también agregar registros a través de relaciones...
$user->orders()->searchable();

// Puedes también agregar registros a través de colecciones...
$orders->searchable();
```

El método `searchable` puede ser considerado una operación "upsert". En otras palabras, si el registro del modelo ya está en tu índice, será actualizado. Si no existe en el índice de búsqueda, será agregado al índice.

<a name="updating-records"></a>
### Actualizando Registros

Para actualizar un modelo searchable, sólo necesitas actualizar las propiedades de la instancia del modelo y llamar a `save` en el modelo en tu base de datos. Scout persistirá automáticamente los cambios en tu índice de búsqueda:

```php
$order = App\Order::find(1);

// Update the order...

$order->save();
```

También puedes usar el método `searchable` en una consulta Eloquent para actualizar una colección de modelos. Si los modelos no existen en tu índice de búsqueda, serán creados:

```php
// Actualizando a través de consulta de Eloquent...
App\Order::where('price', '>', 100)->searchable();

// Puedes actualizar por medio de relaciones...
$user->orders()->searchable();

// También puedes actualizar a través de colecciones...
$orders->searchable();
```

<a name="removing-records"></a>
### Eliminando Registros

Para eliminar un registro de tu índice, llama a `delete` en el modelo de la base de datos. Esta forma de eliminar es también compatible con los modelos [eliminados lógicamente](/docs/{{version}}/eloquent#soft-deleting):

```php
$order = App\Order::find(1);

$order->delete();
```

Si no quieres obtener el modelo antes de eliminar el registro, puedes usar el método `unsearchable` en una instancia de consulta de Eloquent o una colección:

```php
// Removing via Eloquent query...
App\Order::where('price', '>', 100)->unsearchable();

// You may also remove via relationships...
$user->orders()->unsearchable();

// You may also remove via collections...
$orders->unsearchable();
```

<a name="pausing-indexing"></a>
### Pausando el Indexamiento

Algunas veces puedes necesitar ejecutar un lote de operaciones de Eloquent en un modelo sin sincronizar los datos del modelo con tu índice de búsqueda. Puedes hacer esto usando el método `withoutSyncingToSearch`. Este método acepta una sola función de retorno la cual será ejecutada inmediatamente. Cualquiera de las operaciones de modelo que ocurran dentro de la función de retorno no serán sincronizadas con el índice del modelo:

```php
App\Order::withoutSyncingToSearch(function () {
    // Perform model actions...
});
```

<a name="conditionally-searchable-model-instances"></a>
### Instancias De Modelos Searchable Condicionales

A veces es posible que solo tengas que hacer que un modelo searchable bajo ciertas condiciones. Por ejemplo, imagina que tienes el modelo `App\Post` que puede estar en uno de dos estados: " borrador (draft)" y "publicado (published)". Es posible que solo desees permitir que las publicaciones "publicadas" puedan buscarse. Para lograr esto, puede definir un método `shouldBeSearchable` en su modelo:

```php
public function shouldBeSearchable()
{
    return $this->isPublished();
}
```

El método `shouldBeSearchable` solo se aplica cuando se manipulan modelos a través del método `save`, las consultas o las relaciones. Puedes hacer que los modelos o las colecciones se puedan buscar directamente utilizando el método `searchable` que sobrescribirá el resultado del método` shouldBeSearchable`:

```php
// Respetará "shouldBeSearchable"...
App\Order::where('price', '>', 100)->searchable();

$user->orders()->searchable();

$order->save();

// Sobrescribirá "shouldBeSearchable"...
$orders->searchable();

$order->searchable();
```

<a name="searching"></a>
## Búsqueda

Puedes empezar a buscar un modelo usando el método `search`. Este método acepta una sola cadena que será usada para buscar tus modelos. Luego debes encadenar el método `get` con la consulta de búsqueda para obtener los modelos Eloquent que coincidan con la consulta de búsqueda dada:

```php
$orders = App\Order::search('Star Trek')->get();
```

Ya que las búsquedas de Scout devuelven una colección de modelos, incluso puedes devolver los resultados directamente desde una ruta o controlador y serán convertidos automáticamente a JSON:

```php
use Illuminate\Http\Request;

Route::get('/search', function (Request $request) {
    return App\Order::search($request->search)->get();
});
```

Si prefieres obtener los resultados crudos (raw) antes de que sean convertidos a modelos de Eloquent, deberías usar el método `raw`:

```php
$orders = App\Order::search('Star Trek')->raw();
```

Las consultas de búsqueda son ejecutadas típicamente en el índice especificado por el método [`searchableAs`](#configuring-model-indexes) del modelo. Sin embargo, puedes usar el método `within` para especificar un índice personalizado que debería ser buscado en su lugar:

```php
$orders = App\Order::search('Star Trek')
    ->within('tv_shows_popularity_desc')
    ->get();
```

<a name="where-clauses"></a>
## Cláusulas Where

Scout permite que agregues cláusulas "where" sencillas a tus consultas de búsqueda. Actualmente, estas cláusulas solamente soportan verificaciones básicas de igualdad numérica y son útiles principalmente para establecer el alcance de las consultas de búsqueda por un ID. Ya que un índice de búsqueda no es una base de datos relacional, cláusulas "where" más avanzadas no están soportadas actualmente:

```php
$orders = App\Order::search('Star Trek')->where('user_id', 1)->get();
```

<a name="pagination"></a>
### Paginación

Además de obtener una colección de modelos, puedes paginar los resultados de tu búsqueda usando el método `paginate`. Este método devolverá una instancia `Paginator` justo como si hubieras [paginada una consulta Eloquent tradicional](/docs/{{version}}/pagination):

```php
$orders = App\Order::search('Star Trek')->paginate();
```

Puedes especificar cuántos modelos obtener por página al pasar la cantidad como primer argumento del método `paginate`:

```php
$orders = App\Order::search('Star Trek')->paginate(15);
```

Una vez que has obtenido los resultados, puedes mostrar los resultados y renderizar los enlaces de página usando [Blade](/docs/{{version}}/blade) justo como si hubieras paginado una consulta Eloquent tradicional:

```php
<div class="container">
    @foreach ($orders as $order)
        {{ $order->price }}
    @endforeach
</div>

{{ $orders->links() }}
```

<a name="soft-deleting"></a>
### Eliminación Lógica

Si tus modelos indexados son de [eliminación lógica](/docs/{{version}}/eloquent#soft-deleting) y necesitas buscar tus modelos eliminados lógicamente, establece la opción `soft_delete` del archivo `config/scout.php` en `true`:

```php
'soft_delete' => true,
```

Cuando esta opción de configuración es `true`, Scout no removerá del índice los modelos eliminados lógicamente. En su lugar, establecerá un atributo escondido `__soft_deleted` en el registro indexado. Luego, puedes usar los métodos `withTrashed` o `onlyTrashed` para recuperar los registros eliminados lógicamente al realizar una búsqueda:

```php
// Include trashed records when retrieving results...
$orders = App\Order::withTrashed()->search('Star Trek')->get();

// Only include trashed records when retrieving results...
$orders = App\Order::onlyTrashed()->search('Star Trek')->get();
```

::: tip
Cuando un modelo eliminado lógicamente es eliminado permanentemente utilizando `forceDelete`, Scout lo removerá del índice de búsqueda automáticamente.
:::

<a name="customizing-engine-searches"></a>
### Personalizando Motores de Búsqueda

Si necesitas personalizar el comportamiento de un motor de búsqueda, puedes pasar una función de retorno (callback) como el segundo argumento al método `search`. Por ejemplo, podrías usar este callback para añadir datos de geolocalización a tus opciones de búsqueda antes de que la consulta de búsqueda sea pasada a Algolia: 

```php
use Algolia\AlgoliaSearch\SearchIndex;

App\Order::search('Star Trek', function (SearchIndex $algolia, string $query, array $options) {
    $options['body']['query']['bool']['filter']['geo_distance'] = [
        'distance' => '1000km',
        'location' => ['lat' => 36, 'lon' => 111],
    ];

    return $algolia->search($query, $options);
})->get();
```

<a name="custom-engines"></a>
## Motores Personalizados

#### Escribiendo El Motor

Si ninguno de los motores de búsqueda integrados en Scout no se ajustan a tus necesidades, puedes escribir tu propio motor personalizado y registrarlo con Scout. Tu motor debería extender la clase abstracta `Laravel\Scout\Engines\Engine`. Esta clase abstracta contiene siete métodos que tu motor de búsqueda personalizado debe implementar:

```php
use Laravel\Scout\Builder;

abstract public function update($models);
abstract public function delete($models);
abstract public function search(Builder $builder);
abstract public function paginate(Builder $builder, $perPage, $page);
abstract public function mapIds($results);
abstract public function map($results, $model);
abstract public function getTotalCount($results);
abstract public function flush($model);
```

Puedes encontrar útil revisar las implementaciones de estos métodos en la clase `Laravel\Scout\Engines\AlgoliaEngine`. Esta clase te proporcionará un buen punto de inicio para aprender cómo implementar cada uno de estos métodos en tu propio motor.

#### Registrando El Motor

Una vez que hayas escrito tu motor personalizado, puedes registrarlo con Scout usando el método `extend` del administrador de motor de Scout. Deberías ejecutar el método `extend` desde el método `boot` de tu `AppServiceProvider` o cualquier otro proveedor de servicio usado por tu aplicación. Por ejemplo, si has escrito un `MySqlSearchEngine`, puedes registrarlo como sigue:

```php
use Laravel\Scout\EngineManager;

/**
* Bootstrap any application services.
*
* @return void
*/
public function boot()
{
    resolve(EngineManager::class)->extend('mysql', function () {
        return new MySqlSearchEngine;
    });
}
```

Una vez que tu motor ha sido registrado, puedes especificarlo como tu `driver` predeterminado de Scout en tu archivo de configuración `config/scout.php`:

```php
'driver' => 'mysql',
```

<a name="builder-macros"></a>
## Macros De Constructor (Builder)

Si deseas definir un método constructor personalizado, puedes usar el método `macro` en la clase `Laravel\Scout\Builder`. Típicamente, las "macros" deben ser definidas dentro de un método `boot` de un [proveedor de servicios](/docs/{{version}}/providers):

```php
<?php

namespace App\Providers;

use Laravel\Scout\Builder;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Response;

class ScoutMacroServiceProvider extends ServiceProvider
{
    /**
    * Register the application's scout macros.
    *
    * @return void
    */
    public function boot()
    {
        Builder::macro('count', function () {
            return $this->engine->getTotalCount(
                $this->engine()->search($this)
            );
        });
    }
}
```

La función `macro` acepta un nombre como su primer argumento y un Closure como el segundo. El CLosure del macro será ejecutado al momento de llamar el nombre del macro desde una implementación `Laravel\Scout\Builder`:

```php
App\Order::search('Star Trek')->count();
```