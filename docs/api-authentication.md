::: v-pre

# Autenticación de API

- [Introducción](#introduction)
- [Configuración](#configuration)
    - [Migraciones de la base de datos](#database-preparation)
- [Generando tokens](#generating-tokens)
    - [Hashing tokens](#hashing-tokens)
- [Protegiendo rutas](#protecting-routes)
- [Pasando tokens en peticiones](#passing-tokens-in-requests)

<a name="introduction"></a>
## Introducción

Por defecto, Laravel viene con una sencilla solución para autenticación de API mediante tokens aleatorios asignados a cada usuario de tu aplicación. En tu archivo de configuración `config/auth.php`, un guard `api` ya está definido y utiliza un driver `token`. Este driver es responsable de inspeccionar el token de la API en la petición entrante y verificar que coincida con el token asignado al usuario en la base de datos.

> **Nota:** Aunque Laravel viene con un sencillo guard de autenticación basado en token, te recomendamos considerar usar [Laravel Passport](/passport.html) para aplicaciones robustas en producción que ofrecen autenticación de API.

<a name="configuration"></a>
## Configuración

<a name="database-preparation"></a>
### Preparando la base de datos

Antes de usar el driver `token`, necesitarás [crear una migración](/migrations.html) que agrega una columna `api_token` a tu tabla `users`:

```php
Schema::table('users', function ($table) {
    $table->string('api_token', 80)->after('password')
                        ->unique()
                        ->nullable()
                        ->default(null);
});
```

Una vez que la migración ha sido creada, ejecuta el comando de Artisan `migrate`.

<a name="generating-tokens"></a>
## Generando tokens

Una vez que la columna `api_token` ha sido agregada a tu tabla `users`, estás listo para asignar tokens de API aleatorios a cada usuario que se registra en tu aplicación. Debes asignar dichos tokens cuando un modelo `User` es creado para el usuario durante el registro. Al usar el [scaffolding de autenticación](/authentication.html#authentication-quickstart) proporcionado por el comando de Artisan `make:auth`, esto puede ser hecho en el método `create` de `RegisterController`:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

/**
* Create a new user instance after a valid registration.
*
* @param  array  $data
* @return \App\User
*/
protected function create(array $data)
{
    return User::create([
        'name' => $data['name'],
        'email' => $data['email'],
        'password' => Hash::make($data['password']),
        'api_token' => Str::random(60),
    ]);
}
```

<a name="hashing-tokens"></a>
### Hashing tokens

En los ejemplos de arriba, los tokens de API son almacenados en tu base de datos como texto plano. Si te gustaría agregar un hash a tus tokens de API usando hashing SHA-256, puedes establecer la opción `hash` de la configuración del guard de tu `api` a `true`. El guard `api` está definido en tu archivo de configuración `config/auth.php`:

```php
'api' => [
    'driver' => 'token',
    'provider' => 'users',
    'hash' => true,
],
```

#### Generando tokens con hash

Al usar tokens de API con hash, no debes generar tus tokens de API durante el registro del usuario. En su lugar, necesitarás implementar tu propia página de administración de tokens de API dentro de tu aplicación. Esta página debe permitir a los usuarios inicializar y refrescar sus token de API. Cuando un usuario realiza una petición para inicializar o refrescar su token, debes almacenar una copia con hash del token en la base de datos y retornar una copia de texto plano del token a la vista / frontend del cliente para ser mostrado una sola vez.

Por ejemplo, un método de controlador que inicializa / refresca el token para un usuario dado y retorna el texto plano del token como una respuesta JSON pudiera verse de la siguiente manera:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Str;
use Illuminate\Http\Request;

class ApiTokenController extends Controller
{
    /**
    * Update the authenticated user's API token.
    *
    * @param  \Illuminate\Http\Request  $request
    * @return array
    */
    public function update(Request $request)
    {
        $token = Str::random(60);

        $request->user()->forceFill([
            'api_token' => hash('sha256', $token),
        ])->save();

        return ['token' => $token];
    }
}
```

::: tip
Dado que los tokens de la API en el ejemplo supierior tienen suficiente entropía, es impractico crear "tablas arcoiris" que buscar el valor original del token con hash. Por lo tanto, métodos de hashing lentos como `bcrypt` son innecesarios. 
:::

<a name="protecting-routes"></a>
## Protegiendo rutas

Laravel incluye un [guard de autenticación](/authentication.html#adding-custom-guards) que validará automáticamente tokens de API en peticiones entrantes. Sólo necesitas especificar el middleware `auth:api` en cualquier ruta que requiera un token de acceso válido:

```php
use Illuminate\Http\Request;

Route::middleware('auth:api')->get('/user', function(Request $request) {
    return $request->user();
});
```

<a name="passing-tokens-in-requests"></a>
## Pasando tokens En peticiones

Hay muchas formas de pasar el token de la API a tu aplicación. Discutiremos cada una de esas formas mientras usamos el paquete HTTP Guzzle para demostrar su uso. Puedes elegir cualquiera de estas formas dependiendo de las necesidades de tu aplicación.

#### Query string

Los usuarios de tu API pueden especificar su token como un valor de cadena de consulta `api_token`:

```php
$response = $client->request('GET', '/api/user?api_token='.$token);
```

#### Request payload

Los usuarios de tu API pueden incluir su token de API en los parametros del formulario de la petición como `api_token`: 

```php
$response = $client->request('POST', '/api/user', [
    'headers' => [
        'Accept' => 'application/json',
    ],
    'form_params' => [
        'api_token' => $token,
    ],
]);
```

#### Bearer token

Los usuarios de tu API pueden proporcionar su token de API como un token `Bearer` en el encabezado `Authorization` de la petición:

```php
$response = $client->request('POST', '/api/user', [
    'headers' => [
        'Authorization' => 'Bearer '.$token,
        'Accept' => 'application/json',
    ],
]);
```