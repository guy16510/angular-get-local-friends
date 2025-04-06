import { Component, Input, OnChanges, ElementRef, ViewChild, SimpleChanges, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';
import { MaterialModule } from '../../../utils/material.module';
@Component({
  selector: 'app-chart-d3',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>{{ title }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <svg #chart></svg>
      </mat-card-content>
    </mat-card>
  `,
  styleUrls: ['./chart-d3.component.scss'],
  imports: [MaterialModule],
  standalone: true
})
export class ChartD3Component implements OnChanges, AfterViewInit {
  @Input() title: string = '';
  @Input() chartType: 'pie' | 'bar' = 'pie';
  @Input() data: number[] = [];
  @Input() labels: string[] = [];
  @Input() width: number = 300;
  @Input() height: number = 300;

  // Ensure the ViewChild is typed as an SVGSVGElement.
  @ViewChild('chart', { static: true }) chartElement!: ElementRef<SVGSVGElement>;

  // Change the type to match the selection returned by d3.select
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | undefined;

  constructor() {}

  ngAfterViewInit(): void {
    this.initializeChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.svg) {
      this.updateChart();
    }
  }

  private initializeChart(): void {
    // Use the two-type-argument version of d3.select.
    this.svg = d3.select<SVGSVGElement, unknown>(this.chartElement.nativeElement)
      .attr('width', this.width)
      .attr('height', this.height);
    this.updateChart();
  }

  private updateChart(): void {
    if (this.svg) {
      // Clear any previous chart content.
      this.svg.selectAll('*').remove();
    }

    if (this.chartType === 'pie') {
      this.drawPieChart();
    } else if (this.chartType === 'bar') {
      this.drawBarChart();
    }
  }

  private drawPieChart(): void {
    if (!this.svg) { return; }
    const radius = Math.min(this.width, this.height) / 2;
    const g = this.svg.append('g')
      .attr('transform', `translate(${this.width / 2}, ${this.height / 2})`);

    const color = d3.scaleOrdinal<string>()
      .domain(this.labels)
      .range(d3.schemeCategory10);

    const pieGenerator = d3.pie<number>().value((d: number) => d);
    const arcData = pieGenerator(this.data);

    const arcGenerator = d3.arc<d3.PieArcDatum<number>>()
      .innerRadius(0)
      .outerRadius(radius);

    // Draw pie slices
    g.selectAll('path')
      .data(arcData)
      .enter()
      .append('path')
      .attr('d', arcGenerator as any)
      .attr('fill', (d: any, i: number) => color(this.labels[i]))
      .attr('stroke', '#fff')
      .attr('stroke-width', '2px');

    // Add labels to the slices
    g.selectAll('text')
      .data(arcData)
      .enter()
      .append('text')
      .attr('transform', (d: any) => `translate(${arcGenerator.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .text((d: any, i: number) => this.labels[i]);
  }

  private drawBarChart(): void {
    if (!this.svg) { return; }
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = this.width - margin.left - margin.right;
    const innerHeight = this.height - margin.top - margin.bottom;

    const x = d3.scaleBand<string>()
      .domain(this.labels)
      .range([0, innerWidth])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(this.data) || 1])
      .nice()
      .range([innerHeight, 0]);

    const g = this.svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // X Axis
    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(x));

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y));

    // Bars
    g.selectAll('.bar')
      .data(this.data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: number, i: number) => x(this.labels[i])!)
      .attr('y', (d: number) => y(d))
      .attr('width', x.bandwidth())
      .attr('height', (d: number) => innerHeight - y(d))
      .attr('fill', '#69b3a2');
  }
}