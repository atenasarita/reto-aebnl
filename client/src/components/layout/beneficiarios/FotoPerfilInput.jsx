import { useEffect, useRef, useState } from "react";
import { FaUpload } from 'react-icons/fa'

function FotoPerfilInput({
    value, onChange, onError
}){
    const fileInputRef = useRef(null);
    const[preview, setPreview] = useState('');
    const[subiendo, setSubiendo] = useState(false);

    useEffect(() => {
        if(value && typeof value === 'string'){
            if(value.startsWith('/uploads/')){
                setPreview(`https://reto-aebnl-production.up.railway.app${value}`);
            } else {
                setPreview(value);
            }
        } else {
            setPreview('');
        }
    }, [value]);

    const handleOpenFileSelector = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if(!file) return;

        if(!file.type.startsWith('image/')){
            onError?.('Solo se permite archivos de imagen');
            return;
        }
        onError?.('');
        setSubiendo(true);

        try {
            // Preview local
            const localPreview = URL.createObjectURL(file);
            setPreview(localPreview);

            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('fotografia', file);

            const response = await fetch('https://reto-aebnl-production.up.railway.app/api/beneficiarios/upload-foto', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            console.log('ruta devuelta:', data.ruta);
            console.log('url completa:', `https://reto-aebnl-production.up.railway.app${data.ruta}`);

            if(!response.ok){
                throw new Error(data.message || 'Error al subir la fotografia');
            }

            // Guardar en el formaulario solo la ruta
            onChange?.(data.ruta);

        } catch(error) {
            console.error('Error subiendo foto: ', error);
            onError?.(error.message || 'No se pudo subir la fotografia');
            setPreview('');
        } finally {
            setSubiendo(false);
        }
    };

    return(
        <div className="photo-box">
            <div className="photo-circle">
                {preview ? (
                    <img src={preview} 
                    alt="Foto de perfil"
                    className="photo-preview"
                     />
                ):(
                    'Foto'
                )}
            </div>

            <p>Foto de Perfil</p>

            <input 
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{display: 'none'}}
            onChange={handleFileChange}
             />

             <button
            type="button"
            className="link-button"
            onClick={handleOpenFileSelector}>
                <FaUpload className="step-icon"/>Subir Fotografia
            </button>
        </div>
    );
}

export default FotoPerfilInput;