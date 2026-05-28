import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `property-${uniqueSuffix}${ext}`);
  }
});

const ALLOWED_EXTENSIONS = /^\.(jpg|jpeg|png|gif|webp)$/i;
const ALLOWED_MIME_TYPES = /^image\/(jpeg|png|gif|webp)$/i;

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (ALLOWED_EXTENSIONS.test(ext) && ALLOWED_MIME_TYPES.test(mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpg, jpeg, png, gif, webp)'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});

export const uploadMultiple = upload.array('images', 10); // Max 10 images

// For generic uploads like Logo
const siteSettingsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../public/uploads/site');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `logo-${Date.now()}${ext}`);
  }
});

export const uploadLogo = multer({
  storage: siteSettingsStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter
}).single('logo');

// import multer from 'multer';
// import path from 'path';

// // Use memoryStorage on Vercel (serverless), diskStorage on local development
// const isProduction = process.env.NODE_ENV === 'production';

// const storage = isProduction
//   ? multer.memoryStorage()
//   : multer.diskStorage({
//     destination: (req, file, cb) => {
//       const uploadsDir = path.join(__dirname, '../../public/uploads');
//       // Ensure directory exists (only in development)
//       if (!require('fs').existsSync(uploadsDir)) {
//         require('fs').mkdirSync(uploadsDir, { recursive: true });
//       }
//       cb(null, uploadsDir);
//     },
//     filename: (req, file, cb) => {
//       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//       const ext = path.extname(file.originalname).toLowerCase();
//       cb(null, `property-${uniqueSuffix}${ext}`);
//     }
//   });

// const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
//   const allowedTypes = /jpeg|jpg|png|gif|webp/;
//   const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = allowedTypes.test(file.mimetype);

//   if (mimetype && extname) {
//     return cb(null, true);
//   } else {
//     cb(new Error('Only image files are allowed'));
//   }
// };

// export const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
//   fileFilter
// });

// export const uploadMultiple = upload.array('images', 10); // Max 10 images

// // For site logo upload
// const siteSettingsStorage = isProduction
//   ? multer.memoryStorage()
//   : multer.diskStorage({
//     destination: (req, file, cb) => {
//       const dir = path.join(__dirname, '../../public/uploads/site');
//       if (!require('fs').existsSync(dir)) {
//         require('fs').mkdirSync(dir, { recursive: true });
//       }
//       cb(null, dir);
//     },
//     filename: (req, file, cb) => {
//       const ext = path.extname(file.originalname).toLowerCase();
//       cb(null, `logo-${Date.now()}${ext}`);
//     }
//   });

// export const uploadLogo = multer({
//   storage: siteSettingsStorage,
//   limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
//   fileFilter
// }).single('logo');