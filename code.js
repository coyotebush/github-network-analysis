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
  maxEdgeSize: 30
}).mouseProperties({
  maxRatio: 32
}).bind('upnodes', function(e) {
  window.open(graph.getNodes(e.content[0]).attr.attributes.name);
}).bind('overnodes', function(event) {
  /* adapted from sigma.js example */
  var nodes = event.content;
  var neighbors = {};
  var greyColor = '#666';
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
  }).iterNodes(function(n){
    if(!neighbors[n.id]){
      if(!n.attr['grey']){
        n.attr['true_color'] = n.color;
        n.color = greyColor;
        n.attr['grey'] = 1;
      }
    }else{
      n.color = n.attr['grey'] ? n.attr['true_color'] : n.color;
      n.attr['grey'] = 0;
      n['forceLabel'] = 1;
    }
  }).draw(2,2,2);
}).bind('outnodes',function(){
  graph.iterEdges(function(e){
    e.color = e.attr['grey'] ? e.attr['true_color'] : e.color;
    e.attr['grey'] = 0;
  }).iterNodes(function(n){
    n.color = n.attr['grey'] ? n.attr['true_color'] : n.color;
    n.attr['grey'] = 0;
    n['forceLabel'] = 0;
  }).draw(2,2,2);
});

graph.parseJson('repositories.json', function() {
  graph.iterEdges(function(e){
    e.size=e.weight;
  });
  graph.draw();
});
