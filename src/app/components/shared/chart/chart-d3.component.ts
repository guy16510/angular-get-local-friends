import {
  Component,
  Input,
  OnChanges,
  ElementRef,
  ViewChild,
  SimpleChanges,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  NgZone,
} from '@angular/core';
import * as d3 from 'd3';
import { MaterialModule } from '../../../utils/material.module';
import { CommonModule } from '@angular/common';

type ChartType = 'pie' | 'bar' | 'radar' | 'bubble';

@Component({
  selector: 'app-chart-d3',
  templateUrl: './chart-d3.component.html',
  styleUrls: ['./chart-d3.component.scss'],
  imports: [MaterialModule, CommonModule],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartD3Component implements OnChanges, AfterViewInit, OnDestroy {
  @Input() title: string = '';
  @Input() insightText?: string;
  @Input() chartType: ChartType = 'pie';
  @Input() data: number[] = [];
  @Input() labels: string[] = [];
  @Input() showLegend: boolean = false;
  @Input() preview: boolean = false;

  @ViewChild('chart', { static: true }) chartElement!: ElementRef<SVGSVGElement>;
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef<HTMLDivElement>;

  private resizeObserver!: ResizeObserver;
  private resizeTimeout: any;
  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private width: number = 300;
  private height: number = 300;

  constructor(private ngZone: NgZone) {}

  private mockData: number[] = [73.33, 88.89, 50, 80, 57.14, 44.44, 100, 66.67, 85.71, 46.67];
  private mockLabels: string[] = [
    'Friendship', 'Interests', 'Social Energy', 'Communication',
    'Spending', 'Work', 'Entertainment', 'Lifestyle', 'Fitness', 'Preferences'
  ];

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.resizeObserver = new ResizeObserver(() => {
          clearTimeout(this.resizeTimeout);
          this.resizeTimeout = setTimeout(() => {
            const rect = this.chartContainer.nativeElement.getBoundingClientRect();
            if (rect.width && rect.height) {
              this.width = rect.width;
              this.height = rect.height;
              this.initializeChart();
            }
          }, 50);
        });

        this.resizeObserver.observe(this.chartContainer.nativeElement);
      });
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    clearTimeout(this.resizeTimeout);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.svg) {
      this.updateChart();
    }
  }

  private initializeChart(): void {
    this.svg = d3.select(this.chartElement.nativeElement)
    .attr('viewBox', `-20 -20 ${this.width + 40} ${this.height + 40}`) // 👈 padding
    .attr('preserveAspectRatio', 'none')
    .classed('responsive-svg', true);

    this.updateChart();
  }

  private updateChart(): void {
    if (!this.svg) return;
    this.svg.selectAll('*').remove();

    const chartData = (this.preview || this.data.length === 0) ? this.mockData : this.data;
    const chartLabels = (this.preview || this.labels.length === 0) ? this.mockLabels : this.labels;

    switch (this.chartType) {
      case 'pie': this.drawPieChart(chartData, chartLabels); break;
      case 'bar': this.drawBarChart(chartData, chartLabels); break;
      case 'radar': this.drawRadarChart(chartData, chartLabels); break;
      case 'bubble': this.drawBubbleChart(chartData, chartLabels); break;
      default: console.warn(`Unsupported chart type: ${this.chartType}`); break;
    }
  }

  private drawPieChart(data: number[], labels: string[]): void {
    const padding = 30;
    const radius = Math.min(this.width, this.height) / 2 - padding;
    const g = this.svg.append('g')
      .attr('transform', `translate(${this.width / 2}, ${this.height / 2})`);

    const color = d3.scaleOrdinal<string>()
      .domain(labels)
      .range(d3.schemeCategory10);

    const pieGenerator = d3.pie<number>().value(d => d);
    const arcData = pieGenerator(data);
    const arcGenerator = d3.arc<d3.PieArcDatum<number>>()
      .innerRadius(0)
      .outerRadius(radius);

    const slices = g.selectAll('path')
      .data(arcData)
      .enter()
      .append('path')
      .attr('d', arcGenerator as any)
      .attr('fill', (d, i) => color(labels[i]) as string)
      .attr('stroke', '#fff')
      .attr('stroke-width', '2px');

    // Animate the slices
    slices.transition()
      .duration(750)
      .attrTween('d', function(d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return t => arcGenerator(interpolate(t)) as string;
      });

    // Append labels
    g.selectAll('text')
      .data(arcData)
      .enter()
      .append('text')
      .attr('transform', d => `translate(${arcGenerator.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .text((d, i) => labels[i]);
  }

  private drawBarChart(data: number[], labels: string[]): void {
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = this.width - margin.left - margin.right;
    const innerHeight = this.height - margin.top - margin.bottom;

    const x = d3.scaleBand<string>()
      .domain(labels)
      .range([0, innerWidth])
      .padding(0.1);
    const y = d3.scaleLinear()
      .domain([0, d3.max(data) || 1])
      .nice()
      .range([innerHeight, 0]);

    const g = this.svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(x));

    g.append('g')
      .call(d3.axisLeft(y));

    const bars = g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d, i) => x(labels[i])!)
      .attr('y', innerHeight)
      .attr('width', x.bandwidth())
      .attr('height', 0)
      .attr('fill', '#69b3a2');

    bars.transition()
      .duration(750)
      .attr('y', d => y(d))
      .attr('height', d => innerHeight - y(d));
  }

  private drawRadarChart(data: number[], labels: string[]): void {
    // Radar chart settings.
    const radius = Math.min(this.width, this.height) / 2;
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const angleSlice = (Math.PI * 2) / data.length;
    const maxValue = d3.max(data) || 1;
    const rScale = d3.scaleLinear().range([0, radius]).domain([0, maxValue]);

    // Draw circular grid.
    const levels = 5;
    for (let level = 1; level <= levels; level++) {
      this.svg.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', (radius / levels) * level)
        .attr('fill', 'none')
        .attr('stroke', '#CDCDCD')
        .attr('stroke-dasharray', '2,2');
    }

    // Draw axis lines.
    for (let i = 0; i < data.length; i++) {
      const angle = i * angleSlice - Math.PI / 2; // start from top
      const x = centerX + rScale(maxValue) * Math.cos(angle);
      const y = centerY + rScale(maxValue) * Math.sin(angle);
      this.svg.append('line')
        .attr('x1', centerX)
        .attr('y1', centerY)
        .attr('x2', x)
        .attr('y2', y)
        .attr('stroke', '#CDCDCD')
        .attr('stroke-dasharray', '2,2');

      // Append axis labels.
      this.svg.append('text')
        .attr('x', centerX + (rScale(maxValue) + 10) * Math.cos(angle))
        .attr('y', centerY + (rScale(maxValue) + 10) * Math.sin(angle))
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .text(labels[i]);
    }

    // Calculate the points of the radar chart polygon.
    const radarLine = d3.lineRadial<number>()
      .radius((d, i) => rScale(data[i]))
      .angle((d, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);

    // Append the radar shape.
    this.svg.append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`)
      .append('path')
      .datum(data)
      .attr('d', radarLine as any)
      .attr('fill', '#69b3a2')
      .attr('fill-opacity', 0.5)
      .attr('stroke', '#69b3a2')
      .attr('stroke-width', 2);
  }

  private drawBubbleChart(data: number[], labels: string[]): void {
    const radiusPadding = 5;
    const maxData = d3.max(data) || 1;
  
    const radiusScale = d3.scaleSqrt().domain([0, maxData]).range([10, 50]);
  
    const nodes = data.map((d, i) => ({
      index: i,
      radius: radiusScale(d),
      value: d,
      label: labels[i],
      x: Math.random() * this.width,
      y: Math.random() * this.height,
    }));
  
    const simulation = d3.forceSimulation(nodes)
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('charge', d3.forceManyBody().strength(5))
      .force('collision', d3.forceCollide().radius((d: any) => d.radius + radiusPadding))
      .stop();
  
    for (let i = 0; i < 300; i++) {
      simulation.tick();
    }
  
    const node = this.svg.selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => {
        const clampedX = Math.max(d.radius, Math.min(this.width - d.radius, d.x));
        const clampedY = Math.max(d.radius, Math.min(this.height - d.radius, d.y));
        return `translate(${clampedX}, ${clampedY})`;
      });
  
    node.append('circle')
      .attr('r', (d: any) => d.radius)
      .attr('fill', (d, i) => d3.schemeCategory10[i % 10])
      .attr('stroke', '#fff')
      .attr('stroke-width', 1);
  
    node.append('text')
      .attr('dy', 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .text((d: any) => d.label);
  }
}