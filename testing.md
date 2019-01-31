# Pruebas: Primeros Pasos

- [Introducción](#introduction)
- [Entorno](#environment)
- [Creando y Ejecutando Pruebas](#creating-and-running-tests)

<a name="introduction"></a>
## Introducción

Laravel está construido con las pruebas en mente. De hecho, el soporte para pruebas con PHPUnit es incluido de forma predeterminada y un archivo `phpunit.xml` ya está configurado para tu aplicación. El framework también viene con métodos de ayuda convenientes que permiten que pruebes tus aplicaciones expresivamente.

De forma predeterminada, el directorio `tests` de tu aplicación contiene dos directorios: `Feature` e `Unit`. Las pruebas unitarias (Unit) son pruebas que se enfocan en una muy pequeña, porción aislada de tu código. De hecho, la mayoría de las pruebas unitarias se enfocan probablemente en un solo método. Las pruebas funcionales (Feature) pueden probar una porción más grande de tu código, incluyendo la forma como varios objetos interactúan entre sí e incluso una solicitud HTTP completa para un endpoint de JSON.

Un archivo `ExampleTest.php` es proporcionado en ambos directorios de prueba `Feature` e `Unit`. Después de instalar una nueva aplicación de Laravel, ejecuta `phpunit` en la línea de comandos para ejecutar tus pruebas.

<a name="environment"></a>
## Entorno

Al momento de ejecutar las pruebas por medio de `phpunit`, Laravel establecerá automáticamente el entorno de configuración a `testing` debido a las variables de entorno definidas en el archivo `phpunit.xml`. Laravel también configura automáticamente la sesión y cache del manejador `array` al momento de las pruebas, significa que ninguna sesión o cache de datos será conservada mientras se prueba.

Eres libre de definir otros valores de configuración del entorno de pruebas cuando sea necesario. Las variables de entorno `testing` pueden ser configuradas en el archivo `phpunit.xml`, pero ¡asegurate de limpiar tu cache de configuración usando el comando Artisan `config:clear` antes de ejecutar tus pruebas!

<a name="creating-and-running-tests"></a>
## Creando y Ejecutando Pruebas

Para crear un nuevo caso de prueba, usa el comando Artisan `make:test`:

    // Create a test in the Feature directory...
    php artisan make:test UserTest

    // Create a test in the Unit directory...
    php artisan make:test UserTest --unit

Una vez que la prueba ha sido generada, puedes definir métodos de pruebas como lo harías normalmente usando PHPUnit. Para ejecutar tus pruebas, ejecuta el comando `phpunit` desde tu terminal:

    <?php

    namespace Tests\Unit;

    use Tests\TestCase;
    use Illuminate\Foundation\Testing\RefreshDatabase;

    class ExampleTest extends TestCase
    {
        /**
         * A basic test example.
         *
         * @return void
         */
        public function testBasicTest()
        {
            $this->assertTrue(true);
        }
    }

> {note} Si defines tu propio método `setUp` dentro de una clase de prueba, asegurate de ejecutar `parent::setUp()`.