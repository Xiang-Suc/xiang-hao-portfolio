import * as d3 from 'd3';
import Data from '../data/Countries.json';
import { debounce, isEmpty } from 'lodash';

const margin = { top: 40, right: 45, bottom: 60, left: 0 };
let size = { width: 0, height: 0 };
const data = Data;

const development_level = ["Developed Country", "Developing Country", "Least Developed Country"];
const colorScale = d3.scaleOrdinal().domain(development_level).range(["blue", "green", "red"]); // Define a color scale

const onResize = (targets) => {
  targets.forEach(target => {
    if (target.target.getAttribute('id') !== 'parallel-coordinates-container') return;
    size = { width: target.contentRect.width, height: target.contentRect.height };
    if (!isEmpty(size) && !isEmpty(data)) {
      d3.select('#parallel-coordinates-svg').selectAll('*').remove();
      initParallelCoordinates();
    }
  });
};

const chartObserver = new ResizeObserver(debounce(onResize, 100));

export const ParallelCoordinatesPlot = () => (
  `<div class='PCchart-container d-flex' id='parallel-coordinates-container'>
    <svg id='parallel-coordinates-svg' width='100%' height='100%'>
    </svg>
    <div id='legend-container'></div>
  </div>`
);

export function mountParallelCoordinatesPlot() {
  const container = document.querySelector('#parallel-coordinates-container');
  chartObserver.observe(container);
}

