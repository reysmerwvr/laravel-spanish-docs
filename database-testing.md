::: v-pre

# Pruebas de Base de Datos

- [Introducción](#introduction)
- [Generando Factories](#generating-factories)
- [Reinicializando la Base de Datos Después de Cada Prueba](#resetting-the-database-after-each-test)
- [Escribiendo Factories](#writing-factories)
    - [Estados de un Factory](#factory-states)
    - [LLamadas de retorno de un Factory](#factory-callbacks)
- [Usando Factories](#using-factories)
    - [Creando Modelos](#creating-models)
    - [Persistiendo Modelos](#persisting-models)
    - [Relaciones](#relationships)
- [Aserciones Disponibles](#available-assertions)

<a name="introduction"></a>
## Introducción

Laravel proporciona una variedad de herramientas útiles para hacer que sea más fácil probar tus aplicaciones que manejan base de datos. Primero, puedes usar el método (helper) `assertDatabaseHas` para comprobar que los datos existentes en la base de datos coinciden con un conjunto dado de criterios. Por ejemplo, si quisieras verificar que hay un registro en la tabla `users` con el valor `email` de `sally@example.com`, puedes hacer lo siguiente:

```php
public function testDatabase()
{
    // Make call to application...

    $this->assertDatabaseHas('users', [
        'email' => 'sally@example.com'
    ]);
}
```

También podrías usar el método `assertDatabaseMissing` para comprobar que esos datos no existen en la base de datos.

El método `assertDatabaseHas` y otros métodos como éste son por conveniencia. Eres libre de usar cualquiera de los métodos de aserción de PHPUnit integrados para complementar tus pruebas.

<a name="generating-factories"></a>
## Generando Factories

Para crear un factory, usa el [comando Artisan](/docs/{{version}}/artisan) `make:factory`:

```php
php artisan make:factory PostFactory
```

El nuevo factory será colocado en tu directorio `database/factories`.

La opción `--model` puede ser usada para indicar el nombre del modelo creado por el factory. Esta opción pre-rellenará el archivo de factory generado con el modelo dado:

```php
php artisan make:factory PostFactory --model=Post
```

<a name="resetting-the-database-after-each-test"></a>
## Reinicializando la Base de Datos Después de Cada Prueba

Con frecuencia es útil reinicializar tu base de datos después de cada prueba de modo que los datos de una prueba previa no interfieran con las pruebas subsecuentes. El trait `RefreshDatabase` toma el enfoque más óptimo para migrar tu base de datos de pruebas, dependiendo de si estás usando una base de datos en memoria o una base de datos tradicional. Usa el trait en tu clase de prueba y todo será manejado por ti:

```php
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
```

<a name="writing-factories"></a>
## Escribiendo Factories

Al momento de probar, puedes necesitar insertar unos pocos registros dentro de tu base de datos antes de ejecutar tu prueba. En lugar de especificar manualmente el valor de cada columna cuando crees estos datos de prueba, Laravel permite que definas un conjunto de atributos predeterminados para cada uno de tus [modelos de Eloquent](/docs/{{version}}/eloquent) usando factories de modelos. Para empezar, echemos un vistazo al archivo `database/factories/UserFactory.php` en tu aplicación. De forma predeterminada, este archivo contiene una definición de factory:

```php
use Illuminate\Support\Str;
use Faker\Generator as Faker;

$factory->define(App\User::class, function (Faker $faker) {
    return [
        'name' => $faker->name,
        'email' => $faker->unique()->safeEmail,
        'email_verified_at' => now(),
        'password' => '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', // secret
        'remember_token' => Str::random(10),
    ];
});
```

Dentro del Closure, la cual sirve como la definición del factory, puedes devolver los valores de prueba predeterminados de todos los atributos del modelo. El Closure recibirá una instancia de la biblioteca PHP [Faker](https://github.com/fzaninotto/Faker), la cual permitirá que generes convenientemente varios tipos de datos aleatorios para las pruebas.

También puedes crear archivos de factories adicionales para cada modelo para una mejor organización. Por ejemplo, podrías crear archivos `UserFactory.php` y `CommentFactory.php` dentro de tu directorio `database/factories`. Todos los archivos dentro del directorio `factories` serán cargados automáticamente por Laravel.

::: tip
Puedes establecer la configuración regional de Faker agregando una opción `faker_locale` a tu archivo de configuración` config/app.php`.
:::

<a name="factory-states"></a>
### Estados de un Factory

Los estados te permiten definir modificaciones discretas que pueden ser aplicadas a tus factories de modelos en cualquier combinación. Por ejemplo, tu modelo `User` podría tener un estado `delinquent` que modifique uno de sus valores de atributo predeterminados. Puedes definir tus transformaciones de estado usando el método `state`. Para estados simples, puedes pasar un arreglo de modificaciones de atributos:

```php
$factory->state(App\User::class, 'delinquent', [
    'account_status' => 'delinquent',
]);
```

Si tu estado requiere cálculo o una instancia `$faker`, puedes usar un Closure para calcular las modificaciones de los atributos del estado:

```php
$factory->state(App\User::class, 'address', function ($faker) {
    return [
        'address' => $faker->address,
    ];
});
```

<a name="factory-callbacks"></a>
### LLamadas de retorno de un Factory

Las llamadas de retorno de un Factory son registradas usando los métodos `afterMaking` y `afterCreating` y te permiten realizar tareas adicionales de hacer o crear un modelo. Por ejemplo, puedes usar llamadas de retorno para relacionar modelos adicionales con el modelo creado:

```php
$factory->afterMaking(App\User::class, function ($user, $faker) {
    // ...
});

$factory->afterCreating(App\User::class, function ($user, $faker) {
    $user->accounts()->save(factory(App\Account::class)->make());
});
```

También puedes definir llamadas de retorno para [estados de un factory](#factory-states):

```php
$factory->afterMakingState(App\User::class, 'delinquent', function ($user, $faker) {
    // ...
});

$factory->afterCreatingState(App\User::class, 'delinquent', function ($user, $faker) {
    // ...
});
```

<a name="using-factories"></a>
## Usando Factories

<a name="creating-models"></a>
### Creando Modelos

Una vez que has definido tus factories, puedes usar la función global `factory` en tus pruebas o en archivos seeder para generar instancias de un modelo. Así, vamos a echar un vistazo en unos pocos ejemplos de creación de modelos. Primero, usaremos el método `make` para crear modelos pero sin guardarlos en la base de datos:

```php
public function testDatabase()
{
    $user = factory(App\User::class)->make();

    // Use model in tests...
}
```

También puedes crear una colección de muchos modelos o crear modelos de un tipo dado:

```php
// Create three App\User instances...
$users = factory(App\User::class, 3)->make();
```

#### Aplicando Estados

También puedes aplicar cualquiera de tus [estados](#factory-states) a los modelos. Si prefieres aplicar múltiples transformaciones de estado a los modelos, deberías especificar el nombre de cada estado que quisieras aplicar:

```php
$users = factory(App\User::class, 5)->states('delinquent')->make();

$users = factory(App\User::class, 5)->states('premium', 'delinquent')->make();
```

#### Sobrescribiendo Atributos

Si prefieres sobreescribir algunos de los valores predeterminados de tus modelos, puedes pasar un arreglo de valores al método `make`. Solamente, los valores especificados serán reemplazados mientras que el resto de los valores permanecerán con sus valores predeterminados cómo se especificó en el factory:

```php
$user = factory(App\User::class)->make([
    'name' => 'Abigail',
]);
```

<a name="persisting-models"></a>
### Persistiendo Modelos

El método `create` no solamente crea las instancias de un modelo sino que también los almacena en la base de datos usando el método `save` de Eloquent:

```php
public function testDatabase()
{
    // Create a single App\User instance...
    $user = factory(App\User::class)->create();

    // Create three App\User instances...
    $users = factory(App\User::class, 3)->create();

    // Use model in tests...
}
```

Puedes sobrescribir atributos en el modelo al pasar un arreglo al método `create`:

```php
$user = factory(App\User::class)->create([
    'name' => 'Abigail',
]);
```

<a name="relationships"></a>
### Relaciones

En este ejemplo, adjuntaremos una relación para algunos modelos creados. Al momento de usar el método `create` para crear múltiples modelos, una [instancia de colección](/docs/{{version}}/eloquent-collections) de Eloquent es devuelta, permitiendo que uses cualquiera de las funciones convenientes proporcionadas por la colección, tales como `each`:

```php
$users = factory(App\User::class, 3)
            ->create()
            ->each(function ($user) {
                $user->posts()->save(factory(App\Post::class)->make());
            });
```

#### Relaciones y Closures de Atributos

También puedes adjuntar relaciones a los modelos usando atributos de Closure en tus definiciones del factory. Por ejemplo, si prefieres crear una nueva instancia `User` al momento de crear un `Post`, puedes hacer lo siguiente:

```php
$factory->define(App\Post::class, function ($faker) {
    return [
        'title' => $faker->title,
        'content' => $faker->paragraph,
        'user_id' => function () {
            return factory(App\User::class)->create()->id;
        }
    ];
});
```

Estas Closures también reciben el arreglo de atributos evaluados del factory que los define:

```php
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
```

<a name="available-assertions"></a>
## Aserciones Disponibles

Laravel proporciona varias aserciones de base de datos para tus pruebas [PHPUnit](https://phpunit.de/):

Método  | Descripción
------------- | -------------
`$this->assertDatabaseHas($table, array $data);`  |  Comprueba que una tabla en la base de datos contiene los datos dados.
`$this->assertDatabaseMissing($table, array $data);`  |  Comprueba que una tabla en la base de datos no contiene los datos dados.
`$this->assertSoftDeleted($table, array $data);`  |  Comprueba que el registro dado ha sido borrado lógicamente.