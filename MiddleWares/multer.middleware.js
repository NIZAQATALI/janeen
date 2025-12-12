
// import multer from 'multer';
// import fs from 'fs';


// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const dir = 'Images';
 
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir, { recursive: true });
//     }
//     cb(null, dir);
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   }
// });

// const upload = multer({ storage });

import multer from "multer";


const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
