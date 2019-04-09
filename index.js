const api = 'http://localhost:3000';

document.addEventListener("DOMContentLoaded", function(event){
  fetch(api)
  .then(function(response){
    console.log(response)
  })
});


const margin = { top: 20, right: 20, bottom: 30, left: 40};
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// create x axis //
let x = d3
          .scaleLinear()
          .range([0, width])
          //.domain([0, 100])
          //.padding(0.1);

// create y axis

let y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, 100]);

// create second axis for y1 //

let y1 = d3.scaleLinear()
         .range([height, 0]);

//append container the container to the graph //

const container = d3.select('body')
                    .append('div')
                    .attr('class', 'container');

container.append('h1').text("Cpu Utilization Charts");

const svg = container
   .append('svg')
   .attr('width', width + margin.left + margin.right)
   .attr('height', height + margin.top + margin.bottom)
   .append('g')
   .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


   const tip = d3
   .select('body')
   .append('div')
   .attr('class', 'tooltip');


fetch('http://localhost:3000')
  .then(response => response.json())
  .then(cpu => {

    //add the x-axis

    /*svg
    .append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .attr('class', 'x-axis')
    .call(d3.axisBottom(x));
    

    //add the y-axis
    svg
     .append('g')
     .attr('class', 'y-axis')
     .call(d3.axisLeft(y));
    */
  

     update(cpu);
  });


  function update(cpu){

    // clean and transform the data coming from the api //
    let dataValues = {}
    const keys = Object.keys(cpu.computation);

    for (key in keys){
      let transformedData = cpu.computation[keys[key]].map((item, index) => ({
        seconds: index,
        cputime: item['core-cpu-%-utilization'],
        avgtime: item['core-%-avg-utilization']
      }));

      dataValues[key] = transformedData;
    }

    x.domain(
      d3.extent(dataValues[0], d => d.seconds)
    )
    svg
     .append('g')
     .attr('transform', 'translate(0,' + height + ')')
     .attr('class', 'x-axis')
     .call(d3.axisBottom(x));

    y.domain([0, d3.max(dataValues[0], d => d.cputime)])
    svg
     .append('g')
     .attr('class', 'y-axis')
     .call(d3.axisLeft(y));

     y1.domain([0, d3.max(dataValues[0], d => d.avgtime)])


     svg.append("path")
      .datum(dataValues[0])
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(d.seconds) })
        .y(function(d) { return y(d.cputime) })
        //.y1(function(d) { return y1(d.avgtime)})
        )

    
    /*svg
     .selectAll('.line')
     .remove()
     .exit()
     .append('path')
     .data(dataValues[0])
     .enter()
     //.append('line')
     .attr('class', 'line')
     .attr("d", d3.line()
      .x(function(d) { return x(d.seconds)})
      .y(function(d) { return y(d.cputime)})
     )
     .attr('x', d => {
       return x(d.seconds);
     })
     .attr('width', x.bandwidth())
     .attr('y', d => {
       return y(d.cputime)
     })
     .attr('height', d => {
       return height - y(d.cputime)
     })
     */
     .on('mousemove', d => {
       tip
        .style('postion', 'absolute')
        .style('left', `${d3.event.pageX + 10}px`)
        .style('top', `${d3.event.pageY + 20}px`)
        .style('display', 'inline-block')
        .style('opacity', '0.9')
        .html(
          `<div><strong>${d.seconds}</strong></div> <span>${d.cputime} cpu</span>`
        );
     })

     .on('mouseout', () => tip.style('display', 'none'));

     svg.select('.x-axis').call(d3.axisBottom(x));

     // update the y-axis
     svg.select('.y-axis').call(d3.axisLeft(y));
      
    

  }

  // pusher for real time updates //
  const pusher = new Pusher('972bc911e2d469152d3a', {
    cluster: 'eu',
    encrypted: true,
  });

  const channel = pusher.subscribe('cpu-channel');
  channel.bind('update-cpu', data => {
    update(data.computation);
  });





