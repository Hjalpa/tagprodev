app.playerDaily = (() => {

	highlight()

	async function highlight() {

		// each month
		document.querySelectorAll('.summary tbody tr').forEach((row) => {

			// each stat
			row.querySelectorAll('td').forEach((pv) => {

				let i = indexInParent(pv)
				let row_i = indexInParent(pv.parentNode)
				let value = getValue(pv.innerText)

				if(i === 0 || i === 1 || i === 2) return

				if(pv.parentNode.nextElementSibling) {
					let next_tr = pv.parentNode.nextElementSibling
					let next_td = next_tr.querySelector('td:nth-of-type('+(i+1)+')')
					let next_value = getValue(next_td.innerText)

					// console.log(value, next_value)

					if(i === 4 || i === 6)  {
						if(value > next_value)
							pv.classList.add('highlight-bad')
						else if(value < next_value)
							pv.classList.add('highlight-good')
					} else {
						if(value > next_value)
							pv.classList.add('highlight-good')
						else if(value < next_value)
							pv.classList.add('highlight-bad')
					}
				}

			})

		})

		function getValue(value) {

			// MM:SS
			if((/^([0-9][0-9]):[0-5][0-9]$/).test(value)){
				// console.log('MM:SS', value)
				let a = value.replace(':', '.')
				return parseFloat(a)
			}

			// HH:MM:SS
			else if (value.match(/\d+:[0-5]\d/)) {
				let a = value.split(':')
				return (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2])
			}

			else
				return parseFloat(value)

		}

	}

	function indexInParent(node) {
	    var children = node.parentNode.childNodes
        num = 0

		for (var i=0; i<children.length; i++) {
			if (children[i]==node) return num
			if (children[i].nodeType==1) num++
		}

		return -1
	}

})

if(document.querySelector('section.summary'))
	app.playerDaily()
