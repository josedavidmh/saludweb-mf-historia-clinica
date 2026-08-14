import { dispatcher } from "../dispatcher";
import {
  obtenerAtencionesAPI,
  iniciarAtencionAPI,
  guardarAntecedentesAPI,
  guardarConsultaAPI,
  agregarProcedimientoAPI,
  finalizarAtencionAPI,
  Antecedentes,
  Consulta,
  Procedimiento,
} from "../services/servicioHistoriaClinica";

export async function cargarAtenciones() {
  const atenciones = await obtenerAtencionesAPI();
  dispatcher.dispatch({ type: "HISTORIA_ATENCIONES_CARGADAS", payload: atenciones });
}

export async function iniciarAtencion(paciente: string, profesional: string) {
  const atencion = await iniciarAtencionAPI(paciente, profesional);
  dispatcher.dispatch({ type: "HISTORIA_ATENCION_INICIADA", payload: atencion });
}

export async function guardarAntecedentes(atencionId: string, datos: Antecedentes) {
  await guardarAntecedentesAPI(atencionId, datos);
  dispatcher.dispatch({ type: "HISTORIA_ANTECEDENTES_GUARDADOS", payload: { atencionId, datos } });
}

export async function guardarConsulta(atencionId: string, datos: Consulta) {
  await guardarConsultaAPI(atencionId, datos);
  dispatcher.dispatch({ type: "HISTORIA_CONSULTA_GUARDADA", payload: { atencionId, datos } });
}

export async function agregarProcedimiento(atencionId: string, datos: Omit<Procedimiento, "id">) {
  const procedimiento = await agregarProcedimientoAPI(atencionId, datos);
  dispatcher.dispatch({ type: "HISTORIA_PROCEDIMIENTO_AGREGADO", payload: { atencionId, procedimiento } });
}

export async function finalizarAtencion(atencionId: string) {
  await finalizarAtencionAPI(atencionId);
  dispatcher.dispatch({ type: "HISTORIA_ATENCION_FINALIZADA", payload: { atencionId } });
}

export function pasoAnterior() {
  dispatcher.dispatch({ type: "HISTORIA_PASO_ANTERIOR" });
}
