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
  
          
  this.formattedData = prepareData(rawData.w3counter);
  
  if(this.isChartReady) {
    this.drawChart()
  }
}    

Dashboard.prototype.onChartReady = function() {
  this.isChartReady = true
  this.dateFormatter = new google.visualization.DateFormat({pattern: 'MMM yyyy'});
  
    if(this.formattedData) {
    this.drawChart()
  }
          
}  

Dashboard.prototype.updateTitleFromState = function() {
  var state = this.dateFilter.getState()
  
  if(!state.lowValue) {
    return
  }
  
  var low = this.dateFormatter.formatValue(state.lowValue)
  var high = this.dateFormatter.formatValue(state.highValue)
  
  var title = 'Global Browser Statistics, ' + low + ' to ' + high
  
  this.lineChart.setOption('title', title)
  this.lineChart.draw();    
}
  
Dashboard.prototype.drawChart = function() {
          
  var data = new google.visualization.DataTable(this.formattedData);
  data.sort([{column: 0, desc:true}]);
  
  // Pivot the data for table
  var distinctValues = data.getDistinctValues(1);  
  var viewColumns = [
    {
      type: 'date',
      label: 'Date',
      calc: function (dt, row) {
        var val = dt.getValue(row, 0);
        return val
      }
    }
  ];
  
  var groupColumns = [];
   
  for (var i = 0; i < distinctValues.length; i++) {
    viewColumns.push({
      type: 'number',
      label: distinctValues[i],
      calc: (function (x) {
        return function (dt, row) {
          return (dt.getValue(row, 1) === x ) ?  dt.getValue(row, 2) : null  
        }
      })(distinctValues[i])
    })
    groupColumns.push({
      column: i+1,
      type: 'number',
      aggregation: google.visualization.data.sum
    })          
  }
  
  var view = new google.visualization.DataView(data);
  view.setColumns(viewColumns);
  var pivotedData = new google.visualization.data.group(view, [0], groupColumns);
   
  // Rendering of dashboard
  var dashboard = new google.visualization.Dashboard(
    document.getElementById('dashboard_div')
  )
  
  this.dateFilter = new google.visualization.ControlWrapper({
    controlType: 'DateRangeFilter',
    containerId: 'date-filter',
    options: {
      filterColumnLabel: 'Date',
      ui: {
        label: '',
        labelStacking : 'vertical', 
        format: {
          pattern: 'MMM, yyyy'
        }
      }
    }
  })
  
  google.visualization.events.addListener(this.dateFilter, 'statechange', function() {
    this.updateTitleFromState();
  }.bind(this));
 
  this.browserFilter = new google.visualization.ControlWrapper({
    controlType: 'CategoryFilter',
    containerId: 'browser-filter',
    options: {
      filterColumnIndex: 1,
      selectedValuesLayout: 'belowStacked',
      ui: {
        caption: 'Select browsers to filter',
        label: ''
      }
    }
  })  
        
  this.lineChart = new google.visualization.ChartWrapper({
    chartType: 'LineChart',
    containerId: 'chart_div',
    options: {
      width: '100%',
      height: 500,
      legend: 'right',
      titleTextStyle: {
        fontSize: '24'
      },
      title: 'Global Browser Statistics',
      interpolateNulls: true,
    },
    view: {
      columns: 
        view.getViewColumns()
    }
  })
  
  dashboard.bind([this.dateFilter, this.browserFilter], [this.lineChart]);
  
  // var dataTable = new google.visualization.ChartWrapper({
  //   'chartType': 'Table',
  //   'containerId': 'table',
  //   'options': {
  //     width: '100%',
  //     height: 500,
  //   },
  //   view: {
  //     columns: 
  //       view.getViewColumns()
  //   },
    
  // });
  // dashboard.bind([slider, browserFilter], [dataTable]);
      
  dashboard.draw(data)
  this.updateTitleFromState()

}
       
new Dashboard();
    
function prepareData(input) {  
  
  var stats = input.web_browser_market_share.results;  
  var browsers = input.web_browser_market_share.browser_names;  
  var browserNames = Object.keys(browsers).map(function(k){return browsers[k]});
  
  var output = {
    cols: [
      { id: 'year', label: 'Date', type: 'date', },
      { id: 'browser', label: 'Browser', type: 'string',},
      { id: 'value', label: 'Value', type: 'number', },
    ],
    rows: []
  }   
  
  
  
  stats.forEach(function(data) { 
    browserNames.forEach(function(browserName) {
      var row = {
        c: [
            { v: moment(data["month"] + "-01-" + data["year"], "MM-DD-YYYY").toDate()},
            { v: browserName}, 
            { v: data[browserName]},
        ]
      }
      output.rows.push(row)      
    })
  })
          
  return output;        
}
  