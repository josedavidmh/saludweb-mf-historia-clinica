import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { useStore } from "../useStore";
import { historiaClinicaStore } from "../stores/historiaClinicaStore";
import { pacientesStore, cargarPacientesDisponibles, type PacienteDisponible } from "../stores/pacientesStore";
import { iniciarEscuchaDeEventosExternos } from "../eventBus";
import { obtenerProfesionalesAPI, type Profesional } from "../services/servicioProfesionales";
import { Modal } from "./Modal";
import {
  cargarAtenciones,
  iniciarAtencion,
  guardarAntecedentes,
  guardarConsulta,
  agregarProcedimiento,
  finalizarAtencion,
  pasoAnterior,
} from "../actions/historiaClinicaActions";

const PASOS = ["Antecedentes", "Consulta", "Procedimientos"];

export function HistoriaClinicaView() {
  const atenciones = useStore(
    (l) => historiaClinicaStore.subscribe(l),
    () => historiaClinicaStore.getAtenciones()
  );
  const atencionActiva = useStore(
    (l) => historiaClinicaStore.subscribe(l),
    () => historiaClinicaStore.getAtencionActiva()
  );
  const paso = useStore(
    (l) => historiaClinicaStore.subscribe(l),
    () => historiaClinicaStore.getPaso()
  );

  useEffect(() => {
    iniciarEscuchaDeEventosExternos();
    cargarAtenciones();
    // Lectura fresca desde localStorage: garantiza ver los pacientes
    // admitidos aunque el evento en vivo de mf-admisiones se haya perdido
    // (por ejemplo, si se entró primero a esta página).
    cargarPacientesDisponibles();
  }, []);

  return (
    <div>
      <div style={encabezadoEstilo}>
        <h1 style={{ margin: 0 }}>Historia clínica</h1>
        <span style={etiquetaMfEstilo}>microfrontend: mf-historia-clinica</span>
      </div>

      {!atencionActiva ? (
        <>
          <IniciarAtencionForm />
          <ListaAtenciones atenciones={atenciones} />
        </>
      ) : (
        <WizardAtencion atencionId={atencionActiva.id} paso={paso} paciente={atencionActiva.paciente} />
      )}
    </div>
  );
}

