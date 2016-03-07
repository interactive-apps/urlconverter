/**
 * Created by Vincent P. Minde on 3/2/16.
 */

var email   = require("emailjs");

postfixSend = function postfixSend(serverConfigs,emailInfo, callback) {

    var server  = email.server.connect(serverConfigs);
    server.send({
        text:    emailInfo.msg,
        from:    emailInfo.from,
        to:      emailInfo.to,
        subject: emailInfo.subject,
        attachment:emailInfo.attachment,
        port:25

    }, function(err, message) {
        callback(err);
    });

}

exports.postfixSend = postfixSend;