const app = {}

app.filters = (async() => {
	let filters = document.querySelector('.page-filter')
	filters.addEventListener('click', (e) => {
		let season = util.findParentBySelector(e.target, ".season")
		let elo = util.findParentBySelector(e.target, ".elo")
		let map = util.findParentBySelector(e.target, ".map")
		let played = util.findParentBySelector(e.target, ".played")
		let reset = util.findParentBySelector(e.target, ".reset")

		if(season)
			openFilter(season)

		else if(map)
			openFilter(map)

		else if(elo)
			openFilter(elo)

		else if(played)
			openFilter(played)

		// else if(reset)
		// 	played.querySelector('.drop-down_list').classList.add('active')




	})




	function openFilter(self) {
		self.querySelector('.drop-down_list').classList.add('active')

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

	let slider = document.getElementById('slider')
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
}


// document.querySelector('.stat-nav').addEventListener('click', (e) => {
// 	console.log('test')
// 	document.querySelector('.stat-nav-overlay').classList.add('active')
// })
