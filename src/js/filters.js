app.filters = (async() => {
	initELO()
	initGame()
	initSeason()
	initMap()

	let filters = document.querySelector('.page-filter')
	filters.addEventListener('click', (e) => {
		let season = util.findParentBySelector(e.target, ".season")
		let elo = util.findParentBySelector(e.target, ".elo")
		let map = util.findParentBySelector(e.target, ".map")
		let game = util.findParentBySelector(e.target, ".game")
		let btn = util.findParentBySelector(e.target, ".filter-submit button")

		if(season)
			openFilter(season)
		else if(elo)
			openFilter(elo)
		else if(map)
			openFilter(map)
		else if(game)
			openFilter(game)

		else if(btn) {
			let uri = []

			// elo
			let elo = slider.noUiSlider.get()
			uri.push(`elo=${elo[0]}-${elo[1]}`)

			// seasons
			let seasonIDs = []
			for (const s of document.querySelectorAll('.season input:checked'))
				seasonIDs.push(s.value)
			if(seasonIDs[0] != 'all' && seasonIDs.length > 0)
				uri.push(`season=${seasonIDs.join(',')}`)

			// maps
			let mapIDs = []
			for (const s of document.querySelectorAll('.map input:checked'))
				mapIDs.push(s.value)
			if(mapIDs[0] != 'all' && mapIDs.length > 0)
				uri.push(`map=${mapIDs.join(',')}`)

			// game
			uri.push(`games=${document.querySelector('.drop-down.game .value').innerText}`)

			const url = window.location.origin + window.location.pathname
			window.location.href = url + '?' + uri.join('&')
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

	function initELO() {
		const slider = document.getElementById('slider')
		let url = new URLSearchParams(window.location.search)
		let elo = (url.get('elo') ? url.get('elo').split('-') : [2000,3000])

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

	function initGame() {
		const slider = document.getElementById('slider-game')
		let url = new URLSearchParams(window.location.search)
		let game = (url.get('games') ? url.get('games') : 50)

		noUiSlider.create(slider, {
			start: game,
			connect: true,
			tooltips: true,
			format: wNumb({decimals: 0}),
			step: 1,
			range: {
				'min': 1,
				'max': 1000
			},
		})

		slider.noUiSlider.on('update', function() {
			let game = document.querySelector('.drop-down.game')
			game.querySelector('.drop-down_current .value').innerText = slider.noUiSlider.get()
		})
	}

	function initSeason() {
		// on change
		document.querySelector('.season').addEventListener('change', (e) => {
			let seasons = []
			let options = document.querySelectorAll('.season input:not(input[value=all])')
			let label = document.querySelector('.season .value')
			let all = document.querySelector('.season input[value="all"]')

			if(all.checked) {
				label.innerText = 'All'
				for (const s of options) {
					s.disabled = true
					s.checked = false
				}
			}
			else {
				label.innerText = '-'
				for (const s of options) {
					s.disabled = false
					if(s.checked)
						seasons.push(s.parentNode.querySelector('label').innerText)
				}
			}

			if(seasons.length > 0)
				label.innerText = seasons.join(', ')
		})

		// set inital values
		let url = new URLSearchParams(window.location.search)
		let season = (url.get('season') ? url.get('season').split(',') : false)
		let label = document.querySelector('.season .value')
		if(season) {
			for (let s of season)
				document.querySelector(`.season input[value='${s}']`).checked = true

			document.querySelector('.season input[value="all"]').click()
		}
	}


	function initMap() {
		// on change
		document.querySelector('.map').addEventListener('change', (e) => {
			let maps = []
			let options = document.querySelectorAll('.map input:not(input[value=all])')
			let label = document.querySelector('.map .value')
			let all = document.querySelector('.map input[value="all"]')

			if(all.checked) {
				label.innerText = 'All'
				for (const s of options) {
					s.disabled = true
					s.checked = false
				}
			}
			else {
				label.innerText = '-'
				for (const s of options) {
					s.disabled = false
					if(s.checked)
						maps.push(s.parentNode.querySelector('label').innerText)
				}
			}

			if(maps.length > 0)
				label.innerText = maps.join(', ')
		})

		// set inital values
		let url = new URLSearchParams(window.location.search)
		let map = (url.get('map') ? url.get('map').split(',') : false)
		let label = document.querySelector('.map .value')
		if(map) {
			for (let s of map)
				document.querySelector(`.map input[value='${s}']`).checked = true

			document.querySelector('.map input[value="all"]').click()
		}
	}

})

if(document.querySelector('.page-filter')) {
	app.filters()
}
