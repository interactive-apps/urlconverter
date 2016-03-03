/**
 * Created by Vincent P. Minde  on 3/2/16.
 */

var path = require('path')
var childProcess = require('child_process')
var phantomjs = require('phantomjs')
var binPath = phantomjs.path;

//system = require('system')
console.log(process.argv);
var outputFile = process.argv[2];

var dhisServer = "http://localhost:8080/dhis2"

var childArgs = [
    path.join(__dirname, 'rasterize.js'),
    "http://localhost:8080/dhis2",//'https://hmisportal.moh.go.tz/hmisportal/#/home',
    outputFile
];
var postfixsever   = require(__dirname + "/postfixsever");

//Excecute phantomjs to convert url to
childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
    if(err){
        console.log("Failed to fetch url",err);
    }else{
        //Fetch the group of user to get the report
        var request = require('request'),
            username = "kmbwilo",
            password = "DHIS2014",
            url = dhisServer +"/api/userGroups/FZ5zdaTkOFJ.json?fields=users[email]",
            auth = "Basic " + new Buffer(username + ":" + password).toString("base64");

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
                    var json = JSON.parse(body);
                    var emails = "";
                    //Extract emails
                    for (var user in json.users){
                        if(user == 0){
                            emails = json.users[user].email;
                        }else {
                            emails += ", " + json.users[user].email;
                        }
                    }
                    //Send the email
                    postfixsever.postfixSend({
                        msg:"Whats Up",
                        from:"vincent@localhost",
                        to:emails,
                        subject:"Awesome",
                        attachment:[
                            {path:outputFile, type:"application/pdf", name:"report.pdf"}
                        ]
                    },function(result){
                        console.log("Mail results",result);
                    })
                }

                // Do more stuff with 'body' here
            }
        );
    }
})
