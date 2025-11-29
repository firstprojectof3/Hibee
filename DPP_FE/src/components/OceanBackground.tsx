import { useEffect, useState } from 'react';

export function OceanBackground() {
  const [bubbles, setBubbles] = useState<{ id: number; left: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    // 버블 생성
    const newBubbles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 8 + Math.random() * 4
    }));
    setBubbles(newBubbles);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none pixel-grid">
      {/* 물결 효과 레이어 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-white/20 to-transparent wave-animate" />
        <div className="absolute top-20 w-full h-32 bg-gradient-to-b from-white/15 to-transparent wave-animate" style={{ animationDelay: '2s' }} />
        <div className="absolute top-40 w-full h-32 bg-gradient-to-b from-white/10 to-transparent wave-animate" style={{ animationDelay: '4s' }} />
      </div>

      {/* 버블들 */}
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute bottom-0 w-2 h-2 bg-white/40 rounded-full"
          style={{
            left: `${bubble.left}%`,
            animation: `bubble-rise ${bubble.duration}s ease-in infinite`,
            animationDelay: `${bubble.delay}s`,
            boxShadow: '0 0 4px rgba(255,255,255,0.5)'
          }}
        />
      ))}

      {/* 산호 장식 (하단 고정) */}
      <div className="absolute bottom-0 left-0 w-full h-64 pointer-events-none">
        <div className="absolute bottom-0 left-[5%] text-6xl opacity-70 float-animate">🌿</div>
        <div className="absolute bottom-0 left-[15%] text-7xl opacity-60 float-animate" style={{ animationDelay: '1s' }}>🪸</div>
        <div className="absolute bottom-0 left-[25%] text-5xl opacity-70 float-animate" style={{ animationDelay: '2s' }}>🌿</div>
        <div className="absolute bottom-0 right-[25%] text-6xl opacity-65 float-animate" style={{ animationDelay: '1.5s' }}>🪸</div>
        <div className="absolute bottom-0 right-[15%] text-5xl opacity-70 float-animate" style={{ animationDelay: '0.5s' }}>🌿</div>
        <div className="absolute bottom-0 right-[5%] text-7xl opacity-60 float-animate" style={{ animationDelay: '2.5s' }}>🪸</div>
      </div>
    </div>
  );
}