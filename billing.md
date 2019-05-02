::: v-pre

# Laravel Cashier

- [Introducción](#introduction)
- [Actualizando Cashier](#upgrading-cashier)
- [Instalación](#installation)
- [Configuración](#configuration)
    - [Migraciones De Base De Datos](#database-migrations)
    - [Modelo Facturable](#billable-model)
    - [API Keys](#api-keys)
    - [Configuración de Moneda](#currency-configuration)
- [Suscripciones](#subscriptions)
    - [Creando Suscripciones](#creating-subscriptions)
    - [Verificando El Estado De Suscripción](#checking-subscription-status)
    - [Cambiando Planes](#changing-plans)
    - [Cantidad De Suscripción](#subscription-quantity)
    - [Impuestos De Suscripción](#subscription-taxes)
    - [Fecha De Anclaje De Suscripción](#subscription-anchor-date)
    - [Cancelando Suscripciones](#cancelling-subscriptions)
    - [Reanudando Suscripciones](#resuming-subscriptions)
- [Periodos De Prueba De Suscripción](#subscription-trials)
    - [Con Tarjeta De Crédito](#with-credit-card-up-front)
    - [Sin Tarjeta De Crédito](#without-credit-card-up-front)
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
- [Cargos Únicos](#single-charges)
    - [Carga Simple](#simple-charge)
    - [Carga con Factura](#charge-with-invoice)
    - [Reembolsar Cargos](#refunding-charges)
- [Facturas](#invoices)
    - [Generando PDFs de Factura](#generating-invoice-pdfs)

<a name="introduction"></a>
## Introducción

Laravel Cashier proporciona una expresiva interfaz fluida para los servicios de pagos en línea por suscripción de [Stripe](https://stripe.com). Maneja casi todo el código de facturación de suscripción que estás teniendo pavor de escribir. Además de la gestión de suscripción, Cashier puede manejar cupones, cambio de suscripciones, "cantidades" de suscripción, cancelación de períodos de gracia e incluso generar PDFs de facturas.

::: danger Nota
Esta documentación es para la integración de Stripe de Cashier. Si estás utilizando Braintree, consulta la [documentación de integración de Braintree](/docs/{{version}}/braintree).
:::

::: danger Nota
Si solamente estás trabajando con cargos de "un pago-único" y no ofreces subscripciones, no deberías usar Cashier. En lugar de eso, usa directamente los SDKs de Stripe.
:::

<a name="upgrading-cashier"></a>
## Actualizando Cashier

Al actualizar a una nueva versión mayor de Cashier, es importante que revises cuidadosamente [la guía de actualización](https://github.com/laravel/cashier/blob/master/UPGRADE.md).

<a name="installation"></a>
## Instalación

Primero, instala el paquete de Cashier para Stripe Con Composer:

```php
composer require laravel/cashier
```

<a name="configuration"></a>
## Configuración

<a name="database-migrations"></a>
### Migraciones de Bases de Datos

Antes de usar Cashier, también necesitaremos [preparar la base de datos](/docs/{{version}}/migrations). Necesitas agregar varias columnas a tu tabla `users` y crear una nueva tabla `subscriptions` para manejar todas las subscripciones de nuestros clientes:

```php
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
```

Una vez que las migraciones han sido creadas, ejecuta el comando Artisan `migrate`.

<a name="billable-model"></a>
#### Modelo Facturable

A continuación, agrega el trait `Billable` a tu definición de modelo. Este trait proporciona varios métodos para permitirte realizar tareas comunes de facturación, tales como creación de subscripciones, aplicación de cupones y actualización de la información de la tarjeta de crédito:

```php
use Laravel\Cashier\Billable;

class User extends Authenticatable
{
    use Billable;
}
```

<a name="api-keys"></a>
### Claves de API

Finalmente, deberías configurar tu clave de Stripe en tu archivo de configuración `services.php`. Puedes obtener tus claves de API de Stripe desde el panel de control de Stripe:

```php
'stripe' => [
    'model'  => App\User::class,
    'key' => env('STRIPE_KEY'),
    'secret' => env('STRIPE_SECRET'),
    'webhook' => [
        'secret' => env('STRIPE_WEBHOOK_SECRET'),
        'tolerance' => env('STRIPE_WEBHOOK_TOLERANCE', 300),
    ],
],
```

<a name="currency-configuration"></a>
### Configuración de Moneda

La moneda predeterminada de Cashier es Dólares estadounidenses (USD). Puedes cambiar la moneda predeterminada al ejecutar el método `Cashier::useCurrency` dentro del método `boot` de uno de tus proveedores de servicio. El método `Cashier::useCurrency` acepta dos parámetros de cadena: la moneda y el símbolo de la moneda:

```php
use Laravel\Cashier\Cashier;

Cashier::useCurrency('eur', '€');
```

<a name="subscriptions"></a>
## Subscripciones

<a name="creating-subscriptions"></a>
### Creando Suscripciones

Para crear una suscripción, primero obtén una instancia de tu modelo facturable, el cual será típicamente una instancia de `App\User`. Una vez que has obtenido la instancia de modelo, puedes usar el método `newSubscription` para crear la suscripción del modelo:

```php
$user = User::find(1);

$user->newSubscription('main', 'premium')->create($token);
```

El primer argumento pasado al método `newSubscription` debería ser el nombre de la suscripción. Si tu aplicación sólo ofrece una única suscripción, puedes llamarla `main` o `primary`. El segundo argumento es el plan específico al que el usuario se está suscribiendo. Este valor debería corresponder al identificador del plan en Stripe.

El método `create` el cual acepta una tarjeta de crédito /  token source de Stripe, comenzará la suscripción al igual que actualizará tu base de datos con el ID del cliente y otra información de facturación relevante.

#### Detalles De Usuario Adicionales

Si prefieres especificar detalles de cliente adicionales, puedes hacerlo pasándolos como segundo argumento del método `create`:

```php
$user->newSubscription('main', 'monthly')->create($token, [
    'email' => $email,
]);
```

Para aprender más sobre los campos adicionales soportados por Stripe, revisa la [documentación sobre la creación de clientes](https://stripe.com/docs/api#create_customer).

#### Cupones

Si prefieres aplicar un cupón al momento de crear la suscripción, puedes usar el método `withCoupon`:

```php
$user->newSubscription('main', 'monthly')
        ->withCoupon('code')
        ->create($token);
```

<a name="checking-subscription-status"></a>
### Verificando El Estado De La Suscripción

Una vez que un usuario está suscrito a tu aplicación, puedes verificar fácilmente su estado de suscripción usando una variedad conveniente de métodos. Primero, el método `subscribed` devuelve `true` si el usuario tiene una suscripción activa, incluso si la suscripción está actualmente en su período de prueba:

```php
if ($user->subscribed('main')) {
    //
}
```

El método `subscribed` también constituye un gran candidato para un [middleware de ruta](/docs/{{version}}/middleware), permitiéndote filtrar el acceso a rutas y controladores basados en el estado de suscripción:

```php
public function handle($request, Closure $next)
{
    if ($request->user() && ! $request->user()->subscribed('main')) {
        // This user is not a paying customer...
        return redirect('billing');
    }

    return $next($request);
}
```

Si prefieres determinar si un usuario está aún dentro de su período de prueba, puedes usar el método `onTrial`. Este método puede ser útil para mostrar una advertencia al usuario que todavía está en su período de prueba:

```php
if ($user->subscription('main')->onTrial()) {
    //
}
```

El método `subscribedToPlan` puede ser usado para determinar si el usuario está suscrito a un plan dado basado en un ID de plan Stripe proporcionado. En este ejemplo, determinaremos si la suscripción `main` del usuario está activa para al plan `monthly`:

```php
if ($user->subscribedToPlan('monthly', 'main')) {
    //
}
```

El método `recurring` puede ser usado para determinar si el usuario está actualmente suscrito y ya no está dentro de su periodo de prueba:

```php
if ($user->subscription('main')->recurring()) {
    //
}
```

#### Estado de Suscripción Cancelada

Para determinar si el usuario fue alguna vez un suscriptor activo, pero que ha cancelado su suscripción, puedes usar el método `cancelled`:

```php
if ($user->subscription('main')->cancelled()) {
    //
}
```

También puedes determinar si un usuario ha cancelado su suscripción, pero todavía está en su "período de gracia" hasta que la suscripción caduque totalmente. Por ejemplo, si un usuario cancela una suscripción el 5 de Marzo que fue planificada para expirar originalmente el 10 de Marzo, el usuario está en su "período de gracia" hasta el 10 de Marzo. Nota que el método `subscribed` aún devuelve `true` durante esta tiempo:

```php
if ($user->subscription('main')->onGracePeriod()) {
    //
}
```

Para determinar si el usuario que ha cancelado su suscripción ya no está dentro del "periodo de gracia", puedes usar el método `ended`:

```php
if ($user->subscription('main')->ended()) {
    //
}
```

<a name="changing-plans"></a>
### Cambiando Planes

Después que un usuario esté suscrito en tu aplicación, ocasionalmente puede querer cambiar a un nuevo plan de suscripción. Para cambiar un usuario a una nueva suscripción, pasa el identificador de plan al método `swap`:

```php
$user = App\User::find(1);

$user->subscription('main')->swap('provider-plan-id');
```

Si el usuario está en período de prueba, se mantendrá el período de prueba. También, si una "cantidad" existe para la suscripción esa cantidad también será conservada.

Si prefieres cambiar planes y cancelar cualquier período de prueba en donde esté el usuario actualmente, puedes usar el método `skipTrial`:

```php
$user->subscription('main')
        ->skipTrial()
        ->swap('provider-plan-id');
```

<a name="subscription-quantity"></a>
### Cantidad De La Suscripción

Algunas veces las suscripciones son afectadas por la "cantidad". Por ejemplo, tu aplicación podría cargar 10$ por mes **por usuario** en una cuenta. Para incrementar o disminuir fácilmente tu cantidad de suscripción, usa los métodos `incrementQuantity` y `decrementQuantity`:

```php
$user = User::find(1);

$user->subscription('main')->incrementQuantity();

// Add five to the subscription's current quantity...
$user->subscription('main')->incrementQuantity(5);

$user->subscription('main')->decrementQuantity();

// Subtract five to the subscription's current quantity...
$user->subscription('main')->decrementQuantity(5);
```

Alternativamente, puedes establecer una cantidad específica usando el método `updateQuantity`: 

```php
$user->subscription('main')->updateQuantity(10);
```

El método `noProrate` puede ser usado para actualizar la cantidad de la suscripción sin proratear los cargos:

```php
$user->subscription('main')->noProrate()->updateQuantity(10);
```

Para más información sobre cantidades de suscripción, consulta la [documentación de Stripe](https://stripe.com/docs/subscriptions/quantities).

<a name="subscription-taxes"></a>
### Impuestos de Suscripción

Para especificar el porcentaje de impuesto que un usuario paga en una suscrípción, implementa el método `taxPercentage` en tu modelo facturable y devuelve un valor numérico entre 0 y 100, sin más de 2 posiciones decimales.

```php
public function taxPercentage()
{
    return 20;
}
```

El método `taxPercentage` le permite aplicar una tasa de impuesto modelo por modelo, lo que puede ser útil para una base de usuarios que abarca varios países y tasas de impuestos.

::: danger Nota
El método `taxPercentage` solamente aplica para cargos por suscripción. Si usas Cashier para hacer cargos de "pago único", necesitarás especificar manualmente la tasa de impuesto en ese momento.
:::

#### Sincronizando Los Porcentajes Del Impuesto

Al cambiar el valor retornado por el método `taxPercentage`, las configuraciones de impuesto en cualquier suscripción existente del usuario permanecerán igual. Si deseas actualizar el valor del impuesto para un suscripción existente con el valor `taxPercentage` retornado, debes llamar al método `syncTaxPercentage` en la instancia de suscripción del usuario:

```php
$user->subscription('main')->syncTaxPercentage();
```

<a name="subscription-anchor-date"></a>
### Fecha De Anclaje De La Suscripción

::: danger Nota
Modificar la fecha de suscripción sólo es soportado por la versión de Stripe de Cashier.
:::

Por defecto, el anclaje del ciclo de facturación es la fecha en que se creó la suscripción o, si se usa un período de prueba, la fecha en que finaliza la prueba. Si deseas modificar la fecha de anclaje de facturación, puedes usar el método `anchorBillingCycleOn`:

```php
use App\User;
use Carbon\Carbon;

$user = User::find(1);

$anchor = Carbon::parse('first day of next month');

$user->newSubscription('main', 'premium')
            ->anchorBillingCycleOn($anchor->startOfDay())
            ->create($token);
```

Para más información sobre administrar ciclos de facturación, consulta la [documentación del ciclo de facturación de Stripe](https://stripe.com/docs/billing/subscriptions/billing-cycle)

<a name="cancelling-subscriptions"></a>
### Cancelando Suscripciones

Para cancelar una suscripción, ejecuta el método `cancel` en la suscripción del usuario:

```php
$user->subscription('main')->cancel();
```

Cuando una suscripción es cancelada, Cashier establecerá automáticamente la columna `ends_at` en tu base de datos. Esta columna es usada para conocer cuando el método `subscribed` debería empezar, devolviendo `false`. Por ejemplo, si un cliente cancela una suscripción el primero de Marzo, pero la suscripción no estaba planificada para finalizar sino para el 5 de Marzo, el método `subscribed` continuará devolviendo `true` hasta el 5 de Marzo.

Puedes determinar si un usuario ha cancelado su suscripción pero aún está en su "período de gracia" usando el método `onGracePeriod`:

```php
if ($user->subscription('main')->onGracePeriod()) {
    //
}
```

Si deseas cancelar una suscripción inmediatamente, ejecuta el método `cancelNow` en la suscripción del usuario:

```php
$user->subscription('main')->cancelNow();
```

<a name="resuming-subscriptions"></a>
### Reanudando Suscripciones

Si un usuario ha cancelado su suscripción y deseas reanudarla, usa el método `resume`. El usuario **debe** estár aún en su período de gracia con el propósito de reanudar una suscripción:

```php
$user->subscription('main')->resume();
```

Si el usuario cancela una suscripción y después reanuda esa suscripción antes que la suscripción haya expirado completamente, no será facturada inmediatamente. En lugar de eso, su suscripción será reactivada y será facturada en el ciclo de facturación original.

<a name="subscription-trials"></a>
## Períodos de Prueba (Trials) De Suscripción

<a name="with-credit-card-up-front"></a>
### Con Información Anticipada De La Tarjeta De Crédito

Si prefieres ofrecer períodos de prueba a tus clientes mientras continuas coleccionando información anticipada del método de pago, deberías usar el método `trialDays` al momento de crear tus suscripciones:

```php
$user = User::find(1);

$user->newSubscription('main', 'monthly')
            ->trialDays(10)
            ->create($token);
```

Este método establecerá la fecha de finalización del período de prueba del registro de suscripción dentro de la base de datos, al igual que le indicará a Stripe a no empezar a facturar al cliente hasta después de esta fecha.

::: danger Nota
Si la suscripción del cliente no es cancelada antes de la fecha de finalización del período de prueba, será cargada tan pronto como expire el período de prueba, así que deberías asegurarte de notificar a tus usuarios de la fecha de finalización de su período de prueba.
:::

El método `trialUntil` te permite proporcionar una instancia `DateTime` para especificar cuando el periodo de prueba debería terminar:

```php
use Carbon\Carbon;

$user->newSubscription('main', 'monthly')
            ->trialUntil(Carbon::now()->addDays(10))
            ->create($token);
```

Puedes determinar si el usuario está dentro de su período de prueba utilizando el método `onTrial` de la instancia del usuario o el método` onTrial` de la instancia de suscripción. Los dos ejemplos que siguen son idénticos:

```php
if ($user->onTrial('main')) {
    //
}

if ($user->subscription('main')->onTrial()) {
    //
}
```

<a name="without-credit-card-up-front"></a>
### Sin Información Anticipada de la Tarjeta de Crédito

Si prefieres ofrecer períodos de prueba sin coleccionar la información anticipada del método de pago del usuario, puedes establecer la columna `trial_ends_at` del registro del usuario con la fecha de finalización del período de prueba deseado. Esto es hecho típicamente durante el registro del usuario:

```php
$user = User::create([
    // Populate other user properties...
    'trial_ends_at' => now()->addDays(10),
]);
```

::: danger Nota
Asegúrate de agregar un [mutador de fecha](/docs/{{version}}/loquent-mutators#date-mutators) para `trial_ends_at` en tu definición de modelo.
:::

Cashier se refiere a este tipo de período de prueba como un "período de prueba genérico", debido a que no está conectado a ninguna suscripción existente. El método `onTrial` en la instancia `User` devolverá `true` si la fecha actual no es mayor al valor de `trial_ends_at`:

```php
if ($user->onTrial()) {
    // User is within their trial period...
}
```

También puedes usar el método `onGenericTrial` si deseas conocer específicamente que el usuario está dentro de su período de prueba "genérico" y no ha creado una suscripción real todavía:

```php
if ($user->onGenericTrial()) {
    // User is within their "generic" trial period...
}
```

Una vez que estés listo para crear una suscripción real para el usuario, puedes usar el método `newSubscription` como es usual:

```php
$user = User::find(1);

$user->newSubscription('main', 'monthly')->create($token);
```

<a name="customers"></a>
## Clientes

<a name="creating-customers"></a>
### Creando Clientes
	
Ocasionalmente, puedes desear crear un cliente de Stripe sin iniciar una suscripción. Puedes lograr esto usando el método `createAsStripeCustomer`:

```php
$user->createAsStripeCustomer();
```

Una vez el cliente ha sido creado en Stripe, puedes iniciar una suscripción en una fecha posterior.

<a name="cards"></a>
## Tarjetas

<a name="retrieving-credit-cards"></a>
### Recuperando Tarjetas De Crédito

El método `card` en la instancia del modelo facturable retorna una colección de instancias `Laravel\Cashier\Card`:

```php
$cards = $user->cards();
```

Para recuperar la tarjeta por defecto, puedes usar el método `defaultCard`:

```php
$card = $user->defaultCard();
```

<a name="determining-if-a-card-is-on-file"></a>
### Determinando Si Una Tarjeta Están En El Archivo

Puedes comprobar si un cliente tiene una tarjeta de credito agregada a su cuenta usando el método `hasCardOnFile`:

```php
if ($user->hasCardOnFile()) {
    //
}
```

<a name="updating-credit-cards"></a>
### Actualizando Tarjetas De Crédito

El método `updateCard` puede ser usado para actualizar la información de tarjeta de crédito de un cliente. Este método acepta un token de Stripe y asignará la nueva tarjeta de crédito como el método de pago por defecto:

```php
$user->updateCard($token);
```

Para sincronizar tu información de tarjeta con la información de la tarjeta por defecto del cliente en Stripe, puedes usar el método `updateCardFromStripe`:

```php
$user->updateCardFromStripe();
```

<a name="deleting-credit-cards"></a>
### Eliminando Tarjetas De Crédito

Para eliminar una tarjeta, debes primero recuperar las tarjetas del cliente con el método `cards`. Luego, puedes llamar al método `delete` en la instancia de la tarjeta que deseas eliminar:

```php
foreach ($user->cards() as $card) {
    $card->delete();
}
```

::: danger Nota
Si eliminas la tarjeta por defecto, por favor asegurate de que sincronizas la nueva tarjeta por defecto con tu base de datos usando método `updateCardFromStripe`.
:::

El método `deleteCards` eliminará toda la información de la tarjeta almacenada por tu aplicación:

```php
$user->deleteCards();
```

::: danger Nota
Si el usuario tiene una suscripción activa, debes considerar evitar que eliminen la última forma de pago restante.
:::

<a name="handling-stripe-webhooks"></a>
## Manejando Webhooks de Stripe

Stripe puede notificar tu aplicación de una variedad de eventos por medio de Webhooks. Para manejar webhooks, define una ruta que apunte al controlador de webhook de Cashier. Este controlador manejará todas las solicitudes de webhook entrantes y despacharlos al método de controlador apropiado.

```php
Route::post(
    'stripe/webhook',
    '\Laravel\Cashier\Http\Controllers\WebhookController@handleWebhook'
);
```

::: danger Nota
Una vez que hayas resgistrado tu ruta, asegúrate de configurar la URL de webhook en tus opciones de configuración de panel de control de Stripe.
:::

De forma predeterminada, este controlador manejará automáticamente la cancelación de suscripciones que tengan demasiados cargos fallidos (como sean definidos por tus opciones de configuración de Stripe), actualizaciones de clientes, eliminaciones de clientes, actualizaciones de suscripciones y cambios de tarjetas de crédito; sin embargo, como vamos a descubrir pronto, puedes extender este controlador para manejar cualquier evento de webhook que quieras.

::: danger Nota
Asegurate de proteger las peticiones entrantes con el middleware [webhook de verificación de firma][(/docs/{{version}}/billing#verifying-webhook-signatures] incluido en Cashier.
:::

#### Webhooks & Protección CSRF

Ya que los webhooks de Stripe necesitan pasar por alto la [protección CSRF](/docs/{{version}}/csrf) de Laravel, asegurate de listar la URI como una excepción en tu middleware `VerifyCsrfToken` o lista la ruta fuera del grupo de middleware `web`:

```php
protected $except = [
    'stripe/*',
];
```

<a name="defining-webhook-event-handlers"></a>
### Definiendo Manejadores de Evento de Webhook

Cashier maneja automáticamente la cancelación de suscripción por cargos fallidos, pero si tienes eventos de webhook adicionales que te gustaría manejar, extiende el controlador de Webhook. Tus nombres de métodos deberían corresponder con la convención esperada por Cashier, específicamente, los métodos deberían tener como prefijo `handle` y el nombre "camel case" del webhook que deseas manejar. Por ejemplo, si deseas manejar el webhook `invoice.payment_succeeded`, deberías agregar un método `handleInvoicePaymentSucceeded` al controlador:

```php
<?php

namespace App\Http\Controllers;

use Laravel\Cashier\Http\Controllers\WebhookController as CashierController;

class WebhookController extends CashierController
{
    /**
    * Handle invoice payment succeeded.
    *
    * @param  array  $payload
    * @return \Symfony\Component\HttpFoundation\Response
    */
    public function handleInvoicePaymentSucceeded($payload)
    {
        // Handle The Event
    }
}
```

Luego, define una ruta a tu controlador de Cashier dentro de tu archivo `routes/web.php`:

```php
Route::post(
    'stripe/webhook',
    '\App\Http\Controllers\WebhookController@handleWebhook'
);
```

<a name="handling-failed-subscriptions"></a>
### Suscripciones Fallidas

¿Qué sucedería si una tarjeta de crédito expira? No importa - Cashier incluye un controlador de Webhook que puede cancelar fácilmente la suscripción del cliente por ti. Como notaste antes, todo lo que necesitas hacer es apuntar una ruta al controlador:

```php
Route::post(
    'stripe/webhook',
    '\Laravel\Cashier\Http\Controllers\WebhookController@handleWebhook'
);
```

¡Y eso es todo! Los pagos fallidos serán capturados y manejados por el controlador. El controlador cancelará la suscripción del cliente cuando Stripe determina que la suscripción ha fallado (normalmente después de tres intentos de pagos fallidos).

<a name="verifying-webhook-signatures"></a>
### Verificando Las Firmas De Los Webhook

Para asegurar tus webhooks, puedes usar [las firmas de webhook de Stripe](https://stripe.com/docs/webhooks/signatures). Por conveniencia, Cashier automáticamente incluye un middleware que verifica si la petición del webhook de Stripe entrante es válida.

Para habilitar la verificación de webhook, asegurate de que el valor de configuración `stripe.webhook.secret` está establecido en tu archivo de configuración `services`. El valor `secret` del webhook puede ser retornado desde el dashboard de tu cuenta de Stripe.

<a name="single-charges"></a>
## Cargos Únicos

<a name="simple-charge"></a>
### Cargo Simple

::: danger Nota
El método `charge` acepta la cantidad que prefieras cargar en el **denominador más bajo de la moneda usada por tu aplicación**.
:::

Si desea realizar un "cargo único" en la tarjeta de crédito de un cliente suscrito, puedes usar el método `charge` en una instancia de modelo facturable.

```php
// Stripe Accepts Charges In Cents...
$stripeCharge = $user->charge(100);
```

El método `charge` acepta un arreglo como segundo argumento, permitiendo que pases algunas opciones que desees para la creación de cargo de Stripe subyacente. Consulte la documentación de Stripe sobre las opciones disponibles al crear cargos:

```php
$user->charge(100, [
    'custom_option' => $value,
]);
```

El método `charge` arrojará una excepción si el cargo falla. Si el cargo es exitoso, la respuesta completa de Stripe será devuelta por el método:

```php
try {
    $response = $user->charge(100);
} catch (Exception $e) {
    //
}
```

<a name="charge-with-invoice"></a>
### Cargo con Factura

Algunas veces puedes necesitar hacer un cargo único pero también generar una factura por el cargo de modo que puedas ofrecer un recibo PDF a tu cliente. El método `invoiceFor` permite que hagas justamente eso. Por ejemplo, vamos a facturar al cliente $5.00 por una "cuota única":

```php
// Stripe Accepts Charges In Cents...
$user->invoiceFor('One Time Fee', 500);
```

La factura será cargada inmediatamente contra la tarjeta de crédito del usuario. El método `invoiceFor` también acepta un arreglo como su tercer argumento. Este arreglo contiene las opciones de facturación para el elemento de la factura. El cuarto argumento aceptado por el método es también un arreglo. Este argumento final acepta las opciones de facturación de la factura en sí:

```php
$user->invoiceFor('Stickers', 500, [
    'quantity' => 50,
], [
    'tax_percent' => 21,
]);
```

::: danger Nota
El método `invoiceFor` creará una factura de Stripe la cual reintentará intentos de facturación fallidos. Si no quieres que las facturas reintenten cargos fallidos, necesitarás cerrarlas usando la API de Stripe después del primer cargo fallido.
:::

<a name="refunding-charges"></a>
### Reembolsando Cargos

Si necesitas reembolsar un cargo de Stripe, puedes usar el método `refund`. Este método acepta el id del cargo de Stripe como su único argumento:

```php
$stripeCharge = $user->charge(100);

$user->refund($stripeCharge->id);
```

<a name="invoices"></a>
## Facturas

Puedes obtener fácilmente un arreglo de facturas de modelo facturables usando el método `invoices`:

```php
$invoices = $user->invoices();

// Include pending invoices in the results...
$invoices = $user->invoicesIncludingPending();
```

Al momento de listar las facturas para el cliente, puedes usar los métodos helper de factura para mostrar la información de factura relevante. Por ejemplo, puedes querer listar todas las facturas en una tabla, permitiendo que el usuario descargue fácilmente algunas de ellas:

```php
<table>
    @foreach ($invoices as $invoice)
        <tr>
            <td>{{ $invoice->date()->toFormattedDateString() }}</td>
            <td>{{ $invoice->total() }}</td>
            <td><a href="/user/invoice/{{ $invoice->id }}">Download</a></td>
        </tr>
    @endforeach
</table>
```

<a name="generating-invoice-pdfs"></a>
### Generando PDFs de Facturas

Dentro de una ruta o controlador, usa el método `downloadInvoice` para generar una descarga en PDF de la factura. Este método generará automáticamente la respuesta HTTP apropiada para enviar la descarga al navegador:

```php
use Illuminate\Http\Request;

Route::get('user/invoice/{invoice}', function (Request $request, $invoiceId) {
    return $request->user()->downloadInvoice($invoiceId, [
        'vendor'  => 'Your Company',
        'product' => 'Your Product',
    ]);
});
```