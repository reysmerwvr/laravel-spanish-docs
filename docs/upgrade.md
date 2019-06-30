# Upgrade Guide
# Guía de actualización

- [Actualizar 5.9.0 desde 5.8](#upgrade-5.9.0)

<a name="high-impact-changes"></a>
## Cambios de alto impacto

<div class="content-list" markdown="1">
- TODO
</div>

<a name="medium-impact-changes"></a>
## Cambios de impacto medio

<div class="content-list" markdown="1">
- TODO
</div>

<a name="upgrade-5.9.0"></a>
## Actualizar a 5.9.0 desde 5.8

#### Estimated Upgrade Time: TODO

::: danger Nota
Intentamos documentar cada posible cambio. Dado que algunos de estos cambio se encuentran en partes ocultas del framework, sólo una porción de dichos cambios podría realmente afectar tu aplicación.
:::

<a name="updating-dependencies"></a>
### Actualizando dependencias

Actualiza tu dependencia `laravel/framework` a `5.9.*` en tu archivo `composer.json`.

Luego, examina cualquier paquete de terceros consumido por tu aplicación y verifica de que estás usando la versión apropiada con soporte para Laravel 5.9.

<a name="miscellaneous"></a>
### Misceláneos 

También te recomendamos que veas los cambios en el repositorio `laravel/laravel` [de GitHub](https://github.com/laravel/laravel). Si bien muchos de estos cambios no son necesarios, es posible que desees mantener estos archivos sincronizados con tu aplicación. Algunos de estos cambios se tratarán en esta guía de actualización, pero otros, como los cambios en los archivos de configuración o los comentarios, no lo estarán. Puedes ver fácilmente los cambios con la [herramienta de comparación GitHub](https://github.com/laravel/laravel/compare/5.7...master) y elegir qué actualizaciones son importantes para ti.