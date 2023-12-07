import path from 'path';
import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs/promises';
// Define storage configuration
const storage = multer.diskStorage({
  destination: "./public/",
  filename: (req, file, cb) => {
    cb(null, "IMAGE" + Date.now() + path.extname(file.originalname));
  },
});

// Create multer instance with the configured storage
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
})

const processImage = async (filePath) => {
  // Read the image file and convert it to a buffer
  const imageBuffer = await fs.readFile(filePath);

  // Process the image using sharp (e.g., convert to JPEG)
  const processedBuffer = await sharp(imageBuffer).jpeg().toBuffer();
  return processedBuffer;
};

// Middleware to handle file upload
const uploadImage = (req, res, next) => {
  upload.single('image')(req, res, async (err) => {
    console.log(req.file);
    if (!req.file) {
      return next();
    }
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        console.log(err.code);
        return res.status(400).json({ error: 'Unexpected file upload' });
      }
    } else if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    try {
      // Process the image file
      const processedBuffer = await processImage(req.file.path);

      // Replace the original image file with the processed one
      await fs.writeFile(req.file.path, processedBuffer);

      // Continue with the next middleware or route handler
      next();
    } catch (error) {
      console.error('Error processing image:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
};




export default uploadImage;
