::: v-pre

# Base de datos: Paginación

- [Introducción](#introduction)
- [Uso Básico](#basic-usage)
    - [Paginando Los Resultados Del Constructor De Consultas](#paginating-query-builder-results)
    - [Paginando Los Resultados De Eloquent](#paginating-eloquent-results)
    - [Creando Un Paginador Manualmente](#manually-creating-a-paginator)
- [Mostrando Los Resultados De La Paginación](#displaying-pagination-results)
    - [Convirtiendo Los Resultados A Json](#converting-results-to-json)
- [Personalizando La Vista De La Paginación](#customizing-the-pagination-view)
- [Métodos De Instancia Del Paginador](#paginator-instance-methods)

<a name="introduction"></a>
## Introducción

En otros frameworks, la paginación puede ser muy difícil. El paginador de Laravel está integrado con el [constructor de consultas](/docs/{{version}}/queries) y el [ORM Eloquent](/docs/{{version}}/eloquent), proporcionando una conveniente y fácil manera de usar paginación de resultados de forma predeterminada. El HTML generado por el paginador es compatible con el [Framework de CSS Bootstrap](https://getbootstrap.com/).

<a name="basic-usage"></a>
## Uso Básico

<a name="paginating-query-builder-results"></a>
### Paginando los Resultados del Constructor de Consultas

Hay varias formas de paginar los elementos. La más simple es usando el método `paginate` en el [constructor de consultas](/docs/{{version}}/queries) o una [Consulta de Eloquent](/docs/{{version}}/eloquent). El método `paginate` se encarga automáticamente de la configuración del límite y desplazamiento apropiado de la página actual que está siendo vista por el usuario. Por defecto, la página actual es detectada por el valor del argumento de cadena de consulta `page` en la solicitud HTTP. Este valor es detectado automáticamente por Laravel y también es insertado automáticamente dentro de los enlaces generados por el paginador.

En este ejemplo, el único argumento pasado al método `paginate` es el número de elementos que prefieres que sean mostrados "por página". En este caso, vamos a especificar que nos gustaría mostrar `15` elementos por página:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class UserController extends Controller
{
    /**
    * Show all of the users for the application.
    *
    * @return Response
    */
    public function index()
    {
        $users = DB::table('users')->paginate(15);

        return view('user.index', ['users' => $users]);
    }
}
```

::: danger Nota
Actualmente, las operaciones de paginación que usan una instrucción `GroupBy` no pueden ser ejecutados eficientemente por Laravel. Si necesitas usar una cláusula `GroupBy` con un conjunto de resultados paginados, es recomendable que consultes la base de datos y crees un paginador manualmente.
:::

#### "Paginación Sencilla"

Si necesitas mostrar solamente enlaces "Siguiente" y "Anterior" en tu vista de paginación, puedes usar el método `simplePaginate` para ejecutar una consulta más eficiente. Esto es muy útil para grandes colecciones de datos cuando no necesitas mostrar un enlace para cada número de página al momento de renderizar tu vista.

```php
$users = DB::table('users')->simplePaginate(15);
```

<a name="paginating-eloquent-results"></a>
### Paginando Resultados De Eloquent

También puedes paginar consultas de [Eloquent](/docs/{{version}}/eloquent). En este ejemplo, paginaremos el modelo `User` con `15` elementos por página. Como puedes ver, la sintaxis es casi idéntica a la paginación de los resultados del constructor de consultas.

```php
$users = App\User::paginate(15);
```

Puedes ejecutar `paginate` después de configurar otras restricciones en la consulta, tal como las cláusulas `where`:

```php
$users = User::where('votes', '>', 100)->paginate(15);
```

También puedes usar el método `simplePaginate` al momento de paginar los modelos de Eloquent.

```php
$users = User::where('votes', '>', 100)->simplePaginate(15);
```

<a name="manually-creating-a-paginator"></a>
### Creando Un Paginador Manualmente

Algunas veces puedes desear crear una instancia de paginación manualmente, pasándole un arreglo de elementos. Puedes hacer eso al crear una instancia de la clase `Illuminate\Pagination\Paginator` o `Illuminate\Pagination\LengthAwarePaginator`, dependiendo de tus necesidades.

La clase `Paginator` no necesita conocer el número total de elementos en el conjunto de resultados; sin embargo, debido a esto, la clase no tiene métodos para obtener el índice de la última página. La clase `LengthAwarePaginator` acepta casi los mismos argumentos que la clase `Paginator`; sin embargo, si requiere una cuenta del total del número de elementos en el conjunto de resultados.

En otras palabras, la clase `Paginator` corresponde al método `simplePaginate` en el constructor de consultas y Eloquent, mientras la clase `LengthAwarePaginator` corresponde al método `paginate`.

::: danger Nota
Cuando creas manualmente una instancia del paginador, deberías manualmente "recortar en partes" el arreglo de resultados que pasas al paginador. Si estás inseguro de cómo hacer esto, inspecciona la función de PHP [array_slice](https://secure.php.net/manual/en/function.array-slice.php).
:::

<a name="displaying-pagination-results"></a>
## Mostrando Los Resultados De La Paginación

Cuando ejecutas el método `paginate`, recibirás una instancia de la clase `Illuminate\Pagination\LengthAwarePaginator`. Cuando ejecutas el método `simplePaginate`, recibirás una instancia de la clase `Illuminate\Pagination\Paginator`. Estos objetos proporcionan varios métodos que afectan la presentación del conjunto de resultados. Además de estos métodos helpers, las instancias del paginador son iteradoras, es decir, pueden ser recorridas por un ciclo repetitivo igual que un arreglo. Así, una vez que has obtenido los resultados, puedes mostrar los resultados y renderizar los enlaces de página usando [Blade](/docs/{{version}}/blade):

```php
<div class="container">
    @foreach ($users as $user)
        {{ $user->name }}
    @endforeach
</div>

{{ $users->links() }}
```

El método `links` renderizará los enlaces para el resto de las páginas en el conjunto de resultados. Cada uno de estos enlaces ya contendrá la variable de cadena de consulta `page` apropiada. Recuerda, el HTML generado por el método `links` es compatible con el [Framework de CSS Boostrap](https://getbootstrap.com).

#### Personalizando la URI del Paginador

El método `withPath` permite personalizar la URI usada por el paginador al momento de generar enlaces. Por ejemplo, si quieres que el paginador genere enlaces como `http://example.com/custom/url?page=N`, deberías pasar `custom/url` al método `withPath`:

```php
Route::get('users', function () {
    $users = App\User::paginate(15);

    $users->withPath('custom/url');

    //
});
```

#### Agregando Enlaces de Paginación

Puedes agregar la cadena de consulta a los enlaces de paginación usando el método `appends`. Por ejemplo, para agregar `sort=votes` a cada enlace de paginación, deberías hacer la siguiente ejecución del método `appends`:

```php
{{ $users->appends(['sort' => 'votes'])->links() }}
```

Si deseas agregar un "fragmento con el símbolo numeral `#`" a las URLs del paginador, puedes usar el método `fragment`. Por ejemplo, para agregar `#foo` al final de cada enlace de paginación, haz la siguiente ejecución del método `fragment`:

```php
{{ $users->fragment('foo')->links() }}
```

#### Ajustando La Ventana De Enlace De Paginación

Puedes controlar cuántos enlaces adicionales son mostrados en cada lado de la "ventana" de la URL del paginador. Por defecto, tres enlaces son mostrados en cada lado de los enlaces primarios del paginador. Sin embargo, puedes controlar este número usando el método `onEachSide`:

```php
{{ $users->onEachSide(5)->links() }}
```

<a name="converting-results-to-json"></a>
### Convirtiendo Resultados A JSON

Las clases resultantes del paginador de Laravel implementan la interfaz `Illuminate\Contracts\Support\Jsonable` y exponen el método `toJson`, así es muy fácil convertir los resultados de tu paginación a JSON. También puedes convertir una instancia del paginador al devolverlo desde una ruta o acción de controlador:

```php
Route::get('users', function () {
    return App\User::paginate();
});
```

El JSON devuelto por el paginador incluirá meta información tal como `total`, `current_page`, `last_page` y más. Los objetos de resultados reales estarán disponibles por medio de la clave `data` en el arreglo JSON. Aquí está un ejemplo del JSON creado al regresar una instancia del paginador desde una ruta:

```php
{
    "total": 50,
    "per_page": 15,
    "current_page": 1,
    "last_page": 4,
    "first_page_url": "http://laravel.app?page=1",
    "last_page_url": "http://laravel.app?page=4",
    "next_page_url": "http://laravel.app?page=2",
    "prev_page_url": null,
    "path": "http://laravel.app",
    "from": 1,
    "to": 15,
    "data":[
        {
            // Result Object
        },
        {
            // Result Object
        }
    ]
}
```

<a name="customizing-the-pagination-view"></a>
## Personalizando La Vista De La Paginación

De forma predeterminada, las vistas que son renderizadas para mostrar los enlaces de paginación son compatibles con el framework de CSS Bootstrap. Sin embargo, si no estás usando Bootstrap, eres libre de definir tus propias vistas para renderizar esos enlaces. Al momento de ejecutar el método `links` en una instancia del paginador, pasa el nombre de la vista como primer argumento del método:

```php
{{ $paginator->links('view.name') }}

// Passing data to the view...
{{ $paginator->links('view.name', ['foo' => 'bar']) }}
```

Sin embargo, la forma más fácil de personalizar las vistas de paginación es exportándolas a tu directorio `resources/views/vendor` usando el comando `vendor:publish`:

```php
php artisan vendor:publish --tag=laravel-pagination
```

Este comando ubicará las vistas dentro del directorio `resources/views/vendor/pagination`. El archivo `default.blade.php` dentro de este directorio corresponde a la vista de paginación predeterminada. Edita este archivo para modificar el HTML de paginación.

Si quieres designar un archivo distinto como la vista de paginación por defecto, se pueden usar los métodos de paginador `defaultView` y `defaultSimpleView` en tu `AppServiceProvider`:

```php
use Illuminate\Pagination\Paginator;

public function boot()
{
    Paginator::defaultView('view-name');

    Paginator::defaultSimpleView('view-name');
}
```

<a name="paginator-instance-methods"></a>
## Métodos de la Instancia Paginadora

Cada instancia del paginador proporciona información de paginación adicional por medio de los siguientes métodos:

Método  |  Descripción
-------  |  -----------
`$results->count()`  |  Obtiene el número de elementos para la página actual.
`$results->currentPage()`  |  Obtiene el número de la página actual.
`$results->firstItem()`  |  Obtiene el número de resultado del primer elemento en los resultados.
`$results->getOptions()`  |  Obtiene las opciones del paginador.
`$results->getUrlRange($start, $end)`  |  Crea un rango de URLs de paginación.
`$results->hasMorePages()`  |  Determina si hay suficientes elementos para dividir en varias páginas.
`$results->lastItem()`  |  Obtiene el número de resultado del último elemento en los resultados.
`$results->lastPage()`  |  Obtiene el número de página de la última página disponible. (No disponible cuando se utiliza `simplePaginate`).
`$results->nextPageUrl()`  |  Obtiene la URL para la próxima página.
`$results->onFirstPage()`  |  Determine si el paginador está en la primera página.
`$results->perPage()`  |  El número de elementos a mostrar por página.
`$results->previousPageUrl()`  |  Obtiene la URL de la página anterior.
`$results->total()`  |  Determine el número total de elementos coincidentes en el almacén de datos. (No disponible cuando se utiliza `simplePaginate`).
`$results->url($page)`  |  Obtiene la URL para un número de página dado.