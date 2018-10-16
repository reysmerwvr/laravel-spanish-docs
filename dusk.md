# Browser Tests (Laravel Dusk)

- [Introducción](#introduction)
- [Instalación](#installation)
    - [Usando Otros Navegadores](#using-other-browsers)
- [Primeros Pasos](#getting-started)
    - [Generando Pruebas](#generating-tests)
    - [Ejecutar Pruebas](#running-tests)
    - [Manejo de Entorno](#environment-handling)
    - [Creando Navegadores](#creating-browsers)
    - [Autenticación](#authentication)
    - [Migraciones de Base de Datos](#migrations)
- [Interactuando con Elementos](#interacting-with-elements)
    - [Selectores de Dusk](#dusk-selectors)
    - [Clickeando Enlaces](#clicking-links)
    - [Texto, Valores & Atributos](#text-values-and-attributes)
    - [Usando Formularios](#using-forms)
    - [Adjuntando Archivos](#attaching-files)
    - [Usando el Teclado](#using-the-keyboard)
    - [Usando el Ratón](#using-the-mouse)
    - [Estableciendo el Alcance de los Selectores](#scoping-selectors)
    - [Esperando por Elementos](#waiting-for-elements)
    - [Haciendo Aserciones de Vue](#making-vue-assertions)
- [Aserciones Disponibles](#available-assertions)
- [Páginas](#pages)
    - [Generando Páginas](#generating-pages)
    - [Configurando Páginas](#configuring-pages)
    - [Visitando Páginas](#navigating-to-pages)
    - [Selectores Abreviados](#shorthand-selectors)
    - [Métodos de Página](#page-methods)
- [Componentes](#components)
    - [Generando Componentes](#generating-components)
    - [Usando Componentes](#using-components)
- [Integración Continua](#continuous-integration)
    - [Travis CI](#running-tests-on-travis-ci)
    - [CircleCI](#running-tests-on-circle-ci)
    - [Codeship](#running-tests-on-codeship)

<a name="introduction"></a>
## Introducción

Laravel Dusk proporciona una API de automatización y prueba para navegador, expresivo y fácil de usar. De forma predeterminada Dusk no requiere que instales JDK o Selenium en tu máquina. En su lugar, Dusk usa una instalación de [ChromeDriver](https://sites.google.com/a/chromium.org/chromedriver/home) independiente. Sin embargo, siéntete libre de utilizar cualquier otro driver compatible con Selenium que desees.

<a name="installation"></a>
## Instalación

Para empezar, debes agregar la dependencia de Composer `laravel/dusk` a tu proyecto:

    composer require --dev laravel/dusk

Una vez que Dusk sea instalado, debes registrar el proveedor de servicio `Laravel\Dusk\DuskServiceProvider`. Típicamente, esto será hecho por el registro automático de proveedores de servicios de Laravel.

> {note} Si estás registrando manualmente el proveedor de servicio de Dusk, **nunca** deberías registrarlo en tu entorno de producción, ya que hacerlo así podría conducir a que usuarios arbitrarios sean capaces de autenticarse en tu aplicación.

Después de la instalación del paquete Dusk, ejecuta el comando Artisan `dusk:install`:

    php artisan dusk:install

Un directorio `Browser` será creado dentro de tu directorio `tests` y contendrá una prueba de ejemplo. Seguido, establece la variable de entorno `APP_URL` en tu archivo `.env`. Este valor debería coincidir con la URL que uses para acceder a tu aplicación en un navegador.

Para ejecutar tus pruebas, usa el comando de Artisan `dusk`. El comando `dusk` acepta cualquier argumento que también sea aceptado por el comando `phpunit`:

    php artisan dusk

<a name="using-other-browsers"></a>
### Usando Otros Navegadores

De forma predeterminada, Dusk usa Google Chrome y una instalación de [ChromeDriver](https://sites.google.com/a/chromium.org/chromedriver/home) independiente para ejecutar tus pruebas de navegador. Sin embargo, puedes iniciar tu propio servidor Selenium y ejecutar tus pruebas en cualquier navegador que desees.

Para empezar, abre tu archivo `tests/DuskTestCase.php`, el cual es el caso de prueba de Dusk básico para tu aplicación. Dentro de este archivo, puedes remover la ejecución del método `startChromeDriver`. Esto evitará que Dusk inicie automáticamente ChromeDriver:

    /**
     * Prepare for Dusk test execution.
     *
     * @beforeClass
     * @return void
     */
    public static function prepare()
    {
        // static::startChromeDriver();
    }

Luego de esto, puedes modificar el método `driver` para conectar a la URL y puerto de tu preferencia. Además, puedes modificar las "capacidades deseadas" que deberían ser pasadas al WebDriver:

    /**
     * Create the RemoteWebDriver instance.
     *
     * @return \Facebook\WebDriver\Remote\RemoteWebDriver
     */
    protected function driver()
    {
        return RemoteWebDriver::create(
            'http://localhost:4444/wd/hub', DesiredCapabilities::phantomjs()
        );
    }

<a name="getting-started"></a>
## Primeros Pasos

<a name="generating-tests"></a>
### Generando Pruebas

Para generar una prueba de Dusk, usa el comando de Artisan `dusk:make`. La prueba generada será colocada en el directorio `tests/Browser`:

    php artisan dusk:make LoginTest

<a name="running-tests"></a>
### Ejecutando Pruebas

Para ejecutar tus pruebas de navegador, usa el comando Artisan `dusk`:

    php artisan dusk

El comando `dusk` acepta cualquier argumento que sea aceptado normalmente por el administrador de pruebas de PHPUnit, permitiendo que ejecutes solamente las pruebas para un [grupo](https://phpunit.de/manual/current/en/appendixes.annotations.html#appendixes.annotations.group) dado, etc:

    php artisan dusk --group=foo

#### Iniciando Manualmente ChromeDriver

De forma predeterminada, Dusk intentará automáticamente iniciar ChromeDriver. Si esto no funciona para tu sistema en particular, puedes iniciar manualmente ChromeDriver antes de ejecutar el comando `dusk`. Si eliges iniciar manualmente ChromeDriver, debes comentar la siguiente línea de tu archivo `tests/DuskTestCase.php`:

    /**
     * Prepare for Dusk test execution.
     *
     * @beforeClass
     * @return void
     */
    public static function prepare()
    {
        // static::startChromeDriver();
    }

Además, si inicias ChromeDriver en un puerto diferente a 9515, deberías modificar el método `driver` de la misma clase:

    /**
     * Create the RemoteWebDriver instance.
     *
     * @return \Facebook\WebDriver\Remote\RemoteWebDriver
     */
    protected function driver()
    {
        return RemoteWebDriver::create(
            'http://localhost:9515', DesiredCapabilities::chrome()
        );
    }

<a name="environment-handling"></a>
### Manejo de Entorno

Para forzar que Dusk use su propio archivo de entorno al momento de ejecutar las pruebas, crea un archivo `.env.dusk.{environment}` en el directorio raíz de tu proyecto. Por ejemplo, si estás iniciando el comando `dusk` desde tu entorno `local`, deberías crear un archivo `.env.dusk.local`.

Al momento de ejecutar pruebas, Dusk respaldará tu archivo `.env` y renombrará tu entorno Dusk a `.env`. Una vez que las pruebas han sido completadas, tu archivo `.env` será restaurado.

<a name="creating-browsers"></a>
### Creando Navegadores

Para empezar, vamos a escribir una prueba que verifica que podemos entrar a nuestra aplicación. Después de generar una prueba, podemos modificarla para visitar la página de login, introducir algunas credenciales y presionar el botón "Login". Para crear una instancia del navegador, ejecuta el método `browse`:

    <?php

    namespace Tests\Browser;

    use App\User;
    use Tests\DuskTestCase;
    use Laravel\Dusk\Chrome;
    use Illuminate\Foundation\Testing\DatabaseMigrations;

    class ExampleTest extends DuskTestCase
    {
        use DatabaseMigrations;

        /**
         * A basic browser test example.
         *
         * @return void
         */
        public function testBasicExample()
        {
            $user = factory(User::class)->create([
                'email' => 'taylor@laravel.com',
            ]);

            $this->browse(function ($browser) use ($user) {
                $browser->visit('/login')
                        ->type('email', $user->email)
                        ->type('password', 'secret')
                        ->press('Login')
                        ->assertPathIs('/home');
            });
        }
    }

Como puedes ver en el ejemplo anterior, el método `browse` acepta una función callback. Una instancia de navegador será pasada automáticamente a esta función de retorno por Dusk y es el objeto principal usado para interactuar con y hacer aserciones contra tu aplicación.

> {tip} Esta prueba puede ser usada para probar la pantalla login generada por el comando Artisan `make:auth`.

#### Creando Múltiples Navegadores

Algunas veces puedes necesitar múltiples navegadores con el propósito de llevar apropiadamente una prueba. Por ejemplo, múltiples navegadores pueden ser necesitados para probar una pantalla de conversaciones que interactúa con websockets. Para crear múltiples navegadores, "pregunta" por más de un navegador en la firma de la función de retorno dada al método `browse`:

    $this->browse(function ($first, $second) {
        $first->loginAs(User::find(1))
              ->visit('/home')
              ->waitForText('Message');

        $second->loginAs(User::find(2))
               ->visit('/home')
               ->waitForText('Message')
               ->type('message', 'Hey Taylor')
               ->press('Send');

        $first->waitForText('Hey Taylor')
              ->assertSee('Jeffrey Way');
    });

#### Redimensionando las Ventanas del Navegador

Puedes usar el método `resize` para ajustar el tamaño de la ventana del navegador:

    $browser->resize(1920, 1080);

El método `maximize` puede ser usado para maximizar la ventana del navegador:

    $browser->maximize();

<a name="authentication"></a>
### Autenticación

Frecuentemente, estarás probando páginas que requieren autenticación. Puedes usar el método `loginAs` de Dusk con el propósito de evitar interactuar con la pantalla de login durante cada prueba. El método `loginAs` acepta un ID de usuario o una instancia de modelo de usuario:

    $this->browse(function ($first, $second) {
        $first->loginAs(User::find(1))
              ->visit('/home');
    });

> {note} Después de usar el método `loginAs`, la sesión de usuario será mantenida para todas las pruebas dentro del archivo.

<a name="migrations"></a>
### Migraciones de Bases de Datos

Cuando tu prueba requiere migraciones, como el ejemplo de autenticación visto antes, nunca deberías usar la característica `RefreshDatabase`. La característica `RefreshDatabase` influye sobre las transacciones de base de datos las cuales no serán aplicables a traves de las solicitudes HTTP. En su lugar, usa la característica `DatabaseMigrations`:

    <?php

    namespace Tests\Browser;

    use App\User;
    use Tests\DuskTestCase;
    use Laravel\Dusk\Chrome;
    use Illuminate\Foundation\Testing\DatabaseMigrations;

    class ExampleTest extends DuskTestCase
    {
        use DatabaseMigrations;
    }

<a name="interacting-with-elements"></a>
## Interactuando con Elementos

<a name="dusk-selectors"></a>
### Selectores de Dusk

Elegir buenos selectores CSS para interactuar con elementos es una de las partes más difíciles de escribir las pruebas de Dusk. Con el tiempo, los cambios del diseño frontend pueden causar que los selectores CSS como los siguientes dañen tus pruebas:

    // HTML...

    <button>Login</button>

    // Test...

    $browser->click('.login-page .container div > button');

Los selectores de Dusk permiten que te enfoques en la escritura de pruebas efectivas en vez de recordar selectores CSS. Para definir un selector, agrega un atributo `dusk` a tu elemento HTML. Después, agrega un prefijo al selector con `@` para manipular el elemento conectado dentro de una prueba de Dusk:

    // HTML...

    <button dusk="login-button">Login</button>

    // Test...

    $browser->click('@login-button');

<a name="clicking-links"></a>
### Clickeando Enlaces

Para hacer click sobre un enlace, puedes usar el método `clickLink` en la instancia del navegador. El método `clickLink` clickeará el enlace que tiene el texto dado en la pantalla:

    $browser->clickLink($linkText);

> {note} Este método interactúa con jQuery. Si jQuery no está disponible en la página, Dusk lo inyectará automáticamente de modo que esté disponible por la duración de la prueba.

<a name="text-values-and-attributes"></a>
### Texto, Valores, & Atributos

#### Obteniendo & Estableciendo Valores

Dusk proporciona varios métodos para interactuar con el texto de pantalla actual, valor y atributos de elementos en la página. Por ejemplo, para obtener el "valor" de un elemento que coincida con un selector dado, usa el método `value`:

    // Retrieve the value...
    $value = $browser->value('selector');

    // Set the value...
    $browser->value('selector', 'value');

#### Obteniendo Texto

El método `text` puede ser usado para obtener el texto de pantalla de un elemento que coincida con el selector dado:

    $text = $browser->text('selector');

#### Obteniendo Atributos

Finalmente, el método `attribute` puede ser usado para obtener un atributo de un elemento que coincida con el selector dado:

    $attribute = $browser->attribute('selector', 'value');

<a name="using-forms"></a>
### Usando Formularios

#### Especificando los Tipos de Valores

Dusk proporciona una variedad de métodos para interactuar con formularios y elementos de entrada. Primero, vamos a echar un vistazo a un ejemplo de tipear texto dentro de un campo de entrada:

    $browser->type('email', 'taylor@laravel.com');

Nota que, aunque el método acepta uno si es necesario, no estamos obligados a pasar un selector CSS dentro del método `type`. Si un selector CSS no es proporcionado, Dusk buscará un campo de entrada con el atributo `name` dado. Finalmente, Dusk intentará encontrar una `textarea` con el atributo `name` dado.

Para agregar texto a un campo sin limpiar su contenido, puedes usar el método `append`

    $browser->type('tags', 'foo')
            ->append('tags', ', bar, baz');

Puedes limpiar el valor de un campo usando el método `clear`:

    $browser->clear('email');

#### Listas Desplegables

Para seleccionar un valor en un cuadro de selección de lista desplegable, puedes usar el método `select`. Al momento de pasar un valor al método `select`, deberías pasar el valor de opción a resaltar en lugar del texto en pantalla:

    $browser->select('size', 'Large');

Puedes seleccionar una opción aleatoria al omitir el segundo parámetro:

    $browser->select('size');

#### Casillas de Verificación

Para "marcar" un campo de casilla de verificación, puedes usar el método `check`. Al igual que muchos otros métodos relacionados con entradas, un selector CSS completo no es obligatorio. Si un selector que coincida exactamente no puede ser encontrado, Dusk buscará una casilla de verificación con un atributo `name` coincidente.

    $browser->check('terms');

    $browser->uncheck('terms');

#### Botones de Radio

Para "seleccionar" una opción de botón de radio, puedes usar el método `radio`. Al igual que muchos otros métodos relacionados con campos, un selector CSS completo no es obligatorio. Si un selector que coincida exactamente no puede ser encontrado, Dusk buscará un radio con atributos `name` y `value` coincidentes:

    $browser->radio('version', 'php7');

<a name="attaching-files"></a>
### Adjuntando Archivos

El método `attach` puede ser usado para adjuntar un archivo a un elemento `file`. Al igual que muchos otros métodos relacionados con campos, un selector CSS completo no es obligatorio. Si un selector que coincida exactamente no puede ser encontrado, Dusk buscará un campo de archivo con atributo `name` coincidente:

    $browser->attach('photo', __DIR__.'/photos/me.png');

<a name="using-the-keyboard"></a>
### Usando el Teclado

El método `keys` permite que proporciones secuencias de entrada más complejas para un elemento dado que lo permitido normalmente por el método `type`. Por ejemplo, puedes mantener presionada las teclas modificadoras al introducir valores. En este ejemplo, la tecla `shift` será mantenida presionada mientras la palabra `taylor` es introducida dentro del elemento que coincida con el selector dado. Después de que la palabra `taylor` sea tipeada, la palabra `otwell` será tipeada sin alguna tecla modificadora:

    $browser->keys('selector', ['{shift}', 'taylor'], 'otwell');

Incluso puedes enviar una "tecla de función" al selector CSS principal que contiene tu aplicación:

    $browser->keys('.app', ['{command}', 'j']);

> {tip} Todas las teclas modificadoras se envuelven entre corchetes `{}` y coinciden con las constantes definidas en la clase `Facebook\WebDriver\WebDriverKeys`, la cual puede ser [encontrada en GitHub](https://github.com/facebook/php-webdriver/blob/community/lib/WebDriverKeys.php).

<a name="using-the-mouse"></a>
### Usando el Ratón

#### Clickeando sobre Elementos

El método `click` puede ser usado para "clickear" sobre un elemento que coincida con el selector dado:

    $browser->click('.selector');

#### Mouseover

El método `mouseover` puede ser usado cuando necesitas mover el ratón sobre un elemento que coincida con el selector dado:

    $browser->mouseover('.selector');

#### Arrastrar & Soltar

El método `drag` puede ser usado para arrastrar un elemento que coincida con el selector dado hasta otro elemento:

    $browser->drag('.from-selector', '.to-selector');

O, puedes arrastrar un elemento en una única dirección:

    $browser->dragLeft('.selector', 10);
    $browser->dragRight('.selector', 10);
    $browser->dragUp('.selector', 10);
    $browser->dragDown('.selector', 10);

<a name="scoping-selectors"></a>
### Estableciendo el Alcance de Selectores

Algunas veces puedes querer ejecutar varias operaciones al momento de establecer el alcance de todas las operaciones dentro de un selector dado. Por ejemplo, puedes querer comprobar que algunos textos existen unicamente dentro de una tabla y después presionar un botón dentro de la tabla. Puedes usar el método `with` para completar esta tarea. Todas las operaciones ejecutadas dentro de la función de retorno dada al método `with` serán establecidas con alcance al selector original:

    $browser->with('.table', function ($table) {
        $table->assertSee('Hello World')
              ->clickLink('Delete');
    });

<a name="waiting-for-elements"></a>
### Esperando por Elementos

Al momento de probar aplicaciones que usan extensivamente JavaScript, frecuentemente se vuelve necesario "esperar" por que ciertos elementos o datos estén disponibles antes de proceder con una prueba. Dusk hace esto fácilmente. Usando una variedad de métodos, puedes esperar que los elementos estén visibles en la página e incluso esperar hasta que una expresión de JavaScript dada se evalúe como `true`.

#### Esperando

Si necesitas pausar la prueba por un número de milisegundos dado, usa el método `pause`:

    $browser->pause(1000);

#### Esperando por Selectores

El método `waitFor` puede ser usado para pausar la ejecución de la prueba hasta que el elemento que coincida con el selector CSS dado sea mostrado en la página. De forma predeterminada, esto pausará la prueba por un máximo de cinco segundos antes de arrojar una excepción. Si es necesario, puedes pasar un umbral de tiempo de expiración personalizado como segundo argumento del método:

    // Wait a maximum of five seconds for the selector...
    $browser->waitFor('.selector');

    // Wait a maximum of one second for the selector...
    $browser->waitFor('.selector', 1);

También puedes esperar todo el tiempo que el selector dado esté faltando en la página:

    $browser->waitUntilMissing('.selector');

    $browser->waitUntilMissing('.selector', 1);

#### Estableciendo el Alcance de Selectores Cuando Estén Disponibles

Ocasionalmente, puedes querer esperar por un selector dado y después interactuar con el elemento que coincida con el selector. Por ejemplo, puedes querer esperar hasta que una ventana modal esté disponible y después presionar el botón "OK" dentro de esa ventana. El método `whenAvailable` puede ser usado en este caso. Todas las operaciones de elementos ejecutadas dentro de la función de retorno dada serán establecidas con alcance al selector original:

    $browser->whenAvailable('.modal', function ($modal) {
        $modal->assertSee('Hello World')
              ->press('OK');
    });

#### Esperando por Texto

El método `waitForText` puede ser usado para esperar hasta que el texto dado sea mostrado en la página:

    // Wait a maximum of five seconds for the text...
    $browser->waitForText('Hello World');

    // Wait a maximum of one second for the text...
    $browser->waitForText('Hello World', 1);

#### Esperando por Enlaces

El método `waitForLink` puede ser usado para esperar hasta que un enlace dado sea mostrada en la página:

    // Wait a maximum of five seconds for the link...
    $browser->waitForLink('Create');

    // Wait a maximum of one second for the link...
    $browser->waitForLink('Create', 1);

#### Esperando por la Localización de la Página

Al momento de hacer una comprobación de ruta tal como `$browser->assertPathIs('/home')`, la comprobación puede fallar si `window.location.pathname` está siendo actualizada asincrónicamente. Puedes usar el método `waitForLocation` para esperar por la localización que tenga un valor dado:

    $browser->waitForLocation('/secret');

#### Esperando por Recargas de Página

Si necesitas hacer aserciones después de que una página ha sido recargada, usa el método `waitForReload`:

    $browser->click('.some-action')
            ->waitForReload()
            ->assertSee('something');

#### Esperando por Expresiones de JavaScript

Algunas veces puedes querer pausar la ejecución de una prueba hasta que una expresión de JavaScript dada se evalúe a `true`. Puedes completar fácilmente esto usando el método `waitUntil`. Al momento de pasar una expresión a este método, no necesitas incluir la palabra clave `return` o un signo ortográfico de punto y coma:

    // Wait a maximum of five seconds for the expression to be true...
    $browser->waitUntil('App.dataLoaded');

    $browser->waitUntil('App.data.servers.length > 0');

    // Wait a maximum of one second for the expression to be true...
    $browser->waitUntil('App.data.servers.length > 0', 1);

#### Esperando por una Función de Retorno

Muchos de los métodos de "espera" en Dusk confían en el método `waitUsing` subyacente. Puedes usar este método directamente para esperar por una función de retorno dada que devuelva `true`. El método `waitUsing` acepta el máximo número de segundos para esperar la Closure, el intervalo en el cual la Closure debería ser evaluada y un mensaje opcional de falla:

    $browser->waitUsing(10, 1, function () use ($something) {
        return $something->isReady();
    }, "Something wasn't ready in time.");

<a name="making-vue-assertions"></a>
### Haciendo Aserciones de Vue

Inclusive Dusk permite que hagas comprobaciones en el estado de componente de datos de [Vue](https://vuejs.org). Por ejemplo, imagina que tu aplicación contiene el siguiente componente de Vue:

    // HTML...

    <profile dusk="profile-component"></profile>

    // Component Definition...

    Vue.component('profile', {
        template: '<div>{{ user.name }}</div>',

        data: function () {
            return {
                user: {
                  name: 'Taylor'
                }
            };
        }
    });

Puedes comprobar el estado del componente de Vue de esta manera:

    /**
     * A basic Vue test example.
     *
     * @return void
     */
    public function testVue()
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/')
                    ->assertVue('user.name', 'Taylor', '@profile-component');
        });
    }

<a name="available-assertions"></a>
## Aserciones Disponibles

Dusk proporciona una variedad de aserciones que puedes hacer en tu apliación. Todas las aserciones disponibles están documentadas en la tabla de abajo:

Aserción  | Descripción
------------- | -------------
`$browser->assertTitle($title)`  |  Comprueba que el título de la página coincida con el texto dado.
`$browser->assertTitleContains($title)`  |  Comprueba que el título de página contenga el texto dado.
`$browser->assertUrlIs($url)`  |  Comprueba que la URL actual (sin la cadena de consulta) coincida con la cadena dada.
`$browser->assertPathBeginsWith($path)`  |  Comprueba que la ruta de la URL actual comience con la ruta dada.
`$browser->assertPathIs('/home')`  |  Comprueba que la ruta actual coincida con la ruta dada.
`$browser->assertPathIsNot('/home')`  |  Comprueba que la ruta actual no coincida con la ruta dada.
`$browser->assertRouteIs($name, $parameters)`  |  Comprueba que la URL actual coincida con la URL de ruta nombrada dada.
`$browser->assertQueryStringHas($name, $value)`  |  Comprueba que el parámetro de cadena para una consulta dada está presente y tiene un valor dado.
`$browser->assertQueryStringMissing($name)`  |  Comprueba que el parámetro de cadena para una consulta dada está faltando.
`$browser->assertHasQueryStringParameter($name)`  |  Comprueba que el parámetro de cadena para una cadena dada está presente.
`$browser->assertHasCookie($name)`  |  Comprueba que el cookie dado está presente.
`$browser->assertCookieMissing($name)`  |  Comprueba que el cookie dado no está presente.
`$browser->assertCookieValue($name, $value)`  |  Comprueba que un cookie tenga un valor dado.
`$browser->assertPlainCookieValue($name, $value)`  |  Comprueba que un cookie desencriptado tenga un valor dado.
`$browser->assertSee($text)`  |  Comprueba que el texto dado está presente en la página.
`$browser->assertDontSee($text)`  |  Comprueba que el tengo dado no está presente en la página.
`$browser->assertSeeIn($selector, $text)`  |  Comprueba que el texto dado está presente dentro del selector.
`$browser->assertDontSeeIn($selector, $text)`  |  Comprueba que el texto dado no está presente dentro del selector.
`$browser->assertSourceHas($code)`  |  Comprueba que el código fuente dado está presente en la página.
`$browser->assertSourceMissing($code)`  |  Comprueba que el código fuente dado no está presente en la página.
`$browser->assertSeeLink($linkText)`  |  Comprueba que el enlace dado está presente en la página.
`$browser->assertDontSeeLink($linkText)`  |  Comprueba que el enlace dado no está presente en la página.
`$browser->assertInputValue($field, $value)`  |  Comprueba que el campo de entrada dado tiene el valor dado.
`$browser->assertInputValueIsNot($field, $value)`  |  Comprueba que el campo de entrada dado no tiene el valor dado.
`$browser->assertChecked($field)`  |  Comprueba que la casilla de verificación está marcada.
`$browser->assertNotChecked($field)`  |  Comprueba que la casilla de verificación no está marcada.
`$browser->assertRadioSelected($field, $value)`  |  Comprueba que el campo de radio está seleccionado.
`$browser->assertRadioNotSelected($field, $value)` |  Comprueba que el campo de radio no está seleccionado.
`$browser->assertSelected($field, $value)`  |  Comprueba que la lista desplegable tiene seleccionado el valor dado.
`$browser->assertNotSelected($field, $value)`  |  Comprueba que la lista desplegable no tiene seleccionado el valor dado.
`$browser->assertSelectHasOptions($field, $values)`  |  Comprueba que el arreglo dado de valores están disponibles para ser seleccionados.
`$browser->assertSelectMissingOptions($field, $values)`  |  Comprueba que el arreglo dado de valores no están disponibles para ser seleccionados.
`$browser->assertSelectHasOption($field, $value)`  |  Comprueba que el valor dado está disponible para ser seleccionado en el campo dado.
`$browser->assertValue($selector, $value)`  |  Comprueba que el elemento que coincida con el selector dado tenga el valor dado.
`$browser->assertVisible($selector)`  |  Comprueba que el elemento que coincida con el selector dado sea visible.
`$browser->assertMissing($selector)`  |  Comprueba que el elemento que coincida con el selector dado no sea visible.
`$browser->assertDialogOpened($message)`  |  Comprueba que un diálogo JavaScript con un mensaje dado ha sido abierto.
`$browser->assertVue($property, $value, $component)`  |  Comprueba que una propiedad de datos de un componente de Vue dado coincida con el valor dado.
`$browser->assertVueIsNot($property, $value, $component)`  |  Comprueba que una propiedad de datos de un componente de Vue dado no coincida con el valor dado.

<a name="pages"></a>
## Páginas

Alguna veces, las pruebas requieren que varias acciones complicadas sean ejecutadas en secuencia. Esto puede hacer tus pruebas más difíciles de leer y entender. Las páginas permiten que definas acciones expresivas que entonces pueden ser ejecutadas en una página dada usando un solo método. Las páginas también permiten que definas abreviaturas para selectores comunes para tu aplicación o una página única.

<a name="generating-pages"></a>
### Generando Páginas

Para generar un objeto de página, usa el comando Artisan `dusk:page`. Todos los objetos de página serán colocados en el directorio `tests/Browser/Pages`:

    php artisan dusk:page Login

<a name="configuring-pages"></a>
### Configurando Páginas

De forma predeterminada, las páginas tienen tres métodos: `url`, `assert`, y `elements`. Discutiremos los métodos `url` y `assert` ahora. El método `elements` será [discutido con más detalle debajo](#shorthand-selectors).

#### El método `url`

El método `url` debería devolver la ruta de la URL que representa la página. Dusk usará esta URL al momento de navegar a la página en el navegador:

    /**
     * Get the URL for the page.
     *
     * @return string
     */
    public function url()
    {
        return '/login';
    }

#### El método `assert`

El método `assert` puede hacer algunas aserciones necesarias para verificar que el navegador en realidad está en la página dada. Completar este método no es necesario; sin embargo, eres libre de hacer estas aserciones si lo deseas. Estas aserciones serán ejecutadas automáticamente al momento de navegar hacia la página.

    /**
     * Assert that the browser is on the page.
     *
     * @return void
     */
    public function assert(Browser $browser)
    {
        $browser->assertPathIs($this->url());
    }

<a name="navigating-to-pages"></a>
### Navegando hacia las Páginas

Una vez que una página ha sido configurada, puedes navegar hacia ésta usando el método `visit`:

    use Tests\Browser\Pages\Login;

    $browser->visit(new Login);

Algunas veces puedes estar ya en una página dada y necesitas "cargar" los selectores y métodos dentro del contexto de prueba actual. Esto es común al momento de presionar un botón y ser redireccionado a una página dada sin navegar explícitamente a esta. En esta situación, puedes usar el método `on` para cargar la página.

    use Tests\Browser\Pages\CreatePlaylist;

    $browser->visit('/dashboard')
            ->clickLink('Create Playlist')
            ->on(new CreatePlaylist)
            ->assertSee('@create');

<a name="shorthand-selectors"></a>
### Selectores Abreviados

El método `elements` de páginas permite que definas abreviaturas rápidas, fáciles de recordar para cualquier selector CSS en tu página. Por ejemplo, vamos a definir una abreviación para el campo "email" de la página login de la aplicación.

    /**
     * Get the element shortcuts for the page.
     *
     * @return array
     */
    public function elements()
    {
        return [
            '@email' => 'input[name=email]',
        ];
    }

Ahora, puedes usar este selector de abreviación en cualquier lugar que usarías un selector de CSS completo:

    $browser->type('@email', 'taylor@laravel.com');

#### Selectores de Abreviaturas Globales

Después de instalar Dusk, una clase `Page` basica será colocada en tu directorio `tests/Browser/Pages`. Esta clase contiene un método `siteElements` el cual puede ser usado para definir selectores de abreviaturas globales que deberían estar disponibles en cada página en cada parte de tu aplicación:

    /**
     * Get the global element shortcuts for the site.
     *
     * @return array
     */
    public static function siteElements()
    {
        return [
            '@element' => '#selector',
        ];
    }

<a name="page-methods"></a>
### Métodos de Página

En adición a los métodos predeterminados definidos en páginas, puedes definir métodos adicionales los cuales pueden ser usados en cualquier parte de tus pruebas. Por ejemplo, vamos a imaginar que estamos construyendo una aplicación para administración de música. Una acción común para una página de la aplicación podría ser crear una lista de reproducción. En lugar de volver a escribir la lógica para crear una lista de reproducción en cada prueba, puedes definir un método `createPlaylist` en una clase página:

    <?php

    namespace Tests\Browser\Pages;

    use Laravel\Dusk\Browser;

    class Dashboard extends Page
    {
        // Other page methods...

        /**
         * Create a new playlist.
         *
         * @param  \Laravel\Dusk\Browser  $browser
         * @param  string  $name
         * @return void
         */
        public function createPlaylist(Browser $browser, $name)
        {
            $browser->type('name', $name)
                    ->check('share')
                    ->press('Create Playlist');
        }
    }

Una vez que el método ha sido definido, puedes usarlo dentro de cualquier prueba que utilice la página. La instancia de navegador será pasada automáticamente al método de la página:

    use Tests\Browser\Pages\Dashboard;

    $browser->visit(new Dashboard)
            ->createPlaylist('My Playlist')
            ->assertSee('My Playlist');

<a name="components"></a>
## Componentes

Los componentes son similares a “los objetos de página” de Dusk, pero son planeados para partes de UI y funcionalidades que sean reusadas en otras partes de tu aplicación, tal como una barra de navegación o ventana de notificación. Como tal, los componentes no son enlazados a URLs específicas.

<a name="generating-components"></a>
### Generando Componentes

Para generar un componente, usa el comando Artisan `dusk:component`. Los nuevos componentes son colocados en el directorio `test/Browser/Components`:

    php artisan dusk:component DatePicker

Como se muestra antes, un "calendario" es un ejemplo de un componente que puede existir en cualquier parte de tu aplicación en una variedad de páginas. Puede volverse complejo escribir manualmente lógica de automatización de navegador para seleccionar una fecha entre docenas de pruebas en cualquier parte de tu software de prueba. En lugar de esto, podemos definir un componente de Dusk para representar el calendario, permitiendo encapsular esa lógica dentro del componente:

    <?php

    namespace Tests\Browser\Components;

    use Laravel\Dusk\Browser;
    use Laravel\Dusk\Component as BaseComponent;

    class DatePicker extends BaseComponent
    {
        /**
         * Get the root selector for the component.
         *
         * @return string
         */
        public function selector()
        {
            return '.date-picker';
        }

        /**
         * Assert that the browser page contains the component.
         *
         * @param  Browser  $browser
         * @return void
         */
        public function assert(Browser $browser)
        {
            $browser->assertVisible($this->selector());
        }

        /**
         * Get the element shortcuts for the component.
         *
         * @return array
         */
        public function elements()
        {
            return [
                '@date-field' => 'input.datepicker-input',
                '@month-list' => 'div > div.datepicker-months',
                '@day-list' => 'div > div.datepicker-days',
            ];
        }

        /**
         * Select the given date.
         *
         * @param  \Laravel\Dusk\Browser  $browser
         * @param  int  $month
         * @param  int  $year
         * @return void
         */
        public function selectDate($browser, $month, $year)
        {
            $browser->click('@date-field')
                    ->within('@month-list', function ($browser) use ($month) {
                        $browser->click($month);
                    })
                    ->within('@day-list', function ($browser) use ($day) {
                        $browser->click($day);
                    });
        }
    }

<a name="using-components"></a>
### Usando Componentes

Una vez que el componente ha sido definido, fácilmente podemos seleccionar una fecha dentro del calendario desde cualquier prueba. Y, si la lógica necesaria para seleccionar una fecha cambia, solamente necesitaremos actualizar el componente:

    <?php

    namespace Tests\Browser;

    use Tests\DuskTestCase;
    use Laravel\Dusk\Browser;
    use Tests\Browser\Components\DatePicker;
    use Illuminate\Foundation\Testing\DatabaseMigrations;

    class ExampleTest extends DuskTestCase
    {
        /**
         * A basic component test example.
         *
         * @return void
         */
        public function testBasicExample()
        {
            $this->browse(function (Browser $browser) {
                $browser->visit('/')
                        ->within(new DatePicker, function ($browser) {
                            $browser->selectDate(1, 2018);
                        })
                        ->assertSee('January');
            });
        }
    }

<a name="continuous-integration"></a>
## Integración Continua

<a name="running-tests-on-travis-ci"></a>
### Travis CI

Para ejecutar tus pruebas de Dusk en Travis CI, necesitaremos usar el entorno de Ubuntu 14.04 (Trusty) "seudo-habilitado". Ya que Travis CI no es un entorno gráfico, necesitaremos tomar algunos pasos extras con el propósito de ejecutar un navegador Chrome. En adición a esto, usaremos `php artisan serve` para ejecutar el servidor web integrado de PHP:

    sudo: required
    dist: trusty

    addons:
       chrome: stable

    install:
       - cp .env.testing .env
       - travis_retry composer install --no-interaction --prefer-dist --no-suggest

    before_script:
       - google-chrome-stable --headless --disable-gpu --remote-debugging-port=9222 http://localhost &
       - php artisan serve &

    script:
       - php artisan dusk

<a name="running-tests-on-circle-ci"></a>
### CircleCI

#### CircleCI 1.0

Si estás usando CircleCI 1.0 para ejecutar tus pruebas de Dusk, puedes usar este archivo de configuración como punto de partida. Al igual que con TravisCI, usaremos el comando `php artisan serve` para ejecutar el servidor web integrado de PHP:

	dependencies:
	  pre:
	      - curl -L -o google-chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
	      - sudo dpkg -i google-chrome.deb
	      - sudo sed -i 's|HERE/chrome\"|HERE/chrome\" --disable-setuid-sandbox|g' /opt/google/chrome/google-chrome
	      - rm google-chrome.deb

    test:
        pre:
            - "./vendor/laravel/dusk/bin/chromedriver-linux":
                background: true
            - cp .env.testing .env
            - "php artisan serve":
                background: true

        override:
            - php artisan dusk

#### CircleCI 2.0

Si estás usando CircleCI 2.0 para ejecutar tus pruebas de Dusk, puedes agregar estos pasos a tu compilación:

     version: 2
     jobs:
         build:
             steps:
                - run: sudo apt-get install -y libsqlite3-dev
                - run: cp .env.testing .env
                - run: composer install -n --ignore-platform-reqs
                - run: npm install
                - run: npm run production
                - run: vendor/bin/phpunit

                - run:
                   name: Start Chrome Driver
                   command: ./vendor/laravel/dusk/bin/chromedriver-linux
                   background: true

                - run:
                   name: Run Laravel Server
                   command: php artisan serve
                   background: true

                - run:
                   name: Run Laravel Dusk Tests
                   command: php artisan dusk

<a name="running-tests-on-codeship"></a>
### Codeship

Para ejecutar pruebas de Dusk en [Codeship](https://codeship.com), agrega los siguientes comandos a tu proyecto Codeship. Ciertamente, estos comandos son un punto de partida y eres libre de agregar los comandos adicionales que necesites:

    phpenv local 7.1
    cp .env.testing .env
    composer install --no-interaction
    nohup bash -c "./vendor/laravel/dusk/bin/chromedriver-linux 2>&1 &"
    nohup bash -c "php artisan serve 2>&1 &" && sleep 5
    php artisan dusk
