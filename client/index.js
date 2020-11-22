document.addEventListener('DOMContentLoaded', function() { // on load get all data
    fetch('http://localhost:5000/getAll')
        .then(response => response.json())
        .then(data => drawMap(data['data']))
})

// initial map parameters
// var initBounds = [[36.015297, -27.740475], [67.142511, 52.458929]]
var initBounds = [[32.709339, -33.410214], [67.210695, 38.660096]]
var maxBounds = [[19.658785, -48.000057],[71.730102, 62.273429]]
var center = [49.934770, 15.707357]
var pointCol = '#edf4ff'//'#038cfc'//'#fdfd96'//'#be80d1'
var hoverCol = '#fb00ff'//'#038cfc'


function drawMap(data) {
    var map = L.map('mapid', {maxBounds: maxBounds}
    ).setView(center, 1).fitBounds(initBounds); // define map

    map.on("moveend", update)
    // add mapbox layer
    L.tileLayer('https://api.mapbox.com/styles/v1/rowlandwilliams/ckhkeiflu56e419pbph5e7mtp/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/dark-v10',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1Ijoicm93bGFuZHdpbGxpYW1zIiwiYSI6ImNraGc1cXp2czBlN3Yyc21jenF3M2IyYWsifQ.DkDGn7ISV3RWYrhzTJpZ1w'
    }).addTo(map);

    L.svg().addTo(map) // add svg to map

    var svg = d3.select('#mapid') // define svg
      .select('svg')

    var voronoiGroup = svg.append("g") // define g path for voronoi
      .attr("class", "voronoi");

    var g = svg.append("g").attr("class", "leaflet-zoom-hide"); // path for points


    var color = d3.scaleOrdinal().domain(data)
        .range(d3.schemeTableau10)

    var info = L.control() // add stats controller
            
    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    }

    info.update = function (e) {
        if (e === undefined) {
            this._div.style.opacity = 0;
            return;
        }
            this._div.style.opacity = 1;
            this._div.innerHTML = '<h4>Nearest Wave</h4>'
        +  '<span style="font-weight:bold;">' + e.name + '</span><br/>'
        + '<div class="countryBox"><span>' + e.country + '</span>' + '<div class="box" style="background-color:' + color(e.country) +'"></div></div>'


        }
        
    info.addTo(map);

    var about = L.control({position:'bottomleft'}); // add about controller

    about.onAdd = function(map) {
        var container = L.DomUtil.get('about')
        return container
    }
    
    about.addTo(map)

    update();

    function update() {
        // get current map bounds
        var bounds = map.getBounds(),
        topLeft = map.latLngToLayerPoint(bounds.getNorthWest())
        bottomRight = map.latLngToLayerPoint(bounds.getSouthEast())
        
        var positions = [];     

        data.forEach(function(d) { // redefine positions
            positions.push({
                name: d.name,
                country: d.country,
                x : map.latLngToLayerPoint([d.lat, d.lon]).x,
                y: map.latLngToLayerPoint([d.lat, d.lon]).y
            })
        })

        var voronoi = d3.voronoi()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })
            .extent([[topLeft.x, topLeft.y],[bottomRight.x, bottomRight.y]])

        var v = voronoi(positions) 

        voronoiGroup.selectAll('path').remove() // remove any old paths
        let paths = voronoiGroup.selectAll('point-cell')
            .data(v.polygons())
            .enter().append('path')
            .attr('class', 'point-cell')
            .attr('d', function(d) { return d ? "M" + d.join('L') + "Z" : null; })
            .on('mousemove', mousemove)
            .on('mouseleave', mouseleave)
            

        g.selectAll('.point').remove() // remove old points
        let points = g.selectAll('point') // add new
                .data(data)
                .enter()
                .append('circle')
                .attr('cx', function(d) { return map.latLngToLayerPoint([d.lat, d.lon]).x })
                .attr('cy', function(d) { return map.latLngToLayerPoint([d.lat, d.lon]).y })
                .attr('r', 2)
                .attr('class', 'point')
                .style('stroke-width', 0)
                .style('stroke-opacity', 0.2)
                .style('stroke',  pointCol)//d => color(d.country))
                .style('fill', pointCol)//d => color(d.country))
               

        // add tooltip 
        var site = null;
        const radius = 1000

    
        function mousemove(d) {
            var mouse = d3.mouse(this);
            var newsite = v.find(mouse[0], mouse[1], radius); // match mouse position to voroni grid
            
            if (newsite !== site) {
                if (site) mouseout(site);
                site = newsite;
                if (site) mouseover(site);
            }

            function mouseover(d) {
                info.update(d.data)
                var col = color(d.data.country);

                points.filter((x,i) => i == newsite.index).raise()
   
                points
                .transition()
                    .style('fill', (d,i) => i == newsite.index ? hoverCol : pointCol)
                    .style('stroke-width', (d,i) => i == newsite.index ? 10 : 0)
                    .attr('r', (d,i) => i == newsite.index ? 4 : 2)

            
                paths
                .transition()
                    .style('fill', function(d,i) { 
                        return i == newsite.index ? col : null})
                    .style('opacity', (d,i) => i == newsite.index ? 0.8 : 1 )
            }
        
            function mouseout(d) {
                points
                .transition()
                    .style('fill', pointCol)
                    .style('stroke-width', 0)
                    .attr('r', 2)
                    
                paths
                .transition()
                    .style('fill', 'none')
                    .style('opacity', 0)
                    
            }
        }

        function mouseleave(d) {
            info.update()
            points
            .transition()
                .style('fill', pointCol)
                .style('stroke-width', 0)
                .attr('r', 2)
            paths
            .transition()
                .style('fill', 'none')
                .style('opacity', 1)
        }

}}


    











