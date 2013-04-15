GitHub Network Analysis
===

An analysis and visualization of top repositories on GitHub, focused on the
relationship between programming languages used and the network structure.

General workflow:

                   BigQuery
                      |
              -----------------
             /                 \
    repo-attributes.sql  repo-weights.sql
            |                   |
    repo-attributes.csv  repo-weights.csv
             \                  /
              ------------------
                      |
                  process.py
                      |
                repositories.gml
                      |
              ------------------
             /                  \
        analyze.py             Gephi


For more information and the full analysis, see the [report](report/).

