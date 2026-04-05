import './styles/registro_beneficiario.css';
import { FaCalendar, FaUser, FaBriefcaseMedical, FaHome, FaAddressCard, FaUpload } from 'react-icons/fa';

function RegistroBeneficiario() {
    return(
        <div className="page">
            {/* Navbar y top */}
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
                            <li className="step active"><FaUser className="step-icon" /> Datos Personales</li>
                            <li className="step"><FaBriefcaseMedical className="step-icon" /> Información Médica</li>
                            <li className="step"><FaHome className="step-icon" /> Domicilio</li>
                            <li className="step"><FaAddressCard className='step-icon'/> Membresía</li> 
                        </ul>
                    <div className="sidebar-buttons">
                        <button className="btn btn-secondary">Cancelar</button>
                        <button className="btn btn-primary">Continuar</button>
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
                                    <label>FOLIO (AUTO)</label>
                                    <input type="text" placeholder="ASB-2026-0001" />
                                </div>

                                <div className="field-group">
                                    <label>FECHA DE REGISTRO</label>
                                    <div className="input-with-icon">
                                        <input type="text" placeholder="13 de Marzo, 2026" />
                                        <FaCalendar className="icon" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="section-block">
                            <h2>Identidad</h2>

                            <div className="field-group full">
                                <label>Nombre(s)</label>
                                <input type="text" />
                            </div>
                        
                        <div className="row">
                            <div className="field-group">
                                <label>Apellido Paterno</label>
                                <input type="text"/>
                            </div>

                            <div className="field-group">
                                <label>Apellido Materno</label>
                                <input type="text" />
                            </div>
                        </div>
                        </div>

                        <div className="section-block">
                            <h2>Datos Demográficos</h2>
                            <div className="row">
                            <div className="field-group">
                                <label>Fecha de Nacimiento</label>
                                <div className="input-with-icon">
                                    <input type="text" placeholder="dd/mm/yyyy" />
                                    <FaCalendar className="icon" />
                                </div>
                            </div>


                                <div className="field-group">
                                    <label>CURP</label>
                                    <input type="text" placeholder="XXXX000000XXXXXX00" />
                                </div>
                            </div>

                            <div className="row">
                                <div className="field-group">
                                    <label>Género</label>
                                    <select>
                                        <option>Seleccionar género...</option>
                                    </select>
                                </div>

                                <div className="field-group">
                                    <label>Lugar de Nacimiento</label>
                                    <select>
                                        <option>Seleccionar estado...</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>
                </section>
            </main>
        </div>
    );
}

export default RegistroBeneficiario;