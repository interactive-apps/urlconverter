/**
 * Created by Vincent P. Minde on 2/9/16.
 */

//Call /home/vincent/development/javascript/phantomjs/bin/phantomjs rasterize.js url output

"use strict";
var page = require('webpage').create(),
    system = require('system'),
    address, output, size;

if (system.args.length < 3 || system.args.length > 5) {
    console.log('Usage: rasterize.js URL filename [paperwidth*paperheight|paperformat] [zoom]');
    console.log('  paper (pdf output) examples: "5in*7.5in", "10cm*20cm", "A4", "Letter"');
    console.log('  image (png/jpg output) examples: "1920px" entire page, window width 1920px');
    console.log('                                   "800px*600px" window, clipped to 800x600');
    phantom.exit(1);
} else {
    address = system.args[1];
    output = system.args[2];
    page.paperSize = { width: (1220) + 'px',
        height: (1920 * (72/96)) + 'px',format: 'A4', orientation: 'portrait', margin:'1cm'};
    page.viewportSize = { width: '595px', height: '842px', margin: '0px' };
    page.open(address, function (status) {
        if (status !== 'success') {
            console.log('Unable to load the address!');
            phantom.exit(1);
        } else {
            window.setTimeout(function () {
                var pageHeight = page.evaluate(function(){
                    return document.body.scrollHeight;
                });
                console.log("Page Height:"<pageHeight);
                //page.zoomFactor = 0.1;
                //page.render(output,{format: 'png', quality: '100'});
                var dimensions = {width:1240,height: 1682};
                var initialHeight = 0;
                var i = 1;
                while(pageHeight > initialHeight){
                    page.clipRect = { left: 0, top: initialHeight, width: dimensions.width, height: dimensions.height };
                    page.render(output + "." + i,{format: 'png', quality: '100'});
                    initialHeight = initialHeight + dimensions.height;
                    i++;
                }

                phantom.exit();
            }, 10000);
        }
    });
}