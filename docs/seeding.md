::: v-pre

# Base de datos: Seeding

- [Introducción](#introduction)
- [Escribiendo seeders](#writing-seeders)
  - [Usando model factories](#using-model-factories)
  - [Registrando seeders adicionales](#calling-additional-seeders)
- [Ejecutando seeders](#running-seeders)

<a name="introduction"></a>
## Introducción

Laravel incluye un método sencillo para alimentar tu base de datos con datos de prueba usando clases `Seeder`. Todas las clases `Seeder` son almacenadas en el directorio `database/seeds`. Las clases `Seeder` pueden tener cualquier nombre que desees, pero deberías seguir probablemente alguna convención razonable, tales como `UsersTableSeeder` etc. De forma predeterminada, una clase `DatabaseSeeder` se define para tí. A partir de esta clase, puedes usar el método `call` para registrar otras clases seeder, permitiendo que controles el orden en que se ejecutan.

<a name="writing-seeders"></a>
## Escribiendo seeders

Para generar un seeder, ejecuta el [Comando Artisan](/artisan.html) `make:seeder`. Todos los seeders generados por el framework seran colocados en el directorio `database/seeds`:

```php
php artisan make:seeder UsersTableSeeder
```

Una clase seeder contiene solamente un método de forma predeterminada: `run`. Este método es ejecutado cuando el [Comando Artisan](/artisan.html) `db:seed` se ejecuta. Dentro del método `run`, puedes insertar datos en tu base de datos en la forma que desees. Puedes usar el [constructor de consultas](/queries.html) para insertar datos manualmente o puedes usar los [Model Factories de Eloquent](/database-testing.html#writing-factories).

::: tip
[La protección de asignación en masa](/eloquent.html#mass-assignment) es deshabilitada automáticamente durante el seeding de la base de datos.
:::

Como un ejemplo, vamos a modificar la clase `DatabaseSeeder` predeterminada y agregar una instrucción insert al método `run`:

```php
<?php

use Illuminate\Support\Str;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
    * Run the database seeds.
    *
    * @return void
    */
    public function run()
    {
        DB::table('users')->insert([
            'name' => Str::random(10),
            'email' => Str::random(10).'@gmail.com',
            'password' => bcrypt('secret'),
        ]);
    }
}
```

::: tip
Puede escribir cualquier dependencia que necesite dentro de la firma del método `run`. Se resolverán automáticamente a través del [contenedor de servicio](/container.html) de Laravel.
:::

<a name="using-model-factories"></a>
### Usando model factories

Ciertamente, especificar manualmente los atributos para cada seeder de modelos es lento y complicado. En lugar de eso, puedes usar [Model Factories](/database-testing.html#writing-factories) para generar convenientemente cantidades grandes de registros de bases de datos. Primero, revisa la [documentación sobre model factories](/database-testing.html#writing-factories) para aprender cómo definir tus factories. Una vez que hayas definido tus factories, puedes usar la función helper `factory` para insertar registros dentro de tu base de datos.

Por ejemplo, vamos a crear 50 usuarios y establecer una asociación con los posts para cada usuario:

```php
/**
* Run the database seeds.
*
* @return void
*/
public function run()
{
    factory(App\User::class, 50)->create()->each(function ($user) {
        $user->posts()->save(factory(App\Post::class)->make());
    });
}
```

<a name="calling-additional-seeders"></a>
### Registrando seeders adicionales

Dentro de la clase `DatabaseSeeder`, puedes usar el método `call` para ejecutar clases seeder adicionales. Usar el método `call` te permite separar el seeding de tu base de datos en varios archivos con el propósito de que no exista una clase seeder única que se vuelva extremadamente grande. Pasa el nombre de la clase seeder que deseas ejecutar:

```php
/**
* Run the database seeds.
*
* @return void
*/
public function run()
{
    $this->call([
        UsersTableSeeder::class,
        PostsTableSeeder::class,
        CommentsTableSeeder::class,
    ]);
}
```

<a name="running-seeders"></a>
## Ejecutando seeders

Una vez que hayas escrito tu seeder, puedes necesitar regenerar el cargador automático de Composer usando el comando `dump-autoload`:

```php
composer dump-autoload
```

Ahora puedes usar el comando Artisan `db:seed` para alimentar tu base de datos. De forma predeterminada, el comando `db:seed` ejecuta la clase `DatabaseSeeder`, la cual puede ser usada para ejecutar otras clases seeder. Sin embargo, puedes usar la opción `--class` para especificar que una clase seeder específica se ejecute individualmente:

```php
php artisan db:seed

php artisan db:seed --class=UsersTableSeeder
```

También puedes alimentar tu base de datos usando el comando `migrate:refresh`, el cual también deshará y volverá a ejecutar tods tus migraciones. Este comando es útil para reconstruir tu base de datos completamente:

```php
php artisan migrate:refresh --seed
```

#### Forzar la ejecución de seeders en producción

Algunas operaciones de seeding pueden causar que alteres o pierdas datos. Para protegerte de ejecutar comandos de seeding en tu base de datos de producción, te será solicitada una confirmación antes de que los seeders sean ejecutados. Para forzar la ejecución de los seeders sin confirmación, usa la opción `--force`:

```php
php artisan db:seed --force
```