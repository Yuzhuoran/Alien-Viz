

var stackSVG = d3.select('#stackSVG');
var stackSVGWidth = +stackSVG.attr('width');
var stackSVGheighth = +stackSVG.attr('height');

var heatSVG = d3.select('#heatSVG');
var heatSVGWidth = +heatSVG.attr('width');
var heatSVGHeight = +heatSVG.attr('height');

var sankeySVG = d3.select('#sankeySVG');
var sankeySVGWidth = +sankeySVG.attr('width');
var sankeySVGHeigth = +sankeySVG.attr('height');

var mapSVG = d3.select('#mapSVG');
var mapSVGWidth = +mapSVG.attr('width');
var mapSVGHeight = +mapSVG.attr('height');
var mappadding = {t: 120, l: 131, r: 0, b: 180}

var mapInnerWidth = mapSVGWidth - mappadding.l - mappadding.r;
var mapInnerHeight = mapSVGHeight - mappadding.t - mappadding.b;

var filterSVG = d3.select('#filterSVG');
var filterSVGWidth = +filterSVG.attr('width');
var filterSVGHeight = +filterSVG.attr('height');

var filterYearpadding = {l: 151, t: 50, r: 500, b:30};
var filterColorpadding = {l: filterSVGWidth - filterYearpadding.r + 80, t:30, r: 80, b: 30};

var filterYearInnerWidth = filterSVGWidth - filterYearpadding.l - filterYearpadding.r;
var filterYearInnerHeight = filterSVGHeight - filterYearpadding.t - filterYearpadding.b;

var filterColorInnerWidth = filterSVGWidth - filterColorpadding.l - filterColorpadding.r;
var filterColorInnerHeight = filterSVGHeight - filterColorpadding.t - filterColorpadding.b;


var sankeypadding = {t: 150, l: 110, r: 630, b:100};
var durationBarpadding = {t:150, l: sankeySVGWidth - sankeypadding.r + 10, r: 151, b:100};
var sankeyInnerWidth = sankeySVGWidth - sankeypadding.l - sankeypadding.r;
var sanekyInnerHeight = sankeySVGHeigth - sankeypadding.t - sankeypadding.b;
var durationInnerWidth = sankeySVGWidth - durationBarpadding.l - durationBarpadding.r;
var durationInnerHeight = sankeySVGHeigth - durationBarpadding.t - durationBarpadding.b;

var heatpadding = {t: 180, l: 151, r: 151, b: 251};
var heatFilterpadding = {t: 120, l: 151, r: 151, b:650}
var heatFilterInnerHeight = heatSVGHeight - heatFilterpadding.t - heatFilterpadding.b;
var heatFilterInnerWidth = heatSVGWidth - heatFilterpadding.l - heatFilterpadding.r;

var heatInnerHeight = heatSVGHeight - heatpadding.t - heatpadding.b;
var heatInnerWidth = heatSVGWidth - heatpadding.l - heatpadding.r;

var heatMapHeight = heatInnerHeight / 12 * 0.45;
var heatMapWidth = heatInnerWidth / 31 * 0.6;


var mapxPadding = heatInnerWidth / 12 * 0.1;
var mapyPadding = heatInnerHeight / 31 * 0.1;

var cellWidth = (heatMapWidth) / 4.0;
var cellHeight = (heatMapHeight)/ 2.0;

var mapCellpadding = 1;

var stackpadding = {t: 300, l:151, r:151, b:151}
var stackInnerHeight = stackSVGheighth - stackpadding.t - stackpadding.b;
var stackInnerWidth = stackSVGWidth - stackpadding.l - stackpadding.r;

// scroll sections below

var HeatCell = function(colors) {
    this.colors = colors;
}

var imageMapping = {};
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

var nodeTitleColorMapping = {
    'white': '#0d1d38',
    'red': 'white',
    'orange': 'white',
    'yellow': '#0d1d38',
    'green': '#0d1d38',
    'blue': '#0d1d38',
    'silver': 'white',
    'black': 'white'
}
var endColorGradient = {
    
}
var stackUpdated;
var heatAndMapUpdated;

