# Laravel Cashier (Braintree)

- [Introducción](#introduction)
    - [Advertencias](#caveats)
- [Instalación](#installation)
- [Configuración](#configuration)
    - [Plan De Cupon De Crédito](#plan-credit-coupon)
    - [Migraciones De Base De Datos](#database-migrations)
    - [Modelo Facturable](#billable-model)
    - [API Keys](#api-keys)
    - [Configuración de Moneda](#currency-configuration)
- [Suscripciones](#subscriptions)
    - [Creando Suscripciones](#creating-subscriptions)
    - [Verificando El Estado De Suscripción](#checking-subscription-status)
    - [Cambiando Planes](#changing-plans)
    - [Impuestos De Suscripción](#subscription-taxes)
    - [Cancelando Suscripciones](#cancelling-subscriptions)
    - [Reanudando Suscripciones](#resuming-subscriptions)
- [Periodos De Prueba De Suscripción](#subscription-trials)
    - [Con Tarjeta De Crédito](#with-credit-card-up-front)
    - [Sin Tarjeta De Crédito](#without-credit-card-up-front)
- [Clientes](#customers)
    - [Creando Clientes](#creating-customers)
- [Tarjetas](#cards)
    - [Actualizando Tarjetas de Crédito](#updating-credit-cards)
- [Manejando Webhooks](#handling-webhooks)
    - [Definiendo Manejadores de Eventos Webhooks](#defining-webhook-event-handlers)
    - [Suscripciones Fallidas](#handling-failed-subscriptions)
- [Cargos Únicos](#single-charges)
    - [Carga Simple](#simple-charge)
    - [Carga con Factura](#charge-with-invoice)
- [Facturas](#invoices)
    - [Generando PDFs de Factura](#generating-invoice-pdfs)

<a name="introduction"></a>
## Introducción

Laravel Cashier Braintree proporciona una expresiva interfaz fluida para los servicios de pagos en línea por suscripción de [Braintree](https://www.braintreepayments.com). Maneja casi todo el código de facturación de suscripción que estás teniendo pavor de escribir. Además de la gestión de suscripción básica, Cashier puede manejar cupones, cambio de suscripciones, "cantidades" de suscripción, cancelación de períodos de gracia e incluso generar PDFs de facturas.

> {note} Esta documentación es para la integración de Cashier con Braintree. Puedes encontrar la documentación de Stripe [aquí](/docs/{{version}}/billing).

> {note} Si solamente estás trabajando con cargos de "un pago único" y no ofreces subscripciones, no deberías usar Cashier. En lugar de eso, usa directamente los SDKs de Braintree.

<a name="caveats"></a>
### Advertencias

Para muchas operaciones, las implementaciones de Stripe y Braintree de Cashier funcionan de la misma manera. Ambos servicios proporcionan facturación de suscripción con tarjetas de crédito, pero Braintree también admite pagos a través de PayPal. Sin embargo, Braintree también carece de algunas características que son compatibles con Stripe. Debes tener en cuenta lo siguiente cuando decidas utilizar Stripe o Braintree:

<div class="content-list" markdown="1">
- Braintree soporta PayPal mientras que Stripe no lo hace.
- Braintree no admite los métodos `increment` y` decrement` en las suscripciones. Esta es una limitación de Braintree, no una limitación de Cashier.
- Braintree no admite descuentos basados ​​en porcentajes. Esta es una limitación de Braintree, no una limitación de Cashier.
</div>

<a name="installation"></a>
## Instalación

Primero, instala el paquete de Cashier package para Braintree con Composer:

    composer require laravel/cashier-braintree

<a name="configuration"></a>
## Configuración

<a name="plan-credit-coupon"></a>
### Plan De Cupon De Credito

Antes de usar Cashier con Braintree, deberás definir un descuento de `plan-credit` en el panel de control de Braintree. Este descuento se usará para prorratear correctamente las suscripciones que cambien de facturación anual a mensual, o de facturación mensual a anual.

El monto de descuento configurado en el panel de control de Braintree puede ser cualquier valor que desees, ya que Cashier anulará la cantidad definida con nuestra propia cantidad personalizada cada vez que aplicamos el cupón. Este cupón es necesario ya que Braintree no admite de forma nativa suscripciones prorrateadas a través de frecuencias de suscripción.

<a name="database-migrations"></a>
### Migraciones de Bases de Datos

Antes de usar Cashier, también necesitaremos [preparar la base de datos](/docs/{{version}}/migrations). Necesitas agregar varias columnas a tu tabla `users` y crear una nueva tabla `subscriptions` para manejar todas las subscripciones de nuestros clientes:

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

<a name="billable-model"></a>
#### Modelo Facturable

A continuación, agrega el trait `Billable` a tu definición de modelo:

    use Laravel\Cashier\Billable;

    class User extends Authenticatable
    {
        use Billable;
    }

<a name="api-keys"></a>
### Claves de API

Luego, configura las siguientes opciones en tu archivo `services.php`:

    'braintree' => [
        'model'  => App\User::class,
        'environment' => env('BRAINTREE_ENV'),
        'merchant_id' => env('BRAINTREE_MERCHANT_ID'),
        'public_key' => env('BRAINTREE_PUBLIC_KEY'),
        'private_key' => env('BRAINTREE_PRIVATE_KEY'),
    ],

Posteriormente agrega los siguientes llamados al SDK de Braintree SDK calls en el método `boot` de tu proveedor de servicios `AppServiceProvider`:

    \Braintree_Configuration::environment(config('services.braintree.environment'));
    \Braintree_Configuration::merchantId(config('services.braintree.merchant_id'));
    \Braintree_Configuration::publicKey(config('services.braintree.public_key'));
    \Braintree_Configuration::privateKey(config('services.braintree.private_key'));

<a name="currency-configuration"></a>
### Configuración de Moneda

La moneda predeterminada de Cashier es Dólares estadounidenses (USD). Puedes cambiar la moneda predeterminada al ejecutar el método `Cashier::useCurrency` dentro del método `boot` de uno de tus proveedores de servicio. El método `Cashier::useCurrency` acepta dos parámetros de cadena: la moneda y el símbolo de la moneda:

    use Laravel\Cashier\Cashier;

    Cashier::useCurrency('eur', '€');

<a name="subscriptions"></a>
## Subscripciones

<a name="creating-subscriptions"></a>
### Creando Suscripciones

Para crear una suscripción, primero obtén una instancia de tu modelo facturable, el cual será típicamente una instancia de `App\User`. Una vez que has obtenido la instancia de modelo, puedes usar el método `newSubscription` para crear la suscripción del modelo:

    $user = User::find(1);

    $user->newSubscription('main', 'premium')->create($token);

El primer argumento pasado al método `newSubscription` debería ser el nombre de la suscripción. Si tu aplicación sólo ofrece una única suscripción, puedes llamarla `main` o `primary`. El segundo argumento es el plan específico al que el usuario se está suscribiendo. Este valor debería corresponder al identificador del plan en Braintree.

El método `create` el cual acepta una tarjeta de crédito /  token source, comenzará la suscripción al igual que actualizará tu base de datos con el ID del cliente y otra información de facturación relevante.

#### Detalles De Usuario Adicionales

Si prefieres especificar detalles de cliente adicionales, puedes hacerlo pasándolos como segundo argumento del método `create`:

    $user->newSubscription('main', 'monthly')->create($token, [
        'email' => $email,
    ]);

Para aprender más sobre los campos adicionales soportados por Braintree, revisa la correspondiente [documentación de Braintree](https://developers.braintreepayments.com/reference/request/customer/create/php).

#### Cupones

Si prefieres aplicar un cupón al momento de crear la suscripción, puedes usar el método `withCoupon`:

    $user->newSubscription('main', 'monthly')
         ->withCoupon('code')
         ->create($token);

<a name="checking-subscription-status"></a>
### Verificando El Estado De La Suscripción

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

Si prefieres determinar si un usuario está aún dentro de su período de prueba, puedes usar el método `onTrial`. Este método puede ser útil para mostrar una advertencia al usuario que todavía está en su período de prueba:

    if ($user->subscription('main')->onTrial()) {
        //
    }

El método `subscribedToPlan` puede ser usado para determinar si el usuario está suscrito a un plan dado basado en un ID de plan proporcionado. En este ejemplo, determinaremos si la suscripción `main` del usuario está activa para al plan `monthly`:

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
### Cambiando Planes

Después que un usuario esté suscrito en tu aplicación, ocasionalmente puede querer cambiar a un nuevo plan de suscripción. Para cambiar un usuario a una nueva suscripción, pasa el identificador de plan al método `swap`:

    $user = App\User::find(1);

    $user->subscription('main')->swap('provider-plan-id');

Si el usuario está en período de prueba, se mantendrá el período de prueba. También, si una "cantidad" existe para la suscripción esa cantidad también será conservada.

Si prefieres cambiar planes y cancelar cualquier período de prueba en donde esté el usuario actualmente, puedes usar el método `skipTrial`:

    $user->subscription('main')
            ->skipTrial()
            ->swap('provider-plan-id');

<a name="subscription-taxes"></a>
### Impuestos de Suscripción

Para especificar el porcentaje de impuesto que un usuario paga en una suscrípción, implementa el método `taxPercentage` en tu modelo facturable y devuelve un valor numérico entre 0 y 100, sin más de 2 posiciones decimales.

    public function taxPercentage()
    {
        return 20;
    }

El método `taxPercentage` le permite aplicar una tasa de impuesto modelo por modelo, lo que puede ser útil para una base de usuarios que abarca varios países y tasas de impuestos.

> {note} El método `taxPercentage` solamente aplica para cargos por suscripción. Si usas Cashier para hacer cargos de "pago único", necesitarás especificar manualmente la tasa de impuesto en ese momento.

<a name="cancelling-subscriptions"></a>
### Cancelando Suscripciones

Para cancelar una suscripción, ejecuta el método `cancel` en la suscripción del usuario:

    $user->subscription('main')->cancel();

Cuando una suscripción es cancelada, Cashier establecerá automáticamente la columna `ends_at` en tu base de datos. Esta columna es usada para conocer cuando el método `subscribed` debería empezar, devolviendo `false`. Por ejemplo, si un cliente cancela una suscripción el primero de Marzo, pero la suscripción no estaba planificada para finalizar sino para el 5 de Marzo, el método `subscribed` continuará devolviendo `true` hasta el 5 de Marzo.

Puedes determinar si un usuario ha cancelado su suscripción pero aún está en su "período de gracia" usando el método `onGracePeriod`:

    if ($user->subscription('main')->onGracePeriod()) {
        //
    }

Si deseas cancelar una suscripción inmediatamente, ejecuta el método `cancelNow` en la suscripción del usuario:

    $user->subscription('main')->cancelNow();

<a name="resuming-subscriptions"></a>
### Reanudando Suscripciones

Si un usuario ha cancelado su suscripción y deseas reanudarla, usa el método `resume`. El usuario **debe** estár aún en su período de gracia con el propósito de reanudar una suscripción:

    $user->subscription('main')->resume();

Si el usuario cancela una suscripción y después reanuda esa suscripción antes que la suscripción haya expirado completamente, no será facturada inmediatamente. En lugar de eso, su suscripción será reactivada y será facturada en el ciclo de facturación original.

<a name="subscription-trials"></a>
## Períodos de Prueba (Trials) De Suscripción

<a name="with-credit-card-up-front"></a>
### Con Información Anticipada De La Tarjeta De Crédito

Si prefieres ofrecer períodos de prueba a tus clientes mientras continuas coleccionando información anticipada del método de pago, deberías usar el método `trialDays` al momento de crear tus suscripciones:

    $user = User::find(1);

    $user->newSubscription('main', 'monthly')
                ->trialDays(10)
                ->create($token);

Este método establecerá la fecha de finalización del período de prueba del registro de suscripción dentro de la base de datos, al igual que le indicará a Stripe a no empezar a facturar al cliente hasta después de esta fecha.

> {note} Si la suscripción del cliente no es cancelada antes de la fecha de finalización del período de prueba, será cargada tan pronto como expire el período de prueba, así que deberías asegurarte de notificar a tus usuarios de la fecha de finalización de su período de prueba.

Puedes determinar si el usuario está dentro de su período de prueba utilizando el método `onTrial` de la instancia del usuario o el método `onTrial` de la instancia de suscripción. Los dos ejemplos a continuación son idénticos:

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

    $user->newSubscription('main', 'monthly')->create($token);

<a name="customers"></a>
## Clientes

<a name="creating-customers"></a>
### Creando Clientes

Ocasionalmente, puedes desear crear un cliente de Braintree sin iniciar una suscripción. Puedes lograr esto usando el método `createAsBraintreeCustomer`:

    $user->createAsBraintreeCustomer();

Una vez el cliente ha sido creado en Braintree, puedes iniciar una suscripción en una fecha posterior.

<a name="cards"></a>
## Tarjetas

<a name="updating-credit-cards"></a>
### Actualizando Tarjetas De Crédito

El método `updateCard` puede ser usado para actualizar la información de tarjeta de crédito de un cliente. Este método acepta un token de Braintree y asignará la nueva tarjeta de crédito como el método de pago por defecto:

    $user->updateCard($token);

<a name="handling-webhooks"></a>
## Manejando Webhooks

Braintree puede notificar tu aplicación de una variedad de eventos por medio de Webhooks. Para manejar webhooks, define una ruta que apunte al controlador de webhook de Cashier. Este controlador manejará todas las solicitudes de webhook entrantes y despacharlos al método de controlador apropiado.

    Route::post(
        'braintree/webhook',
        '\Laravel\Cashier\Http\Controllers\WebhookController@handleWebhook'
    );

> {note} Una vez que hayas resgistrado tu ruta, asegúrate de configurar la URL de webhook en tus opciones de configuración de panel de control de Braintree.

De forma predeterminada, este controlador manejará automáticamente la cancelación de suscripciones que tengan demasiados cargos fallidos (como sean definidos por tus opciones de configuración de Braintree); sin embargo, como vamos a descubrir pronto, puedes extender este controlador para manejar cualquier evento de webhook que quieras.

#### Webhooks Y Protección CSRF

Ya que los webhooks necesitan pasar por alto la [protección CSRF](/docs/{{version}}/csrf) de Laravel, asegurate de listar la URI como una excepción en tu middleware `VerifyCsrfToken` o lista la ruta fuera del grupo de middleware `web`:

    protected $except = [
        'braintree/*',
    ];

<a name="defining-webhook-event-handlers"></a>
### Definiendo Manejadores de Evento de Webhook

Cashier maneja automáticamente la cancelación de suscripción por cargos fallidos, pero si tienes eventos de webhook adicionales que te gustaría manejar, extiende el controlador de Webhook. Tus nombres de métodos deberían corresponder con la convención esperada por Cashier, específicamente, los métodos deberían tener como prefijo `handle` y el nombre "camel case" del webhook que deseas manejar. Por ejemplo, si deseas manejar el webhook `invoice.payment_succeeded`, deberías agregar un método `handleInvoicePaymentSucceeded` al controlador:

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

<a name="handling-failed-subscriptions"></a>
### Suscripciones Fallidas

¿Qué sucedería si una tarjeta de crédito expira? No importa - Cashier incluye un controlador de Webhook que puede cancelar fácilmente la suscripción del cliente por ti. Como notaste antes, todo lo que necesitas hacer es apuntar una ruta al controlador:

    Route::post(
        'braintree/webhook',
        '\Laravel\Cashier\Http\Controllers\WebhookController@handleWebhook'
    );

¡Y eso es todo! Los pagos fallidos serán capturados y manejados por el controlador. El controlador cancelará la suscripción del cliente cuando Braintree determina que la suscripción ha fallado (normalmente después de tres intentos de pagos fallidos).  No olvides: tendrás que configurar el URI del webhook en la configuración del panel de control de Braintree.

<a name="single-charges"></a>
## Cargos Únicos

<a name="simple-charge"></a>
### Cargo Simple

> {note} Debe spasar el monto total en dólares al método `charge`:

Si desea realizar un "cargo único" en la tarjeta de crédito de un cliente suscrito, puedes usar el método `charge` en una instancia de modelo facturable.

    $user->charge(1);

El método `charge` acepta un arreglo como segundo argumento, permitiendo que pases algunas opciones que desees para la creación de cargo de subyacente. Consulte la documentación de Braintree sobre las opciones disponibles al crear cargos:

    $user->charge(1, [
        'custom_option' => $value,
    ]);

El método `charge` arrojará una excepción si el cargo falla. Si el cargo es exitoso, la respuesta completa de Braintree será devuelta por el método:

    try {
        $response = $user->charge(1);
    } catch (Exception $e) {
        //
    }

<a name="charge-with-invoice"></a>
### Cargo con Factura

Algunas veces puedes necesitar hacer un cargo único pero también generar una factura por el cargo de modo que puedas ofrecer un recibo PDF a tu cliente. El método `invoiceFor` permite que hagas justamente eso. Por ejemplo, vamos a facturar al cliente $5.00 por una "One Time Fee":

    $user->invoiceFor('One Time Fee', 5);

La factura será cargada inmediatamente contra la tarjeta de crédito del usuario. El método `invoiceFor` también acepta un arreglo como su tercer argumento. Este arreglo contiene las opciones de facturación para el elemento de la factura. Debes incluir una opción  `description` cuando llames al método `invoiceFor`:

    $user->invoiceFor('One Time Fee', 5, [
        'description' => 'your invoice description here',
    ]);

<a name="invoices"></a>
## Invoices

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

Dentro de una ruta o controlador, usa el método `downloadInvoice` para generar una descarga en PDF de la factura. Este método generará automáticamente la respuesta HTTP apropiada para enviar la descarga al navegador:

    use Illuminate\Http\Request;

    Route::get('user/invoice/{invoice}', function (Request $request, $invoiceId) {
        return $request->user()->downloadInvoice($invoiceId, [
            'vendor'  => 'Your Company',
            'product' => 'Your Product',
        ]);
    });
