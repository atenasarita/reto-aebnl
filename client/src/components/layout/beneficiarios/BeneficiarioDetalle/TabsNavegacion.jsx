import styles from './BeneficiarioDetalle.module.css'


function TabsNavegacion({ activeTab, setActiveTab }) {
  return (
    <div className={styles.tabs}>
      <button
        type="button"
        className={`${styles.tab} ${activeTab === 'datos_generales' ? styles.active : ''}`}
        onClick={() => setActiveTab('datos_generales')}
      >
        Datos generales
      </button>

      <button
        type="button"
        className={`${styles.tab} ${activeTab === 'historial_asociado' ? styles.active : ''}`}
        onClick={() => setActiveTab('historial_asociado')}
      >
        Historial asociado
      </button>

      <button
        type="button"
        className={`${styles.tab} ${activeTab === 'historial_padres' ? styles.active : ''}`}
        onClick={() => setActiveTab('historial_padres')}
      >
        Historial padres
      </button>
    </div>
  );
}

export default TabsNavegacion;