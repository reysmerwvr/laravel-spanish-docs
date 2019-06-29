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
			{ text: 'Glosario', link: '/glossary'},			
			{ text: 'Créditos', link: '/credits' },
			{ text: 'Styde', link: 'https://styde.net/'},
       	],
		search: true,
		sidebar: [
			{
				title: 'Primeros pasos',
				collapsable: true,
				children: [
					'/installation',
					'/configuration',
					'/structure',
					'/homestead',
					'/valet',
					'/deployment',
				]
			},
			{
				title: 'Conceptos de arquitectura',
				collapsable: true,
				children: [
					'/lifecycle',
					'/container',
					'/providers',
					'/facades',
					'/contracts'
				]
			},
			{
				title: 'Fundamentos',
				collapsable: true,
				children: [
					'/routing',
					'/middleware',
					'/csrf',
					'/controllers',
					'/requests',
					'/responses',
					'/views',
					'/urls',
					'/session',
					'/validation',
					'/errors',
					'/logging'
				]
			},         
			{
				title: 'Frontend',
				collapsable: true,
				children: [
					'/blade',
					'/localization',
					'/frontend',
					'/mix'
				]
			},
			{
				title: 'Seguridad',
				collapsable: true,
				children: [
					'/authentication',
					'/api-authentication',
					'/authorization',
					'/verification',
					'/encryption',
					'/hashing',
					'/passwords'
				]
			},
			{
				title: 'Profundizando',
				collapsable: true,
				children: [
					'/artisan',
					'/broadcasting',
					'/cache',
					'/collections',
					'/events',
					'/filesystem',
					'/helpers',
					'/mail',
					'/notifications',
					'/packages',
					'/queues',
					'/scheduling'
				]
			},
			{
				title: 'Bases de datos',
				collapsable: true,
				children: [
					'/database.md',
					'/queries.md',
					'/pagination.md',
					'/migrations.md',
					'/seeding.md',
					'/redis.md'
				]
			},
			{
				title: 'ORM Eloquent',
				collapsable: true,
				children: [
					'/eloquent.md',
					'/eloquent-relationships.md',
					'/eloquent-collections.md',
					'/eloquent-mutators.md',
					'/eloquent-serialization.md'
				]
			},
			{
				title: 'Pruebas',
				collapsable: true,
				children: [
					'/testing.md',
					'/http-tests.md',
					'/console-tests.md',
					'/dusk.md',
					'/database-testing.md',
					'/mocking.md'
				]
			},
			{
				title: 'Paquetes oficiales',
				collapsable: true,
				children: [
					'/billing.md',
					'/dusk.md',
					'/envoy.md',
					'/horizon.md',
					'/passport.md',
					'/scout.md',
					'/socialite.md',
					'/telescope.md'
				]
			}			           
		]
   	},
}