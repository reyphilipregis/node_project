var flash = require('connect-flash')
  , express = require('express')
  , passport = require('passport')
  , util = require('util')
  , crypto = require('crypto')
  , mongoose = require('mongoose')
  , LocalStrategy = require('passport-local').Strategy;

var app = express();
var ObjectId = require('mongoose').Types.ObjectId;
var salt = '1234567890';

app.configure(function () {
	app.set('view engine', 'ejs');
	app.set('views', __dirname + '/public/views');
	app.use(express.static(__dirname + '/public'));
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({ secret: 'keyboard cat' }));
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(express.static(__dirname + '/../../public'));
});

////////////
mongoose.connect('mongodb://localhost/mydb');

Schema = mongoose.Schema;

var mySchema = new Schema({
                            username: { type: String, required: true, index: { unique: true } },
                            password: String
                            });
                            
mongoose.model('projects', mySchema); 

var myModel = mongoose.model('projects');

var mySchema2 = new Schema({
  entry: String,
});

mongoose.model('tasks', mySchema2); 
var myModel2 = mongoose.model('tasks');

function findById(id, fn) {  
    myModel.findOne({_id:ObjectId.createFromHexString(id)}, function(err,user) {
		if(err) {
			res.statusCode = 500;
			res.end('Something went wrong');
		}

        if(user) {
            fn(null, user);
        } else {
            fn(new Error('User ' + id + ' does not exist'));
        }
    });
}

function findByUsername(username, fn) {
  myModel.findOne({username:username}, function(err,user) {
		if (err) {
			res.statusCode = 500;
			res.end('Something went wrong');
		}
		
        if(!user)
            return fn(null, null);
        else {
            if (user.username === username) {
                return fn(null, user);
            } else {
                return fn(null, null);
            }
        }
    });
}

passport.serializeUser(function(user, done) {
    done(null, user._id);
});


passport.deserializeUser(function(id, done) {
    findById(id, function (err, user) {
        done(err, user);
    });
});


passport.use(new LocalStrategy(
    function(username, password, done) {
    process.nextTick(function () {
        findByUsername(username, function(err, user) {
            if (err) { 
                return done(err); 
            }
            
            if (!user) { 
                return done(null, false, { message: 'Unknown user ' + username }); 
            }
            
            if (!isHasEqualToStringPassword (user.password, password, salt)) { 
                return done(null, false, { message: 'Invalid password' }); 
            }else
                return done(null, user);
        })
    });
    }
));

var hash = function(passwd, salt) {
    return crypto.createHmac('sha256', salt).update(passwd).digest('hex');
}

function isHasEqualToStringPassword (passwdHash, passwordString, salt) {
    if(passwdHash === hash(passwordString, salt))
        console.log('equal');
    else
        console.log('not' + passwdHash + " | " + hash(passwordString, salt));
    
    return passwdHash === hash(passwordString, salt);
}

function setPassword(passwordString) {
    return passwdHash = hash(passwordString, salt);
}
////////////

app.get('/', function (req, res) {
    if(req.isAuthenticated())
       res.redirect('/todo');
    else {
       var uname = '';
       if(req.query.username)
            uname = req.query.username; 
        
	   res.render('index', {title: 'Login/Signup: NodeJs Project', username: uname, message: (req.query.msg)? req.query.msg : req.flash('error')});
    }
});

app.post('/signup', function (req, res) {
    var hash_pass = setPassword(req.body.newpassword);
    var obj = new myModel({'username':req.body.username, 'password':hash_pass});
    obj.save(function(err, rvalue) {
        if(err)
            handleError(err);
        res.end();
    });
    
    res.redirect('/?username='+ req.body.username +'&msg=Account Created!');
});

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/', failureFlash: true }),
  function(req, res) {
    res.redirect('/todo');
  });

app.get('/todo', ensureAuthenticated, function(req, res){
    myModel2.find(function(err,docs) {
		if (err) {
			res.statusCode = 500;
			res.end('Something went wrong');
		}

        console.dir(docs);
		res.render('todo', { user: req.user, todos: docs, title: 'ToDo List: NodeJs Project'});
	});
});

app.post('/add', function (req, res) {
    var obj = new myModel2({entry: req.body.entry});
	obj.save(function (err, entry) {
		if (err) {
			res.statusCode = 505;
			res.end('Something went wrong.');
		}
		res.redirect('/todo');
	})
});

app.delete('/delete', function (req, res) {
    var id = '';
    if(req.body.id)
       id = req.body.id;
    
    myModel2.remove({ _id: ObjectId.createFromHexString(id) }, function (err, data) {
		console.log(req.body.id);
	});
    res.end();
});

app.put('/update', function (req, res) {
    console.dir(req);
    var id = parseInt(req.body.id);
    var entry = req.body.entry;
    myModel2.update({_id: ObjectId.createFromHexString(req.body.id) }, {entry : entry}, function (err, data) {
            console.log(data);
        });
    res.end();
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
        res.redirect('/')
}

app.listen(9090, function () {
	console.log('App listening on localhost:9090');
});