function initParallelCoordinates() {
  const chartContainer = d3.select('#parallel-coordinates-svg')

  // append the svg object to the body of the page
  chartContainer
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  // Extract the list of dimensions we want to keep in the plot. Here I keep all except the column called Species
  const dimensions = ["Region", "Population", "Pop. Density (per sq. mi.)", "Net migration", "Infant mortality (per 1000 births)", "GDP ($ per capita)", "Literacy (%)", "Birthrate", "Deathrate", "Agriculture", "Industry", "Service"]

  // For each dimension, I build a linear scale. I store all in a y object
  const y = {}
  for (const i in dimensions) {
    const name = dimensions[i]
    y[name] = d3.scaleLinear()
      .domain(d3.extent(data, function (d) { return +d[name]; }))
      .range([size.height - margin.bottom, margin.top])
  }
  // Function to handle click on an axis
  function onAxisClick(dimension) {
    console.log("Clicked axis: " + dimension);
    // Add any other logic you want to execute on click
  }

  // Build the X scale -> it finds the best position for each Y axis
  const x = d3.scalePoint()
    .range([0, size.width])
    .padding(1.3)
    .domain(dimensions);

  // The path function takes a row of the csv as input and returns x and y coordinates of the line to draw for this row.
  function path(d) {
    return d3.line()(dimensions.map(function (p) { return [x(p), y[p](d[p])]; }));
  }

  let highlight = function (event, d) {
    const developmentLevel = d['Development level'];

    d3.selectAll(".lines")
      .transition().duration(200)
      .style("stroke", (lineData) => lineData['Development level'] === developmentLevel ? colorScale(developmentLevel) : "lightgrey")
      .style("opacity", (lineData) => lineData['Development level'] === developmentLevel ? 1 : 0.2);

    // d3.selectAll("." + selected_specie)
    //   .transition().duration(200)
    //   .style("stroke", colorScale(selected_specie))
    //   .style("opacity", "1")
  }

  let doNotHighlight = function (d) {
    d3.selectAll(".lines")
      .transition().duration(200).delay(1000)
      .style("stroke", (d) => colorScale(d['Development level']))
      .style("opacity", 0.5)
  }
  // Draw the lines
  const lines = chartContainer
    .selectAll("myPath")
    .data(data)
    .enter()
    .append("path")
      .attr("class", function (d) { return "lines " + d['Development level']; }) // Add class for each development level
      .attr("d", path)
      .style("fill", "none" )
      .style("stroke", (d) => colorScale(d['Development level']))
      .style("opacity", 0.5)
      .on("mouseover", highlight)
      .on("mouseleave", doNotHighlight )
      // Set the initial 'd' attribute to start from the left-most axis
      // .attr("d", function (d) {
      //   const initialPath = dimensions.map(function (p) {
      //     return [x(dimensions[0]), y[p](d[p])];
      //   });
      //   return path(initialPath);
      // })
      // // Apply the transition to the final path
      // .transition()
      // .duration(1000)
      // .delay((d, i) => i * 40)
      .attr("d", path);

  // Draw the axis:
  chartContainer.selectAll("myAxis")
    .data(dimensions).enter()
    .append("g")
    .attr("class", `myAxis`)
    .attr("transform", function (d) { return "translate(" + x(d) + "," + 0 + ")"; })
    .each(function (d) {
      const tickValues = getTickValuesForDimension(d);
      const tickFormat = getTickFormatForDimension(d);

      d3.select(this)
        .call(d3.axisLeft().scale(y[d])
          .tickValues(getTickValuesForDimension(d))
          .tickFormat((d, i) => tickFormat[i])
        )
    })
    // Add axis title
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text(function (d) { return d; })
    .style("fill", "black");

  // TODO: Draw the axis and attach click event listeners
  chartContainer.selectAll("myAxis")
    .data(dimensions).enter()
    .append("g")
    .attr("class", "axis")
    .attr("transform", function (d) { return "translate(" + x(d) + "," + 0 + ")"; })
    .each(function (d) {
      d3.select(this)
        .on("click", function () { onAxisClick(d); }); // Attach click event listener
    })


  // Define the zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([1, 8]) // This defines the min and max zoom scale
    .translateExtent([[0, 0], [size.width, size.height]]) // Defines the translation extent
    .extent([[0, 0], [size.width, size.height]]) // Defines the viewport extent for zooming
    .on("zoom", zoomed);

  // Apply the zoom behavior to the SVG
  chartContainer.call(zoom);

  function zoomed(event) {
    const transform = event.transform;
    x.range([0, size.width].map(d => transform.applyX(d))); // Update the range of x-scale

    // Redraw the lines based on the transformed x-scale
    chartContainer.selectAll(".lines")
      .attr("d", d => {
        return d3.line()(dimensions.map(p => [x(p), y[p](d[p])]))
      });

    // Update and redraw the axes based on the transformed x-scale
    chartContainer.selectAll(".myAxis")
      .attr("transform", d => `translate(${x(d)},0)`)

    // Update the position and rotation of axis labels
    const selection = chartContainer.selectAll(".axis-label")
    console.log(selection.nodes());
    selection.attr("transform", d => {
      console.log(d, x(d))
      return `translate(${x(d)},${size.height - 25})rotate(-30)`
    });
  }

  const title = chartContainer.append('g')  // Add a title to the chart.
    .append('text')
    .attr('transform', `translate(${size.width / 2}, ${margin.top - 25})`)
    .attr('dy', '0.5rem')
    .style('text-anchor', 'middle')
    .style('font-size', '.68rem')
    .text('Overview of dataset in terms of different attributes');

  // Draw the axis and labels
  chartContainer.selectAll()
    .data(dimensions)
    .join("text")
    .attr("class", `axis-label`) // Add class for label
    .style("text-anchor", "middle")
    .attr("y", -15)
    .text(d => d)
    .style("font-size", '.63rem')
    .attr("transform", d => `translate(${x(d)}, ${size.height - 25})rotate(-30)`)
    .style("fill", "black");

  const brushes = dimensions.map((dimension) => {
    return d3.brushY()
      .extent([[-10, 0], [10, size.height]])
      .on("brush end", brushed);
  });

  // Initialize the x-scale domain
  x.domain(dimensions);

  // Append the brushes to the chart
  const brushGroup = chartContainer.selectAll(".brush")
    .data(brushes)
    .enter()
    .append("g")
    .attr("class", "brush")
    .attr("transform", (d, i) => `translate(${x(dimensions[i])},0)`)
    .each(function (d) {
      d3.select(this).call(d);
    });

  // Function to handle brushing
  function brushed(event) {
    const selectedData = [];
    chartContainer.selectAll("path")
      .style("visibility", function (d) {
        const isVisible = dimensions.every((dimension, i) => {
          const extent = d3.brushSelection(brushGroup.nodes()[i]);
          if (extent === null) return true; // Keep visible if no brushing
          const yScale = y[dimension];
          const yValue = yScale(d[dimension]);
          return extent[0] <= yValue && yValue <= extent[1];
        });
        if (isVisible) {
          selectedData.push(d);
          return "visible"; // Keep the path visible
        } else {
          return "hidden"; // Hide the path
        }
      });
  }

  // Create a color legend scale
  const colorLegendScale = d3.scaleOrdinal()
    .domain(development_level)
    .range(development_level.map((development_level, i) => colorScale(i)));

  // Create a legend SVG element
  const legendSvg = chartContainer.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${size.width - margin.right - 85}, ${margin.top})`);

  // Create colored rectangles and labels in the legend
  const legendRectSize = 8;
  const legendSpacing = 1;

  const legendRects = legendSvg.selectAll('.legend-rect')
    .data(development_level)
    .enter().append('rect')
    .attr('class', 'legend-rect')
    .attr('x', 0)
    .attr('y', (d, i) => i * (legendRectSize + legendSpacing))
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .style('fill', d => colorLegendScale(d));

  const legendLabels = legendSvg.selectAll('.legend-label')
    .data(development_level)
    .enter().append('text')
    .attr('class', 'legend-label')
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', (d, i) => i * (legendRectSize + legendSpacing) + legendRectSize / 2)
    .style('font-size', '.6rem')
    .attr('dy', '0.35em')
    .text(d => d);
}

function getTickValuesForDimension(dimension) {
  let minVal, maxVal;
  switch (dimension) {
    case 'Region':
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    case "Population":
      minVal = 20579;
      maxVal = 1313973713;
      break;
    case "Area (sq. mi.)":
      minVal = 28;
      maxVal = 9631420;
      break;
    case "Pop. Density (per sq. mi.)":
      minVal = 1.8;
      maxVal = 16183;
      break;
    case "Net migration":
      minVal = -13.92;
      maxVal = 23.06;
      break;
    case "Infant mortality (per 1000 births)":
      minVal = 2.29;
      maxVal = 163.07;
      break;
    case "GDP ($ per capita)":
      minVal = 500;
      maxVal = 37800;
      break;
    case "Literacy (%)":
      minVal = 17.6;
      maxVal = 100;
      break;
    case "Birthrate":
      minVal = 7.29;
      maxVal = 50.73;
      break;
    case "Deathrate":
      minVal = 2.41;
      maxVal = 29.5;
      break;
    case "Agriculture":
      minVal = 0;
      maxVal = 0.769;
      break;
    case "Industry":
      minVal = 0.04;
      maxVal = 0.906;
      break;
    case "Service":
      minVal = 0.062;
      maxVal = 0.927;
      break;
    default:
      return [];
  }

  const step = (maxVal - minVal) / 10;
  return Array.from({ length: 11 }, (_, i) => minVal + i * step);
}

function getTickFormatForDimension(dimension) {
  switch (dimension) {
    case 'Region':
      return ["ASIA (EX. NEAR EAST)", "EASTERN EUROPE", "NORTHERN AFRICA", "OCEANIA", "WESTERN EUROPE", "SUB-SAHARAN AFRICA", "LATIN AMER. & CARIB", "C.W. OF IND. STATES", "NEAR EAST", "NORTHERN AMERICA", "BALTICS"];
    case "Population":
      return [20579, 131415892, 262811206, 394206519, 525601833, 656997146, 788392459, 919787773, 1051183086, 1182578400, 1313973713];
    case "Area (sq. mi.)":
      return ["2 sq. mi.", "1.7M sq. mi.", "3.4M sq. mi.", "5.1M sq. mi.", "6.8M sq. mi.", "8.5M sq. mi.", "10.2M sq. mi.", "11.9M sq. mi.", "13.6M sq. mi.", "15.3M sq. mi.", "17M sq. mi."];
    case "Pop. Density (per sq. mi.)":
      return [1.8, 1619.9, 3238.0, 4856.2, 6474.3, 8092.4, 9710.5, 11328.6, 12946.8, 14564.9, 16183];
    case "Net migration":
      return [-13.92, -10.22, -6.52, -2.83, 0.87, 4.57, 8.27, 11.97, 15.66, 19.36, 23.06];
    case "Infant mortality (per 1000 births)":
      return [2.29, 18.37, 34.45, 50.52, 66.60, 82.68, 98.76, 114.84, 130.91, 146.99, 163.07];
    case "GDP ($ per capita)":
      return [500, 4230, 7960, 11690, 15420, 19150, 22880, 26610, 30340, 34070, 37800];
    case "Literacy (%)":
      return ['17.6%', '25.8%', '34.1%', '42.3%', '50.6%', '58.8%', '67.0%', '75.3%', '83.5%', '91.8%', '100.0%'];
    case "Birthrate":
      return ['7.29%', '11.63%', '15.98%', '20.32%', '24.67%', '29.01%', '33.35%', '37.70%', '42.04%', '46.39%', '50.73%'];
    case "Deathrate":
      return ['2.41%', '5.12%', '7.83%', '10.54%', '13.25%', '15.96%', '18.66%', '21.37%', '24.08%', '26.79%', '29.50%'];
    case "Industry":
      return [0.04, 0.127, 0.213, 0.3, 0.386, 0.473, 0.56, 0.646, 0.733, 0.819, 0.906];
    case "Agriculture":
      return [0.0, 0.077, 0.154, 0.231, 0.308, 0.384, 0.461, 0.538, 0.615, 0.692, 0.769];
    case "Service":
      return [0.062, 0.148, 0.235, 0.321, 0.408, 0.494, 0.581, 0.667, 0.754, 0.841, 0.927];
    default:
      return [];
  }
}
