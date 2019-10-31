const mongoose = require('mongoose');
const Codetype = require('../codetype');

const ProjectMember = require('./member');
const RequestParticipation = require('./requestParticipation');
const PeerReview = require('./peerReview');

const { filterNullInObject, cloneObject } = require('../../utils/utils');

// Define Schemas
const Project = mongoose.Schema({
    created_date: { type: Date, default: Date.now },
    count: { type: Number, default: 0 },
    kr_title: { type: String, trim: true, required: true},
    en_title: { type: String, trim: true, required: true},
    keywords: { type: Array, required: true},
    mean_member_year_of_study: { type: Number, default: 0},
    member_count: { type: Number, required: true},
    prof_num: { type: Number },
    mento_num: { type: Number },
    project_type: { type: mongoose.SchemaTypes.ObjectId, ref: 'Codetype.Projecttype' },
    project_state: { type: mongoose.SchemaTypes.ObjectId, ref: 'Codetype.Projectstate' },
    is_public: { type: Boolean, default: false },
    class_contest_name: { type: String, trim: true },
    project_area_type: { type: mongoose.SchemaTypes.ObjectId, ref: 'Codetype.Projectareatype' },
    recruit_period: {
        start_date: { type: Date, required: true},
        end_date: { type: Date, required: true}
    },
    exec_period: {
        start_date: { type: Date, required: true},
        end_date: { type: Date, required: true}
    },
    finished_date: { type: Date },
    intro: {
        kr_description: { type: String, trim: true, required: true},
        en_description: { type: String, trim: true, required: true},
        expected_effect: { type: String, trim: true, required: true},
        necessity: { type: String, trim: true, required: true},
        img_predicted_file: { type: mongoose.SchemaTypes.ObjectId, ref: 'File', default: null},
        develop_env: { type: String, trim: true, required: true },
        functions: { type: String, trim: true, required: true },
        languages: [
            {
                type: { type: mongoose.SchemaTypes.ObjectId, required: true, ref: 'Codetype.Language'},
                total_line: { type: Number, required: true, default: 0}
            }
        ],
        opensources: [
            {
                name: { type: String, trim: true, required: true},
                license: { type: String, trim: true, required: true},
                application_field: { type: String, trim: true, required: true}
            }
        ],
    },
    outputs: {
        github_url: { type: String, trim: true },
        doc_ppt_file: { type: mongoose.SchemaTypes.ObjectId, ref: 'File'},
        doc_zip_file: { type: mongoose.SchemaTypes.ObjectId, ref: 'File'},
        url_ucc: { type: String, trim: true }
    },
    prob_sol_in_exec: { type: String, trim: true },
    feelings: { type: String, trim: true},
    evaluation: {
        summary_score: { type: Number },
        contents_score: { type: Number },
        exec_contents_score: { type: Number },
        predicted_effect_score: { type: Number },
        application_field_score: { type: Number },
        outputs_score: { type: Number },
        opensource_score: { type: Number }
    }
}, {
    collection: 'Project'
});

    Project.statics.create = function (data) {
        languagePromises = []
        for (var i = 0; i < data.intro.languages.length; i++) {
            languagePromises.push(Codetype.Language.findOneByDescription(data.intro.languages[i].type));
        }
        return Promise.all([
            Codetype.Projecttype.findOneByDescription(data.project_type),
            Codetype.Projectstate.findOneByDescription('ready'),
            Codetype.Projectareatype.findOneByDescription(data.project_area_type) 
        ].concat(languagePromises))
            .then(values => {
                data.project_type = values[0];
                data.project_state = values[1];
                data.project_area_type = values[2];

                for (var i = 0; i < data.keywords.length; i++) {
                    data.keywords[i] = data.keywords[i].trim();
                }

                let language_types = values.slice(3,values.length);
                for (var i = 0; i < language_types.length; i++) {
                    data.intro.languages[i].type = language_types[i];
                }

                let project = new this(data);
                return project;
            });
    };

    // update project state
    Project.statics.updateProjectState = function(promise) {
        return promise.then(data => {
            // if data is null, return data
            if(!data) { return data; }

            // data is an array
            if(Array.isArray(data)){
                let promiseArray = [];
                
                for(var doc of data){
                    let thisTime = new Date();
                    let preProjectState = doc.project_state.description;
                    let nextProjectState;

                    if (doc.recruit_period.start_date > thisTime) {
                        // ready
                        nextProjectState = 'ready';
                    }else if (doc.recruit_period.end_date > thisTime) {
                        // recruiting
                        nextProjectState = 'recruiting';
                    }else if (doc.exec_period.end_date > thisTime) {
                        // executing
                        nextProjectState = 'executing';
                    }else if (doc.exec_period.end_date < thisTime) {
                        if(['ready', 'recruiting', 'executing'].includes(preProjectState)) {
                            nextProjectState = 'submitting outputs';
                        }
                    }
                    
                    // other states aren't automatically updated
                    if(nextProjectState && preProjectState != nextProjectState){
                        // update new project state
                        ((doc) => {
                            promiseArray.push(
                                Codetype.Projectstate.findOneByDescription(nextProjectState)
                                    .then(code => {
                                        doc.project_state = code;
                                        doc.save();
                                        return doc;
                                    })
                            )
                        })(doc);

                    }else{
                        promiseArray.push(doc);
                    }
                }

                return Promise.all(promiseArray);
                
            }else{
                let doc = data;
                let thisTime = new Date();
                let preProjectState = doc.project_state.description;
                let nextProjectState;

                if (doc.recruit_period.start_date > thisTime) {
                    // ready
                    nextProjectState = 'ready';
                }else if (doc.recruit_period.end_date > thisTime) {
                    // recruiting
                    nextProjectState = 'recruiting';
                }else if (doc.exec_period.end_date > thisTime) {
                    // executing
                    nextProjectState = 'executing';
                }else if (doc.exec_period.end_date < thisTime) {
                    if(['ready', 'recruiting', 'executing'].includes(preProjectState)) {
                        nextProjectState = 'submitting outputs';
                    }
                }
                
                // other states aren't automatically updated
                if(nextProjectState && preProjectState != nextProjectState){
                    // update new project state
                    return Codetype.Projectstate.findOneByDescription(nextProjectState)
                        .then(code => {
                            doc.project_state = code;
                            doc.save();
                            return doc;
                        });
                }else{
                    return doc;
                }
            }

        })
    }

    Project.statics.joinProject = function(doc) {
        return doc.populate({ path: 'project_type', select: 'description' })
            .populate({ path: 'project_state', select: 'description' })
            .populate({ path: 'project_area_type', select: 'description' })
            .populate({ path: 'intro.languages.type', select: 'description' })
            .populate({ path: 'intro.img_predicted_file'})
            .populate({ path: 'outputs.doc_ppt_file'})
            .populate({ path: 'outputs.doc_zip_file'})
    }

    // 프로젝트 하나 삭제
    Project.statics.deleteOneById = function (id) {
        RequestParticipation.deleteMany(id).then();
        PeerReview.deleteMany(id).then();
        ProjectMember.deleteMany(id).then();
        return this.deleteOne({_id: id});
    };

    // 프로젝트 개수 검색
    Project.statics.getCountWithFilter = function(filter) {
        return this.count(filter);
    };

    // filter있는 프로젝트 검색
    Project.statics.findWithFilter = function(filter, dataIndex) {
        if(filter){
            // if start exists
            if(dataIndex){
                return this.updateProjectState(this.joinProject(this.find(filter).sort({ "created_date" : -1 }).skip(dataIndex.start).limit(dataIndex.count)));
            }else{
                return this.updateProjectState(this.joinProject(this.find(filter).sort({ "created_date" : -1 })));
            }
        }
    };

    // 지도 교수 번호로 프로젝트 검색
    Project.statics.findByProfUserNum = function(user_num, dataIndex) {
        return module.exports.findWithFilter({prof_num: user_num}, dataIndex);
    }
    Project.statics.getCountByProfUserNum = function(user_num) {
        return module.exports.getCountWithFilter({prof_num: user_num});
    }

    // 멘토 번호로 프로젝트 검색
    Project.statics.findByMentoUserNum = function(user_num, dataIndex) {
        return module.exports.findWithFilter({mento_num: user_num}, dataIndex);
    }
    Project.statics.getCountByMentoUserNum = function(user_num) {
        return module.exports.getCountWithFilter({mento_num: user_num});
    }

    // 프로젝트 하나 검색
    Project.statics.findOneById = function(id) {
        return this.updateProjectState(this.joinProject(this.findOne({ _id: id })));
    }

    Project.statics.updateById = function(id, originObj) {
        return this.findById(id)
            .then(doc => {
                doc.set(originObj);
                doc.save();
            })
    }

    // customObject -> originObject
    Project.statics.customObjectToOriginObject = function(customObj) {
        let doc = cloneObject(customObj);
        doc._id = doc.id;

        let promiseArray = [];

        if(customObj.project_type) { 
            promiseArray.push(Codetype.Projecttype.findOneByDescription(customObj.project_type)
                .then(code => { doc.project_type = code; }));
        }

        if(customObj.project_area_type) {
            promiseArray.push(Codetype.Projectareatype.findOneByDescription(customObj.project_area_type)
                .then(code => { doc.project_area_type = code; }));
        }

        if(customObj.project_state) {
            promiseArray.push(Codetype.Projectstate.findOneByDescription(customObj.project_state)
                .then(code => { doc.project_state = code; }));
        }

        if(customObj.intro.languages) {
            let languagePromises = [];
            for (var i = 0; i < customObj.intro.languages.length; i++) {
                languagePromises.push(
                    Codetype.Language.findOneByDescription(customObj.intro.languages[i].type)
                );
            }
            promiseArray.push(Promise.all(languagePromises)
                .then(codes => {
                    for(var i = 0; i < codes.length; i++ ){
                        doc.intro.languages[i].type = codes[i];
                    }
                }));
        }

        if(doc.intro) { 
            if(doc.intro.img_predicted_file) doc.intro.img_predicted_file._id = customObj.intro.img_predicted_file.id;
        }

        if(doc.outputs) {
            if(doc.outputs.doc_ppt_file) doc.outputs.doc_ppt_file._id = customObj.outputs.doc_ppt_file.id;
            if(doc.outputs.doc_zip_file) doc.outputs.doc_zip_file._id = customObj.outputs.doc_zip_file.id;
            if(doc.outputs.ucc_file) doc.outputs.ucc_file._id = customObj.outputs.ucc_file.id;
        }

        return Promise.all(promiseArray).then(() => {return doc;});
    }

    // doc -> customObject
    Project.methods.toCustomObject = function() {
        let result = {
            id: this._id,
            created_date: this.created_date, 
            count: this.count, 
            kr_title: this.kr_title, 
            en_title: this.en_title, 
            keywords: this.keywords, 
            mean_member_year_of_study: this.mean_member_year_of_study,
            member_count: this.member_count, 
            prof_num: this.prof_num,
            mento_num: this.mento_num,
            project_type: this.project_type.description,
            project_state: this.project_state.description, 
            is_public: this.is_public, 
            class_contest_name: this.class_contest_name, 
            project_area_type: this.project_area_type.description, 
            recruit_period: {
                start_date: this.recruit_period.start_date, 
                end_date: this.recruit_period.end_date
            },
            exec_period: {
                start_date: this.exec_period.start_date, 
                end_date: this.exec_period.end_date,
            },
            intro: {
                kr_description: this.intro.kr_description, 
                en_description: this.intro.en_description, 
                expected_effect: this.intro.expected_effect, 
                necessity: this.intro.necessity, 
                develop_env: this.intro.develop_env, 
                functions: this.intro.functions,
                languages: [],
                opensources: []
            }
        };

        if(this.finished_date) result.finished_date = this.finished_date;
        if(this.evaluation) {
            let evaluation = {};
            if(this.evaluation.summary_score) evaluation.summary_score = this.evaluation.summary_score; 
            if(this.evaluation.contents_score) evaluation.contents_score = this.evaluation.contents_score; 
            if(this.evaluation.exec_contents_score) evaluation.exec_contents_score = this.evaluation.exec_contents_score; 
            if(this.evaluation.predicted_effect_score) evaluation.predicted_effect_score = this.evaluation.predicted_effect_score; 
            if(this.evaluation.application_field_score) evaluation.application_field_score = this.evaluation.application_field_score; 
            if(this.evaluation.outputs_score) evaluation.outputs_score = this.evaluation.outputs_score; 
            if(this.evaluation.opensource_score) evaluation.opensource_score = this.evaluation.opensource_score;
            
            if(Object.keys(evaluation).length > 0) {
                result.evaluation = evaluation;
            }
        }
        if(this.feelings) result.feelings = this.feelings;
        if(this.prob_sol_in_exec) result.prob_sol_in_exec = this.prob_sol_in_exec;
        if(this.outputs) {
            let outputs = {};

            if(this.outputs.github_url) outputs.github_url = this.outputs.github_url;
            if(this.outputs.doc_ppt_file) outputs.doc_ppt_file = this.outputs.doc_ppt_file;
            if(this.outputs.doc_zip_file) outputs.doc_zip_file = this.outputs.doc_zip_file;
            if(this.outputs.ucc_file) outputs.ucc_file = this.outputs.ucc_file;
            if(this.outputs.url_ucc) outputs.url_ucc = this.outputs.url_ucc;
        
            if(Object.keys(outputs).length > 0) {
                result.outputs = outputs;
            }
        }
        if(this.intro.img_predicted_file) {
            result.intro.img_predicted_file = this.intro.img_predicted_file.toCustomObject();
        }

        for(let language of this.intro.languages) {
            result.intro.languages.push(filterNullInObject({ 
                type: (language.type)?language.type.description:null,
                total_line: language.total_line
            }));
        }

        for(let opensource of this.intro.opensources) {
            result.intro.opensources.push(filterNullInObject({
                name: opensource.name, 
                license: opensource.license, 
                application_field: opensource.application_field
            }));
        }

        return result;
    }

    Project.methods.setProjectState = function(description){
        return Codetype.Projectstate.findOneByDescription(description)
            .then(code => {
                this.project_state = code;
            })
    }

// Project.Member
Project.statics.Member = ProjectMember;
// Project.RequestPart
Project.statics.RequestPart = RequestParticipation;
// Project.PeerReview
Project.statics.PeerReview = PeerReview;

module.exports = mongoose.model('Project', Project);