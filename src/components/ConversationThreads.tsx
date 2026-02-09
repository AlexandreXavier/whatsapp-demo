import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import type { ThreadFlow } from '../types';
import { useFilter } from '../context/FilterContext';
import { getUserColor } from '../utils/colorScale';

 const SOURCE_SUFFIX = '__src';
 const TARGET_SUFFIX = '__tgt';

 function getBaseName(nodeName: string) {
   if (nodeName.endsWith(SOURCE_SUFFIX)) return nodeName.slice(0, -SOURCE_SUFFIX.length);
   if (nodeName.endsWith(TARGET_SUFFIX)) return nodeName.slice(0, -TARGET_SUFFIX.length);
   return nodeName;
 }

interface ConversationThreadsProps {
  data: ThreadFlow[];
}

interface SankeyNode {
  name: string;
  index?: number;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
}

interface SankeyLink {
  source: number | SankeyNode;
  target: number | SankeyNode;
  value: number;
  width?: number;
  y0?: number;
  y1?: number;
}

export function ConversationThreads({ data }: ConversationThreadsProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toggleUser, selectedUsers } = useFilter();
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    setRenderError(null);

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 500;
    const margin = { top: 20, right: 150, bottom: 20, left: 150 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    // d3-sankey requires an acyclic graph. WhatsApp reply flows are naturally cyclic (A→B and B→A).
    // To avoid "circular link", we build a bipartite Sankey:
    // - left side nodes are "user__src"
    // - right side nodes are "user__tgt"
    // All links go left→right, so there can be no cycles.
    const uniqueUsers = new Set<string>();
    data.forEach(d => {
      uniqueUsers.add(d.source);
      uniqueUsers.add(d.target);
    });

    const nodes: SankeyNode[] = [];
    uniqueUsers.forEach(user => {
      nodes.push({ name: `${user}${SOURCE_SUFFIX}` });
      nodes.push({ name: `${user}${TARGET_SUFFIX}` });
    });

    const nodeIndex = new Map(nodes.map((n, i) => [n.name, i] as const));

    const links: SankeyLink[] = data
      .filter(d => d.source !== d.target)
      .map(d => ({
        source: nodeIndex.get(`${d.source}${SOURCE_SUFFIX}`)!,
        target: nodeIndex.get(`${d.target}${TARGET_SUFFIX}`)!,
        value: d.value,
      }))
      .filter(l => l.source != null && l.target != null);

    if (links.length === 0) return;

    const sankeyGenerator = sankey<SankeyNode, SankeyLink>()
      .nodeWidth(20)
      .nodePadding(15)
      .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]]);

    let sankeyNodes: SankeyNode[] = [];
    let sankeyLinks: SankeyLink[] = [];
    try {
      const layout = sankeyGenerator({
        nodes: nodes.map(d => ({ ...d })),
        links: links.map(d => ({ ...d })),
      });
      sankeyNodes = layout.nodes;
      sankeyLinks = layout.links;
    } catch (err) {
      console.error('Erro ao gerar Sankey:', err);
      setRenderError('Não foi possível gerar o diagrama (fluxo circular detetado).');
      return;
    }

    const g = svg.append('g');

    g.append('g')
      .selectAll('path')
      .data(sankeyLinks)
      .enter()
      .append('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('fill', 'none')
      .attr('stroke', d => {
        const sourceNode = d.source as SankeyNode;
        return getUserColor(getBaseName(sourceNode.name));
      })
      .attr('stroke-opacity', d => {
        const sourceNode = d.source as SankeyNode;
        const targetNode = d.target as SankeyNode;
        const sourceBase = getBaseName(sourceNode.name);
        const targetBase = getBaseName(targetNode.name);
        if (selectedUsers.length === 0) return 0.4;
        return selectedUsers.includes(sourceBase) || selectedUsers.includes(targetBase) ? 0.6 : 0.1;
      })
      .attr('stroke-width', d => Math.max(1, d.width || 1))
      .style('cursor', 'pointer')
      .on('mouseenter', function() {
        d3.select(this).attr('stroke-opacity', 0.8);
      })
      .on('mouseleave', function(_, d) {
        const sourceNode = d.source as SankeyNode;
        const targetNode = d.target as SankeyNode;
        const sourceBase = getBaseName(sourceNode.name);
        const targetBase = getBaseName(targetNode.name);
        const opacity = selectedUsers.length === 0 ? 0.4 :
          (selectedUsers.includes(sourceBase) || selectedUsers.includes(targetBase) ? 0.6 : 0.1);
        d3.select(this).attr('stroke-opacity', opacity);
      })
      .append('title')
      .text(d => {
        const sourceNode = d.source as SankeyNode;
        const targetNode = d.target as SankeyNode;
        return `${getBaseName(sourceNode.name)} → ${getBaseName(targetNode.name)}: ${d.value}`;
      });

    const node = g.append('g')
      .selectAll('g')
      .data(sankeyNodes)
      .enter()
      .append('g')
      .style('cursor', 'pointer')
      .on('click', (_, d) => toggleUser(getBaseName(d.name)));

    node.append('rect')
      .attr('x', d => d.x0!)
      .attr('y', d => d.y0!)
      .attr('height', d => Math.max(1, d.y1! - d.y0!))
      .attr('width', d => d.x1! - d.x0!)
      .attr('fill', d => getUserColor(getBaseName(d.name)))
      .attr('opacity', d => selectedUsers.length === 0 || selectedUsers.includes(getBaseName(d.name)) ? 1 : 0.3)
      .attr('rx', 3);

    node.append('text')
      .attr('x', d => d.x0! < width / 2 ? d.x0! - 6 : d.x1! + 6)
      .attr('y', d => (d.y1! + d.y0!) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => d.x0! < width / 2 ? 'end' : 'start')
      .attr('class', 'fill-gray-700 dark:fill-gray-300 text-sm')
      .text(d => getBaseName(d.name));

  }, [data, selectedUsers, toggleUser]);

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Fluxo de Conversas
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          Sem dados de fluxo de conversas
        </p>
      </div>
    );
  }

  if (renderError) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Fluxo de Conversas (Quem Inicia vs Quem Responde)
        </h2>
        <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-red-700 dark:text-red-300 font-medium">
            {renderError}
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">
            Dica: este gráfico usa um layout Sankey (D3) e requer um grafo acíclico.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Fluxo de Conversas (Quem Inicia vs Quem Responde)
      </h2>
      <div ref={containerRef} className="w-full overflow-x-auto">
        <svg ref={svgRef} className="w-full" />
      </div>
    </div>
  );
}
