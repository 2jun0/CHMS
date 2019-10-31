const mongoose = require('mongoose');
const User = require('../users/user');

const { filterNullInObject } = require('../../utils/utils');

// Define Schemes
const RequestParticipation = mongoose.Schema({
    user_num: { type: Number, required: true },
    project_id: { type: mongoose.SchemaTypes.ObjectId, ref: 'Project' }, 
    request_date: { type: Date, default: Date.now },
    reason: { type: String, default: '' },
    is_accepted: { type: Boolean, default: false }
}, {
        collection: 'Project.RequestParticipation'
    });
    
    RequestParticipation.statics.create = function (user_num, project_id, reason) {
        return new Promise((resolve, reject) => {
            resolve(new this(filterNullInObject({user_num, project_id, reason})));
        });
    };
    
    RequestParticipation.methods.toCustomObject = function() {
        return filterNullInObject({
            id: this._id,
            user_num: this.user_num,
            project_id: this.project_id,
            request_date: this.request_date,
            reason: this.reason,
            is_accepted: this.is_accepted
        });
    };

    RequestParticipation.statics.findOneById = function (id) {
        return this.findOne({ _id: id });
    };

    // 프로젝트 id로 삭제
    RequestParticipation.statics.deleteManyByProjectId = function (project_id) {
        return this.deleteMany({ project_id: project_id });
    }

    // 프로젝트 id로 참여요청 검색
    RequestParticipation.statics.findByProjectId = function (project_id) {
        return this.find({ project_id }).sort({ request_date : -1 });
    };

    // 사용자 번호와 프로젝트 번호로 참여요청 검색
    RequestParticipation.statics.findOneByUserNumAndProjectId = function (user_num, project_id) {
        return this.findOne({ user_num, project_id });
    };

    // id로 삭제
    RequestParticipation.statics.deleteOneById = function (id) {
        return this.deleteOne({_id: id});
    };

    // 참여요청 하나 수락으로 변경
    RequestParticipation.statics.acceptOneById = function (id) {
        return this.findOneAndUpdate({_id: id}, {is_accepted: true});
    };

module.exports = mongoose.model('Project.RequestParticipation', RequestParticipation)