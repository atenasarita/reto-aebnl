import styles from './BeneficiarioDetalle.module.css';

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
  const { 
    tipo_espina = [],
    identificadores = {},
    datos_medicos = {} } = beneficiario ?? {};

  const { estado_nacimiento } = identificadores;
  const { tipo_sanguineo, valvula, hospital} = datos_medicos;

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

            <div className={styles.row}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Fecha</span>
                <span className={styles.fieldValue}>
                  {/* {fecha_ultimos_estudios ? formatDate(fecha_ultimos_estudios) : '—'} */}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Control urológico</span>
                {/* <span className={styles.fieldValue}>{booleanText(control_urologico) ?? '-'}</span> */}
              </div>
            </div>

            <div className={styles.row}>
              <div className={`${styles.field} ${styles.full}`}>
                <span className={styles.fieldLabel}>Lugar control urológico</span>
                {/* <span className={styles.fieldValue}>{lugar_control_urologico ?? '—'}</span> */}
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Gral. Orina</span>
                {/* <span className={styles.fieldValue}>{gral_orina ?? '—'}</span> */}
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Urocultivo</span>
                {/* <span className={styles.fieldValue}>{urocultivo ?? '—'}</span> */}
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Eco Renal</span>
                {/* <span className={styles.fieldValue}>{eco_renal ?? '—'}</span> */}
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>UroTAC</span>
                {/* <span className={styles.fieldValue}>{uro_tac ?? '—'}</span> */}
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Est. Urodinámico</span>
                {/* <span className={styles.fieldValue}>{estudio_urodinamico ?? '—'}</span> */}
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Últ. Est. Uro</span>
                {/* <span className={styles.fieldValue}>{ultimo_estudio_uro ?? '—'}</span> */}
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>TAC Cerebro</span>
                {/* <span className={styles.fieldValue}>{tac_cerebro ?? '—'}</span> */}
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Otros</span>
                {/* <span className={styles.fieldValue}>{otros ?? '—'}</span> */}
              </div>
            </div>
          </div>
        </div>


  );
}

export default HistorialAsociado;