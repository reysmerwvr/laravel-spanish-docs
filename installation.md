# Instalación

- [Instalación](#installation)
    - [Requerimientos Del Servidor](#server-requirements)
    - [Instalar Laravel](#installing-laravel)
    - [Configuración](#configuration)
- [Configuración Del Servidor Web](#web-server-configuration)
    - [URLs Amigables](#pretty-urls)

<a name="installation"></a>
## Instalación

> {video} ¿Eres un aprediz visual? Laracasts proporciona una [introducción gratuita a Laravel](http://laravelfromscratch.com) para los recién llegados al Framework. Es un excelente lugar para comenzar tu aventura.

<a name="server-requirements"></a>
### Requerimientos Del Servidor

El framework Laravel tiene algunos requerimientos de sistema. Por supuesto, todos estos requerimientos ya están cubiertos por la máquina virtual [Laravel Homestead](/docs/{{version}}/homestead), así que es altamente recomendable que uses Homestead como tu entorno local de desarrollo para Laravel.

Sin embargo, si no está utilizando Homestead, deberás asegurarte de que tu servidor cumpla con los siguientes requerimientos:

<div class="content-list" markdown="1">
- PHP >= 7.1.3
- Extensión de PHP OpenSSL PHP
- Extensión de PHP PDO PHP
- Extensión de PHP Mbstring PHP
- Extensión de PHP Tokenizer PHP
- Extensión de PHP XML PHP
</div>

<a name="installing-laravel"></a>
### Instalar Laravel

Laravel utiliza [Composer](https://getcomposer.org) para administrar sus dependencias. Por lo que, antes de utilizar Laravel, deberás asegurarte de tener Composer instalado en tu sistema.

#### Por Medio Del Instalador De Laravel

Primero, descarga el instalador de Laravel usando Composer:

    composer global require "laravel/installer"

ASegurate de colocar el directorio `vendor/bin` en tu `$PATH` para que el ejecutable de Laravel pueda ser localizado en tu sistema. Este directorio existe en diferentes ubicaciones según el sistema operativo que estés utilizando; sin embargo, algunas de las ubicaciones más comunes son las siguientes:

<div class="content-list" markdown="1">
- macOS: `$HOME/.composer/vendor/bin`
- GNU / Distribuciones Linux: `$HOME/.composer/vendor/bin`
</div>

Una vez instalado, el comando `laravel new` ceará una instalación fresca de Laravel en el directorio que especifiques. Por ejemplo, `laravel new blog` va a crear un directorio `blog` que contendrá una instalación fresca de Laravel con todas las dependiencias de Laravel ya instaladas:

    laravel new blog

#### Por Medio Del Comando Composer Create-Project

Alternativamente, puedes también instalar Laravel ejecutando el comando de Composer `create-project` en tu terminal:

    composer create-project --prefer-dist laravel/laravel blog

#### Servidor De Desarrollo Local

Si tienes instalado PHP de manera local y deseas utilizar el servidor de desarrollo incorporado en PHP para servir tu aplicación, puedes usar el comando de Artisan `serve`. Este comando va a iniciar un servidor de desarrollo en `http://localhost:8000`:

    php artisan serve

Desde luego, se tienen disponibles otras opciones de servidores de desarrollo más robustas como [Homestead](/docs/{{version}}/homestead) y [Valet](/docs/{{version}}/valet).

<a name="configuration"></a>
### Configuración

#### Directorio Público

Después de haber instalado Laravel, deberás configurar el documento raíz / de tu servidor web para que sea el directorio `public`. El archivo `index.php` en este directorio funciona como controlador frontal para todas las peticiones HTTP que entran a tu aplicación.

#### Configuración De Archivos

Todos los archivos de configuración para el framework Laravel están almacenados en el directorio `config`. Cada opción está documentada, así que siéntete libre de observar a través de estos archivos y sentirte familiar con las opciones disponibles para ti.

#### Permisos De Directorios

Después de haber instalado Laravel, necesitarás congigurar algunos permisos. Los directorios dentro de `storage` y `bootstrap/cache` deberán tener permiso de escritura para tu servidor web o Laravel no va a funcionar. Si estás utilizando la máquina virtual [Homestead](/docs/{{version}}/homestead), estos permisos ya están establecidos.

#### Llave De Aplicación

Lo siguiente que debes hacer después de instalar Laravel es establecer una llave de aplicación a una cadena aleatoria. Si instaló Laravel por medio de Composer o el instalador de Larave, esta llave ya ha sido establecida por el comando `php artisan key:generate`.

Típicamente, esta cadena debe tener una longitud de 32 caracteres. La llave se puede establecer en el archivo de entorno `.env`. Si no has renombrado el archivo `.env.example` a `.env`, deberás hacerlo ahora. **Si la llave de la aplicación no está establecida, ¡las sesiones de tu usuario y otros datos encriptados no serán seguros!**

#### Configuración Adicional

Laravel casi no necesita de otra configuración adicional. ¡Eres libre de empezar a desarrollar! Sin embargo, puede que desees revisar el archivo `config/app.php` y su documentación. Contiene varias opciones como `timezone` y `locale` que es posible que desees ajustar en tu aplicación.

También puedes configurar componentes adicionales a Laravel, tales como:

<div class="content-list" markdown="1">
- [Cache](/docs/{{version}}/cache#configuration)
- [Base de Datos](/docs/{{version}}/database#configuration)
- [Sesiones](/docs/{{version}}/session#configuration)
</div>

<a name="web-server-configuration"></a>
## Configuración Del Servidor Web

<a name="pretty-urls"></a>
### URLs Amigables

#### Apache

Laravel incluye un archivo `public/.htaccess` que es utilizado para proporcionar URLs sin el controlador frontal `index.php` en la ruta. Antes de servir tu aplicación de Laravel con Apache, asegúrate de habilitar el módulo `mod_rewrite` para que su archivo `.htaccess` funcione correctamente.

Si el archivo `.htaccess` que viene con Laravel no funciona con tu instalación de Apache, intenta con esta alternativa:

    Options +FollowSymLinks
    RewriteEngine On

    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]

#### Nginx

Si estás utilizando Nginx, la siguiente directiva en la configuación de tu sitio va a dirigir todas las peticiones al controlador frontal `index.php`:

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

Desde luego, cuando uses [Homestead](/docs/{{version}}/homestead) o [Valet](/docs/{{version}}/valet), las URLs amigables estarán automáticamente configuradas.
