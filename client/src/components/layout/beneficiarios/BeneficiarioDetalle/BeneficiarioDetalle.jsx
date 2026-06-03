import { useEffect, useState } from 'react'
import styles from './BeneficiarioDetalle.module.css'
import { API_URL } from '../../../../utils/config'
import PropTypes from 'prop-types'

function parseDateOnly(dateStr) {
  if (!dateStr) return null
  const dateOnly = String(dateStr).split('T')[0]
  const [year, month, day] = dateOnly.split('-')
  if (!year || !month || !day) return null
  return new Date(Number(year), Number(month) - 1, Number(day))
}

function calcAge(fechaNacimiento) {
  const birthDate = parseDateOnly(fechaNacimiento)

  if (!birthDate) return null

  const diff = Date.now() - birthDate.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

function formatValvula(valvula) {
  if (valvula === 1 || valvula === '1' || valvula === true) return 'Sí'
  if (valvula === 0 || valvula === '0' || valvula === false) return 'No'
  return '—'
}

function formatDiagnostico(tipoEspina) {
  if (!Array.isArray(tipoEspina) || tipoEspina.length === 0) return '—'
  return tipoEspina.map((e) => e.nombre).join(' · ')
}

function formatDate(dateStr) {
  const date = parseDateOnly(dateStr)
  if (!date) return '—'
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear())
  return `${day}/${month}/${year}`
}

function formatInputDate(dateStr) {
  if (!dateStr) return ''
  return String(dateStr).split('T')[0]
}

function buildInitialFormData(beneficiario){
  const identificadores = beneficiario.identificadores || {}
  const datosMedicos = beneficiario.datos_medicos || {}
  const direccion = beneficiario.direccion || {}

  return {
    nombres: identificadores.nombres || '',
    apellido_paterno: identificadores.apellido_paterno || '',
    apellido_materno: identificadores.apellido_materno || '',
    CURP: identificadores.CURP || '',
    fecha_nacimiento: formatInputDate(identificadores.fecha_nacimiento),
    genero: beneficiario.genero || '',
    telefono: identificadores.telefono || '',
    email: identificadores.email || '',
    estado_nacimiento: identificadores.estado_nacimiento || '',
    contacto_nombre: datosMedicos.contacto_nombre || '',
    contacto_telefono: datosMedicos.contacto_telefono || '',
    contacto_parentesco: datosMedicos.contacto_parentesco || '',
    tipo_sanguineo: datosMedicos.tipo_sanguineo || '',
    hospital: datosMedicos.hospital || '',
    domicilio_calle: direccion.domicilio_calle || '',
    domicilio_ciudad: direccion.domicilio_ciudad || '',
    domicilio_estado: direccion.domicilio_estado || '',
    domicilio_cp: direccion.domicilio_cp || ''
  }
}

