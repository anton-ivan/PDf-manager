exports.signup = function(config,models,nodemailer,mailhelper)
{
    return function(req, res)   
    {
        console.log(req.body);
        
        //check the email already exists
        models.UserModel.findOne({ email: req.body.email}, function (err, usr)
        {
            if (err)
            {
                console.log(err);
                res.send(err);
            }
            else if (usr)
            {
                res.redirect("/login?opt=4");
            }
            else
            {
                
                var user = new models.UserModel(
                { 
                    firstname : req.body.firstname,
                    lastname: req.body.lastname,
                    email: req.body.email,
                    companyname: req.body.companyname,
                    phonenumber: req.body.phonenumber,
                    password:req.body.password,
                    wadmin: true,
                    created_date: new Date(),
                    verified: false
                });
               user.save(function (err,usr) 
               {
                   
                    if (!err) {
                        console.log('user data saved');
                        var shtml="Hi, "+req.body.firstname+" "+req.body.lastname+", Welcome to Skyhatch!<br>"
                        +" Click <a href='"+config.site.getUrl()+"users/verify?token="+usr.id+"'> <b> here </b> </a> to verify your account";
                        mailhelper(config,nodemailer,shtml,req.body.email,"Welcome to Skyhatch");
                        res.redirect("/login?opt=1");
                    } 
                    else{
                        console.log("user registry error: "+err);
                        res.send("error");
                    }
               });
                
            }
        });
    }
        
}
exports.login=function(models)
{
    return function(req,res)
    {
        
        models.UserModel.findOne({ email: req.body.email, password: req.body.password }, function (err, usr)
        {
            if (err){
                console.log(err);
                res.send(err);
            }
            else if (usr)
            {
                console.log(usr._id);
                if (usr.verified==true)
                {
                    req.session.user = usr;
                    res.redirect("/workspace");
                }
                else
                    res.redirect('/login?opt=5')
            }
            else          
                res.redirect("/login?opt=3");
        });
    }
}
exports.verify=function(models)
{
    return function(req,res)
    {
        if (typeof req.query.token=="undefined")
            res.redirect("/signup");
        models.UserModel.update({ _id: req.query.token }, { verified:true }, null , function (err, numberAffected, raw) 
        {
            if (err)
            {
                console.log(err)
                res.send("error");
            }
            console.log("verified row"+numberAffected);
            if (numberAffected>0)
            {
                //setup default workspace after verification and redirect to login window
                var defalt_workspace = new models.WorkspaceModel(
                {
                    name: "Default workspace",
                    desc: "",
                    admin: req.query.token,
                    created_date: new Date(),

                });
                defalt_workspace.save(function (err) 
                {
                    if (!err) {
                        console.log('workspace metadata saved');
                        res.redirect("/login?opt=6");
                    } 
                    else{
                        console.log("workspace create error: "+err);
                        res.send("db error");
                    }
                });
            }
            else
            {
                //it means that there is no user with verification id
                res.redirect("/login?opt=2")
            }
        });
                
    };
};
exports.inviteuser=function(config,models,nodemailer,mailhelper)
{
    return function(req,res)
    {
        var strFailed="Invitation Failed: ";
        var strDone="Invitation Done";
        //Whether the user is in skyhatch user database
        models.UserModel.findOne({email:req.body.inviteemail.trim()},function(err,user)
        {
           if (err) { console.log(err); res.send("error"); } 
           //yes, this is signed user
           if (user)
           {
               //is it admin??
               if (user.wadmin==true)
                res.send(strFailed+"Invited user is workspace admin");
               //no
               // check if invited user already exists in the group              
               models.UserGroupModel.findOne({users_belong: user.id, _id:req.body.invitegroup},function(err,ug)
               {
                   if (err) { console.log(err); res.send("error"); }
                   // user already exists in the use group
                   if (ug) {
                       res.send(strFailed+" The invited user is already in the user group."); 
                   }
                   // Two cases: user is in other user group or user is in invitation process for the this group or other user group
                   else
                   {
                       // the user is in other user group
                       /*
                       if (user.firstname)
                       {
                            res.send(user.firstname);
                       }
                       // the user is in invitation process
                       else
                       {
                           res.send("2");
                       }*/
                       var msg="Hi, You're invited to skyhatch user group. Click <a href='"+config.site.getUrl()+"users/accept_invite?uid="+user.id+"&ugid="+req.body.invitegroup+"'> <b> here </b>                             </a> to accept invitation.";
                       mailhelper(config,nodemailer,msg,req.body.inviteemail.trim(),"Skyhatch Invitation");
                       res.send(strDone);
                       
                   }
                   
               });
               
           }
           //no , the user is new.
           else
           {
               var newuser = new models.UserModel(
               { 
                    email: req.body.inviteemail,
                    wadmin: false,
                    verified: false
               });
               
               newuser.save(function (err,usr) 
               {
                if (err){
                 console.log(err); res.send("db error"); 
                }
                else
                {
                    console.log('user data saved');
                    var msg="Hi, You're invited to skyhatch user group. Click <a href='"+config.site.getUrl()+"users/accept_invite?uid="+usr.id+"&ugid="+req.body.invitegroup+"'> <b> here </b>                             </a> to accept invitation.";
                    mailhelper(config,nodemailer,msg,req.body.inviteemail.trim(),"Skyhatch Invitation");
                    res.send(strDone);
                } 
               });
           }
           
        });
    };
}
// Accept invite
exports.accept_invite=function(models)
{
    return function(req,res)
    {
        if (req.query.uid&& req.query.ugid)
        {
            models.UserModel.findOne({_id:req.query.uid},function(err,user)
            {
               if (err) { console.log(err); res.send("error"); } 
               if (!user)            
                   res.send("you're not authorized to access.");
               
               //Is he the member of other group?
               if (user.firstname)
               {
                   res.render("invite-login",{email:user.email,uid:req.query.uid,ugid:req.query.ugid});
               }
               else
               {
                   res.render("invite-signeup",{email:user.email,uid:req.query.uid,ugid:req.query.ugid});
               }
            });
        }
        else
        {
            res.send("you're not authorized to access.");
        }
        
    }
}
//invite signe up
exports.invite_confirm=function(models)
{
    return function(req,res)
    {
        if (req.body.uid&& req.body.ugid)
        {
            models.UserModel.update({_id:req.body.uid},{$set:{firstname:req.body.firstname,lastname:req.body.lastname,companyname:req.body.companyname,
                                phonenumber: req.body.phonenumber,
                                password:req.body.password,
                                created_date:new Date(),
                                verified:true}},function(err)
                                {
                                   if (err){console.log(err); res.send("db error"); } 
                                   console.log(req.body);
                                   res.render("invite-login",{email:req.body.email,uid:req.body.uid,ugid:req.body.ugid,opt:1});
                                });
        }
        else
        {
            res.send("you're not authorized to access.");
        }
    }
}
//add user to user group
exports.addtogroup=function(models)
{
    return function(req,res)
    {
        models.UserModel.findOne({ email: req.body.email, password: req.body.password }, function (err, usr)
        {
            if (err){
                console.log(err);
                res.send("db error");
            }
            else if (usr)
            {
                models.UserGroupModel.update({_id:req.body.ugid},{$pushAll:{users_belong:[req.body.uid]}},function(err)
                {
                    if (err){
                        console.log(err);
                        res.send("db error")    
                    }    
                    req.session.user=usr;
                    res.redirect('/workspace');
                });
            }
            else
                res.render("invite-login",{email:req.body.email,uid:req.body.uid,ugid:req.body.ugid,opt:2});
        });       
    }
}
//set permission
exports.setpermission=function(models)
{
    return function(req,res)
    {
        var data=req.body.data;
        var data_ary=data.split("&");
        var ugid=data_ary[0].split("=");
        var perm_ary=[];
        for (i=1; i<=data_ary.length-1; i++)
        {
            docary=data_ary[i].split("=");
            //jsonstring= '{"' +docary[0] + '" : ' + 7 + "}";
            //perm_ary.push( JSON.parse(jsonstring));
            perm_ary.push({docid:docary[0],perm:7});
            
        }
        console.log(perm_ary);
        
        models.UserGroupModel.update({_id:ugid[1]},{$set:{permissions:perm_ary}},function(err)
        {
            if (err){console.log(err); res.send("db error");}
            res.send("ok");
        })
    }
}