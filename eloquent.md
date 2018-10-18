# Eloquent: Primeros Pasos

- [Introducción](#introduction)
- [Definiendo Modelos](#defining-models)
    - [Convenciones del Modelo Eloquent](#eloquent-model-conventions)
- [Obteniendo Modelos](#retrieving-models)
    - [Colecciones](#collections)
    - [Separando Resultados](#chunking-results)
- [Obteniendo Modelos Individuales / Agrupamientos](#retrieving-single-models)
    - [Obteniendo Agrupamientos](#retrieving-aggregates)
- [Insertando & Actualizando Modelos](#inserting-and-updating-models)
    - [Inserciones](#inserts)
    - [Actualizaciones](#updates)
    - [Asignación en Masa](#mass-assignment)
    - [Otros Métodos de Creación](#other-creation-methods)
- [Eliminando Modelos](#deleting-models)
    - [Eliminación Lógica](#soft-deleting)
    - [Consultando Modelos Eliminados Lógicamente](#querying-soft-deleted-models)
- [Alcances de Consulta](#query-scopes)
    - [Alcances Globales](#global-scopes)
    - [Alcances Locales](#local-scopes)
- [Eventos](#events)
    - [Observadores](#observers)

<a name="introduction"></a>
## Introducción

El ORM Eloquent incluido con Laravel proporciona una genial y simple implentación básica de ActiveRecord para trabajar con tu base de datos. Cada tabla de base de datos tiene un correspondiente "Modelo" el cual es usado para interactuar con la tabla. Los modelos permiten que consultes los datos en tus tablas, así como también insertar nuevos registros dentro de la tabla.

Antes de empezar, asegúrate de configurar una conexión de base de datos en `config/database.php`. Para mayor información sobre la configuración de tu base de datos, revisa [la documentación](/docs/{{version}}/database#configuration).

<a name="defining-models"></a>
## Definiendo Modelos

Para empezar, vamos a crear un modelo de Eloquent. Los modelos residen típicamente en el directorio `app`, pero eres libre de colocarlos en cualquier parte que pueda ser auto-cargada de acuerdo a tu archivo `composer.json`. Todos los modelos de Eloquent extienden la clase `Illuminate\Database\Eloquent\Model`.

La forma más fácil de crear una instancia del modelo es usando el [Comando Artisan](/docs/{{version}}/artisan) `make:model`: 

    php artisan make:model User

Si prefieres generar una [migración de base de datos](/docs/{{version}}/migrations) cuando generes el modelo, puedes usar la opción `--migration` o `-m`:

    php artisan make:model User --migration

    php artisan make:model User -m

<a name="eloquent-model-conventions"></a>
### Convenciones del Modelo Eloquent

Ahora, vamos a mirar un modelo `Flight` de ejemplo, el cual usaremos para obtener y guardar información desde nuestra tabla de base de datos `flights`:

    <?php

    namespace App;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        //
    }

#### Nombres de Tabla

Nota que no le dijimos a Eloquent cual tabla usar para nuestro modelo `Flight`. Por convención, el nombre plural "snake_case" de la clase será usado como el nombre de tabla a menos que otro nombre sea especificado expresamente. Así, en este caso, Eloquent asumirá que el modelo `Flight` guarde los registros en la tabla `flights`. Puedes especificar una tabla personalizada al definir una propiedad `table` en tu modelo:
    
    <?php

    namespace App;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        /**
         * The table associated with the model.
         *
         * @var string
         */
        protected $table = 'my_flights';
    }

#### Claves Primarias

Eloquent asumirá que cada tabla tiene una columna de clave primaria denominada `id`. Puedes definir una propiedad `$primaryKey` protegida para sobrescribir esta convención.

En adición, Eloquent asume que la clave primaria es un valor entero con autoincremento, lo que significa que de forma predeterminada la clave primaria será convertida a un tipo `int` automáticamente. Si deseas usar una clave primaria que no sea de autoincremeneto o numérica debes establecer la propiedad pública `$incrementing` de tu modelo a `false`. Si tu clave primaria no es un entero, deberías establecer la propiedad protegida `$keyType` de tu modelo a `string`.

#### Timestamps

De forma predeterminada, Eloquent espera que las columnas `created_at` y `updated_at` existan en tus tablas. Si no deseas tener estas columnas manejadas automáticamente por Eloquent, establece la propiedad `$timestamps` de tu modelo a `false`:

    <?php

    namespace App;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        /**
         * Indicates if the model should be timestamped.
         *
         * @var bool
         */
        public $timestamps = false;
    }

Si necesitas personalizar el formato de tus marcas de tiempo, establece la propiedad `$dateFormat` de tu modelo. Esta propiedad determina como los atributos de fecha son guardados en la base de datos, también como su formato cuando el modelo es serializado a un arreglo o JSON:

    <?php

    namespace App;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        /**
         * The storage format of the model's date columns.
         *
         * @var string
         */
        protected $dateFormat = 'U';
    }

Si necesitas personalizar los nombres de las columnas usadas para guardar las marcas de tiempo, puedes establecer las constantes `CREATED_AT` y `UPDATED_AT`en tu modelo:

    <?php

    class Flight extends Model
    {
        const CREATED_AT = 'creation_date';
        const UPDATED_AT = 'last_update';
    }

#### Conexión de Base de Datos

De forma predeterminada, todos los modelos Eloquent usarán la conexión de base de datos configurada por tu aplicación. Si prefieres especificar una conexión diferente para el modelo, usa la propiedad `$connection`:

    <?php

    namespace App;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        /**
         * The connection name for the model.
         *
         * @var string
         */
        protected $connection = 'connection-name';
    }

<a name="retrieving-models"></a>
## Obteniendo Modelos

Una vez que has creado un modelo y [su tabla de base de datos asociada](/docs/{{version}}/migrations#writing-migrations), estás listo para empezar a obtener datos de tu base de datos. Piensa en cada modelo de Eloquent como un [constructor de consultas](/docs/{{version}}/queries) muy poderoso que te permite consultar fluidamente la tabla de base de datos asociada con el modelo. Por ejemplo:

    <?php

    use App\Flight;

    $flights = App\Flight::all();

    foreach ($flights as $flight) {
        echo $flight->name;
    }

#### Añadiendo Restricciones Adicionales

El método `all` de Eloquent devolverá todos los resultados en la tabla del modelo. Ya que cada modelo de Eloquent sirve como un [constructor de consultas](/docs/{{version}}/queries), también puedes añadir restricciones a las consultas, y entonces usar el método `get` para obtener los resultados:

    $flights = App\Flight::where('active', 1)
                   ->orderBy('name', 'desc')
                   ->take(10)
                   ->get();

> {tip} Ya que los modelos de Eloquent son constructores de consultas, deberías revisar todos los métodos disponibles en el [constructor de consultas](/docs/{{version}}/queries). Puedes usar cualquiera de estos métodos en tus consultas de Eloquent.

<a name="collections"></a>
### Colecciones

Para métodos de Eloquent como `all` y `get` los cuales obtienen varios resultados, una instancia de `Illuminate\Database\Eloquent\Collection` será devuelta. La clase `Collection` proporciona [una variedad de métodos útiles](/docs/{{version}}/eloquent-collections#available-methods) para trabajar con los resultados de Eloquent:

    $flights = $flights->reject(function ($flight) {
        return $flight->cancelled;
    });

Ciertamente, también puedes hacer un ciclo repetitivo sobre la colección como si fuera un arreglo:

    foreach ($flights as $flight) {
        echo $flight->name;
    }

<a name="chunking-results"></a>
### Separando Resultados

Si necesitas procesar miles de registros de Eloquent, usa el comando `chunk`. El método `chunk` obtendrá una "porción" de los modelos de Eloquent, incorporándolos a una `Closure` dada para procesamiento. Usando el método `chunk` ahorrarás memoria al momento de trabajar con grandes conjuntos de resultados:

    Flight::chunk(200, function ($flights) {
        foreach ($flights as $flight) {
            //
        }
    });

El primer argumento pasado al método es el número de registros que deseas obtener por cada "porción". La Closure pasada como segundo argumento será ejecutada para cada porción que sea obtenida de la base de datos. Una consulta de base de datos será ejecutada para obtener cada porción de registros pasados a la Closure.

#### Usando Cursores

El método `cursor` permite que iteres a través de registros de tu base de datos usando un cursor, el cual ejecutará solamente una consulta  única. Al momento de procesar grandes cantidades de datos, el método `cursor` puede ser usado para reducir en gran capacidad tu uso de memoria.

    foreach (Flight::where('foo', 'bar')->cursor() as $flight) {
        //
    }

<a name="retrieving-single-models"></a>
## Obteniendo Modelos Individuales / Agrupamientos

Ciertamente, además de obtener todos los registros de una tabla dada, también puedes obtener registros individuales usando `find` o `first`. En lugar de devolver una colección de modelos, estos métodos devuelven una única instancia de modelo:

    // Retrieve a model by its primary key...
    $flight = App\Flight::find(1);

    // Retrieve the first model matching the query constraints...
    $flight = App\Flight::where('active', 1)->first();

También puedes ejecutar el método `find` con un arreglo de claves primarias, el cual devolverá una colección de los registros que coincidan:

    $flights = App\Flight::find([1, 2, 3]);

#### Excepciones de No Encontrado

Algunas veces, puedes desear arrojar una excepción si un modelo no es encontrado. Es particularmente útil en rutas o controladores. Los métodos `findOrFail` y `firstOrFail` obtendrán el primer resultado de la consulta; sin embargo, si nada es encontrado, una excepción de `Illuminate\Database\Eloquent\ModelNotFoundException` será arrojada:

    $model = App\Flight::findOrFail(1);

    $model = App\Flight::where('legs', '>', 100)->firstOrFail();

Si la excepción no es atrapada, una respuesta HTTP `404` es enviada automáticamente de regreso al usuario. No es necesario escribir verificaciones explícitas para devolver respuestas `404` cuando uses estos métodos:

    Route::get('/api/flights/{id}', function ($id) {
        return App\Flight::findOrFail($id);
    });

<a name="retrieving-aggregates"></a>
### Obteniendo Agrupamientos

También puedes usar los métodos `count`, `sum`, `max` y otros [métodos de agrupamiento](/docs/{{version}}/queries#aggregates) proporcionados por el [constructor de consulta](/docs/{{version}}/queries). Estos métodos devuelven el valor escalar apropiado en lugar de una completa instancia de modelo:

    $count = App\Flight::where('active', 1)->count();

    $max = App\Flight::where('active', 1)->max('price');

<a name="inserting-and-updating-models"></a>
## Insertando & Actualizando Modelos

<a name="inserts"></a>
### Inserciones

Para agregar un nuevo registro en la base de datos crea una nueva instancia de modelo, establece los atributos del modelo y después ejecuta el método save:

    <?php

    namespace App\Http\Controllers;

    use App\Flight;
    use Illuminate\Http\Request;
    use App\Http\Controllers\Controller;

    class FlightController extends Controller
    {
        /**
         * Create a new flight instance.
         *
         * @param  Request  $request
         * @return Response
         */
        public function store(Request $request)
        {
            // Validate the request...

            $flight = new Flight;

            $flight->name = $request->name;

            $flight->save();
        }
    }

En este ejemplo, asignamos el parámetro `name` de la solicitud entrante al atributo `name` de la instancia del modelo `App\Flight`. Cuando ejecutamos el método `save`, un registro será insertado en la base de datos. Las marcas de tiempo `created_at` y `updated_at` serán automáticamente establecidas cuando el método `save` sea ejecutado, no hay necesidad de establecerlos manualmente.

<a name="updates"></a>
### Actualizaciones

El método `save` también puede ser usado para actualizar modelos que ya existen en la base de datos. Para actualizar un modelo, debes obtenerlo, establecer cualquiera de los atributos que desees actualizar y después ejecutar el método `save`. Otra vez, la marca de tiempo `updated_at` será actualizada automáticamente, no hay necesidad de establecer su valor manualmente.

    $flight = App\Flight::find(1);

    $flight->name = 'New Flight Name';

    $flight->save();

#### Actualizaciones en Masa

Las actualizaciones también pueden ser ejecutadas contra cualquier número de modelos que coincidan con un criterio de consulta dada. En este ejemplo, todos los vuelos que están activos o con `active` igual a 1 y tienen un atributo `destination` igual a `San Diego` serán marcados como retrasados:

    App\Flight::where('active', 1)
              ->where('destination', 'San Diego')
              ->update(['delayed' => 1]);

El método `update` espera un arreglo de pares de columna y valor representando las columnas que deberían ser actualizadas.

> {note} Al momento de utilizar una actualización en masa por medio de Eloquent, los eventos de modelo `saved` y `updated` no serán disparados para los modelos actualizados. Esto es debido a que los modelos nunca son obtenidos en realidad al momento de usar un update masivo.

<a name="mass-assignment"></a>
### Asignación  en Masa

También puedes usar el método `create` para guardar un nuevo modelo en una sola línea. La instancia de modelo insertada te será devuelta por el método. Sin embargo, antes de hacer eso, necesitarás especificar o un atributo `fillable` o `guarded` del modelo, de modo que todos los modelos de Eloquent se protejan contra la asignación masiva de forma predeterminada.

Existe una vulnerabilidad en la asignación-en-masa cuando un usuario pasa un parámetro HTTP inesperado a través de una solicitud y ese parámetro cambia una columna en tu base de datos que no esperaste. Por ejemplo, un usuario malicioso podría enviar un parámetro `is_admin` a través de una solicitud HTTP, la cual es entonces pasada en el método `create` de tu modelo, permitiendo que el usuario se promueva a si mismo como un usuario administrador.

Así que, para empezar, deberías definir cuáles atributos del modelo te gustaría hacer asignables de forma masiva. Podrías hacer esto usando la propiedad `$fillable` del modelo. Por ejemplo, vamos a hacer el atributo `name` de nuestro modelo `Flight` asignable en masa.

    <?php

    namespace App;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        /**
         * The attributes that are mass assignable.
         *
         * @var array
         */
        protected $fillable = ['name'];
    }

Una vez que hemos indicado los atributos asignables en masa, podemos usar el método `create` para insertar un nuevo registro en la base de datos. El método `create` devuelve la instancia de modelo guardada:

    $flight = App\Flight::create(['name' => 'Flight 10']);

Si ya tienes una instancia del modelo, puedes usar el método `fill` para llenarla con un arreglo de atributos: 

    $flight->fill(['name' => 'Flight 22']);

#### Guards de Atributos

Cuando `$fillable` sirve como una "lista blanca" de atributos que deberían ser asignables en masa, también podrías elegir usar `$guarded`. La propiedad `$guarded` debería contener un arreglo de atributos que no querrías que fueran asignables en masa. El resto de atributos que no estén en el arreglo serán asignables en masa. `$guarded` funciona como una "lista negra". Ciertamente, deberías usar o `$fillable` o `$guarded` - pero no ambos. En el ejemplo siguiente, todos los atributos **excepto `price`** serán asignables en masa:

    <?php

    namespace App;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        /**
         * The attributes that aren't mass assignable.
         *
         * @var array
         */
        protected $guarded = ['price'];
    }

Si prefieres hacer todos los atributos asignables en masa, puedes definir la propiedad `$guarded` como un arreglo vacío:

    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = [];

<a name="other-creation-methods"></a>
### Otros Métodos de Creación

#### `firstOrCreate`/ `firstOrNew`

Hay otros dos métodos que puedes usar para crear modelos con atributos de asignación en masa: `firstOrCreate` y `firstOrNew`. El método `firstOrCreate` intentará localizar un registro de base de datos usando los pares columna / valor dados. Si el modelo no puede ser encontrado en la base de datos, un registro será insertado con los atributos del primer parámetro, junto con aquellos del segundo parámetro opcional.

El método `firstOrNew`, al igual que `firstOrCreate`, intentará localizar un registro en la base de datos que coincida con los atributos dados. Sin embargo, si un modelo no es encontrado, una nueva instancia de modelo será devuelta. Nota que el modelo devuelto por `firstOrNew` todavía no ha sido enviado a la base de datos. Necesitarás ejecutar `save` manualmente para hacerlo persistente:

    // Retrieve flight by name, or create it if it doesn't exist...
    $flight = App\Flight::firstOrCreate(['name' => 'Flight 10']);

    // Retrieve flight by name, or create it with the name and delayed attributes...
    $flight = App\Flight::firstOrCreate(
        ['name' => 'Flight 10'], ['delayed' => 1]
    );

    // Retrieve by name, or instantiate...
    $flight = App\Flight::firstOrNew(['name' => 'Flight 10']);

    // Retrieve by name, or instantiate with the name and delayed attributes...
    $flight = App\Flight::firstOrNew(
        ['name' => 'Flight 10'], ['delayed' => 1]
    );

#### `updateOrCreate`

También puedes atravesar por situaciones donde quieras actualizar un modelo existente o crear un nuevo modelo si no existe. Laravel proporciona un  método `updateOrCreate` para hacer esto en un paso. Al igual que el método `firstOrCreate`, `updateOrCreate` persiste el modelo, para que no haya necesidad de ejecutar `save()`:

    // If there's a flight from Oakland to San Diego, set the price to $99.
    // If no matching model exists, create one.
    $flight = App\Flight::updateOrCreate(
        ['departure' => 'Oakland', 'destination' => 'San Diego'],
        ['price' => 99]
    );

<a name="deleting-models"></a>
## Eliminando Modelos

Para eliminar un modelo, ejecuta el método `delete` en una instancia del modelo:

    $flight = App\Flight::find(1);

    $flight->delete();

#### Eliminando un Modelo Existente con Búsqueda por Clave

En el ejemplo de arriba, estamos obteniendo el modelo de la base de datos antes de ejecutar el método `delete`. Sin embargo, si conoces la clave primaria del modelo, puedes eliminar el modelo sin obtenerlo primero. Para hacer eso, ejecuta el método `destroy`:

    App\Flight::destroy(1);

    App\Flight::destroy([1, 2, 3]);

    App\Flight::destroy(1, 2, 3);

#### Eliminando Modelos Por Consultas

Ciertamente, también puedes manejar una instrucción para eliminar sobre un conjunto de modelos. En este ejemplo, eliminaremos todos los vuelos que están marcados como inactivos. Al igual que las actualizaciones en masa, las eliminaciones en masa no dispararán cualquiera de los eventos de modelo para los modelos que son eliminados:

    $deletedRows = App\Flight::where('active', 0)->delete();

> {note} Al momento de ejecutar una instrucción de eliminación en masa por medio de Eloquent, los eventos de modelo `deleting` and `deleted` no serán ejecutados para los modelos eliminados. Esto es debido a que los modelos nunca son obtenidos realmente al momento de ejecutar la instrucción delete.

<a name="soft-deleting"></a>
### Eliminación Lógica

Además de remover realmente los registros de tu base de datos, Eloquent también puede "eliminar lógicamente" los modelos. Cuando los modelos son borrados lógicamente, no son removidos realmente de tu base de datos. En lugar de eso, un atributo `deleted_at` es establecido en el modelo e insertado en la base de datos. Si un modelo tiene un valor `deleted_at` no nulo, el modelo ha sido eliminado lógicamente. Para habilitar eliminaciones lógicas en un modelo, usa la característica `Illuminate\Database\Eloquent\SoftDeletes` en el modelo y añade la columna `deleted_at` a tu propiedad `$dates`:

    <?php

    namespace App;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\SoftDeletes;

    class Flight extends Model
    {
        use SoftDeletes;

        /**
         * The attributes that should be mutated to dates.
         *
         * @var array
         */
        protected $dates = ['deleted_at'];
    }

Ciertamente, deberías añadir la columna `deleted_at` a tu tabla de base de datos. El [constructor de esquemas](/docs/{{version}}/migrations) de Laravel contiene un método helper para crear esta columna:

    Schema::table('flights', function ($table) {
        $table->softDeletes();
    });

Ahora, cuando ejecutes el método `delete` en el modelo, la columna `deleted_at` será establecida con la fecha y hora actual. Y, al momento de consultar un modelo que use eliminaciones lógicas, los modelos eliminados lógicamente serán excluidos automáticamente de todos los resultados de consultas.

Para determinar si una instancia de modelo ha sido eliminada lógicamente, usa el método `trashed`:

    if ($flight->trashed()) {
        //
    }

<a name="querying-soft-deleted-models"></a>
### Consultando Modelos Eliminados Lógicamente

#### Incluyendo Modelos Eliminados Lógicamente

Como se apreció anteriormente, los modelos eliminados lógicamente serán excluidos automáticamente de los resultados de las consultas. Sin embargo, puedes forzar que los modelos eliminados lógicamente aparezcan en un conjunto resultante usando el método `withTrashed` en la consulta:

    $flights = App\Flight::withTrashed()
                    ->where('account_id', 1)
                    ->get();

El método `withTrashed` también puede ser usado en una consulta de [relación de eloquent](/docs/{{version}}/eloquent-relationships):

    $flight->history()->withTrashed()->get();

#### Obteniedo Modelos Individuales Eliminados Lógicamente

El método `onlyTrashed` obtendrá **solamente** modelos eliminados lógicamente:

    $flights = App\Flight::onlyTrashed()
                    ->where('airline_id', 1)
                    ->get();

#### Restaurando Modelos Eliminados Lógicamente

Algunas veces puedes desear "deshacer la eliminación" de un modelo eliminado lógicamente. Para restaurar un modelo eliminado lógicamente en un estado activo, usa el método `restore` en una instancia de modelo:

    $flight->restore();

También puedes usar el método `restore` en una consulta para restaurar rápidamente varios modelos. Otra vez, al igual que otras operaciones "en masa", esto no disparará cualquiera de los eventos de modelo para los modelos que sean restaurados:

    App\Flight::withTrashed()
            ->where('airline_id', 1)
            ->restore();

Al igual que con el método `withTrashed`, el método `restore` también puede ser usado en [relaciones de eloquent](/docs/{{version}}/eloquent-relationships):

    $flight->history()->restore();

#### Eliminando Modelos Permanentemente

Algunas veces puedes necesitar remover verdaderamente un modelo de tu base de datos. Para remover permanentemente un modelo eliminado lógicamente de la base de datos, usa el método `forceDelete`:

    // Force deleting a single model instance...
    $flight->forceDelete();

    // Force deleting all related models...
    $flight->history()->forceDelete();

<a name="query-scopes"></a>
## Alcances de Consultas

<a name="global-scopes"></a>
### Alcances Globales

Los alcances globales permiten que añadas restricciones a todas las consultas para un modelo dado. La propia funcionalidad de la [eliminación lógica](#soft-deleting) de Laravel utiliza alcances globales para extraer solamente los modelos "no-eliminados" de la base de datos. Escribiendo tus propios alcances globales puede proporcionarte una forma conveniente y fácil de asegurar que cada consulta para un modelo dado reciba ciertas restricciones.

#### Escribiendo Alcances Globales

Escribir un alcance global es simple. Define una clase que implemente la interfaz `Illuminate\Database\Eloquent\Scope`. Esta interfaz requiere que implementes un método: `apply`. El método `apply` puede añadir restricciones `where` a la consulta como sea necesario:

    <?php

    namespace App\Scopes;

    use Illuminate\Database\Eloquent\Scope;
    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Builder;

    class AgeScope implements Scope
    {
        /**
         * Apply the scope to a given Eloquent query builder.
         *
         * @param  \Illuminate\Database\Eloquent\Builder  $builder
         * @param  \Illuminate\Database\Eloquent\Model  $model
         * @return void
         */
        public function apply(Builder $builder, Model $model)
        {
            $builder->where('age', '>', 200);
        }
    }

> {tip} Si tu alcance global está agregando columnas a la cláusula select de la consulta, deberías usar el método `addSelect` en lugar de `select`. Esto evitará el reemplazo no intencional de la cláusula select existente de la consulta.

#### Aplicando Alcances Globales

Para asignar un alcance global a un modelo, deberías sobrescribir un método `boot` del modelo dado y usar el método `addGlobalScope`:

    <?php

    namespace App;

    use App\Scopes\AgeScope;
    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * The "booting" method of the model.
         *
         * @return void
         */
        protected static function boot()
        {
            parent::boot();

            static::addGlobalScope(new AgeScope);
        }
    }

Después de agregar el alcance, una consulta a `User::all()` producirá el siguiente código SQL:

    select * from `users` where `age` > 200

#### Alcances Globales Anónimos

Eloquent también permite que definas alcances globales usando Closures, lo cual es particularmente útil para alcances básicos que garantiza una clase separada:

    <?php

    namespace App;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Builder;

    class User extends Model
    {
        /**
         * The "booting" method of the model.
         *
         * @return void
         */
        protected static function boot()
        {
            parent::boot();

            static::addGlobalScope('age', function (Builder $builder) {
                $builder->where('age', '>', 200);
            });
        }
    }

#### Removiendo Alcances Globales

Si prefieres remover un alcance global para una consulta dada, puedes usar el método `withoutGlobalScope`. El método acepta el nombre de clase del alcance global como su único argumento:

    User::withoutGlobalScope(AgeScope::class)->get();

Si prefieres remover varios o incluso todos los alcances globales, puedes usar el método `withoutGlobalScopes`:

    // Remove all of the global scopes...
    User::withoutGlobalScopes()->get();

    // Remove some of the global scopes...
    User::withoutGlobalScopes([
        FirstScope::class, SecondScope::class
    ])->get();

<a name="local-scopes"></a>
### Alcances Locales

Los alcances locales permiten que definas conjuntos de restricciones comunes que puedes reusar fácilmente a traves de tu aplicación. Por ejemplo, puedes necesitar obtener frecuentemente todos los usuarios que son considerados "populares". Para definir un alcance, prefija un método de modelo de Eloquent con `scope`.

Los alcances deberían devolver siempre una instacia del constructor de consultas:

    <?php

    namespace App;

    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * Scope a query to only include popular users.
         *
         * @param \Illuminate\Database\Eloquent\Builder $query
         * @return \Illuminate\Database\Eloquent\Builder
         */
        public function scopePopular($query)
        {
            return $query->where('votes', '>', 100);
        }

        /**
         * Scope a query to only include active users.
         *
         * @param \Illuminate\Database\Eloquent\Builder $query
         * @return \Illuminate\Database\Eloquent\Builder
         */
        public function scopeActive($query)
        {
            return $query->where('active', 1);
        }
    }

#### Utilizando un Alcance Local

Una vez que el alcance ha sido definido, puedes ejecutar los métodos de alcance al momento de consultar el modelo. Sin embargo, no deberías incluir el prefijo `scope` cuando ejecutas el método. Incluso puedes encadenar las ejecuciones a varios alcances, por ejemplo:

    $users = App\User::popular()->active()->orderBy('created_at')->get();

#### Alcances Dinámicos

Algunas veces, puedes desear definir un alcance que acepte parámetros. Para empezar, sólo agrega tus parámetros adicionales a tu alcance. Los parámetros de alcance deberían ser definidos después del parámetro `$query`:

    <?php

    namespace App;

    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * Scope a query to only include users of a given type.
         *
         * @param \Illuminate\Database\Eloquent\Builder $query
         * @param mixed $type
         * @return \Illuminate\Database\Eloquent\Builder
         */
        public function scopeOfType($query, $type)
        {
            return $query->where('type', $type);
        }
    }

Ahora, puedes pasar los parámetros al momento de ejecutar el alcance:

    $users = App\User::ofType('admin')->get();

<a name="events"></a>
## Eventos

Los modelos de Eloquent ejecutan varios eventos, permitiendo que cuelgues los puntos siguientes en un ciclo de vida del modelo: `retrieved`, `creating`, `created`, `updating`, `updated`, `saving`, `saved`, `deleting`, `deleted`, `restoring` y `restored`. Los eventos permiten que ejecutes fácilmente código cada vez que una clase de modelo específica es guardada o actualizada en la base de datos.

El evento `retrieved` se disparará cuando un modelo existente es obtenido de la base de datos. Cuando un nuevo modelo es guardado la primera vez, los eventos `creating` y `created` se disparan. Si un modelo ya existe en la base de datos y el método `save` es ejecutado, los eventos `updating` / `updated` se dispararán. Sin embargo, en ambos casos, los eventos `saving` / `saved` se dispararán.

Para empezar, define una propiedad `$dispatchesEvents` en tu modelo Eloquent que mapee varios puntos del ciclo de vida de modelo de Eloquent a tus propias [clases de eventos](/docs/{{version}}/events):

    <?php

    namespace App;

    use App\Events\UserSaved;
    use App\Events\UserDeleted;
    use Illuminate\Notifications\Notifiable;
    use Illuminate\Foundation\Auth\User as Authenticatable;

    class User extends Authenticatable
    {
        use Notifiable;

        /**
         * The event map for the model.
         *
         * @var array
         */
        protected $dispatchesEvents = [
            'saved' => UserSaved::class,
            'deleted' => UserDeleted::class,
        ];
    }

<a name="observers"></a>
### Observadores

Si estas escuchando muchos eventos en un modelo dado, puedes usar observadores para agrupar todos tus listeners dentro de una sola clase. Las clases observadoras tienen nombres de métodos los cuales reflejan los eventos de Eloquent que desees escuchar. Cada uno de estos métodos reciben el modelo como su único argumento. Laravel no incluye un directorio predeterminado para observadores, puedes crear cualquier directorio que gustes para que sea el hogar de tus clases observadoras:

    <?php

    namespace App\Observers;

    use App\User;

    class UserObserver
    {
        /**
         * Listen to the User created event.
         *
         * @param  \App\User  $user
         * @return void
         */
        public function created(User $user)
        {
            //
        }

        /**
         * Listen to the User deleting event.
         *
         * @param  \App\User  $user
         * @return void
         */
        public function deleting(User $user)
        {
            //
        }
    }

Para registrar un observador, usa el método `observe` en el modelo que desees observar. Puedes registrar los observadores en el método `boot` de uno de tus proveedores de servicio. En este ejemplo, registraremos el observador en el `AppServiceProvider`:

    <?php

    namespace App\Providers;

    use App\User;
    use App\Observers\UserObserver;
    use Illuminate\Support\ServiceProvider;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Bootstrap any application services.
         *
         * @return void
         */
        public function boot()
        {
            User::observe(UserObserver::class);
        }

        /**
         * Register the service provider.
         *
         * @return void
         */
        public function register()
        {
            //
        }
    }
