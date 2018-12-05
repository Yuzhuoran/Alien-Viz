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
var heatTip = d3.tip().attr('class', 'd3-tip heat-tip')
    .html(function(d) {
        var s = '<p class="tip">' + months[d.colors['month'] - 1] + ' ' 
            + d.colors['day'] + '</p>';
        var cnt = 0;
        var span = '';
        for (var k in d.colors) {
            if (k == 'day' || k == 'month') {
                continue;
            }
            span += (span == '' ? '' : ' ') + '<span>' + k +': ' + d.colors[k] + '</span>';
            cnt++;
            if (cnt != 0 && cnt % 2 == 0) {
                s += '<p class="tip">' + span + '</p>'
                span = '';
            }
        }
        return s;
    });

var stateTip = d3.tip().attr('class', 'd3-tip state-tip')
    .html(function(d) {
        var colors = d.properties.colors;
        var span = '';
        var s = '<p class="tip">' + d.properties.NAME  + '</p>';
        var cnt = 0;
        for (var k in colors) {
            if (k == 'day' || k == 'month') {
                continue;
            }
            span += (span == '' ? '' : ' ') + '<span>' + k +': ' + colors[k] + '</span>';
            cnt++;
            if (cnt != 0 && cnt % 2 == 0) {
                s += '<p class="tip">' + span + '</p>'
                span = '';
            }
        }
        return s;
    });


var brushcell = 'undefined';
var brush = d3.brush()
    .extent([[0, 0], [heatInnerWidth, heatInnerHeight + 2 * heatMapHeight]])
    .on('start', brushstart)
    .on('brush', brushmove)
    .on('end', brushend);
var HeatCell = function(colors) {
    this.colors = colors;
    this.getKey = function() {
        var key = '';
        for (var k in colors) {
            key += k + '-' + colors[k];
        }
        return key;
    }
}

