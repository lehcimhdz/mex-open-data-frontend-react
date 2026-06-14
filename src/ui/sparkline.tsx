type SparklineProps = {
  values: number[];
  width?: number;
  height?: number;
  stroke?: string;
  showDot?: boolean;
  ariaLabel?: string;
};

export function Sparkline({
  values,
  width = 80,
  height = 24,
  stroke = "var(--color-accent-600)",
  showDot = true,
  ariaLabel,
}: SparklineProps) {
  if (!values.length) {
    return <svg width={width} height={height} role="presentation" />;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = values.length > 1 ? width / (values.length - 1) : 0;
  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * height;
    return [x, y] as const;
  });
  const d = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const last = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role={ariaLabel ? "img" : "presentation"}
      aria-label={ariaLabel}
    >
      <path d={d} fill="none" stroke={stroke} strokeWidth={1.4} />
      {showDot ? (
        <circle cx={last[0]} cy={last[1]} r={2} fill={stroke} />
      ) : null}
    </svg>
  );
}
