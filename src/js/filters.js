app.filters = (async() => {
	initELO()
	initSeason()
	initMap()

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
			let seasonIDs = []
			for (const s of document.querySelectorAll('.season input:checked'))
				seasonIDs.push(s.value)
			if(seasonIDs.length === 1)
				uri.push(`season=${seasonIDs.join(',')}`)

			// maps
			let mapIDs = []
			for (const s of document.querySelectorAll('.map input:checked'))
				mapIDs.push(s.value)
			if(mapIDs[0] != 'all')
				uri.push(`map=${mapIDs.join(',')}`)

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


	function initSeason() {
		let url = new URLSearchParams(window.location.search)
		let season = (url.get('season') ? url.get('season').split(',') : false)
		if(season) {
			document.querySelector(".season input[value='1']").checked = false
			document.querySelector(".season input[value='2']").checked = false
			let text = []
			for (let s of season) {
				document.querySelector(`.season input[value='${s}']`).checked = true
				text.push('EU CTF S' + s)
			}
			if(text.length < 2)
				document.querySelector('.season .value').innerText = text.join(',')
		}

		// set label text on input changes
		for (let i of document.querySelectorAll('.season input')) {
			i.addEventListener('change', (e) => {
				let text = []

				for (const s of document.querySelectorAll('.season input:checked'))
					text.push('EU CTF S' + s.value)

				if(text.length === 1)
					document.querySelector('.season .value').innerText = text.join(',')
				else
					document.querySelector('.season .value').innerText = 'All'

			})

		}

		// disable+enable options
		document.querySelector('.season input[value="all"]').addEventListener('change', (e) => {
			let all = document.querySelector('.season input[value="all"]')
			if(all.checked)
				for (const s of document.querySelectorAll('.season input:not(input[value=all])')) {
					s.disabled = true
					s.checked = false
				}
			else
				for (const s of document.querySelectorAll('.season input:not(input[value=all])'))
					s.disabled = false
		})
	}

	function initMap() {
		// let url = new URLSearchParams(window.location.search)
		// let season = (url.get('season') ? url.get('season').split(',') : false)
		// if(season) {
		// 	document.querySelector(".season input[value='1']").checked = false
		// 	document.querySelector(".season input[value='2']").checked = false
		// 	let text = []
		// 	for (let s of season) {
		// 		document.querySelector(`.season input[value='${s}']`).checked = true
		// 		text.push('EU CTF S' + s)
		// 	}
		// 	if(text.length < 2)
		// 		document.querySelector('.season .value').innerText = text.join(',')
		// }

		// set label text on input changes
		// for (let i of document.querySelectorAll('.map input')) {
		// 	i.addEventListener('change', (e) => {
		// 		let text = []

		// 		for (const s of document.querySelectorAll('.map input:checked'))
		// 			text.push(s.value)

		// 		if(text[0] === 'All')
		// 			document.querySelector('.map .value').innerText = 'All'
		// 		else
		// 			document.querySelector('.map .value').innerText = text.join(',')
		// 	})

		// }

		// disable+enable options
		document.querySelector('.map input[value="all"]').addEventListener('change', (e) => {
			let all = document.querySelector('.map input[value="all"]')
			if(all.checked)
				for (const s of document.querySelectorAll('.map input:not(input[value=all])')) {
					s.disabled = true
					s.checked = false
				}
			else
				for (const s of document.querySelectorAll('.map input:not(input[value=all])'))
					s.disabled = false
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
