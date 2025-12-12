"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Producto } from "@/types";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

interface ItemCarritoDB {
  producto: Producto;
  cantidad: number;
}

interface CarritoContextType {
  items: ItemCarrito[];
  agregarProducto: (producto: Producto, cantidad?: number) => Promise<void>;
  quitarProducto: (productoId: number) => Promise<void>;
  actualizarCantidad: (productoId: number, cantidad: number) => Promise<void>;
  vaciarCarrito: () => Promise<void>;
  totalItems: number;
  subtotal: number;
  costoEnvio: number;
  total: number;
  loading: boolean;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

const STORAGE_KEY = "MOTEF_carrito";
const ENVIO_GRATIS_THRESHOLD = 2;
const COSTO_ENVIO = 5000;

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadCarrito = useCallback(async () => {
    if (isAuthenticated && user?.rol === "cliente") {
      try {
        const res = await fetch("/api/carrito", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setItems(
            (data.items as ItemCarritoDB[]).map((item) => ({
              producto: item.producto,
              cantidad: item.cantidad,
            }))
          );
        }
      } catch (error) {
        console.error("Error al cargar carrito:", error);
        toast.error("Error al cargar tu carrito");
      }
    } else {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setItems(JSON.parse(saved) as ItemCarrito[]);
        } catch (error) {
          console.error("Error al cargar carrito:", error);
        }
      }
    }
  }, [isAuthenticated, user?.rol]);

  useEffect(() => {
    setMounted(true);
    void loadCarrito();
  }, [loadCarrito]);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, mounted, isAuthenticated]);

  const agregarProducto = useCallback(
    async (producto: Producto, cantidad: number = 1) => {
      setLoading(true);

      const toastId = toast.loading(`Agregando ${producto.nombre}...`);

      try {
        if (isAuthenticated && user?.rol === "cliente") {
          const res = await fetch("/api/carrito", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ producto_id: producto.id, cantidad }),
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || "Error al agregar");
          }

          await loadCarrito();

          toast.success(
            <div className="flex items-center gap-3">
              {producto.imagen_url && (
                <img
                  src={producto.imagen_url}
                  alt={producto.nombre}
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <p className="font-semibold text-sm">{producto.nombre}</p>
                <p className="text-xs text-gray-600">
                  {cantidad} {cantidad === 1 ? "unidad" : "unidades"} agregada
                  {cantidad === 1 ? "" : "s"}
                </p>
              </div>
            </div>,
            {
              id: toastId,
              action: {
                label: "Ver carrito",
                onClick: () => (window.location.href = "/carrito"),
              },
            }
          );
        } else {
          setItems((prev) => {
            const existente = prev.find((i) => i.producto.id === producto.id);
            if (existente) {
              toast.success("Cantidad actualizada", { id: toastId });
              return prev.map((i) =>
                i.producto.id === producto.id
                  ? { ...i, cantidad: i.cantidad + cantidad }
                  : i
              );
            }

            toast.success(
              <div className="flex items-center gap-3">
                {producto.imagen_url && (
                  <img
                    src={producto.imagen_url}
                    alt={producto.nombre}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-sm">{producto.nombre}</p>
                  <p className="text-xs text-gray-600">Agregado al carrito</p>
                </div>
              </div>,
              {
                id: toastId,
                action: {
                  label: "Ver carrito",
                  onClick: () => (window.location.href = "/carrito"),
                },
              }
            );

            return [...prev, { producto, cantidad }];
          });
        }
      } catch (error) {
        console.error("Error al agregar producto:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Error al agregar al carrito",
          { id: toastId }
        );
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, user?.rol, loadCarrito]
  );

  const quitarProducto = useCallback(
    async (productoId: number) => {
      setLoading(true);

      const producto = items.find((i) => i.producto.id === productoId);
      const nombreProducto = producto?.producto.nombre || "Producto";

      try {
        if (isAuthenticated && user?.rol === "cliente") {
          const item = items.find((i) => i.producto.id === productoId);
          if (!item) return;

          const res = await fetch(`/api/carrito/${item.producto.id}`, {
            method: "DELETE",
            credentials: "include",
          });

          if (!res.ok) throw new Error("Error al quitar");

          await loadCarrito();
          toast.success(`${nombreProducto} eliminado del carrito`);
        } else {
          setItems((prev) => {
            const filtered = prev.filter((i) => i.producto.id !== productoId);
            toast.success(`${nombreProducto} eliminado del carrito`);
            return filtered;
          });
        }
      } catch (error) {
        console.error("Error al quitar producto:", error);
        toast.error("Error al eliminar del carrito");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, user?.rol, items, loadCarrito]
  );

  const actualizarCantidad = useCallback(
    async (productoId: number, cantidad: number) => {
      if (cantidad <= 0) {
        await quitarProducto(productoId);
        return;
      }

      setLoading(true);

      try {
        if (isAuthenticated && user?.rol === "cliente") {
          const item = items.find((i) => i.producto.id === productoId);
          if (!item) return;

          const res = await fetch(`/api/carrito/${item.producto.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ cantidad }),
          });

          if (!res.ok) throw new Error("Error al actualizar");

          await loadCarrito();
          toast.success("Cantidad actualizada");
        } else {
          setItems((prev) => {
            const updated = prev.map((i) =>
              i.producto.id === productoId ? { ...i, cantidad } : i
            );
            toast.success("Cantidad actualizada");
            return updated;
          });
        }
      } catch (error) {
        console.error("Error al actualizar cantidad:", error);
        toast.error("Error al actualizar cantidad");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, user?.rol, items, quitarProducto, loadCarrito]
  );

  const vaciarCarrito = useCallback(async () => {
    setLoading(true);

    try {
      if (isAuthenticated && user?.rol === "cliente") {
        const res = await fetch("/api/carrito", {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Error al vaciar");
      }

      setItems([]);
      localStorage.removeItem(STORAGE_KEY);
      toast.success("Carrito vaciado");
    } catch (error) {
      console.error("Error al vaciar carrito:", error);
      toast.error("Error al vaciar el carrito");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.rol]);

  const migrarCarritoLocal = useCallback(async () => {
    const carritoLocal = localStorage.getItem(STORAGE_KEY);
    if (!carritoLocal) return;

    const toastId = toast.loading("Sincronizando tu carrito...");

    try {
      const itemsLocales: ItemCarrito[] = JSON.parse(carritoLocal);

      for (const item of itemsLocales) {
        await fetch("/api/carrito", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            producto_id: item.producto.id,
            cantidad: item.cantidad,
          }),
        });
      }

      localStorage.removeItem(STORAGE_KEY);
      await loadCarrito();

      toast.success(
        `${itemsLocales.length} ${
          itemsLocales.length === 1
            ? "producto sincronizado"
            : "productos sincronizados"
        }`,
        { id: toastId }
      );
    } catch (error) {
      console.error("Error al migrar carrito:", error);
      toast.error("Error al sincronizar el carrito", { id: toastId });
    }
  }, [loadCarrito]);

  useEffect(() => {
    if (mounted && isAuthenticated && user?.rol === "cliente") {
      void migrarCarritoLocal();
    }
  }, [mounted, isAuthenticated, user?.rol, migrarCarritoLocal]);

  const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0);
  const subtotal = items.reduce(
    (sum, i) => sum + i.producto.precio * i.cantidad,
    0
  );
  const costoEnvio = totalItems >= ENVIO_GRATIS_THRESHOLD ? 0 : COSTO_ENVIO;
  const total = subtotal + costoEnvio;

  const value: CarritoContextType = {
    items,
    agregarProducto,
    quitarProducto,
    actualizarCantidad,
    vaciarCarrito,
    totalItems,
    subtotal,
    costoEnvio,
    total,
    loading,
  };

  return (
    <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>
  );
}

export function useCarrito() {
  const context = useContext(CarritoContext);
  if (context === undefined) {
    throw new Error("useCarrito debe usarse dentro de CarritoProvider");
  }
  return context;
}
