$(document).ready(function()
{
    //edit workspace name
    $(".workspaceedit").click(function(e)
    {
        $("#newworkspacename").val("");
       $("#exworkspacename").val($(e.target).attr("wname"));
       $("#exworkspaceid").val($(e.target).attr("wid"));
    });
    $("#btn_workspaceedit").click(function(e)
    {
        if ($("#newworkspacename").val().trim().length>0)
        {
            $("#editworkspaceform").submit();
        }
        else
        {
            alert("workspace name can't be blank'");
        }
        //editworkspaceform
    })
    
    //submit workspace create form 
    $("#btn_create_workspace").click(function()
    {
        if ($("#workspacename").val()!="")
        {
            $("#create_workspace_form").submit();
        }
    });

    // Write a comment in workspace
    $("#listingresult").delegate("input.commentbox","keypress",function(e)
    {
        var keycode = (e.keyCode ? e.keyCode : e.which);    
        if (keycode==13)
        {
            var comment=e.target.value;
            var comm_adderid=$("#comment_adderid").val();
            var comm_addername=$("#comment_addername").val();
            var comm_taskid=$(e.target.parentNode).find(".comment_taskid").val();
            
            
                

            $.post( "/task/comment/save", { "comment" : comment , 
                                            "taskid" : comm_taskid,
                                            "added_by":comm_adderid,
                                            "adder_name":comm_addername
                                          },
                    function( data ) 
                    {
                        // Task is saved in server side, Now Need to add task in client side.
                        if (data!="error")
                        {
                            drawComments([data]);
                            e.target.value="";
                        }
                        else
                            alert(data);
                    });
                    
        }
        
    });
    
    
    /******************Real Time Update !!!! Very Important *******************************/
    setInterval(function()
    {
       //Only if user groups array is not empty
       if (tgroups.length>0)
       {
           //tgroups: target user group
           //update : it's actually determins most recent time of the tasks in the workspace....
            //get the 6 ids of task that are most recent.  It 'll be sent to api end point and will fetch the real-time comments for you.
            //tids are the array of ids of all the tasks displayed in the current workspace panel...
            
            var n=(tids.length>10) ? 10: tids.length;
            var part_of_tids=tids.slice(0,n);
            
            //alert(part_of_tids);
            
            $.post( "/task/realtime", { "targetgroups":tgroups,"task_up_date": task_up_date,"part_of_tids":part_of_tids,'n':n},
            function( data ) 
            {
                console.log(data);
                if (data!="error")
                {
                    task_up_date=data.task_up_date;
                    if (data.tasks.length>0)
                        drawTask(data.tasks,true);
                    if (data.comments.length>0)
                        drawComments(data.comments);
                }
                //alert(data);                   
            });
       }
            
    },4500);
    
    function drawTask(tasks,viewmore)
    {
        for (i=0; i<=tasks.length-1; i++)
        {
            task=tasks[i];
            //for the tracking purpose of tgroup.
            tids.unshift(task._id);
            // Draw Task
            tktype=task.tasktype;
            tktime=new Date(task.created_date);
            tktime=(tktime.getMonth()+1)+"/"+tktime.getDate()+"/"+tktime.getFullYear()+" "+tktime.getHours()+":"+tktime.getMinutes();
            tkadder=task.taskadder[0].firstname+ " "+task.taskadder[0].lastname;
            tkattention=task.taskattention;
            tktypeclass="glyphicon glyphicon-pushpin";
            if (tktype==2) tktypeclass="glyphicon glyphicon-question-sign";
            
            var attentionimg='';
            if (tkattention==1)
                attentionimg='<img src="images/important.png">';
            else if (tkattention==2)
                attentionimg='<img src="images/urgent.png">';
                
            tkassignee="";
            task.taskassignee.forEach(function(man,index)
            {
                if (tkassignee!="") tkassignee=tkassignee+",";
                tkassignee=tkassignee+man.firstname+" " + man.lastname;
            })
            
                
            var taskhtml='<div class="col-sm-6" id="'+task._id+'">'
                +'<div class="result">'
                +'<h4><span class="'+tktypeclass+'"></span>'
                +task.tasktitle+'</h4>'
                +attentionimg
                +'<div class="col-sm-10 taskdocument"><span class="glyphicon glyphicon-file"></span><a href="view?id='+task.docid[0]._id+'">'+task.docid[0].docname+'</a></div>'
                +'<div class="col-sm-12 tasktargettext">'+task.tasktargettext +'</div>'
                +'<div class="col-sm-6"><p>Assigned to <b>'+tkassignee+'</b></p></div>'
                +'<div class="col-sm-6"><p class="date"><span class="glyphicon glyphicon-dashboard"></span>'+ tktime+'</p></div>'
                +'<div class="col-sm-6"><p>Added by <b>'+tkadder+'</b></p></div>'
                +'<div class="col-sm-6"><p class="tag"><span class="glyphicon glyphicon-tag"></span> Some tag</p></div>'
                +'<div class="col-sm-12 commentscount">All comments('+task.comments.length+')</div>'
                +'<div class="task_comments col-sm-12">'
                +'</div>'
                    
                +'<div class="col-sm-12 nopadding">'
                +'<input type="hidden" class="comment_taskid" value="'+task._id+'">'
                +'<input type="text" placeholder="write a comment and press enter" class="form-control commentbox">'
                +'</div>'
                +'</div>'
                +'</div>';
            if (viewmore==true)
            {
                $("#listingresult").prepend(taskhtml);
            }
            else
            {
                $("#listingresult").append(taskhtml);
            }
                        
            if (tktype==1 && viewmore==true)
            {
                var lefttaskhtml='<div class="task">'
                        +'<div class="tktitle-1">'+task.tasktitle+'</div>'
                        +'<div><span>Assigned by <b>'+tkadder+'</b></span></div>'
                        +'<div><span class="glyphicon glyphicon-calendar"></span>'+tktime+'</div>'
                        +'</div>';
                $("#mytasks").prepend(lefttaskhtml);
            }
        }
    }
    function drawComments(comments)
    {
        for (i=0; i<=comments.length-1; i++)
        {
            comment=comments[i];
            comdate=new Date(comment.created_date);
            comdate=(comdate.getMonth()+1)+"/"+comdate.getDate()+"/"+comdate.getFullYear()+" "+comdate.getHours()+":"+comdate.getMinutes();
            var commenthtml='<div class="eachcomment">'
                            +'<div class="ec-adder"><span>'+comment.adder_name+'</span> <span class="glyphicon glyphicon-time"></span>'+comdate+'</div>'
                            +'<div class="ec-text">'+comment.comment+' </div>'
                            +'</div>';
                            
            $("#"+comment.taskid+" .task_comments").prepend(commenthtml);
        }
    }
    /*****************Real Time Update !!!! End ******************************************/
    
    /************* VIEW MORE AJAX CALL *****
    * 
    */
    $("#btn_viewmore").click(function()
    {
        $("#nomore").html("Loading...");
        $("#btn_viewmore").prop("disabled",true);
       $.post( "/task/viewmore", { "targetgroups":tgroups,"task_below_date": task_below_date},
            function( data ) 
            {
                
                console.log(data);
                if (data!="error")
                {
                    $("#nomore").html("View More");
                    $("#btn_viewmore").prop("disabled",false);
                    task_below_date=data.task_below_date;
                    if (task_below_date==null) {
                        $("#nomore").html("No More");
                        $("#btn_viewmore").prop("disabled",true);
                    }
                    if (data.tasks.length>0)
                        drawTask(data.tasks,false);
                }
                else
                {
                    alert(data);
                }
            });
    });
    /**** View MORE END ****/
    
    //to be changed
    $('div.one p').click(function() {
         $('div.user').toggle();
     });
   
     //dropdown documents
     $('div.doc').mouseenter(function  () 
     {
         $('div.documents').show();
     });
     $('div.documents').mouseleave(function  () {
       $(this).hide();
     });
     
     
     //config button 
     /*
     $('.config').mouseenter(function  () {
         $('.hidden-config').show();
     });
      $('.hidden-config').mouseleave(function () {
        $(this).hide();
      });*/
      /*
      <div class="hidden-config">
                          <ul>
                            <li><a href="#">Collapse All</a></li>
                            <li><a href="#">Expand All</a></li>
                            <li><a href="#">Sort</a></li>
                          </ul>
                        </div> 
      */
}); 