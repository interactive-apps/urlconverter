/**
 * Created by Vincent P. Minde  on 3/2/16.
 */
//Sample command nodejs start -url http://localhost:8080/dhis2 -dhis http://localhost:8080/dhis2 -u kmbwilo -p DHIS2014 -o /tmp/output.pdf -mu mailname -mp password -mh localhost

/**
 * Currently used command
 *
 *  sudo nodejs start -url https://hmisportal.moh.go.tz/fpportal/nationalPDF.html -dhis https://hmisportal.moh.go.tz/training -group "Family Planning Report" -u vincentminde -p Ilovemymum1 -o /tmp/output.pdf -mh localhost
 *
 */



var dhisServer = "http://localhost:8080/dhis2",
    username = "", password = "", mailUser = "", mailPassword = "", mailHost = "localhost", userGroup = "";
//Evaluate arguments
for (var index = 0; index < process.argv.length; index++) {
    var commandArgument = process.argv[index];
    if (commandArgument == "-dhis") {
        dhisServer = process.argv[index + 1];
    } else if (commandArgument == "-u") {
        username = process.argv[index + 1];
    } else if (commandArgument == "-p") {
        password = process.argv[index + 1];
    } else if (commandArgument == "-mu") {
        mailUser = process.argv[index + 1];
    } else if (commandArgument == "-mp") {
        mailPassword = process.argv[index + 1];
    } else if (commandArgument == "-mh") {
        mailHost = process.argv[index + 1];
    } else if (commandArgument == "-group") {
        userGroup = process.argv[index + 1];
    }
}

var attachments = {};
function fetchReport(organisationUnit){
    var Promise = require('promise');
    var url = "";
    if(organisationUnit.level == "1"){
        url = "https://hmisportal.moh.go.tz/fpportal/nationalPDF.html";
    }else if(organisationUnit.level == "2"){
        url = "https://hmisportal.moh.go.tz/fpportal/regionPDF.html#/home?uid=" + organisationUnit.id;
    }else if(organisationUnit.level == "3"){
        url = "https://hmisportal.moh.go.tz/fpportal/districtPDF.html#/home?uid=" + organisationUnit.id;
    }
    return new Promise(function (resolve, reject) {
        if(url == "" || attachments[organisationUnit.id]){
            reject();
            return;
        }
        var path = require('path');
        var childProcess = require('child_process');
        var phantomjs = require('phantomjs');
        var binPath = phantomjs.path;

        var date = new Date();
        var outputFile = "tmp/report" + date.getFullYear() + "."  + (date.getMonth() + 1)+ "."  + date.getDay()+ "."  + date.getHours()+ "."  + date.getMinutes()+ "."  + date.getSeconds()+ "."  + date.getMilliseconds() + ".pdf"
        var childArgs = [
            path.join(__dirname, 'rasterize.js'),
            url,//'https://hmisportal.moh.go.tz/hmisportal/#/home',
            outputFile
        ];
        var postfixsever = require(__dirname + "/postfixsever");

        //Excecute phantomjs to convert url to
        childProcess.execFile(binPath, childArgs, function (err, stdout, stderr) {
            if (err) {
                console.log("Failed to fetch url:", err);
                reject();
            } else {
                attachments[organisationUnit.id] = {path: outputFile, type: "application/pdf", name: organisationUnit.name + " Report.pdf"};
                resolve();
                //Fetch the group of user to get the report

            }
        });
    });
}

var emails = "";
function fetchUsers(){
    var request = require('request'),
        url = dhisServer + "/api/userGroups.json?filter=name:eq:" + userGroup + "&fields=users[email,name,organisationUnits[id,name,level]]",
        auth = "Basic " + new Buffer(username + ":" + password).toString("base64");
    var Promise = require('promise');

    return new Promise(function (resolve, reject) {
        request(
            {
                url: url,
                headers: {
                    "Authorization": auth
                }
            },
            function (error, response, body) {
                if (error) {
                    reject(error);
                    console.log(error);
                } else {
                    var allPromises = [];
                    //Parse the body into json object
                    var json = JSON.parse(body);

                    var users = json.userGroups[0].users;
                    //Extract emails
                    for (var userIndex in users) {

                        allPromises.push(sendUserEmails(users[userIndex]));
                    }
                    console.log(emails);
                    resolve(emails);
                    Promise.all(allPromises)
                        .then(function (res) {
                            console.log("Emails sent successfully.")
                        });
                }

                // Do more stuff with 'body' here
            }
        );
    });
}
function sendUserEmails(user){
    var Promise = require('promise');

    return new Promise(function (resolve, reject) {
        var email = user.name + " <" + user.email + ">";
        var promises = [];

        for(var orgUnit in user.organisationUnits){

            promises.push(fetchReport(user.organisationUnits[orgUnit]));
        }
        Promise.all(promises)
            .then(function (res) {
                var userAttachments = [];
                for(var orgUnit in user.organisationUnits){
                    userAttachments.push(attachments[user.organisationUnits[orgUnit].id]);
                }
                sendEmail(email,userAttachments).then(function(){
                    resolve();
                });
            });
    });

}
function sendEmail(email,attachments){
    var Promise = require('promise');
    return new Promise(function (resolve, reject) {
        var postfixsever = require(__dirname + "/postfixsever");
        postfixsever.postfixSend(
            {
                user: mailUser,
                password: mailPassword,
                host: mailHost,
                ssl: false,
                port: 25
            },
            {
                msg: "Reports Generated By DHIS 2",
                from: "portal@hmisportal.moh.go.tz",
                to: email,
                subject: "Sample Report",
                attachment: attachments
            }, function (result) {
                if (result) {
                    console.log("Mail Error", result);
                } else {
                    console.log("Email sent:",email,JSON.stringify(attachments));
                }

            }
        );
    });
}
fetchUsers();