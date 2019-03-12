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

> {note} Esta documentación asume que estás familiarizado con OAuth2. Si no sabes nada sobre OAuth2, considera familiarizarte con la [terminología general](https://oauth2.thephpleague.com/terminology/) y las características de Outh2 antes de continuar.

<a name="installation"></a>
## Instalación

Para empezar, instala Passport por medio del gestor de paquetes Composer:

    composer require laravel/passport

El proveedor de servicio de Passport registra su propio directorio de migración de base de datos con el framework, así que deberías migrar tu base de datos después de registrar el paquete. Las migraciones de Passport crearán las tablas que tu aplicación necesita para almacenar clientes y tokens de acceso:

    php artisan migrate

A continuación, debes ejecutar el comando `passport:install`. Este comando creará las claves de encriptación necesarias para generar tokens de acceso seguro. Además, el comando creará clientes de "acceso personal" y "permiso de contraseña" los cuales serán usados para generar tokens de acceso:

    php artisan passport:install

Después de ejecutar este comando, agrega el trait `Laravel\Passport\HasApiTokens` a tu modelo `App\User`. Este trait proporcionará algunos métodos helper para tu modelo los cuales permitirán que inspecciones el token y alcances del usuario autenticado:

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

Finalmente, en tu archivo de configuración `config/auth.php`, debes establecer la opción `driver` del guardia de autenticación de `api` a `passport`. Esto indicará a tu aplicación que utilice el `TokenGuard` de Passport al momento de autenticar las solicitudes de API entrantes:

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

### Personalización De La migración

Si no vas a utilizar las migraciones predeterminadas de Passport, debes llamar al método `Passport::ignoreMigrations` en el método `register` de tu `AppServiceProvider`. Puedes exportar las migraciones por defecto usando `php artisan vendor:publish --tag=passport-migrations`.

Por defecto, Passport usa una columna de enteros para almacenar el `user_id`. Si tu aplicación utiliza un tipo de columna diferente para identificar a los usuarios (por ejemplo: UUID), debes modificar las migraciones de Passport predeterminadas después de publicarlas.

<a name="frontend-quickstart"></a>
### Inicio Rápido De Frontend

> {note} Para usar los componentes de Vue, debes estar usando el framework de JavaScript [Vue](https://vuejs.org). Estos componentes también usarán el framework de CSS Bootstrap. Sin embargo, incluso si no estás usando estas herramientas, los componentes sirven como una referencia valiosa para tu propia implementación de frontend.

Passport viene con una API JSON que puedes usar para permitir que tus usuarios creen tokens de acceso de clientes y personal. Sin embargo, puede ser que consuma tiempo codificar un frontend para interactuar con estas APIs. Así que, Passport también incluye componentes de [Vue](https://vuejs.org) pre-construidos que puedes usar como implementación de ejemplo o punto de inicio para tu propia implementación.

Para publicar los componentes de Vue de Passport, usa el comando Artisan `vendor:publish`:

    php artisan vendor:publish --tag=passport-components

Los componentes publicados serán colocados en tu directorio `resources/js/components`. Una vez que los componentes han sido publicados, debes registrarlos en tu archivo `resources/js/app.js`:

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

> {note} Antes de Laravel v 5.7.19, anexar `.default` al registrar componentes da como resultado un error de consola. Una explicación para este cambio puedes encontrarla en las [notas de lanzamiento de Laravel Mix v 4.0.0](https://github.com/JeffreyWay/laravel-mix/releases/tag/v4.0.0).

Después de registrar los componentes, asegurate de ejecutar `npm run dev` para recompilar tu código CSS/JS. Una vez que has recompilado tus código CSS/JS, puedes colocar los componentes dentro de una de las plantillas de tu aplicación para empezar a crear tokens de acceso clientes y personal:

    <passport-clients></passport-clients>
    <passport-authorized-clients></passport-authorized-clients>
    <passport-personal-access-tokens></passport-personal-access-tokens>

<a name="deploying-passport"></a>
### Despliegue De Passport

Al momento de usar Passport en tus servidores de producción por primera vez, es probable que debas ejecutar el comando `passport:keys`. Este comando genera las claves de encriptación que Passport necesita con el propósito de generar el token de acceso. Las claves generadas normalmente no son guardadas en control de código fuente:

    php artisan passport:keys

De ser necesario, puedes definir la ruta en la que se deben cargar las claves de Passport. Para lograr esto puedes usar el método `Passport::loadKeysFrom`:

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
### Duración De Tokens

De forma predeterminada, Passport emite tokens de acceso de larga duración que caducan después de un año. Si prefieres configurar una duración de token más larga o más corta, puedes usar los métodos `tokensExpireIn` y `refreshTokensExpireIn`. Estos métodos deberían ser ejecutados desde el método `boot` de tu `AuthServiceProvider`:

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
### Sobrescribiendo Modelos Predeterminados

Eres en libre de extender los modelos usados internamente por Passport. A continuación, puedes indicarle a Passport que utilice tus modelos personalizados a través de la clase `Passport`:

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
## Emitiendo Tokens de Acceso

Usar OAuth2 con códigos de autorización es la forma en que la mayoría de los desarrolladores están familiarizados con OAuth2. Al usar códigos de autorización, una aplicación cliente redireccionará un usuario a tu servidor donde aprobará o denegará la solicitud para emitir un token de acceso al cliente.

<a name="managing-clients"></a>
### Administrando Clientes

En primer lugar, los desarrolladores que crean aplicaciones que necesitan interactuar con la API de tu aplicación necesitarán registrar su aplicación con la tuya creando un "cliente". Normalmente, esto consiste en proporcionar el nombre de su aplicación y una dirección URL a la que tu aplicación puede redirigir después de que los usuarios aprueben su solicitud de autorización.

#### El comando `passport:client`

La forma más simple de crear un cliente es usando el comando Artisan `passport:client`. Este comando puede ser usado para crear tus propios clientes para probar tu funcionalidad OAuth2. Cuando ejecutes el comando `client`, Passport te pedirá más información sobre tu cliente y te proporcionará un ID y clave secreta de cliente:

    php artisan passport:client

**Redirigir URLs**

Si deseas incluir en la lista blanca varias direcciones URL de redireccionamiento para tu cliente, puedse especificarlas mediante una lista delimitadas por comas cuando se le solicite la dirección URL mediante el comando `passport:client`:

    http://example.com/callback,http://examplefoo.com/callback

> {note} Cualquier URL que contenga comas debe estar codificada.

#### API JSON

Debido a que tus usuarios no podrán utilizar el comando `client`, Passport proporciona una API JSON que puedes usar para crear clientes. Esto te ahorra la molestia de tener que codificar manualmente los controladores para crear, actualizar y eliminar clientes.

Sin embargo, necesitarás acoplar la API JSON de Passport con tu propio frontend para proporcionar un dashboard para que tus usuarios administren sus clientes. A continuación, revisaremos todos los endpoints de API para administrar clientes. Por conveniencia, usaremos [Axios](https://github.com/mzabriskie/axios) para demostrar la realización de solicitudes HTTP a los endpoints.

La API JSON está protegida por los middleware `web` y `auth`; por lo tanto, sólo puede ser llamada desde tu propia aplicación. No se puede llamar desde una fuente externa.

> {tip} Si no quieres implementar tu mismo el frontend completo para administración de clientes, puedes usar el [inicio rápido de frontend](#frontend-quickstart) para tener un frontend completamente funcional en unos pocos minutos.

#### `GET /oauth/clients`

Esta ruta devuelve todos los clientes para el usuario autenticado. Esto es útil principalmente para listar todos los clientes de usuarios de modo que puedas editar o borrarlos:

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

Al recibir la solicitud de autorización, Passport mostrará automáticamente una plantilla al usuario permitiéndole aprobar o denegar la solicitud de autorización. Si aprueba la solicitud, se redirigirá de nuevo a la `redirect_uri` que se especificó por la aplicación consumidora. El `redirect_uri` debe coincidir con la dirección URL de `redirect` que se especificó cuando se creó el cliente.

Si prefieres personalizar la pantalla de aprobación de autorización, puedes publicar las vistas de Passport usando el comando Artisan `vendor:publish`. Las vistas publicadas serán colocadas en `resources/views/vendor/passport`:

    php artisan vendor:publish --tag=passport-views

#### Convirtiendo Códigos De Autorización En Tokens De Acceso

Si el usuario aprueba la solicitud de autorización, serán redireccionados de regreso a la aplicación consumidora. El consumidor debería entonces suministrar una solicitud `POST` a tu aplicación para solicitar un token de acceso. La solicitud debe incluir el código de autorización que fue suministrado por tu aplicación cuando el usuario aprobó la solicitud de autorización. En este ejemplo, usaremos la librería HTTP Guzzle para hacer la solicitud `POST`:

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
### Actualización De Tokens

Si tu aplicación emite tokens de acceso de corta duración, los usuarios necesitarán actualizar sus tokens de acceso por medio del token de actualización que se les proporcionó cuando el token de acceso fue suministrado. En este ejemplo, usaremos la librería de HTTP Guzzle para actualizar el token:

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
## Tokens De Permiso De Contraseña

El permiso de contraseña de OAuth2 permite que tus clientes oficiales, tales como una aplicación móvil, obtengan un token de acceso usando una cuenta de correo / nombre de usuario y una contraseña. Esto te permite emitir tokens de acceso de forma segura a tus clientes oficiales sin requerir que tus usuarios vayan a traves del flujo completo de redirección de código de autorización de OAuth2.

<a name="creating-a-password-grant-client"></a>
### Creando Un Cliente Con Permiso De Contraseña

Antes de que tu aplicación pueda emitir tokens por medio del permiso de contraseña, necesitarás crear un cliente con permiso de contraseña. Puedes hacer esto usando el comando `passport:client` con la opción `--password`. Si ya has ejecutado el comando `passport:install`, no necesitarás ejecutar este comando:

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

> {tip} Recuerde, los tokens de acceso son de larga duración de forma predeterminada. Sin embargo, eres libre de [configurar la duración máxima del token de acceso](#configuration) si lo necesitas.

<a name="requesting-all-scopes"></a>
### Solicitando Todos Los Alcances

Al momento de usar el permiso de contraseña o permiso de credenciales de cliente, puedes querer autorizar el token para todos los alcances soportados por tu aplicación. Puedes hacerlo solicitando el alcance `*`. Si solicitas el alcance `*`, el método `can` en la instancia de token siempre devolverá `true`. Este alcance solamente puede ser asignado a un token que es emitido usando el permiso `password` or `client_credentials`:

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

<a name="customizing-the-username-field"></a>
### Personalizando el campo Username

Al autenticarse con el permiso de contraseña, Passport utilizará el atributo `email` de su modelo como  "nombre de usuario (username)". Sin embargo, puede personalizar este comportamiento definiendo un método `findForPassport` en el modelo:

    <?php

    namespace App;

    use Laravel\Passport\HasApiTokens;
    use Illuminate\Notifications\Notifiable;
    use Illuminate\Foundation\Auth\User as Authenticatable;

    class User extends Authenticatable
    {
        use HasApiTokens, Notifiable;

        /**
         * Find the user instance for the given username.
         *
         * @param  string  $username
         * @return \App\User
         */
        public function findForPassport($username)
        {
            return $this->where('username', $username)->first();
        }
    }

<a name="implicit-grant-tokens"></a>
## Tokens de Permiso Implícito

El permiso implícito es similar al permiso de código de autorización; sin embargo, el token es devuelto al cliente sin intercambiar un código de autorización. Este permiso es usado comúnmente para JavaScript o aplicaciones móviles donde las credenciales del cliente no pueden ser almacenadas de forma segura. Para habilitar el permiso, ejecuta el método `enableImplicitGrant` en tu `AuthServiceProvider`:

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

Una vez que un permiso ha sido habilitado, los desarrolladores pueden usar su ID de cliente para solicitar un token de acceso de tu aplicación. La aplicación consumidora deberá hacer una solicitud de redirección a la ruta `/oauth/authorize` de tu aplicación tal como sigue:

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
## Tokens De Permiso De Credenciales De Cliente

El permiso de credenciales de cliente es adecuada para la autenticación de máquina a máquina. Por ejemplo, puedes usar este permiso en un trabajo programado el cual está ejecutando tareas de mantenimiento de una API.

Antes que tu aplicación pueda emitir tokens mediante permiso de credenciales de cliente, necesitarás crear un cliente de permisos de credenciales. Puedes hacerlo usando la opción `--client` del comando `passport:client`:

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

Para obtener un token con este tipo de permiso, haz una solicitud al endpoint `oauth/token`:

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
## Tokens De Acceso Personal

Algunas veces, tus usuarios pueden querer emitir tokens de acceso a ellos mismos sin pasar por el típico flujo de redirección de código de autorización. Permitir a los usuarios emitir tokens a ellos mismos por medio de la UI de tu aplicación puede ser útil para permitir que los usuarios experimenten con tu API o pueda servir como un enfoque básico para emitir tokens de acceso en general.

> {note} Los tokens de acceso personal siempre son de vida larga. Su vida no es modificada al momento de usar los métodos `tokensExpireIn` o `refreshTokensExpireIn`.

<a name="creating-a-personal-access-client"></a>
### Creando Un Cliente De Acceso Personal

Antes de que tu aplicación pueda emitir tokens de acceso personal, necesitarás crear un cliente de acceso personal. Puedes hacerlo usando el comando `passport:client` con la opción `--personal`. Si ya has ejecutado el comando `passport:install`, no necesitarás ejecutar este comando:

    php artisan passport:client --personal

Si ya se ha definido un cliente de acceso personal, puedes indicarle a Passport que lo use utilizando el método `personalAccessClientId`. Típicamente, este método debe ser llamado desde el método `boot` de tu `AuthServiceProvider`:

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
### Administrando Tokens De Accceso Personal

Una vez que has creado un cliente de acceso personal, puedes emitir tokens para un usuario dado usando el método `createToken` en la instancia de modelo `User`. El método `createToken` acepta el nombre del token como su primer argumento y un arreglo opcional de [alcances](#token-scopes) como su segundo argumento:

    $user = App\User::find(1);

    // Creating a token without scopes...
    $token = $user->createToken('Token Name')->accessToken;

    // Creating a token with scopes...
    $token = $user->createToken('My Token', ['place-orders'])->accessToken;

#### API JSON

Passport también incluye una API JSON para administrar tokens de acceso personal. Puedes acoplar esto con tu propio frontend para ofrecer un dashboard a tus usuarios para administrar tokens de acceso personal. A continuación, revisaremos todos los endpoints de API para manejar tokens de acceso personal. Por conveniencia, usaremos [Axios](https://github.com/mzabriskie/axios) para demostrar cómo realizar solicitudes HTTP a los endpoints.

La API JSON es resguardada por los middleware `web` y `auth` middleware; por lo tanto, sólo puede ser llamada desde tu propia aplicación. No se puede llamar desde una fuente externa.

> {tip} Si no quieres implementar tu mismo el frontend de token de acceso personal, puedes usar el [frontend de inicio rápido](#frontend-quickstart) para tener un frontend completamente funcional en solo minutos.

#### `GET /oauth/scopes`

Esta ruta devolverá todos los [alcances](#token-scopes) definidos para tu aplicación. Puedes usar esta ruta para listar los alcances que un usuario puede asignar a un token de acceso personal:

    axios.get('/oauth/scopes')
        .then(response => {
            console.log(response.data);
        });

#### `GET /oauth/personal-access-tokens`

Esta ruta devolverá todos los tokens de acceso personal que el usuario autenticado ha creado. Esto es útil principalmente para listar todos los tokens de usuario de modo que puedas editar o borrarlos:

    axios.get('/oauth/personal-access-tokens')
        .then(response => {
            console.log(response.data);
        });

#### `POST /oauth/personal-access-tokens`

Esta ruta crea nuevos token de acceso personal. Requiere dos porciones de datos: el `name` y los `scopes` del token que deben estar asignados al token:

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
### Pasando El Token De Acceso

Al momento de ejecutar rutas que están protegidas por Passport, los consumidores de la API de tu aplicación deberían especificar su token de acceso como un token `Bearer` en el encabezado de `Authorization` de su solicitud. Por ejemplo, al usar el paquete HTTP de Guzzle:

    $response = $client->request('GET', '/api/user', [
        'headers' => [
            'Accept' => 'application/json',
            'Authorization' => 'Bearer '.$accessToken,
        ],
    ]);

<a name="token-scopes"></a>
## Alcances De Token

Los alcances permiten que tus clientes de API soliciten un conjunto de permisos específicos al momento de solicitar autorización para acceder a una cuenta. Por ejemplo, si estás construyendo una aplicación de comercio electrónico, no todos los consumidores de API necesitarán la habilidad para realizar órdenes. En lugar de eso, puedes permitir que los consumidores soliciten solamente autorización para acceder a los estados de envío de órdenes. En otras palabras, los alcances permiten que los usuarios de tu aplicación limiten las acciones que una aplicacion de terceros puede ejecutar en su nombre.

<a name="defining-scopes"></a>
### Definiendo Alcances

Puedes definir los alcances de tu API usando el método `Passport::tokensCan` en el método `boot` de tu `AuthServiceProvider`. El método `tokensCan` acepta un arreglo de nombres de alcance y descripciones de alcance. La descripción de alcance puede ser cualquier cosa que desees y será mostrada para los usuarios en la pantalla de aprobación de autorización:

    use Laravel\Passport\Passport;

    Passport::tokensCan([
        'place-orders' => 'Place orders',
        'check-status' => 'Check order status',
    ]);

<a name="default-scope"></a>
### Alcance Predeterminado

Si un cliente no solicita ningún alcance específico, puedes configurar el servidor de Passport para adjuntar un alcance predeterminado al token mediante el método `setDefaultScope`. Normalmente, debes llamar a este método desde el método `boot` de tu `AuthServiceProvider`:

    use Laravel\Passport\Passport;

    Passport::setDefaultScope([
        'check-status',
        'place-orders',
    ]);

<a name="assigning-scopes-to-tokens"></a>
### Asignando Alcances A Tokens

#### Al Solicitar Códigos De Autorización

Al momento de solicitar un token de acceso usando un permiso de código de autorización, los consumidores deben especificar sus alcances deseados como el parámetro de cadena de consulta `scope`. El parámetro `scope` debe ser una lista de alcances delimitada por espacios:

    Route::get('/redirect', function () {
        $query = http_build_query([
            'client_id' => 'client-id',
            'redirect_uri' => 'http://example.com/callback',
            'response_type' => 'code',
            'scope' => 'place-orders check-status',
        ]);

        return redirect('http://your-app.com/oauth/authorize?'.$query);
    });

#### Al Emitir Tokens De Acceso Personal

Si estás emitiendo tokens de acceso personal usando el método `createToken` del modelo `User`, puedes pasar el arreglo de alcances deseado como segundo argumento del método:

    $token = $user->createToken('My Token', ['place-orders'])->accessToken;

<a name="checking-scopes"></a>
### Verificando Alcances

Passport incluye dos middleware que pueden ser usados para verificar que una solicitud entrante esté autenticada con un token al que ha sido otorgado un alcance dado. Para empezar, agrega el siguiente middleware a la propiedad `$routeMiddleware` de tu archivo `app/Http/Kernel.php`

    'scopes' => \Laravel\Passport\Http\Middleware\CheckScopes::class,
    'scope' => \Laravel\Passport\Http\Middleware\CheckForAnyScope::class,

#### Verifica Todos los Alcances

El middleware `scopes` puede ser asignado a una ruta para verificar que el token de acceso de la solicitud entrante tiene *todos* los alcances listados:

    Route::get('/orders', function () {
        // Access token has both "check-status" and "place-orders" scopes...
    })->middleware('scopes:check-status,place-orders');

#### Verifica Algunos Alcances

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

#### Métodos De Alcance Adicionales

EL método `scopeIds` devolverá un arreglo con todos los IDs / nombres definidos:

    Laravel\Passport\Passport::scopeIds();

EL método `scopes` devolverá un arreglo con todos los alcances definidos como instancias de `Laravel\Passport\Scope`:

    Laravel\Passport\Passport::scopes();

El método `scopesFor` devolverá un arreglo con las instancias `Laravel\Passport\Scope` que coincidan con los IDs / nombres proporcionados:

    Laravel\Passport\Passport::scopesFor(['place-orders', 'check-status']);

Puedes determinar si un alcance dado ha sido definido usando el método `hasScope`:

    Laravel\Passport\Passport::hasScope('place-orders');

<a name="consuming-your-api-with-javascript"></a>
## Consumiendo Tu API Con JavaScript

Al crear una API, puede ser extremadamente útil ser capaz de consumir tu propia API desde tu aplicación JavaScript. Esta aproximación a desarrollo de API permite que tu propia aplicación consuma la misma API que estás compartiendo con el mundo. La misma API puede ser consumida por tus aplicaciones Web, aplicaciones móviles, aplicaciones de terceros y cualquier SDKs que puedes publicar en varios gestores de paquetes.

Típicamente, si quieres consumir tu API desde tu aplicación JavaScript, necesitarás enviar manualmente un token de acceso para la aplicación y pasarlo con cada solicitud para tu aplicación. Sin embargo, Passport incluye un middleware que puede manejar esto por ti. Todo lo que necesitas hacer es agregar el middleware `CreateFreshApiToken` a tu grupo middleware `web` en tu archivo `app/Http/Kernel.php`:

    'web' => [
        // Other middleware...
        \Laravel\Passport\Http\Middleware\CreateFreshApiToken::class,
    ],

> {note} Debes asegurarte de que el middleware `EncryptCookies` esté listado antes del middleware` CreateFreshApiToken` en tu pila de middleware.

Este middleware de Passport adjuntará un cookie `laravel_token` en tus respuestas salientes. Este cookie contiene un JWT encriptado que Passport usará para autenticar solicitudes API desde tu aplicación JavaScript. Ahora, puedes construir solicitudes para la API de tu aplicación sin pasar explícitamente un token de acceso:

    axios.get('/api/user')
        .then(response => {
            console.log(response.data);
        });

#### Personalizando El Nombre De Cookie

De ser necesario, puedes personalizar el nombre de la cookie `laravel_token` usando el método `Passport::cookie` Típicamente, este método debe ser llamado desde el método `boot` de tu `AuthServiceProvider`:

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

Al usar este método de autenticación, el scaffolding por defecto de JavaSript en Laravel le indica a Axios que siempre envíe los encabezados `X-CSRF-TOKEN` y `X-Requested-With`. Sin embargo, es necesario asegurate de incluir tu token CSRF en un [etiqueta meta de HTML](/docs/{{version}}/csrf#csrf-x-csrf-token):

    // In your application layout...
    <meta name="csrf-token" content="{{ csrf_token() }}">

    // Laravel's JavaScript scaffolding...
    window.axios.defaults.headers.common = {
        'X-Requested-With': 'XMLHttpRequest',
    };

<a name="events"></a>
## Eventos

Passport genera eventos al momento de emitir y actualizar tokens de acceso. Puedes usar estos eventos para acortar o revocar otros tokens de acceso en tu base de datos. Puedes adjuntar listeners a estos eventos en el `EventServiceProvider` de tu aplicación:

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

<a name="testing"></a>
## Pruebas

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
