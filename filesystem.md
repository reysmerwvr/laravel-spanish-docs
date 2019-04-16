::: v-pre

# Almacenamiento De Archivos

- [Introducción](#introduction)
- [Configuración](#configuration)
    - [Disco Público](#the-public-disk)
    - [Driver Local](#the-local-driver)
    - [Prerrequisitos Del Driver](#driver-prerequisites)
    - [Cache](#caching)
- [Obteniendo Instancias Del Disco](#obtaining-disk-instances)
- [Retornando Archivos](#retrieving-files)
	- [Descargando Archivos](#downloading-files)
    - [URLs De Archivos](#file-urls)
    - [Metadatos De Archivos](#file-metadata)
- [Almacenando Archivos](#storing-files)
    - [Carga De Archivos](#file-uploads)
    - [Visibilidad De Archivos](#file-visibility)
- [Eliminando Archivos](#deleting-files)
- [Directorios](#directories)
- [Sitemas De Archivos Personalizados](#custom-filesystems)

<a name="introduction"></a>
## Introducción

Laravel proporciona una podera abstracción del sistema de archivos gracias al genial paquete de PHP [Flysystem](https://github.com/thephpleague/flysystem) de Frank de Jonge. La integración de Flysystem de Laravel proporciona drivers simples de usar para trabajar con sistemas de archivos locales, Amazon S3 y Rackspace Cloud Storage.

<a name="configuration"></a>
## Configuración

La configuración del sistema de archivos está ubicada en `config/filesystems.php`. Dentro de este archivo puedes configurar todos tus "discos". Cada disco representa un driver de almacenamiento y una ubicación de almacenamiento en particular. Configuraciones de ejemplo para cada driver soportado están incluídas en el archivo de configuración. Así que, modifica la configuración para reflejar tus preferencias de almacenamiento y credenciales.

Puedes configurar tantos discos como quieras e incluso tener múltiples discos que usen el mismo driver.

<a name="the-public-disk"></a>
### El Disco Público

El disco `public` está pensado para archivos que serán publicamente accesibles. Por defecto, el disco `public` usa el driver `local` y almacena estos archivos en `storage/app/public`. Para hacerlos accesibles desde la web, debes crear un enlace simbólico desde `public/storage` a `storage/app/public`. Esta convención mantendrá tus archivos publicamente accesibles en un directorio que puede ser fácilmente compartido a través de despliegues al usar sistemas de despligue sin tiempo de inactividad como [Envoyer](https://envoyer.io).

Para crear un enlace simbólico, puedes usar el comando de Artisan `storage:link`:

```php
php artisan storage:link
```

Una vez que un archivo ha sido guardado y el enlace simbólico ha sido creado, puedes crear una URL a los archivos usando el helper `asset`:

```php
echo asset('storage/file.txt');
```

<a name="the-local-driver"></a>
### Driver Local

Al usar el driver `local`, todas las operaciones sobre archivos son relativas al directorio `root` definido en tu archivo de configuración. Por defecto, este valor está establecido al directorio `storage/app`. Por lo tanto, el siguiente método almacenará un archivo en `storage/app/file.txt`:

```php
Storage::disk('local')->put('file.txt', 'Contents');
```

<a name="driver-prerequisites"></a>
### Prerrequisitos Del Driver

#### Paquetes De Composer

Antes de usar los drivers de SFTP, S3 o Rackspace, necesitarás instalar el paquete apropiado mediante Composer:

- SFTP: `league/flysystem-sftp ~1.0`
- Amazon S3: `league/flysystem-aws-s3-v3 ~1.0`
- Rackspace: `league/flysystem-rackspace ~1.0`

Algo sumamente recomendable para mejorar el rendimiento es usar un adaptador de caché. Necesitarás un paquete adicional para esto:

- CachedAdapter: `league/flysystem-cached-adapter ~1.0`

#### Configuración Del Driver S3

La información de configuración del driver de S3 está ubicada en tu archivo de configuración `config/filesystems.php`. Este archivo contiene un arreglo de configuración de ejemplo para un driver de S3. Eres libre de modificar este arreglo con tu propia configuración y credenciales de S3. Por conveniencia, estas variables de entorno coinciden con la convención de nombres usada por AWS CLI.

#### Configuración Del Driver FTP

Las integraciones de Flysystem de Laravel funcionan bien con FTP; sin embargo, una configuración de ejemplo no está incluida con el archivo de configuración por defecto del framework `filesystems.php`. Si necesitas configurar un sistema de archivos FTP, puedes usar la siguiente configuración de ejemplo:

```php
'ftp' => [
    'driver'   => 'ftp',
    'host'     => 'ftp.example.com',
    'username' => 'your-username',
    'password' => 'your-password',

    // Optional FTP Settings...
    // 'port'     => 21,
    // 'root'     => '',
    // 'passive'  => true,
    // 'ssl'      => true,
    // 'timeout'  => 30,
],
```

#### Configuración Del Driver SFTP

Las integraciones de Flysystem de Laravel funcionan bien con SFTP; sin embargo, una configuración de ejemplo no está incluída con el archivo de configuración por defecto del framework `filesystems.php`. Si necesitas configurar un sistema de archivos SFTP, puedes usar la siguiente configuración de ejemplo:

```php
'sftp' => [
    'driver' => 'sftp',
    'host' => 'example.com',
    'username' => 'your-username',
    'password' => 'your-password',

    // Settings for SSH key based authentication...
    // 'privateKey' => '/path/to/privateKey',
    // 'password' => 'encryption-password',

    // Optional SFTP Settings...
    // 'port' => 22,
    // 'root' => '',
    // 'timeout' => 30,
],
```

#### Configuración Del Driver Rackspace

Las integraciones de Flysystem de Laravel funcionan bien con Rackspace; sin embargo, una configuración de ejemplo no está incluida con el archivo de configuración por defecto del framework `filesystems.php`. Si necesitas configurar un sistema de archivos de Rackspace, puedes usar la siguiente configuración de ejemplo:

```php
'rackspace' => [
    'driver'    => 'rackspace',
    'username'  => 'your-username',
    'key'       => 'your-key',
    'container' => 'your-container',
    'endpoint'  => 'https://identity.api.rackspacecloud.com/v2.0/',
    'region'    => 'IAD',
    'url_type'  => 'publicURL',
],
```

<a name="caching"></a>
### Cache

Para habilitar la cache para un disco dado, puedes agregar una directiva `cache` a las opciones de configuración del disco. La opción `cache` debe ser un arreglo de opciones de cache que contiene un nombre de disco `disk`, el tiempo de expiración en segundos `expire`, y el prefijo `prefix` de la cache:

```php
's3' => [
    'driver' => 's3',

    // Other Disk Options...

    'cache' => [
        'store' => 'memcached',
        'expire' => 600,
        'prefix' => 'cache-prefix',
    ],
],
```

<a name="obtaining-disk-instances"></a>
## Obteniendo Instancias Del Disco

El facade `Storage` puede ser usado para interactuar con cualquier de tus discos configurados. Por ejemplo, puedes usar el método `put` en el facade para almacenar un avatar en el disco por defecto. Si llamas a métodos en el facade `Storage` sin primero llamar al método `disk`, la llamada al método será automáticamente pasada al disco por defecto: 

```php
use Illuminate\Support\Facades\Storage;

Storage::put('avatars/1', $fileContents);
```

Si tus aplicaciones interactuan con múltiples discos, puedes usar el método `disk` en el facade `Storage` para trabajar con archivos en un disco en particular:

```php
Storage::disk('s3')->put('avatars/1', $fileContents);
```

<a name="retrieving-files"></a>
## Retornando Archivos

El método `get` puede ser usado para retornar el contenido de un archivo. Las cadenas del archivo serán retornadas por el método. Recuerda, todas las rutas del archivo deben ser especificadas relativas a la ubicación "raíz" configurada por el disco:

```php
$contents = Storage::get('file.jpg');
```

El método `exists` puede ser usado para determinar si un archivo existe en el disco:

```php
$exists = Storage::disk('s3')->exists('file.jpg');
```

<a name="downloading-files"></a>
### Descargando Archivos

El método `download` puede ser usado para generar una respuesta que obliga al navegador del usuario a descargar el archivo al directorio dado. El método `download` acepta un nombre de archivo como segundo argumento del método, que determinará el nombre del archivo que es visto por el usuario descargando el archivo. Finalmente, puedes pasar un arreglo de encabezados HTTP como tercer argumento al método:

```php
return Storage::download('file.jpg');

return Storage::download('file.jpg', $name, $headers);
```

<a name="file-urls"></a>
### URLs De Archivos

Puedes usar el método `url` para obtener la URL del archivo dado. Si estás usando el driver `local`, esto típicamente agregará `/storage` a la ruta dada y retornará una URL relativa al archivo. Si estás usando el driver `s3` o `rackspace`, será retornada la URL remota completamente habilitada:

```php
use Illuminate\Support\Facades\Storage;

$url = Storage::url('file.jpg');
```

::: danger Nota
Recuerda, si estás usando el driver `local`, todos los archivos que deberían ser públicamente accesibles deben ser colocados en el directorio `storage/app/public`. Además, debes [crear un enlace simbólico](#the-public-disk) a `public/storage` que apunte al directorio `storage/app/public`.
:::

#### URLs Temporales

Para archivos almacenados usando los drivers `s3` o `rackspace`, puedes crear una URL temporal a un archivo dado usando el método `temporaryUrl`. Este método acepta una ruta y una instancia `DateTime` que especifica cuando la URL debería expirar:

```php
$url = Storage::temporaryUrl(
    'file.jpg', now()->addMinutes(5)
);
```

#### Personalización Del Host De URL Local

Si te gustaría predefinir el host para archivos almacenados en un disco usando el driver `local`, puedes agregar una opción `url` al arreglo de configuración del disco:

```php
'public' => [
    'driver' => 'local',
    'root' => storage_path('app/public'),
    'url' => env('APP_URL').'/storage',
    'visibility' => 'public',
],
```

<a name="file-metadata"></a>
### Metadatos De Archivos

Además de leer y agregar archivos, Laravel también puede proporcionar información sobre los archivos. Por ejemplo, el método `size` puede ser usado para obtener el tamaño del archivo en bytes:

```php
use Illuminate\Support\Facades\Storage;

$size = Storage::size('file.jpg');
```

El método `lastModified` retorna la marca de tiempo de UNIX de la última vez en que el archivo fue modificado:

```php
$time = Storage::lastModified('file.jpg');
```

<a name="storing-files"></a>
## Almacenando Archivos

El método `put` puede ser usado para almacenar el contenido de archivos en un disco. Puedes también pasar un `recurso` de PHP al método `put`, que usará el soporte subyancete de stream de Flysystem. Usar streams es altamente recomendable al lidiar con archivos grandes:

```php
use Illuminate\Support\Facades\Storage;

Storage::put('file.jpg', $contents);

Storage::put('file.jpg', $resource);
```

#### Streaming Automático

Si te gustaría que Laravel automáticamente haga streaming de un archivo dado a tu ubicación de almacenamiento, puedes usar los métodos `putFile` o `putFileAs`. Este método acepta una instancia de `Illuminate\Http\File` o `Illuminate\Http\UploadedFile` y automáticamente hará stream del archivo a la ubicación deseada:  

```php
use Illuminate\Http\File;
use Illuminate\Support\Facades\Storage;

// Automatically generate a unique ID for file name...
Storage::putFile('photos', new File('/path/to/photo'));

// Manually specify a file name...
Storage::putFileAs('photos', new File('/path/to/photo'), 'photo.jpg');
```

Hay algunas cosas importantes a tener en cuenta sobre el método `putFile`. Observa que sólo especificamos un nombre de directorio, no un nombre de archivo. Por defecto, el método `putFile` generará un ID único que servirá como nombre del archivo. La extensión del archivo será determinada examinando el tipo MIME del archivo. La ruta al archivo será retornada por el método `putFile` para que puedes almacenar la ruta, incluyendo el nombre de archivo generado, en tu base de datos.

Los métodos `putFile` y `putFileAs` también aceptan un argumento para especificar la "visibilidad" del archivo almacenado. Esto es particularmente útil si estás almacenando el archivo en disco en la nube como S3 y te gustaría que el archivo sea públicamente accesible:

```php
Storage::putFile('photos', new File('/path/to/photo'), 'public');
```

#### Añadir Al Inicio o Al Final De Un Archivo

Los métodos `prepend` y `append` te permiten escribir al inicio o final de un archivo:

```php
Storage::prepend('file.log', 'Prepended Text');

Storage::append('file.log', 'Appended Text');
```

#### Copiando y Moviendo Archivos

El método `copy` puede ser usado para copiar un archivo existente a una nueva ubicación en el disco, mientras que el método `move` puede ser usado para renombrar o mover un archivo existente a una nueva ubicación:

```php
Storage::copy('old/file.jpg', 'new/file.jpg');

Storage::move('old/file.jpg', 'new/file.jpg');
```

<a name="file-uploads"></a>
### Carga De Archivos

En las aplicaciones web, una de los casos de uso más comunes para almacenar archivos es almacenar archivos cargados por los usuarios como imagenes de perfil, fotos y documentos. Laravel hace que sea muy fácil almacenar archivos cargados usando el método `store` en la instancia de un archivo cargado. Llama al método `store` con la ruta en la quieres almacenar el archivo:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class UserAvatarController extends Controller
{
    /**
    * Update the avatar for the user.
    *
    * @param  Request  $request
    * @return Response
    */
    public function update(Request $request)
    {
        $path = $request->file('avatar')->store('avatars');

        return $path;
    }
}
```

Hay algunas cosas importantes a tener en cuenta sobre este ejemplo. Observa que sólo especificamos un nombre de directorio, no un nombre de archivo. Por defecto, el método `store` generará un ID único que servirá como nombre de archivo. La extensión del archivo será determinada examinando el tipo MIME del archivo. La ruta al archivo será retornada por el método `store` para que puedas guardar la ruta, inculyendo el nombre generado, en tu base de datos.

También puedes llamar al método `putFile` en el facade `Storage` para realizar la misma manipulación de archivo del ejemplo superior:

```php
$path = Storage::putFile('avatars', $request->file('avatar'));
```

#### Especificando Un Nombre De Archivo

Si no te gustaría que un nombre de archivo sea automáticamente asignado a tu archivo almacenado, puedes usar el método `storeAs`, que recibe una ruta, el nombre del archivo y el disco (opcional) y sus argumentos:

```php
$path = $request->file('avatar')->storeAs(
    'avatars', $request->user()->id
);
```

Puedes usar el método `putFileAs` en el facade `Storage`, que realizará las mismas manipulaciones de archivos del ejemplo de arriba:

```php
$path = Storage::putFileAs(
    'avatars', $request->file('avatar'), $request->user()->id
);
```

#### Especificando Un Disco

Por defecto, este método usará tu disco predeterminado. Si te gustaría especificar otro disco, pasa el nombre del disco como segundo argumento al método `store`:

```php
$path = $request->file('avatar')->store(
    'avatars/'.$request->user()->id, 's3'
);
```

<a name="file-visibility"></a>
### Visibilidad De Archivos

En la integración de Flysystem de Laravel, "visibilidad" es una abstracción de permisos de archivos a través de múltiples plataformas. Los archivos pueden ser declarados tanto `public` o `private`. Cuando un archivo es declarado `public`, estás indicando que el archivo debería ser generalmente accesible por otros. Por ejemplo, al usar el driver de S3, puedes retornar URLs para archivos `public`.

Puedes establecer la visibilidad al establecer el archivo mediante el método `put`:

```php
use Illuminate\Support\Facades\Storage;

Storage::put('file.jpg', $contents, 'public');
```

Si el archivo ya ha sido almacenado, su visibilidad puede ser retornada y establecida mediante los métodos `getVisibility` y `setVisibility`:

```php
$visibility = Storage::getVisibility('file.jpg');

Storage::setVisibility('file.jpg', 'public')
```

<a name="deleting-files"></a>
## Eliminando Archivos

El método `delete` acepta un solo nombre de archivo o un arreglo de archivos a eliminar del disco:

```php
use Illuminate\Support\Facades\Storage;

Storage::delete('file.jpg');

Storage::delete(['file.jpg', 'file2.jpg']);
```

Si es necesario, puedes especificar el disco en el que se debe eliminar el archivo:

```php
use Illuminate\Support\Facades\Storage;

Storage::disk('s3')->delete('folder_path/file_name.jpg');
```

<a name="directories"></a>
## Directorios

#### Obtener Todos Los Archivos Dentro De Un Directorio

El método `files` retorna un arreglo de todos los archivos en un directorio dado. Si te gustaría retornar una lista de todos los archivos dentro de un directorio dado incluyendo subdirectorios, puedes usar el método `allFiles`:

```php
use Illuminate\Support\Facades\Storage;

$files = Storage::files($directory);

$files = Storage::allFiles($directory);
```

#### Obtener Todos Los Directorios Dentro De Un Directorio

El método `directories` retorna un arreglo de todos los directorios dentro de un directorio dado. Adicionalmente, puedes usar el método `allDirectories` para obtener una lista de todos los directorios dentro de un directorio dado y todos sus subdirectorios:

```php
$directories = Storage::directories($directory);

// Recursive...
$directories = Storage::allDirectories($directory);
```

#### Crear Un Directorio

El método `makeDirectory` creará el directorio dado, incluyendo cualquier subdirectorio necesario:

```php
Storage::makeDirectory($directory);
```

#### Eliminar Un Directorio

Finalmente, `deleteDirectory` puede ser usado para eliminar un directorio y todos sus archivos:

```php
Storage::deleteDirectory($directory);
```

<a name="custom-filesystems"></a>
## Sistemas De Archivos Personalizados

La integración de Flysystem de Laravel proporciona drivers para múltiples "drivers"; sin embargo, Flysystem no está limitado a estos y tiene adaptadores para muchos otros sistemas de almacenamiento. Puedes crear un driver personalizado si quieres usar alguno de los adaptadores adicionales en tu aplicación de Laravel.

Para configurar el sistema de archivos personalizado necesitarás un adaptador de Flysystem. Vamos a agregar un adaptador de Dropbox mantenido por la comunidad a nuestro proyecto:

```php
composer require spatie/flysystem-dropbox
```

Luego, debes crear un [proveedor de servicios](/docs/{{version}}/providers) como `DropboxServiceProvider`. En el método `boot` del proveedor, puedes usar el método `extend` del facade `Storage` para definir el driver personalizado:

```php
<?php

namespace App\Providers;

use Storage;
use League\Flysystem\Filesystem;
use Illuminate\Support\ServiceProvider;
use Spatie\Dropbox\Client as DropboxClient;
use Spatie\FlysystemDropbox\DropboxAdapter;

class DropboxServiceProvider extends ServiceProvider
{
    /**
    * Perform post-registration booting of services.
    *
    * @return void
    */
    public function boot()
    {
        Storage::extend('dropbox', function ($app, $config) {
            $client = new DropboxClient(
                $config['authorization_token']
            );

            return new Filesystem(new DropboxAdapter($client));
        });
    }

    /**
    * Register bindings in the container.
    *
    * @return void
    */
    public function register()
    {
        //
    }
}
```

El primer argumento del método `extend` es el nombre del driver y el segundo es una Closure que recibe las variables `$app` y `$config`. La Closure resolver debe retornar una instancia de `League\Flysystem\Filesystem`. La variable `$config` contiene los valores definidos en `config/filesystems.php` para el disco especificado.

Luego, registra el proveedor de servicios en tu archivo de configuración `config/app.php`:

```php
'providers' => [
    // ...
    App\Providers\DropboxServiceProvider::class,
];
```

Una vez que has creado y registrado el proveedor de servicios de la extensión, puedes usar el driver `dropbox` en tu archivo de configuración `config/filesystems.php`.