import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import styles from './BeneficiarioDetalle.module.css';
import { API_URL } from '../../../../utils/config';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const dateOnly = String(dateStr).split('T')[0];
  const [year, month, day] = dateOnly.split('-');
  return `${Number(day)}/${Number(month)}/${year}`;
}

function formatInputDate(dateStr) {
  if (!dateStr) return '';
  return String(dateStr).split('T')[0];
}

function emptyForm() {
  return {
    padre_nombre_completo: '',
    padre_fecha_nacimiento: '',
    padre_email: '',
    padre_telefono: '',
    padre_tel_casa: '',
    padre_tel_trabajo: '',
    madre_nombre_completo: '',
    madre_fecha_nacimiento: '',
    madre_email: '',
    madre_telefono: '',
    madre_tel_casa: '',
    madre_tel_trabajo: '',
  };
}

function HistorialPadres({ beneficiario, onUpdated }) {
  const id_beneficiario = beneficiario?.id_beneficiario;

  const [padresData, setPadresData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState(emptyForm());

  const cargarPadres = async () => {
    if (!id_beneficiario) return;

    try {
      setLoading(true);

      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_URL}/api/beneficiarios/${id_beneficiario}/padres`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo cargar el historial de padres');
      }

      setPadresData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setPadresData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPadres();
  }, [id_beneficiario]);

  useEffect(() => {
    if (isEditing) return;

    const padre =
      padresData.find(
        (item) => String(item.tipo_padre).toLowerCase() === 'padre'
      ) || {};

    const madre =
      padresData.find(
        (item) => String(item.tipo_padre).toLowerCase() === 'madre'
      ) || {};

    setFormData({
      padre_nombre_completo: padre.nombre_completo || '',
      padre_fecha_nacimiento: formatInputDate(padre.fecha_nacimiento),
      padre_email: padre.email || '',
      padre_telefono: padre.telefono || '',
      padre_tel_casa: padre.telefono_casa || '',
      padre_tel_trabajo: padre.telefono_trabajo || '',

      madre_nombre_completo: madre.nombre_completo || '',
      madre_fecha_nacimiento: formatInputDate(madre.fecha_nacimiento),
      madre_email: madre.email || '',
      madre_telefono: madre.telefono || '',
      madre_tel_casa: madre.telefono_casa || '',
      madre_tel_trabajo: madre.telefono_trabajo || '',
    });
  }, [padresData, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_URL}/api/beneficiarios/${id_beneficiario}/padres`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error interno del servidor');
      }

      setIsEditing(false);
      await cargarPadres();

      if (onUpdated) {
        await onUpdated();
      }
    } catch (error) {
      console.error('Error al guardar padres:', error);
      alert(error.message || 'No se pudo guardar la información');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (label, name, type = 'text') => (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>

      {isEditing ? (
        <input
          className={styles.input}
          type={type}
          name={name}
          value={formData[name] ?? ''}
          onChange={handleChange}
          autoComplete="off"
        />
      ) : (
        <span className={styles.fieldValue}>
          {type === 'date'
            ? formatDate(formData[name])
            : formData[name] || '—'}
        </span>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className={styles.modalBody}>
        <div className={styles.col}>
          <p className={styles.sectionLabel}>Cargando historial de padres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalBody}>
      <div className={styles.col}>
        <p className={styles.sectionLabel}>Padre</p>

        {renderField('Nombre completo', 'padre_nombre_completo')}
        {renderField('Fecha de nacimiento', 'padre_fecha_nacimiento', 'date')}
        {renderField('Correo electrónico', 'padre_email')}
        {renderField('Teléfono', 'padre_telefono')}
        {renderField('Teléfono de casa', 'padre_tel_casa')}
        {renderField('Teléfono de trabajo', 'padre_tel_trabajo')}
      </div>

      <div className={styles.dividerV} />

      <div className={styles.col}>
        <p className={styles.sectionLabel}>Madre</p>

        {renderField('Nombre completo', 'madre_nombre_completo')}
        {renderField('Fecha de nacimiento', 'madre_fecha_nacimiento', 'date')}
        {renderField('Correo electrónico', 'madre_email')}
        {renderField('Teléfono', 'madre_telefono')}
        {renderField('Teléfono de casa', 'madre_tel_casa')}
        {renderField('Teléfono de trabajo', 'madre_tel_trabajo')}
      </div>

      <div className={styles.editButtonWrapper} style={{ width: '100%', marginTop: 20 }}>
        {!isEditing ? (
          <button
            type="button"
            className={styles.saveBtn}
            onClick={() => setIsEditing(true)}
          >
            Editar
          </button>
        ) : (
          <>
            <button
              type="button"
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>

            <button
              type="button"
              className={styles.cancelBtn}
              onClick={handleCancel}
              disabled={saving}
            >
              Cancelar
            </button>
          </>
        )}
      </div>
    </div>
  );
}

HistorialPadres.propTypes = {
  beneficiario: PropTypes.shape({
    id_beneficiario: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onUpdated: PropTypes.func,
};

export default HistorialPadres;