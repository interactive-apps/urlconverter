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
                document.body.bgColor = 'white';
                //page.zoomFactor = 0.1;
                page.render(output);
                phantom.exit();
            }, 600000);
        }
    });
}