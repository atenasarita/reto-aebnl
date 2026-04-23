import '../styles/registro_beneficiario.css';
import { useNavigate } from 'react-router-dom';

import { useRegistroBeneficiario } from '../../hooks/useRegistroBeneficiario';
import RegistroSidebar from '../../components/layout/beneficiarios/BeneficiarioRegistro/RegistroSidebar';
import RegistroTopInfo from '../../components/layout/beneficiarios/BeneficiarioRegistro/RegistroTopInfo';
import StepDatosPersonales from '../../components/layout/beneficiarios/BeneficiarioRegistro/steps/StepDatosPersonales';
import StepInformacionMedica from '../../components/layout/beneficiarios/BeneficiarioRegistro/steps/StepInformacionMedica';
import StepDomicilio from '../../components/layout/beneficiarios/BeneficiarioRegistro/steps/StepDomicilio';
import StepMembresia from '../../components/layout/beneficiarios/BeneficiarioRegistro/steps/StepMembresia';

function RegistroBeneficiario() {
  const navigate = useNavigate();

  const {
    currentStep,
    folio,
    fieldErrors,
    touchedSteps,
    fechaRegistro,
    fechaNacimiento,
    formData,
    loading,
    error,
    fechaNacimientoRef,
    fechaMembresiaRef,
    setFechaNacimiento,
    handleInputChange,
    handleBlur,
    handleTipoEspinasChange,
    handleFotoChange,
    handleFotoError,
    calculateFechaVigencia,
    handleNext,
    handlePrev,
    handleSubmit,
    validateStep,
    areAllStepsComplete
  } = useRegistroBeneficiario(navigate);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepDatosPersonales
            formData={formData}
            fieldErrors={fieldErrors}
            fechaNacimiento={fechaNacimiento}
            fechaNacimientoRef={fechaNacimientoRef}
            setFechaNacimiento={setFechaNacimiento}
            handleInputChange={handleInputChange}
            handleBlur={handleBlur}

          />
        );

      case 1:
        return (
          <StepInformacionMedica
            formData={formData}
            fieldErrors={fieldErrors}
            handleInputChange={handleInputChange}
            handleBlur={handleBlur}
            handleTipoEspinasChange={handleTipoEspinasChange}
          />
        );

      case 2:
        return (
          <StepDomicilio
            formData={formData}
            fieldErrors={fieldErrors}
            handleInputChange={handleInputChange}
            handleBlur={handleBlur}
          />
        );

      case 3:
        return (
          <StepMembresia
            formData={formData}
            fechaMembresiaRef={fechaMembresiaRef}
            handleInputChange={handleInputChange}
            calculateFechaVigencia={calculateFechaVigencia}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="page">
      <main className="content">
        <section className="page-header">
          <h1>Registro de Nuevo Beneficiario</h1>
          <p>
            Completa la información para dar de alta a un nuevo beneficiario en el sistema
          </p>
        </section>

        <section className="layout">
          <RegistroSidebar
            currentStep={currentStep}
            touchedSteps={touchedSteps}
            validateStep={validateStep}
            loading={loading}
            areAllStepsComplete={areAllStepsComplete}
            onNext={handleNext}
            onPrev={handlePrev}
            onSubmit={handleSubmit}
            onCancel={() => {
              if (confirm('Seguro que quieres cancelar?')) {
                navigate('/beneficiarios');
              }
            }}
          />

          <section className="form-card">
            <RegistroTopInfo
              folio={folio}
              fechaRegistro={fechaRegistro}
              fotografia={formData.fotografia}
              onFotoChange={handleFotoChange}
              onFotoError={handleFotoError}
            />

            {renderCurrentStep()}

            {error && <div className="error-message">{error}</div>}
          </section>
        </section>
      </main>
    </div>
  );
}

export default RegistroBeneficiario;