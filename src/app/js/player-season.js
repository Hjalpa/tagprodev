app.playerSeasons = {
	init: e => {
		if(document.querySelector('.playerseasons')) {
			for(let s in seasons)
				app.playerSeasons.makeRadar(seasons[s])

			let pos = document.querySelectorAll('.playerseasons .pos')
			for (const stat of pos) {
				let item = parseFloat(stat.innerText)

				if(item >= 16)
					stat.classList.add('high')
				else if(item >= 11)
					stat.classList.add('avg')
			}
		}
	},

	makeRadar: raw => {

		let width = 300
		let height = 240
		let barHeight = height / 2 - 40

		let color = d3.scale.ordinal()
			.range(["#004aff", "#326dff", "#6f99ff", "#a2bdff", "#eef3ff"])

		let tickValues = [4,8,12,16,20]

		let svg = d3.select(`.season[data-seasonid='`+raw.seasonid+`'] .radar`).append("svg")
			.attr("width", width)
			.attr("height", height)
			.append("g")
				.attr("transform", "translate(" + width/2 + "," + height/2 + ")")

		let data = {
			"data": [
				{
					"skill": "MVB",
					"count": (raw.radar.mvb < 0 ? 0 : (raw.radar.mvb > 20 ? 20 : raw.radar.mvb))
				},
				{
					"skill": "Caps",
					"count": (raw.radar.cap > 20) ? 20 : raw.radar.cap
				},
				{
					"skill": "Hold",
					"count": (raw.radar.hold > 20) ? 20 : raw.radar.hold
				},
				{
					"skill": raw.gamemode === 'ctf' ? 'Tags' : 'Grabs',
					"count": raw.gamemode === 'ctf' ? raw.radar.tag : raw.radar.grab,
				},
				{
					"skill": "Pups",
					"count": (raw.radar.pup < 0 ? 0 : (raw.radar.pup > 20 ? 20 : raw.radar.pup))
				},
				{
					"skill": raw.gamemode === 'ctf' ? 'Returns' : 'Takeovers',
					"count": raw.gamemode === 'ctf' ? raw.radar.return : raw.radar.takeover,
				},
				{
					"skill": "Prevent",
					"count": (raw.radar.prevent > 20) ? 20 : raw.radar.prevent
				},
				{
					"skill": "Assists",
					"count": (raw.radar.assist < 0 ? 0 : (raw.radar.assist > 20 ? 20 : raw.radar.assist))
				},
			]
		}

		let dataavg = {
			"data": [
				{
					"skill": "MVB",
					"count": (raw.radaravg.mvb < 0 ? 0 : (raw.radaravg.mvb > 20 ? 20 : raw.radaravg.mvb))
				},
				{
					"skill": "Caps",
					"count": (raw.radaravg.cap > 20) ? 20 : raw.radaravg.cap
				},
				{
					"skill": "Hold",
					"count": (raw.radaravg.hold > 20) ? 20 : raw.radaravg.hold
				},
				{
					"skill": raw.gamemode === 'ctf' ? 'Tags' : 'Grabs',
					"count": raw.gamemode === 'ctf' ? raw.radaravg.tag: raw.radaravg.grab,
				},
				{
					"skill": "Pups",
					"count": (raw.radaravg.pup < 0 ? 0 : (raw.radaravg.pup > 20 ? 20 : raw.radaravg.pup))
				},
				{
					"skill": raw.gamemode === 'ctf' ? 'Returns' : 'Takeovers',
					"count": raw.gamemode === 'ctf' ? raw.radaravg.return : raw.radaravg.takeover,
				},
				{
					"skill": "Prevent",
					"count": (raw.radaravg.prevent > 20) ? 20 : raw.radaravg.prevent
				},
				{
					"skill": "Assists",
					"count": (raw.radaravg.assist < 0 ? 0 : (raw.radaravg.assist > 20 ? 20 : raw.radaravg.assist))
				},
			]
		}


		let numBars = data.data.length

		var radius = d3.scale.linear()
			.domain([0,20])
			.range([0, barHeight]);

		var line = d3.svg.line.radial()
			.interpolate("linear-closed")
			.radius(function(d) { return radius(d.count); })
			.angle(function(d,i) { return (i * 2 * Math.PI / numBars); });

		var area = d3.svg.area.radial()
			.interpolate(line.interpolate())
			.innerRadius(radius(0))
			.outerRadius(line.radius())
			.angle(line.angle());

		tickValues.sort(function(a,b) { return b - a; });

		var tickPath = svg.selectAll(".tickPath")
			.data(tickValues).enter()
			.append("path")
			.attr("class", "tickPath")
			.attr("d", function(d) {
				var tickArray = [];
				for (i=0;i<numBars;i++) tickArray.push({count : d});
				return area(tickArray);
			})
			.style("fill", function(d) { return color(d); })

		var lines = svg.selectAll("line")
			.data(data.data)
			.enter().append("g")
			.attr("class","lines");

		lines.append("line")
			.attr("y2", - barHeight )
			.style("stroke", "#00000029")
			.style("stroke-width",".5px")
			.attr("transform", function(d, i) { return "rotate(" + (i * 360 / numBars) + ")"; });

		lines.append("text")
			.attr("class", "names")
			.attr("x", function(d, i) { return (barHeight + 10) * Math.sin((i * 2 * Math.PI / numBars)); })
			.attr("y", function(d, i) { return -(barHeight + 15) * Math.cos((i * 2 * Math.PI / numBars)); })
			.attr("text-anchor", function(d,i) {
			if (i===0 || i===numBars/2) {
				return "middle";
			}else if (i <= numBars/2) {
				return "begin";
			}else {
				return "end";
			}
			})
			.text(function(d) { return d.skill; });


		layer = svg.selectAll(".real")
			.data([data]).enter()
			.append("path")
			.attr("class", "real")
			.attr("d", function(d) { return area(d.data); })
			.attr("fill", "none")
			.attr("stroke-linecap", "round")
			.attr("stroke-width", "2px")


		layer = svg.selectAll(".avg")
			.data([dataavg]).enter()
			.append("path")
			.attr("class", "avg")
			.attr("d", function(d) { return area(d.data); })
			.attr("fill", "none")
			.attr("stroke-linecap", "round")
			.attr("stroke-width", "2px")

	}
}
