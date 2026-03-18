import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

const PARTICLE_COLORS = [
  'rgba(249,115,22,0.5)',
  'rgba(249,115,22,0.3)',
  'rgba(168,85,247,0.5)',
  'rgba(168,85,247,0.3)',
  'rgba(251,146,60,0.4)',
  'rgba(196,120,255,0.4)',
];

export default function Background3D() {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 200 - 100,
      size: Math.random() * 4 + 2,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      duration: Math.random() * 5 + 4,
      delay: Math.random() * 4,
    }));
  }, []);

  const orbs = useMemo(() => [
    { x: '-10%', y: '5%', width: 500, color: 'rgba(249,115,22,0.12)', duration: 12, delay: 0 },
    { x: '60%', y: '50%', width: 600, color: 'rgba(168,85,247,0.10)', duration: 15, delay: 3 },
    { x: '20%', y: '70%', width: 400, color: 'rgba(59,130,246,0.08)', duration: 10, delay: 6 },
    { x: '75%', y: '-5%', width: 350, color: 'rgba(236,72,153,0.07)', duration: 18, delay: 2 },
  ], []);

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {/* Deep gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #1a0f3e 0%, #0a0518 60%, #050210 100%)',
        }}
      />

      {/* Perspective grid floor */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '45%',
          transformOrigin: 'bottom center',
          transform: 'perspective(600px) rotateX(55deg)',
          backgroundImage: `
            linear-gradient(rgba(249,115,22,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249,115,22,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.9) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.9) 100%)',
        }}
      />

      {/* Ambient orbs */}
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.width,
            height: orb.width,
            background: orb.color,
            filter: 'blur(80px)',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 30, 0],
            scale: [1, 1.08, 0.95, 1],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
          animate={{
            y: [0, -16, 0],
            opacity: [0.4, 1, 0.4],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Top vignette */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: '200px',
          background: 'linear-gradient(to bottom, rgba(10,5,24,0.9) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}
