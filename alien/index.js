tip = d3.tip().attr('class', 'd3-tip').html(d => d.duration);

var stack_svg = d3.select('#stack');
var heat_svg = d3.select('#heat');
var map_svg = d3.select('#map');
var duration_svg = d3.select('#duration');
var sankey_svg = d3.select('#sankey');

var stackSVG = d3.select('#stackSVG');
var stackSVGWidth = +stackSVG.attr('width');
var stackSVGheighth = +stackSVG.attr('height');

var heatSVG = d3.select('#heatSVG');
var heatSVGWidth = +heatSVG.attr('width');
var heatSVGHeight = +heatSVG.attr('height');

var heatpadding = {t: 300, l: 151, r:151, b:151};
var heatFilterpadding = {t: 120, l: 151, r: 151, b:650}
var heatFilterInnerHeight = heatSVGHeight - heatFilterpadding.t - heatFilterpadding.b;

var heatFilterInnerWidth = heatSVGWidth - heatFilterpadding.l - heatFilterpadding.r;

var heatInnerHeight = heatSVGHeight - heatpadding.t - heatpadding.b;
var heatInnerWidth = heatSVGWidth - heatpadding.l - heatpadding.r;
var heatMapHeight = heatInnerHeight / 12 * 0.52;
var heatMapWidth = heatInnerWidth / 32 * 0.48;

var mapxPadding = heatInnerWidth / 12 * 0.1;
var mapyPadding = heatInnerHeight / 31 * 0.1;

var cellWidth = (heatMapWidth) / 4.0;
var cellHeight = (heatMapHeight)/ 2.0;

var mapCellpadding = 1;

var stackpadding = {t: 300, l:151, r:151, b:191}
var stackInnerHeight = stackSVGheighth - stackpadding.t - stackpadding.b;
var stackInnerWidth = stackSVGWidth - stackpadding.l - stackpadding.r;

duration_svg.call(tip);

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

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var days = d3.range(1, 32);

var colorMapping = {
    'red' :'#ff6733',
    'orange': '#ffa600',
    'yellow': '#ffd300',
    'green': '#00e3c6',
    'blue': '#00adff',
    'white': '#ffffff',
    'silver': '#a3a3a3',
    'black': '#000000'
}
var updated;
var stackUpdated;
var heatUpdated;
var clickState;
var selectedState = 'recover';
var stackSelectedState = 'all';

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
    if (data.duration >= 5000) {
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
    events = dataset; 
    updated = events;   
    initStack();
    initHeat()
    initMap(states);
    initSankey();
    initDuration();
    updateYear([1940, 2018])
    drawDuration(events);
    console.log(events.length);
}

