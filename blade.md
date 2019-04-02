::: v-pre

# Plantillas Blade

- [Introducción](#introduction)
- [Herencia De Plantillas](#template-inheritance)
    - [Definir Un Layout](#defining-a-layout)
    - [Extender Un Layout](#extending-a-layout)
- [Componentes Y Slots](#components-and-slots)
- [Mostrando Datos](#displaying-data)
    - [Frameworks De Blade Y JavaScript](#blade-and-javascript-frameworks)
- [Estructuras De Control](#control-structures)
    - [Sentencias If](#if-statements)
    - [Sentencias Switch](#switch-statements)
    - [Bucles](#loops)
    - [La Variable Loop](#the-loop-variable)
    - [Comentarios](#comments)
    - [PHP](#php)
- [Forms](#forms)
	- [Campo CSRF](#csrf-field)
    - [Campo Method](#method-field)    
- [Incluyendo Sub-Vistas](#including-sub-views)
    - [Renderizar Vistas Para Colecciones](#rendering-views-for-collections)
- [Stacks](#stacks)
- [Inyeción De Servicios](#service-injection)
- [Extendiendo Blade](#extending-blade)
    - [Sentencias If Personalizadas](#custom-if-statements)

<a name="introduction"></a>
## Introducción

Blade es un motor de plantillas simple y a la vez poderoso proporcionado por Laravel. A diferencia de otros motores de plantillas populares de PHP, Blade no te impide utilizar código PHP plano en sus vistas. De hecho, todas las vistas de Blade son compiladas en código PHP plano y almacenadas en caché hasta que sean modificadas, lo que significa que Blade no añade sobrecarga a tu aplicación. Los archivos de las vistas de Blade tienen la extensión `.blade.php` y son usualmente almacenados en el directorio `resources/views`.

<a name="template-inheritance"></a>
## Herencia De Plantillas

<a name="defining-a-layout"></a>
### Definir Un Layout

Dos de los principales beneficios de usar Blade son _la herencia de plantillas_ y _secciones_. Para empezar, veamos un ejemplo simple. Primero, vamos a examinar una página de layout "master". Ya que la mayoría de las aplicaciones web mantienen el mismo layout general a través de varias páginas, es conveniente definir este layout como una sola vista de Blade:

```php
<!-- Almacenado en resources/views/layouts/app.blade.php -->

<html>
    <head>
        <title>App Name - @yield('title')</title>
    </head>
    <body>
        @section('sidebar')
            This is the master sidebar.
        @show

        <div class="container">
            @yield('content')
        </div>
    </body>
</html>
```

Como puedes ver, este archivo contiene el marcado típico de HTML. Sin embargo, toma nota de las directivas `@section` y `@yield`. La directiva `@section`, como su nombre lo indica, define una sección de contenido, mientras que la directiva `@yield` es utilizada para mostrar el contenido en una sección determinada.

Ahora que hemos definido un layout para nuestra aplicación, vamos a definir una página hija que herede el layout.

<a name="extending-a-layout"></a>
### Extender Un Layout

Al definir una vista hija, utiliza la directiva de Blade `@extends` para indicar el layout que deberá "heredarse" en la vista hija. Las vistas que extiendan un layout de Blade pueden inyectar contenido en la sección del layout usando la directiva `@section`. Recuerda, como vimos en el ejemplo anterior, los contenidos de estas secciones se mostrarán en el layout usando `@yield`:

```php
<!-- Almacenado en resources/views/child.blade.php -->

@extends('layouts.app')

@section('title', 'Page Title')

@section('sidebar')
    @@parent

    <p>This is appended to the master sidebar.</p>
@endsection

@section('content')
    <p>This is my body content.</p>
@endsection
```

En este ejemplo, la sección `sidebar` está utilizando la directiva `@@parent` para adjuntar (en lugar de sobrescribir) contenido al sidebar del layout. La directiva `@@parent` será reemplazada por el contenido del layout cuando la vista sea renderizada.

::: tip
Contrario al ejemplo anterior, esta sección `sidebar` termina con `@endsection` en lugar de `@show`. La directiva `@endsection` sólo definirá una sección mientras que `@show` definirá y **automáticamente creará un yield** de la sección.
:::

Las vistas de Blade se pueden retornar desde las rutas usando el helper global `view`:

```php
Route::get('blade', function () {
    return view('child');
});
```

<a name="components-and-slots"></a>
## Componentes Y Slots

Los componentes y slots proporcionan beneficios similares a secciones y layouts; sin embargo, algunos encontrarán el modelo mental de componentes y slots más fácil de comprender. Primero, imginemos un componente "alert" reutilizable que queremos que se reutilice en toda nuestra aplicación:

```php
<!-- /resources/views/alert.blade.php -->

<div class="alert alert-danger">
    {{ $slot }}
</div>
```

La variable `{{ $slot }}` tendrá el contenido que deseamos inyectar en el componente. Ahora, para construir el componente, podemos usar la directiva de Blade `@component`:

```php
@component('alert')
    <strong>Whoops!</strong> Something went wrong!
@endcomponent
```

A veces es útil definir múltiples slots para un componente. Vamos a modificar nuestro componente alerta para permitir la inyección de un "título". Los slots nombrados podrán despegarse al hacer "echo" a la variable que coincida con sus nombres:

```php
<!-- /resources/views/alert.blade.php -->

<div class="alert alert-danger">
    <div class="alert-title">{{ $title }}</div>

    {{ $slot }}
</div>
```

Ahora, podemos inyectar contenido en el slot nombrado usando la directiva `@slot`. Cualquier contenido que no esté en la directiva `@slot` será pasado al componente en la variable `$slot`:

```php
@component('alert')
    @slot('title')
        Forbidden
    @endslot

    You are not allowed to access this resource!
@endcomponent
```

#### Pasando Información Adicional A Los Componentes

En ocasiones puedes necesitar pasar información adicional al componente. Por esta razón, puedes pasar un arreglo de información como segundo argumento a la directiva `@component`. Toda la información se hará disponible para la plantilla del componente como variables:

```php
@component('alert', ['foo' => 'bar'])
    ...
@endcomponent
```

#### Agregando Alias A Componentes

Si tus componentes de Blade están almacenados en un subdirectorio, puedes querer agregarles un alias para tener un acceso más fácil. Por ejemplo, imagina un componente de Blade que está almacenado en `resources/views/components/alert.blade.php`. Puedes usar el método `component` para agregar un alias al componente de `components.alert` a `alert`. Típicamente, esto debe ser realizado en el método `boot` de tu `AppServiceProvider`:

```php
use Illuminate\Support\Facades\Blade;

Blade::component('components.alert', 'alert');
```

Una vez que el alias ha sido agregado al componente, puedes renderizarlo usando una directiva:
	
```php
@alert(['type' => 'danger'])
    You are not allowed to access this resource!
@endalert
```
    
Puedes omitir los parametros del componente si este no tiene slots adicionales:

```php
@alert
    You are not allowed to access this resource!
@endalert    
```

<a name="displaying-data"></a>
## Mostrando Datos

Puedes mostrar datos pasados a tu vista de Blade al envolver la variable entre llaves. Por ejemplo, dada la siguiente ruta:

```php
Route::get('greeting', function () {
    return view('welcome', ['name' => 'Samantha']);
});
```

Puedes mostrar el contenido de la variable `name` de la siguiente manera:

```php
Hello, {{ $name }}.
```

No estás limitado a mostrar sólo el contenido de las variables pasadas a la vista. También puedes hacer echo al resultado de cualquier función de PHP. De hecho, puedes poner cualquier código PHP que desees dentro de la declaración echo de Blade:

```php
The current UNIX timestamp is {{ time() }}.
```

::: tip
Las declaraciones de Blade `{{  }}` son enviadas automáticamente mediante la función `htmlspecialchars` de PHP para prevenir ataques XSS.
:::

#### Mostrar Datos No Escapados

De manera predeterminada, las declaraciónes `{{  }}` de Blade son enviadas mediante la función `htmlspecialchars` de PHP para prevenir ataques XSS. Si no deseas que tu información sea escapada, puedes utilizar la siguiente sintáxis:

```php
Hello, {!! $name !!}.
```

::: danger Nota
Se muy cuidadoso cuando muestres contenido que sea suministrado por los usuarios de tu aplicación. Usa siempre las sentencias escapadas, ya que éstas previenen ataques XSS cuando se muestran datos suministrados por los usuarios.
:::

#### Renderizar JSON

En ocasiones puedes pasar un arreglo a tu vista con la intención de renderizarla como JSON para inicializar una variable JavaScript. Por ejemplo:

```php
<script>
    var app = <?php echo json_encode($array); ?>;
</script>
```

Sin embargo, en lugar de llamar manualmente a `json_encode`, puedes usar la directiva de Blade `@json`:

```php
<script>
    var app = @json($array);
</script>
```

La directiva `@json` es también útil para trabajar con componentes de Vue o atributos `data-*`:

```php
<example-component :some-prop='@json($array)'></example-component>
```

::: danger Nota
El uso de `@json` en atributos de elementos requiere que esté rodeado por comillas simples.
:::

#### Codificación De Entidades HTML

Por defecto, Blade (y el helper `e` de Laravel) codificarán doblemente las entidades HTML. Si te gustaría deshabilitar la codificación doble, llama al método `Blade::withoutDoubleEncoding` desde el método `boot` de tu `AppServiceProvider`:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
    * Bootstrap any application services.
    *
    * @return void
    */
    public function boot()
    {
        Blade::withoutDoubleEncoding();
    }
}
```

<a name="blade-and-javascript-frameworks"></a>
### Frameworks De Blade Y JavaScript

Dado que muchos frameworks de JavaScript también usan llaves para indicar que una expresión dada debe mostrarse en el navegador, puedes utilizar el símbolo `@` para informar al motor de renderizado de Blade que una expresión debe permanecer intacta. Por ejemplo:

```php
<h1>Laravel</h1>

Hello, @{{ name }}.
```

En este ejemplo, el símbolo `@` será removido por Blade; sin embargo, la expresión `{{ name }}` permanecerá intacta por el motor de Blade, lo que permitirá que pueda ser procesada por tu framework de JavaScript.

#### La Directiva `@verbatim`

Si estás mostrando variables de JavaScript en una gran parte de tu plantilla, puedes ajustar el HTML en la directiva `@verbatim` para que no tengas que poner un prefijo en cada instrucción echo de Blade con un símbolo `@`:

```php
@verbatim
    <div class="container">
        Hello, {{ name }}.
    </div>
@endverbatim
```

<a name="control-structures"></a>
## Estructuras De Control

Además de la herencia de plantillas y la visualización de datos, Blade también proporciona accesos directos y convenientes para las estructuras de control comunes de PHP, tales como sentencias condicionales y bucles. Estos accesos directos proporcionan una manera muy limpia y concisa de trabajar con estructuras de control de PHP, al tiempo que permanecen familiares para sus contrapartes de PHP.

<a name="if-statements"></a>
### Sentencias If

Puede construir sentencias `if` usando las directivas `@if`, `@elseif`, `@else` y `@endif`. Estas directivas funcionan idénticamente a sus contrapartes PHP:

```php
@if (count($records) === 1)
    I have one record!
@elseif (count($records) > 1)
    I have multiple records!
@else
    I don't have any records!
@endif
```

Por conveniencia, Blade también proporciona una directiva `@unless`:

```php
@unless (Auth::check())
    You are not signed in.
@endunless
```

Además de las directivas condicionales previamente mencionadas, las directivas `@isset` y `@empty` pueden ser usadas como accesos directos convenientes para sus respectivas funciones PHP:

```php
@isset($records)
    // $records is defined and is not null...
@endisset

@empty($records)
    // $records is "empty"...
@endempty
```

#### Directivas de Autenticación

Las directivas `@auth` y `@guest` pueden ser utilizadas para determinar rápidamente si el usuario actual está autenticado o si es un invitado:

```php
@auth
    // The user is authenticated...
@endauth

@guest
    // The user is not authenticated...
@endguest
```

Si es necesario, puede especificar el [guard de autenticación](/docs/{{version}}/authentication) que debe verificarse al usar las directivas `@auth` y `@guest`:

```php
@auth('admin')
    // The user is authenticated...
@endauth

@guest('admin')
    // The user is not authenticated...
@endguest
```

#### Directivas De Sección

Puede verificar si una sección tiene contenido usando la directiva `@hasSection`:

```php
@hasSection('navigation')
    <div class="pull-right">
        @yield('navigation')
    </div>

    <div class="clearfix"></div>
@endif
```

<a name="switch-statements"></a>
### Sentencias Switch

Las sentencias switch pueden ser construidas usando las directivas `@switch`, `@case`, `@break`, `@default` y `@endswitch`:

```php
@switch($i)
    @case(1)
        First case...
        @break

    @case(2)
        Second case...
        @break

    @default
        Default case...
@endswitch
```

<a name="loops"></a>
### Bucles

Además de las sentencias condicionales, Blade proporciona directivas simples para trabajar con estructuras en bucle de PHP. De nuevo, cada una de estas directivas funciona idénticamente a sus contrapartes PHP:

```php
@for ($i = 0; $i < 10; $i++)
    The current value is {{ $i }}
@endfor

@foreach ($users as $user)
    <p>This is user {{ $user->id }}</p>
@endforeach

@forelse ($users as $user)
    <li>{{ $user->name }}</li>
@empty
    <p>No users</p>
@endforelse

@while (true)
    <p>I'm looping forever.</p>
@endwhile
```

::: tip
Cuando estés dentro del bucle, puedes usar la [variable loop](#the-loop-variable) para obtener información valiosa acerca del bucle, como puede ser saber si estás en la primera o última iteración a través del bucle.
:::

Al usar bucles puede finalizarlo u omitir la iteración actual:

```php
@foreach ($users as $user)
    @if ($user->type == 1)
        @continue
    @endif

    <li>{{ $user->name }}</li>

    @if ($user->number == 5)
        @break
    @endif
@endforeach
```

También puede incluir la condición con la declaración en una línea:

```php
@foreach ($users as $user)
    @continue($user->type == 1)

    <li>{{ $user->name }}</li>

    @break($user->number == 5)
@endforeach
```

<a name="the-loop-variable"></a>
### La Variable Loop

Al realizar un ciclo, una variable `$loop` estará disponible dentro del ciclo. Esta variable proporciona acceso a un poco de información útil, como el índice del ciclo actual y si es la primera o la última iteración del ciclo:

```php
@foreach ($users as $user)
    @if ($loop->first)
        This is the first iteration.
    @endif

    @if ($loop->last)
        This is the last iteration.
    @endif

    <p>This is user {{ $user->id }}</p>
@endforeach
```

Si estás en un bucle anidado, puedes acceder a la variable `$loop` del bucle padre a través de la propiedad `parent`:

```php
@foreach ($users as $user)
    @foreach ($user->posts as $post)
        @if ($loop->parent->first)
            This is first iteration of the parent loop.
        @endif
    @endforeach
@endforeach
```

La variable `$loop` también contiene una variedad de otras propiedades útiles:

Propiedad  | Descripción
------------- | -------------
`$loop->index`  |  El índice de la iteración del ciclo actual (comienza en 0).
`$loop->iteration`  |  Iteración del ciclo actual (comienza en 1).
`$loop->remaining`  |  Iteraciones restantes en el ciclo.
`$loop->count`  |  La cantidad total de elementos en el arreglo que se itera.
`$loop->first`  |  Si esta es la primera iteración a través del ciclo.
`$loop->last`  |  Si esta es la última iteración a través del ciclo.
`$loop->even`  |  Si esta es una iteración par a través del ciclo.
`$loop->odd`  |  Si esta es una iteración impar a través del ciclo.
`$loop->depth`  |  El nivel de anidamiento del bucle actual.
`$loop->parent`  |  Cuando está en un bucle anidado, la variable de bucle del padre.

<a name="comments"></a>
### Comentarios

Blade también le permite definir comentarios en sus vistas. Sin embargo, a diferencia de los comentarios HTML, los comentarios de Blade no son incluidos en el HTML retornado por la aplicación:

```php
{{-- This comment will not be present in the rendered HTML --}}
```

<a name="php"></a>
### PHP

En algunas situaciones, es útil insertar código PHP en sus vistas. Puedes usar la directiva de Blade `@php` para ejecutar un bloque de PHP plano en tu plantilla:

```php
@php
    //
@endphp
```

::: tip
A pesar que Blade proporciona esta función, usarla con frecuencia puede ser una señal de que tienes demasiada lógica incrustada dentro de tu plantilla.
:::

<a name="forms"></a>
## Formularios
	
<a name="csrf-field"></a>
### Campo CSRF
	
Cada vez que defines un formulario HTML en tu aplicación, debes incluir un campo de token CSRF oculto en el formulario para que [el middleware de protección CSRF](https://laravel.com/docs/{{version}}/csrf) pueda validar la solicitud. Puedes usar la directiva `@csrf` de Blade para generar el campo de token:

```php
<form method="POST" action="/profile">
    @csrf

        ...
</form>
```
    
<a name="method-field"></a>
### Campo Method
	
Dado que los formularios HTML no pueden hacer solicitudes `PUT`, `PATCH` o `DELETE` necesitarás agregar un campo `_method` oculto para suplantar estos verbos HTTP. La directiva `@method` de Blade puede crear este campo por ti:
	
```php
<form action="/foo/bar" method="POST">
    @method('PUT')

        ...
</form>
```

<a name="including-sub-views"></a>
## Incluyendo Sub-Vistas

La directiva `@include` de Blade te permite incluir una vista de Blade desde otra vista. Todas las variables que estén disponibles en la vista padre estarán disponibles para la vista incluida:

```php
<div>
    @include('shared.errors')

    <form>
        <!-- Form Contents -->
    </form>
</div>
```

Aunque la vista incluida heredará todos los datos disponibles en la vista principal, también puedes pasar un arreglo de datos adicionales a la vista incluida:

```php
@include('view.name', ['some' => 'data'])
```

Si utiliza `@include` en una vista que no existe, Laravel lanzará un error. Si desea incluir una vista que puede o no estar presente, deberá utilizar la directiva `@includeIf`:

```php
@includeIf('view.name', ['some' => 'data'])
```

Si desea incluir una vista dependiendo de una condición booleana dada, puedes utilizar la directiva `@includeWhen`:

```php
@includeWhen($boolean, 'view.name', ['some' => 'data'])
```

Para incluir la primera vista que exista para un arreglo dado de vistas, puedes usar la directiva `@includeFirst`:

```php
@includeFirst(['custom.admin', 'admin'], ['some' => 'data'])
```

::: danger Nota
Debes evitar usar las constantes `__DIR__` y `__FILE__` en tus vistas de Blade, ya que se referirán a la ubicación de la vista compilada en caché.
:::

#### Alias De Includes

Si tus includes de Blade están almacenados en un subdirectorio, puedes desear crear un alias de ellos para un acceso más fácil. Por ejemplo, imagina un include de Blade que está almacenado en `resources/views/includes/input.blade.php` con el siguiente contenido:

```php
<input type="{{ $type ?? 'text' }}">
```

Puedes usar el método `include` para crear un alias al include de `includes.input` a `input`. Normalmente, esto debería hacerse en el método `boot` de tu `AppServiceProvider`:

```php
use Illuminate\Support\Facades\Blade;

Blade::include('includes.input', 'input');
```

Una vez que el include tiene un alias asignado, puedes renderizalo usando el nombre del alias como una directiva de Blade:

```php
@input(['type' => 'email'])
```

<a name="rendering-views-for-collections"></a>
### Renderizar Vistas Para Colecciones

Puedes combinar bucles e incluirlos en una sola línea con la directiva `@each` de Blade:

```php
@each('view.name', $jobs, 'job')
```

El primer argumento es la vista parcial a renderizar por cada elemento en el arreglo o colección. El segundo argumento es el arreglo o colección que desea iterar, mientras que el tercer argumento es el nombre de la variable que será asignada a la iteración actual dentro de la vista. Así que, por ejemplo, si está iterando en un arreglo `jobs`, típicamente querrá tener acceso a cada trabajo como una variable `job` en su vista parcial. La llave de la iteración actual estará disponible como la variable `key` en su vista parcial.

También puede pasar un cuarto argumento a la directiva `@each`. Este argumento determina la vista que se va a renderizar si el arreglo dado está vacío.

```php
@each('view.name', $jobs, 'job', 'view.empty')
```

::: danger Nota
Las vistas renderizadas via `@each` no heredan las variables de la vista padre. Si la vista hija requiere de estas variables, deberá usar `@foreach` y `@include` en su lugar.
:::

<a name="stacks"></a>
## Pilas

Blade te permite agregar a pilas nombradas que pueden ser renderizados en otra parte de otra vista o layout. Esto es particularmente útil para especificar cualquier librería JavaScript requerida por las vistas hijas:

```php
@push('scripts')
    <script src="/example.js"></script>
@endpush
```

Puede agregar una pila tantas veces como lo necesite. Para renderizar el contenido completo de la pila, pasa el nombre de la pila a la directiva `@stack`:

```php
<head>
    <!-- Head Contents -->

    @stack('scripts')
</head>
```

Si te gustaría agregar contenido al inicio de una pila, debes usar la directiva `@prepend`:
	
```php
@push('scripts')
    This will be second...
@endpush

// Luego...

@prepend('scripts')
    This will be first...
@endprepend    
```

<a name="service-injection"></a>
## Inyeción De Servicios

La directiva `@inject` puede ser utilizada para recuperar un servicio del [contenedor de servicios](/docs/{{version}}/container) de Laravel. El primer argumento pasado a `@inject` es el nombre de la variable en la que se colocará el servicio, mientras que el segundo argumento es el nombre de la clase o interfaz del servicio que desea resolver:

```php
@inject('metrics', 'App\Services\MetricsService')

<div>
    Monthly Revenue: {{ $metrics->monthlyRevenue() }}.
</div>
```

<a name="extending-blade"></a>
## Extendiendo Blade

Blade le permite definir sus propias directivas personalizadas utilizando el método `directive`. Cuando el compilador Blade encuentra la directiva personalizada, llamará al callback con la expresión que contiene la directiva.

El siguiente ejemplo crea una directiva `@datetime($var)` que le da formato a la variable `$var`, la cual es una instancia de `DateTime`:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
    * Perform post-registration booting of services.
    *
    * @return void
    */
    public function boot()
    {
        Blade::directive('datetime', function ($expression) {
            return "<?php echo ($expression)->format('m/d/Y H:i'); ?>";
        });
    }

    /**
    * Register bindings in the container.
    *
    * @return void
    */
    public function register()
    {
        //
    }
}
```

Como podrás ver, vamos a encadenar el método `format` en cualquier expresión que se pase a la directiva. Entonces, en este ejemplo, el PHP final generado por esta directiva será:

```php
<?php echo ($var)->format('m/d/Y H:i'); ?>
```

::: danger Nota
Después de actualizar la lógica de la directiva de Blade, vas a necesitar eliminar todas las vistas de Blade guardades en caché. Las vistas de Blade en caché pueden ser eliminadas con el comando de Artisan `view:clear`.
:::

<a name="custom-if-statements"></a>
### Sentencias If Personalizadas

Programar una directiva personalizada algunas veces es más complejo de lo necesario al definir sentencias condicionales simples personalizadas. Por esa razón, Blade proporciona un método `Blade:if` que le permitirá rápidamente definir directivas condicionales utilizando Closures. Por ejemplo, vamos a definir una condicional personalizada que verifica el entorno actual de la aplicación. Podemos hacer esto en el método `boot` de `AppServiceProvider`:

```php
use Illuminate\Support\Facades\Blade;

/**
* Perform post-registration booting of services.
*
* @return void
*/
public function boot()
{
    Blade::if('env', function ($environment) {
        return app()->environment($environment);
    });
}
```

Una vez que el condicional personalizado haya sido definido, podremos usarlo fácilmente en nuestros templates:

```php
@env('local')
    // The application is in the local environment...
@elseenv('testing')
    // The application is in the testing environment...
@else
    // The application is not in the local or testing environment...
@endenv
```