app.compare = (async() => {

	new TomSelect('#select-players',{
		maxItems: 8,
		plugins: {
			remove_button:{
				title:'Remove',
			}
		},
		persist: false
	})

	// collapse expand block
	document.addEventListener('click', function (event) {

		// If the clicked element doesn't have the right selector, bail
		if (!event.target.matches('.player-comparison__group-title')) return

		// Don't follow the link
		event.preventDefault()

		// Log the clicked element in the console
		var parentparent = event.target.parentElement.parentElement
		parentparent.classList.toggle("active")

	}, false)


	// get the sticky element
	const stickyElm = document.querySelector('.player-comparison__stats.name-area')

	const observer = new IntersectionObserver(
		([e]) => e.target.classList.toggle('isSticky', e.intersectionRatio < 1),
		{threshold: [1]}
	);

	observer.observe(stickyElm)















	let form = document.querySelector('.player-comparison__select-wrapper')
	form.querySelector('button').addEventListener('click', async (e) => {
		e.preventDefault()

		let options = form.querySelector('select').selectedOptions
		let players = Array.from(options).map(({ value }) => value)

		let raw = await fetch('/compare/data', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'Cache-Control': 'no-cache'
			},
			body: JSON.stringify(players)
		})
		let data = await raw.json()

		if(data) {
			await render(data)
			await highlight()

			document.querySelector('.compare-results').style.display = 'block'
		}

	})

	async function render(data) {

		// remove all values
		document.querySelectorAll('.player-value').forEach(e => e.remove())

		for(let playerid in data) {
			let player = data[playerid].playernameseason
			for (let stat in data[playerid]) {
				let value = data[playerid][stat]

				// set value if stat exists
				if(document.querySelector('.'+stat)) {
					let div = document.createElement('div')
					div.classList.add('player-value')
					div.innerText = value

					util.insertAfter(div, document.querySelector('.'+stat+' .label'))
				}
			}
		}

	}


	async function highlight() {

		// each row
		document.querySelectorAll('.row:not(.playernameseason)').forEach((row) => {
			let data = {}
			let label = row.querySelector('.label').innerText

			// each player value
			row.querySelectorAll('.player-value').forEach((pv) => {
				let value = getValue(pv.innerText)

				if(!data.hasOwnProperty(label)) {
					data[label] = value
					pv.classList.add('highlight')
				}
				else if(value >= data[label]) {

					if(value > data[label])
						row.querySelectorAll('.highlight').forEach(e => e.classList.remove('highlight'))

					pv.classList.add('highlight')

					data[label] = value
				}

			})

		})


		function getValue(value) {

			// MM:SS
			if((/^([0-9][0-9]):[0-5][0-9]$/).test(value)){
				// console.log('MM:SS', value)
				let a = value.replace(':', '.')
				return parseFloat(a)
			}

			// HH:MM:SS
			else if (value.match(/\d+:[0-5]\d/)) {
				let a = value.split(':')
				return (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2])
			}

			else
				return parseFloat(value)

		}

	}

})

if(document.querySelector('.player-comparison__select'))
	app.compare()
