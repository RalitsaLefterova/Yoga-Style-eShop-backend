const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'ralitsa.lefterova@gmail.com',
    subject: 'Thanks for joining in!',
    text: `Welcome ${name}. Let me know how you get along with the app.`
  })
}

const sendCancelationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'ralitsa.lefterova@gmail.com',
    subject: 'Cancelation of the account',
    text: `Hey ${name}, we saw you deleted your Yoga Style App account. We are sorry to see you leave us. If you have a few moments to share your thoughts on what we could do better in the future, hit Reply and let us know.
    All the best, Ralitsa.`
  }).then(() => {
    // console.log('Cancellation email sent.');
  }).catch((error) => {
    console.error(error.toString());
  })
}

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail
}