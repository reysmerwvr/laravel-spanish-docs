::: v-pre

# Instalación

- [Instalación](#installation)
    - [Requisitos Del Servidor](#server-requirements)
    - [Instalar Laravel](#installing-laravel)
    - [Configuración](#configuration)
- [Configuración Del Servidor Web](#web-server-configuration)
    - [URLs Amigables](#pretty-urls)

<a name="installation"></a>
## Instalación

::: tip
¿Eres un aprediz visual? Laracasts proporciona una [introducción gratuita a Laravel](http://laravelfromscratch.com) para los recién llegados al framework. Es un excelente lugar para comenzar tu aventura.
:::

<a name="server-requirements"></a>
### Requisitos Del Servidor

El framework Laravel tiene algunos requisitos del sistema. Todos estos requisitos son cubiertos por la máquina virtual [Laravel Homestead](/docs/5.8/homestead), así que es altamente recomendable que uses Homestead como tu entorno local de desarrollo de Laravel.

Sin embargo, si no estás utilizando Homestead, deberás asegurarte de que tu servidor cumpla con los siguientes requisitos:

- PHP >= 7.1.3
- Extensión OpenSSL de PHP 
- Extensión PDO de PHP 
- Extensión Mbstring de PHP 
- Extensión Tokenizer de PHP 
- Extensión XML de PHP
- Extensión Ctype de PHP
- Extensión JSON de PHP
- Extensión BCMath de PHP

<a name="installing-laravel"></a>
### Instalar Laravel

Laravel utiliza [Composer](https://getcomposer.org) para administrar sus dependencias. Por lo que, antes de utilizar Laravel, deberás asegurarte de tener Composer instalado en tu sistema.

#### Mediante El Instalador De Laravel

Primero, descarga el instalador de Laravel usando Composer:

```php
composer global require laravel/installer    
```

Asegurate de colocar el directorio `vendor/bin` en tu `$PATH` para que el ejecutable de Laravel pueda ser localizado en tu sistema. Este directorio existe en diferentes ubicaciones según el sistema operativo que estés utilizando; sin embargo, algunas de las ubicaciones más comunes son las siguientes:

- macOS: `$HOME/.composer/vendor/bin`
- GNU / Distribuciones Linux: `$HOME/.config/composer/vendor/bin`
- Windows: `%USERPROFILE%\AppData\Roaming\Composer\vendor\bin`

Una vez instalado, el comando `laravel new` creará una nueva instalación de Laravel en el directorio que especifiques. Por ejemplo, `laravel new blog` creará un directorio `blog` que contendrá una nueva instalación de Laravel con todas las dependiencias de Laravel ya instaladas:

```php
laravel new blog
```

#### Mediante Composer Create-Project

Alternativamente, también puedes instalar Laravel ejecutando el comando de Composer `create-project` en tu terminal:

```php
composer create-project --prefer-dist laravel/laravel blog
```

#### Servidor De Desarrollo Local

Si tienes instalado PHP de manera local y te gustaría utilizar el servidor de desarrollo incorporado en PHP para servir tu aplicación, puedes usar el comando de Artisan `serve`. Este comando iniciará un servidor de desarrollo en `http://localhost:8000`:

```php
php artisan serve    
```

Otras opciones de desarrollo local más robustas están disponibles mediante [Homestead](/docs/5.8/homestead) y [Valet](/docs/5.8/valet).

<a name="configuration"></a>
### Configuración

#### Directorio Público

Después de haber instalado Laravel, deberás configurar el documento raíz de tu servidor web para que sea el directorio `public`. El archivo `index.php` en este directorio funciona como controlador frontal (front controller) para todas las peticiones HTTP que entran a tu aplicación.

#### Archivos De Configuración

Todos los archivos de configuración para el framework Laravel están almacenados en el directorio `config`. Cada opción está documentada, así que siéntete libre de revisar estos archivos y familiarizarte con las opciones disponibles para ti.

#### Permisos Para Directorios

Después de haber instalado Laravel, necesitarás congigurar algunos permisos. Los directorios dentro de `storage` y `bootstrap/cache` deberán tener permiso de escritura para tu servidor web o Laravel no va a funcionar. Si estás utilizando la máquina virtual [Homestead](/docs/5.8/homestead), estos permisos ya están establecidos.

#### Clave De La Aplicación

Lo siguiente que debes hacer después de instalar Laravel es establecer la clave de tu aplicación a una cadena aleatoria. Si instalastes Laravel mediante Composer o el instalador de Laravel, esta clave ya ha sido establecida por el comando `php artisan key:generate`.

Típicamente, esta cadena debe tener una longitud de 32 caracteres. La clave puede ser establecida en el archivo de entorno `.env`. Si no has renombrado el archivo `.env.example` a `.env`, deberás hacerlo ahora. **Si la clave de la aplicación no está establecida, ¡las sesiones de usuario y otros datos encriptados no serán seguros!**

#### Configuración Adicional

Laravel casi no necesita de configuración adicional. ¡Eres libre de empezar a desarrollar! Sin embargo, puede que quieras revisar el archivo `config/app.php` y su documentación. Contiene varias opciones como `timezone` y `locale` que es posible que desees ajustar en tu aplicación.

También puede que quieras configurar algunos componentes adicionales de Laravel, como:

<div class="content-list" markdown="1">
- [Cache](/docs/5.8/cache#configuration)
- [Base de Datos](/docs/5.8/database#configuration)
- [Sesiones](/docs/5.8/session#configuration)
</div>

<a name="web-server-configuration"></a>
## Configuración Del Servidor Web

<a name="pretty-urls"></a>
### URLs Amigables

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

Cuando uses [Homestead](/docs/5.8/homestead) o [Valet](/docs/5.8/valet), las URLs amigables serán configuradas automáticamente.