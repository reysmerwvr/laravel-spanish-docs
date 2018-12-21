# Task Scheduling

- [Introducción](#introduction)
- [Definiendo Schedules](#defining-schedules)
    - [Programando Comandos De Artisan](#scheduling-artisan-commands)
    - [Programando Trabajos En Cola](#scheduling-queued-jobs)
    - [Programando Comandos Del Shell](#scheduling-shell-commands)
    - [Programando Opciones De Frecuencias](#schedule-frequency-options)
    - [Zonas Horarias](#timezones)
    - [Previniendo SUperposición de Tareas](#preventing-task-overlaps)
    - [Ejecutando Tareas en un Servidor](#running-tasks-on-one-server)
    - [Tareas en Segundo Plano](#background-tasks)
    - [Modo De Mantenimiento](#maintenance-mode)
- [Resultado De La Tarea](#task-output)
- [Hooks De Tareas](#task-hooks)

<a name="introduction"></a>
## Introducción

En el pasado, generabas una entrada Cron para cada tarea que necesitabas programar en tu servidor. Sin embargo, esto puede rápidamente convertirse en un fastidio, dado que tu programación de tareas no está en el control de versiones y debes hacer SSH a tu servidor para agregar entradas Cron adicionales.

El programador de comandos de Laravel te permite definir tu programación de comandos de forma fluída y expresiva dentro de Laravel. Al usar el programador, una sola entrada Cron es necesaria en tu servidor. Tu programación de tareas es definida en el método `schedule` del archivo `app/Console/Kernel.php`. Para ayudarte a comenzar, un ejemplo sencillo está definido dentro del método.

### Iniciando El Programador

Al usar el programador, sólo necesitas agregar la siguiente entrada Cron a tu servidor. Si no sabes como agregar entradas Cron a tu servidor, considera usar un servicio como [Laravel Forge](https://forge.laravel.com) que puede administrar las entradas Cron por ti:

    * * * * * php /path-to-your-project/artisan schedule:run >> /dev/null 2>&1

Este Cron llamará al programador de tareas de Laravel cada minuto. Cuando el comando `schedule:run` es ejecutado, Laravel evaluará tus tareas programadas y ejecutará las tareas pendientes.

<a name="defining-schedules"></a>
## Definiendo Schedules

Puedes definir todas tus tareas programadas en el método `schedule` de la clase `App\Console\Kernel`. Para comenzar, vamos a ver un ejemplo de programar una tarea. En este ejemplo, programaremos una `Closure` que será llamada cada día medianoche. Dentro de la `Closure` ejecutaremos un consulta a la base de datos para vaciar una tabla:

    <?php

    namespace App\Console;

    use DB;
    use Illuminate\Console\Scheduling\Schedule;
    use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

    class Kernel extends ConsoleKernel
    {
        /**
         * The Artisan commands provided by your application.
         *
         * @var array
         */
        protected $commands = [
            //
        ];

        /**
         * Define the application's command schedule.
         *
         * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
         * @return void
         */
        protected function schedule(Schedule $schedule)
        {
            $schedule->call(function () {
                DB::table('recent_users')->delete();
            })->daily();
        }
    }

Además de programar usando Closures, también puedes usar [invokable objects](http://php.net/manual/en/language.oop5.magic.php#object.invoke). Los objetos invocables son clases PHP sencillas que contienen un método `__invoke`:

    $schedule->call(new DeleteRecentUsers)->daily();

<a name="scheduling-artisan-commands"></a>
### Programando Comandos De Artisan

Además de programador llamadas a Closures, también puedes programar [comandos de Artisan](/docs/{{version}}/artisan) y comandos del sistema operativo. Por ejemplo, puedes usar el método `command` para programar un comando de Artisan usando ya sea el nombre del comando o de la clase:

    $schedule->command('emails:send --force')->daily();

    $schedule->command(EmailsCommand::class, ['--force'])->daily();

<a name="scheduling-queued-jobs"></a>
### Programando Trabajos En Colas

El método `job` puede ser usado para programar [un trabajo en cola](/docs/{{version}}/queues). Este método proporciona una forma conveniente de programar trabajos sin usar el método `call` para crear Closures de forma manual para agregar el trabajo a la cola:

    $schedule->job(new Heartbeat)->everyFiveMinutes();

    // Dispatch the job to the "heartbeats" queue...
    $schedule->job(new Heartbeat, 'heartbeats')->everyFiveMinutes();

<a name="scheduling-shell-commands"></a>
### Programando Comandos Del Shell

El método `exec` puede ser usado para emitir un comando al sistema operativo:

    $schedule->exec('node /home/forge/script.js')->daily();

<a name="schedule-frequency-options"></a>
### Programando Opciones De Frecuencias

Por supuesto, hay una variedad de programaciones que puedes asignar a tu tarea:

Método  | Descripción
------------- | -------------
`->cron('* * * * * *');`  |  Ejecuta la tarea en una programación Cron personalizada
`->everyMinute();`  |  Ejecuta la tarea cada minuto
`->everyFiveMinutes();`  |   Ejecuta la tarea cada cinco minutos
`->everyTenMinutes();`  |  Ejecuta la tarea cada diez minutos
`->everyFifteenMinutes();`  |  Ejecuta la tarea cada quince minutos
`->everyThirtyMinutes();`  |  Ejecuta la tarea cada treinta minutos
`->hourly();`  |  Ejecuta la tarea cada hora
`->hourlyAt(17);`  |  Ejecuta la tarea cada hora en el minuto 17
`->daily();`  |  Ejecuta la tarea cada día a la medianoche
`->dailyAt('13:00');`  |  Ejecuta la tarea cada día a las 13:00
`->twiceDaily(1, 13);`  |  Ejecuta la tarea cada día a las 1:00 y a las 13:00
`->weekly();`  |  Ejecuta la tarea cada semana
`->weeklyOn(1, '8:00');`  |  Ejecuta a tarea cada semana los lunes a las 8:00
`->monthly();`  |  Ejecuta la tarea cada mes
`->monthlyOn(4, '15:00');`  |  Ejecuta la tarea el 4 de cada mes a las 15:00
`->quarterly();` |  Ejecuta la tarea cada trimestre
`->yearly();`  |  Ejecuta la tarea cada año
`->timezone('America/New_York');` | Establece la zona horaria

Tstos métodos pueden ser combinados con restricciones adicionales para crear programaciones más ajustadas que sólo se ejecutan en determinados días de la semana. Por ejemplo, para programar un comando para que sea ejecutado los lunes:

    // Run once per week on Monday at 1 PM...
    $schedule->call(function () {
        //
    })->weekly()->mondays()->at('13:00');

    // Run hourly from 8 AM to 5 PM on weekdays...
    $schedule->command('foo')
              ->weekdays()
              ->hourly() method
              ->timezone('America/Chicago')
              ->between('8:00', '17:00');

Debajo hay una lista de las restricciones de programación adicionales:

Method  | Description
------------- | -------------
`->weekdays();`  |  Limita la tarea a los días de semana
`->weekends();`  |  Limita la tarea a los fines de semana
`->sundays();`  |  Limita la tarea a los domingos
`->mondays();`  |  Limita la tarea a los lunes
`->tuesdays();`  |  Limita la tarea los martes
`->wednesdays();`  |  Limita la tarea a los miércoles
`->thursdays();`  |  Limita la tarea a los jueves
`->fridays();`  |  Limita la tarea a los viernes
`->saturdays();`  |  Limita la tarea a los sábados
`->between($start, $end);`  |  Limita la tarea para ser ejecutado entre $start y $end
`->when(Closure);`  |  Limita la tarea dependiendo de una prueba de veracidad
`->environments($env);`  |  Limita la tarea a ambientes específicos

#### Restricciones De Tiempo Between

El método `between` puede ser usado para limitar la ejecución de una tarea dependiendo de la hora del día:

    $schedule->command('reminders:send')
                        ->hourly()
                        ->between('7:00', '22:00');

De forma similar, el método `unlessBetween` puede ser usado para excluir la ejecución de una tarea por un periodo de tiempo:

    $schedule->command('reminders:send')
                        ->hourly()
                        ->unlessBetween('23:00', '4:00');

#### Restricciones De Veracidad

El método `when` puede ser usado para limitar la ejecución de una tarea en base al resultado de un test de veracidad dado. En otras palabras, si la `Closure` dada retorna `true`, la tarea será ejecutada siempre y cuando ninguna otra restricción prevenga la tarea de ser ejecutada:

    $schedule->command('emails:send')->daily()->when(function () {
        return true;
    });

El método `skip` puede ser visto como el inverso de `when`. Si el método `skip` retorna `true`, la tarea programada no será ejecutada:

    $schedule->command('emails:send')->daily()->skip(function () {
        return true;
    });

Al usar métodos `when` encadenados, el comando programado sólo será ejecutado si todas las condiciones `when` retornan `true`.

#### Environment Constraints

The `environments` method may be used to execute tasks only on the given environments:

    $schedule->command('emails:send')
                ->daily()
                ->environments(['staging', 'production']);

<a name="timezones"></a>
### Zonas Horarias

Usando el método `timezone`, puedes especificar que el tiempo de una tara programada debe ser interpretada en una zona horaria dada:

    $schedule->command('report:generate')
             ->timezone('America/New_York')
             ->at('02:00')

> {note} Recuerda que algunas zonas horarias usan horario de verano. Cuando ocurren cambios por horario de verano, tu tarea programada puede ejecutarse dos veces o puede no ser ejecutada. Por esto, recomendamos evitar programación con zona horaria en la medida de lo posible.

<a name="preventing-task-overlaps"></a>
### Previniendo Superposición De Tareas

Por defecto, las tareas programadas serán ejecutadas incluso si la instancia anterior de la tarea todavía está en ejecución. Para evitar esto, puedes usar el método `withoutOverlapping`:

    $schedule->command('emails:send')->withoutOverlapping();

En este ejemplo, el [comando de Artisan](/docs/{{version}}/artisan) `emails:send` será ejecutado cada minuto si ya no está siendo ejecutado. El método `withoutOverlapping` es especialmente útil si tienes tareas que varian drasticamente en su tiempo de ejecución, evitando que puedas predecir exactamente cuanto tiempo una tarea tomará.

Si es necesario, se puede especificar cuántos minutos deben pasar antes de que el bloqueo "sin superposición" expire. Por defecto, el bloqueo expirará luego de 24 horas:

    $schedule->command('emails:send')->withoutOverlapping(10);

<a name="running-tasks-on-one-server"></a>
### Ejecutando tareas en un servidor

> {note} Para utilizar esta característica, tu aplicación debe estar usando el controlador de caché `memcached` o `redis` como predeterminado. Además, todos los servidores deben comunicarse al mismo servidor central de caché.

Si tu aplicación está siendo ejecutada en múltiples servidores, puedes limitar un trabajo programado a sólo ejecutarse en un servidor. Por ejemplo, asume que se tiene una tarea programada que genera un reporte nuevo cada Viernes en la noche. SI el programador de tareas está siendo ejecutado en tres servidores de worker, la tarea programada se ejecutará en todos y generará el reporte tres veces. ¡No es bueno!

Para indicar que la tarea debe ejecutarse sólo en un servidor, usa el método `onOneServer` al definir la tarea programada. El primer servidor en obtener la tarea asegurará un bloqueo atómico en el trabajo para prevenir que otros servidores ejecuten la misma tarea al mismo tiempo:

    $schedule->command('report:generate')
                    ->fridays()
                    ->at('17:00')
                    ->onOneServer();

<a name="background-tasks"></a>
### Tareas en segundo plano

Por defcto, múltiples comandos programados al mismo tiempo se ejecutarán secuencialmente. SI tienes comandos de ejecución larga, esto puede causar que los siguientes comandos sean ejecutados mucho más tarde que lo esperado. Si se desea ejecutar comandos en segundo plano para que todos funcionen de forma simultánea, se puede usar el método `runInBackground`:

    $schedule->command('analytics:report')
             ->daily()
             ->runInBackground();

<a name="maintenance-mode"></a>
### Modo De Mantenimiento

Las tareas programadas de Laravel no serán ejecutadas cuando Laravel está en [modo de mantenimiento](/docs/{{version}}/configuration#maintenance-mode), dado que no queremos que tus tareas interfieran con cualquier mantenimiento incompleto que puedes estar realizando en tu servidor. Sin embargo, si te gustaría forzar la ejecución de una tarea incluso en modo de mantenimiento, puedes usar el método `evenInMaintenanceMode`:

    $schedule->command('emails:send')->evenInMaintenanceMode();

<a name="task-output"></a>
## Resultado De La Tarea

El programador de Laravel proporciona múltiples métodos convenientes para trabajar con el resultado generado por una tarea programada. Primero, usando el método `sendOutputTo`, puedes enviar el resultado a un archivo para una inspección posterior:

    $schedule->command('emails:send')
             ->daily()
             ->sendOutputTo($filePath);

Si te gustaría agregar el resultado a un archivo dado, puedes usar el método `appendOutputTo`:

    $schedule->command('emails:send')
             ->daily()
             ->appendOutputTo($filePath);

Usando el método `emailOutputTo`, puedes enviar el resultado a una dirección de correo electrónico de tu preferencia. Antes de enviar por correo electrónico el resultado de una tarea, debes configurar los [servicios de correo electrónico](/docs/{{version}}/mail) de Laravel:

    $schedule->command('foo')
             ->daily()
             ->sendOutputTo($filePath)
             ->emailOutputTo('foo@example.com');

> {note} Los métodos `emailOutputTo`, `sendOutputTo` y `appendOutputTo` son exclusivos para el método `command` y no son soportados por `call`.

<a name="task-hooks"></a>
## Hooks De Tareas

Usando los métodos `before` y `after`, puedes especificar código que será ejecutado antes y después de que la tarea programada sea completada:

    $schedule->command('emails:send')
             ->daily()
             ->before(function () {
                 // Task is about to start...
             })
             ->after(function () {
                 // Task is complete...
             });

#### Haciendo Ping a URLs

Usando los métodos `pingBefore` y `thenPing`, el programador de tareas puede automáticamente hacer ping a una URL dada antes o después de que una tarea sea completada. Este método es útil para notificar a un servicio externo, como [Laravel Envoyer](https://envoyer.io), que tu tarea programada está comenzando o ha finalizado su ejecución:

    $schedule->command('emails:send')
             ->daily()
             ->pingBefore($url)
             ->thenPing($url);

Los métodos `pingBeforeIf` y `thenPingIf` pueden ser usados para hacer ping a una URL dada sólo si la condición dada es `true`:

    $schedule->command('emails:send')
             ->daily()
             ->pingBeforeIf($condition, $url)
             ->thenPingIf($condition, $url);

Todos los métodos de ping requieren la librería HTTP Guzzle. Puedes agregar Guzzle a tu proyecto usando el administrador de paquetes Composer:

    composer require guzzlehttp/guzzle
