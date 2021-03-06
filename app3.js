var express = require('express'); 
var app = express(); 
var bodyParser = require('body-parser');
var multer = require('multer');
var http = require('http');
// var sys = require('sys');
var exec = require('child_process').exec;
var util = require('util');
var fs = require('fs');

var sendgrid = require('sendgrid')("");
// var nodemailer = require('nodemailer');
// var sleep = require('sleep');

var contents = fs.readFileSync("./uploads/input.json");
var data = JSON.parse(contents);


function sendEmail(i){
    // Convert HTML to PDF with wkhtmltopdf
    // console.log("Come" + i);
    var modifiedFirstName = data[i].Name.replace(/[^a-zA-Z0-9]/g, '');
    // var modifiedFirstName = data[i].Name;
    var destinationEmail = data[i].Email;
    var text_body = "<html><body>Hello,<br>Greetings from Shaastra, IIT Madras!<br><br>"+
    "The Shaastra team appreciates your efforts for conducting a successful and well organized Sampark. "  +
    " Please find attached a certificate of appreciation for your contributions towards Sampark."+
    '<br><br>Thanks,<br>Team Shaastra. <br> Follow us on <a href="https://www.facebook.com/Shaastra">Facebook</a> for more updates. <br><br><br><br></body></html>';
    var subject='E-certificate || Shaastra Sampark - ' + data[i].Name
    fs.readFile('pdfs/'+ modifiedFirstName +'.pdf',function(err,datap){
            // console.log(destinationEmail);
            var params = {
                to: destinationEmail,
                // to: 'attacktitan100@gmail.com',
                from: 'webops@shaastra.org',
                fromname: 'Shaastra Outreach',
                subject: subject,
                html: text_body,
                files: [{filename: 'e-certificate.pdf', content: datap}]
            };
            var email = new sendgrid.Email(params);
            sendgrid.send(email, function (err, json) {
            	
                if(err)console.log("error mailing ", data[i].Name ," @ ", data[i].Email);
            });
        });

}

function pdfConvert(i){
    
  //   var dummyContent ='<!DOCTYPE html><html><head></head>'+
		// '<body><img style="width:95% ;" src="../uploads/participation.jpg">'+
		// '<style>  @font-face {font-family: Myfont;  src: url("./OpenSans-SemiboldItalic.ttf");} h2{ text-align: center;color: #053565;font-size:30px;font-family:Myfont;}</style>' +
		// '<div style="padding-left: 10%;">'+
		// '<h2 style="margin-top:-100%;text-align: center;"></h2>'+
		// '<h2 style="margin-top:51.5%;">' + data[i].Name +'</h2>'+
		// '<h2 style="margin-top:4%;">' + data[i].Position + '</h2>'+
		// '<h2 style="margin-top:-1.5%;">' + data[i].SubDept[0].toUpperCase() + data[i].SubDept.slice(1) + '</h2>'+
		// '<h2 style="margin-top:3.5%;">' + data[i].Dept+ '</h2>'+
		// '</div>'+
		// '</body></html>'

// the above one was for coordinator certificates


    var dummyContent = '<!DOCTYPE html><html><head></head>'+
        '<style>  @font-face {font-family: Myfont;  src: url("../OpenSans-SemiboldItalic.ttf");} h2{ position: absolute; text-align: center; top: 0%; width: 0%; margin-left: 0%; color: #053565; font-size: 24px; font-family: Myfont;}</style>'+
        '<body><img style="width:95% ;" src="../uploads/volunteer.jpg">'+
        '<h2 style="top: 39%; margin-left: 34%; width: 36%;">'+data[i].Name+'</h2>'+
        '</div></body></html>';


    var modifiedFirstName = data[i].Name.replace(/[^a-zA-Z0-9]/g, '');
    var htmlFileName = "./htmls/" + modifiedFirstName +".html", pdfFileName = "./pdfs/"+ modifiedFirstName +".pdf";
    var htmlcreateName =  __dirname + "/htmls/" + modifiedFirstName +".html";
    // Save to HTML file
    fs.writeFile(htmlcreateName, dummyContent, function(err) {
        // console.log("Came" + i);
        if(err) { throw err; }
        util.log("file saved to site.html");

        var child = exec("phantomjs rasterize.js " + htmlFileName + " " + pdfFileName, function(err, stdout, stderr) {
            if(err) { throw err; }
            util.log(stderr);
            sendEmail(i);
        });    
    });
    console.log('Rendered to ' + htmlFileName + ' and ' + pdfFileName);
}

for(var i=0; i<data.length; i++){
    pdfConvert(i);
}
