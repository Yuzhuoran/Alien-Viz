var stack_svg = d3.select('#stack');
var heat_svg = d3.select('#heat');
var map_svg = d3.select('#map');
var duration_svg = d3.select('#duration');
var sankey_svg = d3.select('#sankey');

var svgWidth = +stack_svg.attr('width');
var svgHeight = +stack_svg.attr('height');

var padding = {t: 40, r: 40, b: 40, l: 40};

var cellpadding = 10;
var heatCellsize = 30;

var colorCellsize = 5;
var colorCellpadding = 1;

var HeatCell = function(colors) {
    this.colors = colors;
}



var validate = function(data) {
    if (data.country != 'us') {
        return false;
    }
    if (data.duration >= 100000) {
        return false;
    }
    for (var key in data) {
        if (data[key] == '') {
            return false;
        }
    }
    return true;
}
d3.queue()
    .defer(d3.csv, '/data/filter_color.csv', (row) => {
        var data = {
            'date': new Date(row['datetime']),
            'city': row['city'],
            'state': row['state'],
            'country': row['country'],
            'shape': row['shape'],
            'duration': +row['duration (seconds)'],
            'comments': row['comments'],
            'lat': +row['latitude'],
            'lng': +row['longitude '],
            'color': row['color']
        }
        if (validate(data)) {
            return data;
        }
    })
    .defer(d3.json, '/data/gz_2010_us_040_00_500k.json')
    .await(readyToDraw);

function readyToDraw(error, dataset, states) {
    if (error) {
        console.error("can't load dataset");
    }
    //console.log(dataset);
    events = dataset;
    // draw stack function
    
    var colorData = processStackData(dataset);
    drawStack(colorData);

    // draw heat map below
    var heatData = processHeatData(dataset);
    drawHeat(heatData);

    drawDuration(dataset);

    drawSankey(dataset);

    // draw the map figure
    var projection = d3.geoAlbersUsa();

    var path = d3.geoPath()
        .projection(projection);

    events = events.filter(d => projection([d.lng, d.lat]) != null)

    console.log(events.length);

    map_svg.selectAll('path')
        .data(states.features)
        .enter()
        .append('path')
        .attr('d', path)
        .style('fill', 'gray');

    map_svg.selectAll('.event-point')
        .data(events)
        .enter()
        .append('circle')
        .attr('cx', d => projection([d.lng, d.lat])[0])
        .attr('cy', d => projection([d.lng, d.lat])[1])
        .attr('r', 1.5)
        .style('fill', d => d.color)
        .style('fill-opacity', 0.6)
}


var processStackData = function(data) {
    // return [items], where items: ['date', 'colors'..]
    var type = ['white','orange', 'red', 'green', 'blue', 'black', 'silver', 'yellow'];
    // count the appearance 
    var colorsData = data.reduce((newData, oldData) => {
        var color = oldData.color;
        var day = oldData.date.getFullYear();
        if (day in newData) {
            if (color in newData[day]) {
                newData[day][color]++;
            } else {
                newData[day][color] = 1;
            }
        } else {
            newData[day] = {};
            type.forEach((d) => newData[day][d] = 0)
            newData[day][color]++;
        }
        return newData;
    }, {});
    result = [];
    for (var key in colorsData) {
        var item = {
            'date': +key
        }
        for (var v in colorsData[key]) {
            item[v] = colorsData[key][v];
        }
        result.push(item);
    }
    return result;
}

var drawStack = function(colorData) {
       // maxCount for some year
    var maxSumCount = d3.max(colorData, (d) => {
        var vals = d3.keys(d).map((key) => {
            return key !== 'date' ? d[key] : 0;
        });
        return d3.sum(vals);
    });

    // set x, y scale
    var xScale = d3.scaleLinear()
        .domain(d3.extent(colorData, (d) => {
            return d.date;
        }))
        .range([padding.l, svgWidth - padding.r]);
    
    var yScale = d3.scaleLinear()
        .domain([0, maxSumCount])
        .range([svgHeight - padding.b, padding.t]);
    
    var xAxis = d3.axisBottom()
        .scale(xScale);
    
    var yAxis = d3.axisLeft()
        .scale(yScale)
    
    var stack = d3.stack();

    var area = d3.area()
        .x((d) => xScale(d.data.date))
        .y0((d) => yScale(d[0]))
        .y1((d) => yScale(d[1]));

    var keys = [ 'white','red', 'yellow','black',  'silver','blue', 'green', 'orange'];
    stack.keys(keys);
    stack.order(d3.stackOrderNone);
    stack.offset(d3.stackOffsetNone);

    //console.log(stack(colorData));
    var events = stack_svg.selectAll('.event')
        .data(stack(colorData))
        .enter()
        .append('g')
        .attr('class', (d) => d.key + ' event');
    
    events.append('path')
        .attr('class', 'area')
        .attr('d', area)
        .style('fill', (d) => d.key);

    stack_svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + (svgHeight - padding.b) + ')')
        .call(xAxis);
    
    stack_svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(' + padding.l + ',0)')
        .call(yAxis);
}

