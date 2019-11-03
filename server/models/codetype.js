const mongoose = require('mongoose');

// Define Schemas
Codetype_schema = {
    description:   { type: String, required: true }
}

function createSchema(name, attrs=[], join=(doc)=>{return doc;}) {
    let schemaTemp = Codetype_schema;

    for(var attr in attrs) {
        schemaTemp[attr] = attrs[attr];
    }

    schema = mongoose.Schema(schemaTemp, {
        collection: `Codetype.${name}`
    });

    schema.statics.findOneByDescription = function(description) {
        if(this.holder[description]) {
            return Promise.resolve(this.holder[description]);
        }else{
            return join(this.findOne({ description: description }))
                .then(code => {
                    this.holder[description] = code;
                    return code;
                })
                .catch(err => { console.log(err); }); 
        }
    }

    schema.statics.findManyByDescriptions = function(descriptions) {
        return join(this.find({ description: {$in : descriptions}}))
            .catch(err => { console.log(err); });
    }

    schema.statics.findOneById = function(_id) {
        return join(this.findOne({ _id : _id }))
            .catch(err => { console.log(err); });
    }

    schema.statics.findAll = function() {
        return join(this.find({}))
            .catch(err => { console.log(err); });
    }

    schema.methods.toCustomObject = function() {
        let obj = {
            id: this._id,
            description: this.description,
        }

        for(let attr in attrs) {
            if(attrs[attr].type == mongoose.SchemaTypes.ObjectId) {
                obj[attr] = this[attr].description;
            }else{
                obj[attr] = this[attr];
            }
        }

        return obj;
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
const collegetype = createSchema('Collegetype');
const departmenttype = createSchema('Departmenttype', { college_type : {type: mongoose.SchemaTypes.ObjectId, ref:"Codetype.Collegetype"}}, (doc) => {
    return doc.populate({ path: 'college_type'});
});

exports.Majortype = mongoose.model('Codetype.Majortype', majortype);
exports.Collegetype = mongoose.model('Codetype.Collegetype', collegetype);
exports.Departmenttype = mongoose.model('Codetype.Departmenttype', departmenttype);