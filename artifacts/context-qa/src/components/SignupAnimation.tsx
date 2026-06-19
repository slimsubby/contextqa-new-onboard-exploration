import { useEffect, useRef } from "react";

const W = 600, H = 420, TOTAL_S = 14;
const PRIMARY = "#6366f1";
const EMERALD = "#34d399";
const MOUSE_R = 120;
const SVG_NS = "http://www.w3.org/2000/svg";

const easeOut = (t: number) => { const c = Math.max(0, Math.min(1, t)); return 1 - (1 - c) ** 3; };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const prog = (t: number, s: number, e: number) => clamp01((t - s) / (e - s));
const dist = (ax: number, ay: number, bx: number, by: number) => Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);

function lerpHex(a: string, b: string, t: number): string {
  const p = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  return `rgb(${[0, 1, 2].map((i) => Math.round(lerp(p(a, i), p(b, i), t))).join(",")})`;
}

function mBoost(ex: number, ey: number, mx: number, my: number, base: number): number {
  const d = dist(ex, ey, mx, my);
  return Math.min(1, base + (d < MOUSE_R ? (1 - d / MOUSE_R) * 0.35 : 0));
}

const SNIPPETS = [
  { text: "app.get('/users')", x: 44, y: 42 },
  { text: "describe('checkout',", x: 368, y: 62 },
  { text: "cy.visit('/login')", x: 108, y: 96 },
  { text: "async function auth()", x: 288, y: 132 },
  { text: "expect(res).toBe(200)", x: 26, y: 168 },
  { text: "it('should render',", x: 408, y: 186 },
  { text: "await page.click()", x: 138, y: 228 },
  { text: "test('api returns',", x: 338, y: 268 },
  { text: "const token = jwt", x: 52, y: 298 },
  { text: "beforeEach(() => {", x: 428, y: 318 },
  { text: "assert.equal(status", x: 168, y: 352 },
  { text: "cy.intercept('POST'", x: 298, y: 392 },
];

const FILE_POS = [
  { x: 52, y: 34 }, { x: 148, y: 54 }, { x: 252, y: 24 },
  { x: 378, y: 44 }, { x: 468, y: 70 }, { x: 542, y: 30 },
  { x: 80, y: 134 }, { x: 196, y: 104 }, { x: 328, y: 116 },
  { x: 490, y: 110 }, { x: 30, y: 224 }, { x: 570, y: 180 },
  { x: 100, y: 324 }, { x: 420, y: 304 }, { x: 280, y: 372 },
];

const NODES = [
  { x: 300, y: 200, r: 7 },
  { x: 210, y: 148, r: 5 },
  { x: 390, y: 148, r: 4.5 },
  { x: 198, y: 262, r: 5 },
  { x: 402, y: 262, r: 4.5 },
  { x: 148, y: 82, r: 3.5 },
  { x: 300, y: 88, r: 3 },
  { x: 452, y: 82, r: 3.5 },
  { x: 100, y: 195, r: 3 },
  { x: 500, y: 195, r: 3 },
  { x: 128, y: 322, r: 3.5 },
  { x: 300, y: 332, r: 3 },
  { x: 472, y: 322, r: 3.5 },
  { x: 198, y: 378, r: 3 },
  { x: 402, y: 378, r: 3 },
];

const EDGES: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 4],
  [1, 5], [1, 6], [1, 8],
  [2, 6], [2, 7], [2, 9],
  [3, 8], [3, 10], [3, 11],
  [4, 9], [4, 11], [4, 12],
  [5, 6], [6, 7], [8, 10],
  [9, 12], [10, 13], [12, 14],
  [11, 13], [11, 14], [13, 14],
];

const VAL_ORDER = [0, 1, 2, 3, 4, 5, 7, 9, 8, 12, 6, 10, 11, 13, 14];
const BREATHING = new Set([0, 1, 2, 3, 4, 5, 7, 10]);

