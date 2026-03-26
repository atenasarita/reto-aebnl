import './registro_beneficiario.css';

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
                            <li className="step active">Datos Personales</li>
                            <li className="step">Información Médica</li>
                            <li className="step">Domicilio</li>
                            <li className="step">Membresía</li> 
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
                                <button className="link-button">Subir fotografía</button>
                            </div> 

                            <div className="meta-fields">

                                <div className="field-group">
                                    <label>FOLIO (AUTO)</label>
                                    <input type="text" placeholder="ASB-2026-0001" />
                                </div>

                                <div className="field-group">
                                    <label>FECHA DE REGISTRO</label>
                                    <input type="text" placeholder="13 de Marzo, 2026" />
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
                                <input type="text" placeholder="dd/mm/yyyy" />
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