import * as d3 from 'd3';

export const clearSVG = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void => {
  svg.selectAll('*').remove();
};

export const createColorScale = (labels: string[]): d3.ScaleOrdinal<string, unknown> => {
  return d3.scaleOrdinal<string>()
    .domain(labels)
    .range(d3.schemeCategory10);
};