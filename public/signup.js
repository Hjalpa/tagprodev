document.querySelector('button').addEventListener('click', async (e) => {
	e.preventDefault()

	let form = document.querySelector('form')

	if(form.querySelector(':invalid')) return false

	let name = form.querySelector('input').value

	let raw = await fetch('/signup', {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'cache-control': 'no-cache'
		},
		body: JSON.stringify({
			name
		})
	})
	let data = await raw.json()

	form.querySelector('.form').innerHTML = `<h3>I'll be in touch ❤️</h3>`
	form.querySelector('.info').innerHTML = ``
	document.cookie = 'signup; expires=Sun, 1 Jan 2023 00:00:00 UTC; path=/'
})

if(document.cookie == 'signup') {
	let form = document.querySelector('form')
	form.querySelector('.form').innerHTML = `<h3>You've already signed up ❤️</h3>`
	form.querySelector('.info').innerHTML = ``
}