var initMap = function(states) {
    var projection = d3.geoAlbersUsa();
    var path = d3.geoPath()
        .projection(projection);

    map_svg.selectAll('path')
        .data(states.features)
        .enter()
        .append('path')
        .attr('d', path)
        .style('fill', 'gray')
        .on('click', d => {
            if (d === clickState) {
                updateState('recover');
                clickState = undefined;
            } else {
                clickState = d;
                updateState(d.properties.NAME);
            }
        });

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
    var type = ['black', 'silver', 'white','blue', 'green', 'yellow', 'orange', 'red'];
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
    var inner = stackSVG.append('g')
        .attr('class', 'inner')
        .attr('transform', 'translate(' + stackpadding.l + ',' + stackpadding.t + ")");
    
    inner.append('g')
        .attr('class', 'stackSVG-x-axis ticks')
        .attr('transform', 'translate(0,' + stackInnerHeight + ')');
    
    inner.append('g')
        .attr('class', 'stackSVG-y-axis ticks')
        .attr('transform', 'translate(0, 0)');

    var yearAxisStart = 300;
    var x = d3.scaleLinear()
        .domain([1940, 2014])
        .range([yearAxisStart, stackInnerWidth]);

    function dragstarted(d) {
        d3.select(this).raise().classed("active", true);
        d3.select(this).style('cursor', 'pointer');
    }
    var end = [{
        'x': stackInnerWidth,
        'y': 5,
        'r': 6
    }];

    var start = [{
        'x': yearAxisStart,
        'y': 5,
        'r': 6
    }];

    function leftDragged(d) {
        //d3.select(this).attr("cx", d3.event.x).attr("cy", d3.event.y);
        var pos = d3.event.x;
        var rightBoundary = +d3.select('#filter1end').attr('cx');
        pos = Math.min(rightBoundary, Math.max(pos, yearAxisStart));
        d3.select(this).attr('cx', d => d.x = pos)
        stackYearFilter(Math.round(x.invert(pos)), Math.round(+x.invert(rightBoundary)));
        //console.log('interval is ' + x.invert(pos) + ', ' + x.invert(rightBoundary));
    }
      
    function dragended(d) {
        d3.select(this).classed("active", false);
        d3.select(this).style('cursor', 'default');
    }

    function rightDragged(d) {
        var pos = d3.event.x;
        var leftBoundary = +d3.select('#filter1start').attr('cx');
        pos = Math.min(stackInnerWidth, Math.max(pos, leftBoundary));
        d3.select(this).attr('cx', d => d.x = pos)
        stackYearFilter(Math.round(x.invert(leftBoundary)), Math.round(+x.invert(pos)));
        //console.log('interval is ' + x.invert(leftBoundary), x.invert(pos));
    }

    var leftDrag = d3.drag();
    var rightDrag = d3.drag();

    rightDrag.on('drag', rightDragged)
        .on('start', dragstarted)
        .on('end', dragended);
    
    leftDrag.on('start', dragstarted)
        .on('end', dragended)
        .on('drag', leftDragged);

    var slider = stackSVG.append('g')
        .attr('class', 'slider')
        .attr('transform', 'translate(' + stackpadding.l + ',' + 160 + ')');

    slider.append('text')
        .attr('transform', 'translate(' + 200 + ',10)')
        .text('YEAR')
        .attr('fill', 'white');

    var dropdown = stackSVG.append('g')
        .attr('class', 'dropdown')
        .attr('transform', 'translate(' + stackpadding.l + ',' + 160 + ')');
    
    dropdown.append('text')
        .attr('transform', 'translate(0, 10)')
        .text('STATE')
        .attr('fill', 'white');

    var track = slider.append('line')
        .attr('class', 'track')
        .attr('x1', x.range()[0])
        .attr('x2', x.range()[1]);
    
    var ticks = slider.append('g')
        .attr('class', 'ticks')
        .attr('transform', 'translate(0, 4)')
        .call(d3.axisTop().scale(x));
    
    var handleLeft = slider.selectAll('.handleStart')
        .data(start)

    handleLeft.enter()
        .append('circle')
        .attr('class', 'hanldStart')
        .merge(handleLeft)
        .attr('r', d => d.r)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('id', 'filter1start')
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .attr('fill', '#868e9b')
        .call(leftDrag);

    handleLeft.exit().remove();

    var handleRight = slider.selectAll('.handleEnd')
        .data(end)

    handleRight.enter()
        .append('circle')
        .attr('class', 'hanldEnd')
        .merge(handleRight)
        .attr('r', d => d.r)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('id', 'filter1end')
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .attr('fill', '#868e9b')
        .call(rightDrag);
    
    handleRight.exit().remove();
    
}

