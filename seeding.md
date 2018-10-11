# Database: Seeding

- [Introducción](#introduction)
- [Escribiendo Seeders](#writing-seeders)
    - [Usando Fábricas de Modelos](#using-model-factories)
    - [Registrando Seeders Adicionales](#calling-additional-seeders)
- [Ejecutando Seeders](#running-seeders)

<a name="introduction"></a>
## Introducción

Laravel incluye un método sencillo para alimentar tu base de datos con datos de prueba usando clases seed. Todas las clases seed son almacenadas en el directorio `database/seeds`. Las clases seed pueden tener cualquier nombre que desees, pero deberías seguir probablemente alguna convención razonable, tales como `UsersTableSeeder`, etc. De forma predeterminada, una clase `DatabaseSeeder` se define para tí. A partir de esta clase, puedes usar el método `call` para registrar otras clases seed, permitiendo que controles el ordenamiento de alimentación.

<a name="writing-seeders"></a>
## Escribiendo Seeders

Para generar un seeder, ejecute el [Comando Artisan](/docs/{{version}}/artisan) `make:seeder`. Todos los seeders generados por el framework seran colocados en el directorio `database/seeds`:

    php artisan make:seeder UsersTableSeeder

Una clase seeder contiene solamente un método de forma predeterminada: `run`. Este método es ejecutado cuando el [Comando Artisan](/docs/{{version}}/artisan) `db:seed` se ejecuta. Dentro del método `run`, puedes insertar datos en tu base de datos en la forma que desees. Puedes usar el [constructor de consultas](/docs/{{version}}/queries) para insertar datos manualmente o puedes usar las [Fábricas de Modelos de Eloquent](/docs/{{version}}/database-testing#writing-factories).

> {tip} [La protección de asignación en masa](/docs/{{version}}/eloquent#mass-assignment) es deshabilitada automáticamente durante la alimentación de la base de datos.

Como un ejemplo, vamos a modificar la clase `DatabaseSeeder` predeterminada y agregar una instrucción insert al método `run`:

    <?php

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
                'name' => str_random(10),
                'email' => str_random(10).'@gmail.com',
                'password' => bcrypt('secret'),
            ]);
        }
    }

<a name="using-model-factories"></a>
### Usando Fábricas de Modelos

Ciertamente, especificar manualmente los atributos para cada seed de modelo es lento y complicado. En lugar de eso, puedes usar [fábricas de modelos](/docs/{{version}}/database-testing#writing-factories) para generar convenientemente cantidades grandes de registros de bases de datos. Primero, revisa la [documentación sobre fábrica de modelo](/docs/{{version}}/database-testing#writing-factories) para aprender cómo definir tus fábricas. Una vez que hayas definido tus fábricas, puedes usar la función helper `factory` para insertar registros dentro de tu base de datos.

Por ejemplo, vamos a crear 50 usuarios y establecer una asociación con los posts para cada usuario:

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        factory(App\User::class, 50)->create()->each(function ($u) {
            $u->posts()->save(factory(App\Post::class)->make());
        });
    }

<a name="calling-additional-seeders"></a>
### Registrando Seeders Adicionales

Dentro de la clase `DatabaseSeeder`, puedes usar el método `call` para ejecutar clases seed adicionales. Usar el método `call` te permite separar la alimentación de tu base de datos en varios archivos con el propósito de que no exista la clase seeder única que  se vuelva sobrecargadamente grande. Pasa el nombre de la clase seeder que deseas ejecutar:

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

<a name="running-seeders"></a>
## Ejecutando Seeders

Una vez que hayas escrito tu seeder, puedes necesitar regenerar el cargador automático de Composer usando el comando `dump-autoload`:

    composer dump-autoload

Ahora puedes usar el comando Artisan `db:seed` para alimentar tu base de datos. De forma predeterminada, el comando `db:seed` ejecuta la clase `DatabaseSeeder`, la cual puede ser usada para ejecutar otras clases seed. Sin embargo, puedes usar la opción `--class` para especificar que una clase seeder en específico se ejecute individualmente:

    php artisan db:seed

    php artisan db:seed --class=UsersTableSeeder

También puedes alimentar tu base de datos usando el comando `migrate:refresh`, el cual también deshará y volverá a ejecutar tods tus migraciones. Este comando es útil para reconstruir tu base de datos completamente:

    php artisan migrate:refresh --seed
