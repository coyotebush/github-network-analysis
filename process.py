#!/usr/bin/env python
import csv
import igraph

g = igraph.Graph()

with open('repo-attributes.csv', 'rb') as repofile:
    reader = csv.DictReader(repofile)
    for repo in reader:
        g.add_vertex(name=repo['repository_url'],
            label=repo['repository_url'][19:],
            language=repo['repository_language'],
            watchers=int(repo['repository_watchers']))

with open('repo-weights.csv', 'rb') as edgefile:
    reader = csv.DictReader(edgefile)
    for edge in reader:
        g.add_edge(edge['repository1'], edge['repository2'],
            weight=float(edge['weight']))

print g.summary()
g.write('repositories.gml')
