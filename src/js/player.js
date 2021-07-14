app.radar = (async() => {
	var width = 960,
		height = 500,
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
				"skill": "Returns",
				"count": document.querySelector('.radar .return').innerText
			},
			{
				"skill": "Hold",
				"count": 10
			},
			{
				"skill": "Game Quality",
				"count": document.querySelector('.radar .elo').innerText.substring(0,2)
			},
			{
				"skill": "Grabs",
				"count": 11
			},
			{
				"skill": "Pups",
				"count": 15
			},
			{
				"skill": "Prevent",
				"count": 14
			}
		]
	}

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
		.style("stroke", function(d,i) { return (i === 0) ? "black" : "#5e5e5e"; })
		.style("stroke-width", function(d,i) { return (i === 0) ? "1px" : ".5px"; });

	var lines = svg.selectAll("line")
		.data(data.data)
		.enter().append("g")
		.attr("class","lines");

	lines.append("line")
		.attr("y2", - barHeight )
		.style("stroke", "#5e5e5e")
		.style("stroke-width",".5px")
		.attr("transform", function(d, i) { return "rotate(" + (i * 360 / numBars) + ")"; });

	lines.append("text")
		.attr("class", "names")
		.attr("x", function(d, i) { return (barHeight + 15) * Math.sin((i * 2 * Math.PI / numBars)); })
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
		.style("font-weight","bold")
		.text(function(d) { return d.skill; });

	layer = svg.selectAll(".layer")
		.data([data]).enter()
		.append("path")
		.attr("class", "layer")
		.attr("d", function(d) { return area(d.data); })
		.attr("fill", "none")
		.attr("stroke", "black")
		.attr("stroke-width", "2px");

})

app.chartMonth = (async() => {

		(function linearGraph() {

			let wondata = monthwonlost.map(function(e) {
				return parseFloat(e.won)
			})
			let lostdata = monthwonlost.map(function(e) {
				return parseFloat(e.lost)
			})
			let categories = monthwonlost.map(function(e) {
				return e.monthyear
			})

			let width = document.querySelector('.monthwrap').clientWidth - 110
			let height = 500
			let colors = ['#ff5454', '#a9d645']
			return chart(lostdata,wondata,width,height,categories,colors)
		})();

		function chart(lostdata,wondata,width,height,categories,colors) {
			var grid = d3.range(11).map(function(i) {
				// return {'x1':0,'y1':0,'x2':0,'y2':height};
				return {'x1':0,'y1':0,'x2':0,'y2': categories.length * 45};
			});

			var xscale = d3.scale.linear()
				.domain([0, 100])
				.range([0, width]);

			var yscale = d3.scale.linear()
				.domain([0, 11])
				// .domain([0, categories.length])
				.range([0, height]);

			var colorScale = d3.scale.quantize()
				.domain([0, categories.length])
				.range(colors);

			var canvas = d3.select('.monthwrap')
				.append('svg')
				.attr({'width':width + 160, 'height': height + 80});

			var grids = canvas.append('g')
				.attr('id','grid_chartMonth')
				.attr('transform','translate(80,80)')
				.selectAll('line')
				.data(grid)
				.enter()
				.append('line')
				.attr({
					'x1':function(d, i){ return xscale(i*10); },
					'y1':function(d){ return d.y1; },
					'x2':function(d, i){ return xscale(i*10); },
					'y2':function(d){ return d.y2; },
				})
				.style({'stroke':'#dadada','stroke-width':'1px'});

			var	xAxis = d3.svg.axis();
			xAxis
				.orient('bottom')
				.scale(xscale)
				.tickFormat(function(d,i){ return d +"%"; })
				.tickValues([0,10,20,30,40,50,60,70,80,90,100]);

			var	yAxis = d3.svg.axis();
			yAxis
				.orient('left')
				.scale(yscale)
				.tickSize(0)
				.tickFormat(function(d,i){ return categories[i]; })
				.tickValues(d3.range(12));

			var y_xis = canvas.append('g')
				.attr("transform", "translate(70, 105)")
				.attr('id','yaxis_chartMonth')
				.call(yAxis);

			var x_xis = canvas.append('g')
				.attr("transform", "translate(80, 55)")
				.attr('id','xaxis_chartMonth')
				.call(xAxis);

			var wonchart = canvas.append('g')
				.attr("transform", "translate(80, 90)")
				.attr('id','wonbars')
				.selectAll('rect')
				.data(wondata)
				.enter()
				.append('rect')
				.attr('height',function(d){ return 30; })
				.attr({'x':function(d){ return 0; },
				'y':function(d, i){ return yscale(i); } })
				.style('fill',function(d,i){ return colors[1]; })
				.attr('width',function(d){ return 0; });

			var wonpercent = canvas.append('g')
				.attr("transform", "translate(80, 90)")
				.attr('id','wonperc')
				.selectAll('text')
				.data(wondata)
				.enter()
				.append('text')
				// .text(function(d) { return d.toFixed(2) + "%"; })
				.text(function(d){return (d > 16) ? d.toFixed(2)+"%" : ''})
				.attr('x',function(d,i) { return xscale(d) - 55; })
				.attr('y',function(d,i) { return yscale(i) + 20; });

			var losschart = canvas.append('g')
				.attr("transform", "translate(80,90)")
				.attr('id','lossbars')
				.selectAll('rect')
				.data(lostdata)
				.enter()
				.append('rect')
				.attr("height", function(d) {return 30; })
				.attr({
					'x':function(d) { return width - xscale(d); },
					'y':function(d, i) { return yscale(i); }
				})
				.style('fill',function(d,i) { return colors[0]; })
				.attr('width',function(d) { return 0; });


			var losspercent = canvas.append('g')
				.attr("transform", "translate(80, 90)")
				.attr('id','lossperc')
				.selectAll('text')
				.data(lostdata)
				.enter()
				.append('text')
				.text(function(d){return (d > 16) ? d.toFixed(2)+"%" : ''})
				.attr('x',function(d,i) { return width - xscale(d) + 10; })
				.attr('y',function(d,i) { return yscale(i) + 20; })
				.attr('fill', '#fff');

			var bars = canvas.append('g')
				.attr('transform','translate(10,10)')
				.selectAll('rect')
				.data(['Win','Loss'])
				.enter()
				.append('rect')
				.attr({'width':50,'height':15,'x':function(d,i) { return i * 60; },'y':0})
				.style('fill',function(d,i) { return colors[colors.length - 1 - i]; });

			var barstext = canvas.append('g')
				.attr('transform','translate(20,10)')
				.selectAll('text')
				.data(['Win','Loss'])
				.enter()
				.append('text')
				.text(function(d){ return d; })
				.attr({'x':function(d,i) { return i*60; },'y':32});

			d3.select(".monthwrap svg").selectAll("#wonbars rect")
				.data(wondata)
				.attr("width", function(d) {return xscale(d); });

			d3.select(".monthwrap svg").selectAll("#lossbars rect")
				.data(lostdata)
				.attr("width", function(d) {return xscale(d); });

		}
})

