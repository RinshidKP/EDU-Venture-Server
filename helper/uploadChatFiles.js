import path from 'path';
import multer from 'multer';

// Define storage configuration
const storage = multer.diskStorage({
  destination: "./public/",
  filename: (req, file, cb) => {
    cb(null, "FILE" + Date.now() + path.extname(file.originalname));
  },
});

// Create multer instance with the configured storage
const uploadChatFile = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('file')





export default uploadChatFile;
