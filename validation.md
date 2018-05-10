# Validación

- [Introducción](#introduction)
- [Inicio Rápido de Validación](#validation-quickstart)
    - [Definiendo las Rutas](#quick-defining-the-routes)
    - [Creando el Controlador](#quick-creating-the-controller)
    - [Escribiendo la Lógica de Validación](#quick-writing-the-validation-logic)
    - [Mostrando los Errores de Validación](#quick-displaying-the-validation-errors)
    - [Una Observación Sobre los Campos Opcionales](#a-note-on-optional-fields)
- [Validación de Solicitude de Formulario](#form-request-validation)
    - [Creando Solicitudes de Formulario](#creating-form-requests)
    - [Autorizando Solicitudes de Formulario](#authorizing-form-requests)
    - [Personalizando los Mensajes de Error](#customizing-the-error-messages)
- [Creando Validadores Manualmente](#manually-creating-validators)
    - [Redirección Automática](#automatic-redirection)
    - [Paquetes de Errores Nombrados](#named-error-bags)
    - [Hook de Validación Posterior](#after-validation-hook)
- [Trabajando con los Mensajes de Error](#working-with-error-messages)
    - [Personalizar los Mensajes de Error](#custom-error-messages)
- [Reglas de Validación Disponibles](#available-validation-rules)
- [Agregando Reglas Condicionalmente](#conditionally-adding-rules)
- [Validando Arreglos](#validating-arrays)
- [Personalizar las Reglas de Validación](#custom-validation-rules)
    - [Usando Objetos de Regla](#using-rule-objects)
    - [Usando Extensiones](#using-extensions)

<a name="introduction"></a>
## Introducción

Laravel proporciona varios enfoques diferentes para validar los datos entrantes de tu aplicación. De forma predeterminada, la clase base del controlador de Laravel usa una característica `ValidatesRequests` la cual proporciona un método conveniente para validar la solicitud HTTP entrante con una variedad de poderosas reglas de validación.

<a name="validation-quickstart"></a>
## Inicio Rápido de Validación

Para aprender sobre las poderosas características de validación de Laravel, vamos a observar un ejemplo completo validando un formulario y mostrando los mensajes de error devueltos al usuario.

<a name="quick-defining-the-routes"></a>
### Definiendo las Rutas

Primero, vamos a asumir que tenemos las rutas siguientes definidas en nuestro archivo `routes/web.php`:

    Route::get('post/create', 'PostController@create');

    Route::post('post', 'PostController@store');

Ciertamente, la ruta `GET` mostrará un formulario al usuario para crear un nuevo post de blog, mientras que la ruta `POST` guardará el nuevo post de blog en la base de datos.

<a name="quick-creating-the-controller"></a>
### Creando el Controlador

Luego, vamos a observar un simple controlador que maneja estas rutas. Dejaremos el método `store` vacío por ahora:

    <?php

    namespace App\Http\Controllers;

    use Illuminate\Http\Request;
    use App\Http\Controllers\Controller;

    class PostController extends Controller
    {
        /**
         * Show the form to create a new blog post.
         *
         * @return Response
         */
        public function create()
        {
            return view('post.create');
        }

        /**
         * Store a new blog post.
         *
         * @param  Request  $request
         * @return Response
         */
        public function store(Request $request)
        {
            // Validate and store the blog post...
        }
    }

<a name="quick-writing-the-validation-logic"></a>
### Escribiendo la Lógica de Validación

Ahora estamos listos para completar nuestro método `store` con la lógica para validar el nuevo post de blog. Para hacer esto, usaremos el método `validate` proporcionado por el objeto `Illuminate\Http\Request`. Si las reglas de validación pasan, tu código continuará su ejecución normalmente; sin embargo, si la validación falla, se arrojará una excepción y la respuesta de error apropiada será devuelta automáticamente al usuario. En el caso de una solicitud HTTP tradicional, se generará una respuesta de redirección, mientras una respuesta JSON será enviada para las solicitudes AJAX.

Para lograr una mejor comprensión del método `validate`, regresemos al método `store`:

    /**
     * Store a new blog post.
     *
     * @param  Request  $request
     * @return Response
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'title' => 'required|unique:posts|max:255',
            'body' => 'required',
        ]);

        // The blog post is valid...
    }

Como puedes ver, pasamos las reglas de validación deseadas dentro del método `validate`. Otra vez, si la validación falla, se generará la respuesta apropiada. Si la validación pasa, nuestro controlador continuará la ejecución normalmente.

#### Deteniendo en la Primera Falla de Validación

Algunas veces puede que desees detener la ejecución de las reglas de validación sobre un atributo después de la primera falla de validación. Para hacer eso, asigna la regla `bail` al atributo:

    $request->validate([
        'title' => 'bail|required|unique:posts|max:255',
        'body' => 'required',
    ]);

En este ejemplo, si la regla `unique` del atributo `title` falla, la regla `max` no será chequeada. Las reglas serán validadas en el orden que sean asignadas.

#### Una Obsevación Sobre los Atributos Anidados

Si tu solicitud HTTP contiene parámetros "anidados", puedes especificarlos en tus reglas de validación usando la sintaxis de "punto":

    $request->validate([
        'title' => 'required|unique:posts|max:255',
        'author.name' => 'required',
        'author.description' => 'required',
    ]);

<a name="quick-displaying-the-validation-errors"></a>
### Mostrando los Errores de Validación

¿Qué si los parámetros de solicitud entrantes no pasan las reglas de validación dados? Cómo mencionamos anteriormente, Laravel redirigirá al usuario de regreso a su ubicación previa. En adición, todos los errores de validación serán automáticamente [movidos instantáneamente a la sesión](/docs/{{version}}/session#flash-data).

De nuevo, observa que no tuvimos que enlazar explícitamente los mensajes de error con la vista en nuestra ruta `GET`. Esto es porque Laravel revisará los errores en la sesión de datos, y los enlazará automáticamente a la vista si están disponibles. La variable `$errors` será una instancia de `Illuminate\Support\MessageBag`. Para mayor información sobre como trabajar con este objeto, [revisa su documentación](#working-with-error-messages).

> {tip} La variable `$errors` es enlazada a la vista por el middleware `Illuminate\View\Middleware\ShareErrorsFromSession`, el cual es proporcionado por el grupo de middleware `web`. **Cuando este middleware se aplique a una variable `$errors` siempre estará disponible en tus vistas**, permitiendo que asumas convenientemente que la variable `$errors` está definida siempre y puede ser usada con seguridad.

Así, en nuestro ejemplo, el usuario será redirigido al método `create` de nuestro controlador cuando la validación falle, permitiéndonos que muestre los mensajes de error en la vista:

    <!-- /resources/views/post/create.blade.php -->

    <h1>Create Post</h1>

    @if ($errors->any())
        <div class="alert alert-danger">
            <ul>
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <!-- Create Post Form -->

<a name="a-note-on-optional-fields"></a>
### Una Observación Sobre los Campos Opcionales

De forma predeterminada, Laravel incluye los middleware `TrimStrings` y `ConvertEmptyStringsToNull` en la pila global de middleware de tu aplicación. Estos middleware son listados en la pila por la clase `App\Http\Kernel`. Por causa de esto, con frecuencia necesitarás marcar tus campos "opcionales" de solicitud como `nullable` si no quieres que el validador considere los valores `null` como no válidos. Por ejemplo:

    $request->validate([
        'title' => 'required|unique:posts|max:255',
        'body' => 'required',
        'publish_at' => 'nullable|date',
    ]);

En este ejemplo, estamos especificando que el campo `publish_at` puede que sea o `null` o una representación de fecha válida. Si el modificador `nullable` no es agregado a la definición de la regla, el validador consideraría el `null` como una fecha no válida.

<a name="quick-ajax-requests-and-validation"></a>
#### Solicitudes AJAX & Validación

En este ejemplo, usamos un formulario tradicional para enviar datos a la aplicación. Sin embargo, muchas aplicaciones usan solicitudes AJAX. Al momento de usar el método `validate` durante una solicitud AJAX, Laravel no generará una respuesta de redirigir. En su lugar, Laravel genera una respuesta JSON conteniendo todos los errores de validación. Esta respuesta JSON será enviada con un código de estado HTTP 422.

<a name="form-request-validation"></a>
## Validación de Solicitud de Formulario

<a name="creating-form-requests"></a>
### Creando Solicitudes de Formulario

Para escenarios de validación más complejos, puede que desees crear una "solicitud de formulario". Las solicitudes de formularios son clases de solicitud personalizadas que contienen la lógica de validación. Para crear una clase de solicitud de formulario, usa el comando  de CLI de Artisan `make:request`:

    php artisan make:request StoreBlogPost

La clase generada será colocada en el directorio `app/Http/Requests`. Si este directorio no existe, será creado cuando ejecutes el comando `make:request`. Agreguemos unas cuantas reglas de validación al método `rules`:

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'title' => 'required|unique:posts|max:255',
            'body' => 'required',
        ];
    }

Así que, ¿Cómo son evaluadas las reglas de validación?, Todo lo que necesitas hacer es poner la referencia de la solicitud en tu método de controlador. La solicitud de formulario entrante es validada antes de que el método de controlador sea ejecutado, significa que no necesitas complicar tu controlador con ninguna lógica de validación:

    /**
     * Store the incoming blog post.
     *
     * @param  StoreBlogPost  $request
     * @return Response
     */
    public function store(StoreBlogPost $request)
    {
        // The incoming request is valid...
    }

Si la validación falla, una respuesta de redirigir será generada para enviar al usuario de vuelta a su ubicación previa. Los errores también serán movidos instantáneamente a la sesión de modo que estén disponibles para mostrarlos. Si la solicitud fuese una solicitud AJAX, una respuesta HTTP con un código de estado 422 será devuelta al usuario incluyendo una representación JSON de los errores de validación.

#### Agregando Hooks Posteriores a Solicitudes de Formularios

Si prefieres agregar un hook "posterior" a una solicitud de formulario, puedes usar el método `withValidator`. Este método recibe el validador completamente construido, permitiendo que ejecutes cualquiera de sus métodos antes de que las reglas de validación sean evaluadas realmente:

    /**
     * Configure the validator instance.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if ($this->somethingElseIsInvalid()) {
                $validator->errors()->add('field', 'Something is wrong with this field!');
            }
        });
    }

<a name="authorizing-form-requests"></a>
### Autorizando Solicitudes de Formularios

La clase solicitud de formulario también contiene un método `authorize`. Dentro de este método, puedes verificar si el usuario autenticado realmente tiene la autoridad para actualizar un recurso dado. Por ejemplo, puedes determinar si un usuario posee un comentario de blog que está intentando actualizar:

    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        $comment = Comment::find($this->route('comment'));

        return $comment && $this->user()->can('update', $comment);
    }

Dado que todas las solicitudes de formularios extienden la clase de solicitud base de Laravel, podemos usar el método `user` para acceder al usuario actualmente autenticado. También observa la llamada al método `route` en el ejemplo anterior. Este método te otorga acceso a los parámetros de URI definidos en la ruta que es ejecutada, tal como el parámetro `{comment}` en el ejemplo de abajo:

    Route::post('comment/{comment}');

Si el método `authorize` devuelve `false`, una respuesta HTTP con un código de estado 403 será devuelta automáticamente y tu método de controlador no se ejecutará.

Si planeas tener la lógica de autorización en otra parte de tu aplicación, devuelve `true` desde el método `authorize`:

    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

<a name="customizing-the-error-messages"></a>
### Personalizando los Mensajes de Error

Puedes personalizar los mensajes de error usados por la solicitud de formulario al sobrescribir el método `messages`. Este método debería devolver un arreglo de atributos / pares de regla y sus correspondientes mensajes de error:

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'title.required' => 'A title is required',
            'body.required'  => 'A message is required',
        ];
    }

<a name="manually-creating-validators"></a>
## Creando Validadores Manualmente

Si no quieres usar el método `messages` en la solicitud, puedes crear una instancia de validador manualmente usando la clase [facade](/docs/{{version}}/facades) `Validator`. El método `make` en la clase facade genera una nueva instancia de validador:

    <?php

    namespace App\Http\Controllers;

    use Validator;
    use Illuminate\Http\Request;
    use App\Http\Controllers\Controller;

    class PostController extends Controller
    {
        /**
         * Store a new blog post.
         *
         * @param  Request  $request
         * @return Response
         */
        public function store(Request $request)
        {
            $validator = Validator::make($request->all(), [
                'title' => 'required|unique:posts|max:255',
                'body' => 'required',
            ]);

            if ($validator->fails()) {
                return redirect('post/create')
                            ->withErrors($validator)
                            ->withInput();
            }

            // Store the blog post...
        }
    }

El primer argumento pasado al métod `make` son los datos bajo validación. El segundo argumento son las reglas de validación que deberían ser aplicadas a los datos.

Después de verificar si la validación de solicitud falló, puedes usar el método `withErrors` para mover instantáneamente los mensajes de error a la sesión. Al momento de usar este método, la variable `$errors` será compartida automáticamente con tus vistas después de la redirección, permitiendo que los muestres de vuelta al usuario. El método `withErrors` acepta un validador, un `MessageBag`, o un `array` de PHP.

<a name="automatic-redirection"></a>
### Redirección Automática

Si prefieres crear manualmente una instancia de validador pero aún tomar ventaja de la redirección automática ofrecida por el método `validate` de la solicitud, puedes ejecutar el método `validate` en una instancia de validador existente. Si la validación falla, el usuario automáticamente será redirigido o, en el caso de una solicitud AJAX, le será devuelta una respuesta JSON:

    Validator::make($request->all(), [
        'title' => 'required|unique:posts|max:255',
        'body' => 'required',
    ])->validate();

<a name="named-error-bags"></a>
### Paquetes de Errores Nombrados

Si tienes múltiples formularios en una sola página, puede que desees nombrar el `MessageBag` de errores, permitiendo que obtengas los mensajes de error para un formulario específico. Pasa un nombre como segundo argumento a `withErrors`:

    return redirect('register')
                ->withErrors($validator, 'login');

Entonces puedes acceder la instancia de `MessageBag` nombrada de la variable `$errors`:

    {{ $errors->login->first('email') }}

<a name="after-validation-hook"></a>
### Hook de Validación Posterior

El validador también permite que adjuntes funciones de retorno para que sean ejecutadas después que se complete la validación. Esto permite que ejecutes fácilmente validación adicional e incluso agregar más mensajes de error a la colección de mensajes. Para empezar, usa el método `after` en una instancia de validador:

    $validator = Validator::make(...);

    $validator->after(function ($validator) {
        if ($this->somethingElseIsInvalid()) {
            $validator->errors()->add('field', 'Something is wrong with this field!');
        }
    });

    if ($validator->fails()) {
        //
    }

<a name="working-with-error-messages"></a>
## Trabajando con los Mensajes de Error

Después de ejecutar el método `errors` en una instancia `Validator`, recibirás una instancia `Illuminate\Support\MessageBag`, la cual tiene una variedad de métodos convenientes para trabajar con los mensajes de error. La variable `$errors` que se hace disponible automáticamente para todas las vistas también es una instancia de la clase `MessageBag`.

#### Obteniendo el Primer Mensaje de Error para un Campo

Para obtener el primer mensaje de error para un campo dado, usa el método `first`:

    $errors = $validator->errors();

    echo $errors->first('email');

#### Obteniendo Todos los Mensajes de Error para un Campo

Si necesitas obtener un arreglo de todos los mensajes para un campo dado, usa el método `get`:

    foreach ($errors->get('email') as $message) {
        //
    }

Si estás validando un campo de formulario de arreglo, puedes obtener todos los mensajes para cada uno de los elementos de arreglo usando el caracter `*`:

    foreach ($errors->get('attachments.*') as $message) {
        //
    }

#### Obteniendo Todos los Mensajes de Error para Todos los Campos

Para obtener un arreglo de todos los mensajes para todos los campos, usa el método `all`:

    foreach ($errors->all() as $message) {
        //
    }

#### Determinando Si Existen Mensajes para un Campo

El método `has` puede ser usado para determinar si existe algún mensaje de error para un campo dado:

    if ($errors->has('email')) {
        //
    }

<a name="custom-error-messages"></a>
### Mensajes de Error Personalizados

Si es necesario, puedes usar mensajes de error personalizados en vez de los predeterminados. Hay varias formas para especificar mensajes personalizados. Primero, puedes pasar los mensajes personalizados como tercer argumento al método `Validator::make`:

    $messages = [
        'required' => 'The :attribute field is required.',
    ];

    $validator = Validator::make($input, $rules, $messages);

En este ejemplo, el marcador `:attribute` será reemplazado por el nombre real del campo bajo validación. También puedes utilizar otros marcadores en mensajes de validación. Por ejemplo:

    $messages = [
        'same'    => 'The :attribute and :other must match.',
        'size'    => 'The :attribute must be exactly :size.',
        'between' => 'The :attribute value :input is not between :min - :max.',
        'in'      => 'The :attribute must be one of the following types: :values',
    ];

#### Especificando un Mensaje Personalizado para un Atributo Dado

Algunas veces puedes querer especificar un mensaje de error personalizado sólo para un campo específico. Puedes hacer eso usando notación "punto". Especifica el nombre del atributo al principio, seguido por la regla:

    $messages = [
        'email.required' => 'We need to know your e-mail address!',
    ];

<a name="localization"></a>
#### Especificando Mensajes Personalizados en Archivos por Idiomas

En muchos casos, probablemente especificarás tus mensajes personalizados en un archivo de idioma en lugar de pasarlos directamente al `Validator`. Para hacer eso, agrega tus mensajes al arreglo `custom` en el archivo de idioma `resources/lang/xx/validation.php`.

    'custom' => [
        'email' => [
            'required' => 'We need to know your e-mail address!',
        ],
    ],

#### Especificando los Atributos Personalizados en Archivos de Idiomas

Si prefieres que la porción `:attribute` de tu mensaje de validación sea reemplazada con un nombre de atributo personalizado, puedes especificar el nombre personalizado en el arreglo `attributes` de tu archivo de idioma `resources/lang/xx/validation.php`:

    'attributes' => [
        'email' => 'email address',
    ],

<a name="available-validation-rules"></a>
## Reglas de Validación Disponibles

Debajo hay una lista con todas las reglas de validación disponibles y su función:

<style>
    .collection-method-list > p {
        column-count: 3; -moz-column-count: 3; -webkit-column-count: 3;
        column-gap: 2em; -moz-column-gap: 2em; -webkit-column-gap: 2em;
    }

    .collection-method-list a {
        display: block;
    }
</style>

<div class="collection-method-list" markdown="1">

[Accepted](#rule-accepted)
[Active URL](#rule-active-url)
[After (Date)](#rule-after)
[After Or Equal (Date)](#rule-after-or-equal)
[Alpha](#rule-alpha)
[Alpha Dash](#rule-alpha-dash)
[Alpha Numeric](#rule-alpha-num)
[Array](#rule-array)
[Before (Date)](#rule-before)
[Before Or Equal (Date)](#rule-before-or-equal)
[Between](#rule-between)
[Boolean](#rule-boolean)
[Confirmed](#rule-confirmed)
[Date](#rule-date)
[Date Equals](#rule-date-equals)
[Date Format](#rule-date-format)
[Different](#rule-different)
[Digits](#rule-digits)
[Digits Between](#rule-digits-between)
[Dimensions (Image Files)](#rule-dimensions)
[Distinct](#rule-distinct)
[E-Mail](#rule-email)
[Exists (Database)](#rule-exists)
[File](#rule-file)
[Filled](#rule-filled)
[Image (File)](#rule-image)
[In](#rule-in)
[In Array](#rule-in-array)
[Integer](#rule-integer)
[IP Address](#rule-ip)
[JSON](#rule-json)
[Max](#rule-max)
[MIME Types](#rule-mimetypes)
[MIME Type By File Extension](#rule-mimes)
[Min](#rule-min)
[Nullable](#rule-nullable)
[Not In](#rule-not-in)
[Numeric](#rule-numeric)
[Present](#rule-present)
[Regular Expression](#rule-regex)
[Required](#rule-required)
[Required If](#rule-required-if)
[Required Unless](#rule-required-unless)
[Required With](#rule-required-with)
[Required With All](#rule-required-with-all)
[Required Without](#rule-required-without)
[Required Without All](#rule-required-without-all)
[Same](#rule-same)
[Size](#rule-size)
[String](#rule-string)
[Timezone](#rule-timezone)
[Unique (Database)](#rule-unique)
[URL](#rule-url)


</div>

<a name="rule-accepted"></a>
#### accepted

El campo bajo validación debe ser _yes_, _on_, _1_, o _true_. Esto es útil para la aceptación de "Términos de Servicio" de validación

<a name="rule-active-url"></a>
#### active_url

El campo bajo validación debe tener un registro A o AAAA válido de acuerdo a la función de PHP `dns_get_record`.

<a name="rule-after"></a>
#### after:_date_

El campo bajo validación debe ser un valor después de una fecha dada. Las fechas serán pasadas a la función de PHP `strtotime`:

    'start_date' => 'required|date|after:tomorrow'

En lugar de pasar una cadena de fecha para que sea evaluada por `strtotime`, puedes especificar otro campo para contra que comparar la fecha:

    'finish_date' => 'required|date|after:start_date'

<a name="rule-after-or-equal"></a>
#### after\_or\_equal:_date_

El campo bajo validación debe ser un valor después o igual a la fecha dada. Para mayor información, observa la regla [Posterior a](#rule-after).

<a name="rule-alpha"></a>
#### alpha

El campo bajo validación debe estar compuesto completamente por caracteres alfabéticos.

<a name="rule-alpha-dash"></a>
#### alpha_dash

El campo bajo validación puede tener caracteres alfanuméricos, al igual que guiones cortos y guiones largos.

<a name="rule-alpha-num"></a>
#### alpha_num

El campo bajo validación debe estar compuesto completamente por caracteres alfanuméricos.

<a name="rule-array"></a>
#### array

El campo bajo validación debe ser un `array` de PHP.

<a name="rule-before"></a>
#### before:_date_

El campo bajo validación debe ser un valor que preceda la fecha dada. Las fechas serán pasadas a la función PHP `strtotime`.

<a name="rule-before-or-equal"></a>
#### before\_or\_equal:_date_

Este campo bajo validación debe ser un valor que preceda o igual a la fecha dada. Las fechas serán pasadas a la función de PHP `strtotime`.

<a name="rule-between"></a>
#### between:_min_,_max_

El campo bajo validación debe tener un tamaño entre los valores _min_ y _max_ dados. Las cadenas, números, arreglos, y archivos se evalúan en la misma forma que la regla [`size`](#rule-size).

<a name="rule-boolean"></a>
#### boolean

El campo bajo validación debe poder ser convertido como un booleano. Las entrada aceptadas son `true`, `false`, `1`, `0`, `"1"`, y `"0"`.

<a name="rule-confirmed"></a>
#### confirmed

El campo bajo validación debe tener un campo que coincida con `foo_confirmation`. Por ejemplo, si el campo bajo validación es `password`, un campo `password_confirmation` que coincida debe estar presente en la entrada.

<a name="rule-date"></a>
#### date

El campo bajo validación debe ser una fecha válida de acuerdo a la función de PHP `strtotime`.

<a name="rule-date-equals"></a>
#### date_equals:_date_

El campo bajo validación debe ser igual a la fecha dada. Las fechas serán pasadas en la función `strtotime` de PHP.

<a name="rule-date-format"></a>
#### date_format:_format_

El campo bajo validación debe coincidir con el _format_ dado. Deberías usar **o** `date` o `date_format` al momento de validar un campo, no ambos.

<a name="rule-different"></a>
#### different:_field_

El campo bajo validación debe tener un valor distinto de _field_.

<a name="rule-digits"></a>
#### digits:_value_

El campo bajo validación debe ser _numeric_ y debe tener una longitud exacta de _value_.

<a name="rule-digits-between"></a>
#### digits_between:_min_,_max_

El campo bajo validación debe tener una longitud entre los valores de _min_ y _max_ dados.

<a name="rule-dimensions"></a>
#### dimensions

El archivo bajo validación debe ser una imagen que cumpla con las restricciones de dimensión como las especificadas por los parámetros de la regla:

    'avatar' => 'dimensions:min_width=100,min_height=200'

Las restricciones disponibles son: _min\_width_, _max\_width_, _min\_height_, _max\_height_, _width_, _height_, _ratio_.

Una restricción _ratio_ debería ser representada como el ancho dividido por la altura. Esto puede ser especificado o por una instrucción como `3/2` o en decimal como `1.5`:

    'avatar' => 'dimensions:ratio=3/2'

Dado que esta regla requiere varios argumentos, puedes usar el método `Rule::dimensions` para construir con fluidez la regla:

    use Illuminate\Validation\Rule;

    Validator::make($data, [
        'avatar' => [
            'required',
            Rule::dimensions()->maxWidth(1000)->maxHeight(500)->ratio(3 / 2),
        ],
    ]);

<a name="rule-distinct"></a>
#### distinct

Al momento de trabajar con arreglos, el campo bajo validación no debe tener ningún valor duplicado.

    'foo.*.id' => 'distinct'

<a name="rule-email"></a>
#### email

El campo bajo validación debe estar formateado como una dirección de correo electrónica.

<a name="rule-exists"></a>
#### exists:_table_,_column_

El campo bajo validación debe existir en una tabla de base de datos dada.

#### Uso Básico de la Regla Existe

    'state' => 'exists:states'

#### Especificando un Nombre de Columna Personalizado

    'state' => 'exists:states,abbreviation'

Ocasionalmente, puedes necesitar especificar una conexión de base de datos para que sea usada por la consulta de `exists`. Puedes acompañar esto al anteponer al nombre de la conexión el nombre de la tabla usando syntaxis "punto":

    'email' => 'exists:connection.staff,email'

Si prefieres personalizar la consulta ejecutada por la regla de validación, puedes usar la clase `Rule` para definir con fluidez la regla. En este ejemplo, también especificaremos las reglas de validación como un arreglo en vez de usar el carácter `|` para delimitarlas.

    use Illuminate\Validation\Rule;

    Validator::make($data, [
        'email' => [
            'required',
            Rule::exists('staff')->where(function ($query) {
                $query->where('account_id', 1);
            }),
        ],
    ]);

<a name="rule-file"></a>
#### file

El campo bajo validación debe ser un archivo que sea cargado exitosamente.

<a name="rule-filled"></a>
#### filled

El campo bajo validación no debe estar vacío cuando esté presente. 

<a name="rule-image"></a>
#### image

El archivo bajo validación debe ser una imagen (jpeg, png, bmp, gif, or svg)

<a name="rule-in"></a>
#### in:_foo_,_bar_,...

El archivo bajo validación debe estar incluidos en la lista dada de valores. Debido a que esta regla requiere con frecuencia que hagas `implode` a un arreglo, el método `Rule::in` puede ser usado para construir fluidamente la regla:

    use Illuminate\Validation\Rule;

    Validator::make($data, [
        'zones' => [
            'required',
            Rule::in(['first-zone', 'second-zone']),
        ],
    ]);

<a name="rule-in-array"></a>
#### in_array:_anotherfield_

El campo bajo validación debe existir en los valores de _anotherfield_.

<a name="rule-integer"></a>
#### integer

El campo bajo validación debe ser un entero.

<a name="rule-ip"></a>
#### ip

El campo bajo validación debe ser una dirección IP.

#### ipv4

El campo bajo validación debe ser una dirección IPv4.

#### ipv6

El campo bajo validación debe ser una dirección IPv6.

<a name="rule-json"></a>
#### json

El campo bajo validación debe ser una cadena JSON válida.

<a name="rule-max"></a>
#### max:_value_

El campo bajo validación debe ser menor que o igual a un _value_ máximo. Las cadenas, los números, los arreglos, y los archivos son evaluados de la misma forma como la regla [`size`](#rule-size).

<a name="rule-mimetypes"></a>
#### mimetypes:_text/plain_,...

El archivo bajo validación debe coincidir con uno de los tipos MIME dados:

    'video' => 'mimetypes:video/avi,video/mpeg,video/quicktime'

Para determinar el tipo MIME del archivo cargado, el contenido del archivo será leído y el framework intentará suponer el tipo MIME, el cual puede ser distinto del tipo MIME proporcionado por el cliente.

<a name="rule-mimes"></a>
#### mimes:_foo_,_bar_,...

El archivo bajo validación debe tener un tipo MIME correspondiente a uno con las extensiones listadas.

#### Uso Básico de la Regla MIME

    'photo' => 'mimes:jpeg,bmp,png'

Incluso aunque solamente necesites especificar las extensiones, esta regla en realidad valida contra el tipo MIME del archivo al leer los contenidos del archivo e imaginar su tipo MIME.

Una lista completa de tipos MIME y sus correspondientes extensiones pueden ser encontrados en la siguiente ubicación: [https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types](https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types)

<a name="rule-min"></a>
#### min:_value_

El campo bajo validación deben tener un _value_ mínimo. Las cadenas, los números, los arreglos, y los archivos son evaluados en la misma forma como la regla [`size`](#rule-size).

<a name="rule-nullable"></a>
#### nullable

El campo bajo validación puede ser `null`. Esto es particularmente útil al momento de validar tipos primitivos tales como cadenas y enteros que pueden contener valores `null`.

<a name="rule-not-in"></a>
#### not_in:_foo_,_bar_,...

El campo bajo validación no debe estar incluido en la lista dada de valores. El método `Rule::notIn` puede ser usado para construir fluidamente la regla:

    use Illuminate\Validation\Rule;

    Validator::make($data, [
        'toppings' => [
            'required',
            Rule::notIn(['sprinkles', 'cherries']),
        ],
    ]);

<a name="rule-numeric"></a>
#### numeric

El campo bajo validación debe ser numérico.

<a name="rule-present"></a>
#### present

El campo bajo validación debe estar presente en los datos de entrada pero puede estar vacío.

<a name="rule-regex"></a>
#### regex:_pattern_

El campo bajo validación debe coincidir con la expresión regular dada.

**Nota:** Al momento de usar el patrón `regex`, puede ser necesario especificar reglas en un arreglo en lugar de usar delimitadores de barra, especialmente si la expresión regular contiene un carácter barra.

<a name="rule-required"></a>
#### required

El campo bajo validación debe estar presente entre los datos entrada y no vacío. Un campo es considerado "vacío" si una de las siguientes condiciones son ciertas:

<div class="content-list" markdown="1">

- El valor es `null`.
- El valor es una cadena vacía.
- El valor es un arreglo vacío o un objeto `Countable` vacío.
- El valor es un archivo cargado sin ruta.

</div>

<a name="rule-required-if"></a>
#### required_if:_anotherfield_,_value_,...

El campo bajo validación debe estar presente y no vacío si el campo _anotherfield_ es igual a cualquier _value_.

<a name="rule-required-unless"></a>
#### required_unless:_anotherfield_,_value_,...

El campo bajo validación debe estar presente y no vacío a menos que el campo _anotherfield_ sea igual a cualquier _value_.

<a name="rule-required-with"></a>
#### required_with:_foo_,_bar_,...

El campo bajo validación debe estar presente y no vacío _solamente si_ cualquiera de los otros campos especificados están presentes.

<a name="rule-required-with-all"></a>
#### required_with_all:_foo_,_bar_,...

El campo bajo validación debe estar presente y no vacío _solamente si_ todos los otros campos especificados están presentes.

<a name="rule-required-without"></a>
#### required_without:_foo_,_bar_,...

El campo bajo validación debe estar presente y no vacío _solamente cuando_ cualquiera de los otros campos especificados no están presentes.

<a name="rule-required-without-all"></a>
#### required_without_all:_foo_,_bar_,...

El campo bajo validación debe estar presente y no vacío _solamente cuando_ todos los demás campos especificados no están presentes.

<a name="rule-same"></a>
#### same:_field_

El campo _field_ dado debe coincidir con el campo bajo validación.

<a name="rule-size"></a>
#### size:_value_

El campo bajo validación debe tener un tamaño que coincida con el valor _value_ dado. Para datos de cadena, el valor _value_ corresponde al número de caracteres. Para datos numéricos, el valor _value_ corresponde a un valor entero dado. Para un arreglo, el valor _size_ corresponde con el de `count` de elementos del arreglo. Para archivos, el valor de _size_ corresponde al tamaño del archivo en kilobytes.

<a name="rule-string"></a>
#### string

El campo bajo validación debe ser una cadena. Si prefieres permitir que el campo también sea `null`, deberías asignar la regla `nullable` al campo.

<a name="rule-timezone"></a>
#### timezone

El campo bajo validación debe ser un identificador de zona horaria válida de acuerdo con la función de PHP `timezone_identifiers_list`.

<a name="rule-unique"></a>
#### unique:_table_,_column_,_except_,_idColumn_

El campo bajo validación debe ser único en una tabla de base de datos dada. Si la opción `column` no es especificado, el nombre del campo será usado.

**Especificando Un Nombre de Columna Personalizado:**

    'email' => 'unique:users,email_address'

**Conexión de Base de Datos Personalizada**

Ocasionalmente, puedes necesitar establecer una conexión personalizada para las consultas de bases de datos hechas por el Validador. Como has visto anteriormente, al establecer `unique:users` como una regla de validación usará la conexión de base de datos predeterminada en la consulta de base de datos. Para sobrescribir esto, especifica la conexión y el nombre de la tabla usando la sintaxis "punto".

    'email' => 'unique:connection.users,email_address'

**Forzando una Regla de Unicidad para Ignorar un ID Dado:**

Algunas veces, puedes desear ignorar un ID dado durante la verificación de unicidad. Por ejemplo, considera una pantalla "update profile" que incluya el nombre del usuario, dirección de correo electrónico, y ubicación. Ciertamente, querrás verificar que la dirección de correo electrónico es única. Sin embargo, si el usuario solamente cambia el campo nombre y no el campo con el correo electrónico, no quieres que un error de validación sea lanzado porque el usuario ya es el propietario de la dirección de correo electrónico.

Para instruir al validador para que ignore el ID del usuario, usaremos la clase `Rule` para definir fluidamente la regla. En este ejemplo, también especificaremos las reglas de validación como un arreglo en lugar de usar el carácter `|` para delimitar las reglas:

    use Illuminate\Validation\Rule;

    Validator::make($data, [
        'email' => [
            'required',
            Rule::unique('users')->ignore($user->id),
        ],
    ]);

Si tu tabla usa un nombre de columna de clave primaria en vez de `id`, puedes especificar el nombre de la columna al momento de ejecutar el método `ignore`:

    'email' => Rule::unique('users')->ignore($user->id, 'user_id')

**Agregando Cláusulas Where Adicionales:**

También puedes especificar restricciones de consultas al personalizar la consulta usando el método `where`. Por ejemplo, agreguemos una restricción que verifique que el `account_id` is `1`:

    'email' => Rule::unique('users')->where(function ($query) {
        return $query->where('account_id', 1);
    })

<a name="rule-url"></a>
#### url

El campo bajo validación debe ser una URL válida.

<a name="conditionally-adding-rules"></a>
## Agregando Reglas Condicionalmente

#### Validando Cuando Presente

En algunas situaciones, puedes desear ejecutar la verificación contra un campo **solamente** si ese campo está presente en el arreglo de entrada. Para conseguir esto rápidamente, agrega la regla `sometimes` en tu lista:

    $v = Validator::make($data, [
        'email' => 'sometimes|required|email',
    ]);

En el ejemplo anterior, el campo `email` solamente será validado si está presente en el arreglo `$data`.

> {tip} i estás intentando validar un campo que siempre deba estar presente pero puede estar vacío, revisa [esta nota sobre campos opcionales](#a-note-on-optional-fields)

#### Validación Condicional Compleja

Algunas veces puedes desear agregar reglas de validación basadas en lógica condicional más compleja. Por ejemplo, puedes desear solicitar un campo dado solamente si otro campo tiene un valor mayor que 100. O, puedes necesitar que dos campos tengan un valor dado solamente cuando otro campo esté presente. Agregar estas reglas de validación no tiene que ser un dolor. Primero, crea una instancia `Validator` con tus _reglas estáticas_ que nunca cambian:

    $v = Validator::make($data, [
        'email' => 'required|email',
        'games' => 'required|numeric',
    ]);

Asumamos que nuestra aplicación web is sobre coleccionistas de juegos. Si un coleccionista de juego se registra con nuestra aplicación y posee más de 100 juegos, queremos que explique porqué posee tantos juegos. Por ejemplo, quizá administre una tienda de reventa de juego, o puede ser que solo disfrute coleccionar. Para agregar este requerimiento condicionalmente, podemos usar el método `sometimes` en la instancia `Validator`.

    $v->sometimes('reason', 'required|max:500', function ($input) {
        return $input->games >= 100;
    });

El primer argumento pasado al método `sometimes` es el nombre del campo que estamos validando condicionalmente. El segundo argumento son las reglas que queremos agregar. Si la `Closure` pasada como tercer argumento devuelve `true`, las reglas serán agregadas. Este método hace que sea una brisa construir validaciones condicionales complejas. Incluso puedes agregar validaciones condicionales para varios campos de una sola vez:

    $v->sometimes(['reason', 'cost'], 'required', function ($input) {
        return $input->games >= 100;
    });

> {tip} El parámetro `$input` pasado a tu `Closure` será una instancia de `Illuminate\Support\Fluent` y puede ser usado para acceder tu entrada y archivos.

<a name="validating-arrays"></a>
## Validando Arreglos

Validar arreglos basados en campos de entrada de formulario no tiene que ser un dolor. Puedes usar "notación punto" para validar atributos dentro de un arreglo. Por ejemplo, si la solicitud entrante contiene un campo `photos[profile]`, puedes validarlo como sigue:

    $validator = Validator::make($request->all(), [
        'photos.profile' => 'required|image',
    ]);

También puedes validar cada elemento de un arreglo. Por ejemplo, para validar que cada dirección electrónica en un campo de entrada de arreglo sea único, puedes hacer lo siguiente:

    $validator = Validator::make($request->all(), [
        'person.*.email' => 'email|unique:users',
        'person.*.first_name' => 'required_with:person.*.last_name',
    ]);

De igual forma, puedes usar el carácter `*` al momento de especificar tus mensajes de validación en tus archivos de idiomas, haciendo una brisa usar un único mensaje de validación para campos basados en arreglos:

    'custom' => [
        'person.*.email' => [
            'unique' => 'Each person must have a unique e-mail address',
        ]
    ],

<a name="custom-validation-rules"></a>
## Reglas de Validación Personalizadas

<a name="using-rule-objects"></a>
### Usando Objetos de Regla

Laravel proporciona una variedad de reglas de validación útiles; sin embargo, puedes desear especificar algunas propias. Un método para registrar reglas de validación personalizadas es usar objetos de regla. Para generar un nuevo objeto de regla, puedes usar el comando Artisan `make:rule`. Usemos este comando para generar una regla que verifique que una cadena esté en mayuscula. Laravel colocará la nueva regla en el directorio `app/Rules`:

    php artisan make:rule Uppercase

Una vez que la regla haya sido creada, estaremos listos para definir su comportamiento. Un objeto de regla contiene dos métodos: `passes` and `message`. El método `passes` recibe el nombre y valor de atributo, y debería devolver `true` o `false` dependiendo de si el valor de atributo es válido o no. El método `message` debería devolver el mensaje de error de validación que debería ser usado cuando la validación falle:

    <?php

    namespace App\Rules;

    use Illuminate\Contracts\Validation\Rule;

    class Uppercase implements Rule
    {
        /**
         * Determine if the validation rule passes.
         *
         * @param  string  $attribute
         * @param  mixed  $value
         * @return bool
         */
        public function passes($attribute, $value)
        {
            return strtoupper($value) === $value;
        }

        /**
         * Get the validation error message.
         *
         * @return string
         */
        public function message()
        {
            return 'The :attribute must be uppercase.';
        }
    }

Ciertamente, puedes ejecutar el helper `trans` de tu método `message` si prefieres devolver un mensaje de error de tus archivos de traducción:

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return trans('validation.uppercase');
    }

Una vez que la regla haya sido definida, puedes adjuntarla a un validador al pasar una instancia del objeto de regla con tus otras reglas de validación:

    use App\Rules\Uppercase;

    $request->validate([
        'name' => ['required', new Uppercase],
    ]);

<a name="using-extensions"></a>
### Usando Extensiones

Otro método para registrar reglas de validación personalizadas es usar el método `extend` en la clase [facade](/docs/{{version}}/facades) `Validator`. Usemos este método dentro de un [proveedor de servicio](/docs/{{version}}/providers) para registrar una regla de validación personalizada:

    <?php

    namespace App\Providers;

    use Illuminate\Support\ServiceProvider;
    use Illuminate\Support\Facades\Validator;

    class AppServiceProvider extends ServiceProvider
    {
        /**
         * Bootstrap any application services.
         *
         * @return void
         */
        public function boot()
        {
            Validator::extend('foo', function ($attribute, $value, $parameters, $validator) {
                return $value == 'foo';
            });
        }

        /**
         * Register the service provider.
         *
         * @return void
         */
        public function register()
        {
            //
        }
    }

La Closure de validador personalizada recibe cuatro argumentos: el nombre del `$attribute` que está siendo validada, el valor `$value` del atributo, un arreglo de `$parameters` pasado a la regla, y la instancia `Validator`.

También puedes pasar una clase y método al método `extend` en vez de una Closure:

    Validator::extend('foo', 'FooValidator@validate');

#### Definiendo el Mensaje de Error

También necesitarás definir un mensaje de error para tu regla personalizada. Puedes hacer eso o usando un arreglo de mensajes personalizados en línea o agregando una entrada en el archivo de idioma de validación. Este mensaje debería ser colocado en el primer nivel del arreglo, no dentro del arreglo `custom`, el cual es solamente para mensajes de error específico de atributos:

    "foo" => "Your input was invalid!",

    "accepted" => "The :attribute must be accepted.",

    // The rest of the validation error messages...

Al momento de crear una regla de validación personalizada, algunas veces puedes necesitar definir reemplazos de marcadores personalizados para los mensajes de error. Puedes hacer eso creando un Validador personalizado como se describió anteriormente entonces hacer una ejecución del método `replacer` en la clase facade `Validator`. Puedes hacer esto dentro del método `boot` de un [proveedor de servicio](/docs/{{version}}/providers):

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Validator::extend(...);

        Validator::replacer('foo', function ($message, $attribute, $rule, $parameters) {
            return str_replace(...);
        });
    }

#### Extensiones Implícitas

De forma predeterminada, cuando un atributo que está siendo validado no está presente o contiene un valor vacío como es definido por la regla [`required`](#rule-required), las reglas de validación normal, incluyendo las extensiones personalizadas, no son ejecutadas. Por ejemplo, la regla [`unique`](#rule-unique) no será ejecutada contra un valor `null`:

    $rules = ['name' => 'unique'];

    $input = ['name' => null];

    Validator::make($input, $rules)->passes(); // true

Para que una regla se ejecute incluso cuando un atributo esté vacío, la regla debe implicar que el atributo sea obligatorio. Para crear tal extensión "implícita", usa el método `Validator::extendImplicit()`:

    Validator::extendImplicit('foo', function ($attribute, $value, $parameters, $validator) {
        return $value == 'foo';
    });

> {note} Una extensión "implícita" solamente _implica_ que el atributo es obligatorio. Si esto realmente invalida un atributo vacío o faltante es para ti.
