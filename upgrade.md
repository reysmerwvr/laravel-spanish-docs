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

#### Model `$events` Property

The `$events` property on your models should be renamed to `$dispatchesEvents`. This change was made because of a high number of users needing to define an `events` relationship, which caused a conflict with the old property name.

#### Pivot `$parent` Property

The protected `$parent` property on the `Illuminate\Database\Eloquent\Relations\Pivot` class has been renamed to `$pivotParent`.

#### Relationship `create` Methods

The `BelongsToMany`, `HasOneOrMany`, and `MorphOneOrMany` classes' `create` methods have been modified to provide a default value for the `$attributes` argument. If you are overriding these methods, you should update your signatures to match the new definition:

    public function create(array $attributes = [])
    {
        //
    }

#### Soft Deleted Models

When deleting a "soft deleted" model, the `exists` property on the model will remain `true`.

#### `withCount` Column Formatting

When using an alias, the `withCount` method will no longer automatically append `_count` onto the resulting column name. For example, in Laravel 5.4, the following query would result in a `bar_count` column being added to the query:

    $users = User::withCount('foo as bar')->get();

However, in Laravel 5.5, the alias will be used exactly as it is given. If you would like to append `_count` to the resulting column, you must specify that suffix when defining the alias:

    $users = User::withCount('foo as bar_count')->get();

#### Model Methods & Attribute Names

To prevent accessing a model's private properties when using array access, it's no longer possible to have a model method with the same name as an attribute or property. Doing so will cause exceptions to be thrown when accessing the model's attributes via array access (`$user['name']`) or the `data_get` helper function.

### Exception Format

In Laravel 5.5, all exceptions, including validation exceptions, are converted into HTTP responses by the exception handler. In addition, the default format for JSON validation errors has changed. The new format conforms to the following convention:

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

However, if you would like to maintain the Laravel 5.4 JSON error format, you may add the following method to your `App\Exceptions\Handler` class:

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

#### JSON Authentication Attempts

This change also affects the validation error formatting for authentication attempts made over JSON. In Laravel 5.5, JSON authentication failures will return the error messages following the new formatting convention described above.

#### A Note On Form Requests

If you were customizing the response format of an individual form request, you should now override the `failedValidation` method of that form request, and throw an `HttpResponseException` instance containing your custom response:

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

### Filesystem

#### The `files` Method

The `files` method of the `Illuminate\Filesystem\Filesystem` class has changed its signature to add the `$hidden` argument and now returns an array of `SplFileInfo` objects, similar to the `allFiles` method. Previously, the `files` method returned an array of string path names. The new signature is as follows:

    public function files($directory, $hidden = false)

### Mail

#### Unused Parameters

The unused `$data` and `$callback` arguments were removed from the `Illuminate\Contracts\Mail\MailQueue` contract's `queue` and `later` methods:

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

### Queues

#### The `dispatch` Helper

If you would like to dispatch a job that runs immediately and returns a value from the `handle` method, you should use the `dispatch_now` or `Bus::dispatchNow` method to dispatch the job:

    use Illuminate\Support\Facades\Bus;

    $value = dispatch_now(new Job);

    $value = Bus::dispatchNow(new Job);

### Requests

#### The `all` Method

If you are overriding the `all` method of the `Illuminate\Http\Request` class, you should update your method signature to reflect the new `$keys` argument:

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

#### The `has` Method

The `$request->has` method will now return `true` even if the input value is an empty string or `null`. A new `$request->filled` method has been added that provides the previous behavior of the `has` method.

#### The `intersect` Method

The `intersect` method has been removed. You may replicate this behavior using `array_filter` on a call to `$request->only`:

    return array_filter($request->only('foo'));

#### The `only` Method

The `only` method will now only return attributes that are actually present in the request payload. If you would like to preserve the old behavior of the `only` method, you may use the `all` method instead.

    return $request->all('foo');

#### The `request()` Helper

The `request` helper will no longer retrieve nested keys. If needed, you may use the `input` method of the request to achieve this behavior:

    return request()->input('filters.date');

### Testing

#### Authentication Assertions

Some authentication assertions were renamed for better consistency with the rest of the framework's assertions:

<div class="content-list" markdown="1">
- `seeIsAuthenticated` was renamed to `assertAuthenticated`.
- `dontSeeIsAuthenticated` was renamed to `assertGuest`.
- `seeIsAuthenticatedAs` was renamed to `assertAuthenticatedAs`.
- `seeCredentials` was renamed to `assertCredentials`.
- `dontSeeCredentials` was renamed to `assertInvalidCredentials`.
</div>

#### Mail Fake

If you are using the `Mail` fake to determine if a mailable was **queued** during a request, you should now use `Mail::assertQueued` instead of `Mail::assertSent`. This distinction allows you to specifically assert that the mail was queued for background sending and not sent during the request itself.

#### Tinker

Laravel Tinker now supports omitting namespaces when referring to your application classes. This feature requires an optimized Composer class-map, so you should add the `optimize-autoloader` directive to the `config` section of your `composer.json` file:

    "config": {
        ...
        "optimize-autoloader": true
    }

### Translation

#### The `LoaderInterface`

The `Illuminate\Translation\LoaderInterface` interface has been moved to `Illuminate\Contracts\Translation\Loader`.

### Validation

#### Validator Methods

All of the validator's validation methods are now `public` instead of `protected`.

### Views

#### Dynamic "With" Variable Names

When allowing the dynamic `__call` method to share variables with a view, these variables will automatically use "camel" case. For example, given the following:

    return view('pool')->withMaximumVotes(100);

The `maximumVotes` variable may be accessed in the template like so:

    {{ $maximumVotes }}

#### `@php` Blade Directive

The `@php` blade directive no longer accepts inline tags. Instead, use the full form of the directive:

    @php
        $teamMember = true;
    @endphp

### Miscellaneous

We also encourage you to view the changes in the `laravel/laravel` [GitHub repository](https://github.com/laravel/laravel). While many of these changes are not required, you may wish to keep these files in sync with your application. Some of these changes will be covered in this upgrade guide, but others, such as changes to configuration files or comments, will not be. You can easily view the changes with the [GitHub comparison tool](https://github.com/laravel/laravel/compare/5.4...master) and choose which updates are important to you.
