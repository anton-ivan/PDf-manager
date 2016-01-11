module.exports = function(mongoose)
{
	//Schemas
    var Schema = mongoose.Schema;
    
    var user = new mongoose.Schema({
        firstname:String,
        lastname:String,
        email:String,
        companyname:String,
        phonenumber:String,
        password:String,
        wadmin:Boolean,
        created_date:Date,
        verified:Boolean
    });
    
    var workspace=new mongoose.Schema({
        name:String,
        desc:String,
        admin:String,
        created_date:Date,
        usergroups:[{ type: Schema.ObjectId, ref: 'usergroups' }]
    });
    
    var usergroup=new mongoose.Schema({
        name:String,
        desc:String,
        wid:String,
        created_date:Date,
        users_belong:[{ type: Schema.ObjectId, ref: 'users' }],
        permissions:[{docid: String, perm: Number}]
    });
    
    
	var doclist = new mongoose.Schema({
        docname:String,
        docdesc:String,
        docurl:String,
        owner:[{ type: Schema.ObjectId, ref: 'users' }],
        created_date:Date,
        workspaceId:String
	});
    
    var tasklist=new mongoose.Schema(
    {
        tasktype: Number,
        tasktitle: String,
        tasktargettext:String,
        taskattention:Number,
        tasknote:String,
        all_selected: String, //list of selected divs
        docid:[{ type: Schema.ObjectId, ref: 'docs' }],
        taskadder: [{ type: Schema.ObjectId, ref: 'users' }],
        tasktargetgroup:[{ type: Schema.ObjectId, ref: 'usergroups' }],
        taskassignee: [{ type: Schema.ObjectId, ref: 'users' }],
        comments: [{ type: Schema.ObjectId, ref: 'comments' }],
        created_date: Date
    });
    
    var commentlist = new mongoose.Schema({
        comment:String, //comment text
        taskid: String, //taskid to which comment belongs
        added_by: String, // id of user collection
        adder_name:String, //it might call data inconsistency and redundancy,but ensures high performance.        
        created_date: Date
    });
    
    
	var models = {};
	models.DocModel = mongoose.model( 'docs', doclist);
    models.TaskModel=mongoose.model('tasks',tasklist);
    models.CommentModel=mongoose.model( 'comments', commentlist);
    models.UserModel=mongoose.model('users',user);
    models.WorkspaceModel=mongoose.model('workspaces',workspace);
    models.UserGroupModel=mongoose.model('usergroups',usergroup);
	return models;
};
