import styles from './BeneficiarioDetalle.module.css'

function calcAge(fechaNacimiento) {
  const diff = Date.now() - new Date(fechaNacimiento).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-MX')
}

function BeneficiarioDetalle({ beneficiario }) {
  const { folio, fecha_ingreso, genero, tipo_espina, identificadores, datos_medicos, direccion } = beneficiario
  const { nombres, apellido_paterno, apellido_materno, CURP, fecha_nacimiento, estado_nacimiento, telefono, email } = identificadores
  const { tipo_sanguineo, contacto_nombre, contacto_telefono, contacto_parentesco, valvula, hospital } = datos_medicos
  const { domicilio_calle, domicilio_cp, domicilio_ciudad, domicilio_estado } = direccion
  const fecha_inicio = beneficiario.membresia?.fecha_inicio ?? null
  const fecha_fin    = beneficiario.membresia?.fecha_fin    ?? null

  const nombreCompleto = `${nombres} ${apellido_paterno} ${apellido_materno ?? ''}`.trim()
  const diagnostico = tipo_espina.map(e => e.nombre).join(' · ') || '—'
  const valvulaTexto =
    valvula === 1 || valvula === '1' || valvula === true ? 'Sí'
    : valvula === 0 || valvula === '0' || valvula === false ? 'No'
    : '—'

  return (
    <div className={styles.modalBody}>

      {/* LEFT */}
      <div className={styles.col}>
        <p className={styles.sectionLabel}>Beneficiario</p>

        <div className={styles.topSection}>
          <div className={styles.avatar} />
          <div className={styles.topInfo}>
            <div className={`${styles.field} ${styles.full}`}>
              <span className={styles.fieldLabel}>Nombre</span>
              <span className={styles.fieldValue}>{nombreCompleto}</span>
            </div>
            <div className={`${styles.field} ${styles.full}`}>
              <span className={styles.fieldLabel}>CURP</span>
              <span className={styles.fieldValue} style={{ fontSize: '11px' }}>{CURP}</span>
            </div>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Fecha de nacimiento</span>
            <span className={styles.fieldValue}>{formatDate(fecha_nacimiento)}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Edad</span>
            <span className={styles.fieldValue}>{calcAge(fecha_nacimiento)}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Sexo</span>
            <span className={styles.fieldValue}>{genero}</span>
          </div>
        </div>

        <div className={styles.row}>
          <div className={`${styles.field} ${styles.full}`}>
            <span className={styles.fieldLabel}>Nombre padre / madre</span>
            <span className={`${styles.fieldValue} ${styles.placeholder}`}>—</span>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Folio</span>
            <span className={styles.fieldValue}>{folio}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Fecha de alta</span>
            <span className={styles.fieldValue}>{formatDate(fecha_ingreso)}</span>
          </div>
        </div>

        <p className={styles.sectionLabel}>Dirección</p>

        <div className={styles.row}>
          <div className={`${styles.field} ${styles.wide}`}>
            <span className={styles.fieldLabel}>Calle</span>
            <span className={styles.fieldValue}>{domicilio_calle}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Ciudad</span>
            <span className={styles.fieldValue}>{domicilio_ciudad}</span>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Estado</span>
            <span className={styles.fieldValue}>{domicilio_estado}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>C.P.</span>
            <span className={styles.fieldValue}>{domicilio_cp}</span>
          </div>
        </div>
      </div>

      <div className={styles.dividerV} />

      {/* RIGHT */}
      <div className={styles.col}>
        <p className={styles.sectionLabel}>Contacto</p>

        <div className={styles.row}>
          <div className={`${styles.field} ${styles.wide}`}>
            <span className={styles.fieldLabel}>Email</span>
            <span className={styles.fieldValue}>{email ?? '—'}</span>
          </div>
          <div className={`${styles.field} ${styles.wide}`}>
            <span className={styles.fieldLabel}>Teléfono</span>
            <span className={styles.fieldValue}>{telefono ?? '—'}</span>
          </div>
        </div>

        <div className={styles.row}>
          <div className={`${styles.field} ${styles.wide}`}>
            <span className={styles.fieldLabel}>Contacto de emergencia</span>
            <span className={styles.fieldValue}>{contacto_nombre} ({contacto_parentesco})</span>
          </div>
          <div className={`${styles.field} ${styles.wide}`}>
            <span className={styles.fieldLabel}>Tel. emergencia</span>
            <span className={styles.fieldValue}>{contacto_telefono}</span>
          </div>
        </div>

        <p className={styles.sectionLabel}>Historial</p>

        <div className={styles.row}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Estado de nacimiento</span>
            <span className={styles.fieldValue}>{estado_nacimiento}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Hospital</span>
            <span className={styles.fieldValue}>{hospital}</span>
          </div>
        </div>

        <div className={styles.row}>
          <div className={`${styles.field} ${styles.full}`}>
            <span className={styles.fieldLabel}>Diagnóstico</span>
            <span className={styles.fieldValue}>{diagnostico}</span>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Tipo de sangre</span>
            <span className={styles.fieldValue}>{tipo_sanguineo}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Válvula</span>
            <span className={styles.fieldValue}>{valvulaTexto}</span>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Etapa de vida</span>
            <span className={`${styles.fieldValue} ${styles.placeholder}`}>—</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>¿Vive el beneficiario?</span>
            <span className={`${styles.fieldValue} ${styles.placeholder}`}>—</span>
          </div>
        </div>

        <div className={styles.row}>
          <div className={`${styles.field} ${styles.full}`}>
            <span className={styles.fieldLabel}>Notas</span>
            <span className={`${styles.fieldValue} ${styles.placeholder}`} style={{ minHeight: '32px' }}>—</span>
          </div>
        </div>

        <p className={styles.sectionLabel}>Vigencia de Membresía</p>

        <div className={styles.row}>
          <div className={`${styles.field} ${styles.wide}`}>
            <span className={styles.fieldLabel}>Desde</span>
            <span className={styles.fieldValue}>{fecha_inicio ? formatDate(fecha_inicio) : '—'}</span>
          </div>
          <div className={`${styles.field} ${styles.wide}`}>
            <span className={styles.fieldLabel}>Hasta</span>
            <span className={styles.fieldValue}>{fecha_fin ? formatDate(fecha_fin) : '—'}</span>
          </div>
        </div>
      </div>

    </div>
  )
}

export default BeneficiarioDetalle