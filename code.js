$(function () {
  graph = sigma.init(document.getElementById('graph')).drawingProperties({
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
  graph.parseJson('repositories.json', function() {
    graph.iterEdges(function(e){
      e.size=e.weight;
    });
    graph.bind('upnodes', function(e) {
      window.open(graph.getNodes(e.content[0]).attr.attributes.name);
    });
    graph.draw();
  });
});
