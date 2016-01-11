$(document).ready(function()
{
    // Initialize multiple file uploader        
    var settings = {
        url: "/docupload",
        method: "POST",
        allowedTypes:"pdf",
        fileName: "myfile",
        maxFileSize:1024*1024*4,
        multiple: true,
        onSuccess:function(files,data,xhr)
        {
            //Upon successful upload of document, you need to update document list in the workspace doc list(right side);
            $("#wspace_doclist").append('<a href="view?id='+data._id+'">'+data.docname+'</a>');
            $("#docupload_status").html("<font color='green'>Upload was done successfully.</font>");
        
        },
        onError: function(files,status,errMsg)
        {        
            $("#docupload_status").html("<font color='red'>Upload was Failed</font>");
        }
    }
    
    $("#mulitplefileuploader").uploadFile(settings);
});
