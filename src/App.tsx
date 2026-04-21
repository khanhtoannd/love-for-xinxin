import LoveCanvas from './components/LoveCanvas';
import Hyperspace from './components/Hyperspace';

export default function App() {
  return (
    <main className="relative w-full h-screen grid place-items-center isolate overflow-hidden">
      <div className="glow g1"></div>
      <div className="glow g2"></div>
      
      <Hyperspace />
      <LoveCanvas />
      
      <h1 
        className="absolute left-1/2 top-1/2 z-10 text-center font-bold text-text-main leading-[1.1] tracking-[0.06em] select-none pointer-events-none w-[min(90vw,980px)]"
        style={{
          fontFamily: '"SimSun", "STSong", "Songti SC", serif',
          fontSize: 'clamp(2.4rem, 7.3vw, 6rem)',
          textShadow: '0 0 12px rgba(255, 189, 219, 0.85), 0 0 28px rgba(255, 103, 170, 0.75), 0 0 60px rgba(255, 53, 89, 0.45)',
          animation: 'heartbeat 3.5s ease-in-out infinite'
        }}
      >
        窝好想泥，欣欣
      </h1>
    </main>
  );
}
