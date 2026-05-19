import { jsPDF } from 'jspdf';
import JsBarcode from 'jsbarcode';
import logoAebnl from '../assets/aebnl_vertical.png';

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
    format: [190, 65]
  });
  
  const { folio, fecha_ingreso, tipo_espina, identificadores = {}, datos_medicos = {}, direccion = {}, padres = [] } = data;
  const { nombres, apellido_paterno, apellido_materno, fecha_nacimiento, estado_nacimiento, telefono, email, fotografia } = identificadores;
  const { tipo_sanguineo, contacto_nombre, contacto_telefono, valvula, hospital } = datos_medicos;
  const { domicilio_calle, domicilio_cp, domicilio_ciudad, domicilio_estado } = direccion;

  const nombreCompleto = `${nombres || ''} ${apellido_paterno || ''} ${apellido_materno || ''}`.trim();
  let direccionCompleta = `${domicilio_calle || ''}, ${domicilio_ciudad || ''}, ${domicilio_estado || ''}`;
  if (domicilio_cp) direccionCompleta += `, CP ${domicilio_cp}`;
  direccionCompleta = direccionCompleta.replace(/^[,\s]+|[,\s]+$/g, '').replace(/,\s*,/g, ',');

  const diagnostico = tipo_espina && tipo_espina.length > 0 ? tipo_espina.map(e => e.nombre).join(', ') : '';
  const valvulaTexto = (valvula === 1 || valvula === '1' || valvula === true) ? 'SI' : (valvula === 0 || valvula === '0' || valvula === false) ? 'NO' : '';
  
  const nombresPadres = padres && padres.length > 0 ? padres.map(p => p.nombre_completo).join('\n') : (contacto_nombre || '');

  doc.setLineWidth(0.3);

  // Marco
  doc.setDrawColor(0, 0, 0);
  doc.line(95, 0, 95, 65);
  doc.setDrawColor(0, 0, 0);
  doc.rect(0, 0, 190, 65);

  try {
    doc.addImage(logoAebnl, 'JPEG', 7, 5, 17, 25);
  } catch (error) {
    doc.setFillColor(235, 235, 235);
    doc.rect(5, 5, 20, 25, 'F');
  }
  const fotoURL = fotografia || null;
  if (fotografia) {
    try {
      doc.addImage(fotoURL, 'JPEG', 5, 33, 20, 25);
    } catch(err) {
      doc.setFillColor(235, 235, 235);
      doc.rect(5, 33, 20, 25, 'F');
    }
  } else {
    doc.setFillColor(235, 235, 235);
    doc.rect(5, 33, 20, 25, 'F');
  }

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  doc.text(`Folio: ${folio || id || ''}`, 65, 6);
  doc.setTextColor(0, 0, 0);

  doc.text('Nombre:', 28, 11);
  doc.text(nombreCompleto, 42, 11);
  doc.line(40, 12, 85, 12);

  doc.text('Dirección:', 28, 17);
  const dirLines = doc.splitTextToSize(direccionCompleta, 55);
  doc.text(dirLines, 28, 21);

  doc.text('Tel. Casa:', 50, 32);
  doc.text(telefono || '', 65, 32);
  doc.line(65, 33, 90, 33);

  doc.text('Nombre de padres:', 28, 38);
  const truncPadres = doc.splitTextToSize(nombresPadres || '', 55);
  for (let i = 0; i < truncPadres.length && i < 2; i++) {
    const yPos = 42 + (i * 4);
    doc.text(truncPadres[i], 28, yPos);
    doc.line(28, yPos + 1, 85, yPos + 1);
  }

  doc.text('Fecha de Expedicion:', 28, 55);
  doc.text(formatDate(fecha_ingreso), 60, 55);

  const oR = 98;

  doc.text('Padecimiento:', oR, 8);
  doc.text(diagnostico, oR + 22, 8);
  
  doc.text('Tipo de Sangre:', oR, 14);
  doc.text(tipo_sanguineo || '', oR + 22, 14);

  doc.text('Tiene Valvula?', oR + 50, 14);
  doc.text(valvulaTexto, oR + 72, 14);

  doc.text('En caso de accidente avisar a:', oR, 20);
  doc.text(contacto_nombre || '', oR + 2, 25); 
  doc.line(oR + 1, 26, oR + 45, 26);
  
  doc.text('Teléfono:', oR + 50, 25);
  doc.text(contacto_telefono || '', oR + 65, 25);
  doc.line(oR + 64, 26, oR + 88, 26);

  doc.text('Correo Eléctronico:', oR, 34);
  doc.text(email || '', oR + 26, 34);

  doc.setFontSize(6);
  doc.text('ASOCIACION DE ESPINA BIFIDA', oR + 17, 40, { align: 'center' });
  doc.text('DE NUEVO LEON ABP', oR + 17, 43, { align: 'center' });
  
  doc.text('***********************', oR + 17, 48, { align: 'center' }); 
  
  doc.text('Monterrey, NL', oR + 17, 52, { align: 'center' });
  doc.text('Teléfono: **********', oR + 17, 55, { align: 'center' });
  doc.text('www.espinabifida.org.mx', oR + 17, 58, { align: 'center' });

  doc.setFontSize(8);
  doc.text('Datos de Nacimiento:', oR + 45, 40);
  
  doc.text('Fecha', oR + 40, 45);
  doc.text(formatDate(fecha_nacimiento), oR + 60, 45);
  
  doc.text('Lugar Nac.', oR + 40, 50);
  doc.text(estado_nacimiento || '', oR + 60, 50);
  
  doc.text('Hospital', oR + 40, 55);
  const truncHospital = doc.splitTextToSize(hospital || '', 30);
  doc.text(truncHospital[0] || '', oR + 60, 56);

  doc.save(`Beneficiario_${folio || id}.pdf`);
};