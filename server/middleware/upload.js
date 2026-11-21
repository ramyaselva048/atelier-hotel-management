import multer from 'multer'
import path from 'path'
import fs from 'fs'
const uploadDir = path.resolve('uploads')
fs.mkdirSync(uploadDir, { recursive: true })
const storage = multer.diskStorage({
  destination: (_req,_file,cb) => cb(null, uploadDir),
  filename: (_req,file,cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`)
  }
})
const fileFilter = (_req,file,cb) => cb(null, ['image/jpeg','image/png','image/webp','image/gif'].includes(file.mimetype))
export const upload = multer({ storage, fileFilter, limits: { fileSize: 5*1024*1024 } })