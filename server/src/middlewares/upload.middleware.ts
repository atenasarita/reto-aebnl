import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'uploads', 'fotos');

if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, {recursive: true});
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}${ext}`;
        cb(null, uniqueName);
    },
});

export const uploadFoto = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if(allowed.includes(file.mimetype)){
            cb(null, true);
        } else {
            cb(new Error('Formato de imagen no permitido'));
        }
    }
})

