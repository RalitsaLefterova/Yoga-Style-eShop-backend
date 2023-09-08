const xss = require('xss')

const options = {
  css: false, // Disable removing inline CSS
}

// const sanitizeHtml = (htmlString) => {
//   return xss(htmlString, options);
// }

const sanitizeHtml = (req, res, next) => {
  if (req.body.title) {
    req.body.title = xss(req.body.title);
    req.body.title = req.body.title.replace(/[^\w\s-]/g, ''); // Remove non-alphanumeric characters except spaces and hyphens
  }
  console.log('in sanitizeHtml - req.body:', req.body)
  next()
}

const sanitizeTitle = (title) => {
  return title.replace(/[^a-zA-Z0-9-_]/g, '-')
}

module.exports = {
  sanitizeHtml,
  sanitizeTitle
}