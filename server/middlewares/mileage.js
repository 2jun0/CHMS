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