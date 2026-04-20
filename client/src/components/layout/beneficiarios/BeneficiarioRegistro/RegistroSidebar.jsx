import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { registroSteps } from '../../../../utils/beneficiarioConstants';

function RegistroSidebar({
  currentStep,
  touchedSteps,
  validateStep,
  loading,
  areAllStepsComplete,
  onNext,
  onPrev,
  onSubmit,
  onCancel
}) {
  return (
    <aside className="sidebar">
      <ul className="steps">
        {registroSteps.map((step, index) => {
          const isComplete = validateStep(index);
          const isTouched = touchedSteps.includes(index);

          return (
            <li
              key={index}
              className={`step ${
                index === currentStep ? 'active' : index < currentStep ? 'completed' : ''
              }`}
            >
              {isTouched ? (
                isComplete ? (
                  <FaCheckCircle className="step-icon success" />
                ) : (
                  <FaExclamationCircle className="step-icon warning" />
                )
              ) : (
                <step.icon className="step-icon" />
              )}
              {step.label}
            </li>
          );
        })}
      </ul>

      <div className="sidebar-buttons">
        {currentStep < registroSteps.length - 1 ? (
          <button className="btn btn-primary" onClick={onNext}>
            Continuar
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={onSubmit}
            disabled={loading || !areAllStepsComplete}
          >
            {loading ? 'Registrando...' : 'Registrar'}
          </button>
        )}

        {currentStep > 0 && (
          <button className="btn btn-secondary" onClick={onPrev}>
            Anterior
          </button>
        )}

        <button className="btn btn-danger" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </aside>
  );
}

export default RegistroSidebar;