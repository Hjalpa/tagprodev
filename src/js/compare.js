app.compare = (async() => {
	let form = document.querySelector('form')
	form.querySelector('button').addEventListener('click', async (e) => {
		e.preventDefault()

		document.querySelector('.compare-results').style.display = 'block'

		let players = {
			player1: form.querySelector('.player1 select').value,
			player2: form.querySelector('.player2 select').value,
			// player3: form.querySelector('.player3 select').value
		}

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
				// if(stat === 'player') continue

				// set values
				document.querySelector('.'+stat+' .player1').innerText = data[0][stat]
				document.querySelector('.'+stat+' .player2').innerText = data[1][stat]

				// set highlight
				if(data[0][stat] > data[1][stat])
					document.querySelector('.'+stat+' .player1').classList.add('highlight')
				else if(data[0][stat] < data[1][stat])
					document.querySelector('.'+stat+' .player2').classList.add('highlight')
			}
		}

	})
})

if(document.querySelector('.select_players'))
	app.compare()
