import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb){
    // Clean filename to remove spaces/special chars
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, 'profile-' + Date.now() + '-' + cleanName);
  }
});

// Init upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 10000000}, // Increased to 10MB just in case
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('profilePic'); 

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif|webp/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    console.log('File type rejected:', file.mimetype, file.originalname);
    cb('Error: Images Only (jpeg, jpg, png, gif, webp)!');
  }
}

export const uploadImage = (req, res) => {
  console.log('Upload request received');
  upload(req, res, (err) => {
    if(err){
      console.error('Multer error:', err);
      // Handle Multer Code Errors
      if (err instanceof multer.MulterError) {
         return res.status(400).json({message: `Upload Error: ${err.message}`});
      }
      return res.status(400).json({message: err});
    } else {
      if(req.file == undefined){
        console.error('No file received in request');
        return res.status(400).json({message: 'No File Selected!'});
      } else {
        console.log('File uploaded successfully:', req.file.filename);
        res.json({
          message: 'File Uploaded!',
          filePath: `/uploads/${req.file.filename}`
        });
      }
    }
  });
};
