import PropTypes from 'prop-types'
import './styles/Button.css'

function Button({
  children,
  onClick,
  className = '',
  type = 'button',
  disabled = false,
  iconLeft = null,
  iconRight = null,
}) {
  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${className}`}
    >
      {iconLeft && <span className="simple-btn__icon simple-btn__icon--left">{iconLeft}</span>}
      <span>{children}</span>
      {iconRight && <span className="simple-btn__icon simple-btn__icon--right">{iconRight}</span>}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  className: PropTypes.string,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  iconLeft: PropTypes.node,
  iconRight: PropTypes.node,
}

export default Button