// Restaura el patrón de modales "Buscar paciente" / "Buscar profesional"
// del repositorio original (Actividad 2). Ambas listas se leen de
// localStorage bajo un contrato de clave compartido (saludweb:admisiones
// y saludweb:profesionales, respectivamente) para que la información sea
// coherente sin importar el orden de navegación entre microfrontends;
// el CustomEvent saludweb:admision-registrada sigue activo como mejora
// adicional para actualizaciones en vivo dentro de la misma sesión.
function IniciarAtencionForm() {
  const pacientes = useStore(
    (l) => pacientesStore.subscribe(l),
    () => pacientesStore.getPacientes()
  );
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [paciente, setPaciente] = useState<PacienteDisponible | null>(null);
  const [profesional, setProfesional] = useState<Profesional | null>(null);
  const [modalPacienteAbierto, setModalPacienteAbierto] = useState(false);
  const [modalProfesionalAbierto, setModalProfesionalAbierto] = useState(false);

  useEffect(() => {
    obtenerProfesionalesAPI().then(setProfesionales);
  }, []);

  async function manejarSubmit(e: FormEvent) {
    e.preventDefault();
    if (!paciente || !profesional) return;
    await iniciarAtencion(paciente.paciente, profesional.nombre);
    setPaciente(null);
    setProfesional(null);
  }

  return (
    <>
      <form onSubmit={manejarSubmit} style={{ ...tarjetaEstilo, display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24, alignItems: "center" }}>
        <input
          placeholder="Paciente"
          value={paciente ? `${paciente.paciente} · ${paciente.documento}` : ""}
          readOnly
          style={{ ...campoEstilo, background: "#F3F4F6", minWidth: 200 }}
        />
        <button type="button" onClick={() => setModalPacienteAbierto(true)}>
          Buscar paciente
        </button>

        <input
          placeholder="Profesional"
          value={profesional ? `${profesional.nombre} · ${profesional.especialidad}` : ""}
          readOnly
          style={{ ...campoEstilo, background: "#F3F4F6", minWidth: 200 }}
        />
        <button type="button" onClick={() => setModalProfesionalAbierto(true)}>
          Buscar profesional
        </button>

        <button type="submit">Iniciar atención</button>

        {pacientes.length === 1 && (
          <span style={ayudaEstilo}>
            Tip: registra un paciente nuevo en mf-admisiones y aparecerá aquí automáticamente.
          </span>
        )}
      </form>

      <Modal titulo="Buscar paciente (admitidos)" abierto={modalPacienteAbierto} onCerrar={() => setModalPacienteAbierto(false)}>
        {pacientes.length === 0 && <p>No hay pacientes admitidos. Regístralos primero en mf-admisiones.</p>}
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {pacientes.map((p) => (
            <li
              key={p.id}
              style={itemModalEstilo}
              onClick={() => {
                setPaciente(p);
                setModalPacienteAbierto(false);
              }}
            >
              <strong>{p.paciente}</strong>
              <div style={{ fontSize: 12, color: "#6B7280" }}>
                Doc. {p.documento} · EAPB: {p.eapb}
              </div>
            </li>
          ))}
        </ul>
      </Modal>

      <Modal titulo="Buscar profesional" abierto={modalProfesionalAbierto} onCerrar={() => setModalProfesionalAbierto(false)}>
        {profesionales.length === 0 && <p>No hay profesionales registrados.</p>}
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {profesionales.map((p) => (
            <li
              key={p.id}
              style={itemModalEstilo}
              onClick={() => {
                setProfesional(p);
                setModalProfesionalAbierto(false);
              }}
            >
              <strong>{p.nombre}</strong>
              <div style={{ fontSize: 12, color: "#6B7280" }}>
                {p.especialidad} · {p.registroMedico}
              </div>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}

function WizardAtencion({ atencionId, paso, paciente }: { atencionId: string; paso: 1 | 2 | 3; paciente: string }) {
  return (
    <div style={tarjetaEstilo}>
      <h2 style={{ margin: 0 }}>{paciente}</h2>
      <div style={{ display: "flex", gap: 8, margin: "16px 0" }}>
        {PASOS.map((nombre, i) => {
          const numero = i + 1;
          const activo = numero === paso;
          const completado = numero < paso;
          return (
            <div
              key={nombre}
              style={{
                flex: 1,
                textAlign: "center",
                padding: 8,
                borderRadius: 6,
                background: activo ? "#2563EB" : completado ? "#16A34A" : "#E5E7EB",
                color: activo || completado ? "white" : "#374151",
                fontSize: 13,
              }}
            >
              {numero}. {nombre}
            </div>
          );
        })}
      </div>

      {paso === 1 && <PasoAntecedentes atencionId={atencionId} />}
      {paso === 2 && <PasoConsulta atencionId={atencionId} />}
      {paso === 3 && <PasoProcedimientos atencionId={atencionId} />}
    </div>
  );
}

function PasoAntecedentes({ atencionId }: { atencionId: string }) {
  const [personales, setPersonales] = useState("");
  const [familiares, setFamiliares] = useState("");
  const [alergias, setAlergias] = useState("");

  async function manejarSubmit(e: FormEvent) {
    e.preventDefault();
    await guardarAntecedentes(atencionId, { personales, familiares, alergias });
  }

  return (
    <form onSubmit={manejarSubmit}>
      <h3>Antecedentes</h3>
      <label style={etiquetaEstilo}>Antecedentes personales</label>
      <textarea value={personales} onChange={(e) => setPersonales(e.target.value)} style={areaEstilo} />
      <label style={etiquetaEstilo}>Antecedentes familiares</label>
      <textarea value={familiares} onChange={(e) => setFamiliares(e.target.value)} style={areaEstilo} />
      <label style={etiquetaEstilo}>Alergias</label>
      <textarea value={alergias} onChange={(e) => setAlergias(e.target.value)} style={areaEstilo} />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
        <button type="submit">Siguiente</button>
      </div>
    </form>
  );
}

function PasoConsulta({ atencionId }: { atencionId: string }) {
  const [motivo, setMotivo] = useState("");
  const [enfermedadActual, setEnfermedadActual] = useState("");
  const [frecuenciaCardiaca, setFrecuenciaCardiaca] = useState("");
  const [tensionArterial, setTensionArterial] = useState("");
  const [temperatura, setTemperatura] = useState("");

  async function manejarSubmit(e: FormEvent) {
    e.preventDefault();
    await guardarConsulta(atencionId, { motivo, enfermedadActual, frecuenciaCardiaca, tensionArterial, temperatura });
  }

  return (
    <form onSubmit={manejarSubmit}>
      <h3>Consulta — motivo y evolución</h3>
      <label style={etiquetaEstilo}>Motivo de consulta</label>
      <input value={motivo} onChange={(e) => setMotivo(e.target.value)} style={campoAnchoEstilo} />
      <label style={etiquetaEstilo}>Enfermedad actual</label>
      <input value={enfermedadActual} onChange={(e) => setEnfermedadActual(e.target.value)} style={campoAnchoEstilo} />
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={etiquetaEstilo}>Frecuencia cardíaca</label>
          <input value={frecuenciaCardiaca} onChange={(e) => setFrecuenciaCardiaca(e.target.value)} style={campoAnchoEstilo} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={etiquetaEstilo}>Tensión arterial</label>
          <input value={tensionArterial} onChange={(e) => setTensionArterial(e.target.value)} style={campoAnchoEstilo} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={etiquetaEstilo}>Temperatura</label>
          <input value={temperatura} onChange={(e) => setTemperatura(e.target.value)} style={campoAnchoEstilo} />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
        <button type="button" onClick={() => pasoAnterior()}>Atrás</button>
        <button type="submit">Siguiente</button>
      </div>
    </form>
  );
}

function PasoProcedimientos({ atencionId }: { atencionId: string }) {
  const atencion = useStore(
    (l) => historiaClinicaStore.subscribe(l),
    () => historiaClinicaStore.getAtencionActiva()
  );
  const [codigoCUPS, setCodigoCUPS] = useState("");
  const [descripcion, setDescripcion] = useState("");

  async function manejarAgregar(e: FormEvent) {
    e.preventDefault();
    if (!codigoCUPS || !descripcion) return;
    await agregarProcedimiento(atencionId, { codigoCUPS, descripcion });
    setCodigoCUPS("");
    setDescripcion("");
  }

  return (
    <div>
      <h3>Procedimientos</h3>
      <form onSubmit={manejarAgregar} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input placeholder="Código CUPS" value={codigoCUPS} onChange={(e) => setCodigoCUPS(e.target.value)} style={campoEstilo} />
        <input placeholder="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} style={campoEstilo} />
        <button type="submit">Agregar</button>
      </form>
      <ul style={{ maxHeight: 220, overflowY: "auto", paddingLeft: 20, margin: 0 }}>
        {atencion?.procedimientos.map((p) => (
          <li key={p.id}>{p.codigoCUPS} — {p.descripcion}</li>
        ))}
      </ul>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
        <button type="button" onClick={() => pasoAnterior()}>Atrás</button>
        <button type="button" onClick={() => finalizarAtencion(atencionId)}>Finalizar atención</button>
      </div>
    </div>
  );
}

function ListaAtenciones({ atenciones }: { atenciones: ReturnType<typeof historiaClinicaStore.getAtenciones> }) {
  return (
    <>
      <h2>Atenciones registradas</h2>
      <div style={contenedorTablaEstilo}>
        <table style={tablaEstilo}>
          <thead>
            <tr>
              <th style={celdaEstilo}>Paciente</th>
              <th style={celdaEstilo}>Profesional</th>
              <th style={celdaEstilo}>Fecha</th>
              <th style={celdaEstilo}>Estado</th>
              <th style={celdaEstilo}>Procedimientos</th>
            </tr>
          </thead>
          <tbody>
            {atenciones.map((a) => (
              <tr key={a.id}>
                <td style={celdaEstilo}>{a.paciente}</td>
                <td style={celdaEstilo}>{a.profesional}</td>
                <td style={celdaEstilo}>{a.fecha}</td>
                <td style={celdaEstilo}>
                  <span style={{ color: a.estado === "finalizada" ? "#16A34A" : "#F59E0B" }}>
                    {a.estado === "finalizada" ? "Finalizada" : "En curso"}
                  </span>
                </td>
                <td style={celdaEstilo}>{a.procedimientos.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

const encabezadoEstilo: CSSProperties = { display: "flex", alignItems: "center", gap: 10, marginBottom: 16 };
const etiquetaMfEstilo: CSSProperties = {
  fontSize: 11,
  color: "#2563EB",
  background: "#DCEAFE",
  border: "1px solid #93C5FD",
  borderRadius: 999,
  padding: "2px 10px",
  fontFamily: "monospace",
};
const ayudaEstilo: CSSProperties = { fontSize: 12, color: "#6B7280" };
const tarjetaEstilo: CSSProperties = { background: "white", padding: 20, borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" };
const campoEstilo: CSSProperties = { padding: 8, border: "1px solid #D1D5DB", borderRadius: 6 };
const campoAnchoEstilo: CSSProperties = { width: "100%", padding: 8, border: "1px solid #D1D5DB", borderRadius: 6, boxSizing: "border-box", marginBottom: 8 };
const areaEstilo: CSSProperties = { width: "100%", padding: 8, border: "1px solid #D1D5DB", borderRadius: 6, boxSizing: "border-box", marginBottom: 8, minHeight: 50 };
const etiquetaEstilo: CSSProperties = { display: "block", fontSize: 13, color: "#6B7280", marginBottom: 4 };
const contenedorTablaEstilo: CSSProperties = { maxHeight: 420, overflowY: "auto", border: "1px solid #E5E7EB", borderRadius: 6, marginTop: 12 };
const tablaEstilo: CSSProperties = { width: "100%", borderCollapse: "collapse", background: "white" };
const celdaEstilo: CSSProperties = { border: "1px solid #E5E7EB", padding: 8, textAlign: "left" };
const itemModalEstilo: CSSProperties = {
  padding: 10,
  borderRadius: 6,
  border: "1px solid #E5E7EB",
  marginBottom: 8,
  cursor: "pointer",
};
