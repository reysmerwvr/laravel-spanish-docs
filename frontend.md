# JavaScript & Estructuración de CSS

- [Introducción](#introduction)
- [Escribiendo CSS](#writing-css)
- [Escribiendo JavaScript](#writing-javascript)
    - [Escribiendo Componentes de Vue](#writing-vue-components)
    - [Usando React](#using-react)

<a name="introduction"></a>
## Introducción

Mientras Laravel no dicta la pauta sobre que pre-procesadores de JavaScript o CSS usar, si proporciona un punto de inicio básico usando [Bootstrap](https://getbootstrap.com/) y [Vue](https://vuejs.org) que será de utilidad para muchas aplicaciones. De forma predeterminada, Laravel usa [NPM](https://www.npmjs.org) para instalar ambos paquetes de frontend.

#### CSS

[Laravel Mix](/docs/{{version}}/mix) proporciona una clara, API expresiva sobre compilación de SASS o Less, las cuales son extensiones de CSS plano que agregan variables, mixins y otras poderosas características que hacen el trabajo con CSS mucho más divertido. En este documento, discutiremos brevemente la compilación CSS en general; sin embargo, deberías consultar la [documentación de Laravel Mix](/docs/{{version}}/mix) completa para mayor información sobre compilación de SASS o Less.

#### JavaScript

Laravel no requiere que uses un framework o librería de JavaScript específico para construir tus aplicaciones. De hecho, no tienes que usar JavaScript en lo absoluto. Sin embargo, Laravel si incluye algunas de las estructuras básicas para hacer más fácil los primeros pasos para escribir JavaScript moderno usando el framework [Vue](https://vuejs.org). Vue proporciona una API expresiva para construir aplicaciones de JavaScript robustas usando componentes. Como con CSS, podemos usar Laravel Mix para compilar fácilmente componentes de JavaScript en un único archivo de JavaScript para los eventos del navegador.

#### Removiendo la Estructura del Frontend

Si prefieres remover la estructura del frontend de tu aplicación, puedes usar el comando Artisan `preset`. Este comando, cuando se combina con la opción `none`, removerá las estructuras de Bootstrap y Vue de tu aplicación, dejando solamente un archivo SASS en blanco y unas cuantas librerías de utilidades comunes para JavaScript.

    php artisan preset none

<a name="writing-css"></a>
## Escribiendo CSS

El archivo `package.json` de Laravel incluye el paquete `bootstrap-sass` que te ayuda a empezar a hacer un prototipo del frontend de tu aplicación usando Bootstrap. Sin embargo, siéntete libre de agregar o remover los paquetes del archivo `package.json` como sea necesario para tu aplicación. No es obligatorio que uses el framework Bootstrap para construir tu aplicación de Laravel - se proporciona un buen punto de inicio para aquellos que elijan usarlo.

Antes de compilar tu CSS, instala las dependencias de frontend de tu proyecto usando el [Gestor de Paquetes para NodeJS(NPM)](https://www.npmjs.org):

    npm install

Una vez que las dependencias hayan sido instaladas usando `npm install`, puedes compilar tus archivos SASS a CSS plano usando [Laravel Mix](/docs/{{version}}/mix#working-with-stylesheets). El comando `npm run dev` procesará las instrucciones en tu archivo `webpack.mix.js`. Típicamente, tu CSS compilado estará ubicado en el directorio `public/css`:

    npm run dev

El archivo `webpack.mix.js` incluido de forma predeterminada con Laravel compilará el archivo SASS `resources/assets/sass/app.scss`. Este archivo `app.scss` importa un archivo de variables SASS y carga Bootstrap, el cual proporciona un buen punto de comienzo para la mayoría de las aplicaciones. Siéntete libre de personalizar el archivo `app.scss` en la forma que desees o incluso usar un pre-procesador completamente diferente [configurando Laravel Mix](/docs/{{version}}/mix).

<a name="writing-javascript"></a>
## Escribiendo JavaScript

Todas las dependencias de JavaScript requeridas por tu aplicación pueden ser encontradas en el archivo `package.json` en el directorio principal del proyecto. Este archivo es similar a un archivo `composer.json` excepto que este especifica las dependencias de JavaScript en lugar de las dependencias de PHP. Puedes instalar estas dependencias usando el [Gestor de Paquetes de NodeJS (NPM)](https://www.npmjs.org): 

    npm install

> {tip} De forma predeterminada, el archivo `package.json` de Laravel incluye unos cuantos paquetes tales como `vue` y `axios` para ayudarte a empezar a construir tu aplicación de JavaScript. Siéntete libre de agregar o remover el archivo `package.json` como sea necesario para tu aplicación.

Una vez que los paquetes sean instalados, puedes usar el comando `npm run dev` para [compilar tus recursos](/docs/{{version}}/mix). Webpack es un empaquetador de módulos para aplicaciones modernas en JavaScript. Cuando ejecutes el comando `npm run dev`, Webpack ejecutará las instrucciones en tu archivo `webpack.mix.js`:

    npm run dev

De forma predeterminada, el archivo de `webpack.mix.js` de Laravel compila tu archivo SASS y el de `resources/assets/js/app.js`. Dentro de el archivo `app.js` puedes registrar tus componentes de Vue o, si prefieres un framework distinto, configurar tu propia aplicación de JavaScript. Tu JavaScript compilado será colocado típicamente en el directorio `public/js`.

> {tip} El archivo `app.js` cargará el archivo `resources/assets/js/bootstrap.js` lo cual hace sin ayuda y configura Vue, Axios, jQuery, y todas las demás dependencias de javaScript. Si tienes dependencias adicionales de JavaScript que configurar, puedes hacerlo en este archivo.

<a name="writing-vue-components"></a>
### Escribiendo Componentes de Vue

De forma predeterminada, las aplicaciones nuevas de Laravel contienen un componente de Vue `ExampleComponent.vue` ubicado en el directorio `resources/assets/js/components`. El archivo `ExampleComponent.vue` es un ejemplo de un [componente Vue de archivo único](https://vuejs.org/guide/single-file-components) el cual define su plantilla HTML y JavaScript en el mismo archivo. Los componentes de archivo único proporcionan un enfoque muy conveniente para construir aplicaciones manejadas por JavaScript. El componente de ejemplo es registrado en tu archivo `app.js`:

    Vue.component(
        'example-component',
        require('./components/ExampleComponent.vue')
    );

Para usar el componente en tu aplicación, puedes colocarlo en una de tus plantillas HTML. Por ejemplo, después de ejecutar el comando Artisan `make:auth` para estructurar las pantallas de registro y autenticación de tu aplicación, podrías colocar el componente en la plantilla de Blade `home.blade.php`:

    @extends('layouts.app')

    @section('content')
        <example-component></example-component>
    @endsection

> {tip} Recuerda, deberías ejecutar el comando `npm run dev` cada vez que cambies un componente de Vue. O, puedes ejecutar el comando `npm run watch` para monitorear y recompilar automáticamente tus componentes cada vez que sean modificados.

Ciertamente, si estás interesado en aprender más sobre escribir componentes de Vue, deberías leer la [Documentación de Vue](https://vuejs.org/guide/), la cual proporciona un minucioso resumen fácil de leer del framework Vue.

<a name="using-react"></a>
### Usando React

Si prefieres usar React para construir tu aplicación de JavaScript, Laravel hace que sea una tarea fácil la de intercambiar la estructuración de Vue con la de React. En una aplicación nueva de Laravel, puedes usar el comando `preset` con la opción `react`:

    php artisan preset react

Este único comando removerá la estructuración de Vue y la reemplazará con la de React, incluyendo un componente de ejemplo.
