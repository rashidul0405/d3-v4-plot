var margin = { top: 10, right: 20, bottom: 20, left: 20},
  width = 800 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom,
  circleRadius = 25,
  imageHeight = imageWidth = circleRadius * 2;

var svg = d3.select('.chart')
  .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    // .call(responsivefy)
  .append('g')
    .attr('transform', `translate (${margin.left}, ${margin.top})`);

d3.csv('./timeline.csv', function(err, data){
  if (err) throw err;

  // clean the data source
  var data = data.map( (d) => {
    var cleanDatum = {};
    d3.keys(d).forEach(function(k) {
      if(d[k])
        cleanDatum[k.trim()] = d[k].trim();
    });
    return cleanDatum;
  });

  // format the data
  // var parseYear = d3.timeParse('%Y');
  let id = 1; // for image url mapping
  data.forEach( (d) => {
    // d.Birthdate = parseYear(d.Birthdate);
    // d.Deathdate = parseYear(d.Deathdate);
    d.id = id;
    d.Birthdate = +d.Birthdate;
    d.Deathdate = +d.Deathdate;
    d.Rank      = +d.Rank;
    id++;
  });

  // define the tooltip container
  var tipContainer = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // build the x axis
  var xScale = d3.scaleLinear()
    .domain([d3.min(data, d => d.Birthdate), new Date().getFullYear()])
    .range([0, width])
    .nice();

  var xAxis = d3.axisBottom(xScale)
    .ticks(10);

  svg
    .append('g')
      .attr('transform', `translate(0, ${height})`)
    .call(xAxis);

  // do the dirty work ;) build the plot
  var circles = svg
    .selectAll('.clergy')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'clergy')
    .attr('transform', d => {
      return `translate(${xScale(d.Birthdate)}, 50)`;
    });

  // append the image as pattern
  circles
    .append('pattern')
    .attr('id', d => d.id)
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 1)
    .attr('height', 1)
    .append('image')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', imageWidth)
      .attr('height', imageHeight)
      .attr('xlink:href', d => d.Image);

  // create circles and fill with corresponding images
  circles
    .append('circle')
    .attr('r', circleRadius)
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('class', d => d.Rank ? 'clergy-green' : 'clergy-red')
    .style("fill", d => d.Image ?`url(#${d.id})` : 'steelblue')
    .style("fill-opacity", 0.5)
    .on('mouseover', function(d, i){
      tipContainer
        .transition()
          .duration(200)
          .style("opacity", .9);
      tipContainer
        .html(`${d.ClergyName} <br /> ${d.Birthdate} - ${d.Deathdate ? d.Deathdate : ''}`)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on('mouseout', function(d, i){
      tipContainer.transition()
        .duration(500)
        .style("opacity", 0);
    });

  console.log(data);

});

// Make chart responsive using viewBox
function responsivefy(svg) {
  // get container + svg aspect ratio
  var container = d3.select(svg.node().parentNode),
      width = parseInt(svg.style("width")),
      height = parseInt(svg.style("height")),
      aspect = width / height;

  // add viewBox and preserveAspectRatio properties,
  // and call resize so that svg resizes on inital page load
  svg.attr("viewBox", "0 0 " + width + " " + height)
      .attr("preserveAspectRatio", "xMinYMid")
      .call(resize);

  // to register multiple listeners for same event type,
  // you need to add namespace, i.e., 'click.foo'
  // necessary if you call invoke this function for multiple svgs
  // api docs: https://github.com/mbostock/d3/wiki/Selections#on
  d3.select(window).on("resize." + container.attr("id"), resize);

  // get width of container and resize svg to fit it
  function resize() {
      var targetWidth = parseInt(container.style("width"));
      svg.attr("width", targetWidth);
      svg.attr("height", Math.round(targetWidth / aspect));
  }
}
