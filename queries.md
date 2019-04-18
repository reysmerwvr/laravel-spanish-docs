::: v-pre

# Base de datos: Constructor de Consultas (Query Builder)

- [Introducción](#introduction)
- [Obteniendo los Resultados](#retrieving-results)
    - [Particionando Los Resultados](#chunking-results)
    - [Agrupamientos](#aggregates)
- [Selects](#selects)
- [Expresiones Sin Procesar (Raw)](#raw-expressions)
- [Joins](#joins)
- [Uniones](#unions)
- [Cláusulas Where](#where-clauses)
    - [Agrupamiento de parámetros](#parameter-grouping)
    - [Cláusulas Exists Where](#where-exists-clauses)
    - [Cláusulas Where JSON](#json-where-clauses)
- [Ordenamiento, Agrupamiento, Límite, y Desplazamiento](#ordering-grouping-limit-and-offset)
- [Cláusulas Condicionales](#conditional-clauses)
- [Inserciones](#inserts)
- [Actualizaciones](#updates)
    - [Actualizando Columnas JSON](#updating-json-columns)
    - [Incremento Y Decremento](#increment-and-decrement)
- [Eliminaciones](#deletes)
- [Bloqueo Pesimista](#pessimistic-locking)

<a name="introduction"></a>
## Introducción

El constructor de consultas (query builder) de Base de datos de Laravel, proporciona una interface fluida y conveniente para la creación y ejecución de consultas de bases de datos. Puede ser usado para ejecutar las principales operaciones de bases de datos en tu aplicación y funciona en todos los sistemas de bases de datos soportados.

El constructor de consultas de Laravel usa enlazamiento de parámetros PDO para proteger tu aplicación contra ataques de inyección SQL. No hay necesidad de limpiar cadenas que están siendo pasadas como enlaces.

::: danger Nota
PDO no admite nombres de columna de enlace (binding). Por lo tanto, nunca debes permitir que la entrada de usuario dicte los nombres de columna a los que hacen referencia tus consultas, incluidas las columnas "ordenar por", etc. Si debes permitir que el usuario seleccione ciertas columnas para consultar, valida siempre los nombres de las columnas con un una lista blanca de columnas permitidas.
:::

<a name="retrieving-results"></a>
## Obteniendo Los Resultados

#### Obteniendo Todas Las Filas De Una Tabla

Puedes usar el método `table` de la clase facade `DB` para empezar una consulta. El método `table` devuelve una instancia para construir consultas fáciles de entender para la tabla dada, permitiendo que encadenes más restricciones dentro de la consulta y recibas finalmente los resultados usando el método `get`:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class UserController extends Controller
{
    /**
    * Show a list of all of the application's users.
    *
    * @return Response
    */
    public function index()
    {
        $users = DB::table('users')->get();

        return view('user.index', ['users' => $users]);
    }
}
```

El método `get` devuelve una colección de la clase `Illuminate\Support\Collection` que contiene los resultados donde cada resultado es una instancia del objeto `StdClass` de PHP. Puedes acceder al valor de cada columna accediendo a la columna como una propiedad del objeto:

```php
foreach ($users as $user) {
    echo $user->name;
}
```

#### Obteniendo Una Sola Fila / Columna De Una Tabla

Si solamente necesitas recuperar una sola fila de la tabla de la base de datos, puedes usar el método `first`. Este método devolverá un solo objeto `StdClass`:

```php
$user = DB::table('users')->where('name', 'John')->first();

echo $user->name;
```

Si no necesitas una fila completa, puedes extraer un solo valor de un registro usando el método `value`. Este método devolverá directamente el valor de la columna:

```php
$email = DB::table('users')->where('name', 'John')->value('email');
```

Para obtener una sola fila por su valor de columna `id`, use el método` find`:

```php
$user = DB::table('users')->find(3);
```

#### Obteniendo una Lista de Valores de Columna

Si prefieres obtener una Colección que contenga los valores de una sola columna, puedes usar el método `pluck`. En el siguiente ejemplo, obtendrémos una colección de títulos de rol:

```php
$titles = DB::table('roles')->pluck('title');

foreach ($titles as $title) {
    echo $title;
}
```

También puedes especificar una columna clave personalizada para la colección retornada:

```php
$roles = DB::table('roles')->pluck('title', 'name');

foreach ($roles as $name => $title) {
    echo $title;
}
```

<a name="chunking-results"></a>
### Particionando los Resultados

Si nececesitas trabajar con miles de registros de bases de datos, considera usar el método `chunk`. Este método obtiene una partición pequeña de los resultados cada vez y pone cada partición dentro de un `Closure` para su procesamiento. Este método es muy útil para escribir [comandos de Artisan](/docs/{{version}}/artisan) que procesan miles de registros. Por ejemplo, vamos a trabajar con la tabla completa `users` en particiones de 100 registros cada vez:

```php
DB::table('users')->orderBy('id')->chunk(100, function ($users) {
    foreach ($users as $user) {
        //
    }
});
```

Puedes parar de obtener particiones para que no sean procesadas al devolver `false` en el código `Closure`:

```php
DB::table('users')->orderBy('id')->chunk(100, function ($users) {
    // Process the records...

    return false;
});
```

Si estás actualizando registros de base de datos mientras particionas resultados, los resultados de particiones podrían cambiar en formas inesperadas. Entonces, cuando se actualicen los registros mientras se particiona, siempre es mejor usar el método `chunkById` en su lugar. Este método paginará automáticamente los resultados basándose en la llave primaria del registro:

```php
DB::table('users')->where('active', false)
    ->chunkById(100, function ($users) {
        foreach ($users as $user) {
            DB::table('users')
                ->where('id', $user->id)
                ->update(['active' => true]);
        }
    });
```

::: danger Nota
Al actualizar o eliminar registros dentro del callback de la partición, cualquier cambio en la clave primaria o claves foráneas podría afectar a la consulta de la partición. Esto podría potencialmente dar lugar a que los registros no se incluyan en los resultados particionados.
:::

<a name="aggregates"></a>
### Agrupamientos

El constructor de consultas también proporciona una variedad de métodos de agrupamiento tales como `count`, `max`, `min`, `avg` y `sum`. Puedes ejecutar cualquiera de estos métodos después de construir tu consulta:

```php
$users = DB::table('users')->count();

$price = DB::table('orders')->max('price');
```

Puedes combinar estos métodos con otras cláusulas:

```php
$price = DB::table('orders')
                ->where('finalized', 1)
                ->avg('price');
```

#### Determinando Si Existen Registros

EN vez de usar el método `count` para determinar si existen registros que coincidan con los límites de tu consulta, puedes usar los métodos `exists` y `doesntExist`:

```php
return DB::table('orders')->where('finalized', 1)->exists();

return DB::table('orders')->where('finalized', 1)->doesntExist();
```

<a name="selects"></a>
## Selects

#### Especificando una Cláusula Select

No siempre desearás seleccionar todas las columnas de una tabla de la base de datos. Usando el método `select`, puedes especificar una cláusula `select` personalizada para la consulta:

```php
$users = DB::table('users')->select('name', 'email as user_email')->get();
```

El método `distinct` te permite forzar la consulta para que devuelva solamente resultados que sean distintos:

```php
$users = DB::table('users')->distinct()->get();
```

Si ya tienes una instancia del constructor de consultas y deseas añadir una columna a su cláusula `select` existente, puedes usar el método `addSelect`:

```php
$query = DB::table('users')->select('name');

$users = $query->addSelect('age')->get();
```

<a name="raw-expressions"></a>
## Expresiones Sin Procesar (Raw)

Algunas veces puedes necesitar usar una expresión sin procesar en una consulta. Para crear una expresión sin procesar, puedes usar el método `DB::raw`:

```php
$users = DB::table('users')
                     ->select(DB::raw('count(*) as user_count, status'))
                     ->where('status', '<>', 1)
                     ->groupBy('status')
                     ->get();
```

::: danger Nota
Las instrucciones sin procesar serán inyectadas dentro de la consulta como cadenas, así que deberías ser extremadamente cuidadoso para no crear vulnerabilidades de inyección SQL.
:::

<a name="raw-methods"></a>
### Métodos Raw

En lugar de usar `DB::raw`, también puedes usar los siguientes métodos para insertar una expresión sin procesar dentro de varias partes de tu consulta.

#### `selectRaw`

El método `selectRaw` puede ser usado en lugar de `select(DB::raw(...))`. Este método acepta un arreglo opcional de enlaces como su segundo argumento:

```php
$orders = DB::table('orders')
                ->selectRaw('price * ? as price_with_tax', [1.0825])
                ->get();
```

#### `whereRaw / orWhereRaw`

Los métodos `whereRaw` y `orWhereRaw` pueden ser usados para inyectar una cláusula `where` sin procesar dentro de tu consulta. Estos métodos aceptan un arreglo opcional de enlaces como segundo argumento:

```php
$orders = DB::table('orders')
                ->whereRaw('price > IF(state = "TX", ?, 100)', [200])
                ->get();
```

#### `havingRaw / orHavingRaw`

Los métodos `havingRaw` y `orHavingRaw` pueden ser usados para establecer una cadena sin procesar como el valor de la cláusula `having`:

```php
$orders = DB::table('orders')
                ->select('department', DB::raw('SUM(price) as total_sales'))
                ->groupBy('department')
                ->havingRaw('SUM(price) > 2500')
                ->get();
```

#### `orderByRaw`

El método `orderByRaw` puede ser usado para establecer una cadena sin procesar como el valor de la cláusula `order by`:

```php
$orders = DB::table('orders')
                ->orderByRaw('updated_at - created_at DESC')
                ->get();
```

<a name="joins"></a>
## Joins

#### Cláusula Inner Join

El constructor de consultas también puede ser usado para escribir instrucciones joins. Para ejecutar un "inner join" básico, puedes usar el método `join` en una instancia del constructor de consultas. El primer argumento pasado al método `join` es el nombre de la tabla que necesitas juntar, mientras que los argumentos restantes especifican las restricciones de columna para el join. Ciertamente, como puedes ver, puedes hacer un join de múltiples tablas en una sola consulta:

```php
$users = DB::table('users')
            ->join('contacts', 'users.id', '=', 'contacts.user_id')
            ->join('orders', 'users.id', '=', 'orders.user_id')
            ->select('users.*', 'contacts.phone', 'orders.price')
            ->get();
```

#### Cláusula Left Join / Right Join

Si prefieres ejecutar un "left join" o un "right join" en vez de un "inner join", usa los métodos `leftJoin` o `rightJoin`. Estos métodos tienen la misma forma de uso de los argumentos que el método `join`:

```php
$users = DB::table('users')
            ->leftJoin('posts', 'users.id', '=', 'posts.user_id')
            ->get();

$users = DB::table('users')
            ->rightJoin('posts', 'users.id', '=', 'posts.user_id')
            ->get();
```

#### Cláusula Cross Join

Para ejecutar un cláusula "cross join" usa el método `crossJoin` con el nombre de la tabla a la que deseas hacerle un cross join. Los cross join generan un producto cartesiano entre la primera tabla y la tabla juntada:

```php
$users = DB::table('sizes')
            ->crossJoin('colours')
            ->get();
```

#### Cláusulas de Join Avanzadas

También puedes especificar cláusulas join más avanzadas. Para empezar, pasa una función `Closure` como el segundo argumento dentro del método `join`. La `Closure` recibirá un objeto `JoinClause` el cual permitirá que especifiques restricciones en la cláusula `join`:

```php
DB::table('users')
        ->join('contacts', function ($join) {
            $join->on('users.id', '=', 'contacts.user_id')->orOn(...);
        })
        ->get();
```

Si prefieres usar una cláusula estilo "where" en tus joins, puedes usar los métodos `where` y `orWhere` en un join. En lugar de comparar dos columnas, estos métodos compararán la columna contra un valor:

```php
DB::table('users')
        ->join('contacts', function ($join) {
            $join->on('users.id', '=', 'contacts.user_id')
                    ->where('contacts.user_id', '>', 5);
        })
        ->get();
```

#### Subconsultas Joins

Puedes utilizar los métodos `joinSub`, `leftJoinSub` y `rightJoinSub` para unir una consulta a una subconsulta. Cada uno de estos métodos recibe tres argumentos: la subconsulta, su alias de tabla y una Closure que define las columnas relacionadas:

```php
$latestPosts = DB::table('posts')
                    ->select('user_id', DB::raw('MAX(created_at) as last_post_created_at'))
                    ->where('is_published', true)
                    ->groupBy('user_id');

$users = DB::table('users')
        ->joinSub($latestPosts, 'latest_posts', function ($join) {
            $join->on('users.id', '=', 'latest_posts.user_id');
        })->get();
```

<a name="unions"></a>
## Uniones

El constructor de consultas también proporciona una forma rápida para "unir" dos consultas. Por ejemplo, puedes crear una consulta inicial y usar el método `union` para unirlo con una segunda consulta:

```php
$first = DB::table('users')
            ->whereNull('first_name');

$users = DB::table('users')
            ->whereNull('last_name')
            ->union($first)
            ->get();
```

::: tip
El método `unionAll` también está disponible y tiene la misma forma de uso que `union`.
:::

<a name="where-clauses"></a>
## Cláusulas Where

#### Cláusula Where Simple

Puedes usar el método `where` en una instancia del constructor de consultas para añadir cláusulas `where` a la consulta. La ejecución más básica de `where` requiere tres argumentos. El primer argumento es el nombre de la columna. El segundo argumento es un operador, el cual puede ser cualquiera de los operadores soportados por la base de datos. Finalmente, el tercer argumento es el valor a evaluar contra la columna.

Por ejemplo, aquí está una consulta que verifica que el valor de la columna "votes" sea igual a 100:

```php
$users = DB::table('users')->where('votes', '=', 100)->get();
```

Por conveniencia, si quieres verificar que una columna sea igual a un valor dado, puedes pasar directamente el valor como el segundo argumento del método `where`.

```php
$users = DB::table('users')->where('votes', 100)->get();
```

Puedes usar otros operadores cuando estés escribiendo una cláusula `where`:

```php
$users = DB::table('users')
                ->where('votes', '>=', 100)
                ->get();

$users = DB::table('users')
                ->where('votes', '<>', 100)
                ->get();

$users = DB::table('users')
                ->where('name', 'like', 'T%')
                ->get();
```

También puedes pasar un arreglo de condiciones a la función `where`:

```php
$users = DB::table('users')->where([
    ['status', '=', '1'],
    ['subscribed', '<>', '1'],
])->get();
```

#### Instrucciones Or

Puedes encadenar en conjunto las restricciones where así como añadir cláusulas `or` a la consulta. El método `orWhere` acepta los mismos argumentos que el método `where`:

```php
$users = DB::table('users')
                    ->where('votes', '>', 100)
                    ->orWhere('name', 'John')
                    ->get();
```

#### Cláusulas Where Adicionales

**whereBetween / orWhereBetween**

El método `whereBetween` verifica que un valor de columna esté en un intervalo de valores:

```php
$users = DB::table('users')
                    ->whereBetween('votes', [1, 100])->get();
```

**whereNotBetween / orWhereNotBetween**

El método `whereNotBetween` verifica que un valor de columna no esté en un intervalo de valores:

```php
$users = DB::table('users')
                    ->whereNotBetween('votes', [1, 100])
                    ->get();
```

**whereIn / whereNotIn / orWhereIn / orWhereNotIn**

El método `whereIn` verifica que un valor de una columna dada esté contenido dentro del arreglo dado:

```php
$users = DB::table('users')
                    ->whereIn('id', [1, 2, 3])
                    ->get();
```

El método `whereNotIn` verifica que el valor de una columna dada **no** esté contenido en el arreglo dado:

```php
$users = DB::table('users')
                    ->whereNotIn('id', [1, 2, 3])
                    ->get();
```

**whereNull / whereNotNull / orWhereNull / orWhereNotNull**

El método `whereNull` verifica que el valor de una columna dada sea `NULL`:

```php
$users = DB::table('users')
                    ->whereNull('updated_at')
                    ->get();
```

El método `whereNotNull` verifica que el valor dado de una columna no sea `NULL`:

```php
$users = DB::table('users')
                    ->whereNotNull('updated_at')
                    ->get();
```

**whereDate / whereMonth / whereDay / whereYear / whereTime**

El método `whereDate` puede ser usado para comparar el valor de una columna contra una fecha:

```php
$users = DB::table('users')
                ->whereDate('created_at', '2016-12-31')
                ->get();
```

El método `whereMonth` puede ser usado para comparar el valor de una columna contra un mes específico de un año:

```php
$users = DB::table('users')
                ->whereMonth('created_at', '12')
                ->get();
```

El método `whereDay` puede ser usado para comparar el valor de una columna contra un día especíco de un mes:

```php
$users = DB::table('users')
                ->whereDay('created_at', '31')
                ->get();
```

El método `whereYear` puede ser usado para comparar el valor de una columna contra un año específico:

```php
$users = DB::table('users')
                ->whereYear('created_at', '2016')
                ->get();
```

El método `whereTime` puede ser usado para comparar el valor de una columna contra una hora específica:

```php
$users = DB::table('users')
                ->whereTime('created_at', '=', '11:20')
                ->get();
```

**whereColumn / orWhereColumn**

El método `whereColumn` puede ser usado para verificar que dos columnas son iguales:

```php
$users = DB::table('users')
                ->whereColumn('first_name', 'last_name')
                ->get();
```

También puedes pasar un operador de comparación al método:

```php
$users = DB::table('users')
                ->whereColumn('updated_at', '>', 'created_at')
                ->get();
```

Al método `whereColumn` también le puede ser pasado un arreglo de condiciones múltiples. Estas condiciones serán juntadas usando el operador `and`:

```php
$users = DB::table('users')
                ->whereColumn([
                    ['first_name', '=', 'last_name'],
                    ['updated_at', '>', 'created_at']
                ])->get();
```

<a name="parameter-grouping"></a>
### Agrupando Parámetros

Algunas veces puedes necesitar crear cláusulas where más avanzadas como cláusulas "where exists" o grupos de parámetros anidados. El constructor de consultas de Laravel puede manejar éstos también. Para empezar, vamos a mirar un ejemplo de grupos de restricciones encerrado por llaves:

```php
DB::table('users')
            ->where('name', '=', 'John')
            ->where(function ($query) {
                $query->where('votes', '>', 100)
                        ->orWhere('title', '=', 'Admin');
            })
            ->get();
```

Como puedes ver, al pasar una `Closure` dentro del método `orWhere`, instruyes al constructor de consultas para empezar un grupo de restricción. La `Closure` recibirá una instancia del constructor de consultas la cual puedes usar para establecer las restricciones que deberían estar contenidas dentro del grupo encerrado por llaves. El ejemplo de arriba producirá la siguiente instrucción SQL:

```php
select * from users where name = 'John' and (votes > 100 or title = 'Admin')
```

::: tip
Siempre debes agrupar llamadas `orWhere` para evitar comportamiento inesperado cuando se apliquen alcances globales.
:::

<a name="where-exists-clauses"></a>
### Cláusulas Where Exists

El método `whereExists` permite que escribas cláusulas de SQL `whereExists`. El método `whereExists` acepta un argumento de tipo `Closure`, el cual recibirá una instancia del constructor de consultas permitiendo que definas la consulta que debería ser puesta dentro de la cláusula "exists":

```php
DB::table('users')
            ->whereExists(function ($query) {
                $query->select(DB::raw(1))
                        ->from('orders')
                        ->whereRaw('orders.user_id = users.id');
            })
            ->get();
```

La consulta anterior producirá el siguiente SQL:

```php
select * from users
where exists (
    select 1 from orders where orders.user_id = users.id
)
```

<a name="json-where-clauses"></a>
### Cláusulas Where JSON

Laravel también soporta consultar tipos de columna JSON en bases de datos que proporcionan soporte para tipos de columna JSON. Actualmente, esto incluye MySQL 5.7, PostgresSQL, SQL Server 2016, y SQLite 3.9.0 (con la [extensión JSON1](https://www.sqlite.org/json1.html)). Para consultar una columna JSON, usa el operador `->`:

```php
$users = DB::table('users')
                ->where('options->language', 'en')
                ->get();

$users = DB::table('users')
                ->where('preferences->dining->meal', 'salad')
                ->get();
```

Puedes usar `whereJsonContains` para consultar arreglos JSON (sin soporte en SQLite):

```php
$users = DB::table('users')
                ->whereJsonContains('options->languages', 'en')
                ->get();
```

MySQL and PostgreSQL proveen soporte para `whereJsonContains` con múltiples valores:

```php
$users = DB::table('users')
                ->whereJsonContains('options->languages', ['en', 'de'])
                ->get();
```

Puedes usar `whereJsonLength` para consultar arreglos JSON por su longitud:

```php
$users = DB::table('users')
                ->whereJsonLength('options->languages', 0)
                ->get();

$users = DB::table('users')
                ->whereJsonLength('options->languages', '>', 1)
                ->get();
```

<a name="ordering-grouping-limit-and-offset"></a>
## Ordenamiento, Agrupamiento, Límite, y Desplazamiento

#### orderBy

El método `orderBy` permite que ordenes los resultados de la consulta por una columna dada. El primer argumento para el método `orderBy` debería ser la columna por la cual deseas ordenar, mientra que el segundo argumento controla la dirección del ordenamiento y puede ser `asc` o `desc`:

```php
$users = DB::table('users')
                ->orderBy('name', 'desc')
                ->get();
```

#### latest / oldest

Los métodos `latest` y `oldest` te permiten ordenar fácilmente los resultados por fecha. Por defecto, el resultado será ordenado por la columna `created_at`. También, puedes pasar el nombre de la columna por la cual deseas ordenar:

```php
$user = DB::table('users')
                ->latest()
                ->first();
```

#### inRandomOrder

El método `inRandomOrder` puede ser usado para ordenar los resultados de la consulta aletoriamente. Por ejemplo, puedes usar este método para obtener un usuario aleatorio:

```php
$randomUser = DB::table('users')
                ->inRandomOrder()
                ->first();
```

#### groupBy / having

Los métodos `groupBy` y `having` pueden ser usados para agrupar los resultados de la consulta. La forma que distingue el uso del método `having` es similar a la que tiene el método `where`:

```php
$users = DB::table('users')
                ->groupBy('account_id')
                ->having('account_id', '>', 100)
                ->get();
```

Puedes pasar argumentos múltiples al método `groupBy` para agrupar por múltiples columnas:

```php
$users = DB::table('users')
                ->groupBy('first_name', 'status')
                ->having('account_id', '>', 100)
                ->get();
```

Para instrucciones `having` más avanzadas, echa un vistazo al método [`havingRaw`](#raw-methods).

#### skip / take

Para limitar el número de resultados devueltos desde la consulta, o para avanzar un número dado de resultados en la consulta, puedes usar los métodos `skip` y `take`:

```php
$users = DB::table('users')->skip(10)->take(5)->get();
```

Alternativamente, puedes usar los métodos `limit` y `offset`:

```php
$users = DB::table('users')
                ->offset(10)
                ->limit(5)
                ->get();
```

<a name="conditional-clauses"></a>
## Cláusulas Condicionales

Algunas podrías querer que las cláusulas apliquen solamente a una consulta cuando alguna cosa más se cumple. Por ejemplo, puedes querer que solamente se aplique una instrucción `where` si un valor de entrada dado está presente en la solicitud entrante. Puedes acompañar esto usando el método `when`:

```php
$role = $request->input('role');

$users = DB::table('users')
                ->when($role, function ($query) use ($role) {
                    return $query->where('role_id', $role);
                })
                ->get();
```

El método `when` ejecuta solamente la Closure dada cuando el primer parámetro es `true`. Si el primer parámetro es `false`, la Closure no será ejecutada.

Puedes pasar otra Closure como tercer parámetro del método `when`. Esta Closure se ejecutará si el primer parámetro se evalúa como `false`. Para ilustrar cómo esta característica puede ser usada, la usaremos para configurar el ordenamiento predeterminado de una consulta:

```php
$sortBy = null;

$users = DB::table('users')
                ->when($sortBy, function ($query) use ($sortBy) {
                    return $query->orderBy($sortBy);
                }, function ($query) {
                    return $query->orderBy('name');
                })
                ->get();
```

<a name="inserts"></a>
## Inserciones

El constructor de consultas también proporciona un método `insert` para insertar registros dentro de la base de datos. El método `insert` acepta un arreglo de nombres de columna y valores:

```php
DB::table('users')->insert(
    ['email' => 'john@example.com', 'votes' => 0]
);
```

Incluso puedes insertar varios registros dentro de la tabla con una sola llamada a `insert` pasando un arreglo de arreglos. Cada arreglo representa una fila a ser insertada dentro de la tabla:

```php
DB::table('users')->insert([
    ['email' => 'taylor@example.com', 'votes' => 0],
    ['email' => 'dayle@example.com', 'votes' => 0]
]);
```

#### IDs de Auto-Incremento

Si la tabla tiene un id de auto-incremento, usa el método `insertGetId` para insertar un registro y recibir el ID:

```php
$id = DB::table('users')->insertGetId(
    ['email' => 'john@example.com', 'votes' => 0]
);
```

::: danger Nota
Cuando estás usando PostgreSQL el método `insertGetId` espera que la columna de auto-incremento sea llamada `id`. Si prefieres obtener el ID con una "secuencia" distinta, puedes pasar el nombre de la columna como segundo parámetro del método `insertGetId`.
:::

<a name="updates"></a>
## Actualizaciones

Además de insertar registros dentro de la base de datos, el constructor de consultas también puede actualizar registros existentes usando el método `update`. El método `update`, como el método `insert`, acepta un arreglo de pares de columna y valor que contienen las columnas a ser actualizadas. Puedes restringir la consulta `update` usando cláusulas `where`:

```php
DB::table('users')
            ->where('id', 1)
            ->update(['votes' => 1]);
```

#### Actualizar o Insertar

A veces es posible que desees actualizar un registro existente en la base de datos o crearlo si no existe un registro coincidente. En este escenario, se puede usar el método `updateOrInsert`. El método `updateOrInsert` acepta dos argumentos: un arreglo de condiciones para encontrar el registro y un arreglo de columnas y pares de valores que contienen las columnas que se actualizarán.

El método `updateOrInsert` intentará primero buscar un registro de base de datos que coincida con los pares de columna y valor del primer argumento. Si el registro existe, se actualizará con los valores del segundo argumento. Si no se encuentra el registro, se insertará un nuevo registro con los atributos combinados de ambos argumentos:

```php
DB::table('users')
    ->updateOrInsert(
        ['email' => 'john@example.com', 'name' => 'John'],
        ['votes' => '2']
    );
```

<a name="updating-json-columns"></a>
## Actualizando Columnas JSON

Cuando estamos actualizando una columna JSON, deberías usar la sintaxis `->` para acceder a la clave apropiada en el objeto JSON. Esta operación es soportada solamente en bases de datos que soportan columnas JSON:

```php
DB::table('users')
            ->where('id', 1)
            ->update(['options->enabled' => true]);
```

<a name="increment-and-decrement"></a>
### Incremento Y Decremento

El constructor de consultas también proporciona métodos convenientes para incrementar o decrementar el valor de una columna dada. Esto es un atajo, que proporciona una interfaz más expresiva y concisa en comparación con la escritura manual de la declaración `update`.

Ambos métodos aceptan al menos un argumento: la columna a modificar. Un segundo argumento puede ser pasado opcionalmente para controlar la cantidad con la cual la columna debería ser incrementada o decrementada:

```php
DB::table('users')->increment('votes');

DB::table('users')->increment('votes', 5);

DB::table('users')->decrement('votes');

DB::table('users')->decrement('votes', 5);
```

También puedes especificar columnas adicionales para actualizar durante la operación:

```php
DB::table('users')->increment('votes', 1, ['name' => 'John']);
```

<a name="deletes"></a>
## Eliminaciones

El constructor de consultas también puede ser usado para eliminar registros de la tabla por medio del método `delete`. Puedes restringir instrucciones `delete` al agregar cláusulas `where` antes de ejecutar el método `delete`:

```php
DB::table('users')->delete();

DB::table('users')->where('votes', '>', 100)->delete();
```

Si deseas truncar la tabla completa, lo cual remueve todas las filas y reinicia el ID de auto-incremento a cero, puedes usar el método `truncate`:

```php
DB::table('users')->truncate();
```

<a name="pessimistic-locking"></a>
## Bloqueo Pesimista

El constructor de consultas también incluye algunas funciones que ayudan a que hagas el "bloqueo pesimista" en tus instrucciones `select`. Para ejecutar la instrucción con un "bloqueo compartido", puedes usar el método `sharedLock` en una consulta. Un bloqueo compartido previene las filas seleccionadas para que no sean modificadas hasta que tu transacción se confirme:

```php
DB::table('users')->where('votes', '>', 100)->sharedLock()->get();
```

Alternativamente, puedes usar el método `lockForUpdate`. Un bloqueo "para actualización" evita que las filas se modifiquen o que se seleccionen con otro bloqueo compartido:

```php
DB::table('users')->where('votes', '>', 100)->lockForUpdate()->get();
```