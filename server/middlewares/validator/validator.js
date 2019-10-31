const { validationResult } = require('express-validator');

exports.checks = function(validations, errMsg) {
	return validations.concat((req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			let err = errors.errors[0].nestedErrors ? errors.errors[0].nestedErrors[0] : errors.errors[0];
			console.log(err);
			return res.status(422).json({ success: false, message: (errMsg ? errMsg : err.msg)});
		}

		next();
	})
}