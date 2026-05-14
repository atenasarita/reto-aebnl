import cloudinary from "../config/cloudinary";

export function subirFotoACloudinary(file: Express.Multer.File): Promise<{
    url: string;
    publicId: string;
    nombre: string;
}> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'beneficiarios/fotos',
                resource_type: 'image',
            },
            (error, result) => {
                if(error || !result){
                    reject(error || new Error('No se pudo subir la imagen'));
                    return;
                }

                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                    nombre: result.original_filename,
                });
            }
        );
        uploadStream.end(file.buffer);
    });
}
