# Autenticación de API (Passport)

- [Introducción](#introduction)
- [Instalación](#installation)
    - [Inicio Rápido para el Frontend](#frontend-quickstart)
    - [Usando Passport](#deploying-passport)
- [Configuración](#configuration)
    - [Vida Útil de Tokens](#token-lifetimes)
    - [Anulando Modelos Predeterminados](#overriding-default-models)
- [Suministrando Tokens de Acceso](#issuing-access-tokens)
    - [Administrando Clientes](#managing-clients)
    - [Solicitando Tokens](#requesting-tokens)
    - [Refrescando Tokens](#refreshing-tokens)
- [Tokens de Permiso de Contraseña](#password-grant-tokens)
    - [Creando un Cliente con Permiso de Contraseña](#creating-a-password-grant-client)
    - [Solicitando Tokens](#requesting-password-grant-tokens)
    - [Solicitando Todos los Alcances](#requesting-all-scopes)
- [Tokens de Permiso Implícito](#implicit-grant-tokens)
- [Tokens de Permiso de Credenciales de Cliente](#client-credentials-grant-tokens)
- [Tokens de Acceso Personal](#personal-access-tokens)
    - [Creando un Cliente de Acceso Personal](#creating-a-personal-access-client)
    - [Administrando Tokens de Acceso Personal](#managing-personal-access-tokens)
- [Protegiendo Rutas](#protecting-routes)
    - [Por Medio de Middleware](#via-middleware)
    - [Pasando el Token de Acceso](#passing-the-access-token)
- [Alcances de Token](#token-scopes)
    - [Definiendo Alcances](#defining-scopes)
    - [Asignando Alcances a los Tokens](#assigning-scopes-to-tokens)
    - [Verificando Alcances](#checking-scopes)
- [Consumiendo tu API con JavaScript](#consuming-your-api-with-javascript)
- [Eventos](#events)
- [Prueba](#testing)

<a name="introduction"></a>
## Introducción

Laravel ya hace fácil ejecutar la autenticación por medio de los tradicionales formularios de inicio de sesión, pero ¿que información tenemos sobre APIs? Las APIs típicamente usan tokens para autenticar a los usuarios y no mantienen el estado de sesión entre solicitudes. Laravel hace de la autenticación de API algo muy simple usando Passport de Laravel, el cual proporciona una implementación de servidor OAuth2 completa para tu aplicación Laravel en sólo minutos. Passport está construido como uno de los principales paquetes del [servidor OAuth2 de la colección de Paquetes PHP](https://github.com/thephpleague/oauth2-server) que son mantenidos por Alex Bilbie.

> {note} Esta documentación asume que estás familiarizado con OAuth2. Si no sabes nada sobre OAuth2, considera familiarizarte con la terminología general y las características de Outh2 antes de continuar.

<a name="installation"></a>
## Instalación

Para empezar, instala Passport por medio del administrador de paquetes Composer:

    composer require laravel/passport

El proveedor de servicio de Passport registra su propio directorio de migración de base de datos con el framework, así que deberías migrar tu base de datos después de registrar el proveedor. Las migraciones de Passport crearán las tablas que tu aplicación necesita para almacenar clientes y tokens de acceso:

    php artisan migrate

> {note} Si vas a usar las migraciones predeterminadas de Passport, deberías ejecutar el método `Passport::ignoreMigrations` en el método `register` de tu `AppServiceProvider`. Puedes exportar las migraciones predeterminadas usando `php artisan vendor:publish --tag=passport-migrations`.

Lo próximo, deberías ejecutar el comando `passport:install`. Este comando creará las claves de encriptación necesarias para generar tokens de acceso seguro. Además, el comando creará clientes de "acceso personal" y "permiso de contraseña" los cuales serán usados para generar tokens de acceso:

    php artisan passport:install

Después de ejecutar este comando, agrega la característica `Laravel\Passport\HasApiTokens` a tu modelo `App\User`. Esta característica proporcionará unos cuantos métodos para tu modelo los cuales permitirán que inspecciones el token y los alcances del usuario autenticado:

    <?php

    namespace App;

    use Laravel\Passport\HasApiTokens;
    use Illuminate\Notifications\Notifiable;
    use Illuminate\Foundation\Auth\User as Authenticatable;

    class User extends Authenticatable
    {
        use HasApiTokens, Notifiable;
    }

Lo próximo, deberías ejecutar el método `Passport::routes` dentro del método `boot` de tu `AuthServiceProvider`. Este método registrará las rutas necesarias para suministrar tokens y revocar tokens de acceso, clientes y tokens de acceso personal:

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

Finalmente, en tu archivo de configuración `config/auth.php`, deberías establecer la opción `driver` del guardia de autenticación de `api` a `passport`. Esto instruirá tu aplicación para usar el `TokenGuard` de Passport al momento de autenticar las solicitudes de API entrantes:

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

<a name="frontend-quickstart"></a>
### Frontend de Inicio Rápido

> {note} Con el propósito de usar los componentes de Vue, debes estar usando el framework de JavaScript [Vue](https://vuejs.org). Estos componentes también usarán el framework de CSS Bootstrap. Sin embargo, incluso si no estás usando estas herramientas, los componentes sirven como una referencia valorable para tu propia implementación de frontend.

Passport viene con una API JSON que puedes usar para permitir que tus usuarios creen tokens de acceso de clientes y personal. Sin embargo, puede ser que consuma tiempo codificar un frontend para interactuar con estas APIs. Así que, Passport también incluye componentes de [Vue](https://vuejs.org) pre-construidos que puedes usar como implementación de ejemplo o punto de inicio para tu propia implementación.

Para publicar los componentes de Vue de Passport, usa el comando Artisan `vendor:publish`:

    php artisan vendor:publish --tag=passport-components

Los componentes publicados serán colocados en tu directorio `resources/assets/js/components`. Una vez que los componentes han sido publicados, deberías registrarlos en tu archivo `resources/assets/js/app.js`:

    Vue.component(
        'passport-clients',
        require('./components/passport/Clients.vue')
    );

    Vue.component(
        'passport-authorized-clients',
        require('./components/passport/AuthorizedClients.vue')
    );

    Vue.component(
        'passport-personal-access-tokens',
        require('./components/passport/PersonalAccessTokens.vue')
    );

Después de registrar los componentes, asegurate de ejecutar `npm run dev` para recompilar tu código CSS/JS. Una vez que has recompilado tus código CSS/JS, puedes colocar los componentes dentro de una de tus plantillas de tu aplicación para empezar a crear tokens de acceso clientes y personal:

    <passport-clients></passport-clients>
    <passport-authorized-clients></passport-authorized-clients>
    <passport-personal-access-tokens></passport-personal-access-tokens>

<a name="deploying-passport"></a>
### Usando Passport

Al momento de usar Passport en tus servidores de producción por primera vez, igualmente necesitarás ejecutar el comando `passport:keys`. Este comando genera las claves de encriptación que Passport necesita con el propósito de generar el token de acceso. Las claves generadas típicamente no son mantenidas en control de código:

    php artisan passport:keys

De ser necesario, se puede definir la ruta desde donde las llaves de Passport deben ser cargadas. Para lograr esto puedes usar el método `Passport::loadKeysFrom`:

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

<a name="configuration"></a>
## Configuración

<a name="token-lifetimes"></a>
### Vidas de Token

De forma predeterminada, Passport suministra tokens de acceso de vida-corta que nunca necesitarán ser refrescados. Si prefieres configurar una vida de token más corta, puedes usar los métodos `tokensExpireIn` y `refreshTokensExpireIn`. Estos métodos deberían ser ejecutados desde el método `boot` de tu `AuthServiceProvider`:

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

<a name="overriding-default-models"></a>
### ANulando Modelos Predeterminados

EStás en libertad de extender los modelos usados internamente por Passport. Luego, se le puede instruir a Passport a usar tus modelos personalizados mediante la clase `Passport`:

    use App\Models\Passport\Client;
    use App\Models\Passport\AuthCode;
    use App\Models\Passport\TokenModel;
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

        Passport::useClientModel(Client::class);
        Passport::useTokenModel(TokenModel::class);
        Passport::useAuthCodeModel(AuthCode::class);
        Passport::usePersonalAccessClientModel(PersonalAccessClient::class);
    }

<a name="issuing-access-tokens"></a>
## Suministrando Tokens de Acceso

Usar OAuth2 con códigos de autorización es como que los principales desarrolladores estén familiarizados con OAuth2. Al momento de usar códigos de autorización, una aplicación cliente redireccionará un usuario a tu servidor donde o aprueban o rechazan la solicitud para suministrar un token de acceso al cliente.

<a name="managing-clients"></a>
### Administrando Clientes

Primero, los desarrolladores que construyen aplicaciones que necesitan interactuar con la API de tu aplicación necesitarán registrar su aplicación con la tuya al crear un "cliente". Típicamente, esto consiste en proporcionar el nombre de su aplicación y una URL que tu aplicación pueda redireccionar después que los usuarios aprueben su solicitud para autorización.

#### El comando `passport:client`

La forma más simple de crear un cliente es usando el comando Artisan `passport:client`. Este comando puede ser usado para crear tus propios clientes para probar tu funcionalidad OAuth2. Cuando tu ejecutes el comando `client`, Passport te pedirá más información sobre tu cliente y te proporcionará un ID y clave secreta de cliente:

    php artisan passport:client

#### API JSON

Debido a que los usuarios no serán capaces de utilizar el comando `client`, Passport proporciona una API JSON que puedes usar para crear clientes. Esto te salva el problema de tener que codificar controladores manualmente para crear, actualizar, y eliminar clientes.

Sin embargo, necesitarás acoplar la API JSON de Passport con tu propio frontend para proporcionar un dashboard para que tus usuarios administren sus clientes. Debajo, revisaremos todos los endpoints de API para administrar clientes. Por conveniencia, usaremos [Axios](https://github.com/mzabriskie/axios) para demostrar la construcción de solicitudes HTTP para los endpoints.

> {tip} Si no quieres implementar tu mismo el frontend completo para administración de cliente, puedes usar el [frontend de inicio rápido](#frontend-quickstart) para tener un frontend completamente funcional en unos pocos minutos.

#### `GET /oauth/clients`

Esta ruta devuelve todos los clientes para el usuario autenticaddo. Esto es útil principalmente para listar todos los clientes de usuarios de modo que puedan editar o borrarlos:

    axios.get('/oauth/clients')
        .then(response => {
            console.log(response.data);
        });

#### `POST /oauth/clients`

Esta ruta es usada para crear nuevos clientes. Requiere dos porciones de datos: el `name` del cliente y una URL para `redirect`. La URL de `redirect` es a donde el usuario será redireccionado después de aprobar o denegar una solicitud para autorización.

Cuando un cliente es creado, le será suministrado un ID de cliente y una clave secreta de cliente. Estos valores serán usados al momento de solicitar tokens de acceso desde tu aplicación. La ruta de creación del cliente devolverá la nueva instancia de cliente:
    const data = {
        name: 'Client Name',
        redirect: 'http://example.com/callback'
    };

    axios.post('/oauth/clients', data)
        .then(response => {
            console.log(response.data);
        })
        .catch (response => {
            // List errors on response...
        });

#### `PUT /oauth/clients/{client-id}`

Esta ruta es usada para actualizar clientes. Requiere dos porciones de datos: el `name` del cliente y una URL para `redirect`. La URL para `redirect` es a donde el usuario será redireccionado después de aprobar o denegar una solicitud de autorización. La ruta devolverá la instancia de cliente actualizada.

    const data = {
        name: 'New Client Name',
        redirect: 'http://example.com/callback'
    };

    axios.put('/oauth/clients/' + clientId, data)
        .then(response => {
            console.log(response.data);
        })
        .catch (response => {
            // List errors on response...
        });

#### `DELETE /oauth/clients/{client-id}`

Esta ruta es usada para eliminar clientes:

    axios.delete('/oauth/clients/' + clientId)
        .then(response => {
            //
        });

<a name="requesting-tokens"></a>
### Solicitando Tokens

#### Redireccionando por Autorización

Una vez que un cliente ha sido creado, los desarrolladores pueden usar el ID del cliente y la clave secreta para solicitar un código de autorización y token de acceso desde tu aplicación. Primero, la aplicación consumidora debería hacer una solicitud de redireccionamiento a la ruta `/oauth/authorize` de tu aplicación como sigue:

    Route::get('/redirect', function () {
        $query = http_build_query([
            'client_id' => 'client-id',
            'redirect_uri' => 'http://example.com/callback',
            'response_type' => 'code',
            'scope' => '',
        ]);

        return redirect('http://your-app.com/oauth/authorize?'.$query);
    });

> {tip} Recuerda, la ruta `/oauth/authorize` ya está definida por el método `Passport::routes`. No necesitas definir manualmente esta ruta.

#### Aprobando la Solicitud

Al momento de recibir la solicitud de autorización, Passport automáticamente mostrará una plantilla al usuario permitiendo a ellos aprobar o denegar la solicitud de autorización. Si aprueban la solicitud, serán redireccionados de regreso a la URL `redirect_uri` que fue especificada cuando el cliente fue creado.

Si prefieres personalizar la pantalla de aprobación de autorización, puedes publicar la vista de Passport usando el comando Artisan `vendor:publish`. Las vistas publicadas serán colocadas en `resources/views/vendor/passport`:

    php artisan vendor:publish --tag=passport-views

#### Convirtiendo Códigos de Autorización en Tokens de Acceso

Si el usuario aprueba la solicitud de autorización, serán redireccionados de regreso a la aplicación consumidora. El consumidor debería entonces suministrar una solicitud `POST` a tu aplicación para solicitar un token de acceso. La solicitud debería incluir el código de autorización que fue suministrado por tu aplicación cuando el usuario aprobó la solicitud de autorización. En este ejemplo, usaremos la librería HTTP Guzzle para hacer la solicitud `POST`:

    Route::get('/callback', function (Request $request) {
        $http = new GuzzleHttp\Client;

        $response = $http->post('http://your-app.com/oauth/token', [
            'form_params' => [
                'grant_type' => 'authorization_code',
                'client_id' => 'client-id',
                'client_secret' => 'client-secret',
                'redirect_uri' => 'http://example.com/callback',
                'code' => $request->code,
            ],
        ]);

        return json_decode((string) $response->getBody(), true);
    });

Esta ruta `/oauth/token` devolverá una respuesta JSON conteniendo los atributos `access_token`, `refresh_token` y `expires_in`. El atributo `expires_in` contiene el número de segundos hasta que el token de acceso expire.

> {tip} Igual que la ruta `/oauth/authorize`, la ruta `/oauth/token` es definida para ti por el método `Passport::routes`. No hay necesidad de definir manualmente esta ruta.

<a name="refreshing-tokens"></a>
### Refrescando Tokens

Si tu aplicación suministra tokens de acceso de vida corta, los usuarios necesitarán refrescar sus tokens de acceso por medio del token para refrescar que les fué proporcionado cuando el token de acceso fue suministrado. En este ejemplo, usaremos la librería de HTTP Guzzle para refrescar el token:

    $http = new GuzzleHttp\Client;

    $response = $http->post('http://your-app.com/oauth/token', [
        'form_params' => [
            'grant_type' => 'refresh_token',
            'refresh_token' => 'the-refresh-token',
            'client_id' => 'client-id',
            'client_secret' => 'client-secret',
            'scope' => '',
        ],
    ]);

    return json_decode((string) $response->getBody(), true);

Esta ruta `/oauth/token` devolverá una respuesta JSON conteniendo los atributos `access_token`, `refresh_token` y `expires_in`. El atributo `expires_in` contiene el número de segundos hasta que el token de acceso expire.

<a name="password-grant-tokens"></a>
## Tokens de Permiso de Contraseña

El permiso de contraseña de OAuth2 permite que tus clientes de otros socios, tales como una aplicación móvil, obtengan un token de acceso usando una cuenta de correo / nombre de usuario y una contraseña. Esto permite que suministres tokens de acceso seguramente a tus clientes de socios sin requerir que tus usuarios vayan a traves del flujo completo de redirección de código de autorización de OAuth2.

<a name="creating-a-password-grant-client"></a>
### Creando un cliente con Permiso de Contraseña

Antes de que tu aplicación pueda suministrar tokens por medio del permiso de contraseña, necesitarás crear un cliente con permiso de contraseña. Puedes hacer esto usando el comando `passport:client` con la opción `--password`. Si ya has ejecutado el comando `passport:install`, no necesitarás ejecutar este comando:

    php artisan passport:client --password

<a name="requesting-password-grant-tokens"></a>
### Solicitando Tokens

Una vez que has creado un cliente con permiso de contraseña, puedes solicitar un token de acceso al usar una solicitud `POST` de la ruta `/oauth/token` con una dirección de correo de usuario y contraseña. Recuerda, esta ruta ya está registrada por el método `Passport::routes` así que no hay necesidad de definirla manualmente. Si la solicitud es exitosa, recibirás un `access_token` y `refresh_token` en la respuesta JSON del servidor:

    $http = new GuzzleHttp\Client;

    $response = $http->post('http://your-app.com/oauth/token', [
        'form_params' => [
            'grant_type' => 'password',
            'client_id' => 'client-id',
            'client_secret' => 'client-secret',
            'username' => 'taylor@laravel.com',
            'password' => 'my-password',
            'scope' => '',
        ],
    ]);

    return json_decode((string) $response->getBody(), true);

> {tip} Recuerda, los tokens de acceso son de vida corta de forma predeterminada. Sin embargo, eres libre de [configurar la vida máxima del token de acceso](#configuration) si lo necesitas.

<a name="requesting-all-scopes"></a>
### Solicitando Todos los Alcances

Al momento de usar el permiso de contraseña, puedes querer autorizar el token para todos los alcances soportados por tu aplicación. Puedes hacer esto al solicitar el alcance `*`. Si solicitas el alcance `*`, el método `can` en la instancia de token siempre devolverá `true`. Este alcance solamente puede ser asignado a un token que es suministrado usando el permiso `password`:

    $response = $http->post('http://your-app.com/oauth/token', [
        'form_params' => [
            'grant_type' => 'password',
            'client_id' => 'client-id',
            'client_secret' => 'client-secret',
            'username' => 'taylor@laravel.com',
            'password' => 'my-password',
            'scope' => '*',
        ],
    ]);

<a name="implicit-grant-tokens"></a>
## Tokens de Permiso Implícito

El permiso implícito es similar al permiso de código de autorización; sin embargo, el token es devuelto al cliente sin intercambiar un código de autorización. Este permiso es usado comúnmente para JavaScript o aplicaciones móviles donde las credenciales del cliente no pueden ser almacenadas seguramente. Para habilitar el permiso, ejecuta el método `enableImplicitGrant` en tu `AuthServiceProvider`:

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        Passport::routes();

        Passport::enableImplicitGrant();
    }

Una vez que un permiso ha sido habilitado, los desarrolladores pueden usar su ID de cliente para solicitar un token de acceso de tu aplicación. La aplicación consumidora debería hacer una solicitud de redirección a la ruta `/oauth/authorize` de tu aplicación tal como sigue:

    Route::get('/redirect', function () {
        $query = http_build_query([
            'client_id' => 'client-id',
            'redirect_uri' => 'http://example.com/callback',
            'response_type' => 'token',
            'scope' => '',
        ]);

        return redirect('http://your-app.com/oauth/authorize?'.$query);
    });

> {tip} Recuerda, la ruta `/oauth/authorize` ya está definida por el método `Passport::routes`. No necesitas definir manualmente esta ruta.

<a name="client-credentials-grant-tokens"></a>
## Client Credentials Grant Tokens

El permiso de credenciales de cliente es aceptable para autenticación maquina a maquina. Por ejemplo, podrías usar este permiso en un trabajo planificado el cual esté ejecutando tareas de mantenimiento en una aplicación.

Antes que tu aplicación pueda emitir tokens mediante permiso de credenciales de cliente, necesitarás crear un cliente de permisos de credenciales. Puedes hacer esto usando la opción `--client` del comando `passport:client`:

    php artisan passport:client --client

Luego, para usar este tipo de permiso, necesitas agregar el middleware  `CheckClientCredentials` a la propiedad `$routeMiddleware` de tu archivo `app/Http/Kernel.php`:

    use Laravel\Passport\Http\Middleware\CheckClientCredentials;

    protected $routeMiddleware = [
        'client' => CheckClientCredentials::class,
    ];

Después adjuntar este middleware a una ruta:

    Route::get('/orders', function (Request $request) {
        ...
    })->middleware('client');

Para restringir acceso a la ruta sólo a alcances específicos se puede proveer una lista delimitada por comas de los alcances requeridos cuando se anexe el middleware `client` a la ruta:

    Route::get('/orders', function (Request $request) {
        ...
    })->middleware('client:check-status,your-scope');

### Obteniendo Tokens

Para obtener un token, haz una solicitud al endpoint `oauth/token`:

    $guzzle = new GuzzleHttp\Client;

    $response = $guzzle->post('http://your-app.com/oauth/token', [
        'form_params' => [
            'grant_type' => 'client_credentials',
            'client_id' => 'client-id',
            'client_secret' => 'client-secret',
            'scope' => 'your-scope',
        ],
    ]);

    return json_decode((string) $response->getBody(), true)['access_token'];

<a name="personal-access-tokens"></a>
## Tokens de Acceso Personal

Algunas veces, tus usuarios pueden querer suministrar tokens de acceso a ellos mismos sin ir a través del típico flujo de redirección de código de autorización. El Permitir a los usuarios suministrar tokens a ellos mismos por medio de la UI de tu aplicación puede ser útil para permitir que los usuarios experimenten con tu API o pueda servir como un enfoque básico para suministrar tokens de acceso en general.

> {note} Los tokens de acceso personal siempre son de vida larga. Su vida no es modificada al momento de usar los métodos `tokensExpireIn` o `refreshTokensExpireIn`.

<a name="creating-a-personal-access-client"></a>
### Creando un Cliente de Acceso Personal

Antes de que tu aplicación pueda suministrar tokens de acceso personal, necesitarás crear un cliente de acceso personal. Puedes hacer esto usando el comando `passport:client` con la opción `--personal`. Si ya has ejecutado el comando `passport:install`, no necesitarás ejecutar este comando:

    php artisan passport:client --personal

Si ya se ha definido un cliente de acceso personal, se puede instruir a Passport para que lo use utilizando el método `personalAccessClientId`. Típicamente, este método debe ser llamado desde el método `boot` de tu `AuthServiceProvider`:

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        Passport::routes();

        Passport::personalAccessClientId('client-id');
    }

<a name="managing-personal-access-tokens"></a>
### Administrando Tokens de Accceso Personal

Una vez que has creado un cliente de acceso personal, puedes suministrar tokens para un usuario dado usando el método `createToken` en la instancia de modelo `User`. El método `createToken` acepta el nombre del token como su primer argumento y un arreglo opcional de [alcances](#token-scopes) como su segundo argumento:

    $user = App\User::find(1);

    // Creating a token without scopes...
    $token = $user->createToken('Token Name')->accessToken;

    // Creating a token with scopes...
    $token = $user->createToken('My Token', ['place-orders'])->accessToken;

#### API JSON

Passport también incluye una API JSON para administrar tokens de acceso personal. Puedes acoplar esto con tu propio frontend para ofrecer un dashboard a tus usuarios para administrar tokens de acceso personal. Debajo, revisaremos todos los endpoints de API para manejar tokens de acceso personal. Por conveniencia, usaremos [Axios](https://github.com/mzabriskie/axios) para demostrar haciendo solicitudes HTTP a los endpoints.

La API JSON es resguardada por los middlewares `web` y `auth` middlewares; por lo tanto, sólo puede ser llamada desde tu propia aplicación. No se puede llamar desde una fuente externa.

> {tip} Si no quieres implementar tu mismo el frontend de token de acceso personal, puedes usar el [frontend de inicio rápido](#frontend-quickstart) para tener un frontend completamente funcional en solo minutos.

#### `GET /oauth/scopes`

Esta ruta devolverá todos los [alcances](#token-scopes) definidos para tu aplicación. Puedes usar esta ruta para listar los alcances que un usuario puede asignar a un token de acceso personal:

    axios.get('/oauth/scopes')
        .then(response => {
            console.log(response.data);
        });

#### `GET /oauth/personal-access-tokens`

Esta ruta devolverá todos los tokens de acceso personal que el usuario autenticado ha creado. Esto es útil principalmente para listar todos los tokens de usuario de modo que puedan editar o borrarlos:

    axios.get('/oauth/personal-access-tokens')
        .then(response => {
            console.log(response.data);
        });

#### `POST /oauth/personal-access-tokens`

Esta ruta crea nuevos token de acceso personal. Requiere dos porciones de datos: el `name` y los `scopes` del token que deberían estar asignados al token:

    const data = {
        name: 'Token Name',
        scopes: []
    };

    axios.post('/oauth/personal-access-tokens', data)
        .then(response => {
            console.log(response.data.accessToken);
        })
        .catch (response => {
            // List errors on response...
        });

#### `DELETE /oauth/personal-access-tokens/{token-id}`

Esta ruta puede ser usada para borrar tokens de acceso personal:

    axios.delete('/oauth/personal-access-tokens/' + tokenId);

<a name="protecting-routes"></a>
## Protegiendo Rutas

<a name="via-middleware"></a>
### Por medio de Middleware

Passport incluye un [guard de autenticación](/docs/{{version}}/authentication#adding-custom-guards) que validará tokens de acceso en solicitudes entrantes. Una vez que has configurado el guard de `api` para usar el manejador de `passport`, solamente necesitarás especificar el middleware `auth:api` en cualquiera de las rutas que requieran un token de acceso válido:

    Route::get('/user', function () {
        //
    })->middleware('auth:api');

<a name="passing-the-access-token"></a>
### Pasando el Token de Acceso

Al momento de ejecutar rutas que están protegidas por Passport, los consumidores de la API de tu aplicación deberían especificar su token de acceso como un token `Bearer` en el encabezado de `Authorization` de su solicitud. Por ejemplo, al momento de usar la librería HTTP de Guzzle:

    $response = $client->request('GET', '/api/user', [
        'headers' => [
            'Accept' => 'application/json',
            'Authorization' => 'Bearer '.$accessToken,
        ],
    ]);

<a name="token-scopes"></a>
## Alcances de Token

Los alcances permiten que tus clientes de API soliciten un conjunto de permisos específicos al momento de solicitar autorización para acceder a una cuenta. Por ejemplo, si estas construyendo una aplicación de comercio electrónico, no todos los consumidores de API necesitarán la calificación para colocar órdenes. En lugar de eso, puedes permitir que los consumidores soliciten solamente autorización para acceder a los estados de envío de órdenes. En otras palabras, los alcances permiten que los usuarios de tu aplicación limiten las acciones que una aplicacion de terceros puede ejecutar en su representación.

<a name="defining-scopes"></a>
### Definiendo Alcances

Puedes definir los alcances de tu API usando el método `Passport::tokensCan` en el método `boot` de tu `AuthServiceProvider`. El método `tokensCan` acepCustomizing The Cookie Nameta un arreglo de nombres de alcance y descripciones de alcance. La descripción de alcance puede ser cualquier cosa que deseas y será mostrada para los usuarios en la pantalla de aprobación de autorización:

    use Laravel\Passport\Passport;

    Passport::tokensCan([
        'place-orders' => 'Place orders',
        'check-status' => 'Check order status',
    ]);

<a name="assigning-scopes-to-tokens"></a>
### Asignando Alcances a Tokens

#### Al Solicitar Códigos de Autorización

Al momento de solicitar un token de acceso usando un permiso de código de autorización, los consumidores deberían especificar sus alcances deseados como el parámetro de cadena de consulta `scope`. El parámetro `scope` debería ser una lista delimitada por espacios de alcances:

    Route::get('/redirect', function () {
        $query = http_build_query([
            'client_id' => 'client-id',
            'redirect_uri' => 'http://example.com/callback',
            'response_type' => 'code',
            'scope' => 'place-orders check-status',
        ]);

        return redirect('http://your-app.com/oauth/authorize?'.$query);
    });

#### Al Suministrar Tokens de Acceso Personal

Si estás suministrando tokens de acceso personal usando el método `createToken` del modelo `User`, puedes pasar el arreglo de alcances deseado como segundo argumento del método:

    $token = $user->createToken('My Token', ['place-orders'])->accessToken;

<a name="checking-scopes"></a>
### Verificando Alcances

Passport incluye dos middleware que pueden ser usados para verificar que una solicitud entrante esté autenticada con un token al que ha sido otorgado un alcance dado. Para empezar, agrega el siguiente middleware a la propiedad `$routeMiddleware` de tu archivo `app/Http/Kernel.php`

    'scopes' => \Laravel\Passport\Http\Middleware\CheckScopes::class,
    'scope' => \Laravel\Passport\Http\Middleware\CheckForAnyScope::class,

#### Verificar Todos los Alcances

El middleware `scopes` puede ser asignado a una ruta para verificar que el token de acceso de la solicitud entrante tiene *todos* los alcances listados:

    Route::get('/orders', function () {
        // Access token has both "check-status" and "place-orders" scopes...
    })->middleware('scopes:check-status,place-orders');

#### Verificar Algunos Alcances

El middleware `scope` puede ser asignado a una ruta para verificar que el token de acceso de la solicitud entrante tiene *al menos uno* de los alcances listados:

    Route::get('/orders', function () {
        // Access token has either "check-status" or "place-orders" scope...
    })->middleware('scope:check-status,place-orders');

#### Verificando Alcances en una Instancia de Token

Una vez que una solicitud autenticada de token de acceso ha introducido tu aplicación, aún puedes verificar si el token tiene un alcance dado usando el método `tokenCan` en la instancia de `User` autenticada:

    use Illuminate\Http\Request;

    Route::get('/orders', function (Request $request) {
        if ($request->user()->tokenCan('place-orders')) {
            //
        }
    });

#### Additional Scope Methods

EL método `scopeIds` devolverá un arreglo con todos los IDs / nombres definidos:

    Laravel\Passport\Passport::scopeIds();

EL método `scopes` devolverá un arreglo con todos los alcances definidos como instancias de `Laravel\Passport\Scope`:

    Laravel\Passport\Passport::scopes();

El método `scopesFor` devolverá un arreglo con las instancias `Laravel\Passport\Scope` que coincidan con los IDs / nombres proporcionados:

    Laravel\Passport\Passport::scopesFor(['place-orders', 'check-status']);

Puedes determinar si un alcance dado ha sido definido usando el método `hasScope`:

    Laravel\Passport\Passport::hasScope('place-orders');

<a name="consuming-your-api-with-javascript"></a>
## Consumiendo Tu API con JavaScript

Al momento de construir una API, puede ser extremadamente útil ser capaz de consumir tu propia API desde tu aplicación JavaScript. Esta aproximación a desarrollo de API permite que tu propia aplicación consuma la misma API que estás compartiendo con el mundo. La misma API puede ser consumida por tus aplicaciones Web, aplicaciones móviles, aplicaciones de terceros y algunos de los SDKs que puedes publicar en varios administradores de paquetes.

Típicamente, si quieres consumir tu API desde tu aplicación JavaScript, necesitarías enviar manualmente un token de acceso para la aplicación y pasarlo con cada solicitud para tu aplicación. Sin embargo, Passport incluye un middleware que puede manejar esto por ti. Todo lo que necesitas hacer es agregar el middleware `CreateFreshApiToken` a tu grupo middleware `web` en tu archivo `app/Http/Kernel.php`:

    'web' => [
        // Other middleware...
        \Laravel\Passport\Http\Middleware\CreateFreshApiToken::class,
    ],

> {note} You should ensure that the `EncryptCookies` middleware is listed prior to the `CreateFreshApiToken` middleware in your middleware stack.

Este middleware de Passport adjuntará un cookie `laravel_token` en tus respuestas salientes. Este cookie contiene un JWT encriptado que Passport usará para autenticar solicitudes API desde tu aplicación JavaScript. Ahora, puedes construir solicitudes para la API de tu aplicación sin pasar explícitamente un token de acceso:

    axios.get('/api/user')
        .then(response => {
            console.log(response.data);
        });

#### Personalizando nombre de Cookie

De ser necesario, se puede personalizar el nombre de la cookie `laravel_token` usando el método `Passport::cookie` Típicamente, este método debe ser llamado desde el método `boot` de tu `AuthServiceProvider`:

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        Passport::routes();

        Passport::cookie('custom_name');
    }

#### Protección CSRF

Al usar este método de autenticación, el andamiaje JavaSript por defecto de Laravel instruye a Axios para enviar siempre los encabezados `X-CSRF-TOKEN` y `X-Requested-With`. SIn embargo, es necesario asegurarse de incluir tu token CSRF en un [HTML meta tag](/docs/{{version}}/csrf#csrf-x-csrf-token):

    // In your application layout...
    <meta name="csrf-token" content="{{ csrf_token() }}">

    // Laravel's JavaScript scaffolding...
    window.axios.defaults.headers.common = {
        'X-Requested-With': 'XMLHttpRequest',
    };

<a name="events"></a>
## Eventos

Passport produce eventos al momento de suministrar tokens y refrescar tokens. Puedes usar estos eventos para acortar o revocar otros tokens de acceso en tu base de datos. Puedes adjuntar listeners a estos eventos en el `EventServiceProvider` de tu aplicación:

```php
/**
 * The event listener mappings for the application.
 *
 * @var array
 */
protected $listen = [
    'Laravel\Passport\Events\AccessTokenCreated' => [
        'App\Listeners\RevokeOldTokens',
    ],

    'Laravel\Passport\Events\RefreshTokenCreated' => [
        'App\Listeners\PruneOldTokens',
    ],
];
```

<a name="testing"></a>
## Prueba

El método `actingAs` de Passport puede ser usado para especificar el usuario autenticado actualmente así como sus alcances. El primer argumento dado al método `actingAs` es la instancia de usuario y el segundo es un arreglo de alcances que deberían estar otorgados al token del usuario:

    use App\User;
    use Laravel\Passport\Passport;

    public function testServerCreation()
    {
        Passport::actingAs(
            factory(User::class)->create(),
            ['create-servers']
        );

        $response = $this->post('/api/create-server');

        $response->assertStatus(201);
    }
