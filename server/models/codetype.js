const mongoose = require('mongoose');

// Define Schemas
Codetype_schema = {
    description:   { type: String, required: true }
}

function createSchema(name) {
    schema = mongoose.Schema(Codetype_schema, {
        collection: `Codetype.${name}`
    });

    schema.statics.findOneByDescription = function(description) {
        if(this.holder[description]) {
            return Promise.resolve(this.holder[description]);
        }else{
            return this.findOne({ description: description })
                .then(code => {
                    this.holder[description] = code;
                    return code;
                })
                .catch(err => { console.log(err); }); 
        }
    }

    schema.statics.findManyByDescriptions = function(descriptions) {
        return this.find({ description: {$in : descriptions}})
            .catch(err => { console.log(err); });
    }

    schema.statics.findOneById = function(_id) {
        return this.findOne({ _id : _id })
            .catch(err => { console.log(err); });
    }

    schema.statics.holder = {};

    return schema;
}

// for user
const Authstate = createSchema('Authstate');
const Usertype = createSchema('Usertype');

exports.Authstate = mongoose.model('Codetype.Authstate', Authstate);
exports.Usertype = mongoose.model('Codetype.Usertype', Usertype);

// for project
const Language = createSchema('Language');
const Projectstate = createSchema('Projectstate');
const Projecttype = createSchema('Projecttype');
const Projectareatype = createSchema('Projectareatype');

exports.Language = mongoose.model('Codetype.Language', Language);
exports.Projectstate = mongoose.model('Codetype.Projectstate', Projectstate);
exports.Projecttype = mongoose.model('Codetype.Projecttype', Projecttype);
exports.Projectareatype = mongoose.model('Codetype.Projectareatype', Projectareatype);

// for files
const Filetype = createSchema('Filetype');

exports.Filetype = mongoose.model('Codetype.Filetype', Filetype);

// others
const majortype = createSchema('Majortype');

exports.Majortype = mongoose.model('Codetype.Majortype', majortype);