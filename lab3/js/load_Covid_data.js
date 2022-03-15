const covidCodebookDictionary = {};
const covidData = {};
const vaccinationData = {};
const countryContinentData = {};
const csvCovidDataLink = "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.csv";
const csvCovidCodebookLink = "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-codebook.csv";
const csvVaccinationsDataLink = "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/vaccinations.csv";
const worldTopologyDataLink = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
var worldTopologyData;

function readCovidCodebookDictionaryData(csvCovidCodebookData) {
	csvCovidCodebookData.forEach(function(data){
		covidCodebookDictionary[data.column] = {source: data.source, category: data.category, description: data.description};
	});
}

function readCovidData(csvCovidData) {
	csvCovidData.forEach(function(data){
		let rowData = { iso_code : data.iso_code,
						continent : data.continent,
						location : data.location,
						date : Date.parse(data.date),
						total_cases : convertToNumber(data.total_cases, true),
						new_cases : convertToNumber(data.new_cases, true),
						new_cases_smoothed : convertToNumber(data.new_cases_smoothed),
						total_deaths : convertToNumber(data.total_deaths, true),
						new_deaths : convertToNumber(data.new_deaths, true),
						new_deaths_smoothed : convertToNumber(data.new_deaths_smoothed),
						total_cases_per_million : convertToNumber(data.total_cases_per_million),
						new_cases_per_million : convertToNumber(data.new_cases_per_million),
						new_cases_smoothed_per_million : convertToNumber(data.new_cases_smoothed_per_million),
						total_deaths_per_million : convertToNumber(data.total_deaths_per_million),
						new_deaths_per_million : convertToNumber(data.new_deaths_per_million),
						new_deaths_smoothed_per_million : convertToNumber(data.new_deaths_smoothed_per_million),
						reproduction_rate : convertToNumber(data.reproduction_rate),
						icu_patients : convertToNumber(data.icu_patients),
						icu_patients_per_million : convertToNumber(data.icu_patients_per_million),
						hosp_patients : convertToNumber(data.hosp_patients),
						hosp_patients_per_million : convertToNumber(data.hosp_patients_per_million),
						weekly_icu_admissions : convertToNumber(data.weekly_icu_admissions),
						weekly_icu_admissions_per_million : convertToNumber(data.weekly_icu_admissions_per_million),
						weekly_hosp_admissions : convertToNumber(data.weekly_hosp_admissions),
						weekly_hosp_admissions_per_million : convertToNumber(data.weekly_hosp_admissions_per_million),
						new_tests : convertToNumber(data.new_tests),
						total_tests : convertToNumber(data.total_tests),
						total_tests_per_thousand : convertToNumber(data.total_tests_per_thousand),
						new_tests_per_thousand : convertToNumber(data.new_tests_per_thousand),
						new_tests_smoothed : convertToNumber(data.new_tests_smoothed),
						new_tests_smoothed_per_thousand : convertToNumber(data.new_tests_smoothed_per_thousand),
						positive_rate : convertToNumber(data.positive_rate),
						tests_per_case : convertToNumber(data.tests_per_case),
						tests_units : convertToNumber(data.tests_units),
						total_vaccinations : convertToNumber(data.total_vaccinations),
						people_vaccinated : convertToNumber(data.people_vaccinated),
						people_fully_vaccinated : convertToNumber(data.people_fully_vaccinated),
						total_boosters : convertToNumber(data.total_boosters),
						new_vaccinations : convertToNumber(data.new_vaccinations),
						new_vaccinations_smoothed : convertToNumber(data.new_vaccinations_smoothed),
						total_vaccinations_per_hundred : convertToNumber(data.total_vaccinations_per_hundred),
						people_vaccinated_per_hundred : convertToNumber(data.people_vaccinated_per_hundred),
						people_fully_vaccinated_per_hundred : convertToNumber(data.people_fully_vaccinated_per_hundred),
						total_boosters_per_hundred : convertToNumber(data.total_boosters_per_hundred),
						new_vaccinations_smoothed_per_million : convertToNumber(data.new_vaccinations_smoothed_per_million),
						new_people_vaccinated_smoothed : convertToNumber(data.new_people_vaccinated_smoothed),
						new_people_vaccinated_smoothed_per_hundred : convertToNumber(data.new_people_vaccinated_smoothed_per_hundred),
						stringency_index : convertToNumber(data.stringency_index),
						population : convertToNumber(data.population),
						population_density : convertToNumber(data.population_density),
						median_age : convertToNumber(data.median_age),
						aged_65_older : convertToNumber(data.aged_65_older),
						aged_70_older : convertToNumber(data.aged_70_older),
						gdp_per_capita : convertToNumber(data.gdp_per_capita),
						extreme_poverty : convertToNumber(data.extreme_poverty),
						cardiovasc_death_rate : convertToNumber(data.cardiovasc_death_rate),
						diabetes_prevalence : convertToNumber(data.diabetes_prevalence),
						female_smokers : convertToNumber(data.female_smokers),
						male_smokers : convertToNumber(data.male_smokers),
						handwashing_facilities : convertToNumber(data.handwashing_facilities),
						hospital_beds_per_thousand : convertToNumber(data.hospital_beds_per_thousand),
						life_expectancy : convertToNumber(data.life_expectancy),
						human_development_index : convertToNumber(data.human_development_index),
						excess_mortality_cumulative_absolute : convertToNumber(data.excess_mortality_cumulative_absolute),
						excess_mortality_cumulative : convertToNumber(data.excess_mortality_cumulative),
						excess_mortality : convertToNumber(data.excess_mortality),
						excess_mortality_cumulative_per_million : convertToNumber(data.excess_mortality_cumulative_per_million)
					};
		if(data.location && data.continent) {
			countryContinentData[data.location] = data.continent;
		}			
		if( ! covidData[data.location]) {
			covidData[data.location] = { latestRecord : rowData, allRecords : [ rowData ] } 
		} else {
			if(covidData[data.location].latestRecord.date < rowData.date) {
				covidData[data.location].latestRecord = rowData;
			}
			covidData[data.location].allRecords.push(rowData);
		}
	});
}

