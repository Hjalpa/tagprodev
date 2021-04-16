app.compare = (async() => {

	new TomSelect('#select-players',{
		maxItems: 6,
		plugins: {
			remove_button:{
				title:'Remove',
			}
		},
		persist: false
	});

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

			// remove all values
			document.querySelectorAll('.player-value').forEach(e => e.remove())

			for(let playerid in data) {
				let player = data[playerid].player
				for (let stat in data[playerid]) {
					let value = data[playerid][stat]

					// set value if stat exists
					if(document.querySelector('.'+stat)) {
						let div = document.createElement('div')
						div.classList.add('player-value')
						div.innerText = value

						util.insertAfter(div, document.querySelector('.'+stat+' .label'))
					}


					// set highlight
					// if(data[0][stat] > data[1][stat])
					// 	document.querySelector('.'+stat+' .player1').classList.add('highlight')
					// else if(data[0][stat] < data[1][stat])
					// 	document.querySelector('.'+stat+' .player2').classList.add('highlight')
				}
			}

			document.querySelector('.compare-results').style.display = 'block'
		}

	})

})

if(document.querySelector('.player-comparison__select'))
	app.compare()
