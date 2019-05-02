::: v-pre

# Laravel Socialite

- [Introducción](#introduction)
- [Actualizando Socialite](#upgrading-socialite)
- [Instalación](#installation)
- [Configuración](#configuration)
- [Enrutamiento](#routing)
- [Parámetros Opcionales](#optional-parameters)
- [Alcances de Acceso](#access-scopes)
- [Autenticación Sin Estado](#stateless-authentication)
- [Obteniendo Detalles De Usuario](#retrieving-user-details)

<a name="introduction"></a>
## Introducción

Además de la típica, autenticación basada en formularios, Laravel también proporciona una sencilla y conveniente forma de autenticar con proveedores OAuth usando [Laravel Socialite](https://github.com/laravel/socialite). Actualmente Socialite soporta autenticación con Facebook, Twitter, LinkedIn, Google, Github, GitLab y Bitbucket.

::: tip
Los adaptadores para otras plataformas son listados en el sitio web de [Proveedores de Socialite](https://socialiteproviders.netlify.com/) manejado por la comunidad.
:::

<a name="upgrading-socialite"></a>
## Actualizando Socialite

Al actualizar a una nueva versión principal de Socialite, es importante que revise cuidadosamente [la guía de actualización](https://github.com/laravel/socialite/blob/master/UPGRADE.md).

<a name="installation"></a>
## Instalación

Para empezar con Socialite, usa Composer para agregar el paquete a las dependencias de tu proyecto:

```php
composer require laravel/socialite
```

<a name="configuration"></a>
## Configuración

Antes de usar Socialite, también necesitaras agregar las credenciales para los servicios OAuth que tu aplicación utiliza. Estas credenciales deberían estar colocadas en tu archivo de configuración `config/services.php`, y debería usar la clave `facebook`, `twitter`, `linkedin`, `google`, `github`, `gitlab` o `bitbucket` dependiendo del proveedor que tu aplicación requiera. Por ejemplo:

```php
'github' => [
    'client_id' => env('GITHUB_CLIENT_ID'),         // Your GitHub Client ID
    'client_secret' => env('GITHUB_CLIENT_SECRET'), // Your GitHub Client Secret
    'redirect' => 'http://your-callback-url',
],
```

::: tip
Si la opción `redirect` contiene una ruta relativa, será resuelta automáticamente a una URL completamente calificada.
:::

<a name="routing"></a>
## Enrutamiento

A continuación, ¡estás listo para autenticar usuarios! Necesitarás dos rutas: una para redireccionar el usuario al proveedor OAuth y otra para recibir la función de retorno del proveedor después de la autenticación. Accederemos a Socialite usando la clase facade `Socialite`:

```php
<?php

namespace App\Http\Controllers\Auth;

use Socialite;

class LoginController extends Controller
{
    /**
    * Redirect the user to the GitHub authentication page.
    *
    * @return \Illuminate\Http\Response
    */
    public function redirectToProvider()
    {
        return Socialite::driver('github')->redirect();
    }

    /**
    * Obtain the user information from GitHub.
    *
    * @return \Illuminate\Http\Response
    */
    public function handleProviderCallback()
    {
        $user = Socialite::driver('github')->user();

        // $user->token;
    }
}
```

El método `redirect` se toma la tarea de enviar el usuario al proveedor OAuth, mientras que el método `user` leerá la solicitud entrante y obtendrá lá información del usuario desde el proveedor.

Necesitarás definir las rutas para tus métodos de controlador:

```php
Route::get('login/github', 'Auth\LoginController@redirectToProvider');
Route::get('login/github/callback', 'Auth\LoginController@handleProviderCallback');
```

<a name="optional-parameters"></a>
## Parámetros Opcionales

Un número de proveedores OAuth soportan parámetros opcionales en la solicitud de redirección. Para incluir algunos de los parámetros opcionales en la solicitud, llama el método `with` con un arreglo asociativo:

```php
return Socialite::driver('google')
    ->with(['hd' => 'example.com'])
    ->redirect();
```

::: danger Nota
Al momento de usar el método `with`, procura no pasar algunas palabras reservadas tales como `state` or `response_type`.
:::

<a name="access-scopes"></a>
## Alcances De Acceso

Antes de redirecionar al usuario, también puedes agregar "alcances (scopes)" adicionales en la solicitud usando el método `scopes`. Este método mezclará todos los alcances existentes con los que suministras:

```php
return Socialite::driver('github')
    ->scopes(['read:user', 'public_repo'])
    ->redirect();
```

Puedes sobrescribir todos los alcances existentes usando el método `setScopes`:

```php
return Socialite::driver('github')
    ->setScopes(['read:user', 'public_repo'])
    ->redirect();
```

<a name="stateless-authentication"></a>
## Autenticación Sin Estado

El método `stateless` puede ser usado para deshabilitar la verificación de estado de sesión. Esto es útil al momento de agregar la autenticación de una red social a una API.

```php
return Socialite::driver('google')->stateless()->user();
```

<a name="retrieving-user-details"></a>
## Obteniendo Detalles De Usuario

Una vez que tengas una instancia de usuario, puedes aprovechar de obtener algunos detalles del usuario:

```php
$user = Socialite::driver('github')->user();

// OAuth Two Providers
$token = $user->token;
$refreshToken = $user->refreshToken; // not always provided
$expiresIn = $user->expiresIn;

// OAuth One Providers
$token = $user->token;
$tokenSecret = $user->tokenSecret;

// All Providers
$user->getId();
$user->getNickname();
$user->getName();
$user->getEmail();
$user->getAvatar();
```

#### Obteniendo Los Detalles De Usuario Desde Un Token (OAuth2)

Si ya tienes un token de acceso válido de un usuario, puedes obtener sus detalles usando el método `userFromToken`:

```php
$user = Socialite::driver('github')->userFromToken($token);
```

#### Obteniendo Los Detalles De Usuario Desde Un Token Y Secreto (OAuth1)

Si ya tienes un par válido de token / secreto de un usuario, puedes obtener sus detalles usando el método `userFromTokenAndSecret`:

```php
$user = Socialite::driver('twitter')->userFromTokenAndSecret($token, $secret);
```