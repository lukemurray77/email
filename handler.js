const nodemailer = require('nodemailer');
const request = require('request-promise');

const mailMe = (event, context, callback) => {
  const body = JSON.parse(event.body);
  const { verifyCaptcha } = body;
  const options = {
    method: 'GET',
    uri: `${process.env.GOOGLE_ENDPOINT}${verifyCaptcha}`,
  };

  request(options)
    .then((result) => {
      if (JSON.parse(result).success) {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        auth: {
          type: "OAuth2",
          user: process.env.USER,
          clientId: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          refreshToken: process.env.REFRESH_TOKEN,
        }
      });

      const mailOptions = {
        from: body.email, // sender address
        to: process.env.USER, // list of receivers
        subject: `MESSAGE FROM ${body.name}`, // Subject line
        html: body.text// plain text body
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if(err) {
          console.log(err);
          const errorMessage = {
            statusCode: 500,
            body: JSON.stringify({
              message: "Sorry, could not send message at this time, please try again later",
            }),
            headers: {
              "Access-Control-Allow-Origin" : "*" // Required for CORS support to work
            },
          };
          return callback(null, errorMessage);
        }
        const response = {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin" : "*" // Required for CORS support to work
          },
          body: JSON.stringify({ "message": "Hello World!" })
        };
        callback(null, response);
      });
    } else {
      const errorMessage = {
        statusCode: 500,
        body: JSON.stringify({
          message: "Sorry, could not send message at this time, please try again later",
        }),
        headers: {
          "Access-Control-Allow-Origin" : "*" // Required for CORS support to work
        },
      };
      return callback(null, errorMessage);
    }
  });
}

module.exports = {
  mailMe,
}
