import { File } from "./file"

export interface Mileage {
	id?: string;
	user_num: number;
	user_name: string;
	department: string;
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