function readVaccinationsData(csvVaccinationsData) {
	csvVaccinationsData.forEach(function(data){
	let rowData = { iso_code : data.iso_code,
					location : data.location,
					continent : countryContinentData[data.location],
					date : Date.parse(data.date),
					daily_vaccinations : convertToNumber(data.daily_vaccinations, true),
					daily_vaccinations_raw : convertToNumber(data.daily_vaccinations_raw, true),
					daily_vaccinations_per_million : convertToNumber(data.daily_vaccinations_per_million, true),
					daily_people_vaccinated_per_hundred : convertToNumber(data.daily_people_vaccinated_per_hundred, true),
					daily_people_vaccinated : convertToNumber(data.daily_people_vaccinated, true),
					total_vaccinations : convertToNumber(data.total_vaccinations, true),
					people_vaccinated : convertToNumber(data.people_vaccinated, true),
					people_fully_vaccinated : convertToNumber(data.people_fully_vaccinated, true),
					total_boosters : convertToNumber(data.total_boosters, true),
					total_vaccinations_per_hundred : convertToNumber(data.total_vaccinations_per_hundred, true),
					people_vaccinated_per_hundred : convertToNumber(data.people_vaccinated_per_hundred, true),
					people_fully_vaccinated_per_hundred : convertToNumber(data.people_fully_vaccinated_per_hundred, true),
					total_boosters_per_hundred : convertToNumber(data.total_boosters_per_hundred, true)
				};
					
		if( ! vaccinationData[data.location]) {
			vaccinationData[data.location] = { latestRecord : rowData, allRecords : [ rowData ] } 
		} else {
			if(vaccinationData[data.location].latestRecord.date < rowData.date) {
				vaccinationData[data.location].latestRecord = rowData;
			}
			vaccinationData[data.location].allRecords.push(rowData);
		}
	});
}

function getAllContinentsLatestCovidData() {
	let continents = ["Asia", "Africa", "North America", "South America", "Europe", "Oceania"];
	let allContinentLatestCovidData = [];
	for (let continentIndex in continents){
		allContinentLatestCovidData.push(covidData[continents[continentIndex]].latestRecord);
	}
	return allContinentLatestCovidData;
}

function getAllContinentCountriesLatestCovidData(continent) {
	let allContinentCountriesLatestCovidData = [];
	for (let location in covidData){
		if(covidData[location].latestRecord.continent == continent) {
			allContinentCountriesLatestCovidData.push(covidData[location].latestRecord);
		}
	}
	return allContinentCountriesLatestCovidData;
}

function getAllContinentCountriesLatestVaccinationData(continent) {
	let allContinentCountriesLatestVaccinationData = [];
	for (let location in vaccinationData){
		if(vaccinationData[location].latestRecord.continent == continent) {
			allContinentCountriesLatestVaccinationData.push(vaccinationData[location].latestRecord);
		}
	}
	return allContinentCountriesLatestVaccinationData;
}

function getContinentTop10CountriesCasesWithLatestCovidData(continent) {
	let data = [];
	for (let location in covidData){
		if(covidData[location].latestRecord.continent == continent) {
			data.push(covidData[location].latestRecord);
		}
	}
	data.sort(function(a, b) { return d3.descending(a.total_cases, b.total_cases) });
	return data.slice(0, 10);
}

function getContinentTop10CountriesDeathsWithLatestCovidData(continent) {
	let data = [];
	for (let location in covidData){
		if(covidData[location].latestRecord.continent == continent) {
			data.push(covidData[location].latestRecord);
		}
	}
	data.sort(function(a, b) { return d3.descending(a.total_deaths, b.total_deaths) });
	return data.slice(0, 10);
}

