import { useEffect, useState } from 'react';
import styles from './BeneficiarioDetalle.module.css';
import { fetchPadresBeneficiario } from '../../../../services/beneficiariosService';

function HistorialPadres({ beneficiario }) {
  const [padres, setPadres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPadres = async () => {
      try {
        const token = localStorage.getItem('token');
        const data = await fetchPadresBeneficiario(beneficiario.id_beneficiario, token);
        setPadres(data);
      } catch (error) {
        console.error('Error fetching padres:', error);
      } finally {
        setLoading(false);
      }
    };
    if (beneficiario?.id_beneficiario) {
      getPadres();
    }
  }, [beneficiario]);

  if (loading) {
    return <div className={styles.modalBody}><p>Cargando información...</p></div>;
  }

  const padre = padres.find(p => p.tipo_padre?.toLowerCase() === 'padre') || {};
  const padreNombre = padre.nombre_completo || '—';
  const padreNacimiento = padre.fecha_nacimiento || '—';
  const padreEmail = padre.email || '—';
  const padreTelefono = padre.telefono || '—';
  const padreTelCasa = padre.telefono_casa || '—';
  const padreTelTrabajo = padre.telefono_trabajo || '—';

  const madre = padres.find(p => p.tipo_padre?.toLowerCase() === 'madre') || {};
  const madreNombre = madre.nombre_completo || '—';
  const madreNacimiento = madre.fecha_nacimiento || '—';
  const madreEmail = madre.email || '—';
  const madreTelefono = madre.telefono || '—';
  const madreTelCasa = madre.telefono_casa || '—';
  const madreTelTrabajo = madre.telefono_trabajo || '—';

  return (
    <div className={styles.modalBody}>
      {/* IZQUIERDA: Padre */}
      <div className={styles.col}>
        <p className={styles.sectionLabel} style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '0.5rem' }}>
          Datos del padre
        </p>

        <div className={styles.row}>
          <div className={`${styles.field} ${styles.full}`}>
            <span className={styles.fieldLabel}>Nombre completo</span>
            <span className={`${styles.fieldValue} ${!padre.nombre_completo ? styles.placeholder : ''}`}>{padreNombre}</span>
          </div>
          <div className={`${styles.field} ${styles.full}`}>
            <span className={styles.fieldLabel}>Fecha de nacimiento</span>
            <span className={`${styles.fieldValue} ${!padre.fecha_nacimiento ? styles.placeholder : ''}`}>{padreNacimiento}</span>
          </div>
        </div>

        <p className={styles.sectionLabel} style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '2rem' }}>
          Contacto
        </p>

        <div className={styles.row}>
          <div className={`${styles.field} ${styles.full}`}>
            <span className={styles.fieldLabel}>email</span>
            <span className={`${styles.fieldValue} ${!padre.email ? styles.placeholder : ''}`}>{padreEmail}</span>
          </div>
          <div className={`${styles.field} ${styles.full}`}>
            <span className={styles.fieldLabel}>telefono</span>
            <span className={`${styles.fieldValue} ${!padre.telefono ? styles.placeholder : ''}`}>{padreTelefono}</span>
          </div>
        </div>

        <div className={styles.row}>
          <div className={`${styles.field} ${styles.full}`}>
            <span className={styles.fieldLabel}>tel. casa</span>
            <span className={`${styles.fieldValue} ${!padre.telefono_casa ? styles.placeholder : ''}`}>{padreTelCasa}</span>
          </div>
          <div className={`${styles.field} ${styles.full}`}>
            <span className={styles.fieldLabel}>tel. trabajo</span>
            <span className={`${styles.fieldValue} ${!padre.telefono_trabajo ? styles.placeholder : ''}`}>{padreTelTrabajo}</span>
          </div>
        </div>
      </div>

      <div className={styles.dividerV} />

      {/* DERECHA: Madre */}
      <div className={styles.col}>
        <p className={styles.sectionLabel} style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '0.5rem' }}>
          Datos de la madre
        </p>

        <div className={styles.row}>
          <div className={`${styles.field} ${styles.full}`}>
            <span className={styles.fieldLabel}>Nombre completo</span>
            <span className={`${styles.fieldValue} ${!madre.nombre_completo ? styles.placeholder : ''}`}>{madreNombre}</span>
          </div>
          <div className={`${styles.field} ${styles.full}`}>
            <span className={styles.fieldLabel}>Fecha de nacimiento</span>
            <span className={`${styles.fieldValue} ${!madre.fecha_nacimiento ? styles.placeholder : ''}`}>{madreNacimiento}</span>
          </div>
        </div>

        <p className={styles.sectionLabel} style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '2rem' }}>
          Contacto
        </p>

        <div className={styles.row}>
          <div className={`${styles.field} ${styles.full}`}>
            <span className={styles.fieldLabel}>email</span>
            <span className={`${styles.fieldValue} ${!madre.email ? styles.placeholder : ''}`}>{madreEmail}</span>
          </div>
          <div className={`${styles.field} ${styles.full}`}>
            <span className={styles.fieldLabel}>telefono</span>
            <span className={`${styles.fieldValue} ${!madre.telefono ? styles.placeholder : ''}`}>{madreTelefono}</span>
          </div>
        </div>

        <div className={styles.row}>
          <div className={`${styles.field} ${styles.full}`}>
            <span className={styles.fieldLabel}>tel. casa</span>
            <span className={`${styles.fieldValue} ${!madre.telefono_casa ? styles.placeholder : ''}`}>{madreTelCasa}</span>
          </div>
          <div className={`${styles.field} ${styles.full}`}>
            <span className={styles.fieldLabel}>tel. trabajo</span>
            <span className={`${styles.fieldValue} ${!madre.telefono_trabajo ? styles.placeholder : ''}`}>{madreTelTrabajo}</span>
          </div>
        </div>
      </div>

    </div>
  )
}

export default HistorialPadres;
