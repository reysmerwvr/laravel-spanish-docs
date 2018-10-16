# Pruebas HTTP

- [Introducción](#introduction)
    - [Personalizando Encabezados de Solicitud](#customizing-request-headers)
- [Sesión / Autenticación](#session-and-authentication)
- [Probando APIs JSON](#testing-json-apis)
- [Probando las Subidas de Archivo](#testing-file-uploads)
- [Aserciones Disponibles](#available-assertions)
    - [Aserciones de Respuesta](#response-assertions)
    - [Aserciones de Autenticación](#authentication-assertions)

<a name="introduction"></a>
## Introducción

Laravel proporciona una API muy fluida para hacer solicitudes HTTP a tu aplicación y examinar la salida. Por ejemplo, echemos un vistazo a la prueba definida debajo:

    <?php

    namespace Tests\Feature;

    use Tests\TestCase;
    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Illuminate\Foundation\Testing\WithoutMiddleware;

    class ExampleTest extends TestCase
    {
        /**
         * A basic test example.
         *
         * @return void
         */
        public function testBasicTest()
        {
            $response = $this->get('/');

            $response->assertStatus(200);
        }
    }

El método `get` simula una solicitud `GET` dentro de la aplicación, mientras que el método `assertStatus` comprueba que la respuesta devuelta debería tener el código de status HTTP dado. Además de esta sencilla aserción, Laravel también contiene una variedad de aserciones para inspeccionar los encabezados, contenidos, estructura JSON, y más cosas de la respuesta. 

<a name="customizing-request-headers"></a>
### Personalizando Encabezados de Solicitud

Puedes usar el método `withHeaders` para personalzar los encabezados de la solicitud antes que sea enviada a la aplicación. Esto permitirá que agregues algunos encabezados personalizados de tu preferencia a la solicitud:

    <?php

    class ExampleTest extends TestCase
    {
        /**
         * A basic functional test example.
         *
         * @return void
         */
        public function testBasicExample()
        {
            $response = $this->withHeaders([
                'X-Header' => 'Value',
            ])->json('POST', '/user', ['name' => 'Sally']);

            $response
                ->assertStatus(200)
                ->assertJson([
                    'created' => true,
                ]);
        }
    }

<a name="session-and-authentication"></a>
## Sesión / Autenticación

Laravel proporciona varios helpers para trabajar con la sesión durante las pruebas HTTP. Primero, puedes colocar los datos de la sesión en un arreglo dado usando el método `withSession`. Esto es útil para cargar la sesión con los datos antes de usar una solicitud a tu aplicación:

    <?php

    class ExampleTest extends TestCase
    {
        public function testApplication()
        {
            $response = $this->withSession(['foo' => 'bar'])
                             ->get('/');
        }
    }

Ciertamente, un uso común de la sesión es para mantener el estado del usuario autenticado. El método helper `actingAs` proporciona una foma sencilla de autenticar un usuario dado con el usuario actual. Por ejemplo, podemos usar una [fábrica de modelos](/docs/{{version}}/database-testing#writing-factories) para generar y autenticar un usuario:

    <?php

    use App\User;

    class ExampleTest extends TestCase
    {
        public function testApplication()
        {
            $user = factory(User::class)->create();

            $response = $this->actingAs($user)
                             ->withSession(['foo' => 'bar'])
                             ->get('/');
        }
    }

También puedes especificar que guardian debería ser usado para autenticar el usuario dado al pasar el nombre del guardian como segundo argumento del método `actingAs`:

    $this->actingAs($user, 'api')

<a name="testing-json-apis"></a>
## Probando APIs JSON

Laravel también proporciona varios helpers para probar APIs JSOn y sus respuestas. Por ejemplo, los métodos `json`, `get`, `post`, `put`, `patch`, y `delete` pueden ser usados para suministrar solicitudes con varios verbos HTTP. También puedes pasar datos y encabezados fácilmente a estos métodos. Para empezar, vamos a escribir una prueba para hacer una solicitud `POST` a `/user` y comprobar que los datos esperados fueron devueltos:

    <?php

    class ExampleTest extends TestCase
    {
        /**
         * A basic functional test example.
         *
         * @return void
         */
        public function testBasicExample()
        {
            $response = $this->json('POST', '/user', ['name' => 'Sally']);

            $response
                ->assertStatus(200)
                ->assertJson([
                    'created' => true,
                ]);
        }
    }

> {tip} El método `assertJson` convierte la respuesta a un arreglo y utiliza `PHPUnit::assertArraySubset` para verificar que el arreglo dado exista dentro de la respuesta JSON devuelta por la aplicación. Así, si hay otras propiedades en la respuesta JSON, esta prueba aún pasará siempre y cuando el fragmento dado esté presente.

<a name="verifying-exact-match"></a>
### Verificando una Coincidencia JSON Exacta

Si prefieres verificar que el arreglo dado esté contenido **exactamente** en la respuesta JSON devuelta por la aplicación, deberías usar el método `assertExactJson`:

    <?php

    class ExampleTest extends TestCase
    {
        /**
         * A basic functional test example.
         *
         * @return void
         */
        public function testBasicExample()
        {
            $response = $this->json('POST', '/user', ['name' => 'Sally']);

            $response
                ->assertStatus(200)
                ->assertExactJson([
                    'created' => true,
                ]);
        }
    }

<a name="testing-file-uploads"></a>
## Probando las Subidas de Archivo

La clase `Illuminate\Http\UploadedFile` proporciona un método `fake` el cual puede ser usado para generar archivos de prueba o imágenes para prueba. Esto, combinado con el método `fake` de la clase facade `Storage` simplifica grandemente la prueba de subidas de archivo. Por ejemplo, puedes combinar estas dos características para probar fácilmente un formulario de subida de un avatar:

    <?php

    namespace Tests\Feature;

    use Tests\TestCase;
    use Illuminate\Http\UploadedFile;
    use Illuminate\Support\Facades\Storage;
    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Illuminate\Foundation\Testing\WithoutMiddleware;

    class ExampleTest extends TestCase
    {
        public function testAvatarUpload()
        {
            Storage::fake('avatars');

            $response = $this->json('POST', '/avatar', [
                'avatar' => UploadedFile::fake()->image('avatar.jpg')
            ]);

            // Assert the file was stored...
            Storage::disk('avatars')->assertExists('avatar.jpg');

            // Assert a file does not exist...
            Storage::disk('avatars')->assertMissing('missing.jpg');
        }
    }

#### Personalización de Archivo Fake

Al momento de crear archivos usando el método `fake`, puedes especificar el ancho, la altura y el tamaño de la imagen con el propósito de probar mejor tus reglas de validación:

    UploadedFile::fake()->image('avatar.jpg', $width, $height)->size(100);

Además de crear imágenes, puedes crear archivos de cualquier otro tipo usando el método `create`:

    UploadedFile::fake()->create('document.pdf', $sizeInKilobytes);

<a name="available-assertions"></a>
## Aserciones Disponibles

<a name="response-assertions"></a>
### Aserciones de Respuesta

Laravel proporciona una variedad de métodos de aserción personalizados para tus pruebas [PHPUnit](https://phpunit.de/). Estas aserciones pueden ser accedidas en la respuesta que es devuelta de los métodos de prueba `json`, `get`, `post`, `put`, y `delete`:

<style>
    .collection-method-list > p {
        column-count: 3; -moz-column-count: 3; -webkit-column-count: 3;
        column-gap: 2em; -moz-column-gap: 2em; -webkit-column-gap: 2em;
    }

    .collection-method-list a {
        display: block;
    }
</style>

<div class="collection-method-list" markdown="1">

[assertCookie](#assert-cookie)
[assertCookieExpired](#assert-cookie-expired)
[assertCookieMissing](#assert-cookie-missing)
[assertDontSee](#assert-dont-see)
[assertDontSeeText](#assert-dont-see-text)
[assertExactJson](#assert-exact-json)
[assertHeader](#assert-header)
[assertHeaderMissing](#assert-header-missing)
[assertJson](#assert-json)
[assertJsonFragment](#assert-json-fragment)
[assertJsonMissing](#assert-json-missing)
[assertJsonMissing](#assert-json-missing)
[assertJsonMissingExact](#assert-json-missing-exact)
[assertJsonStructure](#assert-json-structure)
[assertJsonValidationErrors](#assert-json-validation-errors)
[assertPlainCookie](#assert-plain-cookie)
[assertRedirect](#assert-redirect)
[assertSee](#assert-see)
[assertSeeText](#assert-see-text)
[assertSessionHas](#assert-session-has)
[assertSessionHasAll](#assert-session-has-all)
[assertSessionHasErrors](#assert-session-has-errors)
[assertSessionHasErrorsIn](#assert-session-has-errors-in)
[assertSessionMissing](#assert-session-missing)
[assertStatus](#assert-status)
[assertSuccessful](#assert-successful)
[assertViewHas](#assert-view-has)
[assertViewHasAll](#assert-view-has-all)
[assertViewIs](#assert-view-is)
[assertViewMissing](#assert-view-missing)

</div>

<a name="assert-cookie"></a>
#### assertCookie

Comprueba que la respuesta contenga el cookie dado:

    $response->assertCookie($cookieName, $value = null);

<a name="assert-cookie-expired"></a>
#### assertCookieExpired

Comprueba que la respuesta contenga el cookie dado y que esté vencido:

    $response->assertCookieExpired($cookieName);

<a name="assert-cookie-missing"></a>
#### assertCookieMissing

Comprueba que la respuesta no contenga el cookie dado:

    $response->assertCookieMissing($cookieName);

<a name="assert-dont-see"></a>
#### assertDontSee

Comprueba que la cadena dada no esté contenida dentro de la respuesta:

    $response->assertDontSee($value);

<a name="assert-dont-see-text"></a>
#### assertDontSeeText

Comprueba que la cadena dada no esté coontenida dentro del texto de la respuesta:

    $response->assertDontSeeText($value);

<a name="assert-exact-json"></a>
#### assertExactJson

Comprueba que la respuesta contenga una coincidencia exacta de los datos JSON dados:

    $response->assertExactJson(array $data);

<a name="assert-header"></a>
#### assertHeader

Comprueba que el encabezado dado esté presente en la respuesta:

    $response->assertHeader($headerName, $value = null);

<a name="assert-header-missing"></a>
#### assertHeaderMissing

Comprueba que el encabezado dado no esté presente en la respuesta:

    $response->assertHeaderMissing($headerName);

<a name="assert-json"></a>
#### assertJson

Comprueba que la respuesta contenga los datos JSON dados:

    $response->assertJson(array $data);

<a name="assert-json-fragment"></a>
#### assertJsonFragment

Comprueba que la respuesta contenga el fragmento JSON dado:

    $response->assertJsonFragment(array $data);

<a name="assert-json-missing"></a>
#### assertJsonMissing

Comprueba que la respuesta no contenga el fragmento JSON dado:

    $response->assertJsonMissing(array $data);

<a name="assert-json-missing-exact"></a>
#### assertJsonMissingExact

Comprueba que la respuesta no contenga el fragmento exacto JSON:

    $response->assertJsonMissingExact(array $data);

<a name="assert-json-structure"></a>
#### assertJsonStructure

Comprueba que la respuesta tenga una estructura JSON dada:

    $response->assertJsonStructure(array $structure);

<a name="assert-json-validation-errors"></a>
#### assertJsonValidationErrors

Comprueba que la respuesta tenga los errores de validación de JSON dados para las claves dadas:

    $response->assertJsonValidationErrors($keys);

<a name="assert-plain-cookie"></a>
#### assertPlainCookie

Comprueba que la respuesta contenga el cookie dado (desencriptado):

    $response->assertPlainCookie($cookieName, $value = null);

<a name="assert-redirect"></a>
#### assertRedirect

Comprueba que la respuesta es una redirección a una URI dada:

    $response->assertRedirect($uri);

<a name="assert-see"></a>
#### assertSee

Comprueba que la cadena dada esté contenida dentro de la respuesta:

    $response->assertSee($value);

<a name="assert-see-text"></a>
#### assertSeeText

Comprueba que la cadena dada esté contenida dentro del texto de la respuesta:

    $response->assertSeeText($value);

<a name="assert-session-has"></a>
#### assertSessionHas

Comprueba que la sesión contenga la porción dada de datos:

    $response->assertSessionHas($key, $value = null);

<a name="assert-session-has-all"></a>
#### assertSessionHasAll

Comprueba que la sesión tenga una lista dada de valores:

    $response->assertSessionHasAll($key, $value = null);

<a name="assert-session-has-errors"></a>
#### assertSessionHasErrors

Comprueba que la sesión contenga un error para el campo dado:

    $response->assertSessionHasErrors(array $keys, $format = null, $errorBag = 'default');

<a name="assert-session-has-errors-in"></a>
#### assertSessionHasErrorsIn

Comprueba que la sesión tenga los errores dados:

    $response->assertSessionHasErrorsIn($errorBag, $keys = [], $format = null);

<a name="assert-session-missing"></a>
#### assertSessionMissing

Comprueba que la sesión no contenga la clave dada:

    $response->assertSessionMissing($key);

<a name="assert-status"></a>
#### assertStatus

Comprueba que la respuesta tenga un código dado:

    $response->assertStatus($code);

<a name="assert-successful"></a>
#### assertSuccessful

Comprueba que la respuesta tenga un código de estado de éxito:

    $response->assertSuccessful();

<a name="assert-view-has"></a>
#### assertViewHas

Comprueba que la vista de la respuesta fué dada en una proción de los datos:

    $response->assertViewHas($key, $value = null);

<a name="assert-view-has-all"></a>
#### assertViewHasAll

Comprueba que la vista de la respuesta tiene una lista dada de datos:

    $response->assertViewHasAll(array $data);

<a name="assert-view-is"></a>
#### assertViewIs

Comprueba que la vista dada fué devuelta por la ruta:

    $response->assertViewIs($value);

<a name="assert-view-missing"></a>
#### assertViewMissing

Comprueba que a la vista de la respuesta le está faltando una porción de datos enlazada:

    $response->assertViewMissing($key);

<a name="authentication-assertions"></a>
### Aserciones de Autenticación

Laravel también proporciona una variedad de aserciones relacionadas con la autenticación para tus pruebas [PHPUnit](https://phpunit.de/):

Método  | Descripción
------------- | -------------
`$this->assertAuthenticated($guard = null);`  |  Comprueba que el usuario está autenticado.
`$this->assertGuest($guard = null);`  |  Comprueba que el usuario no está autenticado.
`$this->assertAuthenticatedAs($user, $guard = null);`  |  Comprueba que el usuario dado está autenticado.
`$this->assertCredentials(array $credentials, $guard = null);`  |  Comprueba que las credenciales dadas son válidas.
`$this->assertInvalidCredentials(array $credentials, $guard = null);`  |  Comprueba que las credenciales dadads no son válidas.
