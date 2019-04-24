#Convert reports to pdf and send via email

[![Greenkeeper badge](https://badges.greenkeeper.io/interactive-apps/urlconverter.svg)](https://greenkeeper.io/)

This is a node js app to convert a url to a pdf and send emails to users in the dhis server.

To bring it up and running follow the following instructions:
-Install nodejs. Procedures can be found at http://www.hostingadvice.com/how-to/install-nodejs-ubuntu-14-04/
-Run npm install to download dependencies.
     
        npm install

-Run the program with the following command
   
        nodejs start -url url -dhis dhisserverurl -u username -p password -o outputfile -mu mailserverUsername -mp mailserverPassword -mh mailHostServerAddress

   Replace the necessary values as described below:
        url = The url to be converted to pdf.
        dhisserverurl = The url to the dhis server.
        username = The username that will be used to get the user information
        password = The password of the user.
        outputfile(optional) = The output file after convertion
        mailserverUsername = The mail server user name
        mailserverPassword = The mail server password
        mailHostServerAddress = Mail Server address (Defaults to localhost)