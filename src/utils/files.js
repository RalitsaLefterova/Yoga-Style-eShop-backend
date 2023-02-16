const fs = require('fs')

const createFilePath = (file) => {
  return `${process.env.BACKEND_URL}/${file}`
}

const deleteFile = (filePath) => {
  fs.unlink(filePath, (error) => {
    if (error) {
      throw (error)
    }
  })
}

exports.createFilePath = createFilePath
exports.deleteFile = deleteFile
