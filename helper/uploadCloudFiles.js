import cloudinary from 'cloudinary';
import fs from 'fs/promises';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME||'djqbq1vgb',
    api_key: process.env.CLOUDINARY_CLOUD_KEY||'826759486159537',
    api_secret: process.env.CLOUDINARY_API_SECRET||'R0ckrZMiGQZASDa3U4RAI_FXqqU',
    secure: true,
  });

 const fileCloudUpload = async (file) => {
    
    try {
     
        const result = await cloudinary.uploader.upload( file.path, {
        public_id: `${Date.now()}`,
        resource_type: "auto",
        folder: "EduVenture",
      });
      fs.unlink(file.path,function(err){
        if(err){
          console.log("something went wrong :"+ err);
        }
      })
      return result
    } catch (error) {
      console.log(error);
    }
  };

  export default fileCloudUpload