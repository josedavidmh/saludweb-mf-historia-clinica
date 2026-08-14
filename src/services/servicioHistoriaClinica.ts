export type Antecedentes = { personales: string; familiares: string; alergias: string };
export type Consulta = {
  motivo: string;
  enfermedadActual: string;
  frecuenciaCardiaca: string;
  tensionArterial: string;
  temperatura: string;
};
export type Procedimiento = { id: string; codigoCUPS: string; descripcion: string };

export type AtencionClinica = {
  id: string;
  paciente: string;
  profesional: string;
  fecha: string;
  estado: "en_curso" | "finalizada";
  antecedentes: Antecedentes | null;
  consulta: Consulta | null;
  procedimientos: Procedimiento[];
};

let ATENCIONES_DEMO: AtencionClinica[] = [
  {
    id: "hc1",
    paciente: "Ana Restrepo Gómez",
    profesional: "Dr. Gómez",
    fecha: "2026-07-20",
    estado: "finalizada",
    antecedentes: { personales: "Hipertensión controlada", familiares: "Madre diabética", alergias: "Ninguna conocida" },
    consulta: {
      motivo: "Control periódico",
      enfermedadActual: "Asintomática",
      frecuenciaCardiaca: "76",
      tensionArterial: "120/80",
      temperatura: "36.5",
    },
    procedimientos: [{ id: "p1", codigoCUPS: "890201", descripcion: "Consulta general" }],
  },
];

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function obtenerAtencionesAPI(): Promise<AtencionClinica[]> {
  await esperar(300);
  return [...ATENCIONES_DEMO];
}

export async function iniciarAtencionAPI(paciente: string, profesional: string): Promise<AtencionClinica> {
  await esperar(300);
  const nueva: AtencionClinica = {
    id: `hc${Date.now()}`,
    paciente,
    profesional,
    fecha: new Date().toISOString().slice(0, 10),
    estado: "en_curso",
    antecedentes: null,
    consulta: null,
    procedimientos: [],
  };
  ATENCIONES_DEMO = [...ATENCIONES_DEMO, nueva];
  return nueva;
}

export async function guardarAntecedentesAPI(atencionId: string, datos: Antecedentes): Promise<void> {
  await esperar(300);
  ATENCIONES_DEMO = ATENCIONES_DEMO.map((a) => (a.id === atencionId ? { ...a, antecedentes: datos } : a));
}

export async function guardarConsultaAPI(atencionId: string, datos: Consulta): Promise<void> {
  await esperar(300);
  ATENCIONES_DEMO = ATENCIONES_DEMO.map((a) => (a.id === atencionId ? { ...a, consulta: datos } : a));
}

export async function agregarProcedimientoAPI(atencionId: string, datos: Omit<Procedimiento, "id">): Promise<Procedimiento> {
  await esperar(300);
  const nuevo: Procedimiento = { id: `p${Date.now()}`, ...datos };
  ATENCIONES_DEMO = ATENCIONES_DEMO.map((a) =>
    a.id === atencionId ? { ...a, procedimientos: [...a.procedimientos, nuevo] } : a
  );
  return nuevo;
}

export async function finalizarAtencionAPI(atencionId: string): Promise<void> {
  await esperar(300);
  ATENCIONES_DEMO = ATENCIONES_DEMO.map((a) => (a.id === atencionId ? { ...a, estado: "finalizada" } : a));
}
