const fs = require('fs');
const multer = require('multer');
// models
const File = require('../models/file.js');
const Project = require('../models/projects/project');
const Mileage = require('../models/mileages/mileage');
// utils
const { getRandomString } = require('./utils');

exports.createFile = function (file, filetype) {
	return File.create(filetype, file.originalname, file.filename)
		.then(document => { 
			return document.save();
		});
};

exports.uploadFileInProject = function (req, res, next) {
	exports.upload(req, res, (err, next2) => {
		if (err) {
			if(err.code == 'LIMIT_FILE_SIZE') {
				res.status(403).json({ success: false, message: '파일이 한계를 초과했습니다.' });
			}else{
				res.status(403).json({ success: false, message: err.message });
			}

			console.log(err);
			return;
		}

		const formData = req.body;
		const { project_id, file_description } = formData;
		const file = req.files[0] || req.file;

		if(!project_id) {
			fs.unlinkSync(file);
		}

		Project.findOneById(project_id)
			.then(project => {
				let file_doc;
				let file_type;

				if (file_description == 'img_predicted_file') {
					file_doc = project.intro.img_predicted_file;
					file_type = 'image';
				}else if(file_description == 'doc_ppt_file') {
					file_doc = project.outputs.doc_ppt_file;
					file_type = 'ppt';
				}else if(file_description == 'doc_zip_file') {
					file_doc = project.outputs.doc_zip_file;
					file_type = 'zip';
				}else if(file_description == 'ucc_file') {
					file_doc = project.outputs.ucc_file;
					file_type = 'video';
				}

				// If the file exists, update file
				if (file_doc) {
					next2(`../files/projects/${project_id}`, file_doc.name);
					file_doc.original_name = file.originalname;
					File.updateOne({_id: file_doc._id}, file_doc)
				// If the file doesn't exist, create file
				}else{
					exports.createFile(file, file_type)
						.then(doc => {
							next2(`../files/projects/${project_id}`, doc._id);

							doc.name = doc._id;
							doc.save();

							if (file_description == 'img_predicted_file') {
								project.intro.img_predicted_file = doc;
							}else if(file_description == 'doc_ppt_file') {
								project.outputs.doc_ppt_file = doc;
							}else if(file_description == 'doc_zip_file') {
								project.outputs.doc_zip_file = doc;
							}else if(file_description == 'ucc_file') {
								project.outputs.ucc_file = doc;
							}

							Project.updateById(project._id, project);
						}).catch(err => {
							next(err);
						})
				}
			}).then(() => {
				next();
			}).catch(err => {
				next(err);
				fs.unlinkSync(file);
			})
	});
}

// input만
exports.uploadFileInMileage = function (req, res, next) {
	exports.upload(req, res, (err, next2) => {
		if (err) {
			if(err.code == 'LIMIT_FILE_SIZE') {
				res.status(403).json({ success: false, message: '파일이 한계를 초과했습니다.' });
			}else{
				res.status(403).json({ success: false, message: err.message });
			}

			console.log(err);
			return;
		}

		const formData = req.body;
		const { mileage_id, file_description } = formData;
		const files = req.files;

		if(!project_id) {
			fs.unlinkSync(file);
		}

		Mileage.findOneById(mileage_id)
			.then(doc_mileage => {
				let file_type;

				if (file_description == 'info_photo') {
					file_type = 'image';
				}

				for(var file of files) {
					exports.createFile(file, file_type)
					.then(doc => {
						next2(`../files/mileages/${mileage_id}`, doc._id);

						doc.name = doc._id;
						doc.save();

						if (file_description == 'info_photo') {
							doc_mileage.info_photos = doc;
						}

						doc_mileage.save();
					}).catch(err => {
						next(err);
					});
				}

			}).then(() => {
				next();
			}).catch(err => {
				next(err);
				fs.unlinkSync(file);
			})
	});
}

exports.upload = function (req, res, next) {
			multer({
				// 50mb limit
				limits: { fileSize: 50 * 1024 * 1024 },
				storage: multer.diskStorage({
					destination(req, file, cb) {
						cb(null, '../files/temp')
					},
					filename(req, file, cb) {
						file.ext = file.mimetype.split('/')[1];
						cb(null, getRandomString(15));
					}
				})
			}).any()(req, res, err => {

				if(req.file)
				{
					next(err, (dest, name) => {
						fs.mkdirSync(dest, { recursive: true });
						fs.renameSync(req.file.path, `${dest}/${name}`, { recursive: true });
					})
				}else if(req.files){
					next(err, (dest, name) => {
						for(var i = 0; i < req.files.length; i++) {
							fs.mkdirSync(dest, { recursive: true });
							fs.renameSync(req.files[i].path, `${dest}/${name}`, { recursive: true });
						}
					})
				}
			})
		}