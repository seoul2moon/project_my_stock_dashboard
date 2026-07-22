import { FEAR_GREED_SEGMENTS } from "@/lib/fear-greed";

const CX = 100;
const CY = 100;
const R = 80;

function scoreToAngle(score: number) {
  const clamped = Math.max(0, Math.min(100, score));
  return 180 - (clamped / 100) * 180;
}

function polarToCartesian(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CX + radius * Math.cos(rad),
    y: CY - radius * Math.sin(rad),
  };
}

function describeArc(startAngle: number, endAngle: number) {
  const start = polarToCartesian(startAngle, R);
  const end = polarToCartesian(endAngle, R);
  const largeArcFlag = Math.abs(startAngle - endAngle) <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${R} ${R} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

export function FearGreedGauge({ score }: { score: number }) {
  const needleAngle = scoreToAngle(score);
  const needleTip = polarToCartesian(needleAngle, R - 16);

  return (
    <svg viewBox="0 0 200 108" className="w-full">
      {FEAR_GREED_SEGMENTS.map((seg) => (
        <path
          key={seg.rating}
          d={describeArc(scoreToAngle(seg.from), scoreToAngle(seg.to))}
          fill="none"
          stroke={
            {
              "extreme fear": "#dc2626",
              fear: "#f97316",
              neutral: "#eab308",
              greed: "#65a30d",
              "extreme greed": "#16a34a",
            }[seg.rating]
          }
          strokeWidth={14}
          strokeLinecap="butt"
        />
      ))}
      <line
        x1={CX}
        y1={CY}
        x2={needleTip.x}
        y2={needleTip.y}
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle cx={CX} cy={CY} r={5} fill="currentColor" />
    </svg>
  );
}
