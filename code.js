var graph = sigma.init(document.getElementById('graph')).drawingProperties({
  defaultLabelColor: '#fff',
  defaultLabelSize: 12,
  defaultLabelBGColor: '#fff',
  defaultLabelHoverColor: '#000',
  labelThreshold: 4,
  defaultEdgeType: 'curve'
}).graphProperties({
  minNodeSize: 1,
  maxNodeSize: 10,
  minEdgeSize: 0.3,
  maxEdgeSize: 4,
  edgesPowRatio: 0.5
}).mouseProperties({
  maxRatio: 32
}).bind('upnodes', function(e) {
  window.open(graph.getNodes(e.content[0]).attr.attributes.name);
});

/* adapted from sigma.js example */
var greyColor = '#666';
var filterActive = false;
var filterTimeout = false;

function highlightNodes(nodeFilter) {
  graph.iterNodes(function(n){
    if (nodeFilter(n)) {
      n.color = n.attr['grey'] ? n.attr['true_color'] : n.color;
      n.attr['grey'] = 0;
      n['forceLabel'] = 1;
    }
    else if(!n.attr['grey']) {
      n.attr['true_color'] = n.color;
      n.color = greyColor;
      n.attr['grey'] = 1;
      n['forceLabel'] = -1;
    }
  }).draw(2,2,2);
}

function resetHighlight() {
  graph.iterEdges(function(e){
    e.color = e.attr['grey'] ? e.attr['true_color'] : e.color;
    e.attr['grey'] = 0;
  }).iterNodes(function(n){
    n.color = n.attr['grey'] ? n.attr['true_color'] : n.color;
    n.attr['grey'] = 0;
    n['forceLabel'] = 0;
  }).draw(2,2,2);
}

graph.bind('overnodes', function(event) {
  var nodes = event.content;
  var neighbors = {};

  if (filterActive) {
    return;
  }

  $('body').css({cursor: 'pointer'});
  graph.iterEdges(function(e){
    if(nodes.indexOf(e.source)<0 && nodes.indexOf(e.target)<0){
      if(!e.attr['grey']){
        e.attr['true_color'] = e.color;
        e.color = greyColor;
        e.attr['grey'] = 1;
      }
    }else{
      e.color = e.attr['grey'] ? e.attr['true_color'] : e.color;
      e.attr['grey'] = 0;

      neighbors[e.source] = 1;
      neighbors[e.target] = 1;
    }
  });
  highlightNodes(function(n) {
    return neighbors[n.id];
  });
}).bind('outnodes',function(){
  if (filterActive) {
    return;
  }
  $('body').css({cursor: 'default'});
  resetHighlight();
});

$('#filter').on('search keydown change', function(event) {
  if (filterTimeout !== false) {
    clearTimeout(filterTimeout);
  }
  filterTimeout = setTimeout(function() {
    var filterString = $('#filter').val();
    if (filterString.length > 0) {
      filterActive = true;
      graph.iterEdges(function(e) {
        if (!e.attr['grey']) {
          e.attr['true_color'] = e.color;
          e.color = greyColor;
          e.attr['grey'] = 1;
        }
      });
      highlightNodes(function(n) {
        return n['label'].indexOf(filterString) >= 0;
      });
    }
    else {
      resetHighlight();
      filterActive = false;
    }
  }, 300);
});

graph.parseJson('repositories.json', function() {
  graph.iterEdges(function(e){
    e.size=Math.sqrt(e.weight);
  });
  graph.draw();
});