var processHeatData = function(data) {
    // month, day, 
    // 3 * 3 cell
    var type = ['white','orange', 'red', 'green', 'blue', 'black', 'silver', 'yellow'];
    var heatData = data.reduce((newData, oldData) => {
        var color = oldData.color;
        var day = (oldData.date.getMonth() + 1) + ',' + oldData.date.getDate();
        if (day in newData) {
            if (color in newData[day]) {
                newData[day][color]++;
            } else {
                newData[day][color] = 1;
            }
        } else {
            newData[day] = {};
            type.forEach((d) => newData[day][d] = 0)
            newData[day][color]++;
        }
        return newData;
    }, {});
    //console.log(heatData);
    var result = [];
    for (var key in heatData) {
        var month = key.split(',')[0];
        var day = key.split(',')[1];
        if (day == '31') {
            continue;
        }
        var item = {
            'month': +month,
            'day': +day
        }
        for (var v in heatData[key]) {
            item[v] = heatData[key][v];
        }
        result.push(item);
    }
    return result;
}

var drawHeat = function(heatData) {

    console.log(heatData);

    var cells = [];
    heatData.forEach((d) => {
        cells.push(new HeatCell(d))
    });

    var heatMaxColor = d3.max(heatData, (d) => {
        var vals = d3.keys(d).map((key) => {
            if (key == 'month' || key == 'day') {
                return 0;
            }
            return d[key];
        });
        //console.log(vals);
        return d3.max(vals);
    });
    console.log(heatMaxColor);

    var opacityScale = d3.scaleLinear().domain([0, heatMaxColor]);

    HeatCell.prototype.init = function(g, data) {

        //console.log(data);
        // get the left-upper corner position
        var month = +data.colors.month;
        var day = +data.colors.day;
        var startPoint = {
            'col': day * heatCellsize + cellpadding,
            'row': month * heatCellsize + cellpadding 
        };
        var colorCellPositions = [];
        var d = colorCellsize + colorCellpadding * 2;
        for (var i = 0; i <= 2; i++) {
            for (var j = 0; j <= 2; j++) {
                colorCellPositions.push(
                    {
                        'col': startPoint.col + i * d,
                        'row': startPoint.row + j * d
                    }
                )
            }
        }
        var items = [];
        for(var key in data.colors) {
            if (key == 'month' || key == 'day') {
                continue;
            }
            items.push({'color':key, 'value': data.colors[key]})
        }
        items.push({'color': 'unknown', 'value': 0});
        for (var i = 0; i < items.length; i++) {
            items[i].row= colorCellPositions[i].row;
            items[i].col = colorCellPositions[i].col;
        }

        //console.log(items);

        var cell = d3.select(g);

        var rects = cell.selectAll('.color-cell')
            .data(items, d => d.row + "-" + d.col)

        var rectsEnter = rects.enter()
            .append('rect')
            .attr('class', 'color-cell')
            .attr('x', d => d.col)
            .attr('y', d => d.row)
            .attr('width', colorCellsize)
            .attr('height', colorCellsize)
            .style('fill', d => d.color == 'unknown' ? 'gray':d.color)
            .style('fill-opacity', d => opacityScale(d.color == 'unknown' ? 5: d.value))
    }

    var cellEnter = 
        heat_svg.selectAll('.cell')
            .data(cells)
            .enter()
            .append('g')
            .attr('class', 'cell')
    
    cellEnter.each(function(cell){
        cell.init(this, cell);
    });

    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    days = d3.range(1, 31);

    var xScale = d3.scaleLinear()
        .domain([1, 31])
        .range([cellpadding, heatCellsize * 31])

    var yScale = d3.scaleLinear()
        .domain([1, 12])
        .range([cellpadding, heatCellsize * 12])

    var xAxis = d3.axisTop()
        .scale(xScale);
    
    var yAxis = d3.axisLeft()
        .scale(yScale)
        .tickValues(months);
    
    heat_svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(' + (heatCellsize) + 
            ',' + (heatCellsize) + ')')
        .call(xAxis);

    heat_svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(' + (heatCellsize) + 
        ',' + (heatCellsize) + ')')
        .call(yAxis);
}

