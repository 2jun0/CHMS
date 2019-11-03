// jsons
import mileageCode from "src/assets/json/mileageCode.json";
import majorMileageCode from "src/assets/json/majorMileageCode.json";
import minorMileageCode from "src/assets/json/minorMileageCode.json";
import collegeTypes from "src/assets/json/collegeTypes.json";
import departmentTypes from "src/assets/json/departmentTypes.json";
import { MinorMileage, MajorMileage, MileageCode } from 'src/app/model/mileage';

export function getMinorMileagesCodes(majorCode: string):MinorMileage[] {
	let minorCodes = [];

	for(var minorCode in minorMileageCode) {
		if(minorCode['major'] && minorCode['major'] == majorCode) {
			minorCodes.push(minorCode);
		}
	}

	return minorCodes;
}

export function getMileagesCodes(majorCode: string, minorCode: string):MileageCode[] {
	let mileageCodes = [];

	let str = `${majorCode}${minorCode}`;

	for(var mileageCode in mileageCode) {
		if(mileageCode['code'] && mileageCode['code'].startsWith(str)) {
			mileageCodes.push(mileageCode);
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