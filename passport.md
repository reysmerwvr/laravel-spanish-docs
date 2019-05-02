::: v-pre

# Laravel Passport

- [Introducción](#introduction)
- [Instalación](#installation)
    - [Inicio Rápido De Frontend](#frontend-quickstart)
    - [Despliegue De Passport](#deploying-passport)
- [Configuración](#configuration)
    - [Duración De Tokens](#token-lifetimes)
    - [Sobrescribiendo Modelos Predeterminados](#overriding-default-models)
- [Emitiendo Tokens De Acceso](#issuing-access-tokens)
    - [Administrando Clientes](#managing-clients)
    - [Solicitando Tokens](#requesting-tokens)
    - [Actualización De Tokens](#refreshing-tokens)
- [Tokens De Permiso De Contraseña](#password-grant-tokens)
    - [Creando Un Cliente Con Permiso De Contraseña](#creating-a-password-grant-client)
    - [Solicitando Tokens](#requesting-password-grant-tokens)
    - [Solicitando Todos los Alcances](#requesting-all-scopes)
    - [Personalizando El Campo Username](#customizing-the-username-field)
- [Tokens De Permiso Implícitos](#implicit-grant-tokens)
- [Tokens De Permiso De Credenciales De Cliente](#client-credentials-grant-tokens)
- [Tokens De Acceso Personal](#personal-access-tokens)
    - [Creando un Cliente De Acceso Personal](#creating-a-personal-access-client)
    - [Administrando Tokens De Acceso Personal](#managing-personal-access-tokens)
- [Protegiendo Rutas](#protecting-routes)
    - [Por Medio De Middleware](#via-middleware)
    - [Pasando El Token De Acceso](#passing-the-access-token)
- [Alcances De Token](#token-scopes)
    - [Definiendo Alcances](#defining-scopes)
    - [Alcance Predeterminado](#default-scope)
    - [Asignando Alcances A Los Tokens](#assigning-scopes-to-tokens)
    - [Verificando Alcances](#checking-scopes)
- [Consumiendo Tu API Con JavaScript](#consuming-your-api-with-javascript)
- [Eventos](#events)
- [Pruebas](#testing)

<a name="introduction"></a>
## Introducción

Laravel ya hace fácil ejecutar la autenticación por medio de los tradicionales formularios de inicio de sesión, pero ¿Qué información tenemos sobre APIs? Las APIs típicamente usan tokens para autenticar a los usuarios y no mantienen el estado de sesión entre solicitudes. Laravel hace de la autenticación de API algo muy simple usando Passport de Laravel, el cual proporciona una implementación de servidor OAuth2 completa para tu aplicación Laravel en sólo minutos. Passport está construido sobre el [servidor OAuth2](https://github.com/thephpleague/oauth2-server) que es mantenido por Andy Millington y Simon Hamp..

::: danger Nota
Esta documentación asume que estás familiarizado con OAuth2. Si no sabes nada sobre OAuth2, considera familiarizarte con la [terminología general](https://oauth2.thephpleague.com/terminology/) y las características de Outh2 antes de continuar.
:::

<a name="installation"></a>
## Instalación

Para empezar, instala Passport por medio del gestor de paquetes Composer:

```php
composer require laravel/passport
```

El proveedor de servicio de Passport registra su propio directorio de migración de base de datos con el framework, así que deberías migrar tu base de datos después de registrar el paquete. Las migraciones de Passport crearán las tablas que tu aplicación necesita para almacenar clientes y tokens de acceso:

```php
php artisan migrate
```

A continuación, debes ejecutar el comando `passport:install`. Este comando creará las claves de encriptación necesarias para generar tokens de acceso seguro. Además, el comando creará clientes de "acceso personal" y "permiso de contraseña" los cuales serán usados para generar tokens de acceso:

```php
php artisan passport:install
```

Después de ejecutar este comando, agrega el trait `Laravel\Passport\HasApiTokens` a tu modelo `App\User`. Este trait proporcionará algunos métodos helper para tu modelo los cuales permitirán que inspecciones el token y alcances del usuario autenticado:

```php
<?php

namespace App;

use Laravel\Passport\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;
}
```

Lo próximo, deberías ejecutar el método `Passport::routes` dentro del método `boot` de tu `AuthServiceProvider`. Este método registrará las rutas necesarias para suministrar tokens y revocar tokens de acceso, clientes y tokens de acceso personal:

```php
<?php

namespace App\Providers;

use Laravel\Passport\Passport;
use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
    * The policy mappings for the application.
    *
    * @var array
    */
    protected $policies = [
        'App\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
    * Register any authentication / authorization services.
    *
    * @return void
    */
    public function boot()
    {
        $this->registerPolicies();

        Passport::routes();
    }
}
```

Finalmente, en tu archivo de configuración `config/auth.php`, debes establecer la opción `driver` del guardia de autenticación de `api` a `passport`. Esto indicará a tu aplicación que utilice el `TokenGuard` de Passport al momento de autenticar las solicitudes de API entrantes:

```php
'guards' => [
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],

    'api' => [
        'driver' => 'passport',
        'provider' => 'users',
    ],
],
```

### Personalización De La migración

Si no vas a utilizar las migraciones predeterminadas de Passport, debes llamar al método `Passport::ignoreMigrations` en el método `register` de tu `AppServiceProvider`. Puedes exportar las migraciones por defecto usando `php artisan vendor:publish --tag=passport-migrations`.

Por defecto, Passport usa una columna de enteros para almacenar el `user_id`. Si tu aplicación utiliza un tipo de columna diferente para identificar a los usuarios (por ejemplo: UUID), debes modificar las migraciones de Passport predeterminadas después de publicarlas.

<a name="frontend-quickstart"></a>
### Inicio Rápido De Frontend

::: danger Nota
Para usar los componentes de Vue, debes estar usando el framework de JavaScript [Vue](https://vuejs.org). Estos componentes también usarán el framework de CSS Bootstrap. Sin embargo, incluso si no estás usando estas herramientas, los componentes sirven como una referencia valiosa para tu propia implementación de frontend.
:::

Passport viene con una API JSON que puedes usar para permitir que tus usuarios creen tokens de acceso de clientes y personal. Sin embargo, puede ser que consuma tiempo codificar un frontend para interactuar con estas APIs. Así que, Passport también incluye componentes de [Vue](https://vuejs.org) pre-construidos que puedes usar como implementación de ejemplo o punto de inicio para tu propia implementación.

Para publicar los componentes de Vue de Passport, usa el comando Artisan `vendor:publish`:

```php
php artisan vendor:publish --tag=passport-components
```

Los componentes publicados serán colocados en tu directorio `resources/js/components`. Una vez que los componentes han sido publicados, debes registrarlos en tu archivo `resources/js/app.js`:

```javascript
Vue.component(
    'passport-clients',
    require('./components/passport/Clients.vue').default
);

Vue.component(
    'passport-authorized-clients',
    require('./components/passport/AuthorizedClients.vue').default
);

Vue.component(
    'passport-personal-access-tokens',
    require('./components/passport/PersonalAccessTokens.vue').default
);
```

::: danger Nota
Antes de Laravel v 5.7.19, anexar `.default` al registrar componentes da como resultado un error de consola. Una explicación para este cambio puedes encontrarla en las [notas de lanzamiento de Laravel Mix v 4.0.0](https://github.com/JeffreyWay/laravel-mix/releases/tag/v4.0.0).
:::

Después de registrar los componentes, asegurate de ejecutar `npm run dev` para recompilar tu código CSS/JS. Una vez que has recompilado tus código CSS/JS, puedes colocar los componentes dentro de una de las plantillas de tu aplicación para empezar a crear tokens de acceso clientes y personal:

```php
<passport-clients></passport-clients>
<passport-authorized-clients></passport-authorized-clients>
<passport-personal-access-tokens></passport-personal-access-tokens>
```

<a name="deploying-passport"></a>
### Despliegue De Passport

Al momento de usar Passport en tus servidores de producción por primera vez, es probable que debas ejecutar el comando `passport:keys`. Este comando genera las claves de encriptación que Passport necesita con el propósito de generar el token de acceso. Las claves generadas normalmente no son guardadas en control de código fuente:

```php
php artisan passport:keys
```

De ser necesario, puedes definir la ruta en la que se deben cargar las claves de Passport. Para lograr esto puedes usar el método `Passport::loadKeysFrom`:

```php
/**
* Register any authentication / authorization services.
*
* @return void
*/
public function boot()
{
    $this->registerPolicies();

    Passport::routes();

    Passport::loadKeysFrom('/secret-keys/oauth');
}
```

<a name="configuration"></a>
## Configuración

<a name="token-lifetimes"></a>
### Duración De Tokens

De forma predeterminada, Passport emite tokens de acceso de larga duración que caducan después de un año. Si prefieres configurar una duración de token más larga o más corta, puedes usar los métodos `tokensExpireIn` y `refreshTokensExpireIn`. Estos métodos deberían ser ejecutados desde el método `boot` de tu `AuthServiceProvider`:

```php
/**
* Register any authentication / authorization services.
*
* @return void
*/
public function boot()
{
    $this->registerPolicies();

    Passport::routes();

    Passport::tokensExpireIn(now()->addDays(15));

    Passport::refreshTokensExpireIn(now()->addDays(30));
}
```

<a name="overriding-default-models"></a>
### Sobrescribiendo Modelos Predeterminados

Eres en libre de extender los modelos usados internamente por Passport. A continuación, puedes indicarle a Passport que utilice tus modelos personalizados a través de la clase `Passport`:

```php
use App\Models\Passport\Client;
use App\Models\Passport\Token;
use App\Models\Passport\AuthCode;
use App\Models\Passport\PersonalAccessClient;

/**
* Register any authentication / authorization services.
*
* @return void
*/
public function boot()
{
    $this->registerPolicies();

    Passport::routes();

    Passport::useTokenModel(Token::class);
    Passport::useClientModel(Client::class);
    Passport::useAuthCodeModel(AuthCode::class);
    Passport::usePersonalAccessClientModel(PersonalAccessClient::class);
}
```

<a name="issuing-access-tokens"></a>
## Emitiendo Tokens de Acceso

Usar OAuth2 con códigos de autorización es la forma en que la mayoría de los desarrolladores están familiarizados con OAuth2. Al usar códigos de autorización, una aplicación cliente redireccionará un usuario a tu servidor donde aprobará o denegará la solicitud para emitir un token de acceso al cliente.

<a name="managing-clients"></a>
### Administrando Clientes

En primer lugar, los desarrolladores que crean aplicaciones que necesitan interactuar con la API de tu aplicación necesitarán registrar su aplicación con la tuya creando un "cliente". Normalmente, esto consiste en proporcionar el nombre de su aplicación y una dirección URL a la que tu aplicación puede redirigir después de que los usuarios aprueben su solicitud de autorización.

#### El comando `passport:client`

La forma más simple de crear un cliente es usando el comando Artisan `passport:client`. Este comando puede ser usado para crear tus propios clientes para probar tu funcionalidad OAuth2. Cuando ejecutes el comando `client`, Passport te pedirá más información sobre tu cliente y te proporcionará un ID y clave secreta de cliente:

```php
php artisan passport:client
```

**Redirigir URLs**

Si deseas incluir en la lista blanca varias direcciones URL de redireccionamiento para tu cliente, puedse especificarlas mediante una lista delimitadas por comas cuando se le solicite la dirección URL mediante el comando `passport:client`:

```php
http://example.com/callback,http://examplefoo.com/callback
```

::: danger Nota
Cualquier URL que contenga comas debe estar codificada.
:::

#### API JSON

Debido a que tus usuarios no podrán utilizar el comando `client`, Passport proporciona una API JSON que puedes usar para crear clientes. Esto te ahorra la molestia de tener que codificar manualmente los controladores para crear, actualizar y eliminar clientes.

Sin embargo, necesitarás acoplar la API JSON de Passport con tu propio frontend para proporcionar un dashboard para que tus usuarios administren sus clientes. A continuación, revisaremos todos los endpoints de API para administrar clientes. Por conveniencia, usaremos [Axios](https://github.com/mzabriskie/axios) para demostrar la realización de solicitudes HTTP a los endpoints.

La API JSON está protegida por los middleware `web` y `auth`; por lo tanto, sólo puede ser llamada desde tu propia aplicación. No se puede llamar desde una fuente externa.

::: tip
Si no quieres implementar tu mismo el frontend completo para administra
:::