var initHeat = function() {
    var filted = events.filter(d => d.year >= 1940 && d.year <= 2014);
    var stackData = processStackData(filted);
    var maxSumCount = d3.max(stackData, (d) => {
            var vals = d3.keys(d).map((key) => {
                return key !== 'date' ? d[key] : 0;
            });
            return d3.sum(vals);
    });

    
    var filterxScale = d3.scaleLinear() 
        .domain([1940, 2014])
        .range([0, heatFilterInnerWidth]);

    var filteryScale = d3.scaleLinear()
        .domain([0, maxSumCount])
        .range([heatFilterInnerHeight, 0]);
    
    var innerFilter = heatSVG.append('g')
        .attr('class', 'inner-filter')
        .attr('transform', 'translate(' + heatFilterpadding.l + ',' + heatFilterpadding.t + ')');
    
    innerFilter.append('g')
        .attr('class', 'heatFilter-x-axis ticks')
        .attr('transform', 'translate(0,' + heatFilterInnerHeight + ')')
        .call(d3.axisBottom().scale(filterxScale));
    
    innerFilter.append('g')
        .attr('class', 'heatFilter-y-axis ticks')
        .attr('transform', 'translate(0,0)')
        .call(d3.axisLeft().scale(filteryScale));

    var keys = ['black', 'silver', 'white','blue', 'green', 'yellow', 'orange', 'red'];
    var stack = d3.stack()
        .keys(keys)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);
    
    var series = stack(stackData);
    var area = d3.area()
        .x(d => filterxScale(d.data.date))
        .y0(d => filteryScale(d[0]))
        .y1(d => filteryScale(d[1]));

    var stackArea = innerFilter.selectAll('.event')
        .data(series, d => d);

    stackArea.enter()
        .append('g')
        .attr('class', d => 'event ' + d.key)
        .merge(stackArea)
        .append('path')
        .attr('d', area)
        .style('fill', d => colorMapping[d.key])
        .style('fill-opacity', 0.7)
        .style('stroke', d => colorMapping[d.key])
        .style('stroke-width', 2)

    stackArea.exit().remove();
    // brush

    var brushStart = function() {
        console.log('start');
    }

    var brushMove = function() {
        console.log('moving');
        var s = d3.event.selection;
        if (s) {
            heatYearFilter(filterxScale.invert(s[0]), filterxScale.invert(s[1]));
        }
    }

    var brushEnd = function() {

        console.log('brushend');
    }

    var brush = d3.brushX()
        .extent([[0, 0], [heatFilterInnerWidth, heatFilterInnerHeight]])
        .on('start', brushStart)
        .on('brush', brushMove)
        .on('end', brushEnd);
    
    var brushG = innerFilter.append('g')
        .attr('class', 'brush')
        .call(brush);
    
    brush.move(brushG, [1940, 2014].map(filterxScale));
    
    
    // real heat map

    var inner = heatSVG.append('g')
        .attr('class', 'heat-inner')
        .attr('transform', 'translate(' + heatpadding.l + ',' + heatpadding.t + ')');

    var heatxScale = d3.scaleLinear()
        .domain([1, 31])
        .range([heatMapWidth, heatInnerWidth - heatMapWidth]);
    
    var heatyScale = d3.scaleLinear()
        .domain([1, 12])
        .range([0, heatInnerHeight]);
    
    inner.append('g')
        .attr('class', 'heatSVG-x-axis ticks')
        .attr('transform', 'translate(0,' + (heatInnerHeight + 2 * heatMapHeight) + ')')
        .call(d3.axisBottom().scale(heatxScale));
    
    inner.append('g')
        .attr('class', 'stackSVG-y-axis ticks')
        .attr('transform', 'translate(0,' + heatMapHeight + ')')
        .call(d3.axisLeft().scale(heatyScale));

}

var initDuration = function() {

    duration_svg.append('g')
        .attr('class', 'duration-x-axis')
        .attr('transform', 'translate(0,' + (svgHeight - padding.b) + ')')

    duration_svg.append('g')
        .attr('class', 'duration-y-axis')
        .attr('transform', 'translate(' + padding.l + ',0)')
}

