
/*
 * GET home page.
 */
 //login page route
 exports.login= function(req,res)
 {  
     if (req.session.user) res.redirect('/workspace');
     else
     {
         console.log(req.query.opt);
         if (req.query.opt)
            res.render('login',{opt:req.query.opt});
         else
            res.render('login');
     }
        
 };
 //signup page route
exports.signup= function(req,res)
{  
    if (req.session.user)
     res.redirect('/workspace');
    else
     res.render('signup');
};
//home page route
exports.index = function(models)
{
    return function(req, res)   
    {
        
        models.DocModel.find({}, function(err,docs)
        {
            if (err)
            {
                console.log(err);
                res.send("DB ERROR");
            }   
            else
            {
                console.log(docs);   
                res.render('index', { doclist: docs});
            }
        });
    };
}

//workspace route ::: Very important
exports.workspace=function(models)
{
    return function(req,res)
    {
        console.log(req.session.user);
        if (req.session.user)
        {
            // Workspace logic is different from admin to normal user.
            if (req.session.user.wadmin==true)
            {
                //user is admin
                //Get the workspace list for the user
                models.WorkspaceModel.find({"admin": req.session.user._id}, function(err,workspaces)
                {
                    if (err)
                    {
                        console.log(err);
                        res.send("DB ERROR");
                    }   
                    else
                    {
                        console.log(workspaces[0]);
                        current_workspace_id= (typeof req.query.wid=="undefined") ?  workspaces[0]["_id"] : req.query.wid;
                        req.session.user.current_workspace= current_workspace_id;
                        //Get the document list for the workspace and for admin
                        models.DocModel.find({workspaceId: current_workspace_id},function(err,docs)
                        {
                            if (err){console.log(err);
                                res.send("db error");
                            }
                            else
                            {
                                console.log(docs);
                                
                                //Get the task information for the wadmin
                                models.UserGroupModel.find({wid:current_workspace_id})
                                .populate('users_belong')
                                .exec(function(err,ugroups)
                                {
                                    // ??? Not verified uesrs are not in the list automatically??? I've to solve...
                                    if (err) { console.log(err); res.send("db error"); }
                                    //2. Find the tasks : tasktargetgroup and taskassignee:admin
                                    //.sort({created_date: -1}).limit(6) for 6 items
                                    
                                    models.TaskModel.find({tasktargetgroup: {$in:ugroups},taskassignee:req.session.user._id})
                                    .sort({created_date: -1}).limit(6)                                    
                                    .populate('docid','_id docname')
                                    .populate('taskadder')
                                    .populate('taskassignee')
                                    .populate({path:'comments',options:{sort:{'created_date':'-1'}}})
                                    .exec(function(err,tasks)
                                    {
                                        if (err){console.log(err); res.send("db errror"); }
                                        //res.json(tasks);
                                        // Below vars are needed for real time update for task and view more task.... This is for Admin Case
                                        var ugs=[];
                                        for (i=0; i<=ugroups.length-1; i++)
                                            ugs.push(ugroups[i]._id);
                                        
                                        var aryoftaskids=[];
                                        for (i=0; i<=tasks.length-1; i++)
                                            aryoftaskids.push(tasks[i]._id);
                                        
                                            
                                        var upperdate=new Date();
                                        var belowdate=(tasks.length>0)? tasks[tasks.length-1].created_date : null; 
                                        
                                       res.render("workspace",{usersession:req.session.user,"workspace_list": workspaces,"current_workspace_id":current_workspace_id ,doclist: docs,
                                                    mytasks:tasks,task_up_date:upperdate,task_below_date:belowdate,targetgroups:JSON.stringify(ugs),tids:JSON.stringify(aryoftaskids)});
                                    });
                                });
                                
                                
                                
                            }
                        });
                        
                    }
                });
                
            }
            else
            {
                //normal user
                models.UserGroupModel.find({users_belong:req.session.user._id},function(err,ug)
                {
                   if (err){console.log(err); res.send("db error");} 
                   if (ug)
                   {
                       var widary=[];
                       var ugwsary=[]; //map array between usergroup and workspace: you can get from usergroup from workspace
                       for (i=0; i<=ug.length-1; i++)
                       {
                           ugwsary[ug[i].wid]=ug[i]._id;
                           widary.push(ug[i].wid);
                       }
                       
                       models.WorkspaceModel.find({_id: {$in :widary}}, function(err,workspaces)
                       {
                            if (err){console.log(err); res.send("db error");} 
                            if (workspaces)
                            {
                                current_workspace_id= (typeof req.query.wid=="undefined") ?  workspaces[0]["_id"] : req.query.wid;
                                req.session.user.current_workspace= current_workspace_id;
                                var perm;
                                var permdoc=[];
                                for (j=0; j<=ug.length-1; j++)
                                {
                                    if (ug[j].wid==current_workspace_id)
                                        perm=ug[j].permissions;                                    
                                }
                                for (j=0; j<=perm.length-1; j++)
                                {
                                    permdoc.push(perm[j].docid);
                                }                                
                                //Get the document list for the workspace and for admin
                                models.DocModel.find({_id:{$in:permdoc}},function(err,docs)
                                {
                                    if (err){console.log(err); res.send("db error");} 
                                    
                                    //Get the task info per workspace and user group
                                    //very important:  ugwsary[current_workspace_id];
                                    //res.send("aaa"+ugwsary[current_workspace_id]);
                                    
                                    models.TaskModel.find({tasktargetgroup: ugwsary[current_workspace_id]})
                                    .sort({created_date: -1}).limit(6)
                                    .populate('docid','_id docname')
                                    .populate('taskadder')
                                    .populate('taskassignee')
                                    .populate({path:'comments',options:{sort:{'created_date':'-1'}}})
                                    .exec(function(err,tasks)
                                    {
                                        
                                        // Below vars are needed for real time update for task and view more task.... This is for Admin Case
                                        var ugs= ugwsary[current_workspace_id];
                                        var upperdate=new Date();
                                        var belowdate=(tasks.length>0)? tasks[tasks.length-1].created_date : null;
                                        //For real-time comments, we keep the array of task ids only.
                                        var aryoftaskids=[];
                                        for (i=0; i<=tasks.length-1; i++)
                                            aryoftaskids.push(tasks[i]._id);
                                        
                                        if (err){console.log(err); res.send("db errror");}
                                        
                                        res.render("workspace",{usersession:req.session.user,"workspace_list": workspaces,"current_workspace_id":current_workspace_id ,doclist: docs
                                                ,mytasks:tasks,task_up_date:upperdate,task_below_date:belowdate,targetgroups:JSON.stringify(ugs),tids:JSON.stringify(aryoftaskids)});
                                    });
                                    
                                });
                                
                            }                             
                       });                   
                   }
                });
                
            }
            
        }
        else
        {
            res.redirect("/login");
        }
    }
}

