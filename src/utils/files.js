const fs = require('fs')
const path = require('path')

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

// Function to recursively delete a directory and its contents
const deleteDirectoryRecursive = (directoryPath) => {
  if (fs.existsSync(directoryPath)) {
    fs.readdirSync(directoryPath).forEach((file) => {
      const currentPath = path.join(directoryPath, file)
      if (fs.lstatSync(currentPath).isDirectory()) {
        // Recursively delete subdirectories
        deleteDirectoryRecursive(currentPath)
      } else {
        // Delete files
        fs.unlinkSync(currentPath)
      }
    })
    // Delete the empty directory itself
    fs.rmdirSync(directoryPath)
  }
}

exports.createFilePath = createFilePath
exports.deleteFile = deleteFile
exports.deleteDirectoryRecursive = deleteDirectoryRecursive
