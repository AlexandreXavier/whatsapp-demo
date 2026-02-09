import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { UserStats } from '../types';
import { useFilter } from '../context/FilterContext';
import { getUserColor } from '../utils/colorScale';

interface TopContributorsProps {
  data: UserStats[];
}

export function TopContributors({ data }: TopContributorsProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toggleUser, selectedUsers } = useFilter();

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const barHeight = 35;
    const margin = { top: 20, right: 120, bottom: 40, left: 150 };
    const height = Math.max(400, data.length * barHeight + margin.top + margin.bottom);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const maxValue = d3.max(data, d => Math.max(d.messageCount, d.repliesReceived)) || 0;

    const xScale = d3.scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([0, chartWidth]);

    const yScale = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, chartHeight])
      .padding(0.3);

    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .selectAll('text')
      .attr('class', 'fill-gray-600 dark:fill-gray-300');

    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .attr('class', 'fill-gray-600 dark:fill-gray-300 text-sm')
      .style('cursor', 'pointer')
      .on('click', (_, name) => toggleUser(name as string));

    const barGroup = g.selectAll('.bar-group')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bar-group')
      .attr('transform', d => `translate(0,${yScale(d.name)})`);

    barGroup.append('rect')
      .attr('class', 'sent-bar')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', d => xScale(d.messageCount))
      .attr('height', yScale.bandwidth() / 2)
      .attr('fill', d => getUserColor(d.name))
      .attr('opacity', d => selectedUsers.length === 0 || selectedUsers.includes(d.name) ? 1 : 0.3)
      .style('cursor', 'pointer')
      .on('click', (_, d) => toggleUser(d.name));

    barGroup.append('rect')
      .attr('class', 'received-bar')
      .attr('x', 0)
      .attr('y', yScale.bandwidth() / 2)
      .attr('width', d => xScale(d.repliesReceived))
      .attr('height', yScale.bandwidth() / 2)
      .attr('fill', d => getUserColor(d.name))
      .attr('opacity', d => selectedUsers.length === 0 || selectedUsers.includes(d.name) ? 0.5 : 0.15)
      .style('cursor', 'pointer')
      .on('click', (_, d) => toggleUser(d.name));

    barGroup.append('text')
      .attr('x', d => xScale(d.messageCount) + 5)
      .attr('y', yScale.bandwidth() / 4)
      .attr('dy', '0.35em')
      .attr('class', 'fill-gray-700 dark:fill-gray-300 text-xs')
      .text(d => d.messageCount);

    barGroup.append('text')
      .attr('x', d => xScale(d.repliesReceived) + 5)
      .attr('y', yScale.bandwidth() * 3 / 4)
      .attr('dy', '0.35em')
      .attr('class', 'fill-gray-500 dark:fill-gray-400 text-xs')
      .text(d => d.repliesReceived);

    const legend = svg.append('g')
      .attr('transform', `translate(${width - margin.right + 10}, ${margin.top})`);

    legend.append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', '#4e79a7');

    legend.append('text')
      .attr('x', 18)
      .attr('y', 10)
      .attr('class', 'fill-gray-600 dark:fill-gray-300 text-xs')
      .text('Enviadas');

    legend.append('rect')
      .attr('y', 20)
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', '#4e79a7')
      .attr('opacity', 0.5);

    legend.append('text')
      .attr('x', 18)
      .attr('y', 30)
      .attr('class', 'fill-gray-600 dark:fill-gray-300 text-xs')
      .text('Recebidas');

  }, [data, selectedUsers, toggleUser]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Principais Contribuidores
      </h2>
      <div ref={containerRef} className="w-full overflow-x-auto">
        <svg ref={svgRef} className="w-full" />
      </div>
    </div>
  );
}
