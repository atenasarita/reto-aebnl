import '../styles/registro_beneficiario.css';
import {useRef, useState, useEffect} from 'react';
import { FaCalendar, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { TbSquareNumber1Filled,  TbSquareNumber2Filled, TbSquareNumber3Filled, TbSquareNumber4Filled,} from "react-icons/tb";
import { useNavigate } from 'react-router-dom';
import { espinaBifidaOptions } from '../../utils/espinaBifidaTypes';
import { soloLetras, limpiarSoloLetras, validarCURP, cpValido, telefonoValido } from '../../utils/validator';
import FotoPerfilInput from '../../components/layout/beneficiarios/FotoPerfilInput';

const estadosMexico = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua',
    'Ciudad de Mexico', 'Coahuila', 'Colima', 'Durango', 'Estado de Mexico', 'Guanajuato',
    'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacan', 'Morelos', 'Nayarit', 'Nuevo Leon',
    'Oaxaca', 'Puebla', 'Queretaro', 'Quintana Roo', 'San Luis Potosi', 'Sinaloa',
    'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatan', 'Zacatecas'
];

function RegistroBeneficiario() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [folio, setFolio] = useState('');
    // Sirve para que se vea el error de la casilla erronea
    const [fieldErrors, setFieldErrors] = useState({});
    // Sirve para que el "checkpoint" de cada step aparezca despues de darle clic a CONTINUAR
    const [touchedSteps, setTouchedSteps] = useState([]);
    const [fechaRegistro, setFechaRegistro] = useState(new Date().toISOString().split('T')[0]);
    const [fechaNacimiento, setFechaNacimiento] = useState("");
    const [fechaMembresia, setFechaMembresia] = useState("");
    
    const [formData, setFormData] = useState({
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        CURP: '',
        genero: '',
        estado_nacimiento: '',
        // Fotografía (a ver si funciona)
        fotografia: '',
        telefono: '',
        email: '',
        contacto_nombre: '',
        contacto_telefono: '',
        contacto_parentesco: '',
        alergias: 'Ninguna',
        tipo_sanguineo: '',
        domicilio_calle: '',
        domicilio_cp: '',
        domicilio_ciudad: '',
        domicilio_estado: '',
        tipo_espinas: [], // Assuming array of IDs
        fecha_inicio_membresia: fechaRegistro,
        meses_membresia: 6,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // const fechaRegistroRef = useRef(null);
    const fechaNacimientoRef = useRef(null);
    const fechaMembresiaRef = useRef(null);

    const steps = [
        { icon: TbSquareNumber1Filled, label: 'Datos Personales' },
        { icon: TbSquareNumber2Filled, label: 'Información Médica' },
        { icon: TbSquareNumber3Filled, label: 'Domicilio' },
        { icon: TbSquareNumber4Filled, label: 'Membresía' }
    ];


    // TODO hacer El endpoint para obtener el siguiente numero de folio
    useEffect(() => {
        const fetchSiguienteFolio = async () => {
            try {
                const token = localStorage.getItem('token');

                const response = await fetch('http://localhost:3000/api/beneficiarios/siguiente-folio', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json();
                // console.log('status:', response.status);
                // console.log('respuesta backend:', data);

                if (!response.ok) {
                    throw new Error(data.message || JSON.stringify(data));
                }

                setFolio(data.folio);
            } catch (error) {
                // console.error('Error real:', error);
                setError(String(error.message || error));
            }
        };
        fetchSiguienteFolio();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Campos solo letras
        if (
            name === 'nombres' ||
            name === 'apellido_paterno' ||
            name === 'apellido_materno' ||
            name === 'contacto_nombre' ||
            name === 'contacto_parentesco'
        ) {
            const limpio = limpiarSoloLetras(value);

            setFormData(prev => ({
                ...prev,
                [name]: limpio
            }));
            return;
        }

        if (name === 'contacto_telefono'){
            const limpio = value.replace(/\D/g, '').slice(0,10);

            setFormData(prev => ({
                ...prev, 
                [name]: limpio
            }));

            setFieldErrors(prev => ({
                ...prev,
                contacto_telefono: limpio && !telefonoValido(limpio)
                ?prev.contacto_telefono
                :''
            }));
            return;
        }

        // Otros campos
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if(fieldErrors[name]){
            validateField(name, value);
        }
    };

    const handleTipoEspinasChange = (e) => {
        const { value, checked } = e.target;
        const id = parseInt(value);
        // console.log("clicked", id, checked);

        setFormData(prev => ({
            ...prev,
            tipo_espinas: checked 
                ? [...prev.tipo_espinas, id]
                : prev.tipo_espinas.filter(t => t !== id)
        }));
    };

    const handleNext = () => {
        // Marcar step actual como "done"
        setTouchedSteps(prev => [...new Set([...prev, currentStep])]);

        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleFotoChange = (fotoBase64) => {
        // console.log('foto recibida:', fotoBase64);
        // console.log('longitud foto recibida:', fotoBase64?.length);

        setFormData(prev => ({
            ...prev,
            fotografia: fotoBase64
        }));
        setError('');
    };

    const handleFotoError = (mensaje) => {
        setError(mensaje);
    };

    const calculateFechaVigencia = () => {
        const inicio = new Date(formData.fecha_inicio_membresia || fechaRegistro);
        if (Number.isNaN(inicio.getTime())) return '';

        const vigencia = new Date(inicio);
        vigencia.setMonth(vigencia.getMonth() + Number(formData.meses_membresia || 6));
        return vigencia.toISOString().split('T')[0];
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            const incompleteSteps = steps.map((_, index) => ({
                index,
                isComplete: validateStep(index)
            }))
            .filter(step => !step.isComplete);

            if (incompleteSteps.length > 0){
                setError('Debes completar todos los apartados antes de registrar al beneficiario');
                setLoading(false);
                return;
            }
            // Validacion del input
            // CURP
            // if (formData.CURP && !validarCURP(formData.CURP)) {
            //     setError('El CURP debe tener un formato válido de 18 caracteres');
            // }
            // // Codigo Postal
            // if(formData.domicilio_cp && !cpValido(formData.domicilio_cp)){
            //     setError('El codigo postal debe tener 5 digitos numericos');
            //     setLoading(false);
            //     return;
            // }
            // // Nombres y Apellidos
            // if(
            //     !soloLetras(formData.nombres) ||
            //     !soloLetras(formData.apellido_paterno)||
            //     !soloLetras(formData.apellido_materno)
            // ) {
            //     setError('El nombre y apellidos son campos obligatorios');
            //     setLoading(false);
            //     return;
            // }

            // // Telefono de Contacto
            // if (formData.contacto_telefono && !telefonoValido(formData.contacto_telefono)){
            //     setError('El telefono debe tener 10 digitos numericos');
            //     setLoading(false);
            //     return;
            // }

            const token = localStorage.getItem('token');
            const payload = {
                fecha_ingreso: new Date(fechaRegistro),
                genero: formData.genero,
                tipo_espinas: formData.tipo_espinas,
                identificadores: {
                    CURP: formData.CURP,
                    nombres: formData.nombres,
                    apellido_paterno: formData.apellido_paterno,
                    apellido_materno: formData.apellido_materno,
                    fecha_nacimiento: new Date(fechaNacimiento),
                    estado_nacimiento: formData.estado_nacimiento,
                    fotografia: formData.fotografia, // Omitido por ahora
                    telefono: formData.telefono,
                    email: formData.email
                },
                datos_medicos: {
                    contacto_nombre: formData.contacto_nombre,
                    contacto_telefono: formData.contacto_telefono,
                    contacto_parentesco: formData.contacto_parentesco,
                    alergias: formData.alergias,
                    tipo_sanguineo: formData.tipo_sanguineo
                },
                direccion: {
                    domicilio_calle: formData.domicilio_calle,
                    domicilio_cp: formData.domicilio_cp,
                    domicilio_ciudad: formData.domicilio_ciudad,
                    domicilio_estado: formData.domicilio_estado
                },

                membresia: {
                    fecha_inicio: new Date(formData.fecha_inicio_membresia),
                    meses: Number(formData.meses_membresia),
                    precio_mensual: 0,
                    metodo_pago: 'donacion'
                }
            };

            const response = await fetch('http://localhost:3000/api/beneficiarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                // console.log('STATUS ERROR:', response.status);
                // console.log('ERROR BACKEND:', errorData);
                // console.error('Error details:', errorData.details); // Para ver en consola
                throw new Error(errorData.details?.fieldErrors ? JSON.stringify(errorData.details.fieldErrors) : errorData.message || 'Error al registrar beneficiario');
            }
            
            const data = await response.json();
            alert('Beneficiario registrado exitosamente');
            navigate('/beneficiarios');
            // Redirect or reset form
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <>
                        <div className="section-block">
                            <h2>Identidad</h2>

                                <div className='row'>
                                    <div className='field-group full'>
                                        <label>Correo Electronico</label>
                                        <input 
                                        type="email" 
                                        name='email'
                                        value={formData.email}
                                        onChange={handleInputChange}/>
                                        {fieldErrors.email && (
                                            <small className='field-error'>
                                                {fieldErrors.email}
                                            </small>
                                        )}
                                    </div>

                                    <div className="field-group full">
                                        <label>Nombres</label>
                                        <input 
                                        type="text" 
                                        name="nombres" 
                                        value={formData.nombres} 
                                        onChange={handleInputChange} />
                                        {fieldErrors.nombres && (
                                            <small className='field-error'>
                                                {fieldErrors.nombres}
                                            </small>
                                        )}
                                    </div>
                                </div>

                            <div className="row">
                                <div className="field-group">
                                    <label>Apellido Paterno</label>
                                    <input type="text"
                                     name="apellido_paterno" 
                                     value={formData.apellido_paterno} 
                                     onChange={handleInputChange} />
                                     {fieldErrors.apellido_paterno && (
                                        <small className="field-error">
                                            {fieldErrors.apellido_paterno}
                                        </small>
                                    )}
                                </div>

                                <div className="field-group">
                                    <label>Apellido Materno</label>
                                    <input type="text" 
                                    name="apellido_materno" 
                                    value={formData.apellido_materno} 
                                    onChange={handleInputChange} />
                                    {fieldErrors.apellido_materno && (
                                        <small className="field-error">
                                            {fieldErrors.apellido_materno}
                                        </small>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="section-block">
                            <h2>Datos Demográficos</h2>
                            <div className="row">
                                <div className="field-group">
                                    <label>Fecha de Nacimiento</label>
                                    <div className="input-with-icon">
                                        <input 
                                            ref={fechaNacimientoRef}
                                            type="date" 
                                            name="fecha_nacimiento"
                                            value={fechaNacimiento}
                                            onChange={(e) => setFechaNacimiento(e.target.value)}
                                        />
                                        <FaCalendar 
                                            className="icon" 
                                            onClick={() => fechaNacimientoRef.current?.showPicker()}
                                        />
                                    </div>
                                </div>

                                <div className="field-group">
                                    <label>CURP</label>
                                    <input type="text" 
                                    name="CURP" 
                                    value={formData.CURP} 
                                    maxLength={18} 
                                    onChange={handleInputChange} 
                                    placeholder="XXXX000000XXXXXX00" />
                                    {fieldErrors.CURP && (
                                        <small className="field-error">
                                            {fieldErrors.CURP}
                                        </small>
                                    )}
                                </div>

                            </div>
                            <div className="row">
                                <div className="field-group">
                                    <label>Género</label>
                                    <select name="genero" 
                                    value={formData.genero} 
                                    onChange={handleInputChange}>
                                        <option value="">Seleccionar género...</option>
                                        <option value="masculino">Masculino</option>
                                        <option value="femenino">Femenino</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                </div>
                                <div className="field-group">
                                    <label>Lugar de Nacimiento</label>
                                    <select name="estado_nacimiento" 
                                    value={formData.estado_nacimiento} 
                                    onChange={handleInputChange}>
                                        <option value="">Seleccionar estado...</option>
                                        {estadosMexico.map(estado => <option key={estado} value={estado}>{estado}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 1:
                return (
                    <div className="section-block">
                        <h2>Información Médica</h2>
                        <div className="row">
                            <div className="field-group">
                                <label>Nombre de Contacto o Tutor</label>
                                <input type="text" 
                                name="contacto_nombre" 
                                value={formData.contacto_nombre} 
                                onChange={handleInputChange} />
                                {fieldErrors.apellido_paterno && (
                                        <small className="field-error">
                                            {fieldErrors.contacto_nombre}
                                        </small>
                                    )}
                            </div>

                            <div className="field-group">
                                <label>Teléfono de Contacto o Tutor</label>
                                <input type="text"
                                 name="contacto_telefono" 
                                 value={formData.contacto_telefono} 
                                 onBlur={handleBlur}
                                 maxLength={10}
                                 onChange={handleInputChange} />
                                 {fieldErrors.contacto_telefono && (
                                    <small className='field-error'>
                                        {fieldErrors.contacto_telefono}
                                    </small>
                                 )}
                            </div>
                        </div>
                        <div className="row">
                            <div className="field-group">
                                <label>Parentesco</label>
                                <input type="text" name="contacto_parentesco" value={formData.contacto_parentesco} onChange={handleInputChange} />
                            </div>
                            <div className="field-group">
                                <label>Tipo Sanguíneo</label>
                                <select name="tipo_sanguineo" value={formData.tipo_sanguineo} onChange={handleInputChange}>
                                    <option value="">Seleccionar...</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>
                        </div>
                            <div className="field-group full">
                            <label>Tipo de Espina Bifida</label>
                            <div className="checkbox-group" >
                                {espinaBifidaOptions.map(type => (
                                    <label key={type.value} className={`checkbox-card ${formData.tipo_espinas.includes(type.value) ? 'checked' : ''}`}>
                                        <input 
                                            type="checkbox" 
                                            value={type.value} 
                                            checked={formData.tipo_espinas.includes(type.value)}
                                            onChange={handleTipoEspinasChange}
                                        />
                                        <div className="checkbox-card-mark"></div>
                                        <span>{type.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="field-group full">
                            <label>Alergias</label>
                            <textarea name="alergias" value={formData.alergias} onChange={handleInputChange} />
                        </div>
                        {/* TODO Agregar examenes medicos */}
                    </div>
                );
            case 2:
                return (
                    <div className="section-block">
                        <h2>Domicilio</h2>
                        <div className="field-group full">
                            <label>Calle</label>
                            <input type="text" name="domicilio_calle" value={formData.domicilio_calle} onChange={handleInputChange} />
                        </div>
                        <div className="row">
                            <div className='field-group'>
                                <label>Estado</label>
                                <select name="domicilio_estado"
                                value={formData.domicilio_estado}
                                onChange={handleInputChange}>
                                    <option value="">Seleccionar estado...</option>
                                    {estadosMexico.map((estado) => (
                                        <option key={estado} value={estado}>
                                            {estado}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="field-group">
                                <label>Ciudad</label>
                                <input type="text" name="domicilio_ciudad" value={formData.domicilio_ciudad} onChange={handleInputChange} />
                            </div>

                            <div className="field-group">
                                <label>Código Postal</label>
                                <input type="text" 
                                name="domicilio_cp" 
                                value={formData.domicilio_cp} 
                                maxLength={5}
                                onChange={handleInputChange}
                                onBlur={handleBlur} />
                                {fieldErrors.domicilio_cp && (
                                    <small className="field-error">
                                        {fieldErrors.domicilio_cp}
                                    </small>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="section-block">
                        <h2>Membresía</h2>
                        

                        <div className="field-group">
                            <label>Meses de vigencia</label>
                            <input
                                type="number"
                                name="meses_membresia"
                                value={formData.meses_membresia}
                                min={1}
                                max={36}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className='section-block'> 
                            <h2>Vigencia</h2>
                        <div className='row'>
                            <div className="field-group">
                                <label>Fecha de inicio de membresía</label>
                                <div className='input-with-icon'>
                                    <input
                                    ref={fechaMembresiaRef}
                                    type="date"
                                    name="fecha_inicio_membresia"
                                    value={formData.fecha_inicio_membresia}
                                    onChange={handleInputChange}
                                />
                                <FaCalendar 
                                className='icon'
                                onClick={() => fechaMembresiaRef.current?.showPicker()}/>
                                </div>
                            </div>

                            <div className="field-group">
                                <label>Fecha de vigencia</label>
                                <input
                                    type="date"
                                    value={calculateFechaVigencia()}
                                    readOnly/>
                            </div>
                        </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const validateStep = (stepIndex) => {
        switch (stepIndex) {
            case 0: //Datos Personales
                return (
                    formData.nombres &&
                    formData.apellido_paterno &&
                    formData.apellido_materno &&
                    validarCURP(formData.CURP) &&
                    formData.genero &&
                    formData.estado_nacimiento &&
                    fechaNacimiento
                );
            
            case 1: //Informacion Medica
                return (
                    formData.contacto_nombre &&
                    telefonoValido(formData.contacto_telefono) &&
                    formData.contacto_parentesco &&
                    formData.tipo_sanguineo &&
                    formData.tipo_espinas &&
                    formData.tipo_espinas.length > 0 &&
                    formData.alergias
                );
            
            case 2: //Domicilio
                return (
                    formData.domicilio_calle &&
                    // Por ahora solo valida que sean numeros y que sean 5
                    // TODO falta que valide que sea un CP de México
                    cpValido(formData.domicilio_cp) &&
                    formData.domicilio_ciudad &&
                    formData.domicilio_estado
                );
            
            case 3: //Membresia
                return (
                    Boolean(formData.fecha_inicio_membresia) &&
                    Number(formData.meses_membresia) > 0
                );
            default:
                return false;
        }
    };

    // Validar que todos los datos esten completos para que el nuevo beneficiario se pueda registrar
    const areAllStepsComplete = steps.every((_, index) => validateStep(index));

    // Mostrar mensaje de error para los fields en los que no se complete la informacion correctamente
    const handleBlur = (e) => {
        const {name, value} = e.target;
        validateField(name, value);
    };

    const validateField = (name, value) => {
        let error = '';

        switch(name){
            case 'contacto_telefono':
                if(value && !telefonoValido(value)){
                    error = 'No es un numero de telefono valido';
                }
                break;
            case 'domicilio_cp':
                if(value && !cpValido(value)){
                    error = 'No es un codigo postal Valido';
                }
                break;
            case 'nombres':
            case 'apellido_paterno':
            case 'apellido_materno':
                if (value && !soloLetras(value)) {
                    error = 'Solo se permiten letras';
                }
                break;

            default:
                break;
        }
        setFieldErrors(prev => ({
            ...prev, 
            [name]: error
        }));
    };

    return(
        <div className="page">
            <main className="content">
                <section className="page-header">
                    <h1>Registro de Nuevo Beneficiario</h1>
                    <p>
                        Completa la información para dar de alta a un nuevo
                        beneficiario en el sistema 
                    </p>
                </section>

                <section className="layout">
                    <aside className="sidebar">
                        <ul className="steps">
                            {steps.map((step, index) => {
                                const isComplete = validateStep(index);
                                const isTouched = touchedSteps.includes(index);

                                return (
                                    <li
                                    key={index}
                                    className={`step ${
                                        index === currentStep
                                        ? 'active'
                                        :index < currentStep
                                        ? 'completed'
                                        :''
                                    }`}
                                    >
                                        {/* ICONOS */}
                                        {isTouched ? (
                                            isComplete ? (
                                                <FaCheckCircle className='step-icon success'></FaCheckCircle>
                                            ) : (
                                                <FaExclamationCircle className='step-icon warning'></FaExclamationCircle>
                                            )
                                        ) : (
                                            <step.icon className='step-icon'></step.icon>
                                        )}
                                        {step.label}
                                    </li>
                                );
                                
                            }
                        )}
 
                        </ul>
                        <div className="sidebar-buttons">
                            {/* CONTINUAR */}
                            {currentStep < steps.length - 1 ? (
                                <button className="btn btn-primary" 
                                onClick={handleNext}>Continuar</button>
                            ) : (
                                <button className="btn btn-primary" 
                                onClick={handleSubmit} disabled={loading || !areAllStepsComplete}>
                                    {loading ? 'Registrando...' : 'Registrar'}
                                </button>
                            )}

                            {/* REGRESAR */}

                            {currentStep > 0 && <button 
                            className="btn btn-secondary" 
                            onClick={handlePrev}>Anterior</button>}

                            {/* CANCELAR */}
                            <button className="btn btn-danger"
                            onClick={() => {if (confirm("Seguro que quieres cancelar?")){navigate('/beneficiarios')}
                            }}>Cancelar</button>
                            
                        </div>
                    </aside>

                    <section className="form-card">
                        <div className="top-info">
                            <FotoPerfilInput 
                            value={formData.fotografia}
                            onChange={handleFotoChange}
                            onError={handleFotoError}
                            />

                            <div className="meta-fields">
                                <div className="field-group">
                                    <label>FOLIO DE BENEFICIARIO</label>
                                    <input type="text" 
                                    value={folio} 
                                    readOnly
                                    className='readonly-field' />
                                </div>
                                <div className="field-group">
                                    <label>FECHA DE REGISTRO</label>
                                    <div className="input-with-icon">
                                        <input 
                                            type="date" 
                                            value={fechaRegistro}
                                            readOnly
                                            className='readonly-field'
                                        />
                                        
                                    </div>
                                </div>
                            </div>
                        </div>

                        {renderStepContent()}

                        {error && <div className="error-message">{error}</div>}
                    </section>
                </section>
            </main>
        </div>
    );
}

export default RegistroBeneficiario;
