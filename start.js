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
        url = dhisServer + "/api/userGroups.json?filter=name:eq:" + userGroup + "&fields=users[id,email,name,organisationUnits[id,name,level]]",
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
                    Promise.all(allPromises)
                        .then(function (res) {
                            resolve(res);
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
    console.log(JSON.stringify(user));
    return new Promise(function (resolve, reject) {
        var userSend = user;
        var promises = [];

        for(var orgUnit in user.organisationUnits){

            promises.push(fetchReport(user.organisationUnits[orgUnit]));
        }
        Promise.all(promises)
            .then(function (res) {
                var userAttachments = [];
                for(var orgUnit in userSend.organisationUnits){
                    userAttachments.push(attachments[userSend.organisationUnits[orgUnit].id]);
                }
                sendEmail(userSend,userAttachments).then(function(){
                    resolve();
                });
            });
    });

}
var todaysDate = new Date();
var month = todaysDate.getMonth() + 1;
if(month == 1){
    month = "January";
}else if(month == 2){
    month = "February";
}else if(month == 3){
    month = "March";
}else if(month == 4){
    month = "April";
}else if(month == 5){
    month = "May";
}else if(month == 6){
    month = "June";
}else if(month == 7){
    month = "July";
}else if(month == 8){
    month = "August";
}else if(month == 9){
    month = "September";
}else if(month == 10){
    month = "October";
}else if(month == 11){
    month = "November";
}else if(month == 12){
    month = "December";
}
function sendEmail(user,attachments){
    var Promise = require('promise');
    return new Promise(function (resolve, reject) {
        var postfixsever = require(__dirname + "/postfixsever");
        attachments.unshift({data:'' +
        '<html>Dear <b>' + user.name +'</b>,<br /><br />'+
        '    Find attached monthly Family Planning summary report/s for ' + month + ' ' + todaysDate.getFullYear() + '.'+
        '   Please use Family Planning monthly report/s as a program and performance management tool, to help identify gaps in HR training and FP service delivery, for more targeted and efficient supportive supervision, program planning and resource allocation. You are reminded to pay attention to the action items listed in this report.'+
        '    For more information, refer to the following:'+
        '    <ul>' +
        '       <li><a href="https://hmisportal.moh.go.tz/fpportal/#/familyPlanningHome">The Family Planning Dashboard</a></li>'+
        '       <li><a href="http://www.rchs.go.tz/traintracker/main.php">The TrainTracker HR training database</a></li>' +
        '   </ul>'+
        //You can view archived reports on the Family Planning Dashboard under the ‘Reports’ tab (add hyperlink if possible when ready)'+
        'Do not reply to this email. For further technical assistance or to provide <a href="https://hmisportal.moh.go.tz/fpportal/#/feedback">feedback</a> on the FP Dashboard, please <a href="https://hmisportal.moh.go.tz/fpportal/#/feedback">follow this link</a>. <br />'+
        'If you need to verify information presented in the FP dashboard, please check with the HMIS focal person.'+
        '    If you are unable to view the attached PDF reports, you may wish to download a free PDF reader <a href="https://get.adobe.com/reader/">here</a>.<br />'+
        '    We hope you find this report useful.<br /><br />'+
        '    Kind regards,<br />'+
        '    Mr Clement Kihinga<br />'+
        'Reproductive and Child Health Section (RCHS)<br />'+
        'Ministry of Health, Community Development, Gender, Elderly and Children<br /><br />To stop receiving these emails please <a href="https://hmisportal.moh.go.tz/fpportal/#/unsubscribe?uid="'+user.id+'>click here</a> to unsubscribe.'+
        '</html>', alternative:true});
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
                to: user.name + " <" + user.email + ">",
                subject: "Family Planning Dashboard Report " + month + ' ' + todaysDate.getFullYear() ,
                attachment: attachments
            }, function (result) {
                if (result) {
                    console.log("Mail Error", result);
                    reject(result);
                } else {
                    //console.log("Email sent:",JSON.stringify(attachments));
                    resolve(result);
                }

            }
        );
    });
}
fetchUsers();