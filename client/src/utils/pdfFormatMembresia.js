import { jsPDF } from 'jspdf';
import JsBarcode from 'jsbarcode';

const calcAge = (fechaNacimiento) => {
  if (!fechaNacimiento) return '—';
  const diff = Date.now() - new Date(fechaNacimiento).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)).toString();
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-MX');
};

export const downloadBeneficiarioPdf = (data, id) => {
  const doc = new jsPDF({
    orientation: 'l',
    unit: 'mm',
    format: [210, 180]
  });
  
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(10, 10, 190, 160, 4, 4, 'FD');

  doc.setDrawColor(240, 240, 240);
  doc.line(105, 10, 105, 170);

  const drawField = (label, value, x, y, w) => {

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.text(label, x + w / 2, y, { align: 'center' });
    
    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(240, 240, 240);
    doc.roundedRect(x, y + 2, w, 7.5, 1.5, 1.5, 'FD');

    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    
    let text = typeof value === 'string' && value.trim() !== '' ? value : (value ? value.toString() : '—');
    if (text === 'NaN') text = '—';
    
    // Truncar texto si es mas ancho que su caja
    if (doc.getTextWidth(text) > w - 4) {
      while (doc.getTextWidth(text + '...') > w - 4 && text.length > 0) {
        text = text.slice(0, -1);
      }
      text += '...';
    }
    
    doc.text(text, x + w / 2, y + 7.2, { align: 'center', baseline: 'bottom' });
  };

  const drawTitle = (title, x, y, width) => {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 54, 93);
    doc.text(title, x + width / 2, y, { align: 'center' });
    doc.setFont('helvetica', 'normal');
  };
  
  const { folio, fecha_ingreso, genero, tipo_espina, identificadores = {}, datos_medicos = {}, direccion = {}, membresia = {} } = data;
  const { nombres, apellido_paterno, apellido_materno, CURP, fecha_nacimiento, estado_nacimiento, telefono, email, fotografia } = identificadores;
  const { tipo_sanguineo, contacto_nombre, contacto_telefono, contacto_parentesco, valvula, hospital } = datos_medicos;
  const { domicilio_calle, domicilio_cp, domicilio_ciudad, domicilio_estado } = direccion;
  const fecha_inicio = membresia?.fecha_inicio ?? null;
  const fecha_fin = membresia?.fecha_fin ?? null;

  const nombreCompleto = `${nombres || ''} ${apellido_paterno || ''} ${apellido_materno || ''}`.trim();
  const diagnostico = tipo_espina && tipo_espina.length > 0 ? tipo_espina.map(e => e.nombre).join(' · ') : '—';
  const valvulaTexto = (valvula === 1 || valvula === '1' || valvula === true) ? 'Sí' : (valvula === 0 || valvula === '0' || valvula === false) ? 'No' : '—';
  const contactoEmergencia = `${contacto_nombre || '—'} ${contacto_parentesco ? `(${contacto_parentesco})` : ''}`.trim();

  let yL = 20;
  drawTitle('Beneficiario', 15, yL, 85); yL += 8;
  
  // FOTO DEL BENEFICIARIO
  if (fotografia) {
    try {
      doc.addImage(`http://localhost:3000${fotografia}`, 'JPEG', 15, yL, 20, 20);
    } catch(err) {
      doc.setFillColor(226, 232, 240);
      doc.rect(15, yL, 20, 20, 'F');
    }
  } else {
    doc.setFillColor(226, 232, 240);
    doc.rect(15, yL, 20, 20, 'F');
  }

  drawField('Nombre', nombreCompleto, 40, yL, 60); yL += 11;
  drawField('CURP', CURP, 40, yL, 60); yL += 13;
  
  drawField('Fecha de nacimiento', formatDate(fecha_nacimiento), 15, yL, 26.5);
  drawField('Edad', calcAge(fecha_nacimiento), 15 + 29.25, yL, 26.5);
  drawField('Sexo', genero, 15 + 58.5, yL, 26.5); yL += 14;
  
  drawField('Nombre padre / madre', '—', 15, yL, 85); yL += 14;
  
  drawField('Folio', folio, 15, yL, 41);
  drawField('Fecha de alta', formatDate(fecha_ingreso), 15 + 44, yL, 41); yL += 18;
  
  drawTitle('Dirección', 15, yL, 85); yL += 8;
  drawField('Calle', domicilio_calle, 15, yL, 85); yL += 14;
  
  drawField('Ciudad', domicilio_ciudad, 15, yL, 41);
  drawField('Estado', domicilio_estado, 15 + 44, yL, 41); yL += 14;
  drawField('C.P.', domicilio_cp, 15, yL, 41);

  let yR = 20;
  drawTitle('Contacto', 110, yR, 85); yR += 8;
  drawField('Email', email, 110, yR, 41);
  drawField('Teléfono', telefono, 110 + 44, yR, 41); yR += 14;
  
  drawField('Contacto de emergencia', contactoEmergencia, 110, yR, 41);
  drawField('Tel. emergencia', contacto_telefono, 110 + 44, yR, 41); yR += 18;
  
  drawTitle('Historial', 110, yR, 85); yR += 8;
  drawField('Estado de nacimiento', estado_nacimiento, 110, yR, 41);
  drawField('Hospital', hospital, 110 + 44, yR, 41); yR += 14;
  
  drawField('Diagnóstico', diagnostico, 110, yR, 85); yR += 14;
  
  drawField('Tipo de sangre', tipo_sanguineo, 110, yR, 41);
  drawField('Válvula', valvulaTexto, 110 + 44, yR, 41); yR += 14;
  
  drawField('Etapa de vida', '—', 110, yR, 41);
  drawField('¿Vive el beneficiario?', '—', 110 + 44, yR, 41); yR += 14;
  
  drawField('Notas', '—', 110, yR, 85); yR += 18;
  
  drawTitle('Vigencia de Membresía', 110, yR, 85); yR += 8;
  drawField('Desde', formatDate(fecha_inicio), 110, yR, 41);
  drawField('Hasta', formatDate(fecha_fin), 110 + 44, yR, 41);
  yR += 16;

  // Generar y agregar código de barras basado en el folio
  if (folio || id) {
    try {
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, String(folio || id), {
        format: "CODE128",
        displayValue: false,
        margin: 5,
        height: 50
      });
      const barcodeDataUrl = canvas.toDataURL("image/jpeg", 1.0);
      doc.addImage(barcodeDataUrl, 'JPEG', 30, 147.5, 60, 20);
    } catch (err) {
      console.error('Error generando código de barras:', err);
    }
  }

  doc.save(`Beneficiario_${folio || id}.pdf`);
};