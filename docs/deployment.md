::: v-pre

# Despliegue

- [Introducción](#introduction)
- [Configuración Del Servidor](#server-configuration)
    - [Nginx](#nginx)
- [Optimización](#optimization)
    - [Optimizar Autoloader](#autoloader-optimization)
    - [Optimizar Configuración Local](#optimizing-configuration-loading)
    - [Optimizar Carga De Rutas](#optimizing-route-loading)
- [Deploy En Forge](#deploying-with-forge)

<a name="introduction"></a>
## Introducción

Una vez que estés listo para hacer deploy de tu aplicación de Laravel a producción, deberías considerar algunos aspectos importantes para hacer que tu aplicación se ejecute de la forma más eficientemente posible. En este documento, vamos a cubrir muy buenos puntos para hacer que tu aplicación de Laravel sea desplegada correctamente.

<a name="server-configuration"></a>
## Configuración Del Servidor

<a name="nginx"></a>
### Nginx

Si estás haciendo deploy de tu aplicación hacia un servidor que está ejecutando Nginx, puedes utilizar el siguiente archivo de configuración como punto de inicio para configurar tu servidor web. Principalmente, este archivo tendrá que ser personalizado dependiendo de la configuración de tu servidor. Si deseas asistencia en la administración de tu servidor, considera utilizar un servicio como [Laravel Forge](https://forge.laravel.com):

```php
server {
    listen 80;
    server_name example.com;
    root /example.com/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    index index.html index.htm index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php7.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

<a name="optimization"></a>
## Optimización

<a name="autoloader-optimization"></a>
### Optimizar Autoloader

Al hacer deploy a producción, debes asegurarte de optimizar el autoloader de Composer, para que éste pueda localizar rápidamente el archivo apropiado para cargar una clase dada:

```php
composer install --optimize-autoloader --no-dev
```

::: tip
Adicionalmente, para optimizar el autoloader, deberás asegurarte de incluir siempre el archivo `composer.lock` al controlador de versiones de tu proyecto. Las dependencias de tu proyecto se instalarán más rápido cuando exista el archivo `composer.lock`.
:::

<a name="optimizing-configuration-loading"></a>
### Optimizar Configuración Local

Al hacer deploy de tu aplicación a producción, deberás asegurarte de ejecutar el comando de Artisan `config:cache` durante el proceso de deploy:

```php
php artisan config:cache
```

Este comando combinará todos los archivos de configuración de Laravel en un solo archivo en caché, lo que reduce en gran medida la cantidad de consultas que el framework debe hacer al sistema de archivos cuando carga tus valores de configuración.

::: danger Nota
Si ejecutas el comando `config:cache` durante el proceso de despliegue, debes asegurarte de que sólo estás llamando a la función `env` desde dentro de tus archivos de configuración. Una vez que la configuración ha sido agregada, el archivo `.env` no será cargado y todas las llamadas a la función `env` retornarán `null`.
:::

<a name="optimizing-route-loading"></a>
### Optimizar Configuración Local

Si estás construyendo una aplicación muy grande que contenga muchas rutas, deberías asegurarte de ejecutar el comando `route:cache` de Artisan durante el proceso de deploy.

```php
php artisan route:cache
```

Este comando reduce todas tus rutas registradas en una única llamada al método dentro del archivo en cache, mejorando el rendimiento de registro de rutas cuando se tienen cientos de ellas.

::: danger Nota
Ya que esta característica utiliza la serialización de PHP, sólo se pueden almacenar en cache las rutas para las aplicaciones que estén basadas exclusivamente en controladores. PHP no es capaz de serealizar Closures.
:::

<a name="deploying-with-forge"></a>
## Deploy En Forge

Si no estás del todo listo para administrar la configuración de tu servidor o si no te sientes cómodo configurando los diferentes servicios necesarios para ejecutar aplicaciones robustas de Laravel, [Laravel Forge](https://forge.laravel.com) es una excelente alternativa.

Laravel Forge puede crear servidores en varios proveedores de infraestructura como pueden ser DigitalOcean, Linode, AWS y más. Adicionalmente, Forge instala y administra todas las herramientas necesarias para construir aplicaciones robustas de Laravel como Nginx, MySQL, Redis, Memcached, Beanstalk y más.