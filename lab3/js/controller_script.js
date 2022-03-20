var mainModelCovidData;
var mainViewD3GraphsCharts;
var latestLocation = "world";
var latestType = 0;


$(document).ready(function() {
	modelConstructor();
});

document.getElementById("main").style.display = "none";
document.getElementById("LocationDailyCasesBarGraph").style.display = "block";
document.getElementById("LocationDailyDeathsBarGraph").style.display = "block";
document.getElementById("ContinentsCasesBarGraph").style.display = "block";
document.getElementById("ContinentsDeathsBarGraph").style.display = "block";

function openGraphTab(evt, graphId) {
	var i, tabcontent, tablinks;
	tabcontent = evt.currentTarget.parentElement.parentElement.getElementsByClassName("tabcontent");
	for (i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = "none";
	}
	tablinks = evt.currentTarget.parentElement.parentElement.getElementsByClassName("tablinks");
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(" active", "");
	}
	document.getElementById(graphId).style.display = "block";
	evt.currentTarget.className += " active";
}

function updateContinentsGraph(evt, isForCases, isPerMillion) {
	let currentLocation = latestLocation;
	let currentType = latestType;
	if(latestType == 2) {
		currentLocation = mainModelCovidData.getLocationContinentName(latestLocation);
		currentType = 1;
	}
	tablinks = evt.currentTarget.parentElement.parentElement.getElementsByClassName("tablinks");
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(" active", "");
	}
	evt.currentTarget.className += " active";
	if (isForCases) {
		mainViewD3GraphsCharts.createContinentsCasesBarGraph("#ContinentsCasesBarGraph",isPerMillion,currentType,currentLocation);
	}
	else {
		mainViewD3GraphsCharts.createContinentsDeathsBarGraph("#ContinentsDeathsBarGraph",isPerMillion,currentType,currentLocation);
	}
}

function modelConstructor() {
	const promises = [d3.csv(csvCovidDataLink), d3.csv(csvCovidCodebookLink)];
	d3.csv(csvCovidDataLink).then(function(csvCovidData) {
	d3.csv(csvCovidCodebookLink).then(function(csvCovidCodebookData) {
	d3.csv(csvVaccinationsDataLink).then(function(csvVaccinationsData) {
	d3.json(worldTopologyDataLink).then(function(worldTopologyData) {
		loadAndParseData(csvCovidCodebookData, csvCovidData, csvVaccinationsData, worldTopologyData);
	}); }); });	});
}

function loadAndParseData(csvCovidCodebookData, csvCovidData, csvVaccinationsData, topologyData) {
	this.mainModelCovidData = new MainModelCovidData(csvCovidCodebookData, csvCovidData, csvVaccinationsData, topologyData);
	this.mainViewD3GraphsCharts = new MainViewD3GraphsCharts(mainModelCovidData);
	initializeApp();
}

function initializeApp() {
	document.getElementById("main").style.display = "block";
	document.getElementById("loader").style.display = "none";
	document.getElementById("loader-background").style.display = "none";
	mainViewD3GraphsCharts.createLocationMainUpdates("World","#LocationMainUpdates");
	mainViewD3GraphsCharts.createLocationDailyCasesBarGraph("World","#LocationDailyCasesBarGraph");
	mainViewD3GraphsCharts.createLocationDailyDeathsBarGraph("World","#LocationDailyDeathsBarGraph");
	mainViewD3GraphsCharts.createLocationTotalCasesLineGraph("World","#LocationTotalCasesLineGraph");
	mainViewD3GraphsCharts.createLocationTotalDeathsLineGraph("World","#LocationTotalDeathsLineGraph");
	mainViewD3GraphsCharts.createWealthTotalCasesGraph("#WealthTotalCasesLineGraph");
	mainViewD3GraphsCharts.createWealthTotalDeathsGraph("#WealthTotalDeathsLineGraph");
	mainViewD3GraphsCharts.createTotalVaccinationsTotalCasesGraph("#VaccinationsTotalCasesLineGraph");
	mainViewD3GraphsCharts.createTotalVaccinationsTotalDeathsGraph("#VaccinationsTotalDeathsLineGraph");
	mainViewD3GraphsCharts.createTotalBoostersTotalCasesGraph("#BoosterTotalCasesLineGraph");
	mainViewD3GraphsCharts.createTotalBoostersTotalDeathsGraph("#BoosterTotalDeathsLineGraph");
	mainViewD3GraphsCharts.createDevIndexTotalCasesGraph("#DevIndTotalCasesLineGraph");
	mainViewD3GraphsCharts.createDevIndexTotalDeathsGraph("#DevIndTotalDeathsLineGraph");
	mainViewD3GraphsCharts.createHandwashingTotalCasesGraph("#HandwashingTotalCasesLineGraph");
	mainViewD3GraphsCharts.createHandwashingTotalDeathsGraph("#HandwashingTotalDeathsLineGraph");
	mainViewD3GraphsCharts.createContinentsCasesBarGraph("#ContinentsCasesBarGraph",false,0,"World");
	mainViewD3GraphsCharts.createContinentsDeathsBarGraph("#ContinentsDeathsBarGraph",false,0,"World");
	mainViewD3GraphsCharts.createWorldMapGraph("#WorldMapGraph", true, true);
	executeClustering();
	updateCovidTableData("World", 0);
	updateVaccinationTableData("World", 0);
	updateLinks("World", 0);
}

