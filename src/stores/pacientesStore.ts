import { dispatcher, Accion } from "../dispatcher";

export type PacienteDisponible = {
  id: string;
  paciente: string;
  documento: string;
  eapb: string;
};

type Listener = () => void;

const CLAVE_STORAGE_ADMISIONES = "saludweb:admisiones";
const SEED: PacienteDisponible[] = [
  { id: "a1", paciente: "Sofía León", documento: "1023456789", eapb: "Nueva EPS" },
];

// Lee la MISMA clave de localStorage que escribe mf-admisiones. Es el
// mecanismo que garantiza coherencia sin importar el orden en que se
// visitaron los módulos ni si el CustomEvent llegó a tiempo (ver
// PACIENTE_EXTERNO_RECIBIDO más abajo, que sigue existiendo como mejora
// para cuando ambos microfrontends ya están cargados en la misma sesión).
function leerAdmisionesCompartidas(): PacienteDisponible[] {
  if (typeof window === "undefined") return SEED;
  try {
    const guardado = window.localStorage.getItem(CLAVE_STORAGE_ADMISIONES);
    if (!guardado) return SEED;
    const admisiones = JSON.parse(guardado) as Array<{ id: string; paciente: string; documento: string; eapb: string }>;
    return admisiones.map(({ id, paciente, documento, eapb }) => ({ id, paciente, documento, eapb }));
  } catch {
    return SEED;
  }
}

class PacientesStore {
  private pacientes: PacienteDisponible[] = SEED;
  private listeners: Listener[] = [];

  getPacientes(): PacienteDisponible[] {
    return this.pacientes;
  }

  subscribe(l: Listener) {
    this.listeners.push(l);
    return () => {
      this.listeners = this.listeners.filter((x) => x !== l);
    };
  }

  private notificar() {
    this.listeners.forEach((l) => l());
  }

  private fusionar(nuevos: PacienteDisponible[]) {
    const porId = new Map(this.pacientes.map((p) => [p.id, p]));
    nuevos.forEach((p) => porId.set(p.id, p));
    this.pacientes = Array.from(porId.values());
  }

  handleAction(accion: Accion) {
    if (accion.type === "PACIENTES_CARGADOS") {
      this.fusionar(accion.payload);
      this.notificar();
    }
    if (accion.type === "PACIENTE_EXTERNO_RECIBIDO") {
      const yaExiste = this.pacientes.some((p) => p.id === accion.payload.id);
      if (!yaExiste) {
        this.pacientes = [...this.pacientes, accion.payload];
        this.notificar();
      }
    }
  }
}

export const pacientesStore = new PacientesStore();
dispatcher.register((accion) => pacientesStore.handleAction(accion));

// Se llama al montar la vista (ver HistoriaClinicaView) para refrescar
// desde localStorage, igual que se refrescan los profesionales.
export function cargarPacientesDisponibles() {
  dispatcher.dispatch({ type: "PACIENTES_CARGADOS", payload: leerAdmisionesCompartidas() });
}
