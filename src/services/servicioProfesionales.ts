// Copia local independiente (mismo criterio que en mf-agenda): no se
// importa el servicio de otro microfrontend.
export type Profesional = { id: string; nombre: string; especialidad: string; registroMedico: string };

const PROFESIONALES_DEMO: Profesional[] = [
  { id: "pr1", nombre: "Dr. Gómez", especialidad: "Medicina general", registroMedico: "RM-10234" },
  { id: "pr2", nombre: "Dra. Ruiz", especialidad: "Pediatría", registroMedico: "RM-88231" },
];

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function obtenerProfesionalesAPI(): Promise<Profesional[]> {
  await esperar(200);
  return [...PROFESIONALES_DEMO];
}
