import { createRoot, type Root } from "react-dom/client";
import { HistoriaClinicaView } from "./components/HistoriaClinicaView";

const raices = new WeakMap<HTMLElement, Root>();

export function mount(contenedor: HTMLElement, _props: Record<string, unknown> = {}) {
  const raiz = createRoot(contenedor);
  raices.set(contenedor, raiz);
  raiz.render(<HistoriaClinicaView />);
}

export function unmount(contenedor: HTMLElement) {
  const raiz = raices.get(contenedor);
  if (raiz) {
    raiz.unmount();
    raices.delete(contenedor);
  }
}

declare global {
  interface Window {
    SaludWebMFHistoriaClinica: { mount: typeof mount; unmount: typeof unmount };
  }
}

if (typeof window !== "undefined") {
  window.SaludWebMFHistoriaClinica = { mount, unmount };
}