var sankeyUpdated;
var clickState;
var selectedState = 'recover';
var stackSelectedState = 'all';
var selectedNode;
var selectedColor = 'all';

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
    preLoad();
    events = dataset;  
    stackUpdated = events;
    heatAndMapUpdated = events;
    sankeyUpdated = events;

    initStack();
    stackYearFilter(1940, 2014);
    initFilterBar();
    initHeat();
    drawHeat(processHeatData(heatAndMapUpdated));
    initMap(states);
    drawMap(heatAndMapUpdated);
    initSankey();
    drawSankey(processSankeyData(sankeyUpdated));
    console.log(events.length);
}

var initFilterBar = function() {
    var stackData = processStackData(events.filter(d => d.year >= 1940 && d.year <= 2014));
    var maxSumCount = d3.max(stackData, (d) => {
        var vals = d3.keys(d).map((key) => {
            return key !== 'date' ? d[key] : 0;
        });
        return d3.sum(vals);
    });

    var filterxScale = d3.scaleLinear() 
        .domain([1940, 2014])
        .range([0, filterYearInnerWidth]);

    var filteryScale = d3.scaleLinear()
        .domain([0, maxSumCount])
        .range([filterYearInnerHeight, 0]);

    var innerFilterYear = filterSVG.append('g')
        .attr('class', 'inner filter-year')
        .attr('transform', 'translate(' + filterYearpadding.l + ',' + filterYearpadding.t + ')');
    
    innerFilterYear.append('g')
        .attr('class', 'filter-year-x ticks')
        .attr('transform', 'translate(0,' + filterYearInnerHeight + ')')
        .call(d3.axisBottom().scale(filterxScale));

        /*
    innerFilterYear.append('g')
        .attr('class', 'filter-year-y ticks')
        .attr('transform', 'translate(0,0)')
        .call(d3.axisLeft().scale(filteryScale));
        */

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

    var stackArea = innerFilterYear.selectAll('.event')
        .data(series, d => d);

    stackArea.enter()
        .append('g')
        .attr('class', d => 'event ' + d.key)
        .merge(stackArea)
        .append('path')
        .attr('d', area)
        .attr('class', 'stack-path')
        .style('fill', d => colorMapping[d.key])
        .style('fill-opacity', 0.7)
        .style('stroke', d => colorMapping[d.key])
        .style('stroke-width', 2)

    stackArea.exit().remove();

    // init color bar
    var filterColor = filterSVG.append('g')
        .attr('class', 'inner filter-color')
        .attr('transform', 'translate(' + filterColorpadding.l + ',' + filterColorpadding.t + ')');

    var colorxScale = d3.scaleLinear()
        .domain([1, 8])
        .range([0, filterColorInnerWidth]);
    
    keys.reverse();
    var colorBtns = [];
    keys.forEach((d, i) => {
        colorBtns.push({
            'x': i + 1,
            'y': 0.3 * filterColorInnerHeight,
            'color': d,
        })
    });
    console.log(colorBtns);
    var btnWidth = 37;
    var btnHeight= 44;

    filterColor.selectAll('.color-btn').data(colorBtns)
        .enter()
        .append('rect')
        .attr('class', d => 'color-btn ' + d.color + '-btn')
        .attr('x', d => colorxScale(d.x))
        .attr('y', d => d.y)
        .attr('width', btnWidth)
        .attr('height', btnHeight)
        .style('fill', d => colorMapping[d.color])
        .on('mouseover', function() {
            d3.select(this).style('cursor', 'pointer');
        })
        .on('click', function(d) {
            if (selectedColor == 'all') {
                selectedColor = d.color;
                d3.select(this).style('stroke', d => d.color == 'white' ? 'black': 'white');
                d3.select(this).style('stroke-width', 3);
            } else if (selectedColor == d.color) {
                filterColor.select('.' + selectedColor + '-btn').style('stroke', '');
                filterColor.select('.' + selectedColor + '-btn').style('stroke-width', 0);
                selectedColor = 'all';
            } else {
                filterColor.select('.' + selectedColor + '-btn').style('stroke', '');
                filterColor.select('.' + selectedColor + '-btn').style('stroke-width', 0);
                selectedColor = d.color;
                d3.select(this).style('stroke', 'white');
                d3.select(this).style('stroke-width', 3);
            }
            updateSankeyColor(selectedColor);
            updateHeatAndMap(+d3.select('#handlel').attr('value'), +d3.select('#handler').attr('value'));
        });
    
    // add drag interval;
    var rangeStart = 0;
    var rangeEnd = filterYearInnerWidth;

    var end = {
        'x': rangeEnd,
        'y': -5,
        'r': 6,
        'type': 'r'
    };

    var start = {
        'x': rangeStart,
        'y': -5,
        'r': 6,
        'type': 'l'
    };

    var drag = d3.drag();
    drag.on('drag', dragging)
        .on('start', dragstarted)
        .on('end', dragended);

    var handles = innerFilterYear.selectAll('.handle').data([start, end]);

    var handlesEnter = handles.enter()
        .append('g')
        .attr('class', d => 'handle ' + d.type)
        .attr('id', d => 'handle' + d.type)
        .attr('value', d => Math.round(filterxScale.invert(d.x)))
        .call(drag);

    handles.merge(handlesEnter);

    handlesEnter
        .append('circle')
        .attr('r', d => d.r)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .attr('fill', '#868e9b')
        .on('mouseover', function() {
            d3.select(this).style('cursor', 'pointer');
        })

    handlesEnter
        .append('rect')
        .attr('x', d => d.x - 1)
        .attr('y', d => d.y + d.r)
        .attr('width', 2)
        .attr('height', d => filterYearInnerHeight - (d.y + d.r + 1))
        .style('fill', 'white');

    handlesEnter
        .append('text')
        .attr('x', d => d.x)
        .attr('y', d => d.y - d.r - 3)
        .attr('text-anchor', 'middle')
        .text(d => Math.round(filterxScale.invert(d.x)))
        .style('font-size', '15px')
        .style('fill', 'white');

    handles.exit().remove();

    function dragging(d) {
        var pos = d3.event.x;
        var boundary = +d3.select('#handle' + (d.type == 'l' ? 'r' : 'l')).select('circle').attr('cx');
            
        console.log(boundary);
        if (d.type == 'r') {
            pos = Math.min(rangeEnd, Math.max(pos, boundary));
        } else {
            pos = Math.min(boundary, Math.max(pos, rangeStart));
        }
        d3.select(this).select('circle').attr('cx', d => d.x = pos);
        d3.select(this).select('rect').attr('x', d => d.x = pos - 1);
        d3.select(this).select('text')
            .attr('x', d => d.x = pos)
            .text(d => Math.round(filterxScale.invert(d.x)));
        d3.select(this).attr('value', Math.round(filterxScale.invert(pos)));
        var startYear = Math.round(filterxScale.invert(d.type == 'l' ? pos : boundary));
        var endYear = Math.round(filterxScale.invert(d.type == 'l' ? boundary : pos));

        // update
        updateSankey(startYear, endYear);
        updateHeatAndMap(startYear, endYear);
    }
}

