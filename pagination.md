# Base de datos: Paginación

- [Introducción](#introduction)
- [Uso Básico](#basic-usage)
    - [Paginando los Resultados del Constructor de Consultas](#paginating-query-builder-results)
    - [Paginando los Resultados de Eloquent](#paginating-eloquent-results)
    - [Creando un Paginador Manualmente](#manually-creating-a-paginator)
- [Mostrando los Resultados de la Paginación](#displaying-pagination-results)
    - [Convirtiendo los Resultados a JSON](#converting-results-to-json)
- [Personalizando la Vista de la Paginación](#customizing-the-pagination-view)
- [Métodos de Instancia del Paginador](#paginator-instance-methods)

<a name="introduction"></a>
## Introducción

En otros frameworks, la paginación puede ser muy difícil. El paginador de Laravel está integrado con el [constructor de consultas](/docs/{{version}}/queries) y el [ORM Eloquent](/docs/{{version}}/eloquent), proporcionando una conveniente y fácil de usar paginación de resultados de forma predeterminada. El HTML generado por el paginador es compatible con el [Framework de CSS Bootstrap](https://getbootstrap.com/).

<a name="basic-usage"></a>
## Uso Básico

<a name="paginating-query-builder-results"></a>
### Paginando los Resultados del Constructor de Consultas

Hay varias formas de paginar los elementos. La más simple es usando el método `paginate` en el [constructor de consultas](/docs/{{version}}/queries) o una [Consulta de Eloquent](/docs/{{version}}/eloquent). El método `paginate` se encarga automáticamente de la configuración del límite y desplazamiento apropiado de la página actual que está siendo vista por el usuario. Por defecto, la página actual es detectada por el valor del argumento de cadena de consulta `page` en la solicitud HTTP. Ciertamente, este valor es detectado automáticamente por Laravel y también es insertado automáticamente dentro de los enlaces generados por el paginador.

En este ejemplo, el único argumento pasado al método `paginate` es el número de elementos que prefieres que sean mostrados "por página". En este caso, vamos a especificar que nos gustaría mostrar `15` elementos por página:

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

> {note} Actualmente, las operaciones de paginación que usan una instrucción `GroupBy` no pueden ser ejecutados eficientemente por Laravel. Si necesitas usar una cláusula `GroupBy` con un conjunto de resultados paginados, es recomendable que consultes la base de datos y crees un paginador manualmente.

#### "Paginación Sencilla"

Si necesitas mostrar solamente enlaces "Siguiente" y "Anterior" en tu vista de paginación, puedes usar el método `simplePaginate` para ejecutar una consulta más eficiente. Esto es muy útil para grandes colecciones de datos cuando no necesitas mostrar un enlace para cada número de página al momento de renderizar tu vista.

    $users = DB::table('users')->simplePaginate(15);

<a name="paginating-eloquent-results"></a>
### Paginando Resultados de Eloquent

También puedes paginar consultas de [Eloquent](/docs/{{version}}/eloquent). En este ejemplo, paginaremos el modelo `User` con `15` elementos por página. Como puedes ver, la sintaxis es casi idéntica a la paginación de los resultados del constructor de consultas.

    $users = App\User::paginate(15);

Ciertamente, puedes ejecutar `paginate` después de configurar otras restricciones en la consulta, tal como las cláusulas `where`:

    $users = User::where('votes', '>', 100)->paginate(15);

También puedes usar el método `simplePaginate` al momento de paginar los modelos de Eloquent.

    $users = User::where('votes', '>', 100)->simplePaginate(15);

<a name="manually-creating-a-paginator"></a>
### Creando un Paginador Manualmente

Algunas veces puedes desear craer una instancia de paginación  anualmente, pasándole un arreglo de elementos. Puedes hacer eso al crear una instancia de la clase `Illuminate\Pagination\Paginator` o `Illuminate\Pagination\LengthAwarePaginator`, dependiendo de tus necesidades.

La clase `Paginator` no necesita conocer el número total de elementos en el conjunto de resultados; sin embargo, por causa de esto, la clase no tiene métodos para obtener el índice de la última página. La clase `LengthAwarePaginator` acepta casi los mismos argumentos que la clase `Paginator`; sin embargo, si requiere una cuenta del total del número de elementos en el conjunto de resultados.

En otras palabras, la clase `Paginator` corresponde al método `simplePaginate` en el constructor de consultas y Eloquent, mientras la clase `LengthAwarePaginator` corresponde al método `paginate`.

> {note} Cuando creas manualmente una instancia paginadora, deberías manualmente "recortar en partes" el arreglo de resultados que pasas al paginador. Si estás inseguro de como hacer esto, inspecciona la función de PHP [array_slice](https://secure.php.net/manual/en/function.array-slice.php).

<a name="displaying-pagination-results"></a>
## Mostrando los Resultados de la Paginación

Cuando ejecutas el método `paginate`, recibirás una instancia de la clase `Illuminate\Pagination\LengthAwarePaginator`. Cuando ejecutas el método `simplePaginate`, recibirás una instancia de la clase `Illuminate\Pagination\Paginator`. Estos objetos proporcionan varios métodos que afectan la presentación del conjunto de resultados. Además de estos métodos helpers, las instancias de clase paginadora son iteradoras y pueden ser recorridas por un ciclo repetitivo igual que un arreglo. Así, una vez que has obtenido los resultados, puedes mostrar los resultados y renderizar los enlaces de página usando [Blade](/docs/{{version}}/blade):

    <div class="container">
        @foreach ($users as $user)
            {{ $user->name }}
        @endforeach
    </div>

    {{ $users->links() }}

El método `links` renderizará los enlaces para el resto de las páginas en el conjunto de resultados. Cada uno de estos enlaces ya contendrá la variable de cadena de consulta `page` apropiada. Recuerda, el HTML generado por el método `links` es compatible con el [Framework de CSS Boostrap](https://getbootstrap.com).

#### Personalizando la URI del Paginador

El método `withPath` permite personalizar la URI usada por el paginador al momento de generar enlaces.
Por ejemplo, si quieres que el paginador genere enlaces como `http://example.com/custom/url?page=N`, deberías pasar `custom/url` al método `withPath`:

    Route::get('users', function () {
        $users = App\User::paginate(15);

        $users->withPath('custom/url');

        //
    });

#### Agregando Enlaces de Paginación

Puedes agregar la cadena de consulta de los enlaces de paginación usando el método `appends`. Por ejemplo, para agregar `sort=votes` a cada enlace de paginación, deberías hacer la siguiente ejecución del método `appends`:

    {{ $users->appends(['sort' => 'votes'])->links() }}

Si deseas agregar un "fragmento con el símbolo numeral" a las URLs del paginador, puedes usar el método `fragment`. Por ejemplo, para agregar `#foo` al final de cada enlace de paginación, haz la siguiente ejecución del método `fragment`:

    {{ $users->fragment('foo')->links() }}

<a name="converting-results-to-json"></a>
### Convirtiendo Resultados a JSON

Las clases resultantes del paginador de Laravel implementan el contrato por Interfaz `Illuminate\Contracts\Support\Jsonable` y exponen el método `toJson`, así es muy fácil convertir los resultados de tu paginación a JSON. También puedes convertir una instancia del paginador al devolverlo desde una ruta o acción de controlador:

    Route::get('users', function () {
        return App\User::paginate();
    });

El JSON devuelto por el paginador incluirá meta información tal como `total`, `current_page`, `last_page` y más. Los objetos de resultados reales estarán disponibles por medio de la clave `data` en el arreglo JSON. Aquí está un ejemplo del JSON creado al regresar una instancia del paginador desde una ruta:

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

<a name="customizing-the-pagination-view"></a>
## Personalizando la Vista de la Paginación

De forma predeterminada, las vistas que son renderizadas para mostrar los enlaces de paginación son compatibles con el framework de CSS Bootstrap. Sin embargo, si no estas usando Bootstrap, eres libre de definir tus propias vistas para renderizar esos enlaces. Al momento de ejecutar el método `links` en una instancia del paginador, pasa el nombre de la vista como primer argumento del método:

    {{ $paginator->links('view.name') }}

    // Passing data to the view...
    {{ $paginator->links('view.name', ['foo' => 'bar']) }}

Sin embargo, la forma más fácil de personalizar las vistas de paginación es exportándolas a tu directorio `resources/views/vendor` usando el comando `vendor:publish`:

    php artisan vendor:publish --tag=laravel-pagination

Este comando ubicará las vistas dentro del directorio `resources/views/vendor/pagination`. El archivo `default.blade.php` dentro de este directorio corresponde a la vista de paginación predeterminada. Edita este archivo para modificar el HTML de paginación.

<a name="paginator-instance-methods"></a>
## Métodos de la Instancia Paginadora

Cada instancia paginadora proporciona información de paginación adicional por medio de los siguientes métodos:

- `$results->count()`
- `$results->currentPage()`
- `$results->firstItem()`
- `$results->hasMorePages()`
- `$results->lastItem()`
- `$results->lastPage() (No disponible al momento de usar simplePaginate)`
- `$results->nextPageUrl()`
- `$results->perPage()`
- `$results->previousPageUrl()`
- `$results->total() (No disponible al momento de usar simplePaginate)`
- `$results->url($page)`