var drawStack = function(colorData) {
       // maxCount for some year
    var maxSumCount = d3.max(colorData, (d) => {
        var vals = d3.keys(d).map((key) => {
            return key !== 'date' ? d[key] : 0;
        });
        return d3.sum(vals);
    });
    var yearAxisStart = 300;
    var filterScale = d3.scaleLinear()
        .domain([1940, 2014])
        .range([yearAxisStart, stackInnerWidth]);

    var start = Math.round(filterScale.invert(+d3.select('#filter1start').attr('cx')));
    var end = Math.round(filterScale.invert(+d3.select('#filter1end').attr('cx')));
    var stackxScale = d3.scaleLinear()
        .domain([start, end])
        .range([0, stackInnerWidth]);
        
    var stackyScale = d3.scaleLinear()
        .domain([0, maxSumCount])
        .range([stackInnerHeight, 0]);

    var inner = stackSVG.select('.inner');
    var keys = ['black', 'silver', 'white','blue', 'green', 'yellow', 'orange', 'red'];
    var stack = d3.stack()
        .keys(keys)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);
    
    var series = stack(colorData);
    var area = d3.area()
        .x(d => stackxScale(d.data.date))
        .y0(d => stackyScale(d[0]))
        .y1(d => stackyScale(d[1]));

    // real stack starts
    var stackArea = inner.selectAll('.event')
        .data(series, d => d);

    stackArea.enter()
        .append('g')
        .attr('class', d => 'event ' + d.key)
        .merge(stackArea)
        .append('path')
        .attr('d', area)
        .style('fill', d => colorMapping[d.key])
        .style('fill-opacity', 0.7)
        .style('stroke', d => colorMapping[d.key])
        .style('stroke-width', 2)

    stackArea.exit().remove();
    
    var xTick = inner.select('.stackSVG-x-axis')
        .transition()
        .call(d3.axisBottom().scale(stackxScale));
    var yTick = inner.select('.stackSVG-y-axis')
        .transition()
        .call(d3.axisLeft().scale(stackyScale));
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
    var heatxScale = d3.scaleLinear()
        .domain([1, 32])
        .range([0, heatInnerWidth]);

    var heatyScale = d3.scaleLinear()
        .domain([1, 12])
        .range([0, heatInnerHeight]);

    HeatCell.prototype.update2 = function(g) {
        // get the x, y
        var _this = this;
        var y = heatyScale(+_this.colors.month) + heatMapHeight / 2;
        var x = heatxScale(+_this.colors.day) + heatMapWidth / 2;
        
        
        var xScale = d3.scaleLinear()
            .domain([1, 4])
            .range([0, heatMapWidth ]);

        var yScale = d3.scaleLinear()
            .domain([1, 2.5])
            .range([0, heatMapHeight]);

        var colorCellPositions = [];
        for (var i = 1; i <= 4; i++) {
            for (var j = 1; j <= 2; j++) {
                colorCellPositions.push({
                    'x': i,
                    'y': j
                });
            }
        }
        var items = [];
        for(var key in _this.colors) {
            if (key == 'month' || key == 'day') {
                continue;
            }
            items.push({'color':key, 'value': _this.colors[key]})
        }
        for (var i = 0; i < items.length; i++) {
            items[i].x= colorCellPositions[i].x;
            items[i].y = colorCellPositions[i].y;
        }
        //console.log(this);
        var cell = d3.select(g);
        var smallCells = cell.append('g')
            .attr('class', 'cell-group')
            .attr('transform', 'translate(' + x + ',' + y +')');

        var rects = smallCells.selectAll('.color-cell')
            .data(items, d => x + '-' + y);

        var rectsEnter = rects.enter()
            .append('rect')
            .attr('class', 'color-cell')
            .attr('x', d => xScale(d.x))
            .attr('y', d => yScale(d.y))
            .attr('width', cellWidth)
            .attr('height', cellHeight)

        rects.merge(rectsEnter)
            .style('fill', d => colorMapping[d.color])
            .style('fill-opacity', d =>  opacityScale(d.value))
            .style('stroke', d => d.color == 'black' ? 'white' : '') 
            .style('stroke-opacity', d => d.color == 'black' ? opacityScale(d.value) : '');
        
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
    var bigCell = heatSVG.select('.heat-inner')
        .selectAll('.big-cell')
        .data(cells, d => d.day + '-' + d.month)
    
    var enter = bigCell.enter()
        .append('g')
        .attr('class', 'big-cell')

    enter.merge(bigCell);
    bigCell.exit().remove();

    enter.each(function(cell) {
        cell.update2(this);
    });

    

    // old code below
    /*
    var heatCell = heat_svg.selectAll('.cell')
            .data(cells, d => d.month + '-' + d.day)

    var heatCellEnter = heatCell.enter()
        .append('g')
        .attr('class', 'cell')
        .merge(heatCell);
        
    heatCellEnter.each(function(cell){
        cell.update(this, cell);
    });

    heatCell.exit().remove();
    */

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
    var colorCount = {};
    keys.forEach(d => colorCount[d] = {'totalCount': 0});
    data.forEach(d => {
        if (d.color in colorCount) {
            if (d.duration in colorCount[d.color]) {
                colorCount[d.color][d.duration]++;
            } else {
                colorCount[d.color][d.duration] = 1;
            }
            colorCount[d.color]['totalCount']++;
        }
    });

    barData = [];
    for (var color in colorCount) {
        for (var duration in colorCount[color]) {
            if (duration == 'totalCount') {
                continue;
            }
            barData.push({
                'duration': +duration,
                'color': color,
                'colorScale': +colorCount[color][duration] * 100.0 / colorCount[color]['totalCount']
            });
        }
    }
    //console.log(barData);

    //console.log(colorCount);
    var xScale = d3.scaleLinear()
        .domain(d3.extent(barData, d => d.duration))
        .range([padding.l, svgWidth - padding.r]);

    var yScale = d3.scaleLinear()
        .domain([217, 0])
        .range([padding.t, svgHeight - padding.b]);

    var xAxis = d3.axisBottom()
        .scale(xScale);
    
    var yAxis = d3.axisLeft()
        .scale(yScale)
    
    var durationBar = duration_svg.selectAll('.color-bar')
        .data(barData, d => d.duration + '-' + d.color);

    durationBar
        .enter()
        .append('rect')
        .attr('class', d => 'color-bar')
        .merge(durationBar)
        .attr('x', d => xScale(d.duration))
        .attr('y', d => yScale(heightMap[d.color]))
        .attr('width', barWidth)
        .attr('height', barHeight)
        .style('fill', d => d.color)
        .style('fill-opacity', d => d.colorScale)
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);
    
    durationBar.exit().remove();
    
    duration_svg.select('.duration-x-axis')
        .transition()
        .call(xAxis);
    
    duration_svg.select('.duration-y-axis')
        .transition()
        .call(yAxis);
}