//workspace /user_manage
exports.user_manage=function(models)
{
    return function(req,res)
    {
        if (req.session.user!=null && req.session.user.wadmin==true)
        {
            models.WorkspaceModel
            .find({admin: req.session.user._id})
            .populate('usergroups') 
            .exec(function (err, wspace)
            {
                console.log(wspace);
                if (err) {console.log(err); res.send("workspace db error");}
                
                //get the user list of the user group
                if (req.query.ugid && req.query.ugid!="")
                {
                    models.UserGroupModel
                    .findOne({_id: req.query.ugid})
                    .populate('users_belong')
                    .exec(function(err,ugroup)
                    {
                        //Use the doc list of this workspace admin
                        models.DocModel.find({owner:req.session.user._id,workspaceId:ugroup.wid},function(err,docs)
                        {
                           if (err){console.log(err); res.send("dberror"); }
                           else
                           {
                                res.render('user_manage',{usersession:req.session.user,workspacelist:wspace,ugid:req.query.ugid,group:ugroup,doclist:docs});
                           }
                        });
                        
                    });
                }
                else
                {
                //res.send(wspace);
                    res.render('user_manage',{usersession:req.session.user,workspacelist:wspace,ugid:""});
                }
            });                
        }
        else
        {
            res.redirect('/login');
        }
    }
}
//create user group
exports.createusergroup=function(models)
{
    return function(req,res)
    {
        //check this requiet is from admin
        if (req.session.user!=null && req.session.user.wadmin==true)
        {
             var usergroup = new models.UserGroupModel(
             {
                name: req.body.usergroupname,
                desc: "",
                wid: req.body.wspaceforusergroup,
                admin: req.session.user._id,
                created_date: new Date(),
             });
             usergroup.save(function (err,ugroup) 
             {
                if (!err) {
                    console.log('usergroup metadata saved');
                    
                    //update workspace model so that it can have usergroup id
                    models.WorkspaceModel.update({_id:req.body.wspaceforusergroup},{$pushAll:{usergroups:[ugroup.id]}},{upsert:true},function(err)
                    {
                        if (!err)
                        {
                            res.redirect("manage_user?ugid="+ugroup.id);
                        }    
                        else
                        {
                            console.log(err);
                            res.send("db error")
                        }
                    });
                    
                    
                } 
                else{
                    console.log("usergroup create error: "+err);
                    res.send("db error");
                }
             });
             
        }
        else
        {
            res.redirect('/login');
        }
    }
}
//create workspace
exports.createworkspace=function(models)
{
    return function(req,res)
    {
        //check this requiet is from admin
        if (req.session.user!=null && req.session.user.wadmin==true)
        {
             var workspace = new models.WorkspaceModel(
             {
                name: req.body.workspacename,
                desc: "",
                admin: req.session.user._id,
                created_date: new Date(),
             });
             workspace.save(function (err,wspace) 
             {
                if (!err) {
                    console.log('workspace metadata saved');
                    res.redirect("workspace?wid="+wspace.id);
                } 
                else{
                    console.log("workspace create error: "+err);
                    res.send("db error");
                }
             });
        }
        else
        {
            res.redirect('/login');
        }
    }
}

