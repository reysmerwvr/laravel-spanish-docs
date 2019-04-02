::: v-pre

# Configuración Regional

- [Introducción](#introduction)
	- [Configurando La Configuración Regional](#configuring-the-locale)
- [Definiendo Cadenas De Traducciones](#defining-translation-strings)
    - [Usando Claves Cortas](#using-short-keys)
    - [Usando Cadenas De Traducciones Como Claves](#using-translation-strings-as-keys)
- [Retornando Cadenas De Traducciones](#retrieving-translation-strings)
    - [Reemplazando Parametros En Cadenas De Traducciones](#replacing-parameters-in-translation-strings)
    - [Pluralización](#pluralization)
- [Sobrescribiendo Archivos del Paquete de Idioma](#overriding-package-language-files)

<a name="introduction"></a>
## Introducción

Las características de configuración regional de Laravel proporcionan una forma conveniente de retornar cadenas en varios idiomas, permitiéndote soportar fácilmente múltiples idiomas en tu aplicación. Las cadenas de idiomas son almacenadas en archivos dentro del directorio `resources/lang`. Dentro de este directorio debería haber un subdirectorio para cada idioma soportado por la aplicación:

```php
/resources
    /lang
        /en
            messages.php
        /es
            messages.php
```

Todos los archivos de idioma retornan un arreglo de cadenas con sus claves. Por ejemplo:

```php
<?php

return [
    'welcome' => 'Welcome to our application'
];
```

<a name="configuring-the-locale"></a>
### Configurando La Configuración Regional

El idioma por defecto para tu aplicación se almacena en el archivo de configuración `config/app.php`. Puedes modificar este valor en base a las necesidades de tu aplicación. También puedes cambiar el idioma activo en tiempo de ejecución usando el método `setLocale` en el facade `App`:

```php
Route::get('welcome/{locale}', function ($locale) {
    App::setLocale($locale);

    //
});
```

Puedes configurar un "idioma alternativo", que será usado cuando el idioma activo no contiene una determinada cadena de traducción. Al igual que el idioma por defecto, el idioma alternativo también es configurado en el archivo de configuración `config/app.php`:

```php
'fallback_locale' => 'en',
```

#### Determinando La Configuración Regional Actual

Puedes usar los métodos `getLocale` y `isLocale` en el facade `App` para determinar la configuración regional actual o comprobar si la configuración tiene un valor dado:

```php
$locale = App::getLocale();

if (App::isLocale('en')) {
    //
}
```

<a name="defining-translation-strings"></a>
## Definiendo Cadenades de Traducciones

<a name="using-short-keys"></a>
### Usando Claves Cortas 

Típicamente, las cadenas de traducciones son almacenadas en archivos dentro del directorio `resources/lang`. Dentro de este directorio debería haber un directorio para cada idioma soportado por la aplicación:

```php
/resources
    /lang
        /en
            messages.php
        /es
            messages.php
```

Todos los archivos de idioma retornan un arreglo de cadenas con sus claves. Por ejemplo:

```php
<?php

// resources/lang/en/messages.php

return [
    'welcome' => 'Welcome to our application'
];
```

<a name="using-translation-strings-as-keys"></a>
### Usando Cadenas de Traducciones como Claves

Para aplicaciones con grandes necesidades de traducción, definir cada cadena con una "clave corta" puede volverse confuso rápidamente al hacer referencia a estas en tus vistas. Por este motivo, Laravel también proporciona soporte para definir cadenas de traducciones usando la traducción "por defecto" de la cadena como clave.

Archivos de traducción que usan cadenas de traducción como claves son almacenados como archivos JSON en el directorio `resources/lang`. Por ejemplo, si tu aplicación tiene una traducción en español, debes crear un archivo `resources/lang/es.json`:

```php
{
    "I love programming.": "Me encanta programar."
}
```

<a name="retrieving-translation-strings"></a>
## Retornando Cadenas de Traducciones

Puedes retornar líneas desde archivos de idioma usando la función helper `__`. La función `__` acepta el archivo y la clave de la cadena de traducción como primer argumento. Por ejemplo, vamos a retornar la cadena de traducción de `welcome` desde el archivo de idioma `resources/lang/messages.php`:

```php
echo __('messages.welcome');

echo __('I love programming.');
```

Si estás usando el [motor de plantillas Blade](/docs/{{version}}/blade), puedes usar la sintaxis `{{ }}` para imprimir la cadena de traducción o usar la directiva `@lang`:

```php
{{ __('messages.welcome') }}

@lang('messages.welcome')
```

Si la cadena de traducción especificada no existe, la función `__` retornará la clave de la cadena de traducción. Así que, usando el ejemplo superior, la función `__` retornaría `messages.welcome` si la cadena de traducción no existe.

::: danger Nota
La directiva `@lang` no escapa ningún resultado. Eres **totalmente responsable** de escapar la salida al usar esta directiva.
:::

<a name="replacing-parameters-in-translation-strings"></a>
### Reemplazando Parametros en Cadenas de Traducciones

Si lo deseas, puedes definir placeholders en tus cadenas de traducción. Todos los placeholders son precedidos por `:`. Por ejemplo, puedes definir un mensaje de bienvenida con un nombre como placeholder: 

```php
'welcome' => 'Welcome, :name',
```

Para reemplazar los placeholders al retornar una cadena de traducción, pasa un arreglo de reemplazos como segundo argumento de la función `__`:

```php
echo __('messages.welcome', ['name' => 'dayle']);
```

Si tu placeholder contiene sólo letras mayúsculas o sólo tiene su primera letra en mayúscula, el valor traducido será escrito en mayúsculas de forma correcta:

```php
'welcome' => 'Welcome, :NAME', // Welcome, DAYLE
'goodbye' => 'Goodbye, :Name', // Goodbye, Dayle
```

<a name="pluralization"></a>
### Pluralización

La pluralización es un problema complejo, ya que diferentes idiomas tienen una variedad de reglas complejas de pluralización. Usando el símbolo `|`, puedes distinguir entre las formas singulares y plurales de una cadena:

```php
'apples' => 'There is one apple|There are many apples',
```

Puedes incluso crear reglas de pluralización más complejas que especifican cadenas de traducción para múltiples rangos de números:

```php
'apples' => '{0} There are none|[1,19] There are some|[20,*] There are many',
```

Luego de definir una cadena de traducción que tiene opciones de pluralización, puedes usar la función `trans_choice` para retornar la línea de un "conteo" dado. En este ejemplo, dado que el conteo es mayor que uno, la forma plural de la cadena de traducción es retornada:

```php
echo trans_choice('messages.apples', 10);
```

También puedes definir atributos de placeholder en cadenas de pluralización. Estos placeholders pueden ser reemplazados pasando un arreglo como tercer argumento a la función `trans_choice`:

```php
'minutes_ago' => '{1} :value minute ago|[2,*] :value minutes ago',

echo trans_choice('time.minutes_ago', 5, ['value' => 5]);
```

Si te gustaría mostrar el valor entero que fue pasado a la función `trans_choice`, puedes también usar el placeholder `:count`:

```php
'apples' => '{0} There are none|{1} There is one|[2,*] There are :count',
```

<a name="overriding-package-language-files"></a>
## Sobrescribiendo Archivos del Paquete de Idioma

Algunos paquetes pueden venir con sus propios archivos de idioma. En lugar de cambiar los archivos principales del paquete para modificar esas líneas, puedes sobrescribirlas colocando archivos en el directorio `resources/lang/vendor/{package}/{locale}`.

Así que, por ejemplo, si necesitas sobrescribir las cadenas de traducción en inglés en `messages.php` para un paquete llamado `skyrim/hearthfire`, debes colocar un archivo de idioma en: `resources/lang/vendor/hearthfire/en/messages.php`. Dentro de este archivo, debes sólo definir las cadenas de traducción que deseas sobrescribir. Cualquier cadena de traducción que no sobrescribas será cargada desde los archivos de idioma originales del paquete.