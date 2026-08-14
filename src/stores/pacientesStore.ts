import { dispatcher, Accion } from "../dispatcher";

export type PacienteDisponible = {
  id: string;
  paciente: string;
  documento: string;
  eapb: string;
};

type Listener = () => void;

class PacientesStore {
  private pacientes: PacienteDisponible[] = [
    { id: "a1", paciente: "Sofía León", documento: "1023456789", eapb: "Nueva EPS" },
  ];
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

  handleAction(accion: Accion) {
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
