import styles from './RegistroPopUps.module.css';

export default function Modal({
  isOpen,
  title,
  message,
  onClose,
  onConfirm,
  confirmText = 'Aceptar',
  cancelText
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.confirmModal}>
        <h3>{title}</h3>
        <p>{message}</p>

        <div className={styles.modalActions}>
          {cancelText && (
            <button className={styles.btnDanger} onClick={onClose}>
              {cancelText}
            </button>
          )}

          <button className={styles.btnPrimary} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}