export default function SignupAnimation({ skipToEnd = false }: { skipToEnd?: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const mouse = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const mk = (tag: string, a: Record<string, string | number> = {}): SVGElement => {
      const e = document.createElementNS(SVG_NS, tag) as SVGElement;
      for (const [k, v] of Object.entries(a)) e.setAttribute(k, String(v));
      return e;
    };

    const app = (parent: SVGElement | SVGSVGElement, ...children: (SVGElement | SVGSVGElement)[]) =>
      children.forEach((c) => parent.appendChild(c));

    const defs = mk("defs");
    const makeRG = (id: string, color: string, op: number) => {
      const g = mk("radialGradient", { id, cx: "50%", cy: "50%", r: "50%" });
      app(g, mk("stop", { offset: "0%", "stop-color": color, "stop-opacity": op }));
      app(g, mk("stop", { offset: "100%", "stop-color": color, "stop-opacity": 0 }));
      return g;
    };
    app(defs, makeRG("sg-bloom", PRIMARY, 0.25), makeRG("sg-scan", PRIMARY, 0.4), makeRG("sg-halo", PRIMARY, 0.1));
    app(svg, defs);

    const snippetEls = SNIPPETS.map((s) => {
      const el = mk("text", { x: s.x, y: s.y, fill: PRIMARY, "font-family": "monospace", "font-size": 11, opacity: 0 });
      app(svg, el);
      return el;
    });

    const fileGroups = FILE_POS.map((pos) => {
      const g = mk("g");
      app(g,
        mk("rect", { width: 20, height: 18, fill: "none", stroke: PRIMARY, "stroke-opacity": 0.35, "stroke-width": 1, rx: 1 }),
        mk("polygon", { points: "14,0 20,6 14,6", fill: PRIMARY, opacity: 0.2 }),
        mk("line", { x1: 4, y1: 9, x2: 16, y2: 9, stroke: PRIMARY, "stroke-opacity": 0.28, "stroke-width": 1.5 }),
        mk("line", { x1: 4, y1: 13, x2: 13, y2: 13, stroke: PRIMARY, "stroke-opacity": 0.28, "stroke-width": 1.5 }),
      );
      g.setAttribute("opacity", "0");
      g.setAttribute("transform", `translate(${pos.x},${pos.y})`);
      app(svg, g);
      return g;
    });

    const bloom = mk("circle", { cx: 300, cy: 200, r: 200, fill: "url(#sg-bloom)", opacity: 0 });
    app(svg, bloom);

    type EL = { el: SVGElement; ax: number; ay: number; bx: number; by: number };
    const edgeEls: EL[] = EDGES.map(([a, b]) => {
      const na = NODES[a], nb = NODES[b];
      const el = mk("line", { x1: na.x, y1: na.y, x2: na.x, y2: na.y, stroke: PRIMARY, "stroke-opacity": 0.25, "stroke-width": 1, opacity: 0 });
      app(svg, el);
      return { el, ax: na.x, ay: na.y, bx: nb.x, by: nb.y };
    });

    type NE = { circle: SVGElement; ring: SVGElement; breathRing: SVGElement; check: SVGElement; permRing: SVGElement | null };
    const nodeEls: NE[] = NODES.map((n, i) => {
      const ck = n.r / 7;
      const breathRing = mk("circle", { cx: n.x, cy: n.y, r: n.r + 6, fill: "none", stroke: EMERALD, "stroke-width": 1, opacity: 0 });
      const ring = mk("circle", { cx: n.x, cy: n.y, r: n.r + 4, fill: "none", stroke: EMERALD, "stroke-width": 1.5, opacity: 0 });
      const circle = mk("circle", { cx: n.x, cy: n.y, r: 2, fill: PRIMARY, opacity: 0 });
      const check = mk("path", {
        d: `M${n.x - 3 * ck},${n.y} L${n.x - 0.5 * ck},${n.y + 2.5 * ck} L${n.x + 3.5 * ck},${n.y - 2.5 * ck}`,
        fill: "none", stroke: "white", "stroke-width": 1.5,
        "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0,
      });
      let permRing: SVGElement | null = null;
      if (i === 0) {
        permRing = mk("circle", { cx: n.x, cy: n.y, r: n.r + 12, fill: "none", stroke: EMERALD, "stroke-width": 1.5, opacity: 0 });
        app(svg, permRing);
      }
      app(svg, breathRing, ring, circle, check);
      return { circle, ring, breathRing, check, permRing };
    });

    const scanner = mk("rect", { x: -60, y: 0, width: 60, height: H, fill: "url(#sg-scan)", opacity: 0 });
    app(svg, scanner);

    const halo = mk("circle", { cx: -999, cy: -999, r: 120, fill: "url(#sg-halo)", opacity: 0 });
    (halo as HTMLElement).style.filter = "blur(30px)";
    app(svg, halo);

    const onMove = (e: MouseEvent) => {
      const r = (svg as SVGSVGElement).getBoundingClientRect();
      mouse.current = { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
    };
    const onLeave = () => { mouse.current = { x: -999, y: -999 }; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    let start = -1, raf = 0;

    const tick = (now: number) => {
      if (start < 0) start = skipToEnd ? now - TOTAL_S * 1000 : now;
      const t = Math.min((now - start) / 1000, TOTAL_S);
      const { x: mx, y: my } = mouse.current;

      halo.setAttribute("cx", String(mx));
      halo.setAttribute("cy", String(my));
      halo.setAttribute("opacity", mx < -900 ? "0" : "1");

      const fade1 = easeOut(prog(t, 2.7, 3.5));
      SNIPPETS.forEach((s, i) => {
        const st = i * 0.2;
        const lp = prog(t, st, st + 0.9);
        const chars = Math.floor(easeOut(lp) * s.text.length);
        const cursor = lp > 0 && lp < 1 ? (Math.floor(t / 0.3) % 2 === 0 ? "|" : "") : "";
        const base = t >= st ? clamp01(1 - fade1) : 0;
        snippetEls[i].setAttribute("opacity", String(mBoost(s.x, s.y, mx, my, base)));
        (snippetEls[i] as SVGTextElement).textContent = s.text.slice(0, chars) + cursor;
      });

      const fadeOut2 = easeOut(prog(t, 5.0, 5.5));
      FILE_POS.forEach((pos, i) => {
        const st = 2.5 + i * 0.15;
        const lp = easeOut(prog(t, st, st + 0.5));
        const scale = lerp(1.3, 1.0, lp);
        const base = t >= st ? clamp01(1 - fadeOut2) : 0;
        const cx = lerp(pos.x, 290, fadeOut2 * 0.25);
        const cy = lerp(pos.y, 191, fadeOut2 * 0.25);
        fileGroups[i].setAttribute("opacity", String(mBoost(cx + 10, cy + 9, mx, my, base)));
        fileGroups[i].setAttribute("transform", `translate(${cx},${cy}) scale(${scale})`);
      });

      bloom.setAttribute("opacity", String(easeOut(prog(t, 5, 6.5))));

      NODES.forEach((n, i) => {
        const st = 5 + i * 0.15;
        const p = easeOut(prog(t, st, st + 1));
        const fp = FILE_POS[i];
        const cx = lerp(fp.x + 10, n.x, p);
        const cy = lerp(fp.y + 9, n.y, p);
        const ne = nodeEls[i];
        ne.circle.setAttribute("cx", String(cx));
        ne.circle.setAttribute("cy", String(cy));
        ne.circle.setAttribute("r", String(lerp(2, n.r, p)));
        ne.circle.setAttribute("opacity", String(p > 0 ? mBoost(cx, cy, mx, my, p) : 0));
      });

      edgeEls.forEach(({ el, ax, ay, bx, by }, i) => {
        const st = 6.5 + i * 0.12;
        const p = easeOut(prog(t, st, st + 0.8));
        if (p > 0) {
          el.setAttribute("opacity", "1");
          el.setAttribute("x2", String(lerp(ax, bx, p)));
          el.setAttribute("y2", String(lerp(ay, by, p)));
          const midX = (ax + bx) / 2, midY = (ay + by) / 2;
          const d = dist(midX, midY, mx, my);
          el.setAttribute("stroke-opacity", String(Math.min(1, 0.25 + (d < MOUSE_R ? (1 - d / MOUSE_R) * 0.35 : 0))));
        }
      });

      const scanP = prog(t, 9, 11.5);
      if (scanP > 0 && scanP < 1) {
        scanner.setAttribute("x", String(lerp(-60, 660, easeOut(scanP))));
        scanner.setAttribute("opacity", "1");
      } else if (scanP >= 1) {
        scanner.setAttribute("opacity", "0");
      }

      VAL_ORDER.forEach((ni, order) => {
        const vs = 9 + order * 0.28;
        const vp = prog(t, vs, vs + 0.6);
        const ne = nodeEls[ni];
        const nd = NODES[ni];

        if (vp > 0) {
          ne.circle.setAttribute("fill", lerpHex(PRIMARY, EMERALD, easeOut(vp)));
          const ckp = easeOut(prog(t, vs + 0.2, vs + 0.6));
          if (ckp > 0) ne.check.setAttribute("opacity", String(ckp));

          const rp = prog(t, vs, vs + 0.8);
          if (rp < 1) {
            ne.ring.setAttribute("r", String(lerp(nd.r + 4, nd.r + 16, rp)));
            ne.ring.setAttribute("opacity", String((1 - rp) * 0.8));
          } else {
            ne.ring.setAttribute("opacity", "0");
          }

          if (ni === 0 && ne.permRing && vp >= 1) {
            ne.permRing.setAttribute("opacity", "0.55");
          }
        }

        if (BREATHING.has(ni) && t > vs + 0.6) {
          const bp = (Math.sin((t - vs - 0.6) * 1.5) + 1) / 2;
          ne.breathRing.setAttribute("r", String(nd.r + 6 + bp * 4));
          ne.breathRing.setAttribute("opacity", String(0.1 + bp * 0.2));
        }
      });

      if (t < TOTAL_S) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
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
