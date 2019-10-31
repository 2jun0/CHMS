export interface PeerReview{
	id?: string,
	project_id: string,
	reviewer_user_num: number,
	target_user_num: number,
	review_date: Date,
	position: Position,
	total_score: number
}

export interface Position{
	p1: number,
	p2: number,
	p3: number,
	p4: number,
	p5: number,
	p6: number,
	p7: number,
	p8: number,
	p9: number,
	p10: number
}