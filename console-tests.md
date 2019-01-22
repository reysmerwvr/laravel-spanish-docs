# Pruebas de consola

- [Introducción](#introduction)
- [Esperando Entrada / Salida](#expecting-input-and-output)

## Introducción

Además de simplificar las pruebas de HTTP, Laravel proporciona una API simple para probar las aplicaciones de consola que solicitan información del usuario.

<a name="expecting-input-and-output"></a>
## Esperando Entrada / Salida

Laravel te permite "simular" (mock) fácilmente la entrada de usuario para los comandos de su consola utilizando el método `expectsQuestion`. Además, puedes especificar el código de salida y el texto que esperas que genere el comando de la consola utilizando los métodos `assertExitCode` y` expectsOutput`. Por ejemplo, considere el siguiente comando de consola:

    Artisan::command('question', function () {
        $name = $this->ask('What is your name?');

        $language = $this->choice('Which language do you program in?', [
            'PHP',
            'Ruby',
            'Python',
        ]);

        $this->line('Your name is '.$name.' and you program in '.$language.'.');
    });

Puedes probar este comando con la siguiente prueba que utiliza los métodos `expectsQuestion`,` expectsOutput` y `assertExitCode`:

    /**
     * Test a console command.
     *
     * @return void
     */
    public function test_console_command()
    {
        $this->artisan('question')
             ->expectsQuestion('What is your name?', 'Taylor Otwell')
             ->expectsQuestion('Which language do you program in?', 'PHP')
             ->expectsOutput('Your name is Taylor Otwell and you program in PHP.')
             ->assertExitCode(0);
    }


