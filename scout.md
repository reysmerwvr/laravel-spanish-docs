# Scout para Laravel

- [Introducción](#introduction)
- [Instalación](#installation)
    - [Encolando](#queueing)
    - [Prerrequisitos del Driver](#driver-prerequisites)
- [Configuración](#configuration)
    - [Configurando Índices de Modelo](#configuring-model-indexes)
    - [Configurando Datos de Búsqueda](#configuring-searchable-data)
- [Indexando](#indexing)
    - [Importar Lote](#batch-import)
    - [Agregando Registros](#adding-records)
    - [Actualizando Registros](#updating-records)
    - [Eliminando Registros](#removing-records)
    - [Pausando Indexamiento](#pausing-indexing)
- [Buscando](#searching)
    - [Cláusulas Where](#where-clauses)
    - [Paginación](#pagination)
- [Motores Personalizados](#custom-engines)

<a name="introduction"></a>
## Introducción

Scout para Laravel proporciona una sencilla solución para agregar búsquedas de texto completo a tus [modelos Eloquent](/docs/{{version}}/eloquent). Usando observadores de modelo, Scout mantendrá automáticamente tus índices de búsqueda sincronizados con tus registros de Eloquent.

Actualmente, Scout viene con un manejador [Algolia](https://www.algolia.com/); sin embargo, la escritura de manejadores personalizados en sencillo y eres libre de extender Scout con tus propias implementaciones de búsqueda.

<a name="installation"></a>
## Instalación

Primero, instala Scout por medio del paquete administrador de Composer:

    composer require laravel/scout

Después de instalar Scout, deberías publicar la configuración de Scout usando el comando Artisan `vendor:publish`. Este comando publicará el archivo de configuración en tu directorio `config`:

    php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"

Finalmente, agrega la característica `Laravel\Scout\Searchable` al modelo en el que te gustaría hacer las búsquedas. Esta característica registrará un observador de modelo para mantener sincronizado con tu manejador de búsqueda:

    <?php

    namespace App;

    use Laravel\Scout\Searchable;
    use Illuminate\Database\Eloquent\Model;

    class Post extends Model
    {
        use Searchable;
    }

<a name="queueing"></a>
### Encolando

Mientras no es requerido estrictamente para usar Scout, deberías considerar fuertemente configurar un [manejador de cola](/docs/{{version}}/queues) antes de usar la librería. Ejecutar un worker de cola permitirá que Scout encole todas las operaciones que sincronizan la información de tu modelo con tus índices de búsqueda, proporcionando tiempos de respuesta mucho mejores para la interfaz web de tu aplicación.

Una vez que hayas configurado tu manejador de cola, establece el valor de la opción `queue` en tu archivo de configuración `config/scout.php` a `true`:

    'queue' => true,

<a name="driver-prerequisites"></a>
### Prerrequisitos del Manejador

#### Algolia

Al momento de usar el manejador de Algolia, deberías configurar tus credenciales `id` y `secret` en tu archivo de configuración `config/scout.php`. Una vez que tus credenciales han sido configuradas, también necesitarás instalar Algolia PHP SDK por medio del administrador de paquetes Composer:

    composer require algolia/algoliasearch-client-php

<a name="configuration"></a>
## Configuración

<a name="configuring-model-indexes"></a>
### Configurando Índices de Modelo

Cada modelo Eloquent es sincronizado con un "índice" de búsqueda dado, el cuál contiene todos los registros que pueden ser encontrados para ese modelo. En otras palabras, puedes pensar en cada índice como una tabla MySQL. De forma predeterminada, cada modelo será persistido en un índice que coincida con el típico nombre de la "tabla" del modelo. Típicamente, esta es la forma plural del nombre del modelo; sin embargo, eres libre de personalizar el índice del modelo sobrescribiendo el método `searchableAs` en el modelo:

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

<a name="configuring-searchable-data"></a>
### Configurando Datos Que pueden Ser Encontrados

De forma predeterminada, la forma `toArray` completa de un modelo dado será persistida en su índice de búsqueda. Si prefieres personalizar los datos que son sincronizados en el índice de búsqueda, puedes sobrescribir el método `toSearchableArray` en el modelo:

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

<a name="indexing"></a>
## Indexando

<a name="batch-import"></a>
### Importar Lote

Si estás instalando Scout en un proyecto existente, puede que ya tengas registros de base de datos que necesites importar dentro de tu manejador de búsqueda. Scout proporciona un comando Artisan `import` que puedes usar para importar todos tus registros existentes a tus índices de búsqueda:

    php artisan scout:import "App\Post"

<a name="adding-records"></a>
### Agregando Registros

Una vez que has agregado la característica `Laravel\Scout\Searchable` a tu modelo, todo lo que necesitas hacer es llamar a `save` en una instancia de modelo y será agregada automáticamente a tu índice de búsqueda. Si has configurado Scout para [usar colas](#queueing) esta operación será ejecutada en segundo plano por tu worker de cola:

    $order = new App\Order;

    // ...

    $order->save();

#### Agregando Por Medio de Consulta

Si prefieres agregar una colección de modelos a tu índice de búsqueda por medio de una consulta Eloquent, puedes encadenar el método `searchable` con una consulta Eloquent. El método `searchable` [dividirá los resultados](/docs/{{version}}/eloquent#chunking-results) de la consulta y agregará los registros a tu índice de búsqueda. Otra vez, si has configurado Scout para usar colas, todos estas porciones seran agregadas en segundo plano por tus workers de cola:

    // Adding via Eloquent query...
    App\Order::where('price', '>', 100)->searchable();

    // You may also add records via relationships...
    $user->orders()->searchable();

    // You may also add records via collections...
    $orders->searchable();

El método `searchable` puede ser considerado una operación "upsert". En otras palabras, si el registro del modelo ya está en tu índice, será actualizado. Si no existe en el índice de búsqueda, será agregado al índice.

<a name="updating-records"></a>
### Actualizando Registros

Para actualizar un modelo buscable, sólo necesitas actualizar las propiedades de la instancia del modelo y llamar a `save` en el modelo en tu base de datos. Scout persistirá automáticamente los cambios en tu índice de búsqueda:

    $order = App\Order::find(1);

    // Update the order...

    $order->save();

También puedes usar el método `searchable` en una consulta Eloquent para actualizar una colección de modelos. Si los modelos no existen en tu índice de búsqueda, serán creados:

    // Updating via Eloquent query...
    App\Order::where('price', '>', 100)->searchable();

    // You may also update via relationships...
    $user->orders()->searchable();

    // You may also update via collections...
    $orders->searchable();

<a name="removing-records"></a>
### Eliminando Registros

Para eliminar un registro de tu índice, llama a `delete` en el modelo de la base de datos. Esta forma de eliminar es también compatible con los modelos [eliminados lógicamente](/docs/{{version}}/eloquent#soft-deleting):

    $order = App\Order::find(1);

    $order->delete();

Si no quieres obtener el modelo antes de eliminar el registro, puedes usar el método `unsearchable` en una instancia de consulta de Eloquent o una colección:

    // Removing via Eloquent query...
    App\Order::where('price', '>', 100)->unsearchable();

    // You may also remove via relationships...
    $user->orders()->unsearchable();

    // You may also remove via collections...
    $orders->unsearchable();

<a name="pausing-indexing"></a>
### Pausando el Indexamiento

Algunas veces puedes necesitar ejecutar un lote de operaciones de Eloquent en un modelo sin sincronizar los datos del modelo con tu índice de búsqueda. Puedes hacer esto usando el método `withoutSyncingToSearch`. Este método acepta una sola función de retorno la cual será ejecutada inmediatamente. Cualquiera de las operaciones de modelo que ocurran dentro de la función de retorno no serán sincronizadas con el índice del modelo:

    App\Order::withoutSyncingToSearch(function () {
        // Perform model actions...
    });

<a name="searching"></a>
## Buscando

Puedes empezar a buscar un modelo usando el método `search`. El método "search" acepta una sola cadena que será usada para buscar tus modelos. Luego deberías encadenar el método `get` con la consulta de búsqueda para obtener los modelos Eloquent que coincidan con la consulta de búsqueda dada:

    $orders = App\Order::search('Star Trek')->get();

Ya que las búsquedas de Scout devuelven una colección de modelos, incluso puedes devolver los resultados directamente desde una ruta o controlador y serán convertidos automáticamente a JSON:

    use Illuminate\Http\Request;

    Route::get('/search', function (Request $request) {
        return App\Order::search($request->search)->get();
    });

Si prefieres obtener los resultados crudos antes de que sean convertidos a modelos de Eloquent, deberías usar el método `raw`:

    $orders = App\Order::search('Star Trek')->raw();

Las consultas de búsqueda son ejecutadas típicamente en el índice especificado por el método [`searchableAs`](#configuring-model-indexes) del modelo. Sin embargo, puedes usar el método `within` para especificar un índice personalizado que debería ser buscado en su lugar:

    $orders = App\Order::search('Star Trek')
        ->within('tv_shows_popularity_desc')
        ->get();

<a name="where-clauses"></a>
## Cláusulas Where

Scout permite que agregues cláusulas "where" sencillas a tus consultas de búsqueda. Actualmente, estas cláusulas solamente soportan verificaciones básicas de igualdad numérica y son útiles principalmente para establecer el alcance de las consultas de búsqueda por un ID. Ya que un índice de búsqueda no es una base de datos relacional, cláusulas "where" más avanzadas no están soportadas actualmente:

    $orders = App\Order::search('Star Trek')->where('user_id', 1)->get();

<a name="pagination"></a>
### Paginación

Además de obtener una colección de modelos, puedes paginar los resultados de tu búsqueda usando el método `paginate`. Este método devolverá una instancia `Paginator` justo como si hubieras [paginada una consulta Eloquent tradicional](/docs/{{version}}/pagination):

    $orders = App\Order::search('Star Trek')->paginate();

Puedes especificar cuántos modelos obtener por página al pasar la cantidad como primer argumento del método `paginate`:

    $orders = App\Order::search('Star Trek')->paginate(15);

Una vez que has obtenido los resultados, puedes mostrar los resultados y renderizar los enlaces de página usando [Blade](/docs/{{version}}/blade) justo como si hubieras paginado una consulta Eloquent tradicional:

    <div class="container">
        @foreach ($orders as $order)
            {{ $order->price }}
        @endforeach
    </div>

    {{ $orders->links() }}

<a name="custom-engines"></a>
## Motores Personalizados

#### Escribiendo el Motor

Si ninguno de los motores integrados de búsqueda de Scout no se ajustan a tus necesidades, puedes escribir tu propio motor personalizado y registrarlo con Scout. Tu motor debería extender la clase abstracta `Laravel\Scout\Engines\Engine`. Esta clase abstracta contiene siete métodos que tu motor personalizado de búsqueda debe implementar:

    use Laravel\Scout\Builder;

    abstract public function update($models);
    abstract public function delete($models);
    abstract public function search(Builder $builder);
    abstract public function paginate(Builder $builder, $perPage, $page);
    abstract public function mapIds($results);
    abstract public function map($results, $model);
    abstract public function getTotalCount($results);

Puedes encontrar útil revisar las implementaciones de estos métodos en la clase `Laravel\Scout\Engines\AlgoliaEngine`. Esta clase te proporcionará un buen punto de inicio para aprender como implementar cada uno de estos métodos en tu propio motor.

#### Registrando el Motor

Una vez que hayas escrito tu motor personalizado, puedes registrarlo con Scout usando el método `extend` del administrador de motor de Scout. Deberías ejecutar el método `extend` desde el método `boot` de tu `AppServiceProvider` o cualquier otro proveedor de servicio usado por tu aplicación. Por ejemplo, si has escrito un `MySqlSearchEngine`, puedes registrarlo como sigue:

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

Una vez que tu motor ha sido registrado, puedes especificarlo como tu `driver` predeterminado de Scout en tu archivo de configuración `config/scout.php`:

    'driver' => 'mysql',