var initMap = function(states) {
    var projection = d3.geoAlbersUsa();

    var path2 = d3.geoPath()
        .projection(d3.geoAlbersUsa())

    var mapInner = mapSVG.append('g')
        .attr('class', 'map-inner')
        .attr('transform', 'translate(' + mappadding.l + ',' + mappadding.t + ')');


    mapInner.selectAll('path')
        .data(states.features)
        .enter()
        .append('path')
        .attr('d', path2)
        .style('fill', '#213952')
        .style('stroke', 'white')
        .style('stroke-width', 0.5)
    
    var mapTitles = mapSVG.append('g')
        .attr('class', 'title-group')
        .attr('transform', 'translate(' + (mapSVGWidth / 1.6) + ', 40)')
    

    mapTitles.append('g')
        .attr('class', 'title')
        .append('text')
        .attr('text-anchor', 'middle')
        .text('COLORS & LOCATIONS');

    mapTitles.append('g')
        .attr('class', 'description')
        .append('text')
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .text('Drag the timeline to filter the time')
    
}
var drawMap = function(points) {
    var projection = d3.geoAlbersUsa();
    points = points.filter(d => projection([d.lng, d.lat]) != null)
    var mapInner = mapSVG.select('.map-inner')

    var mapPoint = mapInner.selectAll('.event-point')
    .data(points, d => d.lat + '-' + d.lng)

    mapPoint.enter()
        .append('circle')
        .attr('class', 'event-point')
        .merge(mapPoint)
        .attr('cx', d => projection([d.lng, d.lat])[0])
        .attr('cy', d => projection([d.lng, d.lat])[1])
        .attr('r', 3.5)
        .style('fill', d => colorMapping[d.color])
        .style('fill-opacity', 0.6)
        .on('mouseover', d => {
            d3.select('#maptoolTip').classed('hidden', false)
            d3.select('#ufoColor').text(d.color);
            d3.select('#ufoShape').text(d.shape in shapeTransform ? shapeTransform[d.shape] : 'unknown');
            d3.select('#ufoDuration').text(getDurationFormat(d.duration));
            d3.select('#ufoTime').text(d.date.toLocaleString());
            d3.select('#ufoLocation').text(d.city);
            d3.select('#ufoDetail').text(d.comments);
            var url = 'icons/' + shapeTransform[d.shape] + '_' + d.color + '.png';
            if (url in imageMapping) {
                d3.select('#ufoIcon').attr('src', url);
            } 
            
        })
        .on('mouseout', d => {
            d3.select('#maptoolTip').classed('hidden', true);
        })

    mapPoint.exit().remove();

    function getDurationFormat(duration) {
        var minute = Math.round(duration / 60);
        var seconds = duration % 60;
        return minute > 0 ? minute + ' m' : seconds + ' s'
    }
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
    
    stackSVG.append('g')
        .attr('class', 'axis-title')
        .attr('transform', 'translate(' + (stackpadding.l - 40) + ',' + (stackpadding.t - 20) +')')
        .append('text')
        .text('TIMES');

    var yearAxisStart = 300;
    var x = d3.scaleLinear()
        .domain([1940, 2014])
        .range([yearAxisStart, stackInnerWidth]);

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
        var pos = d3.event.x;
        var rightBoundary = +d3.select('#filter1end').attr('cx');
        pos = Math.min(rightBoundary, Math.max(pos, yearAxisStart));
        d3.select(this).attr('cx', d => d.x = pos)
        stackYearFilter(Math.round(x.invert(pos)), Math.round(+x.invert(rightBoundary)));
        //console.log('interval is ' + x.invert(pos) + ', ' + x.invert(rightBoundary));
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
    /*
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
        .attr('class', 'stack-path')
        .style('fill', d => colorMapping[d.key])
        .style('fill-opacity', 0.7)
        .style('stroke', d => colorMapping[d.key])
        .style('stroke-width', 2)

    stackArea.exit().remove();
    // brush

    var brushStart = function() {
        
    }
    var brushMove = function() {
        var s = d3.event.selection;
        if (s) {
            heatYearFilter(filterxScale.invert(s[0]), filterxScale.invert(s[1]));
            //updateFilterStackColor(filterxScale.invert(s[0]), filterxScale.invert(s[1]));
        }
    }

    var brushEnd = function() {
    }

    var updateFilterStackColor = function(start, end) {
        var temp = innerFilter.selectAll('.stack-path')
        temp.style('fill', d => d.data.date <= end && d.data.date >= start ?
            colorMapping[d.key] : '')
            .style('fill-opacity', 0.7)
            .style('stroke', d  => d.data.date <= end && d.data.date >= start ?
            colorMapping[d.key] : '')
            .style('stroke-width', 2)
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
    */
    
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
        .call(d3.axisBottom().scale(heatxScale).tickValues(d3.range(1, 32)));
    
    inner.append('g')
        .attr('class', 'stackSVG-y-axis ticks')
        .attr('transform', 'translate(0,' + heatMapHeight + ')')
        .call(d3.axisLeft().scale(heatyScale).tickFormat(function(d) {
            return months[d - 1];
        }));
    
    inner.append('g')
        .attr('class', 'axis-title')
        .attr('transform', 'translate(-60, -15)')
        .append('text')
        .text('MONTH');

    inner.append('g')
        .attr('class', 'axis-title')
        .attr('transform', 'translate(' + heatInnerWidth + ',' + (heatInnerHeight + heatMapHeight * 2) + ')')
        .append('text')
        .text('DAYS');

    var heatTitles = heatSVG.append('g')
        .attr('class', 'title-group')
        .attr('transform', 'translate(' + (heatSVGWidth / 2) + ', 40)')
    

    heatTitles.append('g')
        .attr('class', 'title')
        .append('text')
        .attr('text-anchor', 'middle')
        .text('COLORS & DAYS');

    heatTitles.append('g')
        .attr('class', 'description')
        .append('text')
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .text('Drag the timeline to filter the time')
    
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
            .range([0, heatMapWidth]);

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
            .style('fill-opacity', d =>  1* opacityScale(d.value))
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
}

