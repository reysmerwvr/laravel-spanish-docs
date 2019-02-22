# Notas de Lanzamiento

- [Esquema de Versiones](#versioning-scheme)
- [Política de Soporte](#support-policy)
- [Laravel 5.7](#laravel-5.7)

<a name="versioning-scheme"></a>
## Esquema de Versiones

El esquema de versiones de Laravel mantiene la siguiente convención: `paradigma.mayor.menor`. Los lanzamientos mayores del framework se publican cada seis meses (febrero y agosto), mientras que los lanzamientos menores se liberan cada semana. Los lanzamientos menores **nunca** deben contener cambios de ruptura.

Cuando se hace referencia al framework Laravel o sus componentes desde tu aplicación o paquete, se debe utilizar siempre una restricción de versión como `5.7.*`, ya que las versiones mayores de Laravel no incluyen cambios de ruptura. Sin embargo, nos esforzamos por asegurarnos siempre de que puedas actualizar a una nueva versión mayor en un día o menos.

Los lanzamientos de cambios de paradigma están separados por muchos años y representan cambios fundamentales en la arquitectura y las convenciones del framework. Actualmente, no hay ningún cambio de paradigma en desarrollo.

<a name="support-policy"></a>
## Política de Soporte

Para las versiones LTS, como Laravel 5.5, se proporcionan correcciones de errores durante 2 años y correcciones de seguridad por 3 años. Estas versiones proporcionan la ventana más larga de soporte y mantenimiento. Para las versiones generales, las correcciones de errores se proporcionan durante 6 meses y las correcciones de seguridad durante 1 año.  Para todas las librerías adicionales, incluyendo Lumen, solo la última versión recibe correcciones de errores.

| Versión | Lanzamiento | Corrección de errores hasta | Correcciones de seguridad hasta |
| --- | --- | --- | --- |
| 5.0 | 4 de febrero, 2015 | 4 de agosto, 2015 | 4 de febrero, 2016 |
| 5.1 (LTS) | 9 de junio, 2015 | 9 de junio, 2017 | 9 de junio, 2018 |
| 5.2 | 21 de diciembre, 2015 | 21 de junio, 2016 | 21 de diciembre, 2016 |
| 5.3 | 23 de agosto, 2016 | 23 de febrero, 2017 | 23 de agosto, 2017 |
| 5.4 | 24 de enero, 2017 | 24 de julio, 2017 | 24 de enero, 2018 |
| 5.5 (LTS) | 30 de agosto, 2017 | 30 de agosto, 2019 | 30 de agosto, 2020 |
| 5.6 | 7 de febrero, 2018 | 7 de agosto, 2018 | 7 de febrero, 2019 |
| 5.7 | 4 de septiembre, 2018 | 4 de marzo, 2019 | 4 de septiembre, 2019 |

<a name="laravel-5.7"></a>
## Laravel 5.7

Laravel 5.7 continúa las mejoras hechas en Laravel 5.6 al introducir [Laravel Nova](https://nova.laravel.com), verificación de correo electrónico opcional para el scaffolding de autenticación, soporte de Gates y políticas de autorización para usuarios invitados, mejoras en pruebas de consola, integración de `dump-server` de Symfony, configuración regional de notificaciones y una variedad de otras correcciones de errores y mejoras de usabilidad.

### Laravel Nova

[Laravel Nova](https://nova.laravel.com) es un hermoso panel de administración y el mejor en su clase para aplicaciones de Laravel. La característica principal de Nova es la capacidad de administrar sus registros de base de datos subyacentes utilizando Eloquent. Además, Nova ofrece soporte para filtros, lentes, acciones, acciones en cola, métricas, autorización, herramientas personalizadas, tarjetas personalizadas, campos personalizados y más.

Para obtener más información sobre Laravel Nova, visite el [sitio web de Nova](https://nova.laravel.com).

### Verificación de Correo Electrónico

Laravel 5.7 introduce verificación de correo electrónico opcional para el scaffolding de autenticación incluido en el framework. Para adaptar esta característica, una columna de marca de tiempo `email_verified_at` ha sido añadida a la migración de la tabla `users` que se incluye en el framework por defecto.

Para solicitar a los usuarios recién registrados que verifiquen su correo electrónico, el modelo `User` debe implementar la interfaz` MustVerifyEmail`:

    <?php

    namespace App;

    use Illuminate\Notifications\Notifiable;
    use Illuminate\Contracts\Auth\MustVerifyEmail;
    use Illuminate\Foundation\Auth\User as Authenticatable;

    class User extends Authenticatable implements MustVerifyEmail
    {
        // ...
    }

Una vez que el modelo `User` tenga implementada la interfaz`MustVerifyEmail`, los usuarios recién registrados recibirán un correo electrónico con un enlace de verificación firmado. Una vez que el usuario haga clic en este enlace, Laravel registrará automáticamente el tiempo de verificación en la base de datos y redirigirá a los usuarios a una ubicación de su elección.

Se ha agregado un middleware `verified` al kernel HTTP por defecto de la aplicación. Este middleware puede adjuntarse a rutas que solo deberían permitir usuarios verificados:

    'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,

> {tip} Para obtener más información sobre la verificación de correo electrónico, consulte la [documentación completa](/docs/{{version}}/verification).

### Políticas y Gates para Usuarios Visitantes

En versiones anteriores de Laravel, las Gates y las políticas de autorización automáticamente devolvían "falso" a los visitantes no autenticados de tu aplicación. Sin embargo, ahora puedes permitir que los invitados pasen por las verificaciones de autorización declarando una declaración de tipo "opcional" o suministrando un valor por defecto `null` para la definición del argumento del usuario:

    Gate::define('update-post', function (?User $user, Post $post) {
        // ...
    });

### Dump Server de Symfony

Laravel 5.7 ofrece integración con el comando `dump-server` de Symfony a través de [un paquete de Marcel Pociot](https://github.com/beyondcode/laravel-dump-server). Para comenzar, ejecuta el comando Artisan `dump-server`:

    php artisan dump-server

Una vez que el servidor se haya iniciado, todas las llamadas a `dump` se mostrarán en la ventana de la consola `dump-server` en lugar de hacerlo en tu navegador, lo que te permitirá inspeccionar los valores sin alterar tu salida de respuesta HTTP.

### Configuración Regional en Notificaciones

Laravel ahora te permite enviar notificaciones en una configuración regional distinta del idioma actual, e incluso recordará esta configuración regional si la notificación está en cola.

Para lograr esto, la clase `Illuminate\Notifications\Notification` ahora ofrece un método` locale` para configurar el idioma deseado. La aplicación cambiará a esta configuración regional cuando se formatee la notificación y luego volverá a la configuración regional anterior cuando se complete el formateo:

    $user->notify((new InvoicePaid($invoice))->locale('es'));

La configuración regional de múltiples entradas de notificaciones notificables también se puede lograr a través de la facade `Notificación`:

    Notification::locale('es')->send($users, new InvoicePaid($invoice));

### Pruebas de Consola

Laravel 5.7 te permite "simular" fácilmente las entradas de usuario para tus comandos de consola utilizando el método `expectsQuestion`. Además, puedes especificar el código de salida y el texto que esperas que genere el comando de la consola utilizando los métodos `assertExitCode` y `expectsOutput`. Por ejemplo, considera el siguiente comando de consola:

    Artisan::command('question', function () {
        $name = $this->ask('What is your name?');

        $language = $this->choice('Which language do you program in?', [
            'PHP',
            'Ruby',
            'Python',
        ]);

        $this->line('Your name is '.$name.' and you program in '.$language.'.');
    });

Puedes probar este comando con la siguiente prueba que utiliza los métodos `expectsQuestion`, `expectsOutput` y `assertExitCode`:

    /**
     * Test a console command.
     *
     * @return void
     */
    public function test_console_command()
    {
        $this->artisan('question')
             ->expectsQuestion('What is your name?', 'Taylor Otwell')
             ->expectsQuestion('Which language do you program in?', 'PHP')
             ->expectsOutput('Your name is Taylor Otwell and you program in PHP.')
             ->assertExitCode(0);
    }

### Generador de URL y la Sintaxis Callable

En lugar de solo aceptar cadenas, el generador de URL de Laravel ahora acepta la sintaxis "callable" al generar URL para las acciones del controlador:

    action([UserController::class, 'index']);

### Enlaces del Paginador

Laravel 5.7 te permite controlar cuántos enlaces adicionales se muestran a cada lado de la "ventana" de la URL del paginador. De forma predeterminada, se muestran tres enlaces en cada lado de los enlaces del paginador principal. Sin embargo, puedes controlar este número usando el método `onEachSide`:

    {{ $paginator->onEachSide(5)->links() }}

### Secuencias de lectura / escritura del sistema de archivos

Laravel Flysystem ahora ofrece los métodos `readStream` y `writeStream`:

    Storage::disk('s3')->writeStream(
        'remote-file.zip',
        Storage::disk('local')->readStream('local-file.zip')
    );
