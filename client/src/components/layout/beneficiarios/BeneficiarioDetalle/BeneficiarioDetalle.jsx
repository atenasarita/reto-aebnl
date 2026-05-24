import { useEffect, useState } from 'react'
import styles from './BeneficiarioDetalle.module.css'
import { API_URL } from '../../../../utils/config'

function calcAge(fechaNacimiento) {
  if (!fechaNacimiento) return '—'
  const diff = Date.now() - new Date(fechaNacimiento).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const dateOnly = String(dateStr).split('T')[0]
  const [year, month, day] = dateOnly.split('-')
  return `${Number(day)}/${Number(month)}/${year}`
}

function formatInputDate(dateStr) {
  if (!dateStr) return ''
  return String(dateStr).split('T')[0]
}

function BeneficiarioDetalle({ beneficiario, startInEditMode = false, onUpdated }) {
  const {
    id_beneficiario,
    folio,
    fecha_ingreso,
    genero,
    tipo_espina,
    identificadores,
    datos_medicos,
    direccion
  } = beneficiario

  const {
    nombres,
    apellido_paterno,
    apellido_materno,
    CURP,
    fecha_nacimiento,
    estado_nacimiento,
    fotografia,
    telefono,
    email
  } = identificadores

  const {
    tipo_sanguineo,
    contacto_nombre,
    contacto_telefono,
    contacto_parentesco,
    valvula,
    hospital
  } = datos_medicos

  const {
    domicilio_calle,
    domicilio_cp,
    domicilio_ciudad,
    domicilio_estado
  } = direccion

  const fecha_inicio = beneficiario.membresia?.fecha_inicio ?? null
  const fecha_fin = beneficiario.membresia?.fecha_fin ?? null

  const diagnostico = tipo_espina?.map(e => e.nombre).join(' · ') || '—'
  const valvulaTexto =
    valvula === 1 || valvula === '1' || valvula === true ? 'Sí'
      : valvula === 0 || valvula === '0' || valvula === false ? 'No'
        : '—'

  const fotoURL = fotografia || null

  const [isEditing, setIsEditing] = useState(startInEditMode)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    CURP: '',
    fecha_nacimiento: '',
    genero: '',
    telefono: '',
    email: '',
    estado_nacimiento: '',
    contacto_nombre: '',
    contacto_telefono: '',
    contacto_parentesco: '',
    tipo_sanguineo: '',
    hospital: '',
    domicilio_calle: '',
    domicilio_ciudad: '',
    domicilio_estado: '',
    domicilio_cp: ''
  })

  useEffect(() => {
    setFormData({
      nombres: nombres || '',
      apellido_paterno: apellido_paterno || '',
      apellido_materno: apellido_materno || '',
      CURP: CURP || '',
      fecha_nacimiento: formatInputDate(fecha_nacimiento),
      genero: genero || '',
      telefono: telefono || '',
      email: email || '',
      estado_nacimiento: estado_nacimiento || '',
      contacto_nombre: contacto_nombre || '',
      contacto_telefono: contacto_telefono || '',
      contacto_parentesco: contacto_parentesco || '',
      tipo_sanguineo: tipo_sanguineo || '',
      hospital: hospital || '',
      domicilio_calle: domicilio_calle || '',
      domicilio_ciudad: domicilio_ciudad || '',
      domicilio_estado: domicilio_estado || '',
      domicilio_cp: domicilio_cp || ''
    })
  }, [
    nombres,
    apellido_paterno,
    apellido_materno,
    CURP,
    fecha_nacimiento,
    genero,
    telefono,
    email,
    estado_nacimiento,
    contacto_nombre,
    contacto_telefono,
    contacto_parentesco,
    tipo_sanguineo,
    hospital,
    domicilio_calle,
    domicilio_ciudad,
    domicilio_estado,
    domicilio_cp
  ])

  useEffect(() => {
    setIsEditing(startInEditMode)
  }, [startInEditMode, beneficiario])

  const nombreCompleto = `${formData.nombres} ${formData.apellido_paterno} ${formData.apellido_materno ?? ''}`.trim()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCancel = () => {
    setFormData({
      nombres: nombres || '',
      apellido_paterno: apellido_paterno || '',
      apellido_materno: apellido_materno || '',
      CURP: CURP || '',
      fecha_nacimiento: formatInputDate(fecha_nacimiento),
      genero: genero || '',
      telefono: telefono || '',
      email: email || '',
      estado_nacimiento: estado_nacimiento || '',
      contacto_nombre: contacto_nombre || '',
      contacto_telefono: contacto_telefono || '',
      contacto_parentesco: contacto_parentesco || '',
      tipo_sanguineo: tipo_sanguineo || '',
      hospital: hospital || '',
      domicilio_calle: domicilio_calle || '',
      domicilio_ciudad: domicilio_ciudad || '',
      domicilio_estado: domicilio_estado || '',
      domicilio_cp: domicilio_cp || ''
    })

    setIsEditing(false)
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const token = localStorage.getItem('token')

      const response = await fetch(`${API_URL}/api/beneficiarios/${id_beneficiario}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar beneficiario')
      }

      setIsEditing(false)

      if (onUpdated) {
        await onUpdated()
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.modalBody}>
      <div className={styles.col}>
        <p className={styles.sectionLabel}>Beneficiario</p>

        <div className={styles.topSection}>
          <div className={styles.avatar}>
            {fotoURL ? (
              <img
                src={fotoURL}
                alt="Foto del beneficiario"
                className={styles.avatarImg}
              />
            ) : (
              <span>{formData.nombres?.charAt(0)}{formData.apellido_paterno?.charAt(0)}</span>
            )}
          </div>

          <div className={styles.topInfo}>
            <div className={`${styles.field} ${styles.full}`}>
              <span className={styles.fieldLabel}>Nombre(s)</span>
              {isEditing ? (
                <input
                  className={styles.input}
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                />
              ) : (
                <span className={styles.fieldValue}>{nombreCompleto}</span>
              )}
            </div>

            {isEditing && (
              <>
                <div className={`${styles.field} ${styles.full}`}>
                  <span className={styles.fieldLabel}>Apellido paterno</span>
                  <input
                    className={styles.input}
                    name="apellido_paterno"
                    value={formData.apellido_paterno}
                    onChange={handleChange}
                  />
                </div>

                <div className={`${styles.field} ${styles.full}`}>
                  <span className={styles.fieldLabel}>Apellido materno</span>
                  <input
                    className={styles.input}
                    name="apellido_materno"
                    value={formData.apellido_materno}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            <div className={`${styles.field} ${styles.full}`}>
              <span className={styles.fieldLabel}>CURP</span>
              {isEditing ? (
                <input
                  className={styles.input}
                  name="CURP"
                  value={formData.CURP}
                  onChange={handleChange}
                />
              ) : (
                <span className={styles.fieldValue} style={{ fontSize: '11px' }}>{formData.CURP || '—'}</span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Fecha de nacimiento</span>
            {isEditing ? (
              <input
                className={styles.input}
                type="date"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
              />
            ) : (
              <span className={styles.fieldValue}>{formatDate(fecha_nacimiento)}</span>
            )}
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>Edad</span>
            <span className={styles.fieldValue}>
              {formData.fecha_nacimiento ? calcAge(formData.fecha_nacimiento) : '—'}
            </span>
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>Sexo</span>
            {isEditing ? (
              <select
                className={styles.input}
                name="genero"
                value={formData.genero}
                onChange={handleChange}
              >
                <option value="">Selecciona</option>
                <option value="masculino">masculino</option>
                <option value="femenino">femenino</option>
                <option value="otro">otro</option>
              </select>
            ) : (
              <span className={styles.fieldValue}>{formData.genero || '—'}</span>
            )}
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
            {isEditing ? (
              <input
                className={styles.input}
                name="domicilio_calle"
                value={formData.domicilio_calle}
                onChange={handleChange}
              />
            ) : (
              <span className={styles.fieldValue}>{formData.domicilio_calle || '—'}</span>
            )}
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>Ciudad</span>
            {isEditing ? (
              <input
                className={styles.input}
                name="domicilio_ciudad"
                value={formData.domicilio_ciudad}
                onChange={handleChange}
              />
            ) : (
              <span className={styles.fieldValue}>{formData.domicilio_ciudad || '—'}</span>
            )}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Estado</span>
            {isEditing ? (
              <input
                className={styles.input}
                name="domicilio_estado"
                value={formData.domicilio_estado}
                onChange={handleChange}
              />
            ) : (
              <span className={styles.fieldValue}>{formData.domicilio_estado || '—'}</span>
            )}
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>C.P.</span>
            {isEditing ? (
              <input
                className={styles.input}
                name="domicilio_cp"
                value={formData.domicilio_cp}
                onChange={handleChange}
              />
            ) : (
              <span className={styles.fieldValue}>{formData.domicilio_cp || '—'}</span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.dividerV} />

      <div className={styles.col}>
        <p className={styles.sectionLabel}>Contacto</p>

        <div className={styles.row}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Email</span>
            {isEditing ? (
              <input
                className={styles.input}
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            ) : (
              <span className={styles.fieldValue}>{formData.email || '—'}</span>
            )}
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>Teléfono</span>
            {isEditing ? (
              <input
                className={styles.input}
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
              />
            ) : (
              <span className={styles.fieldValue}>{formData.telefono || '—'}</span>
            )}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Contacto de emergencia</span>
            {isEditing ? (
              <input
                className={styles.input}
                name="contacto_nombre"
                value={formData.contacto_nombre}
                onChange={handleChange}
              />
            ) : (
              <span className={styles.fieldValue}>{formData.contacto_nombre || '—'}</span>
            )}
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>Tel. emergencia</span>
            {isEditing ? (
              <input
                className={styles.input}
                name="contacto_telefono"
                value={formData.contacto_telefono}
                onChange={handleChange}
              />
            ) : (
              <span className={styles.fieldValue}>{formData.contacto_telefono || '—'}</span>
            )}
          </div>
        </div>

        <div className={styles.row}>
          <div className={`${styles.field} ${styles.full}`}>
            <span className={styles.fieldLabel}>Parentesco</span>
            {isEditing ? (
              <input
                className={styles.input}
                name="contacto_parentesco"
                value={formData.contacto_parentesco}
                onChange={handleChange}
              />
            ) : (
              <span className={styles.fieldValue}>{formData.contacto_parentesco || '—'}</span>
            )}
          </div>
        </div>

        <p className={styles.sectionLabel}>Historial</p>

        <div className={styles.row}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Estado de nacimiento</span>
            {isEditing ? (
              <input
                className={styles.input}
                name="estado_nacimiento"
                value={formData.estado_nacimiento}
                onChange={handleChange}
              />
            ) : (
              <span className={styles.fieldValue}>{formData.estado_nacimiento || '—'}</span>
            )}
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>Hospital</span>
            {isEditing ? (
              <input
                className={styles.input}
                name="hospital"
                value={formData.hospital}
                onChange={handleChange}
              />
            ) : (
              <span className={styles.fieldValue}>{formData.hospital || '—'}</span>
            )}
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
            {isEditing ? (
              <select
                className={styles.input}
                name="tipo_sanguineo"
                value={formData.tipo_sanguineo}
                onChange={handleChange}
              >
                <option value="">Selecciona</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            ) : (
              <span className={styles.fieldValue}>{formData.tipo_sanguineo || '—'}</span>
            )}
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>Válvula</span>
            <span className={styles.fieldValue}>{valvulaTexto}</span>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Desde</span>
            <span className={styles.fieldValue}>{fecha_inicio ? formatDate(fecha_inicio) : '—'}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Hasta</span>
            <span className={styles.fieldValue}>{fecha_fin ? formatDate(fecha_fin) : '—'}</span>
          </div>
        </div>

        {isEditing && (
          <div className={styles.editButtonWrapper}>
            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button className={styles.cancelBtn} onClick={handleCancel} disabled={saving}>
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default BeneficiarioDetalle