var processSankeyData = function(data) {


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
    var getWidth = function(name) {
        return name in colorMapping ? 100 : 5;
    }
    for (var key in temp) {
        var source = key.split(',')[0];
        var target = key.split(',')[1];
        var value = temp[key];
        if (!(source in nodeCollection)) {
            nodeCollection[source] = true;
            nodes.push({'name': source, 'value': 0, 'width': getWidth(source)});
        }
        if (!(target in nodeCollection)) {
            nodeCollection[target] = true;
            nodes.push({'name': target, 'value': 0, 'width': getWidth(target)});
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
    var sankeyTemp = d3.sankey()
        .nodePadding(5)
        .extent([[0, 0], [sankeyInnerWidth, sanekyInnerHeight]]);
    return sankeyTemp.nodes(nodes).links(links)();
}

var initSankey = function() {    
    var sanekyInner = sankeySVG.append('g')
        .attr('class', 'sankey-inner')
        .attr('transform', 'translate(' + (sankeypadding.l + sankeyInnerWidth)
            + ',' + (sankeypadding.t + sanekyInnerHeight) + ') rotate(180)');

    var sankeyTitles = sankeySVG.append('g')
        .attr('class', 'title-group')
        .attr('transform', 'translate(' + sankeySVGWidth / 2 + ', 50)')
    
    sankeyTitles.append('g')
        .attr('class', 'title')
        .append('text')
        .attr('text-anchor', 'middle')
        .text('SHAPE - COLORS - DURATION');

    sankeyTitles.append('g')
        .attr('class', 'description')
        .append('text')
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .text('Select a color to observe patterns')
        

    sanekyInner.append('g')
        .attr('stroke', '#000')
        .attr('class', 'node-group');

    sanekyInner.append('g')
        .attr('fill', 'none')
        .attr('stroke-opacity', 0.5)
        .attr('class', 'link-group')

    var durationInner = sankeySVG.append('g')
        .attr('class', 'duration-inner')
        .attr('transform', 'translate(' + durationBarpadding.l 
            + ',' + durationBarpadding.t + ') ');
    
    var xAxis = durationInner.append('g')
        .attr('class', 'duration-x-axis ticks')
        .attr('transform', 'translate(0,' + durationInnerHeight + ')');
        
    durationInner.append('g')
        .attr('class', 'duration-y-axis ticks')
        .attr('transform', 'translate(0, 0)');

    durationInner.append('g')
        .attr('class', 'axis-title')
        .attr('transform', 'translate(' + (durationInnerWidth + 20) + ',' + (durationInnerHeight + 25) + ')')
        .append('text')
        .text('MINS');

    sanekyInner.append('g')
        .attr('class', 'axis-title')
        .attr('transform', 'translate(50, -25) rotate(180)')
        .append('text')
        .attr('text-anchor', 'middle')
        .text('COLORS');

    sanekyInner.append('g')
        .attr('class', 'axis-title')
        .attr('transform', 'translate(' + (sankeyInnerWidth + 10) + ',' + -20 + ') rotate(180)')
        .append('text')
        .attr('text-anchor', 'middle')
        .text('SHAPES');

    var keys = [
        {
            'start':'black',
        }, 
        {
            'start': 'silver'
        }, 
        {
            'start': 'white'
        }, 
        {
            'start': 'blue',
        },
        {
            'start': 'green'
        },
        {
            'start': 'yellow',
        }, 
        {
            'start': 'orange'
        }, 
        {
            'start': 'red'
        }]

    var defs = sanekyInner.append('defs')

    var gradients = defs.selectAll('.gradient')
        .data(keys)
        .enter()
        .append('linearGradient')
        .attr('class', 'gradient')
        .attr('id', (d, i) => d)

    gradients.append('stop')
        .attr('class', 'start')
        .attr('stop-color', d => colorMapping[d.start])
        .attr('offset', '0%');

    gradients.append('stop')
        .attr('class', 'end')
        .attr('stop-color', d => 'red')
        .attr('offset', '100%');
        
        
}
var drawSankey = function(graph) {
    //console.log(graph);
    // data
    var durations = events;
    //var keys = ['white', 'red', 'yellow','black', 'silver','blue', 'green', 'orange'];
    var keys = [];
    graph.nodes.forEach(d => {
        if (d.name in colorMapping) {
            keys.push(d.name);
        }
    })
    var colorCount = {};
    keys.forEach(d => colorCount[d] = {'totalCount': 0});
    durations.forEach(d => {
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
                'duration': +duration / 60,
                'color': color,
                'colorScale': +colorCount[color][duration] * 20.0 / colorCount[color]['totalCount']
            });
        }
    }
    var barHeights = getNodePosition(graph.nodes);

    var xScale = d3.scaleLinear()
        .domain(d3.extent(barData, d => d.duration))
        .range([0, durationInnerWidth]);
    
    var xAxis = sankeySVG.select('.duration-inner')
        .select('.duration-x-axis');

    var durationInner = sankeySVG.select('.duration-inner');
    
    var durationBar = durationInner.selectAll('.color-bar')
        .data(barData);

    durationBar.enter()
        .append('rect')
        .attr('class', 'color-bar')
        .merge(durationBar)
        .attr('x', d => xScale(d.duration))
        .attr('y', d => barHeights[d.color].y)
        .attr('width', 2)
        .attr('height', d => barHeights[d.color].height)
        .style('fill', d => colorMapping[d.color])
        .style('fill-opacity', d => d.colorScale);

    durationBar.exit().remove();

    xAxis.call(d3.axisBottom().scale(xScale));

    var sanekyInner = sankeySVG.select('.sankey-inner');

    graph.links.sort((a, b) => a.color.localeCompare(b.color));

    var linksTemp = sanekyInner.select('.link-group')
        .selectAll('.link')
        .data(graph.links);
    
    linksTemp.enter()
        .append('path')
        .attr('class', 'link')
        .merge(linksTemp)
        .attr('d', d3.sankeyLinkHorizontal())
        //.style('stroke', d => `url(#${d.color})`)
        .style('stroke', d => colorMapping[d.color])
        .style('stroke-width', d => Math.max(1, d.width))
        .style('stroke-opacity', 0.8);

    /*
    linksEnter.style('stroke', (d, i) => {
        var gradientID = `gradients${i}`;
        var startColor = d.source.name;
        var stopColor = 'black';
        var linearGradient = sanekyInner.append('linearGradient')
            .attr('id', gradientID)

        linearGradient.selectAll('stop') 
            .data([                             
                {offset: '10%', color: colorMapping[startColor]},      
                {offset: '90%', color: stopColor }    
              ])                  
            .enter().append('stop')
            .attr('offset', d => {
              console.log('d.offset', d.offset);
              return d.offset; 
            })   
            .attr('stop-color', d => {
              console.log('d.color', d.color);
              return d.color;
            });
          return `url(#${gradientID})`;
    })
    */
    

    linksTemp.exit().remove();

    var nodesTemp = sanekyInner.select('.node-group')
        .selectAll('.node')
        .data(graph.nodes)

    var nodesEnter = nodesTemp.enter();
    nodesEnter.merge(nodesTemp);

    nodesEnter
        .append('rect')
        .attr('class', 'node')
        .merge(nodesTemp)
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('height', d => d.y1 - d.y0)
        .attr('width', d => d.width ? d.width : d.x1 - d.x0)
        .style('fill', d => d.name in colorMapping ? colorMapping[d.name] : '') 
        .style('stroke',  d => d.name in colorMapping ? colorMapping[d.name] : '')

    var texts = sanekyInner.selectAll('.node-title')
        .data(graph.nodes)
    
    texts.enter()
        .append('text')
        .attr('class', 'node-title')
        .merge(texts)
        .attr('transform', d => 'translate(' + (d.x0 + d.width) + ',' + (d.y1 + d.y0) / 2 +') rotate(180)')
        .attr('x', d => d.name in colorMapping ? 50 :0)
        .attr('y', d => d.name in colorMapping ? 5: 0)
        .attr('text-anchor', d => d.name in colorMapping ? 'middle' : 'end')
        .style('fill', d => d.name in nodeTitleColorMapping ? nodeTitleColorMapping[d.name] : 'white')
        .text(d => d.name in colorMapping ? d.name.toUpperCase() : d.name);

    texts.exit().remove();
    nodesTemp.exit().remove();

}


