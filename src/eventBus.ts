import { dispatcher } from "./dispatcher";

let suscrito = false;

export function iniciarEscuchaDeEventosExternos() {
  if (suscrito || typeof window === "undefined") return;
  suscrito = true;
  window.addEventListener("saludweb:admision-registrada", (evento) => {
    const detalle = (evento as CustomEvent).detail;
    dispatcher.dispatch({ type: "PACIENTE_EXTERNO_RECIBIDO", payload: detalle });
  });
}
