"use client";

import { useEffect, useState } from "react";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import FormField from "@/components/ui/FormField";
import { Producto, Categoria } from "@/types";
import axios from "axios";
import { Package, Plus, AlertCircle } from "lucide-react";

type ProductoWithIndex = Producto & Record<string, unknown>;

interface ProductoForm {
  nombre: string;
  descripcion: string;
  descripcion_corta: string;
  precio: number;
  precio_anterior?: number;
  stock: number;
  categoria_id: number;
  imagen_url: string;
  sku: string;
  peso_gramos?: number;
  destacado: boolean;
  activo: boolean;
}

export default function ProductosAdminPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState<ProductoForm>({
    nombre: "",
    descripcion: "",
    descripcion_corta: "",
    precio: 0,
    precio_anterior: undefined,
    stock: 0,
    categoria_id: 0,
    imagen_url: "",
    sku: "",
    peso_gramos: undefined,
    destacado: false,
    activo: true,
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoIdEditar, setProductoIdEditar] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
  }, []);

  const fetchProductos = async () => {
    setTableLoading(true);
    try {
      const res = await fetch("/api/productos?limite=1000");
      const data = await res.json();
      setProductos(data.data || data);
    } catch (err) {
      console.error("Error al cargar productos:", err);
      setError("Error al cargar productos.");
    } finally {
      setTableLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const res = await fetch("/api/categorias");
      const data = await res.json();
      setCategorias(data.data || data);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setForm({
      ...form,
      [name]:
        type === "number"
          ? parseFloat(value) || 0
          : type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    });

    if (error) setError("");
  };

  const abrirNuevo = () => {
    setForm({
      nombre: "",
      descripcion: "",
      descripcion_corta: "",
      precio: 0,
      precio_anterior: undefined,
      stock: 0,
      categoria_id: categorias.length > 0 ? categorias[0].id : 0,
      imagen_url: "",
      sku: "",
      peso_gramos: undefined,
      destacado: false,
      activo: true,
    });
    setProductoIdEditar(null);
    setModoEdicion(false);
    setError("");
    setSuccess("");
    setModalAbierto(true);
  };

  const abrirEditar = (producto: ProductoWithIndex) => {
    setForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      descripcion_corta: producto.descripcion_corta || "",
      precio: producto.precio,
      precio_anterior: producto.precio_anterior || undefined,
      stock: producto.stock,
      categoria_id: producto.categoria_id,
      imagen_url: producto.imagen_url || "",
      sku: producto.sku,
      peso_gramos: producto.peso_gramos || undefined,
      destacado: producto.destacado,
      activo: producto.activo,
    });
    setProductoIdEditar(producto.id);
    setModoEdicion(true);
    setError("");
    setSuccess("");
    setModalAbierto(true);
  };

  const verProducto = (producto: ProductoWithIndex) => {
    window.open(`/productos/${producto.slug}`, "_blank");
  };

  const validateForm = () => {
    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio.");
      return false;
    }
    if (!form.sku.trim()) {
      setError("El SKU es obligatorio.");
      return false;
    }
    if (form.precio <= 0) {
      setError("El precio debe ser mayor a 0.");
      return false;
    }
    if (form.stock < 0) {
      setError("El stock no puede ser negativo.");
      return false;
    }
    if (!form.categoria_id) {
      setError("Debe seleccionar una categoría.");
      return false;
    }
    return true;
  };

  const guardar = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      if (modoEdicion && productoIdEditar !== null) {
        await axios.put(`/api/admin/productos/${productoIdEditar}`, form);
        setSuccess("Producto actualizado correctamente");
      } else {
        await axios.post("/api/admin/productos", form);
        setSuccess("Producto creado correctamente");
      }

      setTimeout(() => {
        setModalAbierto(false);
        setSuccess("");
        fetchProductos();
      }, 1500);
    } catch (err: unknown) {
      console.error("Error al guardar producto:", err);
      setError("Error al guardar producto.");
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (producto: ProductoWithIndex) => {
    if (
      !confirm(
        `¿Eliminar el producto "${producto.nombre}"?\n\nEsta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    setTableLoading(true);
    try {
      await axios.delete(`/api/admin/productos/${producto.id}`);
      await fetchProductos();
    } catch (err) {
      console.error("Error al eliminar producto:", err);
      setError("Error al eliminar producto.");
    }
  };

  const renderPrecio = (producto: ProductoWithIndex) => (
    <div className="space-y-1">
      <div className="text-sm font-bold text-gray-900">
        ${producto.precio.toLocaleString("es-AR")}
      </div>
      {producto.precio_anterior && (
        <div className="text-xs text-gray-500 line-through">
          ${producto.precio_anterior.toLocaleString("es-AR")}
        </div>
      )}
    </div>
  );

  const renderStock = (producto: ProductoWithIndex) => {
    const stock = producto.stock as number;
    let color = "green";
    let text = "En stock";

    if (stock === 0) {
      color = "red";
      text = "Sin stock";
    } else if (stock <= 5) {
      color = "amber";
      text = "Stock bajo";
    }

    return (
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border bg-${color}-100 text-${color}-800 border-${color}-200`}
        >
          {stock} unidades
        </span>
        <span className="text-xs text-gray-500">{text}</span>
      </div>
    );
  };

  const renderNombreConImagen = (producto: ProductoWithIndex) => (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url as string}
            alt={producto.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={20} className="text-gray-400" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-gray-900 text-sm truncate">
          {producto.nombre}
        </div>
        <div className="text-xs text-gray-500 truncate">{producto.sku}</div>
      </div>
    </div>
  );

  const renderEstado = (producto: ProductoWithIndex) => {
    const estados = [];

    if (producto.destacado) {
      estados.push(
        <span
          key="destacado"
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200"
        >
          ⭐ Destacado
        </span>
      );
    }

    if (!producto.activo) {
      estados.push(
        <span
          key="inactivo"
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200"
        >
          🔴 Inactivo
        </span>
      );
    }

    return estados.length > 0 ? (
      <div className="flex flex-wrap gap-2">{estados}</div>
    ) : (
      <span className="text-xs text-gray-500">—</span>
    );
  };

  const productosConIndex: ProductoWithIndex[] = productos.map((producto) => ({
    ...producto,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Package size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestión de Productos
              </h1>
              <p className="text-gray-600 mt-1">
                Administra el catálogo de productos de la tienda
              </p>
            </div>
          </div>
          <button
            onClick={abrirNuevo}
            disabled={loading || tableLoading}
            className={`flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 ${
              loading || tableLoading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-700 hover:scale-105"
            }`}
          >
            <Plus size={20} />
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Mensajes */}
      {error && !modalAbierto && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm font-medium flex-1">{error}</p>
          <button
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Tabla */}
      <DataTable<ProductoWithIndex>
        data={productosConIndex}
        loading={tableLoading}
        searchKeys={["nombre", "sku", "descripcion_corta"]}
        columns={[
          {
            key: "nombre",
            label: "Producto",
            sortable: true,
            render: renderNombreConImagen,
            width: "min-w-[280px]",
            sticky: true,
          },
          {
            key: "precio",
            label: "Precio",
            sortable: true,
            render: renderPrecio,
            width: "min-w-[120px]",
          },
          {
            key: "stock",
            label: "Stock",
            sortable: true,
            render: renderStock,
            width: "min-w-[160px]",
          },
          {
            key: "destacado",
            label: "Estado",
            sortable: false,
            render: renderEstado,
            width: "min-w-[140px]",
          },
        ]}
        onView={verProducto}
        onEdit={abrirEditar}
        onDelete={eliminar}
        pageSize={15}
      />

      {/* Modal */}
      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={modoEdicion ? "Editar Producto" : "Nuevo Producto"}
        size="xl"
      >
        <div className="max-h-[85vh] overflow-y-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              guardar();
            }}
            className="space-y-6 p-2"
          >
            {/* Mensajes del modal */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle size={14} className="text-red-500" />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <span className="text-green-500 text-xs font-bold">✓</span>
                <p className="text-green-700 text-sm font-medium">{success}</p>
              </div>
            )}

            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Nombre del producto"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                placeholder="Ej: Mouse Inalámbrico Logitech"
              />

              <FormField
                label="SKU"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                required
                placeholder="Ej: MSE-LOG-001"
              />
            </div>

            <FormField
              label="Descripción corta"
              name="descripcion_corta"
              value={form.descripcion_corta}
              onChange={handleChange}
              type="textarea"
              rows={2}
              placeholder="Breve descripción para listados"
            />

            <FormField
              label="Descripción completa"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              type="textarea"
              rows={4}
              placeholder="Descripción detallada del producto"
            />

            {/* Precios y stock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                label="Precio"
                name="precio"
                value={form.precio.toString()}
                onChange={handleChange}
                type="number"
                required
              />

              <FormField
                label="Precio anterior (opcional)"
                name="precio_anterior"
                value={form.precio_anterior?.toString() || ""}
                onChange={handleChange}
                type="number"
                helperText="Para mostrar descuento"
              />

              <FormField
                label="Stock"
                name="stock"
                value={form.stock.toString()}
                onChange={handleChange}
                type="number"
                required
              />
            </div>

            {/* Categoría e imagen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Categoría"
                name="categoria_id"
                value={form.categoria_id.toString()}
                onChange={handleChange}
                type="select"
                required
                options={categorias.map((cat) => ({
                  value: cat.id.toString(),
                  label: cat.nombre,
                }))}
              />

              <FormField
                label="URL de imagen"
                name="imagen_url"
                value={form.imagen_url}
                onChange={handleChange}
                placeholder="https://..."
                helperText="URL de la imagen principal"
              />
            </div>

            <FormField
              label="Peso en gramos (opcional)"
              name="peso_gramos"
              value={form.peso_gramos?.toString() || ""}
              onChange={handleChange}
              type="number"
              helperText="Para cálculo de envío"
            />

            {/* Checkboxes */}
            <div className="flex items-center gap-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.destacado}
                  onChange={(e) =>
                    setForm({ ...form, destacado: e.target.checked })
                  }
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded"
                />
                <div>
                  <span className="text-sm font-semibold text-gray-900">
                    Producto Destacado
                  </span>
                  <p className="text-xs text-gray-600">Aparecerá en la home</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(e) =>
                    setForm({ ...form, activo: e.target.checked })
                  }
                  className="w-5 h-5 text-green-600 border-gray-300 rounded"
                />
                <div>
                  <span className="text-sm font-semibold text-gray-900">
                    Producto Activo
                  </span>
                  <p className="text-xs text-gray-600">Visible en la tienda</p>
                </div>
              </label>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                disabled={loading}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold ${
                  loading ? "opacity-50" : "hover:bg-blue-700"
                }`}
              >
                {loading
                  ? "Guardando..."
                  : modoEdicion
                  ? "Guardar Cambios"
                  : "Crear Producto"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