var yearFilter = function(d, start, end) {
    return d.year >= start && d.year <= end;
}

var colorFilter = function(d) {
    return selectedColor == 'all' || d.color == selectedColor;
}

var stackYearFilter = function(start, end) {
    stackUpdated = events.filter(d => (yearFilter(d, start, end)));
    drawStack(processStackData(stackUpdated));
}

var updateHeatAndMap = function(start, end) {
    heatAndMapUpdated = events.filter(d => (yearFilter(d, start, end)) && colorFilter(d));
    drawHeat(processHeatData(heatAndMapUpdated));
    drawMap(heatAndMapUpdated);
}

var mapYearFilter = function(start, end) {
    mapUpdated = events.filter(d => (yearFilter(d, start, end)));
    drawMap(mapUpdated);
}

var getNodePosition = function(nodes) {
    var heights = {};
    nodes.forEach(d => {
        if (d.name in colorMapping) {
            heights[d.name] = {
                'height': d.y1 - d.y0,
                'y': durationInnerHeight - (d.y1 - d.y0) - d.y0
            }
        }
    })
    return heights;
}

function dragstarted(d) {
    d3.select(this).raise().classed("active", true);
    d3.select(this).style('cursor', 'pointer');
}

function dragended(d) {
    d3.select(this).classed("active", false);
    d3.select(this).style('cursor', 'default');
}

