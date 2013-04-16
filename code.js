$(function () {
  var graph = sigma.init(document.getElementById('graph')).drawingProperties({
    defaultLabelColor: '#fff',
      defaultLabelSize: 12,
      defaultLabelBGColor: '#fff',
      defaultLabelHoverColor: '#000',
      labelThreshold: 6,
      defaultEdgeType: 'curve'
  }).graphProperties({
    minNodeSize: 1,
  maxNodeSize: 10,
  minEdgeSize: 1,
  maxEdgeSize: 30
  }).mouseProperties({
    maxRatio: 32
  });
  graph.parseGexf('repositories.gexf');
  graph.iterEdges(function(e){
    e.size=e.weight;
  });
  graph.bind('downnodes', function(e) {
    x = (graph.getNodes(e.content[0]));
  });
  graph.draw();
});
