import axios from 'axios';
import FormData from 'form-data';

const FILE_SERVER_URL = process.env.FILE_SERVER_URL || 'http://localhost:3001';
const UPLOAD_SECRET = process.env.UPLOAD_SECRET

export async function subirFotoAServidor(file: Express.Multer.File){
    const form = new FormData();

    form.append('fotografia', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
    });

    const response = await axios.post(`${FILE_SERVER_URL}/upload/foto`, form, {
        headers: {
            ...form.getHeaders(),
            'x-upload-secret': UPLOAD_SECRET,
        },
    });
    return response.data;
}