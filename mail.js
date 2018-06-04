const nodemailer = require("nodemailer");
const app = nodemailer;

var password = require("./Password.js");

var transporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
      user: 'olivian@outlook.dk',
      pass: password
    }
  });
  
  var mailOptions = {
    from: 'olivian@outlook.dk',
    to: '',
    subject: 'You have have been registered at "What To Do?"',
    text: 'That was easy!'
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }

   /*  function sendMail(mail) {
      mailOptions.from,
      mailOptions.to = 'mail',
      mailOptions.subject,
      mailOptions.text
    } */

    exports.sendMail = (sendMail => {
    });
  });