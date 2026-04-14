import styles from "./styles/Select.module.css";

export default function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Seleccionar...",
  disabled = false,
  error,
}) {
  return (
    <div className={styles.wrapper}>
      
      {label && <label className={styles.label}>{label}</label>}

      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${styles.select} ${error ? styles.errorSelect : ""}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((opt, i) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}