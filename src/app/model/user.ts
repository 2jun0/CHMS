export interface User {
    id?: string,
    user_num: number,
    user_type: string,
    password?: string,
    join_date?: Date,
    name: string
}

export interface AdminUser extends User {
    // nothing special
}

export interface StudentUser extends User {
    email: string,
    auth_key?: string,
    auth_state?: string,
    year_of_study: number,
    major_type: string
}

export interface MentoUser extends User {
    workplace: string,
    department: string,
    job_position: string
}

export interface ProfessorUser extends User {
    major: string,
    department_type: string
}

export interface AuthKey {
    auth_key: string,

}