var stateShort2Full = 
{
    "AL": "Alabama",
    "AK": "Alaska",
    "AS": "American Samoa",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "DC": "District of Columbia",
    "FM": "Federated States of Micronesia",
    "FL": "Florida",
    "GA": "Georgia",
    "GU": "Guam",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MH": "Marshall Islands",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "MP": "Northern Mariana Islands",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PW": "Palau",
    "PA": "Pennsylvania",
    "PR": "Puerto Rico",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VI": "Virgin Islands",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming"
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
    'District of Columbia': 'DC',
    'Federated States of Micronesia': 'FM',
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
    'changing':'change',
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

var stackUpdated;
var stateData;
var heatAndMapUpdated;
var sankeyUpdated;
var selectedState = 'all';
var selectedColorGroup = {
    'black': false,
    'red': false,
    'yellow': false,
    'green': false,
    'blue': false,
    'white': false,
    'orange': false,
    'silver': false,
    'showAll': true
}
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
var images = {};
function preLoad() {
    var shapes = ['change','chevron', 'cigar', 'circle', 'diamond', 'disk', 'fireball', 'light'
        , 'oval', 'rectangle', 'teardrop', 'triangle', 'formation', 'other', 'cylinder'];
    var colors = ['black', 'blue', 'gray', 'white','green', 'yellow', 'orange', 'red'];
    for (var i = 0; i < shapes.length; i++) {
        for (var j = 0; j < colors.length; j++) {
            var url = `images/${shapes[i]}_${colors[j]}.png`;
            //var url = 'icons/' + shapes[i] + '_' + colors[j] + '.png';
            images[url] = new Image();
            images[url].src = url;
        }
    }
}

var checkShowAll = function() {
    for (var k in selectedColorGroup) {
        if (k == 'showAll') {
            continue;
        }
        if (selectedColorGroup[k]) {
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
            'shape': row['shape'].toLowerCase() in shapeTransform ? shapeTransform[row['shape'].toLowerCase()] : 'other',
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
    
    events = dataset;  
    stackUpdated = events;
    heatAndMapUpdated = events;
    sankeyUpdated = events;
    stateData = states;

    initStack();
    stackYearFilter(1940, 2014);
    initFilterBar();
    initMap(states);
    drawMap(heatAndMapUpdated);
    initHeat();
    drawHeat(processHeatData(heatAndMapUpdated));
    preLoad();
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

    var filterColorTitle = filterSVG.append('g')
        .attr('class', 'title-group')
        .attr('transform', 'translate(' + (filterColorpadding.l + filterColorInnerWidth / 2) 
            + ',' + filterColorpadding.t + ')');

    filterColorTitle.append('g')
        .append('text')
        .attr('text-anchor', 'middle')
        .text('COLOR')
        .style('fill', 'white');

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
            selectedColorGroup[d.color] = !selectedColorGroup[d.color];
            selectedColorGroup['showAll'] = checkShowAll();
            d3.select(this).style('stroke', selectedColorGroup[d.color] 
                ? (d.color == 'white' ? 'red': 'white') : '');
            d3.select(this).style('stroke-width', selectedColorGroup[d.color] ? 3 : '');
            updateSankeyColor();
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
        heatSVG.select('.heat-inner').select('.brush').call(brush.move, null);
    }
}

var getStateColorCount = function() {
    var stateCount = {};
    var keys = ['black', 'silver', 'white','blue', 'green', 'yellow', 'orange', 'red'];
    for (var k in stateShort2Full) {
        stateCount[k.toLocaleLowerCase()] = {};
        keys.forEach(d => stateCount[k.toLocaleLowerCase()][d] = 0)
    }
    
    heatAndMapUpdated.forEach((d) => {
        if (d.state in stateCount && d.color in stateCount[d.state]) {
            stateCount[d.state][d.color]++;
        } 
    });

    stateData.features.forEach(d => {
        d.properties['colors'] = stateCount[stateMapping[d.properties.NAME].toLowerCase()]
    })
    
    //console.log(stateData.features);
}

var updateState = function() {

    getStateColorCount();

    var path2 = d3.geoPath()
        .projection(d3.geoAlbersUsa())

    var mapInner = mapSVG.select('.map-inner');
    
    var statePath = mapInner.selectAll('.state-path')
        .data(stateData.features, function(d) {
            return d.properties.NAME;
        });
    
    statePath.enter()
        .append('path')
        .attr('class', 'state-path')
        .merge(statePath)
        .attr('d', path2)
        .style('fill', '#213952')
        .style('stroke', 'white')
        .style('stroke-width', 0.5)
        .on('click', function(d) {
            var stateShort = stateMapping[d.properties.NAME].toLowerCase();
            if (selectedState == stateShort) {
                selectedState = 'all';
            } else {
                selectedState = stateShort;
            }
            updateSankey(+d3.select('#handlel').attr('value'), +d3.select('#handler').attr('value'));
            updateHeatAndMap(+d3.select('#handlel').attr('value'), +d3.select('#handler').attr('value'));
        })
        .on('mouseover', function(d) {
            d3.select(this).style('fill-opacity', 0.5);
            console.log(d.properties.colors);
        })
        .on('mouseout', function(d) {
            d3.select(this).style('fill-opacity', 1);

        })
        .on('mouseover', stateTip.show)
        .on('mouseout',  stateTip.hide)

    statePath.exit().remove();
        
}

var initMap = function(states) {
    var projection = d3.geoAlbersUsa();

    var path2 = d3.geoPath()
        .projection(d3.geoAlbersUsa())

    var mapInner = mapSVG.append('g')
        .attr('class', 'map-inner')
        .attr('transform', 'translate(' + mappadding.l + ',' + mappadding.t + ')');

    mapInner.call(stateTip);
    updateState();

    /*
    mapInner.selectAll('path')
        .data(states.features)
        .enter()
        .append('path')
        .attr('d', path2)
        .style('fill', '#213952')
        .style('stroke', 'white')
        .style('stroke-width', 0.5)
        .on('click', function(d) {
            var stateShort = stateMapping[d.properties.NAME].toLowerCase();
            if (selectedState == stateShort) {
                selectedState = 'all';
            } else {
                selectedState = stateShort;
            }
            updateSankey(+d3.select('#handlel').attr('value'), +d3.select('#handler').attr('value'));
            updateHeatAndMap(+d3.select('#handlel').attr('value'), +d3.select('#handler').attr('value'));
        })
        .on('mouseover', function(d) {
            d3.select(this).style('fill-opacity', 0.5);
        })
        .on('mouseout', function(d) {
            d3.select(this).style('fill-opacity', 1);
        });
    */
    
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
        .on('mouseover', function(d) {
            d3.select(this).transition()
                .duration(200)
                .attr('r', 8)
            d3.select(this).style('cursor', 'pointer')
            
        })
        .on('mouseout', function(d) {
            //d3.select('#maptoolTip').classed('hidden', true);
            d3.select(this).transition()
                .duration(200)
                .attr('r', 3.5)
        })
        .on('click', function(d) {
            d3.select('#maptoolTip').classed('hidden', false)
            d3.select('#ufoColor').text(d.color);
            d3.select('#ufoShape').text(d.shape in shapeTransform ? shapeTransform[d.shape] : 'other');
            d3.select('#ufoDuration').text(getDurationFormat(d.duration));
            d3.select('#ufoTime').text(d.date.toLocaleString());
            d3.select('#ufoLocation').text(d.city);
            d3.select('#ufoDetail').text(getComments(d.comments));
            var url = 'images/' + shapeTransform[d.shape] + '_' 
                + (d.color == 'silver' ? 'gray' : d.color)+ '.png';
            if (url in images) {
                d3.select('#ufoIcon').attr('src', url);
            }
        })

    mapPoint.exit().remove();

    function getDurationFormat(duration) {
        var minute = Math.round(duration / 60);
        var seconds = duration % 60;
        //return minute > 0 ? `${minute} mins` : `${seconds} sec`;
        return minute > 0 ? minute + 'mins' : seconds + 'sec'
    }

    function getComments(comments) {
        var res =  comments.replace(/[(&#44)]/g, '');
        return res;

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

    var stackTitles = stackSVG.append('g')
        .attr('class', 'title-group')
        .attr('transform', 'translate(' + (stackSVGWidth / 2) + ', 40)')
    

    stackTitles.append('g')
        .attr('class', 'title')
        .append('text')
        .attr('text-anchor', 'middle')
        .text('STATES & COLORS & AMOUNTS');

    stackTitles.append('g')
        .attr('class', 'description')
        .append('text')
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .text('Drag tbe timeline and select a state to observe trends over years');

    var yearAxisStart = 0;
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
        .attr('transform', 'translate(' + stackpadding.l + ',' + 220 + ')');

    slider.append('text')
        .attr('transform', 'translate(-30, -30)')
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

    var inner = heatSVG.append('g')
        .attr('class', 'heat-inner')
        .attr('transform', 'translate(' + heatpadding.l + ',' + heatpadding.t + ')');

    var heatxScale = d3.scaleLinear()
        .domain([1, 31])    
        .range([heatMapWidth * 1.1 , heatInnerWidth - 0.6 * heatMapWidth]);
    
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
        .text('Drag the timeline to filter the time');
    
    inner.append('g')
        .attr('class', 'brush')
        .call(brush);
    
}

var drawStack = function(colorData) {
       // maxCount for some year
    var maxSumCount = d3.max(colorData, (d) => {
        var vals = d3.keys(d).map((key) => {
            return key !== 'date' ? d[key] : 0;
        });
        return d3.sum(vals);
    });
    var yearAxisStart = 0;
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
            .data(items, d => d);

        var rectsEnter = rects.enter()
            .append('rect')
            .attr('class', 'color-cell')

        rectsEnter.merge(rects)
            .attr('x', d => xScale(d.x))
            .attr('y', d => yScale(d.y))
            .attr('width', cellWidth)
            .attr('height', cellHeight)
            .style('fill', d => colorMapping[d.color])
            .style('fill-opacity', d =>  1 * opacityScale(d.value))
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
    var opacityScale = d3.scaleLinear().domain([0, heatMaxColor])

    var cells = [];
    heatData.forEach(d => cells.push(new HeatCell(d)));

    var heatInner = heatSVG.select('.heat-inner');

    heatInner.call(heatTip)

    var bigCell = heatInner
        .selectAll('.big-cell')
        .data(cells, d => d.getKey())
    
    var bigCellEnter = bigCell.enter()
        .append('g')
        .attr('class', 'big-cell')
        .attr('x', d => d.colors.day)
        .attr('y', d => d.colors.month)
        .on('mouseover', heatTip.show)
        .on('mouseout', heatTip.hide);
    
    bigCellEnter.merge(bigCell);

    bigCellEnter.each(function(cell) {
            cell.update2(this);
    });

    bigCell.exit().remove();
}

var processSankeyData = function(data) {
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
        return name in colorMapping ? 80 : 5;
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
        .nodeWidth(80)
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
        .attr('stroke-opacity', 0.1)
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
        .attr('transform', 'translate(40, -25) rotate(180)')
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
        .attr('id', (d, i) => 'gradient-'+d.start)
        .attr("gradientUnits", "userSpaceOnUse")

    gradients.append('stop')
        .attr('stop-color', d => colorMapping[d.start])
        .attr('stop-opacity', 0.8)
        .attr('offset', '0%');

    gradients.append('stop')
        .attr('stop-color', d => colorMapping[d.start])
        .attr('stop-opacity', 0.4)
        .attr('offset', '50%');

    gradients.append('stop')
        //.attr('stop-color', d => colorMapping[d.start])
        .attr('stop-color', d => colorMapping[d.start])
        .attr('stop-opacity', 0.1)
        .attr('offset', '100%');
        
        
}
var drawSankey = function(graph) {
    var durations = sankeyUpdated;
    
    //var keys = ['white', 'red', 'yellow','black', 'silver','blue', 'green', 'orange'];
    var keys = [];

    graph.nodes.forEach(d => {
        if (d.name in colorMapping) {
            keys.push(d.name);
        }
    })
    var colorCount = {};
    keys.forEach(d => colorCount[d] = {});
    durations.forEach(d => {
        if (d.color in colorCount) {
            if (d.duration in colorCount[d.color]) {
                colorCount[d.color][d.duration]++;
            } else {
                colorCount[d.color][d.duration] = 1;
            }
        }
    });
    var totalCount = durations.length;
    var barData = [];
    for (var color in colorCount) {
        for (var duration in colorCount[color]) {
            if (isNaN(duration / 60)) {
                continue;
            }
            barData.push({
                'duration': duration / 60,
                'color': color,
                //'colorScale': +colorCount[color][duration] * 20.0 / colorCount[color]['totalCount']
                'colorScale': +colorCount[color][duration] * 40 / totalCount
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
        .attr('x', (d, i) => {return xScale(d.duration)})
        .attr('y', d => barHeights[d.color].y)
        .attr('width', 2)
        .attr('height', d => barHeights[d.color].height)
        .style('fill', d => colorMapping[d.color])
        .style('fill-opacity', d => d.colorScale)
        .style('stroke', d => d.color == 'black' ? '#969696' :'')
        .style('stroke-width', d => d.color == 'black' ? 0.5: '')
        .style('stroke-opacity', d => d.color == 'black' ? d.colorScale * 5: '')

    durationBar.exit().remove();

    xAxis.call(d3.axisBottom().scale(xScale));

    var sanekyInner = sankeySVG.select('.sankey-inner');

    graph.links.sort((a, b) => b.color.localeCompare(a.color));

    //console.log(graph.links);

    var linksTemp = sanekyInner.select('.link-group')
        .selectAll('.link')
        .data(graph.links);
    
    linksTemp.enter()
        .append('path')
        .attr('class', d => 'link ' + d.color + '-link')
        .merge(linksTemp)
        .attr('d', d3.sankeyLinkHorizontal())
        //.style('stroke', d => `url(#gradient-${d.color})`)
        .style('stroke', d => colorMapping[d.color])
        .style('stroke-width', d => Math.max(1, d.width))
        .style('stroke-opacity', d => 0.8)
        //.style('stroke-opacity', d =>`url(#gradient-${d.color})`);

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
        //.style('stroke',  'white')
        .style('stroke',  d => d.name in colorMapping ? 
            (d.name == 'black' ? '#969696' : colorMapping[d.name]) : '#969696')

    var texts = sanekyInner.selectAll('.node-title')
        .data(graph.nodes)
    
    texts.enter()
        .append('text')
        .attr('class', 'node-title')
        .merge(texts)
        .attr('transform', d => 'translate(' + (d.x0 + d.width) + ',' + (d.y1 + d.y0) / 2 +') rotate(180)')
        .attr('x', d => d.name in colorMapping ? 40 :-5)
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
    return selectedColorGroup['showAll'] || selectedColorGroup[d.color];
    //return selectedColor == 'all' || d.color == selectedColor;
}

var stateFilter = function(d) {
    return selectedState == 'all' || d.state == selectedState;
}

var stackYearFilter = function(start, end) {
    stackUpdated = events.filter(d => (yearFilter(d, start, end)));
    drawStack(processStackData(stackUpdated));
}

var updateHeatAndMap = function(start, end) {
    heatAndMapUpdated = events.filter(d => (yearFilter(d, start, end) && colorFilter(d) && stateFilter(d)));
    drawHeat(processHeatData(heatAndMapUpdated));
    updateState();
    drawMap(heatAndMapUpdated);
    brush.move(d3.select(brushcell), null);
    d3.select('#maptoolTip').classed('hidden', true);
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
    sankeyUpdated = events.filter(d => (yearFilter(d, start, end) && stateFilter(d)));
    drawSankey(processSankeyData(sankeyUpdated));
    updateSankeyColor();
}

var updateSankeyColor = function() {
    sankeySVG.select('.sankey-inner')
        .select('.node-group')
        .selectAll('.node')
        .style('fill-opacity', d => {
            if (d.name in colorMapping) {
                return (selectedColorGroup['showAll'] || selectedColorGroup[d.name]) ? 1 : 0.2;
            }
            return '';
        })
        .style('stroke', d => {
            return (selectedColorGroup['showAll'] || selectedColorGroup[d.name]) ? 
                (d.name == 'black' || (!(d.name in colorMapping)) ? '#969696' : colorMapping[d.name]) : '';
        })

    sankeySVG.select('.sankey-inner')
        .select('.link-group')
        .selectAll('.link')
        .style('stroke-opacity', d => (selectedColorGroup['showAll'] || selectedColorGroup[d.color]) ? 0.8 : 0.2);

    sankeySVG.select('.duration-inner')
        .selectAll('.color-bar')
        .style('fill-opacity', d => (selectedColorGroup['showAll'] || selectedColorGroup[d.color]) 
            ? d.colorScale : d.colorScale * 0.1);
}

function brushstart() {
    var mapInner = mapSVG.select('.map-inner');
    var inner = heatSVG.select('.heat-inner');
    if (true) {
        inner.selectAll('.big-cell')
            .classed('hidden', false);
        mapInner.selectAll('.event-point')
            .classed('hidden', false);
    }
}

function brushmove() {
    var e = d3.event.selection;
    if (!e) {
        return;
    }
    
    var heatxScale = d3.scaleLinear()
        .domain([1, 31])    
        .range([heatMapWidth * 1.1 , heatInnerWidth - 0.6 * heatMapWidth]);
    
    var heatyScale = d3.scaleLinear()
        .domain([1, 12])
        .range([0, heatInnerHeight]);
    var mapInner = mapSVG.select('.map-inner');
    var inner = heatSVG.select('.heat-inner');
    var px1 = Math.round(heatxScale.invert(e[0][0]) + 0.5) - 0.5;
    var py1 = Math.round(heatyScale.invert(e[0][1]))
    var px2 = Math.round(heatxScale.invert(e[1][0]) + 0.5) - 0.5;
    var py2 = Math.round(heatyScale.invert(e[1][1]))
    inner.selectAll('.big-cell')
        .classed('hidden', d => {
            var y = d.colors.month;
            var x = d.colors.day;
            return x < px1 || x > px2 || y < py1 || y > py2 - 0.5;
        })
    mapInner.selectAll('.event-point')
        .classed('hidden', d => {
            var x = +d.day;
            var y = +d.month;
            return x < px1 || x > px2 || y < py1 || y > py2 - 0.5;
        });
        
}

function brushend() {
    //if (!d3.event.sourceEvent) return;
    var e = d3.event.selection;
    if (!e) {
        return;
    }
    brushcell = this;
}

function hideMapTip() {
    d3.select('#maptoolTip').classed('hidden', true)
}

