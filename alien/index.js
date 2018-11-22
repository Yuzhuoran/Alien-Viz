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

var stateMapping =
{
    'Alabama': 'AL',
    'Alaska': 'AK',
    'American Samoa': 'AS',
    'Arizona': 'AZ',
    'Arkansas': 'AR',
    'California': 'CA',
    'Colorado': 'CO',
    'Connecticut': 'CT',
    'Delaware': 'DE',
    'District Of Columbia': 'DC',
    'Federated States Of Micronesia': 'FM',
    'Florida': 'FL',
    'Georgia': 'GA',
    'Guam': 'GU',
    'Hawaii': 'HI',
    'Idaho': 'ID',
    'Illinois': 'IL',
    'Indiana': 'IN',
    'Iowa': 'IA',
    'Kansas': 'KS',
    'Kentucky': 'KY',
    'Louisiana': 'LA',
    'Maine': 'ME',
    'Marshall Islands': 'MH',
    'Maryland': 'MD',
    'Massachusetts': 'MA',
    'Michigan': 'MI',
    'Minnesota': 'MN',
    'Mississippi': 'MS',
    'Missouri': 'MO',
    'Montana': 'MT',
    'Nebraska': 'NE',
    'Nevada': 'NV',
    'New Hampshire': 'NH',
    'New Jersey': 'NJ',
    'New Mexico': 'NM',
    'New York': 'NY',
    'North Carolina': 'NC',
    'North Dakota': 'ND',
    'Northern Mariana Islands': 'MP',
    'Ohio': 'OH',
    'Oklahoma': 'OK',
    'Oregon': 'OR',
    'Palau': 'PW',
    'Pennsylvania': 'PA',
    'Puerto Rico': 'PR',
    'Rhode Island': 'RI',
    'South Carolina': 'SC',
    'South Dakota': 'SD',
    'Tennessee': 'TN',
    'Texas': 'TX',
    'Utah': 'UT',
    'Vermont': 'VT',
    'Virgin Islands': 'VI',
    'Virginia': 'VA',
    'Washington': 'WA',
    'West Virginia': 'WV',
    'Wisconsin': 'WI',
    'Wyoming': 'WY'
}

var sankey = d3.sankey()
    .nodeWidth(30)
    .nodePadding(5)
    .size([svgWidth - padding.l - padding.r, svgHeight - padding.t - padding.b])


months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
days = d3.range(1, 31);

var updated;
var selectedState;


// Creates a bootstrap-slider element
$("#yearSlider").slider({
    tooltip: 'always',
    tooltip_position:'bottom'
});
// Listens to the on "change" event for the slider
$("#yearSlider").on('change', function(event){
    // Update the chart on the new value
    updateYear(event.value.newValue);
});

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
        var date = new Date(row['datetime']);
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
            'color': row['color'],
            'year': date.getFullYear(),
            'month': date.getMonth() + 1,
            'day': date.getDate(),
            'hour':date.getHours()
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
    var counter = 0;

    events = dataset; 
    updated = events;   
    events.forEach(d => {
        if (d.color == 'unknown') {
            counter++;
        }
    });
    console.log('unkown count: ' + counter)

    initStack();
    initHeat()
    initMap(states);
    initSankey();
    updateYear([1920, 2018])
    drawDuration(events);
    console.log(events.length);
}

var initMap = function(states) {
    var projection = d3.geoAlbersUsa();
    var path = d3.geoPath()
        .projection(projection);
    var stateNames = [];
    states.features.forEach(
        d => stateNames.push(d.properties.NAME)
    );
    console.log(stateNames)
    map_svg.selectAll('path')
        .data(states.features)
        .enter()
        .append('path')
        .attr('d', path)
        .style('fill', 'gray')
        .on('click', d => {
            updateState(d.properties.NAME);
        });
    var stateShort = {}
    events.forEach(d => {
        if (!(d.state in stateShort)) {
            stateShort[d.state] = true;
        }
    })
    console.log(stateShort);

}
var drawMap = function(points) {
    var projection = d3.geoAlbersUsa();
    points = points.filter(d => projection([d.lng, d.lat]) != null)
    
    var mapPoint = map_svg.selectAll('.event-point')
        .data(points, d => d.lat + '-' + d.lng)
    
    mapPoint.enter()
        .append('circle')
        .attr('class', 'event-point')
        .merge(mapPoint)
        .attr('cx', d => projection([d.lng, d.lat])[0])
        .attr('cy', d => projection([d.lng, d.lat])[1])
        .attr('r', 1.5)
        .style('fill', d => d.color)
        .style('fill-opacity', 0.6);

    mapPoint.exit().remove();
}

