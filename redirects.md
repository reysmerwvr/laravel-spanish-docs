::: v-pre

# Redirecciones HTTP

- [Creando Redirecciones](#creating-redirects)
- [Redireccionando A Rutas Con Nombres](#redirecting-named-routes)
- [Redireccionando A Acciones De Controlador](#redirecting-controller-actions)
- [Redireccionando Con Datos de Sesiones](#redirecting-with-flashed-session-data)

<a name="creating-redirects"></a>
## Creando Redirecciones

Las respuestas de redirección son instancias de la clase `Illuminate\Http\RedirectResponse` y contienen los encabezados necesarios para redirigir al usuario a otra URL. Hay múltiples formas de generar una instancia `RedirectResponse`. La forma más simple es usando el helper global `redirect`:

```php
Route::get('dashboard', function () {
    return redirect('home/dashboard');
});
```

Algunas veces puedes querer redirigir al usuario a su ubicación anterior, como cuando un formulario enviado es inválido. Puedes hacer eso usando la función helper global `back`. Dado que esta característica usa la [sesión](/docs/{{version}}/session), asegurate que la ruta llamando a la función `back` está usando el grupo de middleware `web` o tiene todo el middleware de sesión aplicado:

```php
Route::post('user/profile', function () {
    // Validate the request...

    return back()->withInput();
});
```

<a name="redirecting-named-routes"></a>
## Redireccionando A Rutas Con Nombres

Cuando llamas al helper `redirect` sin parámetros, una instancia de `Illuminate\Routing\Redirector` es retornada, permitiéndote llamar a cualquier método en la instancia `Redirector`. Por ejemplo, para generar una `RedirectResponse` a una ruta nombrada, puedes usar el método `route`: 

```php
return redirect()->route('login');
```

Si tu ruta tiene parámetros, puedes pasarlos como segundo argumento al método `route`:

```php
// For a route with the following URI: profile/{id}

return redirect()->route('profile', ['id' => 1]);
```

#### Llenando Parámetros Mediante Modelos de Eloquent

Si estás redirigiendo a una ruta con un parámetro "ID" que está siendo rellenado desde un modelo de Eloquent, puedes pasar el modelo como tal. El ID será extraído automáticamente:

```php
// For a route with the following URI: profile/{id}

return redirect()->route('profile', [$user]);
```

Si te gustaría personalizar el valor que es colocado en el parámetro de la ruta, debes sobrescribir el método `getRouteKey` en tu modelo de Eloquent:

```php
/**
 * Get the value of the model's route key.
 *
 * @return mixed
 */
public function getRouteKey()
{
    return $this->slug;
}
```

<a name="redirecting-controller-actions"></a>
## Redireccionando A Acciones de Controlador

Puedes también generar redirecciones a [acciones de controlador](/docs/{{version}}/controllers). Para ello, pasa el nombre del controlador y la acción al método `action`. Recuerda, no necesitas especificar el nombre de espacio completo para el controlador dado que el `RouteServiceProvider` de Laravel automáticamente establecerá el nombre de espacio del controlador base:

```php
return redirect()->action('HomeController@index');
```

Si la ruta de tu controlador requiere parámetros, puedes pasarlos como segundo argumento al método `action`:

```php
return redirect()->action(
    'UserController@profile', ['id' => 1]
);
```

<a name="redirecting-with-flashed-session-data"></a>
## Redireccionando Con Datos de Sesión

Redireccionar a una nueva URL y [enviar datos a la sesión](/docs/{{version}}/session#flash-data) es usualmente hecho al mismo tiempo. Típicamente, esto es hecho luego de realizar una acción exitosamente cuando envías un mensaje de éxito a la sesión. Por conveniencia, puedes crear una instancia `RedirectResponse` y enviar datos a la sesión en un única y fluida cadena de métodos: 

```php
Route::post('user/profile', function () {
    // Update the user's profile...

    return redirect('dashboard')->with('status', 'Profile updated!');
});
```

Luego de que el usuario es redireccionado, puedes mostrar el mensaje desde la [sesión](/docs/{{version}}/session). Por ejemplo, usando la [síntaxis de Blade](/docs/{{version}}/blade):

```php
@if (session('status'))
    <div class="alert alert-success">
        {{ session('status') }}
    </div>
@endif
```