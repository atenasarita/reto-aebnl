import { createContext, useContext, useMemo } from "react";
import { Legend, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "../../lib/utils";
import "./shadcn-ui.css";

const ChartContext = createContext({ config: {} });

function useChart() {
  return useContext(ChartContext);
}

export function ChartContainer({ config, className, children }) {
  const inlineVars = useMemo(() => {
    const style = {};
    Object.entries(config ?? {}).forEach(([key, value]) => {
      if (value?.color) {
        style[`--color-${key}`] = value.color;
      }
    });
    return style;
  }, [config]);

  return (
    <ChartContext.Provider value={{ config: config ?? {} }}>
      <div className={cn("shadcn-chart-container", className)} style={inlineVars}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export function ChartTooltip(props) {
  return <Tooltip {...props} />;
}

export function ChartTooltipContent({ active, payload, label, hideLabel = false }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="shadcn-chart-tooltip">
      {!hideLabel && <p className="shadcn-chart-tooltip-label">{label}</p>}
      <ul className="shadcn-chart-tooltip-list">
        {payload.map((entry) => (
          <li className="shadcn-chart-tooltip-item" key={entry.dataKey}>
            <span>{entry.name}</span>
            <strong>{entry.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ChartLegend(props) {
  return <Legend {...props} />;
}

export function ChartLegendContent({ payload }) {
  const { config } = useChart();
  if (!payload?.length) return null;

  return (
    <div className="shadcn-chart-legend">
      {payload.map((entry) => {
        const key = entry.dataKey;
        const itemConfig = config[key] ?? {};
        const color = entry.color || itemConfig.color || "#64748b";
        return (
          <span key={key} className="shadcn-chart-legend-item">
            <span className="shadcn-chart-legend-dot" style={{ backgroundColor: color }} />
            {itemConfig.label || entry.value}
          </span>
        );
      })}
    </div>
  );
}
