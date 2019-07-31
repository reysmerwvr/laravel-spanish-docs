::: v-pre

# Bases de datos: primeros pasos

- [Introducción](#introduction)
    - [Configuración](#configuration)
    - [Conexiones de lectura y escritura](#read-and-write-connections)
    - [Usando múltiples conexiones de bases de datos](#using-multiple-database-connections)
- [Ejecutando consultas SQL nativas](#running-queries)
- [Listeners de eventos de consultas](#listening-for-query-events)
- [Transacciones de bases de datos](#database-transactions)

<a name="introduction"></a>
## Introducción

Laravel hace que la interacción con las bases de datos sea extremadamente fácil a través de una variedad de backends de bases de datos usando SQL nativo, el constructor de consultas [query builder](/queries.html) y el [ORM Eloquent](/eloquent.html). Actualmente, Laravel soporta cuatro bases de datos.

- MySQL
- PostgreSQL
- SQLite
- SQL Server

<a name="configuration"></a>
### Configuración

La configuración de base de datos para tu aplicación está localizada en `config/database.php`. Puedes definir todo lo concerniente a tus conexiones de bases de datos, y también especificar qué conexión debería ser usada por defecto. Ejemplos para la mayoría de los sistemas de bases de datos soportados son proporcionados en este archivo.

Por defecto, la [configuración de entorno](/configuration.html#environment-configuration) de muestra de Laravel está lista para usar con [Laravel Homestead](/homestead.html), la cual es una máquina virtual conveniente para el desarrollo con Laravel en tu máquina local. Eres libre de modificar esta configuración de acuerdo a tus necesidades de tu base de datos local.

#### Configuración de SQLite

Después de la creación de una nueva base de datos SQLite usando un comando tal como `touch database/database.sqlite`, puedes configurar fácilmente tus variables de entorno para apuntar a esta base de datos creada recientemente al usar la ruta absoluta a la base de datos.

```php
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database.sqlite
```

Para habilitar las claves foráneas en conexiones de SQLite, debes agregar la opción `foreign_key_constraints` en tu archivo de configuración `config/database.php`:

```php
'sqlite' => [
    // ...
    'foreign_key_constraints' => true,
],
```

#### Configuración usando URLs

Típicamente, las conexiones a bases de datos son configuradas usando múltiples valores de configuración como `host`, `database`, `username`, `password`, etc. Cada uno de esos valores de configuración tiene su propia variable de entorno correspondiente. Esto quiere decir que al configurar tu información de conexión a la base de datos en un servidor de producción, necesitas administrar múltiples variables de entorno.

Algunos proveedores de bases de datos administrados como Heroku proporcionan una única "URL" de base de datos que contiene toda la información de conexión para la base de datos en una única cadena. Una URL de base de datos de ejemplo podría verse de la siguiente manera:

```php
mysql://root:password@127.0.0.1/forge?charset=UTF-8
```

Estas URLs típicamente siguen una convención de esquema estándar:

```php
driver://username:password@host:port/database?options
```

Por conveniencia, Laravel soporta dichas URLs como alternativa a configurar tu base de datos con múltiples opciones de configuración. Si la opción de configuración `url` (o variable de entorno `DATABASE_URL` correspondiente) está presente, esta será usada para extraer la conexión a la base de datos y la información de credenciales.

<a name="read-and-write-connections"></a>
### Conexiones de lectura y escritura

Algunas veces puedes desear contar con una conexión de base de datos para los comandos SELECT y otra para los comandos UPDATE y DELETE. Laravel hace esto una tarea fácil, y las conexiones propias siempre serán usadas si estás usando consultas nativas, el constructor de consultas Query Builder o el ORM Eloquent.

Para ver cómo las conexiones de lectura / escritura deberían ser configuradas, vamos a mirar este ejemplo:

```php
'mysql' => [
    'read' => [
        'host' => [
            '192.168.1.1',
            '196.168.1.2',
        ],
    ],
    'write' => [
        'host' => [
            '196.168.1.3',
        ],
    ],
    'sticky'    => true,
    'driver'    => 'mysql',
    'database'  => 'database',
    'username'  => 'root',
    'password'  => '',
    'charset'   => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix'    => '',
],
```

Observa que tres claves han sido agregadas al arreglo de configuración: `read`, `write` y `sticky`. Las claves `read` y `write` tienen valores de arreglo conteniendo una sola clave: la dirección ip del `host`. El resto de las opciones de la base de datos para las conexiones `read` y `write` serán tomadas del arreglo principal `mysql`.

Únicamente necesitas colocar elementos en los arreglos `read` y `write` si deseas sobreescribir los valores del arreglo principal. Así, en este caso, `192.168.1.1` será usado como la máquina para la conexión de "lectura", mientras que `192.168.1.3` será usada para la conexión de "escritura".  Las credenciales de bases de datos, prefijo, conjunto de caracteres, y todas las demás opciones en el arreglo principal `mysql` serán compartidas a través de ambas conexiones.

#### La opción `sticky`

La opción `sticky` es un valor *opcional* que puede ser usado para permitir la lectura inmediata de registros que han sido escritos a la base de datos durante el ciclo de solicitudes actual. Si la opción `sticky` está habilitada y una operación de "escritura" ha sido ejecutada contra la base de datos durante el ciclo de solicitudes actual, cualquiera de las operaciones de "lectura" hasta aquí usarán la conexión "write". Esto asegura que cualquier dato escrito durante el ciclo de solicitud pueda ser leído inmediatamente de la base de datos durante la misma solicitud. Es posible para ti decidir si este es el comportamiento deseado para tu aplicación.

<a name="using-multiple-database-connections"></a>
### Usando conexiones de bases de datos múltiples

Cuando estamos usando conexiones múltiples, puedes acceder a cada conexión por medio del método `connection` en el Facade `DB`.  El nombre `name` pasado al método de conexión `connection` debería corresponder a una de las conexiones listadas en tu archivo de configuración `config/database.php`:

```php
$users = DB::connection('foo')->select(...);
```

También puedes acceder a los datos nativos de la instancia PDO subyacente que usa el método `getPdo` en una instancia de conexión:

```php
$pdo = DB::connection()->getPdo();
```

<a name="running-queries"></a>
## Ejecutando consultas SQL nativas

Una vez que has configurado tu conexión de base de datos, puedes ejecutar consultas usando el Facade `DB`. La clase facade `DB` proporciona métodos para cada tipo de consulta: `select`, `update`, `insert`, `delete` y `statement`.

#### Ejecutando una consulta select

Para ejecutar una consulta básica, puedes usar el método `select` en el facade `DB`:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class UserController extends Controller
{
    /**
    * Muestra una lista de todos los usuarios de la aplicación.
    *
    * @return Response
    */
    public function index()
    {
        $users = DB::select('select * from users where active = ?', [1]);

        return view('user.index', ['users' => $users]);
    }
}
```

El primer argumento pasado al método `select` es la consulta SQL nativa; en este caso está parametrizada, mientras el segundo argumento es cualquier parámetro a enlazar que necesita estar conectado a la consulta. Típicamente, estos son los valores de las restricciones de cláusula `where`. El enlazamiento de parámetro proporciona protección contra ataques de inyección SQL.

El método `select` siempre devolverá un arreglo de resultados. Cada resultado dentro del arreglo será un objeto `stdClass` de PHP, permitiendo que accedas a los valores de los resultados:

```php
foreach ($users as $user) {
    echo $user->name;
}
```

#### Usando enlaces nombrados

En lugar de usar `?` para representar tus enlaces (bindings) de parámetros, puedes ejecutar una consulta usando enlaces nombrados:

```php
$results = DB::select('select * from users where id = :id', ['id' => 1]);
```

#### Ejecutando una instrucción insert

Para ejecutar una instrucción `insert`, puedes usar el método `insert` en la clase facade `DB`. Igual que `select`, este método toma la consulta SQL nativa como su argumento inicial y lo enlaza con su argumento secundario:

```php
DB::insert('insert into users (id, name) values (?, ?)', [1, 'Dayle']);
```

#### Ejecutando una instrucción update

El método `update` debería ser usado para actualizar los registros existentes en la base de datos. El número de filas afectadas por la instrucción serán devueltas:

```php
$affected = DB::update('update users set votes = 100 where name = ?', ['John']);
```

#### Ejecutando una instrucción delete

El método `delete` debería ser usado para eliminar registros de la base de datos. Al igual que `update`, el número de filas afectadas será devuelto:

```php
$deleted = DB::delete('delete from users');
```

#### Ejecutando una instrucción general

Algunas instrucciones de bases de datos no devuelven algún valor. Para estos tipos de operaciones, puedes usar el método `statement` en la clase facade `DB`:

```php
DB::statement('drop table users');
```

<a name="listening-for-query-events"></a>
## Listeners de eventos de consultas

Si prefieres recibir cada consulta SQL ejecutada por tu aplicación, puedes usar el método `listen`. Este método es útil para registrar consultas o depurar. Puedes registrar tus listeners de consultas en un [proveedor de servicio](/providers.html):

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
    * Inicializa cualquiera de los servicios de la aplicación.
    *
    * @return void
    */
    public function boot()
    {
        DB::listen(function ($query) {
            // $query->sql
            // $query->bindings
            // $query->time
        });
    }

    /**
    * Registra el proveedor de servicio.
    *
    * @return void
    */
    public function register()
    {
        //
    }
}
```

<a name="database-transactions"></a>
## Transacciones de bases de datos

Puedes usar el método `transaction` en la clase facade `DB` para ejecutar un conjunto de operaciones dentro de una transacción de base de datos. Si un error de excepción es arrojado dentro del código `Closure` de la transacción, la transacción automáticamente terminará con un rollback. Si el código `Closure` se ejecuta correctamente, la transacción terminará automáticamente con un commit. No necesitas preocuparte por hacer rollback o commit manualmente mientras estés usando el método `transaction`:

```php
DB::transaction(function () {
    DB::table('users')->update(['votes' => 1]);

    DB::table('posts')->delete();
});
```

#### Manejando deadlocks (bloqueo mutuo)

El método `transaction` acepta un segundo argumento opcional el cual define el número de veces que la ejecución de una transacción debería ser reintentada cuando un ocurra un deadlock. Una vez que estos intentos hayan sido completados sin éxito, un error de excepción será arrojado:

```php
DB::transaction(function () {
    DB::table('users')->update(['votes' => 1]);

    DB::table('posts')->delete();
}, 5);
```

#### Usando transacciones manualmente

Si prefieres empezar una transacción manualmente y tener control total sobre rollbacks y commits, podrías usar el método `beginTransaction` de la clase facade `DB`:

```php
DB::beginTransaction();
```

Puedes hacer rollback de la transacción por medio del método `rollback`:

```php
DB::rollBack();
```

Finalmente, puedes confirmar una transacción por medio del método `commit`:

```php
DB::commit();
```

::: tip TIP 
Los métodos de transacción del Facade `DB` controlan las transacciones para ambos backends de bases de datos del constructor de consultas [query builder](/queries.html) y el [ORM Eloquent](/eloquent.html).
:::