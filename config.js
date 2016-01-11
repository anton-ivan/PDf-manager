var config = {
    
    express: {
        session : {
            secret: '1234567890QWERTY',
            maxAge: 3600000
        }
    },
    site: {
        url : "localhost",
        //url : "ec2-54-200-143-127.us-west-2.compute.amazonaws.com",
        port: 8000,
        database:{
          mongodb:{
            connectionString_dev: "mongodb://localhost/docdb",
            connectionString_local: 'mongodb://localhost/docdb'
          }
        },
        getUrl : function(segment){
            if (segment === undefined) segment = "";
            var port = (this.port == 80)?"":":"+this.port;
            if (this.url == "localhost"){
                return "http://"+this.url+port+"/"+segment;
            }
            return "http://"+this.url+"/"+segment;
        },
        
        getMongoConfig : function(){
            if (this.url == "localhost"){
                return {
                    db: 'docdb',
                    host: 'localhost',
                };
            }else{
                return {
                    db: 'docdb',
                    host: 'localhost',
                };
            }
        },
        
        getMongoConnectionString : function()
        {
            if (this.url == "localhost"){
                return this.database.mongodb.connectionString_local;
            }else{
                return this.database.mongodb.connectionString_dev;
            }
        }
    },
    Gmail:{
        user: "boris.petrov1214@gmail.com",
        pass: "sojinah19891214"
    },
    
    mail:{
        from: "admin<admin@skyhatch.com>"
    }
        
};
module.exports = config;