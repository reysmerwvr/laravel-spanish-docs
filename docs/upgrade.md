:::pre
# Guía de Actualización

- [Actualizando a 6.0 desde 5.8](#upgrade-6.0)

<a name="high-impact-changes"></a>
## Cambios de alto impacto

- [Recursos autorizados y `viewAny`](#authorized-resources)
- [Helpers de String y Array](#helpers)

<a name="medium-impact-changes"></a>
## Cambios de mediano impacto

- [Carbon 1.x ya no está soportado](#carbon-support)
- [Cliente por defecto de Redis](#redis-default-client)
- [Método `Capsule::table` de base de datos](#capsule-table)
- [Arrayable y `toArray` de Eloquent](#eloquent-to-array)
- [Método `BelongsTo::update` de Eloquent](#belongs-to-update)
- [Tipos de clave primaria en Eloquent](#eloquent-primary-key-type)
- [Métodos de configuración regional `Lang::trans` y `Lang::transChoice`](#trans-and-trans-choice)
- [Método de configuración regional `Lang::getFromJson`](#get-from-json)
- [Límite de reintento de cola](#queue-retry-limit)
- [Reenviar ruta de verificación de correo electrónico](#email-verification-route)
- [Facade `Input`](#the-input-facade)

<a name="upgrade-6.0"></a>

## Actualizando a 6.0 desde 5.8

#### Tiempo de actualización estimado: una hora

>  **Nota:** Intentamos documentar cada posible cambio de ruptura (breaking change). Dado que algunos de estos cambios de ruptura se encuentran en las partes oscuras del framework, solo una parte de estos cambios puede afectar tu aplicación.

### PHP 7.2 Obligatorio

**Probabilidad de impacto: Medio**

PHP 7.1 ya no se mantendrá activamente a partir de diciembre de 2019. Por lo tanto, Laravel 6.0 requiere PHP 7.2 o superior.

<a name="updating-dependencies"></a>
### Actualizando dependencias

Actualiza tu dependencia `laravel/framework` a `^6.0` en tu archivo `composer.json`.

Luego, revisa los paquetes de terceros consumidos por tu aplicación y verifica estás usando la versión adecuada para soportar Laravel 6.

### Autorización

<a name="authorized-resources"></a>
#### Recursos autorizados y `viewAny`

**Probabilidad de impacto: Alto**

Las políticas de autorización adjuntadas a los controladores que utilizan el método `authorizeResource` ahora deberían definir un método `viewAny`, que se llamará cuando un usuario acceda al método `index` del controlador. De lo contrario, las llamadas al método `index` del controlador serán rechazadas como no autorizadas.

#### Respuestas de autorización

**Probabilidad de impacto: Bajo**

La firma del constructor de la clase `Illuminate\Auth\Access\Response` ha cambiado. Debes actualizar tu código de acuerdo a ello. Si no estás manualmente construyendo respuestas y solo estás usando los métodos de instancia `allow` y `deny` dentro de tus políticas, no se requiere ningún cambio:

```php
/**
* Create a new response.
*
* @param  bool  $allowed
* @param  string  $message
* @param  mixed  $code
* @return void
*/
public function __construct($allowed, $message = '', $code = null)
```

<a name="auth-access-gate-contract"></a>

#### La interfaz `Illuminate\Contracts\Auth\Access\Gate`

**Probabilidad de impacto: Bajo**

La interfaz `Illuminate\Contracts\Auth\Access\Gate` ha recibido un nuevo método `inspect`. Si estás implementando esta interfaz manualmente, debes agregar debes agregar este método en tu implementación.

### Carbon

<a name="carbon-support"></a>
#### Carbon 1.x ya no está soportado

**Probabilidad de impacto: Medio**

Carbon 1.x [ya no está soportado](https://github.com/laravel/framework/pull/28683) debido a que la fecha de fin de mantenimiento está cerca. Por favor actualiza tu aplicación a Carbon 2.0.

### Configuración

#### La variable de entorno `AWS_REGION`

**Probabilidad de impacto: Opcional**

Si planeas usar [Laravel Vapor](https://vapor.laravel.com), debes actualizar todas las apariciones de `AWS_REGION` dentro de tu directorio `config` a `AWS_DEFAULT_REGION`. Además, debes actualizar el nombre de esta variable de entorno en tu archivo `.env`.

<a name="redis-default-client"></a>
#### Cliente por defecto de Redis

**Probabilidad de impacto: Medio**

El cliente por defecto de Redis ha cambiado de `predis` a `phpredis`. Para seguir usando `predis`, asegúrate que la opción de configuración `redis.client` está establecida como `predis` en tu archivo de configuración `config/database.php`.


### Base de datos

<a name="capsule-table"></a>
#### El método `table` de Capsule

**Probabilidad de impacto: Medio**

> **Nota:** Este cambio solo aplica para aplicaciones no Laravel que están usando a `illuminate/database` como una dependencia.

La firma del método `table` de la clase `Illuminate\Database\Capsule\Manager` se ha actualizado para aceptar un alias de tabla como segundo argumento. Si estás usando  `illuminate/database` fuera de una aplicacion de Laravel, debes actualizar cualquier llamado a este método de acuerdo con:

```php
/**
* Get a fluent query builder instance.
*
* @param  \Closure|\Illuminate\Database\Query\Builder|string  $table
* @param  string|null  $as
* @param  string|null  $connection
* @return \Illuminate\Database\Query\Builder
*/
public static function table($table, $as = null, $connection = null)
```

#### El método `cursor`

**Probabilidad de impacto: Bajo**

El método `cursor` ahora retorna una instancia de `Illuminate\Support\LazyCollection` en vez de un `Generator`.  `LazyCollection` puede ser iterada como un generador:

```php
$users = App\User::cursor();

foreach ($users as $user) {
   //
}
```

<a name="eloquent"></a>
### Eloquent

<a name="belongs-to-update"></a>
#### El método `BelongsTo::update`

**Probabilidad de impacto: Medio**

Por coherencia, el método `update` de la relación `BelongsTo` ahora funciona como una consulta de actualización ad-hoc, lo que significa que no proporciona protección de asignación masiva ni dispara eventos Eloquent. Esto hace que la relación sea consistente con los métodos `update` de todos los demás tipos de relaciones.

Si deseas actualizar un modelo asociado a través de una relación `BelongsTo` recibiendo protección y eventos de actualización de asignación masiva, debes llamar al método `update` en el mismo modelo:

```php
// Consulta Ad-hoc... sin protección o eventos de asignación masiva...
$post->user()->update(['foo' => 'bar']);

// Actualización del modelo... proporciona protección y eventos de asignación masiva...
$post->user->update(['foo' => 'bar']);
```

<a name="eloquent-to-array"></a>
#### Arrayable y `toArray`

**Probabilidad de impacto: Medio**

El método `toArray` del modelo Eloquent ahora convertirá cualquier atributo que implemente `Illuminate\Contracts\Support\Arrayable` a un arreglo.

<a name="eloquent-primary-key-type"></a>
#### Declaración del tipo de clave primaria

**Probabilidad de impacto: Medio**

Laravel 6.0 ha recibido [optimizaciones de rendimiento](https://github.com/laravel/framework/pull/28153) para tipos de clave que usa entero. Si estás utilizando una cadena (string) como clave primaria de tu modelo, debes declarar el tipo de clave utilizando la propiedad `$keyType` en tu modelo:

```php
/**
* The "type" of the primary key ID.
*
* @var string
*/
protected $keyType = 'string';
```

### Verificación de correo electrónico

<a name="email-verification-route"></a>
#### Reenviar ruta de verificación de correo electrónico

**Probabilidad de impacto: Medio**

Para evitar posibles ataques de CSRF, la ruta `email/resend` registrada por el enrutador cuando se utiliza la verificación de correo electrónico incorporada en Laravel se ha actualizado de una ruta `GET` a una ruta `POST`. Por lo tanto, deberás actualizar tu frontend para enviar el tipo de solicitud adecuado a esta ruta. Por ejemplo, si estás utilizando la plantilla de verificación de correo electrónico por defecto de Laravel sería:

```php
{{ __('Before proceeding, please check your email for a verification link.') }}
{{ __('If you did not receive the email') }},

<form class="d-inline" method="POST" action="{{ route('verification.resend') }}">
    @csrf

    <button type="submit" class="btn btn-link p-0 m-0 align-baseline">
        {{ __('click here to request another') }}
    </button>.
</form>
```

<a name="mustverifyemail-contract"></a>

#### La interfaz `MustVerifyEmail`

**Probabilidad de impacto: Bajo**

Se ha agregado un nuevo método `getEmailForVerification` a la interfaz `Illuminate\Contracts\Auth\MustVerifyEmail`. Si estás implementando manualmente esta interfaz, debes implementar este método, el cual debe devolver la dirección de correo electrónico asociada del objeto. Si tu modelo `App\User` está utilizando el trait `Illuminate\Auth\MustVerifyEmail`, no se requieren cambios, ya que este trait implementa este método por ti.

<a name="helpers"></a>
### Helpers

#### Paquete para helpers String y Array

**Probabilidad de impacto: Alto**

Todos los helpers `str_` y `array_` se han movido al nuevo paquete de Composer `laravel/helpers` y se han eliminado del framework. Si lo deseas, puedes actualizar todas las llamadas a estos helpers para usar las clases `Illuminate\Support\Str` y `Illuminate\Support\Arr`. Alternativamente, puede agregar el nuevo paquete `laravel/helpers` a tu aplicación para continuar usando estos helpers:

```sh
composer require laravel/helpers
```

### Configuración regional

<a name="trans-and-trans-choice"></a>
#### Los métodos `Lang::trans` y `Lang::transChoice`

**Probabilidad de impacto: Medio**

Los métodos `Lang::trans` y `Lang::transChoice` del traductor han sido renombrados a `Lang::get` y `Lang::choice` respectivamente.

Además, si estás manualmente implementando la interfaz  `Illuminate\Contracts\Translation\Translator`, debes actualizar tus implementaciones de los métodos `trans` y `transChoice` a `get` y `choice`.

<a name="get-from-json"></a>
#### El método `Lang::getFromJson`

**Probabilidad de impacto: Medio**

Los métodos `Lang::get` y `Lang::getFromJson` se han consolidado. Las llamadas al método `Lang::getFromJson` debe ser actualizado para llamar a `Lang::get`.

> **Nota:** Debes ejecutar el comando Artisan `php artisan view:clear` para evitar errores de Blade relacionados a la eliminación de `Lang::transChoice`, `Lang::trans`, y `Lang::getFromJson`.

### Correo Electrónico

#### Los controladores Mandrill y SparkPost se eliminaron

**Probabilidad de impacto: Bajo**

Los controladores de correo electrónico `mandrill` y `sparkpost` se han eliminado. Si te gustaría continuar usando uno de estos controladores, te animamos a adoptar un paquete mantenido por la comunidad que proporcione el controlador.

### Notificaciones

#### Rutas de Nexmo eliminadas

**Probabilidad de impacto: Bajo**

Una parte persistente del canal de notificación de Nexmo fue eliminada del núcleo del framework. Si estás confiando en las rutas de notificaciones de Nexmo debes manualmente implementar el método `routeNotificationForNexmo` tu entidad notificable  [como se describe en la documentación](/docs/{{version}}/notifications#routing-sms-notifications).

### Restablecimiento de contraseña

#### Validación de contraseña

**Probabilidad de impacto: Bajo**

El `PasswordBroker` ya no restringe ni valida las contraseñas. La validación de la contraseña ya estaba siendo manejada por la clase `ResetPasswordController`, haciendo que las validaciones del broker fueran redundantes e imposibles de personalizar. Si estás utilizando manualmente el `PasswordBroker` (o la facade de` Password`) fuera del `ResetPasswordController` incorporado, debes validar todas las contraseñas antes de pasarlas al broker.

### Colas

<a name="queue-retry-limit"></a>
#### Límite de reintento de cola

**Probabilidad de impacto: Medio**

En versiones anteriores de Laravel, el comando `php artisan queue:work` reintenta los trabajos indefinidamente. A partir de Laravel 6.0, este comando ahora intentará un trabajo una vez por defecto. Si deseas forzar que los trabajos se intenten indefinidamente, puedes pasar `0` a la opción `--tries`:

```sh
php artisan queue:work --tries=0
```

Además, por favor garantiza que la base de datos de tu aplicación contiene un tabla  `failed_jobs`. Puedes generar una migración para esta tabla usando el comando de Artisan `queue:failed-table`:

```sh
php artisan queue:failed-table
```

### Solicitudes HTTP

<a name="the-input-facade"></a>
#### El facade `Input`

**Probabilidad de impacto: Medio**

El facade `Input` que era principalmente un duplicado de la facade `Request` se ha eliminado. Si estás usando el método `Input::get` debes ahora llamar al método `Request::input`. Todas las demás llamadas a la facade `Input` pueden simplemente actualizarse para usar la facade `Request`.

### Programación de tareas

#### El método `between`

**Probabilidad de impacto: Bajo**

En versiones anteriores de Laravel, el método `between` del programador de tareas mostraba un comportamiento confuso a través de los límites de la fecha. Por ejemplo:

```php
$schedule->command('list')->between('23:00', '4:00');
```

Para la mayoría de los usuarios, el comportamiento esperado de este método sería ejecutar el comando `list` cada minuto durante todos los minutos entre las 23:00 y las 4:00. Sin embargo, en versiones anteriores de Laravel, el programador ejecuta el comando `list` cada minuto entre las 4:00 y las 23:00, esencialmente intercambiando los umbrales de tiempo. En Laravel 6.0, este comportamiento se ha corregido.

### Almacenamiento

<a name="rackspace-storage-driver"></a>
#### Controlador de almacenamiento Rackspace eliminado

**Probabilidad de impacto: Bajo**

Se ha eliminado el controlador de almacenamiento `rackspace`. Si deseas continuar usando Rackspace como proveedor de almacenamiento, te recomendamos que adoptes un paquete de tu elección mantenido por la comunidad que proporcione este controlador.

### Generación de URL

#### Generación de rutas URL y parámetros extras

En versiones previas de Laravel, pasar parámetros de arreglos asociativos al helper `route` o al método `URL::route` podía ocasionar el uso de estos parámetros como valores de URI cuando generabas URLs para rutas con parámetros opcionales, incluso si el valor del parámetro no tenía una llave que coincidiera con las llaves esperadas. A partir de Laravel 6.0, estos valores se usará como parte del "query string". Por ejemplo, considera la siguiente ruta:

    Route::get('/profile/{location?}', function ($location = null) {
        //
    })->name('profile');

    // Laravel 5.8: http://example.com/profile/active
    echo route('profile', ['status' => 'active']);

    // Laravel 6.0: http://example.com/profile?status=active
    echo route('profile', ['status' => 'active']);    


<a name="miscellaneous"></a>
### Misceláneos

También te recomendamos que veas los cambios en el [repositorio de Github](https://github.com/laravel/laravel) `laravel/laravel`.  Si bien muchos de estos cambios no son necesarios, es posible que desees mantener estos archivos sincronizados con tu aplicación. Algunos de estos cambios se tratarán en esta guía de actualización, pero otros, como los cambios en los archivos de configuración o los comentarios, no lo estarán. Puedes ver fácilmente los cambios con la [herramienta de comparación GitHub](https://github.com/laravel/laravel/compare/5.8...master) y elegir qué actualizaciones son importantes para ti.
:::
