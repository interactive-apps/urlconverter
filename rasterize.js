/**
 * Created by Vincent P. Minde on 2/9/16.
 */

//Call /home/vincent/development/javascript/phantomjs/bin/phantomjs rasterize.js url output

"use strict";
var page = require('webpage').create(),
    system = require('system'),
    address, output, size;
function renderReport(){
    var pageHeight = page.evaluate(function(){
        return document.body.scrollHeight;
    });
    var dimensions = {width:1120,height: 1850};
    var initialHeight = 0;
    var i = 1;
    while(pageHeight > initialHeight){
        page.clipRect = { left: 0, top: initialHeight, width: dimensions.width, height: dimensions.height };
        page.render(output + "." + i,{format: 'png', quality: '100'});
        initialHeight = initialHeight + dimensions.height;
        i++;
    }
}
if (system.args.length < 3 || system.args.length > 5) {
    console.log('Usage: rasterize.js URL filename [paperwidth*paperheight|paperformat] [zoom]');
    console.log('  paper (pdf output) examples: "5in*7.5in", "10cm*20cm", "A4", "Letter"');
    console.log('  image (png/jpg output) examples: "1920px" entire page, window width 1920px');
    console.log('                                   "800px*600px" window, clipped to 800x600');
    phantom.exit(1);
} else {
    address = system.args[1];
    output = system.args[2];
    /*page.paperSize = { width: (1220) + 'px',
        height: (1920 * (72/96)) + 'px',format: 'A4', orientation: 'portrait', margin:'1cm'};
    page.viewportSize = { width: '595px', height: '842px', margin: '0px' };*/

    var dpi = 150;

    var widthInInches = 8.27;
    var heightInInches = 11.69;

    var pdfViewportWidth = dpi*widthInInches;
    var pdfViewportHeight = dpi*heightInInches;
    page.paperSize = {format: 'A4', orientation: 'portrait', margin:'1cm'};
    page.viewportSize = { width: pdfViewportWidth, height: pdfViewportHeight };
    page.open(address, function (status) {
        if (status !== 'success') {
            console.log('Unable to load the address!');
            phantom.exit(1);
        } else {
            (function(){
                var inerval = window.setInterval(function () {
                    if(page.title.toLowerCase("success").indexOf() > -1){
                        renderReport();
                        phantom.exit();
                    }else if(page.title.toLowerCase("error").indexOf() > -1){
                        phantom.exit(1);
                    }
                }, 1000);
            })();
            window.setTimeout(function () {
                phantom.exit(1);
            }, 60000);
        }
    });
}