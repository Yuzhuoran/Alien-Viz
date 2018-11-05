var heat_svg = d3.select('.heatmap');

var svgWidth = +heat_svg.attr('width');
var svgHeight = +heat_svg.attr('height');

d3.csv('/data/sample.csv', 
    (row) => {
        var data = {
            'date': new Date(row['datetime']),
            'city': row['city'],
            'state': row['state'],
            'country': row['country'],
            'shape': row['shape'],
            'duration': +row['duration (seconds)'],
            'comments': row['comments'],
            'lat': +row['latitude'],
            'long': +row['longitude ']
        }
        if (data.country === 'us' && data.state !== "" && data.city !== "") {
            return data;
        }
    }, (error, dataset) => {
        console.log(dataset);
        // do viz in here
        // create heat map for sample data

    });