import { type ReactNode } from "react";

// src/components/Modal.tsx
// Mismo patrón de modal de búsqueda usado en el repositorio original
// (Actividad 2): un overlay simple, sin dependencias externas, reutilizado
// para "Buscar profesional" en este microfrontend.
type Props = {
  titulo: string;
  abierto: boolean;
  onCerrar: () => void;
  children: ReactNode;
};

export function Modal({ titulo, abierto, onCerrar, children }: Props) {
  if (!abierto) return null;
  return (
    <div style={overlayEstilo} onClick={onCerrar}>
      <div style={cajaEstilo} onClick={(e) => e.stopPropagation()}>
        <div style={encabezadoEstilo}>
          <strong>{titulo}</strong>
          <button onClick={onCerrar} style={cerrarEstilo} aria-label="Cerrar">×</button>
        </div>
        <div style={cuerpoEstilo}>{children}</div>
      </div>
    </div>
  );
}

const overlayEstilo: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};
const cajaEstilo: React.CSSProperties = {
  background: "white",
  borderRadius: 10,
  width: "min(420px, 92vw)",
  maxHeight: "80vh",
  overflow: "hidden",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  display: "flex",
  flexDirection: "column",
};
const encabezadoEstilo: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 16px",
  borderBottom: "1px solid #E5E7EB",
};
const cerrarEstilo: React.CSSProperties = {
  background: "transparent",
  border: "none",
  fontSize: 20,
  lineHeight: 1,
  cursor: "pointer",
  color: "#6B7280",
};
const cuerpoEstilo: React.CSSProperties = { padding: 16, overflowY: "auto" };
