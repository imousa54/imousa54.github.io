const csvUAEHigherEducationDataLink = "https://raw.githubusercontent.com/imousa54/imousa54.github.io/main/data/Lab4/2020%2006%2009%20Number%20of%20Graduates%20in%20Higher%20Education.csv";
const UAETopologyDataLink = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/united-arab-emirates/united-arab-emirates.json";
		
class MainModel {
	/**
	 * MainModel constructor.
	 */
	constructor(csvUAEHigherEducationData, UAETopologyData) { 
		this.UAEHigherEducationData = { allData : [] };
		this.UAEHigherEducationMasterData = { academicYearMaster : {}, institutionTypeMaster : {"All": "All"}, campusZoneMaster : {"All": "All"}, 									   nationalityMaster : {"All": "All"}, genderMaster : {"All": "All"} };
		this.UAETopologyData = UAETopologyData;
		this.readUAEHigherEducationData(csvUAEHigherEducationData, this.UAEHigherEducationData, this.UAEHigherEducationMasterData);
	}
	
	readUAEHigherEducationData(csvUAEHigherEducationData, UAEHigherEducationData, UAEHigherEducationMasterData) {
		csvUAEHigherEducationData.forEach(function(data){
		let rowData = { Academic_Year : data.Academic_Year,
						Institution_Type_EN : data.Institution_Type_EN,
						Campus_Zone_EN : data.Campus_Zone_EN,
						Coordinates : data.Coordinates,
						LocalFlag_EN : data.LocalFlag_EN,
						Gender_EN : data.Gender_EN,
						Bachelors : convertToNumber(data.Bachelors, true),
						Certificate : convertToNumber(data.Certificate, true),
						Diploma : convertToNumber(data.Diploma, true),
						Doctorate : convertToNumber(data.Doctorate, true),
						Graduate_Certificate : convertToNumber(data['Graduate Certificate'], true),
						Graduate_Diploma : convertToNumber(data['Graduate Diploma'], true),
						Higher_Diploma : convertToNumber(data['Higher Diploma'], true),
						Masters : convertToNumber(data.Masters, true),
						Total : convertToNumber(data.Total, true)
					};
		UAEHigherEducationData.allData.push(rowData);
		if(rowData.Academic_Year && !UAEHigherEducationMasterData.academicYearMaster[rowData.Academic_Year])
			UAEHigherEducationMasterData.academicYearMaster[rowData.Academic_Year] = rowData.Academic_Year;
		if(rowData.Institution_Type_EN && !UAEHigherEducationMasterData.institutionTypeMaster[rowData.Institution_Type_EN])
			UAEHigherEducationMasterData.institutionTypeMaster[rowData.Institution_Type_EN] = rowData.Institution_Type_EN;
		if(rowData.Campus_Zone_EN && !UAEHigherEducationMasterData.campusZoneMaster[rowData.Campus_Zone_EN])
			UAEHigherEducationMasterData.campusZoneMaster[rowData.Campus_Zone_EN] = rowData.Campus_Zone_EN;
		if(rowData.LocalFlag_EN && !UAEHigherEducationMasterData.nationalityMaster[rowData.LocalFlag_EN])
			UAEHigherEducationMasterData.nationalityMaster[rowData.LocalFlag_EN] = rowData.LocalFlag_EN;
		if(rowData.Gender_EN && !UAEHigherEducationMasterData.genderMaster[rowData.Gender_EN])
			UAEHigherEducationMasterData.genderMaster[rowData.Gender_EN] = rowData.Gender_EN;
		});
		function convertToNumber(data, MakeNullZero) {
			if (data.replace(',', '').replace(' ', '')) {
				return Number(data.replace(',', '').replace(' ', ''));
			}
			else if (MakeNullZero) {
				return 0;
			}
			return 0;
		}
	}
	
	selectUAEHigherEducationData(academicYear, campusZone, genderMaster, institutionType, nationality) {
		let filteredData = {};
		for (const data of this.UAEHigherEducationData.allData) {
			if ( (academicYear == "All" ||  academicYear == data.Academic_Year) &&
				 (campusZone == "All" ||  campusZone == data.Campus_Zone_EN) &&
				 (genderMaster == "All" ||  genderMaster == data.Gender_EN) &&
				 (institutionType == "All" ||  institutionType == data.Institution_Type_EN) &&
				 (nationality == "All" ||  nationality == data.LocalFlag_EN) ) {
				if( ! filteredData[data.Campus_Zone_EN]) {
					filteredData[data.Campus_Zone_EN] = { Academic_Year : academicYear, Institution_Type_EN : institutionType, LocalFlag_EN : nationality, 										Gender_EN : genderMaster, Campus_Zone_EN : data.Campus_Zone_EN, Bachelors : 0, Certificate : 0, 									 Diploma : 0, Doctorate : 0, Graduate_Certificate : 0, Graduate_Diploma : 0, Higher_Diploma : 0, 									  Masters : 0, Total : 0 };
				}
				filteredData[data.Campus_Zone_EN].Bachelors += data.Bachelors;
				filteredData[data.Campus_Zone_EN].Certificate += data.Certificate;
				filteredData[data.Campus_Zone_EN].Diploma += data.Diploma;
				filteredData[data.Campus_Zone_EN].Doctorate += data.Doctorate;
				filteredData[data.Campus_Zone_EN].Graduate_Certificate += data.Graduate_Certificate;
				filteredData[data.Campus_Zone_EN].Graduate_Diploma += data.Graduate_Diploma;
				filteredData[data.Campus_Zone_EN].Higher_Diploma += data.Higher_Diploma;
				filteredData[data.Campus_Zone_EN].Masters += data.Masters;
				filteredData[data.Campus_Zone_EN].Total += data.Total;
			}
		}
		return filteredData;
	}
	
