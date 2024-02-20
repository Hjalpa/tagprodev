// new signup
document.querySelector('.new input').addEventListener('paste', async (e) => {
	let form = document.querySelector('.new')

	// prevent click spam
	if(document.body.classList.contains('loading')) return false
	document.body.classList.add('loading')


	// remove error if exists
	if(form.classList.contains('error'))
		form.classList.remove('error')

	let profile = (event.clipboardData || window.clipboardData).getData('text')

	let raw = await fetch('/eltp/23/signup', {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'cache-control': 'no-cache'
		},
		body: JSON.stringify({
			profile
		})
	})
	let data = await raw.json()

	if(data) {
		if(data.id) {
			document.querySelector('.verification').dataset.id = data.id
			openVerification(data)
			document.body.classList.remove('loading')
		}
		else {
			form.classList.add('error')
			form.querySelector('input').placeholder = 'Invalid Profile. Try again'

			form.addEventListener('animationend', () => {
				form.querySelector('input').value = ''
				document.body.classList.remove('loading')
			})
		}

	}
})

// verification
document.querySelector('.verification button').addEventListener('click', async (e) => {
	e.preventDefault()

	// prevent click spam
	if(document.body.classList.contains('loading')) return false
	document.body.classList.add('loading')

	// disable button
	let screen = document.querySelector('.verification')
	screen.querySelector('button').disabled = true

	// remove error if exists
	if(screen.classList.contains('error'))
		screen.classList.remove('error')

	let raw = await fetch('/eltp/23/signup', {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'cache-control': 'no-cache'
		},
		body: JSON.stringify({
			id: screen.dataset.id
		})
	})
	let data = await raw.json()

	if(data) {
		if(data.error) {
			screen.classList.add('error')
			screen.addEventListener('animationend', () => {
				screen.querySelector('button').disabled = false
				document.body.classList.remove('loading')
			})
		}
		else if(data.success) {
			screen.classList.add('success')

			screen.querySelector('h2').innerText = 'Yowie Wowie'
			screen.querySelector('h5').classList.add('hide')
			screen.querySelector('p').innerText = `Congrats. You're verified, and will be placed into the auction pool for the upcoming season!`

			screen.querySelector('.discord').classList.remove('hide')

			screen.querySelector('button').classList.add('hide')
			document.body.classList.remove('loading')
		}
		else {
			screen.querySelector('button').disabled = false
			document.body.classList.remove('loading')


			let username = screen.querySelector('p .name').innerText
			screen.querySelector('p').innerHTML = `Good <span class="name"></span>. That worked. Now switch your Tagpro flair to: <span class="flair"></span>`
			screen.querySelector('.name').innerText = username

			openVerification(data)
		}
	}
})


function openVerification(data) {
	let screen = document.querySelector('.verification')
	screen.querySelector('p .name').innerText = data.username
	screen.querySelector('.step').innerText = data.step

	if(data.step) {
		switch(data.step) {
			case 1:
				screen.querySelector('.flair').innerText = 'No Flair'
			break;
			case 2:
				screen.querySelector('.flair').innerText = 'Pencil'
		}
	}

	document.querySelector('.new').classList.add('hide')
	document.querySelector('.verification').classList.remove('hide')
}
