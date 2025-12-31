import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let folder = 'makeconnect/others';
        let resource_type = 'auto';

        if (file.mimetype.startsWith('image/')) {
            folder = 'makeconnect/images';
            resource_type = 'image';
        } else if (file.mimetype.startsWith('video/')) {
            folder = 'makeconnect/videos';
            resource_type = 'video';
        }

        return {
            folder: folder,
            resource_type: resource_type,
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
        };
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    }
});

export default upload;
