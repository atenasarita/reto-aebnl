import PropTypes from "prop-types";
import "./ReportePersonalizadoShell.css";

function ReportePersonalizadoShell({ children }) {
  return (
    <article className="reporte-personalizado-shell reporte-personalizado-theme">
      <div className="reporte-personalizado-inner">{children}</div>
    </article>
  );
}

ReportePersonalizadoShell.propTypes = {
  children: PropTypes.node,
};

export default ReportePersonalizadoShell;
