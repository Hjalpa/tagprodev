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
