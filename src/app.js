var margin = { top: 10, right: 10, bottom: 10, left: 10},
  width = 400 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

var svg = d3.select('.chart')
  .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    // .call(responsivefy)
  .append('g')
    .attr('transform', 'translate (' + margin.left + ',' + margin.top + ')');

d3.csv('./timeline.csv', function(err, data){
  if (err) throw err;

  var parseYear = d3.timeParse('%Y');

  // clean the data source
  var data = data.map( (d) => {
    var cleanDatum = {};
    d3.keys(d).forEach(function(k) {
      cleanDatum[k.trim()] = d[k].trim();
    });
    return cleanDatum;
  });

  // format the data
  data.forEach( (d) => {
    d.Birthdate = parseYear(d.Birthdate);
    d.Deathdate = parseYear(d.Deathdate);
    d.Rank      = +d.Rank;
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
