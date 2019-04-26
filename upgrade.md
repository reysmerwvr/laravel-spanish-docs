# Guía De Actualización

- [Actualizando de 5.9.0 desde 5.8](#upgrade-5.9.0)

<a name="high-impact-changes"></a>
## Cambios De Alto Impacto

<div class="content-list" markdown="1">
- TODO
</div>

<a name="medium-impact-changes"></a>
## Cambios De Mediano Impacto

<div class="content-list" markdown="1">
- TODO
</div>

<a name="upgrade-5.9.0"></a>
## Actualizando de 5.9.0 desde 5.8

#### Tiempo Estimado De Actualización: TODO

>{note} Tratamos de documentar cada cambio significativo. Debido a que alguno de estos cambios significativos están en partes ocultas dentro del framework solo una porción de estos cambios podria afectar tu aplicación. 

<a name="updating-dependencies"></a>
### Actualización De Dependencias

Actualiza tu dependencia `laravel/framework` a `5.9.*` en tu archivo `composer.json`.

Luego, examina cualquier paquete de terceros que sean consumidos por tu aplicación y verifica que estén usando la versión con soporte para Laravel 5.9.

<a name="miscellaneous"></a>
### Miseláneaos

También te recomendamos que veas los cambios en el repositorio `laravel/laravel` [de GitHub](https://github.com/laravel/laravel). Si bien muchos de estos cambios no son necesarios, es posible que desees mantener estos archivos sincronizados con tu aplicación. Algunos de estos cambios se tratarán en esta guía de actualización, pero otros, como los cambios en los archivos de configuración o los comentarios, no lo estarán. Puedes ver fácilmente los cambios con la [herramienta de comparación GitHub](https://github.com/laravel/laravel/compare/5.8...master) y elegir qué actualizaciones son importantes para ti.
