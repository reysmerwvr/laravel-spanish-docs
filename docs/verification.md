::: v-pre

# Verificación de Correo Electrónico

- [Introducción](#introduction)
- [Consideraciones De La Base De Datos](#verification-database)
- [Rutas](#verification-routing)
    - [Protegiendo Rutas](#protecting-routes)
- [Vistas](#verification-views)
- [Luego De Verificar Correos Electrónicos](#after-verifying-emails)
- [Eventos](#events)

<a name="introduction"></a>
## Introducción

Muchas aplicaciones web requieren que los usuarios verifiquen sus correos electrónicos usando la aplicación. En lugar de forzarte a volver a implementar esto en cada aplicación, Laravel proporciona métodos convenientes para enviar y verificar solicitudes de verificación de correos electrónicos. 

### Preparación Del Modelo

Para comenzar, verifica que tu modelo `App\User` implementa la interfaz `Illuminate\Contracts\Auth\MustVerifyEmail`:

```php
<?php

namespace App;

use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable implements MustVerifyEmail
{
    use Notifiable;

    // ...
}
```

<a name="verification-database"></a>
## Consideraciones De La Base De Datos

#### Columna De Verificación De Correo Electrónico

Luego, tu tabla `user` debe contener una columna `email_verified_at` para almacenar la fecha y la hora en la que la dirección de correo electrónico fue verificada. Por defecto, la migración de la tabla `user` incluida con el framework Laravel ya incluye esta columna. Así que, lo único que necesitas es ejecutar la migración de la base de datos:

```php
php artisan migrate
```

<a name="verification-routing"></a>
## Rutas

Laravel incluye la clase `Auth\VerificationController` que contiene la lógica necesaria para enviar enlaces de verificación y verificar correos electrónicos. Para registrar las rutas necesarias para este controlador, pasa la opción `verify` al método `Auth::routes`:

```php
Auth::routes(['verify' => true]);
```

<a name="protecting-routes"></a>
### Protegiendo Rutas

[El middleware de rutas](/docs/{{version}}/middleware) puede ser usado para permitir que sólo usuarios autorizados puedan acceder a una ruta dada. Laravel viene con un middleware `verified`, que está definido en `Illuminate\Auth\Middleware\EnsureEmailIsVerified`. Dado que este middleware ya está registrado en el kernel HTTP de tu aplicación, lo único que necesitas hacer es adjuntar el middleware a una definición de ruta:

```php
Route::get('profile', function () {
    // Only verified users may enter...
})->middleware('verified');
```

<a name="verification-views"></a>
## Vistas

Laravel generará todas las vistas de verificación de correo electrónico necesarias cuando el comando `make:auth` sea ejecutado. Esta vista es colocada en `resources/views/auth/verify.blade.php`. Eres libre de personalizar esta vista según sea necesario para tu aplicación.

<a name="after-verifying-emails"></a>
## Luego De Verificar Correos Electrónicos

Luego de que una dirección de correo electrónico es verificada, el usuario será redirigido automáticamente a `/home`. Puedes personalizar la ubicación de redirección post-verificación definiendo un método `redirectTo` o propiedad en `VerificationController`:

```php
protected $redirectTo = '/dashboard';
```

<a name="events"></a>
## Eventos

Laravel despacha [eventos](/docs/{{version}}/events) durante el proceso de verificación de correo electrónico. Puedes agregar listeners a estos eventos en tu `EventServiceProvider`:

```php
/**
* The event listener mappings for the application.
*
* @var array
*/
protected $listen = [
    'Illuminate\Auth\Events\Verified' => [
        'App\Listeners\LogVerifiedUser',
    ],
];
```