var drawDuration = function(data) {
    var barWidth = 1;
    var barHeight = 30;
    var barpadding = 1;

    var keys = ['white', 'red', 'yellow','black', 'silver','blue', 'green', 'orange'];
    var heightMap = {};
    for (var i = 0; i < keys.length; i++) {
        heightMap[keys[i]] = i * (barHeight + barpadding);
    }

    var xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.duration))
        .range([padding.l, svgWidth - padding.r]);

    var yScale = d3.scaleLinear()
        .domain([217, 0])
        .range([padding.t, svgHeight - padding.b]);

    console.log(heightMap);

    duration_svg.selectAll('.color-bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'color-bar')
        .attr('x', d => xScale(d.duration))
        .attr('y', d => yScale(heightMap[d.color]))
        .attr('width', barWidth)
        .attr('height', barHeight)
        .style('fill', d => d.color)
        .style('fill-opacity', 0.05)
        
}

var drawSankey = function(data) {
    var shapeTransform = {
        'changing':'changing',
        'chevron': 'chevron',
        'cigar': 'cigar',
        'circle': 'circle',
        'cylinder': 'cylinder',
        'diamond': 'diamond',
        "disk": 'disk',
        "fireball": "fireball",
        "formation": 'formation',
        "light": 'light',
        "oval": 'oval',
        "rectangle": 'rectangle',
        "teardrop": 'teardrop',
        "triangle": 'triangle',
        "other": 'other',
        "sphere": 'circle',
        'flash':'light'
    }
    var colors = ['white', 'red', 'yellow','black', 'silver','blue', 'green', 'orange'];
    // source, target, count
    var temp = {};
    data.forEach((d) => {
        var color = d.color;
        var shape = d.shape;
        if (shape in shapeTransform) {
            shape = shapeTransform[shape];
            var key = color + ',' + shape;
            if (key in temp) {
                temp[key]++;
            } else {
                temp[key] = 1;
            }
        }
    })
    var nodeCollection = {};
    var nodes = [];
    var links = [];
    for (var key in temp) {
        var source = key.split(',')[0];
        var target = key.split(',')[1];
        var value = temp[key];
        if (!(source in nodeCollection)) {
            nodeCollection[source] = true;
            nodes.push({'name': source});
        }
        if (!(target in nodeCollection)) {
            nodeCollection[target] = true;
            nodes.push({'name': target});
        }
        links.push({
            'source': source,
            'target': target,
            'value': value,
            'color': source
        })
    }

    
    var nodePosition = {};
    var i;
    for (i = 0; i < nodes.length; i++) {
        nodePosition[nodes[i].name] = i;
    }
    links.forEach((d, i) => {
        links[i].source = nodePosition[links[i].source]
        links[i].target = nodePosition[links[i].target]
    })
    
    console.log(links)
    console.log(nodes);
    
    
    var sankey = d3.sankey()
        .nodeWidth(30)
        .nodePadding(5)
        .size([svgWidth - padding.l - padding.r, svgHeight - padding.t - padding.b])

    graph = sankey.nodes(nodes).links(links)();

    console.log(graph)
    
    sankey_svg.append('g')
        .attr('stroke', '#000')
        .selectAll('.node')
        .data(graph.nodes)
        .enter()
        .append('rect')
        .attr('class', 'node')
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('height', d => d.y1 - d.y0)
        .attr('width', sankey.nodeWidth())
        .append('title')
        .text(d => d.name)
        

    var linkSelection = 
        sankey_svg.append('g')
            .attr('fill', 'none')
            .attr('stroke-opacity', 0.5)
            .selectAll('.link')
            .data(graph.links)
            .enter()

    linkSelection
        .append('path')
        .attr('class', 'link')
        .attr('d', d3.sankeyLinkHorizontal())
        .style('stroke-width', d => Math.max(1, d.width))
        .style('fill', d => d.color)
        .style('fill-opacity', 0.8)
        



        


}