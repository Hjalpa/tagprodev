app.filters = (async() => {
	initSlider()

	let filters = document.querySelector('.page-filter')
	filters.addEventListener('click', (e) => {
		let season = util.findParentBySelector(e.target, ".season")
		let elo = util.findParentBySelector(e.target, ".elo")
		let map = util.findParentBySelector(e.target, ".map")
		let btn = util.findParentBySelector(e.target, ".filter-submit button")

		if(season)
			openFilter(season)
		else if(elo)
			openFilter(elo)
		else if(map)
			openFilter(map)

		else if(btn) {
			let uri = []

			// elo
			let elo = slider.noUiSlider.get()
			uri.push(`elo=${elo[0]}-${elo[1]}`)

			// seasons
			// let seasons = document.querySelectorAll('.season input:checked')
			const url = window.location.origin + window.location.pathname
			window.location.href = url + '?' + uri[0]
		}
	})


	function openFilter(self) {
		// close all existing
		if(document.querySelector('.drop-down_list.active'))
			document.querySelector('.drop-down_list.active').classList.remove('active')
		// open selected
		self.querySelector('.drop-down_list').classList.add('active')
		// close when clicked outside
		document.body.addEventListener('click', closeServing)
		function closeServing(e) {
			if(!util.findParentBySelector(e.target, ".drop-down")) {
				self.querySelector('.drop-down_list').classList.remove('active')
				document.body.removeEventListener('click', closeServing)
			}
		}
	}

	function initSlider() {

		let url = new URLSearchParams(window.location.search)
		let elo = (url.get('elo') ? url.get('elo').split('-') : [2000,3000])

		const slider = document.getElementById('slider')
		noUiSlider.create(slider, {
			start: elo,
			connect: true,
			tooltips: true,
			format: wNumb({decimals: 0}),
			step: 50,
			range: {
				'min': 0,
				'max': 3000
			},
		})

		slider.noUiSlider.on('update', function() {
			let value =slider.noUiSlider.get()
			let elo = document.querySelector('.drop-down.elo')
			elo.querySelector('.drop-down_current .value').innerText = value[0] + '-' + value[1]
		})

	}

})

if(document.querySelector('.page-filter')) {
	app.filters()

	document.querySelector('.page-select').addEventListener('click', (e) => {
		console.log('test')
		document.querySelector('.page-select .drop-down_list').classList.add('active')
	})
}
