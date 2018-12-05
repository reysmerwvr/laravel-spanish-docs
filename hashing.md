# Hashing

- [Introducción](#introduction)
- [Uso Básico](#basic-usage)

<a name="introduction"></a>
## Introducción

El facade(/docs/{{version}}/facades) `Has` de Laravel proporciona hashing seguro de Bcrypt para almacenar contraseñas de usuarios. Si estás usando las clases integradas `LoginController` y `RegisterController` que están incluidas con tu aplicación de Laravel, automáticamente usarán Bcrypt para registro y autenticación.

> {tip} Bcrypt es una buena opción para el hashing de contraseñas dado que su "factor de trabajo" es ajustable, lo que quiere decir que el tiempo que toma generar un hash puede ser aumentado a medida que la capacidad de hardware incrementa.

<a name="basic-usage"></a>
## Uso Básico

Puedes hacer hash a una contraseña llamando al método `make` en el facade `Hash`:

    <?php

    namespace App\Http\Controllers;

    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Hash;
    use App\Http\Controllers\Controller;

    class UpdatePasswordController extends Controller
    {
        /**
         * Update the password for the user.
         *
         * @param  Request  $request
         * @return Response
         */
        public function update(Request $request)
        {
            // Validate the new password length...

            $request->user()->fill([
                'password' => Hash::make($request->newPassword)
            ])->save();
        }
    }

El método `make` también permite administrar el factor de trabajo del algoritmo de hashing de bcryptusando la opción `rounds`; sin embargo, el valor por defecto es aceptable para la mayoría de aplicaciones:

    $hashed = Hash::make('password', [
        'rounds' => 12
    ]);
#### Verificando Una Contraseña Contra Un Hash

El método `check` te permite verificar que una cadena de texto plano dada corresponde a un hash dado. Sin embargo, si estás usando el `LoginController` [incluido con Laravel](/docs/{{version}}/authentication), probablemente no necesitarás usar esto directamente, ya que este controlador automáticamente llama a este método:

    if (Hash::check('plain-text', $hashedPassword)) {
        // Las contraseñas coinciden...
    }

#### Comprobando Si Una Contraseña Necesita Ser Rehashed

La función `needsRehash` te permite determinar si el factor de trabajo usado por el hasher ha cambiado desde que el hash fue agregado a la contraseña:

    if (Hash::needsRehash($hashed)) {
        $hashed = Hash::make('plain-text');
    }
