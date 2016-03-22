// script
console.log('Script!!!');
var masterData = [],
    _mapData = [],
    chart, data, options, selectors = ['zone', 'concept', 'store'],
    uniqZones = [],
    uniqConcepts = [],
    uniqStores = [],
    selected = 'zone',
    _selected = '';

google.charts.load('current', {
    'packages': ['corechart']
});
google.charts.setOnLoadCallback(init);

function genUniqValues(masterData) {
    _.filter(masterData, function(value) {
        uniqZones.push(value.zone);
        uniqConcepts.push(value.concept);
        uniqStores.push(value.store);
    });

    uniqZones = _.uniq(uniqZones);
    uniqConcepts = _.uniq(uniqConcepts);
    uniqStores = _.uniq(uniqStores);
};

function drawChart() {
    console.log(arguments[0]);

    data = google.visualization.arrayToDataTable(arguments[0]);

    options = arguments[1];

    chart = new google.visualization.PieChart(document.getElementById('chart_div1'));
    google.visualization.events.addListener(chart, 'select', selectHandler);

    chart.draw(data, options);
};

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function selectHandler(e) {
    $('#btn1').show();
    if (selected != 'store') {
        selected = selectors[selectors.indexOf(selected) + 1];
        var options = {
            title: 'Sales per ' + selected,
            width: 900,
            height: 500
        };
        data = google.visualization.arrayToDataTable(prepareData(masterData, 'up'));
        chart.draw(data, options);
    };
};

$('#btn1').on('click', function() {
    console.log(selected);
    if (selected == 'concept') {
        $('#btn1').hide();
    };
    selected = selectors[selectors.indexOf(selected) - 1];
    var options = {
        title: 'Sales per ' + selected,
        width: 900,
        height: 500
    };
    data = google.visualization.arrayToDataTable(prepareData(masterData, 'down'));
    chart.draw(data, options);
});

function isSelectedMapped(key) {
    for (var i = 1; i < _mapData.length; i++) {
        var _m = _mapData[i];
        if (_m[0] == key) {
            return [true, i];
        };
    };
    return false;
};

function prepareData(masterData, drillDic) {
    var _data;

    genUniqValues(masterData);

    if (drillDic == 'up') {
        _selected = chart == undefined ? '' : _mapData[chart.getSelection()[0].row + 1][0];
    } else {
        if (selected == 'concept') {
            _selected = _.findWhere(masterData, {
                store: _mapData[1][0]
            }).zone;
        } else {
            _selected = '';
        };
        console.log(_selected);
    };

    _mapData = [];
    _mapData.push([selected, 'sales']);

    if (_selected == '') {
        _data = masterData;
    } else {
        _data = _.filter(masterData, function(v) {
            if (_selected.indexOf('zone') == 0) {
                return v.zone == _selected;
            };
            if (_selected.indexOf('concept') == 0) {
                return v.concept == _selected;
            };
        });
    };

    for (var i = 0; i < _data.length; i++) {
        var _key = '';
        if (selected.indexOf('zone') == 0) {
            _key = _data[i].zone
        };
        if (selected.indexOf('concept') == 0) {
            _key = _data[i].concept
        };
        if (selected.indexOf('store') == 0) {
            _key = _data[i].store
        };

        var _value = _data[i].sales,
            _ism = isSelectedMapped(_key);

        console.log(_key + '--' + _value + '--' + typeof _ism);

        if (typeof _ism == 'object') {
            _mapData[_ism[1]][1] = _mapData[_ism[1]][1] + _data[i].sales;
        } else {
            _mapData.push([_key, _data[i].sales]);
        };
    };
    console.log(_mapData);
    return _mapData;
};

function init() {
    $.getJSON("../ZCSdata.json", function(res) {
        masterData = res;
        genUniqValues(masterData);
        var options = {
            title: 'Sales per ' + selected,
            width: 900,
            height: 500
        };
        drawChart(prepareData(masterData, 'up'), options);
    }).error(function(jqXhr, textStatus, error) {
        alert("ERROR: " + textStatus + ", " + error);
    });
};