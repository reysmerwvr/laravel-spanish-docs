::: v-pre

# Base de datos: Migraciones

- [Introducción](#introduction)
- [Generando Migraciones](#generating-migrations)
- [Estructura de Migración](#migration-structure)
- [Ejecutando Migraciones](#running-migrations)
  - [Reversando Migraciones](#rolling-back-migrations)
- [Tablas](#tables)
  - [Creando Tablas](#creating-tables)
  - [Renombrando / Eliminando Tablas](#renaming-and-dropping-tables)
- [Columnas](#columns)
  - [Creando Columnas](#creating-columns)
  - [Modificadores de Columna](#column-modifiers)
  - [Modificando Columnas](#modifying-columns)
  - [Eliminando Columnas](#dropping-columns)
- [Índices](#indexes)
  - [Creación de Índices](#creating-indexes)
  - [Renombrando Índices](#renaming-indexes)
  - [Eliminando Índices](#dropping-indexes)
  - [Restricciones de Clave Foránea](#foreign-key-constraints)

<a name="introduction"></a>
## Introducción

Las migraciones son como el control de versión para tu base de datos, permiten que tu equipo modifique y comparta fácilmente el esquema de base de datos de la aplicación. Las migraciones son emparejadas típicamente con el constructor de esquema de Laravel para construir fácilmente el esquema de base de datos de tu aplicación. Si inclusive has tenido que decirle a un miembro de equipo que agregue una columna manualmente a sus esquemas de bases de datos local, has encarado el problema que solucionan las migraciones de base de datos.

La clase [facade](/docs/{{version}}/facades) `Schema` de Laravel proporciona soporte de base de datos orientado a la programación orientada a objetos para la creación y manipulación de tablas a través de todos los sistemas de bases de datos soportados por Laravel.

<a name="generating-migrations"></a>
## Generando Migraciones

Para crear una migración, usa el [comando Artisan](/docs/{{version}}/artisan) `make:migration`:

```php
php artisan make:migration create_users_table
```

La nueva migración estará ubicada en tu directorio `database/migrations`. Cada nombre de archivo de migración contiene una marca de tiempo la cual permite que Laravel determine el orden de las migraciones.

Las opciones `--table` y `--create` también pueden ser usadas para indicar el nombre de la tabla y si la migración estará creando una nueva tabla. Estas opciones rellenan previamente el archivo stub de migración generado con la tabla especificada:

```php
php artisan make:migration create_users_table --create=users

php artisan make:migration add_votes_to_users_table --table=users
```

Si prefieres especificar una ruta de directorio de salida personalizada para la migración generada, puedes usar la opción `--path` al momento de ejecutar el comando `make:migration`. La ruta de directorio dada debe ser relativa a la ruta de directorio base de tu aplicación.

<a name="migration-structure"></a>
## Estructura de Migración

Una clase de migración contiene dos métodos: `up` y `down`. El método `up` es usado para agregar nuevas tablas, columnas, o índices para tu base de datos, mientras el método `down` debería reversar las operaciones ejecutadas por el método `up`.

Dentro de ambos métodos puedes usar el constructor de esquema de Laravel para crear y modificar expresivamente las tablas. Para aprender sobre todos los métodos disponibles en el constructor `Schema`, [inspecciona su documentación](#creating-tables). Por ejemplo, este ejemplo de migración crea una tabla `flights`:

```php
<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateFlightsTable extends Migration
{
    /**
    * Run the migrations.
    *
    * @return void
    */
    public function up()
    {
        Schema::create('flights', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name');
            $table->string('airline');
            $table->timestamps();
        });
    }

    /**
    * Reverse the migrations.
    *
    * @return void
    */
    public function down()
    {
        Schema::drop('flights');
    }
}
```

<a name="running-migrations"></a>
## Ejecutando Migraciones

Para ejecutar todas tus maravillosas migraciones, ejecuta el comando Artisan `migrate`:

```php
php artisan migrate
```

::: danger Nota
Si estás usando [La máquina virtual de Homestead](/docs/{{version}}/homestead), deberías ejecutar este comando desde dentro de tu máquina virtual.
:::

#### Forzando las Migraciones para Ejecutar en Producción

Algunas operaciones de migración son destructivas, lo que significa que pueden causar que pierdas tus datos. Con el propósito de protegerte de ejecutar estos comandos contra tu base de datos de producción, recibirás un mensaje de confirmación antes que los comandos sean ejecutados. Para forzar que los comandos se ejecuten sin retardo, usa el indicador `--force`.

```php
php artisan migrate --force
```

<a name="rolling-back-migrations"></a>
### Reversando Migraciones

Para reversar la operación de migración más reciente, puedes usar el comando `rollback`. Este comando reversa el último "lote" de migraciones, los cuales pueden incluir archivos de migración múltiples.

```php
php artisan migrate:rollback
```

Puedes reversar un número limitado de migraciones proporcionando la opción `step` al comando `rollback`. Por ejemplo, el siguiente comando revertirá los cinco "lotes" de migraciones más recientes:

```php
php artisan migrate:rollback --step=5
```

El comando `migrate:reset` revertirá todas las migraciones de tu aplicación:

```php
php artisan migrate:reset
```

#### Rollback & Migrate En un Único Comando

El comando `migrate:refresh` reversará todas tus migraciones y después ejecutará el comando `migrate`. Este comando vuelve a crear efectivamente tu base de datos entera:

```php
php artisan migrate:refresh

// Refresh the database and run all database seeds...
php artisan migrate:refresh --seed
```

Puedes reversar y volver a migrar un número limitado de migraciones proporcionando la opción `step` al comando `refresh`. Por ejemplo, el siguiente comando revertirá y volverá a migrar las cinco migraciones más recientes:

```php
php artisan migrate:refresh --step=5
```

#### Eliminando Todas las Tablas y Migrar

El comando `migrate:fresh` eliminará todas las tablas de la base de datos y después ejecutará el comando `migrate`:

```php
php artisan migrate:fresh

php artisan migrate:fresh --seed
```

<a name="tables"></a>
## Tablas

<a name="creating-tables"></a>
### Creando Tablas

Para crear una nueva tabla en la base de datos, usa el método `create` en la clase facade `Schema`. El método `create` acepta dos argumentos. El primero es el nombre de la tabla, mientras que el segundo es una `Closure` la cual recibe un objeto de la clase `Blueprint` que puede ser usado para definir la nueva tabla:

```php
Schema::create('users', function (Blueprint $table) {
    $table->increments('id');
});
```

Al momento de crear la tabla, puedes usar cualquiera de [los métodos de columna](#creating-columns) del constructor de esquemas para definir las columnas de la tabla.

#### Inspeccionando la Tabla / Existencia de Columna

Puedes inspeccionar fácilmente la existencia de una tabla o columna usando los métodos `hasTable` y `hasColumn`:

```php
if (Schema::hasTable('users')) {
    //
}

if (Schema::hasColumn('users', 'email')) {
    //
}
```

#### Conexión de Base de Datos & Opciones de Tabla

Si quieres ejecutar una operación de esquema en una conexión de base de datos que no es tu conexión predeterminada, usa el método `connection`:

```php
Schema::connection('foo')->create('users', function (Blueprint $table) {
    $table->increments('id');
});
```

Puedes usar los siguientes comandos en el constructor de esquema para definir las opciones de tabla:

Comando  |  Descripción
-------  |  -----------
`$table->engine = 'InnoDB';`  |  Especifica el motor de almacenamiento de la tabla. (Sólo en MySQL).
`$table->charset = 'utf8';`  |  Especifica un conjunto de caracteres. (Sólo en MySQL).
`$table->collation = 'utf8_unicode_ci';`  |  Especifica un orden predeterminado para la tabla. (Sólo en MySQL)
`$table->temporary();`  |  Crea una tabla temporal (excepto en SQL Server).

<a name="renaming-and-dropping-tables"></a>
### Renombrando / Eliminando Tablas

Para renombrar una tabla de base de datos existente, usa el método `rename`:

```php
Schema::rename($from, $to);
```

Para eliminar una tabla existente, puedes usar los métodos `drop` o `dropIfExists`:

```php
Schema::drop('users');

Schema::dropIfExists('users');
```

#### Renombrando Tablas con Claves Foráneas

Antes de renombrar una tabla, deberías verificar que cualquiera de las restricciones de clave foránea en la tabla tenga un nombre explícito en tus archivos de migración en caso de permitir que Laravel asigne un nombre basado en la convención. De otra manera, el nombre de restricción de clave foránea se referirá al nombre que tenía la tabla.

<a name="columns"></a>
## Columnas

<a name="creating-columns"></a>
### Creando Columnas

El método `table` en la clase facade `Schema` puede ser usado para actualizar tablas existentes. Igual que el método `create` acepta dos argumentos: el nombre de la tabla y una `Closure` que recibe una instancia de la clase `Blueprint` que puedes usar para agregar columnas a la tabla:

```php
Schema::table('users', function (Blueprint $table) {
    $table->string('email');
});
```

#### Tipos de Columna Permitidos

El constructor de esquema contiene una variedad de tipos de columna que puedes especificar al momento de construir tus tablas:

Comando  |  Descripción
-------  |  -----------
`$table->bigIncrements('id');`  |  Tipo de columna equivalente a Auto-incremento UNSIGNED BIGINT (clave primaria).
`$table->bigInteger('votes');`  |  Tipo de columna equivalente a BIGINT equivalent.
`$table->binary('data');`  |  Tipo de columna equivalente a BLOB.
`$table->boolean('confirmed');`  |  Tipo de columna equivalente a BOOLEAN.
`$table->char('name', 100);`  |  Tipo de columna equivalente a CHAR con una longitud opcional.
`$table->date('created_at');`  |  Tipo de columna equivalente a DATE.                          
`$table->dateTime('created_at');`  |  Tipo de columna equivalente a DATETIME.                      
`$table->dateTimeTz('created_at');`  |  Tipo de columna equivalente a DATETIME (con hora de la zona).
`$table->decimal('amount', 8, 2);`  |  Tipo de columna equivalente a DECIMAL con una precisión (el total de dígitos) y escala de dígitos decimales.
`$table->double('amount', 8, 2);`  |  Tipo de columna equivalente a DOUBLE con una precisión (el total de dígitos) y escala de dígitos decimales.
`$table->enum('level', ['easy', 'hard']);` |  Tipo de columna equivalente a ENUM.
`$table->float('amount', 8, 2);`  |  Tipo de columna equivalente a FLOAT con una precisión (el total de dígitos) y escala de dígitos decimales.
`$table->geometry('positions');`  |  Tipo de columna equivalente a GEOMETRY.         
`$table->geometryCollection('positions');`  |  Tipo de columna equivalente a GEOMETRYCOLLECTION.
`$table->increments('id');`  |  Tipo de columna equivalente a Auto-incremento UNSIGNED INTEGER (clave primaria).
`$table->integer('votes');`  |  Tipo de columna equivalente a INTEGER.
`$table->ipAddress('visitor');`  |  Tipo de columna equivalente a dirección IP.                  
`$table->json('options');`  |  Tipo de columna equivalente a JSON.                          
`$table->jsonb('options');`  |  Tipo de columna equivalente a JSONB.                         
`$table->lineString('positions');`  |  Tipo de columna equivalente a LINESTRING.
`$table->longText('description');`  |  Tipo de columna equivalente a LONGTEXT.
`$table->macAddress('device');`  |  Tipo de columna equivalente a dirección MAC.                 
`$table->mediumIncrements('id');`  |  Tipo de columna equivalente a Auto-incremento UNSIGNED MEDIUMINT (clave primaria).
`$table->mediumInteger('votes');`  |  Tipo de columna equivalente a MEDIUMINT.
`$table->mediumText('description');`  |  Tipo de columna equivalente a MEDIUMTEXT.
`$table->morphs('taggable');`  |  Agrega los tipos de columna equivalente a UNSIGNED INTEGER `taggable_id` y VARCHAR `taggable_type`.
`$table->multiLineString('positions');`  |  Tipo de columna equivalente a MULTILINESTRING.
`$table->multiPoint('positions');`  |  Tipo de columna equivalente a MULTIPOINT.                    
`$table->multiPolygon('positions');`  |  Tipo de columna equivalente a MULTIPOLYGON.
`$table->nullableMorphs('taggable');`  |  Permite que la columna `morphs()` acepte una versión de valor nulo.
`$table->nullableTimestamps();`  |  Método Alias de `timestamps()`.                              
`$table->point('position');`  |  Tipo de columna equivalente a POINT.
`$table->polygon('positions');`  |  Tipo de columna equivalente a POLYGON.
`$table->rememberToken();`  |  Permite nulos en el tipo de columna equivalente a VARCHAR(100) `remember_token`.
`$table->smallIncrements('id');`  |  Tipo de columna equivalente a Auto-incremento UNSIGNED SMALLINT (clave primaria).
`$table->smallInteger('votes');`  |  Tipo de columna equivalente a SMALLINT.                      
`$table->softDeletes();`  |  Permite nulos en el tipo de columna equivalente a TIMESTAMP `deleted_at` para eliminaciones.
`$table->softDeletesTz();`  |  Permite nulos en el tipo de columna equivalente a TIMESTAMP `deleted_at` (con la hora de la zona) para eliminaciones.
`$table->string('name', 100);`  |  Tipo de columna equivalente a VARCHAR con una longitud opcional.
`$table->text('description');`  |  Tipo de columna equivalente a TEXT.                          
`$table->time('sunrise');`  |  Tipo de columna equivalente a TIME.                          
`$table->timeTz('sunrise');`  |  Tipo de columna equivalente a TIME (con la hora de la zona). 
`$table->timestamp('added_on');`  |  Tipo de columna equivalente a TIMESTAMP.                     
`$table->timestampTz('added_on');`  |  Tipo de columna equivalente a TIMESTAMP (con la hora de la zona).
`$table->timestamps();`  |  Permite nulos en las columnas equivalentes TIMESTAMP `created_at` y `updated_at`.
`$table->timestampsTz();`  |  Permite nulos en las columnas equivalentes TIMESTAMP `created_at` y `updated_at` (con la hora de la zona).
`$table->tinyIncrements('id');`  |  Tipo de columna equivalente a Auto-incremento UNSIGNED TINYINT (clave primaria).
`$table->tinyInteger('votes');`  |  Tipo de columna equivalente a TINYINT.                       
`$table->unsignedBigInteger('votes');`  |  Tipo de columna equivalente a UNSIGNED BIGINT.
`$table->unsignedDecimal('amount', 8, 2);`  |  Tipo de columna equivalente a UNSIGNED DECIMAL con una precisión (total de dígitos) escala (dígitos decimales).
`$table->unsignedInteger('votes');`  |  Tipo de columna equivalente a UNSIGNED INTEGER.
`$table->unsignedMediumInteger('votes');`  |  Tipo de columna equivalente a UNSIGNED MEDIUMINT.
`$table->unsignedSmallInteger('votes');`  |  Tipo de columna equivalente a UNSIGNED SMALLINT.
`$table->unsignedTinyInteger('votes');`  |  Tipo de columna equivalente a UNSIGNED TINYINT.
`$table->uuid('id');`  |  Tipo de columna equivalente a UUID.                          
`$table->year('birth_year');`  |  Tipo de columna equivalente a YEAR.

<a name="column-modifiers"></a>
### Modificadores de Columna

Además de los tipos de columna listados anteriormente, hay varios "modificadores" de columna que puedes usar al momento de agregar una columna a la tabla de base de datos. Por ejemplo, para hacer que la columna "acepte valores nulos", puedes usar el método `nullable`.

```php
Schema::table('users', function (Blueprint $table) {
    $table->string('email')->nullable();
});
```

Debajo está una lista con todos los modificadores de columna disponibles. Esta lista no incluye los [modificadores de índice](#creating-indexes):

Modificador  |  Descripción
-----------  |  -----------
`->after('column')`  |  Coloca la columna "después de" otra columna (MySQL)                    
`->autoIncrement()`  |  Establece las columnas tipo INTEGER como auto-incremento (clave primaria)
`->charset('utf8')`  |  Especifica un conjunto de caracteres para la columna (MySQL)
`->collation('utf8_unicode_ci')`  |  Especifica un ordenamiento para la columna (MySQL/SQL Server)
`->comment('my comment')`  |  Agrega un comentario a una columna (MySQL/PostgreSQL)
`->default($value)`  |  Especifica un valor "predeterminado" para la columna
`->first()`  |  Coloca la columna al "principio" en la tabla (MySQL)
`->nullable($value = true)`  |  Permite que valores NULL (por defecto) sean insertados dentro de la columna
`->storedAs($expression)`  |  Crea una columna almacenada generada por la expresión (MySQL)
`->unsigned()`  |  Establece las columnas tipo INTEGER como UNSIGNED (MySQL)
`->useCurrent()`  |  Establece las columnas tipo TIMESTAMP para usar CURRENT_TIMESTAMP como valor predeterminado
`->virtualAs($expression)`  |  Crea una columna virtual generada por la expresión (MySQL)   
`->generatedAs($expression)`  |  Crea una columna de identidad con opciones de secuencia especificadas (PostgreSQL)
`->always()`  |  Define la prioridad de los valores de secuencia sobre la entrada para una columna de identidad (PostgreSQL)

<a name="modifying-columns"></a>
### Modificando Columnas

#### Prerequisitos

Antes de modificar una columna, asegúrate de agregar la dependencia `doctrine/dbal` a tu archivo `composer.json`. La biblioteca DBAL de Doctrine es usada para determinar el estado actual de la columna y crear las consultas SQL necesarias para hacer los ajustes especificados a la columna:

```php
composer require doctrine/dbal
```

#### Actualizando los atributos de Columna

El método `change` permite que modifiques algunos tipos de columna existentes a un nuevo tipo o modifiques los atributos de la columna. Por ejemplo, puedes querer aumentar el tamaño de una columna tipo cadena. Para ver el método `change` en acción, vamos a aumentar el tamaño de la columna `name` de 25 a 50 caracteres:

```php
Schema::table('users', function (Blueprint $table) {
    $table->string('name', 50)->change();
});
```

También podríamos modificar una columna para que acepte valores nulos:

```php
Schema::table('users', function (Blueprint $table) {
    $table->string('name', 50)->nullable()->change();
});
```

::: danger Nota
Solamente los siguientes tipos de columna pueden ser "cambiados": bigInteger, binary, boolean, date, dateTime, dateTimeTz, decimal, integer, json, longText, mediumText, smallInteger, string, text, time, unsignedBigInteger, unsignedInteger y unsignedSmallInteger.
:::

#### Renombrando Columnas

Para renombrar una columna, puedes usar el método `renameColumn` en el constructor de esquemas. Antes de renombrar una columna, asegúrate de agregar la dependencia `doctrine/dbal` a tu archivo `composer.json`:

```php
Schema::table('users', function (Blueprint $table) {
    $table->renameColumn('from', 'to');
});
```

::: danger Nota
Renombrar alguna columna en una tabla que también tiene una columna de tipo `enum` no es soportado actualmente.
:::

<a name="dropping-columns"></a>
### Eliminando Columnas

Para eliminar una columna, usa el método `dropColumn` en el constructor de esquemas. Antes de eliminar columnas de una base de datos SQLite, necesitarás agregar la dependencia `doctrine/dbal` a tu archivo `composer.json` y ejecutar el comando `composer update` en tu terminal para instalar la biblioteca:

```php
Schema::table('users', function (Blueprint $table) {
    $table->dropColumn('votes');
});
```

Puedes eliminar múltiples columnas de una tabla al pasar un arreglo de nombres de columna al método `dropColumn`:

```php
Schema::table('users', function (Blueprint $table) {
    $table->dropColumn(['votes', 'avatar', 'location']);
});
```

::: danger Nota
Eliminar o modificar múltiples columnas dentro de una sola migración al momento de usar una base de datos SQLite no está soportado.
:::

#### Alias de Comandos Disponibles

| Comando                        | Descripción                                        |
| ------------------------------ | -------------------------------------------------- |
| `$table->dropRememberToken();` | Eliminar la columna `remember_token`.              |
| `$table->dropSoftDeletes();`   | Eliminar la columna `deleted_at`.                  |
| `$table->dropSoftDeletesTz();` | Alias del método `dropSoftDeletes()`.              |
| `$table->dropTimestamps();`    | Eliminar las columnas `created_at` y `updated_at`. |
| `$table->dropTimestampsTz();`  | Alias del método `dropTimestamps()`.               |

<a name="indexes"></a>
## Índices

<a name="creating-indexes"></a>
### Creando Índices

El constructor de esquemas soporta varios tipos de índices. Primero, veamos un ejemplo que especifica que los valores de una columna deben ser únicos. Para crear el índice, podemos encadenar el método `unique` en la definición de columna:

```php
$table->string('email')->unique();
```

Alternativamente, puedes crear el índice después de la definición de la columna. Por ejemplo:

```php
$table->unique('email');
```

Incluso puedes pasar un arreglo de columnas a un método de índice para crear un índice compuesto (o combinado) :

```php
$table->index(['account_id', 'created_at']);
```

Laravel generará automáticamente un nombre de índice razonable, pero puedes pasar un segundo argumento al método para especificar el nombre por ti mismo.

```php
$table->unique('email', 'unique_email');
```

#### Tipos de Índice Disponibles

Cada método de índice acepta un segundo argumento opcional para especificar el nombre del índice. Si se omite, el nombre se derivará de los nombres de la tabla y la(s) columna(s).

| Comando                                 | Descripción                                 |
| --------------------------------------- | ------------------------------------------- |
| `$table->primary('id');`                | Agrega una clave primaria.                  |
| `$table->primary(['id', 'parent_id']);` | Agrega claves compuestas.                   |
| `$table->unique('email');`              | Agrega un índice único.                     |
| `$table->index('state');`               | Agrega un índice con valores repetidos.     |
| `$table->spatialIndex('location');`     | Agrega un índice espacial. (excepto SQLite) |

#### Longitudes de Índices & MySQL / MariaDB

Laravel usa el conjunto de caracteres `utf8mb4` por defecto, el cual incluye soporte para almacenar "emojis" en la base de datos. Si estás ejecutando una versión de MySQL más antigua que la versión 5.7.7 o más vieja que la versión 10.2.2 de MariaDB, puedes que necesites configurar manualmente la longitud de cadena predeterminada generada por las migraciones con el propósito de que MySQL cree los índices para estos. Puedes configurar esto ejecutando el método `Schema::defaultStringLength` dentro de tu `AppServiceProvider`:

```php
use Illuminate\Support\Facades\Schema;

/**
* Bootstrap any application services.
*
* @return void
*/
public function boot()
{
    Schema::defaultStringLength(191);
}
```

Alternativamente, puedes habilitar la opción `innodb_large_prefix` para tu base de datos. Debes referirte a la documentación de tu base de datos para conocer las instrucciones de cómo habilitar ésta apropiadamente.

<a name="renaming-indexes"></a>
### Renombrando Índices

Para renombrar un índice, puedes usar el método `renameIndex`. Este método acepta el nombre del índice actual como primer argumento y el nombre deseado como segundo argumento:

```php
$table->renameIndex('from', 'to')
```

<a name="dropping-indexes"></a>
### Eliminando Índices

Para eliminar un índice, debes especificar el nombre del índice. De forma predeterminada, Laravel asigna automáticamente un nombre razonable para los índices. Concatena el nombre de la tabla, el nombre de la columna indexada y el tipo de índice. Aquí están algunos ejemplos:

Comando  |  Descripción
-------  |  -----------
`$table->dropPrimary('users_id_primary');`  |  Eliminar una clave primaria de la tabla "users".
`$table->dropUnique('users_email_unique');`  |  Elimina un índice único de la tabla "users".
`$table->dropIndex('geo_state_index');`  |  Elimina un índice básico de la tabla "geo".
`$table->dropSpatialIndex('geo_location_spatialindex');`  |  Elimina un índice espacial de la tabla "geo" (excepto SQLite).

Si pasas un arreglo de columnas dentro de un método que elimina los índices, el nombre de índice convencional será generado basado en el nombre de la tabla, columnas y tipo de clave:

```php
Schema::table('geo', function (Blueprint $table) {
    $table->dropIndex(['state']); // Drops index 'geo_state_index'
});
```

<a name="foreign-key-constraints"></a>
### Restricciones de Clave Foránea

Laravel también proporciona soporte para la creación de restricciones de clave foránea, las cuales son usadas para forzar la integridad referencial a nivel de base de datos.  Por ejemplo, vamos a definir una columna `user_id` en la tabla `posts` que referencia la columna `id` en una tabla `users`:

```php
Schema::table('posts', function (Blueprint $table) {
    $table->unsignedBigInteger('user_id');

    $table->foreign('user_id')->references('id')->on('users');
});
```

También puedes especificar la acción deseada para las propiedades "on delete" y "on update" de la restricción:

```php
$table->foreign('user_id')
      ->references('id')->on('users')
      ->onDelete('cascade');
```

Para eliminar una clave foránea, puedes usar el método `dropForeign`. Las restricciones de clave foránea usan la misma convención de nombres que los índices. Así, concatenaremos el nombre de la tabla y el de columna en la restricción luego agrega el sufijo "\_foreign" al nombre:

```php
$table->dropForeign('posts_user_id_foreign');
```

O, puedes pasar un arreglo de valores el cual usará automáticamente el nombre de restricción convencional al momento de eliminar:

```php
$table->dropForeign(['user_id']);
```

Puedes habilitar o deshabilitar las restricciones de clave foránea dentro de tus migraciones usando los siguientes métodos:

```php
Schema::enableForeignKeyConstraints();

Schema::disableForeignKeyConstraints();
```

::: danger Nota
SQLite deshabilita las restricciones de clave foránea de forma predeterminada. Al usar SQLite, asegúrese de [habilitar el soporte de clave foránea](/docs/{{version}}/database#configuration) en la configuración de tu base de datos antes de intentar crearlos en sus migraciones.
:::