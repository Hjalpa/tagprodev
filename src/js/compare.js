app.compare = (async() => {

	new TomSelect('#select-players',{
		maxItems: 4,
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

		document.querySelector('.compare-results').style.display = 'block'

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
			let keys = Object.keys(data[0])

			// remove all highlight
			document.querySelectorAll('.highlight').forEach(e => e.classList.remove('highlight'))

			for (let k in keys) {
				let stat = keys[k]
				if(stat === 'player') {
					console.log(k)
					continue
				}

				// find stat (if exists)
				// loop through data entries for each player for this stat

				// console.log(keys[k])


				// set values
				document.querySelector('.'+stat+' .player1').innerText = data[0][stat]
				document.querySelector('.'+stat+' .player2').innerText = data[1][stat]

				// set highlight
				// if(data[0][stat] > data[1][stat])
				// 	document.querySelector('.'+stat+' .player1').classList.add('highlight')
				// else if(data[0][stat] < data[1][stat])
				// 	document.querySelector('.'+stat+' .player2').classList.add('highlight')
			}
		}

	})
})

if(document.querySelector('.player-comparison__select'))
	app.compare()
