
/**
 * Module dependencies.
 */

//express middle ware
var express = require('express');
//node mailer package
var nodemailer     = require("nodemailer");
//user defined helper
var mailhelper= require("./helper/sendmail");
//routes definition
var routes = new require('./routes/index');
routes.task=new require('./routes/task');
routes.users=new require('./routes/users');

//upload part
var uploaddir = __dirname + "/public/uploads";
var fileupload = require('fileupload').createFileUpload(uploaddir).middleware;


//mongodb integration
mongoose = require( 'mongoose' ); //MongoDB integration

//environment
var http = require('http');
var path = require('path');
var config = require("./config");

var app = express();
var MongoStore = require('connect-mongo')(express);


// all environments
app.set('port', process.env.PORT || 8000);
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({
    secret: config.express.session.secret,
    maxAge: config.express.session.maxAge,
    store: new MongoStore(config.site.getMongoConfig())
}));


app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//mongo db connect

mongoose.connect(config.site.getMongoConnectionString());
var models = require("./models/schemas")(mongoose);

//routing logic

app.get('/login',routes.login);
app.get('/signup',routes.signup);
app.post('/users/login',routes.users.login(models));
app.post('/users/signup',routes.users.signup(config,models,nodemailer,mailhelper));
app.get('/users/verify',routes.users.verify(models));
app.post('/users/invite_user',routes.users.inviteuser(config,models,nodemailer,mailhelper));
app.get('/users/accept_invite',routes.users.accept_invite(models));
app.post('/users/invite_confirm',routes.users.invite_confirm(models));
app.post('/users/addtogroup',routes.users.addtogroup(models));
app.post('/users/setpermission',routes.users.setpermission(models));

app.get('/workspace',routes.workspace(models));
app.get('/manage_user',routes.user_manage(models));

app.get('/logout',function(req,res)
{
    req.session.user=null;
    res.redirect('/login');
});
app.post('/workspace/create',routes.createworkspace(models));
app.post('/workspace/edit',routes.editworkspace(models));
app.post('/usergroup/create',routes.createusergroup(models));



app.get('/', function(req,res){ res.redirect('/login')});
app.get('/view',routes.viewdoc(models));
app.post('/docupload',fileupload,routes.docupload(models));

app.post('/task/save',routes.task.save(config,models,nodemailer,mailhelper));
app.post('/task/comment/save',routes.task.commentsave(models));
app.post('/task/realtime',routes.task.realtime(models));
app.post('/task/viewmore',routes.task.viewmore(models));

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
