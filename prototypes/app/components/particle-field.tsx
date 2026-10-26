"use client";

import { useEffect, useRef, useState } from "react";

// A canvas draws the moving points directly. No video download or animation package.
export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let width = 0;
    let height = 0;
    let phase = 0;
    let previousTime = 0;
    const points = Array.from({ length: 720 }, (_, index) => {
      const y = 1 - (index / 719) * 2;
      const radius = Math.sqrt(1 - y * y);
      const angle = index * Math.PI * (3 - Math.sqrt(5));
      return { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius };
    });

    function draw(time: number) {
      if (!canvas || !context) return;
      const moving = !paused && !reducedMotion.matches && !document.hidden;
      const delta = previousTime ? Math.min(time - previousTime, 40) : 0;
      previousTime = time;
      if (moving) phase += delta * 0.00007;
      context.clearRect(0, 0, width, height);
      const mobile = width < 760;
      const centerX = width * (mobile ? 0.5 : 0.75);
      const centerY = height * (mobile ? 0.75 : 0.49);
      const radius = mobile ? width * 0.52 : Math.min(height * 0.49, width * 0.29);
      const glow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.4);
      glow.addColorStop(0, "rgba(27, 110, 168, .14)");
      glow.addColorStop(1, "rgba(6, 19, 39, 0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
      const projected = points.map((point) => {
        const x = point.x * Math.cos(phase) - point.z * Math.sin(phase);
        const z = point.x * Math.sin(phase) + point.z * Math.cos(phase);
        return { x: centerX + x * radius, y: centerY + (point.y * 0.96 + z * 0.12) * radius, z };
      });
      context.lineWidth = 0.6;
      projected.forEach((point, index) => {
        const alpha = 0.2 + ((point.z + 1) / 2) * 0.65;
        context.fillStyle = `rgba(116, 213, 255, ${alpha})`;
        context.beginPath();
        context.arc(point.x, point.y, point.z > 0.65 ? 1.8 : 1, 0, Math.PI * 2);
        context.fill();
        const neighbor = projected[index + 21];
        if (neighbor && point.z > 0.2 && neighbor.z > 0.2 && Math.hypot(point.x - neighbor.x, point.y - neighbor.y) < radius * 0.3) {
          context.strokeStyle = "rgba(83, 171, 224, .12)";
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(neighbor.x, neighbor.y);
          context.stroke();
        }
      });
      // Loose particles provide depth around the connected globe.
      for (let index = 0; index < 65; index++) {
        const x = ((Math.sin(index * 127.1) + 1) / 2) * width;
        const y = (((Math.cos(index * 73.7) + 1) / 2) * height + Math.sin(phase + index) * 12);
        context.fillStyle = `rgba(137, 210, 255, ${0.12 + (index % 4) * 0.06})`;
        context.fillRect(x, y, index % 5 === 0 ? 2 : 1, index % 5 === 0 ? 2 : 1);
      }
      if (!paused && !reducedMotion.matches) frame = window.requestAnimationFrame(draw);
    }

    function resize() {
      if (!canvas || !context) return;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * scale;
      canvas.height = height * scale;
      context.setTransform(scale, 0, 0, scale, 0, 0);
      window.cancelAnimationFrame(frame);
      previousTime = 0;
      draw(0);
    }
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    reducedMotion.addEventListener("change", resize);
    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", resize);
      window.cancelAnimationFrame(frame);
    };
  }, [paused]);

  return <><canvas ref={canvasRef} className="particle-canvas" aria-hidden="true" /><button className="motion-toggle" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? "Play motion" : "Pause motion"}<span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span></button></>;
}