//edit workspace
exports.editworkspace=function(models)
{
    return function(req,res)
    {
        //check this requiet is from admin
        if (req.session.user!=null && req.session.user.wadmin==true)
        {
             models.WorkspaceModel.update({_id:req.body.exworkspaceid},{$set:{name: req.body.newworkspacename}},function(err)
            {
                if (!err){
                    res.redirect("workspace?wid="+req.body.exworkspaceid);
                }    
                else{
                    console.log(err);
                    res.send("db error")
                }
            });
                    
        }
        else
        {
            res.redirect('/login');
        }
    }
}
//doc upload route
exports.docupload=function(models)
{
    return function(req,res)
    {
        console.log(req.body.myfile[0]);
        
        if (typeof (req.body.myfile[0]) != "undefined")
            docPath = "/uploads/" + req.body.myfile[0].path + req.body.myfile[0].basename;
        else
            docPath = "";
        
        console.log("docpath"+docPath);
        var doc = new models.DocModel(
        {
            docname: req.body.myfile[0].basename,
            docdesc: "",
            docurl: docPath,
            owner:req.session.user._id,
            created_date:new Date(),
            workspaceId: req.session.user.current_workspace
        });
       doc.save(function (err,doc) 
       {
            if (!err) {
                console.log('doc metadata saved');
                res.send(doc);
            } 
            else{
                console.log("doc upload error: "+err);
                res.send("db error");
            }
       });
       
    }
}

//view doc by id
exports.viewdoc = function(models)
{
    return function(req, res)
    {
        if (req.session.user!=null)
        {
            //Find Document by Id
            models.DocModel.findById(req.query.id)
            .populate('owner')
            .exec(function(err,doc)
            {
                if (err){
                    console.log(err);
                    res.send("DB ERROR");
                }
                //Document View Will be different based on whether user is admin or not..
                //Not Admin
                if (req.session.user.wadmin!=true)
                {
                    //1. find the user group to which current user belongs to and importantly user group should be one of the groups in this workspace...
                    models.UserGroupModel.find({wid:doc.workspaceId,users_belong:req.session.user._id}).
                    populate('users_belong').
                    exec(function(err,ugroups)
                    {
                        if (err) {console.log(err); res.send("db error");}
                        //2. Find the tasks : Taskgargetgroup :::::
                        models.TaskModel.find({docid:doc._id,tasktargetgroup: {$in:ugroups}})
                        .sort({created_date: -1})
                        .populate('taskadder')
                        .populate('taskassignee')
                        .populate({path:'comments',options:{sort:{'created_date':'-1'}}})
                        .exec(function(err,tasks)
                        {
                            if (err){console.log(err); res.send("db errror"); }
                            res.render('view', { usersession:req.session.user,ugs:ugroups, docinfo: doc, mytasks:tasks});
                        });
                    });
                }
                //Yes, Admin
                else
                {
                    // Finding the tasks is different in admin's perspective of view
                    //1. find he user group who is belong to this workspace and who is allowed to see this document
                    models.UserGroupModel.find({wid:doc.workspaceId,'permissions.docid':req.query.id})
                    .populate('users_belong')
                    .exec(function(err,ugroups)
                    {
                        // ??? Not verified uesrs are not in the list automatically??? I've to solve...
                        if (err) { console.log(err); res.send("db error"); }
                        
                        //2. Find the tasks : tasktargetgroup and taskassignee:admin
                        models.TaskModel.find({tasktargetgroup: {$in:ugroups},docid:doc._id,taskassignee:req.session.user._id})
                        .sort({created_date: -1})
                        .populate('taskadder')
                        .populate('taskassignee')
                        .populate({path:'comments',options:{sort:{'created_date':'-1'}}})
                        .exec(function(err,tasks)
                        {
                            if (err){console.log(err); res.send("db errror"); }
                            res.render('view', { usersession:req.session.user,ugs:ugroups,docinfo: doc,mytasks:tasks});
                        });
                    });
                }
                    
                
            });
        }
        else
        {
            res.redirect('/login');
        }
    };
}