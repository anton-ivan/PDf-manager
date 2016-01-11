
 $(document).ready(function()
{
    var allSelectedEl; // String of id and index of  highlighted Divs
    var els; //Array of highlighted divs, This array is useful for drawing after save task...
    
    $body = $("body"); // body handler for loading gif...
    
    $("#btn_tasktype").tooltip(); //tooltip for task type
    //disable context menu in the viewer
    $("#viewer").contextmenu(function(e)
    {
        e.preventDefault();
    });
    
    
        
    //Task/Query side bar 
    var documentWidth= $( window ).width();
    var documentHeight= $( window ).height();
    
    $("#tasklist").dialog(
        {
            width:documentWidth*0.15,
            height:documentHeight*0.8
        }
    );
    $("#tasklist").dialog('option', 'position', [documentWidth*0.83,documentHeight*0.15]);
    
    //Task /Query dialogbox
    $( "#taskdialog" ).dialog({
    
      autoOpen: false,
      modal:true,
      width:300,
      show: 
      {
        effect: "blind",
        duration: 300
      },
      hide: 
      {
        effect: "explode",
        duration: 400
      }
    });
    
    $( "#extaskdialog" ).dialog({
    
      autoOpen: false,
      modal:true,
      width:300,
      show: 
      {
        effect: "blind",
        duration: 300
      },
      hide: 
      {
        effect: "explode",
        duration: 400
      }
    });
    
    
    // This event checkes whether the text is highlighted or not.
    // If the text is not highlighted, then it checks whether the user clicked highlighted text...
    $("#viewer").mouseup(function(e)
    {
        
        // so , if parent node is pageContainer (in this case , you clicked blank area in the page) or the parent node is .textLayer div 
        var clickable_area_id=e.target.parentNode.id;
        if (!(clickable_area_id=="" || clickable_area_id.search("pageContainer")!=-1)) return;
        
        var selection = window.getSelection(); 
        allSelectedEl="";
        
        // The text is highlighted
        if (selection.toString().length>0)
        {
            var range = selection.getRangeAt(0);        
            var allWithinRangeParent;
            
            // allWithinRangeParent is the array of div in which highlighted text 's  div resides.
            // Sometimes you might select only one line and it might occur the error in getElementsByTagName
            // So It needs comparision whether it's text node or not
            nodename=range.commonAncestorContainer.nodeName
            if (nodename=="#text")
            {
                allWithinRangeParent=Array();
                allWithinRangeParent[0]=range.commonAncestorContainer.parentNode;
            }
            else
                allWithinRangeParent = range.commonAncestorContainer.getElementsByTagName("*");
            
        
            // initialize els every time 
            els=[];
            // Extract the id and index of the divs that are highlighted       id : pagecontainer id , index: index of divs in .textLayer div
            for (var i=0, el; el = allWithinRangeParent[i]; i++) 
            {
                // The second parameter says to include the element 
                // even if it's not fully selected
            
                if (selection.containsNode(el, true) ) 
                {
                    els.push(el);
                    allSelectedEl=allSelectedEl+ el.getAttribute("target_index")+"|";
                }
            }
            
            $("#tasktitle").val("");
            $("#tasknote").val("");
            $("#taskattention").val(0);
            chks=$("#userslistfortask input:checkbox")
            for (i=0; i<=chks.length-1; i++)
                $(chks[i]).prop("checked",false);
            $(".tasktarget").html("..."+selection.toString()+"...");
            $("#tasktargettext").val(selection.toString());
            
            $( "#taskdialog" ).dialog( "open" );
        }
        else
        {
            if (e.target.className.search("highlighted_div")!=-1) // clicked highlighted area
            {
                //!!! VERY IMPORTANT : When clicked highlighted pdf txt
                // 1. Get the id of the task id from attribute task_id of highlighted div. In text_layher_builder.js , I customized every highlighted div have attribute of task_id
                // 2. Again Attribute Trick, Get the task-related data from the attributes of $(task_id).getattribute
                // 3. Set the field of dialogbox as the extracted value
                //4. Display comments
                //5. Fill the hidden value that is necessary to save comment.
                // 1. 
                var taskid=e.target.getAttribute("task_id");
                var taskobj=$("#"+taskid);
                
                // 2. 
                var tasktype=taskobj.attr("tasktype");
                var tasktitle=taskobj.attr("tasktitle");
                var tasknote=$("#"+taskid+" a.tknote").html();
                var taskdate=taskobj.attr("taskdate");
                var taskadder=taskobj.attr("taskadder");
                var taskassignee=taskobj.attr("taskassignee");
                
                //3.
                if (tasktype==1)
                    $("#extasktype").removeClass("glyphicon-question-sign").addClass("glyphicon-pushpin");
                else
                    $("#extasktype").removeClass("glyphicon-pushpin").addClass("glyphicon-question-sign");
                $("#extasktitle").html(tasktitle);
                $("#extasktime").html(taskdate);
                $("#extaskadder").html(taskadder);
                $("#extaskassignee").html(taskassignee);
                
                //4.
                var commentsdiv=$("#"+taskid+" .task_comments").html();
                $("#extaskcomments").html(commentsdiv);
                //5.
                $("#comm_taskid").val(taskid);
                
                $( "#extaskdialog" ).dialog( "open" );
                //alert(e.target.getAttribute("task_id"));
            }
        }
         
    });
    
    
    // click the task in the task list
    $("#tasklist").delegate("a","click",function(e)
    {
         e.preventDefault();
        //extract the id and index list of the task 
         var listOfIndex=e.target.id;
         var arrayOfList=listOfIndex.split("|");
         var first_item=arrayOfList[0].split("x"); //[0] is id, [1] is index

         // change the page no in the tool bar 
         $("#pageNumber").val(first_item[0]);
         
         //Go to the specified page.
         PDFView.page=first_item[0];
         
         setTimeout(function()
         {
            target_to_scroll=$("#pageContainer"+first_item[0]+" div.textLayer div[target_index='"+arrayOfList[0]+"']"); 
            target_to_scroll.attr("tabindex",-1).focus();
         },400)
    });
    
    //Select the type of task
    $("#btn_tasktype").click(function()
    {
        if ($("#tasktype").val()==1)
        {
            $("#btn_tasktype span").removeClass("glyphicon-pushpin");
            $("#btn_tasktype span").addClass("glyphicon-question-sign");
            $("#tasktype").val(2);
        }
        else
        {
            $("#btn_tasktype span").addClass("glyphicon-pushpin");
            $("#btn_tasktype span").removeClass("glyphicon-question-sign");
            $("#tasktype").val(1);
        }
    });
    
    // after click task button 
    $("#btn_canceltask").click(function()
    {
        jQuery('#taskdialog').dialog('close');
    }) ;
    
    //Click Save in the task dialog
    $("#btn_savetask").click(function()
    {
        var tasktype=$("#tasktype").val();
        var tasktitle=$("#tasktitle").val();
        var tasktargettext=$("#tasktargettext").val();
        var taskattention=$("#taskattention").val();
        var tasknote=$("#tasknote").val();
        var chk_userlist=$("#userslistfortask input:checked");
        var taskassignee=[];
        var emails=[];
        var allselected=allSelectedEl;
        //get the assignee list
        for (i=0; i<=chk_userlist.length-1; i++)
        {
            
            taskassignee.push(chk_userlist[i].id);
            emails.push(chk_userlist[i].getAttribute("email"));
        }
        
        
        var taskadder=$("#taskadder").val();
        
        if (tasktitle==""){ alert("Input Title"); return;}
        if (taskassignee.length<1) {alert("Select the assignee"); return;}
        if (tasknote==""){ alert("Input Note"); return;}
        var tasktargetgroup=chk_userlist[0].getAttribute("ug");
        
        $.post( "/task/save", { "tasktype" : tasktype , 
                                "tasktitle" : tasktitle,
                                "tasktargettext":tasktargettext,
                                "taskattention":taskattention,
                                "tasknote":tasknote,
                                "taskassignee":taskassignee,
                                "taskadder":taskadder,
                                "tasktargetgroup":tasktargetgroup,
                                "all_selected": allselected,
                                "emails":emails.join(","),
                                "docid": ID_OF_DOC},
                function( data ) 
                {
                    // Task is saved in server side, Now Need to add task in client side.
                    if (data!="error")
                    {
                        //Value copy of array, not reference copy
                        //This is necessary because user might highlight again before save and draw process is done...
                        copyofels=els.slice(0);
                        drawTask(data,copyofels);
                    }
                    else
                        alert(data);
                });                
        jQuery('#taskdialog').dialog('close');
        
    });
    
    
    //Render New Task based on JSON data.
    //It'll be reused for real-time rendering of task...
    function drawTask(data,copyofels)
    {
        taskid=data._id;
        tasktype=data.tasktype;
        tasktitle=data.tasktitle;
        taskdate=new Date(data.created_date);
        taskdate=(taskdate.getMonth()+1)+"/"+taskdate.getDate()+"/"+taskdate.getFullYear()+" "+taskdate.getHours()+":"+taskdate.getMinutes();
        taskadder=data.taskadder[0].firstname+ " "+ data.taskadder[0].lastname;
        tasknote=data.tasknote;            
        taskattention=data.taskattention;            
        taskassignee="";          
        
        data.taskassignee.forEach(function(man,index)
        {
            if (taskassignee!="") taskassignee=taskassignee+"<br>";
            taskassignee=taskassignee+man.firstname+" " + man.lastname;
        })
        
       
       // Tasklist sidebar Render 
       var tasklisthtml='<div class="eachtask" id="'+data._id+'"'+'tasktitle="'+tasktitle+'"'
                        +'taskassignee="'+taskassignee+'"'+ 'taskadder="'+taskadder+'"'+'taskdate="'+taskdate+'"'+'tasktype="'+tasktype+'"'+ 'taskattention="'+taskattention+'">'
                        +'<div class="taskheader">'
                        +'<a href="#" class="tknote" id="'+data.all_selected+'">'+tasktitle+' </a>'
                        + '</div>'
                        +'<div class="taskfooter">' + taskadder+" " + taskdate+'</div>'
                        +'<div class="task_comments"></div>'
                        +'</div>';
        $("#tasklist").prepend(tasklisthtml);
        
        if (copyofels && copyofels.length>0)
        {
            for (i=0; i<=copyofels.length-1; i++)
            {
                copyofels[i].className  =  copyofels[i].className + " highlighted_div";
                copyofels[i].setAttribute("task_id",taskid);
            }
        }
    }
      
    // Save comment
    $("#btn_savecomment").click(function()
    {
        
        
        var comment=$("#extaskcomment").val();
        var comm_taskid=$("#comm_taskid").val();
        var comm_adderid=$("#comm_adderid").val();
        var comm_addername=$("#comm_addername").val();
      
        
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
                        var dateobj=new Date(data.created_date);
                        dateobj=(dateobj.getMonth()+1)+"/"+dateobj.getDate()+"/"+dateobj.getFullYear()+" "+dateobj.getHours()+":"+dateobj.getMinutes();
                        
                        var chtml='<div class="eachcomment">'+
                            '<div class="ec-adder"><span>'+data.adder_name+'</span> <span class="glyphicon glyphicon-time"></span>'+dateobj+'</div>'+
                            '<div class="ec-text">'+data.comment+'</div>'+
                            '</div>';
                        
                        $("#"+data.taskid+" .task_comments").prepend(chtml);
                    }
                    else
                        alert(data);
                });                
        jQuery('#extaskdialog').dialog('close');  
    });
    
    



    
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
         
});

