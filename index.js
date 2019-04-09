
function drawChart(data) {

// set margins //
const margin = { top: 20, right: 20, bottom: 30, left: 40};
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;


// create container //
const container = d3.select('body')
                    .append('div')
                    .attr('class', 'container');

container.append('h1').text("Cpu Utilization Charts");


// attach to svg //

let svg = container
   .append('svg')
   .attr('width', width + margin.left + margin.right)
   .attr('height', height + margin.top + margin.bottom)

let g = svg.append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
   // create x-axis //

   let x = d3
          .scaleLinear()
          .rangeRound([0, width]);

   // create y-axis //

   let y = d3
          .scaleLinear()
          .rangeRound([height, 0]);
  

  //draw line
   let line = d3.line()
             .x(function(d) { return x(d.seconds) })
             .y(function(d) { return y(d.cputime) })
             x.domain(d3.extent(data, function(d) { return d.seconds }))
             y.domain(d3.extent(data, function(d) {
               return d.cputime
             }))
             

  g.append("g")
    .attr("transform", "translate(0," + height +")")
    .call(d3.axisBottom(x))
    .select(".domain")
    .remove()

  g.append("g")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    //.text("Seconds");

  g.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    //.attr("stroke-linejoin", "round")
    //.attr("stroke-linecap", "round")
    //.attr("stroke-width", 1.5)
    .attr("d", line)
       

}


fetch('http://localhost:3000')
  .then(response => response.json())
  .then(cpu => {
    const chartData = processDataset(cpu);

    drawChart(chartData);
    //update(cpu);

  });

  // process dataset coming from endpoint //
  function processDataset(cpu) {

    let dataValues = []
    const keys = Object.keys(cpu.computation);

    for (key in keys){
      let transformedData = cpu.computation[keys[key]].map((item, index) => ({
        seconds: index,
        cputime: item['core-cpu-%-utilization'],
        avgtime: item['core-%-avg-utilization']
      }));

      dataValues.push(transformedData);
    }

    //console.log(dataValues[0]);

  let finalData = [];
  for (count in dataValues){
    for (test in dataValues[count]){
      finalData.push(dataValues[count][test])
    }
  }

  return finalData;
}

  //Update UI//
  function updateUI(data){
    drawChart(data)
  }

  Pusher.logToConsole = true;

  // pusher for real time updates //
  const pusher = new Pusher('972bc911e2d469152d3a', {
    cluster: 'eu',
    forceTLS: true,
  });

  const channel = pusher.subscribe('cpu-channel');
  channel.bind('update-cpu', data => {
    console.log(data)
    updateUI(data);
  });

  channel.bind('pusher:subscription_succeeded', function(members) {
    console.log('successfully subscribed!');
  });