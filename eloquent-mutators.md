# Eloquent: Mutators

- [Introducción](#introduction)
- [Accesadores y Mutadores](#accessors-and-mutators)
    - [Definiendo un Accesador](#defining-an-accessor)
    - [Definiendo un Mutador](#defining-a-mutator)
- [Mutadores de Fecha](#date-mutators)
- [Conversión de Atributos](#attribute-casting)
    - [Conversión de Arreglos y JSON ](#array-and-json-casting)
    - [Conversión de fechas ](#date-casting)

<a name="introduction"></a>
## Introducción

Los accesadores y mutadores permiten que des formato a los valores de atributos de Eloquent cuando los obtienes o estableces en las instancias de modelo. Por ejemplo, puede que te guste usar el [encriptador de Laravel](/docs/{{version}}/encryption) para cifrar un valor mientras es almacenado en la base de datos y después descifrar automáticamente el atributo cuando accedes a él en un modelo de Eloquent.

En adición a accesadores y mutadores personalizados, Eloquent también puede convertir automáticamente campos de fecha a instancias [Carbon](https://github.com/briannesbitt/Carbon) o incluso [convertir campos de texto a JSON](#attribute-casting).

<a name="accessors-and-mutators"></a>
## Accesadores y Mutadores

<a name="defining-an-accessor"></a>
### Definiendo un Accesador

Para definir un accesador crea un método `getFooAttribute` en tu modelo, donde `Foo` es el nombre de la columna que deseas acceder en el formato Studly Case (Primera letra de cada palabra en mayúscula). En este ejemplo, definiremos un accesador para el atributo `first_name`. El accesador automáticamente será ejecutado por Eloquent al momento de intentar obtener el valor del atributo `first_name`:

    <?php

    namespace App;

    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * Get the user's first name.
         *
         * @param  string  $value
         * @return string
         */
        public function getFirstNameAttribute($value)
        {
            return ucfirst($value);
        }
    }

Como puedes ver, el valor original de la columna es pasado al accesador, permitiéndote manipular y devolver el valor. Para acceder al valor del accesador, puedes acceder al atributo `first_name` en una instancia del modelo:

    $user = App\User::find(1);

    $firstName = $user->first_name;

Ciertamente, también puedes usar accesadores para retornar nuevos valores computados de atributos existentes:

    /**
     * Get the user's full name.
     *
     * @return string
     */
    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

> {tip} Si deseas que estos valores computados sean agregados a las representaciones de arreglo / JSON de tu modelo, [necesitarás adjuntarlos](https://laravel.com/docs/{{version}}/eloquent-serialization#appending-values-to-json).

<a name="defining-a-mutator"></a>
### Definiendo un Mutador

Para definir un mutador, define un método `setFooAttribute` en tu modelo, donde `Foo` es el nombre de la columna que deseas acceder en el formato Studly Case (Primera letra de cada palabra en mayúscula). Así, otra vez, vamos a definir un mutador para el atributo `first_name`. Este mutador será ejecutado automáticamente cuando intentamos establecer el valor del atributo `first_name` en el modelo:

    <?php

    namespace App;

    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * Set the user's first name.
         *
         * @param  string  $value
         * @return void
         */
        public function setFirstNameAttribute($value)
        {
            $this->attributes['first_name'] = strtolower($value);
        }
    }

El mutador recibirá el valor que está siendo establecido en el atributo, permitiendote manipular el valor y establecer el valor manipulado en la propiedad `$attributes` interna del modelo Eloquent. Así, por ejemplo, si intentamos establecer el atributo `first_name` como `Sally`:

    $user = App\User::find(1);

    $user->first_name = 'Sally';

En este ejemplo, la función `setFirstNameAttribute` será ejecutada con el valor `Sally`. El mutador entonces aplicará la función `strtolower` al nombre y establecerá su valor resultante en el arreglo `$attributes` interno.

<a name="date-mutators"></a>
## Mutadores de Fecha

De forma predeterminada, Eloquent convierte las columnas `created_at` y `updated_at` a instancias de [Carbon](https://github.com/briannesbitt/Carbon), la cual extiende la clase `DateTime` de PHP para proporcionar una mezcla de métodos útiles. Puedes personalizar cuáles fechas serán automáticamente mutadas e incluso deshabilitar completamente esta mutación, al sobrescribir la propiedad `$dates` de tu modelo:

    <?php

    namespace App;

    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * The attributes that should be mutated to dates.
         *
         * @var array
         */
        protected $dates = [
            'seen_at',
        ];
    }

> {tip} Puedes desactivar las marcas de tiempo (timestamps) predeterminadas `created_at` y` updated_at` configurando la propiedad pública `$timestamps` de tu modelo en `false`.

Cuando una columna es considerada una fecha, puedes establecer su valor a una marca de tiempo UNIX, cadena de fecha (`Y-m-d`), cadena fecha-hora y por supuesto, una instancia `DateTime` / `Carbon`. El valor de la fecha será convertido y almacenado correctamente en tu base de datos:

    $user = App\User::find(1);

    $user->deleted_at = now();

    $user->save();

Como se apreció anteriormente, al momento de obtener atributos que están listados en tu propiedad `$dates`, éstos serán automáticamente convertidos a instancias [Carbon](https://github.com/briannesbitt/Carbon), permitiendo que uses cualquiera de los métodos de Carbon en tus atributos:

    $user = App\User::find(1);

    return $user->deleted_at->getTimestamp();

#### Formatos de Fecha

De forma predeterminada, las marcas de tiempo son formateadas como `'Y-m-d H:i:s'`. Si necesitas personalizar el formato de marca de tiempo, establece la propiedad `$dateFormat` en tu modelo. Esta propiedad determina como los atributos de fecha son almacenados en la base de datos así como también su formato cuando el modelo es serializado a un arreglo o JSON:

    <?php

    namespace App;

    use Illuminate\Database\Eloquent\Model;

    class Flight extends Model
    {
        /**
         * The storage format of the model's date columns.
         *
         * @var string
         */
        protected $dateFormat = 'U';
    }

<a name="attribute-casting"></a>
## Conversión de Atributos

La propiedad `$casts` en tu modelo proporciona un método conveniente de convertir atributos a tipos de datos comunes. La propiedad `$casts` debería ser un arreglo donde la clave es el nombre del atributo que está siendo convertido y el valor es el tipo al que deseas convertir la columna. Los tipos de conversión soportados son: `integer`, `real`, `float`, `double`, `string`, `boolean`, `object`, `array`, `collection`, `date`, `datetime` y `timestamp`.

Por ejemplo, vamos a convertir el atributo `is_admin`, el cual es almacenado en nuestra base de datos como un entero (`0` o `1`) a un valor booleano:

    <?php

    namespace App;

    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * The attributes that should be cast to native types.
         *
         * @var array
         */
        protected $casts = [
            'is_admin' => 'boolean',
        ];
    }

Ahora el atributo `is_admin` será siempre convertido a un booleano cuando lo accedas, incluso si el valor subyacente es almacenado en la base de datos como un entero:

    $user = App\User::find(1);

    if ($user->is_admin) {
        //
    }

<a name="array-and-json-casting"></a>
### Conversión de Arreglos y JSON

El tipo de conversión `array` es particularmente útil al momento de trabajar con columnas que son almacenadas como JSON serializado. Por ejemplo, si tu base de datos tiene un tipo de campo `JSON` o `TEXT` que contiene JSON serializado, agregar la conversión `array` a ese atributo deserializará automáticamente el atributo a un arreglo PHP cuando lo accedas en tu modelo Eloquent:

    <?php

    namespace App;

    use Illuminate\Database\Eloquent\Model;

    class User extends Model
    {
        /**
         * The attributes that should be cast to native types.
         *
         * @var array
         */
        protected $casts = [
            'options' => 'array',
        ];
    }

Una vez que la conversión es definida, puedes acceder al atributo `options` y será automáticamente deserializado desde JSON a un arreglo PHP. Cuando establezcas el valor del atributo `options`, el arreglo dado será automáticamente serializado de vuelta en JSON para almacenamiento:

    $user = App\User::find(1);

    $options = $user->options;

    $options['key'] = 'value';

    $user->options = $options;

    $user->save();

<a name="date-casting"></a>
### Conversión de fechas

Al usar el tipo de conversión `date` o` datetime`, puedes especificar el formato de la fecha. Este formato se utilizará cuando el [modelo se serializa a un arreglo o JSON](/docs/{{version}}/eloquent-serialization):

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'created_at' => 'datetime:Y-m-d',
    ];
