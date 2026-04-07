import './styles/registro_beneficiario.css';
import {useRef, useState} from 'react';
import { FaCalendar, FaUser, FaBriefcaseMedical, FaHome, FaAddressCard, FaUpload } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const estadosMexico = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua',
    'Ciudad de Mexico', 'Coahuila', 'Colima', 'Durango', 'Estado de Mexico', 'Guanajuato',
    'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacan', 'Morelos', 'Nayarit', 'Nuevo Leon',
    'Oaxaca', 'Puebla', 'Queretaro', 'Quintana Roo', 'San Luis Potosi', 'Sinaloa',
    'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatan', 'Zacatecas'
];

const espinaTypes = [
    { id: 1, nombre: 'Espina bifida oculta' },
    { id: 2, nombre: 'Meningocele' },
    { id: 3, nombre: 'Mielomeningocele' },
    { id: 4, nombre: 'Lipomeningocele' },
    // { id: 5, nombre: 'Otro' } Falta ver como esto de que otro se va a manejar.
];

function RegistroBeneficiario() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [fechaRegistro, setFechaRegistro] = useState(new Date().toISOString().split('T')[0]);
    const [fechaNacimiento, setFechaNacimiento] = useState("");
    const [formData, setFormData] = useState({
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        CURP: '',
        genero: '',
        estado_nacimiento: '',
        fotografia: '',
        telefono: '',
        email: '',
        contacto_nombre: '',
        contacto_telefono: '',
        contacto_parentesco: '',
        alergias: '',
        tipo_sanguineo: '',
        domicilio_calle: '',
        domicilio_cp: '',
        domicilio_ciudad: '',
        domicilio_estado: '',
        tipo_espinas: [] // Assuming array of IDs
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fechaRegistroRef = useRef(null);
    const fechaNacimientoRef = useRef(null);

    const steps = [
        { icon: FaUser, label: 'Datos Personales' },
        { icon: FaBriefcaseMedical, label: 'Información Médica' },
        { icon: FaHome, label: 'Domicilio' },
        { icon: FaAddressCard, label: 'Membresía' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTipoEspinasChange = (e) => {
        const { value, checked } = e.target;
        const id = parseInt(value);
        setFormData(prev => ({
            ...prev,
            tipo_espinas: checked 
                ? [...prev.tipo_espinas, id]
                : prev.tipo_espinas.filter(t => t !== id)
        }));
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
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
                    fotografia: formData.fotografia,
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
                throw new Error(errorData.message || 'Error al registrar beneficiario');
            }

            const data = await response.json();
            alert('Beneficiario registrado exitosamente');
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
                            <div className="field-group full">
                                <label>Nombres</label>
                                <input type="text" name="nombres" value={formData.nombres} onChange={handleInputChange} />
                            </div>
                            <div className="row">
                                <div className="field-group">
                                    <label>Apellido Paterno</label>
                                    <input type="text" name="apellido_paterno" value={formData.apellido_paterno} onChange={handleInputChange} />
                                </div>
                                <div className="field-group">
                                    <label>Apellido Materno</label>
                                    <input type="text" name="apellido_materno" value={formData.apellido_materno} onChange={handleInputChange} />
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
                                    <input type="text" name="CURP" value={formData.CURP} onChange={handleInputChange} placeholder="XXXX000000XXXXXX00" />
                                </div>
                            </div>
                            <div className="row">
                                <div className="field-group">
                                    <label>Género</label>
                                    <select name="genero" value={formData.genero} onChange={handleInputChange}>
                                        <option value="">Seleccionar género...</option>
                                        <option value="masculino">Masculino</option>
                                        <option value="femenino">Femenino</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                </div>
                                <div className="field-group">
                                    <label>Lugar de Nacimiento</label>
                                    <select name="estado_nacimiento" value={formData.estado_nacimiento} onChange={handleInputChange}>
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
                                <input type="text" name="contacto_nombre" value={formData.contacto_nombre} onChange={handleInputChange} />
                            </div>
                            <div className="field-group">
                                <label>Teléfono de Contacto o Tutor</label>
                                <input type="text" name="contacto_telefono" value={formData.contacto_telefono} onChange={handleInputChange} />
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
                            <label>Alergias</label>
                            <textarea name="alergias" value={formData.alergias} onChange={handleInputChange} />
                        </div>
                        <div className="field-group full">
                            <label>Tipo de Espina Bifida</label>
                            <div className="checkbox-group">
                                {espinaTypes.map(type => (
                                    <label key={type.id} className="checkbox-card">
                                        <input 
                                            type="checkbox" 
                                            value={type.id} 
                                            checked={formData.tipo_espinas.includes(type.id)}
                                            onChange={handleTipoEspinasChange}
                                        />
                                        <span>{type.nombre}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
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
                            <div className="field-group">
                                <label>Código Postal</label>
                                <input type="text" name="domicilio_cp" value={formData.domicilio_cp} onChange={handleInputChange} />
                            </div>
                            <div className="field-group">
                                <label>Ciudad</label>
                                <input type="text" name="domicilio_ciudad" value={formData.domicilio_ciudad} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="section-block">
                        <h2>Membresía</h2>
                        {/* TODO añadir la parte de membresia, que se vea la forma de la tarjeta para ver que los datos esten bien */}
                    </div>
                );
            default:
                return null;
        }
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
                            {steps.map((step, index) => (
                                <li key={index} className={`step ${index === currentStep ? 'active' : index < currentStep ? 'completed' : ''}`}>
                                    <step.icon className="step-icon" /> {step.label}
                                </li>
                            ))}
                        </ul>
                        <div className="sidebar-buttons">
                            <button className='btn btn-secondary'
                            onClick={() => {if (confirm("Seguro que quieres cancelar?")){navigate('/beneficiarios')}
                            }}>Cancelar</button>

                            {currentStep > 0 && <button className="btn btn-secondary" onClick={handlePrev}>Anterior</button>}
                            {currentStep < steps.length - 1 ? (
                                <button className="btn btn-primary" onClick={handleNext}>Continuar</button>
                            ) : (
                                <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                                    {loading ? 'Registrando...' : 'Registrar'}
                                </button>
                            )}
                        </div>
                    </aside>

                    <section className="form-card">
                        <div className="top-info">
                           <div className="photo-box">
                                <div className="photo-circle">Foto</div>
                                <p>Foto de Perfil</p>
                                <button className="link-button"><FaUpload className='step-icon' /> Subir fotografía</button>
                            </div> 

                            <div className="meta-fields">
                                <div className="field-group">
                                    <label>FOLIO (AUTOMATICO)</label>
                                    <input type="text" readOnly />
                                </div>
                                <div className="field-group">
                                    <label>FECHA DE REGISTRO</label>
                                    <div className="input-with-icon">
                                        <input 
                                            type="date" 
                                            value={fechaRegistro}
                                            readOnly
                                        />
                                        <FaCalendar className="icon" />
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