app.chartDay = (async() => {

		(function linearGraph() {

			let wondata = daywonlost.map(function(e) {
				return parseFloat(e.won)
			})
			let lostdata = daywonlost.map(function(e) {
				return parseFloat(e.lost)
			})
			let categories = daywonlost.map(function(e) {
				return e.day
			})

			let width = document.querySelector('.monthwrap').clientWidth - 110
			let height = 500
			let colors = ['#ff5454', '#a9d645']
			return chart(lostdata,wondata,width,height,categories,colors)
		})();

		function chart(lostdata,wondata,width,height,categories,colors) {
			var grid = d3.range(11).map(function(i) {
				return {'x1':0,'y1':0,'x2':0,'y2': categories.length * 44};
			});

			var xscale = d3.scale.linear()
				.domain([0, 100])
				.range([0, width]);

			var yscale = d3.scale.linear()
				.domain([0, 11])
				// .domain([0, categories.length])
				.range([0, height]);

			var colorScale = d3.scale.quantize()
				.domain([0, categories.length])
				.range(colors);

			var canvas = d3.select('.daywrap')
				.append('svg')
				.attr({'width':width + 160, 'height': 440});

			var grids = canvas.append('g')
				.attr('id','grid_chartHour')
				.attr('transform','translate(80,80)')
				.selectAll('line')
				.data(grid)
				.enter()
				.append('line')
				.attr({
					'x1':function(d, i){ return xscale(i*10); },
					'y1':function(d){ return d.y1; },
					'x2':function(d, i){ return xscale(i*10); },
					'y2':function(d){ return d.y2; },
				})
				.style({'stroke':'#dadada','stroke-width':'1px'});

			var	xAxis = d3.svg.axis();
			xAxis
				.orient('bottom')
				.scale(xscale)
				.tickFormat(function(d,i){ return d +"%"; })
				.tickValues([0,10,20,30,40,50,60,70,80,90,100]);

			var	yAxis = d3.svg.axis();
			yAxis
				.orient('left')
				.scale(yscale)
				.tickSize(0)
				.tickFormat(function(d,i){ return categories[i]; })
				.tickValues(d3.range(12));

			var y_xis = canvas.append('g')
				.attr("transform", "translate(70, 105)")
				.attr('id','yaxis_chartHour')
				.call(yAxis);

			var x_xis = canvas.append('g')
				.attr("transform", "translate(80, 55)")
				.attr('id','xaxis_chartHour')
				.call(xAxis);

			var wonchart = canvas.append('g')
				.attr("transform", "translate(80, 90)")
				.attr('id','wonbars')
				.selectAll('rect')
				.data(wondata)
				.enter()
				.append('rect')
				.attr('height',function(d){ return 30; })
				.attr({'x':function(d){ return 0; },
				'y':function(d, i){ return yscale(i); } })
				.style('fill',function(d,i){ return colors[1]; })
				.attr('width',function(d){ return 0; });

			var wonpercent = canvas.append('g')
				.attr("transform", "translate(80, 90)")
				.attr('id','wonperc')
				.selectAll('text')
				.data(wondata)
				.enter()
				.append('text')
				// .text(function(d) { return d.toFixed(2) + "%"; })
				.text(function(d){return (d > 16) ? d.toFixed(2)+"%" : ''})
				.attr('x',function(d,i) { return xscale(d) - 55; })
				.attr('y',function(d,i) { return yscale(i) + 20; });

			var losschart = canvas.append('g')
				.attr("transform", "translate(80,90)")
				.attr('id','lossbars')
				.selectAll('rect')
				.data(lostdata)
				.enter()
				.append('rect')
				.attr("height", function(d) {return 30; })
				.attr({
					'x':function(d) { return width - xscale(d); },
					'y':function(d, i) { return yscale(i); }
				})
				.style('fill',function(d,i) { return colors[0]; })
				.attr('width',function(d) { return 0; });


			var losspercent = canvas.append('g')
				.attr("transform", "translate(80, 90)")
				.attr('id','lossperc')
				.selectAll('text')
				.data(lostdata)
				.enter()
				.append('text')
				.text(function(d){return (d > 16) ? d.toFixed(2)+"%" : ''})
				.attr('x',function(d,i) { return width - xscale(d) + 10; })
				.attr('y',function(d,i) { return yscale(i) + 20; })
				.attr('fill', '#fff');

			var bars = canvas.append('g')
				.attr('transform','translate(10,10)')
				.selectAll('rect')
				.data(['Win','Loss'])
				.enter()
				.append('rect')
				.attr({'width':50,'height':15,'x':function(d,i) { return i * 60; },'y':0})
				.style('fill',function(d,i) { return colors[colors.length - 1 - i]; });

			var barstext = canvas.append('g')
				.attr('transform','translate(20,10)')
				.selectAll('text')
				.data(['Win','Loss'])
				.enter()
				.append('text')
				.text(function(d){ return d; })
				.attr({'x':function(d,i) { return i*60; },'y':32});

			d3.select(".daywrap svg").selectAll("#wonbars rect")
				.data(wondata)
				.attr("width", function(d) {return xscale(d); });

			d3.select(".daywrap svg").selectAll("#lossbars rect")
				.data(lostdata)
				.attr("width", function(d) {return xscale(d); });

		}
})

