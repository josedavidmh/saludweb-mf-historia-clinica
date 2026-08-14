// "Profesionales" pertenece conceptualmente a mf-configuracion (diseño
// target - Actividad 3, 3.2). El Shell es la fuente de verdad y publica
// los datos en localStorage bajo "saludweb:profesionales"; este
// microfrontend SOLO LEE esa clave (mismo contrato que usa mf-agenda,
// cada uno con su propia copia de este archivo, sin importarse entre sí).
export type Profesional = { id: string; nombre: string; especialidad: string; registroMedico: string };

const CLAVE_STORAGE = "saludweb:profesionales";

const SEED: Profesional[] = [
  { id: "pr1", nombre: "Dr. Gómez", especialidad: "Medicina general", registroMedico: "RM-10234" },
  { id: "pr2", nombre: "Dra. Ruiz", especialidad: "Psicología", registroMedico: "RM-10891" },
];

function leerProfesionalesCompartidos(): Profesional[] {
  if (typeof window === "undefined") return SEED;
  try {
    const guardado = window.localStorage.getItem(CLAVE_STORAGE);
    return guardado ? JSON.parse(guardado) : SEED;
  } catch {
    return SEED;
  }
}

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function obtenerProfesionalesAPI(): Promise<Profesional[]> {
  await esperar(200);
  return [...leerProfesionalesCompartidos()];
}
