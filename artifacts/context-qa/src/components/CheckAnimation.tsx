import { useEffect, useRef } from "react";

const W = 600, H = 420;
const SVG_NS = "http://www.w3.org/2000/svg";

const CHECKS = [
  { x: 48,  y: 38,  s: 22, op: 0.18, delay: 0.0 },
  { x: 142, y: 72,  s: 16, op: 0.12, delay: 0.4 },
  { x: 258, y: 28,  s: 28, op: 0.22, delay: 0.8 },
  { x: 390, y: 55,  s: 18, op: 0.14, delay: 0.2 },
  { x: 498, y: 38,  s: 24, op: 0.20, delay: 1.1 },
  { x: 558, y: 90,  s: 14, op: 0.10, delay: 0.6 },
  { x: 74,  y: 138, s: 18, op: 0.15, delay: 1.4 },
  { x: 188, y: 108, s: 26, op: 0.20, delay: 0.3 },
  { x: 318, y: 118, s: 14, op: 0.11, delay: 0.9 },
  { x: 468, y: 112, s: 20, op: 0.16, delay: 1.7 },
  { x: 28,  y: 218, s: 24, op: 0.18, delay: 0.7 },
  { x: 562, y: 182, s: 16, op: 0.13, delay: 0.1 },
  { x: 130, y: 268, s: 20, op: 0.17, delay: 1.2 },
  { x: 272, y: 248, s: 14, op: 0.10, delay: 0.5 },
  { x: 412, y: 242, s: 26, op: 0.21, delay: 1.6 },
  { x: 538, y: 272, s: 18, op: 0.14, delay: 0.8 },
  { x: 64,  y: 328, s: 16, op: 0.12, delay: 1.0 },
  { x: 198, y: 358, s: 22, op: 0.19, delay: 0.3 },
  { x: 348, y: 342, s: 14, op: 0.11, delay: 1.5 },
  { x: 468, y: 368, s: 20, op: 0.16, delay: 0.6 },
  { x: 560, y: 348, s: 24, op: 0.18, delay: 1.3 },
  { x: 88,  y: 398, s: 16, op: 0.12, delay: 0.9 },
  { x: 296, y: 402, s: 18, op: 0.14, delay: 0.2 },
  { x: 448, y: 408, s: 14, op: 0.10, delay: 1.8 },
];

export default function CheckAnimation() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const mk = (tag: string, a: Record<string, string | number> = {}) => {
      const el = document.createElementNS(SVG_NS, tag) as SVGElement;
      for (const [k, v] of Object.entries(a)) el.setAttribute(k, String(v));
      return el;
    };

    const defs = mk("defs");
    const style = mk("style");
    (style as SVGElement & { textContent: string }).textContent = `
      @keyframes ck-in {
        0%   { opacity: 0; transform: scale(0.6); }
        60%  { opacity: 1; transform: scale(1.08); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes ck-breathe {
        0%, 100% { transform: scale(1);    opacity: 1; }
        50%       { transform: scale(1.06); opacity: 0.75; }
      }
      .ck-box {
        animation: ck-in 0.7s cubic-bezier(.34,1.56,.64,1) forwards,
                   ck-breathe 3s ease-in-out infinite;
        opacity: 0;
      }
    `;
    defs.appendChild(style);
    svg.appendChild(defs);

    CHECKS.forEach((c) => {
      const r = c.s / 2;
      const g = mk("g");
      g.setAttribute("class", "ck-box");
      g.setAttribute("transform", `translate(${c.x - r},${c.y - r})`);
      (g as SVGElement & { style: CSSStyleDeclaration }).style.animationDelay = `${c.delay}s`;
      (g as SVGElement & { style: CSSStyleDeclaration }).style.opacity = "0";
      (g as SVGElement & { style: CSSStyleDeclaration }).style.transformOrigin = `${r}px ${r}px`;

      const rect = mk("rect", {
        width: c.s, height: c.s, rx: c.s * 0.22,
        fill: "none",
        stroke: "#6366f1",
        "stroke-width": 1.8,
        opacity: c.op * 5,
      });

      const pad = c.s * 0.2;
      const ck = mk("path", {
        d: `M${pad},${c.s * 0.52} L${c.s * 0.42},${c.s - pad} L${c.s - pad},${pad}`,
        fill: "none",
        stroke: "#6366f1",
        "stroke-width": 1.8,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        opacity: c.op * 5,
      });

      g.appendChild(rect);
      g.appendChild(ck);
      svg.appendChild(g);
    });

    return () => {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
    />
  );
}
