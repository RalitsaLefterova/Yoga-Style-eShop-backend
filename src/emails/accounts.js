const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const senderEmail = 'shop.yogastyle@gmail.com'
const supportEmail = 'support.yogastyle@gmail.com'

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: senderEmail,
    subject: 'Thanks for joining in!',
    text: `Welcome ${name}. Let me know how you get along with the app.`
  })
}

const sendCancelationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: senderEmail,
    subject: 'Cancelation of the account',
    text: `Hey ${name}, we saw you deleted your Yoga Style App account. We are sorry to see you leave us. If you have a few moments to share your thoughts on what we could do better in the future, hit Reply and let us know.
    All the best, Yoga Style Team.`
  }).then(() => {
    console.log('Cancellation email sent.');
  }).catch((error) => {
    console.error(error.toString());
  })
}

const sendPasswordResetEmail = (email, fullName, link) => {
  const htmlMessages = `<h1>Hello ${fullName},</h1>
    <p>A request has been received to change the password for your Yoga Style eShop account. No changes have been made to your account yet.</p>
    <p>You can reset your password by clicking the link below:</p>
    <p><a href="${link}"><button>Reset Password</button></a></p>
    <p>If you did not initiate this request, please contact us immediately at <a href="mailto:${supportEmail}" target="_blank">${supportEmail}</a>.</p>
    <p>Thank you,</p>
    <p>The Yoga Style Team</p>`

  sgMail.send({
    to: email,
    from: senderEmail,
    subject: 'Password reset',
    html: htmlMessages
  })
}

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail,
  sendPasswordResetEmail
}