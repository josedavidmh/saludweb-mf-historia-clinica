import { dispatcher, Accion } from "../dispatcher";
import { AtencionClinica } from "../services/servicioHistoriaClinica";

type Listener = () => void;

class HistoriaClinicaStore {
  private atenciones: AtencionClinica[] = [];
  private atencionActivaId: string | null = null;
  private paso: 1 | 2 | 3 = 1;
  private listeners: Listener[] = [];

  getAtenciones(): AtencionClinica[] {
    return this.atenciones;
  }

  getAtencionActiva(): AtencionClinica | null {
    return this.atenciones.find((a) => a.id === this.atencionActivaId) ?? null;
  }

  getPaso() {
    return this.paso;
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
    switch (accion.type) {
      case "HISTORIA_ATENCIONES_CARGADAS":
        this.atenciones = accion.payload;
        this.notificar();
        break;
      case "HISTORIA_ATENCION_INICIADA":
        this.atenciones = [...this.atenciones, accion.payload];
        this.atencionActivaId = accion.payload.id;
        this.paso = 1;
        this.notificar();
        break;
      case "HISTORIA_ANTECEDENTES_GUARDADOS":
        this.atenciones = this.atenciones.map((a) =>
          a.id === accion.payload.atencionId ? { ...a, antecedentes: accion.payload.datos } : a
        );
        this.paso = 2;
        this.notificar();
        break;
      case "HISTORIA_CONSULTA_GUARDADA":
        this.atenciones = this.atenciones.map((a) =>
          a.id === accion.payload.atencionId ? { ...a, consulta: accion.payload.datos } : a
        );
        this.paso = 3;
        this.notificar();
        break;
      case "HISTORIA_PROCEDIMIENTO_AGREGADO":
        this.atenciones = this.atenciones.map((a) =>
          a.id === accion.payload.atencionId
            ? { ...a, procedimientos: [...a.procedimientos, accion.payload.procedimiento] }
            : a
        );
        this.notificar();
        break;
      case "HISTORIA_ATENCION_FINALIZADA":
        this.atenciones = this.atenciones.map((a) =>
          a.id === accion.payload.atencionId ? { ...a, estado: "finalizada" } : a
        );
        this.atencionActivaId = null;
        this.paso = 1;
        this.notificar();
        break;
      case "HISTORIA_PASO_ANTERIOR":
        this.paso = Math.max(1, this.paso - 1) as 1 | 2 | 3;
        this.notificar();
        break;
    }
  }
}

export const historiaClinicaStore = new HistoriaClinicaStore();
dispatcher.register((accion) => historiaClinicaStore.handleAction(accion));