function getAllCountriesLatestCovidData() {
	let allCountriesLatestCovidData = [];
	for (let location in covidData){
		if(covidData[location].latestRecord.continent) {
			allCountriesLatestCovidData.push(covidData[location].latestRecord);
		}
	}	
	return allCountriesLatestCovidData;
}

function getAllCountriesLatestCovidAndHandwashingFacilitiesData() {
	let allCountriesLatestCovidData = [];
	for (let location in covidData){
		if(covidData[location].latestRecord.continent && covidData[location].latestRecord.handwashing_facilities > 0) {
			allCountriesLatestCovidData.push(covidData[location].latestRecord);
		}
	}	
	return allCountriesLatestCovidData;
}

function getAllCountriesLatestCovidAndDevIndexData() {
	let allCountriesLatestCovidData = [];
	for (let location in covidData){
		if(covidData[location].latestRecord.continent && covidData[location].latestRecord.human_development_index > 0) {
			allCountriesLatestCovidData.push(covidData[location].latestRecord);
		}
	}	
	return allCountriesLatestCovidData;
}

function getAllCountriesLatestCovidAndExtremePovertyData() {
	let allCountriesLatestCovidData = [];
	for (let location in covidData){
		if(covidData[location].latestRecord.continent && covidData[location].latestRecord.extreme_poverty > 0) {
			allCountriesLatestCovidData.push(covidData[location].latestRecord);
		}
	}	
	return allCountriesLatestCovidData;
}

function getAllCountriesLatestVaccinationData() {
	let allCountriesLatestVaccinationData = [];
	for (let location in vaccinationData){
		if(vaccinationData[location].latestRecord.continent) {
			allCountriesLatestVaccinationData.push(vaccinationData[location].latestRecord);
		}
	}	
	return allCountriesLatestVaccinationData;
}

function getAllLocationsLatestCovidData() {
	let allLocationsLatestCovidData = [];
	for (let location in covidData){
		allLocationsLatestCovidData.push(covidData[location].latestRecord);
	}
	return allLocationsLatestCovidData;
}

function getAllLocationCovidData(location) {
	return covidData[location].allRecords;
}

function getAllLocationVaccinationData(location) {
	return vaccinationData[location].allRecords;
}

function getLatestLocationCovidData(location) {
	return covidData[location].latestRecord;
}

function getLocationContinentName(location) {
	return covidData[location].latestRecord.continent;
}

function getAllCovidData() {
	return covidData;
}

function convertToNumber(data, MakeNullZero) {
	if (data) {
		return Number(data);
	}
	else if (MakeNullZero) {
		return 0;
	}
	return 0;
}

function readWorldTopologyData(topologyData) {
	worldTopologyData = topologyData;
	let arrayData = worldTopologyData.objects.countries.geometries;
	for(let i = 0; i < arrayData.length; i++) {
		if(arrayData[i].properties.name == "United States of America") {
			worldTopologyData.objects.countries.geometries[i].properties.name = "United States";
		}
		if(arrayData[i].properties.name == "Dem. Rep. Congo") {
			worldTopologyData.objects.countries.geometries[i].properties.name = "Congo";
		}
		if(arrayData[i].properties.name == "Dominican Rep.") {
			worldTopologyData.objects.countries.geometries[i].properties.name = "Dominican Republic";
		}
		if(arrayData[i].properties.name == "Falkland Is.") {
			worldTopologyData.objects.countries.geometries[i].properties.name = "Falkland Islands";
		}
		if(arrayData[i].properties.name == "Timor-Leste") {
			worldTopologyData.objects.countries.geometries[i].properties.name = "Timor";
		}
		if(arrayData[i].properties.name == "Central African Rep.") {
			worldTopologyData.objects.countries.geometries[i].properties.name = "Central African Republic";
		}
		if(arrayData[i].properties.name == "Eq. Guinea") {
			worldTopologyData.objects.countries.geometries[i].properties.name = "Equatorial Guinea";
		}
		if(arrayData[i].properties.name == "eSwatini") {
			worldTopologyData.objects.countries.geometries[i].properties.name = "Eswatini";
		}
		if(arrayData[i].properties.name == "Solomon Is.") {
			worldTopologyData.objects.countries.geometries[i].properties.name = "Solomon Islands";
		}
		if(arrayData[i].properties.name == "N. Cyprus") {
			worldTopologyData.objects.countries.geometries[i].properties.name = "Northern Cyprus";
		}
		if(arrayData[i].properties.name == "Bosnia and Herz.") {
			worldTopologyData.objects.countries.geometries[i].properties.name = "Bosnia and Herzegovina";
		}
		if(arrayData[i].properties.name == "S. Sudan") {
			worldTopologyData.objects.countries.geometries[i].properties.name = "South Sudan";
		}
	}
}