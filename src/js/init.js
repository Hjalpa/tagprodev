const app = {}

app.filters = (async() => {
	let filters = document.querySelector('.page-filter')
	filters.addEventListener('click', (e) => {
		let season = util.findParentBySelector(e.target, ".season")
		let elo = util.findParentBySelector(e.target, ".elo")
		let map = util.findParentBySelector(e.target, ".map")
		let btn = util.findParentBySelector(e.target, ".applyFilters")

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



			console.log(url)
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


})

if(document.querySelector('.page-filter')) {
	app.filters()

	// let snapValues = [
	// 	document.getElementById('s-value_lower'),
	// 	document.getElementById('s-value_upper')
	// ]

	const slider = document.getElementById('slider')
	noUiSlider.create(slider, {
		start: [2000, 3000],
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
	});




}


// document.querySelector('.stat-nav').addEventListener('click', (e) => {
// 	console.log('test')
// 	document.querySelector('.stat-nav-overlay').classList.add('active')
// })
