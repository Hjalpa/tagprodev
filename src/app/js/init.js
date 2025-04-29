const app = {
	load: async e => {
		app.tablesort.init()
		app.playerSeasons.init()
	}
}

window.addEventListener('load', app.load)