var processSankeyData = function(data) {
    console.log(data.length);
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
    //var colors = ['white', 'red', 'yellow','black', 'silver','blue', 'green', 'orange'];
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
            nodes.push({'name': source, 'value': 0});
        }
        if (!(target in nodeCollection)) {
            nodeCollection[target] = true;
            nodes.push({'name': target, 'value': 0});
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
        links[i].source = nodePosition[links[i].source];
        links[i].target = nodePosition[links[i].target];
    });
    return sankey.nodes(nodes).links(links)();
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
    //console.log(graph);
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

var updateColor = function() {
    var selectedColor = d3.select("#colorSeletor").node().value; 
    console.log('change color to ' + selectedColor);
    var heatData = processHeatData(updated);
    var heatMaxColor = d3.max(heatData, (d) => {
        var vals = d3.keys(d).map((key) => {
            if (key == 'day' || key == 'month') {
                return 0;
            }
            if (selectedColor == 'all' || key == selectedColor) {
                return d[key];
            }
            return 0;
        });
        //console.log(vals);
        return d3.max(vals);
    });

    //console.log('max: ' + heatMaxColor);
    // update the DOM by the color filter
    var opacityScale = d3.scaleLinear().domain([0, heatMaxColor]);
    heat_svg.selectAll('.cell').selectAll('.color-cell')
        .style('fill-opacity', d => {
            return (d.color == selectedColor || selectedColor == 'all') ? opacityScale(d.value) : opacityScale(0);
        });
    map_svg.selectAll('.event-point').style('fill-opacity', d => 
        (d.color == selectedColor || selectedColor == 'all') ? 0.6 : 0);
    sankey_svg.selectAll('.link').style('stroke', d => 
        (d.color == selectedColor || selectedColor == 'all') ? d.color : 'gray');
    duration_svg.selectAll('.color-bar').style('fill', d => 
        (d.color == selectedColor || selectedColor == 'all') ? d.color : 'gray');
    
}

var updateYear = function(yearValue) {
    /*
    updated = events.filter(d => d.year <= yearValue[1] 
        && d.year >= yearValue[0]);
        */
    updated = events.filter(d => yearFilter(d, yearValue[0], yearValue[1]) & stateFilter(d, selectedState));
    updateData();

}

var updateState = function(state) {
    var yearValue = d3.select('#yearSlider').node().value;
    if (state != 'recover') {
        selectedState = stateMapping[state].toLowerCase();
    } else {
        selectedState = 'recover';
    }
    var start = +yearValue.split(',')[0];
    var end = +yearValue.split(',')[1];
    updated = events.filter(d => (yearFilter(d, start, end) & stateFilter(d, selectedState))) ;
    updateData();
}

var updateData = function() {
    drawStack(processStackData(updated));
    drawHeat(processHeatData(updated));
    drawMap(updated);
    drawSankey(processSankeyData(updated));
    drawDuration(updated);
    updateColor();
}

var yearFilter = function(d, start, end) {
    return d.year >= start && d.year <= end;
}

var stateFilter = function(d, state) {
    return state == 'recover' ? true: d.state == state;
    
}

var stackYearFilter = function(start, end) {
    stackUpdated = events.filter(d => (yearFilter(d, start, end)));
    drawStack(processStackData(stackUpdated));
}

var heatYearFilter = function(start, end) {
    heatUpdated = events.filter(d => (yearFilter(d, start, end)));
    drawHeat(processHeatData(heatUpdated))
}

