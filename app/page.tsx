"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Activity,
  Anchor,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  EyeOff,
  FileText,
  Flag,
  Network,
  Pause,
  Play,
  Radio,
  RefreshCcw,
  Shield,
  ShieldAlert,
  Target,
  Users,
  Volume2,
  VolumeX,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Phase = "setup" | "briefing" | "exercise" | "debrief";
type Domain =
  | "CIBER"
  | "COGNITIVO"
  | "FÍSICO"
  | "MANDO"
  | "LEGAL"
  | "RECUPERACIÓN";
type Choice = {
  label: string;
  points: number;
  consequence: string;
  impact: string;
};
type Inject = {
  time: string;
  domain: Domain;
  title: string;
  subtitle: string;
  situation: string;
  intel: string[];
  image: string;
  video?: string;
  prompt?: string;
  choices?: Choice[];
};

const roles = [
  [
    "Dirección del Comité",
    "Integra la situación, fija prioridades y autoriza cursos de acción.",
  ],
  [
    "Inteligencia",
    "Valida fuentes, formula hipótesis y estima intención, capacidad y atribución.",
  ],
  ["Ciber / OT", "Contiene el incidente sin agravar la seguridad operacional."],
  [
    "Seguridad física",
    "Protege personas, perímetro, combustible y continuidad portuaria.",
  ],
  [
    "Comunicación estratégica",
    "Reduce el pánico y disputa la narrativa con evidencia verificable.",
  ],
  [
    "Asesoría jurídica",
    "Controla competencia, proporcionalidad, evidencia y cooperación internacional.",
  ],
] as const;

