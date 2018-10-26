# Helpers

- [Introducción](#introduction)
- [Métodos Disponibles](#available-methods)

<a name="introduction"></a>
## Introducción

Laravel incluye una variedad de funciones PHP "ayudantes" globales. Muchas de esas funciones son usadas por el mismo framework; sin embargo, tu eres libre de usarlas en tus aplicaciones si lo encuentras conveniente.

<a name="available-methods"></a>
## Métodos Dispnibles

<style>
    .collection-method-list > p {
        column-count: 3; -moz-column-count: 3; -webkit-column-count: 3;
        column-gap: 2em; -moz-column-gap: 2em; -webkit-column-gap: 2em;
    }

    .collection-method-list a {
        display: block;
    }
</style>

### Arreglos & Objetos

<div class="collection-method-list" markdown="1">

[array_add](#method-array-add)
[array_collapse](#method-array-collapse)
[array_divide](#method-array-divide)
[array_dot](#method-array-dot)
[array_except](#method-array-except)
[array_first](#method-array-first)
[array_flatten](#method-array-flatten)
[array_forget](#method-array-forget)
[array_get](#method-array-get)
[array_has](#method-array-has)
[array_last](#method-array-last)
[array_only](#method-array-only)
[array_pluck](#method-array-pluck)
[array_prepend](#method-array-prepend)
[array_pull](#method-array-pull)
[array_random](#method-array-random)
[array_set](#method-array-set)
[array_sort](#method-array-sort)
[array_sort_recursive](#method-array-sort-recursive)
[array_where](#method-array-where)
[array_wrap](#method-array-wrap)
[data_fill](#method-data-fill)
[data_get](#method-data-get)
[data_set](#method-data-set)
[head](#method-head)
[last](#method-last)
</div>

### Rutas

<div class="collection-method-list" markdown="1">

[app_path](#method-app-path)
[base_path](#method-base-path)
[config_path](#method-config-path)
[database_path](#method-database-path)
[mix](#method-mix)
[public_path](#method-public-path)
[resource_path](#method-resource-path)
[storage_path](#method-storage-path)

</div>

### Cadenas

<div class="collection-method-list" markdown="1">
[\__](#method-__)
[camel_case](#method-camel-case)
[class_basename](#method-class-basename)
[e](#method-e)
[ends_with](#method-ends-with)
[kebab_case](#method-kebab-case)
[preg_replace_array](#method-preg-replace-array)
[snake_case](#method-snake-case)
[starts_with](#method-starts-with)
[str_after](#method-str-after)
[str_before](#method-str-before)
[str_contains](#method-str-contains)
[str_finish](#method-str-finish)
[str_is](#method-str-is)
[str_limit](#method-str-limit)
[Str::orderedUuid](#method-str-ordereduuid)
[str_plural](#method-str-plural)
[str_random](#method-str-random)
[str_replace_array](#method-str-replace-array)
[str_replace_first](#method-str-replace-first)
[str_replace_last](#method-str-replace-last)
[str_singular](#method-str-singular)
[str_slug](#method-str-slug)
[str_start](#method-str-start)
[studly_case](#method-studly-case)
[title_case](#method-title-case)
[trans](#method-trans)
[trans_choice](#method-trans-choice)
[Str::uuid](#method-str-uuid)
</div>

### Enlaces

<div class="collection-method-list" markdown="1">

[action](#method-action)
[asset](#method-asset)
[secure_asset](#method-secure-asset)
[route](#method-route)
[secure_url](#method-secure-url)
[url](#method-url)

</div>

### Variados

<div class="collection-method-list" markdown="1">

[abort](#method-abort)
[abort_if](#method-abort-if)
[abort_unless](#method-abort-unless)
[app](#method-app)
[auth](#method-auth)
[back](#method-back)
[bcrypt](#method-bcrypt)
[blank](#method-blank)
[broadcast](#method-broadcast)
[cache](#method-cache)
[class_uses_recursive](#method-class-uses-recursive)
[collect](#method-collect)
[config](#method-config)
[cookie](#method-cookie)
[csrf_field](#method-csrf-field)
[csrf_token](#method-csrf-token)
[dd](#method-dd)
[decrypt](#method-decrypt)
[dispatch](#method-dispatch)
[dispatch_now](#method-dispatch-now)
[dump](#method-dump)
[encrypt](#method-encrypt)
[env](#method-env)
[event](#method-event)
[factory](#method-factory)
[filled](#method-filled)
[info](#method-info)
[logger](#method-logger)
[method_field](#method-method-field)
[now](#method-now)
[old](#method-old)
[optional](#method-optional)
[policy](#method-policy)
[redirect](#method-redirect)
[report](#method-report)
[request](#method-request)
[rescue](#method-rescue)
[resolve](#method-resolve)
[response](#method-response)
[retry](#method-retry)
[session](#method-session)
[tap](#method-tap)
[today](#method-today)
[throw_if](#method-throw-if)
[throw_unless](#method-throw-unless)
[trait_uses_recursive](#method-trait-uses-recursive)
[transform](#method-transform)
[validator](#method-validator)
[value](#method-value)
[view](#method-view)
[with](#method-with)

</div>

<a name="method-listing"></a>
## Listado de Métodos

<style>
    #collection-method code {
        font-size: 14px;
    }

    #collection-method:not(.first-collection-method) {
        margin-top: 50px;
    }
</style>

<a name="arrays"></a>
## Arreglos & Objetos

<a name="method-array-add"></a>
#### `array_add()` {#collection-method .first-collection-method}

La función `array_add` agrega una clave/valor dada a un arreglo si la clave no existe previamente en el arreglo:

    $array = array_add(['name' => 'Desk'], 'price', 100);
    
    // ['name' => 'Desk', 'price' => 100]

<a name="method-array-collapse"></a>
#### `array_collapse()` {#collection-method}

La función `array_collapse` colapsa un arreglo de arreglos en un único arreglo:

    $array = array_collapse([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
    
    // [1, 2, 3, 4, 5, 6, 7, 8, 9]

<a name="method-array-divide"></a>
#### `array_divide()` {#collection-method}

La función `array_divide` retorna dos arreglos, uno contiene las claves y el otro contiene los valores del array dado:

    list($keys, $values) = array_divide(['name' => 'Desk']);
    
    // $keys: ['name']
    
    // $values: ['Desk']

<a name="method-array-dot"></a>
#### `array_dot()` {#collection-method}

La función `array_dot` aplana un arreglo multi dimensional en un arreglo de un nivel que usas la notación "punto" para indicar profundidad:

    $array = ['products' => ['desk' => ['price' => 100]]];
    
    $flattened = array_dot($array);
    
    // ['products.desk.price' => 100]

<a name="method-array-except"></a>
#### `array_except()` {#collection-method}

La función `array_except` remueve los pares clave / valor de un arreglo:

    $array = ['name' => 'Desk', 'price' => 100];
    
    $filtered = array_except($array, ['price']);
    
    // ['name' => 'Desk']

<a name="method-array-first"></a>
#### `array_first()` {#collection-method}

La función `array_first` devuelve el primer elemento de un arreglo que cumpla la condición dada:

    $array = [100, 200, 300];
    
    $first = array_first($array, function ($value, $key) {
        return $value >= 150;
    });
    
    // 200

Un valor por defecto puede ser pasado como un tercer parámetro al método. Este valor será retornado si no hay un valor que cumpla la condición:

    $first = array_first($array, $callback, $default);

<a name="method-array-flatten"></a>
#### `array_flatten()` {#collection-method}

La función `array_flatten` unifica un arreglo multidimensional en un arreglo de un solo nivel:

    $array = ['name' => 'Joe', 'languages' => ['PHP', 'Ruby']];
    
    $flattened = array_flatten($array);
    
    // ['Joe', 'PHP', 'Ruby']

<a name="method-array-forget"></a>
#### `array_forget()` {#collection-method}

La función `array_forget` remueve un par clave / valor de un arreglo anidado usando la notación "punto":

    $array = ['products' => ['desk' => ['price' => 100]]];
    
    array_forget($array, 'products.desk');
    
    // ['products' => []]

<a name="method-array-get"></a>
#### `array_get()` {#collection-method}

La función `array_get` recupera un valor de un arreglo anidado usando la notación "punto":

    $array = ['products' => ['desk' => ['price' => 100]]];
    
    $price = array_get($array, 'products.desk.price');
    
    // 100

La función `array_get` acepta un valor por defecto, el cual será devuelto si la clave específica no es encontrada:

    $discount = array_get($array, 'products.desk.discount', 0);
    
    // 0

<a name="method-array-has"></a>
#### `array_has()` {#collection-method}

La función `array_has` chequea si un ítem o ítems dados existen en un arreglo usando la notación "punto":

    $array = ['product' => ['name' => 'Desk', 'price' => 100]];
    
    $contains = array_has($array, 'product.name');
    
    // true
    
    $contains = array_has($array, ['product.price', 'product.discount']);
    
    // false

<a name="method-array-last"></a>
#### `array_last()` {#collection-method}

La función `array_last` retorna el último elemento de un arreglo que cumpla la condición dada:

    $array = [100, 200, 300, 110];
    
    $last = array_last($array, function ($value, $key) {
        return $value >= 150;
    });
    
    // 300

Un valor por defecto puede ser pasado como un tercer argumento al método. Este valor será devuelto si ningún valor que cumpla la condición:

    $last = array_last($array, $callback, $default);

<a name="method-array-only"></a>
#### `array_only()` {#collection-method}

La función `array_only` retorna solo el par clave / valor especificado del arreglo dado:

    $array = ['name' => 'Desk', 'price' => 100, 'orders' => 10];
    
    $slice = array_only($array, ['name', 'price']);
    
    // ['name' => 'Desk', 'price' => 100]

<a name="method-array-pluck"></a>
#### `array_pluck()` {#collection-method}

La función `array_pluck` recupera todos los valores para una clave dada de un arreglo:

    $array = [
        ['developer' => ['id' => 1, 'name' => 'Taylor']],
        ['developer' => ['id' => 2, 'name' => 'Abigail']],
    ];
    
    $names = array_pluck($array, 'developer.name');
    
    // ['Taylor', 'Abigail']

Puedes además especificar como deseas que la lista resultante sea codificada:

    $names = array_pluck($array, 'developer.name', 'developer.id');
    
    // [1 => 'Taylor', 2 => 'Abigail']

<a name="method-array-prepend"></a>
#### `array_prepend()` {#collection-method}

La función `array_prepend` colocará un ítem al comienzo de un arreglo:

    $array = ['one', 'two', 'three', 'four'];
    
    $array = array_prepend($array, 'zero');
    
    // ['zero', 'one', 'two', 'three', 'four']

Si es necesario, puedes especificar la clave que debería ser usada por el valor:

    $array = ['price' => 100];
    
    $array = array_prepend($array, 'Desk', 'name');
    
    // ['name' => 'Desk', 'price' => 100]

<a name="method-array-pull"></a>
#### `array_pull()` {#collection-method}

La función `array_pull` retorna y remueve un par clave / valor de un arreglo:

    $array = ['name' => 'Desk', 'price' => 100];
    
    $name = array_pull($array, 'name');
    
    // $name: Desk
    
    // $array: ['price' => 100]

Un valor por defecto puede ser pasado como el tercer argumento del método. Este valor será devuelto si la clave no existe:

    $value = array_pull($array, $key, $default);

<a name="method-array-random"></a>
#### `array_random()` {#collection-method}

La función `array_random` retorna un valor aleatorio de un arreglo:

    $array = [1, 2, 3, 4, 5];
    
    $random = array_random($array);
    
    // 4 - (retrieved randomly)

Puedes además especificar el número de elementos a retornar como un segundo argumento opcional. Nota que proveyendo este argumento retornará un arreglo, incluso si solo deseas un ítem:

    $items = array_random($array, 2);
    
    // [2, 5] - (retrieved randomly)

<a name="method-array-set"></a>
#### `array_set()` {#collection-method}

La función `array_set` establece un valor dentro de un arreglo anidado usando la notación "punto":

    $array = ['products' => ['desk' => ['price' => 100]]];
    
    array_set($array, 'products.desk.price', 200);
    
    // ['products' => ['desk' => ['price' => 200]]]

<a name="method-array-sort"></a>
#### `array_sort()` {#collection-method}

La función `array_sort` clasifica un arreglo por sus valores:

    $array = ['Desk', 'Table', 'Chair'];
    
    $sorted = array_sort($array);
    
    // ['Chair', 'Desk', 'Table']

Puedes además clasificar el arreglo por los resultados de la función de retorno dada:

    $array = [
        ['name' => 'Desk'],
        ['name' => 'Table'],
        ['name' => 'Chair'],
    ];
    
    $sorted = array_values(array_sort($array, function ($value) {
        return $value['name'];
    }));
    
    /*
        [
            ['name' => 'Chair'],
            ['name' => 'Desk'],
            ['name' => 'Table'],
        ]
    */

<a name="method-array-sort-recursive"></a>
#### `array_sort_recursive()` {#collection-method}

La función `array_sort_recursive` clasifica recursivamente un arreglo usando la función `sort`:

    $array = [
        ['Roman', 'Taylor', 'Li'],
        ['PHP', 'Ruby', 'JavaScript'],
    ];
    
    $sorted = array_sort_recursive($array);
    
    /*
        [
            ['Li', 'Roman', 'Taylor'],
            ['JavaScript', 'PHP', 'Ruby'],
        ]
    */

<a name="method-array-where"></a>
#### `array_where()` {#collection-method}

La función `array_where` filtra un arreglo usando la función de retorno dada:

    $array = [100, '200', 300, '400', 500];
    
    $filtered = array_where($array, function ($value, $key) {
        return is_string($value);
    });
    
    // [1 => 200, 3 => 400]

<a name="method-array-wrap"></a>
#### `array_wrap()` {#collection-method}

La función `array_wrap` envuelve el valor dado en un arreglo. Si el valor dado ya es un arreglo este no será cambiado:

    $string = 'Laravel';
    
    $array = array_wrap($string);
    
    // ['Laravel']

Si el valor dado es nulo, un arreglo vacío será devuelto:

    $nothing = null;
    
    $array = array_wrap($nothing);
    
    // []

<a name="method-data-fill"></a>
#### `data_fill()` {#collection-method}

La función `data_fill` establece un valor faltante dentro de un array anidado u objeto usando la notación "punto":

    $data = ['products' => ['desk' => ['price' => 100]]];
    
    data_fill($data, 'products.desk.price', 200);
    
    // ['products' => ['desk' => ['price' => 100]]]
    
    data_fill($data, 'products.desk.discount', 10);
    
    // ['products' => ['desk' => ['price' => 100, 'discount' => 10]]]

Esta función además acepta asteriscos como comodines y rellenará el objetivo en consecuencia:

    $data = [
        'products' => [
            ['name' => 'Desk 1', 'price' => 100],
            ['name' => 'Desk 2'],
        ],
    ];
    
    data_fill($data, 'products.*.price', 200);
    
    /*
        [
            'products' => [
                ['name' => 'Desk 1', 'price' => 100],
                ['name' => 'Desk 2', 'price' => 200],
            ],
        ]
    */

<a name="method-data-get"></a>
#### `data_get()` {#collection-method}

La función `data_get` recupera un valor de un arreglo anidado u objeto usando la notación "punto":

    $data = ['products' => ['desk' => ['price' => 100]]];
    
    $price = data_get($data, 'products.desk.price');
    
    // 100

La función `data_get` acepta además un valor por defecto, el cual será retornado si la clave específica no es encontrada:

    $discount = data_get($data, 'products.desk.discount', 0);
    
    // 0

<a name="method-data-set"></a>
#### `data_set()` {#collection-method}

La función `data_set` establece un valor dentro de un arreglo anidado u objeto usando la notación "punto":

    $data = ['products' => ['desk' => ['price' => 100]]];
    
    data_set($data, 'products.desk.price', 200);
    
    // ['products' => ['desk' => ['price' => 200]]]

Esta función además acepta comodines y establecerá valores en el objetivo en consecuencia:

    $data = [
        'products' => [
            ['name' => 'Desk 1', 'price' => 100],
            ['name' => 'Desk 2', 'price' => 150],
        ],
    ];
    
    data_set($data, 'products.*.price', 200);
    
    /*
        [
            'products' => [
                ['name' => 'Desk 1', 'price' => 200],
                ['name' => 'Desk 2', 'price' => 200],
            ],
        ]
    */

Por defecto, cualquiera valores existentes son sobrescrito. Si deseas solo establecer un valor si no existe, puedes pasar `false` como tercer argumento:

    $data = ['products' => ['desk' => ['price' => 100]]];
    
    data_set($data, 'products.desk.price', 200, false);
    
    // ['products' => ['desk' => ['price' => 100]]]

<a name="method-head"></a>
#### `head()` {#collection-method}

La función `head` retorna el primer elemento en el arreglo dado:

    $array = [100, 200, 300];
    
    $first = head($array);
    
    // 100

<a name="method-last"></a>
#### `last()` {#collection-method}

La función `last` retorna el último elemento en el arreglo dado:

    $array = [100, 200, 300];
    
    $last = last($array);
    
    // 300

<a name="paths"></a>
## Rutas

<a name="method-app-path"></a>
#### `app_path()` {#collection-method}

La función `app_path` retorna la ruta completa al directorio `app`. Tu además puedes usar la función `app_path` para generar una ruta completa a un archivo relativo al directorio de la aplicación:

    $path = app_path();
    
    $path = app_path('Http/Controllers/Controller.php');

<a name="method-base-path"></a>
#### `base_path()` {#collection-method}

La función `base_path` retorna la ruta completa a la raíz del proyecto. Tu además puedes usar la función `base_path` para generar una ruta completa a un archivo dado relativo al directorio raíz del proyecto:

    $path = base_path();
    
    $path = base_path('vendor/bin');

<a name="method-config-path"></a>
#### `config_path()` {#collection-method}

La función `config_path` retorna la ruta completa al directorio `config`. Tu puedes además usar la función `config_path` para generar una ruta completa a un archivo dado dentro del directorio de configuración de la aplicación:

    $path = config_path();
    
    $path = config_path('app.php');

<a name="method-database-path"></a>
#### `database_path()` {#collection-method}

La función `database_path` retorna la ruta completa al directorio `database`.Tu puedes además usar la función `database_path` para generar una ruta completa a un archivo dado dentro del directorio database:

    $path = database_path();
    
    $path = database_path('factories/UserFactory.php');

<a name="method-mix"></a>
#### `mix()` {#collection-method}

La función `mix` retorna la ruta al [archivo versionado Mix](/docs/{{version}}/mix):

    $path = mix('css/app.css');

<a name="method-public-path"></a>
#### `public_path()` {#collection-method}

La función `public_path` retorna la ruta completa al directorio `public`. Tu puedes además usar la función `public_path` para generar una ruta completa a un archivo dado dentro del directorio public:

    $path = public_path();
    
    $path = public_path('css/app.css');

<a name="method-resource-path"></a>
#### `resource_path()` {#collection-method}

La función `resource_path` retorna la ruta completa al directorio `resources`. Tu puedes además usar la función `resource_path` para generar una ruta completa a un archivo dado dentro del directorio resources:

    $path = resource_path();
    
    $path = resource_path('assets/sass/app.scss');

<a name="method-storage-path"></a>
#### `storage_path()` {#collection-method}

La función `storage_path` retorna la ruta compelta al directorio `storage`. Tu puedes además usar la función `storage_path` para generar una ruta completa a un archivo dado dentro del directorio storage:

    $path = storage_path();
    
    $path = storage_path('app/file.txt');

<a name="strings"></a>
## Cadenas

<a name="method-__"></a>
#### `__()` {#collection-method}

La función `__` traduce la cadena de traducción dada o clave de traducción dada usando tus [archivos de localización](/docs/{{version}}/localization):

    echo __('Welcome to our application');
    
    echo __('messages.welcome');

Si la cadena o llave de traducción especificada no existe, la función `__` retornará el valor dado. Así, usando el ejemplo de arriba, la función `__` podría retornar `messages.welcome` si esa clave de traducción no existe.

<a name="method-camel-case"></a>
#### `camel_case()` {#collection-method}

La función `camel_case` convierte la cadena dada a `camelCase`:

    $converted = camel_case('foo_bar');
    
    // fooBar

<a name="method-class-basename"></a>
#### `class_basename()` {#collection-method}

La función `class_basename` retorna el nombre de la clase de la clase dada con el nombre de espacio de la clase' removido:

    $class = class_basename('Foo\Bar\Baz');
    
    // Baz

<a name="method-e"></a>
#### `e()` {#collection-method}

La función `e` ejecuta la función de PHP `htmlspecialchars` con la opción `double_encode` establecida en`false`:

    echo e('<html>foo</html>');
    
    // &lt;html&gt;foo&lt;/html&gt;

<a name="method-ends-with"></a>
#### `ends_with()` {#collection-method}

La función `ends_with` determina si la cadena dada finaliza con el valor dado determines:

    $result = ends_with('This is my name', 'name');
    
    // true

<a name="method-kebab-case"></a>
#### `kebab_case()` {#collection-method}

La función `kebab_case` convierte la cadena dada a `kebab-case`:

    $converted = kebab_case('fooBar');
    
    // foo-bar

<a name="method-preg-replace-array"></a>
#### `preg_replace_array()` {#collection-method}

La función `preg_replace_array` reemplaza un patrón dado en la cadena secuencialmente usando un arreglo:

    $string = 'The event will take place between :start and :end';
    
    $replaced = preg_replace_array('/:[a-z_]+/', ['8:30', '9:00'], $string);
    
    // The event will take place between 8:30 and 9:00

<a name="method-snake-case"></a>
#### `snake_case()` {#collection-method}

La función `snake_case` convierte la cadena dada a `snake_case`:

    $converted = snake_case('fooBar');
    
    // foo_bar

<a name="method-starts-with"></a>
#### `starts_with()` {#collection-method}

La función `starts_with` determina si la cadena dada comienza con el valor dado:

    $result = starts_with('This is my name', 'This');
    
    // true

<a name="method-str-after"></a>
#### `str_after()` {#collection-method}

La función `str_after` retorna todo después del valor dado en una cadena:

    $slice = str_after('This is my name', 'This is');
    
    // ' my name'

<a name="method-str-before"></a>
#### `str_before()` {#collection-method}

La función `str_before` retorna todo antes del valor dado en una cadena:

    $slice = str_before('This is my name', 'my name');
    
    // 'This is '

<a name="method-str-contains"></a>
#### `str_contains()` {#collection-method}

La función `str_contains` determina si la cadena dada contiene el valor dado:

    $contains = str_contains('This is my name', 'my');
    
    // true

Tu puedes además pasar un arreglo de valores para determinar si la cadena dada contiene cualquiera de los valores:

    $contains = str_contains('This is my name', ['my', 'foo']);
    
    // true

<a name="method-str-finish"></a>
#### `str_finish()` {#collection-method}

La función `str_finish` agrega una instancia individual del valor dado a una cadena si este no finaliza con el valor:

    $adjusted = str_finish('this/string', '/');
    
    // this/string/
    
    $adjusted = str_finish('this/string/', '/');
    
    // this/string/

<a name="method-str-is"></a>
#### `str_is()` {#collection-method}

La función `str_is` determina si una cadena dada concuerda con un patrón dado. Asteriscos pueden ser usados para indicar comodines:

    $matches = str_is('foo*', 'foobar');
    
    // true
    
    $matches = str_is('baz*', 'foobar');
    
    // false

<a name="method-str-limit"></a>

#### `str_limit()` {#collection-method}

La función `str_limit` trunca la cadena dada en la longitud especificada:

    $truncated = str_limit('The quick brown fox jumps over the lazy dog', 20);
    
    // The quick brown fox...

Tu puedes además pasar un tercer argumento para cambiar la cadena que será adjuntada al final:

    $truncated = str_limit('The quick brown fox jumps over the lazy dog', 20, ' (...)');
    
    // The quick brown fox (...)

<a name="method-str-ordereduuid"></a>

#### `Str::orderedUuid` {#collection-method}

El método `Str::orderedUuid`  genera una "primera marca de tiempo" UUID que puede ser eficientemente almacenada en una columna indexada de la base de datos:

```
use Illuminate\Support\Str;

return (string) Str::orderedUuid();
```

<a name="method-str-plural"></a>

#### `str_plural()` {#collection-method}

La función `str_plural` convierte una cadena a su forma plural. Esta función actualmente solo soporta el lenguaje Inglés:

    $plural = str_plural('car');
    
    // cars
    
    $plural = str_plural('child');
    
    // children

Tu puedes además proveer un entero como un segundo argumento a la función para recuperar la forma singular o plural de la cadena:

    $plural = str_plural('child', 2);
    
    // children
    
    $plural = str_plural('child', 1);
    
    // child

<a name="method-str-random"></a>
#### `str_random()` {#collection-method}

La función `str_random` genera una cadena aleatoria con la longitud especificada. Esta función usa la función PHP`random_bytes` :

    $random = str_random(40);

<a name="method-str-replace-array"></a>
#### `str_replace_array()` {#collection-method}

La función `str_replace_array` reemplaza un valor dado en la cadena secuencialmente usando un arreglo:

    $string = 'The event will take place between ? and ?';
    
    $replaced = str_replace_array('?', ['8:30', '9:00'], $string);
    
    // The event will take place between 8:30 and 9:00

<a name="method-str-replace-first"></a>
#### `str_replace_first()` {#collection-method}

La función `str_replace_first` reemplaza la primera ocurrencia de un valor dado en una cadena:

    $replaced = str_replace_first('the', 'a', 'the quick brown fox jumps over the lazy dog');
    
    // a quick brown fox jumps over the lazy dog

<a name="method-str-replace-last"></a>
#### `str_replace_last()` {#collection-method}

La función `str_replace_last` reemplaza la última ocurrencia de un valor dado en una cadena:

    $replaced = str_replace_last('the', 'a', 'the quick brown fox jumps over the lazy dog');
    
    // the quick brown fox jumps over a lazy dog

<a name="method-str-singular"></a>
#### `str_singular()` {#collection-method}

La función `str_singular` convierte una cadena a su forma singular. Esta función actualmente solo soporta el lenguaje Inglés:

    $singular = str_singular('cars');
    
    // car
    
    $singular = str_singular('children');
    
    // child

<a name="method-str-slug"></a>
#### `str_slug()` {#collection-method}

La función `str_slug` genera una URL amigable "slug" de la cadena dada:

    $slug = str_slug('Laravel 5 Framework', '-');
    
    // laravel-5-framework

<a name="method-str-start"></a>
#### `str_start()` {#collection-method}

La función `str_start` agrega una instancia individual del valor dado a una cadena si esta no inicia con ese valor:

    $adjusted = str_start('this/string', '/');
    
    // /this/string
    
    $adjusted = str_start('/this/string/', '/');
    
    // /this/string

<a name="method-studly-case"></a>
#### `studly_case()` {#collection-method}

La función `studly_case` convierte la cadena dada a `StudlyCase`:

    $converted = studly_case('foo_bar');
    
    // FooBar

<a name="method-title-case"></a>
#### `title_case()` {#collection-method}

La función `title_case` convierte la cadena dada a`Title Case`:

    $converted = title_case('a nice title uses the correct case');
    
    // A Nice Title Uses The Correct Case

<a name="method-trans"></a>
#### `trans()` {#collection-method}

La función `trans` traduce la clave de traducción dada usando tus [archivos de localización](/docs/{{version}}/localization):

    echo trans('messages.welcome');

Si la clave de traducción especificada no existe, la función `trans` retornará la clave dada. Así, usando el ejemplo de arriba, la función `trans` podría retornar `messages.welcome` si la clave de traducción no existe.

<a name="method-trans-choice"></a>
#### `trans_choice()` {#collection-method}

La función `trans_choice` traduce la clave de traducción dada con inflexión:

    echo trans_choice('messages.notifications', $unreadCount);

Si la clave de traducción dada no existe, la función`trans_choice` returnará la clave dada. Así, usando el ejemplo de arriba, la función `trans_choice` podría retornar `messages.notifications` si la clave de traducción no existe.

<a name="method-str-uuid"></a>

#### `Str::uuid` {#collection-method}

El método `Str::uuid`  genera un UUID (Versión 4):

```
use Illuminate\Support\Str;

return (string) Str::uuid();
```

<a name="urls"></a>
## URLs

<a name="method-action"></a>
#### `action()` {#collection-method}

La función `action` genera una URL para la acción del controlador dada. Tu no necesitas pasar el nombre de espacio completo. En vez de eso, pasa al controlador el nombre de clase relativo al nombre de espacio a `App\Http\Controllers`:

    $url = action('HomeController@index');

Si el método acepta parámetros de ruta, tu puedes pasarlos como el segundo argumento al método:

    $url = action('UserController@profile', ['id' => 1]);

<a name="method-asset"></a>
#### `asset()` {#collection-method}

La función `asset` genera una URL para un asset usando el esquema actual de la solicitud (HTTP o HTTPS):

    $url = asset('img/photo.jpg');

<a name="method-secure-asset"></a>
#### `secure_asset()` {#collection-method}

La función `secure_asset` genera una URL para un asset usando HTTPS:

    $url = secure_asset('img/photo.jpg');

<a name="method-route"></a>
#### `route()` {#collection-method}

La función `route` genera una URL para el nombre de ruta dado:

    $url = route('routeName');

Si la ruta acepta parámetros, tu puedes pasarlos como el segundo argumento al método:

    $url = route('routeName', ['id' => 1]);

Por defecto, la función `route` genera una URL absoluta. Si deseas generar una URL relativa, puedes pasar `false` como el tercer argumento:

    $url = route('routeName', ['id' => 1], false);

<a name="method-secure-url"></a>
#### `secure_url()` {#collection-method}

La función `secure_url` genera una URL HTTPS completa a la ruta dada:

    $url = secure_url('user/profile');
    
    $url = secure_url('user/profile', [1]);

<a name="method-url"></a>
#### `url()` {#collection-method}

La función `url` genera una URL completa a la ruta dada:

    $url = url('user/profile');
    
    $url = url('user/profile', [1]);

Si no hay una ruta proveída, una instancia de `Illuminate\Routing\UrlGenerator` es retornada:

    $current = url()->current();
    
    $full = url()->full();
    
    $previous = url()->previous();

<a name="miscellaneous"></a>
## Diversos

<a name="method-abort"></a>
#### `abort()` {#collection-method}

La función `abort` arroja [una excepción HTTP](/docs/{{version}}/errors#http-exceptions) la cual será renderizada por el [manejador de excepciones](/docs/{{version}}/errors#the-exception-handler):

    abort(403);

Puedes además proporcionar el texto de respuesta de la excepción y las cabeceras de la respuesta personalizados:

    abort(403, 'Unauthorized.', $headers);

<a name="method-abort-if"></a>
#### `abort_if()` {#collection-method}

La función `abort_if` arroja una excepción HTTP si una expresión booleana dada es evaluada a`true`:

    abort_if(! Auth::user()->isAdmin(), 403);

Como el método `abort`, puedes proveer además el texto de respuesta para la excepción como el tercer argumento y un arreglo de cabeceras de respuesta personalizadas como el cuarto argumento.

<a name="method-abort-unless"></a>
#### `abort_unless()` {#collection-method}

La función `abort_unless` arroja una excepción HTTP si una expresión booleana dada es evaluada a `false`:

    abort_unless(Auth::user()->isAdmin(), 403);

Como el método `abort`, puedes proveer además  el texto de respuesta para la excepción como el tercer argumento y un arreglo de cabeceras de respuesta personalizadas como el cuarto argumento.

<a name="method-app"></a>
#### `app()` {#collection-method}

La función `app` retorna la instancia del [contenedor de servicio](/docs/{{version}}/container):

    $container = app();

Puedes pasar una clase o nombre de interfaz para resolverlo desde el contenedor:

    $api = app('HelpSpot\API');

<a name="method-auth"></a>
#### `auth()` {#collection-method}

La función `auth` retorna una instancia del [autenticador](/docs/{{version}}/authentication). Puedes usarla en vez del facade `Auth` por conveniencia:

    $user = auth()->user();

Si es necesario, puedes especificar con cual instancia del guard tu podrías acceder:

    $user = auth('admin')->user();

<a name="method-back"></a>
#### `back()` {#collection-method}

La función `back` genera [respuesta de redirección HTTP](/docs/{{version}}/responses#redirects) a la ubicación previa del usuario:

    return back($status = 302, $headers = [], $fallback = false);
    
    return back();

<a name="method-bcrypt"></a>
#### `bcrypt()` {#collection-method}

La función `bcrypt` [encripta](/docs/{{version}}/hashing) el valor dado usando Bcrypt. Puedes usarlo como una alternativa al facade `Hash`:

    $password = bcrypt('my-secret-password');

<a name="method-broadcast"></a>
#### `broadcast()` {#collection-method}

La función `broadcast` [emite](/docs/{{version}}/broadcasting) el [evento](/docs/{{version}}/events) dado a sus oyentes:

    broadcast(new UserRegistered($user));

<a name="method-blank"></a>
#### `blank()` {#collection-method}

La función `blank` retorna `true` si el valor dado es "vacío":

    blank('');
    blank('   ');
    blank(null);
    blank(collect());
    
    // true
    
    blank(0);
    blank(true);
    blank(false);
    
    // false

Para lo inverso de `blank`, mira el método [`filled`](#method-filled).

<a name="method-cache"></a>
#### `cache()` {#collection-method}

La función `cache` puede ser usado para obtener valor de la [cache](/docs/{{version}}/cache). Si la clave dada no existe en la cache, un valor opcional por defecto será retornado:

    $value = cache('key');
    
    $value = cache('key', 'default');

Puedes agregar elementos a la cache pasando un arreglo de pares clave / valor a la función. También debes pasar la cantidad de minutos o la duración que el valor almacenado en caché debe considerarse válido:

    cache(['key' => 'value'], 5);
    
    cache(['key' => 'value'], now()->addSeconds(10));

<a name="method-class-uses-recursive"></a>
#### `class_uses_recursive()` {#collection-method}

La función `class_uses_recursive` retorna todos los traits usados por una clase, incluyendo traits por todas las clases padre:

    $traits = class_uses_recursive(App\User::class);

<a name="method-collect"></a>
#### `collect()` {#collection-method}

La función `collect` crea una instancia de [colecciones](/docs/{{version}}/collections) del valor dado:

    $collection = collect(['taylor', 'abigail']);

<a name="method-config"></a>
#### `config()` {#collection-method}

La función `config` obtiene el valor de una variable de [configuración](/docs/{{version}}/configuration). Los valores de configuración pueden ser accesados usando la sintaxis "punto", la cual incluye el nombre del archivo y la opción que deseas acceder. Un valor por defecto puede ser especificado y es retornado si la opción de configuración no existe:

    $value = config('app.timezone');
    
    $value = config('app.timezone', $default);

Puedes establecer variables de configuración en tiempo de ejecución pasando un arreglo de pares clave / valor:

    config(['app.debug' => true]);

<a name="method-cookie"></a>
#### `cookie()` {#collection-method}

La función `cookie` crea una nueva instancia de [cookie](/docs/{{version}}/requests#cookies):

    $cookie = cookie('name', 'value', $minutes);

<a name="method-csrf-field"></a>
#### `csrf_field()` {#collection-method}

La función `csrf_field` genera un campo de entrada `hidden` que contiene el valor del token CSRF. por ejemplo, usando la [sintaxis de Blade](/docs/{{version}}/blade):

    {{ csrf_field() }}

<a name="method-csrf-token"></a>
#### `csrf_token()` {#collection-method}

La función `csrf_token` recupera el valor del actual token CSRF:

    $token = csrf_token();

<a name="method-dd"></a>
#### `dd()` {#collection-method}

La función `dd` desecha las variables dadas y finaliza la ejecución del script:

    dd($value);
    
    dd($value1, $value2, $value3, ...);

Si no quieres detener la ejecución de tu script, usa la función [`dump`](#method-dump) en su lugar.

<a name="method-decrypt"></a>
#### `decrypt()` {#collection-method}

La función `decrypt` desencripta el valor dado usando el [encriptador](/docs/{{version}}/encryption) de Laravel:

    $decrypted = decrypt($encrypted_value);

<a name="method-dispatch"></a>
#### `dispatch()` {#collection-method}

La función `dispatch` empuja el [trabajo](/docs/{{version}}/queues#creating-jobs) dado sobre la [cola de trabajos](/docs/{{version}}/queues) de Laravel:

    dispatch(new App\Jobs\SendEmails);

<a name="method-dispatch-now"></a>
#### `dispatch_now()` {#collection-method}

La función `dispatch_now` ejecuta el [trabajo](/docs/{{version}}/queues#creating-jobs) dado inmediatamente y retorna el valor de su método `handle`:

    $result = dispatch_now(new App\Jobs\SendEmails);

<a name="method-dump"></a>
#### `dump()` {#collection-method}

La función `dump` desecha las variables dadas:

    dump($value);
    
    dump($value1, $value2, $value3, ...);

Si quieres parar de ejecutar el script después de desechar las variables, usa la función [`dd`](#method-dd) en su lugar.

<a name="method-encrypt"></a>
#### `encrypt()` {#collection-method}

La función `encrypt` encripta el valor dado usando el [encriptador](/docs/{{version}}/encryption) de Laravel:

    $encrypted = encrypt($unencrypted_value);

<a name="method-env"></a>
#### `env()` {#collection-method}

La función `env` recupera el valor de una [variable de ambiente](/docs/{{version}}/configuration#environment-configuration) o retorna un valor por defecto:

    $env = env('APP_ENV');
    
    // Returns 'production' if APP_ENV is not set...
    $env = env('APP_ENV', 'production');

> {note} Si ejecutas el comando `config:cache` durante tu proceso de despliegue, deberías estar seguro que tu eres el único llamando a la función `env` desde dentro de tus archivos de configuración. Una vez la configuración está en caché, el archivo `.env` no será cargado y todas las llamadas a la función `.env` retornarán `null`.

<a name="method-event"></a>
#### `event()` {#collection-method}

La función `event` despacha el [event](/docs/{{version}}/events) dado a sus oyentes:

    event(new UserRegistered($user));

<a name="method-factory"></a>
#### `factory()` {#collection-method}

La función `factory` crea un constructor de modelos de fábrica para una clase dada, nombre y cantidad. Este puede ser usado mientras [testea](/docs/{{version}}/database-testing#writing-factories) o [seedea](/docs/{{version}}/seeding#using-model-factories):

    $user = factory(App\User::class)->make();

<a name="method-filled"></a>

#### `filled()` {#collection-method}

La función `filled` retorna el valor dado que no esté en "vacío":

    filled(0);
    filled(true);
    filled(false);
    
    // true
    
    filled('');
    filled('   ');
    filled(null);
    filled(collect());
    
    // false

Para el inverso de `filled`, mira el método [`blank`](#method-blank).

<a name="method-info"></a>
#### `info()` {#collection-method}

La función`info` escribirá información al [log](/docs/{{version}}/errors#logging):

    info('Some helpful information!');

Un arreglo de datos contextuales puede además ser pasado a la función:

    info('User login attempt failed.', ['id' => $user->id]);

<a name="method-logger"></a>
#### `logger()` {#collection-method}

La función `logger` puede ser usada para escribir mensaje de nivel `debug` al [log](/docs/{{version}}/errors#logging):

    logger('Debug message');

Un arreglo de datos contextuales puede además ser pasado a la función:

    logger('User has logged in.', ['id' => $user->id]);

Una instancia del [logger](/docs/{{version}}/errors#logging) será retornada si no hay valor pasado a la función:

    logger()->error('You are not allowed here.');

<a name="method-method-field"></a>
#### `method_field()` {#collection-method}

La función `method_field` genera un campo de entrada HTML `hidden` que contiene el valor falsificado del verbo de los formularios HTTP. Por ejemplo, usando la [sintaxis Blade](/docs/{{version}}/blade):

    <form method="POST">
        {{ method_field('DELETE') }}
    </form>

<a name="method-now"></a>
#### `now()` {#collection-method}

La función `now` crea una nueva instancia `Illuminate\Support\Carbon` para el tiempo actual:

    $now = now();

<a name="method-old"></a>
#### `old()` {#collection-method}

La función `old` [recupera](/docs/{{version}}/requests#retrieving-input) un [viejo valor de entrada](/docs/{{version}}/requests#old-input) flasheado en la sesión:

    $value = old('value');
    
    $value = old('value', 'default');

<a name="method-optional"></a>
#### `optional()` {#collection-method}

La función `optional` acepta cualquier argumento y te permite acceder a propiedades o métodos de llamada en ese objeto. Si el objeto dado es `null`, las propiedades y métodos retornarán `null` en vez de causar un error:

    return optional($user->address)->street;
    
    {!! old('name', optional($user)->name) !!}

Puedes llamar además métodos en el objeto retornado. Al igual que con la propiedad de acceso, si el objeto dado es `null` llamando a un método retornará `null` en vez de causar un error:

```
return optional($user)->getTwitterProfile();
```

Si el método que quieres llamar no está en el objeto en si, puedes pasar una función de retorno a `optional` como su segundo argumento:

```
return optional(User::find($id), function ($user) {
    return TwitterApi::findUser($user->twitter_id);
});
```

Si el objeto dado no es `null`, la función de retorno será llamada y su valor de retorno seré devuelto como está. Si el objeto dado es `null,` la función de retorno no será llamada, y `òptional` retornará `null` en vez de causar un error.

<a name="method-policy"></a>

#### `policy()` {#collection-method}

El método `policy` recupera una instancia de la [política](/docs/{{version}}/authorization#creating-policies) para una clase dada:

    $policy = policy(App\User::class);

<a name="method-redirect"></a>
#### `redirect()` {#collection-method}

La función `redirect` retorna [respuesta de redirección HTTP](/docs/{{version}}/responses#redirects), o retorna la instancia del redirector si no hay argumentos llamados:

    return redirect($to = null, $status = 302, $headers = [], $secure = null);
    
    return redirect('/home');
    
    return redirect()->route('route.name');

<a name="method-report"></a>
#### `report()` {#collection-method}

La función `report` reportará una excepción usando el método `report` de tu [manejador de excepciones](/docs/{{version}}/errors#the-exception-handler):

    report($e);

<a name="method-request"></a>
#### `request()` {#collection-method}

La función `request` retorna la instancia de la [solicitud](/docs/{{version}}/requests) actual u obtiene un ítem de entrada:

    $request = request();
    
    $value = request('key', $default = null);

<a name="method-rescue"></a>
#### `rescue()` {#collection-method}

La función `rescue` ejecuta la función de retorno dada y almacena en cache cualquier excepción que ocurra durante su ejecución. Todas las excepciones que son capturadas serán enviadas al método `report` de tu [manejador de excepciones](/docs/{{version}}/errors#the-exception-handler); no obstante, la solicitud continuará procesando:

    return rescue(function () {
        return $this->method();
    });

También puedes pasar un segundo argumento a la función `rescue`. Este argumento será el valor por "defecto" que debería ser retornado si una excepción ocurre mientras se ejecuta la función de retorno:

    return rescue(function () {
        return $this->method();
    }, false);
    
    return rescue(function () {
        return $this->method();
    }, function () {
        return $this->failure();
    });

<a name="method-resolve"></a>
#### `resolve()` {#collection-method}

La función `resolve` resuelve un nombre de clase o interfaz dado a su instancia usando el[contenedor de servicios](/docs/{{version}}/container):

    $api = resolve('HelpSpot\API');

<a name="method-response"></a>
#### `response()` {#collection-method}

La función `response` crea una instancia de [respuesta](/docs/{{version}}/responses) u obtiene una instancia del factory de respuesta:

    return response('Hello World', 200, $headers);
    
    return response()->json(['foo' => 'bar'], 200, $headers);

<a name="method-retry"></a>
#### `retry()` {#collection-method}

La función `retry` intenta ejecutar la función de retorno dada hasta que el máximo número de intentos límite se cumple. Si la función de retorno no arroja una excepción, su valor de retorno será retornado. Si la función de retorno arroja una excepción, se volverá a intentar automáticamente. Si el máximo número de intentos es excedido, la excepción será arrojada:

    return retry(5, function () {
        // Attempt 5 times while resting 100ms in between attempts...
    }, 100);

<a name="method-session"></a>
#### `session()` {#collection-method}

La función `session` puede ser usada para obtener o establecer valores de [session](/docs/{{version}}/session):

    $value = session('key');

Puedes establecer valores pasando un arreglo de pares clave / valor a la función:

    session(['chairs' => 7, 'instruments' => 3]);

La sesión almacenada será retornada si no se pasa un valor a la función:

    $value = session()->get('key');
    
    session()->put('key', $value);

<a name="method-tap"></a>
#### `tap()` {#collection-method}

La función `tap` acepta dos argumentos: un `$value` arbitrario y una función de retorno. El `$value` será pasado a la función de retorno y será retornado por la función `tap`. El valor de retorno de la función de retorno es irrelevante:

    $user = tap(User::first(), function ($user) {
        $user->name = 'taylor';
    
        $user->save();
    });

Si no hay función de retorno para la función `tap`, puedes llamar cualquier método en el `$value` dado. El valor de retorno del método al que llama siempre será `$value`, sin importar lo que el método retorna en su definición. Por ejemplo, el método de Eloquent `update` típicamente retorna un entero. Sin embargo, podemos forzar que el método retorne el modelo en si mismo encadenando el método `update` a través de la función `tap`:

    $user = tap($user)->update([
        'name' => $name,
        'email' => $email,
    ]);

<a name="method-today"></a>
#### `today()` {#collection-method}

La función `today` crear una nueva instancia de `Illuminate\Support\Carbon` para la fecha actual:

    $today = today();

<a name="method-throw-if"></a>
#### `throw_if()` {#collection-method}

La función `throw_if` arroja la excepción dada si una expresión booleana dada es evaluada a `true`:

    throw_if(! Auth::user()->isAdmin(), AuthorizationException::class);
    
    throw_if(
        ! Auth::user()->isAdmin(),
        AuthorizationException::class,
        'You are not allowed to access this page'
    );

<a name="method-throw-unless"></a>
#### `throw_unless()` {#collection-method}

La función `throw_unless` arroja la excepción dada si una expresión booleana dada es evaluada a `false`:

    throw_unless(Auth::user()->isAdmin(), AuthorizationException::class);
    
    throw_unless(
        Auth::user()->isAdmin(),
        AuthorizationException::class,
        'You are not allowed to access this page'
    );

<a name="method-trait-uses-recursive"></a>
#### `trait_uses_recursive()` {#collection-method}

La función `trait_uses_recursive` retorna todos los traits usados por un trait:

    $traits = trait_uses_recursive(\Illuminate\Notifications\Notifiable::class);

<a name="method-transform"></a>
#### `transform()` {#collection-method}

La función `transform` ejecuta una función de retorno en un valor dado si el valor no está en [vacío](#method-blank) y retorna el resultado de la función de retorno`:

    $callback = function ($value) {
        return $value * 2;
    };
    
    $result = transform(5, $callback);
    
    // 10

Un valor o `Closure` puede ser pasado como el tercer parámetro al método. Este valor será retornado si el valor dado es vacío:

    $result = transform(null, $callback, 'The value is blank');
    
    // The value is blank

<a name="method-validator"></a>
#### `validator()` {#collection-method}

La función `validator` crea un nueva instancia del [validador](/docs/{{version}}/validation) con los argumentos dados. Puedes usarlo en vez del facade `Validator` por conveniencia:

    $validator = validator($data, $rules, $messages);

<a name="method-value"></a>
#### `value()` {#collection-method}

La función `value` retorna el valor que se de da. Sin embargo, si pasas un `Closure` a la función, el `Closure` será ejecutado y su resultado será devuelto:

    $result = value(true);
    
    // true
    
    $result = value(function () {
        return false;
    });
    
    // false

<a name="method-view"></a>
#### `view()` {#collection-method}

La función `view` recupera una instancia de la [vista](/docs/{{version}}/views) :

    return view('auth.login');

<a name="method-with"></a>
#### `with()` {#collection-method}

La función `with` retorna el que se le da. Si se le pasa un `Closure` como segundo argumento a la función, el `Closure` será ejecutado y su resultado será devuelto:

    $callback = function ($value) {
        return (is_numeric($value)) ? $value * 2 : 0;
    };
    
    $result = with(5, $callback);
    
    // 10
    
    $result = with(null, $callback);
    
    // 0
    
    $result = with(5, null);
    
    // 5
