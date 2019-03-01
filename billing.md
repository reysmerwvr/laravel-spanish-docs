# Laravel Cashier

- [Introducción](#introduction)
- [Actualizando Cashier](#upgrading-cashier)
- [Configuración](#configuration)
    - [Stripe](#stripe-configuration)
    - [Braintree](#braintree-configuration)
    - [Configuración de Moneda](#currency-configuration)
- [Suscripciones](#subscriptions)
    - [Creando Suscripciones](#creating-subscriptions)
    - [Verificando el Estado de Suscripción](#checking-subscription-status)
    - [Cambiando Planes](#changing-plans)
    - [Cantidad de Suscripción](#subscription-quantity)
    - [Impuesto de Suscripción](#subscription-taxes)
    - [Fecha de Suscripción](#subscription-anchor-date)
    - [Cancelando Suscripciones](#cancelling-subscriptions)
    - [Resumiendo Suscripciones](#resuming-subscriptions)
- [Periodos de Prueba de Suscripción](#subscription-trials)
    - [Con Tarjeta de Crédito](#with-credit-card-up-front)
    - [Sin Tarjeta de Crédito](#without-credit-card-up-front)
- [Clientes](#customers)
    - [Creando Clientes](#creating-customers)
- [Tarjetas](#cards)
    - [Retornando Tarjetas de Crédito](#retrieving-credit-cards)
    - [Determina Si Una Tarjeta Está En El Archivo](#determining-if-a-card-is-on-file)
    - [Actualizando Tarjetas de Crédito](#updating-credit-cards)
    - [Eliminación Tarjetas de Crédito](#deleting-credit-cards)
- [Manejando Webhooks de Stripe](#handling-stripe-webhooks)
    - [Definiendo Manejadores de Eventos Webhooks](#defining-webhook-event-handlers)
    - [Suscripciones Fallidas](#handling-failed-subscriptions)
    - [Verificando las Firmas del Webhook](#verifying-webhook-signatures)
- [Manejando Webhooks de Braintree](#handling-braintree-webhooks)
    - [Definiendo Manejadores de Eventos de Webhooks](#defining-braintree-webhook-event-handlers)
    - [Suscripciones Fallidas](#handling-braintree-failed-subscriptions)
- [Cargos Únicos](#single-charges)
    - [Carga Simple](#simple-charge)
    - [Carga con Factura](#charge-with-invoice)
    - [Reembolsar Cargos](#refunding-charges)
- [Facturas](#invoices)
    - [Generando PDFs de Factura](#generating-invoice-pdfs)

<a name="introduction"></a>
## Introducción

Laravel Cashier proporciona una expresiva interface fluida para los servicios de pagos en línea por suscripción de [Stripe](https://stripe.com) y [Braintree](https://www.braintreepayments.com). Maneja casi todo el código de pagos en línea por suscripción en plantillas al que estés teniendo pavor de escribir. Además de la gestión de suscripción, Cashier puede manejar cupones, suscripción de intercambio, "cantidades" de suscripción, cancelación de períodos de gracia, e incluso generar PDFs de facturas.

> {note} Si solamente estás trabajando con cargos de "un pago-único" y no ofreces subscripciones, no deberías usar Cashier. En lugar de eso, usa directamente los SDKs de Stripe y Braintree.

<a name="upgrading-cashier"></a>
## Actualizando Cashier

Al actualizar a una nueva versión mayor de Cashier, es importante que revises cuidadosamente [la guía de actualización](https://github.com/laravel/cashier/blob/master/UPGRADE.md).

<a name="configuration"></a>
## Configuración

<a name="stripe-configuration"></a>
### Stripe

#### Composer

Primero, agrega el paquete de Cashier para Stripe en tus dependencias:

    composer require laravel/cashier

#### Migraciones de Bases de Datos

Antes de usar Cashier, también necesitaremos [preparar la base de datos](/docs/{{version}}/migrations). Necesitas agregar varias columnas a tu tabla `users` y crear una nueva tabla `subscriptions` para manejar todas las subscripciones de nuestros clientes:

    Schema::table('users', function ($table) {
        $table->string('stripe_id')->nullable()->collation('utf8mb4_bin');
        $table->string('card_brand')->nullable();
        $table->string('card_last_four', 4)->nullable();
        $table->timestamp('trial_ends_at')->nullable();
    });

    Schema::create('subscriptions', function ($table) {
        $table->increments('id');
        $table->unsignedInteger('user_id');
        $table->string('name');
        $table->string('stripe_id')->collation('utf8mb4_bin');
        $table->string('stripe_plan');
        $table->integer('quantity');
        $table->timestamp('trial_ends_at')->nullable();
        $table->timestamp('ends_at')->nullable();
        $table->timestamps();
    });

Una vez que las migraciones han sido creadas, ejecuta el comando Artisan `migrate`.

#### Modelo Facturable

A continuación, agrega el trait `Billable` a tu definición de modelo. Este trait  proporciona varios métodos para permitir que ejecutes las tareas comunes de facturación, tales como crear subscripciones, aplicar cupones, y actualizar información de la tarjeta de crédito:

    use Laravel\Cashier\Billable;

    class User extends Authenticatable
    {
        use Billable;
    }

#### Claves de API

Finalmente, deberías configurar tu clave de Stripe en tu archivo de configuración `services.php`. Puedes obtener tus claves de API de Stripe desde el panel de control de Stripe:

    'stripe' => [
        'model'  => App\User::class,
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
    ],

<a name="braintree-configuration"></a>
### Braintree

#### Advertencias de Braintree

Para muchas operaciones, las implementaciones de Stripe y Braintree de Cashier funcionan igual. Ambos servicios proporcionan facturación por suscripción con tarjetas de crédito excepto que Braintree también soporta pagos por medio de PayPal. Sin embargo, Braintree también carece de algunas características que son soportadas por Stripe. Deberías mantener lo siguiente en mente cuando decidas usar Stripe o Braintree:

<div class="content-list" markdown="1">
- Braintree soporta PayPal mientras Stripe no.
- Braintree no soporta los métodos `increment` y `decrement` en subscripciones. Esta es una limitación de Braintree, no una limitación de Cashier.
- Braintree no soporta descuentos basados en porcentajes. Esta es una limitación de Braintree, no una limitación de Cashier.
</div>

#### Composer

Primero, agrega el paquete Cashier para Braintree en tus dependencias:

    composer require "laravel/cashier-braintree":"~2.0"

#### Plan Credit Coupon

Antes de usar Cashier con Braintree, necesitarás definir un descuento `plan-credit` en tu panel de control de Braintree. Este descuento será usado para proratear apropiadamente las subscripciones que cambian desde facturación anual a mensual, o desde facturación mensual a anual.

La cantidad de descuento configurada en el panel de control de Braintree puede ser cualquier valor que desees, ya que Cashier sobreescribirá la cantidad definida con nuestra propia cantidad personalizada cada vez que apliquemos el cupón. Este cupón es necesario ya que Braintree no soporta nativamente el prorateo de subscripciones a través de las frecuencias de suscripción.

#### Database Migrations

Antes de usar Cashier, necesitaremos [preparar la base de datos](/docs/{{version}}/migrations). Necesitamos agregar varias columnas a tu tabla `users` y crear una nueva tabla `subscriptions` para manejar las subscripciones de nuestros clientes:

    Schema::table('users', function ($table) {
        $table->string('braintree_id')->nullable();
        $table->string('paypal_email')->nullable();
        $table->string('card_brand')->nullable();
        $table->string('card_last_four')->nullable();
        $table->timestamp('trial_ends_at')->nullable();
    });

    Schema::create('subscriptions', function ($table) {
        $table->increments('id');
        $table->unsignedInteger('user_id');
        $table->string('name');
        $table->string('braintree_id');
        $table->string('braintree_plan');
        $table->integer('quantity');
        $table->timestamp('trial_ends_at')->nullable();
        $table->timestamp('ends_at')->nullable();
        $table->timestamps();
    });

Una vez que las migraciones han sido creadas, ejecuta el comando Artisan `migrate`.

#### Modelo Facturable

A continuación, agrega el trait `Billable` en tu definición de modelo:

    use Laravel\Cashier\Billable;

    class User extends Authenticatable
    {
        use Billable;
    }

#### Claves de API

A continuación, deberías configurar las siguientes opciones en tu archivo `services.php`:

    'braintree' => [
        'model'  => App\User::class,
        'environment' => env('BRAINTREE_ENV'),
        'merchant_id' => env('BRAINTREE_MERCHANT_ID'),
        'public_key' => env('BRAINTREE_PUBLIC_KEY'),
        'private_key' => env('BRAINTREE_PRIVATE_KEY'),
    ],

Luego, deberías agregar las siguientes llamadas SDK de Braintree en el método `boot` de tu proveedor de servicio `AppServiceProvider`:

    \Braintree_Configuration::environment(config('services.braintree.environment'));
    \Braintree_Configuration::merchantId(config('services.braintree.merchant_id'));
    \Braintree_Configuration::publicKey(config('services.braintree.public_key'));
    \Braintree_Configuration::privateKey(config('services.braintree.private_key'));

<a name="currency-configuration"></a>
### Configuración de Moneda

La moneda predeterminada de Cashier es Dólares de USA (USD). Puedes cambiar la moneda predeterminada al ejecutar el método `Cashier::useCurrency` dentro del método `boot` de uno de tus proveedores de servicio. El método `Cashier::useCurrency` acepta dos parámetros de cadena: la moneda y el símbolo de la moneda:

    use Laravel\Cashier\Cashier;

    Cashier::useCurrency('eur', '€');

<a name="subscriptions"></a>
## Subscripciones

<a name="creating-subscriptions"></a>
### Creando Suscripciones

Para crear una suscripción, primero obtén una instancia de tu modelo facturable, el cual será típicamente una instancia de `App\User`. Una vez que has obtenido la instancia de modelo, puedes usar el método `newSubscription` para crear la suscripción del modelo:

    $user = User::find(1);

    $user->newSubscription('main', 'premium')->create($stripeToken);

El primer argumento pasado al método `newSubscription` debería ser el nombre de la suscripción. Si tu aplicación sólo ofrece una única suscripción, puedes llamarla `main` o `primary`. El segundo argumento es el plan de Stripe / Braintree específico al que el usuario se está suscribiendo. Este valor debería corresponder al identificador del plan en Stripe o Braintree.

El método `create`, el cual acepta un token de tarjeta de crédito / fuente de Stripe, comenzará la suscripción al igual que actualizará tu base de datos con el ID del cliente y otra información de facturación relevante.

#### Detalles de Usuario Adicionales

Si prefieres especificar detalles de cliente adicionales, puedes hacer eso pasándolos como segundo argumento del método `create`:

    $user->newSubscription('main', 'monthly')->create($stripeToken, [
        'email' => $email,
    ]);

Para aprender más sobre los campos adicionales soportados por Stripe o Braintree, revisa la [documentación sobre la creación de clientes](https://stripe.com/docs/api#create_customer) o la correspondiente [documentación de Braintree](https://developers.braintreepayments.com/reference/request/customer/create/php).

#### Cupones

Si prefieres aplicar un cupón al momento de crear la suscripción, puedes usar el método `withCoupon`:

    $user->newSubscription('main', 'monthly')
         ->withCoupon('code')
         ->create($stripeToken);

<a name="checking-subscription-status"></a>
### Verificando el Estado de la Suscripción

Una vez que un usuario está suscrito a tu aplicación, puedes verificar fácilmente su estado de suscripción usando una variedad conveniente de métodos. Primero, el método `subscribed` devuelve `true` si el usuario tiene una suscripción activa, incluso si la suscripción está actualmente en su período de prueba:

    if ($user->subscribed('main')) {
        //
    }

El método `subscribed` también constituye un gran candidato para un [middleware de ruta](/docs/{{version}}/middleware), permitiéndote filtrar el acceso a rutas y controladores basados en el estado de suscripción:

    public function handle($request, Closure $next)
    {
        if ($request->user() && ! $request->user()->subscribed('main')) {
            // This user is not a paying customer...
            return redirect('billing');
        }

        return $next($request);
    }

Si prefieres determinar si un usuario está aún dentro de su período de prueba, puedes usar el método `onTrial`. Este método puede ser útil para mostrar una adevertencia al usuario que ellos aún están o su período de prueba:

    if ($user->subscription('main')->onTrial()) {
        //
    }

El método `subscribedToPlan` puede ser usado para determinar si el usuario está suscrito a un plan dado basado en un ID dado de plan Stripe / Braintree. En este ejemplo, determinaremos si la suscripción `main` del usuario está activa para al plan `monthly`:

    if ($user->subscribedToPlan('monthly', 'main')) {
        //
    }

El método `recurring` puede ser usado para determinar si el usuario está actualmente suscrito y ya no está dentro de su periodo de prueba:

	if ($user->subscription('main')->recurring()) {
		//
	}

#### Estado de Suscripción Cancelada

Para determinar si el usuario fue alguna vez un suscriptor activo, pero que ha cancelado su suscripción, puedes usar el método `cancelled`:

    if ($user->subscription('main')->cancelled()) {
        //
    }

También puedes determinar si un usuario ha cancelado su suscripción, pero todavía está en su "período de gracia" hasta que la suscripción caduque totalmente. Por ejemplo, si un usuario cancela una suscripción el 5 de Marzo que fue planificada para expirar originalmente el 10 de Marzo, el usuario está en su "período de gracia" hasta el 10 de Marzo. Nota que el método `subscribed` aún devuelve `true` durante esta tiempo:

    if ($user->subscription('main')->onGracePeriod()) {
        //
    }

Para determinar si el usuario que ha cancelado su suscripción ya no está dentro del "periodo de gracia", puedes usar el método `ended`:

	if ($user->subscription('main')->ended()) {
		//
	}

<a name="changing-plans"></a>
### Cambiando los Planes

Después que un usuario esté suscrito en tu aplicación, ocasionalmente puede querer cambiar a un nuevo plan de suscripción. Para intercambiar un usuario a una nueva suscripción, pasa el identificador de plan al método `swap`:

    $user = App\User::find(1);

    $user->subscription('main')->swap('provider-plan-id');

Si el usuario está en período de prueba, el período de prueba será mantenido. También, si una "cantidad" existe para la suscripción esa cantidad también será conservada.

Si prefieres intercambiar planes y cancelar cualquier período de prueba en donde esté el usuario actualmente, puedes usar el método `skipTrial`:

    $user->subscription('main')
            ->skipTrial()
            ->swap('provider-plan-id');

<a name="subscription-quantity"></a>
### Cantidad de la Suscripción

> {note} Las cantidades de suscripción solamente son soportadas por la edición de Stripe de Cashier. Braintree no tiene una característica que corresponda a la "cantidad" de Stripe.

Algunas veces las suscripciones son afectadas por la "cantidad". Por ejemplo, tu aplicación podría cargar 10$ por mes **por usuario** en una cuenta. Para incrementar o disminuir fácilmente tu cantidad de suscripción, usa los métodos `incrementQuantity` y `decrementQuantity`:

    $user = User::find(1);

    $user->subscription('main')->incrementQuantity();

    // Add five to the subscription's current quantity...
    $user->subscription('main')->incrementQuantity(5);

    $user->subscription('main')->decrementQuantity();

    // Subtract five to the subscription's current quantity...
    $user->subscription('main')->decrementQuantity(5);

Alternativamente, puedes establecer una cantidad específica usando el método `updateQuantity`: 

    $user->subscription('main')->updateQuantity(10);

El método `noProrate` puede ser usado para actualizar la cantidad de la suscripción sin proratear los cargos:

    $user->subscription('main')->noProrate()->updateQuantity(10);

Para más información sobre cantidades de suscripción, consulta la [documentación de Stripe](https://stripe.com/docs/subscriptions/quantities).

<a name="subscription-taxes"></a>
### Impuestos de Suscripción

Para especificar el porcentaje de impuesto que un usuario paga en una suscrípción, implementa el método `taxPercentage` en tu modelo facturable, y devuelve un valor numérico entre 0 y 100, sin más de 2 posiciones decimales.

    public function taxPercentage() {
        return 20;
    }

El método `taxPercentage` le permite aplicar una tasa de impuesto modelo por modelo, lo que puede ser útil para una base de usuarios que abarca varios países y tasas de impuestos.

> {note} El método `taxPercentage` solamente aplica para cargos por suscripción. Si usas Cashier para hacer cargos de "pago único", necesitarás especificar manualmente la tasa de impuesto en ese momento.

#### Sincronizando Los Porcentajes Del Impuesto

Al cambiar el valor retornado por el método `taxPercentage`, las configuraciones de impuesto en cualquier suscripción existente del usuario permanecerán igual. Si deseas actualizar el valor del impuesto para un suscripción existente con el valor `taxPercentage` retornado, debes llamar al método `syncTaxPercentage` en la instancia de suscripción del usuario:

    $user->subscription('main')->syncTaxPercentage();

<a name="subscription-anchor-date"></a>
### Fecha de la Suscripción

> {note} Modificar la fecha de suscripción sólo es soportado por la versión de Stripe de Cashier.

Por defecto, el ancla del ciclo de facturación es la fecha en la que la suscripción fue creada o si un periodo de prueba es usado, la fecha en la que la prueba termina. Si deseas modificar la fecha de facturación, puedes usar el método `anchorBillingCycleOn`:

    use App\User;
    use Carbon\Carbon;

    $user = User::find(1);

    $anchor = Carbon::parse('first day of next month');

    $user->newSubscription('main', 'premium')
                ->anchorBillingCycleOn($anchor->startOfDay())
                ->create($stripeToken);

Para más información sobre administrar ciclos de facturación, consulta la [documentación del ciclo de facturación de Stripe](https://stripe.com/docs/billing/subscriptions/billing-cycle)

<a name="cancelling-subscriptions"></a>
### Cancelando Suscripciones

Para cancelar una suscripción, ejecuta el método `cancel` en la suscripción del usuario:

    $user->subscription('main')->cancel();

Cuando una suscripción es cancelada, Cashier establecerá automáticamente la columna `ends_at` en tu base de datos. Esta columna es usada para conocer cuando el método `subscribed` debería empezar devolviendo `false`. Por ejemplo, si un cliente cancela una suscripción el primero de Marzo, pero la suscripción no estaba planificada para finalizar sinó para el 5 de Marzo, el método `subscribed` continuará devolviendo `true` hasta el 5 de Marzo.

Puedes determinar si un usuario ha cancelado su suscripción pero aún está en su "período de gracia" usando el método `onGracePeriod`:

    if ($user->subscription('main')->onGracePeriod()) {
        //
    }

Si deseas cancelar una suscripción inmediatamente, ejecuta el método `cancelNow` en la suscripción del usuario:

    $user->subscription('main')->cancelNow();

<a name="resuming-subscriptions"></a>
### Reanudar Suscripciones

Si un usuario ha cancelado su suscripción y deseas reanudarla, usa el método `resume`. El usuario **debe** estár aún en su período de gracia con el propósito de reanudar una suscripción:

    $user->subscription('main')->resume();

Si el usuario cancela una suscripción y después reanuda esa suscripción antes que la suscripción haya expirado completamente, no será facturada inmediatamente. En lugar de eso, su suscripción será reactivada, y será facturada en el ciclo de facturación original.

<a name="subscription-trials"></a>
## Períodos de Prueba de Suscripción

<a name="with-credit-card-up-front"></a>
### Con Información Anticipada de la Tarjeta de Crédito

Si prefieres ofrecer períodos de prueba a tus clientes mientras continuas coleccionando información anticipada del método de pago, deberías usar el método `trialDays` al momento de crear tus suscripciones:

    $user = User::find(1);

    $user->newSubscription('main', 'monthly')
                ->trialDays(10)
                ->create($stripeToken);

Este método establecerá la fecha de finalización del período de prueba del registro de suscripción dentro de la base de datos, al igual que instruirá a Stripe / Braintree a no empezar a facturar al cliente hasta después de esta fecha.

> {note} Si la suscripción del cliente no es cancelada antes de la fecha de finalización del período de prueba, será cargada tan pronto como expire el período de prueba, así que deberías asegurarte de notificar a tus usuarios de la fecha de finalización de su período de prueba.

El método `trialUntil` te permite proporcionar una instancia `DateTime` para especificar cuando el periodo de prueba debería terminar:

    use Carbon\Carbon;

    $user->newSubscription('main', 'monthly')
                ->trialUntil(Carbon::now()->addDays(10))
                ->create($stripeToken);

Puede determinar si el usuario está dentro de su período de prueba utilizando el método `onTrial` de la instancia del usuario o el método` onTrial` de la instancia de suscripción. Los dos ejemplos que siguen son idénticos:

    if ($user->onTrial('main')) {
        //
    }

    if ($user->subscription('main')->onTrial()) {
        //
    }

<a name="without-credit-card-up-front"></a>
### Sin Información Anticipada de la Tarjeta de Crédito

Si prefieres ofrecer períodos de prueba sin coleccionar la información anticipada del método de pago del usuario, puedes establecer la columna `trial_ends_at` del registro del usuario con la fecha de finalización del período de prueba deseado. Esto es hecho típicamente durante el registro del usuario:

    $user = User::create([
        // Populate other user properties...
        'trial_ends_at' => now()->addDays(10),
    ]);

> {note}  Asegúrate de agregar un [mutador de fecha](/docs/{{version}}/loquent-mutators#date-mutators) para `trial_ends_at` en tu definición de modelo.

Cashier se refiere a este tipo de período de prueba como un "período de prueba genérico", debido a que no está conectado a ninguna suscripción existente. El método `onTrial` en la instancia `User` devolverá `true` si la fecha actual no es mayor al valor de `trial_ends_at`:

    if ($user->onTrial()) {
        // User is within their trial period...
    }

También puedes usar el método `onGenericTrial` si deseas conocer específicamente que el usuario está dentro de su período de prueba "genérico" y no ha creado una suscripción real todavía:

    if ($user->onGenericTrial()) {
        // User is within their "generic" trial period...
    }

Una vez que estés listo para crear una suscripción real para el usuario, puedes usar el método `newSubscription` como es usual:

    $user = User::find(1);

    $user->newSubscription('main', 'monthly')->create($stripeToken);

<a name="customers"></a>
## Clientes

<a name="creating-customers"></a>
### Creando Clientes
	
Ocasionalmente, puedes desear crear un cliente de Stripe sin iniciar una suscripción. Puedes lograr esto usando el método `createAsStripeCustomer`:

    $user->createAsStripeCustomer($stripeToken);

Una vez el cliente ha sido creado en Stripe, puedes iniciar una suscripción en una fecha posterior.

> {tip} El equivalente de Braintree para este método es el método `createAsBraintreeCustomer`.

<a name="cards"></a>
## Tarjetas

<a name="retrieving-credit-cards"></a>
### Retornando Tarjetas De Crédito

El método `card` en la instancia del modelo facturable retorna una colección de instancias `Laravel\Cashier\Card`:

    $cards = $user->cards();

Para retornar la tarjeta por defecto, el método `defaultCard` puede ser usado:

    $card = $user->defaultCard();

<a name="determining-if-a-card-is-on-file"></a>
### Determinando Si Una Tarjeta Están En El Archivo

Puedes comprobar si un cliente tiene una tarjeta de credito agregada a su cuenta usando el método `hasCardOnFile`:

    if ($user->hasCardOnFile()) {
        //
    }

<a name="updating-credit-cards"></a>
### Actualizando Tarjetas De Crédito

El método `updateCard` puede ser usado para acutualizar la información de tarjeta de crédito de un cliente. Este método acepta un token de Stripe y asignará la nueva tarjeta de crédito como el método de pago por defecto:

    $user->updateCard($stripeToken);

Para sincronizar tu información de tarjeta con la información de la tarjeta por defecto del cliente en Stripe, puedes usar el método `updateCardFromStripe`:

    $user->updateCardFromStripe();

<a name="deleting-credit-cards"></a>
### Eliminando Tarjetas De Crédito

Para eliminar una tarjeta, debes primero retornar las tarjetas del cliente con el método `cards`. Luego, puedes llamar al método `delete` en la instancia de la tarjeta que deseas eliminar:

    foreach ($user->cards() as $card) {
        $card->delete();
    }

> {note} Si eliminas la tarjeta por defecto, por favor asegurate de que sincronizas la nueva tarjeta por defecto con tu base de datos usando método `updateCardFromStripe`.

El método `deleteCards` eliminará toda la información de la tarjeta almacenada por tu aplicación:

    $user->deleteCards();

> {note} Si el usuario tiene una suscripción activa, debes considerar evitar que eliminen la última forma de pago restante.

<a name="handling-stripe-webhooks"></a>
## Manejando Webhooks de Stripe

Tanto Stripe como Braintree pueden notificar tu aplicación de una variedad de eventos por medio de Webhooks. Para manejar webhooks de Stripe, define una ruta que apunte al controlador de webhook de Cashier. Este controlador manejará todas las solicitudes de webhook entrantes y despacharlos al método de controlador apropiado.

    Route::post(
        'stripe/webhook',
        '\Laravel\Cashier\Http\Controllers\WebhookController@handleWebhook'
    );

> {note} Una vez que hayas resgistrado tu ruta, asegúrate de configurar la URL de webhook en tus opciones de configuración de panel de control de Stripe.

De forma predeterminada, este controlador manejará automáticamente la cancelación de suscripciones que tengan demasiados cargos fallidos (como sean definidos por tus opciones de configuración de Stripe), actualizaciones de clientes, eliminaciones de clientes, actualizaciones de suscripciones y cambios de tarjetas de crédito; sin embargo, como vamos a descubrir pronto, puedes extender este controlador para manejar cualquier evento de webhook que quieras.

> {note} Asegurate de proteger las peticiones entrantes con el middleware [webhook de verificación de firma][(/docs/{{version}}/billing#verifying-webhook-signatures] incluido en Cashier.

#### Webhooks & Protección CSRF

Ya que los webhooks de Stripe necesitan pasar por alto la [protección CSRF](/docs/{{version}}/csrf) de Laravel, asegurate de listar la URI como una excepción en tu middleware `VerifyCsrfToken` o lista la ruta fuera del grupo de middleware `web`:

    protected $except = [
        'stripe/*',
    ];

<a name="defining-webhook-event-handlers"></a>
### Definiendo Manejadores de Evento de Webhook

Cashier maneja automáticamente la cancelación de suscripción por cargos fallidos, pero si tienes eventos de webhook adicionales que te gustaría manejar, extiende el controlador de Webhook. Tus nombres de métodos deberían corresponder con la convención esperada por Cashier, específicamente, los métodos deberían estar prefijados con `handle` y el nombre "camel case" del webhook de Stripe que deseas manejar. Por ejemplo, si deseas manejar el webhook `invoice.payment_succeeded`, deberías agregar un método `handleInvoicePaymentSucceeded` al controlador:

    <?php

    namespace App\Http\Controllers;

    use Laravel\Cashier\Http\Controllers\WebhookController as CashierController;

    class WebhookController extends CashierController
    {
        /**
         * Handle a Stripe webhook.
         *
         * @param  array  $payload
         * @return Response
         */
        public function handleInvoicePaymentSucceeded($payload)
        {
            // Handle The Event
        }
    }

Luego, define una ruta a tu controlador de Cashier dentro de tu archivo `routes/web.php`:

	Route::post(
	    'stripe/webhook',
        '\App\Http\Controllers\WebhookController@handleWebhook'
	);

<a name="handling-failed-subscriptions"></a>
### Suscripciones Fallidas

¿Qué sucedería si una tarjeta de crédito expira? No importa - Cashier incluye un controlador de Webhook que puede cancelar fácilmente la suscripción del cliente por ti. Como notaste antes, todo lo que necesitas hacer es apuntar una ruta al controlador:

    Route::post(
        'stripe/webhook',
        '\Laravel\Cashier\Http\Controllers\WebhookController@handleWebhook'
    );

¡Y eso es todo! Los pagos fallidos serán capturados y manejados por el controlador. El controlador cancelará la suscripción del cliente cuando Stripe determina que la suscripción ha fallado (normalmente después de tres intentos de pagos fallidos).

<a name="verifying-webhook-signatures"></a>
### Verificando Las Firmas De Los Webhook

Para asegurar tus webhooks, puedes usar [las firmas de webhook de Stripe](https://stripe.com/docs/webhooks/signatures). Por conveniencia, Cashier automáticamente incluye un middleware que verifica si la petición del webhook de Stripe entrante es válida.

Para habilitar la verificación de webhook, asegurate de que el valor de configuración `stripe.webhook.secret` está establecido en tu archivo de configuración `services`. El valor `secret` del webhook puede ser retornado desde el dashboard de tu cuenta de Stripe.

<a name="handling-braintree-webhooks"></a>
## Manejando los Webhooks de Braintree

Tanto Stripe como Braintree pueden notificar tu aplicación de una variedad de eventos por medio de webhooks. Para manejar los webhooks de Braintree, define una ruta que apunte al controlador de webhook de Cashier. Este controlador manejará todas las solicitudes webhook entrantes y los disparará al método de controlador apropiado:

    Route::post(
        'braintree/webhook',
        '\Laravel\Cashier\Http\Controllers\WebhookController@handleWebhook'
    );

> {note} Una vez que hayas registrado tu ruta, asegurate de configurar la URL de webhook en tus opciones de configuración de panel de control de Braintree.

De forma predeterminada, este controlador manejará automáticamente la cancelación de suscripciones que tengan demasiados cargos fallidos (como sean definidos en tus opciones de configuración de Braintree); sin embargo, tan pronto como descubramos, puedes extender este controlador para manejar cualquier evento de webhook que quieras.

#### Webhooks & Protección CSRF

Ya que los webhooks de Braintree necesitan pasar por alto la [protección CSRF](/docs/{{version}}/csrf) de Laravel, asegúrate de listar la URI como una execpción en tu middleware `VerifyCsrfToken` o listar la ruta fuera de el grupo de middleware `web`:

    protected $except = [
        'braintree/*',
    ];

<a name="defining-braintree-webhook-event-handlers"></a>
### Definiendo Manejadores de Evento de Webhook

Cashier maneja automáticamente la cancelación de suscripción por cargos fallidos, pero si tienes eventos de webhook de Braintree adicionales que quieras manejar, extiende el controlador de Webhook. Tus nombres de método deberían corresponder con la convención esperada por Cashier, específicamente, los métodos deberían estar prefijados con `handle` y el nombre "camel case" del webhook de Braintree que quieras manejar. Por ejemplo, si deseas manejar el webhook `dispute_opened`, deberías agregar un método `handleDisputeOpened` al controlador:

    <?php

    namespace App\Http\Controllers;

    use Braintree\WebhookNotification;
    use Laravel\Cashier\Http\Controllers\WebhookController as CashierController;

    class WebhookController extends CashierController
    {
        /**
         * Handle a new dispute.
         *
         * @param  \Braintree\WebhookNotification  $webhook
         * @return \Symfony\Component\HttpFoundation\Responses
         */
        public function handleDisputeOpened(WebhookNotification $webhook)
        {
            // Handle The Webhook...
        }
    }

<a name="handling-braintree-failed-subscriptions"></a>
### Suscripciones Fallidas

¿Qué sucedería si una tarjeta de crédito de un cliente expira? No importa - Cashier incluye un controlador de Webhook que puede cancelar fácilmente la suscripción del cliente por ti. Justamente apunta una ruta al controlador:

    Route::post(
        'braintree/webhook',
        '\Laravel\Cashier\Http\Controllers\WebhookController@handleWebhook'
    );

¡Y eso es todo! Los pagos fallidos serán capturados y manejados por el controlador. El controlador cancelará la suscripción del cliente cuando Braintree determina que la suscripción ha fallado (normalmente después de tres intentos de pagos fallidos). No olvides: necesitarás configurar la URI de webhook en tus opciones de configuración del panel de control de Braintree.

<a name="single-charges"></a>
## Cargos Únicos

<a name="simple-charge"></a>
### Cargo Simple

> {note} Al momento de usar Stripe, el método `charge` acepta la cantidad que prefieras cargar en el **denominador más bajo de la moneda usada por tu aplicación**. Sin embargo, al momento de usar Braintree, deberías pasar la cantidad de dólares completa al método `charge`:

Si prefieres hacer un cargo de "un solo pago" contra una tarjeta de crédito de cliente suscrita, puedes usar el método `charge` en una instancia de modelo facturable.

    // Stripe Accepts Charges In Cents...
    $stripeCharge = $user->charge(100);

    // Braintree Accepts Charges In Dollars...
    $user->charge(1);

El método `charge` acepta un arreglo como segundo argumento, permitiendo que pases algunas opciones que desees para la creación de cargo de Stripe / Braintree subyacente. Consulta la documentación de Stripe o Braintree con respecto a las opciones disponibles para ti al momento de crear cargos:

    $user->charge(100, [
        'custom_option' => $value,
    ]);

El método `charge` arrojará una excepción si el cargo falla. Si el cargo es exitoso, la respuesta completa de Stripe / Braintree será devuelta por el método:

    try {
        $response = $user->charge(100);
    } catch (Exception $e) {
        //
    }

<a name="charge-with-invoice"></a>
### Cargo con Factura

Algunas veces puedes necesitar hacer un cargo único pero también generar una factura por el cargo de modo que puedas ofrecer un recibo PDF a tu cliente. El método `invoiceFor` permite que hagas justamente eso. Por ejemplo, vamos a facturar al cliente $5.00 por una "cuota única":

    // Stripe Accepts Charges In Cents...
    $user->invoiceFor('One Time Fee', 500);

    // Braintree Accepts Charges In Dollars...
    $user->invoiceFor('One Time Fee', 5);

La factura será cargada inmediatamente contra la tarjeta de crédito del usuario. El método `invoiceFor` también acepta un arreglo como su tercer argumento. Este arreglo contiene las opciones de facturación para el elemento de la factura. El cuarto argumento aceptado por el método es también un arreglo. Este argumento final acepta las opciones de facturación de la factura en sí:

    $user->invoiceFor('One Time Fee', 500, [
        'custom-option' => $value,
    ]);

Si estás usando Braintree como tu proveedor de facturación, debes incluir una opción `description` al llamar al método `invoiceFor`:

$user->invoiceFor('One Time Fee', 500, [
    'description' => 'your invoice description here',
]);

> {note} El método `invoiceFor` creará una factura de Stripe la cual reintentará intentos de facturación fallidos. Si no quieres que las facturas reintenten cargos fallidos, necesitarás cerrarlas usando la API de Stripe después del primer cargo fallido.

<a name="refunding-charges"></a>
### Reembolsando Cargos

Si necesitas reembolsar un cargo de Stripe, puedes usar el método `refund`. Este método acepta el id del cargo de Stripe como su único argumento:

$stripeCharge = $user->charge(100);

$user->refund($stripeCharge->id);

<a name="invoices"></a>
## Facturas

Puedes obtener fácilmente un arreglo de facturas de modelo facturables usando el método `invoices`:

    $invoices = $user->invoices();

    // Include pending invoices in the results...
    $invoices = $user->invoicesIncludingPending();

Al momento de listar las facturas para el cliente, puedes usar los métodos helper de factura para mostrar la información de factura relevante. Por ejemplo, puedes querer listar todas las facturas en una tabla, permitiendo que el usuario descargue fácilmente algunas de ellas:

    <table>
        @foreach ($invoices as $invoice)
            <tr>
                <td>{{ $invoice->date()->toFormattedDateString() }}</td>
                <td>{{ $invoice->total() }}</td>
                <td><a href="/user/invoice/{{ $invoice->id }}">Download</a></td>
            </tr>
        @endforeach
    </table>

<a name="generating-invoice-pdfs"></a>
### Generando PDFs de Facturas

Dentro de una ruta o controlador, usa el método `downloadInvoice` para generar una descarga en PDF de la factura. Este método generará automáticamente la respuesta HTTT apropiada para enviar la descarga al navegador:

    use Illuminate\Http\Request;

    Route::get('user/invoice/{invoice}', function (Request $request, $invoiceId) {
        return $request->user()->downloadInvoice($invoiceId, [
            'vendor'  => 'Your Company',
            'product' => 'Your Product',
        ]);
    });