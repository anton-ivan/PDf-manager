module.exports=function(config,nodemailer,msg,toaddr,subject_txt)
{
     var smtpTransport = nodemailer.createTransport("SMTP",{
        service: "Gmail",
        auth: config.Gmail
    });
    
    var mailOptions = {
        from: config.mail.from, // sender address
        to: toaddr, // list of receivers
        subject: subject_txt, // Subject line
        html: msg
    };

    // send mail with defined transport object
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            res.send("email error: try again!");
            console.log("email error"+error);
        }else{
            console.log("Message sent: " + response.message);
        }
        // if you don't want to use this transport object anymore, uncomment following line
        smtpTransport.close(); // shut down the connection pool, no more messages
    });
}