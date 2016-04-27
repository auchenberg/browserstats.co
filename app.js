function Dashboard() {
  
  this.isChartReady = false
  this.formattedData = null
  
  google.charts.load('current', {'packages':['corechart', 'controls', 'table']});
  google.charts.setOnLoadCallback(this.onChartReady.bind(this));

  this.fetchData();
  
}
    
Dashboard.prototype.fetchData = function() {

  window.fetch('/latest.json').then(function(response) {
    return response.json()
  }.bind(this)).then(function(json) {
    this.onDataLoaded(json)
  }.bind(this)).catch(function(ex) {
    console.log('parsing failed', ex)
  })  

}
    
Dashboard.prototype.onDataLoaded = function(rawData) {
  
  var w3CounterData = rawData.w3counter.web_browser_market_share.results
          
  this.formattedData = prepareData(w3CounterData);
  
  if(this.isChartReady) {
    this.drawChart()
  }
}    

Dashboard.prototype.onChartReady = function() {
  this.isChartReady = true
  
    if(this.formattedData) {
    this.drawChart()
  }
          
}  

Dashboard.prototype.drawChart = function() {
          
  var data = new google.visualization.DataTable(this.formattedData);
  data.sort([{column: 0, desc:true}]);
  
  var distinctValues = data.getDistinctValues(1);
  
  console.log('distinctValues', distinctValues)
  
  var viewColumns = [
    {
      type: 'date',
      calc: function (dt, row) {
          var val = dt.getValue(row, 0);
          return val
      }
    }
  ];
  for (var i = 0; i < distinctValues.length; i++) {
      viewColumns.push({
          type: 'number',
          label: distinctValues[i],
          calc: (function (x) {
              return function (dt, row) {
                 return (dt.getValue(row, 1) === x ) ?  dt.getValue(row, 2) : null  
              }
          })(distinctValues[i])
      });
  }
  
  var pivotedData = new google.visualization.DataView(data);
  pivotedData.setColumns(viewColumns);
  
  console.log('viewColumns', viewColumns)
  
  console.log('pivotedData', pivotedData)
  
  // next, we group the view on column A, which gets us the pivoted data
  // var pivotedData = google.visualization.data.group(view, [0, 1], groupColumns);
  
  // Create a dashboard.
  var dashboard = new google.visualization.Dashboard(
      document.getElementById('dashboard_div')
  );
  
  var slider = new google.visualization.ControlWrapper({
        'controlType': 'DateRangeFilter',
        'containerId': 'date-filter',
        'options': {
          'filterColumnLabel': 'Date',
          'ui': {
            label: '',
            labelStacking : 'vertical', 
            format: {
              pattern: 'MMM, yyyy'
            }
          }
        }
      });        

  var browserFilter = new google.visualization.ControlWrapper({
        'controlType': 'CategoryFilter',
        'containerId': 'browser-filter',
        'options': {
          'filterColumnIndex': 1,
          'selectedValuesLayout': 'belowStacked'
        }
      });  
      
      
  var lineChart = new google.visualization.ChartWrapper({
    'chartType': 'LineChart',
    'containerId': 'chart_div',
    'options': {
      width: '100%',
      height: 500,
      legend: 'right',
      pointSize: 5,      
    },
    view: {
        columns: viewColumns
    },

  });

  var dataTable = new google.visualization.ChartWrapper({
    'chartType': 'Table',
    'containerId': 'table',
    'options': {
      width: '100%',
      height: 500,
    },
    view: {
        columns: viewColumns
    },
  });
      
  dashboard.bind([slider, browserFilter], [lineChart]);
  dashboard.bind([slider, browserFilter], [dataTable]);
  
  dashboard.draw(data);

}
       
new Dashboard();
    
function prepareData(input) {        
  var output = {
    cols: [
      { id: 'year', label: 'Date', type: 'date', },
      { id: 'browser', label: 'Browser', type: 'string',},
      { id: 'value', label: 'Value', type: 'number', },
    ],
    rows: []
  }   
  
  input.forEach(function(data) { 
    
    ["Internet Explorer & Edge","Firefox", "Safari", "Opera" ].forEach(function(browserName) {
      
      var row = {
        c: [
            { v: moment(data["month"] + "-01-" + data["year"], "MM-DD-YYYY").toDate() },
            { v: browserName}, 
            { v: data[browserName]},
        ]
      }
    
      output.rows.push(row)
             
    })
  })
          
  return output;        
}
  