function updateGraphChartLocation(location, type) {
	document.getElementById("main-d3-section").style.display = "block";
	document.getElementById("main-d3-map-section").style.display = "none";
	document.getElementById("main-d3-clustering-section").style.display = "none";
	document.getElementById("main-d3-statistics-section").style.display = "none";
	latestLocation = location;
	latestType = type;	
	let delay = (type == 2) ? 1000 : 0;
	document.getElementById('nav-links').scrollIntoView();
	mainViewD3GraphsCharts.createLocationMainUpdates(location, "#LocationMainUpdates", delay);
	mainViewD3GraphsCharts.createLocationDailyCasesBarGraph(location, "#LocationDailyCasesBarGraph");
	mainViewD3GraphsCharts.createLocationDailyDeathsBarGraph(location, "#LocationDailyDeathsBarGraph");
	mainViewD3GraphsCharts.createLocationTotalCasesLineGraph(location, "#LocationTotalCasesLineGraph");
	mainViewD3GraphsCharts.createLocationTotalDeathsLineGraph(location, "#LocationTotalDeathsLineGraph");
	updateCovidTableData(location, type);
	updateVaccinationTableData(location, type);
	updateLinks(location, type);
	if(type == 0) { // World Selected Area
		mainViewD3GraphsCharts.createContinentsCasesBarGraph("#ContinentsCasesBarGraph",false,0,"World");
		mainViewD3GraphsCharts.createContinentsDeathsBarGraph("#ContinentsCasesBarGraph",false,0,"World");
	}
	else if(type == 1) { // Continent Selected Area
		mainViewD3GraphsCharts.createContinentsCasesBarGraph("#ContinentsCasesBarGraph",false,1,location);
		mainViewD3GraphsCharts.createContinentsDeathsBarGraph("#ContinentsCasesBarGraph",false,1,location);
	}
	else if(type == 2) { // Countries Selected Area
	}
}

function showMap() {
	updateGraphChartLocation("World", 0);
	document.getElementById("main-d3-section").style.display = "none";
	document.getElementById("main-d3-map-section").style.display = "block";
	document.getElementById("main-d3-statistics-section").style.display = "none";
	document.getElementById("main-d3-clustering-section").style.display = "none";
}

function showClustering() {
	updateGraphChartLocation("World", 0);
	document.getElementById("main-d3-section").style.display = "none";
	document.getElementById("main-d3-map-section").style.display = "none";
	document.getElementById("main-d3-statistics-section").style.display = "none";
	document.getElementById("main-d3-clustering-section").style.display = "block";
}

function showGeneralStatistics() {
	updateGraphChartLocation("World", 0);
	document.getElementById("main-d3-section").style.display = "none";
	document.getElementById("main-d3-map-section").style.display = "none";
	document.getElementById("main-d3-statistics-section").style.display = "block";
	document.getElementById("main-d3-clustering-section").style.display = "none";
}

function handleMapChange() {
	let isReportedCases = (document.getElementById('flexRadioDefault1').checked) ? true : false;
	let isTotal = (document.getElementById('flexRadioDefault3').checked) ? true : false;
	let isPopulationMarker = (document.getElementById('flexSwitchCheckDefault').checked) ? true : false;
	mainViewD3GraphsCharts.createWorldMapGraph("#WorldMapGraph", isReportedCases, isTotal, isPopulationMarker);
}

