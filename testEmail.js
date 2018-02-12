var postfixsever = require(__dirname + "/postfixsever");
postfixsever.postfixSend(
    {
        user: "",
        password: "",
        host: "localhost",
        ssl: false,
        port: 25
    },
    {
        msg: "Report Generation Failure",
        from: "fpportal@hisptanzania.org",
        to: "Vincent Minde <vincentminde@gmail.com>",
        subject: "Family Planning Dashboard Report Error "
    }, function (result) {
        console.log(result)
        if (result) {
            console.log("Admin Mail Error", result);
        } else {
            console.log("Admin Email Sent");
        }

    }
);