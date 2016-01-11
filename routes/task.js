/*exports.save = function(models)
{
    return function(req, res)   
    {
        console.log(req.body);
        
        var comment = new models.CommentModel(
        {
            
            docid : req.body.docid,
            userid: "",
            comment_target: req.body.comm_tar,
            comment_text: req.body.comm_txt,
            all_selected: req.body.allselected,
            created_date: new Date()
        });
       comment.save(function (err) 
       {
            if (!err) {
                console.log('comment metadata saved');
                res.send("ok");
            } 
            else{
                console.log("comment upload error: "+err);
                res.send("error");
            }
       });
    };
}*/
exports.save=function(config,models,nodemailer,mailhelper)
{
    return function(req, res)   
    {
        var task = new models.TaskModel(
        {
            tasktype : req.body.tasktype,
            tasktitle:req.body.tasktitle,
            tasktargettext: req.body.tasktargettext,
            taskattention: req.body.taskattention,
            tasknote: req.body.tasknote,
            all_selected : req.body.all_selected,
            docid:req.body.docid,
            taskadder: req.body.taskadder,
            tasktargetgroup: req.body.tasktargetgroup,
            taskassignee: req.body.taskassignee,
            created_date: new Date()
        });
        
       task.save(function (err,tsk) 
       {
            if (!err) {
                console.log('task metadata saved');
                //Send JSON about the newly created task information with the populated info.
                tsk.populate('taskadder')
                .populate('taskassignee',function(err)
                {
                    if (err){console.log(err); res.send("error"); }
                    
                    var shtml="Hi, You're receiving this email notification because you're assigned a new task in the skyhatch user group. "
                        +" Click <a href='"+config.site.getUrl()+"login'> <b> here </b> </a> to login to skyhatch";
                    mailhelper(config,nodemailer,shtml,req.body.emails,"You're assigned a task.'");
                    
                    res.json(tsk);
                });
                
                
                
            } 
            else{
                console.log("task save error: "+err);
                res.send("error");
            }
       });
    }
}
exports.commentsave=function(models)
{
    return function(req, res)   
    {
        var comment = new models.CommentModel(
        {
            comment : req.body.comment,
            taskid: req.body.taskid,
            added_by: req.body.added_by,
            adder_name: req.body.adder_name,
            created_date: new Date()
        });
        
       comment.save(function (err,comm) 
       {
            if (!err) 
            {
                console.log('comment metadata saved');
                models.TaskModel.update({_id:req.body.taskid},{$pushAll:{comments:[comm._id]}},function(err)
                {
                    if (err){
                        console.log(err);
                        res.send("error")    
                    }
                    else
                    {
                        //Send JSON about the newly created comment information.
                        res.json(comm);
                    }
                });
            } 
            else{
                console.log("comment save error: "+err);
                res.send("error");
            }
       });
    }    
}
exports.realtime=function(models)
{
    return function(req,res)
    {
        //tgroup: target user groups
        //up_date : update : it's actually determins most recent time of the tasks in the workspace.... SEE Workspace.js in javascripts folder
        
        tgroups=req.body.targetgroups;
        task_up_date=req.body.task_up_date;
        part_of_tids=req.body.part_of_tids;
        n=req.body.n;
        console.log(tgroups);
        console.log(task_up_date);
        console.log(part_of_tids);
        console.log(n);
        if (req.session.user)
        {
            query=null;
            if (req.session.user.wadmin==true)
                query={tasktargetgroup: {$in:tgroups},taskassignee:req.session.user._id,created_date:{$gt:task_up_date}};
            else
                query={tasktargetgroup: tgroups,created_date:{$gt:task_up_date}};
            
                models.TaskModel.find(query)
                .sort({created_date: -1})
                .populate('docid','_id docname')
                .populate('taskadder')
                .populate('taskassignee')
                .exec(function(err,tasks)
                {
                    //Now it's time to realtime update for comment
                    if (err){console.log(err); res.send("error"); }
                    else
                    {
                        //If the count of task is not zero
                        if (n>0)
                        {
                            models.CommentModel.find({taskid:{$in:part_of_tids},created_date:{$gt:task_up_date},added_by:{$ne:req.session.user._id}})
                            .sort({created_date: -1})
                            .exec(function(err,com)
                            {
                                if (err){console.log(err); res.send("error"); }
                                else
                                {
                                    res.json({"tasks":tasks,"comments":com,task_up_date:new Date()});
                                }
                            });
                        }
                        else
                        {
                            res.json({"tasks":tasks,"comments":[],task_up_date:new Date()});
                        } 
                    }
  
                });
        }
        else
        {
            res.send("error");
        }
        
    }
}
exports.viewmore=function(models)
{
    return function(req,res)
    {
        if (req.session.user)
        {
             tgroups=req.body.targetgroups;
             task_below_date=req.body.task_below_date;
             
             query=null;
             if (req.session.user.wadmin==true)
                query={tasktargetgroup: {$in:tgroups},taskassignee:req.session.user._id,created_date:{$lt:task_below_date}};
             else
                query={tasktargetgroup: tgroups,created_date:{$lt:task_below_date}};
            
            models.TaskModel.find(query)
            .sort({created_date: -1}).limit(6)
            .populate('docid','_id docname')
            .populate('taskadder')
            .populate('taskassignee')
            .exec(function(err,tasks)
            {
                //Now it's time to realtime update for comment
                if (err){console.log(err); res.send("error"); }
                else
                {
                    task_below_date=(tasks.length>0) ? tasks[tasks.length-1].created_date : null;
                    res.json({"tasks":tasks,"task_below_date":task_below_date});
                }
            });
        }
        else
        {
            res.send("error");
        }   
    }
}