function executeClustering() {
	let xField = $('#xClusterValue option:selected').val();
	let yField = $('#yClusterValue option:selected').val();
	let xFieldName = $('#xClusterValue option:selected').text();
	let yFieldName = $('#yClusterValue option:selected').text();
	let clustersNumber = $('#numCluster option:selected').val();
	let maxIteration = $('#numIteration option:selected').val();
	mainViewD3GraphsCharts.createClusteredGraphUsingKMeans("#ClusteredGraphUsingKMeans", clustersNumber, maxIteration, xField, yField, xFieldName, yFieldName);
}

function updateLinks(location, type) {
	let content = '<a href="javascript:updateGraphChartLocation(' + "'World', 0" + ')">World</a> /';
	if(type == 0) { // World Selected Area
		content += " All Continents / All Countries";
	}
	else if(type == 1) { // Continent Selected Area
		content += ' <a href="javascript:updateGraphChartLocation(' + "'" + location + "', 1" + ')">' + location + '</a>';
		content += " / All Countries";
	}
	else if(type == 2) { // Countries Selected Area
		let continentName = mainModelCovidData.getLocationContinentName(location);
		content += ' <a href="javascript:updateGraphChartLocation(' + "'" + continentName + "', 1" + ')">' + continentName + '</a> /';
		content += ' <a href="javascript:updateGraphChartLocation(' + "'" + location + "', 2" + ')">' + location + '</a>';
	}
	$("#nav-links-span").empty();
	$("#nav-links-span").append(content);
}

