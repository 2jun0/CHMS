import { File } from "./file"

export interface Mileage {
	id?: string;
	user_num: number;
	user_name: string;
	department: string;
	year_of_study: number;
	input_date?: Date;
	code: string;
	score: number;
	act_date: {
		from: Date;
		to: Date;
	};
	detail: string;
	info_photos: File[];
	is_accepted: boolean;
	accept_date: Date;
}

export interface MileageCode { 
	id?: string;
	code: string;
	minor: string;	
	score: number;
	detail: string;
	accept_method: string;
	remark?: string;
}

export interface MinorMileage {
	code: string;
	major: MajorMileage;
	description: string;
}

export interface MajorMileage {
	code: string;
	description: string;
}