::: v-pre

# Correos Electrónicos

- [Introducción](#introduction)
    - [Requisitos Previos](#driver-prerequisites)
- [Generando Mailables](#generating-mailables)
- [Escribiendo Mailables](#writing-mailables)
    - [Configurando El Envío](#configuring-the-sender)
    - [Configurando La Vista](#configuring-the-view)
    - [Datos En Vistas](#view-data)
    - [Archivos Adjuntos](#attachments)
    - [Archivos Adjuntos En Línea](#inline-attachments)
    - [Personalizar El Mensaje De SwiftMailer](#customizing-the-swiftmailer-message)
- [Mailables en Markdown](#markdown-mailables)
    - [Generando Mailables En Markdown](#generating-markdown-mailables)
    - [Escribiendo Mensajes En Markdown](#writing-markdown-messages)
    - [Personalizando Los Componentes](#customizing-the-components)
- [Enviando Correo](#sending-mail)
    - [Colas De Correos](#queueing-mail)
- [Renderizando Mailables](#rendering-mailables)
	- [Previsualizando Mailables En El Navegador](#previewing-mailables-in-the-browser)
- [Configuración Regional de Mailables](#localizing-mailables)
- [Correos y Desarrollo Local](#mail-and-local-development)
- [Eventos](#events)

<a name="introduction"></a>
## Introducción

Laravel proporciona una API limpia y simple sobre la popular biblioteca [SwiftMailer](https://swiftmailer.symfony.com/) con drivers para SMTP, Mailgun, Postmark, SparkPost, Amazon SES y `sendmail`, permitiéndote comenzar rápidamente a enviar correos a través de un servicio local o en la nube de tu elección.

<a name="driver-prerequisites"></a>
### Requisitos Previos

Los drivers basados ​​en una API como Mailgun, SparkPost y Postmark suelen ser más simples y rápidos que los servidores SMTP. Si es posible, deberías usar uno de estos drivers. Todos los drivers con API requieren la biblioteca Guzzle HTTP, que puede instalarse a través del gestor de paquetes Composer:

```php
composer require guzzlehttp/guzzle
```

#### Driver Mailgun

Para usar el driver de Mailgun, primero instale Guzzle, luego configura la opción `driver` en tu archivo de configuración `config/mail.php` en `mailgun`. Luego, verifica que tu archivo de configuración `config/services.php` contiene las siguientes opciones:

```php
'mailgun' => [
    'domain' => 'your-mailgun-domain',
    'secret' => 'your-mailgun-key',
],
```

Si no estás usando la [región de Mailgun](https://documentation.mailgun.com/en/latest/api-intro.html#mailgun-regions) "US", puedes definir el endpoint de tu región en el archivo de configuración `services`:

```php
'mailgun' => [
    'domain' => 'your-mailgun-domain',
    'secret' => 'your-mailgun-key',
    'endpoint' => 'api.eu.mailgun.net',
],
```

#### Driver Postmark

Para usar el driver de Postmark, instala el transporte de SwiftMailer de Postmark mediante Composer:

```php
composer require wildbit/swiftmailer-postmark
```

Luego, instala Guzzle y establece la opción `driver` en tu archivo de configuración `config/mail.php` a `postmark`. Finalmente, verifica que tu archivo de configuración `config/services.php` contiene las siguientes opciones:

```php
'postmark' => [
    'token' => 'your-postmark-token',
],
```

#### Driver SparkPost

Para usar el driver SparkPost, primero instale Guzzle, luego configura la opción `driver` en tu archivo de configuración `config/mail.php` en `sparkpost`. Luego, verifica que tu archivo de configuración `config/services.php` contiene las siguientes opciones:

```php
'sparkpost' => [
    'secret' => 'your-sparkpost-key',
],
```

Si es necesario, puedes también configurar cuál [endpoint de API](https://developers.sparkpost.com/api/#header-endpoints) debería ser usado:

```php
'sparkpost' => [
    'secret' => 'your-sparkpost-key',
    'options' => [
        'endpoint' => 'https://api.eu.sparkpost.com/api/v1/transmissions',
    ],
],
```

#### Driver SES

Para usar el driver de Amazon SES, primero debes instalar Amazon AWS SDK para PHP. Puedes instalar esta biblioteca agregando la siguiente línea a la sección `require` del archivo `composer.json` y ejecutando el comando `composer update`:

```php
"aws/aws-sdk-php": "~3.0"
```

A continuación, configura la opción `driver` en tu archivo de configuración `config/mail.php` en `ses` y verifica que tu archivo de configuración `config/services.php` contiene las siguientes opciones:

```php
'ses' => [
    'key' => 'your-ses-key',
    'secret' => 'your-ses-secret',
    'region' => 'ses-region',  // e.g. us-east-1
],
```

Si necesitas incluir [opciones adicionales](https://docs.aws.amazon.com/aws-sdk-php/v3/api/api-email-2010-12-01.html#sendrawemail) al ejecutar la petición `SendRawEmail` de SES, puedes definir un arreglo `options` dentro de tu configuración de `ses`:

```php
'ses' => [
    'key' => 'your-ses-key',
    'secret' => 'your-ses-secret',
    'region' => 'ses-region',  // e.g. us-east-1
    'options' => [
        'ConfigurationSetName' => 'MyConfigurationSet',
        'Tags' => [
            [
                'Name' => 'foo',
                'Value' => 'bar',
            ],
        ],
    ],
],
```

<a name="generating-mailables"></a>
## Generando Mailables

En Laravel, cada tipo de correo electrónico enviado por su aplicación se representa como una clase "Mailable". Estas clases se almacenan en el directorio `app/Mail`. No te preocupes si no ves este directorio en tu aplicación, ya que se generará para ti cuando crees tu primera clase mailable usando el comando `make:mail`:

```php
php artisan make:mail OrderShipped
```

<a name="writing-mailables"></a>
## Escribiendo Mailables

Toda la configuración de una clase mailable se realiza en el método `build`. Dentro de este método, puedes llamar a varios métodos como `from`,` subject`, `view` y` attach` para configurar la presentación y entrega del correo electrónico.

<a name="configuring-the-sender"></a>
### Configurando el remitente

#### Usando el método `from`

Primero, exploremos la configuración del remitente para el correo electrónico. O, en otras palabras, para quién será el correo electrónico (from). Hay dos formas de configurar el remitente. En primer lugar, puede usar el método `from` dentro de su método` build` de la clase mailable:

```php
/**
* Build the message.
*
* @return $this
*/
public function build()
{
    return $this->from('example@example.com')
                ->view('emails.orders.shipped');
}
```

#### Usando una dirección global con `from`

Sin embargo, si tu aplicación utiliza la misma dirección "from" para todos sus correos electrónicos, puede resultar engorroso llamar al método `from` en cada clase mailable que genere. En su lugar, puede especificar una dirección global "from" en su archivo de configuración `config/mail.php`. Esta dirección se usará si no se especifica ninguna otra dirección "from" dentro de la clase mailable:

```php
'from' => ['address' => 'example@example.com', 'name' => 'App Name'],
```

Adicionalmente, puedes definir una dirección global "reply_to" dentro de tu archivo de configuración `config/mail.php`:

```php
'reply_to' => ['address' => 'example@example.com', 'name' => 'App Name'],
```

<a name="configuring-the-view"></a>
### Configurando la vista

Dentro de un método 'build' de la clase Mailable, puede usar el método `view` para especificar qué plantilla se debe usar al representar los contenidos del correo electrónico. Dado que cada correo electrónico generalmente usa una [Plantilla Blade](/docs/{{version}}/blade) para representar sus contenidos, tienes toda la potencia y la comodidad del motor de plantillas Blade al construir el HTML de su correo electrónico:

```php
/**
* Build the message.
*
* @return $this
*/
public function build()
{
    return $this->view('emails.orders.shipped');
}
```

::: tip
Es posible que desees crear un directorio `resources/views/emails` para albergar todas tus plantillas de correos electrónicos; sin embargo, puedes colocarlos donde quieras siempre y cuando este dentro del directorio `resources/views`.
:::

#### Correos con Texto Plano

Si deseas definir una versión de texto sin formato en tu correo electrónico, puedes usar el método `text`. Al igual que el método `view`, el método` text` acepta un nombre de plantilla que se usará para representar el contenido del correo electrónico. Eres libre de definir una versión HTML y de texto sin formato del mensaje:

```php
/**
* Build the message.
*
* @return $this
*/
public function build()
{
    return $this->view('emails.orders.shipped')
                ->text('emails.orders.shipped_plain');
}
```

<a name="view-data"></a>
### Datos en Vistas

#### A través De Propiedades Públicas

Por lo general, querrás pasar algunos datos a tu vista que puedes utilizar al representar el HTML del correo electrónico. Hay dos maneras en que puedes hacer que los datos estén disponibles para la vista. Primero, cualquier propiedad pública definida en tu clase Mailable se pondrá automáticamente a disposición de la vista. Entonces, por ejemplo, puedes pasar datos al constructor de tu clase Mailable y establecer esos datos a propiedades públicas definidas en la clase:

```php
<?php

namespace App\Mail;

use App\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderShipped extends Mailable
{
    use Queueable, SerializesModels;

    /**
    * The order instance.
    *
    * @var Order
    */
    public $order;

    /**
    * Create a new message instance.
    *
    * @return void
    */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
    * Build the message.
    *
    * @return $this
    */
    public function build()
    {
        return $this->view('emails.orders.shipped');
    }
}
```

Una vez que los datos se han establecido en una propiedad pública, estarán automáticamente disponibles en tu vista, por lo que puedes acceder a ella como si tuvieras acceso a cualquier otro dato en tus plantillas Blade:

```php
<div>
    Price: {{ $order->price }}
</div>
```

#### A Través Del Método `with`:

Si deseas personalizar el formato de los datos de tu correo electrónico antes de enviarlos a la plantilla, puedes pasar manualmente los datos a la vista mediante el método `with`. Por lo general, aún podrás pasar datos a través del constructor de la clase Mailable; sin embargo, debes establecer estos datos en propiedades `protected` o` private` para que los datos no estén automáticamente disponibles para la plantilla. Luego, al llamar al método `with`, se pase un arreglo de datos que deseas poner a disposición de la plantilla:

```php
<?php

namespace App\Mail;

use App\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderShipped extends Mailable
{
    use Queueable, SerializesModels;

    /**
    * The order instance.
    *
    * @var Order
    */
    protected $order;

    /**
    * Create a new message instance.
    *
    * @return void
    */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
    * Build the message.
    *
    * @return $this
    */
    public function build()
    {
        return $this->view('emails.orders.shipped')
                    ->with([
                        'orderName' => $this->order->name,
                        'orderPrice' => $this->order->price,
                    ]);
    }
}
```

Una vez que los datos se han pasado con el método `with`, estarán automáticamente disponibles en la vista, por lo que puedes acceder a ellos como lo harías con cualquier otro dato en las plantillas Blade:

```php
<div>
    Price: {{ $orderPrice }}
</div>
```

<a name="attachments"></a>
### Archivos Adjuntos

Para agregar archivos adjuntos a un correo electrónico, podemos usar el método `attach` dentro del método `build` de la clase Mailable. El método `attach` acepta la ruta completa al archivo como su primer argumento:

```php
/**
* Build the message.
*
* @return $this
*/
public function build()
{
    return $this->view('emails.orders.shipped')
                ->attach('/path/to/file');
}
```

Al adjuntar archivos a un mensaje, también puedes especificar el nombre para mostrar y / o el tipo MIME pasando un `array` como segundo argumento al método `attach`:

```php
/**
* Build the message.
*
* @return $this
*/
public function build()
{
    return $this->view('emails.orders.shipped')
                ->attach('/path/to/file', [
                    'as' => 'name.pdf',
                    'mime' => 'application/pdf',
                ]);
}
```

#### Adjuntando Archivos Desde El Disco

Si has almacenado un archivo en uno de tus [discos](/docs/{{version}}/filesystem), puedes adjuntarlo al correo electrónico usando el método `attachFromStorage`:

```php
/**
* Build the message.
*
* @return $this
*/
public function build()
{
    return $this->view('email.orders.shipped')
                ->attachFromStorage('/path/to/file');
}
```

De ser necesario, puedes especificar el nombre del archivo adjunto y opciones adicionales usando el segundo y tercer argumento del método `attachFromStorage`:

```php
/**
* Build the message.
*
* @return $this
*/
public function build()
{
    return $this->view('email.orders.shipped')
                ->attachFromStorage('/path/to/file', 'name.pdf', [
                    'mime' => 'application/pdf'
                ]);
}
```

El método `attachFromStorageDisk` puede ser usado si necesitas especificar un disco de almacenamiento diferente a tu disco por defecto:

```php
/**
* Build the message.
*
* @return $this
*/
public function build()
{
    return $this->view('email.orders.shipped')
                ->attachFromStorageDisk('s3', '/path/to/file');
}
```

#### Archivos Adjuntos Desde La Memoria

El método `attachData` se puede usar para adjuntar una cadena de bytes sin formato como un archivo adjunto. Por ejemplo, puede usar este método si ha generado un PDF en la memoria y desea adjuntarlo al correo electrónico sin escribirlo en el disco. El método `attachData` acepta los bytes de datos brutos como su primer argumento, el nombre del archivo como su segundo argumento y un arreglo de opciones como su tercer argumento:

```php
/**
* Build the message.
*
* @return $this
*/
public function build()
{
    return $this->view('emails.orders.shipped')
                ->attachData($this->pdf, 'name.pdf', [
                    'mime' => 'application/pdf',
                ]);
}
```

<a name="inline-attachments"></a>
### Archivos Adjuntos en Línea

La incrustación de imágenes en línea en sus correos electrónicos suele ser engorrosa; sin embargo, Laravel proporciona una forma conveniente de adjuntar imágenes a sus correos electrónicos y recuperar el CID apropiado. Para incrustar una imagen en línea, usa el método `embed` en la variable `$message` dentro de tu plantilla de correo electrónico. Laravel automáticamente hace que la variable `$message` esté disponible para todas tus plantillas de correo electrónico, por lo que no tienes que preocuparte por pasarla manualmente:

```php
<body>
    Here is an image:

    <img src="{{ $message->embed($pathToImage) }}">
</body>
```

::: danger Nota
La variable `$message` no está disponible en los mensajes ya que los mensajes de texto plano (plain-text) no utilizan archivos adjuntos en línea.
:::

#### Incrustar Datos Adjuntos de la Memoria

Si ya tienes una cadena de datos en la memoria que desees incorporar a una plantilla de correo electrónico, puedes usar el método `embedData` en la variable `$message`:

```php
<body>
    Here is an image from raw data:

    <img src="{{ $message->embedData($data, $name) }}">
</body>
```

<a name="customizing-the-swiftmailer-message"></a>
### Personalizar el Mensaje de SwiftMailer

El método `withSwiftMessage` de la clase base `Mailable` te permite registrar una función anónima que se invocará con la instancia del mensaje de SwiftMailer sin procesar antes de enviar el mensaje. Esto le da la oportunidad de personalizar el mensaje antes de que se entregue:

```php
/**
* Build the message.
*
* @return $this
*/
public function build()
{
    $this->view('emails.orders.shipped');

    $this->withSwiftMessage(function ($message) {
        $message->getHeaders()
                ->addTextHeader('Custom-Header', 'HeaderValue');
    });
}
```

<a name="markdown-mailables"></a>
## Mailables en Markdown

Los mensajes escritos con Markdown le permiten aprovechar las plantillas y los componentes precompilados de las notificaciones por correo en tus documentos. Dado que los mensajes se escriben en Markdown, Laravel puede generar plantillas HTML atractivas para los mensajes y generar automáticamente una contraparte de texto sin formato.

<a name="generating-markdown-mailables"></a>
### Generar Mailables en Markdown

Para generar una clase de Mailable con una plantilla para Markdown puedes usar la opción `--markdown` del comando `make:mail`:

```php
php artisan make:mail OrderShipped --markdown=emails.orders.shipped
```

Luego de generar la clase, dentro de su método `build` debes llamar llame al método `markdown` en lugar del método `view`. Los métodos `markdown` aceptan el nombre de la plantilla Markdown y un arreglo opcional de datos para poner a disposición de la plantilla:

```php
/**
* Build the message.
*
* @return $this
*/
public function build()
{
    return $this->from('example@example.com')
                ->markdown('emails.orders.shipped');
}
```

<a name="writing-markdown-messages"></a>
### Escribir mensajes en Markdown

Los correos con Markdown utilizan una combinación de componentes Blade y sintaxis Markdown que le permiten construir fácilmente mensajes de correo al mismo tiempo que aprovechas los componentes prefabricados de Laravel:

```php
@component('mail::message')
# Order Shipped

Your order has been shipped!

@component('mail::button', ['url' => $url])
View Order
@endcomponent

Thanks,<br>
{{ config('app.name') }}
@endcomponent
```

::: tip
No uses una sangría excesiva al escribir correos electrónicos de Markdown. Los analizadores de Markdown renderizarán contenido sangrado como bloques de código.
:::

#### Componente Button

El componente de botón representa un enlace de botón centrado. El componente acepta dos argumentos, una `url` y un `color` opcional. Los colores compatibles son `primary`, `success` y `error`. Puedes agregar los botones que desees a un mensaje:

```php
@component('mail::button', ['url' => $url, 'color' => 'success'])
View Order
@endcomponent
```

#### Componente Panel

El componente del panel representa el bloque de texto dado en un panel que tiene un color de fondo ligeramente diferente que el resto del mensaje. Esto te permite llamar la atención sobre un bloque de texto dado:

```php
@component('mail::panel')
This is the panel content.
@endcomponent
```

#### Componente Table

El componente de tabla le permite transformar una tabla en Markdown a una tabla HTML. El componente acepta la tabla en Markdown como su contenido. La alineación de columna de tabla es compatible con la sintaxis de alineación de tabla de Markdown predeterminada:

```php
@component('mail::table')
| Laravel       | Table         | Example  |
| ------------- |:-------------:| --------:|
| Col 2 is      | Centered      | $10      |
| Col 3 is      | Right-Aligned | $20      |
@endcomponent
```

<a name="customizing-the-components"></a>
### Personalizar los Componentes

Puedes exportar todos los componentes de correo Markdown a su propia aplicación para personalización. Para exportar los componentes, use el comando `vendor:publish` y la opción del tag `laravel-mail` de esta forma:

```php
php artisan vendor:publish --tag=laravel-mail
```

Este comando publicará los componentes de correo Markdown en el directorio `resources/views/vendor/mail`. El directorio `mail` contendrá un directorio` html` y `text`, cada uno con sus respectivas representaciones de cada componente disponible. Eres libre de personalizar estos componentes como desees.

#### Personalizar el CSS

Después de exportar los componentes, el directorio `resources/views/vendor/mail/html/themes` contendrá un archivo `default.css`, puedes personalizar el CSS en este archivo y sus estilos se alinearán automáticamente en las representaciones HTML de sus mensajes de correo Markdown.

::: tip
Si deseas construir un tema completamente nuevo para los componentes Markdown, escribe un nuevo archivo CSS dentro del directorio `html/themes` y cambia la opción `theme` en tu archivo de configuración `mail`.
:::

<a name="sending-mail"></a>
## Enviar Correo

Para enviar un mensajes debes usar el método `to` en el [facade](/docs/{{version}}/facades) llamado `Mail`. El método `to` acepta una dirección de correo, una instancia de usuario o una colección de usuarios. Si pasas un objeto o una colección de objetos, el remitente utilizará automáticamente sus propiedades de "email" y "name" cuando configure los destinatarios del correo electrónico, por lo tanto, asegúrese de que estos atributos estén disponibles en sus objetos. Una vez que haya especificado sus destinatarios, puede pasar una instancia de su clase mailable al método `send`:

```php
<?php

namespace App\Http\Controllers;

use App\Order;
use App\Mail\OrderShipped;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Http\Controllers\Controller;

class OrderController extends Controller
{
    /**
    * Ship the given order.
    *
    * @param  Request  $request
    * @param  int  $orderId
    * @return Response
    */
    public function ship(Request $request, $orderId)
    {
        $order = Order::findOrFail($orderId);

        // Ship order...

        Mail::to($request->user())->send(new OrderShipped($order));
    }
}
```

No estás limitado a especificar los destinatarios "a" al enviar un mensaje. Eres libre de configurar los destinatarios "a", "cc" y "bcc", todo dentro de una única llamada a un método encadenado:

```php
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->send(new OrderShipped($order));
```

<a name="rendering-mailables"></a>
## Renderizar Mailables

Algunas veces puedes querer capturar el contenido HTML de un mailable sin enviarlo. Para lograr esto, puedes llamar al método `render` del mailable. Este método retornará los contenidos evaluados del mailable como una cadena:

```php
$invoice = App\Invoice::find(1);

return (new App\Mail\InvoicePaid($invoice))->render();
```

<a name="previewing-mailables-in-the-browser"></a>
### Previewing Mailables In The Browser

Al diseñar una plantilla mailable, es conveniente previsualizar rápidamente el mailable renderizado en tu navegador como una plantilla de Blade corriente. Por esta razón, Laravel te permite retornar cualquier mailable directamente desde un Closure de ruta o un controlador. Cuando un mailable es retornado, será renderizado y mostrado en el navegador, permitiéndote previsualizar su diseño sin necesidad de enviarlo a una dirección de correo electrónico real:

```php
Route::get('mailable', function () {
    $invoice = App\Invoice::find(1);

    return new App\Mail\InvoicePaid($invoice);
});
```

<a name="queueing-mail"></a>
### Correo en Cola

#### Poniendo en Cola un Correo Electronico

Con el envío de correos electrónicos puede alargar drásticamente el tiempo de respuesta de su aplicación, muchos desarrolladores eligen poner correos electrónicos en cola para el envío en segundo plano. Laravel lo hace fácil usando su función incorporada [API de cola unificada](/docs/{{version}}/queues). Para poner en cola un correo, use el método `queue` en el facade `Mail` después de especificar los destinatarios del mensaje:

```php
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->queue(new OrderShipped($order));
```

Este método se encargará automáticamente de insertar un trabajo en la cola para que el mensaje se envíe en segundo plano. Necesitarás [configurar tus colas](/docs/{{version}}/queues) antes de usar esta característica.

#### Cola de Mensajes Retrasada

Si deseas retrasar la entrega de un mensaje de correo electrónico en cola, puedes usar el método `later`. Como primer argumento, el método `later` acepta una instancia `DateTime` que indica cuándo se debe enviar el mensaje:

```php
$when = now()->addMinutes(10);

Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->later($when, new OrderShipped($order));
```

#### Enviar a Queues Específicas

Como todas las clases mailable generadas usando el comando `make:mail` usan el trait `Illuminate\Bus\Queueable` puedes llamar a los métodos `onQueue` y` onConnection` en cualquier instancia de clase mailable, lo que te permite especificar la conexión y nombre de cola para el mensaje:

```php
$message = (new OrderShipped($order))
                ->onConnection('sqs')
                ->onQueue('emails');

Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->queue($message);
```

#### En Cola Por Defecto

Si tienes clases mailables que deseas que siempre se pongan en cola, puedes implementar la interfaz `ShouldQueue` en la clase. Ahora, incluso si llamas al método `send` cuando envies correos el mailable se pondrá en cola ya que implementa la interfaz:

```php
use Illuminate\Contracts\Queue\ShouldQueue;

class OrderShipped extends Mailable implements ShouldQueue
{
    //
}
```

<a name="localizing-mailables"></a>
## Configuración Regional de Mailables

Laravel te permite enviar mailables en una configuración regional diferente al del idioma actual, e incluso recordará dicha configuración si el correo es agregado a una cola.

Para lograr esto, el facade `Mail` ofrece un método `locale` para establecer el idioma deseado. La aplicación cambiará a dicho configuración regional cuando el mailable sea formateado y luego volverá a la configuración anterior cuando el formato es completado:

```php
Mail::to($request->user())->locale('es')->send(
    new OrderShipped($order)
);
```

### Configuración Regional De Usuarios

Algunas veces, las aplicaciones almacenan la configuración regional preferida de cada usuario. Al implementar la interfaz `HasLocalePreference` en uno o más de tus modelos, puedes instruir a Laravel a usar dicha configuración almacenado al enviar correos electrónicos:

```php
use Illuminate\Contracts\Translation\HasLocalePreference;

class User extends Model implements HasLocalePreference
{
    /**
    * Get the user's preferred locale.
    *
    * @return string
    */
    public function preferredLocale()
    {
        return $this->locale;
    }
}
```

Una vez has implementado la interfaz, Laravel automáticamente usará la configuración regional preferida al enviar mailables y notificaciones al modelo. Por lo tanto, no hay necesidad de llamar al método `locale` al usar esta interfaz:

```php
Mail::to($request->user())->send(new OrderShipped($order));
```

<a name="mail-and-local-development"></a>
## Correos y Desarrollo Local

Al desarrollar una aplicación que envía correos electrónicos, probablemente no deseas enviar correos electrónicos a direcciones reales. Laravel proporciona varias formas de "desactivar" el envío real de correos electrónicos durante el desarrollo local.

#### Driver Log

En lugar de enviar sus correos electrónicos, el driver de correos `log` escribirá todos los mensajes de correo electrónico en tus archivos de logs para su inspección. Para obtener más información sobre cómo configurar su aplicación por entorno, revisa la [configuración en la documentación](/docs/{{version}}/configuration#environment-configuration).

#### Destinatario Universal

Otra solución proporcionada por Laravel es establecer un destinatario universal de todos los correos electrónicos enviados por el framework. De esta forma, todos los correos electrónicos generados por tu aplicación serán enviados a una dirección específica, en lugar de la dirección realmente especificada al enviar el mensaje. Esto se puede hacer a través de la opción `to` en tu archivo de configuración `config/mail.php`:

```php
'to' => [
    'address' => 'example@example.com',
    'name' => 'Example'
],
```

#### Mailtrap

Finalmente, puedes usar un servicio como [Mailtrap](https://mailtrap.io) y el driver `smtp` para enviar sus mensajes de correo electrónico a un buzón 'ficticio' donde puedes verlos en un verdadero cliente de correo electrónico. Este enfoque tiene el beneficio de permitirle inspeccionar realmente los correos electrónicos finales en el visor de mensajes de Mailtrap.

<a name="events"></a>
## Eventos

Laravel dispara dos eventos durante el proceso de envío de mensajes de correo. El evento `MessageSending` se dispara antes de que se envíe un mensaje, mientras que el evento` MessageSent` se dispara después de que se ha enviado un mensaje. Recuerda, estos eventos se disparan cuando el correo *se envía*, no cuando se pone en cola. Puedes registrar un detector de eventos para este evento en tu `EventServiceProvider`:

```php
/**
* The event listener mappings for the application.
*
* @var array
*/
protected $listen = [
    'Illuminate\Mail\Events\MessageSending' => [
        'App\Listeners\LogSendingMessage',
    ],
    'Illuminate\Mail\Events\MessageSent' => [
        'App\Listeners\LogSentMessage',
    ],
];
```