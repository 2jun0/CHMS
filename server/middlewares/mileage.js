const Mileage = require('../models/mileages/mileage');
const { getValueByKey } = require('../utils/utils');

// Get if the mileage exists
exports.doesMileageExist = function(mileage_id_key) {
	return (req, res, next) => {
		let mileage_id = getValueByKey(req.body, mileage_id_key);

		Mileage.findOneById(mileage_id)
			.then(mileage => {
				if(!mileage) {
					return res.status(403).json({ success: false, message: '해당 마일리지가 없습니다.' });
				}

				req.mileage = mileage;
				next();
			})
			.catch(err => res.status(403).json({ success: false, message: err.message }));
	}
}

exports.isMileageMine = (req, res, next) => {
	const token = req.decodedToken;
	const { mileage } = req;

	// 마일리지가 내것이 아니면
	if(mileage.user_num != token.user_num) {
		return res.status(403).json({ success: false, message: '해당 마일리지를 열람할 권한이 없습니다.' });
	}else{
		next();
	}
};