import PropTypes from 'prop-types';
import styles from './BeneficiarioDetalle.module.css';
import { useEffect, useState } from 'react';
import { API_URL } from '../../../../utils/config';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-MX');
}

function booleanText(value) {
  if (value === true || value === 1 || value === '1') return 'Sí';
  if (value === false || value === 0 || value === '0') return 'No';
  return '—';
}

function HistorialAsociado({ beneficiario }) {
  const [ultimosEstudios, setUltimosEstudios] = useState(null);
  const [loadingEstudios, setLoadingEstudios] = useState(false);
  const { 
    tipo_espina = [],
    identificadores = {},
    datos_medicos = {} } = beneficiario ?? {};

  const { estado_nacimiento } = identificadores;
  const { tipo_sanguineo, valvula, hospital} = datos_medicos;

  const idBeneficiario = 
    beneficiario?.id_beneficiario ??
    beneficiario?.idBeneficiario ??
    beneficiario?.ID_BENEFICIARIO;

  useEffect(() => {
    if (!idBeneficiario) return;

    const fetchUltimosEstudios = async () => {
      try {
        setLoadingEstudios(true);

        const token = localStorage.getItem('token');

        const response = await fetch(
          `${API_URL}/api/registro_servicios/ultimos-estudios/${idBeneficiario}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok || !result.ok) {
          throw new Error(result.message || 'Error obteniendo últimos estudios');
        }

        setUltimosEstudios(result.data);
      } catch (error) {
        console.error('Error cargando últimos estudios:', error);
        setUltimosEstudios(null);
      } finally {
        setLoadingEstudios(false);
      }
    };

    fetchUltimosEstudios();
  }, [idBeneficiario]);
  
  const padecimiento =
    tipo_espina.length > 0
      ? tipo_espina.map((e) => e.nombre).join(' · ')
      : '—';

  const valvulaTexto =
    valvula === true || valvula === 1 || valvula === '1'
      ? 'Sí'
      : valvula === false || valvula === 0 || valvula === '0'
      ? 'No'
      : '—';

  const [controlUrologico, setControlUrologico] = useState(false);
  const [lugarControlUrologico, setLugarControlUrologico] = useState(''); 

  return (

        <div className={styles.modalBody}>
          <div className={styles.col}>
            <p className={styles.sectionLabel}>Historial</p>

            <div className={styles.row}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Lugar nac.</span>
                <span className={styles.fieldValue}>{estado_nacimiento ?? '—'}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Hospital</span>
                <span className={styles.fieldValue}>{hospital ?? '—'}</span>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Sangre</span>
                <span className={styles.fieldValue}>{tipo_sanguineo ?? '—'}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Válvula</span>
                <span className={styles.fieldValue}>{valvulaTexto}</span>
              </div>
            </div>

            <div className={styles.row}>
              <div className={`${styles.field} ${styles.full}`}>
                <span className={styles.fieldLabel}>Padecimiento</span>
                <span className={styles.fieldValue}>{padecimiento ?? '—'}</span>
              </div>
            </div>
          </div>

          <div className={styles.dividerV} />

          <div className={styles.col}>
            <p className={styles.sectionLabel}>Fecha de últimos estudios</p>

            {loadingEstudios && (
              <span className={`${styles.fieldValue} ${styles.placeholder}`}>
                Cargando...
              </span>
            )}

            <div className={styles.row}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Control urológico</span>
                
                <div className={styles.radioGroup}>
                  <label>
                    <input
                      type="radio"
                      name={`control-urologico-${idBeneficiario}`}
                      checked={controlUrologico === true}
                      onChange={() => setControlUrologico(true)}
                    /><span>Si</span>
                  </label>

                  <label>
                    <input
                      type="radio"
                      name={`control-urologico-${idBeneficiario}`}
                      checked={controlUrologico === false}
                      onChange={() => setControlUrologico(false)}
                    /><span>No</span>
                  </label>
                </div>
              </div>
           
              <div className={`${styles.field}`}>
                <span className={styles.fieldLabel}>Lugar control urológico</span>
                <span className={styles.fieldValue}>{hospital ?? '—'}</span>
              </div>
            </div>
        

            <div className={styles.row}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Gral. Orina</span>
                <span className={styles.fieldValue}>
                  {formatDate(ultimosEstudios?.gralOrina)}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Urocultivo</span>
                <span className={styles.fieldValue}>
                  {formatDate(ultimosEstudios?.urocultivo)}
                </span>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Eco Renal</span>
                <span className={styles.fieldValue}>
                  {formatDate(ultimosEstudios?.ecoRenal)}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>UroTAC</span>
                <span className={styles.fieldValue}>
                  {formatDate(ultimosEstudios?.uroTac)}
                </span>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Est. Urodinámico</span>
                <span className={styles.fieldValue}>
                  {formatDate(ultimosEstudios?.estUrodinamico)}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Últ. Est. Uro</span>
                <span className={styles.fieldValue}>
                  {formatDate(ultimosEstudios?.estUrodinamico)}
                </span>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>TAC Cerebro</span>
                <span className={styles.fieldValue}>
                  {formatDate(ultimosEstudios?.tacCerebro)}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Otros</span>
                {/* <span className={styles.fieldValue}>{otros ?? '—'}</span> */}
                <span className={`${styles.fieldValue} ${styles.placeholder}`}>—</span>
              </div>
            </div>
          </div>
        </div>


  );
}

HistorialAsociado.propTypes = {
  beneficiario: PropTypes.shape({
    id_beneficiario: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    idBeneficiario: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ID_BENEFICIARIO: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tipo_espina: PropTypes.arrayOf(PropTypes.shape({ nombre: PropTypes.string })),
    identificadores: PropTypes.shape({ estado_nacimiento: PropTypes.string }),
    datos_medicos: PropTypes.shape({
      tipo_sanguineo: PropTypes.string,
      valvula: PropTypes.oneOfType([PropTypes.bool, PropTypes.number, PropTypes.string]),
      hospital: PropTypes.string,
    }),
  }),
};

export default HistorialAsociado;