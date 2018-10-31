# Resetting Passwords

- [Introducción](#introduction)
- [Consideraciones de la Base de Datos](#resetting-database)
- [Enrutamiento](#resetting-routing)
- [Vistas](#resetting-views)
- [Luego de Resetear Contraseñas](#after-resetting-passwords)
- [Personalización](#password-customization)

<a name="introduction"></a>
## Introducción

> {tip} **¿Quieres comenzar rápido?** Simplemente ejecuta `php artisan make:auth` en una aplicación de Laravel nueva y navega hasta `http://your-app.dev/register` o cualquier otra URL asignada a tu aplicación. Este simple comando se encargará de maquetar todo tu sistema de autenticación, ¡incluyendo resetear contraseñas!

La mayoría de las aplicaciones web proporciona una forma para que los usuarios resetean sus contraseñas olvidadas. En lugar de forzarte a reimplementar de esto en cada aplicación, Laravel proporciona métodos convenientes para enviar recordatorios de contraseñas y realizar reseteos de contraseñas.

> {note} Antes de usar las características de reseteo de contraseñas de Laravel, tu usuario debe usar el trait `Illuminate\Notifications\Notifiable`.

<a name="resetting-database"></a>
## Consideraciones de la Base de Datos

Para comenzar, verifica que tu modelo `App\User` implementa el contrato `Illuminate\Contracts\Auth\CanResetPassword`. Por supuesto, el modelo `App\User` incluído con el framework ya implementa esta interfaz y usa el trait `Illuminate\Auth\Passwords\CanResetPassword` para incluir los métodos necesarios para implementar la interfaz.

#### Generando La Migración Para La Tabla de Tokens de Reseteo

Luego, una tabla debe ser creada para almacenar los tokens de reseteo de contraseña. La migración para está tabla está incluida con Laravel por defecto y se encuentra en el directorio `database/migrations`. Así que, todo lo que necesitas hacer es ejecutar tus migraciones de la base de datos:

    php artisan migrate

<a name="resetting-routing"></a>
## Enrutamiento

Laravel incluye las clases `Auth\ForgotPasswordController` y `Auth\ResetPasswordController` que contienen la lógica necesaria para enviar enlaces de reseteo de contraseña y resetear contraseñas de usuarios mediante correo electrónico. Todas las rutas necesarias para realizar reseteos de contraseñas pueden ser generadas usando el comando de Artisan `make:auth`:

    php artisan make:auth

<a name="resetting-views"></a>
## Vistas

De nuevo, Laravel generará todas las vistas necesarias para el reseteo de contraseña cuando el comando `make:auth` es ejecutado. Estas vistas están ubicadas en `resources/views/auth/passwords`. Eres libre de personalizarlas según sea necesario para tu aplicación.

<a name="after-resetting-passwords"></a>
## Luego de Resetear Contraseñas

Una vez que has definido las rutas y vistas para resetear las contraseñas de tus usuarios, puedes acceder a la ruta en tu navegador en `/password/reset`. El `ForgotPasswordController` incluido con el framework ya incluye la lógica para enviar los correos con el enlace de reseteo, mientras que `ResetPasswordController` incluye la lógica para resetear las contraseñas de los usuarios.

Luego de que una contraseña es reseteada, la sesión del usuario será automáticamente iniciada y será redirigido a `/home`. Puedes personalizar la ubicación de redirección definiendo una propiedad `redirectTo` en `ResetPasswordController`:

    protected $redirectTo = '/dashboard';

> {note} Por defecto, los tokens para resetear contraseñas expiran luego de una hora. Puedes cambiar esto mediante la opción de reseteo de contraseñas `expire` en tu archivo `config/auth.php`.

<a name="password-customization"></a>
## Personalización

#### Personalización de los Guards de Autenticación

En tu archivo de configuración `auth.php`, puedes configurar múltiples "guards", que podrán ser usados para definir el comportamiento de autenticación para múltiples tablas de usuarios. Puedes personalizar el controlador `ResetPasswordController` incluido para usar el guard de tu preferencia sobrescribiendo el método `guard` en el controlador. Este método debe retornar una instancia guard:

    use Illuminate\Support\Facades\Auth;

    protected function guard()
    {
        return Auth::guard('guard-name');
    }

#### Personalización Del Broker de Contraseña

En tu archivo de configuración `auth.php`, puedes configurar múltiples "brokers" de contraseñas, que pueden ser usados para resetear contraseñas en múltiples tablas de usuarios. Puedes personalizar los controladores `ForgotPasswordController` y `ResetPasswordController` incluidos para usar el broker de tu elección sobrescribiendo el método `broker`:

    use Illuminate\Support\Facades\Password;

    /**
     * Get the broker to be used during password reset.
     *
     * @return PasswordBroker
     */
    protected function broker()
    {
        return Password::broker('name');
    }

#### Personalización Del Correo de Reseteo

Puedes fácilmente modificar la clase de la notificacion usada para enviar el enlace de reseteo de contraseña al usuario. Para comenzar, sobrescribe el método `sendPasswordResetNotification` en tu modelo `User`. Dentro de este método, puedes enviar la notificación usando cualquier clase que selecciones. El `$token` de reseteo de contaseña es el primer argumento recibido por el método:

    /**
     * Send the password reset notification.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }

