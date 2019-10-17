::: v-pre

# JavaScript y Estructuración de CSS

- [Introducción](#introduction)
- [Escribiendo CSS](#writing-css)
- [Escribiendo JavaScript](#writing-javascript)
    - [Escribiendo componentes de Vue](#writing-vue-components)
    - [Usando React](#using-react)
- [Agregando Presets](#adding-presets)

<a name="introduction"></a>
## Introducción

Mientras Laravel no dicta la pauta sobre que pre-procesadores de JavaScript o CSS usar, si proporciona un punto de inicio básico usando [Bootstrap](https://getbootstrap.com/), [React](https://reactjs.org/) y / o [Vue](https://vuejs.org/) que será de utilidad para muchas aplicaciones. De forma predeterminada, Laravel usa [NPM](https://www.npmjs.org) para instalar ambos paquetes de frontend.

La estructura de Boostrap y Vue proporcinada por Laravel se encuentra en el paquete de Composer `laravel/ui`, que se puede instalar usando Composer:

```terminal
composer require laravel/ui --dev
```

Una vez que se haya instalado el paquete `laravel/ui`, puedes instalar la estructura del frontend usando el comando `ui` de artisan:

```terminal
// Generando estructura básica...
php artisan ui vue
php artisan ui react

// Generando estructura del login y registro...
php artisan ui vue --auth
php artisan ui react --auth
```

#### CSS

[Laravel Mix](/mix.html) proporciona una clara y expresiva API sobre compilación de Sass o Less, las cuales son extensiones de CSS plano que agregan variables, mixins y otras poderosas características que hacen el trabajo con CSS mucho más divertido. En este documento, discutiremos brevemente la compilación CSS en general; sin embargo, deberías consultar la [documentación de Laravel Mix](/mix.html) completa para mayor información sobre compilación de Sass o Less.

#### JavaScript

Laravel no requiere que uses un framework o biblioteca de JavaScript específica para construir tus aplicaciones. De hecho, no tienes que usar JavaScript en lo absoluto. Sin embargo, Laravel sí incluye algunas de las estructuras básicas para hacer más fácil los primeros pasos para escribir JavaScript moderno usando el framework [Vue](https://vuejs.org). Vue proporciona una API expresiva para construir aplicaciones de JavaScript robustas usando componentes. Como con CSS, podemos usar Laravel Mix para compilar fácilmente componentes de JavaScript en un único archivo de JavaScript para los eventos del navegador.

#### Removiendo la estructura del frontend

Si prefieres remover la estructura del frontend de tu aplicación, puedes usar el comando Artisan `preset`. Este comando, cuando se combina con la opción `none`, eliminará la maquetación de Bootstrap y Vue de tu aplicación, dejando solamente un archivo Sass en blanco y unas cuántas bibliotecas de utilidades de JavaScript comunes.

```terminal
php artisan preset none
```

<a name="writing-css"></a>
## Escribiendo CSS

Después de instalar el paquete de Composer `laravel/ui` y [generada la estructura del frontend](#introduction),
el archivo `package.json` de Laravel incluye el paquete `bootstrap` que te ayuda a empezar a hacer un prototipo del frontend de tu aplicación usando Bootstrap. Sin embargo, siéntete libre de agregar o eliminar los paquetes del archivo `package.json` como sea necesario para tu aplicación. No es obligatorio que uses el framework Bootstrap para construir tu aplicación de Laravel - se proporciona un buen punto de inicio para aquellos que elijan usarlo.

Antes de compilar tu CSS, instala las dependencias de frontend de tu proyecto usando el [gestor de paquetes para Node (NPM)](https://www.npmjs.org):

```terminal
npm install
```

Una vez que las dependencias hayan sido instaladas usando `npm install`, puedes compilar tus archivos Sass a CSS plano usando [Laravel Mix](/mix.html#working-with-stylesheets). El comando `npm run dev` procesará las instrucciones en tu archivo `webpack.mix.js`. Típicamente, tu CSS compilado estará ubicado en el directorio `public/css`:

```terminal
npm run dev
```

El archivo `webpack.mix.js` incluido de forma predeterminada con Laravel compilará el archivo Sass `resources/sass/app.scss`. Este archivo `app.scss` importa un archivo de variables Sass y carga Bootstrap, el cual proporciona un buen punto de comienzo para la mayoría de las aplicaciones. Siéntete libre de personalizar el archivo `app.scss` en la forma que desees o incluso usar un pre-procesador completamente diferente [configurando Laravel Mix](/mix.html).

<a name="writing-javascript"></a>
## Escribiendo JavaScript

Todas las dependencias de JavaScript requeridas por tu aplicación pueden ser encontradas en el archivo `package.json` en el directorio principal del proyecto. Este archivo es similar a un archivo `composer.json` excepto que éste específica las dependencias de JavaScript en lugar de las dependencias de PHP. Puedes instalar estas dependencias usando el [gestor de paquetes de Node (NPM)](https://www.npmjs.org): 

```terminal
npm install
```

::: tip TIP
De forma predeterminada, el archivo `package.json` de Laravel incluye unos cuantos paquetes tales como `vue` y `axios` para ayudarte a empezar a construir tu aplicación de JavaScript. Siéntete libre de agregar o eliminar del archivo `package.json` según sea necesario para tu aplicación.
:::

Una vez que los paquetes sean instalados, puedes usar el comando `npm run dev` para [compilar tus recursos](/mix.html). Webpack es un empaquetador de módulos para aplicaciones modernas en JavaScript. Cuando ejecutes el comando `npm run dev`, Webpack ejecutará las instrucciones en tu archivo `webpack.mix.js`:

```terminal
npm run dev
```

De forma predeterminada, el archivo de `webpack.mix.js` de Laravel compila tu archivo Sass y él de `resources/js/app.js`. Dentro de el archivo `app.js` puedes registrar tus componentes de Vue o, si prefieres un framework distinto, configurar tu propia aplicación de JavaScript. Tu JavaScript compilado será colocado típicamente en el directorio `public/js`.

::: tip TIP
El archivo `app.js` cargará el archivo `resources/js/bootstrap.js` el cual estructura y configura Vue, Axios, jQuery, y todas las demás dependencias de javaScript. Si tienes dependencias adicionales de JavaScript que configurar, puedes hacerlo en este archivo.
:::

<a name="writing-vue-components"></a>
### Escribiendo componentes de Vue

Al usar el paquete `laravel/ui` para la estructura de tu frontend, se colocará un componente de Vue `ExampleComponent.vue` ubicado en el directorio `resources/js/components`. El archivo `ExampleComponent.vue` es un ejemplo de un [componente Vue de archivo único](https://vuejs.org/guide/single-file-components) el cual define su plantilla HTML y JavaScript en el mismo archivo. Los componentes de archivo único proporcionan un enfoque muy conveniente para construir aplicaciones manejadas por JavaScript. El componente de ejemplo es registrado en tu archivo `app.js`:

```javascript
Vue.component(
    'example-component',
    require('./components/ExampleComponent.vue').default
);
```

Para usar el componente en tu aplicación, puedes colocarlo en una de tus plantillas HTML. Por ejemplo, después de ejecutar el comando Artisan `php artisan ui vue --auth` para maquetar las pantallas de registro y autenticación de tu aplicación, podrías colocar el componente en la plantilla de Blade `home.blade.php`:

```php
@extends('layouts.app')

@section('content')
    <example-component></example-component>
@endsection
```

::: tip TIP
Recuerda, deberías ejecutar el comando `npm run dev` cada vez que cambies un componente de Vue. O, puedes ejecutar el comando `npm run watch` para monitorear y recompilar automáticamente tus componentes cada vez que sean modificados.
:::

Si estás interesado en aprender más sobre escribir componentes de Vue, deberías leer la [Documentación de Vue](https://vuejs.org/guide/), la cual proporciona un minucioso resumen fácil de leer del framework Vue.

::: tip TIP
En [Styde.net](https://styde.net/) contamos con un [completo curso sobre Vue.js](https://styde.net/curso-de-vue-2/) que cubre todo los aspectos del framework.
:::


<a name="using-react"></a>
### Usando React

Si prefieres usar React para construir tu aplicación de JavaScript, Laravel hace que sea una tarea fácil la de intercambiar la estructura de Vue con la de React:

```terminal
composer require laravel/ui --dev

php artisan ui react

// Generando la estructura de login y registro
php artisan ui react --auth
```

Este único comando removerá la estructuración de Vue y la reemplazará con la de React, incluyendo un componente de ejemplo.