var updateSankey = function(start, end) {
    sankeyUpdated = events.filter(d => (yearFilter(d, start, end)));
    drawSankey(processSankeyData(sankeyUpdated));
    updateSankeyColor(selectedColor);
}

var updateSankeyColor = function(color) {
    sankeySVG.select('.sankey-inner')
        .select('.node-group')
        .selectAll('.node')
        .style('fill-opacity', d => {
            if (d.name in colorMapping) {
                return (color == 'all' || d.name == color) ? 1 : 0.2;
            }
            return '';
        })
        .style('stroke', d => {
            return (color == 'all' || d.name == color) ? colorMapping[d.name] : '';
        })

    sankeySVG.select('.sankey-inner')
        .select('.link-group')
        .selectAll('.link')
        .style('stroke-opacity', d => (color == 'all' || d.color == color) ? 0.8 : 0.1);

    sankeySVG.select('.duration-inner')
        .selectAll('.color-bar')
        .style('fill-opacity', d => (color == 'all' || d.color == color) ? d.colorScale : d.colorScale * 0.1);
}

var preLoad = function() {
    var shapes = ['chevron', 'change', 'cigar', 'circle', 'diamond', 'disk', 'fireball', 'light'
        , 'Oval', 'Rectangle', 'teardrop', 'Triangle'];
    var colors = ['black', 'gray', 'white','blue', 'green', 'yellow', 'orange', 'red'];
    var urls = [];
    shapes.forEach(d1 => {
        colors.forEach(d2 => {
           urls.push('icons/' + d1 + '_' + d2 + '.png'); 
        })
    })
    //console.log(urls);
    urls.forEach(d => {
        imageMapping[d] = new Image();
        imageMapping[d].src = d;
    });
}
