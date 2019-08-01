module.exports = {
	title: 'Documentación de Laravel',
  	head: [
		['link', {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Catamaran:300,700|Miriam+Libre'}],
		['link', { rel: 'icon', href: '/favicon.png' }]
  	],
  	description: 'Documentación de Laravel en Español',
  	themeConfig: {
    	nav: [
			{ text: 'Inicio', link: '/' },
			{ text: 'Índice', link: '/documentation'},
			{ text: 'Glosario', link: '/glossary'},			
			{ text: 'Créditos', link: '/credits' },
			{ text: 'Descargar documentación', link: '/descargar-documentacion' },
			{ text: 'Styde', link: 'https://styde.net/'},
       	],
		search: true,
		sidebar: [
			{
				title: 'Primeros pasos',
				collapsable: true,
				children: [
					['/installation', 'Instalación'],
					['/configuration', 'Configuración'],
					['/structure', 'Estructura de directorios'],
					['/homestead', 'Laravel Homestead'],
					['/valet', 'Laravel Valet'],
					['/deployment', 'Despliegue']
				]
			},
			{
				title: 'Conceptos de arquitectura',
				collapsable: true,
				children: [
					['/lifecycle', 'Ciclo de vida de la solicitud'],
					['/container', 'Contenedor de servicios'],
					['/providers', 'Proveedores de Servicios'],
					['/facades', 'Facades'],
					['/contracts', 'Contratos']
				]
			},
			{
				title: 'Fundamentos',
				collapsable: true,
				children: [
					['/routing', 'Rutas'],
					['/middleware', 'Middleware'],
					['/csrf', 'Protección CSRF'],
					['/controllers', 'Controladores'],
					['/requests', 'Solicitudes HTTP'],
					['/responses', 'Respuestas HTTP'],
					['/views', 'Vistas'],
					['/urls', 'Generación de URLs'],
					['/session', 'Sesión HTTP'],
					['/validation', 'Validación'],
					['/errors', 'Manejo de errores'],
					['/logging', 'Registro (Logging)']
				]
			},         
			{
				title: 'Frontend',
				collapsable: true,
				children: [
					['/blade', 'Plantillas Blade'],
					['/localization', 'Configuración regional'],
					['/frontend', 'JavaScript y estructuración de CSS'],
					['/mix', 'Compilación de assets (Laravel Mix)']
				]
			},
			{
				title: 'Seguridad',
				collapsable: true,
				children: [
					['/authentication', 'Autenticación'],
					['/api-authentication', 'Autenticación de API'],
					['/authorization', 'Autorización'],
					['/verification', 'Verificación de correo electrónico'],
					['/encryption', 'Cifrado'],
					['/hashing', 'Hashing'],
					['/passwords', 'Restablecimiento de contraseñas']
				]
			},
			{
				title: 'Profundizando',
				collapsable: true,
				children: [
					['/artisan', 'Consola artisan'],
					['/broadcasting', 'Broadcasting'],
					['/cache', 'Caché'],
					['/collections', 'Colecciones'],
					['/events', 'Eventos'],
					['/filesystem', 'Almacenamiento de archivos'],
					['/helpers', 'Helpers'],
					['/mail', 'Correos electrónicos'],
					['/notifications', 'Notificaciones'],
					['/packages', 'Desarrollo de paquetes'],
					['/queues', 'Colas de trabajo'],
					['/scheduling', 'Programación de tareas']
				]
			},
			{
				title: 'Bases de datos',
				collapsable: true,
				children: [
					['/database.md', 'Bases de datos: Primeros pasos'],
					['/queries.md', 'Base de datos: Constructor de consultas (query builder)'],
					['/pagination.md', 'Base de datos: Paginación'],
					['/migrations.md', 'Base de datos: Migraciones'],
					['/seeding.md', 'Base de datos: Seeding'],
					['/redis.md', 'Redis']
				]
			},
			{
				title: 'ORM Eloquent',
				collapsable: true,
				children: [
					['/eloquent.md', 'Eloquent: Primeros Pasos'],
					['/eloquent-relationships.md', 'Eloquent: Relaciones'],
					['/eloquent-collections.md', 'Eloquent: Colecciones'],
					['/eloquent-mutators.md', 'Eloquent: Mutators'],
					['/eloquent-resources.md', 'Eloquent: Recursos API'],
					['/eloquent-serialization.md', 'Eloquent: Serialización']
				]
			},
			{
				title: 'Pruebas',
				collapsable: true,
				children: [
					['/testing.md', 'Pruebas: Primeros Pasos'],
					['/http-tests.md', 'Pruebas HTTP'],
					['/console-tests.md', 'Pruebas de consola'],
					['/dusk.md', 'Laravel Dusk'],
					['/database-testing.md', 'Pruebas de base de datos'],
					['/mocking.md', 'Mocking']
				]
			},
			{
				title: 'Paquetes oficiales',
				collapsable: true,
				children: [
					['/billing.md', 'Laravel Cashier'],
					['/dusk.md', 'Laravel Dusk'],
					['/envoy.md', 'Laravel Envoy'],
					['/horizon.md', 'Laravel Horizon'],
					['/passport.md', 'Laravel Passport'],
					['/scout.md', 'Scout para Laravel'],
					['/socialite.md', 'Laravel Socialite'],
					['/telescope.md', 'Laravel Telescope']
				]
			}			           
		]
   	},
}