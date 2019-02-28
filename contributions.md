# Guía De Contribución

- [Reporte De Errores](#bug-reports)
- [Discusión De Desarrollo De Código](#core-development-discussion)
- [¿Cuál rama?](#which-branch)
- [Assets Compilados](#compiled-assets)
- [Vulnerabilidades De Seguridad](#security-vulnerabilities)
- [Estilo De Código](#coding-style)
    - [PHPDoc](#phpdoc)
    - [StyleCI](#styleci)

<a name="bug-reports"></a>
## Reportes De Errores

Para fomentar la colaboración activa, Laravel alenta fuertemente el uso de pull requests, no solo reportes de errores. "Los reportes de errores" pueden además ser enviados en el formulario de un pull request que contenga un test fallido.

Sin embargo, si tu archivo reportar un error, tu issue debería contener un título y una clara descripción del problema. Deberías además incluir tanta información relevante como sea posible y un ejemplo de código que demuestre el problema. La meta de un reporte de error es hacerlo fácil para ti mismo - y para otros - para replicar el error y desarrollar una solución.

Recuerda, los reportes de errores son creados con la esperanza de que otros con el mismo problema puedan colaborar contigo en la solución. No esperes que automáticamente el reporte del error recibirá alguna actividad o que los otros saltarán a repararlo. Crear un reporte de error sirve para ayudarte a ti mismo y a otros a iniciar el camino de reparar el problema.

El código fuente de Laravel es manejado en GitHub, y allí están los repositorios para cada uno de los proyectos de Laravel:

<div class="content-list" markdown="1">
- [Laravel Application](https://github.com/laravel/laravel)
- [Laravel Art](https://github.com/laravel/art)
- [Laravel Documentation](https://github.com/laravel/docs)
- [Laravel Cashier](https://github.com/laravel/cashier)
- [Laravel Cashier for Braintree](https://github.com/laravel/cashier-braintree)
- [Laravel Envoy](https://github.com/laravel/envoy)
- [Laravel Framework](https://github.com/laravel/framework)
- [Laravel Homestead](https://github.com/laravel/homestead)
- [Laravel Homestead Build Scripts](https://github.com/laravel/settler)
- [Laravel Horizon](https://github.com/laravel/horizon)
- [Laravel Passport](https://github.com/laravel/passport)
- [Laravel Scout](https://github.com/laravel/scout)
- [Laravel Socialite](https://github.com/laravel/socialite)
- [Laravel Telescope](https://github.com/laravel/telescope)
- [Laravel Website](https://github.com/laravel/laravel.com)
</div>

<a name="core-development-discussion"></a>
## Discusión De Desarrollo De Código

Tu puedes proponer nuevas funcionalidades o mejoras del comportamiento existente de Laravel en el [tablero de ideas](https://github.com/laravel/ideas/issues) de ideas de Laravel. Si propones una nueva funcionalidad, esté dispuesto a implementar al menos parte del código que se necesitaría para completar la funcionalidad.

Discusiones informales sobre errores, nuevas funcionalidades e implementación de existentes funcionalidades toman lugar en el canal `#internals` del [Servidor Discord de Laravel](https://discordapp.com/invite/mPZNm7A). Taylor Otwell, el encargado de Laravel, está normalmente presente en el canal los días de semana de 8:00am-5:00pm (UTC-06:00 o América/Chicago) y esporádicamente está presente en el canal a otras horas.

<a name="which-branch"></a>
## ¿Cuál rama?

**Todas** las correcciones de errores deben ser enviadas a la última rama estable o a la [actual rama LTS](/docs/{{version}}/releases#support-policy). Las correcciones de errores **nunca** deben ser enviadas a la rama `master` a menos que ellos reparen funcionalidades que existan solo en los próximos lanzamientos.

Funcionalidades **menores** que son **totalmente compatible** con la versión actual de Laravel pueden enviarse a la última rama estable.

Las nuevas funcionalidades **mayores** deben siempre ser enviadas a la rama `master`, la cual contiene el próximo lanzamiento de Laravel.

Si no estás seguro si tu funcionalidad califica como mayor o menor, por favor pregúntale a Taylor Otwell en el canal `#internals` del [servidor Discord de Laravel](https://discordapp.com/invite/mPZNm7A).

<a name="compiled-assets"></a>
## Assets Compilados

Si estás enviando un cambio que afectará un archivo compilado, tal como muchos de los archivos en `resources/sass` o `resources/js` del repositorio `laravel/laravel`, no hagas commit de los archivos compilados. Debido a su gran tamaño, ellos no pueden realistamente ser revisado por el encargado. Esto podría ser usado como una forma de inyectar código malicioso dentro de Laravel. Para evitar esto de manera defensiva, todos los archivos compilados serán generados y confirmados por los mantenedores de Laravel.

<a name="security-vulnerabilities"></a>
## Vulnerabilidades de seguridad

Si tu descubres una vulnerabilidad de seguridad dentro de Laravel, por favor envía un email a Taylor Otwell a <a href="mailto:taylor@laravel.com">taylor@laravel.com</a>. Todas las vulnerabilidades de seguridad serán tratadas con prontitud.

<a name="coding-style"></a>
## Estilo De Código

Laravel sigue el estándar de código [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) y el estándar de auto carga [PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md).

<a name="phpdoc"></a>
### PHPDoc

A continuación se muestra un ejemplo de un bloque de documentación válido de Laravel. Nota que el atributo `@param` es seguido por dos espacios, el tipo de argumento, dos espacios más y finalmente el nombre de la variable:

    /**
     * Register a binding with the container.
     *
     * @param  string|array  $abstract
     * @param  \Closure|string|null  $concrete
     * @param  bool  $shared
     * @return void
     * @throws \Exception
     */
    public function bind($abstract, $concrete = null, $shared = false)
    {
        //
    }

<a name="styleci"></a>
### StyleCI

¡No te preocupes si el estilo de tu código no es perfecto! [StyleCI](https://styleci.io/) automáticamente fusionará cualquier arreglo dentro del repositorio de Laravel después de que los pull requests son fusionados. Esto nos permite enfocarnos en el contenido de la contribución y no en el estilo de código.
