import { File } from "./file"

export interface Project {
    id?: string;
    created_date?: Date;
    count?: number;
    kr_title: string;
    en_title: string;
    keywords: Array<string>;
    member_count: number;
    prof_num?: number;
    mento_num?: number;
    project_type: string;
    project_state?: string;
    is_public?: boolean;
    class_contest_name?: string;
    project_area_type: string;
    recruit_period: {
        start_date: Date,
        end_date: Date
    };
    exec_period: {
        start_date: Date,
        end_date: Date
    };
    intro: {
        kr_description: string,
        en_description: string,
        expected_effect: string,
        necessity: string,
        img_predicted_file?: File,
        develop_env: string,
        functions: string,
        languages: Array<Language>,
        opensources: Array<Opensource>
    }
    outputs?: Outputs;
    evaluation?: Evaluation;
}

export interface Language {
    type: string;
    total_line: number;
}
 
export interface Opensource {
    name: string;
    license: string;
    application_field: string;
}

export interface Outputs {
    github_url: string,
    doc_ppt_file: File,
    doc_zip_file: File,
    url_ucc: string
}

export interface Evaluation {
    summary_score: number,
    contents_score: number,
    exec_contents_score: number,
    predicted_effect_score: number,
    application_field_score: number,
    outputs_score: number,
    opensource_score: number
}