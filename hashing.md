::: v-pre

# Hashing

- [Introducción](#introduction)
- [Configuración](#configuration)
- [Uso Básico](#basic-usage)

<a name="introduction"></a>
## Introducción

El [facade](/docs/{{version}}/facades) `Has` de Laravel proporciona hashing seguro de Bcrypt y Argon2 para almacenar contraseñas de usuarios. Si estás usando las clases integradas `LoginController` y `RegisterController` que están incluidas con tu aplicación de Laravel usarán Bcrypt para registro y autenticación de forma predeterminada.

::: tip
Bcrypt es una buena opción para el hashing de contraseñas dado que su "factor de trabajo" es ajustable, lo que quiere decir que el tiempo que toma generar un hash puede ser aumentado a medida que la capacidad de hardware incrementa.
:::

<a name="configuration"></a>
## Configuración

El driver de hashing por defecto para tu aplicación está configurado en el archivo de configuración `config/hashing.php`. Actualmente hay tres drivers soportados: [Bcrypt](https://en.wikipedia.org/wiki/Bcrypt) y [Argon2](https://en.wikipedia.org/wiki/Argon2) (variantes Argon2i y Argon2id).

::: danger Nota
El driver Argon2i requiere PHP 7.2.0 o superior y el driver Argon2id requiere PHP 7.3.0 o superior.
:::

<a name="basic-usage"></a>
## Uso Básico

Puedes hacer hash a una contraseña llamando al método `make` en el facade `Hash`:

```php
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
```

#### Ajustando El Factor De Trabajo De Bcrypt

Si estás usando el algoritmo Bcrypt, el método `make` te permite administrar el factor de trabajo del algoritmo usando la opción `rounds`; sin embargo, el valor por defecto es aceptable para la mayoría de las aplicaciones:

```php
$hashed = Hash::make('password', [
    'rounds' => 12
]);
```

#### Ajustando El Factor De Trabajo De Argon2

Si estás usando el algoritmo de Argon2, el método `make` te permite administrar la carga de trabajo del algoritmo usando las opciones `memory`, `time` y `threads`; sin embargo, los valores por defecto son aceptables para la mayoría de las aplicaciones:

```php
$hashed = Hash::make('password', [
    'memory' => 1024,
    'time' => 2,
    'threads' => 2,
]);
```

::: tip
Para mayor información de estas opciones, revisa la [documentación oficial de PHP](https://secure.php.net/manual/en/function.password-hash.php).
:::

#### Verificando Una Contraseña Contra Un Hash

El método `check` te permite verificar que una cadena de texto plano dada corresponde a un hash dado. Sin embargo, si estás usando el `LoginController` [incluido con Laravel](/docs/{{version}}/authentication), probablemente no necesitarás usar esto directamente, ya que este controlador automáticamente llama a este método:

```php
if (Hash::check('plain-text', $hashedPassword)) {
    // Las contraseñas coinciden...
}
```

#### Comprobando Si Una Contraseña Necesita Ser Rehashed

La función `needsRehash` te permite determinar si el factor de trabajo usado por el hasher ha cambiado desde que el hash fue agregado a la contraseña:

```php
if (Hash::needsRehash($hashed)) {
    $hashed = Hash::make('plain-text');
}
```