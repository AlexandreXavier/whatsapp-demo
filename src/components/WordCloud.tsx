import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import type { WordFrequency } from '../types';

interface WordCloudProps {
  data: WordFrequency[];
}

export function WordCloud({ data }: WordCloudProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 400;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

    const layout = cloud<WordFrequency>()
      .size([width, height])
      .words(data.map(d => ({ ...d })))
      .padding(5)
      .rotate(() => (Math.random() > 0.5 ? 0 : 90))
      .font('system-ui')
      .fontSize(d => d.size)
      .on('end', draw);

    layout.start();

    function draw(words: cloud.Word[]) {
      const g = svg.append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);

      g.selectAll('text')
        .data(words)
        .enter()
        .append('text')
        .style('font-size', d => `${d.size}px`)
        .style('font-family', 'system-ui')
        .style('fill', (_, i) => colorScale(String(i)))
        .attr('text-anchor', 'middle')
        .attr('transform', d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
        .text(d => d.text || '');
    }
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Nuvem de Palavras
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          Sem palavras suficientes para exibir
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Nuvem de Palavras
      </h2>
      <div ref={containerRef} className="w-full">
        <svg ref={svgRef} className="w-full" />
      </div>
    </div>
  );
}
