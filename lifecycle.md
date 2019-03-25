::: v-pre

# Ciclo De Vida De La Solicitud

- [Introducción](#introduction)
- [Resumen Del Ciclo De Vida](#lifecycle-overview)
- [Enfoque En Los Proveedores De Servicios](#focus-on-service-providers)

<a name="introduction"></a>
## Introducción

Al usar cualquier herramienta en el "mundo real", te sientes más cómodo si entiendes como esa herramienta funciona. El desarrollo de aplicaciones no es diferente. Cuando entiendes cómo tus herramientas de desarrollo funcionan, te sientes más cómodo y seguro usándolas.

El objetivo de este documento es darte un buen resumen sobre cómo el framework Laravel funciona. Al conocer el framework mejor, todo lo demás se siente menos "mágico" y te sentirás más cómodo construyendo tus aplicaciones. Si no entiendes todos los términos de una sola vez, ¡no te desesperes! Sólo trata de obtener una comprensión básica de lo que está sucediendo y tus conocimientos crecerán a medida que exploras otras secciones de la documentación.

<a name="lifecycle-overview"></a>
## Resumen Del Ciclo De Vida

### Lo Primero

El punto de entrada para todas las solicitudes a una aplicación de Laravel es el archivo `public/index.php`. Todas las solicitudes son dirigidas a este archivo por la configuración de tu servidor web (Apache / Nginx). El archivo `index.php` no contiene mucho código. En su lugar, es un punto de partida para cargar el resto del framework.

El archivo `index.php` carga la definición de autocarga generada por Composer y luego retorna una instancia de la aplicación de Laravel desde el script `bootstrap/app.php`. La primera acción tomada por Laravel es crear una instancia de la aplicación / [contenedor de servicios](/docs/5.8/container).

### Kernel De HTTP / Consola

Luego, la solicitud entrante es enviada ya sea al kernel HTTP o al kernel de la consola, dependiendo del tipo de solicitud que está entrando en la aplicación. Estos dos kernels funcionan como la ubicación principal a través de la cual todas las solicitudes pasan. Por ahora, vamos a enfocarnos sólo en el kernel HTTP, que está ubicado en `app/Http/Kernel.php`.

El kernel HTTP extiende de la clase `Illuminate\Foundation\Http\Kernel`, que define un arreglo de `bootstrappers` que se ejecutarán antes de que la solicitud sea ejecutada. Estos maquetadores configuran el manejo de errores, registros, [detectan en el entorno de la aplicación](/docs/5.8/configuration#environment-configuration) y realizan otras tareas que necesitan ser ejecutadas antes de que la solicitud sea manejada.

El kernel HTTP también define una lista de [middleware](/docs/5.8/middleware) HTTP que todas las solicitudes deben pasar antes de ser manejadas por la aplicación. Estos middleware manejan la lectura y escritura de la [sesión HTTP](/docs/5.8/session), determinando si la aplicación está en modo de mantenimiento, [verificando el token CSRF](/docs/5.8/csrf) y más.

La firma del método para el método `handle` del kernel HTTP es bastante simple: recibe un `Request` y retorna un `Response`. Piensa en el Kernel como una caja negra grande que representa toda tu aplicación. Aliméntala con solicitudes HTTP y retornará respuestas HTTP.

#### Proveedores De Servicios

Una de las acciones de maquetado más importantes del Kernel es cargar los [proveedores de servicios](/docs/5.8/providers) de tu aplicación. Todos los proveedores de servicios de la aplicación son configurados en el arreglo `providers` del archivo de configuración `config/app.php`. Primero, el método `register` será llamado en todos los proveedores, luego, una vez que todos los proveedores sean registrados, el método `boot` será llamado.

Los proveedores de servicios son responsables de estructurar todos los distintos componentes del framework, como la base de datos, colas, validaciones y componentes de rutas. Dado que estructuran y configuran cada característica ofrecida por el framework, los proveedores de servicios son el aspecto más importante de todo el proceso de estructuración de Laravel.

#### Despachar La Solicitud

Una vez que la aplicación ha sido estructurada y todos los proveedores de servicios han sido registrados, la solicitud o `Request` será manejada por el enrutador para su despacho. El enrutador enviará la solicitud a una ruta o controlador, así como ejecutará cualquier middleware específico de ruta.

<a name="focus-on-service-providers"></a>
## Enfoque En Los Proveedores De Servicios

Los proveedores de servicios son realmente la clave para estructurar una aplicación de Laravel. La instancia de la aplicación es creada, los proveedores de servicios son registrados y la solicitud es entregada a la aplicación ya estructurada. ¡Es realmente así de simple!

Tener un firme conocimiento sobre cómo una aplicación de Laravel es construída y estructurada mediante proveedores de servicios es muy útil. Los proveedores de servicios por defecto de tu aplicación están almacenados en el directorio `app/Providers`. 

Por defecto, `AppServiceProvider` está casi vacío. Este proveedor es un buen lugar para agregar tu propia estructura de componentes y enlaces al contenedor de servicios de tu aplicación. Para aplicaciones grandes, puedes desear crear múltiples proveedores de servicios, cada uno que estructure componentes de una manera más granular.