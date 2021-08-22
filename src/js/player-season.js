app.playerSeasons = (async() => {
	for(let s in seasons)
		makeRadar(seasons[s])
})

if(document.querySelector('.season .radar'))
	app.playerSeasons()

function makeRadar(raw) {

	let width = 360
	let height = 300
	let barHeight = height / 2 - 40

	let color = d3.scale.ordinal()
		.range(["#9eb36f", "#cadd9e", "#f2efbe", "#e3bf6b", "#c87572"])

	let tickValues = [4,8,12,16,20]

	let svg = d3.select(`.season[data-seasonid='`+raw.seasonid+`'] .radar`).append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
			.attr("transform", "translate(" + width/2 + "," + height/2 + ")")

	let data = {
		"data": [
			{
				"skill": "Prevent",
				"count": (raw.radar.prevent > 20) ? 20 : raw.radar.prevent
			},
			{
				"skill": "Returns",
				"count": (raw.radar.return > 20) ? 20 : raw.radar.return
			},
			{
				"skill": "Tags",
				"count": (raw.radar.tag > 20) ? 20 : raw.radar.tag
			},
			{
				"skill": "Hold",
				"count": raw.radar.hold
			},
			{
				"skill": "Caps",
				"count": raw.radar.cap
			},
			{
				"skill": "Grabs",
				"count": (raw.radar.grab < 0 ? 0 : (raw.radar.grab > 20 ? 20 : raw.radar.grab))
			},
			{
				"skill": "MMR",
				"count": (raw.radar.rank < 0 ? 0 : (raw.radar.rank > 20 ? 20 : raw.radar.rank))
			},
			{
				"skill": "Pups",
				"count": (raw.radar.pup < 0 ? 0 : (raw.radar.pup > 20 ? 20 : raw.radar.pup))
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
		.attr("y", function(d, i) { return (d.skill == 'Prevent') ? -118 :  -(barHeight + 15) * Math.cos((i * 2 * Math.PI / numBars)); })
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

	layer = svg.selectAll(".season1")
		.data([data]).enter()
		.append("path")
		.attr("class", "season1")
		.attr("d", function(d) { return area(d.data); })
		.attr("fill", "none")
		.attr("stroke-width", "2px");

}
