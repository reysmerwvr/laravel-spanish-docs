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

El framework Laravel tiene algunos requerimientos de sistema. Por supuesto, todos estos requerimientos ya están cubiertos por la máquina virtual de [Laravel Homestead](/docs/{{version}}/homestead), así que es altamente recomendable que utilice Homestead como su entorno local de desarrollo para Laravel.

Sin embargo, si no está utilizando Homestead, deberá asegurarse que su servidor cumpla con los siguientes requerimientos:

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

Laravel utiliza [Composer](https://getcomposer.org) para administrar sus dependencias. Por lo que, antes de utilizar Laravel, deberá asegurarse de tener Composer instalado en su sistema.

#### Por Medio Del Instalador De Laravel

Primero, descargue el instalador de Laravel usando Composer:

    composer global require "laravel/installer"

Asegurese de colocar el directorio `vendor/bin` en su `$PATH` para que el ejecutable de Laravel pueda ser localizado en su sistema. Este directorio existe en diferentes ubicaciones según el sistema operativo que esté utilizando; sin embargo, algunas de las ubicaciones más comunes son las siguientes:

<div class="content-list" markdown="1">
- macOS: `$HOME/.composer/vendor/bin`
- GNU / Distribuciones Linux: `$HOME/.composer/vendor/bin`
</div>

Una vez instalado, el comando `laravel new` ceará una instalación fresca de Laravel en el directorio que especifique. Por ejemplo, `laravel new blog` va a crear un directorio `blog` que contendrá una instalación fresca de Laravel con todas las dependiencias de Laravel ya instaladas:

    laravel new blog

#### Por Medio Del Comando Composer Create-Project

Alternativamente, puede también instalar Laravel ejecutando el comando de Composer `create-project` en su terminal:

    composer create-project --prefer-dist laravel/laravel blog

#### Servidor De Desarrollo Local

Si tiene instalado PHP de manera local y desea utilizar el servidor de desarrollo incorporado en PHP para servir su aplicación, puede usar el comando de Artisan `serve`. Este comando va a iniciar un servidor de desarrollo en `http://localhost:8000`:

    php artisan serve

Desde luego, se tienen disponibles otras opciones de servidores de desarrollo más robustas como [Homestead](/docs/{{version}}/homestead) y [Valet](/docs/{{version}}/valet).

<a name="configuration"></a>
### Configuración

#### Directorio Público

Después de haber instalado Larave, deberá configurar el documento raíz / de su servidor web para que sea el directorio `public`. El archivo `index.php` en este directorio funciona como controlador frontal para todas las peticiones HTTP entrantes a su aplicación.

#### Configuración De Archivos

Todos los archivos de configuración para el framework Laravel están almacenados en el directorio `config`. Cada opción está documentada, así que sientase libre de observar a través de estos archivos y sentirse familiar con las opciones disponibles para usted.

#### Permisos De Directorios

Después de haber instalado Laravel, necesitará congigurar algunos permisos. Los directorios dentro de `storage` y `bootstra/cache` deberán tener permso de escritura para su servidor web o Laravel no va a funcionar. Si está utilizando la máquina virtual de [Homestead](/docs/{{version}}/homestead), estos permisos ya están establecidos.

#### Llave De Aplicación

Lo siguiente que debe hacer después de instalar Laravel es estableser una llave de aplicación a una cadena aleatoria. Si instaló Laravel por medio de Composer o el instalador de Larave, esta llave ya ha sido establecida por el comando `php artisan key:generate`.

Típicamente, esta cadena debe tener una longitud de 32 caracteres. La llave se puede establecer en el archivo de entorno `.env`. Si no ha renombrado el archivo `.env.example` a `.env`, deberá hacerlo ahora. **Si la llave de la aplicación no está establecida, ¡las sesiones de su usuario y otros datos encriptados no serán seguros!**

#### Configuración Adicional

Laravel casi no necesita de otra configuración adicional. ¡Usted es libre de empezar a desarrollar! Sin embargo, puede que desee revisar el archivo `config/app.php` y su documentación. Contiene varias opciones como `timezone` y `locale` que es posible que desee ajustar a su aplicación.

También puede configurar componentes adicionales a Laravel, tales como:

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

Laravel incluye un archivo `public/.htaccess` que es utilizado para proporcionar URLs sin el controlador frontal `index.php` en la ruta. Antes de servir su aplicación de Laravel con Apache, asegúrese de habilitar el módulo `mod_rewrite` para que su archivo `.htaccess` funcione correctamente.

Si el archivo `.htaccess` que viene con Laravel no funciona con su instalación de Apache, intente con esta alternativa:

    Options +FollowSymLinks
    RewriteEngine On

    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]

#### Nginx

Si está utilizando Nginx, la siguiente directiva en la configuación de su sitio, va a dirigir todas las peticiones al controlador frontal `index.php`:

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

Desde luego, cuando utilice [Homestead](/docs/{{version}}/homestead) o [Valet](/docs/{{version}}/valet), las URLs amigables estarán automáticamente configuradas.
