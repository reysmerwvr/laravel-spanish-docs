::: v-pre

# Compilación De Assets (Laravel Mix)

- [Introducción](#introduction)
- [Instalación y Configuración](#installation)
- [Ejecutando Mix](#running-mix)
- [Trabajando Con Hojas De Estilos](#working-with-stylesheets)
    - [Less](#less)
    - [Sass](#sass)
    - [Stylus](#stylus)
    - [PostCSS](#postcss)
    - [CSS Plano](#plain-css)
    - [Procesamiento De URLs](#url-processing)
    - [Mapeo De Fuente](#css-source-maps)
- [Trabajando Con JavaScript](#working-with-scripts)
    - [Extracción De Paquetes De Terceros](#vendor-extraction)
    - [React](#react)
    - [Vanilla JS](#vanilla-js)
    - [Configuración De Webpack Personalizada](#custom-webpack-configuration)
- [Copiando Archivos y Directorios](#copying-files-and-directories)
- [Versionando / Destrucción De Caché](#versioning-and-cache-busting)
- [Recarga De Browsersync](#browsersync-reloading)
- [Variables De Entorno](#environment-variables)
- [Notificaciones](#notifications)

<a name="introduction"></a>
## Introducción

[Laravel Mix](https://github.com/JeffreyWay/laravel-mix) proporciona una API fluida para definir pasos de compilación de Webpack para tu aplicación de Laravel usando múltiples preprocesadores de CSS y JavaScript. A través de encadenamiento de cadenas simples, puedes definir fluidamente tus pipelines de assets. Por ejemplo:

```php
mix.js('resources/js/app.js', 'public/js')
    .sass('resources/sass/app.scss', 'public/css');
```

Si alguna vez has estado confundido o agobiado al comenzar con Webpack y la compilación de assets, amarás Laravel Mix. Sin embargo, no estás obligado a usarlo durante el desarollo de tu aplicación. Eres libre de usar cualquier pipeline de assets que desees o incluso ninguno.

<a name="installation"></a>
## Instalación y Configuración

#### Instalando Node

Antes de ejecutar Mix, debes asegurar de que Node.js y NPM están instalados en tu máquina.

```php
node -v
npm -v
```

Por defecto, Laravel Homestead incluye todo lo que necesitas; sin embargo, si no estás usando Vagrant, entonces puedes fácilmente instalar la última versión de Node y NPM usando instaladores sencillos desde [su página de descargas](https://nodejs.org/en/download/).

#### Laravel Mix

El único paso restante es instalar Laravel Mix. Dentro de una instalación nueva de Laravel, encontrarás un archivo `package.json` en la raíz de tu estructura de directorios. El archivo por defecto `package.json` incluye todo lo que necesitas para comenzar. Piensa en éste como tu archivo `composer.json`, excepto que define dependencias de Node en lugar de PHP. Puedes instalar las dependencias a las cuales haces referencia ejecutando:

```php
npm install
```

<a name="running-mix"></a>
## Ejecutando Mix

Mix es una capa de configuración basado en [Webpack](https://webpack.js.org), así que para ejecutar tus tareas de Mix sólo necesitas ejecutar uno de los scripts de NPM incluídos en el archivo `package.json` por defecto de Laravel:

```php
// Run all Mix tasks...
npm run dev

// Run all Mix tasks and minify output...
npm run production
```

#### Observando Assets Por Cambios

El comando `npm run watch` continuará ejecutándose en tu terminal y observando todos los archivos relevantes por cambios. Webpack entonces automáticamente recompilará tus assets cuando detecte un cambio:

```php
npm run watch
```

Puedes encontrar que en algunos entornos Webpack no está actualizando los cambios en tus archivos. Si éste es el caso en tu sistema, considera usar el comando `watch-poll`:

```php
npm run watch-poll
```

<a name="working-with-stylesheets"></a>
## Trabajando Con Hojas De Estilos

El archivo `webpack.mix.js` es el punto de entrada para toda la compilación de assets. Piensa en éste como un wrapper de configuración liviano alrededor de Webpack. Las tareas de Mix pueden ser encadenadas para definir exactamente cómo tus assets deben ser compilados.

<a name="less"></a>
### Less

El método `less` puede ser usado para compilar [Less](http://lesscss.org/) a CSS. Vamos a compilar nuestro archivo primario `app.less` a `public/css/app.css`.

```php
mix.less('resources/less/app.less', 'public/css');
```

Múltiples llamadas al método `less` pueden ser usadas para compilar múltiples archivos:

```php
mix.less('resources/less/app.less', 'public/css')
    .less('resources/less/admin.less', 'public/css');
```

Si deseas personalizar el nombre del archivo CSS compilado, puedes pasar una ruta de archivo completa como segundo argumento al método `less`:

```php
mix.less('resources/less/app.less', 'public/stylesheets/styles.css');
```

Si necesitas sobrescribir [opciones subyacentes de Less](https://github.com/webpack-contrib/less-loader#options), puedes pasar un objeto como tercer argumento a `mix.less()`:

```php
mix.less('resources/less/app.less', 'public/css', {
    strictMath: true
});
```

<a name="sass"></a>
### Sass

El método `sass` te permite compilar [Sass](https://sass-lang.com/) a CSS. Puedes usar el método de la siguiente manera:

```php
mix.sass('resources/sass/app.scss', 'public/css');
```

De nuevo, como el método `less`, puedes compilar múltiples archivos de CSS a sus archivos de CSS respectivos e incluso personalizar el directorio de salida del CSS resultante:

```php
mix.sass('resources/sass/app.sass', 'public/css')
    .sass('resources/sass/admin.sass', 'public/css/admin');
```

[Opciones de Node-Sass](https://github.com/sass/node-sass#options) pueden ser proporcionadas como tercer argumento:

```php
mix.sass('resources/sass/app.sass', 'public/css', {
    precision: 5
});
```

<a name="stylus"></a>
### Stylus

Similar a Less y Sass, el método `stylus` te permite compilar [Stylus](http://stylus-lang.com/) a CSS:

```php
mix.stylus('resources/stylus/app.styl', 'public/css');
```

También puedes instalar plugins de Stylus adicionales, como [Rupture](https://github.com/jescalan/rupture). Primero, instala el plugin en cuestión mediante NPM (`npm install rupture`) y luego requiérelo en tu llamada a `mix.stylus()`:

```php
mix.stylus('resources/stylus/app.styl', 'public/css', {
    use: [
        require('rupture')()
    ]
});
```

<a name="postcss"></a>
### PostCSS

[PostCSS](https://postcss.org/), una herramienta poderosa para transformar tu CSS, es incluido con Laravel Mix. Por defecto, Mix toma ventaja del popular plugin [Autoprefixer](https://github.com/postcss/autoprefixer) para automáticamente aplicar todos los prefijos necesarios de CSS3. Sin embargo, eres libre de agregar plugins adicionales que sean apropiados para tu aplicación. Primero, instala el plugin deseado a través de NPM y luego haz referencia a éste en tu archivo `webpack.mix.js`:

```php
mix.sass('resources/sass/app.scss', 'public/css')
    .options({
        postCss: [
            require('postcss-css-variables')()
        ]
    });
```

<a name="plain-css"></a>
### CSS Plano

Si simplemente te gustaría concatenar algunas hojas de CSs plano a un sólo archivo, puedes usar el método `styles`.

```php
mix.styles([
    'public/css/vendor/normalize.css',
    'public/css/vendor/videojs.css'
], 'public/css/all.css');
```

<a name="url-processing"></a>
### Procesamiento de URLs

Debido a que Laravel Mix está construído en base a Webpack, es importante entender algunos conceptos de Webpack. Para compilación de CSS, Webpack reescribirá y optimizará cualquier llamada a `url()` dentro de tus hojas de estilos. Aunque esto inicialmente puede sonar extraño, es una pieza increiblemente poderosa de funcionalidad. Imagina que queremos compilar Sass que incluye una URL relativa a una imagen:

```php
.example {
    background: url('../images/example.png');
}
```

::: note
Las rutas absolutas para cualquier `url()` serán excluidas de la reescritura de URLs. Por ejemplo, `url('/images/thing.png')` o `url('http://example.com/images/thing.png')` no serán modificados.
:::

Por defecto, Laravel Mix y Webpack encontrarán `example.png`, lo copiaran a tu directorio `public/images` y luego reescribirán el `url()` dentro de tu hoja de estilos generada. Como tal, tu archivo CSS compilado será:

```php
.example {
    background: url(/images/example.png?d41d8cd98f00b204e9800998ecf8427e);
}
```

Tan útil como esta característica puede ser, es posible que tu estructura de directorios existente ya está configurada en una forma que quieres. Si este es el caso, puedes deshabilitar la reescritura de `url()` de la siguiente forma:

```php
mix.sass('resources/app/app.scss', 'public/css')
    .options({
        processCssUrls: false
    });
```

Con esta adición a tu archivo `webpack.mix.js`, Mix ya no igualará cualquier `url()` o asset copiado a tu directorio público. En otras palabras, el CSS compilado se verá igual a como originalmente lo escribiste:

```php
.example {
    background: url("../images/thing.png");
}
```

<a name="css-source-maps"></a>
### Mapeo De Fuente

Aunque deshabilitado por defecto, el mapeo de fuentes puede ser activado llamando al método `mix.sourceMaps()` en tu archivo `webpack.mix.js`. Aunque viene con un costo de compilación/rendimiento, esto proporcionará información adicional de depuración a las herramientas de desarrollo de tu navegador al usar assets compilados.

```php
mix.js('resources/js/app.js', 'public/js')
    .sourceMaps();
```

<a name="working-with-scripts"></a>
## Trabajando Con JavaScript

Mix proporciona múltiples características para ayudarte a trabajar con archivos de JavaScript, como compilar ECMAScript 2015, agrupación de módulos, minificación y concatenar archivos de JavaScript planos. Aún mejor, todos esto funciona fácilmente, sin requirir ningún tipo de configuración personalizada:

```php
mix.js('resources/js/app.js', 'public/js');
```

Con esta única línea de código, puedes ahora tomar ventaja de:

- Sintaxis de ES2015.
- Modulos
- Compilación de archivos `.vue`.
- Minifación para entornos de producción.

<a name="vendor-extraction"></a>
### Extracción De Paquetes De Terceros

Un potencial aspecto negativo de agrupar todo el JavaScript específico de la aplicación con tus paquetes de terceros es que hace que el almacenamiento en caché a largo plazo sea más difícil. Por ejemplo, una sóla actualización al código de tu aplicación forazará el navegador a recargar todas tus paquetes de terceros incluso si no han cambiado.

Si pretendes hacer actualizaciones frecuentes del JavaScript de tu aplicación, deberías considerar extraer todos tus paquetes de terceros a su propio archivo. De esta forma, un cambio en el código de tu aplicación no afectará el almacenamiento en caché de tu archivo grande `vendor.js`. El método `extract` de Mix hace que esto sea muy fácil:

```php
mix.js('resources/js/app.js', 'public/js')
    .extract(['vue'])
```

El método `extract` acepta un arreglo de todas los paquetes o módulos que deseas extraer a un archivo `vendor.js`. Usando el código de arriba como ejemplo, Mix generará los siguientes archivos:

- `public/js/manifest.js`: *The Webpack manifest runtime*
- `public/js/vendor.js`: *Your vendor libraries*
- `public/js/app.js`: *Your application code*

Para evitar errores de JavaScript, asegurate de cargar estos archivos en el orden adecuado:

```php
<script src="/js/manifest.js"></script>
<script src="/js/vendor.js"></script>
<script src="/js/app.js"></script>
```

<a name="react"></a>
### React

Mix puede automáticamente instalar los plugins de Babel necesarios para el soporte de React. Para comenzar, reemplaza tu llamado a `mix.js()` por `mix.react()`:

```php
mix.react('resources/js/app.jsx', 'public/js');
```

En segundo plano, Mix descargará e incluirá el plugin de Babel `babel-preset-react` apropiado.

<a name="vanilla-js"></a>
### Vanilla JS

Similar a combinar hojas de estilos con `mix.styles()`, puedes también combinar y minificar cualquier número de archivos JavaScript con el método `scripts()`:

```php
mix.scripts([
    'public/js/admin.js',
    'public/js/dashboard.js'
], 'public/js/all.js');
```

Esta opción es particularmente útil para proyectos antiguos donde no necesitas compilación de Webpack para tu JavaScript.

::: tip
Una ligera variación de `mix.scripts()` es `mix.babel()`. Su firma de método es identica a `scripts`; sin embargo, el archivo concatenado recibirá compilación de Babel, que traduce cualquier código ES2015 a JavaScript plano que todos los navegadores entenderán.
:::

<a name="custom-webpack-configuration"></a>
### Configuración Personalizada De Webpack

Detrás de cámaras, Laravel Mix hace referencia a un archivo preconfigurado `webpack.config.js` para ayudarte a comenzar tan rápido como sea posible. Ocasionalmente, puedes necesitar modificar este archivo de forma manual. Podrías tener un loader o plugin especial al que necesitas hacer referencia o quizás prefieres usar Stylus en lugar de Sass. En esos casos, tienes dos opciones:

#### Fusionar Configuración Personalizada

Mix proporciona un método `webpackConfig` útil que te permite fusionar cualquier configuración pequeña de Webpack. Esta es una opción particularmente atractiva, ya que no requiere que copies y mantengas tu propia copia del archivo `webpack.config.js`. El método `webpackConfig` acepta un objeto, que debe contener cualquier [configuración especifíca de Webpack](https://webpack.js.org/configuration/) que deseas aplicar.

```php
mix.webpackConfig({
    resolve: {
        modules: [
            path.resolve(__dirname, 'vendor/laravel/spark/resources/js')
        ]
    }
});
```

#### Archivos De Configuración Personalizados

Si te gustaría personalizar completamente tu configuración de Webpack, copia el archivo `node_modules/laravel-mix/setup/webpack.config.js` al directorio principal de tu proyecto. Luego, apunta todas las referencias a `--config` en tu archivo `package.json` al nuevo archivo de configuración copiado. Si deseas elegir esta forma de personalización, cualquier actualización futura al archivo `webpack.config.js` debe ser manualmente agregada a tu archivo personalizado.

<a name="copying-files-and-directories"></a>
## Copiando Archivos & Directorios

El método `copy` puede ser usado para copiar archivos y directorios a nuevas ubicaciones. Esto puede ser útil cuando un asset en particular dentro de tu directorio `node_modules` necesita ser reubicado a tu directorio `public`.

```php
mix.copy('node_modules/foo/bar.css', 'public/css/bar.css');
```

Al copiar un directorio, el método `copy` aplanará la estructura del directorio. Para mantener la estructura original del directorio, debes usar el método `copyDirectory` en su lugar:

```php
mix.copyDirectory('resources/img', 'public/img');
```

<a name="versioning-and-cache-busting"></a>
## Versionando / Destrucción De Caché

Muchos desarrolladores prefijan sus assets compilados con una marca de tiempo o token único para forzar a los navegadores a cargar los assets nuevos en lugar de servir copias antiguas del código. Mix puede hacer esto por ti usando el método `version`.

El método `version` automáticamente agregar un hash único a los nombres de archivos de todos los archivos compilados, permitiendo una destrucción de caché más conveniente:

```php
mix.js('resources/js/app.js', 'public/js')
    .version();
```

Luego de generar el archivo versionado, no sabrás el nombre exacto del archivo. Así que, debes usar la función global de Laravel `mix` dentro de tus [vistas](/docs/{{version}}/views) para cargar los assets apropiados. La función `mix` determinará automáticamente el nombre actual del archivo:

```php
<link rel="stylesheet" href="{{ mix('/css/app.css') }}">
```

Dado que los archivos versionados son usualmente necesarios durante el desarrollo, puedes instruir al proceso de versionamiento para que sólo se ejecute durante `npm run production`:

```php
mix.js('resources/js/app.js', 'public/js');

if (mix.inProduction()) {
    mix.version();
}
```

<a name="browsersync-reloading"></a>
## Recarga Con Browsersync

[BrowserSync](https://browsersync.io/) puede monitorear automáticamente los cambios en tus archivos e inyectar tus cambios al navegador sin requerir un refrescamiento manual. Puedes activar el soporte llamando al método `mix.browserSync()`:

```php
mix.browserSync('my-domain.test');

// Or...

// https://browsersync.io/docs/options
mix.browserSync({
    proxy: 'my-domain.test'
});
```

Puedes pasar una cadena (proxy) u objeto (configuraciones de BrowserSync) a este método. Luego, inicia el servidor de desarrollo de Webpack usando el comando `npm run watch`. Ahora, cuando modifiques un script o archivo de PHP, observa mientras el navegador instantaneamente recarga la página para reflejar tus cambios.

<a name="environment-variables"></a>
## Variables De Entorno

Puedes inyectar variables de entorno a Mix prefijando una clave en tu archivo `.env` con `MIX_`:

```php
MIX_SENTRY_DSN_PUBLIC=http://example.com
```

Luego de que la variable ha sido definida en tu archivo `.env`, puedes acceder mediante el objeto `process.env`. Si el valor cambia mientras estás ejecutando una tarea `watch`, necesitarás reiniciar la tarea:

```php
process.env.MIX_SENTRY_DSN_PUBLIC
```

<a name="notifications"></a>
## Notificaciones

Cuando esté disponible, Mix automáticamente mostrará notificaciones del sistema operativo para cada paquete. Esto te dará feedback instantáneo, sobre si la compilación ha sido exitosa o no. Sin embargo, pueden haber casos en los que preferirás deshabilitar estas notificaciones. Uno de esos casos puede ser ejecutar Mix en tu servidor de producción. Las notificaciones pueden ser deshabilitadas mediante el método `disableNotifications`.

```php
mix.disableNotifications();
```