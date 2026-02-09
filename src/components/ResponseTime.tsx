import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { ResponseTimeData } from '../types';
import { useFilter } from '../context/FilterContext';
import { formatTime } from '../utils/dateUtils';

interface ResponseTimeProps {
  data: ResponseTimeData[];
}

export function ResponseTime({ data }: ResponseTimeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toggleUser, selectedUsers } = useFilter();

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const barHeight = 30;
    const margin = { top: 20, right: 80, bottom: 40, left: 150 };
    const height = Math.max(300, data.length * barHeight + margin.top + margin.bottom);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const maxTime = d3.max(data, d => d.avgTime) || 0;

    const xScale = d3.scaleLinear()
      .domain([0, maxTime * 1.1])
      .range([0, chartWidth]);

    const yScale = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, chartHeight])
      .padding(0.3);

    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => formatTime(d as number)))
      .selectAll('text')
      .attr('class', 'fill-gray-600 dark:fill-gray-300');

    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .attr('class', 'fill-gray-600 dark:fill-gray-300 text-sm')
      .style('cursor', 'pointer')
      .on('click', (_, name) => toggleUser(name as string));

    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => yScale(d.name)!)
      .attr('width', d => xScale(d.avgTime))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => d.color)
      .attr('opacity', d => selectedUsers.length === 0 || selectedUsers.includes(d.name) ? 1 : 0.3)
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .on('click', (_, d) => toggleUser(d.name));

    g.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label fill-gray-700 dark:fill-gray-300 text-xs')
      .attr('x', d => xScale(d.avgTime) + 5)
      .attr('y', d => yScale(d.name)! + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .text(d => formatTime(d.avgTime));

  }, [data, selectedUsers, toggleUser]);

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Tempo Médio de Resposta
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          Sem dados de tempo de resposta
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Tempo Médio de Resposta
      </h2>
      <div ref={containerRef} className="w-full overflow-x-auto">
        <svg ref={svgRef} className="w-full" />
      </div>
    </div>
  );
}
