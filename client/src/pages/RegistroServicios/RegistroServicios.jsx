import { useState } from "react";
import Navbar from '../../components/layout/Navbar/Navbar'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'

import styles from "../styles/RegistroServicios.module.css";

const TIPOS_SERVICIO = ["Consulta General", "Rehabilitación", "Ortopedia", "Neurología"];
const MEDICOS = ["Dr. García López", "Dra. Martínez Ruiz", "Dr. Torres Vega"];
const METODOS_PAGO = ["Efectivo", "Transferencia", "Tarjeta débito", "Tarjeta crédito"];

const emptyProduct = { nombre: "", cantidad: "", precioUnitario: "" };

function RegistroServicios() {
  const [busqueda, setBusqueda] = useState("");
  const [fecha, setFecha] = useState("");
  const [tipoServicio, setTipoServicio] = useState("");
  const [medico, setMedico] = useState("");
  const [productos, setProductos] = useState([]);
  const [cantidadPagada, setCantidadPagada] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState(emptyProduct);

  const cuotaTotal = productos.reduce(
    (sum, p) => sum + Number(p.cantidad) * Number(p.precioUnitario),
    0
  );

  const handleAddProduct = () => {
    if (!nuevoProducto.nombre || !nuevoProducto.cantidad) return;
    setProductos([...productos, { ...nuevoProducto }]);
    setNuevoProducto(emptyProduct);
    setModalOpen(false);
  };

  const handleRemoveProduct = (idx) => {
    setProductos(productos.filter((_, i) => i !== idx));
  };

  const handleGuardar = () => {
    console.log({
      busqueda,
      fecha,
      tipoServicio,
      medico,
      productos,
      cuotaTotal,
      cantidadPagada,
      metodoPago,
    });
  };

  return (
    <div className={styles.page}>

      <main className={styles.container}>
        <h1 className={styles.title}>Registrar Nuevo Servicio</h1>
        <p className={styles.subtitle}>
          Complete los datos para dar de alta un nuevo servicio médico.
        </p>

        {/* 1 */}
        <Section step={1} title="Búsqueda de Beneficiario">
          <Input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, folio o CURP..."
          />
        </Section>

        {/* 2 */}
        <Section step={2} title="Detalles de Servicio">
          <div className={styles.grid3}>
            <Field label="Fecha">
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </Field>

            <Field label="Tipo">
              <Select
                value={tipoServicio}
                onChange={(e) => setTipoServicio(e.target.value)}
                options={TIPOS_SERVICIO}
              />
            </Field>

            <Field label="Médico">
              <Select
                value={medico}
                onChange={(e) => setMedico(e.target.value)}
                options={MEDICOS}
              />
            </Field>
          </div>
        </Section>

        {/* 3 */}
        <Section
          step={3}
          title="Medicamentos y Suministros"
          action={
            <Button onClick={() => setModalOpen(true)}>
              + Agregar Producto
            </Button>
          }
        >
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {productos.map((p, i) => (
                <tr key={i}>
                  <td>{p.nombre}</td>
                  <td>{p.cantidad}</td>
                  <td>${p.precioUnitario}</td>
                  <td>${(p.cantidad * p.precioUnitario).toFixed(2)}</td>
                  <td>
                    <Button variant="ghost" onClick={() => handleRemoveProduct(i)}>
                      ✕
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* 4 */}
        <Section step={4} title="Información Financiera">
          <div className={styles.grid3}>
            <Field label="Total">
              <Input value={cuotaTotal.toFixed(2)} disabled />
            </Field>

            <Field label="Pagado">
              <Input
                type="number"
                value={cantidadPagada}
                onChange={(e) => setCantidadPagada(e.target.value)}
              />
            </Field>

            <Field label="Método">
              <Select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                options={METODOS_PAGO}
              />
            </Field>
          </div>
        </Section>

        <div className={styles.actions}>
          <Button variant="outline">Cancelar</Button>
          <Button onClick={handleGuardar}>Guardar</Button>
        </div>
      </main>

      {/* Modal */}
      {modalOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h2>Agregar Producto</h2>

            <div className={styles.form}>
              <Input
                placeholder="Nombre"
                value={nuevoProducto.nombre}
                onChange={(e) =>
                  setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })
                }
              />

              <Input
                type="number"
                placeholder="Cantidad"
                value={nuevoProducto.cantidad}
                onChange={(e) =>
                  setNuevoProducto({ ...nuevoProducto, cantidad: e.target.value })
                }
              />

              <Input
                type="number"
                placeholder="Precio"
                value={nuevoProducto.precioUnitario}
                onChange={(e) =>
                  setNuevoProducto({
                    ...nuevoProducto,
                    precioUnitario: e.target.value,
                  })
                }
              />
            </div>

            <div className={styles.modalActions}>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddProduct}>Agregar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegistroServicios;

// helpers
function Section({ step, title, action, children }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <span className={styles.step}>{step}</span>
          {title}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className={styles.field}>
      <label>{label}</label>
      {children}
    </div>
  );
}