/**
 * Created by Vincent P. Minde  on 3/2/16.
 */
//Sample command nodejs start -url http://localhost:8080/dhis2 -dhis http://localhost:8080/dhis2 -u kmbwilo -p DHIS2014 -o /tmp/output.pdf -mu mailname -mp password -mh localhost

/**
 * Currently used command
 *
 *  nodejs start -url https://hmisportal.moh.go.tz/fpportal/nationalPDF.html -dhis http://localhost:8080/dhis2 -group "FPlaning Users" -u admin -p district -o /tmp/output.pdf -mu user@gmail.com -mp pass -mh smtp.gmail.com
 *
 */
var path = require('path')
var childProcess = require('child_process')
var phantomjs = require('phantomjs')
var binPath = phantomjs.path;

var outputFile = "/tmp/output.pdf",dhisServer = "http://localhost:8080/dhis2",
username = "", password = "",mailUser = "",mailPassword = "", mailHost = "localhost", urlToConvert = "http://localhost:8080/dhis2",userGroup = "";
//Evaluate arguments
for(var index = 0;index <  process.argv.length; index++){
    var commandArgument = process.argv[index];
    if(commandArgument == "-dhis"){
        dhisServer = process.argv[index + 1];
    }else if(commandArgument == "-u"){
        username = process.argv[index + 1];
    }else if(commandArgument == "-p"){
        password = process.argv[index + 1];
    }else if(commandArgument == "-o"){
        outputFile = process.argv[index + 1];
    }else if(commandArgument == "-mu"){
        mailUser = process.argv[index + 1];
    }else if(commandArgument == "-mp"){
        mailPassword = process.argv[index + 1];
    }else if(commandArgument == "-mh"){
        mailHost = process.argv[index + 1];
    }else if(commandArgument == "-url"){
        urlToConvert = process.argv[index + 1];
    }else if(commandArgument == "-group"){
        userGroup = process.argv[index + 1];
    }
}

var childArgs = [
    path.join(__dirname, 'rasterize.js'),
    urlToConvert,//'https://hmisportal.moh.go.tz/hmisportal/#/home',
    outputFile
];
var postfixsever   = require(__dirname + "/postfixsever");

//Excecute phantomjs to convert url to
childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
    if(err){
        console.log("Failed to fetch url:",err);
    }else{
        //Fetch the group of user to get the report
        var request = require('request'),
            url = dhisServer +"/api/userGroups.json?filter=name:eq:"+userGroup+"&fields=users[email,name]",
            auth = "Basic " + new Buffer(username + ":" + password).toString("base64");
            console.log(url);
        request(
            {
                url : url,
                headers : {
                    "Authorization" : auth
                }
            },
            function (error, response, body) {
                if(error){
                    console.log(error);
                }else{
                    //Parse the body into json object
                    /*var json = JSON.parse(body);
                    var emails = "";
                    var users = json.userGroups[0].users;
                    //Extract emails
                    for (var user in users){
                        if(user == 0){
                            emails = users[user].name + " <" + users[user].email +">";
                        }else {
                            emails += ", " + users[user].name + " <" + users[user].email +">";
                        }
                    }
                    //Send the email
                    postfixsever.postfixSend(
                        {
                            user: mailUser,
                            password: mailPassword,
                            host: mailHost,
                            ssl: true
                        },
                        {
                            msg: "Reports Generated By DHIS 2",
                            from: "senyoni@hmisportal.moh.go.tz.com",
                            to: emails,
                            subject: "Sample Report",
                            attachment: [
                                {path: outputFile, type: "application/pdf", name: "report.pdf"}
                            ]
                    },function(result){
                        console.log("Mail results",result);
                    })*/
                    childProcess.execFile("mail", [
                        "-s",
                        "This is the Subject",
                        "-t",
                        "vincentminde@gmail.com",
                        "-a",
                        outputFile,
                        "This is the mail"
                    ], function(err, stdout, stderr) {
                        if(err){
                            console.log("Error:",JSON.stringify(err))
                        }else{
                            console.log("Awesome:",JSON.stringify(stdout))
                        }
                    })
                }

                // Do more stuff with 'body' here
            }
        );
    }
})