app.chartHour = (async() => {

		(function linearGraph() {

			let wondata = hourwonlost.map(function(e) {
				return parseFloat(e.won)
			})
			let lostdata = hourwonlost.map(function(e) {
				return parseFloat(e.lost)
			})
			let categories = hourwonlost.map(function(e) {
				return e.hour
			})

			let width = document.querySelector('.monthwrap').clientWidth - 110
			let height = 500
			let colors = ['#ff5454', '#a9d645']
			return chart(lostdata,wondata,width,height,categories,colors)
		})();

		function chart(lostdata,wondata,width,height,categories,colors) {
			var grid = d3.range(11).map(function(i) {
				return {'x1':0,'y1':0,'x2':0,'y2': categories.length * 44};
			});

			var xscale = d3.scale.linear()
				.domain([0, 100])
				.range([0, width]);

			var yscale = d3.scale.linear()
				.domain([0, 11])
				// .domain([0, categories.length])
				.range([0, height]);

			var colorScale = d3.scale.quantize()
				.domain([0, categories.length])
				.range(colors);

			var canvas = d3.select('.hourwrap')
				.append('svg')
				.attr({'width':width + 160, 'height': height + 80});

			var grids = canvas.append('g')
				.attr('id','grid_chartHour')
				.attr('transform','translate(80,80)')
				.selectAll('line')
				.data(grid)
				.enter()
				.append('line')
				.attr({
					'x1':function(d, i){ return xscale(i*10); },
					'y1':function(d){ return d.y1; },
					'x2':function(d, i){ return xscale(i*10); },
					'y2':function(d){ return d.y2; },
				})
				.style({'stroke':'#dadada','stroke-width':'1px'});

			var	xAxis = d3.svg.axis();
			xAxis
				.orient('bottom')
				.scale(xscale)
				.tickFormat(function(d,i){ return d +"%"; })
				.tickValues([0,10,20,30,40,50,60,70,80,90,100]);

			var	yAxis = d3.svg.axis();
			yAxis
				.orient('left')
				.scale(yscale)
				.tickSize(0)
				.tickFormat(function(d,i){ return categories[i]; })
				.tickValues(d3.range(12));

			var y_xis = canvas.append('g')
				.attr("transform", "translate(70, 105)")
				.attr('id','yaxis_chartHour')
				.call(yAxis);

			var x_xis = canvas.append('g')
				.attr("transform", "translate(80, 55)")
				.attr('id','xaxis_chartHour')
				.call(xAxis);

			var wonchart = canvas.append('g')
				.attr("transform", "translate(80, 90)")
				.attr('id','wonbars')
				.selectAll('rect')
				.data(wondata)
				.enter()
				.append('rect')
				.attr('height',function(d){ return 30; })
				.attr({'x':function(d){ return 0; },
				'y':function(d, i){ return yscale(i); } })
				.style('fill',function(d,i){ return colors[1]; })
				.attr('width',function(d){ return 0; });

			var wonpercent = canvas.append('g')
				.attr("transform", "translate(80, 90)")
				.attr('id','wonperc')
				.selectAll('text')
				.data(wondata)
				.enter()
				.append('text')
				// .text(function(d) { return d.toFixed(2) + "%"; })
				.text(function(d){return (d > 16) ? d.toFixed(2)+"%" : ''})
				.attr('x',function(d,i) { return xscale(d) - 55; })
				.attr('y',function(d,i) { return yscale(i) + 20; });

			var losschart = canvas.append('g')
				.attr("transform", "translate(80,90)")
				.attr('id','lossbars')
				.selectAll('rect')
				.data(lostdata)
				.enter()
				.append('rect')
				.attr("height", function(d) {return 30; })
				.attr({
					'x':function(d) { return width - xscale(d); },
					'y':function(d, i) { return yscale(i); }
				})
				.style('fill',function(d,i) { return colors[0]; })
				.attr('width',function(d) { return 0; });


			var losspercent = canvas.append('g')
				.attr("transform", "translate(80, 90)")
				.attr('id','lossperc')
				.selectAll('text')
				.data(lostdata)
				.enter()
				.append('text')
				.text(function(d){return (d > 16) ? d.toFixed(2)+"%" : ''})
				.attr('x',function(d,i) { return width - xscale(d) + 10; })
				.attr('y',function(d,i) { return yscale(i) + 20; })
				.attr('fill', '#fff');

			var bars = canvas.append('g')
				.attr('transform','translate(10,10)')
				.selectAll('rect')
				.data(['Win','Loss'])
				.enter()
				.append('rect')
				.attr({'width':50,'height':15,'x':function(d,i) { return i * 60; },'y':0})
				.style('fill',function(d,i) { return colors[colors.length - 1 - i]; });

			var barstext = canvas.append('g')
				.attr('transform','translate(20,10)')
				.selectAll('text')
				.data(['Win','Loss'])
				.enter()
				.append('text')
				.text(function(d){ return d; })
				.attr({'x':function(d,i) { return i*60; },'y':32});

			d3.select(".hourwrap svg").selectAll("#wonbars rect")
				.data(wondata)
				.attr("width", function(d) {return xscale(d); });

			d3.select(".hourwrap svg").selectAll("#lossbars rect")
				.data(lostdata)
				.attr("width", function(d) {return xscale(d); });

		}
})

if(document.querySelector('.monthwrap')) {
	app.chartMonth()
	app.chartDay()
	app.chartHour()
	// app.radar()
}
