const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

d3.json(url).then((data) => {
  const baseTemp = data.baseTemperature;
  const monthlyData = data.monthlyVariance;

  drawHeatMap(baseTemp, monthlyData);
});

function drawHeatMap(baseTemp, monthlyData) {
  const margin = { top: 60, right: 20, bottom: 100, left: 80 };
  const width = 1200 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const svg = d3
    .select("#heatmap")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Escalas
  const years = monthlyData.map((d) => d.year);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const xScale = d3.scaleBand().domain(years).range([0, width]);

  const yScale = d3.scaleBand().domain(months).range([0, height]);

  // Ejes
  const xAxis = d3.axisBottom(xScale).tickValues(xScale.domain().filter((year) => year % 10 === 0));
  const yAxis = d3.axisLeft(yScale).tickFormat((m) => {
    const date = new Date(0);
    date.setMonth(m - 1);
    return d3.timeFormat("%B")(date);
  });

  svg.append("g").attr("id", "x-axis").attr("transform", `translate(0, ${height})`).call(xAxis);

  svg.append("g").attr("id", "y-axis").call(yAxis);

  // Escala de colores
  const temps = monthlyData.map((d) => baseTemp + d.variance);
  const colorScale = d3
    .scaleQuantile()
    .domain([d3.min(temps), d3.max(temps)])
    .range(["#313695", "#74add1", "#fdae61", "#a50026"]); // mínimo 4 colores

  // Celdas
  svg
    .selectAll(".cell")
    .data(monthlyData)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("data-year", (d) => d.year)
    .attr("data-month", (d) => d.month - 1)
    .attr("data-temp", (d) => baseTemp + d.variance)
    .attr("x", (d) => xScale(d.year))
    .attr("y", (d) => yScale(d.month))
    .attr("width", xScale.bandwidth())
    .attr("height", yScale.bandwidth())
    .attr("fill", (d) => colorScale(baseTemp + d.variance))
    .on("mouseover", (event, d) => {
      d3.select("#tooltip")
        .style("opacity", 1)
        .html(`${d.year} - ${d.month}<br>Temp: ${(baseTemp + d.variance).toFixed(2)}°C`)
        .attr("data-year", d.year)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", () => d3.select("#tooltip").style("opacity", 0));
}

const legendWidth = 400;
const legendHeight = 30;

const legend = d3.select("#legend").append("svg").attr("width", legendWidth).attr("height", legendHeight);

const legendColors = ["#313695", "#74add1", "#fdae61", "#a50026"];
legend
  .selectAll("rect")
  .data(legendColors)
  .enter()
  .append("rect")
  .attr("x", (d, i) => i * (legendWidth / legendColors.length))
  .attr("y", 0)
  .attr("width", legendWidth / legendColors.length)
  .attr("height", legendHeight)
  .attr("fill", (d) => d);
