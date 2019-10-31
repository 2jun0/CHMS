const mongoose = require('mongoose');
const Codetype = require('./codetype');

const File = mongoose.Schema({
    filetype: {type: mongoose.SchemaTypes.ObjectId, ref: 'Codetype.Filetype'},
    created_date: {type: Date, required: true},
    original_name: {type: String, required: true},
    name: {type: String, required: true}
}, {
    collection: 'File'
});

    File.statics.create = function(filetype, original_name, name) {

        return Codetype.Filetype.findOneByDescription(filetype)
            .then(filetype => {
                created_date = new Date();

                let file = this({filetype, created_date, original_name, name});
                return file;
            });
    }

    File.methods.toCustomObject = function() { 
        let result = {
            id: this._id,
            filetype: this.filetype,
            created_date: this.created_date,
            original_name: this.original_name,
            name: this.name
        }

        return result;
    }

module.exports = mongoose.model('File', File);