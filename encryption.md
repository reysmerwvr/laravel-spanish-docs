::: v-pre

# Cifrado

- [Introducción](#introduction)
- [Configuración](#configuration)
- [Usando El Cifrador](#using-the-encrypter)

<a name="introduction"></a>
## Introducción

El cifrado de Laravel utiliza OpenSSL para proporcionar el cifrado AES-256 y AES-128. Se recomienda encarecidamente usar las funciones de cifrado incorporadas de Laravel y no intente desplegar tus algoritmos de cifrado "de cosecha propia". Todos los valores cifrados de Laravel son firmados utilizando un código de autenticación de mensaje (MAC) para que su valor subyacente no pueda modificarse una vez cifrado.

<a name="configuration"></a>
## Configuración

Antes de usar el cifrado de Laravel, debes establecer la opción `key` en tu archivo de configuración `config/app.php`. Deberías usar el comando `php artisan key: generate` para generar esta clave, ya que este comando de Artisan usará el generador de bytes aleatorios seguros de PHP para construir tu clave. Si este valor no se establece correctamente, todos los valores cifrados por Laravel serán inseguros.

<a name="using-the-encrypter"></a>
## Usando El Cifrador

#### Cifrar un valor

Puedes cifrar un valor usando el helper o función de ayuda `encrypt`. Todos los valores cifrados se cifran utilizando OpenSSL y el cifrado `AES-256-CBC`. Además, todos los valores cifrados están firmados con un código de autenticación de mensaje (MAC) para detectar cualquier modificación en la cadena cifrada:

```php
<?php

namespace App\Http\Controllers;

use App\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class UserController extends Controller
{
    /**
    * Store a secret message for the user.
    *
    * @param  Request  $request
    * @param  int  $id
    * @return Response
    */
    public function storeSecret(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $user->fill([
            'secret' => encrypt($request->secret)
        ])->save();
    }
}
```

#### Cifrado sin serialización

Los valores cifrados se pasan a través de una serialización durante el proceso de cifrado, lo que permite el cifrado de objetos y matrices. De este modo, los clientes que no son PHP y reciben valores cifrados tendrán que des-serializar los datos. Si deseas cifrar y descifrar valores sin serialización, puede usar los métodos `encryptString` y` decryptString` de la facade `Crypt`:

```php
use Illuminate\Support\Facades\Crypt;

$encrypted = Crypt::encryptString('Hello world.');

$decrypted = Crypt::decryptString($encrypted);
```

#### Descifrando un valor

Puedes descifrar los valores usando el helper o función de ayuda `decrypt`. Si el valor no se puede descifrar correctamente, como cuando el MAC no es válido, se lanzará una `Illuminate\Contracts\Encryption\DecryptException`:

```php
use Illuminate\Contracts\Encryption\DecryptException;

try {
    $decrypted = decrypt($encryptedValue);
} catch (DecryptException $e) {
    //
}
```