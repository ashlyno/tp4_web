// Script for drawing interactive line chart
$(function() {
    'use strict';

    /* ********************************** Initial graph settings  ********************************** */
    // Graph margin settings
    var margin = {
        top: 10,
        right: 120,
        bottom: 50,
        left: 80
    };

    // Set default countries
    var selectedCountries = ["Australia", "Austria"];
    var selectedData = [];

    // SVG width and height
    var width = 960;
    var height = 500;

    // Graph width and height - accounting for margins
    var drawWidth = width - margin.left - margin.right;
    var drawHeight = height - margin.top - margin.bottom;

    /* ********************************** Append static elements  ********************************** */
    // Append svg to hold elements
    var svg = d3.select("svg")
        .attr('width', width)
        .attr('height', height);

    // Append g for holding chart markers
    var g = svg.append("g")
        .attr('id', 'graph')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // xAxis labels
    var xAxisLabel = g.append("g")
        .attr('transform', 'translate(0,' + drawHeight + ')')
        .attr('class', 'axis')

    // xAxis Text
    g.append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'translate(' + (drawWidth / 2) + ',' + (drawHeight + margin.top + 40) + ')')
        .style('text-anchor', 'middle')
        .text("Year")

    // yAxis labels
    var yAxisLabel = g.append("g")
        .attr('class', 'axis')

    g.append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (drawHeight / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text("CO2 Emissions (in units of kilotonne CO2 equivalent)")
        
    // Apend an overlay rectangle to catch hover events
    var overlay = g.append('rect')
        .attr("class", "overlay")
        .attr('width', drawWidth)
        .attr('height', drawHeight);

    // Load data in using d3's csv function
    d3.csv('data/un_co2_data.csv', function(error, data) {

        /* ********************************** Data prep  ********************************** */

        // Nest the data by `country_area` to create an **array of objects**, one for each **country**
        var dataByCountry = d3.nest()
            .key(function(d) {
                return d.country_area;
            })
            .entries(data);

        // Get a unique list of countries to make selector
        var uniqCountries = dataByCountry.map(function(d) {
            return d.key
        });

        // function for filtering data based on selected countries
        function filterData() {
            selectedData = dataByCountry.filter(function(d) {
                return selectedCountries.indexOf(d.key) > -1
            })
        }

        /* ********************************** Country selector  ********************************** */

        // Create a country selector menu     
        var countrySelector = $('#countrySelect');

        // fill in select menu
        uniqCountries.forEach(function(d) {
            var newOption = new Option(d, d);
            countrySelector.append(newOption);
        });

        // Set default selector countries in menu
        countrySelector.val(selectedCountries);

        /* ********************************** Define scale and axis variables  ********************************** */

        // Create an ordinal color scale for coloring lines
        var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        // Global scale and axis variables
        var xFormat = d3.format("d");
        var yFormat = d3.format('.2s')
        var xScale = d3.scaleLinear();
        var yScale = d3.scaleLinear();
        var xAxis = d3.axisBottom().tickFormat(xFormat);;
        var yAxis = d3.axisLeft().tickFormat(yFormat);


        /* ********************************** Functions for setting scales and axes  ********************************** */

        // function for setting scales based on given data
        function setScales() {
            // Get set of all values
            var allValues = [];
            selectedData.forEach(function(d) {
                d.values.forEach(function(d) {
                    allValues.push(+d.value);
                });
            });

            // Reset xScale
            var xExtent = d3.extent(selectedData[0].values, function(d) {
                return +d.year;
            });
            xScale.domain([xExtent[0], xExtent[1]]).rangeRound([0, drawWidth]);

            // Reset yScale
            var yExtent = d3.extent(allValues);
            yScale.domain([yExtent[0] * 0.9, yExtent[1] * 1.1]).rangeRound([drawHeight, 0]);

            // Reset color scale to current set of countries
            colorScale.domain(selectedCountries);
        }

        function setAxes() {
            xAxis.scale(xScale);
            yAxis.scale(yScale);

            xAxisLabel.transition().duration(1000).call(xAxis);
            yAxisLabel.transition().duration(1000).call(yAxis);
        }


        /* ********************************** Function for calculating line path  ********************************** */

        // Define a line function that will return a `path` element based on data
        // hint: https://bl.ocks.org/mbostock/3883245

        var line = d3.line()
                          .x(function(d) {return xScale(+d.year)})
                          .y(function(d){return yScale(+d.value)});

        /* ********************************** Function for drawing lines  ********************************** */

        // function for drawing graph
        function draw(data) {
            // Set your scales and axes
            setScales(data);
            setAxes();
            // Do a datajoin between your path elements and the data passed to the draw function
            // Make sure to set the identifying key
            var countries = g.selectAll('.countries')
                             .data(data, function(d){
                                 return d.key;
                             });

            // Handle entering elements (see README.md)
            countries.enter()
                     .append('path')
                     .attr('class', 'countries')
                     .attr('d', function(d) {
                         return line(d.values)})
                     .attr('fill', 'none')
                     .attr('stroke-width', 1.5)
                     .attr('stroke', function(d){
                            return colorScale(d.key)
                     })
                     .attr('stroke-dasharray', function(d) {
                        var l = d3.select(this).node().getTotalLength();
                        return l + ' ' + l
                    })
                     .attr('stroke-dashoffset', function(d){
                            return -d3.select(this).node().getTotalLength()
                     })
                     .transition()
                     .duration(2000)
                    .attr('stroke-dashoffset', function(d){
                            return 0;
                     });
            // Handle updating elements (see README.md)
            countries//.merge(countries)
                    .attr('stroke-dasharray', 'none')
                    .transition()
                    .duration(2000)
                    .attr('d', function(d) {
                         return line(d.values)});

            // Handle exiting elements (see README.md)
            countries.exit()
                    .transition()
                    .duration(2000)
                    .attr('stroke-dashoffset', function(d) {
                        return -d3.select(this).node().getTotalLength()
                    })
                    .attr('stroke-dasharray', function(d){
                        var l = d3.select(this).node().getTotalLength();
                        return (l + " " + l);
                    })
                    .remove();
        }

        /* ********************************** Function for drawing hovers (circles/text)  ********************************** */
        // Function to draw hovers (circles and text) based on year (called from the `overlay` mouseover)
        function drawHovers(year) {
            // Bisector function to get closest data point: note, this returns an *index* in your array
            var bisector = d3.bisector(function(d, x) {
                return +d.year - x;
            }).left;

            var myData = [];
            // Get hover data by using the bisector function to find the y value
            selectedData.forEach(function(d) {
                d.values.sort(function(a,b){
                    return +a.year - +b.year;
                });
                myData.push(d.values[bisector(d.values, year)]);
            });

            // Do a data-join (enter, update, exit) to draw circles
            var circles = g.selectAll('circle')
                            .data(myData, function(d){
                                return d.country_area;
                            });

            circles.enter()
                    .append('circle')
                    .merge(circles)
                    .attr("cx", function(d){
                        return xScale(d.year);
                    })
                    .attr("cy", function(d){
                        return yScale(d.value)
                    })
                    .attr("r", 5)
                    .attr('fill', 'none')
                    .attr('stroke',function(d){
                        return colorScale(d.country_area);
                    });
                circles.remove().exit();

            // Do a data-join (enter, update, exit) draw text
           var texts = g.selectAll('.text')
                            .data(myData, function(d){
                                return d.country_area;
                            });

               texts.enter()
                    .append('text')
                    .attr('class','text')
                    .merge(texts)
                    .attr("x", function(d){
                        return xScale(d.year)+8;
                    })
                    .attr("y", function(d){
                        return yScale(d.value)-8;
                    })
                    .text(function(d){
                        return d.country_area + ': ' + d3.format(".3s")(d.value)});

                    texts.remove().exit();
        }

        /* ********************************** Event listener  ********************************** */

        // Filter your data and draw the initial layout
        filterData();
        draw(selectedData);
        // Assign an event listener to your overlay element
        /*
            - On mousemove, detect the mouse location and use `xScale.invert` to get the data value that corresponds to the pixel value
            
            - On mouseout, remove all the circles and text from inside the g
        */ 

        var myMouseOver = function() {
				var point = d3.mouse(this)[0];
                drawHovers(xScale.invert(point));
        }
        var myMouseOff = function() {
                g.selectAll('circle').remove();
                g.selectAll('.text').remove();
        }

        let overlay = d3.select('.overlay');
        overlay.on("mousemove", myMouseOver)
               .on("mouseout", myMouseOff);

        // event listener for country selector change
        countrySelector.change(function() {
            // Reset selected countries
            selectedCountries = [];

            // Get selected countries from selector
            $('#countrySelect option:selected').each(function() {
                selectedCountries.push($(this).text());
            });

            // Filter and draw data
            filterData();
            draw(selectedData);
        });
    });
});