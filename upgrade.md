# Upgrade Guide

- [Actualizando A 5.5.0 Desde 5.4](#upgrade-5.5.0)

<a name="upgrade-5.5.0"></a>
## Actualizando A 5.5.0 Desde 5.4

#### Tiempo Estimado de Actualización: 1 Hora

> {note} Tratamos de documentar cada posible cambio. Dado que algunos de estos cambios están en partes oscuras del framework sólo una porción de estos cambios podrían afectar tu aplicación.

### PHP

Laravel 5.5 requiere PHP 7.0.0 o superior.

### Actualizando Dependencias

Actualiza tu dependencia de `laravel/framework` a `5.5.*` en tu archivo `composer.json`. Adicionalmente, debes actualizar tu dependencia `phpunit/phpunit` a `~6.0`. Luego, agrega el paquete `filp/whoops` con la version `~2.0` a la sección`require-dev` de tu archivo `composer.json`. Finalmente, en la sección `scripts` de tu archivo `composer.json`, agrega el comando `package:discover` al evento `post-autoload-dump`:

    "scripts": {
        ...
        "post-autoload-dump": [
            "Illuminate\\Foundation\\ComposerScripts::postAutoloadDump",
            "@php artisan package:discover"
        ],
    }

Por supuesto, no olvides examinar cualquier otro paquete de terceros consumido por tu aplicación y verificar que estás usando la versión adecuada para soportar Laravel 5.5

#### Instalador De Laravel

> {tip} Si normalmente usas el instalador de Laravel mediante `laravel new`, deberías actualizar el paquete del instalador de Laravel usando el comando `composer global update`.

#### Laravel Dusk

Laravel Dusk `2.0.0` ha sido liberado para proporcionar compatibilidad con Laravel 5.5 y pruebas sin encabezado de Chrome.

#### Pusher

El driver para difusión de eventos Pusher ahora requiere la versión `~3.0` del SDK de Pusher.

#### Swift Mailer

Laravel 5.5 requiere la versión `~6.0` de Swift Mailer.

### Artisan

#### Carga Automática de Comandos

En Laravel 5.5, Artisan puede descubrir comandos automáticamente para que así no tengas que registrarlos manualmente en tu kernel. Para tomar ventaja de esta característica, debes agregar la siguiente línea al método `commands` de tu clase `App\Console\Kernel`:

    $this->load(__DIR__.'/Commands');

#### Método `fire`

Cualquier método `fire` presente en tus comandos de Artisan deben ser renombrados a `handle`.

#### Comando `optimize`

Con mejoras recientes a la cache op-code de PHP, el comando `optimize` de Artisan ya no es necesario. Debes eleminar cualquier referencia a este comando de tus scripts de deployment ya que será removido en versiones futuras de Laravel.

### Autorización

#### Método De Controlador `authorizeResource`

Al pasar un nombre de modelo con múltiples palabras al método `authorizeResource`, el segmento de ruta resultante ahora será de tipo "snake", igualando el comportamiento de los controladores de recursos.

#### Método De Política `before`

El método `before` de una clase de política no será llamado si la clase no contiene un método que iguale el nombre de la habilidad siendo comprobada.

### Cache

#### Driver De Base De Datos

Si estás usando el driver de cache de la base de datos, debes ejecutar `php artisan cache:clear` al desplegar tu aplicación actualizada de Laravel 5.5 por primera vez.

### Eloquent

#### Método `belongsToMany`

Si estás sobrescribiendo el método `belongsToMany` en tu modelo de Eloquent, debes actualizar la firma de tu método para reflejar la adición de nuevos argumentos:

    /**
     * Define a many-to-many relationship.
     *
     * @param  string  $related
     * @param  string  $table
     * @param  string  $foreignPivotKey
     * @param  string  $relatedPivotKey
     * @param  string  $parentKey
     * @param  string  $relatedKey
     * @param  string  $relation
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function belongsToMany($related, $table = null, $foreignPivotKey = null,
                                  $relatedPivotKey = null, $parentKey = null,
                                  $relatedKey = null, $relation = null)
    {
        //
    }

#### BelongsToMany `getQualifiedRelatedKeyName`

El método `getQualifiedRelatedKeyName` ha sido renombrado a `getQualifiedRelatedPivotKeyName`.

#### BelongsToMany `getQualifiedForeignKeyName`

El método `getQualifiedForeignKeyName` ha sido renombrado a `getQualifiedForeignPivotKeyName`.

#### Método De Modelo `is`

Si estás sobrescribiendo el método `is` de tu modelo de Eloquent, debes eliminar la determinación de tipo de `Model` del método. Esto permite que el método is reciba `null` como argumento:

    /**
     * Determine if two models have the same ID and belong to the same table.
     *
     * @param  \Illuminate\Database\Eloquent\Model|null  $model
     * @return bool
     */
    public function is($model)
    {
        //
    }

#### Propiedad De Modelos `$events`

La propiedad `$events` en tus modelos debe ser renombrada a `$dispatchesEvents`. Este cambio fue hecho debido a que un gran número de usuarios necesitan definir una relación `events`, que puede causar conflictos con el nombre de propiedad antiguo.

#### Propiedad `$parent` De Pivot

La propiedad protegida `$parent` en la clase `Illuminate\Database\Eloquent\Relations\Pivot` ha sido renombrada a `$pivotParent`.

#### Métodos `create` De Relaciones

Los métodos `create` de las clases `BelongsToMany`, `HasOneOrMany` y `MorphOneOrMany` han sido modificados para proporcionar un valor por defecto para el argumento `$attributes`. Si estás sobrescribiendo estos métodos, debes actualizar tus firmas para que coincidan con la nueva definición:

    public function create(array $attributes = [])
    {
        //
    }

#### Eliminación Parcial De Modelos

Al eliminar un modelo "eliminado parcialmente", la propiedad `exists` en el modelo permanecerá `true`.

#### Formato De Columna `withCount`

Al usar un alias, el método `withCount` ya no agregará automáticamente `_count` al nombre de columna resultante. Por ejemplo, en Laravel 5.4, la siguiente consulta resultaría en una columna `bar_count` siendo agregada a la consulta:

    $users = User::withCount('foo as bar')->get();

Sin embargo, en Laravel 5.5, el alias será usado exactamente como es dado. Si te gustaría agregar `_count` a la columna resultante, debes especificar dicho sufijo al definir el alias:

    $users = User::withCount('foo as bar_count')->get();

#### Métodos & Nombres De Atributos De Modelos

Para prevenir el acceso a las propiedades privadas de un modelo al usar acceso de arreglo, ya no es posible tener un método de modelo con el mismo nombre de un atributo o propiedad. Hacer eso causará que excepciones sean lanzadas al acceder a los atributos del modelo mediante acceso de arreglo (`$user['name']`) o la función helper `data_get`.

### Formato De Excepción

En Laravel 5.5, todas las excepciones, incluyendo las excepciones de validación, son convertidas en respuestas HTTP por el manejador de excepciones. Adicionalmente, el formato por defecto para los errores de validación de JSON ha cambiado. El nuevo formato se ajusta a la siguiente convención:

    {
        "message": "The given data was invalid.",
        "errors": {
            "field-1": [
                "Error 1",
                "Error 2"
            ],
            "field-2": [
                "Error 1",
                "Error 2"
            ],
        }
    }

Sin embargo, si te gustaría mantener el formato de error de JSON de Laravel 5.4, puedes agregar el siguiente método a tu clase `App\Exceptions\Handler`:

    use Illuminate\Validation\ValidationException;

    /**
     * Convert a validation exception into a JSON response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Illuminate\Validation\ValidationException  $exception
     * @return \Illuminate\Http\JsonResponse
     */
    protected function invalidJson($request, ValidationException $exception)
    {
        return response()->json($exception->errors(), $exception->status);
    }

#### Intentos De Autenticación De JSON

Este cambio también afecta el formato de error de validación para los intentos de autenticación mediante JSON. En Laravel 5.5, los fallos de autenticación de JSON retornarán los mensajes de errores siguiendo la nueva convención de forma descrita arriba.

#### Una Nota Sobre Form Requests

Si estuvierás personalizando el formato de respuesta para un form request individual, ahora debes sobrescribir el método `failedValidation` de dicho form request y lanzar una instancia de `HttpResponseException` que contenga tu respuesta personalizada:

    use Illuminate\Http\Exceptions\HttpResponseException;

    /**
     * Handle a failed validation attempt.
     *
     * @param  \Illuminate\Contracts\Validation\Validator  $validator
     * @return void
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json(..., 422));
    }

### Sistema De Archivos

#### Método `files`

El método `files` de la clase `Illuminate\Filesystem\Filesystem` ha cambiado su firma para agregar el argumento `$hidden` y ahora retorna un arreglo de objetos `SplFileInfo`, similar al método `allFiles`. Previamente, el método `files` retornaba un arreglo de cadenas con nombres de rutas. La nueva firma es la siguiente:

    public function files($directory, $hidden = false)

### Correo

#### Parametros Sin Usar

Los argumentos sin usar `$data` y `$callback` fueron removidos de los métodos `queue` y `later` del contrato `Illuminate\Contracts\Mail\MailQueue`:

    /**
     * Queue a new e-mail message for sending.
     *
     * @param  string|array|MailableContract  $view
     * @param  string  $queue
     * @return mixed
     */
    public function queue($view, $queue = null);

    /**
     * Queue a new e-mail message for sending after (n) seconds.
     *
     * @param  \DateTimeInterface|\DateInterval|int  $delay
     * @param  string|array|MailableContract  $view
     * @param  string  $queue
     * @return mixed
     */
    public function later($delay, $view, $queue = null);

### Colas

#### Helper `dispatch`

Si te gustaría despachar un trabajo que se ejecuta inmediatamente y retorna un valor desde el método `handle`, deberías usar los métodos `dispatch_now` o `Bus::dispatchNow` para despachar el trabajo:

    use Illuminate\Support\Facades\Bus;

    $value = dispatch_now(new Job);

    $value = Bus::dispatchNow(new Job);

### Solicitudes

#### Método `all`

Si estás sobrescribiendo el método `all` de la clase `Illuminate\Http\Request`, deberías actualizar la firma de tu método para reflejar el nuevo argumento `$keys`:

    /**
     * Get all of the input and files for the request.
     *
     * @param  array|mixed  $keys
     * @return array
     */
    public function all($keys = null)
    {
        //
    }

#### Método `has`

El método `$request->has` ahora retornará `true` incluso si el valor del campo es una cadena vacia o `null`. Un nuevo método `$request->filled` ha sido agregado que proporciona el comportamiento anterior del método `has`.

#### Método `intersect`

El método `intersect` ha sido eliminado. Puedes replicar este comportamiento usando `array_filter` en una llamada a `$request->only`:

    return array_filter($request->only('foo'));

#### Método `only`

El método `only` ahora sólo retornará atributos que estén presentes en la carga de la solicitud. Si te gustaría preservar el comportamiento anterior del método `only`, puedes usar el método `all` en su lugar.

    return $request->all('foo');

#### Helper `request()`

El helper `request` ya no retornará claves anidadas. Si es necesario, puedes usar el método `input` de la solicitud para lograr este comportamiento:

    return request()->input('filters.date');

### Pruebas

#### Aserciones De Autenticación

Algunas aserciones de autenticación fueron renombradas para mejor consistencia con el resto de las aserciones del framework:

<div class="content-list" markdown="1">
- `seeIsAuthenticated` fue renombrada a `assertAuthenticated`.
- `dontSeeIsAuthenticated` fue renombrada a `assertGuest`.
- `seeIsAuthenticatedAs` fue renombrada a `assertAuthenticatedAs`.
- `seeCredentials` fue renombrada a `assertCredentials`.
- `dontSeeCredentials` fue renombrada a `assertInvalidCredentials`.
</div>

#### Mail Fake

Si estás usando el fake `Mail` para determinar si un mailable fue **agregado a la cola** durante una solicitud, ahora debes usar `Mail::assertQueued` en lugar de `Mail::assertSent`. Esta distinción te permite verificar específicamente que correo fue agregado a la cola para envio en segundo plano y que no es enviado durante la solicitud como tal.

#### Tinker

Laravel Tinker ahora soporta omitir nombres de espacio al hacer referencia a las clases de tu aplicación. Esta característica requiere un mapeo de clase optimizado de Composer, así que debes agregar la directiva `optimize-autoloader` a la sección `config` de tu archivo `composer.json`:

    "config": {
        ...
        "optimize-autoloader": true
    }

### Traducción

#### `LoaderInterface`

La interfaz `Illuminate\Translation\LoaderInterface` ha sido movida a `Illuminate\Contracts\Translation\Loader`.

### Validación

#### Métodos Del Validador

Todos los métodos de validación del validador ahora son `publicos` en lugar de `protegidos`.

### Vistas

#### Nombres De Variable Dinámicos "With"

Al permitir que el método dinámico `__call` comporta variables con una vista, estas variables automáticamente usarán "camel case". Por ejemplo, dado lo siguiente:

    return view('pool')->withMaximumVotes(100);

La variable `maximumVotes` será accedida en la plantilla de la siguiente forma:

    {{ $maximumVotes }}

#### Directiva `@php` De Blade

La directiva `@php` de blade ya no acepta etiquetas en línea. En su lugar, usa la forma completa de la directiva:

    @php
        $teamMember = true;
    @endphp

### Misceláneo

También te invitamos a ver los cambios en el [repositorio de GitHub](https://github.com/laravel/laravel) `laravel/laravel`. Mientras que muchos de estos cambios no son requeridos, puedes querer mantener estos archivos sincronizados con tu aplicación. Algunos de estos cambios serán cubiertos en esta guía de actualización, pero otros, tales como cambios a archivos de configuración o comentarios, no lo serán. Puedes fácilmente ver los cambios con la [herramienta de comparación de GitHub](https://github.com/laravel/laravel/compare/5.4...master) y elegir que actualizaciones son importantes para ti.
