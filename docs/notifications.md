::: v-pre

# Notificaciones

- [Introducción](#introduction)
- [Crear notificaciones](#creating-notifications)
- [Enviar notificaciones](#sending-notifications)
    - [Utilizar el atributo notifiable](#using-the-notifiable-trait)
    - [Utilizar la facade notification](#using-the-notification-facade)
    - [Especificar canales de entrega](#specifying-delivery-channels)
    - [Notificaciones en cola](#queueing-notifications)
    - [Notificaciones bajo demanda](#on-demand-notifications)
- [Notificaciones por correo](#mail-notifications)
    - [Formato para mensajes por correo](#formatting-mail-messages)
    - [Personalizar el remitente](#customizing-the-sender)
    - [Personalizar el destinatario](#customizing-the-recipient)
    - [Personalizar el asunto](#customizing-the-subject)
    - [Personalizar las plantillas](#customizing-the-templates)
    - [Previsualizar notificaciones de correo](#previewing-mail-notifications)
- [Notificaciones por correo en markdown](#markdown-mail-notifications)
    - [Generar el mensaje](#generating-the-message)
    - [Escribir el mensaje](#writing-the-message)
    - [Personalizar los componentes](#customizing-the-components)
- [Notificaciones de la base de datos](#database-notifications)
    - [Prerrequisitos](#database-prerequisites)
    - [Formato de notificaciones de base de datos](#formatting-database-notifications)
    - [Acceder a las notificaciones](#accessing-the-notifications)
    - [Marcar notificaciones como leídas](#marking-notifications-as-read)
- [Notificaciones de difusión](#broadcast-notifications)
    - [Prerrequisitos](#broadcast-prerequisites)
    - [Formato de notificaciones de difusión](#formatting-broadcast-notifications)
    - [Escuchar notificaciones](#listening-for-notifications)
- [Notificaciones por SMS](#sms-notifications)
    - [Prerrequisitos](#sms-prerequisites)
    - [Formato de Notificaciones por SMS](#formatting-sms-notifications)
    - [Formato de Notificaciones por Shortcode](#formatting-shortcode-notifications)
    - [Personalizar el número remitente](#customizing-the-from-number)
    - [Enrutar notificaciones por SMS](#routing-sms-notifications)
- [Notificaciones por Slack](#slack-notifications)
    - [Prerrequisitos](#slack-prerequisites)
    - [Formato de notificaciones por Slack](#formatting-slack-notifications)
    - [Archivos adjuntos en Slack](#slack-attachments)
    - [Enrutar notificaciones por Slack](#routing-slack-notifications)
- [Configuración regional de notificaciones](#localizing-notifications)
- [Eventos de notificación](#notification-events)
- [Canales personalizados](#custom-channels)

<a name="introduction"></a>
## Introducción

Además de soporte para [enviar correos electrónicos](/mail.html), Laravel brinda soporte para el envío de notificaciones mediante una variedad de canales de entrega, incluyendo correo, SMS (a través de [Nexmo](https://www.nexmo.com/)) y [Slack](https://slack.com). Las notificaciones pueden ser también almacenadas en una base de datos para que puedan ser mostradas en la interfaz de tu página web.

Generalmente, las notificaciones deben ser mensajes cortos e informativos que notifiquen a los usuarios que algo ocurrió en tu aplicación. Por ejemplo, si estás escribiendo una aplicación de facturación, podrías enviar una notificación de "Recibo de Pago" a tus usuarios mediante correo electrónico y por SMS.

<a name="creating-notifications"></a>
## Crear notificaciones

En Laravel, cada notificación está representada por una sola clase (generalmente almacenada en el directorio `app/Notifications`). No te preocupes si no ves este directorio en tu aplicación, será creada por ti cuando ejecutes el comando Artisan `make:notification`:

```php
php artisan make:notification InvoicePaid
```

Este comando colocará una clase de notificación nueva en tu directorio `app/Notifications`. Cada clase de notificación contiene un método `via` y un número variable de métodos de construcción de mensaje (tales como `toMail` o `toDatabase`) que convierten la notificación en un mensaje optimizado para ese canal en particular.

<a name="sending-notifications"></a>
## Enviar notificaciones

<a name="using-the-notifiable-trait"></a>
### Usar el atributo notifiable

Las notificaciones pueden ser enviadas en dos formas: usando el método `notify` del atributo `Notifiable` o usando `Notification` [facade](/facades.html). Primero, exploremos el uso del atributo:

```php
<?php

namespace App;

use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use Notifiable;
}
```

Este atributo es utilizado por el modelo `App\User` por defecto y contiene un método que puede ser usado para enviar notificaciones: `notify`. El método `notify` espera recibir una instancia de notificación:

```php
use App\Notifications\InvoicePaid;

$user->notify(new InvoicePaid($invoice));
```

::: tip TIP
Recuerda que puedes usar el atributo `Illuminate\Notifications\Notifiable` en cualquiera de tus modelos. No estás limitado a incluirlo solamente en tu modelo `User`.
:::

<a name="using-the-notification-facade"></a>
### Usar la facade notification

Alternativamente, puedes enviar notificaciones mediante la [facade](/facades.html) `Notification`. Esto es útil principalmente cuando necesitas enviar una notificación a múltiples entidades notificables, como un grupo de usuarios. Para enviar notificaciones usando la facade, pasa todas las entidades notificables y la instancia de notificación al método `send`:

```php
Notification::send($users, new InvoicePaid($invoice));
```

<a name="specifying-delivery-channels"></a>
### Especificar canales de entrega

Cada clase de notificación tiene un método `via` que determina mediante cuáles canales será entregada la notificación. Las notificaciones pueden ser enviadas por los canales  `mail`, `database`, `broadcast`, `nexmo`, y `slack`.

::: tip TIP
Si estás interesado en utilizar otros canales de entrega como Telegram o Pusher, revisa el sitio dirigido por la comunidad [Laravel Notification Channels](http://laravel-notification-channels.com).
:::

El método `via` recibe una instancia `$notifiable` la cual será una instancia de la clase a la cual la notificación está siendo enviada. Puedes usar `$notifiable` para determinar mediante cuáles canales debería ser entregada la notificación:

```php
/**
* Get the notification's delivery channels.
*
* @param  mixed  $notifiable
* @return array
*/
public function via($notifiable)
{
    return $notifiable->prefers_sms ? ['nexmo'] : ['mail', 'database'];
}
```

<a name="queueing-notifications"></a>
### Notificaciones en cola

::: danger Nota
Antes de poner notificaciones en cola, se debe configurar una cola y [activar un worker](/queues.html).
:::

Enviar notificaciones puede tomar tiempo, especialmente si el canal necesita una API externa para llamar o entregar la notificación. Para acelerar el tiempo de respuesta de tu notificación, permite que sea puesta en cola añadiendo la interfaz `ShouldQueue` y el atributo `Queueable` a tu clase. La interfaz y el atributo son importados para todas las notificaciones generadas usando `make:notification`, así que puedesn añadir de inmediato a tu clase de notificación:

```php
<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class InvoicePaid extends Notification implements ShouldQueue
{
    use Queueable;

    // ...
}
```

Una vez que la interfaz `ShouldQueue` haya sido agregada a tu notificación, puedes enviarla con normalidad. Laravel detectará `ShouldQueue` en la clase y automáticamente pondrá en cola la entrega de la notificación:

```php
$user->notify(new InvoicePaid($invoice));
```

Si quisieras retrasar la entrega de la notificación, puedes encadenar el método `delay` al instanciar tu notificación:

```php
$when = now()->addMinutes(10);

$user->notify((new InvoicePaid($invoice))->delay($when));
```

<a name="on-demand-notifications"></a>
### Notificaciones bajo demanda

A veces puede que necesites enviar una notificación a alguien que no está almacenado como "usuario" de tu aplicación. Usando el método `Notification::route`, puedes especificar información de enrutamiento para una notificación ad-hoc antes de enviarla:

```php
Notification::route('mail', 'taylor@example.com')
            ->route('nexmo', '5555555555')
            ->notify(new InvoicePaid($invoice));
```

<a name="mail-notifications"></a>
## Notificaciones por correo

<a name="formatting-mail-messages"></a>
### Formato de mensajes por correo

Si una notificación tiene soporte para ser enviada por correo, se debe definir un método `toMail` en la clase de la notificación. Este método recibirá una entidad `$notifiable` y debe devolver una instancia `Illuminate\Notifications\Messages\MailMessage`. Los mensajes por correo pueden contener líneas de texto, así como una "llamada a la acción". Observemos un método `toMail` de ejemplo:

```php
/**
* Get the mail representation of the notification.
*
* @param  mixed  $notifiable
* @return \Illuminate\Notifications\Messages\MailMessage
*/
public function toMail($notifiable)
{
    $url = url('/invoice/'.$this->invoice->id);

    return (new MailMessage)
                ->greeting('Hello!')
                ->line('One of your invoices has been paid!')
                ->action('View Invoice', $url)
                ->line('Thank you for using our application!');
}
```

::: tip TIP
Nota que se está usando el método `$this->invoice->id` en el método `toMail`. Puedes pasar cualquier dato que la notificación necesite para generar su mensaje dentro del constructor de la notificación.
:::

En este ejemplo, registramos un saludo, una línea de texto, un llamado a la acción y luego otra línea de texto. Estos elementos proporcionados por el objeto `MailMessage` hacen que sea rápido y sencillo dar formato a pequeños correos transaccionales. El canal de correo entonces traducirá los componentes del mensaje en una plantilla HTML agradable y con capacidad de respuesta, justo con su contraparte de texto simple. He aquí un ejemplo de un correo generado por el canal `mail`:

<img src="https://laravel.com/assets/img/notification-example.png" width="551" height="596">

::: tip TIP
Al enviar notificaciones por correo, asegúrate de establecer el valor `name` en tu archivo `config/app.php`. Este valor será usado en el encabezado y pie de los mensajes de notificación por correo.
:::

#### Otras opciones de formato para notificaciones

En lugar de definir las "líneas" de texto en la clase notification, puedes usar el método `view` para especificar una plantilla personalizada que debe ser usada para renderizar el correo de notificación:

```php
/**
* Get the mail representation of the notification.
*
* @param  mixed  $notifiable
* @return \Illuminate\Notifications\Messages\MailMessage
*/
public function toMail($notifiable)
{
    return (new MailMessage)->view(
        'emails.name', ['invoice' => $this->invoice]
    );
}
```

Además, puedes devolver un [objeto mailable](/mail.html) desde el método `toMail`:

```php
use App\Mail\InvoicePaid as Mailable;

/**
* Get the mail representation of the notification.
*
* @param  mixed  $notifiable
* @return Mailable
*/
public function toMail($notifiable)
{
    return (new Mailable($this->invoice))->to($this->user->email);
}
```

<a name="error-messages"></a>
#### Mensajes de error

Algunas notificaciones informan a los usuarios acerca de errores, como un pago fallido. puedes indicar que un mensaje por correo se refiere a un error llamando al método `error` cuando se construye el mensaje. Al usar el método `error` en un mensaje por correo, el botón de llamado a la acción será rojo en vez de azul:

```php
/**
* Get the mail representation of the notification.
*
* @param  mixed  $notifiable
* @return \Illuminate\Notifications\Message
*/
public function toMail($notifiable)
{
    return (new MailMessage)
                ->error()
                ->subject('Notification Subject')
                ->line('...');
}
```

<a name="customizing-the-sender"></a>
### Personalizar el remitente

Por defecto, el remitente del correo electrónico es definido en el archivo `config/mail.php`. Sin embargo, también puedes definir un remitente a través de una notificación específica:

```php
/**
* Get the mail representation of the notification.
*
* @param  mixed  $notifiable
* @return \Illuminate\Notifications\Messages\MailMessage
*/
public function toMail($notifiable)
{
    return (new MailMessage)
                ->from('noreply@laravel.com', 'Laravel')
                ->line('...');
}
```

<a name="customizing-the-recipient"></a>
### Personalizar el destinatario

Al enviar notificaciones mediante el canal `mail`, el sistema de notificaciones automáticamente buscará una propiedad `email` en tu entidad notificable. Puedes personalizar la dirección de correo electrónico usada para entregar la notificación definiendo el método `routeNotificationForMail` en la entidad:

```php
<?php

namespace App;

use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use Notifiable;

    /**
    * Route notifications for the mail channel.
    *
    * @param  \Illuminate\Notifications\Notification  $notification
    * @return string
    */
    public function routeNotificationForMail($notification)
    {
        return $this->email_address;
    }
}
```

<a name="customizing-the-subject"></a>
### Personalizar el asunto

Por defecto, el asunto del correo electrónico es el nombre de la clase de notificación formateada a "title case". Así que si tu clase de notificación se llama `InvoicePaid`, el asunto del correo será `Invoice Paid`. Si se prefiere especificar un asunto explícito para el mensaje, puedes llamar al método `subject` al construir el mensaje:

```php
/**
* Get the mail representation of the notification.
*
* @param  mixed  $notifiable
* @return \Illuminate\Notifications\Messages\MailMessage
*/
public function toMail($notifiable)
{
    return (new MailMessage)
                ->subject('Notification Subject')
                ->line('...');
}
```

<a name="customizing-the-templates"></a>
### Personalizar las plantillas

Puedes modificar las plantillas HTML y de texto simple usadas por las notificaciones de correo publicando los recursos del paquete de notificación. Luego de ejecutar este comando, las plantillas de notificación de correo estarán ubicadas en el directorio `resources/views/vendor/notifications`:

```php
php artisan vendor:publish --tag=laravel-notifications
```

<a name="previewing-mail-notifications"></a>
### Previsualizar notificaciones de correo

Al diseñar una plantilla de notificación de correo, es conveniente previsualizar rápidamente el mensaje de correo renderizado en tu navegador como una plantilla normal de Blade. Por esta razón, Laravel te permite retornar cualquier mensaje de correo generado por una notificación de correo directamente desde un Closure de ruta o un controlador. Cuando un `MailMessage` es retornado, este será renderizado y mostrado en el navegador, permitiendote previsualizar rápidamente su diseño sin necesidad de enviarlo a un correo electrónico real:

```php
Route::get('mail', function () {
    $invoice = App\Invoice::find(1);
    return (new App\Notifications\InvoicePaid($invoice))
                ->toMail($invoice->user);
});
```

<a name="markdown-mail-notifications"></a>
## Notificaciones por correo markdown

Las notificaciones por correo Markdown permiten tomar ventaja de las plantillas prefabricadas para notificaciones por correo, dando a su vez libertad para escribir mensajes más largos y personalizados. Como los mensajes están escritos en Markdown, Laravel puede renderizar plantillas HTML bellas y responsivas para los mensajes y a la vez generar automáticamente su contraparte en texto simple.

<a name="generating-the-message"></a>
### Generar el mensaje

Para generar una notificación con su plantilla Markdown correspondiente, puedes usar la opción `--markdown` del comando Artisan `make:notification`:

```php
php artisan make:notification InvoicePaid --markdown=mail.invoice.paid
```

Como todas las otras notificaciones, aquellas que usan plantillas Markdown deben definir un método `toMail` en su clase de notificación. Sin embargo, en lugar de usar los modelos `line` y `action` para construir la notificación, se usa el método `markdown` para especificar el nombre de la plantilla Markdown a ser usada:

```php
/**
* Get the mail representation of the notification.
*
* @param  mixed  $notifiable
* @return \Illuminate\Notifications\Messages\MailMessage
*/
public function toMail($notifiable)
{
    $url = url('/invoice/'.$this->invoice->id);

    return (new MailMessage)
                ->subject('Invoice Paid')
                ->markdown('mail.invoice.paid', ['url' => $url]);
}
```

<a name="writing-the-message"></a>
### Escribir el mensaje

Las notificaciones por correo Markdown usan una combinación de componentes Blade y sintaxis Markdown que te permiten construir fácilmente notificaciones a la vez que se apalancan los componentes de notificación prefabricados por Laravel:

```php
@component('mail::message')
# Invoice Paid

Your invoice has been paid!

@component('mail::button', ['url' => $url])
View Invoice
@endcomponent

Thanks,<br>
{{ config('app.name') }}
@endcomponent
```

#### Componente button

El componente button renderiza un enlace a un botón centrado. El componente acepta dos argumentos, una `url` y un `color` opcional. LOs colores disponibles son `blue`, `green`, y `red`. Puedes añadir tantos componentes de botón a una notificación como desees:

```php
@component('mail::button', ['url' => $url, 'color' => 'green'])
View Invoice
@endcomponent
```

#### Componente panel

El componente panel renderiza el bloque de texto dado en un panel que tiene un color de fondo ligeramente distinto al resto de la notificación. Esto permite poner énfasis en un determinado bloque de texto:

```php
@component('mail::panel')
This is the panel content.
@endcomponent
```

#### Componente table

El componente table permite transformar una tabla Markdown en una tabla HTML. El componente acepta la tabla Markdown como contenido. La alineación de columnas es soportada usando la sintaxis de alineación de tablas de Markdown por defecto:

```php
@component('mail::table')
| Laravel       | Table         | Example  |
| ------------- |:-------------:| --------:|
| Col 2 is      | Centered      | $10      |
| Col 3 is      | Right-Aligned | $20      |
@endcomponent
```

<a name="customizing-the-components"></a>
### Personalizar los componentes

Puedes exportar todos los componentes de notificación de Markdown a tu propia aplicación para personalización. Para exportar los componentes, se usa el comando Artisan `vendor:publish` para publicar la etiqueta del asset `laravel-mail`:

```php
php artisan vendor:publish --tag=laravel-mail
```

Este comando publicará los componentes de correo de Markdown al directorio `resources/views/vendor/mail`. El directorio `mail` contendrá los directorios `html` y `text`, cada uno contiene sus respectivas representaciones de cada componente disponible. Eres libre de personalizar estos componentes de acuerdo a su preferencia.

### Personalizar CSS

Después de exportar los componentes, el directorio `resources/views/vendor/mail/html/themes` contendrá un archivo `default.css`. Puedes personalizar el CSS en este archivo y los estilos automáticamente se alinearán con las representaciones HTML de las notificaciones Markdown.

Si te gustaría construir un nuevo tema para los componentes Markdown de Laravel, puedes colocar un archivo CSS dentro del directorio `html/themes`. Luego de nombrar y guardar tus archivos de CSS, actualiza la opción `theme` del archivo de configuración `mail` para que coincida con el nombre de tu nuevo tema.

Para personalizar un tema para una notificación individual, puedes llamar al método `theme` al momento de construir el mensaje de la notificación. El método `theme` acepta el nombre del tema que debería ser usado al momento de enviar la notificación:

```php
/**
* Get the mail representation of the notification.
*
* @param  mixed  $notifiable
* @return \Illuminate\Notifications\Messages\MailMessage
*/

public function toMail($notifiable)
{
    return (new MailMessage)
                ->theme('invoices')
                ->theme('invoice')
                ->subject('Invoice Paid')
                ->markdown('mail.invoice.paid', ['url' => $url]);
}
```

<a name="database-notifications"></a>
## Notificaciones de base de datos

<a name="database-prerequisites"></a>
### Prerrequisitos

El canal de notificaciones `database` guarda la información de notificación en una tabla de base de datos. Esta tabla contendrá información como el tipo de notificación así como datos JSON personalizados que describen la notificación.

Puedes buscar en la tabla para mostrar las notificaciones en la interfaz de usuario de la aplicación. Pero, antes de poder hacer esto, necesitarás crear una tabla de base de datos para almacenar las notificaciones. Puedes usar el comando `notifications:table` para generar una migración con el esquema de tabla apropiado:

```php
php artisan notifications:table

php artisan migrate
```

<a name="formatting-database-notifications"></a>
### Agregar formato a las notificaciones de la base de datos

Si una notificación posee soporte para ser almacenada en una tabla de base de datos, debes definir un método `toDatabase` o `toArray` en la clase de notificación. Este método recibirá una entidad `$notifiable` y debería devolver un arreglo PHP sencillo. El arreglo devuelto estará codificado como JSON y almacenado en la columna `data`de la tabla `notifications`. Observemos un ejemplo del método `toArray`:

```php
/**
* Get the array representation of the notification.
*
* @param  mixed  $notifiable
* @return array
*/
public function toArray($notifiable)
{
    return [
        'invoice_id' => $this->invoice->id,
        'amount' => $this->invoice->amount,
    ];
}
```

#### `toDatabase` Vs. `toArray`

El método `toArray` también es usado por el canal `broadcast` para determinar cuáles datos difundir al cliente JavaScript. Si prefieres tener dos representaciones de arreglos para los canales `database` y `broadcast`, debes definir un método `toDatabase` en lugar de `toArray`.

<a name="accessing-the-notifications"></a>
### Acceder a las notificaciones

Una vez que las notificaciones se almacenan en la base de datos, necesitas una forma conveniente de acceder a ellas desde tus entidades notificables. El atributo `Illuminate\Notifications\Notifiable`, el cual está incluido en el modelo de Laravel `App\User` por defecto, incluye una relación Eloquent `notifications` que devuelve las notificaciones para la entidad. Para conseguir las notificaciones, puedes acceder a este método como a cualquier otra relación Eloquent. Por defecto, las notificaciones serán clasificadas por el timestamp `created_at`:

```php
$user = App\User::find(1);

foreach ($user->notifications as $notification) {
    echo $notification->type;
}
```

Si quieres recibir sólo las notificaciones "no leídas (unread)", puedes usar la relación `unreadNotifications`. Nuevamente, las notificaciones serán clasificadas por el timestamp `created_at`:

```php
$user = App\User::find(1);

foreach ($user->unreadNotifications as $notification) {
    echo $notification->type;
}
```

::: tip TIP
Para acceder a las notificaciones desde el cliente JavaScript, se debe definir un controlador de notificaciones para tu aplicación que devuelva las notificaciones para una entidad notificable, como el usuario actual. puedes entonces elaborar una petición HTTP al URI de ese controlador desde el cliente JavaScript.
:::

<a name="marking-notifications-as-read"></a>
### Marcar notificaciones como leídas

Normalmente, querrás marcar una notificación como "leída (read)" cuando un usuario la ve. El atributo `Illuminate\Notifications\Notifiable` provee un método `markAsRead` el cual actualiza la columna `read_at` en el registro de base de datos de las notificaciones:

```php
$user = App\User::find(1);

foreach ($user->unreadNotifications as $notification) {
    $notification->markAsRead();
}
```

Sin embargo, en lugar de hacer bucle a través de cada notificación, puedes usar el método `markAsRead` directamente en un grupo de notificaciones:

```php
$user->unreadNotifications->markAsRead();
```

Asimismo, puedes utilizar una consulta de actualización masiva para marcar todas las notificaciones como leídas sin necesidad de recuperarlas de la base de datos:

```php
$user = App\User::find(1);

$user->unreadNotifications()->update(['read_at' => now()]);
```

Puedes hacer `delete` a las notificaciones para removerlas por completo de la tabla:

```php
$user->notifications()->delete();
```

<a name="broadcast-notifications"></a>
## Notificaciones de difusión

<a name="broadcast-prerequisites"></a>
### Prerrequisitos

Antes de difundir notificaciones, debes configurar y familiarizarse con los servicios [broadcasting de eventos](/broadcasting.html) de Laravel. La difusión de eventos brinda una forma de reaccionar a los eventos de Laravel disparados por el servidor, desde el cliente JavaScript.

<a name="formatting-broadcast-notifications"></a>
### Formato de notificaciones de difusión

EL canal `broadcast` difunde notificaciones usando los servicios [broadcasting de eventos](/broadcasting.html) de Laravel, permitiéndole al cliente JavaScript capturar notificaciones en tiempo real. Si una notificación posee soporte para difusión, debes definir un método `toBroadcast` en la clase de notificación. Este método recibirá una entidad `$notifiable` y debe devolver una instancia `BroadcastMessage`. Si el método `toBroadcast` no existe, el método `toArray` será usado para recopilar los datos que deberían ser transmitidos. Los datos devueltos estarán codificados como JSON y se difundirán al cliente JavaScript. Observemos un ejemplo del método `toBroadcast`:

```php
use Illuminate\Notifications\Messages\BroadcastMessage;

/**
* Get the broadcastable representation of the notification.
*
* @param  mixed  $notifiable
* @return BroadcastMessage
*/
public function toBroadcast($notifiable)
{
    return new BroadcastMessage([
        'invoice_id' => $this->invoice->id,
        'amount' => $this->invoice->amount,
    ]);
}
```

#### Configuración de la cola de difusión

Todas las notificaciones de difusión son puestas en cola para ser difundidas. Si prefieres configurar la conexión a la cola o el nombre de la cola usada para las operaciones de difusión, puedes usar los métodos `onConnection` y `onQueue` de `BroadcastMessage`:

```php
return (new BroadcastMessage($data))
                ->onConnection('sqs')
                ->onQueue('broadcasts');
```

::: tip TIP
Adicional a los datos especificados, las notificaciones de difusión contendrán también un campo `type` que contiene el nombre de clase de la notificación.
:::

<a name="listening-for-notifications"></a>
### Escuchar notificaciones

Las notificaciones se difundirán en un canal privado formateado utilizando la convención `{notifiable}.{id}`. Por lo tanto, si estás enviando una notificación a una instancia `App\User` con una ID de `1`, la notificación será difundida en el canal privado `App.User.1`. Al usar [Laravel Echo](/broadcasting.html), puedes fácilmente escuchar notificaciones en un canal utilizando el método helper `notification`:

```php
Echo.private('App.User.' + userId)
    .notification((notification) => {
        console.log(notification.type);
    });
```

#### Personalizar el canal de notificación

Si quieres personalizar los canales mediante los cuales una entidad notificable recibe sus notificaciones de difusión, puedes definir un método `receivesBroadcastNotificationsOn` en la entidad notificable:

```php
<?php

namespace App;

use Illuminate\Notifications\Notifiable;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use Notifiable;

    /**
    * The channels the user receives notification broadcasts on.
    *
    * @return string
    */
    public function receivesBroadcastNotificationsOn()
    {
        return 'users.'.$this->id;
    }
}
```

<a name="sms-notifications"></a>
## Notificaciones por SMS

<a name="sms-prerequisites"></a>
### Prerrequisitos

El envío de notificaciones por SMS en Laravel trabaja con [Nexmo](https://www.nexmo.com/). Antes de poder enviar notificaciones mediante Nexmo, necesitas instalar el paquete Composer `laravel/nexmo-notification-channel`:

```php
composer require laravel/nexmo-notification-channel
```

Luego, necesitas agregar algunas opciones de configuración al archivo `config/services.php`. Puedes copiar el ejemplo de configuración siguiente para empezar:

```php
'nexmo' => [
    'key' => env('NEXMO_KEY'),
    'secret' => env('NEXMO_SECRET'),
    'sms_from' => '15556666666',
],
```

La opción `sms_from` es el número de teléfono remitente de los mensajes SMS. Se debe generar un número de teléfono para la aplicación en el panel de control de Nexmo.

<a name="formatting-sms-notifications"></a>
### Formato de notificaciones de SMS

Si una notificación tiene soporte para ser enviada mediante SMS, debes definir un método `toNexmo` en la clase de notificación. Este método recibirá una entidad `$notifiable` y debe devolver una instancia `Illuminate\Notifications\Messages\NexmoMessage`:

```php
/**
* Get the Nexmo / SMS representation of the notification.
*
* @param  mixed  $notifiable
* @return NexmoMessage
*/
public function toNexmo($notifiable)
{
    return (new NexmoMessage)
                ->content('Your SMS message content');
}
```

<a name="formatting-shortcode-notifications"></a>
### Formato de Notificaciones de Shortcode

Laravel también admite el envío de notificaciones de código corto que son plantillas predefinidas en tu cuenta de Nexmo. Puedes indicar el tipo de notificación (`alert`, `2fa` o `marketing`), así como los valores personalizados que llenarán la plantilla: 

```php
/**
 * Get the Nexmo / Shortcode representation of the notification.
 *
 * @param  mixed  $notifiable
 * @return array
 */
public function toShortcode($notifiable)
{
    return [
        'type' => 'alert',
        'custom' => [
            'code' => 'ABC123',
        ];
    ];
}
```

::: tip TIP
Tal como en [Enrutar notificaciones por SMS](#routing-sms-notifications), deberías implementar el método `routeNotificationForShortcode` en tu modelo notifiable.
:::

#### Contenido unicode

Si el mensaje SMS contiene caracteres Unicode, debes llamar al método `unicode` al construir la instancia `NexmoMessage`:

```php
/**
* Get the Nexmo / SMS representation of the notification.
*
* @param  mixed  $notifiable
* @return NexmoMessage
*/
public function toNexmo($notifiable)
{
    return (new NexmoMessage)
                ->content('Your unicode message')
                ->unicode();
}
```

<a name="customizing-the-from-number"></a>
### Personalizando el número remitente

Si deseas enviar algunas notificaciones desde un número telefónico diferente al especificado en el archivo `config/services.php`, puedes usar el método `from` en una instancia `NexmoMessage`:

```php
/**
* Get the Nexmo / SMS representation of the notification.
*
* @param  mixed  $notifiable
* @return NexmoMessage
*/
public function toNexmo($notifiable)
{
    return (new NexmoMessage)
                ->content('Your SMS message content')
                ->from('15554443333');
}
```

<a name="routing-sms-notifications"></a>
### Enrutar notificaciones por SMS

Al enviar notificaciones a través del canal `nexmo`, el sistema de notificaciones buscará automáticamente por un atributo `phone_number` en la entidad notificable. Si deseas personalizar el número telefónico al cual la notificación será entregada, define un método `routeNotificationForNexmo` en la entidad:

```php
<?php

namespace App;

use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use Notifiable;

    /**
    * Route notifications for the Nexmo channel.
    *
    * @param  \Illuminate\Notifications\Notification  $notification
    * @return string
    */
    public function routeNotificationForNexmo($notification)
    {
        return $this->phone;
    }
}
```

<a name="slack-notifications"></a>
## Notificaciones por Slack

<a name="slack-prerequisites"></a>
### Prerrequisitos

Antes de poder enviar notificaciones mediante Slack, debes instalar el paquete para el canal de notificación mediante Composer:

```php
composer require laravel/slack-notification-channel
```

También necesitarás configurar una integración ["Incoming Webhook"](https://api.slack.com/incoming-webhooks) para tu equipo en Slack. Esta integración proveerá una URL utilizable para [enrutamiento de notificaciones de Slack](#routing-slack-notifications).

<a name="formatting-slack-notifications"></a>
### Formato de notificaciones por Slack

Si una notificación tiene soporte para ser enviada como mensaje por Slack, debes definir un método `toSlack` en la clase de notificación. EL método recibirá una entidad `$notifiable` y debe devolver una instancia `Illuminate\Notifications\Messages\SlackMessage`. Los mensajes de Slack pueden contener texto así como un "archivo adjunto" que formatea texto adicional o un arreglo de campos. Observemos un ejemplo básico de `toSlack`:

```php
/**
* Get the Slack representation of the notification.
*
* @param  mixed  $notifiable
* @return SlackMessage
*/
public function toSlack($notifiable)
{
    return (new SlackMessage)
                ->content('One of your invoices has been paid!');
}
```

En este ejemplo estamos solamente enviando una línea de texto a Slack, la cual creará un mensaje que luce como éste:

<img src="https://laravel.com/assets/img/basic-slack-notification.png">

#### Personalizar el remitente y destinatario

Puedes usar los métodos `from` y `to` para personalizar el remitente y el destinatario. El método `from` acepta un nombre de usuario y un identificador emoji, mientras que el método `to` acepta un canal y un usuario:

```php
/**
* Get the Slack representation of the notification.
*
* @param  mixed  $notifiable
* @return SlackMessage
*/
public function toSlack($notifiable)
{
    return (new SlackMessage)
                ->from('Ghost', ':ghost:')
                ->to('#other')
                ->content('This will be sent to #other');
}
```

También puedes utilizar una imagen como logo en vez de un emoji:

```php
/**
* Get the Slack representation of the notification.
*
* @param  mixed  $notifiable
* @return SlackMessage
*/
public function toSlack($notifiable)
{
    return (new SlackMessage)
                ->from('Laravel')
                ->image('https://laravel.com/favicon.png')
                ->content('This will display the Laravel logo next to the message');
}
```

<a name="slack-attachments"></a>
### Archivos adjuntos en Slack

También puedes añadir "adjuntos" a los mensajes en Slack. Éstos brindan opciones de formato más amplias que mensajes de texto simple. En este ejemplo, enviaremos una notificación de error acerca de una excepción que ocurrió en una aplicación, incluyendo un enlace para ver más detalles sobre la excepción:

```php
/**
* Get the Slack representation of the notification.
*
* @param  mixed  $notifiable
* @return SlackMessage
*/
public function toSlack($notifiable)
{
    $url = url('/exceptions/'.$this->exception->id);

    return (new SlackMessage)
                ->error()
                ->content('Whoops! Something went wrong.')
                ->attachment(function ($attachment) use ($url) {
                    $attachment->title('Exception: File Not Found', $url)
                                ->content('File [background.jpg] was not found.');
                });
}
```

El ejemplo anterior generará un mensaje en Slack como el siguiente:

<img src="https://laravel.com/assets/img/basic-slack-attachment.png">

Los adjuntos te permitirán especificar un arreglo de datos que deben ser presentados al usuario. Los datos dados serán presentados en forma de tabla para su fácil lectura:

```php
/**
* Get the Slack representation of the notification.
*
* @param  mixed  $notifiable
* @return SlackMessage
*/
public function toSlack($notifiable)
{
    $url = url('/invoices/'.$this->invoice->id);

    return (new SlackMessage)
                ->success()
                ->content('One of your invoices has been paid!')
                ->attachment(function ($attachment) use ($url) {
                    $attachment->title('Invoice 1322', $url)
                                ->fields([
                                    'Title' => 'Server Expenses',
                                    'Amount' => '$1,234',
                                    'Via' => 'American Express',
                                    'Was Overdue' => ':-1:',
                                ]);
                });
}
```

El ejemplo anterior generará un mensaje en Slack como el siguiente:

<img src="https://laravel.com/assets/img/slack-fields-attachment.png">

#### Contenido adjunto en markdown

Si algunos de tus campos adjuntos contienen Markdown, puedes usar el método `markdown` para instruir a Slack procesar y mostrar los campos proporcionados como texto formateado en Markdown. Los valores aceptados por este método son: `pretext`, `text`, y / o `fields`. Para más información sobre formato de adjuntos de Slack, revisa la [documentación del API de Slack](https://api.slack.com/docs/message-formatting#message_formatting):

```php
/**
* Get the Slack representation of the notification.
*
* @param  mixed  $notifiable
* @return SlackMessage
*/
public function toSlack($notifiable)
{
    $url = url('/exceptions/'.$this->exception->id);

    return (new SlackMessage)
                ->error()
                ->content('Whoops! Something went wrong.')
                ->attachment(function ($attachment) use ($url) {
                    $attachment->title('Exception: File Not Found', $url)
                                ->content('File [background.jpg] was *not found*.')
                                ->markdown(['text']);
                });
}
```

<a name="routing-slack-notifications"></a>
### Enrutar notificaciones de slack

Para enrutar notificaciones de Slack a la ubicación apropiada, debes definir un método `routeNotificationForSlack` en tu entidad notificable. Esto debería devolver un webhook URL al cual debe ser entregada la notificación. Las Webhook URLs puedn ser generadas añadiendo un servicio "Incoming Webhook" a tu equipo Slack:

```php
<?php

namespace App;

use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use Notifiable;

    /**
    * Route notifications for the Slack channel.
    *
    * @param  \Illuminate\Notifications\Notification  $notification
    * @return string
    */
    public function routeNotificationForSlack($notification)
    {
        return 'https://hooks.slack.com/services/...';
    }
}
```

<a name="localizing-notifications"></a>
## Configuración regional de notificaciones

Laravel te permite enviar notificaciones en una configuración regional distinta al idioma actual e incluso recordará esta configuración si la notificación está encolada.

Para lograr esto, la clase `Illuminate\Notifications\Notification` ofrece un método `locale` para establecer el idioma deseado. La aplicación cambiará a esta configuración cuando la notificación esté siendo formateada y luego se revertirá a la configuración regional previa cuando el formato esté completo:

```php
$user->notify((new InvoicePaid($invoice))->locale('es'));
```

La configuración regional de múltiples entradas notificables también puede ser logradas mediante la facade `Notification`:

```php
Notification::locale('es')->send($users, new InvoicePaid($invoice));
```

### Configuración regional preferida por el usuario

A veces, las aplicaciones almacenan la configuración regional preferida de cada usuario. Al implementar la interfaz `HasLocalePreference` en tu modelo notificable, puedes instruir a Laravel que use esta configuración almacenada al enviar una notificación:

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

Una vez esté implementada la interfaz, Laravel usará automáticamentela configuración regional preferida al enviar notificaciones y mailables al modelo. Por lo tanto, no es necesario llamar al método `locale` cuando usas esta interfaz:

```php
$user->notify(new InvoicePaid($invoice));
```

<a name="notification-events"></a>
## Eventos de notificación

Cuando una notificación es enviada, el evento `Illuminate\Notifications\Events\NotificationSent` es desencadenado por el sistema de notificación. Esto contiene la entidad "notifiable" y la instancia de ntificación en sí. Puedes registrar listeners para este evento en tu `EventServiceProvider`:

```php
/**
* The event listener mappings for the application.
*
* @var array
*/
protected $listen = [
    'Illuminate\Notifications\Events\NotificationSent' => [
        'App\Listeners\LogNotification',
    ],
];
```

::: tip TIP
Luego de registrar listeners en tu `EventServiceProvider`, usa el comando Artisan `event:generate` para generar rápidamente clases de listeners.
:::

Dentro de un listener de eventos, puedes acceder a las propiedades `notifiable`, `notification` y `channel` del evento para aprender más acerca de el destinatario de la notificación o sobre la notificación en sí:

```php
/**
* Handle the event.
*
* @param  NotificationSent  $event
* @return void
*/
public function handle(NotificationSent $event)
{
    // $event->channel
    // $event->notifiable
    // $event->notification
    // $event->response
}
```

<a name="custom-channels"></a>
## Canales personalizados

Laravel viene una gran cantidad de canales de notificación, pero puedes ser deseable escribir controladores propios para entregar notificaciones mediante otros canales. Laravel hace de esto algo sencillo. Para empezar, debes definir una clase que contenga un método `send` El método debe recibir dos argumentos: un `$notifiable` y un `$notification`:

```php
<?php

namespace App\Channels;

use Illuminate\Notifications\Notification;

class VoiceChannel
{
    /**
    * Send the given notification.
    *
    * @param  mixed  $notifiable
    * @param  \Illuminate\Notifications\Notification  $notification
    * @return void
    */
    public function send($notifiable, Notification $notification)
    {
        $message = $notification->toVoice($notifiable);

        // Send notification to the $notifiable instance...
    }
}
```

Una vez que la clase de notificación ha sido definida, puedes devolver el nombre de la clase desde el método `via` de cualquier notificación:

```php
<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use App\Channels\VoiceChannel;
use App\Channels\Messages\VoiceMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class InvoicePaid extends Notification
{
    use Queueable;

    /**
    * Get the notification channels.
    *
    * @param  mixed  $notifiable
    * @return array|string
    */
    public function via($notifiable)
    {
        return [VoiceChannel::class];
    }

    /**
    * Get the voice representation of the notification.
    *
    * @param  mixed  $notifiable
    * @return VoiceMessage
    */
    public function toVoice($notifiable)
    {
        // ...
    }
}
```
