const mongoose = require('mongoose');
const Codetype = require('../codetype'); 

const { filterNullInObject, cloneObject } = require('../../utils/utils');

// Define Schemes
const ProjectMember = mongoose.Schema({
    user_num: { type: Number, required: true },
    project_id: { type: mongoose.SchemaTypes.ObjectId, ref: 'Project' },
    is_leader: { type: Boolean, required: true },
    participate_date: { type: Date, default: Date.now },
    role: { type: String },
    contribution_rate: { type: Number },
    languages: [
        {
            type: { type: mongoose.SchemaTypes.ObjectId, required: true, ref: 'Codetype.Languages'},
            total_line: { type: Number}
        }
    ],
    github_url: { type: String },
    total_peer_review_score: { type: Number },
    did_review_peer: { type: Boolean, default: false }
}, {
        collection: 'Project.Member'
    });

    ProjectMember.statics.create = function (user_num, project_id, is_leader, role, contribution_rate, languages, github_url, total_peer_review_score) {
        if(languages){
            // Cenvert string type languages to codetype languages
            languagePromises = [];
            for (var i = 0; i < languages.length; i++) {
                languagePromises.push(Codetype.Language.findOneByDescription(languages[i].type));
            }
            return Promise.all(languagePromises)
            .then(language_types => {
                for (var i = 0; i < language_types.length; i++) {
                    languages[i].type = language_types[i];
                }

                return new this(filterNullInObject({
                    user_num, project_id, is_leader, role, contribution_rate, languages, github_url, total_peer_review_score
                }));
            });
        }else{
            return new Promise((resolve, reject) => {
                resolve(new this(filterNullInObject({
                    user_num, project_id, is_leader, role, contribution_rate, github_url, total_peer_review_score
                })));
            })
        }
    };

    ProjectMember.methods.toCustomObject = function() {
        let languageObjs = [];

        for (var language of this.languages){
            languageObjs.push({
                type: language.type,
                total_line: language.total_line
            })
        } 

        let obj = filterNullInObject({
            id: this._id,
            user_num: this.user_num,
            project_id: this.project_id,
            is_leader: this.is_leader,
            participate_date: this.participate_date,
            role: this.role,
            contribution_rate: this.contribution_rate,
            languages: languageObjs,
            github_url: this.github_url,
            total_peer_review_score: this.total_peer_review_score,
            did_review_peer: this.did_review_peer,
        })

        return obj;
    }

    // customObject -> originObject
    ProjectMember.statics.customObjectToOriginObject = function(customObj) {
        let doc = cloneObject(customObj);

        let languagePromises = [];
        for(var i = 0; i < customObj.languages.length; i++) {
            languagePromises.push(
                Codetype.Language.findOneByDescription(customObj.languages[i].type)
            );
        }
        
        return Promise.all(languagePromises).then(codes => {
            for(var i = 0; i < codes.length; i++) {
                doc.languages[i].type = codes[i];
            }
            return doc;
        }).catch(err => {
            throw err;
        });
    }

    ProjectMember.statics.deleteManyByProjectId = function (project_id) {
        return this.deleteMany({ project_id: project_id });
    }

    // member id로 검색
    ProjectMember.statics.findOneById = function (id) {
        return this.findOne({ _id: id })
            .populate({ path: 'languages', populate: { path: 'type', select: 'description' } });
    }

    // user_num 과 project_id로 검색
    ProjectMember.statics.findOneByProjectIdAndUserNum = function (project_id, user_num) {
        return this.findOne({ project_id, user_num })
            .populate({ path: 'languages', populate: { path: 'type', select: 'description' } });
    }

    // user_num로 검색
    ProjectMember.statics.findOneByUserNum = function (user_num) {
        return this.findOne({ user_num })
            .populate({ path: 'languages', populate: { path: 'type', select: 'description' } });
    }

    // 프로젝트 id에 해당하는 팀장 맴버 하나 검색
    ProjectMember.statics.findLeaderOneByProjectId = function (project_id) {
        return this.findOne({ project_id: project_id, is_leader: true })
            .populate({ path: 'languages', populate: { path: 'type', select: 'description' } });
    };

    // 프로젝트 id로 맴버 목록 검색
    ProjectMember.statics.findByProjectId = function (project_id) {
        return this.find({ project_id: project_id }) 
            .populate({ path: 'languages', populate: { path: 'type', select: 'description' } });
    };

    // 학번으로 프로젝트 맴버 목록 검색
    ProjectMember.statics.findByUserNum = function (user_num, start, count) {
        if(start) {
            return this.find({ user_num: user_num }).skip(start).limit(count)
            .populate({ path: 'languages', populate: { path: 'type', select: 'description' } });
        }else{
            return this.find({ user_num: user_num })
            .populate({ path: 'languages', populate: { path: 'type', select: 'description' } });
        }
    };

module.exports = mongoose.model('Project.Member', ProjectMember)