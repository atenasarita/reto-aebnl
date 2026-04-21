import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { useProductos } from "../../../hooks/useProductos";

import Dropdown from "../../ui/Dropdown";  
import Button from "../../ui/Button";

import "../../../pages/styles/BusquedaBeneficiarioVista.css"

export default function StepInsumos({ insumos, setInsumos }) {
  const { productos, loading, error } = useProductos();
  const [productoSelec, setProductoSelec] = useState("");
  const [cantidad, setCantidad] = useState(1);

  const agregarInsumo = () => {
    if (!productoSelec) return;
    const prod = productos.find((p) => p.id === parseInt(productoSelec));
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

  const productoOptions = productos.map(p => ({ label: p.nombre, value: String(p.id) }))

  if (loading) return <p>Cargando productos…</p>;
  if (error)   return <p>Error al cargar productos.</p>;
  
  return (
    <div className='panel'>

      <div className='insumoAddRow'>
        <div className='field' style={{ flex: 2 }}>
          <label className='fieldLabel'>Producto</label>
          <Dropdown
            className='dropdown-servicios'
            options={[{ label: "Seleccionar...", value: "" }, ...productoOptions]}
            value={productoSelec}  
            onChange={setProductoSelec}
          />
        </div>

        <div className='field' style={{ flex: 1 }}>
          <label className='fieldLabel'>Cantidad</label>
          <input
            type="number"
            className='input'
            min={1}
            value={cantidad}
            onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
          />
        </div>

        <div className='field' style={{ flex: 1 }}>
          <label className='fieldLabel'>Precio unitario</label>
          <input
            type="text"
            className='input'
            readOnly
            value={
              productoSelec
                ? `$${productos.find((p) => p.id === parseInt(productoSelec))?.precio ?? ""}`  
                : ""
            }
            placeholder="—"
          />
        </div>

        <Button
          className='btnPrimary'
          iconLeft={<Plus size={16} style={{ margin: '4px 0 0' }} />}
          onClick={agregarInsumo}
          disabled={!productoSelec}
        >
          Agregar
        </Button>
      </div>

      {/* Tabla de insumos — sin cambios */}
      <table className='insumoTable'>
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
              <td colSpan={5} className='insumoEmpty'>
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
                    className='inputQty'
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
                    className='btnDanger'
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