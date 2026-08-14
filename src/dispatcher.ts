export type Accion = { type: string; payload?: any };
type ManejadorDeStore = (accion: Accion) => void;

class Dispatcher {
  private stores: ManejadorDeStore[] = [];
  private historial: Accion[] = [];

  register(manejador: ManejadorDeStore) {
    this.stores.push(manejador);
  }

  dispatch(accion: Accion) {
    this.historial.push({ ...accion });
    // eslint-disable-next-line no-console
    console.log("[mf-historia-clinica · Flux] Acción despachada:", accion.type, accion.payload ?? "");
    this.stores.forEach((manejador) => manejador(accion));
  }

  getHistorial() {
    return this.historial;
  }
}

export const dispatcher = new Dispatcher();
