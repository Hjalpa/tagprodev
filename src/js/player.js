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

app.chartElo = (async() => {

		(function linearGraph() {

			let wondata = elowonlost.map(function(e) {
				return parseFloat(e.won)
			})
			let lostdata = elowonlost.map(function(e) {
				return parseFloat(e.lost)
			})
			let categories = elowonlost.map(function(e) {
				return e.eloband
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

			var canvas = d3.select('.elowrap')
				.append('svg')
				.attr({'width':width + 160, 'height': height + 80});

			var grids = canvas.append('g')
				.attr('id','grid_chartElo')
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
				.attr('id','yaxis_chartElo')
				.call(yAxis);

			var x_xis = canvas.append('g')
				.attr("transform", "translate(80, 55)")
				.attr('id','xaxis_chartElo')
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

			d3.select(".elowrap svg").selectAll("#wonbars rect")
				.data(wondata)
				.attr("width", function(d) {return xscale(d); });

			d3.select(".elowrap svg").selectAll("#lossbars rect")
				.data(lostdata)
				.attr("width", function(d) {return xscale(d); });

		}
})

if(document.querySelector('.monthwrap')) {
	app.chartMonth()
	app.chartDay()
	app.chartHour()
	app.chartElo()
}
