import PropTypes from 'prop-types'
import styles from './BeneficiarioDetalle.module.css'

const tabs = [
  { key: 'datos_generales', label: 'Datos generales' },
  { key: 'historial_asociado', label: 'Historial asociado' },
  { key: 'historial_padres', label: 'Historial padres' },
  { key: 'membresia', label: 'Membresía' },
]

function TabsNavegacion({ activeTab, setActiveTab }) {
  return (
    <div className={styles.tabsNav}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`${styles.tabBtn} ${activeTab === tab.key ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

TabsNavegacion.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
}

export default TabsNavegacion