const injects: Inject[] = [
  {
    time: "08:00",
    domain: "MANDO",
    title: "Normalidad operativa",
    subtitle: "Línea de base",
    image: "/puerto-4-0-tabletop/media/normalidad.webp",
    situation:
      "La Terminal Portuaria Multipropósito opera al 96 % de su capacidad. Grúas pórtico, control de accesos, sistema de gestión de terminal y red OT funcionan sin alertas críticas. Arriba un buque con carga sensible en 90 minutos.",
    intel: [
      "Nivel de protección: normal",
      "Ventana logística crítica: 08:00–12:00",
      "Personal propio y contratistas: 1.240",
    ],
  },
  {
    time: "08:32",
    domain: "CIBER",
    title: "Pérdida de control industrial",
    subtitle: "Inyección 01",
    image: "/puerto-4-0-tabletop/media/ransomware.webp",
    video: "/puerto-4-0-tabletop/media/ransomware-scada.mp4",
    situation:
      "El SOC informa cifrado de servidores de supervisión y pérdida de telemetría de dos grúas. La nota exige 50 XMR y utiliza retórica extremista. No se confirmó compromiso de los PLC ni la identidad del actor.",
    intel: [
      "Fuente: SOC — alta confiabilidad",
      "Alcance técnico: aún no determinado",
      "Atribución: no confirmada",
    ],
  },
  {
    time: "08:35",
    domain: "COGNITIVO",
    title: "Video falso de evacuación",
    subtitle: "Inyección 02",
    image: "/puerto-4-0-tabletop/media/deepfake.webp",
    video: "/puerto-4-0-tabletop/media/deepfake-viral.mp4",
    situation:
      "Un video hiperrealista atribuido a una autoridad naval anuncia una amenaza biológica y ordena evacuar. Se viraliza en redes y algunos medios lo replican sin verificación. Las rutas de acceso comienzan a congestionarse.",
    intel: [
      "Fuente original: cuenta creada hace 17 minutos",
      "Audio con artefactos de síntesis",
      "No existe orden oficial de evacuación",
    ],
  },
  {
    time: "08:38",
    domain: "FÍSICO",
    title: "Drones sobre zona energética",
    subtitle: "Inyección 03",
    image: "/puerto-4-0-tabletop/media/drones.webp",
    video: "/puerto-4-0-tabletop/media/enjambre-drones.mp4",
    situation:
      "Se detectan seis vehículos aéreos no tripulados a baja altura próximos a tanques de combustible. No se observa carga útil. Seguridad solicita una decisión inmediata y recuerda el riesgo de caída sobre infraestructura crítica.",
    intel: [
      "Identificación visual incompleta",
      "Posible enlace de radiofrecuencia",
      "Riesgo cinético y colateral",
    ],
  },
  {
    time: "08:40",
    domain: "MANDO",
    title: "Triaje multidominio",
    subtitle: "Decisión 01",
    image: "/puerto-4-0-tabletop/media/crisis-room.webp",
    situation:
      "Tres incidentes simultáneos compiten por recursos. El comité debe distinguir hechos, hipótesis y desinformación, establecer mando y asignar esfuerzos.",
    intel: [
      "Tiempo para decidir: 8 minutos",
      "Objetivo: proteger vidas y sostener funciones esenciales",
    ],
    prompt: "¿Qué curso de acción inicial adopta el comité?",
    choices: [
      {
        label: "Evacuar toda el área por el video viral",
        points: 0,
        consequence:
          "La desinformación gobierna la respuesta y aumenta la congestión.",
        impact: "Pánico +2 · Continuidad −2",
      },
      {
        label: "Concentrar todos los recursos en el ransomware",
        points: 1,
        consequence:
          "Mejora la contención digital, pero quedan sin conducción los frentes físico e informacional.",
        impact: "Ciber +1 · Seguridad −1",
      },
      {
        label: "Activar C2 unificado y células paralelas por dominio",
        points: 3,
        consequence:
          "Se separan conducción, ejecución y verificación con una imagen operacional común.",
        impact: "Coordinación +2 · Tiempo +1",
      },
      {
        label: "Neutralizar primero los drones sin validar reglas",
        points: 1,
        consequence:
          "Se atiende la amenaza inmediata con riesgo jurídico y operacional.",
        impact: "Seguridad +1 · Legal −1",
      },
    ],
  },
  {
    time: "09:15",
    domain: "CIBER",
    title: "Contención de la red OT",
    subtitle: "Decisión 02",
    image: "/puerto-4-0-tabletop/media/contencion.webp",
    situation:
      "Se confirma propagación lateral desde un servidor de ingeniería hacia estaciones HMI. Los controladores mantienen lógica local segura. La red de emergencias comparte infraestructura física, pero está segmentada.",
    intel: [
      "Backups offline disponibles",
      "No hay evidencia de cifrado en PLC",
      "La parada total afecta sistemas de seguridad",
    ],
    prompt: "¿Qué protocolo de contención autoriza?",
    choices: [
      {
        label: "Apagar toda la red y la energía del puerto",
        points: 0,
        consequence:
          "Detiene comunicaciones esenciales y puede inducir estados inseguros.",
        impact: "Continuidad −2 · Seguridad −1",
      },
      {
        label:
          "Aislar zonas OT afectadas, preservar evidencia y operar en modo degradado",
        points: 3,
        consequence:
          "Limita la propagación, conserva funciones críticas y habilita recuperación controlada.",
        impact: "Ciber +2 · Evidencia +1",
      },
      {
        label: "Descifrar en producción sin aislar",
        points: 0,
        consequence:
          "La propagación continúa mientras se altera evidencia volátil.",
        impact: "Ciber −2 · Evidencia −1",
      },
      {
        label: "Negociar el pago para acelerar la restauración",
        points: 0,
        consequence:
          "No garantiza recuperación y eleva riesgos legales, financieros y reputacionales.",
        impact: "Legal −1 · Reputación −1",
      },
    ],
  },
  {
    time: "09:20",
    domain: "FÍSICO",
    title: "Respuesta contra UAS",
    subtitle: "Decisión 03",
    image: "/puerto-4-0-tabletop/media/antidron.webp",
    situation:
      "Los drones mantienen patrón de espera. El análisis espectral sugiere control remoto, pero se desconoce su lógica de failsafe. La autoridad competente dispone de capacidades C-UAS autorizadas.",
    intel: [
      "Área con material inflamable",
      "Riesgo de caída no modelado",
      "La intervención debe ser graduada",
    ],
    prompt: "¿Qué respuesta recomienda el comité?",
    choices: [
      {
        label: "Inhibir de inmediato todas las frecuencias",
        points: 1,
        consequence:
          "Puede cortar enlaces, pero también afectar comunicaciones y activar un failsafe desconocido.",
        impact: "Físico +1 · Comunicaciones −1",
      },
      {
        label: "Aplicar respuesta C-UAS graduada bajo autoridad competente",
        points: 3,
        consequence:
          "Se combina identificación, perímetro, protección pasiva e intervención selectiva según reglas vigentes.",
        impact: "Seguridad +2 · Legal +1",
      },
      {
        label: "Derribar los drones con armas de fuego",
        points: 0,
        consequence:
          "Incrementa el riesgo de impacto, incendio y daño colateral.",
        impact: "Seguridad −2 · Legal −1",
      },
      {
        label: "No actuar hasta conocer al operador",
        points: 0,
        consequence:
          "Cede la iniciativa ante una amenaza con proximidad crítica.",
        impact: "Tiempo −2",
      },
    ],
  },
  {
    time: "09:30",
    domain: "LEGAL",
    title: "Atribución y respuesta transfronteriza",
    subtitle: "Decisión 04",
    image: "/puerto-4-0-tabletop/media/crisis-room.webp",
    situation:
      "Inteligencia vincula el C2 a infraestructura alojada en el exterior. La IP por sí sola no prueba autoría. El CSIRT propone neutralizar el canal sin intrusión ofensiva y solicitar preservación de datos.",
    intel: [
      "Confianza de atribución: baja–media",
      "Servidor posiblemente comprometido",
      "Cooperación internacional disponible",
    ],
    prompt: "¿Qué acción autoriza el comité?",
    choices: [
      {
        label: "Ejecutar hack-back contra el servidor",
        points: 0,
        consequence:
          "La baja certeza expone a afectar infraestructura de terceros y exceder competencias.",
        impact: "Legal −2 · Atribución −1",
      },
      {
        label:
          "Bloquear, redirigir defensivamente y notificar a CSIRT/CERT y autoridades",
        points: 3,
        consequence:
          "Reduce el control adversario, preserva evidencia y habilita cooperación formal.",
        impact: "Legal +2 · Evidencia +1",
      },
      {
        label: "Bloquear IP y cerrar el incidente",
        points: 1,
        consequence:
          "Contiene parcialmente, pero pierde inteligencia y oportunidad de coordinación.",
        impact: "Ciber +1 · Inteligencia −1",
      },
      {
        label: "Transferir toda la crisis a las Fuerzas Armadas",
        points: 0,
        consequence:
          "Confunde competencias y no resuelve la conducción interagencial.",
        impact: "Mando −2",
      },
    ],
  },
  {
    time: "11:30",
    domain: "RECUPERACIÓN",
    title: "Restauración y narrativa",
    subtitle: "Decisión 05",
    image: "/puerto-4-0-tabletop/media/resolucion.webp",
    situation:
      "Las funciones mínimas están estabilizadas. Persisten rumores y presión comercial para volver al 100 %. El equipo forense aún valida integridad y el origen inicial sigue en investigación.",
    intel: [
      "Backups verificados: 92 %",
      "Contención sostenida: 74 minutos",
      "Sentimiento negativo en redes: alto",
    ],
    prompt: "¿Cómo se conduce la recuperación?",
    choices: [
      {
        label:
          "Restaurar todo de inmediato y comunicar que el caso está resuelto",
        points: 0,
        consequence:
          "La presión operativa prevalece sobre la verificación y se comunica una certeza inexistente.",
        impact: "Riesgo residual +2",
      },
      {
        label:
          "Restaurar por etapas, validar seguridad y comunicar hechos confirmados",
        points: 3,
        consequence:
          "La recuperación usa criterios de entrada/salida, monitoreo reforzado y comunicación transparente.",
        impact: "Resiliencia +2 · Confianza +1",
      },
      {
        label: "Mantener el puerto cerrado por tiempo indefinido",
        points: 1,
        consequence:
          "Reduce exposición inmediata, pero sin criterios de salida deteriora la misión.",
        impact: "Seguridad +1 · Continuidad −2",
      },
      {
        label: "Delegar toda comunicación a las redes sociales",
        points: 0,
        consequence:
          "Fragmenta la voz institucional y amplifica contradicciones.",
        impact: "Confianza −2",
      },
    ],
  },
];

