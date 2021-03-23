document.querySelector('.import button').addEventListener('click', async (e) => {
	e.preventDefault()

	const form = document.querySelector('form')

	let data = {
		season: parseInt(form.querySelector('.season input').value),
		week: parseInt(form.querySelector('.week input').value),
		game: parseInt(form.querySelector('.game input').value),
		half1: {
			euids: form.querySelector('.half1 .euids input').value,
			red: form.querySelector('.half1 .red .team').value,
			blue: form.querySelector('.half1 .blue .team').value,
		},
		half2: {
			euids: form.querySelector('.half2 .euids input').value,
			red: form.querySelector('.half2 .red .team').value,
			blue: form.querySelector('.half2 .blue .team').value,
		}
	}

	let raw = await fetch('/api/import', {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'X-Requested-With': 'fetch', // used to allowed /GET/ pages to load
			'cache-control': 'no-cache',
		},
		body: JSON.stringify({data})
	})
	let res = await raw.json()

	console.log(res)
})
