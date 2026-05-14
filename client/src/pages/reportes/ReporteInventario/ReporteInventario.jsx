import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  buildCsvReporteInventarioStub,
  exportTimestampSlug,
  triggerCsvDownload,
} from "../../../utils/reportesCsvExport";
import "./ReporteInventario.css";

export default function ReporteInventario() {
  const { registerCsvExportHandler } = useOutletContext() || {};

  useEffect(() => {
    if (!registerCsvExportHandler) return undefined;
    registerCsvExportHandler(() => {
      const csv = buildCsvReporteInventarioStub();
      triggerCsvDownload(`reporte_inventario_${exportTimestampSlug()}.csv`, csv);
    });
    return () => registerCsvExportHandler(null);
  }, [registerCsvExportHandler]);

  return (
    <article className="reporte-placeholder">
      <h2>Reporte Inventario</h2>
      <p>Vista base para el reporte de inventario. Sin funcionalidades por ahora.</p>
    </article>
  );
}