async function updateBeneficiario(idBeneficiario, formData) {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}/api/beneficiarios/${idBeneficiario}`, {
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

  return data
}

function EditableField({
  label,
  name,
  value,
  isEditing,
  onChange,
  type = 'text',
  className = styles.field,
  valueClassName = styles.fieldValue,
  inputClassName = styles.input,
  children
}) {
  const displayValue = value || '—'

  return (
    <div className={className}>
      <span className={styles.fieldLabel}>{label}</span>

      {isEditing ? (
        children || (
          <input
            className={inputClassName}
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
          />
        )
      ) : (
        <span className={valueClassName}>{displayValue}</span>
      )}
    </div>
  )
}

function BeneficiarioDetalle({
  beneficiario,
  startInEditMode = false,
  onUpdated,
  onClose
}) {
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

  const diagnostico = formatDiagnostico(tipo_espina)
  const valvulaTexto = formatValvula(valvula)

  const fotoURL = fotografia || null

  const [isEditing, setIsEditing] = useState(startInEditMode)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState(() => buildInitialFormData(beneficiario))

  useEffect(() => {
    setFormData(buildInitialFormData(beneficiario))
  }, [beneficiario])

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

  const resetForm = () => {
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
  }

  const handleCancel = () => {
    resetForm()
    setIsEditing(false)
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      await updateBeneficiario(id_beneficiario, formData)

      if (onUpdated) await onUpdated()

      setIsEditing(false)

      if (onClose) onClose()
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
            <EditableField
              label="Nombre(s)"
              name="nombres"
              value={isEditing ? formData.nombres : nombreCompleto}
              isEditing={isEditing}
              onChange={handleChange}
              className={`${styles.field} ${styles.full}`}
            />

            {isEditing && (
              <>
                <EditableField
                  label="Apellido paterno"
                  name="apellido_paterno"
                  value={formData.apellido_paterno}
                  isEditing={isEditing}
                  onChange={handleChange}
                  className={`${styles.field} ${styles.full}`}
                />

                 <EditableField
                  label="Apellido materno"
                  name="apellido_materno"
                  value={formData.apellido_materno}
                  isEditing={isEditing}
                  onChange={handleChange}
                  className={`${styles.field} ${styles.full}`}
                />
              </>
            )}

            <EditableField
              label="CURP"
              name="CURP"
              value={formData.CURP}
              isEditing={isEditing}
              onChange={handleChange}
              className={`${styles.field} ${styles.full}`}
              valueClassName={styles.fieldValue}
            />
          </div>
        </div>

        <div className={styles.row}>
          <EditableField
            label="Fecha de nacimiento"
            name="fecha_nacimiento"
            value={isEditing ? formData.fecha_nacimiento : formatDate(fecha_nacimiento)}
            isEditing={isEditing}
            onChange={handleChange}
            type="date"
            className={styles.field}
          />

          <div className={styles.field}>
            <span className={styles.fieldLabel}>Edad</span>
            <span className={styles.fieldValue}>
              {formData.fecha_nacimiento ? calcAge(formData.fecha_nacimiento) : '—'}
            </span>
          </div>

          <EditableField
            label="Sexo"
            name="genero"
            value={formData.genero}
            isEditing={isEditing}
            onChange={handleChange}
            className={styles.field}
          >
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
          </EditableField>
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
          <EditableField
            label="Calle"
            name="domicilio_calle"
            value={formData.domicilio_calle}
            isEditing={isEditing}
            onChange={handleChange}
            className={`${styles.field} ${styles.wide}`}
          />

          <EditableField
            label="Ciudad"
            name="domicilio_ciudad"
            value={formData.domicilio_ciudad}
            isEditing={isEditing}
            onChange={handleChange}
            className={styles.field}
          />
        </div>

        <div className={styles.row}>
          <EditableField
            label="Estado"
            name="domicilio_estado"
            value={formData.domicilio_estado}
            isEditing={isEditing}
            onChange={handleChange}
            className={styles.field}
          />

          <EditableField
            label="C.P."
            name="domicilio_cp"
            value={formData.domicilio_cp}
            isEditing={isEditing}
            onChange={handleChange}
            className={styles.field}
          />
        </div>
      </div>

      <div className={styles.dividerV} />

      <div className={styles.col}>
        <p className={styles.sectionLabel}>Contacto</p>

        <div className={styles.row}>
          <EditableField
            label="Email"
            name="email"
            value={formData.email}
            isEditing={isEditing}
            onChange={handleChange}
            className={styles.field}
          />

          <EditableField
            label="Teléfono"
            name="telefono"
            value={formData.telefono}
            isEditing={isEditing}
            onChange={handleChange}
            className={styles.field}
          />
        </div>

        <div className={styles.row}>
          <EditableField
            label="Contacto de emergencia"
            name="contacto_nombre"
            value={formData.contacto_nombre}
            isEditing={isEditing}
            onChange={handleChange}
            className={styles.field}
          />

          <EditableField
            label="Tel. emergencia"
            name="contacto_telefono"
            value={formData.contacto_telefono}
            isEditing={isEditing}
            onChange={handleChange}
            className={styles.field}
          />
        </div>

        <div className={styles.row}>
          <EditableField
            label="Parentesco"
            name="contacto_parentesco"
            value={formData.contacto_parentesco}
            isEditing={isEditing}
            onChange={handleChange}
            className={`${styles.field} ${styles.full}`}
          />
        </div>

        <p className={styles.sectionLabel}>Historial</p>

        <div className={styles.row}>
          <EditableField
            label="Estado de nacimiento"
            name="estado_nacimiento"
            value={formData.estado_nacimiento}
            isEditing={isEditing}
            onChange={handleChange}
            className={styles.field}
          />

          <EditableField
            label="Hospital"
            name="hospital"
            value={formData.hospital}
            isEditing={isEditing}
            onChange={handleChange}
            className={styles.field}
          />
        </div>

        <div className={styles.row}>
          <div className={`${styles.field} ${styles.full}`}>
            <span className={styles.fieldLabel}>Diagnóstico</span>
            <span className={styles.fieldValue}>{diagnostico}</span>
          </div>
        </div>

        <div className={styles.row}>
          <EditableField
            label="Tipo de sangre"
            name="tipo_sanguineo"
            value={formData.tipo_sanguineo}
            isEditing={isEditing}
            onChange={handleChange}
            className={styles.field}
          >
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
          </EditableField>

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

EditableField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  isEditing: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  className: PropTypes.string,
  valueClassName: PropTypes.string,
  inputClassName: PropTypes.string,
  children: PropTypes.node
}

BeneficiarioDetalle.propTypes = {
  beneficiario: PropTypes.shape({
    id_beneficiario: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    folio: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    fecha_ingreso: PropTypes.string,
    genero: PropTypes.string,
    tipo_espina: PropTypes.arrayOf(
      PropTypes.shape({
        nombre: PropTypes.string
      })
    ),
    membresia: PropTypes.shape({
      fecha_inicio: PropTypes.string,
      fecha_fin: PropTypes.string
    }),
    identificadores: PropTypes.shape({
      nombres: PropTypes.string,
      apellido_paterno: PropTypes.string,
      apellido_materno: PropTypes.string,
      CURP: PropTypes.string,
      fecha_nacimiento: PropTypes.string,
      estado_nacimiento: PropTypes.string,
      fotografia: PropTypes.string,
      telefono: PropTypes.string,
      email: PropTypes.string
    }).isRequired,
    datos_medicos: PropTypes.shape({
      tipo_sanguineo: PropTypes.string,
      contacto_nombre: PropTypes.string,
      contacto_telefono: PropTypes.string,
      contacto_parentesco: PropTypes.string,
      valvula: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.bool
      ]),
      hospital: PropTypes.string
    }).isRequired,
    direccion: PropTypes.shape({
      domicilio_calle: PropTypes.string,
      domicilio_cp: PropTypes.string,
      domicilio_ciudad: PropTypes.string,
      domicilio_estado: PropTypes.string
    }).isRequired
  }).isRequired,
  startInEditMode: PropTypes.bool,
  onUpdated: PropTypes.func,
  onClose: PropTypes.func
}

export default BeneficiarioDetalle