function updateCovidTableData(location, type){
	let data,
		showLocation = true,
		showDate = false;
	if(type == 0) { // World
		data = mainModelCovidData.getAllCountriesLatestCovidData();
	}
	else if(type == 1) { // Continent
		data = mainModelCovidData.getAllContinentCountriesLatestCovidData(location);
	}
	else if(type == 2) { // Countries
		data = mainModelCovidData.getAllLocationCovidData(location);
		showLocation = false;
		showDate = true;
	}
	var table = $('#summary-table').DataTable();
	table.destroy();
	$("#summary-table tbody").empty();
	$.each(data, function(i, data) {
		var tr = "<tr>";
		tr += "<td class='text-left'>" + data.date + "</td>";
		tr += "<td class='text-left'>" + data.location + "</td>";
		tr += "<td>" + data.total_cases + "</td>";
		if (data.new_cases > 0) {
			tr += "<td style='font-weight: bold; background-color:#ffcbaa;'>" + data.new_cases + "</td>";
		}
		else {
			tr += "<td></td>";
		}
		tr += "<td>" + data.total_deaths + "</td>";
		if (data.new_deaths > 0) {
			tr += "<td style='font-weight: bold; background-color:red; color:white;'>" + data.new_deaths + "</td>";
		}
		else {
			tr += "<td></td>";
		}
		tr += "<td>" + data.total_cases_per_million + "</td>";
		tr += "<td>" + data.new_deaths_per_million + "</td>";
		tr += "<td>" + data.population + "</td>";
		tr += "</tr>";
		$("#summary-table tbody").append(tr);
	});
	$("#summary-table").dataTable({
		"sPaginationType": "bs_four_button",
		"order": [[ 2, "desc" ]],
		"columnDefs": [
			{
				"targets": [0],
				"visible": showDate,
				"width": "12%",
				"render": function (data) {
							return (new Date(Number(data)).toLocaleDateString('en-us', {year:"numeric", month:"short", day:"numeric"}));
						  }
			},
			{
				"targets": [1],
				"width": "20%",
				"visible": showLocation,
				"render": function (data) {
							return '<a href="javascript:updateGraphChartLocation(' + "'" + data + "', 2" + ')">' + data + '</a>';
						  }
			},
			{
				"targets": [2],
				"render": function (data) {
							return Number(data).toLocaleString();
						  }
			},
			{
				"targets": [3],
				"render": function (data) {
							if(data) {
								return "+" + Number(data).toLocaleString();
							}
							return data;
						  }
			},
			{
				"targets": [4],
				"render": function (data) {
							return Number(data).toLocaleString();
						  }
			},
			{
				"targets": [5],
				"render": function (data) {
							if(data) {
								return "+" + Number(data).toLocaleString();
							}
							return data;
						  }
			},
			{
				"targets": [6],
				"render": function (data) {
							return Number(data).toLocaleString(undefined, { maximumFractionDigits: 2 });
						  }
			},
			{
				"targets": [7],
				"render": function (data) {
							return Number(data).toLocaleString();
						  }
			},
			{
				"targets": [8],
				"render": function (data) {
							return Number(data).toLocaleString();
						  }
			}
		]
	});	
	$("#summary-table").each(function(){
		var datatable = $(this);
		// SEARCH - Add the placeholder for Search and Turn this into in-line form control
		var search_input = datatable.closest('.dataTables_wrapper').find('div[id$=_filter] input');
		search_input.attr('placeholder', 'Search');
		search_input.addClass('form-control input-sm');
		// LENGTH - Inline-Form control
		var length_sel = datatable.closest('.dataTables_wrapper').find('div[id$=_length] select');
		length_sel.addClass('form-control input-sm');
	});
}
function updateVaccinationTableData(location, type){
	let data,
		showLocation = true,
		showDate = false;
	if(type == 0) { // World
		data = mainModelCovidData.getAllCountriesLatestVaccinationData();
	}
	else if(type == 1) { // Continent
		data = mainModelCovidData.getAllContinentCountriesLatestVaccinationData(location);
	}
	else if(type == 2) { // Countries
		data = mainModelCovidData.getAllLocationVaccinationData(location);
		showLocation = false;
		showDate = true;
	}
	var table = $('#vaccination-summary-table').DataTable();
	table.destroy();
	$("#vaccination-summary-table tbody").empty();
	$.each(data, function(i, data) {
		var tr = "<tr>";
		tr += "<td class='text-left'>" + data.date + "</td>";
		tr += "<td class='text-left'>" + data.location + "</td>";
		tr += "<td>" + data.people_vaccinated + "</td>";
		tr += "<td>" + data.people_fully_vaccinated + "</td>";
		tr += "<td>" + data.total_vaccinations + "</td>";
		if (data.daily_vaccinations > 0) {
			tr += "<td style='font-weight: bold; background-color:blue; color:white;'>" + data.daily_vaccinations + "</td>";
		}
		else {
			tr += "<td></td>";
		}
		if (data.daily_vaccinations_per_million > 0) {
			tr += "<td style='font-weight: bold; background-color:blue; color:white;'>" + data.daily_vaccinations_per_million + "</td>";
		}
		else {
			tr += "<td></td>";
		}
		tr += "<td>" + data.people_fully_vaccinated_per_hundred + "</td>";
		tr += "</tr>";
		$("#vaccination-summary-table tbody").append(tr);
	});
	$("#vaccination-summary-table").dataTable({
		"sPaginationType": "bs_four_button",
		"order": [[ 2, "desc" ]],
		"columnDefs": [
			{
				"targets": [0],
				"visible": showDate,
				"width": "12%",
				"render": function (data) {
							return (new Date(Number(data)).toLocaleDateString('en-us', {year:"numeric", month:"short", day:"numeric"}));
						  }
			},
			{
				"targets": [1],
				"width": "20%",
				"visible": showLocation,
				"render": function (data) {
							return '<a href="javascript:updateGraphChartLocation(' + "'" + data + "', 2" + ')">' + data + '</a>';
						  }
			},
			{
				"targets": [2],
				"render": function (data) {
							return Number(data).toLocaleString();
						  }
			},
			{
				"targets": [3],
				"render": function (data) {
							return Number(data).toLocaleString();
						  }
			},
			{
				"targets": [4],
				"render": function (data) {
							return Number(data).toLocaleString();
						  }
			},
			{
				"targets": [5],
				"render": function (data) {
							if(data) {
								return "+" + Number(data).toLocaleString();
							}
							return data;
						  }
			},
			{
				"targets": [6],
				"render": function (data) {
							if(data) {
								return "+" + Number(data).toLocaleString(undefined, { maximumFractionDigits: 2 });;
							}
							return data;
						  }
			},
			{
				"targets": [7],
				"render": function (data) {
							return Number(data).toLocaleString();
						  }
			}
		]
	});	
	$("#vaccination-summary-table").each(function(){
		var datatable = $(this);
		// SEARCH - Add the placeholder for Search and Turn this into in-line form control
		var search_input = datatable.closest('.dataTables_wrapper').find('div[id$=_filter] input');
		search_input.attr('placeholder', 'Search');
		search_input.addClass('form-control input-sm');
		// LENGTH - Inline-Form control
		var length_sel = datatable.closest('.dataTables_wrapper').find('div[id$=_length] select');
		length_sel.addClass('form-control input-sm');
	});
}