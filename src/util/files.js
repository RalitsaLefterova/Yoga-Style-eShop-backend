const fs = require('fs')

const createFilePath = file => {
  return `${process.env.BACKEND_URL}/${file}`
}

const deleteFile = (filePath) => {
  fs.unlink(filePath.replace(`${process.env.BACKEND_URL}/`, ""), (err) => {
    if (err) {
      throw (err)
    }
  })
}

exports.createFilePath = createFilePath
exports.deleteFile = deleteFile
