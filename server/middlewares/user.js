const User = require('../models/users/user');
const { getValueByKey } = require('../utils/utils');

// Get if the user exists
exports.doesUserExist = function(user_num_key) {
	return (req, res, next) => {
		let user_num = getValueByKey(req.body, user_num_key);

		User.findOneByUserNum(user_num)
			.then(user => {
				if(!user) {
					return res.status(403).json({ success: false, message: '해당 사용자가 없습니다.' });
				}

				req.user = user;
				next();
			})
			.catch(err => res.status(403).json({ success: false, message: err.message }));
	}
}