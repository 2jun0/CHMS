export interface Member{
    id?: string,
    user_num: number,
    project_id: string,
    is_leader: boolean,
    role: string,
    contribution_rate: number,
    languages: Array<Language>,
    github_url: string,
    participate_date: Date,
    total_peer_review_score: number,
    did_review_peer: boolean
}

export interface Language {
    type: string,
    total_line: number
}