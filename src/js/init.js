const app = {}

app.search = (async() => {
	const search = document.querySelector('form.search button')
	search.addEventListener('click', (e) => {
		e.preventDefault()
		let player = document.querySelector('form.search input').value
		window.location.href = '/search/' + player
	})
})
app.search()
