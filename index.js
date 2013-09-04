var mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1/mydb');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {

/*var MySchema = mongoose.Schema({
                                    first: String,
                                    last: String,
                                    dob: String,
                                    gender: String,
                                    hair_colour: String,
                                    occupation: String,
                                    nationality: String
                                });*/
                                
var MySchema = mongoose.Schema({
                            email: String,
                            password: String
                            });                                            
                                                   
var MyModel = mongoose.model('project', MySchema, 'project');
  
  //console.dir(MyModel);
  
  /*
  var obj = new MyModel({
                            first: 'philip',
                            last: 'regis',
                            dob: '06/10/1985',
                            gender: 'm',
                            hair_colour: 'black',
                            occupation: 'developer',
                            nationality: 'filipino'
                        });
  obj.save(function(err) {
    if(err)
        return handleError(err);
    
    console.log('Saved');
  });*/
  
  MyModel.find({}, function(err, data) {
    if(err)
        return handleError(err);
    console.dir(data);
  });
});