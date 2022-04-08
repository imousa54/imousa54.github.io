class MainViewD3GraphsCharts {
	/**
	 * MainViewD3GraphsCharts constructor.
	 */
	constructor(mainModel) { 
		this.selectedDataLabel = "";
		this.mainModel = mainModel;
	}
	
	/**
	 * Display the UAE map with selected filter criteria.
	 *
	 * @param {String} mainContainer - main container name where SVG will be added or updated.
	 */
	createUAEMapGraph(mainContainer, selectedAcademicYear, selectedGender, selectedInstitutionType, selectedNationality, selectedOutput) {
		let dataDictionary = mainModel.selectUAEHigherEducationData(selectedAcademicYear, "All", selectedGender, selectedInstitutionType, selectedNationality);
		let data = Object.keys(dataDictionary).map(function(key){ return dataDictionary[key]; });
		let emiratesDictionary = { "Abu Dhabi" : "Abu Dhabi", "Ajman" : "Ajman", "Dubay" : "Dubai", "Fujayrah" : "Fujairah", 
								   "Ras Al Khaymah" : "Ras Al Khaimah", "Sharjah" : "Sharjah", "Umm Al Qaywayn" : "Umm Al Quwain",
								   "Neutral Zone": "Neutral Zone"};
		let svg = d3.select(".UAEMapGraphSVG");
		let width = 520,
			height = 450,
			margin = 0,
			xMax = width - (margin * 2),
			yMax = height - (margin * 2),
			selectedDataLabel = this.selectedDataLabel,
			colorScale, g;
		let projection = d3.geoMercator().center([56.70,24]).scale(5000);
		let path = d3.geoPath().projection(projection);
		if (svg.empty()) {
			svg = d3.select(mainContainer)
					.append("svg")
					.attr("class","UAEMapGraphSVG")
					.attr("width", width)
					.attr("height", height);		
			g = svg.append("g");
			let mapG = g.selectAll('.pathG')
							.data(topojson.feature(this.mainModel.UAETopologyData, this.mainModel.UAETopologyData.objects.ARE_adm1).features)
							.enter()
							.append('g')
							.attr("class","pathG");
			mapG.append("path")
			   .attr("d", path)
			   .attr("fill", "grey")
			   .attr("stroke", "black")
			   .attr("stroke-width", 0.5);
			svg.append("rect").attr("x",width/3).attr("y",10).attr("width", 10).attr("height", 10).style("fill", "green").attr("stroke", "black");
			svg.append("rect").attr("x",width/3).attr("y",30).attr("width", 10).attr("height", 10).style("fill", "yellow").attr("stroke", "black");
			svg.append("text").attr("x", width/3 + 20).attr("y", 15).text("Higher Graduation Indicator").style("font-size", "12px").attr("alignment-baseline","middle");
			svg.append("text").attr("x", width/3 + 20).attr("y", 35).text("Lower Graduation Indicator").style("font-size", "12px").attr("alignment-baseline","middle");
		}
		g = svg.select("g");
		g.selectAll('.pathG')
				.on("mouseover", onMouseOver)
				.on("mouseout", onMouseOut)
				.on('click', function(mouseEvent, i) {
							if(dataDictionary[emiratesDictionary[i.properties.NAME_1]]) {
								updatePieChartCampusZone(emiratesDictionary[i.properties.NAME_1]);
							}
						});
		colorScale = d3.scaleLinear().range(["yellow", "green"])
		colorScale.domain([0, d3.max(data, function(d) { return d[selectedOutput]; })]);
		g.selectAll("path")
			.transition()
				.ease(d3.easeLinear)
				.duration(500)
				.attr("fill", function (d,i) {
							if(dataDictionary[emiratesDictionary[d.properties.NAME_1]]) {
								return colorScale(dataDictionary[emiratesDictionary[d.properties.NAME_1]][selectedOutput]);
							}
							return "grey"; }); 	
		// Path mouseover event handler function
		function onMouseOver(mouseEvent, i) {
			let xCurrent = Number(d3.select(this).attr('x'));
			let yCurrent = Number(d3.select(this).attr('y'));
			d3.select(this).style("cursor", "pointer"); 
			d3.select(this).style('opacity', 0.6); 
			d3.select(this).attr("stroke-width", 2);
			let currentPath = d3.select(this);
			g.append("text")
				.attr('class', 'nonvalselect')
				.attr('x', path.centroid(i)[0])
				.attr('y', path.centroid(i)[1])
				.attr("font-size", "17px")
				.attr("font-weight", "bold")
				.attr("text-anchor", "middle")
				.attr("stroke", "black")
				.attr("fill", "yellow")
				.style("cursor", "pointer")
				.text(function () { 
							let addData = "";
							if(dataDictionary[emiratesDictionary[i.properties.NAME_1]]) {
								addData = dataDictionary[emiratesDictionary[i.properties.NAME_1]][selectedOutput];
								if (Number(addData) >= 1000 && Number(addData) < 1000000) {
									addData = (Number(addData)/1000).toFixed(2) + "K";
								}
								else if (Number(addData) >= 1000000) {
									addData = (Number(addData)/1000000).toFixed(2) + "M";
								}
							}
							return emiratesDictionary[i.properties.NAME_1] + " " + addData; 
					});
		}
		// Path mouseout event handler function
		function onMouseOut(mouseEvent, i) {
			// Using i parameter as it holds the bounded data
			d3.select(this).style("cursor", "default");
			d3.select(this).style('opacity', 1); 
			d3.select(this).attr("stroke-width", 0.5);
			g.selectAll('.nonvalselect').remove();
		}
	}
	
	/**
	 * Display the UAE Graduate Emirates Linear Graph with selected filter criteria.
	 *
	 * @param {String} mainContainer - main container name where SVG will be added or updated.
	 */
	createUAEGraduateEmiratesLinearGraph(mainContainer, selectedAcademicYear, selectedGender, selectedInstitutionType, selectedNationality, selectedOutput, 											selectedOutputText) {
		let dataDictionary = mainModel.selectUAEHigherEducationDataForAllAcademicYears("All", selectedGender, selectedInstitutionType, selectedNationality);
		let academicYearData = Object.keys(mainModel.UAEHigherEducationMasterData.academicYearMaster)
										.map(function(key){ return mainModel.UAEHigherEducationMasterData.academicYearMaster[key]; });
		let campusZoneMasterData = Object.keys(mainModel.UAEHigherEducationMasterData.campusZoneMaster)
										.map(function(key){ return mainModel.UAEHigherEducationMasterData.campusZoneMaster[key]; });
		let myColor = d3.scaleOrdinal().domain(campusZoneMasterData).range(d3.schemeDark2);
		let allData = mainModel.UAEHigherEducationData.allData;
		let svg = d3.select(".UAEGraduateEmiratesLinearGraphSVG");
		let width = 520,
			height = 450,
			margin = 75,
			xMax = width - (margin * 2),
			yMax = height - (margin * 2);
		if (svg.empty()) {
			svg = d3.select(mainContainer)
					.append("svg")
					.attr("class","UAEGraduateEmiratesLinearGraphSVG")
					.attr("width", width)
					.attr("height", height);
			// Add container group for x and y axises along with their titles and bar rectangles
			let container = svg.append("g")
								.attr("class","UAEGraduateEmiratesLinearGraphContainerGroup")
								.attr("transform", "translate(" + margin + "," + margin + ")");
			let legendContainer = svg.append("g")
								.attr("class","UAEGraduateEmiratesLinearGraphLegendContainerGroup")
								.attr("transform", "translate(" + margin + ",0)");	
			// Create the path graph with emirates name class
			let allPathsGroupsContainer = container.append("g").attr("class","allPathsGroupsContainer");
			let index = 0;
			let x0 = 0;
			let y0 = 10;
			for (let [key, value] of Object.entries(dataDictionary)) {
				
				let pathGroup = allPathsGroupsContainer
									.append("g")
									.attr("class", key.replaceAll(" ", "_"));
				pathGroup.append("path")
							.attr("class","lineGraph")
							.attr("fill", "none");
				(index != 0 && index != 3 && index != 6) ? y0 += 20 : false;
				(index == 3 || index == 6) ? y0 = 10 : false;
				(index == 3) ? x0 = 145 : false;
				(index == 6) ? x0 = 290 : false;
				legendContainer.append("line").attr("x1",x0).attr("y1",y0).attr("x2",x0 + 25).attr("y2",y0).attr("stroke", myColor(key)).attr("stroke-width",2);
				legendContainer.append("circle").style("fill", myColor(key)).attr("r", 4).attr("cx", x0 + 12.5).attr("cy", y0);
				legendContainer.append("text").attr("x", x0 + 35).attr("y", y0).text(key).style("font-size", "12px").attr("alignment-baseline","middle");
				index += 1;
			}
		}
		let x = d3.scalePoint()
					.domain(academicYearData)
					.range([0, xMax]);
		let maxValue = 0;
		for (let [key, value] of Object.entries(dataDictionary)) {
			for (let [key1, value1] of Object.entries(value)) {
				if(value1[selectedOutput] > maxValue) {
					maxValue = value1[selectedOutput];
				}
			}
		}
		let y = d3.scaleLinear()
					.domain([0, maxValue])
					.range([yMax, 0]);
		// Select the container group for the x and y axises along with their titles
		let g = svg.select(".UAEGraduateEmiratesLinearGraphContainerGroup");
		// Select and remove left and bottom old axises
		g.select(".xGroup").remove();
		g.select(".yGroup").remove();
		g.selectAll("line.horizontalGrid").remove();
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
			.attr("y", 70)
			.attr("x", xMax/2)
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text("Academic Year");
		// Add container group for y left axis along with the axis's title
		g.append("g")
			.attr("class", "yGroup")
			.call(d3.axisLeft(y).tickFormat(function(d){
					if (d != 0 && d > 1000) {
						return (d/1000) + "K";
					}
					return d;
				}).ticks(10))
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 8)
			.attr("x", - (yMax/2))
			.attr("dy", "-5.1em")
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text(selectedOutputText);
		g.selectAll("line.horizontalGrid")
			.data(y.ticks(10))
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
		for (let [key, value] of Object.entries(dataDictionary)) {
			let data = Object.keys(value).map(function(k){ return value[k]; });
			let eGroup = g.select("." + key.replaceAll(" ", "_"));
			let ePath = eGroup.select("path");
			ePath.datum(data)
					.attr("stroke", myColor(key))
					.attr("stroke-width", 2 )
					.style("cursor", "pointer")
					.transition()
						.duration(1000)
						.attr("d", d3.line()
							.x(function(d) { return x(d.Academic_Year); })
							.y(function(d) { return y(d[selectedOutput]); })
							
						);
			let circleMarkers = eGroup.selectAll("circle").data(data).on("mouseover", onMouseOver).on("mouseout", onMouseOut);
			circleMarkers.enter()
						.append("circle")
						.merge(circleMarkers)
						.attr("r", 4)
						.style("fill", myColor(key))
						.style("stroke", "gray")
						.style("cursor", "pointer")
						.on("mouseover", onMouseOver)
						.on("mouseout", onMouseOut)
						.transition()
							.duration(1000)
							.style('opacity', function(d) {
												if(selectedAcademicYear == "All" || selectedAcademicYear == d.Academic_Year) {
													return 1;
												}
												return 0;
											})
							.attr("cx", function(d) { return x(d.Academic_Year); })
							.attr("cy", function(d) { return y(d[selectedOutput]); });
		}
		// Circle marker mouseover event handler function
		function onMouseOver(mouseEvent, i) {
			let xCurrent = Number(d3.select(this).attr('x'));
			let yCurrent = Number(d3.select(this).attr('y'));
			d3.select(this).transition()
							.duration('250')
							.attr("r", 6);
			g.append("text")
				.attr('class', 'val')
				.attr('x', x(i.Academic_Year) + 8)
				.attr('y', y(i[selectedOutput]))
				.style("font-size", "11")
				.text(i[selectedOutput]);
		}

		// Circle marker mouseout event handler function
		function onMouseOut(mouseEvent, i) {
			d3.select(this).transition()
									.duration('250')
									.attr("r", 4);
			g.selectAll('.val').remove();
		}
	}
	
	/**
	 * Compare the UAE Emirates total Graduates.
	 *
	 * Display the UAE Graduate Emirates Bar Graph with selected filter criteria.
	 *
	 * @param {String} mainContainer - main container name where SVG will be added or updated.
	 */
	createUAEGraduateEmiratesBarGraph(mainContainer, selectedAcademicYear, selectedGender, selectedInstitutionType, selectedNationality, selectedOutput, 											selectedOutputText) {
		let dataDictionary = mainModel.selectUAEHigherEducationData(selectedAcademicYear, "All", selectedGender, selectedInstitutionType, selectedNationality);
		let data = Object.keys(dataDictionary).map(function(key){ return dataDictionary[key]; });
		data.sort(function(a, b) { return d3.ascending(a.Campus_Zone_EN, b.Campus_Zone_EN) });
		let svg = d3.select(".UAEGraduateEmiratesBarGraphSVG");
		let width = 520,
			height = 450,
			margin = 75,
			xMax = width - (margin * 2),
			yMax = height - (margin * 2);
		if (svg.empty()) {
			svg = d3.select(mainContainer)
					.append("svg")
					.attr("class","UAEGraduateEmiratesBarGraphSVG")
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
				.attr("class","UAEGraduateEmiratesBarGraphContainerGroup")
				.attr("transform", "translate(" + margin + "," + margin + ")");
		}
		let graphTitle = selectedOutputText;
		if(selectedAcademicYear != "All" || selectedInstitutionType != "All" || selectedNationality != "All" || selectedGender != "All" ) {
			graphTitle += " (";
			let addedFilter = "";
			(selectedAcademicYear != "All") ? addedFilter += selectedAcademicYear : false;
			(selectedInstitutionType != "All") ? addedFilter += ", " + selectedInstitutionType : false;
			(selectedNationality != "All") ? addedFilter += ", " + selectedNationality : false;
			(selectedGender != "All") ? addedFilter += ", " + selectedGender : false;
			(addedFilter.charAt(0) === ',') ? addedFilter = addedFilter.substring(1) : false;
			graphTitle += addedFilter.trim() + ")";
		}
		svg.select(".graphTitle").text(graphTitle);
		// Select the container group for the x and y axises along with their titles and bar rectangles
		let g = svg.select(".UAEGraduateEmiratesBarGraphContainerGroup");
		g.select(".xGroup").remove();
		g.select(".yGroup").remove();
		g.selectAll("line.horizontalGrid").remove();
		var x = d3.scaleBand()
					.domain(data.map(function(d) { return d.Campus_Zone_EN; }))
					.range([0, xMax])
					.padding(0.1);
		let maxValueWithMargin = d3.max(data, function(d) { return d[selectedOutput]; });
		maxValueWithMargin += maxValueWithMargin/20;
		var y = d3.scaleLinear()
					.domain([0, maxValueWithMargin])
					.range([yMax, 0]);
		var barColorScale = d3.scaleLinear().range(["yellow", "green"])
								.domain([0, d3.max(data, function(d) { return d[selectedOutput]; })]);
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
		g.select(".xGroup").select(".xGroupTitle").text("UAE Emirates");
		// Add container group for y left axis along with the axis's title
		g.append("g")
			.attr("class", "yGroup")
			.call(d3.axisLeft(y).tickFormat(function(d){
					if (d != 0 && d > 1000) {
						return (d/1000) + "K";
					}
					return d;
				}).ticks(10))
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 8)
			.attr("x", - (yMax/2))
			.attr("dy", "-5.1em")
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.text(selectedOutputText);
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
			.on('click', function(mouseEvent, i) {
							if(i.Campus_Zone_EN) {
								updatePieChartCampusZone(i.Campus_Zone_EN);
							}
						})
			.attr("stroke","black")
			.attr("x", function(d) { return x(d.Campus_Zone_EN); })
			.transition()
				.ease(d3.easeLinear)
				.duration(600)
				.delay(function (d, i) {
						return i * 10;
					})
				.attr("y", function(d) { return y(d[selectedOutput]); })
				.attr("height", function(d) { return yMax - y(d[selectedOutput]); })
				.attr("width", x.bandwidth())
				.attr("fill", function(d) { return barColorScale(d[selectedOutput]); })
				.style('opacity', 1);
		
		// Bar rectangle mouseover event handler function
		function onMouseOver(mouseEvent, i) {
			let xCurrent = Number(d3.select(this).attr('x'));
			let yCurrent = Number(d3.select(this).attr('y'));
			d3.select(this).style("cursor", "pointer"); 
			d3.select(this)
				.attr("fill", "	#000080")
				.transition() // adds animation
				.duration(400)
				.attr("y", function(d) { return y(d[selectedOutput]) - 10; })
				.attr("height", function(d) { return yMax - y(d[selectedOutput]) + 10; });
			let total = i[selectedOutput];
			if (total > 1000) {
				total = (total/1000).toFixed(2) + "K";
			}
			g.append("text")
				.attr('class', 'val')
				.attr('x', xCurrent + (x.bandwidth()/2))
				.attr('y', yCurrent - 12)
				.attr("font-size", "9px")
				.attr("font-weight", "bold")
				.attr("text-anchor", "middle")
				.text(total); // Value of the text
		}
		// Bar rectangle mouseout event handler function
		function onMouseOut(mouseEvent, i) {
			// Using i parameter as it holds the bounded data
			d3.select(this)
				.attr("fill", barColorScale(i[selectedOutput]))
				.transition() // adds animation
					.duration(400)
					.attr("y", y(i[selectedOutput]))
					.attr("height", yMax - y(i[selectedOutput]));
			d3.select(this).style("cursor", "default");
			g.selectAll('.val').remove();
		}
	}
	
	/**
	 * Compare the Campus Zone (Emirates) total Graduates.
	 *
	 * Display the Campus Zone (Emirates) total Graduates Pie Graph with selected filter criteria.
	 *
	 * @param {String} mainContainer - main container name where SVG will be added or updated.
	 */
	createUAEGraduateEmiratesPieChart(mainContainer, selectedAcademicYear, selectedGender, selectedInstitutionType, selectedNationality, selectedCampusZone) {
		let dataDictionary = mainModel.selectUAEHigherEducationDataForCampusZone(selectedAcademicYear, selectedCampusZone, selectedGender
																					, selectedInstitutionType, selectedNationality);
		let dataLabels = Object.keys(dataDictionary)
		let data = Object.keys(dataDictionary).map(function(key){ return dataDictionary[key]; });
		let svg = d3.select(".UAEGraduateEmiratesPieChartSVG");
		let width = 520,
			height = 450,
			margin = 75,
			xMax = width - (margin * 2),
			yMax = height - (margin * 2),
			radius = Math.min(xMax, yMax) / 1.4;
		let color = d3.scaleOrdinal().range(d3.schemeSet3);
		if (svg.empty()) {
			svg = d3.select(mainContainer)
					.append("svg")
					.attr("class","UAEGraduateEmiratesPieChartSVG")
					.attr("width", width)
					.attr("height", height);
			// Add title to the SVG graph based on margin and calculated width for the coordination
			svg.append("text")
				.attr("class","graphTitle")
				.attr("transform", "translate(" + width/2 + "," + margin/2 + ")")
				.attr("text-anchor", "middle")
				.attr("font-size", "16px")
				.attr("font-weight", "bold");
			// Add container group for Pie Chart
			svg.append("g")
				.attr("class","UAEGraduateEmiratesPieChartContainerGroup")
				.attr("transform", "translate(" + width/2 + "," + height/2 + ")");
			addLegend(0,0,height-margin+40);
			addLegend(1,0,height-margin+60);
			addLegend(2,125,height-margin+40);
			addLegend(3,125,height-margin+60);
			addLegend(6,250,height-margin+40);
			addLegend(7,250,height-margin+60);
			addLegend(4,375,height-margin+40);
			addLegend(5,375,height-margin+60);
		}
		let graphTitle = (selectedCampusZone == "All") ? "UAE Graduates" : selectedCampusZone + " Graduates";
		if(selectedAcademicYear != "All" || selectedInstitutionType != "All" || selectedNationality != "All" || selectedGender != "All" ) {
			graphTitle += " (";
			let addedFilter = "";
			(selectedAcademicYear != "All") ? addedFilter += selectedAcademicYear : false;
			(selectedInstitutionType != "All") ? addedFilter += ", " + selectedInstitutionType : false;
			(selectedNationality != "All") ? addedFilter += ", " + selectedNationality : false;
			(selectedGender != "All") ? addedFilter += ", " + selectedGender : false;
			(addedFilter.charAt(0) === ',') ? addedFilter = addedFilter.substring(1) : false;
			graphTitle += addedFilter.trim() + ")";
		}
		svg.select(".graphTitle").text(graphTitle);
		// Select the container group for the x and y axises along with their titles and bar rectangles
		let g = svg.select(".UAEGraduateEmiratesPieChartContainerGroup");
		// Generate the pie
		let pie = d3.pie().sort(null);
		// Generate the arcs
		let arc = d3.arc()
					.innerRadius(radius - 100)
					.outerRadius(radius - 50);
		let textArc = d3.arc()
					.innerRadius(radius)
					.outerRadius(radius);
		// Map the data to the current group paths
		g.selectAll("path")
			.data(pie(data))
			.enter()
			.append("path")
			.attr("fill", function(d, i) { return color(i); });
		// Do the transition from the previous to the selected data
		g.selectAll("path")
			.data(pie(data))
			.on("mouseover", onMouseOver)
			.on("mouseout", onMouseOut)
			.on('click', function(mouseEvent, i) {
							if(dataLabels[i.index]) {
								updateSelectedOutput(dataLabels[i.index]);
							}
						})
			.transition()
			.duration(1000)
			.attrTween("d", function(d) {
				let currentPath = this;
				let i = d3.interpolate(currentPath._current, d);
				return function(t) {
					currentPath._current = i(t);
					return arc(currentPath._current);
				};     
			});
		// Mouseover event handler function
		function onMouseOver(mouseEvent, i) {
			d3.select(this).style("cursor", "pointer").attr("stroke","black"); 
			let total = i.data;
			if (total > 1000) {
				total = (total/1000).toFixed(2) + "K";
			}
			svg.append("text")
				.attr('class', 'val')
				.attr('x', width/2)
				.attr('y', height/2)
				.attr("font-size", "16px")
				.attr("font-weight", "bold")
				.attr("text-anchor", "middle")
				.text(dataLabels[i.index].replace("_"," "));
			svg.append("text")
				.attr('class', 'val')
				.attr('x', width/2)
				.attr('y', height/2 + 20)
				.attr("font-size", "14px")
				.attr("font-weight", "bold")
				.attr("text-anchor", "middle")
				.text(total);
		}
		// Mouseout event handler function
		function onMouseOut(mouseEvent, i) {
			d3.select(this).style("cursor", "default").attr("stroke","none");
			svg.selectAll('.val').remove();
		}
		function addLegend(i,x,y){
			svg.append("rect").attr("x",x).attr("y",y-6).attr("width", 10).attr("height", 10).style("fill", color(i)).attr("stroke", "black");
			svg.append("text").attr("x",x+20).attr("y",y).text(dataLabels[i].replace("_"," ")).style("font-size", "12px").attr("alignment-baseline","middle");
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
		
		let dataDictionary = mainModel.selectUAEHigherEducationData("All", "All", "All", "All", "All");
		let data = Object.keys(dataDictionary).map(function(key){ return dataDictionary[key]; });
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
				clusterOutput["<br><b>Cluster with Color " + country.clusterColor +"</b><br>"].push(country.Campus_Zone_EN + " ");
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
								updateGraphChartLocation(i.Campus_Zone_EN, 2);
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
					.text(i.Campus_Zone_EN);
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