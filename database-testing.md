# Pruebas de Base de Datos

- [Introducción](#introduction)
- [Generando Fábricas](#generating-factories)
- [Reinicializando la Base de Datos Después de Cada Prueba](#resetting-the-database-after-each-test)
- [Escribiendo Fábricas](#writing-factories)
    - [Estados de Fábrica](#factory-states)
- [Usando Fábricas](#using-factories)
    - [Creando Modelos](#creating-models)
    - [Persistiendo Modelos](#persisting-models)
    - [Relaciones](#relationships)
- [Aserciones Disponibles](#available-assertions)

<a name="introduction"></a>
## Introducción

Laravel proporciona una variedad de herramientas útiles para hacer que sea más fácil probar tus aplicaciones que manejan base de datos. Primero, puedes usar el helper `assertDatabaseHas` para comprobar que datos existen en la base de datos que coinciden con un conjunto dado de criterios. Por ejemplo, si quisieras verificar que hay un registro en la tabla `users` con el valor `email` de `sally@example.com`, puedes hacer lo siguiente:

    public function testDatabase()
    {
        // Make call to application...

        $this->assertDatabaseHas('users', [
            'email' => 'sally@example.com'
        ]);
    }

También podrías usar el helper `assertDatabaseMissing` para comprobar que esos datos no existen en la base de datos.

Ciertamente, el método `assertDatabaseHas` y otros helpers como este son convenientes. Eres libre de usar cualquiera de los métodos de aserción integrados de PHPUnit para complementar tus pruebas.

<a name="generating-factories"></a>
## Generating Fábricas

Para crear una fábrica, usa el [comando Artisan](/docs/{{version}}/artisan) `make:factory`:

    php artisan make:factory PostFactory

La nueva fábrica será colocada en tu directorio `database/factories`.

La opción `--model` puede ser usada para indicar el nombre del modelo creado por la fábrica. Esta opción pre-rellenará el archivo de fábrica generada con el modelo dado:

    php artisan make:factory PostFactory --model=Post

<a name="resetting-the-database-after-each-test"></a>
## Reinicializando la Base de Datos Después de Cada Prueba

Con frecuencia es útil reinicializar tu base de datos después de cada prueba de modo que los datos de una prueba previa no interfieran con las pruebas subsecuentes. La característica `RefreshDatabase` lleva al enfoque más óptimo para migrar tu prueba de base de datos dependiendo de si estás usando una base de datos en-memoria o una base de datos tradicional. Usa la característica en tu clase de prueba y todas las cosas serán manejadas por ti:

    <?php

    namespace Tests\Feature;

    use Tests\TestCase;
    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Illuminate\Foundation\Testing\WithoutMiddleware;

    class ExampleTest extends TestCase
    {
        use RefreshDatabase;

        /**
         * A basic functional test example.
         *
         * @return void
         */
        public function testBasicExample()
        {
            $response = $this->get('/');

            // ...
        }
    }

<a name="writing-factories"></a>
## Escribiendo Fábricas

Al momento de probar, puedes necesitar insertar unos pocos registros dentro de tu base de datos antes de ejecutar tu prueba. En lugar de especificar manualmente el valor de cada columna cuando crees estos datos de prueba, Laravel permite que definas un conjunto de atributos predeterminados para cada uno de tus [modelos de Eloquent](/docs/{{version}}/eloquent) usando fábricas de modelos. Para empezar, echemos un vistazo al archivo `database/factories/UserFactory.php` en tu aplicación. De forma predeterminada, este archivo contiene una definición de fábrica:

    use Faker\Generator as Faker;

    $factory->define(App\User::class, function (Faker $faker) {
        return [
            'name' => $faker->name,
            'email' => $faker->unique()->safeEmail,
            'password' => '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', // secret
            'remember_token' => str_random(10),
        ];
    });

Dentro de la Closure, la cual sirve como la definición de la fábrica, puedes devolver los valores de prueba predeterminados de todos los atributos del modelo. La Closure recibirá una instancia de la librería PHP [Faker](https://github.com/fzaninotto/Faker), la cual permitirá que generes convenientemente varias clases de datos aleatorios para prueba.

También puedes crear archivos de fábricas adicionales para cada modelo para una mejor organización. Por ejemplo, podrías crear archivos `UserFactory.php` y `CommentFactory.php` dentro de tu directorio `database/factories`. Todos los archivos dentro del directorio `factories` serán cargados automáticamente por Laravel.

<a name="factory-states"></a>
### Estados de Fábrica

Los estados permiten que definas modificaciones independientes que pueden ser aplicadas a tus fábricas de modelos en cualquier combinación. Por ejemplo, tu modelo `User` podría tener un estado `delinquent` que modifica uno de sus valores de atributo predeterminados. Puedes definir tus transformaciones de estado usando el método `state`. Para estados básicos, puedes pasar un arreglo de modificaciones de atributo:

    $factory->state(App\User::class, 'delinquent', [
        'account_status' => 'delinquent',
    ]);

Si tu estado requiere cálculo o una instancia `$faker`, puedes usar una Closure para calcular las modificaciones de atributos de estado:

    $factory->state(App\User::class, 'address', function ($faker) {
        return [
            'address' => $faker->address,
        ];
    });

<a name="using-factories"></a>
## Usando Fábricas

<a name="creating-models"></a>
### Creando Modelos

Una vez que has definido tus fábricas, puedes usar la función global `factory` en tus pruebas o alimentar archivos para generar instancias de modelo. Así, vamos a echar un vistazo en unos pocos ejemplos de creación de modelos. Primero, usaremos el método `make` para crear modelos pero sin guardarlos en la base de datos:

    public function testDatabase()
    {
        $user = factory(App\User::class)->make();

        // Use model in tests...
    }

También puedes crear una Colección de muchos modelos o crear modelos de un tipo dado:

    // Create three App\User instances...
    $users = factory(App\User::class, 3)->make();

#### Aplicando Estados

También puedes aplicar cualquiera de tus [estados](#factory-states) a los modelos. Si prefieres aplicar múltiples transformaciones de estado a los modelos, deberías especificar el nombre de cada estado que quisieras aplicar:

    $users = factory(App\User::class, 5)->states('delinquent')->make();

    $users = factory(App\User::class, 5)->states('premium', 'delinquent')->make();

#### Sobreescribiendo Atributos

Si prefieres sobreescribir algunos de los valores predeterminados de tus modelos, puedes pasar un arreglo de valores al método `make`. Solamente, los valores especificados serán reemplazados mientras que el resto de los valores permanecerán con sus valores predeterminados como se especificó en la fábrica:

    $user = factory(App\User::class)->make([
        'name' => 'Abigail',
    ]);

<a name="persisting-models"></a>
### Persistiendo Modelos

El método `create` no solamente crea las instancias de modelo sino que también los almacena en la base de datos usando el método `save` de Eloquent:

    public function testDatabase()
    {
        // Create a single App\User instance...
        $user = factory(App\User::class)->create();

        // Create three App\User instances...
        $users = factory(App\User::class, 3)->create();

        // Use model in tests...
    }

Puedes sobreescribir atributos en el modelo al pasar un arreglo al método `create`:

    $user = factory(App\User::class)->create([
        'name' => 'Abigail',
    ]);

<a name="relationships"></a>
### Relaciones

En este ejemplo, adjuntaremos una relación para algunos modelos creados. Al momento de usar el método `create` para crear múltiples modelos, una [instancia de colección](/docs/{{version}}/eloquent-collections) de Eloquent es devuelta, permitiendo que uses cualquiera de las funciones convenientes proporcionadas por la colección, tales como `each`:

    $users = factory(App\User::class, 3)
               ->create()
               ->each(function ($u) {
                    $u->posts()->save(factory(App\Post::class)->make());
                });

#### Relaciones & Closures de Atributos

También puedes adjuntar relaciones a los modelos usando atributos Closure en tus definiciones de fábrica. Por ejemplo, si prefieres crear una nueva instancia `User` al momento de crear un `Post`, puedes hacer lo siguiente:

    $factory->define(App\Post::class, function ($faker) {
        return [
            'title' => $faker->title,
            'content' => $faker->paragraph,
            'user_id' => function () {
                return factory(App\User::class)->create()->id;
            }
        ];
    });

Estas Closures también reciben el arreglo de atributos evaluados de la fábrica que los define:

    $factory->define(App\Post::class, function ($faker) {
        return [
            'title' => $faker->title,
            'content' => $faker->paragraph,
            'user_id' => function () {
                return factory(App\User::class)->create()->id;
            },
            'user_type' => function (array $post) {
                return App\User::find($post['user_id'])->type;
            }
        ];
    });

<a name="available-assertions"></a>
## Aserciones Disponibles

Laravel proporciona varias aserciones de base de datos para tus pruebas [PHPUnit](https://phpunit.de/):

Método  | Descripción
------------- | -------------
`$this->assertDatabaseHas($table, array $data);`  |  Comprueba que una tabla en la base de datos contiene los datos dados.
`$this->assertDatabaseMissing($table, array $data);`  |  Comprueba que una tabla en la base de datos no contiene los datos dados.
`$this->assertSoftDeleted($table, array $data);`  |  Comprueba que el registro dado ha sido borrado lógicamente.

