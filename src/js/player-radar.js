app.radar = (async() => {
	var width = 360,
		height = 300,
		barHeight = height / 2 - 40;

	var color = d3.scale.ordinal()
		.range(["#9eb36f", "#cadd9e", "#f2efbe", "#e3bf6b", "#c87572"]);

	var tickValues = [4,8,12,16,20];

	var svg = d3.select('.radar').append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
			.attr("transform", "translate(" + width/2 + "," + height/2 + ")");

	var data = {
		"data": [
			{
				"skill": "Prevent",
				"count": (radar.prevent > 20) ? 20 : radar.prevent
			},
			{
				"skill": "Returns",
				"count": (radar.return > 20) ? 20 : radar.return
			},
			{
				"skill": "Tags",
				"count": radar.tag
			},
			{
				"skill": "Hold",
				"count": radar.hold
			},
			{
				"skill": "Caps",
				"count": radar.cap
			},
			{
				"skill": "Grabs",
				"count": radar.grab
			},
			{
				"skill": "MMR",
				"count": (radar.rank < 0 ? 0 : (radar.rank > 20 ? 20 : radar.rank))
			},
			{
				"skill": "Pups",
				"count": radar.pup
			},
		]
	}

	// var data2 = {
	// 	"data2": [
	// 		{
	// 			"skill": "Prevent",
	// 			"count": (radar2.prevent > 20) ? 20 : radar2.prevent
	// 		},
	// 		{
	// 			"skill": "Returns",
	// 			"count": (radar2.return > 20) ? 20 : radar2.return
	// 		},
	// 		{
	// 			"skill": "Tags",
	// 			"count": radar2.tag
	// 		},
	// 		{
	// 			"skill": "Hold",
	// 			"count": radar2.hold
	// 		},
	// 		{
	// 			"skill": "Caps",
	// 			"count": radar2.cap
	// 		},
	// 		{
	// 			"skill": "Grabs",
	// 			"count": radar2.grab
	// 		},
	// 		{
	// 			"skill": "MMR",
	// 			"count": (radar2.rank < 0 ? 0 : (radar2.rank > 20 ? 20 : radar2.rank))
	// 		},
	// 		{
	// 			"skill": "Pups",
	// 			"count": radar2.pup
	// 		},
	// 	]
	// }

	// var data3 = {
	// 	"data3": [
	// 		{
	// 			"skill": "Prevent",
	// 			"count": (radar3.prevent > 20) ? 20 : radar3.prevent
	// 		},
	// 		{
	// 			"skill": "Returns",
	// 			"count": (radar3.return > 20) ? 20 : radar3.return
	// 		},
	// 		{
	// 			"skill": "Tags",
	// 			"count": radar3.tag
	// 		},
	// 		{
	// 			"skill": "Hold",
	// 			"count": radar3.hold
	// 		},
	// 		{
	// 			"skill": "Caps",
	// 			"count": radar3.cap
	// 		},
	// 		{
	// 			"skill": "Grabs",
	// 			"count": radar3.grab
	// 		},
	// 		{
	// 			"skill": "MMR",
	// 			"count": (radar3.rank < 0 ? 0 : (radar3.rank > 20 ? 20 : radar3.rank))
	// 		},
	// 		{
	// 			"skill": "Pups",
	// 			"count": radar3.pup
	// 		},
	// 	]
	// }

	var numBars = data.data.length;

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

	// layer = svg.selectAll(".season2")
	// 	.data([data2]).enter()
	// 	.append("path")
	// 	.attr("class", "season2")
	// 	.attr("d", function(d) { return area(d.data2); })
	// 	.attr("fill", "none")
	// 	.attr("stroke-width", "2px");

	// layer = svg.selectAll(".season3")
	// 	.data([data3]).enter()
	// 	.append("path")
	// 	.attr("class", "season3")
	// 	.attr("d", function(d) { return area(d.data3); })
	// 	.attr("fill", "none")
	// 	.attr("stroke-width", "2px");

})

if(document.querySelector('.radar'))
	app.radar()
