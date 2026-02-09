import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { HeatmapCell } from '../types';
import { getDayName } from '../utils/dateUtils';

interface ActivityHeatmapProps {
  data: HeatmapCell[];
}

interface PopoverData {
  x: number;
  y: number;
  cell: HeatmapCell;
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [popover, setPopover] = useState<PopoverData | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const margin = { top: 30, right: 30, bottom: 50, left: 60 };
    const cellSize = Math.min(30, (width - margin.left - margin.right) / 24);
    const height = cellSize * 7 + margin.top + margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const maxCount = d3.max(data, d => d.count) || 1;

    const colorScale = d3.scaleSequential()
      .domain([maxCount, 0])
      .interpolator(d3.interpolateRdYlBu);

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const days = [0, 1, 2, 3, 4, 5, 6];

    g.selectAll('.hour-label')
      .data(hours.filter(h => h % 3 === 0))
      .enter()
      .append('text')
      .attr('class', 'hour-label fill-gray-600 dark:fill-gray-300 text-xs')
      .attr('x', d => d * cellSize + cellSize / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .text(d => `${d}h`);

    g.selectAll('.day-label')
      .data(days)
      .enter()
      .append('text')
      .attr('class', 'day-label fill-gray-600 dark:fill-gray-300 text-xs')
      .attr('x', -10)
      .attr('y', d => d * cellSize + cellSize / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .text(d => getDayName(d));

    g.selectAll('.cell')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', d => d.hour * cellSize)
      .attr('y', d => d.dayOfWeek * cellSize)
      .attr('width', cellSize - 2)
      .attr('height', cellSize - 2)
      .attr('rx', 3)
      .attr('fill', d => d.count === 0 ? '#f3f4f6' : colorScale(d.count))
      .style('cursor', 'pointer')
      .on('mouseenter', function() {
        d3.select(this).attr('stroke', '#000').attr('stroke-width', 2);
      })
      .on('mouseleave', function() {
        d3.select(this).attr('stroke', 'none');
      })
      .on('click', function(event, d) {
        const [px, py] = d3.pointer(event, container);
        const maxX = container.clientWidth;
        const popoverWidth = 224;
        const padding = 12;

        // Keep the popover fully visible within the container.
        const minX = popoverWidth / 2 + padding;
        const maxAllowedX = Math.max(minX, maxX - popoverWidth / 2 - padding);
        const x = Math.max(minX, Math.min(px, maxAllowedX));
        const y = Math.max(0, py + 8);

        setPopover({ x, y, cell: d });
      });

    g.selectAll('.cell-text')
      .data(data.filter(d => d.count > 0 && cellSize > 20))
      .enter()
      .append('text')
      .attr('class', 'cell-text fill-white text-xs font-medium')
      .attr('x', d => d.hour * cellSize + cellSize / 2 - 1)
      .attr('y', d => d.dayOfWeek * cellSize + cellSize / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('pointer-events', 'none')
      .text(d => d.count);

  }, [data]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md relative">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Mapa de Atividade
      </h2>
      <div ref={containerRef} className="w-full overflow-x-auto overflow-y-visible relative">
        <svg ref={svgRef} className="w-full" />
        
        {popover && (
          <div 
            className="absolute z-10 w-56 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-600"
            style={{ 
              left: popover.x, 
              top: popover.y,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-900 dark:text-white">
                {getDayName(popover.cell.dayOfWeek)} {popover.cell.hour}h
              </span>
              <button 
                onClick={() => setPopover(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-4"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {popover.cell.count} mensagens
            </p>
            {popover.cell.topUsers.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Mais ativos:
                </p>
                <ul className="text-sm">
                  {popover.cell.topUsers.map((u, i) => (
                    <li key={i} className="text-gray-700 dark:text-gray-300">
                      {u.name}: {u.count}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
