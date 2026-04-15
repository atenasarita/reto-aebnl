import { ClipboardList, Package, Search, Wallet } from 'lucide-react'
import './BusquedaBeneficiarioVista.css'

const PASOS = [
  { id: 1, tab: 'Búsqueda', Icon: Search },
  { id: 2, tab: 'Detalles', Icon: ClipboardList },
  { id: 3, tab: 'Insumos', Icon: Package },
  { id: 4, tab: 'Finanzas', Icon: Wallet },
]

export default function BusquedaBeneficiarioVista() {
  const pasoActual = 1
  const totalPasos = PASOS.length
  const progresoPct = (pasoActual / totalPasos) * 100

  return (
    <div className="vbb-page">
      <div className="vbb-page__inner">
        <div className="vbb-card">
          <nav className="vbb-tabs" aria-label="Etapas del registro de servicio">
            <ol className="vbb-tabs__list">
              {PASOS.map((paso) => {
                const activo = pasoActual === paso.id
                const { Icon } = paso
                return (
                  <li key={paso.id} className="vbb-tabs__item">
                    <div
                      className={`vbb-tabs__tab ${activo ? 'vbb-tabs__tab--active' : ''}`}
                      aria-current={activo ? 'step' : undefined}
                    >
                      <Icon className="vbb-tabs__icon" aria-hidden="true" />
                      <span className="vbb-tabs__label">{paso.tab}</span>
                    </div>
                  </li>
                )
              })}
            </ol>
          </nav>

          <div className="vbb-grid">
            <div className="vbb-main">
              <header className="vbb-main__header">
                <h2 className="vbb-main__title">Búsqueda de beneficiario</h2>
                <p className="vbb-main__subtitle">
                  Paso {pasoActual} de {totalPasos} · Seleccionar beneficiario
                </p>
              </header>

              <section className="vbb-panel">
                <p className="vbb-hint">
                  Selecciona por beneficiario activo o toma una cita programada para hoy.
                </p>

                <div className="vbb-segmented" aria-hidden="true">
                  <div className="vbb-segmented__btn vbb-segmented__btn--active">Por beneficiario</div>
                  <div className="vbb-segmented__btn">Citas del día</div>
                </div>

                <div className="vbb-field">
                  <span className="vbb-field__label">Buscar beneficiario</span>
                  <input
                    className="vbb-input"
                    type="text"
                    readOnly
                    tabIndex={-1}
                    placeholder="Nombre, folio o CURP"
                    defaultValue=""
                  />
                </div>

                <p className="vbb-empty">No hay coincidencias.</p>

                <div className="vbb-actions">
                  <div className="vbb-btn-primary">Continuar a Detalles</div>
                </div>
              </section>
            </div>

            <aside className="vbb-aside">
              <header className="vbb-aside__header">
                <ClipboardList className="vbb-aside__header-icon" aria-hidden="true" />
                <h3 className="vbb-aside__title">Resumen del Registro</h3>
              </header>

              <section className="vbb-aside__proceso">
                <p className="vbb-aside__proceso-label">ESTADO DEL PROCESO</p>
                <p className="vbb-aside__proceso-step">
                  Paso {pasoActual} de {totalPasos}
                </p>
                <div className="vbb-aside__track" aria-hidden="true">
                  <div className="vbb-aside__fill" style={{ width: `${progresoPct}%` }} />
                </div>
              </section>

              <dl className="vbb-aside__dl">
                <div>
                  <dt>Beneficiario:</dt>
                  <dd>—</dd>
                </div>
                <div>
                  <dt>Fecha:</dt>
                  <dd>2026-04-14</dd>
                </div>
                <div>
                  <dt>Servicio:</dt>
                  <dd>—</dd>
                </div>
                <div>
                  <dt>Médico:</dt>
                  <dd>—</dd>
                </div>
              </dl>

              <div className="vbb-aside__totales">
                <p>
                  <span>Total:</span>
                  <strong>$0.00</strong>
                </p>
                <p>
                  <span>Saldo Restante:</span>
                  <strong className="vbb-aside__saldo-ok">$0.00</strong>
                </p>
                <p className="vbb-aside__extra">Inventario: $0.00</p>
                <p className="vbb-aside__extra">Descuento: $0.00</p>
                <p className="vbb-aside__extra">Cita: Sin cita</p>
                <p className="vbb-aside__extra">Método: Pendiente</p>
                <p className="vbb-aside__extra">Pagado: $0.00</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
