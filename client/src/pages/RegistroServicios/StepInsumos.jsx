import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import styles from "../styles/BusquedaBeneficiarioVista.module.css";

const PRODUCTOS_MOCK = [
  { id: 1, nombre: "Sonda vesical Fr14", precio: 85 },
  { id: 2, nombre: "Catéter intermitente", precio: 120 },
  { id: 3, nombre: "Bolsa colectora 2L", precio: 45 },
  { id: 4, nombre: "Gasas estériles x10", precio: 30 },
  { id: 5, nombre: "Guantes látex M x100", precio: 90 },
];

export default function StepInsumos({ insumos, setInsumos }) {
  const [productoSelec, setProductoSelec] = useState("");
  const [cantidad, setCantidad] = useState(1);

  const agregarInsumo = () => {
    if (!productoSelec) return;
    const prod = PRODUCTOS_MOCK.find((p) => p.id === parseInt(productoSelec));
    if (!prod) return;

    const existe = insumos.find((i) => i.id === prod.id);
    if (existe) {
      setInsumos(
        insumos.map((i) =>
          i.id === prod.id ? { ...i, cantidad: i.cantidad + cantidad } : i
        )
      );
    } else {
      setInsumos([...insumos, { ...prod, cantidad }]);
    }

    setProductoSelec("");
    setCantidad(1);
  };

  const eliminarInsumo = (id) => {
    setInsumos(insumos.filter((i) => i.id !== id));
  };

  const actualizarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    setInsumos(
      insumos.map((i) => (i.id === id ? { ...i, cantidad: nuevaCantidad } : i))
    );
  };

  const subtotal = insumos.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  return (
    <div className={styles.panel}>
      {/* Fila de agregar producto */}
      <div className={styles.insumoAddRow}>
        <div className={styles.field} style={{ flex: 2 }}>
          <label className={styles.fieldLabel}>Producto</label>
          <select
            className={styles.select}
            value={productoSelec}
            onChange={(e) => setProductoSelec(e.target.value)}
          >
            <option value="">Seleccionar...</option>
            {PRODUCTOS_MOCK.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field} style={{ flex: 1 }}>
          <label className={styles.fieldLabel}>Cantidad</label>
          <input
            type="number"
            className={styles.input}
            min={1}
            value={cantidad}
            onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
          />
        </div>

        <div className={styles.field} style={{ flex: 1 }}>
          <label className={styles.fieldLabel}>Precio unitario</label>
          <input
            type="text"
            className={styles.input}
            readOnly
            value={
              productoSelec
                ? `$${PRODUCTOS_MOCK.find((p) => p.id === parseInt(productoSelec))?.precio ?? ""}`
                : ""
            }
            placeholder="—"
          />
        </div>

        <button
          className={styles.btnPrimary}
          style={{ alignSelf: "flex-end" }}
          onClick={agregarInsumo}
          disabled={!productoSelec}
        >
          <Plus size={16} /> Agregar
        </button>
      </div>

      {/* Tabla de insumos */}
      <table className={styles.insumoTable}>
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
          {insumos.length === 0 ? (
            <tr>
              <td colSpan={5} className={styles.insumoEmpty}>
                Sin productos agregados
              </td>
            </tr>
          ) : (
            insumos.map((i) => (
              <tr key={i.id}>
                <td>{i.nombre}</td>
                <td>
                  <input
                    type="number"
                    className={styles.inputQty}
                    min={1}
                    value={i.cantidad}
                    onChange={(e) =>
                      actualizarCantidad(i.id, parseInt(e.target.value) || 1)
                    }
                  />
                </td>
                <td>${i.precio.toFixed(2)}</td>
                <td>${(i.precio * i.cantidad).toFixed(2)}</td>
                <td>
                  <button
                    className={styles.btnDanger}
                    onClick={() => eliminarInsumo(i.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
        {insumos.length > 0 && (
          <tfoot>
            <tr>
              <td colSpan={3} style={{ textAlign: "right", fontWeight: 600 }}>
                Total
              </td>
              <td style={{ fontWeight: 700 }}>${subtotal.toFixed(2)}</td>
              <td></td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}