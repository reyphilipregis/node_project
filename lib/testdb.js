var mongoose = require('mongoose');
var crypto = require('crypto');
var salt = '1234567890';

var MySchema = mongoose.Schema({
                                username: { type: String, required: true, index: { unique: true } },
                                password: String
                                });                                            

function model() {
    var model = new Project();
    return model;
}

exports.model = model;
    
function Project() {
    
}
      
Project.prototype.save = function(object, done) {  
    mongoose.createConnection('mongodb://127.0.0.1/mydb');
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    
    db.once('open', function callback() {
        console.dir('open saved function')
        var MyModel = mongoose.model('projects', MySchema, 'projects');
        var obj = new MyModel(object);
        
        obj.save(function(err) {
            if(err)
                return callback('error');
            console.log('Content saved!');
            return done(null, object);
        });
    });
};

var hash = function(passwd, salt) {
    return crypto.createHmac('sha256', salt).update(passwd).digest('hex');
}

Project.prototype.setPassword = function(passwordString) {
    return passwdHash = hash(passwordString, salt);
}

function isHasEqualToStringPassword (passwdHash, passwordString, salt) {
    return this.passwdHash === hash(passwordString, salt);
}