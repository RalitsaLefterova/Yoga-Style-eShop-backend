const cors = require('cors')

const corsOptions = {
  origin: 'https://yoga-style-backend.herokuapp.com',
  optionsSuccessStatus: 200
}


module.exports = cors(corsOptions)