	selectUAEHigherEducationDataForAllAcademicYears(campusZone, genderMaster, institutionType, nationality) {
		let filteredData = {};
		for (const data of this.UAEHigherEducationData.allData) {
			if ( (campusZone == "All" ||  campusZone == data.Campus_Zone_EN) &&
				 (genderMaster == "All" ||  genderMaster == data.Gender_EN) &&
				 (institutionType == "All" ||  institutionType == data.Institution_Type_EN) &&
				 (nationality == "All" ||  nationality == data.LocalFlag_EN) ) {
				if( ! filteredData[data.Campus_Zone_EN]) {
					filteredData[data.Campus_Zone_EN] = { };
					for(const [key, value] of Object.entries(this.UAEHigherEducationMasterData.academicYearMaster)) {
						filteredData[data.Campus_Zone_EN][key] = { Academic_Year : key, Institution_Type_EN : institutionType, 											LocalFlag_EN : nationality,Gender_EN : genderMaster, Campus_Zone_EN : data.											  Campus_Zone_EN, Bachelors : 0, Certificate : 0, Diploma : 0, Doctorate : 0, 											Graduate_Certificate : 0, Graduate_Diploma : 0, Higher_Diploma : 0, Masters : 0, 
																   Total : 0 };
					}
				}
				filteredData[data.Campus_Zone_EN][data.Academic_Year].Bachelors += data.Bachelors;
				filteredData[data.Campus_Zone_EN][data.Academic_Year].Certificate += data.Certificate;
				filteredData[data.Campus_Zone_EN][data.Academic_Year].Diploma += data.Diploma;
				filteredData[data.Campus_Zone_EN][data.Academic_Year].Doctorate += data.Doctorate;
				filteredData[data.Campus_Zone_EN][data.Academic_Year].Graduate_Certificate += data.Graduate_Certificate;
				filteredData[data.Campus_Zone_EN][data.Academic_Year].Graduate_Diploma += data.Graduate_Diploma;
				filteredData[data.Campus_Zone_EN][data.Academic_Year].Higher_Diploma += data.Higher_Diploma;
				filteredData[data.Campus_Zone_EN][data.Academic_Year].Masters += data.Masters;
				filteredData[data.Campus_Zone_EN][data.Academic_Year].Total += data.Total;
			}
		}
		return filteredData;
	}
	
	selectUAEHigherEducationDataForCampusZone(academicYear, campusZone, genderMaster, institutionType, nationality) {
		let filteredData = {};
		for (const data of this.UAEHigherEducationData.allData) {
			if ( (academicYear == "All" ||  academicYear == data.Academic_Year) &&
				 (campusZone == "All" ||  campusZone == data.Campus_Zone_EN) &&
				 (genderMaster == "All" ||  genderMaster == data.Gender_EN) &&
				 (institutionType == "All" ||  institutionType == data.Institution_Type_EN) &&
				 (nationality == "All" ||  nationality == data.LocalFlag_EN) ) {
				if( ! filteredData[campusZone]) {
					filteredData[campusZone] = {  Bachelors : 0, Certificate : 0, Diploma : 0, Doctorate : 0, Graduate_Certificate : 							   0, Graduate_Diploma : 0, Higher_Diploma : 0, Masters : 0 };
				}
				filteredData[campusZone].Bachelors += data.Bachelors;
				filteredData[campusZone].Certificate += data.Certificate;
				filteredData[campusZone].Diploma += data.Diploma;
				filteredData[campusZone].Doctorate += data.Doctorate;
				filteredData[campusZone].Graduate_Certificate += data.Graduate_Certificate;
				filteredData[campusZone].Graduate_Diploma += data.Graduate_Diploma;
				filteredData[campusZone].Higher_Diploma += data.Higher_Diploma;
				filteredData[campusZone].Masters += data.Masters;
			}
		}
		return filteredData[campusZone];
	}

}