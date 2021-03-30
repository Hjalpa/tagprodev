const app = {}

app.filters = (async() => {
	let filters = document.querySelector('.page-filter')
	filters.querySelector('.season').addEventListener('click', (e) => {
		document.querySelector('.page-filter .season .drop-down_list').classList.add('active')
	})
})

if(document.querySelector('.page-filter'))
	app.filters()
