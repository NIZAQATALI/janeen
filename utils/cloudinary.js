// const {v2 as cloudinary} =require ("cloudinary")
// const cloudinary = require("cloudinary").v2;
// const fs =require("fs");
// cloudinary.config({ 
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//   api_key: process.env.CLOUDINARY_API_KEY, 
//   api_secret: process.env.CLOUDINARY_API_SECRET 
// });
// const uploadOnCloudinary = async (localFilePath,email) => {
//     try {
//         if (!localFilePath) return null
//         //upload the file on cloudinarys
//         const response = await cloudinary.uploader.upload(localFilePath, {
//             resource_type: "auto",
//             folder:email
//         })
//         console.log(" cloudinary response",response)
//         // file has been uploaded successfull
//         //console.log("file is uploaded on cloudinary ", response.url);
        
//         return response;

//     } catch (error) {
//         fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
//         return null;
//     }
// }
// const deleteOnCloudinary = async (public_id) => {
//     try {
//         if (!public_id) return null
//         //upload the file on cloudinary
//         const response = await cloudinary.uploader.destroy(public_id)
//         console.log(" cloudinary response",response)
//         // file has been deleted successfull
   
       
//         return response;

//     } catch (error) {
      
//         return null;
//     }
// }


// exports= {uploadOnCloudinary,deleteOnCloudinary}
//import {v2 as cloudinary} =require ("cloudinary")
import dotenv from 'dotenv'
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

dotenv.config({path:'./config.env'});
// console.log(cloudinary);  // This should print the cloudinary object

// Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
  });
export const uploadOnCloudinary = async (fileBuffer, folderName) => {
  try {
    if (!fileBuffer) return null;

    return await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: folderName,
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );

      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return null;
  }
};


