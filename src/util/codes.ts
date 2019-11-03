// jsons
import mileageCode from "src/assets/json/mileageCode.json";
import majorMileageCode from "src/assets/json/majorMileageCode.json";
import minorMileageCode from "src/assets/json/minorMileageCode.json";
import collegeTypes from "src/assets/json/collegeTypes.json";
import departmentTypes from "src/assets/json/departmentTypes.json";
import { MinorMileage, MajorMileage, MileageCode } from 'src/app/model/mileage';

export function getMinorMileagesCodes(majorCode: string) {
	let minorCodes = {};

	for(var key in minorMileageCode) {
		let minorCode = minorMileageCode[key];
		if(minorCode['major'] && minorCode['major'] == majorCode) {
			minorCodes[key] = minorCode;
		}
	}

	return minorCodes;
}

export function getMileagesCodes(majorCode: string, minorCode: string) {
	let mileageCodes = {};

	let str = `${minorCode}`//`${majorCode}${minorCode}`;

	for(var key in mileageCode) {
		let code = mileageCode[key];
		if(code['code'] && code['code'].startsWith(str)) {
			mileageCodes[key] = code;
		}
	}

	return mileageCodes;
}

export function getDepartmentTypes(collegeType: string) {
	let results = {};

	for(var key in departmentTypes) {
		var departmentType = departmentTypes[key];
		if(departmentType['college_type'] == collegeType) {
			results[key] = departmentType;
		}
	}

	return results;
}