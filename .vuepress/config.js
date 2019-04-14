module.exports = {
    title: 'Documentación de Laravel en español',
    themeConfig: {
        sidebar: [
            {
                title: 'Prólogo',
                children: [
                    ['/releases', 'Notas de lanzamiento'],
                    ['/upgrade', 'Guía de actualización'],
                    ['/contributions', 'Guía de contribución']
                ]
            },
            {
                title: 'Pasos iniciales',
                children: [
                    ['/installation', 'Instalación'],
                    ['/configuration', 'Configuración'],
                    ['/structure', 'Estructura de directorios'],
                    ['/homestead', 'Laravel Homestead'],
                    ['/valet', 'Laravel Valet'],
                    ['/deployment', 'Despliegue']
                ]
            }

            // {
            //     title: 'Prólogo',
            //     children: [
            //         ['/releases', 'Notas de lanzamiento'],
            //         ['/upgrade', 'Guía de actualización'],
            //         ['/contributions', 'Guía de contribución']
            //     ]
            // },
            // {
            //     title: 'Pasos iniciales',
            //     children: [
            //         ['/installation', 'Instalación'],
            //         ['/configuration', 'Configuración'],
            //         ['/structure', 'Estructura de directorios']
            //         ['/homestead', 'Laravel Homestead'],
            //         ['/valet', 'Laravel Valet'],
            //         ['/deployment', 'Despliegue']
            //     ]
            // }
        ]
    }
}
