LATEX = pdflatex

all: report.pdf

%.pdf %.aux %.bbl: %.tex *.bib
	$(LATEX) $<
	bibtex $*
	$(LATEX) $<
	while fgrep -is 'Rerun to get' $*.log; do $(LATEX) $<; done

clean:
	$(RM) *.pdf *.aux *.bbl

.PHONY: all clean
.DELETE_ON_ERROR:
