var mainModel;
var mainViewD3GraphsCharts;
var selectedCampusZone;

$(document).ready(function() {
	selectedCampusZone = "All";
	modelConstructor();
});

function modelConstructor() {
	d3.csv(csvUAEHigherEducationDataLink).then(function(csvUAEHigherEducationData) {
	d3.json(UAETopologyDataLink).then(function(UAETopologyData) {
		loadAndParseData(csvUAEHigherEducationData, UAETopologyData);
	}); });
	
}

function loadAndParseData(csvUAEHigherEducationData, UAETopologyData) {
	this.mainModel = new MainModel(csvUAEHigherEducationData, UAETopologyData);
	this.mainViewD3GraphsCharts = new MainViewD3GraphsCharts(mainModel);
	initializeApp();
}

function initializeApp() {
	document.getElementById("main").style.display = "block";
	document.getElementById("loader").style.display = "none";
	document.getElementById("loader-background").style.display = "none";
	fillDropdownLists();
	handleCriteriaChange();
	executeClustering();
}

function fillDropdownLists() {
	for(const [key, value] of Object.entries(this.mainModel.UAEHigherEducationMasterData.academicYearMaster)) {
	   let selectOption = document.createElement("option");
	   selectOption.value = key;
	   selectOption.innerHTML = value;
	   document.getElementById("academicYearSelect").appendChild(selectOption);
	}
	for(const [key, value] of Object.entries(this.mainModel.UAEHigherEducationMasterData.institutionTypeMaster)) {
	   let selectOption = document.createElement("option");
	   selectOption.value = key;
	   selectOption.innerHTML = value;
	   document.getElementById("institutionTypeSelect").appendChild(selectOption);
	}
	for(const [key, value] of Object.entries(this.mainModel.UAEHigherEducationMasterData.nationalityMaster)) {
	   let selectOption = document.createElement("option");
	   selectOption.value = key;
	   selectOption.innerHTML = value;
	   document.getElementById("nationalitySelect").appendChild(selectOption);
	}
	for(const [key, value] of Object.entries(this.mainModel.UAEHigherEducationMasterData.genderMaster)) {
	   let selectOption = document.createElement("option");
	   selectOption.value = key;
	   selectOption.innerHTML = value;
	   document.getElementById("genderSelect").appendChild(selectOption);
	}
}

function handleCriteriaChange() {
	let selectedAcademicYear = document.getElementById("academicYearSelect").value;
	let selectedInstitutionType = document.getElementById("institutionTypeSelect").value;
	let selectedNationality = document.getElementById("nationalitySelect").value;
	let selectedGender = document.getElementById("genderSelect").value;
	let selectedOutput = document.getElementById("outputSelect").value;
	let selectedOutputText = document.getElementById("outputSelect").options[document.getElementById("outputSelect").selectedIndex].text;
	mainViewD3GraphsCharts.createUAEMapGraph("#UAEMapGraph", selectedAcademicYear, selectedGender, selectedInstitutionType, selectedNationality
												, selectedOutput);
	mainViewD3GraphsCharts.createUAEGraduateEmiratesLinearGraph("#UAEGraduateEmiratesLinearGraph", selectedAcademicYear, selectedGender, 																selectedInstitutionType, selectedNationality, selectedOutput, selectedOutputText);
	mainViewD3GraphsCharts.createUAEGraduateEmiratesBarGraph("#UAEGraduateEmiratesBarGraph", selectedAcademicYear, selectedGender, selectedInstitutionType, 																selectedNationality, selectedOutput, selectedOutputText);
	mainViewD3GraphsCharts.createUAEGraduateEmiratesPieChart("#UAEGraduateEmiratesPieChart", selectedAcademicYear, selectedGender, selectedInstitutionType, 																selectedNationality, selectedCampusZone);
	updateUAEGraduateTableData(selectedAcademicYear, selectedGender, selectedInstitutionType, selectedNationality);
}

function updatePieChartCampusZone(campusZone) {
	let selectedAcademicYear = document.getElementById("academicYearSelect").value;
	let selectedInstitutionType = document.getElementById("institutionTypeSelect").value;
	let selectedNationality = document.getElementById("nationalitySelect").value;
	let selectedGender = document.getElementById("genderSelect").value;
	selectedCampusZone = campusZone;
	mainViewD3GraphsCharts.createUAEGraduateEmiratesPieChart("#UAEGraduateEmiratesPieChart", selectedAcademicYear, selectedGender, selectedInstitutionType, 																selectedNationality, selectedCampusZone);
}

function updateSelectedOutput(selectedOutput) {
	document.getElementById("outputSelect").value = selectedOutput;
	handleCriteriaChange();
}

function showMap() {
	document.getElementById("main-d3-section").style.display = "block";
	document.getElementById("main-d3-clustering-section").style.display = "none";
}

function showClustering() {
	document.getElementById("main-d3-section").style.display = "none";
	document.getElementById("main-d3-clustering-section").style.display = "block";
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

function updateUAEGraduateTableData(selectedAcademicYear, selectedGender, selectedInstitutionType, selectedNationality){
	let dataDictionary = mainModel.selectUAEHigherEducationData(selectedAcademicYear, "All", selectedGender, selectedInstitutionType, selectedNationality);
	let data = Object.keys(dataDictionary).map(function(key){ return dataDictionary[key]; });
	
	
	var table = $('#graduate-summary-table').DataTable();
	table.destroy();
	$("#graduate-summary-table tbody").empty();
	$.each(data, function(i, data) {
		var tr = "<tr>";
		tr += "<td class='text-left'>" + data.Campus_Zone_EN + "</td>";
		tr += "<td>" + data.Bachelors + "</td>";
		tr += "<td>" + data.Certificate + "</td>";
		tr += "<td>" + data.Diploma + "</td>";
		tr += "<td>" + data.Doctorate + "</td>";
		tr += "<td>" + data.Graduate_Certificate + "</td>";
		tr += "<td>" + data.Graduate_Diploma + "</td>";
		tr += "<td>" + data.Higher_Diploma + "</td>";
		tr += "<td>" + data.Masters + "</td>";
		tr += "<td>" + data.Total + "</td>";
		tr += "</tr>";
		$("#graduate-summary-table tbody").append(tr);
	});
	$("#graduate-summary-table").dataTable({
		"sPaginationType": "bs_four_button",
		"order": [[ 9, "desc" ]],
		"columnDefs": [
			{
				"targets": [0],
				"width": "20%",
				"render": function (data) { return data; }
			},
			{
				"targets": [1],
				"render": function (data) { return Number(data).toLocaleString(); }
			},
			{
				"targets": [2],
				"render": function (data) { return Number(data).toLocaleString(); }
			},
			{
				"targets": [3],
				"render": function (data) { return Number(data).toLocaleString(); }
			},
			{
				"targets": [4],
				"render": function (data) { return Number(data).toLocaleString(); }
			},
			{
				"targets": [5],
				"render": function (data) { return Number(data).toLocaleString(); }
			},
			{
				"targets": [6],
				"render": function (data) { return Number(data).toLocaleString(); }
			},
			{
				"targets": [7],
				"render": function (data) { return Number(data).toLocaleString(); }
			},
			{
				"targets": [8],
				"render": function (data) { return Number(data).toLocaleString(); }
			},
			{
				"targets": [9],
				"render": function (data) { return Number(data).toLocaleString(); }
			}
		]
	});	
	$("#graduate-summary-table").each(function(){
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