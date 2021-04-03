const app = {}

app.filters = (async() => {
	let filters = document.querySelector('.page-filter')
	filters.addEventListener('click', (e) => {
		let season = util.findParentBySelector(e.target, ".season")
		let elo = util.findParentBySelector(e.target, ".elo")
		let map = util.findParentBySelector(e.target, ".map")
		let played = util.findParentBySelector(e.target, ".played")
		let reset = util.findParentBySelector(e.target, ".reset")

		if(season)
			openFilter(season)

		else if(map)
			openFilter(map)

		else if(elo)
			openFilter(elo)

		else if(played)
			openFilter(played)

		// else if(reset)
		// 	played.querySelector('.drop-down_list').classList.add('active')




	})




	function openFilter(self) {
		self.querySelector('.drop-down_list').classList.add('active')

		document.body.addEventListener('click', closeServing)
		function closeServing(e) {
			if(!util.findParentBySelector(e.target, ".drop-down")) {
				self.querySelector('.drop-down_list').classList.remove('active')
				document.body.removeEventListener('click', closeServing)
			}
		}
	}


})

if(document.querySelector('.page-filter'))
	app.filters()





// document.querySelector('.stat-nav').addEventListener('click', (e) => {
// 	console.log('test')
// 	document.querySelector('.stat-nav-overlay').classList.add('active')
// })

app.compare = (async() => {
	let form = document.querySelector('form')
	form.querySelector('button').addEventListener('click', async (e) => {
		e.preventDefault()
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

app.tableSort = (async() => {
  const columnData = []
  const dictOfColumnIndexAndTableRow = {}
  for (let sortableTable of document.getElementsByTagName('table')) {
    if (sortableTable.className === 'table-sticky') {

      if (sortableTable.getElementsByTagName('thead').length === 0) {
        const the = document.createElement('thead');
        the.appendChild(sortableTable.rows[0]);
        sortableTable.insertBefore(the, sortableTable.firstChild);
      }

      const tableHead = sortableTable.querySelector('thead')
      const tableBody = sortableTable.querySelector('tbody')
      const tableHeadHeaders = tableHead.querySelectorAll('th')

      for (let [columnIndex, th] of tableHeadHeaders.entries('table')) {
        let timesClickedColumn = 0
        th.addEventListener("click", function() {
			// prevent rank & player sorting
			if(columnIndex === 0 || columnIndex === 1) return false

			timesClickedColumn += 1

			// remove classes if exist
			if(tableHead.querySelector('.sort-desc'))
				tableHead.querySelector('.sort-desc').classList.remove('sort-desc')
			if(tableHead.querySelector('.sort-asc'))
				tableHead.querySelector('th.sort-asc').classList.remove('sort-asc')

          function getTableDataOnClick() {
            const tableRows = tableBody.querySelectorAll('tr');
            for (let [i, tr] of tableRows.entries()) {
              if (tr.querySelectorAll('td').item(columnIndex).innerHTML !== '') {
                columnData.push(tr.querySelectorAll('td').item(columnIndex).innerHTML + '#' + i)
                dictOfColumnIndexAndTableRow[tr.querySelectorAll('td').item(columnIndex).innerHTML + '#' + i] = tr.innerHTML
              } else {
                columnData.push('0#' + i)
                dictOfColumnIndexAndTableRow['0#' + i] = tr.innerHTML
              }
            }

            function naturalSortAescending(a, b) {
              return a.localeCompare(b, navigator.languages[0] || navigator.language, {
                numeric: true,
                ignorePunctuation: true
              })
            }

            function naturalSortDescending(a, b) {
              return naturalSortAescending(b, a)
            }

            if (typeof columnData[0] !== "undefined") {
              if (th.classList.contains('order-desc') && timesClickedColumn === 1) {
                columnData.sort(naturalSortDescending, {
                  numeric: true,
                  ignorePunctuation: true
                })
              } else if (th.classList.contains('order-desc') && timesClickedColumn === 2) {
                columnData.sort(naturalSortAescending, {
                  numeric: true,
                  ignorePunctuation: true
                })
                timesClickedColumn = 0
              } else if (timesClickedColumn === 1) {
				th.classList.add('sort-asc')

                columnData.sort(naturalSortAescending)
              } else if (timesClickedColumn === 2) {
				th.classList.add('sort-desc')

                columnData.sort(naturalSortDescending)
                timesClickedColumn = 0
              }
            }
          }
          getTableDataOnClick();

          function returnSortedTable() {
            const tableRows = tableBody.querySelectorAll('tr');
            for (let [i, tr] of tableRows.entries()) {
              tr.innerHTML = dictOfColumnIndexAndTableRow[columnData[i]]
            }
            columnData.length = 0
          }
          returnSortedTable()
        });
      }
    }
  }
})

if(document.querySelector('.table-sticky'))
 app.tableSort()

util = {

	indexInParent: function(node) {
	    var children = node.parentNode.childNodes
        num = 0

		for (var i=0; i<children.length; i++) {
			if (children[i]==node) return num
			if (children[i].nodeType==1) num++
		}

		return -1
	},

	findParentBySelector: function(node, selector) {
		while (node && node.parentNode) {
			var list = node.parentNode.querySelectorAll(selector)

			if(Array.prototype.includes.call(list, node))
				return node

			node = node.parentNode
		}

		return node | ''
	}

}