var processStackData = function(data) {
    // return [items], where items: ['date', 'colors'..]
    var type = ['white','orange', 'red', 'green', 'blue', 'black', 'silver', 'yellow'];
    // count the appearance 
    var colorsData = data.reduce((newData, oldData) => {
        var color = oldData.color;
        var day = oldData.year;
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

var initStack = function() {

    stack_svg.append('g')
        .attr('class', 'stack-x-axis')
        .attr('transform', 'translate(0,' + (svgHeight - padding.b) + ')')
    
    stack_svg.append('g')
        .attr('class', 'stack-y-axis')
        .attr('transform', 'translate(' + padding.l + ',0)')

}

var initHeat = function() {
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

var initDuration = function() {

}

var drawStack = function(colorData) {
       // maxCount for some year
    var maxSumCount = d3.max(colorData, (d) => {
        var vals = d3.keys(d).map((key) => {
            return key !== 'date' ? d[key] : 0;
        });
        return d3.sum(vals);
    });

    var yearValue = d3.select('#yearSlider').node().value;
    var start = +yearValue.split(',')[0];
    var end = +yearValue.split(',')[1];

    var xScale = d3.scaleLinear()
        .domain([start, end])
        .range([padding.l, svgWidth - padding.r]);

    var yScale = d3.scaleLinear()
        .domain([0, maxSumCount])
        .range([(svgHeight - padding.b), padding.t]);

    var xAxis = d3.axisBottom()
        .scale(xScale);
    
    var yAxis = d3.axisLeft()
        .scale(yScale)
    
    var keys = [ 'white','red', 'yellow','black',  'silver','blue', 'green', 'orange'];
    var stack = d3.stack();

    var area = d3.area()
        .x((d) => xScale(d.data.date))
        .y0((d) => yScale(d[0]))
        .y1((d) => yScale(d[1]));

    stack.keys(keys);
    stack.order(d3.stackOrderNone);
    stack.offset(d3.stackOffsetNone);

    var stackArea = stack_svg.selectAll('.event')
        .data(stack(colorData), d => d.color + ' area');

    stackArea.exit().remove();
    
    stackArea.enter()
        .append('g')
        .attr('class', 'event')
        .merge(stackArea)
        .append('path')
        .attr('d', area)
        .style('fill', (d) => d.key);

    stack_svg.select('.stack-x-axis')
        .transition()
        .call(xAxis);
    
    stack_svg.select('.stack-y-axis')
        .transition()
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
            // filter color, if not selected set the value to be zero
            item[v] =  heatData[key][v];
        }
        result.push(item);
    }
    return result;
}

var drawHeat = function(heatData) {
    HeatCell.prototype.update = function(g, data) {

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

        rects.enter()
            .append('rect')
            .attr('class', 'color-cell')
            .attr('x', d => d.col)
            .attr('y', d => d.row)
            .attr('width', colorCellsize)
            .attr('height', colorCellsize)
            .merge(rects)
            .style('fill', d => d.color == 'unknown' ? 'gray':d.color)
            .style('fill-opacity', d => opacityScale(d.color == 'unknown' ? 5: d.value)) 

        rects.exit().remove();

    }
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
    var opacityScale = d3.scaleLinear().domain([0, heatMaxColor]);

    var cells = [];
    heatData.forEach(d => cells.push(new HeatCell(d)));
    var heatCell = heat_svg.selectAll('.cell')
            .data(cells, d => d.month + '-' + d.day)

    var heatCellEnter = heatCell.enter()
        .append('g')
        .attr('class', 'cell')
    heatCellEnter.each(function(cell){
        cell.update(this, cell);
    });

    heatCell.exit().remove();

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

var processSankeyData = function(data) {
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
    sankey.nodes(nodes).links(links);
    return sankey();
}

var initSankey = function() {
    sankey_svg.append('g')
        .attr('stroke', '#000')
        .attr('class', 'node-group')

    sankey_svg.append('g')
        .attr('fill', 'none')
        .attr('stroke-opacity', 0.5)
        .attr('class', 'link-group')


}
var drawSankey = function(graph) {
    //console.log(data);


    //var graph = sankey.nodes(data.nodes).links(data.links)();

    var nodes = sankey_svg.select('.node-group')
        .selectAll('.node')
        .data(graph.nodes)

    nodes.enter()
        .append('rect')
        .attr('class', 'node')
        .merge(nodes)
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('height', d => d.y1 - d.y0)
        .attr('width', 30)
        .append('title')
        .text(d => d.name);

    nodes.exit().remove();
    
    var links = sankey_svg.select('.link-group')
            .selectAll('.link')
            .data(graph.links)
            
    links.enter()
        .append('path')
        .attr('class', 'link')
        .merge(links)
        .attr('d', d3.sankeyLinkHorizontal())
        .style('stroke', d => d.color)
        .style('stroke-width', d => Math.max(1, d.width))
        .style('stroke-opacity', 0.8);

    links.exit().remove();
}

var changeColor = function() {
    var selectedColor = d3.select("#colorSeletor").node().value; 
    console.log('change color to ' + selectedColor);
    var heatData = processHeatData(updated)
    var heatMaxColor = d3.max(heatData, (d) => {
        var vals = d3.keys(d).map((key) => {
            if (key != selectedColor && selectedColor != 'all') {
                return 0;
            }
            return d[key];
        });
        //console.log(vals);
        return d3.max(vals);
    });

    console.log(heatMaxColor)

    var opacityScale = d3.scaleLinear().domain([0, heatMaxColor]);
    heat_svg.selectAll('.cell').selectAll('.color-cell')
        .style('fill-opacity', d => {
            return (d.color == selectedColor || selectedColor == 'all') ? opacityScale(d.value) : 0;
        });
    map_svg.selectAll('.event-point').style('fill-opacity', d => 
        (d.color == selectedColor || selectedColor == 'all') ? 0.6 : 0);
    sankey_svg.selectAll('.link').style('stroke', d => 
        (d.color == selectedColor || selectedColor == 'all') ? d.color : 'gray')
    
}

var updateYear = function(yearValue) {
    updated = events.filter(d => d.year <= yearValue[1] 
        && d.year >= yearValue[0]);
    updateData();

}

var updateState = function(state) {
    var yearValue = d3.select('#yearSlider').node().value;
    selectedState = stateMapping[state].toLowerCase();
    var start = +yearValue.split(',')[0];
    var end = +yearValue.split(',')[1];
    updated = events.filter(d => d.year <= end 
        && d.year >= start && d.state == selectedState) ;
    updateData();
}

var updateData = function() {
    drawStack(processStackData(updated));
    drawHeat(processHeatData(updated));
    drawMap(updated);
    drawSankey(processSankeyData(updated));
    changeColor();
}
