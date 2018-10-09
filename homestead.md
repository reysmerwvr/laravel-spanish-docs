# Laravel Homestead

- [Introducción](#introduction)
- [Instalación & Configuración](#installation-and-setup)
    - [Primeros Pasos](#first-steps)
    - [Configurar Homestead](#configuring-homestead)
    - [Iniciar El Box De Vagrant](#launching-the-vagrant-box)
    - [Instalación Por Proyecto](#per-project-installation)
    - [Instalar MariaDB](#installing-mariadb)
    - [Instalar Elasticsearch](#installing-elasticsearch)
    - [Aliases](#aliases)
- [Uso Diario](#daily-usage)
    - [Acceder A Homestead Globalmente](#accessing-homestead-globally)
    - [Conexión Via SSH](#connecting-via-ssh)
    - [Conectar A Base De Datos](#connecting-to-databases)
    - [Agregar Sitios Adicionales](#adding-additional-sites)
    - [Variables De Entorno](#environment-variables)
    - [Configurar Tareas Programadas](#configuring-cron-schedules)
    - [Configurar Mailhog](#configuring-mailhog)
    - [Puertos](#ports)
    - [Compartir Tu Entorno](#sharing-your-environment)
    - [Múltiples Versiones PHP](#multiple-php-versions)
    - [Servidores Web](#web-servers)
    - [Interfaces De Red](#network-interfaces)
- [Actualizar Homestead](#updating-homestead)
- [Configuraciones Específicas De Proveedor](#provider-specific-settings)
    - [VirtualBox](#provider-specific-virtualbox)

<a name="introduction"></a>
## Introducción

Laravel se ha esforzado en hacer que toda la experiencia del desarrollo de PHP sea placentera, incluyendo el entorno de desarrollo local. [Vagrant](https://www.vagrantup.com) provee una manera simple y elegante de administrar y provisionar máquinas virtuales.

Laravel Homestead es el box de Vagrant pre-empaquetado oficial que brinda un maravilloso entorno de desarrollo sin la necesidad de que tengas que instalar PHP, un serivor web, ni ningún otro servidor de software en tu máquina local. Basta de preocuparse por estropear tu sistema operativo! Los boxes de Vagrant son completamente desechables. Si algo sale mal, simplemente puedes destruir y re-crear el box en cuestión de minutos.

Homestead puede ejecutarse en sistemas Windows, Mac y Linux, e incluyen el servidor web Nginx, PHP 7.2, PHP 7.1, PHP 7.0, PHP 5.6, MySQL, PostgreSQL, Redis, Memcached, Node y todas las demás herramientas que necesitas para desarrollar aplicaciones de Laravel sorprendentes.

> {note} Si se está utilizando Windows, puede que necesites habilitar la virtualización por hardware (VT-x). Usualmente puede habilitarse en el BIOS. Si se está utilizando Hyper-V en un sistema UEFI puede que requiera adicionalmente deshabilitar Hyper-V para oder acceder a VT-x.

<a name="included-software"></a>
### Software Incluido

<div class="content-list" markdown="1">
- Ubuntu 16.04
- Git
- PHP 7.2
- PHP 7.1
- PHP 7.0
- PHP 5.6
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
- Elasticsearch (Opcional)
- ngrok
</div>

<a name="installation-and-setup"></a>
## Instalación & Configuración

<a name="first-steps"></a>
### Primeros Pasos

Antes de iniciar tu entorno de Homestead, deberá instalar [VirtualBox 5.2](https://www.virtualbox.org/wiki/Downloads), [VMware](https://www.vmware.com), [Parallels](https://www.parallels.com/products/desktop/) o [Hyper-V](https://docs.microsoft.com/en-us/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v) además de [Vagrant](https://www.vagrantup.com/downloads.html). Todos estos paquetes de software cuentan con un instalador fácil de usar para todos los sistemas operativos populares.

Para utilizar el proveedor de VMWare, necesitará comprar tanto VMWare Fusion / Workstation y el [plug-in de Vagrant para VMWare](https://www.vagrantup.com/vmware). A pesar de que esto no es gratuito, VMWare ofrece un mayor desempeño en velocidad al compartir directorios.

Para utilizar el proveedor de Parallels, deberá instalar el [plug-in de Vagrant para Parallels](https://github.com/Parallels/vagrant-parallels). Es totalmente gratuito.

Debidio a las [limitaciones de Vagrant](https://www.vagrantup.com/docs/hyperv/limitations.html), el proveedor de Hyper-V ignora todas las configuraciones de red.

#### Instalar el box de Vagrant para Homestead

Una vez que estén instalados VirtualBox / VMWare y Vagrant, deberá añadir el box `laravel/homestead` a su instalación de Vagrant ejecutando el siguiente comando en la terminal. Esto tomará algunos minutos para descargar el box, dependiendo de su velocidad de internet.

    vagrant box add laravel/homestead

Si el comando falla, asegúrese de que su instalación de Vagrant esté actualizada.

#### Instalar Homestead

Puede instalar Homestead simplemente clonando el repositorio. Considere clonar el repositorio en un directorio `Homestead` dentro de su directorio "home", ya que el box de Homestead actuará como host para todos sus proyectos de Laravel:

    git clone https://github.com/laravel/homestead.git ~/Homestead

Deberá hacer checkout a alguna versión etiquetada de Homestead ya que el branch `master` no siempre es estable. Puede encontrar la versión estable más reciente en la [Página de Releases de GitHub](https://github.com/laravel/homestead/releases):

    cd ~/Homestead

    // Clonar al release deseado...
    git checkout v7.0.1

Una vez que haya clonado el repositorio, ejecute el comando `bash init.sh` desde el directorio Homestead para crear el archivo de configuración `Homestead.yaml`. El archivo `Homestead.yaml` estará situado en el directorio Homestead:

    // Mac / Linux...
    bash init.sh

    // Windows...
    init.bat

<a name="configuring-homestead"></a>
### Configurar Homestead

#### Especificando Su Proveedor

La llave `provider` en su archivo `Homestead.yaml` indica cuál proveedor de Vagrant será utilizado: `virtualbox`, `vmware_fusion`, `vmware_workstation`, `parallels` o `hyperv`. Puede especificar esta opción al provedor de su preferencia.

    provider: virtualbox

#### Configurar directorios compartidos

La propiedad `folders` del archivo `Homestead.yaml` enlista todos los directorios que desee compartir con su entorno de Homestead. A medida que los archivos dentro de estos directorios cambien, estos se mantendrán sincronizados con su máquina local y el entrorno de Homestead. Puede confugrar tantos directorios compartidos como sean necesarios:

    folders:
        - map: ~/code
          to: /home/vagrant/code

Si solo está creando unos cuantos sitios, este mapeo genérico funcionará bien. Sin embargo, mientras el numero de sitios continúe creciendo, podrá comenzar a experimentar algunos problemas de desempeño. Estos problemas pueden ser muy evidentes en maquinas con pocos recursos o en proyectos que contengan una cantidad de archivos de gran tamaño. Si experimenta estos problemas, trate de mapear cada proyecto a su propio directorio de Vagrant:

    folders:
        - map: ~/code/project1
          to: /home/vagrant/code/project1

        - map: ~/code/project2
          to: /home/vagrant/code/project2

Para habilitar [NFS](https://www.vagrantup.com/docs/synced-folders/nfs.html), solo necesitará agregar un simple flag en la configuración de su directorio sincronizado:

    folders:
        - map: ~/code
          to: /home/vagrant/code
          type: "nfs"

> {note} Cuando use NFS, deberá considerar instalar el plug-in [vagrant-bindfs](https://github.com/gael-ian/vagrant-bindfs). Este plug-in mantendrá correctamente el usuario / grupo para los archivos y directorios dentro del box de Homestead.

También podrá indicar cualquier opción soportada por los [Directorios Sincronizados](https://www.vagrantup.com/docs/synced-folders/basic_usage.html) de Vagrant listandolos bajo la llave `options`:

    folders:
        - map: ~/code
          to: /home/vagrant/code
          type: "rsync"
          options:
              rsync__args: ["--verbose", "--archive", "--delete", "-zz"]
              rsync__exclude: ["node_modules"]

#### Configurar Sitios de Nginx

¿No estás familiarizado con Nginx? No hay problema. La propiedad `sites` te permitirá mapear un "dominio"a un directorio en tu entorno de Homestead de manera sencilla. Una configuración simple de un sitio está incluido en el archivo `Homestead.yaml`. Nuevamente, podrás añadir tantos sitios a tu entorno de Homestead como sea necesario. Homestead puede funcionar como un conveniente entorno virtualizado para cada proyecto de Laravel en el que estés trabajando:

    sites:
        - map: homestead.test
          to: /home/vagrant/code/Laravel/public

Si cambia la propiedad `sites` apropiadamente después de haber provisionado el box de Homestead, deberá re-ejecutar `vagrant reload --provision` para actualizar la configuración de Nginx en la máquina virtual.

#### El Archivo Hosts

Deberá agregar los "dominios" para sus sitios de Nginx en el archivo `hosts` en su máquina. El archivo `hosts` va a redirigir las peticiones de los sitios Homstead hacia  su máquina Homestead. En Mac y Linux, este archivo está ubicado en `/etc/hosts`. En Windows, este archivo está ubicado en `C:\Windows\System32\drivers\etc\hosts`. Las líneas que agregues a este archivo deberán verse como se muestra a continuación:

    192.168.10.10  homestead.test

Debe asegurarse que la IP indicada sea la misma que está en el archivo `Homestead.yaml`. Una vez que hayas añadido el dominio a tu archivo `hosts` y hayas iniciado el box de Vagrant podrás acceder al sitio desde el navegador web:

    http://homestead.test

<a name="launching-the-vagrant-box"></a>
### Iniciando el Box de Vagrant

Una vez que haya editado el archivo `Homestead.yaml` a su gusto, ejecute el comando `vagrant up` desde su directorio Homestead. Vagrant va a iniciar la máquina virtual y a configurar automáticamente sus directorios compartidos y sitios de Nginx.

Para destruir la máquina, deberá utilizar el comando `vagrant destroy --force`.

<a name="per-project-installation"></a>
### Instalación Por Proyecto

En lugar de instalar Homestead globalmente y compartir el mismo box de Homestead para todos sus proyectos, también es posible configurar una instancia de Homestead para cada proyecto que necesites. Instalar Homestead por proyecto puede ser beneficioso si desea crear un `Vagrantfile` en su proyecto, permitiendo así a otras personas trabajar en el mismo proyecto ejecutando simplemente `vagrant up`.

Para instalar Homestead directamente en su proyecto, deberá hacerlo por medio de Composer:

    composer require laravel/homestead --dev

Una vez que Homestead haya sido instalado, use el comando `make` para generar el archivo `Vagrantfile` y `Homestead.yaml` en la raíz de su proyecto. El comando `make` configurará automáticamente las directivas `sites` y `folders` en el archivo `Homestead.yaml`.

Mac / Linux:

    php vendor/bin/homestead make

Windows:

    vendor\\bin\\homestead make

Después, ejecute el comando `vagrant up` en su terminal y podrá acceder a su proyecto desde el navegador en `http://homestead.test`. Recuerde que aún va a necesitar agregar una entrada para `homestead.test` en su archivo `/etc/hosts` para el dominio de su elección.

<a name="installing-mariadb"></a>
### Instalar MariaDB

Si prefiere usar MariaDB en lugar de MySQL, deberá agregar la opción `mariadb` en su archivo `Homestead.yaml`. Esta opción removerá MySQL e instalará MariaDB. MariaDB funciona como un remplazo directo para MySQL, por lo que aún podrá seguir utilizando el driver `mysql` para configurar la base de dats en su aplicación:

    box: laravel/homestead
    ip: "192.168.10.10"
    memory: 2048
    cpus: 4
    provider: virtualbox
    mariadb: true

<a name="installing-elasticsearch"></a>
### Instalar Elasticsearch

Para insalar Elasticsearch, añada la opción `elasticsearch` en su archivo `Homestead.yaml` y especifique una versión soportada. La instalación por default creará un cluster llamado 'homestead'. Nunca debería dar a Elasticsearch más de la mitad de la memoria de su sistema operativo, por lo que deberá asegurarse de que su máquina tenga al menos el doble de la memoria asignada por Elasticsearch:

    box: laravel/homestead
    ip: "192.168.10.10"
    memory: 4096
    cpus: 4
    provider: virtualbox
    elasticsearch: 6

> {tip} Vea la [documentación de Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current) para aprender a personalizar su configuración.

<a name="aliases"></a>
### Aliases

Puede añadir aliases de Bash a su máquina de Homestead modificando el archivo `aliases` desde su directorio Homestead:

    alias c='clear'
    alias ..='cd ..'

Después de haber actualizado el archivo `aliases`, debera volver a provisionar la máquina de Homestead usando el comando `vagrant reload --provision`. Con esto se podrá asegurar que sus nuevos alaises estarán disponibles en la máquina.

<a name="daily-usage"></a>
## Uso Diario

<a name="accessing-homestead-globally"></a>
### Acceder a Homestead Globalmente

En ocasiones puede que requiera de iniciar Homestead con el comando `vagrant up` desde cualquier parte en su filesystem. Esto es posible en sistemas Mac / Linux al agregar una función Bash en su Bash Profile. En Windows, esto puede lograrse al agregarun archivo "batch" en su `PATH`. Estos scripts le permitirán ejecutar cualquier comando de Vagrant desde cualquier parte en su sistema y automáticamente apuntarán el comando hacia su instalación de Homestead:

#### Mac / Linux

    function homestead() {
        ( cd ~/Homestead && vagrant $* )
    }

Asegúrese de modificar la ruta `~/Homestead` en la función hacia la ubicación actual de su instalación de Homestead. Una vez que haya instalado la función, podrá ejecutar comandos como `homestead up` o `homestead ssh` desde cualquier parte en su filesystem.

#### Windows

Cree un archivo batch llamado `homestead.bat` en algua parte de su equipo con los siguientes comandos:

    @echo off

    set cwd=%cd%
    set homesteadVagrant=C:\Homestead

    cd /d %homesteadVagrant% && vagrant %*
    cd /d %cwd%

    set cwd=
    set homesteadVagrant=

Asegúrese de modificar la ruta de ejemplo `C:\Homestead` en el scrupt por la ruta actual de su instalación de Homestead. Después de crear el archivo, agregue la ubicación a su `PATH`. Hecho esto podrá ejecutar comandos como `homestead up` o `homestead ssh` desde cualqueir lado en su sistema.

<a name="connecting-via-ssh"></a>
### Conexión Via SSH

Puede conectarse a su máquina virtual por medio de SSH haciendo uso del comando `vagrant ssh` en la terminal desde su directorio Homestead.

Pero, dado que probablemente requiera conectarse frecuentemente a su máquina de Homestead, debería considerar agregar la "función" mencionada anteriormente en su equipo host para poderse conectar de manera rápida a su box de Homestead por medio de SSH.

<a name="connecting-to-databases"></a>
### Conectar A Base De Datos

Una base de datos `homestead` es configurada por default tanto para MySQL como para PostgreSQL. Para mayor conveniencia, el archivo de configuración de Laravel `.env` configura el framework para utilizar esta base de datos por default.

Para conectarse a su base de datos de MySQL o de PostgreSQL desde el cliente de base de datos de su equipo host, deberá conectarse hacia `127.0.0.1` en el puerto `33060` (MySQL) o `54320`  (PostgreSQL). El username y password para ambas bases de datos son `homestead` / `secret`.

> {note} Solo debería utilizar estos puertos no estandar para conectarse a sus bases de datos desde su euipo host. Deberá utilizar los puertos default 3306 y 5432 en su archivo de configuración para la base de datos de Laravel que se encuentre ejecutandose _dentro_ de la máquina virtual.

<a name="adding-additional-sites"></a>
### Agregar Sitios Adicionales

Una vez que su entorno de Homestead haya sido provisionado y esté en ejecución, es probable que requiera agregar sitios adicionales de Nginx para su aplicación de Laravel. Puede ejecutar tantas instalaciones de Laravel como desee, simplemente debe añadirlas a su archivo `Homestead.yaml`.

    sites:
        - map: homestead.test
          to: /home/vagrant/code/Laravel/public
        - map: another.test
          to: /home/vagrant/code/another/public

Si vagrant no está manejando su archivo "hosts" de manera automática, también deberá agregar los nuevos sitios a este archivo.

    192.168.10.10  homestead.test
    192.168.10.10  another.test

Ya que el sitio haya sido agregado, ejecute el comando `vagrant reload --provision` desde su directorio Homestead.

<a name="site-types"></a>
#### Tipos de Sitios

Homestead soporta varios tipos de sitios permitiendole ejecutar fácilmente proyectos que no estén basados en Laravel. Por ejemplo, puede agregar fácilmente una aplicación de Symfony en Homestead utilizando el tipo de sitio `symfony2`:

    sites:
        - map: symfony2.test
          to: /home/vagrant/code/Symfony/web
          type: "symfony2"

Los tipos de sitios disponibles son: `apache`, `laravel` (default), `proxy`, `silverstripe`, `statamic`, `symfony2`, y `symfony4`.

<a name="site-parameters"></a>
#### Parámetros de los Sitios

También puede agregar valores adicionales de `fastcgi_param` en Nginx para sus sitios por medio de la directiva `params` en el sitio. Por ejemplo, agregar el parámetro `FOO` con el valor de `BAR`:

    sites:
        - map: homestead.test
          to: /home/vagrant/code/Laravel/public
          params:
              - key: FOO
                value: BAR

<a name="environment-variables"></a>
### Variables De Entorno

Puede especificar variables de entorno gobales al agregarlas en su archivo `Homestead.yaml`:

    variables:
        - key: APP_ENV
          value: local
        - key: FOO
          value: bar

Después de actualizar el archivo `Homestead.yaml`, deberá volver a provisionar la máquina ejecutando el comando `vagrant reload --provision`. Esto actualizará la configuración de PHP-FPM para todas las versiones instaladas de PHP y también actualizará el entorno para el usuario `vagrant`.

<a name="configuring-cron-schedules"></a>
### Configurar Tareas Programadas

Laravel provee una manera conveniente de ejecutar [tareas programadas](/docs/{{version}}/scheduling) al configurar las tareas por medio del comando de Artisan `schedule:run` para que se ejecute cada minuto. el comando `schedule:run` va a examinar las tareas programadas definidas en su clase `App\Console\Kernel` paa determinar cuáles tareas deben ser ejecutadas.

Si desea que el comando `schedule:run` sea ejecutado en un sitio de Homestead, debe indicar la opción `schedule` como `true` cuando defina el sitio:

    sites:
        - map: homestead.test
          to: /home/vagrant/code/Laravel/public
          schedule: true

La tarea programada para este sitio éstará definida en el directorio `/etc/cron.d` de su máquina virtual.

<a name="configuring-mailhog"></a>
### Configurar Mailhog

Mailhog le permite capturar fácilmente el correo saliente y examinarlo sin que este sea enviado hacia sus destinatarios. Paa comenzar, actualice su archivo `.env` con la siguiente configuración.

    MAIL_DRIVER=smtp
    MAIL_HOST=localhost
    MAIL_PORT=1025
    MAIL_USERNAME=null
    MAIL_PASSWORD=null
    MAIL_ENCRYPTION=null

<a name="ports"></a>
### Puertos

Por default, los siguientes puertos están redirigidos a su entorno de Homestead:

- **SSH:** 2222 &rarr; Forwards To 22
- **ngrok UI:** 4040 &rarr; Forwards To 4040
- **HTTP:** 8000 &rarr; Forwards To 80
- **HTTPS:** 44300 &rarr; Forwards To 443
- **MySQL:** 33060 &rarr; Forwards To 3306
- **PostgreSQL:** 54320 &rarr; Forwards To 5432
- **Mailhog:** 8025 &rarr; Forwards To 8025

#### Redirigir Puertos Adicionales

Si lo desea, puede redirigir puertos adicionales a su box de Vagrant, así como su protocolo:

    ports:
        - send: 50000
          to: 5000
        - send: 7777
          to: 777
          protocol: udp

<a name="sharing-your-environment"></a>
### Compartir Tu Entorno

En ocasiones, podrá requerir compartir en lo que estás trabajando con algún compañero de trabajo o algú cliente. Vagrant tiene incorporado una manera de hacer esto por medio del comando `vagrant share`; sin embargo, esto no funcionará si se tienen configurados múltiples sitios en su archivo `Homestead.yaml`.

Para resolver este problema, Homestead incluye su propio comando `share`. Para utilizarlo, conéctese por SSH a su máquina virtual de Homestead con el comando `vagrant ssh` y ejecute el comando `share homestead.test`. Esto va a compartir el sitio `homestead.test` especificado en el archivo de configuración `Homestead.yaml`. Desde luego, deberá sustituir el nombre del sitio en lugar de utilizar `homestead.test`.

    share homestead.test

Después de ejecutar este comando, podrá ver que aparece una ventana de Ngrok, la cual contiene el log de actividad y las URLs accesibles de panera pública para el sitio compartido. Si desea especificar una región personalizada, un subdominio o el tiempo de ejecución de Ngrokm podrá hacerlo desde el comando `share`:

    share homestead.test -region=eu -subdomain=laravel

> {note} Recuerde, Vagrant es inherentemente inseguro y estará comparitendo su máquina virtual hacia Internet cuando ejecute el comando `share`.

<a name="multiple-php-versions"></a>
### Múltiples Versiones PHP

> {note} Esta característica sólo es compatible con Nginx.

Homestead 6 introduce soporte para múltiples versiones de PHP en una misma máquina virtual. Puede especificar qué versión de PHP desea utilizar para un sitio en particular desde su archivo `Homestead.yaml`. Las versiones disponibles de PHP son "5.6", "7.0", "7.1", y "7.2" (default):

    sites:
        - map: homestead.test
          to: /home/vagrant/code/Laravel/public
          php: "5.6"

Además, puede utilizar cualquiera de las versiones soportadas de PHP desde el CLI:

    php5.6 artisan list
    php7.0 artisan list
    php7.1 artisan list
    php7.2 artisan list

<a name="web-servers"></a>
### Servidores Web

Homestead utiliza por default el servidor web Nginx. Sin embargo, también se puede instalar Apache si se especifica el tipo del sitio como `apache`. Ambos servidores pueden instalarse al mismo tiempo, pero no pueden *ejecutarse* al mismo tiempo. El comando `flip` está disponible en el shell para facilitar el proceso de cambiar entre servidores web. El comando `flip` automáticamente va a determinar cuál servidor web está en ejecución, después lo va a detener y por último va a iniciar el otro servidor. Para utilizar este comando, primero deverá conectarse a la máquina virtual de Homestead por medio de SSH y ejecutar el comando en la terminal:

    flip

<a name="network-interfaces"></a>
## Interfaces De Red

La propiedad `networks` del archivo `Homestead.yaml` configura las interfaces de red de tu entorno Homestead. Puede configurar tantas interfaces como sea necesario:

    networks:
        - type: "private_network"
          ip: "192.168.10.20"

Para habilitar una interfaz en [puente](https://www.vagrantup.com/docs/networking/public_network.html), debe indicar la propiedad `bridge` y cambiar el tipo de red a `public_network`:

    networks:
        - type: "public_network"
          ip: "192.168.10.20"
          bridge: "en1: Wi-Fi (AirPort)"

Para habilitar [DHCP](https://www.vagrantup.com/docs/networking/public_network.html), solo debe remover la opción `ip` de su configuración:

    networks:
        - type: "public_network"
          bridge: "en1: Wi-Fi (AirPort)"

<a name="updating-homestead"></a>
## Actualizar Homestead

Puede actualizar Homestead en dos sencillos pasos. Primero, debe actualizar el box de Homestead utilizando el comando `vagrant box update`:

    vagrant box update

Después, deberá actualizar el código fuente de Homestead. Si clonó el repositorio simplemente ejecute `git pull origin master` en la ubicación donde se clonó originalmente el repositorio.

Si hizo la instalación de Homestead en su proyecto por medio del archivo `composer.json`, deberá asegurarse que su archivo `composer.json` contenga la dependencia `"laravel/homestead": "^7"` y después deberá actualizar dichas dependencias:

    composer update

<a name="provider-specific-settings"></a>
## Configuraciones Específicas De Proveedor

<a name="provider-specific-virtualbox"></a>
### VirtualBox

#### `natdnshostresolver`

Por default, Homestead configura la opcion `natdnshostresolver` como `on`. Esto permite a Homestead utilizar la configuración del DNS de su sistema operativo. Si lo desea, puede sobreescribir este comportamiendo, agregando la sguiente línea al archivo `Homestead.yaml`:

    provider: virtualbox
    natdnshostresolver: off

#### Enlaces Simbólicos en Windows

Si los enlaces simbólicos no funcionan correctamente en equipos Windows, puede que requieras agregar el siguiente bloque a tu `Vagrantfile`:

    config.vm.provider "virtualbox" do |v|
        v.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/v-root", "1"]
    end

