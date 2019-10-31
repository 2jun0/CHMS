const mongoose = require('mongoose');
const Codetype = require('../codetype');

const { filterNullInObject } = require('../../utils/utils');

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
    total_peer_review_score: { type: Number }
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