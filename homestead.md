::: v-pre

# Laravel Homestead

- [Introducción](#introduction)
- [Instalación Y Configuración](#installation-and-setup)
    - [Primeros Pasos](#first-steps)
    - [Configurar Homestead](#configuring-homestead)
    - [Iniciar El Box De Vagrant](#launching-the-vagrant-box)
    - [Instalación Por Proyecto](#per-project-installation)
    - [Instalación De MariaDB](#installing-mariadb)
    - [Instalación De MongoDB](#installing-mongodb)
    - [Instalación De Elasticsearch](#installing-elasticsearch)
    - [Instalación De Neo4j](#installing-neo4j)
    - [Alias](#aliases)
- [Uso Diario](#daily-usage)
    - [Acceder A Homestead Globalmente](#accessing-homestead-globally)
    - [Conexión Vía SSH](#connecting-via-ssh)
    - [Conectar A Base De Datos](#connecting-to-databases)
    - [Respaldos de Base de Datos](#database-backups)
    - [Agregar Sitios Adicionales](#adding-additional-sites)
    - [Variables De Entorno](#environment-variables)
    - [Configurar Tareas Programadas](#configuring-cron-schedules)
    - [Configurar Mailhog](#configuring-mailhog)
    - [Configurar Minio](#configuring-minio)
    - [Puertos](#ports)
    - [Compartir Tu Entorno](#sharing-your-environment)
    - [Múltiples Versiones PHP](#multiple-php-versions)
    - [Servidores Web](#web-servers)
    - [Correo Electrónico](#mail)
    - [Interfaces De Red](#network-interfaces)
- [Extender Homestead](#extending-homestead)
- [Actualizar Homestead](#updating-homestead)
- [Configuraciones Específicas De Proveedor](#provider-specific-settings)
    - [VirtualBox](#provider-specific-virtualbox)

<a name="introduction"></a>
## Introducción

Laravel se ha esforzado en hacer que toda la experiencia del desarrollo de PHP sea placentera, incluyendo el entorno de desarrollo local. [Vagrant](https://www.vagrantup.com) provee una manera simple y elegante de administrar y provisionar máquinas virtuales.

Laravel Homestead es el box de Vagrant pre-empaquetado oficial que brinda un maravilloso entorno de desarrollo sin la necesidad de que tengas que instalar PHP, un serivor web, ni ningún otro servidor de software en tu máquina local. ¡Basta de preocuparte por estropear tu sistema operativo! Los boxes de Vagrant son completamente desechables. Si algo sale mal, simplemente puedes destruir y volver a crear el box en cuestión de minutos.

Homestead puede ejecutarse en sistemas Windows, Mac y Linux e incluye el servidor Web Nginx, PHP 7.3, PHP 7.2, PHP 7.1, MySQL, PostgreSQL, Redis, Memcached, Node y todas las demás herramientas que necesitas para desarrollar aplicaciones de Laravel sorprendentes.

::: danger Nota
Si estás utilizando Windows, puede que necesites habilitar la virtualización por hardware (VT-x). Usualmente puede habilitarse en el BIOS. Si estás utilizando Hyper-V en un sistema UEFI puede que requieras también deshabilitar Hyper-V para poder acceder a VT-x.
:::

<a name="included-software"></a>
### Software Incluido

- Ubuntu 18.04
- Git
- PHP 7.3
- PHP 7.2
- PHP 7.1
- Nginx
- Apache (Opcional)
- MySQL
- MariaDB (Opcional)
- Sqlite3
- PostgreSQL
- Composer
- Node (Con Yarn, Bower, Grunt, y Gulp)
- Redis
- Memcached
- Beanstalkd
- Mailhog
- Neo4j (Opcional)
- MongoDB (Opcional)
- Elasticsearch (Opcional)
- ngrok
- wp-cli
- Zend Z-Ray
- Go
- Minio

<a name="installation-and-setup"></a>
## Instalación Y Configuración

<a name="first-steps"></a>
### Primeros Pasos

Antes de iniciar tu entorno de Homestead, debes instalar [VirtualBox](https://www.virtualbox.org/wiki/Downloads), [VMware](https://www.vmware.com), [Parallels](https://www.parallels.com/products/desktop/) o [Hyper-V](https://docs.microsoft.com/en-us/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v) además de [Vagrant](https://www.vagrantup.com/downloads.html). Todos estos paquetes de software cuentan con un instalador fácil de usar para todos los sistemas operativos populares.

Para utilizar el proveedor de VMWare, necesitarás comprar tanto VMWare Fusion / Workstation y el [plugin de Vagrant para VMWare](https://www.vagrantup.com/vmware). A pesar de que esto no es gratuito, VMWare ofrece un mayor desempeño en velocidad al compartir directorios.

Para utilizar el proveedor de Parallels, debes instalar el [plugin de Vagrant para Parallels](https://github.com/Parallels/vagrant-parallels). Es totalmente gratuito.

Debido a las [limitaciones de Vagrant](https://www.vagrantup.com/docs/hyperv/limitations.html), el proveedor de Hyper-V ignora todas las configuraciones de red.

#### Instalar El Box De Vagrant Para Homestead

Una vez que estén instalados VirtualBox / VMWare y Vagrant, deberás añadir el box `laravel/homestead` a tu instalación de Vagrant ejecutando el siguiente comando en la terminal. Esto tomará algunos minutos para descargar el box, dependiendo de tu velocidad de internet:

```php
vagrant box add laravel/homestead
```

Si el comando falla, asegurate de que tu instalación de Vagrant esté actualizada.

#### Instalar Homestead

Puedes instalar Homestead clonando el repositorio en tu máquina host. Considera clonar el repositorio en una carpeta `Homestead` dentro de tu directorio "home", ya que el box de Homestead actuará como host para todos tus proyectos de Laravel:

```php
git clone https://github.com/laravel/homestead.git ~/Homestead
```

Debes hacer checkout a alguna versión etiquetada de Homestead ya que la rama `master` no siempre es estable. Puedes encontrar la versión estable más reciente en la [Página de Releases de GitHub](https://github.com/laravel/homestead/releases):

```php
cd ~/Homestead

// Clonar al release deseado...
git checkout v8.0.1
```

Una vez que hayas clonado el repositorio, ejecuta el comando `bash init.sh` desde el directorio Homestead para crear el archivo de configuración `Homestead.yaml`. El archivo `Homestead.yaml` estará situado en el directorio Homestead:

```php
// Mac / Linux...
bash init.sh

// Windows...
init.bat
```

<a name="configuring-homestead"></a>
### Configurar Homestead

#### Especificando Tu Proveedor

La clave `provider` en tu archivo `Homestead.yaml` indica cuál proveedor de Vagrant será utilizado: `virtualbox`, `vmware_fusion`, `vmware_workstation`, `parallels` o `hyperv`. Puedes especificar en esta opción el provedor de tu preferencia.

```php
provider: virtualbox
```

#### Configurar Directorios Compartidos

La propiedad `folders` del archivo `Homestead.yaml` enlista todos los directorios que deseas compartir con tu entorno de Homestead. A medida que los archivos dentro de estos directorios cambien, estos se mantendrán sincronizados con tu máquina local y el entorno de Homestead. Puedes configurar tantos directorios compartidos como sean necesarios:

```php
folders:
    - map: ~/code
        to: /home/vagrant/code
```

Si solo estás creando unos cuantos sitios, este mapeo genérico funcionará bien. Sin embargo, mientras el número de sitios continúe creciendo, podrás comenzar a experimentar algunos problemas de desempeño. Estos problemas pueden ser muy evidentes en máquinas con pocos recursos o en proyectos que contengan una cantidad de archivos de gran tamaño. Si experimentas estos problemas, trata de mapear cada proyecto a tu propio directorio de Vagrant:

```php
folders:
    - map: ~/code/project1
        to: /home/vagrant/code/project1

    - map: ~/code/project2
        to: /home/vagrant/code/project2
```

Para habilitar [NFS](https://www.vagrantup.com/docs/synced-folders/nfs.html), solo necesitarás agregar un simple flag en la configuración de tu directorio sincronizado:

```php
folders:
    - map: ~/code
        to: /home/vagrant/code
        type: "nfs"
```

::: danger Nota
Cuando uses NFS, debes considerar instalar el plugin [vagrant-winnfsd](https://github.com/winnfsd/vagrant-winnfsd). Este plugin mantendrá correctamente el usuario / grupo para los archivos y directorios dentro del box de Homestead.
:::

También puedes indicar cualquier opción soportada por los [Directorios Sincronizados](https://www.vagrantup.com/docs/synced-folders/basic_usage.html) de Vagrant, listándolos bajo la clave `options`:

```php
folders:
    - map: ~/code
        to: /home/vagrant/code
        type: "rsync"
        options:
            rsync__args: ["--verbose", "--archive", "--delete", "-zz"]
            rsync__exclude: ["node_modules"]
```

#### Configurar Sitios De Nginx

¿No estás familiarizado con Nginx? No hay problema. La propiedad `sites` te permitirá mapear un "dominio" a un directorio en tu entorno de Homestead de manera sencilla. Una configuración simple de un sitio está incluido en el archivo `Homestead.yaml`. Nuevamente, podrás añadir tantos sitios a tu entorno de Homestead como sea necesario. Homestead puede funcionar como un conveniente entorno virtualizado para cada proyecto de Laravel en el que estés trabajando:

```php
sites:
    - map: homestead.test
        to: /home/vagrant/code/my-project/public
```

Si cambias la propiedad `sites` apropiadamente después de haber provisionado el box de Homestead, deberás volver a ejecutar `vagrant reload --provision` para actualizar la configuración de Nginx en la máquina virtual.

#### El Archivo Hosts

Debes agregar los "dominios" para tus sitios de Nginx en el archivo `hosts` en tu máquina. El archivo `hosts` va a redirigir las peticiones de los sitios Homstead hacia tu máquina Homestead. En Mac y Linux, este archivo está ubicado en `/etc/hosts`. En Windows, este archivo está ubicado en `C:\Windows\System32\drivers\etc\hosts`. Las líneas que agregues a este archivo deberán verse de la siguiente forma:

```php
192.168.10.10  homestead.test
```

Debes asegurarte de que la IP indicada sea la misma que está en el archivo `Homestead.yaml`. Una vez que hayas añadido el dominio a tu archivo `hosts` y hayas iniciado el box de Vagrant podrás acceder al sitio desde el navegador web:

```php
http://homestead.test
```

<a name="launching-the-vagrant-box"></a>
### Iniciando El Box De Vagrant

Una vez que hayas editado el archivo `Homestead.yaml` a tu gusto, ejecuta el comando `vagrant up` desde tu directorio Homestead. Vagrant va a iniciar la máquina virtual y a configurar automáticamente tus directorios compartidos y sitios de Nginx.

Para destruir la máquina, debes utilizar el comando `vagrant destroy --force`.

<a name="per-project-installation"></a>
### Instalación Por Proyecto

En lugar de instalar Homestead globalmente y compartir el mismo box de Homestead para todos tus proyectos, también es posible configurar una instancia de Homestead para cada proyecto que necesites. Instalar Homestead por proyecto puede ser beneficioso si deseas crear un `Vagrantfile` en tu proyecto, permitiendo así a otras personas trabajar en el mismo proyecto ejecutando simplemente `vagrant up`.

Para instalar Homestead directamente en tu proyecto, debes hacerlo por medio de Composer:

```php
composer require laravel/homestead --dev
```

Una vez que Homestead haya sido instalado, usa el comando `make` para generar el archivo `Vagrantfile` y `Homestead.yaml` en la raíz de tu proyecto. El comando `make` configurará automáticamente las directivas `sites` y `folders` en el archivo `Homestead.yaml`.

Mac / Linux:

```php
php vendor/bin/homestead make
```

Windows:

```php
vendor\\bin\\homestead make
```

Después, ejecuta el comando `vagrant up` en tu terminal y podrás acceder a tu proyecto desde el navegador en `http://homestead.test`. Recuerda que aún vas a necesitar agregar una entrada para `homestead.test` en tu archivo `/etc/hosts` para el dominio de tu elección.

<a name="installing-mariadb"></a>
### Instalación De MariaDB

Si prefieres usar MariaDB en lugar de MySQL, debes agregar la opción `mariadb` en tu archivo `Homestead.yaml`. Esta opción removerá MySQL e instalará MariaDB. MariaDB funciona como un remplazo directo para MySQL, por lo que aún podrás seguir utilizando el driver `mysql` para configurar la base de datos en tu aplicación:

```php
box: laravel/homestead
ip: "192.168.10.10"
memory: 2048
cpus: 4
provider: virtualbox
mariadb: true
```

<a name="installing-mongodb"></a>
### Instalación De MongoDB

Para instalar MongoDB Community Edition, actualiza tu archivo `Homestead.yaml` con la siguiente opción de configuración:
	
```php
mongodb: true
```

La instalación por defecto establecerá el nombre de usuario de base de datos a `homestead` y su contraseña como `secret`.

<a name="installing-elasticsearch"></a>
### Instalación De Elasticsearch

Para instalar Elasticsearch, añade la opción `elasticsearch` en tu archivo `Homestead.yaml` y especifica una versión soportada, la cual puede ser una versión mayor o un número específico de versión (mayor.menor.parche). La instalación por defecto creará un cluster llamado 'homestead'. Nunca deberías dar a Elasticsearch más de la mitad de la memoria de tu sistema operativo, por lo que deberás asegurarte de que tu máquina tenga al menos el doble de la memoria asignada a Elasticsearch:

```php
box: laravel/homestead
ip: "192.168.10.10"
memory: 4096
cpus: 4
provider: virtualbox
elasticsearch: 6
```

::: tip
Echa un vistazo a la [documentación de Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current) para aprender a personalizar tu configuración.
:::

<a name="installing-neo4j"></a>
### Instalación De Neo4j

[Neo4j](https://neo4j.com/) es un sistema de manejo de bases de datos gráfico. Para instalar Neo4j Community Edition, actualiza tu archivo `Homestead.yaml` con la siguiente opción de configuración:

```php
neo4j: true
```

La instalación por defecto establecerá el nombre de usuario de base de datos como `homestead` y su contraseña como `secret`. Para acceder al navegador Neo4j, visita `http://homestead.test:7474` mediante tu navegador. Los puertos `7687` (Bolt), `7474` (HTTP), y `7473` (HTTPS) están listos para manejar peticiones desde el cliente Neo4j.

<a name="aliases"></a>
### Aliases

Puedes añadir alias de Bash a tu máquina de Homestead modificando el archivo `aliases` desde tu directorio de Homestead:

```php
alias c='clear'
alias ..='cd ..'
```

Después de haber actualizado el archivo `aliases`, debes volver a provisionar la máquina de Homestead usando el comando `vagrant reload --provision`. Con esto te podrás asegurar de que tus nuevos alias estén disponibles en la máquina.

<a name="daily-usage"></a>
## Uso Diario

<a name="accessing-homestead-globally"></a>
### Acceder a Homestead Globalmente

En ocasiones puede que requieras de iniciar Homestead con el comando `vagrant up` desde cualquier parte en tu sistema de archivos. Esto es posible en sistemas Mac / Linux al agregar una función Bash en tu Bash Profile. En Windows, esto puede lograrse al agregar un archivo "batch" en tu `PATH`. Estos scripts te permitirán ejecutar cualquier comando de Vagrant desde cualquier parte en tu sistema y automáticamente apuntarán el comando hacia tu instalación de Homestead:

#### Mac / Linux

```php
function homestead() {
    ( cd ~/Homestead && vagrant $* )
}
```

Asegurate de modificar la ruta `~/Homestead` en la función hacia la ubicación actual de tu instalación de Homestead. Una vez que hayas instalado la función, podrás ejecutar comandos como `homestead up` o `homestead ssh` desde cualquier parte en tu sistema de archivos.

#### Windows

Crea un archivo batch llamado `homestead.bat` en algua parte de tu equipo con los siguientes comandos:

```php
@echo off

set cwd=%cd%
set homesteadVagrant=C:\Homestead

cd /d %homesteadVagrant% && vagrant %*
cd /d %cwd%

set cwd=
set homesteadVagrant=
```

Asegurate de modificar la ruta de ejemplo `C:\Homestead` en el script por la ruta actual de tu instalación de Homestead. Después de crear el archivo, agrega la ubicación a tu `PATH`. Hecho esto podrás ejecutar comandos como `homestead up` o `homestead ssh` desde cualquier lado en tu sistema.

<a name="connecting-via-ssh"></a>
### Conexión Vía SSH

Puedes conectarte a tu máquina virtual por medio de SSH haciendo uso del comando `vagrant ssh` en la terminal desde tu directorio Homestead.

Pero, dado que probablemente requieras conectarte frecuentemente a tu máquina de Homestead, deberías considerar agregar la "función" descrita anteriormente en tu equipo host para poder conectarte de manera rápida a tu box de Homestead por medio de SSH.

<a name="connecting-to-databases"></a>
### Conectar A Base De Datos

Una base de datos `homestead` es configurada por defecto tanto para MySQL como para PostgreSQL. Para mayor conveniencia, el archivo de configuración de Laravel `.env` configura el framework para utilizar esta base de datos por defecto.

Para conectarte a tu base de datos de MySQL o de PostgreSQL desde el cliente de base de datos de tu equipo host, deberás conectarte hacia `127.0.0.1` en el puerto `33060` (MySQL) o `54320` (PostgreSQL). El nombre de usuario y contraseña para ambas bases de datos son `homestead` / `secret`.

::: danger Nota
Solo deberías utilizar estos puertos no estandares para conectarte a tus bases de datos desde tu equipo host. Deberás utilizar los puertos por defecto 3306 y 5432 en tu archivo de configuración para la base de datos de Laravel que se encuentra ejecutandose _dentro_ de la máquina virtual.
:::

<a name="database-backups"></a>
### Respaldos de Base de Datos

Homestead puede hacer respaldos de tu base de datos automáticamnte cuando tu box de Vagrant es destruida. Para utilizar esta característica, debes estar usando Vagrant 2.1.0 o una versión superior. O, si estás usando una versión inferior, debes instalar el plugin `vagrant-triggers`. Para activar los respaldos de base de datos automáticos, agrega la siguiente línea a tu archivo `Homestead.yaml`:

```php
backup: true
```

Una vez esté configurado, Homestead exportará tus bases de datos a los directorios `mysql_backup` y `postgres_backup` cuando se ejecute el comando `vagrant destroy`. Estos directorios pueden ser encontrados en la carpeta donde clonaste Homestead o en el root de tu proyecto si estás usando el método [instalación por proyecto](#per-project-installation).

<a name="adding-additional-sites"></a>
### Agregar Sitios Adicionales

Una vez que tu entorno de Homestead haya sido provisionado y esté en ejecución, es probable que requieras agregar sitios adicionales de Nginx para tu aplicación de Laravel. Puedes ejecutar tantas instalaciones de Laravel como desees, simplemente debes añadirlas a tu archivo `Homestead.yaml`.

```php
sites:
    - map: homestead.test
        to: /home/vagrant/code/my-project/public
    - map: another.test
        to: /home/vagrant/code/another/public
```

Si vagrant no está manejando tu archivo "hosts" de manera automática, también deberás agregar los nuevos sitios a este archivo.

```php
192.168.10.10  homestead.test
192.168.10.10  another.test
```

Una vez que el sitio ha sido agregado, ejecuta el comando `vagrant reload --provision` desde tu directorio de Homestead.

<a name="site-types"></a>
#### Tipos de Sitios

Homestead soporta varios tipos de sitios permitiéndote ejecutar fácilmente proyectos que no estén basados en Laravel. Por ejemplo, puedes agregar fácilmente una aplicación de Symfony en Homestead utilizando el tipo de sitio `symfony2`:

```php
sites:
    - map: symfony2.test
        to: /home/vagrant/code/my-symfony-project/web
        type: "symfony2"
```

Los tipos de sitios disponibles son: `apache`, `apigility`, `expressive`, `laravel` (por defecto), `proxy`, `silverstripe`, `statamic`, `symfony2`, `symfony4`y `zf`.

<a name="site-parameters"></a>
#### Parámetros de los Sitios

También puedes agregar valores adicionales de `fastcgi_param` en Nginx para tus sitios por medio de la directiva `params` en el sitio. Por ejemplo, agregar el parámetro `FOO` con el valor de `BAR`:

```php
sites:
    - map: homestead.test
        to: /home/vagrant/code/my-project/public
        params:
            - key: FOO
            value: BAR
```

<a name="environment-variables"></a>
### Variables De Entorno

Puedes especificar variables de entorno globales al agregarlas en tu archivo `Homestead.yaml`:

```php
variables:
    - key: APP_ENV
        value: local
    - key: FOO
        value: bar
```

Después de actualizar el archivo `Homestead.yaml`, deberás volver a provisionar la máquina ejecutando el comando `vagrant reload --provision`. Esto actualizará la configuración de PHP-FPM para todas las versiones instaladas de PHP y también actualizará el entorno para el usuario `vagrant`.

<a name="configuring-cron-schedules"></a>
### Configurar Tareas Programadas

Laravel proporciona una manera conveniente de ejecutar [tareas programadas](/docs/5.8/scheduling) al configurar las tareas por medio del comando de Artisan `schedule:run` para que se ejecute cada minuto. El comando `schedule:run` va a examinar las tareas programadas definidas en tu clase `App\Console\Kernel` para determinar cuáles tareas deben ser ejecutadas.

Si deseas que el comando `schedule:run` sea ejecutado en un sitio de Homestead, debes indicar la opción `schedule` como `true` cuando definas el sitio:

```php
sites:
    - map: homestead.test
        to: /home/vagrant/code/my-project/public
        schedule: true
```

La tarea programada para este sitio estará definida en el directorio `/etc/cron.d` de tu máquina virtual.

<a name="configuring-mailhog"></a>
### Configuración De Mailhog

Mailhog te permite capturar fácilmente el correo saliente y examinarlo sin que éste sea enviado hacia sus destinatarios. Para comenzar, actualiza tu archivo `.env` con la siguiente configuración:

```php
MAIL_DRIVER=smtp
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
```

Una vez que Mailhog ha sido configurado, puedes acceder al dashboard de Mailhog en `http://localhost:8025`.

<a name="configuring-minio"></a>
### Configuración De Minio

Minio es un servidor de almacenamiento de objetos de código libre con una API compatible con Amazon S3. Para instalar Minio, actualiza tu archivo `Homestead.yaml` con la siguiente opción de configuración:

```php
minio: true
```

Por defecto, Minio está disponible en el puerto 9600. Puedes acceder al panel de control de Minio visitando `http://homestead:9600/`. La clave de acceso por defecto es `homestead`, mientras que la clave secreta por defecto es `secretkey`. Al acceder a Minio, siempre debes usar la región `us-east-1`.

Para usar Minio necesitarás ajustar la configuración de disco S3 en tu archivo `config/filesystems.php` Necesitarás añadir la opción `use_path_style_endpoint` a la configuración del disco, así como cambiar la clave `url` a `endpoint`:

```php
's3' => [
    'driver' => 's3',
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION'),
    'bucket' => env('AWS_BUCKET'),
    'endpoint' => env('AWS_URL'),
    'use_path_style_endpoint' => true
]
```

Por último, asegurate de que tu archivo `.env` tenga las siguientes opciones:

```php
AWS_ACCESS_KEY_ID=homestead
AWS_SECRET_ACCESS_KEY=secretkey
AWS_DEFAULT_REGION=us-east-1
AWS_URL=http://homestead:9600
```

Para proveer buckets, agrega una directiva `buckets` a tu archivo de configuración Homestead:

```php
buckets:
    - name: your-bucket
        policy: public
    - name: your-private-bucket
        policy: none
```

Los valores soportados por `policy` incluyen: `none`, `download`, `upload` y `public`.

<a name="ports"></a>
### Puertos

Por defecto, los siguientes puertos están redirigidos a tu entorno de Homestead:

- **SSH:** 2222 &rarr; Redirige a 22
- **ngrok UI:** 4040 &rarr; Redirige a 4040
- **HTTP:** 8000 &rarr; Redirige a 80
- **HTTPS:** 44300 &rarr; Redirige a 443
- **MySQL:** 33060 &rarr; Redirige a 3306
- **PostgreSQL:** 54320 &rarr; Redirige a 5432
- **MongoDB:** 27017 &rarr; Redirige a 27017
- **Mailhog:** 8025 &rarr; Redirige a 8025
- **Minio:** 9600 &rarr; Redirige a 9600

#### Redirigir Puertos Adicionales

Si lo deseas, puedes redirigir puertos adicionales a tu box de Vagrant, así como su protocolo:

```php
ports:
    - send: 50000
        to: 5000
    - send: 7777
        to: 777
        protocol: udp
```

<a name="sharing-your-environment"></a>
### Compartir Tu Entorno

En ocasiones, podrás requerir compartir lo que estás haciendo con algún compañero de trabajo o algún cliente. Vagrant tiene incorporado una manera de hacer esto por medio del comando `vagrant share`; sin embargo, esto no funcionará si se tienen configurados múltiples sitios en tu archivo `Homestead.yaml`.

Para resolver este problema, Homestead incluye su propio comando `share`. Para utilizarlo, conectate por SSH a tu máquina virtual de Homestead con el comando `vagrant ssh` y ejecuta el comando `share homestead.test`. Esto va a compartir el sitio `homestead.test` especificado en el archivo de configuración `Homestead.yaml`. Puedes sustituir el nombre del sitio en lugar de utilizar `homestead.test`.

```php
share homestead.test
```

Después de ejecutar este comando, podrás ver que aparece una ventana de Ngrok, la cual contiene el log de actividad y las URLs accesibles de manera pública para el sitio compartido. Si deseas especificar una región personalizada, un subdominio o el tiempo de ejecución de Ngrokm puedes hacerlo desde el comando `share`:

```php
share homestead.test -region=eu -subdomain=laravel
```

::: danger Nota 
Recuerda, Vagrant es inherentemente inseguro y estarás comparitendo tu máquina virtual en Internet cuando ejecutes el comando `share`.
:::

<a name="multiple-php-versions"></a>
### Múltiples Versiones PHP

Homestead 6 introduce soporte para múltiples versiones de PHP en una misma máquina virtual. Puedes especificar qué versión de PHP deseas utilizar para un sitio en particular desde tu archivo `Homestead.yaml`. Las versiones disponibles de PHP son "7.1", "7.2" y "7.3" (por defecto):

```php
sites:
    - map: homestead.test
        to: /home/vagrant/code/my-project/public
        php: "7.1"
```

Además, puedes utilizar cualquiera de las versiones soportadas de PHP desde el CLI:

```php
php7.1 artisan list
php7.2 artisan list
php7.3 artisan list
```

<a name="web-servers"></a>
### Servidores Web

Homestead utiliza por defecto el servidor web Nginx. Sin embargo, también se puede instalar Apache si se especifica el tipo de sitio como `apache`. Ambos servidores pueden instalarse al mismo tiempo, pero no pueden *ejecutarse* al mismo tiempo. El comando `flip` está disponible en el shell para facilitar el proceso de cambiar entre servidores web. El comando `flip` automáticamente va a determinar cuál servidor web está en ejecución, después lo va a detener y por último va a iniciar el otro servidor. Para utilizar este comando, primero deberás conectarte a la máquina virtual de Homestead por medio de SSH y ejecutar el comando en la terminal:

```php
flip
```

<a name="mail"></a>
### Correo Electrónico

Homestead incluye el agente de transferencia de correo Postfix, que está escuchando por defecto en el puerto `1025`. Así que puedes indicarle a tu aplicación que use el controlador de correo `smtp` en el puerto `1025` de `localhost`. Entonces, todos los correos enviados serán manejados por Postfix y atrapados por Mailhog. Para ver tus correos enviados, abre en tu navegador [http://localhost:8025](http://localhost:8025).

<a name="network-interfaces"></a>
## Interfaces De Red

La propiedad `networks` del archivo `Homestead.yaml` configura las interfaces de red de tu entorno Homestead. Puedes configurar tantas interfaces como sea necesario:

```php
networks:
    - type: "private_network"
        ip: "192.168.10.20"
```

Para habilitar una interfaz en [puente](https://www.vagrantup.com/docs/networking/public_network.html), debes indicar la propiedad `bridge` y cambiar el tipo de red a `public_network`:

```php
networks:
    - type: "public_network"
        ip: "192.168.10.20"
        bridge: "en1: Wi-Fi (AirPort)"
```

Para habilitar [DHCP](https://www.vagrantup.com/docs/networking/public_network.html), solo debes remover la opción `ip` de tu configuración:

```php
networks:
    - type: "public_network"
        bridge: "en1: Wi-Fi (AirPort)"
```

<a name="extending-homestead"></a>
## Extender Homestead

Puedes extender Homestead usando el script `after.sh` en la raíz de tu directorio Homestead. Dentro de este archivo, puedes agregar cualquier comando shell que sea necesario para configurar y personalizar apropiadamente tu máquina virtual.

Al personalizar Homestead, Ubuntu puede preguntar si deseas conservar la configuración original de un paquete o sobreescribirla con un nuevo archivo de configuración. Para evitar esto, debes usar el siguiente comando al instalar paquetes para evitar sobreescribir cualquier configuración escrita previamente por Homestead:

```php
sudo apt-get -y \
    -o Dpkg::Options::="--force-confdef" \
    -o Dpkg::Options::="--force-confold" \
    install your-package
```

<a name="updating-homestead"></a>
## Actualizar Homestead

Puedes actualizar Homestead en algunos sencillos pasos. Primero, debes actualizar el box de Homestead utilizando el comando `vagrant box update`:

```php
vagrant box update
```

Después, debes actualizar el código fuente de Homestead. Si clonaste el repositorio puedes ejecutar los siguientes comandos en la ubicación donde clonaste originalmente el repositorio:

```php
git fetch

git checkout v8.0.1
```

Estos comandos traen el código más reciente de Homestead del repositorio de GitHub, recuperan las últimas etiquetas y luego revisan la última versión etiquetada. Puede encontrar la última versión de lanzamiento estable en la [página de lanzamientos de GitHub](https://github.com/laravel/homestead/releases).

Si realizaste la instalación de Homestead en tu proyecto por medio del archivo `composer.json`, debes asegurarte de que tu archivo `composer.json` contenga la dependencia `"laravel/homestead": "^8"` y después debes actualizar dichas dependencias:

```php
composer update
```

Finalmente, debes destruir y regenerar tu box de Homestead para utilizar la última instalación de Vagrant. Para lograr esto, ejecuta los siguientes comandos en tu directorio de Homestead:

```php
vagrant destroy

vagrant up
```

<a name="provider-specific-settings"></a>
## Configuraciones Específicas De Proveedor

<a name="provider-specific-virtualbox"></a>
### VirtualBox

#### `natdnshostresolver`

Por defecto, Homestead configura la opcion `natdnshostresolver` como `on`. Esto permite a Homestead utilizar la configuración del DNS de tu sistema operativo. Si lo deseas, puedes sobrescribir este comportamiento, agregando la siguiente línea al archivo `Homestead.yaml`:

```php
provider: virtualbox
natdnshostresolver: off
```

#### Enlaces Simbólicos En Windows

Si los enlaces simbólicos no funcionan correctamente en equipos Windows, puede que requieras agregar el siguiente bloque a tu `Vagrantfile`:

```php
config.vm.provider "virtualbox" do |v|
    v.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/v-root", "1"]
end
```