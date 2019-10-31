export interface RequestParticipation {
    id?: string,
    user_num: number,
    project_id: string,
    request_date?: Date,
    reason: string,
    is_accecpted?: boolean,
}