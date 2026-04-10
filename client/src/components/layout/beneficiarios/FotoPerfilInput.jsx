import { useEffect, useRef, useState } from "react";
import { FaUpload } from 'react-icons/fa'

function FotoPerfilInput({
    value, onChange, onError
}){
    const fileInputRef = useRef(null);
    const[preview, setPreview] = useState('');

    useEffect(() => {
        if(value && typeof value === 'string'){
            setPreview(value);
        } else {
            setPreview('');
        }
    }, [value]);

    const handleOpenFileSelector = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if(!file) return;

        if(!file.type.startsWith('image/')){
            onError?.('Solo se permite archivos de imagen');
            return;
        }
        onError?.('');

        const reader = new FileReader();
        reader.onloadend = () => {
            const resultado = reader.result;
            setPreview(resultado);
            onChange?.(resultado);
        };
        reader.readAsDataURL(file);
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