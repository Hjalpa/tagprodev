// ==UserScript==
// @name         True Leaderboards
// @namespace    https://gitlab.com/anom/tagpro-userscripts/
// @version      0.1
// @description  Leadersboards that suck less
// @author       anom
// @match        *://*.koalabeast.com/boards
// ==/UserScript==

(async function() {
    'use strict';

    if (window.location.pathname === '/boards') {
        document.querySelector('.leaderboard .row').style.display = 'none'

        const anom_util = {
            findParentBySelector: (node, selector) => {
                while (node && node.parentNode) {
                    let list = node.parentNode.querySelectorAll(selector)

                    if (Array.prototype.includes.call(list, node))
                        return node

                    node = node.parentNode
                }

                return node | ''
            },

            timeAgo: (timestampString) => {
                const timestamp = new Date(timestampString);
                const now = new Date();
                const seconds = Math.floor((now - timestamp) / 1000);

                if (seconds < 60) {
                    return seconds + 's ago';
                } else if (seconds < 3600) {
                    const minutes = Math.floor(seconds / 60);
                    return minutes + 'm ago';
                } else if (seconds < 86400) {
                    const hours = Math.floor(seconds / 3600);
                    return hours + 'h ago';
                } else if (seconds < 604800) {
                    const days = Math.floor(seconds / 86400);
                    return days + 'd ago';
                } else if (seconds < 2629746) {
                    const weeks = Math.floor(seconds / 604800);
                    return weeks + 'w ago';
                } else if (seconds < 31556952) {
                    const months = Math.floor(seconds / 2629746);
                    return months + 'mth ago';
                } else {
                    const years = Math.floor(seconds / 31556952);
                    return years + 'y ago';
                }
            },

            buildForm: (data) => {
                let resultString = ''
                data.forEach(item => {
                    const {
                        uuid,
                        winner
                    } = item
                    const linkClass = winner ? 'winner' : 'loser'
                    resultString += `<div class="result"><a class="${linkClass}" href="https://tagpro.koalabeast.com/game?replay=${uuid}"></a></div>`
                })
                return resultString
            },

            getValue: value => {
                // MM:SS
                if ((/^([0-9][0-9]):[0-5][0-9]$/).test(value)) {
                    // console.log('MM:SS', value)
                    let a = value.replace(':', '.')
                    return parseFloat(a)
                }
                // HH:MM:SS
                else if (value.match(/\d+:[0-5]\d/)) {
                    let a = value.split(':')
                    return (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2])
                }
                // %
                else if (value.match(/\d+:[0-5]\d/)) {
                    let a = value.split('%')
                    return a[0]
                } else if (value.match(/^(\d{1,2})\s(\w{3})\s(\d{4})$/)) {
                    const matchResult = value.match(/^(\d{1,2})\s(\w{3})\s(\d{4})$/)
                    const day = matchResult[1];
                    const month = matchResult[2];
                    const year = matchResult[3];
                    let dt = new Date(`${day}/${month}/${year}`)
                    return dt.getTime()
                } else if (value.match(/^(\d+)([smwh])\s+ago$/)) {
                    const regexResult = /^(\d+)([smwh])\s+ago$/.exec(value);

                    value = parseInt(regexResult[1], 10);
                    const unit = regexResult[2];

                    switch (unit) {
                        case 's':
                            return value;
                        case 'm':
                            return value * 60;
                        case 'h':
                            return value * 3600;
                        case 'w':
                            return value * 7 * 24 * 3600;
                        case 'y':
                            return value * 7 * 24 * 3600;
                        case 'y':
                            return value * 365 * 24 * 3600;
                        case 'mth':
                            return value * 30 * 24 * 3600;
                        default:
                            return NaN; // Invalid unit
                    }
                } else if (typeof value === 'string') {
                    return value
                } else {
                    return parseFloat(value)
                }
            },

            sortable: row => {
                let data = {
                    itmRef: row
                }
                row.querySelectorAll('[data-column]').forEach((elm) => {
                    let name = elm.dataset.column
                    if(name === 'form') {
                        let resultElements = elm.querySelectorAll('.result')
                        let score = 0;
                        resultElements.forEach(function (result, index) {
                            let winnerElement = result.querySelector('.winner')
                            let loserElement = result.querySelector('.loser')
                            if (winnerElement)
                                score += 1.001 * (index + 1)
                            else if (loserElement)
                                score -= 1.001 * (index + 1)
                        })
                        data[name] = anom_util.getValue(score.toString())
                    }
                    else
                        data[name] = anom_util.getValue(elm.innerText)
                })

                return data
            },

            highlight: table => {
                let data = {}
                table.querySelectorAll('tbody tr').forEach((row) => {
                    row.querySelectorAll('[data-column]:not([data-column=form],[data-column=rank],[data-column=name],[data-column=lastseen])').forEach((pv) => {
                        let value = anom_util.getValue(pv.innerText)
                        let label = pv.dataset.column

                        if(!Object.keys(data).includes(label)) {
                            data[label] = value
                            if(value > 0)
                                pv.classList.add('highlight')
                        }

                        else if(value >= data[label]) {

                            if(value > data[label])
                                table.querySelectorAll('[data-column="'+label+'"].highlight').forEach(e => e.classList.remove('highlight'))

                            if(value > 0)
                                pv.classList.add('highlight')

                            data[label] = value
                        }

                    })
                })
            },

        }

        // remember the active leaderboard tab
        document.querySelector('.leaderboard-menu').addEventListener('click', e => {
            let tab = anom_util.findParentBySelector(e.target, '[data-target]')
            if (tab)
                localStorage.setItem('leader-tab-active', tab.dataset.target)
        })
        let activeTab = localStorage.getItem('leader-tab-active')
        document.querySelector(`.leaderboard-menu [data-target="${activeTab}"`).click()

        // title rename
        document.querySelector('.leaderboard h1').innerText = 'True Leaderboards'
        document.title = 'Tagpro True Leaderboards'

        // grab the new data
        async function getData(activeTab) {
            let raw = await fetch('https://tagpro.dev/api/pub/leaderboard', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'cache-control': 'no-cache',
                }
            })
            return await raw.json()
        }

        let playerData = await getData()
        localStorage.setItem('leaderboard', JSON.stringify(playerData))

        console.log(playerData)

        // inject CSS
        const cssBlock = `
    table {
      .form {
        flex: 1;
        display: flex;
        justify-content: start;
        align-items: center;
        padding: 0.5rem;
      }

      .winner {
        --color: #97df44;
      }

      .loser {
        --color: #df4444;
      }

      .form a {
        background: var(--color);
        position: relative;
        text-decoration: none;
        display: block;
        width: 4px;
        height: 0.8rem;
        margin-right: 3px;
        border-radius: 2px;
      }
    }
      .table tbody tr:hover {background:#255636 !important}
      .table thead .active {background:color-mix(in srgb, #353535, #6bdf44)}
      .table thead th {cursor:pointer}

      [data-column="skill"] {
         --bg-td: #df4444;
      }
      [data-column="cd"] {
         --bg-td: #7c52cf;
      }
      [data-column="winpercent"] {
         --bg-td: #52b2cf;
      }
      [data-column="games"] {
         --bg-td: #8ccf52;
      }
      [data-column="w"] {
         --bg-td: #529fcf;
      }
      td.highlight {background:color-mix(in srgb, #353535, var(--bg-td, red))}
    `;
        const styleElement = document.createElement('style')
        styleElement.type = 'text/css'
        styleElement.appendChild(document.createTextNode(cssBlock))
        document.head.appendChild(styleElement)

        // function to make table
        function makeTable(playerData, tab) {
            let contain = document.querySelector(`#board-${tab}`)
            contain.innerHTML = '<div class="col-sm-12 col-sm-pull-0"><table class="table table-stripped"></table></div>'
            let table = contain.querySelector('table')
            table.insertAdjacentHTML('afterbegin', `
        <thead>
            <tr>
                <th class="text-right active" data-column="rank" data-sortby="asc">Rank</th>
                <th class="text-left" data-column="name" data-sortby="asc">Name</th>
                <th class="text-center" data-column="skill" data-sortby="desc">Skill</th>
                <th class="text-center" data-column="games" data-sortby="desc">G</th>
                <th class="text-center" data-column="w" data-sortby="desc">W</th>
                <th class="text-center" data-column="l" data-sortby="desc">L</th>
                <th class="text-center" data-column="winpercent" data-sortby="desc">Win%</th>
                <th class="text-center" data-column="cf" data-sortby="desc">CF</th>
                <th class="text-center" data-column="ca" data-sortby="desc">CA</th>
                <th class="text-center" data-column="cd" data-sortby="desc">CD</th>
                <th class="text-right" data-column="lastseen" data-sortby="desc">Last Seen</th>
                <th class="text-left" data-column="form" data-sortby="desc">Form</th>
            </tr>
        </thead>
        <tbody></tbody>
    `)

            for (let player of playerData) {
                let flair = player.flair != null ? `<span class="flair ${player.flair.className}" style="background-position: calc(-16px * ${player.flair.x}) calc(-16px * ${player.flair.y});"></span>` : ''
                table.querySelector('tbody').insertAdjacentHTML('beforeend', `
            <tr>
                <td class="text-right" data-column="rank">${player.rank}</td>
                <td class="text-left" data-column="name"><a href="/profile/${player.profile}">${flair}${player.name}</a></td>
                <td class="text-center" data-column="skill">${player.openskill}</td>
                <td class="text-center" data-column="games">${player.games}</td>
                <td class="text-center" data-column="w">${player.wins}</td>
                <td class="text-center" data-column="l">${player.losses}</td>
                <td class="text-center" data-column="winpercent">${player.winrate}</td>
                <td class="text-center" data-column="cf">${player.cf}</td>
                <td class="text-center" data-column="ca">${player.ca}</td>
                <td class="text-center" data-column="cd">${player.cd}</td>
                <td class="text-right" data-column="lastseen">${anom_util.timeAgo(player.lastseen)}</td>
                <td class="text-right form" data-column="form">${anom_util.buildForm(player.form)}</td>
            </tr>
        `)
            }

            anom_util.highlight(contain)

            let items = [...contain.querySelectorAll('tbody tr')].map(item => anom_util.sortable(item));

            contain.querySelector('thead').addEventListener('click', (e) => {
                const col = anom_util.findParentBySelector(e.target, 'thead [data-column]');

                if (col) {
                    const isAlreadyActive = col.classList.contains('active');

                    // Remove active class from all th elements
                    if (col.innerText != document.querySelector(`#board-${tab}`).querySelector('thead .active').innerText)
                        document.querySelector(`#board-${tab}`).querySelectorAll('thead th').forEach(th => th.classList.remove('active'));

                    // Toggle the sort order if clicking on the active column, otherwise set it to 'asc'
                    col.dataset.sortby = isAlreadyActive ? (col.dataset.sortby === 'asc' ? 'desc' : 'asc') : 'asc';

                    if (!isAlreadyActive)
                        col.classList.add('active')

                    const column = col.dataset.column
                    const sortOrder = col.dataset.sortby === 'desc' ? -1 : 1

                    items.sort((a, b) => sortOrder * (
                        col.dataset.column === "name" ?
                        a[column].localeCompare(b[column]) :
                        a[column] - b[column]
                    ));


                    contain.querySelector('tbody').innerHTML = ''
                    items.forEach(el => contain.querySelector('tbody').appendChild(el.itmRef))
                }
            })
        }

        for (const tab of ['Day', 'Week', 'Month'])
            makeTable(playerData[tab.toLowerCase()], tab)

        // ugh. dis
        makeTable(playerData.all, 'Rolling')
        let allTab = document.querySelector('[data-target="#board-Rolling"]')
        allTab.innerText = 'All-Time'
        allTab.parentNode.prepend(allTab)

        document.querySelector('.leaderboard .row').style.display = 'block'
    }

})();
