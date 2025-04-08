import { 
  Component, 
  Input, 
  OnChanges, 
  ElementRef, 
  ViewChild, 
  SimpleChanges, 
  AfterViewInit, 
  ChangeDetectionStrategy 
} from '@angular/core';
import * as d3 from 'd3';
import { MaterialModule } from '../../../utils/material.module';
import { CommonModule } from '@angular/common';

type ChartType = 'pie' | 'bar' | 'radar' | 'bubble';

@Component({
  selector: 'app-chart-d3',
  template: `
    <mat-card class="chart-card" [class.preview]="preview">
      <mat-card-header>
        <mat-card-title>{{ title }}</mat-card-title>
        <mat-card-subtitle *ngIf="insightText">{{ insightText }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div class="chart-container" #chartContainer>
          <svg #chart></svg>
          <div *ngIf="preview" class="preview-overlay">
             <p>Preview mode. Upgrade to see full insights.</p>
          </div>
        </div>
        <div class="chart-legend" *ngIf="showLegend">
          <!-- Optionally, build a legend here -->
        </div>
      </mat-card-content>
    </mat-card> 
  `,
  styleUrls: ['./chart-d3.component.scss'],
  imports: [MaterialModule, CommonModule],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartD3Component implements OnChanges, AfterViewInit {
  @Input() title: string = '';
  @Input() insightText?: string;
  @Input() chartType: ChartType = 'pie';
  /**
   * For charts that expect a numeric array.
   * For complex chart types (e.g. bubble), you may want to pass an array of objects.
   */
  @Input() data: number[] = [];
  @Input() labels: string[] = [];
  @Input() width: number = 300;
  @Input() height: number = 300;
  @Input() showLegend: boolean = false;
  /**
   * When set to true, the component uses mock data and overlays a preview mask.
   */
  @Input() preview: boolean = false;

  @ViewChild('chart', { static: true }) chartElement!: ElementRef<SVGSVGElement>;
  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;

  // Mock data for preview mode (for pie/bar charts)
  private mockData: number[] = [73.33, 88.89, 50, 80, 57.14, 44.44, 100, 66.67, 85.71, 46.67];
  private mockLabels: string[] = [
    'Friendship',
    'Interests',
    'Social Energy',
    'Communication',
    'Spending',
    'Work',
    'Entertainment',
    'Lifestyle',
    'Fitness',
    'Preferences'
  ];

  ngAfterViewInit(): void {
    this.initializeChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.svg) {
      this.updateChart();
    }
  }

  private initializeChart(): void {
    this.svg = d3.select<SVGSVGElement, unknown>(this.chartElement.nativeElement)
      .attr('width', this.width)
      .attr('height', this.height);
    this.updateChart();
  }

  private updateChart(): void {
    if (!this.svg) { return; }
    // Clear previous contents.
    this.svg.selectAll('*').remove();

    // For preview (or if no data passed), use the mock values.
    const chartData = (this.preview || this.data.length === 0) ? this.mockData : this.data;
    const chartLabels = (this.preview || this.labels.length === 0) ? this.mockLabels : this.labels;

    switch (this.chartType) {
      case 'pie':
        this.drawPieChart(chartData, chartLabels);
        break;
      case 'bar':
        this.drawBarChart(chartData, chartLabels);
        break;
      case 'radar':
        this.drawRadarChart(chartData, chartLabels);
        break;
      case 'bubble':
        this.drawBubbleChart(chartData, chartLabels);
        break;
      default:
        console.warn(`Unsupported chart type: ${this.chartType}`);
        break;
    }
  }

  private drawPieChart(data: number[], labels: string[]): void {
    const radius = Math.min(this.width, this.height) / 2;
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
    const width = this.width;
    const height = this.height;
    // Use a square root scale to compute bubble radii.
    const maxData = d3.max(data) || 1;
    const radiusScale = d3.scaleSqrt().domain([0, maxData]).range([10, 50]);

    // Create nodes for each data value.
    const nodes = data.map((d, i) => ({
      index: i,
      radius: radiusScale(d),
      value: d,
      label: labels[i]
    }));

    // Use a force simulation to position bubbles.
    const simulation = d3.forceSimulation(nodes)
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('charge', d3.forceManyBody().strength(5))
      .force('collision', d3.forceCollide().radius((d: any) => d.radius + 5))
      .stop();

    // Run the simulation for a fixed number of iterations.
    for (let i = 0; i < 300; i++) {
      simulation.tick();
    }

    // Create a group for each node.
    const node = this.svg.selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);

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