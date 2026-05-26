import { registroSteps } from '../../../../utils/beneficiarioConstants';

function RegistroBottom({
  currentStep,
  loading,
  areAllStepsComplete,
  onNext,
  onPrev,
  onSubmit,
  onCancel
}) {
  return (
    <div className="registro-bottom">
      <div className="registro-bottom-buttons">
         <button className="btn btn-danger" onClick={onCancel}>
          Cancelar
        </button>


        {currentStep > 0 && (
          <button className="btn btn-secondary" onClick={onPrev}>
            ← Anterior
          </button>
        )}
       
        {currentStep < registroSteps.length - 1 ? (
          <button className="btn btn-primary" onClick={onNext}>
            Continuar →
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
      </div>
    </div>
  );
}

export default RegistroBottom;