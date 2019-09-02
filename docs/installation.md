::: v-pre

# Instalación

- [Instalación](#installation)
    - [Requisitos del servidor](#server-requirements)
    - [Instalar Laravel](#installing-laravel)
    - [Configuración](#configuration)
- [Configuración del servidor web](#web-server-configuration)
    - [URLs amigables](#pretty-urls)

<a name="installation"></a>
## Instalación

::: tip TIP
¿Te gustaría un curso en video para profundizar tu aprendizaje? En Styde cuentas con un [completo curso de Laravel](https://styde.net/laravel-5/) totalmente gratuito que incluye más de 40 lecciones.
:::

<a name="server-requirements"></a>
### Requisitos del servidor

El framework Laravel tiene algunos requisitos del sistema. Todos estos requisitos son cubiertos por la máquina virtual [Laravel Homestead](/homestead.html), así que es altamente recomendable que uses Homestead como tu entorno local de desarrollo de Laravel.

Sin embargo, si no estás utilizando Homestead, deberás asegurarte de que tu servidor cumpla con los siguientes requisitos:

- PHP >= 7.1.3
- BCMath PHP Extension
- Ctype PHP Extension
- JSON PHP Extension
- Mbstring PHP Extension
- Extensión OpenSSL de PHP 
- Extensión PDO de PHP 
- Extensión Tokenizer de PHP 
- Extensión XML de PHP

<a name="installing-laravel"></a>
### Instalar Laravel

Laravel utiliza [Composer](https://getcomposer.org) para administrar sus dependencias. Por lo que, antes de utilizar Laravel, deberás asegurarte de tener Composer instalado en tu sistema.

::: tip TIP
En la lección [instalación de Composer y Laravel](https://styde.net/instalacion-de-composer-y-laravel/) del curso gratuito [Laravel desde cero](https://styde.net/laravel-5/) de Styde puedes ver el proceso de instalación paso a paso.
:::

#### Mediante el instalador de Laravel

Primero, descarga el instalador de Laravel usando Composer:

```php
composer global require laravel/installer    
```

Asegurate de colocar el directorio `vendor/bin` en tu `$PATH` para que el ejecutable de Laravel pueda ser localizado en tu sistema. Este directorio existe en diferentes ubicaciones según el sistema operativo que estés utilizando; sin embargo, algunas de las ubicaciones más comunes son las siguientes:

- macOS y distribuciones GNU/Linux: `$HOME/.composer/vendor/bin`
- Windows: `%USERPROFILE%\AppData\Roaming\Composer\vendor\bin`

Una vez instalado, el comando `laravel new` creará una nueva instalación de Laravel en el directorio que especifiques. Por ejemplo, `laravel new blog` creará un directorio `blog` que contendrá una nueva instalación de Laravel con todas las dependiencias de Laravel ya instaladas:

```php
laravel new blog
```

#### Mediante composer create-project

Alternativamente, también puedes instalar Laravel ejecutando el comando de Composer `create-project` en tu terminal:

```php
composer create-project --prefer-dist laravel/laravel blog
```

#### Servidor de desarrollo local

Si tienes instalado PHP de manera local y te gustaría utilizar el servidor de desarrollo incorporado en PHP para servir tu aplicación, puedes usar el comando de Artisan `serve`. Este comando iniciará un servidor de desarrollo en `http://localhost:8000`:

```php
php artisan serve    
```

Otras opciones de desarrollo local más robustas están disponibles mediante [Homestead](/homestead.html) y [Valet](/valet.html).

<a name="configuration"></a>
### Configuración

#### Directorio público

Después de haber instalado Laravel, deberás configurar el documento raíz de tu servidor web para que sea el directorio `public`. El archivo `index.php` en este directorio funciona como controlador frontal (front controller) para todas las peticiones HTTP que entran a tu aplicación.

#### Archivos de configuración

Todos los archivos de configuración para el framework Laravel están almacenados en el directorio `config`. Cada opción está documentada, así que siéntete libre de revisar estos archivos y familiarizarte con las opciones disponibles para ti.

#### Permisos para directorios

Después de haber instalado Laravel, necesitarás configurar algunos permisos. Los directorios dentro de `storage` y `bootstrap/cache` deberán tener permiso de escritura para tu servidor web o Laravel no va a funcionar. Si estás utilizando la máquina virtual [Homestead](/homestead.html), estos permisos ya están establecidos.

#### Clave de la aplicación

Lo siguiente que debes hacer después de instalar Laravel es establecer la clave de tu aplicación a una cadena aleatoria. Si instalastes Laravel mediante Composer o el instalador de Laravel, esta clave ya ha sido establecida por el comando `php artisan key:generate`.

Típicamente, esta cadena debe tener una longitud de 32 caracteres. La clave puede ser establecida en el archivo de entorno `.env`. Si no has renombrado el archivo `.env.example` a `.env`, deberás hacerlo ahora. **Si la clave de la aplicación no está establecida, ¡las sesiones de usuario y otros datos encriptados no serán seguros!**

#### Configuración adicional

Laravel casi no necesita de configuración adicional. ¡Eres libre de empezar a desarrollar! Sin embargo, puede que quieras revisar el archivo `config/app.php` y su documentación. Contiene varias opciones como `timezone` y `locale` que es posible que desees ajustar en tu aplicación.

También puede que quieras configurar algunos componentes adicionales de Laravel, como:

- [Cache](/cache.html#configuration)
- [Base de Datos](/database.html#configuration)
- [Sesiones](/session.html#configuration)

<a name="web-server-configuration"></a>
## Configuración del servidor web

<a name="pretty-urls"></a>
### URLs amigables

#### Apache

Laravel incluye un archivo `public/.htaccess` que es utilizado para proporcionar URLs sin el controlador frontal `index.php` en la ruta. Antes de servir tu aplicación de Laravel con Apache, asegúrate de habilitar el módulo `mod_rewrite` para que tu archivo `.htaccess` funcione correctamente.

Si el archivo `.htaccess` que viene con Laravel no funciona con tu instalación de Apache, prueba esta alternativa:

```php
Options +FollowSymLinks -Indexes
RewriteEngine On

RewriteCond %{HTTP:Authorization} .
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.php [L]
```

#### Nginx

Si estás utilizando Nginx, la siguiente directiva en la configuación de tu sitio va a dirigir todas las peticiones al controlador frontal `index.php`:

```php
location / {
    try_files $uri $uri/ /index.php?$query_string;
}
```

Cuando uses [Homestead](/homestead.html) o [Valet](/valet.html), las URLs amigables serán configuradas automáticamente.
