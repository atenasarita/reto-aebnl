import styles from './styles/Input.module.css';

export default function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  prefix,
}) {
  return (
    <div className={styles.wrapper}>
      
      {label && <label className={styles.label}>{label}</label>}

      <div className={styles.inputContainer}>
        {prefix && <span className={styles.prefix}>{prefix}</span>}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`${styles.input} ${error ? styles.errorInput : ""} ${
            prefix ? styles.withPrefix : ""
          }`}
        />
      </div>

      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}