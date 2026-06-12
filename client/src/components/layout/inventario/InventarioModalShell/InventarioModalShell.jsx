import PropTypes from 'prop-types'
import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import styles from './InventarioModalShell.module.css'

function InventarioModalShell({
  open,
  onClose,
  title,
  subtitle,
  children,
}) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className={styles.root}>
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Cerrar ventana"
        onClick={onClose}
      />
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className={styles.panelHead}>
          <div>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            aria-label="Cerrar"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className={styles.panelBody}>{children}</div>
      </div>
    </div>,
    document.body
  )
}

InventarioModalShell.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node,
};

export default InventarioModalShell;
