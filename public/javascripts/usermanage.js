$(document).ready(function()
{    
    //create new user group
    $("a.newgroup").click(function()
    {
       $("#wspaceforusergroup").val(this.getAttribute("wid")) ;
    });
    $("#btn_new_usergroup").click(function()
    {
        if ($("#usergroupname").val()!="")
        {
            $("#create_usergroup_form").submit();
        }
    });
    $("#btn_sendinvitation").click(function()
    {
        optcnt=$("#invitegroup").children('option').length;
        if (optcnt>0 && $("#inviteemail").val()!="")
        {
            
            $.post( "/users/invite_user", { "inviteemail" : $("#inviteemail").val() , "invitegroup" : $("#invitegroup").val()},
            function( data ) 
            {
               alert(data); 
            });
        }
    });
    $("#permissionsave").click(function(e)
    {
        e.preventDefault();
        $.post( "/users/setpermission", { "data" : $("#permission_form").serialize()},
            function( data ) 
            {
               alert(data); 
            });
    });
    
     //to be changed
    $('div.one p').click(function() {
         $('div.user').toggle();
     });
   
     //dropdown documents
     $('div.doc').mouseenter(function  () {
         $('div.documents').show();
     });
     $('div.documents').mouseleave(function  () {
       $(this).hide();
     });
     
});