const domainStyle: Record<Domain, string> = {
  CIBER: "text-cyan-300 border-cyan-400/30 bg-cyan-400/10",
  COGNITIVO: "text-violet-300 border-violet-400/30 bg-violet-400/10",
  FÍSICO: "text-orange-300 border-orange-400/30 bg-orange-400/10",
  MANDO: "text-sky-300 border-sky-400/30 bg-sky-400/10",
  LEGAL: "text-amber-300 border-amber-400/30 bg-amber-400/10",
  RECUPERACIÓN: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10",
};

const maturityBands = [
  { max: 39, label: "Incipiente", color: "#ef4444", className: "text-red-300" },
  { max: 59, label: "Básico", color: "#f97316", className: "text-orange-300" },
  {
    max: 79,
    label: "En desarrollo",
    color: "#eab308",
    className: "text-yellow-300",
  },
  { max: 94, label: "Avanzado", color: "#22d3ee", className: "text-cyan-300" },
  {
    max: 100,
    label: "Estratégico",
    color: "#22c55e",
    className: "text-emerald-300",
  },
] as const;

function getMaturity(percent: number) {
  return maturityBands.find((band) => percent <= band.max) ?? maturityBands[4];
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>("setup"),
    [index, setIndex] = useState(0),
    [team, setTeam] = useState("Comité Alfa"),
    [facilitator, setFacilitator] = useState(""),
    [organization, setOrganization] = useState(""),
    [showControl, setShowControl] = useState(false),
    [notes, setNotes] = useState<Record<number, string>>({}),
    [decisions, setDecisions] = useState<Record<number, number>>({}),
    [startedAt, setStartedAt] = useState(""),
    [elapsed, setElapsed] = useState(0);
  const current = injects[index],
    decisionIndexes = injects
      .map((x, i) => (x.choices ? i : -1))
      .filter((i) => i >= 0),
    maxScore = decisionIndexes.length * 3;
  const score = Object.entries(decisions).reduce(
      (sum, [i, c]) => sum + (injects[+i].choices?.[c]?.points || 0),
      0,
    ),
    answered = decisionIndexes.filter((i) => decisions[i] !== undefined).length;
  useEffect(() => {
    if (phase !== "exercise") return;
    const id = setInterval(() => setElapsed((v) => v + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);
  const clock = useMemo(
    () =>
      `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`,
    [elapsed],
  );
  const begin = () => {
      setStartedAt(new Date().toLocaleString("es-AR"));
      setPhase("briefing");
    },
    reset = () => {
      setPhase("setup");
      setIndex(0);
      setDecisions({});
      setNotes({});
      setElapsed(0);
      setShowControl(false);
    },
    next = () =>
      index < injects.length - 1 ? setIndex(index + 1) : setPhase("debrief"),
    select = (choice: number) =>
      decisions[index] === undefined &&
      setDecisions({ ...decisions, [index]: choice });
  function exportJson() {
    const percentage = Math.round((score / maxScore) * 100);
    const report = {
      exercise:
        "Puerto 4.0 — Ejercicio Tabletop de Crisis Híbrida Multidominio",
      team,
      facilitator,
      organization,
      startedAt,
      score,
      maxScore,
      grade: Number((percentage / 10).toFixed(1)),
      maturity: getMaturity(percentage).label,
      decisions: decisionIndexes.map((i) => ({
        inject: injects[i].title,
        choice: injects[i].choices?.[decisions[i]]?.label || "Sin respuesta",
        points: injects[i].choices?.[decisions[i]]?.points || 0,
        notes: notes[i] || "",
      })),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: "application/json",
      }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `puerto-4-0-${team.toLowerCase().replace(/\W+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  if (phase === "setup")
    return (
      <>
        <Setup
          team={team}
          setTeam={setTeam}
          facilitator={facilitator}
          setFacilitator={setFacilitator}
          organization={organization}
          setOrganization={setOrganization}
          onBegin={begin}
        />
        <SoundControl />
      </>
    );
  if (phase === "briefing")
    return (
      <>
        <Briefing team={team} onStart={() => setPhase("exercise")} />
        <SoundControl />
      </>
    );
  if (phase === "debrief")
    return (
      <>
        <Debrief
          team={team}
          score={score}
          maxScore={maxScore}
          decisions={decisions}
          notes={notes}
          onExport={exportJson}
          onReset={reset}
        />
        <SoundControl />
      </>
    );
  const selected = decisions[index],
    hasDecision = !!current.choices,
    canAdvance = !hasDecision || selected !== undefined;
  return (
    <>
      <main className="min-h-screen bg-[#07111b] text-slate-100 selection:bg-cyan-400/25">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#07111b]/95 backdrop-blur">
          <div className="mx-auto flex max-w-[1500px] items-center gap-4 px-4 py-3 lg:px-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-cyan-400/40 bg-cyan-400/10">
              <Anchor className="h-5 w-5 text-cyan-300" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[.22em] text-cyan-300">
                EJERCICIO TABLETOP DE CRISIS HÍBRIDA MULTIDOMINIO
              </p>
              <h1 className="truncate font-display text-lg font-bold tracking-wide">
                PUERTO 4.0
              </h1>
            </div>
            <div className="ml-auto hidden items-center gap-6 md:flex">
              <Metric label="TIEMPO" value={clock} />
              <Metric
                label="PROGRESO"
                value={`${index + 1}/${injects.length}`}
              />
              <Metric
                label="DECISIONES"
                value={`${answered}/${decisionIndexes.length}`}
              />
            </div>
            <button
              onClick={() => setShowControl(!showControl)}
              className="ml-2 flex items-center gap-2 rounded-sm border border-white/15 px-3 py-2 text-xs font-semibold hover:border-cyan-300/50"
            >
              {showControl ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">CONTROL</span>
            </button>
          </div>
        </header>
        <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 lg:grid-cols-[230px_minmax(0,1fr)_280px] lg:px-8">
          <aside className="hidden lg:block">
            <p className="section-label">LÍNEA DE TIEMPO</p>
            <div className="mt-4 space-y-1">
              {injects.map((item, i) => (
                <button
                  key={i}
                  onClick={() => showControl && setIndex(i)}
                  disabled={!showControl}
                  className={`timeline-item ${i === index ? "active" : ""} ${i < index ? "past" : ""}`}
                >
                  <span>{item.time}</span>
                  <span className="truncate">{item.title}</span>
                </button>
              ))}
            </div>
          </aside>
          <section>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className={`domain-chip ${domainStyle[current.domain]}`}>
                {current.domain}
              </span>
              <span className="text-xs tracking-[.16em] text-slate-500">
                {current.subtitle.toUpperCase()}
              </span>
              <span className="ml-auto font-mono text-sm text-slate-400">
                HORA-H {current.time}
              </span>
            </div>
            <article className="scenario-card">
              <div className="scanline" />
              <MediaPanel item={current} />
              <div className="relative p-6 md:p-9">
                <div className="mb-7 flex items-start gap-4">
                  <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center border border-red-400/30 bg-red-400/10">
                    <ShieldAlert className="h-5 w-5 text-red-300" />
                  </div>
                  <div>
                    <h2 className="font-display text-3xl font-bold leading-tight md:text-4xl">
                      {current.title}
                    </h2>
                    <p className="mt-2 max-w-3xl text-lg leading-relaxed text-slate-300">
                      {current.situation}
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {current.intel.map((x, i) => (
                    <div key={x} className="intel-strip">
                      <span>0{i + 1}</span>
                      <p>{x}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
            {current.choices && (
              <section className="mt-5 border border-white/10 bg-[#0b1926] p-5 md:p-7">
                <div className="mb-5 flex gap-3">
                  <Target className="mt-0.5 h-5 w-5 text-amber-300" />
                  <div>
                    <p className="section-label text-amber-300">
                      DECISIÓN REQUERIDA
                    </p>
                    <h3 className="mt-1 text-xl font-semibold">
                      {current.prompt}
                    </h3>
                  </div>
                </div>
                <div className="grid gap-3">
                  {current.choices.map((choice, i) => {
                    const chosen = selected === i;
                    return (
                      <button
                        key={choice.label}
                        disabled={selected !== undefined}
                        onClick={() => select(i)}
                        className={`choice ${chosen ? "chosen" : ""}`}
                      >
                        <span className="choice-index">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-left">
                          <strong>{choice.label}</strong>
                          {chosen && (
                            <span className="mt-2 block text-sm font-normal leading-relaxed text-slate-300">
                              {choice.consequence}
                            </span>
                          )}
                        </span>
                        {chosen && (
                          <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-cyan-300" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Textarea
                value={notes[index] || ""}
                onChange={(e) =>
                  setNotes({ ...notes, [index]: e.target.value })
                }
                placeholder="Registrar hechos, hipótesis, prioridades, disensos y fundamento de la decisión…"
                className="min-h-24 border-white/15 bg-white/[.03] text-base"
              />
              <Button
                onClick={next}
                disabled={!canAdvance}
                className="h-auto min-h-14 rounded-sm bg-cyan-300 px-7 font-bold text-[#06101a] hover:bg-cyan-200"
              >
                {index === injects.length - 1
                  ? "CERRAR EJERCICIO"
                  : "LIBERAR SIGUIENTE"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </section>
          <aside className={`${showControl ? "block" : "hidden"} lg:block`}>
            <div className="control-panel">
              <p className="section-label">CONTROL DEL FACILITADOR</p>
              <div className="mt-4 space-y-4">
                <ControlRow icon={<Users />} label="EQUIPO" value={team} />
                <ControlRow
                  icon={<Clock3 />}
                  label="RITMO SUGERIDO"
                  value={
                    hasDecision ? "8 min deliberación" : "3 min exposición"
                  }
                />
                <ControlRow
                  icon={<Radio />}
                  label="ESTADO"
                  value={
                    canAdvance ? "Listo para avanzar" : "Esperando decisión"
                  }
                />
              </div>
              {hasDecision && (
                <div className="mt-5 border-t border-white/10 pt-5">
                  <p className="section-label">CLAVE DE EVALUACIÓN</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    {selected !== undefined
                      ? current.choices[selected].impact
                      : "La clave aparece después de registrar la decisión."}
                  </p>
                </div>
              )}
              <div className="mt-5 border-t border-white/10 pt-5">
                <p className="section-label">PREGUNTAS DE SONDEO</p>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-400">
                  <li>¿Qué dato falta para reducir incertidumbre?</li>
                  <li>¿Quién tiene competencia para actuar?</li>
                  <li>¿Qué efecto de segundo orden puede aparecer?</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <SoundControl />
    </>
  );
}

function Setup({
  team,
  setTeam,
  facilitator,
  setFacilitator,
  organization,
  setOrganization,
  onBegin,
}: {
  team: string;
  setTeam: (v: string) => void;
  facilitator: string;
  setFacilitator: (v: string) => void;
  organization: string;
  setOrganization: (v: string) => void;
  onBegin: () => void;
}) {
  return (
    <main className="landing min-h-screen text-slate-100">
      <div className="harbor-grid" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-6 md:px-10">
        <nav className="flex items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-cyan-300/40 bg-cyan-300/10">
              <Anchor className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <p className="font-display font-bold tracking-wider">
                PUERTO 4.0
              </p>
              <p className="text-[10px] tracking-[.2em] text-slate-400">
                SIMULACRO MULTIDOMINIO
              </p>
            </div>
          </div>
          <span className="ml-auto border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[10px] font-bold tracking-[.16em] text-amber-200">
            USO ACADÉMICO
          </span>
        </nav>
        <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1.15fr_.85fr]">
          <section>
            <div className="mb-6 flex items-center gap-3 text-xs font-semibold tracking-[.22em] text-cyan-300">
              <span className="h-px w-10 bg-cyan-300" />
              EJERCICIO TABLETOP DE CRISIS HÍBRIDA MULTIDOMINIO
            </div>
            <h1 className="font-display text-5xl font-bold leading-[.96] tracking-tight sm:text-7xl">
              DECIDIR BAJO
              <br />
              <span className="text-outline">NIEBLA DE GUERRA</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-slate-300">
              Un incidente coordinado golpea una terminal portuaria crítica. El
              comité deberá integrar inteligencia, ciberseguridad, protección
              física, comunicación y legalidad antes de que la crisis supere su
              capacidad de respuesta.
            </p>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-px border border-white/10 bg-white/10">
              <Stat value="10" label="HITOS" />
              <Stat value="5" label="DECISIONES" />
              <Stat value="6" label="ROLES" />
            </div>
          </section>
          <section className="border border-white/15 bg-[#091725]/90 p-6 shadow-2xl shadow-cyan-950/30 md:p-8">
            <p className="section-label text-cyan-300">CONFIGURACIÓN DE SALA</p>
            <h2 className="mt-2 font-display text-2xl font-bold">
              Identificación del ejercicio
            </h2>
            <div className="mt-6 space-y-4">
              <Field
                label="Nombre del equipo"
                value={team}
                setValue={setTeam}
              />
              <Field
                label="Facilitador/a"
                value={facilitator}
                setValue={setFacilitator}
                placeholder="Completar después"
              />
              <Field
                label="Institución / Diplomatura"
                value={organization}
                setValue={setOrganization}
                placeholder="Completar después"
              />
            </div>
            <Button
              onClick={onBegin}
              className="mt-7 h-14 w-full rounded-sm bg-cyan-300 text-base font-bold text-[#06101a] hover:bg-cyan-200"
            >
              <Play className="h-4 w-4 fill-current" />
              PREPARAR EJERCICIO
            </Button>
            <p className="mt-4 text-center text-xs leading-relaxed text-slate-500">
              Los datos y decisiones se conservan únicamente en este navegador
              hasta exportar el informe.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
function Briefing({ team, onStart }: { team: string; onStart: () => void }) {
  return (
    <main className="min-h-screen bg-[#07111b] px-5 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3">
          <Anchor className="h-7 w-7 text-cyan-300" />
          <div>
            <p className="section-label text-cyan-300">BRIEFING INICIAL</p>
            <h1 className="font-display text-3xl font-bold">
              Orden del ejercicio · {team}
            </h1>
          </div>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <section className="border border-white/10 bg-white/[.03] p-6">
            <BookOpen className="h-7 w-7 text-amber-300" />
            <h2 className="mt-4 font-display text-2xl font-bold">Misión</h2>
            <p className="mt-3 leading-relaxed text-slate-300">
              Proteger vidas, sostener las funciones portuarias esenciales y
              preservar el Estado de derecho ante una crisis híbrida de
              atribución incierta.
            </p>
            <h3 className="mt-7 section-label">OBJETIVOS DE APRENDIZAJE</h3>
            <ul className="mt-3 space-y-3 text-sm leading-relaxed text-slate-300">
              <li>
                01 · Construir una imagen operacional común separando hechos,
                hipótesis y vacíos.
              </li>
              <li>
                02 · Priorizar amenazas simultáneas y coordinar una respuesta
                interagencial.
              </li>
              <li>
                03 · Aplicar legalidad, proporcionalidad y preservación de
                evidencia.
              </li>
              <li>
                04 · Comunicar bajo incertidumbre sin amplificar la operación
                adversaria.
              </li>
            </ul>
            <div className="mt-7 border-l-2 border-red-400 bg-red-400/10 p-4 text-sm leading-relaxed text-red-100">
              <strong>Regla principal:</strong> el ejercicio evalúa el
              razonamiento del equipo, no sólo la opción seleccionada. Debe
              registrarse el fundamento, los supuestos y el disenso.
            </div>
          </section>
          <section>
            <p className="section-label">CÉLULAS DEL COMITÉ</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {roles.map(([name, desc], i) => (
                <div key={name} className="role-card">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{name}</h3>
                    <p>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={onStart}
              className="mt-6 h-14 w-full rounded-sm bg-cyan-300 font-bold text-[#06101a] hover:bg-cyan-200"
            >
              <Shield className="h-4 w-4" />
              INICIAR RELOJ DEL EJERCICIO
            </Button>
          </section>
        </div>
      </div>
    </main>
  );
}
function Debrief({
  team,
  score,
  maxScore,
  decisions,
  notes,
  onExport,
  onReset,
}: {
  team: string;
  score: number;
  maxScore: number;
  decisions: Record<number, number>;
  notes: Record<number, string>;
  onExport: () => void;
  onReset: () => void;
}) {
  const pct = Math.round((score / maxScore) * 100);
  const grade = (pct / 10).toFixed(1);
  const maturity = getMaturity(pct);
  return (
    <main className="min-h-screen bg-[#07111b] px-5 py-8 text-slate-100 print:bg-white print:text-black">
      <div className="mx-auto max-w-5xl">
        <Image
          src="/puerto-4-0-tabletop/media/debrief.webp"
          alt="Centro de coordinación durante el análisis posterior al ejercicio"
          width={2560}
          height={1440}
          className="mb-6 aspect-[21/6] w-full border border-white/10 object-cover object-center print:hidden"
        />
        <header className="flex flex-wrap items-end gap-4 border-b border-white/10 pb-6 print:border-black">
          <div>
            <p className="section-label text-cyan-300 print:text-black">
              INFORME POST-EJERCICIO
            </p>
            <h1 className="font-display text-4xl font-bold">
              Debriefing · {team}
            </h1>
          </div>
          <div className="ml-auto text-right">
            <p
              className={`font-mono text-4xl font-bold ${maturity.className} print:text-black`}
            >
              {grade}/10
            </p>
            <p className="text-xs tracking-wider text-slate-400 print:text-black">
              NOTA DEL EQUIPO · {score}/{maxScore} PUNTOS · {pct}%
            </p>
          </div>
        </header>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Summary
            icon={<Activity />}
            label="CONDUCCIÓN"
            value={
              pct >= 80 ? "Integrada" : pct >= 55 ? "Parcial" : "Fragmentada"
            }
          />
          <Summary
            icon={<Network />}
            label="DECISIONES"
            value={`${Object.keys(decisions).length}/5 registradas`}
          />
          <Summary
            icon={<Flag />}
            label="RESULTADO"
            value={
              pct >= 80
                ? "Objetivos alcanzados"
                : pct >= 55
                  ? "Con brechas"
                  : "Revisión requerida"
            }
          />
        </div>
        <MaturityMeter percent={pct} />
        <section className="mt-8 space-y-4">
          {injects.map((item, i) =>
            item.choices ? (
              <DebriefItem
                key={i}
                number={Object.keys(decisions).filter((x) => +x <= i).length}
                item={item}
                choice={decisions[i]}
                note={notes[i]}
              />
            ) : null,
          )}
        </section>
        <section className="mt-8 grid gap-4 border border-white/10 bg-white/[.03] p-6 print:border-black">
          <h2 className="font-display text-2xl font-bold">
            Preguntas para la discusión final
          </h2>
          <ol className="grid gap-3 text-sm leading-relaxed text-slate-300 print:text-black md:grid-cols-2">
            <li>1. ¿Qué señal fue decisiva y cuál generó mayor sesgo?</li>
            <li>2. ¿Qué competencia o autoridad resultó ambigua?</li>
            <li>3. ¿Qué dependencia crítica no estaba contemplada?</li>
            <li>4. ¿Qué medida debe incorporarse al plan institucional?</li>
          </ol>
        </section>
        <div className="mt-7 flex flex-wrap gap-3 print:hidden">
          <Button
            onClick={() => window.print()}
            className="rounded-sm bg-cyan-300 font-bold text-[#06101a] hover:bg-cyan-200"
          >
            <FileText className="h-4 w-4" />
            IMPRIMIR / GUARDAR PDF
          </Button>
          <Button
            onClick={onExport}
            variant="outline"
            className="rounded-sm border-white/20 bg-transparent"
          >
            <Download className="h-4 w-4" />
            EXPORTAR EVIDENCIA JSON
          </Button>
          <Button
            onClick={onReset}
            variant="ghost"
            className="ml-auto text-slate-400"
          >
            <RefreshCcw className="h-4 w-4" />
            NUEVO EJERCICIO
          </Button>
        </div>
      </div>
    </main>
  );
}
function DebriefItem({
  number,
  item,
  choice,
  note,
}: {
  number: number;
  item: Inject;
  choice: number | undefined;
  note: string | undefined;
}) {
  const c = choice !== undefined ? item.choices?.[choice] : undefined,
    ok = (c?.points || 0) === 3,
    optimal = item.choices?.find((option) => option.points === 3);
  return (
    <article className="grid gap-4 border border-white/10 bg-[#0b1926] p-5 print:border-black print:bg-white md:grid-cols-[52px_1fr_auto]">
      <div className="font-mono text-2xl text-slate-500">
        {String(number).padStart(2, "0")}
      </div>
      <div>
        <p className="text-xs font-semibold tracking-[.14em] text-slate-500">
          {item.title.toUpperCase()}
        </p>
        <p className="mt-2 text-sm font-medium text-slate-300 print:text-black">
          {item.prompt}
        </p>
        <h3 className="mt-1 font-semibold">
          Respuesta del equipo: {c?.label || "Sin respuesta registrada"}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-400 print:text-black">
          {c?.consequence || "La decisión quedó pendiente."}
        </p>
        {!ok && optimal && (
          <div className="mt-4 border-l-2 border-emerald-400 bg-emerald-400/[.07] px-4 py-3">
            <p className="text-[10px] font-bold tracking-[.14em] text-emerald-300 print:text-black">
              CORRECCIÓN Y CURSO DE ACCIÓN RECOMENDADO
            </p>
            <p className="mt-1 text-sm font-semibold text-emerald-100 print:text-black">
              {optimal.label}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-300 print:text-black">
              {optimal.consequence}
            </p>
          </div>
        )}
        {ok && (
          <p className="mt-3 text-sm font-semibold text-emerald-300 print:text-black">
            Respuesta óptima: no requiere corrección.
          </p>
        )}
        {note && (
          <p className="mt-3 border-l-2 border-cyan-400/40 pl-3 text-sm italic text-slate-300 print:text-black">
            Fundamento: {note}
          </p>
        )}
      </div>
      <div className="flex items-start gap-2">
        {ok ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-300" />
        ) : (
          <XCircle className="h-5 w-5 text-amber-300" />
        )}
        <span className="font-mono text-sm">{c?.points || 0}/3</span>
      </div>
    </article>
  );
}
function MaturityMeter({ percent }: { percent: number }) {
  const maturity = getMaturity(percent);
  return (
    <section className="maturity-panel">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="section-label">MEDIDOR DE MADUREZ DEL EQUIPO</p>
          <h2
            className={`mt-1 font-display text-2xl font-bold ${maturity.className} print:text-black`}
          >
            Nivel {maturity.label}
          </h2>
        </div>
        <p className="font-mono text-xl font-bold">{percent}%</p>
      </div>
      <div
        className="maturity-track"
        aria-label={`Madurez ${maturity.label}: ${percent}%`}
      >
        <div className="maturity-fill" style={{ width: `${percent}%` }} />
        <span className="maturity-needle" style={{ left: `${percent}%` }} />
      </div>
      <div className="maturity-labels">
        <span>INCIPIENTE</span>
        <span>BÁSICO</span>
        <span>EN DESARROLLO</span>
        <span>AVANZADO</span>
        <span>ESTRATÉGICO</span>
      </div>
    </section>
  );
}

function MediaPanel({ item }: { item: Inject }) {
  if (item.video) {
    return (
      <div className="media-frame">
        <video
          key={item.video}
          controls
          playsInline
          preload="metadata"
          poster={item.image}
          aria-label={`Video de la inyección: ${item.title}`}
          onPlay={() => window.dispatchEvent(new Event("puerto-media-play"))}
          className="h-full w-full object-cover"
        >
          <source src={item.video} type="video/mp4" />
          Su navegador no puede reproducir este video.
        </video>
        <span className="media-label">
          EVIDENCIA AUDIOVISUAL · REPRODUCCIÓN MANUAL
        </span>
      </div>
    );
  }
  return (
    <div className="media-frame">
      <Image
        src={item.image}
        alt={`Representación visual de ${item.title}`}
        fill
        sizes="(max-width: 1024px) 100vw, 65vw"
        className="object-cover"
      />
      <span className="media-label">IMAGEN DE SITUACIÓN</span>
    </div>
  );
}

function SoundControl() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(22);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    const pauseForVideo = () => {
      audioRef.current?.pause();
      setPlaying(false);
    };
    window.addEventListener("puerto-media-play", pauseForVideo);
    return () => window.removeEventListener("puerto-media-play", pauseForVideo);
  }, []);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }

  return (
    <div className="audio-control">
      <audio
        ref={audioRef}
        src="/puerto-4-0-tabletop/media/ambiente-tension.mp3"
        loop
        preload="metadata"
      />
      <button
        onClick={toggle}
        className="audio-button"
        aria-label={
          playing ? "Pausar sonido de fondo" : "Activar sonido de fondo"
        }
      >
        {playing ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
        <span className="hidden xl:inline">
          {playing ? "PAUSAR AMBIENTE" : "ACTIVAR AMBIENTE"}
        </span>
      </button>
      <div className="hidden items-center gap-2 xl:flex">
        {volume === 0 ? (
          <VolumeX className="h-3.5 w-3.5 text-slate-500" />
        ) : (
          <Volume2 className="h-3.5 w-3.5 text-cyan-300" />
        )}
        <input
          type="range"
          min="0"
          max="55"
          value={volume}
          onChange={(event) => setVolume(Number(event.target.value))}
          aria-label="Volumen del sonido de fondo"
          className="audio-slider"
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  setValue,
  placeholder,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold tracking-wider text-slate-400">
        {label.toUpperCase()}
      </span>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-12 rounded-sm border-white/15 bg-white/[.03] text-base"
      />
    </label>
  );
}
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-[#091725] p-4">
      <strong className="font-mono text-2xl text-cyan-300">{value}</strong>
      <p className="mt-1 text-[10px] tracking-[.15em] text-slate-500">
        {label}
      </p>
    </div>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] tracking-[.14em] text-slate-500">{label}</p>
      <p className="font-mono text-sm font-bold text-slate-200">{value}</p>
    </div>
  );
}
function ControlRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-cyan-300">
      <span className="flex h-8 w-8 items-center justify-center border border-white/10">
        {icon}
      </span>
      <div>
        <p className="text-[9px] tracking-[.14em] text-slate-500">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
function Summary({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 border border-white/10 bg-white/[.03] p-4 print:border-black [&_svg]:h-5 [&_svg]:w-5 [&_svg]:text-cyan-300 print:[&_svg]:text-black">
      <span>{icon}</span>
      <div>
        <p className="text-[9px] tracking-[.14em] text-slate-500 print:text-black">
          {label}
        </p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}
