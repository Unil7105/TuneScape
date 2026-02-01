
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface VisualizerProps {
  isPlaying: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const Visualizer: React.FC<VisualizerProps> = ({ isPlaying, audioRef }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!audioRef.current || !svgRef.current) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContext.createMediaElementSource(audioRef.current);
    const analyzer = audioContext.createAnalyser();

    source.connect(analyzer);
    analyzer.connect(audioContext.destination);

    analyzer.fftSize = 64;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyzerRef.current = analyzer;
    dataArrayRef.current = dataArray;

    const svg = d3.select(svgRef.current);
    const width = 100;
    const height = 40;
    const barWidth = width / bufferLength;

    const draw = () => {
      if (!analyzerRef.current || !dataArrayRef.current) return;

      analyzerRef.current.getByteFrequencyData(dataArrayRef.current);

      svg.selectAll('rect')
        .data(Array.from(dataArrayRef.current))
        .join('rect')
        .attr('x', (d, i) => i * barWidth)
        .attr('y', d => height - (d / 255) * height)
        .attr('width', barWidth - 1)
        .attr('height', d => (d / 255) * height)
        .attr('fill', '#6366f1')
        .attr('rx', 2);

      animationRef.current = requestAnimationFrame(draw);
    };

    if (isPlaying) {
      draw();
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
      audioContext.close();
    };
  }, [isPlaying, audioRef]);

  return (
    <div className="w-full h-10 overflow-hidden flex items-center justify-center">
      <svg ref={svgRef} width="100" height="40" className="opacity-60" />

    </div>
  );
};

export default Visualizer;
