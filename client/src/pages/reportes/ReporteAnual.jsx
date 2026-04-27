import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";

const MONTH_OPTIONS = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

export default function ReporteAnual() {
  const [modoPeriodo, setModoPeriodo] = useState("mensual");
  const [mes, setMes] = useState("01");
  const [anio, setAnio] = useState(String(new Date().getFullYear()));

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, index) => String(currentYear - index));
  }, []);

  const monthlyChartData = [
    { periodo: "Ene", beneficiarios: 120, servicios: 190 },
    { periodo: "Feb", beneficiarios: 135, servicios: 210 },
    { periodo: "Mar", beneficiarios: 148, servicios: 232 },
    { periodo: "Abr", beneficiarios: 142, servicios: 225 },
    { periodo: "May", beneficiarios: 166, servicios: 251 },
    { periodo: "Jun", beneficiarios: 174, servicios: 270 },
  ];

  const yearlyChartData = [
    { periodo: "2021", beneficiarios: 1200, servicios: 1890 },
    { periodo: "2022", beneficiarios: 1370, servicios: 2050 },
    { periodo: "2023", beneficiarios: 1480, servicios: 2210 },
    { periodo: "2024", beneficiarios: 1650, servicios: 2480 },
    { periodo: "2025", beneficiarios: 1730, servicios: 2660 },
  ];

  const chartConfig = {
    beneficiarios: {
      label: "Beneficiarios",
      color: "#2563eb",
    },
    servicios: {
      label: "Servicios",
      color: "#0f766e",
    },
  };

  return (
    <article className="reporte-placeholder reporte-general-card">
      <div className="reporte-card-head">
        <h2>Reporte por Período</h2>
        <span className="reporte-card-badge">Mensual / Anual</span>
      </div>

      <div className="reporte-periodo-switch" role="tablist" aria-label="Modo de periodo">
        <button
          type="button"
          className={modoPeriodo === "mensual" ? "is-active" : ""}
          onClick={() => setModoPeriodo("mensual")}
        >
          Mensual
        </button>
        <button
          type="button"
          className={modoPeriodo === "anual" ? "is-active" : ""}
          onClick={() => setModoPeriodo("anual")}
        >
          Anual
        </button>
      </div>

      <div className="reporte-periodo-filtros">
        {modoPeriodo === "mensual" ? (
          <>
            <label>
              Mes
              <select value={mes} onChange={(e) => setMes(e.target.value)}>
                {MONTH_OPTIONS.map((monthOption) => (
                  <option key={monthOption.value} value={monthOption.value}>
                    {monthOption.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Año
              <select value={anio} onChange={(e) => setAnio(e.target.value)}>
                {yearOptions.map((yearOption) => (
                  <option key={yearOption} value={yearOption}>
                    {yearOption}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : (
          <label>
            Año
            <select value={anio} onChange={(e) => setAnio(e.target.value)}>
              {yearOptions.map((yearOption) => (
                <option key={yearOption} value={yearOption}>
                  {yearOption}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <p className="reporte-periodo-hint">
        Usa esta sección para alternar entre vista mensual y anual del mismo reporte.
      </p>

      <div className="reporte-chart-grid">
        <Card>
          <CardHeader>
            <CardTitle>
              {modoPeriodo === "mensual" ? "Comparativo mensual" : "Comparativo anual"}
            </CardTitle>
            <CardDescription>
              Demo estilo shadcn/chart para validar visualización en reportes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {modoPeriodo === "mensual" ? (
              <ChartContainer config={chartConfig}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="periodo" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="beneficiarios"
                    name="Beneficiarios"
                    fill="var(--color-beneficiarios)"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="servicios"
                    name="Servicios"
                    fill="var(--color-servicios)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <ChartContainer config={chartConfig}>
                <LineChart data={yearlyChartData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="periodo" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="beneficiarios"
                    name="Beneficiarios"
                    stroke="var(--color-beneficiarios)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="servicios"
                    name="Servicios"
                    stroke="var(--color-servicios)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
          <CardFooter>
            Demo visual. Luego conectamos esta misma estructura al endpoint real.
          </CardFooter>
        </Card>
      </div>
    </article>
  );
}
