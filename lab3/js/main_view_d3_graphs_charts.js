class MainViewD3GraphsCharts {
	/**
	 * MainViewD3GraphsCharts constructor.
	 */
	constructor(mainModelCovidData) { 
		this.selectedDataLabel = "";
		this.mainModelCovidData = mainModelCovidData;
	}
	
	/**
	 * Display the world map with latest main Coronavirus updates.
	 *
	 * @param {String} mainContainer - main container name where SVG will be added or updated.
	 */
	createWorldMapGraph(mainContainer, isReportedCases, isTotal, isPopulationMarker) {
		let data = mainModelCovidData.getAllCountriesLatestCovidData();
		let dictionary = mainModelCovidData.getAllCovidData();
		let svg = d3.select(".worldMapGraphSVG");
		let width = 850,
			height = 600,
			margin = 0,
			xMax = width - (margin * 2),
			yMax = height - (margin * 2),
			selectedDataLabel = this.selectedDataLabel,
			colorScale, g;
		let projection = d3.geoMercator().center([15,55]).scale(120);
		let path = d3.geoPath().projection(projection);
		if (svg.empty()) {
			svg = d3.select(mainContainer)
					.append("svg")
					.attr("class","worldMapGraphSVG")
					.attr("width", width)
					.attr("height", height);		
			g = svg.append("g");
			let mapG = g.selectAll('.pathG')
							.data(topojson.feature(this.mainModelCovidData.worldTopologyData, this.mainModelCovidData.worldTopologyData.objects.countries).features)
							.enter()
							.append('g')
							.attr("class","pathG");
			mapG.append("path")
			   .on("mouseover", onMouseOver)
			   .on("mouseout", onMouseOut)
			   .on('click', function(mouseEvent, i) {
							if(dictionary[i.properties.name]) {
								updateGraphChartLocation(i.properties.name, 2);
							}
						})
			   .attr("d", path)
			   .attr("fill", "grey")
			   .attr("stroke", "black")
			   .attr("stroke-width", 0.5);
		}
		g = svg.select("g");
		colorScale = d3.scaleLinear().range(["blue", "red"])
		if (isReportedCases) {
			if (isTotal) {
				colorScale.domain([0, d3.max(data, function(d) { return d.total_cases; })]);
			}
			else {
				colorScale.domain([0, d3.max(data, function(d) { return d.total_cases_per_million; })]);
			}
		}
		else {
			if (isTotal) {
				colorScale.domain([0, d3.max(data, function(d) { return d.total_deaths; })]);
			}
			else {
				colorScale.domain([0, d3.max(data, function(d) { return d.total_deaths_per_million; })]);
			}
		}
		g.selectAll("path")
		   .attr("fill", function (d,i) {
							if(dictionary[d.properties.name]) {
								if (isReportedCases) {
									if (isTotal) {
										selectedDataLabel = "total_cases";
										return colorScale(dictionary[d.properties.name].latestRecord.total_cases);
									}
									else {
										selectedDataLabel = "total_cases_per_million";
										return colorScale(dictionary[d.properties.name].latestRecord.total_cases_per_million);
									}
								}
								else {
									if (isTotal) {
										selectedDataLabel = "total_deaths";
										return colorScale(dictionary[d.properties.name].latestRecord.total_deaths);
									}
									else {
										selectedDataLabel = "total_deaths_per_million";
										return colorScale(dictionary[d.properties.name].latestRecord.total_deaths_per_million);
									}
								}
							}
							return "grey"; }); 
		g.selectAll('.popMarker').remove();
		if(isPopulationMarker) {
			let popScale = d3.scaleLinear().range([1, 5])
								.domain([0, d3.max(data, function(d) { return d.population; })]);
			g.selectAll('.pathG')
				.append("circle")
				.attr("class", "popMarker")
				.attr('cx', function (d,i) { return path.centroid(d.geometry)[0]; })
				.attr('cy', function (d,i) { return path.centroid(d.geometry)[1]; })
				.attr('r', function (d,i) { 
								if(dictionary[d.properties.name]) {
									return popScale(dictionary[d.properties.name].latestRecord.population); 
								}
								return 0;
							})
				.attr('fill', 'yellow');
		}	
		// Path mouseover event handler function
		function onMouseOver(mouseEvent, i) {
			let xCurrent = Number(d3.select(this).attr('x'));
			let yCurrent = Number(d3.select(this).attr('y'));
			d3.select(this).style("cursor", "pointer"); 
			d3.select(this).style('opacity', 0.6); 
			d3.select(this).attr("stroke-width", 2);
			let currentPath = d3.select(this);
			g.append("text")
				.attr('class', 'val')
				.attr('x', path.centroid(i)[0])
				.attr('y', path.centroid(i)[1])
				.attr("font-size", "20px")
				.attr("font-weight", "bold")
				.attr("text-anchor", "middle")
				.attr("stroke", "black")
				.attr("fill", "yellow")
				.text(function () { 
							let addData = "";
							if(dictionary[i.properties.name]) {
								addData = dictionary[i.properties.name].latestRecord[selectedDataLabel];
								if (Number(addData) >= 1000 && Number(addData) < 1000000) {
									addData = (Number(addData)/1000).toFixed(2) + "K";
								}
								else if (Number(addData) >= 1000000) {
									addData = (Number(addData)/1000000).toFixed(2) + "M";
								}
							}
							return i.properties.name + " " + addData; 
					}); // Value of the text
		}
		// Path mouseout event handler function
		function onMouseOut(mouseEvent, i) {
			// Using i parameter as it holds the bounded data
			d3.select(this).style("cursor", "default");
			d3.select(this).style('opacity', 1); 
			d3.select(this).attr("stroke-width", 0.5);
			g.selectAll('.val').remove();
		}
	}
	
	/**
	 * Display the latest main Coronavirus updates based on the selected location.
	 *
	 * Generate main figures that represent the latest pandemic development updates in that location.
	 *
	 * @param {String} location - selected location to display the latest main Coronavirus updates.
	 * @param {String} mainContainer - main container name where SVG will be added or updated.
	 */
	createLocationMainUpdates(location, mainContainer, delay) {
		delay = delay ? delay : 0;
		let data = mainModelCovidData.getLatestLocationCovidData(location);
		let svg = d3.select(".locationMainUpdatesSVG");
		let width = 650,
			height = 250,
			margin = 55;
		if (svg.empty()) {
			svg = d3.select(mainContainer)
					.append("svg")
					.attr("class","locationMainUpdatesSVG")
					.attr("width", width)
					.attr("height", height);
			svg.append("text").attr("class","graphTitle1")
				.attr("transform", "translate(" + width/2 + ",25)")
				.attr("text-anchor", "middle")
				.attr("font-size", "32px").attr("font-weight", "bold");
			let casesText = svg.append("text").attr("transform", "translate(" + width/2 + "," + (25 + margin) + ")").attr("text-anchor", "middle");
			casesText.append("tspan").attr("class","graphTitle2").style('fill', '#707070')
						.attr("font-size", "30px").attr("font-weight", "bold");
			casesText.append("tspan").attr("class","graphTitle3").style('fill', 'blue')
						.attr("font-size", "30px").attr("font-weight", "bold");
			svg.append("text").attr("class","graphTitle4")
				.attr("transform", "translate(" + width/2 + "," + (25 + (margin * 2)) + ")")
				.attr("text-anchor", "middle")
				.attr("font-size", "32px").attr("font-weight", "bold");
			let deathText = svg.append("text").attr("transform", "translate(" + width/2 + "," + (25 + (margin * 3)) + ")").attr("text-anchor", "middle");
			deathText.append("tspan").attr("class","graphTitle5").style('fill', '#707070')
						.attr("font-size", "30px").attr("font-weight", "bold");
			deathText.append("tspan").attr("class","graphTitle6").style('fill', 'red')
						.attr("font-size", "30px").attr("font-weight", "bold");
			svg.append("text").attr("class","graphTitle7")
				.attr("transform", "translate(" + width/2 + "," + (25 + (margin * 4)) + ")")
				.attr("text-anchor", "middle").style('fill', '#707070')
				.attr("font-size", "16px");
		}
		svg.select(".graphTitle1").text("Coronavirus Cases - " + location);
		svg.select(".graphTitle2").datum(data.total_cases).transition().delay(delay).duration(1000)
			.textTween(function(d) {
				this._current = (this._current) ? this._current : 0;
				let i = d3.interpolate(this._current, d);
				return function(t) { return (this._current = i(t)).toLocaleString(undefined, { maximumFractionDigits: 0 }) + " | "; };
			});
		svg.select(".graphTitle3").datum(data.new_cases).transition().delay(delay).duration(1000)
			.textTween(function(d) {
				this._current = (this._current) ? this._current : 0;
				let i = d3.interpolate(this._current, d);
				return function(t) { return "+" + (this._current = i(t)).toLocaleString(undefined, { maximumFractionDigits: 0 }); };
			});
		svg.select(".graphTitle4").text("Deaths - " + location);
		svg.select(".graphTitle5").datum(data.total_deaths).transition().delay(delay).duration(1000)
			.textTween(function(d) {
				this._current = (this._current) ? this._current : 0;
				let i = d3.interpolate(this._current, d);
				return function(t) { return (this._current = i(t)).toLocaleString(undefined, { maximumFractionDigits: 0 }) + " | "; };
			});
		svg.select(".graphTitle6").datum(data.new_deaths).transition().delay(delay).duration(1000)
			.textTween(function(d) {
				this._current = (this._current) ? this._current : 0;
				let i = d3.interpolate(this._current, d);
				return function(t) { return "+" + (this._current = i(t)).toLocaleString(undefined, { maximumFractionDigits: 0 }); };
			});
		svg.select(".graphTitle7").text("Last updated: " + new Date(data.date).toUTCString());
	}

	/**
	 * Display the daily Coronavirus cases based on the selected location.
	 *
	 * Draw bar graph that represent daily cases and the pandemic development pattern in that location.
	 *
	 * @param {String} location - selected location to display the daily Coronavirus cases.
	 * @param {String} mainContainer - main container name where SVG will be added or updated.
	 */
	createLocationDailyCasesBarGraph(location, mainContainer) {
		let data = mainModelCovidData.getAllLocationCovidData(location);
		let svg = d3.select(".dailyCasesBarGraphSVG");
		let width = 520,
			height = 450,
			margin = 75,
			xMax = width - (margin * 2),
			yMax = height - (margin * 2);
		if (svg.empty()) {
			svg = d3.select(mainContainer)
					.append("svg")
					.attr("class","dailyCasesBarGraphSVG")
					.attr("width", width)
					.attr("height", height);
			// Add title to the SVG graph based on margin and calculated width for the coordination
			svg.append("text")
				.attr("class","graphTitle")
				.attr("transform", "translate(" + width/2 + "," + margin/2 + ")")
				.attr("text-anchor", "middle")
				.attr("font-size", "16px")
				.attr("font-weight", "bold");
			// Add container group for x and y axises along with their titles and bar rectangles
			svg.append("g")
				.attr("class","dailyCasesBarGraphContainerGroup")
				.attr("transform", "translate(" + margin + "," + margin + ")");
		}
		svg.select(".graphTitle").text("Daily Reported Cases - " + location);
		let x = d3.scaleBand()
					.domain(data.map(function(d) { return d.date; }))
					.range([0, xMax]);
		let maxValueWithMargin = d3.max(data, function(d) { return d.new_cases; });
		maxValueWithMargin += maxValueWithMargin/10;
		let y = d3.scaleLinear()
					.domain([0, maxValueWithMargin])
					.range([yMax, 0]);
		// Select the container group for the x and y axises along with their titles and bar rectangles
		let g = svg.select(".dailyCasesBarGraphContainerGroup");
		// Select and remove left and bottom old axises
		g.select(".xGroup").remove();
		g.select(".yGroup").remove();
		g.selectAll("line.horizontalGrid").remove();
		// Add container group for x bottom axis along with the axis's title
		g.append("g")
			.attr("transform", "translate(0," + yMax + ")")
			.attr("class", "xGroup")
			.call(d3.axisBottom(x).tickFormat(function(d){
						return new Date(d).toLocaleDateString('en-us', {year:"numeric", month:"short", day:"numeric"});
					}).tickValues(x.domain().filter(function(d,i){ return !(i%50)})))
			.selectAll("text")
				.attr("transform", "translate(-10,0)rotate(-40)")
				.style("text-anchor", "end");
		g.select(".xGroup")
			.append("text")
			.attr("y", 70)
			.attr("x", xMax/2)
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text("Date");
		// Add container group for y left axis along with the axis's title
		g.append("g")
			.attr("class", "yGroup")
			.call(d3.axisLeft(y).tickFormat(function(d){
					if (d != 0 && d < 1000000) {
						return (d/1000) + "K";
					}
					else if (d != 0) {
						return (d/1000000) + "M";
					}
					return d;
				}).ticks(8))
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 8)
			.attr("x", - (yMax/2))
			.attr("dy", "-5.1em")
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text("Daily Cases");
		g.selectAll("line.horizontalGrid")
			.data(y.ticks(8))
			.enter()
			.append("line")
				.attr("class","horizontalGrid")
				.attr("x1" , 0)
				.attr("x2" , xMax)
				.attr("y1" , function(d){ return y(d);})
				.attr("y2" , function(d){ return y(d);})
				.attr("fill" , "none")
				.attr("stroke" , "grey")
				.attr("stroke-width" , 0.5)
				.style("stroke-opacity", 0.5);
		// For initial data binding and to ensure smooth transition
		if (g.selectAll("rect").empty()) {
			g.selectAll("rect").data(data).enter().append("rect").attr("y", y(0)).attr("height", yMax - y(0));
		}
		// Add all bar rectangles to the container group
		let bars = g.selectAll("rect").data(data);
		// Fade away the unused rectangle bars using 'exit' and 'opacity'
		bars.exit().transition().duration(500).style('opacity', 0); 
		bars.enter()
			.append("rect")
			.merge(bars)
			.on("mouseover", onMouseOver)
			.on("mouseout", onMouseOut)
			.attr("x", function(d) { return x(d.date); })
			.attr("width", x.bandwidth())
			.transition()
				.ease(d3.easeLinear)
				.duration(600)
				.delay(function (d, i) {
						return i * 10;
					})
				.attr("y", function(d) { return y(d.new_cases); })
				.attr("height", function(d) { return yMax - y(d.new_cases); })
				.attr("fill", "grey")
				.style('opacity', 1);
		// Bar rectangle mouseover event handler function
		function onMouseOver(mouseEvent, i) {
			let xCurrent = Number(d3.select(this).attr('x'));
			let yCurrent = Number(d3.select(this).attr('y'));
			d3.select(this)
				.attr("fill", "#ffbf00")
				.transition() // adds animation
				.duration(400)
				.attr('width', x.bandwidth() + 2)
				.attr("y", function(d) { return y(d.new_cases) - 10; })
				.attr("height", function(d) { return yMax - y(d.new_cases) + 10; });
			let newCases = (i.new_cases/1000000).toFixed(2) + "M";
			if (i.new_cases < 1000000) {
				newCases = (i.new_cases/1000).toFixed(2) + "K";
			}
			let selectedDateText = new Date(i.date).toLocaleDateString('en-us', {year:"numeric", month:"short", day:"numeric"});
			g.append("text")
				.attr('class', 'val')
				.attr('x', xCurrent + (x.bandwidth()/2))
				.attr('y', yCurrent - 12)
				.attr("font-size", "9px")
				.attr("font-weight", "bold")
				.attr("text-anchor", "middle")
				.text(newCases + ", " + selectedDateText);
		}
		// Bar rectangle mouseout event handler function
		function onMouseOut(mouseEvent, i) {
			// Using i parameter as it holds the bounded data
			d3.select(this)
				.attr("fill", "grey")
				.transition() // adds animation
					.duration(400)
					.attr('width', x.bandwidth())
					.attr("y", y(i.new_cases))
					.attr("height", yMax - y(i.new_cases));
			g.selectAll('.val').remove();
		}
	}

	/**
	 * Display the daily Coronavirus deaths based on the selected location.
	 *
	 * Draw bar graph that represent daily deaths and the pandamic development pattern in that location.
	 *
	 *
	 * @param {String} location - selected location to display the daily Coronavirus cases.
	 * @param {String} mainContainer - main container name where SVG will be added or updated.
	 */
	createLocationDailyDeathsBarGraph(location, mainContainer) {
		let data = mainModelCovidData.getAllLocationCovidData(location);
		let svg = d3.select(".dailyDeathsBarGraphSVG");
		let width = 520,
			height = 450,
			margin = 75,
			xMax = width - (margin * 2),
			yMax = height - (margin * 2);
		if (svg.empty()) {
			svg = d3.select(mainContainer)
					.append("svg")
					.attr("class","dailyDeathsBarGraphSVG")
					.attr("width", width)
					.attr("height", height);
			// Add title to the SVG graph based on margin and calculated width for the coordination
			svg.append("text")
				.attr("class","graphTitle")
				.attr("transform", "translate(" + width/2 + "," + margin/2 + ")")
				.attr("text-anchor", "middle")
				.attr("font-size", "16px")
				.attr("font-weight", "bold");
			// Add container group for x and y axises along with their titles and bar rectangles
			svg.append("g")
				.attr("class","dailyDeathsBarGraphContainerGroup")
				.attr("transform", "translate(" + margin + "," + margin + ")");
		}
		svg.select(".graphTitle").text("Daily Reported Deaths - " + location);
		let x = d3.scaleBand()
					.domain(data.map(function(d) { return d.date; }))
					.range([0, xMax]);
		let maxValueWithMargin = d3.max(data, function(d) { return d.new_deaths; });
		maxValueWithMargin += maxValueWithMargin/10;
		let y = d3.scaleLinear()
					.domain([0, maxValueWithMargin])
					.range([yMax, 0]);
		// Select the container group for the x and y axises along with their titles and bar rectangles
		let g = svg.select(".dailyDeathsBarGraphContainerGroup");
		// Select and remove left and bottom old axises
		g.select(".xGroup").remove();
		g.select(".yGroup").remove();
		g.selectAll("line.horizontalGrid").remove();
		// Add container group for x bottom axis along with the axis's title
		g.append("g")
			.attr("transform", "translate(0," + yMax + ")")
			.attr("class", "xGroup")
			.call(d3.axisBottom(x).tickFormat(function(d){
						return new Date(d).toLocaleDateString('en-us', {year:"numeric", month:"short", day:"numeric"});
					}).tickValues(x.domain().filter(function(d,i){ return !(i%50)})))
			.selectAll("text")
				.attr("transform", "translate(-10,0)rotate(-40)")
				.style("text-anchor", "end");
		g.select(".xGroup")
			.append("text")
			.attr("y", 70)
			.attr("x", xMax/2)
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text("Date");
		// Add container group for y left axis along with the axis's title
		g.append("g")
			.attr("class", "yGroup")
			.call(d3.axisLeft(y).tickFormat(function(d){
					if (d != 0 && d < 1000000) {
						return (d/1000) + "K";
					}
					else if (d != 0) {
						return (d/1000000) + "M";
					}
					return d;
				}).ticks(8))
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 8)
			.attr("x", - (yMax/2))
			.attr("dy", "-5.1em")
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text("Daily Deaths");
		g.selectAll("line.horizontalGrid")
			.data(y.ticks(8))
			.enter()
			.append("line")
				.attr("class","horizontalGrid")
				.attr("x1" , 0)
				.attr("x2" , xMax)
				.attr("y1" , function(d){ return y(d);})
				.attr("y2" , function(d){ return y(d);})
				.attr("fill" , "none")
				.attr("stroke" , "grey")
				.attr("stroke-width" , 0.5)
				.style("stroke-opacity", 0.5);
		// For initial data binding and to ensure smooth transition
		if (g.selectAll("rect").empty()) {
			g.selectAll("rect").data(data).enter().append("rect").attr("y", y(0)).attr("height", yMax - y(0));
		}
		// Add all bar rectangles to the container group
		let bars = g.selectAll("rect").data(data);
		// Fade away the unused rectangle bars using 'exit' and 'opacity'
		bars.exit().transition().duration(500).style('opacity', 0); 
		bars.enter()
			.append("rect")
			.merge(bars)
			.on("mouseover", onMouseOver)
			.on("mouseout", onMouseOut)
			.attr("x", function(d) { return x(d.date); })
			.attr("width", x.bandwidth())
			.transition()
				.ease(d3.easeLinear)
				.duration(600)
				.delay(function (d, i) {
						return i * 10;
					})
				.attr("y", function(d) { return y(d.new_deaths); })
				.attr("height", function(d) { return yMax - y(d.new_deaths); })
				.attr("fill", "grey")
				.style('opacity', 1);
		// Bar rectangle mouseover event handler function
		function onMouseOver(mouseEvent, i) {
			let xCurrent = Number(d3.select(this).attr('x'));
			let yCurrent = Number(d3.select(this).attr('y'));
			d3.select(this)
				.attr("fill", "#ffbf00")
				.transition() // adds animation
				.duration(400)
				.attr('width', x.bandwidth() + 2)
				.attr("y", function(d) { return y(d.new_deaths) - 10; })
				.attr("height", function(d) { return yMax - y(d.new_deaths) + 10; });
			let newDeaths = (i.new_deaths/1000000).toFixed(2) + "M";
			if (i.new_deaths < 1000000) {
				newDeaths = (i.new_deaths/1000).toFixed(2) + "K";
			}
			let selectedDateText = new Date(i.date).toLocaleDateString('en-us', {year:"numeric", month:"short", day:"numeric"});
			g.append("text")
				.attr('class', 'val')
				.attr('x', xCurrent + (x.bandwidth()/2))
				.attr('y', yCurrent - 12)
				.attr("font-size", "9px")
				.attr("font-weight", "bold")
				.attr("text-anchor", "middle")
				.text(newDeaths + ", " + selectedDateText);
		}
		// Bar rectangle mouseout event handler function
		function onMouseOut(mouseEvent, i) {
			// Using i parameter as it holds the bounded data
			d3.select(this)
				.attr("fill", "grey")
				.transition() // adds animation
					.duration(400)
					.attr('width', x.bandwidth())
					.attr("y", y(i.new_deaths))
					.attr("height", yMax - y(i.new_deaths));
			g.selectAll('.val').remove();
		}
	}

	/**
	 * Display the total Coronavirus cases based on the selected location.
	 *
	 * Draw line graph that represent total cases and the pandemic development pattern in that location.
	 *
	 * @param {String} location - selected location to display the daily Coronavirus cases.
	 * @param {String} mainContainer - main container name where SVG will be added or updated.
	 */
	createLocationTotalCasesLineGraph(location, mainContainer) {
		let data = mainModelCovidData.getAllLocationCovidData(location);
		let dataDictionary = Object.assign({}, ...data.map((d) => 
			({[new Date(d.date).toLocaleDateString('en-us', {year:"numeric", month:"short", day:"numeric"})]: 
			d.total_cases})));
		let svg = d3.select(".totalCasesLineGraph");
		let width = 520,
			height = 450,
			margin = 75,
			xMax = width - (margin * 2),
			yMax = height - (margin * 2);
		if (svg.empty()) {
			svg = d3.select(mainContainer)
					.append("svg")
					.attr("class","totalCasesLineGraph")
					.attr('width', width )
					.attr('height', height );
			// Add title to the SVG graph based on margin and calculated width for the coordination
			svg.append("text")
				.attr("class","graphTitle")
				.attr("transform", "translate(" + width/2 + "," + margin/2 + ")")
				.attr("text-anchor", "middle")
				.attr("font-size", "15px")
				.attr("font-weight", "bold");
			// Add container group for x and y axises along with their titles and line path
			svg.append("g")
				.attr("class","locationTotalCasesLineGraphContainerGroup")
				.attr("transform", "translate(" + margin + "," + margin + ")");
			// Define smooth gradient transition from blue to red color to the path
			svg.select(".locationTotalCasesLineGraphContainerGroup")
				.append("linearGradient")
					.attr("id", "line-gradient-TCLG")
					.attr("gradientUnits", "userSpaceOnUse")
					.attr("x1", "0%")
					.attr("y1", "0%")
					.attr("x2", "0%")
					.attr("y2", "100%")
					.selectAll("stop")
					.data([
						{offset: "0%", color: "red"},
						{offset: "100%", color: "blue"}
					])
					.enter().append("stop")
								.attr("offset", function(d) { return d.offset; })
								.attr("stop-color", function(d) { return d.color; });
			svg.select(".locationTotalCasesLineGraphContainerGroup").append("rect").attr("width", xMax).attr("height", yMax).style("opacity","0");
			svg.select(".locationTotalCasesLineGraphContainerGroup").append("path").attr("class","gPath").attr("fill", "none");
		}
		// Update graph title
		svg.select(".graphTitle").text("Total Coronavirus Cases - " + location);
		// Select SVG container group for x and y axises along with their titles and line path
		let g = svg.select(".locationTotalCasesLineGraphContainerGroup");
		// Select and remove left and bottom old axises
		g.select(".xGroup").remove();
		g.select(".yGroup").remove();
		g.selectAll("line.horizontalGrid").remove();
		//Prepare domain max and min data for x and y axises
		let xExtent = d3.extent( data, d=>{ return d.date } );
		let yExtent = d3.extent( data, d=>{ return d.total_cases } );
		let xScale = d3.scaleLinear()
					.domain([ xExtent[0], xExtent[1] ])
					.range([0, xMax]);
		// Add container group for x bottom axis along with the axis's title
		g.append("g")
			.attr("transform", "translate(0," + yMax + ")")
			.attr("class", "xGroup")
			.call(d3.axisBottom(xScale).tickFormat(function(d){
						return new Date(d).toLocaleDateString('en-us', {year:"numeric", month:"short", day:"numeric"});
					}).ticks(10))
			.selectAll("text")
				.attr("transform", "translate(-10,0)rotate(-40)")
				.style("text-anchor", "end");
		g.select(".xGroup")
			.append("text")
			.attr("y", 70)
			.attr("x", xMax/2)
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text("Date");
		let yDomainMaxWithMargin = yExtent[1] + (yExtent[1]/6);
		let yScale = d3.scaleLinear()
					.domain([yExtent[0], yDomainMaxWithMargin])
					.range([yMax, 0]);
		// Add container group for y left axis along with the axis's title	
		g.append("g")
			.attr("class", "yGroup")
			.call(d3.axisLeft(yScale).tickFormat(function(d){
						if (d != 0 && d < 1000000) {
							return (d/1000) + "K";
						}
						else if (d != 0) {
							return (d/1000000) + "M";
						}
						return d;
					}).ticks(8))
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 8)
			.attr("x", - (yMax/2))
			.attr("dy", "-5.1em")
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text("Total Reported Cases");
		g.selectAll("line.horizontalGrid")
			.data(yScale.ticks(8))
			.enter()
			.append("line")
				.attr("class","horizontalGrid")
				.attr("x1" , 0)
				.attr("x2" , xMax)
				.attr("y1" , function(d){ return yScale(d);})
				.attr("y2" , function(d){ return yScale(d);})
				.attr("fill" , "none")
				.attr("stroke" , "grey")
				.attr("stroke-width" , 0.5)
				.style("stroke-opacity", 0.5);
		g.select(".gPath")
			.datum(data)
			.attr("stroke", "url(#line-gradient-TCLG)" )
			.attr("stroke-width", 3)
			.attr("class","gPath")
			.attr("fill", "none")
			.transition()
				.duration(5)
				.attr("d", d3.line().curve(d3.curveLinear)
					.x(function(d) { return xScale(d.date) })
					.y(function(d) { return yScale(d.total_cases) })
				);
		g.on("mouseover", function(event){
			graphMarker("over", d3.pointer(event));
		})
		.on("mousemove", function(event){
			graphMarker("move", d3.pointer(event));
		})
		.on("mouseleave", mouseLeave)
		.on("onmouseout", mouseLeave);
		
		function graphMarker(overOrMove, coordinates) {
			let x = coordinates[0],
				y = coordinates[1],
				selectedDate = xScale.invert(coordinates[0]),
				selectedDateText = new Date(selectedDate).toLocaleDateString('en-us', {year:"numeric", month:"short", day:"numeric"}),
				totalCases = dataDictionary[selectedDateText],
				totalCasesText = totalCases,
				revisedY = yScale(totalCases),
				circleMarkerRadius = 5;
			if (totalCases != 0 && totalCases > 999 && totalCases < 1000000) {
				totalCasesText = (totalCases/1000).toFixed(2) + "K";
			}
			else if (totalCases != 0 && totalCases > 1000000) {
				totalCasesText = (totalCases/1000000).toFixed(2) + "M";
			}
			if(totalCases && revisedY) {
				g.select(".gPath").style("opacity", 0.5);
				if(overOrMove == "over") {
					g.select(".textMarker").remove();
					g.select(".circleMarker").remove();
					g.select(".lineXMarker").remove();
					g.select(".lineYMarker").remove();
					g.append("text")
						.attr("class","textMarker")
						.attr("font-size", "9px")
						.attr("font-weight", "bold");
					g.append("circle").attr("class","circleMarker");
					g.append("line").attr("class","lineXMarker");
					g.append("line").attr("class","lineYMarker");
				}
				g.select(".textMarker")
					.attr("x", x + circleMarkerRadius + 2)
					.attr("y", revisedY)
					.text( totalCasesText + ", "+ selectedDateText);
				g.select(".circleMarker")
					.attr("r", circleMarkerRadius)
					.attr("cx", x)
					.attr("cy", revisedY)
					.style("opacity", 0.8)
					.style("stroke", "red")
					.style("fill", "blue");
				g.select(".lineXMarker").attr('x1', 0).attr('y1', revisedY)
					.attr('x2', x - circleMarkerRadius).attr('y2', revisedY)
					.style("stroke", "black").style("stroke-dasharray", ("10, 3"))
					.style("opacity", 0.3);
				g.select(".lineYMarker").attr('x1', x).attr('y1', revisedY + circleMarkerRadius)
					.attr('x2', x).attr('y2', yMax)
					.style("stroke", "black").style("stroke-dasharray", ("10, 3"))
					.style("opacity", 0.3);
			}
		}
		function mouseLeave(mouseEvent) {
			g.select(".gPath").transition().duration(400).style("opacity", 1.0);
			g.select(".textMarker").transition().duration(400).style("opacity", 0);
			g.select(".circleMarker").transition().duration(400).style("opacity", 0);
			g.select(".lineXMarker").transition().duration(400).style("opacity", 0);
			g.select(".lineYMarker").transition().duration(400).style("opacity", 0);
		}
		mouseLeave(null);
	}

	/**
	 * Display the total Coronavirus deaths based on the selected location.
	 *
	 * Draw line graph that represent total deaths and the pandemic development pattern in that location.
	 *
	 * @param {String} location - selected location to display the daily Coronavirus cases.
	 * @param {String} mainContainer - main container name where SVG will be added or updated.
	 */
	createLocationTotalDeathsLineGraph(location, mainContainer) {
		let data = mainModelCovidData.getAllLocationCovidData(location);
		let dataDictionary = Object.assign({}, ...data.map((d) => 
			({[new Date(d.date).toLocaleDateString('en-us', {year:"numeric", month:"short", day:"numeric"})]: 
			d.total_deaths})));
		let svg = d3.select(".totalDeathsLineGraph");
		let width = 520,
			height = 450,
			margin = 75,
			xMax = width - (margin * 2),
			yMax = height - (margin * 2);
		if (svg.empty()) {
			svg = d3.select(mainContainer)
					.append("svg")
					.attr("class","totalDeathsLineGraph")
					.attr('width', width )
					.attr('height', height );
			// Add title to the SVG graph based on margin and calculated width for the coordination
			svg.append("text")
				.attr("class","graphTitle")
				.attr("transform", "translate(" + width/2 + "," + margin/2 + ")")
				.attr("text-anchor", "middle")
				.attr("font-size", "15px")
				.attr("font-weight", "bold");
			// Add container group for x and y axises along with their titles and line path
			svg.append("g")
				.attr("class","locationTotalDeathsContainerGroup")
				.attr("transform", "translate(" + margin + "," + margin + ")");
			// Define smooth gradient transition from blue to red color to the path
			svg.select(".locationTotalDeathsContainerGroup")
				.append("linearGradient")
					.attr("id", "line-gradient-TDLG")
					.attr("gradientUnits", "userSpaceOnUse")
					.attr("x1", "0%")
					.attr("y1", "0%")
					.attr("x2", "0%")
					.attr("y2", "100%")
					.selectAll("stop")
					.data([
						{offset: "0%", color: "red"},
						{offset: "100%", color: "blue"}
					])
					.enter().append("stop")
								.attr("offset", function(d) { return d.offset; })
								.attr("stop-color", function(d) { return d.color; });
			svg.select(".locationTotalDeathsContainerGroup")
				.append("rect").attr("width", xMax).attr("height", yMax).style("opacity","0");
			svg.select(".locationTotalDeathsContainerGroup")
				.append("path").attr("class","gPath").attr("fill", "none");
		}
		// Update graph title
		svg.select(".graphTitle").text("Total Coronavirus Deaths - " + location);
		// Select SVG container group for x and y axises along with their titles and line path
		let g = svg.select(".locationTotalDeathsContainerGroup");
		// Select and remove left and bottom old axises
		g.select(".xGroup").remove();
		g.select(".yGroup").remove();
		g.selectAll("line.horizontalGrid").remove();
		//Prepare domain max and min data for x and y axises
		let xExtent = d3.extent( data, d=>{ return d.date } );
		let yExtent = d3.extent( data, d=>{ return d.total_deaths } );
		let xScale = d3.scaleLinear()
					.domain([ xExtent[0], xExtent[1] ])
					.range([0, xMax]);
		// Add container group for x bottom axis along with the axis's title
		g.append("g")
			.attr("transform", "translate(0," + yMax + ")")
			.attr("class", "xGroup")
			.call(d3.axisBottom(xScale).tickFormat(function(d){
						return new Date(d).toLocaleDateString('en-us', {year:"numeric", month:"short", day:"numeric"});
					}).ticks(10))
			.selectAll("text")
				.attr("transform", "translate(-10,0)rotate(-40)")
				.style("text-anchor", "end");
		g.select(".xGroup")
			.append("text")
			.attr("y", 70)
			.attr("x", xMax/2)
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text("Date");
		let yDomainMaxWithMargin = yExtent[1] + (yExtent[1]/6);
		let yScale = d3.scaleLinear()
					.domain([yExtent[0], yDomainMaxWithMargin])
					.range([yMax, 0]);
		// Add container group for y left axis along with the axis's title	
		g.append("g")
			.attr("class", "yGroup")
			.call(d3.axisLeft(yScale).tickFormat(function(d){
						if (d != 0 && d < 1000000) {
							return (d/1000) + "K";
						}
						else if (d != 0) {
							return (d/1000000) + "M";
						}
						return d;
					}).ticks(8))
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 8)
			.attr("x", - (yMax/2))
			.attr("dy", "-5.1em")
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text("Total Reported Deaths");
		g.selectAll("line.horizontalGrid")
			.data(yScale.ticks(8))
			.enter()
			.append("line")
				.attr("class","horizontalGrid")
				.attr("x1" , 0)
				.attr("x2" , xMax)
				.attr("y1" , function(d){ return yScale(d);})
				.attr("y2" , function(d){ return yScale(d);})
				.attr("fill" , "none")
				.attr("stroke" , "grey")
				.attr("stroke-width" , 0.5)
				.style("stroke-opacity", 0.5);
		g.select(".gPath")
			.datum(data)
			.attr("stroke", "url(#line-gradient-TDLG)" )
			.attr("stroke-width", 3)
			.attr("class","gPath")
			.attr("fill", "none")
			.transition()
				.duration(5)
				.attr("d", d3.line().curve(d3.curveLinear)
					.x(function(d) { return xScale(d.date) })
					.y(function(d) { return yScale(d.total_deaths) })
				);
		g.on("mouseover", function(event){
			graphMarker("over", d3.pointer(event));
		})
		.on("mousemove", function(event){
			graphMarker("move", d3.pointer(event));
		})
		.on("mouseleave", mouseLeave)
		.on("onmouseout", mouseLeave);
		
		function graphMarker(overOrMove, coordinates) {
			let x = coordinates[0],
				y = coordinates[1],
				selectedDate = xScale.invert(coordinates[0]),
				selectedDateText = new Date(selectedDate).toLocaleDateString('en-us', {year:"numeric", month:"short", day:"numeric"}),
				totalDeaths = dataDictionary[selectedDateText],
				totalDeathsText = totalDeaths,
				revisedY = yScale(totalDeaths),
				circleMarkerRadius = 5;
			if (totalDeaths != 0 && totalDeaths > 999 && totalDeaths < 1000000) {
				totalDeathsText = (totalDeaths/1000).toFixed(2) + "K";
			}
			else if (totalDeaths != 0 && totalDeaths > 1000000) {
				totalDeathsText = (totalDeaths/1000000).toFixed(2) + "M";
			}
			if(totalDeaths && revisedY) {
				g.select(".gPath").style("opacity", 0.5);
				if(overOrMove == "over") {
					g.select(".textMarker").remove();
					g.select(".circleMarker").remove();
					g.select(".lineXMarker").remove();
					g.select(".lineYMarker").remove();
					g.append("text")
						.attr("class","textMarker")
						.attr("font-size", "9px")
						.attr("font-weight", "bold");
					g.append("circle").attr("class","circleMarker");
					g.append("line").attr("class","lineXMarker");
					g.append("line").attr("class","lineYMarker");
				}
				g.select(".textMarker")
					.attr("x", x + circleMarkerRadius + 2)
					.attr("y", revisedY)
					.text( totalDeathsText + ", "+ selectedDateText);
				g.select(".circleMarker")
					.attr("r", circleMarkerRadius)
					.attr("cx", x)
					.attr("cy", revisedY)
					.style("opacity", 0.8)
					.style("stroke", "red")
					.style("fill", "blue");
				g.select(".lineXMarker").attr('x1', 0).attr('y1', revisedY)
					.attr('x2', x - circleMarkerRadius).attr('y2', revisedY)
					.style("stroke", "black").style("stroke-dasharray", ("10, 3"))
					.style("opacity", 0.3);
				g.select(".lineYMarker").attr('x1', x).attr('y1', revisedY + circleMarkerRadius)
					.attr('x2', x).attr('y2', yMax)
					.style("stroke", "black").style("stroke-dasharray", ("10, 3"))
					.style("opacity", 0.3);
			}
		}
		function mouseLeave(mouseEvent) {
			g.select(".gPath").transition().duration(400).style("opacity", 1.0);
			g.select(".textMarker").transition().duration(400).style("opacity", 0);
			g.select(".circleMarker").transition().duration(400).style("opacity", 0);
			g.select(".lineXMarker").transition().duration(400).style("opacity", 0);
			g.select(".lineYMarker").transition().duration(400).style("opacity", 0);
		}
		mouseLeave(null);
	}

	/**
	 * Compare the continents total Coronavirus cases.
	 *
	 * Draw bar graph that represent total cases in each continent and compare the pandemic development pattern.
	 *
	 * @param {String} mainContainer - main container name where SVG will be added or updated.
	 * @param {Boolean} isPerMillion - is the total reported cases compared per million.
	 */
	createContinentsCasesBarGraph(mainContainer, isPerMillion, type, location) {
		let data;
		if(type == 0) { // World Selected Area
			data = mainModelCovidData.getAllContinentsLatestCovidData();
			data.sort(function(a, b) { return d3.descending(a.total_cases, b.total_cases) });
		}
		else if(type == 1) { // Continent Selected Area
			data = mainModelCovidData.getContinentTop10CountriesCasesWithLatestCovidData(location);
		}
		let svg = d3.select(".continentsCasesBarGraphSVG");
		let width = 520,
			height = 450,
			margin = 75,
			xMax = width - (margin * 2),
			yMax = height - (margin * 2);
		if (svg.empty()) {
			svg = d3.select(mainContainer)
					.append("svg")
					.attr("class","continentsCasesBarGraphSVG")
					.attr("width", width)
					.attr("height", height);
			// Add title to the SVG graph based on margin and calculated width for the coordination
			svg.append("text")
				.attr("class","graphTitle")
				.attr("transform", "translate(" + width/2 + "," + margin/2 + ")")
				.attr("text-anchor", "middle")
				.attr("font-size", "16px")
				.attr("font-weight", "bold");
			// Add container group for x and y axises along with their titles and bar rectangles
			svg.append("g")
				.attr("class","continentsCasesBarGraphContainerGroup")
				.attr("transform", "translate(" + margin + "," + margin + ")");
		}
		
		if(type == 0) { // World Selected Area
			if(isPerMillion) {
				svg.select(".graphTitle").text("Total Cases Per Million - Continents");
			}
			else {
				svg.select(".graphTitle").text("Total Cases - Continents");
			}
		}
		else if(type == 1) { // Continent Selected Area
			if(isPerMillion) {
				svg.select(".graphTitle").text("Top 10 Reporting-Cases Countries in " + location + " - Per Million");
			}
			else {
				svg.select(".graphTitle").text("Top 10 Reporting-Cases Countries in " + location);
			}
		}
		// Select the container group for the x and y axises along with their titles and bar rectangles
		let g = svg.select(".continentsCasesBarGraphContainerGroup");
		g.select(".xGroup").remove();
		g.select(".yGroup").remove();
		g.selectAll("line.horizontalGrid").remove();
		
		var x = d3.scaleBand()
					.domain(data.map(function(d) { return d.location; }))
					.range([0, xMax])
					.padding(0.1);
		let maxValueWithMargin;
		if(isPerMillion) {
			maxValueWithMargin = d3.max(data, function(d) { return d.total_cases_per_million; });
		}
		else {
			maxValueWithMargin = d3.max(data, function(d) { return d.total_cases; });
		}
		maxValueWithMargin += maxValueWithMargin/20;
		var y = d3.scaleLinear()
					.domain([0, maxValueWithMargin])
					.range([yMax, 0]);
		var barColorScale = d3.scaleLinear().range(["blue", "red"]);
		if(isPerMillion) {
			barColorScale.domain([0, d3.max(data, function(d) { return d.total_cases_per_million; })]);
		}
		else {
			barColorScale.domain([0, d3.max(data, function(d) { return d.total_cases; })]);
		}
		// Add container group for x bottom axis along with the axis's title
		g.append("g")
			.attr("transform", "translate(0," + yMax + ")")
			.attr("class", "xGroup")
			.call(d3.axisBottom(x))
			.selectAll("text")
				.attr("transform", "translate(-10,0)rotate(-40)")
				.style("text-anchor", "end");
		g.select(".xGroup")
			.append("text")
			.attr("class","xGroupTitle")
			.attr("y", 70)
			.attr("x", xMax/2)
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold");
		if(type == 0) { // World Selected Area
			g.select(".xGroup").select(".xGroupTitle").text("Continent");
		}
		else if(type == 1) { // Continent Selected Area
			g.select(".xGroup").select(".xGroupTitle").text("Top Countries in " + location);
		}
		// Add container group for y left axis along with the axis's title
		g.append("g")
			.attr("class", "yGroup")
			.call(d3.axisLeft(y).tickFormat(function(d){
					if (d != 0 && d < 1000000) {
						return (d/1000) + "K";
					}
					else if (d != 0) {
						return (d/1000000) + "M";
					}
					return d;
				}).ticks(8))
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 8)
			.attr("x", - (yMax/2))
			.attr("dy", "-5.1em")
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text((isPerMillion) ? "Total Reported Cases Per Million" : "Total Reported Cases");
		g.selectAll("line.horizontalGrid")
			.data(y.ticks(8))
			.enter()
			.append("line")
				.attr("class","horizontalGrid")
				.attr("x1" , 0)
				.attr("x2" , xMax)
				.attr("y1" , function(d){ return y(d);})
				.attr("y2" , function(d){ return y(d);})
				.attr("fill" , "none")
				.attr("stroke" , "grey")
				.attr("stroke-width" , 0.5)
				.style("stroke-opacity", 0.5);
		// For initial data binding and to ensure smooth transition
		if (g.selectAll("rect").empty()) {
			g.selectAll("rect").data(data).enter().append("rect").attr("y", y(0)).attr("height", yMax - y(0));
		}
		// Add all bar rectangles to the container group
		let bars = g.selectAll("rect").data(data);
		// Fade away the unused rectangle bars using 'exit' and 'opacity'
		bars.exit().transition().duration(500).style('opacity', 0); 
		bars.enter()
			.append("rect")
			.merge(bars)
			.on("mouseover", onMouseOver)
			.on("mouseout", onMouseOut)
			.on('click', function(d,i) {
							console.log(type);
							updateGraphChartLocation(i.location, type+1);
						})
			.attr("x", function(d) { return x(d.location); })
			.transition()
				.ease(d3.easeLinear)
				.duration(600)
				.delay(function (d, i) {
						return i * 10;
					})
				.attr("y", function(d) { return (isPerMillion) ? y(d.total_cases_per_million) : y(d.total_cases); })
				.attr("height", function(d) { return (isPerMillion) ? (yMax - y(d.total_cases_per_million)) : (yMax - y(d.total_cases)); })
				.attr("width", x.bandwidth())
				.attr("fill", function(d) { return (isPerMillion) ? barColorScale(d.total_cases_per_million) : barColorScale(d.total_cases); })
				.style('opacity', 1);
		
		// Bar rectangle mouseover event handler function
		function onMouseOver(mouseEvent, i) {
			let xCurrent = Number(d3.select(this).attr('x'));
			let yCurrent = Number(d3.select(this).attr('y'));
			d3.select(this).style("cursor", "pointer"); 
			d3.select(this)
				.attr("fill", "#ffbf00")
				.transition() // adds animation
				.duration(400)
				.attr('width', x.bandwidth() + 2)
				.attr("y", function(d) { return (isPerMillion) ? (y(d.total_cases_per_million) - 10) : (y(d.total_cases) - 10); })
				.attr("height", function(d) { return (isPerMillion) ? (yMax - y(d.total_cases_per_million) + 10) : (yMax - y(d.total_cases) + 10); });
			let currentCases = (isPerMillion) ? i.total_cases_per_million : i.total_cases;
			let reportedCases = (currentCases/1000000).toFixed(2) + "M";
			if (currentCases < 1000000) {
				reportedCases = (currentCases/1000).toFixed(2) + "K";
			}
			g.append("text")
				.attr('class', 'val')
				.attr('x', xCurrent + (x.bandwidth()/2))
				.attr('y', yCurrent - 12)
				.attr("font-size", "9px")
				.attr("font-weight", "bold")
				.attr("text-anchor", "middle")
				.text(reportedCases); // Value of the text
		}
		// Bar rectangle mouseout event handler function
		function onMouseOut(mouseEvent, i) {
			// Using i parameter as it holds the bounded data
			d3.select(this)
				.attr("fill", (isPerMillion) ? barColorScale(i.total_cases_per_million) : barColorScale(i.total_cases))
				.transition() // adds animation
					.duration(400)
					.attr('width', x.bandwidth())
					.attr("y", (isPerMillion) ? y(i.total_cases_per_million) : y(i.total_cases))
					.attr("height", (isPerMillion) ? (yMax - y(i.total_cases_per_million)) : (yMax - y(i.total_cases)));
			d3.select(this).style("cursor", "default");
			d3.select(".continentsCasesBarGraphSVG").selectAll('.val').remove();
		}
	}

	/**
	 * Compare the continents total Coronavirus Deaths.
	 *
	 * Draw bar graph that represent total deaths in each continent and compare the pandemic development pattern.
	 *
	 * @param {String} mainContainer - main container name where SVG will be added or updated.
	 * @param {Boolean} isPerMillion - is the total reported deaths compared per million.
	 */
	createContinentsDeathsBarGraph(mainContainer, isPerMillion, type, location) {
		let data;
		if(type == 0) { // World Selected Area
			data = mainModelCovidData.getAllContinentsLatestCovidData();
			data.sort(function(a, b) { return d3.descending(a.total_deaths, b.total_deaths) });
		}
		else if(type == 1) { // Continent Selected Area
			data = mainModelCovidData.getContinentTop10CountriesDeathsWithLatestCovidData(location);
		}
		let svg = d3.select(".continentsDeathsBarGraphSVG");
		let width = 520,
			height = 450,
			margin = 75,
			xMax = width - (margin * 2),
			yMax = height - (margin * 2);
		if (svg.empty()) {
			svg = d3.select(mainContainer)
					.append("svg")
					.attr("class","continentsDeathsBarGraphSVG")
					.attr("width", width)
					.attr("height", height);
			// Add title to the SVG graph based on margin and calculated width for the coordination
			svg.append("text")
				.attr("class","graphTitle")
				.attr("transform", "translate(" + width/2 + "," + margin/2 + ")")
				.attr("text-anchor", "middle")
				.attr("font-size", "16px")
				.attr("font-weight", "bold");
			// Add container group for x and y axises along with their titles and bar rectangles
			svg.append("g")
				.attr("class","continentsDeathsBarGraphContainerGroup")
				.attr("transform", "translate(" + margin + "," + margin + ")");
		}
		if(type == 0) { // World Selected Area
			if(isPerMillion) {
			svg.select(".graphTitle").text("Total Deaths Per Million - Continents");
			}
			else {
				svg.select(".graphTitle").text("Total Deaths - Continents");
			}
		}
		else if(type == 1) { // Continent Selected Area
			if(isPerMillion) {
				svg.select(".graphTitle").text("Top 10 Reporting-Deaths Countries in " + location + " - Per Million");
			}
			else {
				svg.select(".graphTitle").text("Top 10 Reporting-Deaths Countries in " + location);
			}
		}
		// Select the container group for the x and y axises along with their titles and bar rectangles
		let g = svg.select(".continentsDeathsBarGraphContainerGroup");
		g.select(".xGroup").remove();
		g.select(".yGroup").remove();
		g.selectAll("line.horizontalGrid").remove();
		
		var x = d3.scaleBand()
					.domain(data.map(function(d) { return d.location; }))
					.range([0, xMax])
					.padding(0.1);
		let maxValueWithMargin;
		if(isPerMillion) {
			maxValueWithMargin = d3.max(data, function(d) { return d.total_deaths_per_million; });
		}
		else {
			maxValueWithMargin = d3.max(data, function(d) { return d.total_deaths; });
		}
		maxValueWithMargin += maxValueWithMargin/20;
		var y = d3.scaleLinear()
					.domain([0, maxValueWithMargin])
					.range([yMax, 0]);
		var barColorScale = d3.scaleLinear().range(["blue", "red"]);
		if(isPerMillion) {
			barColorScale.domain([0, d3.max(data, function(d) { return d.total_deaths_per_million; })]);
		}
		else {
			barColorScale.domain([0, d3.max(data, function(d) { return d.total_deaths; })]);
		}
		// Add container group for x bottom axis along with the axis's title
		g.append("g")
			.attr("transform", "translate(0," + yMax + ")")
			.attr("class", "xGroup")
			.call(d3.axisBottom(x))
			.selectAll("text")
				.attr("transform", "translate(-10,0)rotate(-40)")
				.style("text-anchor", "end");
		g.select(".xGroup")
			.append("text")
			.attr("class","xGroupTitle")
			.attr("y", 70)
			.attr("x", xMax/2)
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold");
		if(type == 0) { // World Selected Area
			g.select(".xGroup").select(".xGroupTitle").text("Continent");
		}
		else if(type == 1) { // Continent Selected Area
			g.select(".xGroup").select(".xGroupTitle").text("Top Countries in " + location);
		}
		// Add container group for y left axis along with the axis's title
		g.append("g")
			.attr("class", "yGroup")
			.call(d3.axisLeft(y).tickFormat(function(d){
					if (d != 0 && d < 1000000) {
						return (d/1000) + "K";
					}
					else if (d != 0) {
						return (d/1000000) + "M";
					}
					return d;
				}).ticks(8))
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 8)
			.attr("x", - (yMax/2))
			.attr("dy", "-5.1em")
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text((isPerMillion) ? "Total Reported Deaths Per Million" : "Total Reported Deaths");
		g.selectAll("line.horizontalGrid")
			.data(y.ticks(8))
			.enter()
			.append("line")
				.attr("class","horizontalGrid")
				.attr("x1" , 0)
				.attr("x2" , xMax)
				.attr("y1" , function(d){ return y(d);})
				.attr("y2" , function(d){ return y(d);})
				.attr("fill" , "none")
				.attr("stroke" , "grey")
				.attr("stroke-width" , 0.5)
				.style("stroke-opacity", 0.5);
		// For initial data binding and to ensure smooth transition
		if (g.selectAll("rect").empty()) {
			g.selectAll("rect").data(data).enter().append("rect").attr("y", y(0)).attr("height", yMax - y(0));
		}
		// Add all bar rectangles to the container group
		let bars = g.selectAll("rect").data(data);
		// Fade away the unused rectangle bars using 'exit' and 'opacity'
		bars.exit().transition().duration(500).style('opacity', 0); 
		bars.enter()
			.append("rect")
			.merge(bars)
			.on("mouseover", onMouseOver)
			.on("mouseout", onMouseOut)
			.on('click', function(d,i) {
							updateGraphChartLocation(i.location, type+1);
						})
			.attr("x", function(d) { return x(d.location); })
			.transition()
				.ease(d3.easeLinear)
				.duration(600)
				.delay(function (d, i) {
						return i * 10;
					})
				.attr("y", function(d) { return (isPerMillion) ? y(d.total_deaths_per_million) : y(d.total_deaths); })
				.attr("height", function(d) { return (isPerMillion) ? (yMax - y(d.total_deaths_per_million)) : (yMax - y(d.total_deaths)); })
				.attr("width", x.bandwidth())
				.attr("fill", function(d) { return (isPerMillion) ? barColorScale(d.total_deaths_per_million) : barColorScale(d.total_deaths); })
				.style('opacity', 1);
		
		// Bar rectangle mouseover event handler function
		function onMouseOver(mouseEvent, i) {
			let xCurrent = Number(d3.select(this).attr('x'));
			let yCurrent = Number(d3.select(this).attr('y'));
			d3.select(this).style("cursor", "pointer"); 
			d3.select(this)
				.attr("fill", "#ffbf00")
				.transition() // adds animation
				.duration(400)
				.attr('width', x.bandwidth() + 2)
				.attr("y", function(d) { return (isPerMillion) ? (y(d.total_deaths_per_million) - 10) : (y(d.total_deaths) - 10); })
				.attr("height", function(d) { return (isPerMillion) ? (yMax - y(d.total_deaths_per_million) + 10) : (yMax - y(d.total_deaths) + 10); });
			let currentDeaths = (isPerMillion) ? i.total_deaths_per_million : i.total_deaths;
			let reportedDeaths = (currentDeaths/1000000).toFixed(2) + "M";
			if (currentDeaths < 1000000) {
				reportedDeaths = (currentDeaths/1000).toFixed(2) + "K";
			}
			g.append("text")
				.attr('class', 'val')
				.attr('x', xCurrent + (x.bandwidth()/2))
				.attr('y', yCurrent - 12)
				.attr("font-size", "9px")
				.attr("font-weight", "bold")
				.attr("text-anchor", "middle")
				.text(reportedDeaths); // Value of the text
		}
		// Bar rectangle mouseout event handler function
		function onMouseOut(mouseEvent, i) {
			// Using i parameter as it holds the bounded data
			d3.select(this)
				.attr("fill", (isPerMillion) ? barColorScale(i.total_deaths_per_million) : barColorScale(i.total_deaths))
				.transition() // adds animation
					.duration(400)
					.attr('width', x.bandwidth())
					.attr("y", (isPerMillion) ? y(i.total_deaths_per_million) : y(i.total_deaths))
					.attr("height", (isPerMillion) ? (yMax - y(i.total_deaths_per_million)) : (yMax - y(i.total_deaths)));
			d3.select(this).style("cursor", "default");
			d3.select(".continentsDeathsBarGraphSVG").selectAll('.val').remove();
		}
	}

	/**
	 * Compare the Wealth and Total COVID Cases.
	 *
	 * @param {String} mainContainer - main container name where SVG will be added or updated.
	 */
	createWealthTotalCasesGraph(mainContainer) {
		let data = mainModelCovidData.getAllCountriesLatestCovidAndExtremePovertyData();
		data.sort(function(a, b) { return d3.ascending(a.extreme_poverty, b.extreme_poverty) });
		let svg = d3.select(".wealthTotalCasesGraph");
		let width = 520,
			height = 450,
			margin = 75,
			xMax = width - (margin * 2),
			yMax = height - (margin * 2);
		if (svg.empty()) {
			svg = d3.select(mainContainer)
					.append("svg")
					.attr("class","wealthTotalCasesGraph")
					.attr("width", width)
					.attr("height", height);
			// Add title to the SVG graph based on margin and calculated width for the coordination
			svg.append("text")
				.attr("class","graphTitle")
				.attr("transform", "translate(" + width/2 + "," + margin/2 + ")")
				.attr("text-anchor", "middle")
				.attr("font-size", "16px")
				.attr("font-weight", "bold");
			// Add container group for x and y axises along with their titles and bar rectangles
			svg.append("g")
				.attr("class","wealthTotalCasesGraphContainerGroup")
				.attr("transform", "translate(" + margin + "," + margin + ")");
		}
		svg.select(".graphTitle").text("COVID Cases and Population Wealth Relation");
		let x = d3.scaleBand()
					.domain(data.map(function(d) { return d.extreme_poverty; }))
					.range([0, xMax]);
		let maxValueWithMargin = d3.max(data, function(d) { return d.total_cases_per_million; });
		maxValueWithMargin += maxValueWithMargin/10;
		let y = d3.scaleLinear()
					.domain([0, maxValueWithMargin])
					.range([yMax, 0]);
		let colorScale = d3.scaleLinear().range(["blue", "red"])
							.domain([0, d3.max(data, function(d) { return d.total_cases_per_million; })]);
		// Select the container group for the x and y axises along with their titles and bar rectangles
		let g = svg.select(".wealthTotalCasesGraphContainerGroup");
		// Select and remove left and bottom old axises
		g.select(".xGroup").remove();
		g.select(".yGroup").remove();
		g.selectAll("line.horizontalGrid").remove();
		// Add container group for x bottom axis along with the axis's title
		g.append("g")
			.attr("transform", "translate(0," + yMax + ")")
			.attr("class", "xGroup")
			.call(d3.axisBottom(x).tickFormat(function(d){
						return d;
					}).tickValues(x.domain().filter(function(d,i){ return !(i%5)})))
			.selectAll("text")
				.attr("transform", "translate(-10,0)rotate(-40)")
				.style("text-anchor", "end");
		g.select(".xGroup")
			.append("text")
			.attr("y", 70)
			.attr("x", xMax/2)
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text("Poverty Level Index");
		// Add container group for y left axis along with the axis's title
		g.append("g")
			.attr("class", "yGroup")
			.call(d3.axisLeft(y).tickFormat(function(d){
					if (d != 0 && d < 1000000) {
						return (d/1000) + "K";
					}
					else if (d != 0) {
						return (d/1000000) + "M";
					}
					return d;
				}).ticks(8))
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 4)
			.attr("x", - (yMax/2))
			.attr("dy", "-5.1em")
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text("Total Cases Per Million");
		g.selectAll("line.horizontalGrid")
			.data(y.ticks(8))
			.enter()
			.append("line")
				.attr("class","horizontalGrid")
				.attr("x1" , 0)
				.attr("x2" , xMax)
				.attr("y1" , function(d){ return y(d);})
				.attr("y2" , function(d){ return y(d);})
				.attr("fill" , "none")
				.attr("stroke" , "grey")
				.attr("stroke-width" , 0.5)
				.style("stroke-opacity", 0.5);
		// For initial data binding and to ensure smooth transition
		if (g.selectAll("rect").empty()) {
			g.selectAll("rect").data(data).enter().append("rect").attr("y", y(0)).attr("height", yMax - y(0));
		}
		// Add all bar rectangles to the container group
		let bars = g.selectAll("rect").data(data);
		// Fade away the unused rectangle bars using 'exit' and 'opacity'
		bars.exit().transition().duration(500).style('opacity', 0); 
		bars.enter()
			.append("rect")
			.merge(bars)
			.on("mouseover", onMouseOver)
			.on("mouseout", onMouseOut)
			.attr("x", function(d) { return x(d.extreme_poverty); })
			.attr("width", x.bandwidth())
			.transition()
				.ease(d3.easeLinear)
				.duration(600)
				.delay(function (d, i) {
						return i * 10;
					})
				.attr("y", function(d) { return y(d.total_cases_per_million); })
				.attr("height", function(d) { return yMax - y(d.total_cases_per_million); })
				.attr("fill", function(d) { return colorScale(d.total_cases_per_million); })
				.style('opacity', 1);
		// Bar rectangle mouseover event handler function
		function onMouseOver(mouseEvent, i) {
			let xCurrent = Number(d3.select(this).attr('x'));
			let yCurrent = Number(d3.select(this).attr('y'));
			d3.select(this)
				.attr("fill", "#ffbf00")
				.transition() // adds animation
				.duration(400)
				.attr('width', x.bandwidth() + 2)
				.attr("y", function(d) { return y(d.total_cases_per_million) - 10; })
				.attr("height", function(d) { return yMax - y(d.total_cases_per_million) + 10; });
			let totalCases = (i.total_cases_per_million/1000000).toFixed(2) + "M";
			if (i.total_cases_per_million < 1000000) {
				totalCases = (i.total_cases_per_million/1000).toFixed(2) + "K";
			}
			g.append("text")
				.attr('class', 'val')
				.attr('x', xCurrent + (x.bandwidth()/2))
				.attr('y', yCurrent - 12)
				.attr("font-size", "9px")
				.attr("font-weight", "bold")
				.attr("text-anchor", "middle")
				.text(i.location + ", " + i.extreme_poverty + ", " + totalCases);
		}
		// Bar rectangle mouseout event handler function
		function onMouseOut(mouseEvent, i) {
			// Using i parameter as it holds the bounded data
			d3.select(this)
				.attr("fill", colorScale(i.total_cases_per_million))
				.transition() // adds animation
					.duration(400)
					.attr('width', x.bandwidth())
					.attr("y", y(i.total_cases_per_million))
					.attr("height", yMax - y(i.total_cases_per_million));
			g.selectAll('.val').remove();
		}
	}

	/**
	 * Compare the Wealth and Total COVID Deaths.
	 *
	 * @param {String} mainContainer - main container name where SVG will be added or updated.
	 */
	createWealthTotalDeathsGraph(mainContainer) {
		let data = mainModelCovidData.getAllCountriesLatestCovidAndExtremePovertyData();
		data.sort(function(a, b) { return d3.ascending(a.extreme_poverty, b.extreme_poverty) });
		let svg = d3.select(".wealthTotalDeathsGraph");
		let width = 520,
			height = 450,
			margin = 75,
			xMax = width - (margin * 2),
			yMax = height - (margin * 2);
		if (svg.empty()) {
			svg = d3.select(mainContainer)
					.append("svg")
					.attr("class","wealthTotalDeathsGraph")
					.attr("width", width)
					.attr("height", height);
			// Add title to the SVG graph based on margin and calculated width for the coordination
			svg.append("text")
				.attr("class","graphTitle")
				.attr("transform", "translate(" + width/2 + "," + margin/2 + ")")
				.attr("text-anchor", "middle")
				.attr("font-size", "16px")
				.attr("font-weight", "bold");
			// Add container group for x and y axises along with their titles and bar rectangles
			svg.append("g")
				.attr("class","wealthTotalDeathsGraphContainerGroup")
				.attr("transform", "translate(" + margin + "," + margin + ")");
		}
		svg.select(".graphTitle").text("COVID Deaths and Population Wealth Relation");
		let x = d3.scaleBand()
					.domain(data.map(function(d) { return d.extreme_poverty; }))
					.range([0, xMax]);
		let maxValueWithMargin = d3.max(data, function(d) { return d.new_deaths_per_million; });
		maxValueWithMargin += maxValueWithMargin/10;
		let y = d3.scaleLinear()
					.domain([0, maxValueWithMargin])
					.range([yMax, 0]);
		let colorScale = d3.scaleLinear().range(["blue", "red"])
							.domain([0, d3.max(data, function(d) { return d.new_deaths_per_million; })]);
		// Select the container group for the x and y axises along with their titles and bar rectangles
		let g = svg.select(".wealthTotalDeathsGraphContainerGroup");
		// Select and remove left and bottom old axises
		g.select(".xGroup").remove();
		g.select(".yGroup").remove();
		g.selectAll("line.horizontalGrid").remove();
		// Add container group for x bottom axis along with the axis's title
		g.append("g")
			.attr("transform", "translate(0," + yMax + ")")
			.attr("class", "xGroup")
			.call(d3.axisBottom(x).tickFormat(function(d){
						return d;
					}).tickValues(x.domain().filter(function(d,i){ return !(i%5)})))
			.selectAll("text")
				.attr("transform", "translate(-10,0)rotate(-40)")
				.style("text-anchor", "end");
		g.select(".xGroup")
			.append("text")
			.attr("y", 70)
			.attr("x", xMax/2)
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text("Poverty Level Index");
		// Add container group for y left axis along with the axis's title
		g.append("g")
			.attr("class", "yGroup")
			.call(d3.axisLeft(y).tickFormat(function(d){
					if (d != 0 && d < 1000000) {
						return (d/1000) + "K";
					}
					else if (d != 0) {
						return (d/1000000) + "M";
					}
					return d;
				}).ticks(8))
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 4)
			.attr("x", - (yMax/2))
			.attr("dy", "-5.1em")
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text("Total Deaths Per Million");
		g.selectAll("line.horizontalGrid")
			.data(y.ticks(8))
			.enter()
			.append("line")
				.attr("class","horizontalGrid")
				.attr("x1" , 0)
				.attr("x2" , xMax)
				.attr("y1" , function(d){ return y(d);})
				.attr("y2" , function(d){ return y(d);})
				.attr("fill" , "none")
				.attr("stroke" , "grey")
				.attr("stroke-width" , 0.5)
				.style("stroke-opacity", 0.5);
		// For initial data binding and to ensure smooth transition
		if (g.selectAll("rect").empty()) {
			g.selectAll("rect").data(data).enter().append("rect").attr("y", y(0)).attr("height", yMax - y(0));
		}
		// Add all bar rectangles to the container group
		let bars = g.selectAll("rect").data(data);
		// Fade away the unused rectangle bars using 'exit' and 'opacity'
		bars.exit().transition().duration(500).style('opacity', 0); 
		bars.enter()
			.append("rect")
			.merge(bars)
			.on("mouseover", onMouseOver)
			.on("mouseout", onMouseOut)
			.attr("x", function(d) { return x(d.extreme_poverty); })
			.attr("width", x.bandwidth())
			.transition()
				.ease(d3.easeLinear)
				.duration(600)
				.delay(function (d, i) {
						return i * 10;
					})
				.attr("y", function(d) { return y(d.new_deaths_per_million); })
				.attr("height", function(d) { return yMax - y(d.new_deaths_per_million); })
				.attr("fill", function(d) { return colorScale(d.new_deaths_per_million); })
				.style('opacity', 1);
		// Bar rectangle mouseover event handler function
		function onMouseOver(mouseEvent, i) {
			let xCurrent = Number(d3.select(this).attr('x'));
			let yCurrent = Number(d3.select(this).attr('y'));
			d3.select(this)
				.attr("fill", "#ffbf00")
				.transition() // adds animation
				.duration(400)
				.attr('width', x.bandwidth() + 2)
				.attr("y", function(d) { return y(d.new_deaths_per_million) - 10; })
				.attr("height", function(d) { return yMax - y(d.new_deaths_per_million) + 10; });
			let totalDeaths = (i.new_deaths_per_million/1000000).toFixed(2) + "M";
			if (i.new_deaths_per_million < 1000000) {
				totalDeaths = (i.new_deaths_per_million/1000).toFixed(2) + "K";
			}
			g.append("text")
				.attr('class', 'val')
				.attr('x', xCurrent + (x.bandwidth()/2))
				.attr('y', yCurrent - 12)
				.attr("font-size", "9px")
				.attr("font-weight", "bold")
				.attr("text-anchor", "middle")
				.text(i.location + ", " + i.extreme_poverty + ", " + totalDeaths);
		}
		// Bar rectangle mouseout event handler function
		function onMouseOut(mouseEvent, i) {
			// Using i parameter as it holds the bounded data
			d3.select(this)
				.attr("fill", colorScale(i.new_deaths_per_million))
				.transition() // adds animation
					.duration(400)
					.attr('width', x.bandwidth())
					.attr("y", y(i.new_deaths_per_million))
					.attr("height", yMax - y(i.new_deaths_per_million));
			g.selectAll('.val').remove();
		}
	}

	/**
	 * Compare the Dev Index and Total COVID Cases.
	 *
	 * @param {String} mainContainer - main container name where SVG will be added or updated.
	 */
	createDevIndexTotalCasesGraph(mainContainer) {
		let data = mainModelCovidData.getAllCountriesLatestCovidAndDevIndexData();
		data.sort(function(a, b) { return d3.ascending(a.human_development_index, b.human_development_index) });
		let svg = d3.select(".devIndexTotalCasesGraph");
		let width = 520,
			height = 450,
			margin = 75,
			xMax = width - (margin * 2),
			yMax = height - (margin * 2);
		if (svg.empty()) {
			svg = d3.select(mainContainer)
					.append("svg")
					.attr("class","devIndexTotalCasesGraph")
					.attr("width", width)
					.attr("height", height);
			// Add title to the SVG graph based on margin and calculated width for the coordination
			svg.append("text")
				.attr("class","graphTitle")
				.attr("transform", "translate(" + width/2 + "," + margin/2 + ")")
				.attr("text-anchor", "middle")
				.attr("font-size", "16px")
				.attr("font-weight", "bold");
			// Add container group for x and y axises along with their titles and bar rectangles
			svg.append("g")
				.attr("class","devIndexTotalCasesGraphContainerGroup")
				.attr("transform", "translate(" + margin + "," + margin + ")");
		}
		svg.select(".graphTitle").text("COVID Cases and Human Development Index");
		let x = d3.scaleBand()
					.domain(data.map(function(d) { return d.human_development_index; }))
					.range([0, xMax]);
		let maxValueWithMargin = d3.max(data, function(d) { return d.total_cases_per_million; });
		maxValueWithMargin += maxValueWithMargin/10;
		let y = d3.scaleLinear()
					.domain([0, maxValueWithMargin])
					.range([yMax, 0]);
		let colorScale = d3.scaleLinear().range(["blue", "red"])
							.domain([0, d3.max(data, function(d) { return d.total_cases_per_million; })]);
		// Select the container group for the x and y axises along with their titles and bar rectangles
		let g = svg.select(".devIndexTotalCasesGraphContainerGroup");
		// Select and remove left and bottom old axises
		g.select(".xGroup").remove();
		g.select(".yGroup").remove();
		g.selectAll("line.horizontalGrid").remove();
		// Add container group for x bottom axis along with the axis's title
		g.append("g")
			.attr("transform", "translate(0," + yMax + ")")
			.attr("class", "xGroup")
			.call(d3.axisBottom(x).tickFormat(function(d){
						return d;
					}).tickValues(x.domain().filter(function(d,i){ return !(i%10)})))
			.selectAll("text")
				.attr("transform", "translate(-10,0)rotate(-40)")
				.style("text-anchor", "end");
		g.select(".xGroup")
			.append("text")
			.attr("y", 70)
			.attr("x", xMax/2)
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text("Human Development Index");
		// Add container group for y left axis along with the axis's title
		g.append("g")
			.attr("class", "yGroup")
			.call(d3.axisLeft(y).tickFormat(function(d){
					if (d != 0 && d < 1000000) {
						return (d/1000) + "K";
					}
					else if (d != 0) {
						return (d/1000000) + "M";
					}
					return d;
				}).ticks(8))
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 4)
			.attr("x", - (yMax/2))
			.attr("dy", "-5.1em")
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text("Total Cases Per Million");
		g.selectAll("line.horizontalGrid")
			.data(y.ticks(8))
			.enter()
			.append("line")
				.attr("class","horizontalGrid")
				.attr("x1" , 0)
				.attr("x2" , xMax)
				.attr("y1" , function(d){ return y(d);})
				.attr("y2" , function(d){ return y(d);})
				.attr("fill" , "none")
				.attr("stroke" , "grey")
				.attr("stroke-width" , 0.5)
				.style("stroke-opacity", 0.5);
		// For initial data binding and to ensure smooth transition
		if (g.selectAll("rect").empty()) {
			g.selectAll("rect").data(data).enter().append("rect").attr("y", y(0)).attr("height", yMax - y(0));
		}
		// Add all bar rectangles to the container group
		let bars = g.selectAll("rect").data(data);
		// Fade away the unused rectangle bars using 'exit' and 'opacity'
		bars.exit().transition().duration(500).style('opacity', 0); 
		bars.enter()
			.append("rect")
			.merge(bars)
			.on("mouseover", onMouseOver)
			.on("mouseout", onMouseOut)
			.attr("x", function(d) { return x(d.human_development_index); })
			.attr("width", x.bandwidth())
			.transition()
				.ease(d3.easeLinear)
				.duration(600)
				.delay(function (d, i) {
						return i * 10;
					})
				.attr("y", function(d) { return y(d.total_cases_per_million); })
				.attr("height", function(d) { return yMax - y(d.total_cases_per_million); })
				.attr("fill", function(d) { return colorScale(d.total_cases_per_million); })
				.style('opacity', 1);
		// Bar rectangle mouseover event handler function
		function onMouseOver(mouseEvent, i) {
			let xCurrent = Number(d3.select(this).attr('x'));
			let yCurrent = Number(d3.select(this).attr('y'));
			d3.select(this)
				.attr("fill", "#ffbf00")
				.transition() // adds animation
				.duration(400)
				.attr('width', x.bandwidth() + 2)
				.attr("y", function(d) { return y(d.total_cases_per_million) - 10; })
				.attr("height", function(d) { return yMax - y(d.total_cases_per_million) + 10; });
			let totalCases = (i.total_cases_per_million/1000000).toFixed(2) + "M";
			if (i.total_cases_per_million < 1000000) {
				totalCases = (i.total_cases_per_million/1000).toFixed(2) + "K";
			}
			g.append("text")
				.attr('class', 'val')
				.attr('x', xCurrent + (x.bandwidth()/2))
				.attr('y', yCurrent - 12)
				.attr("font-size", "9px")
				.attr("font-weight", "bold")
				.attr("text-anchor", "middle")
				.text(i.location + ", " + i.human_development_index + ", " + totalCases);
		}
		// Bar rectangle mouseout event handler function
		function onMouseOut(mouseEvent, i) {
			// Using i parameter as it holds the bounded data
			d3.select(this)
				.attr("fill", colorScale(i.total_cases_per_million))
				.transition() // adds animation
					.duration(400)
					.attr('width', x.bandwidth())
					.attr("y", y(i.total_cases_per_million))
					.attr("height", yMax - y(i.total_cases_per_million));
			g.selectAll('.val').remove();
		}
	}

	/**
	 * Compare the Dev. Index and Total COVID Deaths.
	 *
	 * @param {String} mainContainer - main container name where SVG will be added or updated.
	 */
	createDevIndexTotalDeathsGraph(mainContainer) {
		let data = mainModelCovidData.getAllCountriesLatestCovidAndDevIndexData();
		data.sort(function(a, b) { return d3.ascending(a.human_development_index, b.human_development_index) });
		let svg = d3.select(".devIndexTotalDeathsGraph");
		let width = 520,
			height = 450,
			margin = 75,
			xMax = width - (margin * 2),
			yMax = height - (margin * 2);
		if (svg.empty()) {
			svg = d3.select(mainContainer)
					.append("svg")
					.attr("class","devIndexTotalDeathsGraph")
					.attr("width", width)
					.attr("height", height);
			// Add title to the SVG graph based on margin and calculated width for the coordination
			svg.append("text")
				.attr("class","graphTitle")
				.attr("transform", "translate(" + width/2 + "," + margin/2 + ")")
				.attr("text-anchor", "middle")
				.attr("font-size", "16px")
				.attr("font-weight", "bold");
			// Add container group for x and y axises along with their titles and bar rectangles
			svg.append("g")
				.attr("class","devIndexTotalDeathsGraphContainerGroup")
				.attr("transform", "translate(" + margin + "," + margin + ")");
		}
		svg.select(".graphTitle").text("COVID Deaths and Human Development Index");
		let x = d3.scaleBand()
					.domain(data.map(function(d) { return d.human_development_index; }))
					.range([0, xMax]);
		let maxValueWithMargin = d3.max(data, function(d) { return d.new_deaths_per_million; });
		maxValueWithMargin += maxValueWithMargin/10;
		let y = d3.scaleLinear()
					.domain([0, maxValueWithMargin])
					.range([yMax, 0]);
		let colorScale = d3.scaleLinear().range(["blue", "red"])
							.domain([0, d3.max(data, function(d) { return d.new_deaths_per_million; })]);
		// Select the container group for the x and y axises along with their titles and bar rectangles
		let g = svg.select(".devIndexTotalDeathsGraphContainerGroup");
		// Select and remove left and bottom old axises
		g.select(".xGroup").remove();
		g.select(".yGroup").remove();
		g.selectAll("line.horizontalGrid").remove();
		// Add container group for x bottom axis along with the axis's title
		g.append("g")
			.attr("transform", "translate(0," + yMax + ")")
			.attr("class", "xGroup")
			.call(d3.axisBottom(x).tickFormat(function(d){
						return d;
					}).tickValues(x.domain().filter(function(d,i){ return !(i%10)})))
			.selectAll("text")
				.attr("transform", "translate(-10,0)rotate(-40)")
				.style("text-anchor", "end");
		g.select(".xGroup")
			.append("text")
			.attr("y", 70)
			.attr("x", xMax/2)
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text("Human Development Index");
		// Add container group for y left axis along with the axis's title
		g.append("g")
			.attr("class", "yGroup")
			.call(d3.axisLeft(y).tickFormat(function(d){
					if (d != 0 && d < 1000000) {
						return (d/1000) + "K";
					}
					else if (d != 0) {
						return (d/1000000) + "M";
					}
					return d;
				}).ticks(8))
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 4)
			.attr("x", - (yMax/2))
			.attr("dy", "-5.1em")
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text("Total Deaths Per Million");
		g.selectAll("line.horizontalGrid")
			.data(y.ticks(8))
			.enter()
			.append("line")
				.attr("class","horizontalGrid")
				.attr("x1" , 0)
				.attr("x2" , xMax)
				.attr("y1" , function(d){ return y(d);})
				.attr("y2" , function(d){ return y(d);})
				.attr("fill" , "none")
				.attr("stroke" , "grey")
				.attr("stroke-width" , 0.5)
				.style("stroke-opacity", 0.5);
		// For initial data binding and to ensure smooth transition
		if (g.selectAll("rect").empty()) {
			g.selectAll("rect").data(data).enter().append("rect").attr("y", y(0)).attr("height", yMax - y(0));
		}
		// Add all bar rectangles to the container group
		let bars = g.selectAll("rect").data(data);
		// Fade away the unused rectangle bars using 'exit' and 'opacity'
		bars.exit().transition().duration(500).style('opacity', 0); 
		bars.enter()
			.append("rect")
			.merge(bars)
			.on("mouseover", onMouseOver)
			.on("mouseout", onMouseOut)
			.attr("x", function(d) { return x(d.human_development_index); })
			.attr("width", x.bandwidth())
			.transition()
				.ease(d3.easeLinear)
				.duration(600)
				.delay(function (d, i) {
						return i * 10;
					})
				.attr("y", function(d) { return y(d.new_deaths_per_million); })
				.attr("height", function(d) { return yMax - y(d.new_deaths_per_million); })
				.attr("fill", function(d) { return colorScale(d.new_deaths_per_million); })
				.style('opacity', 1);
		// Bar rectangle mouseover event handler function
		function onMouseOver(mouseEvent, i) {
			let xCurrent = Number(d3.select(this).attr('x'));
			let yCurrent = Number(d3.select(this).attr('y'));
			d3.select(this)
				.attr("fill", "#ffbf00")
				.transition() // adds animation
				.duration(400)
				.attr('width', x.bandwidth() + 2)
				.attr("y", function(d) { return y(d.new_deaths_per_million) - 10; })
				.attr("height", function(d) { return yMax - y(d.new_deaths_per_million) + 10; });
			let totalDeaths = (i.new_deaths_per_million/1000000).toFixed(2) + "M";
			if (i.new_deaths_per_million < 1000000) {
				totalDeaths = (i.new_deaths_per_million/1000).toFixed(2) + "K";
			}
			g.append("text")
				.attr('class', 'val')
				.attr('x', xCurrent + (x.bandwidth()/2))
				.attr('y', yCurrent - 12)
				.attr("font-size", "9px")
				.attr("font-weight", "bold")
				.attr("text-anchor", "middle")
				.text(i.location + ", " + i.human_development_index + ", " + totalDeaths);
		}
		// Bar rectangle mouseout event handler function
		function onMouseOut(mouseEvent, i) {
			// Using i parameter as it holds the bounded data
			d3.select(this)
				.attr("fill", colorScale(i.new_deaths_per_million))
				.transition() // adds animation
					.duration(400)
					.attr('width', x.bandwidth())
					.attr("y", y(i.new_deaths_per_million))
					.attr("height", yMax - y(i.new_deaths_per_million));
			g.selectAll('.val').remove();
		}
	}

	/**
	 * Compare the hand washing and Total COVID Cases.
	 *
	 * @param {String} mainContainer - main container name where SVG will be added or updated.
	 */
	createHandwashingTotalCasesGraph(mainContainer) {
		let data = mainModelCovidData.getAllCountriesLatestCovidAndHandwashingFacilitiesData();
		data.sort(function(a, b) { return d3.ascending(a.handwashing_facilities, b.handwashing_facilities) });
		let svg = d3.select(".handwashingTotalCasesGraph");
		let width = 520,
			height = 450,
			margin = 75,
			xMax = width - (margin * 2),
			yMax = height - (margin * 2);
		if (svg.empty()) {
			svg = d3.select(mainContainer)
					.append("svg")
					.attr("class","handwashingTotalCasesGraph")
					.attr("width", width)
					.attr("height", height);
			// Add title to the SVG graph based on margin and calculated width for the coordination
			svg.append("text")
				.attr("class","graphTitle")
				.attr("transform", "translate(" + width/2 + "," + margin/2 + ")")
				.attr("text-anchor", "middle")
				.attr("font-size", "16px")
				.attr("font-weight", "bold");
			// Add container group for x and y axises along with their titles and bar rectangles
			svg.append("g")
				.attr("class","handwashingTotalCasesGraphContainerGroup")
				.attr("transform", "translate(" + margin + "," + margin + ")");
		}
		svg.select(".graphTitle").text("COVID Cases and Population Handwashing Facilities");
		let x = d3.scaleBand()
					.domain(data.map(function(d) { return d.handwashing_facilities; }))
					.range([0, xMax]);
		let maxValueWithMargin = d3.max(data, function(d) { return d.total_cases_per_million; });
		maxValueWithMargin += maxValueWithMargin/10;
		let y = d3.scaleLinear()
					.domain([0, maxValueWithMargin])
					.range([yMax, 0]);
		let colorScale = d3.scaleLinear().range(["blue", "red"])
							.domain([0, d3.max(data, function(d) { return d.total_cases_per_million; })]);
		// Select the container group for the x and y axises along with their titles and bar rectangles
		let g = svg.select(".handwashingTotalCasesGraphContainerGroup");
		// Select and remove left and bottom old axises
		g.select(".xGroup").remove();
		g.select(".yGroup").remove();
		g.selectAll("line.horizontalGrid").remove();
		// Add container group for x bottom axis along with the axis's title
		g.append("g")
			.attr("transform", "translate(0," + yMax + ")")
			.attr("class", "xGroup")
			.call(d3.axisBottom(x).tickFormat(function(d){
						return d;
					}).tickValues(x.domain().filter(function(d,i){ return !(i%7)})))
			.selectAll("text")
				.attr("transform", "translate(-10,0)rotate(-40)")
				.style("text-anchor", "end");
		g.select(".xGroup")
			.append("text")
			.attr("y", 70)
			.attr("x", xMax/2)
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text("Handwashing Facilities");
		// Add container group for y left axis along with the axis's title
		g.append("g")
			.attr("class", "yGroup")
			.call(d3.axisLeft(y).tickFormat(function(d){
					if (d != 0 && d < 1000000) {
						return (d/1000) + "K";
					}
					else if (d != 0) {
						return (d/1000000) + "M";
					}
					return d;
				}).ticks(8))
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 4)
			.attr("x", - (yMax/2))
			.attr("dy", "-5.1em")
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text("Total Cases Per Million");
		g.selectAll("line.horizontalGrid")
			.data(y.ticks(8))
			.enter()
			.append("line")
				.attr("class","horizontalGrid")
				.attr("x1" , 0)
				.attr("x2" , xMax)
				.attr("y1" , function(d){ return y(d);})
				.attr("y2" , function(d){ return y(d);})
				.attr("fill" , "none")
				.attr("stroke" , "grey")
				.attr("stroke-width" , 0.5)
				.style("stroke-opacity", 0.5);
		// For initial data binding and to ensure smooth transition
		if (g.selectAll("rect").empty()) {
			g.selectAll("rect").data(data).enter().append("rect").attr("y", y(0)).attr("height", yMax - y(0));
		}
		// Add all bar rectangles to the container group
		let bars = g.selectAll("rect").data(data);
		// Fade away the unused rectangle bars using 'exit' and 'opacity'
		bars.exit().transition().duration(500).style('opacity', 0); 
		bars.enter()
			.append("rect")
			.merge(bars)
			.on("mouseover", onMouseOver)
			.on("mouseout", onMouseOut)
			.attr("x", function(d) { return x(d.handwashing_facilities); })
			.attr("width", x.bandwidth())
			.transition()
				.ease(d3.easeLinear)
				.duration(600)
				.delay(function (d, i) {
						return i * 10;
					})
				.attr("y", function(d) { return y(d.total_cases_per_million); })
				.attr("height", function(d) { return yMax - y(d.total_cases_per_million); })
				.attr("fill", function(d) { return colorScale(d.total_cases_per_million); })
				.style('opacity', 1);
		// Bar rectangle mouseover event handler function
		function onMouseOver(mouseEvent, i) {
			let xCurrent = Number(d3.select(this).attr('x'));
			let yCurrent = Number(d3.select(this).attr('y'));
			d3.select(this)
				.attr("fill", "#ffbf00")
				.transition() // adds animation
				.duration(400)
				.attr('width', x.bandwidth() + 2)
				.attr("y", function(d) { return y(d.total_cases_per_million) - 10; })
				.attr("height", function(d) { return yMax - y(d.total_cases_per_million) + 10; });
			let totalCases = (i.total_cases_per_million/1000000).toFixed(2) + "M";
			if (i.total_cases_per_million < 1000000) {
				totalCases = (i.total_cases_per_million/1000).toFixed(2) + "K";
			}
			g.append("text")
				.attr('class', 'val')
				.attr('x', xCurrent + (x.bandwidth()/2))
				.attr('y', yCurrent - 12)
				.attr("font-size", "9px")
				.attr("font-weight", "bold")
				.attr("text-anchor", "middle")
				.text(i.location + ", " + i.handwashing_facilities + ", " + totalCases);
		}
		// Bar rectangle mouseout event handler function
		function onMouseOut(mouseEvent, i) {
			// Using i parameter as it holds the bounded data
			d3.select(this)
				.attr("fill", colorScale(i.total_cases_per_million))
				.transition() // adds animation
					.duration(400)
					.attr('width', x.bandwidth())
					.attr("y", y(i.total_cases_per_million))
					.attr("height", yMax - y(i.total_cases_per_million));
			g.selectAll('.val').remove();
		}
	}

	/**
	 * Compare the hand washing and Total COVID Deaths.
	 *
	 * @param {String} mainContainer - main container name where SVG will be added or updated.
	 */
	createHandwashingTotalDeathsGraph(mainContainer) {
		let data = mainModelCovidData.getAllCountriesLatestCovidAndHandwashingFacilitiesData();
		data.sort(function(a, b) { return d3.ascending(a.handwashing_facilities, b.handwashing_facilities) });
		let svg = d3.select(".handwashingTotalDeathsGraph");
		let width = 520,
			height = 450,
			margin = 75,
			xMax = width - (margin * 2),
			yMax = height - (margin * 2);
		if (svg.empty()) {
			svg = d3.select(mainContainer)
					.append("svg")
					.attr("class","handwashingTotalDeathsGraph")
					.attr("width", width)
					.attr("height", height);
			// Add title to the SVG graph based on margin and calculated width for the coordination
			svg.append("text")
				.attr("class","graphTitle")
				.attr("transform", "translate(" + width/2 + "," + margin/2 + ")")
				.attr("text-anchor", "middle")
				.attr("font-size", "16px")
				.attr("font-weight", "bold");
			// Add container group for x and y axises along with their titles and bar rectangles
			svg.append("g")
				.attr("class","handwashingTotalDeathsGraphContainerGroup")
				.attr("transform", "translate(" + margin + "," + margin + ")");
		}
		svg.select(".graphTitle").text("COVID Deaths and Population Handwashing Facilities");
		let x = d3.scaleBand()
					.domain(data.map(function(d) { return d.handwashing_facilities; }))
					.range([0, xMax]);
		let maxValueWithMargin = d3.max(data, function(d) { return d.new_deaths_per_million; });
		maxValueWithMargin += maxValueWithMargin/10;
		let y = d3.scaleLinear()
					.domain([0, maxValueWithMargin])
					.range([yMax, 0]);
		let colorScale = d3.scaleLinear().range(["blue", "red"])
							.domain([0, d3.max(data, function(d) { return d.new_deaths_per_million; })]);
		// Select the container group for the x and y axises along with their titles and bar rectangles
		let g = svg.select(".handwashingTotalDeathsGraphContainerGroup");
		// Select and remove left and bottom old axises
		g.select(".xGroup").remove();
		g.select(".yGroup").remove();
		g.selectAll("line.horizontalGrid").remove();
		// Add container group for x bottom axis along with the axis's title
		g.append("g")
			.attr("transform", "translate(0," + yMax + ")")
			.attr("class", "xGroup")
			.call(d3.axisBottom(x).tickFormat(function(d){
						return d;
					}).tickValues(x.domain().filter(function(d,i){ return !(i%5)})))
			.selectAll("text")
				.attr("transform", "translate(-10,0)rotate(-40)")
				.style("text-anchor", "end");
		g.select(".xGroup")
			.append("text")
			.attr("y", 70)
			.attr("x", xMax/2)
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text("Handwashing Facilities");
		// Add container group for y left axis along with the axis's title
		g.append("g")
			.attr("class", "yGroup")
			.call(d3.axisLeft(y).tickFormat(function(d){
					if (d != 0 && d < 1000000) {
						return (d/1000) + "K";
					}
					else if (d != 0) {
						return (d/1000000) + "M";
					}
					return d;
				}).ticks(8))
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 4)
			.attr("x", - (yMax/2))
			.attr("dy", "-5.1em")
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text("Total Deaths Per Million");
		g.selectAll("line.horizontalGrid")
			.data(y.ticks(8))
			.enter()
			.append("line")
				.attr("class","horizontalGrid")
				.attr("x1" , 0)
				.attr("x2" , xMax)
				.attr("y1" , function(d){ return y(d);})
				.attr("y2" , function(d){ return y(d);})
				.attr("fill" , "none")
				.attr("stroke" , "grey")
				.attr("stroke-width" , 0.5)
				.style("stroke-opacity", 0.5);
		// For initial data binding and to ensure smooth transition
		if (g.selectAll("rect").empty()) {
			g.selectAll("rect").data(data).enter().append("rect").attr("y", y(0)).attr("height", yMax - y(0));
		}
		// Add all bar rectangles to the container group
		let bars = g.selectAll("rect").data(data);
		// Fade away the unused rectangle bars using 'exit' and 'opacity'
		bars.exit().transition().duration(500).style('opacity', 0); 
		bars.enter()
			.append("rect")
			.merge(bars)
			.on("mouseover", onMouseOver)
			.on("mouseout", onMouseOut)
			.attr("x", function(d) { return x(d.handwashing_facilities); })
			.attr("width", x.bandwidth())
			.transition()
				.ease(d3.easeLinear)
				.duration(600)
				.delay(function (d, i) {
						return i * 10;
					})
				.attr("y", function(d) { return y(d.new_deaths_per_million); })
				.attr("height", function(d) { return yMax - y(d.new_deaths_per_million); })
				.attr("fill", function(d) { return colorScale(d.new_deaths_per_million); })
				.style('opacity', 1);
		// Bar rectangle mouseover event handler function
		function onMouseOver(mouseEvent, i) {
			let xCurrent = Number(d3.select(this).attr('x'));
			let yCurrent = Number(d3.select(this).attr('y'));
			d3.select(this)
				.attr("fill", "#ffbf00")
				.transition() // adds animation
				.duration(400)
				.attr('width', x.bandwidth() + 2)
				.attr("y", function(d) { return y(d.new_deaths_per_million) - 10; })
				.attr("height", function(d) { return yMax - y(d.new_deaths_per_million) + 10; });
			let totalDeaths = (i.new_deaths_per_million/1000000).toFixed(2) + "M";
			if (i.new_deaths_per_million < 1000000) {
				totalDeaths = (i.new_deaths_per_million/1000).toFixed(2) + "K";
			}
			g.append("text")
				.attr('class', 'val')
				.attr('x', xCurrent + (x.bandwidth()/2))
				.attr('y', yCurrent - 12)
				.attr("font-size", "9px")
				.attr("font-weight", "bold")
				.attr("text-anchor", "middle")
				.text(i.location + ", " + i.handwashing_facilities + ", " + totalDeaths);
		}
		// Bar rectangle mouseout event handler function
		function onMouseOut(mouseEvent, i) {
			// Using i parameter as it holds the bounded data
			d3.select(this)
				.attr("fill", colorScale(i.new_deaths_per_million))
				.transition() // adds animation
					.duration(400)
					.attr('width', x.bandwidth())
					.attr("y", y(i.new_deaths_per_million))
					.attr("height", yMax - y(i.new_deaths_per_million));
			g.selectAll('.val').remove();
		}
	}

	/**
	 * Compare the Total Vaccinations and Total COVID Cases.
	 *
	 * @param {String} mainContainer - main container name where SVG will be added or updated.
	 */
	createTotalVaccinationsTotalCasesGraph(mainContainer) {
		let data = mainModelCovidData.getWorldCovidAndTotalVaccinationsData();
		data.sort(function(a, b) { return d3.ascending(a.total_vaccinations, b.total_vaccinations) });
		let svg = d3.select(".totalVaccinationsTotalCasesGraph");
		let width = 520,
			height = 450,
			margin = 75,
			xMax = width - (margin * 2),
			yMax = height - (margin * 2);
		if (svg.empty()) {
			svg = d3.select(mainContainer)
					.append("svg")
					.attr("class","totalVaccinationsTotalCasesGraph")
					.attr("width", width)
					.attr("height", height);
			// Add title to the SVG graph based on margin and calculated width for the coordination
			svg.append("text")
				.attr("class","graphTitle")
				.attr("transform", "translate(" + width/2 + "," + margin/2 + ")")
				.attr("text-anchor", "middle")
				.attr("font-size", "16px")
				.attr("font-weight", "bold");
			// Add container group for x and y axises along with their titles and bar rectangles
			svg.append("g")
				.attr("class","totalVaccinationsTotalCasesGraphContainerGroup")
				.attr("transform", "translate(" + margin + "," + margin + ")");
		}
		svg.select(".graphTitle").text("COVID Cases and Population Total Vaccinations");
		let x = d3.scaleBand()
					.domain(data.map(function(d) { return d.total_vaccinations; }))
					.range([0, xMax]);
		let maxValueWithMargin = d3.max(data, function(d) { return d.total_cases_per_million; });
		maxValueWithMargin += maxValueWithMargin/10;
		let y = d3.scaleLinear()
					.domain([0, maxValueWithMargin])
					.range([yMax, 0]);
		let colorScale = d3.scaleLinear().range(["blue", "red"])
							.domain([0, d3.max(data, function(d) { return d.total_cases_per_million; })]);
		// Select the container group for the x and y axises along with their titles and bar rectangles
		let g = svg.select(".totalVaccinationsTotalCasesGraphContainerGroup");
		// Select and remove left and bottom old axises
		g.select(".xGroup").remove();
		g.select(".yGroup").remove();
		g.selectAll("line.horizontalGrid").remove();
		// Add container group for x bottom axis along with the axis's title
		g.append("g")
			.attr("transform", "translate(0," + yMax + ")")
			.attr("class", "xGroup")
			.call(d3.axisBottom(x).tickFormat(function(d){
						if (d != 0 && d < 1000000) {
							return (d/1000).toFixed(2) + "K";
						}
						else if (d != 0) {
							return (d/1000000).toFixed(2) + "M";
						}
						return d;
					}).tickValues(x.domain().filter(function(d,i){ return !(i%25)})))
			.selectAll("text")
				.attr("transform", "translate(-10,0)rotate(-40)")
				.style("text-anchor", "end");
		g.select(".xGroup")
			.append("text")
			.attr("y", 70)
			.attr("x", xMax/2)
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text("Total Vaccinations");
		// Add container group for y left axis along with the axis's title
		g.append("g")
			.attr("class", "yGroup")
			.call(d3.axisLeft(y).tickFormat(function(d){
					if (d != 0 && d < 1000000) {
						return (d/1000) + "K";
					}
					else if (d != 0) {
						return (d/1000000) + "M";
					}
					return d;
				}).ticks(8))
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 4)
			.attr("x", - (yMax/2))
			.attr("dy", "-5.1em")
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text("Total Cases Per Million");
		g.selectAll("line.horizontalGrid")
			.data(y.ticks(8))
			.enter()
			.append("line")
				.attr("class","horizontalGrid")
				.attr("x1" , 0)
				.attr("x2" , xMax)
				.attr("y1" , function(d){ return y(d);})
				.attr("y2" , function(d){ return y(d);})
				.attr("fill" , "none")
				.attr("stroke" , "grey")
				.attr("stroke-width" , 0.5)
				.style("stroke-opacity", 0.5);
		// For initial data binding and to ensure smooth transition
		if (g.selectAll("rect").empty()) {
			g.selectAll("rect").data(data).enter().append("rect").attr("y", y(0)).attr("height", yMax - y(0));
		}
		// Add all bar rectangles to the container group
		let bars = g.selectAll("rect").data(data);
		// Fade away the unused rectangle bars using 'exit' and 'opacity'
		bars.exit().transition().duration(500).style('opacity', 0); 
		bars.enter()
			.append("rect")
			.merge(bars)
			.on("mouseover", onMouseOver)
			.on("mouseout", onMouseOut)
			.attr("x", function(d) { return x(d.total_vaccinations); })
			.attr("width", x.bandwidth())
			.transition()
				.ease(d3.easeLinear)
				.duration(600)
				.delay(function (d, i) {
						return i * 10;
					})
				.attr("y", function(d) { return y(d.total_cases_per_million); })
				.attr("height", function(d) { return yMax - y(d.total_cases_per_million); })
				.attr("fill", function(d) { return colorScale(d.total_cases_per_million); })
				.style('opacity', 1);
		// Bar rectangle mouseover event handler function
		function onMouseOver(mouseEvent, i) {
			let xCurrent = Number(d3.select(this).attr('x'));
			let yCurrent = Number(d3.select(this).attr('y'));
			d3.select(this)
				.attr("fill", "#ffbf00")
				.transition() // adds animation
				.duration(400)
				.attr('width', x.bandwidth() + 2)
				.attr("y", function(d) { return y(d.total_cases_per_million) - 10; })
				.attr("height", function(d) { return yMax - y(d.total_cases_per_million) + 10; });
			let totalCases = (i.total_cases_per_million/1000000).toFixed(2) + "M";
			if (i.total_cases_per_million < 1000000) {
				totalCases = (i.total_cases_per_million/1000).toFixed(2) + "K";
			}
			g.append("text")
				.attr('class', 'val')
				.attr('x', xCurrent + (x.bandwidth()/2))
				.attr('y', yCurrent - 12)
				.attr("font-size", "9px")
				.attr("font-weight", "bold")
				.attr("text-anchor", "middle")
				.text(i.location + ", " + i.total_vaccinations + ", " + totalCases);
		}
		// Bar rectangle mouseout event handler function
		function onMouseOut(mouseEvent, i) {
			// Using i parameter as it holds the bounded data
			d3.select(this)
				.attr("fill", colorScale(i.total_cases_per_million))
				.transition() // adds animation
					.duration(400)
					.attr('width', x.bandwidth())
					.attr("y", y(i.total_cases_per_million))
					.attr("height", yMax - y(i.total_cases_per_million));
			g.selectAll('.val').remove();
		}
	}

	/**
	 * Compare the Total Vaccinations and Total COVID Deaths.
	 *
	 * @param {String} mainContainer - main container name where SVG will be added or updated.
	 */
	createTotalVaccinationsTotalDeathsGraph(mainContainer) {
		let data = mainModelCovidData.getWorldCovidAndTotalVaccinationsData();
		data.sort(function(a, b) { return d3.ascending(a.total_vaccinations, b.total_vaccinations) });
		let svg = d3.select(".totalVaccinationsTotalDeathsGraph");
		let width = 520,
			height = 450,
			margin = 75,
			xMax = width - (margin * 2),
			yMax = height - (margin * 2);
		if (svg.empty()) {
			svg = d3.select(mainContainer)
					.append("svg")
					.attr("class","totalVaccinationsTotalDeathsGraph")
					.attr("width", width)
					.attr("height", height);
			// Add title to the SVG graph based on margin and calculated width for the coordination
			svg.append("text")
				.attr("class","graphTitle")
				.attr("transform", "translate(" + width/2 + "," + margin/2 + ")")
				.attr("text-anchor", "middle")
				.attr("font-size", "16px")
				.attr("font-weight", "bold");
			// Add container group for x and y axises along with their titles and bar rectangles
			svg.append("g")
				.attr("class","totalVaccinationsTotalDeathsGraphContainerGroup")
				.attr("transform", "translate(" + margin + "," + margin + ")");
		}
		svg.select(".graphTitle").text("COVID Deaths and Population Total Vaccinations");
		let x = d3.scaleBand()
					.domain(data.map(function(d) { return d.total_vaccinations; }))
					.range([0, xMax]);
		let maxValueWithMargin = d3.max(data, function(d) { return d.new_deaths_per_million; });
		maxValueWithMargin += maxValueWithMargin/10;
		let y = d3.scaleLinear()
					.domain([0, maxValueWithMargin])
					.range([yMax, 0]);
		let colorScale = d3.scaleLinear().range(["blue", "red"])
							.domain([0, d3.max(data, function(d) { return d.new_deaths_per_million; })]);
		// Select the container group for the x and y axises along with their titles and bar rectangles
		let g = svg.select(".totalVaccinationsTotalDeathsGraphContainerGroup");
		// Select and remove left and bottom old axises
		g.select(".xGroup").remove();
		g.select(".yGroup").remove();
		g.selectAll("line.horizontalGrid").remove();
		// Add container group for x bottom axis along with the axis's title
		g.append("g")
			.attr("transform", "translate(0," + yMax + ")")
			.attr("class", "xGroup")
			.call(d3.axisBottom(x).tickFormat(function(d){
						if (d != 0 && d < 1000000) {
							return (d/1000).toFixed(2) + "K";
						}
						else if (d != 0) {
							return (d/1000000).toFixed(2) + "M";
						}
						return d;
					}).tickValues(x.domain().filter(function(d,i){ return !(i%25)})))
			.selectAll("text")
				.attr("transform", "translate(-10,0)rotate(-40)")
				.style("text-anchor", "end");
		g.select(".xGroup")
			.append("text")
			.attr("y", 70)
			.attr("x", xMax/2)
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text("Total Vaccinations");
		// Add container group for y left axis along with the axis's title
		g.append("g")
			.attr("class", "yGroup")
			.call(d3.axisLeft(y).tickFormat(function(d){
					if (d != 0 && d < 1000000) {
						return (d/1000) + "K";
					}
					else if (d != 0) {
						return (d/1000000) + "M";
					}
					return d;
				}).ticks(8))
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 4)
			.attr("x", - (yMax/2))
			.attr("dy", "-5.1em")
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text("Total Deaths Per Million");
		g.selectAll("line.horizontalGrid")
			.data(y.ticks(8))
			.enter()
			.append("line")
				.attr("class","horizontalGrid")
				.attr("x1" , 0)
				.attr("x2" , xMax)
				.attr("y1" , function(d){ return y(d);})
				.attr("y2" , function(d){ return y(d);})
				.attr("fill" , "none")
				.attr("stroke" , "grey")
				.attr("stroke-width" , 0.5)
				.style("stroke-opacity", 0.5);
		// For initial data binding and to ensure smooth transition
		if (g.selectAll("rect").empty()) {
			g.selectAll("rect").data(data).enter().append("rect").attr("y", y(0)).attr("height", yMax - y(0));
		}
		// Add all bar rectangles to the container group
		let bars = g.selectAll("rect").data(data);
		// Fade away the unused rectangle bars using 'exit' and 'opacity'
		bars.exit().transition().duration(500).style('opacity', 0); 
		bars.enter()
			.append("rect")
			.merge(bars)
			.on("mouseover", onMouseOver)
			.on("mouseout", onMouseOut)
			.attr("x", function(d) { return x(d.total_vaccinations); })
			.attr("width", x.bandwidth())
			.transition()
				.ease(d3.easeLinear)
				.duration(600)
				.delay(function (d, i) {
						return i * 10;
					})
				.attr("y", function(d) { return y(d.new_deaths_per_million); })
				.attr("height", function(d) { return yMax - y(d.new_deaths_per_million); })
				.attr("fill", function(d) { return colorScale(d.new_deaths_per_million); })
				.style('opacity', 1);
		// Bar rectangle mouseover event handler function
		function onMouseOver(mouseEvent, i) {
			let xCurrent = Number(d3.select(this).attr('x'));
			let yCurrent = Number(d3.select(this).attr('y'));
			d3.select(this)
				.attr("fill", "#ffbf00")
				.transition() // adds animation
				.duration(400)
				.attr('width', x.bandwidth() + 2)
				.attr("y", function(d) { return y(d.new_deaths_per_million) - 10; })
				.attr("height", function(d) { return yMax - y(d.new_deaths_per_million) + 10; });
			let totalDeaths = (i.new_deaths_per_million/1000000).toFixed(2) + "M";
			if (i.new_deaths_per_million < 1000000) {
				totalDeaths = (i.new_deaths_per_million/1000).toFixed(2) + "K";
			}
			g.append("text")
				.attr('class', 'val')
				.attr('x', xCurrent + (x.bandwidth()/2))
				.attr('y', yCurrent - 12)
				.attr("font-size", "9px")
				.attr("font-weight", "bold")
				.attr("text-anchor", "middle")
				.text(i.location + ", " + i.total_vaccinations + ", " + totalDeaths);
		}
		// Bar rectangle mouseout event handler function
		function onMouseOut(mouseEvent, i) {
			// Using i parameter as it holds the bounded data
			d3.select(this)
				.attr("fill", colorScale(i.new_deaths_per_million))
				.transition() // adds animation
					.duration(400)
					.attr('width', x.bandwidth())
					.attr("y", y(i.new_deaths_per_million))
					.attr("height", yMax - y(i.new_deaths_per_million));
			g.selectAll('.val').remove();
		}
	}

	/**
	 * Compare the Total Boosters and Total COVID Cases.
	 *
	 * @param {String} mainContainer - main container name where SVG will be added or updated.
	 */
	createTotalBoostersTotalCasesGraph(mainContainer) {
		let data = mainModelCovidData.getWorldCovidAndTotalBoostersData();
		data.sort(function(a, b) { return d3.ascending(a.total_boosters, b.total_boosters) });
		let svg = d3.select(".totalBoostersTotalCasesGraph");
		let width = 520,
			height = 450,
			margin = 75,
			xMax = width - (margin * 2),
			yMax = height - (margin * 2);
		if (svg.empty()) {
			svg = d3.select(mainContainer)
					.append("svg")
					.attr("class","totalBoostersTotalCasesGraph")
					.attr("width", width)
					.attr("height", height);
			// Add title to the SVG graph based on margin and calculated width for the coordination
			svg.append("text")
				.attr("class","graphTitle")
				.attr("transform", "translate(" + width/2 + "," + margin/2 + ")")
				.attr("text-anchor", "middle")
				.attr("font-size", "16px")
				.attr("font-weight", "bold");
			// Add container group for x and y axises along with their titles and bar rectangles
			svg.append("g")
				.attr("class","totalBoostersTotalCasesGraphContainerGroup")
				.attr("transform", "translate(" + margin + "," + margin + ")");
		}
		svg.select(".graphTitle").text("COVID Cases and Population Total Boosters");
		let x = d3.scaleBand()
					.domain(data.map(function(d) { return d.total_boosters; }))
					.range([0, xMax]);
		let maxValueWithMargin = d3.max(data, function(d) { return d.total_cases_per_million; });
		maxValueWithMargin += maxValueWithMargin/10;
		let y = d3.scaleLinear()
					.domain([0, maxValueWithMargin])
					.range([yMax, 0]);
		let colorScale = d3.scaleLinear().range(["blue", "red"])
							.domain([0, d3.max(data, function(d) { return d.total_cases_per_million; })]);
		// Select the container group for the x and y axises along with their titles and bar rectangles
		let g = svg.select(".totalBoostersTotalCasesGraphContainerGroup");
		// Select and remove left and bottom old axises
		g.select(".xGroup").remove();
		g.select(".yGroup").remove();
		g.selectAll("line.horizontalGrid").remove();
		// Add container group for x bottom axis along with the axis's title
		g.append("g")
			.attr("transform", "translate(0," + yMax + ")")
			.attr("class", "xGroup")
			.call(d3.axisBottom(x).tickFormat(function(d){
						if (d != 0 && d < 1000000) {
							return (d/1000).toFixed(2) + "K";
						}
						else if (d != 0) {
							return (d/1000000).toFixed(2) + "M";
						}
						return d;
					}).tickValues(x.domain().filter(function(d,i){ return !(i%25)})))
			.selectAll("text")
				.attr("transform", "translate(-10,0)rotate(-40)")
				.style("text-anchor", "end");
		g.select(".xGroup")
			.append("text")
			.attr("y", 70)
			.attr("x", xMax/2)
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text("Total Boosters");
		// Add container group for y left axis along with the axis's title
		g.append("g")
			.attr("class", "yGroup")
			.call(d3.axisLeft(y).tickFormat(function(d){
					if (d != 0 && d < 1000000) {
						return (d/1000) + "K";
					}
					else if (d != 0) {
						return (d/1000000) + "M";
					}
					return d;
				}).ticks(8))
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 4)
			.attr("x", - (yMax/2))
			.attr("dy", "-5.1em")
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text("Total Cases Per Million");
		g.selectAll("line.horizontalGrid")
			.data(y.ticks(8))
			.enter()
			.append("line")
				.attr("class","horizontalGrid")
				.attr("x1" , 0)
				.attr("x2" , xMax)
				.attr("y1" , function(d){ return y(d);})
				.attr("y2" , function(d){ return y(d);})
				.attr("fill" , "none")
				.attr("stroke" , "grey")
				.attr("stroke-width" , 0.5)
				.style("stroke-opacity", 0.5);
		// For initial data binding and to ensure smooth transition
		if (g.selectAll("rect").empty()) {
			g.selectAll("rect").data(data).enter().append("rect").attr("y", y(0)).attr("height", yMax - y(0));
		}
		// Add all bar rectangles to the container group
		let bars = g.selectAll("rect").data(data);
		// Fade away the unused rectangle bars using 'exit' and 'opacity'
		bars.exit().transition().duration(500).style('opacity', 0); 
		bars.enter()
			.append("rect")
			.merge(bars)
			.on("mouseover", onMouseOver)
			.on("mouseout", onMouseOut)
			.attr("x", function(d) { return x(d.total_boosters); })
			.attr("width", x.bandwidth())
			.transition()
				.ease(d3.easeLinear)
				.duration(600)
				.delay(function (d, i) {
						return i * 10;
					})
				.attr("y", function(d) { return y(d.total_cases_per_million); })
				.attr("height", function(d) { return yMax - y(d.total_cases_per_million); })
				.attr("fill", function(d) { return colorScale(d.total_cases_per_million); })
				.style('opacity', 1);
		// Bar rectangle mouseover event handler function
		function onMouseOver(mouseEvent, i) {
			let xCurrent = Number(d3.select(this).attr('x'));
			let yCurrent = Number(d3.select(this).attr('y'));
			d3.select(this)
				.attr("fill", "#ffbf00")
				.transition() // adds animation
				.duration(400)
				.attr('width', x.bandwidth() + 2)
				.attr("y", function(d) { return y(d.total_cases_per_million) - 10; })
				.attr("height", function(d) { return yMax - y(d.total_cases_per_million) + 10; });
			let totalCases = (i.total_cases_per_million/1000000).toFixed(2) + "M";
			if (i.total_cases_per_million < 1000000) {
				totalCases = (i.total_cases_per_million/1000).toFixed(2) + "K";
			}
			g.append("text")
				.attr('class', 'val')
				.attr('x', xCurrent + (x.bandwidth()/2))
				.attr('y', yCurrent - 12)
				.attr("font-size", "9px")
				.attr("font-weight", "bold")
				.attr("text-anchor", "middle")
				.text(i.location + ", " + i.total_boosters + ", " + totalCases);
		}
		// Bar rectangle mouseout event handler function
		function onMouseOut(mouseEvent, i) {
			// Using i parameter as it holds the bounded data
			d3.select(this)
				.attr("fill", colorScale(i.total_cases_per_million))
				.transition() // adds animation
					.duration(400)
					.attr('width', x.bandwidth())
					.attr("y", y(i.total_cases_per_million))
					.attr("height", yMax - y(i.total_cases_per_million));
			g.selectAll('.val').remove();
		}
	}

	/**
	 * Compare the Total Boosters and Total COVID Deaths.
	 *
	 * @param {String} mainContainer - main container name where SVG will be added or updated.
	 */
	createTotalBoostersTotalDeathsGraph(mainContainer) {
		let data = mainModelCovidData.getWorldCovidAndTotalBoostersData();
		data.sort(function(a, b) { return d3.ascending(a.total_boosters, b.total_boosters) });
		let svg = d3.select(".totalBoostersTotalDeathsGraph");
		let width = 520,
			height = 450,
			margin = 75,
			xMax = width - (margin * 2),
			yMax = height - (margin * 2);
		if (svg.empty()) {
			svg = d3.select(mainContainer)
					.append("svg")
					.attr("class","totalBoostersTotalDeathsGraph")
					.attr("width", width)
					.attr("height", height);
			// Add title to the SVG graph based on margin and calculated width for the coordination
			svg.append("text")
				.attr("class","graphTitle")
				.attr("transform", "translate(" + width/2 + "," + margin/2 + ")")
				.attr("text-anchor", "middle")
				.attr("font-size", "16px")
				.attr("font-weight", "bold");
			// Add container group for x and y axises along with their titles and bar rectangles
			svg.append("g")
				.attr("class","totalBoostersTotalDeathsGraphContainerGroup")
				.attr("transform", "translate(" + margin + "," + margin + ")");
		}
		svg.select(".graphTitle").text("COVID Deaths and Population Total Boosters");
		let x = d3.scaleBand()
					.domain(data.map(function(d) { return d.total_boosters; }))
					.range([0, xMax]);
		let maxValueWithMargin = d3.max(data, function(d) { return d.new_deaths_per_million; });
		maxValueWithMargin += maxValueWithMargin/10;
		let y = d3.scaleLinear()
					.domain([0, maxValueWithMargin])
					.range([yMax, 0]);
		let colorScale = d3.scaleLinear().range(["blue", "red"])
							.domain([0, d3.max(data, function(d) { return d.new_deaths_per_million; })]);
		// Select the container group for the x and y axises along with their titles and bar rectangles
		let g = svg.select(".totalBoostersTotalDeathsGraphContainerGroup");
		// Select and remove left and bottom old axises
		g.select(".xGroup").remove();
		g.select(".yGroup").remove();
		g.selectAll("line.horizontalGrid").remove();
		// Add container group for x bottom axis along with the axis's title
		g.append("g")
			.attr("transform", "translate(0," + yMax + ")")
			.attr("class", "xGroup")
			.call(d3.axisBottom(x).tickFormat(function(d){
						if (d != 0 && d < 1000000) {
							return (d/1000).toFixed(2) + "K";
						}
						else if (d != 0) {
							return (d/1000000).toFixed(2) + "M";
						}
						return d;
					}).tickValues(x.domain().filter(function(d,i){ return !(i%25)})))
			.selectAll("text")
				.attr("transform", "translate(-10,0)rotate(-40)")
				.style("text-anchor", "end");
		g.select(".xGroup")
			.append("text")
			.attr("y", 70)
			.attr("x", xMax/2)
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text("Total Boosters");
		// Add container group for y left axis along with the axis's title
		g.append("g")
			.attr("class", "yGroup")
			.call(d3.axisLeft(y).tickFormat(function(d){
					if (d != 0 && d < 1000000) {
						return (d/1000) + "K";
					}
					else if (d != 0) {
						return (d/1000000) + "M";
					}
					return d;
				}).ticks(8))
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 4)
			.attr("x", - (yMax/2))
			.attr("dy", "-5.1em")
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text("Total Deaths Per Million");
		g.selectAll("line.horizontalGrid")
			.data(y.ticks(8))
			.enter()
			.append("line")
				.attr("class","horizontalGrid")
				.attr("x1" , 0)
				.attr("x2" , xMax)
				.attr("y1" , function(d){ return y(d);})
				.attr("y2" , function(d){ return y(d);})
				.attr("fill" , "none")
				.attr("stroke" , "grey")
				.attr("stroke-width" , 0.5)
				.style("stroke-opacity", 0.5);
		// For initial data binding and to ensure smooth transition
		if (g.selectAll("rect").empty()) {
			g.selectAll("rect").data(data).enter().append("rect").attr("y", y(0)).attr("height", yMax - y(0));
		}
		// Add all bar rectangles to the container group
		let bars = g.selectAll("rect").data(data);
		// Fade away the unused rectangle bars using 'exit' and 'opacity'
		bars.exit().transition().duration(500).style('opacity', 0); 
		bars.enter()
			.append("rect")
			.merge(bars)
			.on("mouseover", onMouseOver)
			.on("mouseout", onMouseOut)
			.attr("x", function(d) { return x(d.total_boosters); })
			.attr("width", x.bandwidth())
			.transition()
				.ease(d3.easeLinear)
				.duration(600)
				.delay(function (d, i) {
						return i * 10;
					})
				.attr("y", function(d) { return y(d.new_deaths_per_million); })
				.attr("height", function(d) { return yMax - y(d.new_deaths_per_million); })
				.attr("fill", function(d) { return colorScale(d.new_deaths_per_million); })
				.style('opacity', 1);
		// Bar rectangle mouseover event handler function
		function onMouseOver(mouseEvent, i) {
			let xCurrent = Number(d3.select(this).attr('x'));
			let yCurrent = Number(d3.select(this).attr('y'));
			d3.select(this)
				.attr("fill", "#ffbf00")
				.transition() // adds animation
				.duration(400)
				.attr('width', x.bandwidth() + 2)
				.attr("y", function(d) { return y(d.new_deaths_per_million) - 10; })
				.attr("height", function(d) { return yMax - y(d.new_deaths_per_million) + 10; });
			let totalDeaths = (i.new_deaths_per_million/1000000).toFixed(2) + "M";
			if (i.new_deaths_per_million < 1000000) {
				totalDeaths = (i.new_deaths_per_million/1000).toFixed(2) + "K";
			}
			g.append("text")
				.attr('class', 'val')
				.attr('x', xCurrent + (x.bandwidth()/2))
				.attr('y', yCurrent - 12)
				.attr("font-size", "9px")
				.attr("font-weight", "bold")
				.attr("text-anchor", "middle")
				.text(i.location + ", " + i.total_boosters + ", " + totalDeaths);
		}
		// Bar rectangle mouseout event handler function
		function onMouseOut(mouseEvent, i) {
			// Using i parameter as it holds the bounded data
			d3.select(this)
				.attr("fill", colorScale(i.new_deaths_per_million))
				.transition() // adds animation
					.duration(400)
					.attr('width', x.bandwidth())
					.attr("y", y(i.new_deaths_per_million))
					.attr("height", yMax - y(i.new_deaths_per_million));
			g.selectAll('.val').remove();
		}
	}

	/**
	 * Create dynamic graph based on the dynamic clustering K-Mean Algorithm.
	 *
	 * @param {String} mainContainer - main container name where SVG will be added or updated.
	 */
	createClusteredGraphUsingKMeans(mainContainer, clustersNumber, maxIteration, xField, yField, xFieldName, yFieldName) {
		
		let width = 850,
			height = 600,
			margin = 75,
			xMax = width - (margin * 2),
			yMax = height - (margin * 2),
			clusterCentroids = [],
			currentIteration = 1;
			
		let data = mainModelCovidData.getAllCountriesLatestCovidData();
		
		d3.select(".clusteredGraphUsingKMeans").remove();
		let svg = d3.select(mainContainer)
					.append("svg")
					.attr("class","clusteredGraphUsingKMeans")
					.attr("width", width)
					.attr("height", height);
					
		let maxXValue = d3.max(data, function(d) { return d[xField]; });
		let xScale = d3.scaleLinear()
						.domain([0, maxXValue])
						.range([0, xMax]);
						
		let maxYValue = d3.max(data, function(d) { return d[yField]; });
		let yScale = d3.scaleLinear()
						.domain([0, maxYValue])
						.range([yMax, 0]);
		let colors = d3.scaleOrdinal().range(d3.schemeSet1);
		
		for (let i = 0; i < data.length; i++) {
			data[i].x = xScale(data[i][xField]);
			data[i].y = yScale(data[i][yField]);
			data[i].clusterColor = "#ccc";
			data[i].circleClass = "country";
		}
		
		// Initialize random dimensions for clusters centroids
		for (let i = 0; i < clustersNumber; i++) {
			let point = { 
				x: Math.round(Math.random() * xMax), 
				y: Math.round(Math.random() * yMax),
				clusterColor: colors(i),
				circleClass: "clusterCentroid"
			};
			clusterCentroids.push(point);
		}
			
		var group = svg.append("g")
			.attr("transform", "translate(" + margin + "," + margin + ")");
			
		// Add container group for y left and right axis along with the axis's title
		group.append("g")
				.attr("class", "yGroup")
				.call(d3.axisLeft(yScale).tickFormat(function(d){ return getTickFormatValue(d); }).ticks(10))
				.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 8)
				.attr("x", - (yMax/2))
				.attr("dy", "-5.1em")
				.attr("text-anchor", "middle")
				.attr("fill", "black")
				.attr("font-weight", "bold")
				.text(yFieldName);
			group.append("g")
				.attr("transform", "translate(" + xMax + ",0)")
				.attr("class", "yGroup")
				.call(d3.axisRight(yScale).tickFormat(function(d){ return getTickFormatValue(d); }).ticks(10))
				.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", margin * 1.4)
				.attr("x", - (yMax/2))
				.attr("dy", "-5.1em")
				.attr("text-anchor", "middle")
				.attr("fill", "black")
				.attr("font-weight", "bold")
				.text(yFieldName);
		// Add container group for x bottom and top axis along with the axis's title
		group.append("g")
				.attr("class", "xGroup-top")
				.call(d3.axisBottom(xScale).tickFormat(function(d){ return getTickFormatValue(d); }).ticks(10))
				.selectAll("text")
				.attr("transform", "translate(12,-15)rotate(45)")
				.style("text-anchor", "end");
		group.select(".xGroup-top")
				.append("text")
				.attr("y", - 50)
				.attr("x", xMax/2)
				.attr("text-anchor", "middle")
				.attr("fill", "black")
				.attr("font-weight", "bold")
				.text(xFieldName);
		group.append("g")
				.attr("transform", "translate(0," + yMax + ")")
				.attr("class", "xGroup")
				.call(d3.axisBottom(xScale).tickFormat(function(d){ return getTickFormatValue(d); }).ticks(10))
				.selectAll("text")
				.attr("transform", "translate(-10,0)rotate(-45)")
				.style("text-anchor", "end");
		group.select(".xGroup")
				.append("text")
				.attr("y", 50)
				.attr("x", xMax/2)
				.attr("text-anchor", "middle")
				.attr("fill", "black")
				.attr("font-weight", "bold")
				.text(xFieldName);
		svg.append("g")
			.append("text")
			.attr("class", "iterationData")
			.attr("transform", "translate(" + margin + "," + (height - (margin / 4)) + ")")
			.attr("fill", "black")
			.attr("font-size", "10px")
			.attr("text-decoration", "underline")
			.text(maxIteration + " Iterations");
		
		let clusterOutput = {};
		updateClusterCirclesGraph(0);
		
		while(currentIteration < maxIteration + 1) {
			executeClusterIteration();
			currentIteration++;
		}
		
		function getTickFormatValue(d) {
			if (d != 0 && d < 1000000) {
				return (d/1000) + "K";
			}
			else if (d != 0) {
				return (d/1000000) + "M";
			}
			return d;
		}
		
		function executeClusterIteration() {
			clusterOutput = {};
			// Calculate distance and update each data point (countries) nearest cluster
			data.forEach(function(country) {
				let closestDistance = width + height;
				let closestIndex = -1;
				clusterCentroids.forEach(function(clusterCentroid, index) {
					// Calculate euclidean distance between country and cluster
					let distance = Math.sqrt(Math.pow((country.x - clusterCentroid.x), 2) + Math.pow((country.y - clusterCentroid.y), 2));;
					if (distance < closestDistance) {
						closestDistance = distance;
						closestIndex = index;
					}
				});
				country.clusterColor = clusterCentroids[closestIndex].clusterColor;
				if(!clusterOutput["<br><b>Cluster with Color " + country.clusterColor +"</b><br>"]){ clusterOutput["<br><b>Cluster with Color " + country.clusterColor +"</b><br>"] = []; };
				clusterOutput["<br><b>Cluster with Color " + country.clusterColor +"</b><br>"].push(country.location + " ");
			});
			d3.select("#ClusteredGraphUsingKMeansOutput").html(JSON.stringify(clusterOutput).replace(/{|}|#|"/g,''));
			// Update each cluster centroid x and y 
			for (let i =0; i < clusterCentroids.length; i++) {
				// Get current cluster data to calculate new center
				let currentClusterData = data.filter(country => country.clusterColor == clusterCentroids[i].clusterColor);
				// Calculate the new center of the cluster and update x and y
				clusterCentroids[i].x = d3.mean(currentClusterData, function(d) { return d.x; });
				clusterCentroids[i].y = d3.mean(currentClusterData, function(d) { return d.y; });
			}
			// Update the chart
			updateClusterCirclesGraph(currentIteration);
		}
		
		function updateClusterCirclesGraph(iterationNumber) {
			let circles = group.selectAll("circle")
								.data(data.concat(clusterCentroids));
			if(iterationNumber == 0) {
				circles.enter().append("circle")
								.attr("class", function(d) { return d.circleClass; })
								.attr("cx", function(d) { return d.x; })
								.attr("cy", function(d) { return d.y; })
								.attr("r", 5)
								.style("fill", function(d) { return d.clusterColor; });
				group.selectAll(".clusterCentroid").attr("stroke" , "black").attr("stroke-width" , 1.5);
				group.selectAll(".country")
						.on('click', function(d,i) {
								updateGraphChartLocation(i.location, 2);
							})	
						.on("mouseover", onMouseOver)
						.on("mouseout", onMouseOut);
			}
			else {
				circles.transition()
						.delay(1500 * iterationNumber)
						.duration(1000)
						.attr("cx", function(d) { return d.x; })
						.attr("cy", function(d) { return d.y; })
						.style("fill", function(d) { return d.clusterColor; });
				svg.select(".iterationData").transition()
											.delay(1500 * iterationNumber)
											.text("Iteration No. " + currentIteration + " out of " + maxIteration);
			}
			circles.exit().remove();
			function onMouseOver(mouseEvent, i) {
				let xCurrent = Number(d3.select(this).attr('x'));
				let yCurrent = Number(d3.select(this).attr('y'));
				d3.select(this).style("cursor", "pointer");
				d3.select(this).transition()
								.duration('250')
								.attr("r", 7.5)
								.attr("stroke" , "black").attr("stroke-width" , 1.5);
				group.append("text")
					.attr('class', 'val')
					.attr('x', i.x + 10)
					.attr('y', i.y)
					.attr("fill", "black")
					.style("font-size", "11")
					.text(i.location);
				group.append("line").attr("class","lineMarker").attr('x1', 0).attr('y1', i.y)
					.attr('x2', i.x - 10).attr('y2', i.y)
					.style("stroke", "black").style("stroke-dasharray", ("10, 3"))
					.style("opacity", 0.3);
				group.append("line").attr("class","lineMarker").attr('x1', i.x + 10).attr('y1', i.y)
					.attr('x2', xMax).attr('y2', i.y)
					.style("stroke", "black").style("stroke-dasharray", ("10, 3"))
					.style("opacity", 0.3);
				group.append("line").attr("class","lineMarker").attr('x1', i.x).attr('y1', i.y + 10)
					.attr('x2', i.x).attr('y2', yMax)
					.style("stroke", "black").style("stroke-dasharray", ("10, 3"))
					.style("opacity", 0.3);
				group.append("line").attr("class","lineMarker").attr('x1', i.x).attr('y1', 0)
					.attr('x2', i.x).attr('y2', i.y - 10)
					.style("stroke", "black").style("stroke-dasharray", ("10, 3"))
					.style("opacity", 0.3);
			}
			function onMouseOut(mouseEvent, i) {
				d3.select(this).style("cursor", "default");
				d3.select(this).transition()
								.duration('250')
								.attr("r", 5)
								.attr("stroke" , "black").attr("stroke-width" , 0);
				group.selectAll('.val').remove();
				group.selectAll('.lineMarker').remove();
			}
		}
	}
}