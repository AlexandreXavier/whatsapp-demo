import * as d3 from 'd3';

const colorCache = new Map<string, string>();
let colorIndex = 0;

const COLORS = [
  '#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f',
  '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab',
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
  '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
];

export function getUserColor(userName: string): string {
  if (colorCache.has(userName)) {
    return colorCache.get(userName)!;
  }
  
  const color = COLORS[colorIndex % COLORS.length];
  colorCache.set(userName, color);
  colorIndex++;
  
  return color;
}

export function getHeatmapColorScale(maxValue: number) {
  return d3.scaleSequential()
    .domain([0, maxValue])
    .interpolator(d3.interpolateRdYlBu);
}

export function resetColorCache() {
  colorCache.clear();
  colorIndex = 0;
}

export function getAllUserColors(): Map<string, string> {
  return new Map(colorCache);
}
