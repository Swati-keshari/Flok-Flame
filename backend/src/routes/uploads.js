// =============================================================
// routes/uploads.js — photo upload for dishes and restaurants (admin only).
// Mounted at /api/uploads in server.js.
//   POST /api/uploads  (form field "image") -> { url: "/uploads/<file>" }
// Files are saved in backend/uploads/ and served by server.js at /uploads/...
// Only JPG / PNG / WEBP / AVIF images up to 2 MB are accepted, and the file
// name is made by the server (never the uploaded name) so it is always safe.
// Note: on free hosting the uploads folder can be wiped on restart — see DEPLOY.md.
// =============================================================

import { Router } from 'express'
import multer from 'multer'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { requireAdmin } from '../middleware/auth.js'

export const UPLOAD_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const EXTENSIONS = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/avif': '.avif' }

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${EXTENSIONS[file.mimetype]}`),
  }),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => cb(null, Boolean(EXTENSIONS[file.mimetype])),
})

const router = Router()

router.post('/', requireAdmin, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err?.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'Image is too big (max 2 MB)' })
    if (err) return res.status(400).json({ message: 'Upload failed, please try another image' })
    if (!req.file) return res.status(400).json({ message: 'Please choose a JPG, PNG, WEBP or AVIF image' })
    res.status(201).json({ url: `/uploads/${req.file.filename}` })
  })
})

export default router
