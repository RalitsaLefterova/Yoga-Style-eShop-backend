const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { sanitizeTitle } = require('../utils/sanitizer')

const multerSharedSettings = {
  limits: {
    fileSize: 1000000
  },
  fileFilter: (req, file, cb) =>
    {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Please upload jpg, jpeg or png.'))
      }
      cb(undefined, true)
  }
}

const uploadCollectionImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../..', '/uploads/collections'))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now()
    const sanitizedTtitle = sanitizeTitle(req.body.title)
    // Note: Multer does not add extensions to file names, and it’s recommended to return a filename complete with a file extension.
    cb(null, 'collection-' + sanitizedTtitle.toLowerCase() + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const uploadProductImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../..', '/uploads/products'))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now()
    const sanitizedTtitle = sanitizeTitle(req.body.title)
    cb(null, 'product-' + sanitizedTtitle.toLowerCase() + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const uploadMultipleImagesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fullPath = path.join(__dirname, '../..', `/uploads/products/${req.params.productId}`) 
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true })
    }
    cb(null, fullPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now()
    cb(null, 'product-' + req.params.productId + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const uploadCollectionImage = multer({
  ...multerSharedSettings,
  storage: uploadCollectionImageStorage
})

const uploadProductImage = multer({
  ...multerSharedSettings,
  storage: uploadProductImageStorage
}) 

const uploadMultipleImages = multer({
  ...multerSharedSettings,
  storage: uploadMultipleImagesStorage
})

module.exports = {
  uploadCollectionImage,
  uploadProductImage,
  uploadMultipleImages
}