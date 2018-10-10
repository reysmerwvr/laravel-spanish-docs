# Laravel Valet

- [Introducción](#introduction)
    - [Valet O Homestead](#valet-or-homestead)
- [Instalación](#installation)
    - [Actualización](#upgrading)
- [Activar Sitios](#serving-sites)
    - [El Comando "Park"](#the-park-command)
    - [El Comando "Link"](#the-link-command)
    - [Asegurar Sitios Con TLS](#securing-sites)
- [Compartir Sitios](#sharing-sites)
- [Drivers De Valet Personalizados](#custom-valet-drivers)
    - [Drivers Locales](#local-drivers)
- [Otros Comandos De Valet](#other-valet-commands)

<a name="introduction"></a>
## Introducción

Valet es un entorno de desarrollo de Laravel para Mac. No requiere de Vagrant ni de modificar el archivo de configuración `/etc/hosts`. Incluso permite compartir tus sitios a través de túneles locales. _Genial ¿Verdad?_

Laravel Valet configura tu Mac para que siempre inicie el servicio de [Nginx](https://www.nginx.com/) en el background al iniciar tu computadora. Después, [DnsMasq](https://en.wikipedia.org/wiki/Dnsmasq) actuará como servidor proxy, procesando todas las peticiones en el dominio `*.test` apuntando a los sitios instalados en tu computadora local.

En otras palabras, es un entorno de desarrollo de Laravel sorpdendentemente rápido y solamente utiliza cerca de 7MB de RAM. Laravel Valet no está pensado para ser un remplazo de Vagrant y Homestead, en su lugar presenta una alternativa flexible y rápida, lo cual es una buena opción para quienes tengan una cantidad limitada de RAM.

Por default, Valet brinda soporte para las siguientes tecnologías, pero no está limitado a solo ellas:

<div class="content-list" markdown="1">
- [Laravel](https://laravel.com)
- [Lumen](https://lumen.laravel.com)
- [Bedrock](https://roots.io/bedrock/)
- [CakePHP 3](https://cakephp.org)
- [Concrete5](http://www.concrete5.org/)
- [Contao](https://contao.org/en/)
- [Craft](https://craftcms.com)
- [Drupal](https://www.drupal.org/)
- [Jigsaw](http://jigsaw.tighten.co)
- [Joomla](https://www.joomla.org/)
- [Katana](https://github.com/themsaid/katana)
- [Kirby](https://getkirby.com/)
- [Magento](https://magento.com/)
- [OctoberCMS](https://octobercms.com/)
- [Sculpin](https://sculpin.io/)
- [Slim](https://www.slimframework.com)
- [Statamic](https://statamic.com)
- Static HTML
- [Symfony](https://symfony.com)
- [WordPress](https://wordpress.org)
- [Zend](https://framework.zend.com)
</div>

Además, es posible extender Valet con tu propio [driver personalizado](#custom-valet-drivers).

<a name="valet-or-homestead"></a>
### Valet O Homestead

Como sabrás, Laravel ofrece [Homestead](/docs/{{version}}/homestead), otro entorno de desarrollo local de Laravel. Homestead y Valet difieren en cuanto a la audiencia a la que están pensados y su aproximación al dessarrollo local. Homestead ofrece toda una máquina virtual de Ubuntu con Nginx instalado y configurado. Homestead es una muy buena elección si deseas tener un entorno de desarrollo virtualizado de Linux o si te encuentras trabajando con Windows / Linux.

Por otro lado, Valet solamente es soportado por Mac y requiere que instales PHP y un servidor de base de datos directamente en tu equipo local. Esto puede lograrse fácilmente haciendo uso de [Homebrew](http://brew.sh) con comandos como `brew install php71` y `brew install mysql`. Valet provee un entorno de desarrollo local bastante rápido haciendo uso mínimo de consumo de recursos, lo cual es genial para desarrolladores que solamente requieran de PHP / MySQL y no necesiten de todo un entorno virtualizado de desarrollo.

Tanto Valet como Homestead son buenas elecciones para configurar tu entorno de desarrollo de Laravel. El que sea que vayas a elegir depende completamente de tu gusto personal o las necesidades de tu equipo.

<a name="installation"></a>
## Instalación


**Valet requiere de macOS y [Homebrew](http://brew.sh). Antes de comenzar, asegurate de que ningún otro programa como Apache o Nginx estén utilizando el puerto 80 de tu computadora.**

<div class="content-list" markdown="1">
- Instala o actualiza [Homebrew](http://brew.sh/) a su última versión con `brew update`.
- Instala PHP 7.1 usando Homebrew con `brew install homebrew/php/php71`.
- Instala Valet por medio de Composer con `composer global require laravel/valet`. Asegúrate de que el directorio `~/.composer/vendor/bin` se encuentre en el "PATH" de tu sistema.
- Ejecuta el comando `valet install`. Esto va a configurar e instalar Valet y DnsMasq, y va a registrar el daemon de Valet para que se inicie junto con el sistema operativo.
</div>

Una vez que Valet haya sido instalado, trata de hacer ping a cualquier dominio `*.test` desde tu terminal usando un comando como `ping foobar.test`. Si Valet ha sido instalado correctamente deberás ver una respuesta de ese dominio en la dirección `127.0.0.1`.


Valet iniciará automaticamente su daemon cada vez que el sistema inicie. Por lo tanto, si Valet se instaló adecuadamente, no hay necesidad de volver a ejecutar el comando `valet start` o `valet install`.

#### Utilizar Otro Dominio

Por default, Valet actuará como servidor de sus proyectos usando el TLD `.test`. Si lo prefiere, puede cambiar este dominio por otro de su elección utilizando el comando `valet domain dominio`.

Por ejemplo, si desea utilizar el dominio `.app` en lugar de `.test`, ejecute desde la terminal el comando `valet domain app` y Valet ahora funcionará como servidor de sus proyectos pero ahora con el dominio `*.app`.

#### Base De Datos

Si necesita de una base de datos, puede instalar MySQL ejecutando el comando `brew install mysql` desde la terminal. Una vez que haya sido instalado, necesitará iniciar el servicio de manera manual con el comando `brew services start mysql`. Podrá conectarse a su base de datos en `127.0.0.1` utilizando el usuario `root` sin ninguna contraseña.

<a name="upgrading"></a>
### Actualización

Puede actualizar su instalación de Valet ejecutando el comando `composer global update` desde la terminal. Después de actualizar, es una buena práctica ejecutar el comando `valet install` para que valet pueda hacer actualizaciones adicionales en sus archivos de configuración en caso de ser necesario.

#### Actualizar a Valet 2.0

Valet 2.0 cambió de utilizar el servidor web Caddy a Nginx, por lo que antes de hacer esta actualización deberá ejecutar los siguientes comandos para detener y desinstalar el daemon existente de Caddy.

    valet stop
    valet uninstall

Después, deberá actualizar su versión de Valet a la más reciente. Dependiendo de cómo se hizo la instalación de Valet, puede hacerlo por medio de Git o de Composer. Si su instalación fue por medio de Composer, deberá ejecutar el siguiente comando para actualizar a su versión más reciente.

    composer global require laravel/valet

Una vez que se haya descargado el codigo fuente de Valet, deberá ejecutar el comando `install`

    valet install
    valet restart

Después de actualizar, será necesario volver a indicar los directorios de sus sitios con los comandos `park` o `link` según sea el caso.

<a name="serving-sites"></a>
## Activar Sitios

Una vez que Valet haya sido instalado, estará listo para activar sitios. Valet provee dos comandos para ayudarle a activar sitios de Laravel: `park` y `link`.

<a name="the-park-command"></a>
**El Comando `park`**

<div class="content-list" markdown="1">
-  Crea un nuevo directorio en tu Mac ejecutando algo como lo siguiente en la terminal `mkdir ~/Sites`. Después, `cd ~/Sites` y ejecuta `valet park`. Este comando va a registrar tu directorio actual como una ruta en la que Valet deberá buscar los sitios.
- Después, crea un nuevo sitio de laravel dentro de este directorio: `laravel new blog`.
- Abre tu navegador y dirígete a `http://blog.test`.
</div>

**Y eso es todo**. Ahora, cada proyecto de Laravel que crees dentro de tu directorio ~/Sites será visible desde el navegador utilizando la convención `http://folder-name.test`.

<a name="the-link-command"></a>
**El comando `link`**

El comando `link` también puede ser utilizado para enlazar sitios de Laravel. Este comando es útil si se desea configurar un solo sitio en un directorio y no todos los sitios dentro de él.

<div class="content-list" markdown="1">
- Para utilizar este comando, deberá dirigirse a uno de sus proyectos desde la terminal y ejecutar `valet link app-name`. Valet creará un enlace simólico en `~/.valet/Sites` el cuál apuntará hacia su directorio actual.
- Después de ejecutar el comando `link`, podrá acceder al sitio desde su navegador en `http://app-name.test`.
</div>

Para ver un listado de todos los directorios enlazados, ejecuta el comando `valet links`. Para destruir algún el simbólico deberá utilizar el comando `valet unlink app-name`.

> {tip} Puede utilizar `valet link` para configurar el mismo proyecto para multiples (sub)dominios. Tara agregar un subdominio o un dominio diferente para tu proyecto ejecuta `valet link subdomain.app-name`.

<a name="securing-sites"></a>
**Asegurar Sitios Con TLS**

Por default, Valet mostrará los sitios a través de HTTP plano. Sin embargo, si deseas que este esté encriptado con TLS para ser utilizado con HTTP/2, se encuentra disponible el comando `secure`. Por ejemplo, si tu sitio está funcionando con valet en el dominio `laravel.test`, podrás ejecutar el siguiente comando para asegurarlo:

    valet secure laravel

Para quitar esta seguridad al sitio y revertir los cambios de nuevo hacia HTTP plano, deberás utilizar el comando `unsecure`. Al igual que el comando `secure`, este comando acepta el nombre del host al que se desea quitar la encriptación TLS.

    valet unsecure laravel

<a name="sharing-sites"></a>
## Compartir Sitios

Valet incluso tiene un comando para compartir tus sitios locales con el mundo. Sin necesidad de instalar software adicional, Solo necesitas tener instalado Valet.

Para compartir un sitio, deberás dirigirte hacia el directorio del sitio desde la terminal y ejecutar el comando `valet share`. Una URL accesible de manera pública será copiada a tu portapapeles y estará lista paar que la pegues directamente en tu navegador.

Para detener la compartision de tu sitio, presiona `Control + C` para cancelar el proceso.

> {note} `valet share` actualmente no soporta sitios que han sido asegurados con el comando `valet secure`.

<a name="custom-valet-drivers"></a>
## Drivers De Valet Personalizados

Puedes escribir tu propio "driver" de Valet para utilizar aplicaciones de PHP que se estén ejecutando en otro framework o en un CMS que no sea soportado de manera nativa por Valet. Cuando se hace la instalación de Valet, es creado un directorio `~/.valet/Drivers` que contiene un archivo `SampleValetDriver.php`. Este archivo contiene la implementación de un driver de muestra para demostrar cómo escribir un driver personalizado. Escribir un driver solo requiere que implementes tres métodos: `serves`, `isStaticFile`, y `frontControllerPath`.

Los tres métodos reciven los valores de `$sitePath`, `$siteName`, y `$uri` como sus argumentos. La variable `$sitePath` es la ruta completa del sitio que será configurado en tu equipo, algo como `/Users/Lisa/Sites/my-project`. La variable `$siteName` representan la porción "host" / "site-name" del dominio {`my-project`}. La variable `$uri` es la petición URI entrante (`/foo/bar`).

Una vez que hayas terminado con tu driver de valet personalizado, se deberá colocar en el directorio `~/.valet/Drivers` usando la convención `FrameworkValetDriver.php` para nombrarlo. Por ejemplo, si estás escribiendo un driver personalizado de valet para WordPress, tu archivo deberá ser `WordPressValetDriver.php`.

<!-- Let's take a look at a sample implementation of each method your custom Valet driver should implement. -->
Echemos un vistaso a la implementación de muestra en cada uno de los metodos del driver personalizado de Valet.

#### El Método `serves`

El método `serves` deberá retornar `true` si tu driver debe encargarse de las peticiones entrantes. De otra manera, este método deberá retornar `false`. Por lo tanto, dentro de este método deberás intentar determinar si el `$sitePath` dado contiene un proyecto del tipo que deseas configurar.

Por ejemplo, vamos a pretender que estamos escriviendo un `WordPressValetDriver`. Nuestro método `serve` podría verse mas o menos como esto:

    /**
     * Determine if the driver serves the request.
     *
     * @param  string  $sitePath
     * @param  string  $siteName
     * @param  string  $uri
     * @return bool
     */
    public function serves($sitePath, $siteName, $uri)
    {
        return is_dir($sitePath.'/wp-admin');
    }

#### El Método `isStaticFile`

<!-- The `isStaticFile` should determine if the incoming request is for a file that is "static", such as an image or a stylesheet. If the file is static, the method should return the fully qualified path to the static file on disk. If the incoming request is not for a static file, the method should return `false`: -->
El método `isStaticFile` deberá determinar si la petición entrante para un archivo es estático, como puede ser una imagen o una hoja de estilo. Si el archivo es estático, el método deberá retornar la ruta absoluta del archivo en disco. Si la petición entrante no es para un archivo estático, el metodo deberá retornar `false`:

    /**
     * Determine if the incoming request is for a static file.
     *
     * @param  string  $sitePath
     * @param  string  $siteName
     * @param  string  $uri
     * @return string|false
     */
    public function isStaticFile($sitePath, $siteName, $uri)
    {
        if (file_exists($staticFilePath = $sitePath.'/public/'.$uri)) {
            return $staticFilePath;
        }

        return false;
    }

> {note} El método `isStaticFile` solo será llamado si el método `serves` retorna `true` para las peticiones entrantes y la URI es diferente a `/`.

#### El Método `frontControllerPath`

El método `frontControllerPath` deberá retornar la ruta absoluta del "front controller" de tu aplicación, que usualmente es el archivo "index.php" o su equivalente:

    /**
     * Get the fully resolved path to the application's front controller.
     *
     * @param  string  $sitePath
     * @param  string  $siteName
     * @param  string  $uri
     * @return string
     */
    public function frontControllerPath($sitePath, $siteName, $uri)
    {
        return $sitePath.'/public/index.php';
    }

<a name="local-drivers"></a>
### Drivers Locales

Si desea definir un driver de Valet personalizado para una aplicación sencilla, deberá crear un archivo `LocalValetDriver.php` en el directorio raíz de su aplicación. El driver personalizado deberá extender de la clase base `ValetDriver` o extender del driver de alguna aplicación existente, como puede ser `LaravelValetDriver`.

    class LocalValetDriver extends LaravelValetDriver
    {
        /**
         * Determine if the driver serves the request.
         *
         * @param  string  $sitePath
         * @param  string  $siteName
         * @param  string  $uri
         * @return bool
         */
        public function serves($sitePath, $siteName, $uri)
        {
            return true;
        }

        /**
         * Get the fully resolved path to the application's front controller.
         *
         * @param  string  $sitePath
         * @param  string  $siteName
         * @param  string  $uri
         * @return string
         */
        public function frontControllerPath($sitePath, $siteName, $uri)
        {
            return $sitePath.'/public_html/index.php';
        }
    }

<a name="other-valet-commands"></a>
## Otros Comandos De Valet

Comando  | Descripción
------------- | -------------
`valet forget` | Ejecuta este comando desde el directorio donde ejecutaste el comando `park` para eliminarlo de la lista de directorios configurados.
`valet paths` | Ver una lista de directorios configurados.
`valet restart` | Reiniciar el daemon de Valet.
`valet start` | Iniciar el daemon de Valet.
`valet stop` | Detener el daemon de Valet.
`valet uninstall` | Desinstalar el daemon de Valet completamente.

