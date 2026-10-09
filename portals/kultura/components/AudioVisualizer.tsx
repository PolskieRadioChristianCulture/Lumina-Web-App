
import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioRef, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const initAudio = async () => {
      try {
        if (!contextRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          contextRef.current = new AudioContextClass();
          analyserRef.current = contextRef.current.createAnalyser();
          analyserRef.current.fftSize = 128; 
          
          // MediaElementAudioSourceNode może być utworzony tylko raz dla danego elementu
          if (!sourceRef.current) {
            sourceRef.current = contextRef.current.createMediaElementSource(audio);
          }
          
          sourceRef.current.connect(analyserRef.current);
          analyserRef.current.connect(contextRef.current.destination);
        }

        if (isPlaying && contextRef.current.state === 'suspended') {
          await contextRef.current.resume();
        }
      } catch (err) {
        console.warn("[Visualizer] Błąd inicjalizacji:", err);
      }
    };

    if (isPlaying) {
      initAudio();
    }

    if (!isPlaying && contextRef.current && contextRef.current.state === 'running') {
      contextRef.current.suspend().catch(() => {});
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !analyserRef.current || !isPlaying) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isPlaying) return;
      animationRef.current = requestAnimationFrame(draw);
      analyserRef.current!.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / (bufferLength * 2)) * 1.5;
      const centerX = canvas.width / 2;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.7;

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, '#C5A059');
        gradient.addColorStop(0.5, '#ef4444');
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');

        ctx.fillStyle = gradient;
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(239, 68, 68, 0.4)';

        ctx.fillRect(centerX + (i * barWidth), canvas.height - barHeight, barWidth - 4, barHeight);
        ctx.fillRect(centerX - (i * barWidth) - barWidth, canvas.height - barHeight, barWidth - 4, barHeight);
      }
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, audioRef]);

  // Clean up AudioContext ONLY on component unmount
  useEffect(() => {
    return () => {
      if (contextRef.current) {
        contextRef.current.close().catch(() => {});
        contextRef.current = null;
        analyserRef.current = null;
        sourceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full pointer-events-none opacity-30 z-10"
      style={{ filter: 'blur(35px)' }} 
    />
  );
};
