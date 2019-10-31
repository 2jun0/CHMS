const mongoose = require('mongoose');
const User = require('../users/user');

const { filterNullInObject } = require('../../utils/utils');

// Define Schemes
const PeerReview = mongoose.Schema({
	project_id: { type: mongoose.SchemaTypes.ObjectId, ref: 'Project' }, 
	reviewer_user_num: { type: Number, required: true },
	target_user_num: { type: Number, required: true },
	review_date: { type: Date, default: Date.now },
	position: {
		p1: { type: Number, required: true },
		p2: { type: Number, required: true },
		p3: { type: Number, required: true },
		p4: { type: Number, required: true },
		p5: { type: Number, required: true },
		p6: { type: Number, required: true },
		p7: { type: Number, required: true },
		p8: { type: Number, required: true },
		p9: { type: Number, required: true },
		p10: { type: Number, required: true }
	},
	total_score: {type: Number, required: true }
}, {
        collection: 'Project.PeerReview'
    });
    
    PeerReview.statics.create = function (project_id, reviewer_user_num, target_user_num, position, total_score) {
			return new Promise((resolve, reject) => {
				if(!total_score) total_score = position.p1 + position.p2 + position.p3 + position.p4 + position.p5 + position.p6 + position.p7 + position.p8 + position.p9 + position.p10;
				resolve(new this({project_id, reviewer_user_num, target_user_num, position, total_score}));
			});
    };
    
    PeerReview.methods.toCustomObject = function() {
        return {
            id: this._id,
						project_id: this.project_id,
						reviewer_user_num: this.reviewer_user_num,
						target_user_num: this.target_user_num,
						review_date: this.review_date,
						position: {
							p1: this.position.p1,
							p2: this.position.p2,
							p3: this.position.p3,
							p4: this.position.p4,
							p5: this.position.p5,
							p6: this.position.p6,
							p7: this.position.p7,
							p8: this.position.p8,
							p9: this.position.p9,
							p10: this.position.p10
						},
						total_score: this.total_score,
        };
    };

    PeerReview.statics.findOneById = function (id) {
        return this.findOne({ _id: id });
		};
		
		// 동료평가 삭제
    PeerReview.statics.deleteManyByProjectId = function (project_id) {
			return this.deleteMany({ project_id: project_id });
		}

		// reviewer가 평가를 했었는지 확인하는 함수
		PeerReview.statics.DidReviewerReviewed = function (project_id, reviewer_user_num) {
			return this.findOne({ project_id, reviewer_user_num })
				.then(doc => {if(doc){return true;}else{return false;}});
		}

		PeerReview.statics.findByProjectIdAndTargetUserNum = function (project_id, target_user_num) {
			return this.find({ project_id, target_user_num });
		}

module.exports = mongoose.model('Project.PeerReview', PeerReview)