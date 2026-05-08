import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3001;
const FILES_BASE_URL = process.env.FILES_BASE_URL || `http://localhost:${PORT}`;
const UPLOAD_SECRET = process.env.UPLOAD_SECRET || '';

app.use(cors());

const uploadDir = path.join(process.cwd(), 'uploads',  'fotos');

if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, {recursive: true});
}

function validarToken(req: express.Request, res:express.Response, next: express.NextFunction){
    const token = req.headers['x-upload-secret'];

    if(token !== UPLOAD_SECRET){
        return res.status(401).json({message: 'No autorizado para subir archivos'});
    }
    next();
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}-${Math.round(Math.random() *1e9)}${ext}`;
        cb(null, uniqueName);
    },
});

const uploadFoto = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];

        if (allowed.includes(file.mimetype)){
            cb(null, true);
        } else {
            cb(new Error('Formato de imagen no permitido'));
        }
    },
});

app.use('/fotos', express.static(uploadDir));

app.post('/uploads/foto', validarToken, uploadFoto.single('fotografia'), (req, res) => {
    if(!req.file){
        return res.status(400).json({message: 'No se recibio ninguna foto'});
    }

    const url = `${FILES_BASE_URL}/fotos/${req.file.filename}`;

    return res.status(200).json({
        url,
        nombre: req.file.filename,
    });
});

app.listen(PORT, () => {
    console.log(`Servidor de archivos corriendo en ${FILES_BASE_URL}`);
});
