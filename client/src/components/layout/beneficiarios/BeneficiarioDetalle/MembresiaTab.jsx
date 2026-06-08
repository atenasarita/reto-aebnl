import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styles from './BeneficiarioDetalle.module.css'
import { API_URL } from '../../../../utils/config'

function parseDateOnly(dateStr) {
  if (!dateStr) return null
  const dateOnly = String(dateStr).split('T')[0]
  const [year, month, day] = dateOnly.split('-')
  if (!year || !month || !day) return null
  return new Date(Number(year), Number(month) - 1, Number(day))
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

function addOneYear(dateStr) {
  if (!dateStr) return ''
  const base = parseDateOnly(dateStr)
  if (!base) return ''

  const next = new Date(base)
  next.setFullYear(next.getFullYear() + 1)

  const year = next.getFullYear()
  const month = String(next.getMonth() + 1).padStart(2, '0')
  const day = String(next.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

async function updateMembresia(idBeneficiario, payload) {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}/api/beneficiarios/${idBeneficiario}/membresia`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Error al actualizar membresía')
  }

  return data
}

function buildInitialFormData(beneficiario) {
  const membresia = beneficiario?.membresia

  if (!membresia) {
    return {
      estado: 'sin registro',
      metodo_pago: '',
      fecha_inicio: '',
      fecha_fin: '',
      precio: 150
    }
  }

  return {
    estado: membresia.estado || 'sin registro',
    metodo_pago: membresia.metodo_pago || '',
    fecha_inicio: formatInputDate(membresia.fecha_inicio),
    fecha_fin: formatInputDate(membresia.fecha_fin),
    precio: membresia.precio || 150
  }
}

function MembresiaTab({ beneficiario, onUpdated }) {
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState(() => buildInitialFormData(beneficiario))

  useEffect(() => {
    setFormData(buildInitialFormData(beneficiario))
    setIsEditing(false)
  }, [beneficiario])

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: value
      }

      if (name === 'fecha_inicio') {
        next.fecha_fin = addOneYear(value)
        next.estado = value ? 'activa' : 'sin registro'
      }

      return next
    })
  }

  const handleCancel = () => {
    setFormData(buildInitialFormData(beneficiario))
    setIsEditing(false)
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const payload = {
        estado: formData.fecha_inicio ? 'activa' : 'vencida',
        metodo_pago: formData.metodo_pago,
        fecha_inicio: formData.fecha_inicio || null,
        fecha_fin: formData.fecha_inicio ? addOneYear(formData.fecha_inicio) : null,
        precio: Number(formData.precio || 150)
      }

      await updateMembresia(beneficiario.id_beneficiario, payload)

      if (onUpdated) {
        await onUpdated()
      }

      setIsEditing(false)
    } catch (error) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  let statusClass = `${styles.statusBadge} ${styles.statusExpired}`

  if (formData.estado === 'activa') {
    statusClass = `${styles.statusBadge} ${styles.statusActive}`
  } else if (formData.estado === 'sin registro') {
    statusClass = `${styles.statusBadge} ${styles.statusNeutral}`
  }

  return (
    <div className={styles.modalBody}>
      <div className={styles.col}>
        <div className={styles.membershipCard}>
          <div className={styles.membershipHeader}>
            <div>
              <h3 className={styles.membershipTitle}>Membresía</h3>
              <p className={styles.membershipSubtitle}>
                Vigencia, costo y método de pago del beneficiario.
              </p>
            </div>

            {!isEditing && (
              <span className={statusClass}>
                {formData.estado}
              </span>
            )}
          </div>

          <div className={styles.membershipSection}>
            <p className={styles.membershipSectionTitle}>Pago</p>

            <div className={styles.membershipGrid}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Método de pago</span>
                {isEditing ? (
                  <select
                    className={styles.input}
                    name="metodo_pago"
                    value={formData.metodo_pago}
                    onChange={handleChange}
                  >
                    <option value="">Selecciona</option>
                    <option value="efectivo">efectivo</option>
                    <option value="tarjeta">tarjeta</option>
                    <option value="donacion">donacion</option>
                  </select>
                ) : (
                  <div className={styles.membershipInfoBox}>
                    <span className={styles.membershipInfoValue}>
                      {formData.metodo_pago || '—'}
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>Costo</span>
                {isEditing ? (
                  <input
                    className={styles.input}
                    type="number"
                    min="0"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                  />
                ) : (
                  <div className={styles.membershipInfoBox}>
                    <span className={styles.membershipInfoValue}>
                      ${formData.precio || 150} MXN
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.membershipSection}>
            <p className={styles.membershipSectionTitle}>Vigencia</p>

            <div className={styles.membershipGrid}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Desde</span>
                {isEditing ? (
                  <input
                    className={styles.input}
                    type="date"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={handleChange}
                  />
                ) : (
                  <div className={styles.membershipInfoBox}>
                    <span className={styles.membershipInfoValue}>
                      {formData.fecha_inicio ? formatDate(formData.fecha_inicio) : '—'}
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>Hasta</span>
                {isEditing ? (
                  <input
                    className={styles.input}
                    type="date"
                    name="fecha_fin"
                    value={formData.fecha_fin}
                    readOnly
                  />
                ) : (
                  <div className={styles.membershipInfoBox}>
                    <span className={styles.membershipInfoValue}>
                      {formData.fecha_fin ? formatDate(formData.fecha_fin) : '—'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.membershipSection}>
            <p className={styles.membershipSectionTitle}>Resumen</p>

            <div className={styles.membershipSummaryBox}>
              <div className={styles.membershipSummaryItem}>
                <span className={styles.membershipInfoLabel}>Estado actual</span>
                <span className={styles.membershipInfoValue}>
                  {formData.estado}
                </span>
              </div>

              <div className={styles.membershipSummaryItem}>
                <span className={styles.membershipInfoLabel}>Renovación</span>
                <span className={styles.membershipInfoValue}>$150 MXN</span>
              </div>
            </div>
          </div>

          <div className={styles.membershipActions}>
            {!isEditing ? (
              <button
                className={styles.saveBtn}
                type="button"
                onClick={() => setIsEditing(true)}
              >
                Editar membresía
              </button>
            ) : (
              <>
                <button
                  className={styles.saveBtn}
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>

                <button
                  className={styles.cancelBtn}
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

MembresiaTab.propTypes = {
  beneficiario: PropTypes.shape({
    id_beneficiario: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    membresia: PropTypes.shape({
      estado: PropTypes.string,
      metodo_pago: PropTypes.string,
      fecha_inicio: PropTypes.string,
      fecha_fin: PropTypes.string,
      precio: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    })
  }).isRequired,
  onUpdated: PropTypes.func
}

export default MembresiaTab