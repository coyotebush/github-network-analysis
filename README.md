GitHub Repository Collaboration Network Analysis
===

An analysis and visualization of collaboration between top GitHub repositories,
focused on the relationship between programming languages used and the network
structure.

Interactive visualization: <http://coyotebush.github.io/github-network-analysis/>

General workflow:

 * From Google BigQuery:
    * repo-attributes.sql creates repo-attributes.csv
    * repo-weights.sql creates repo-weights.csv
 * The process.py script reads both .csv files and creates repositories.gml
 * Gephi loads repositories.gml
 * Python code within analysis-\*.texw reads repositories.gml and produces
   output for the report

For more information and the full analysis, see the [report](github.pdf).

