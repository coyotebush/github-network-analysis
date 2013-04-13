LATEX = pdflatex

report.pdf: report.tex
	@echo "	Running LaTeX"
	@if $(LATEX) $< | tee /dev/tty | fgrep -is 'Rerun to get'; then 	\
		echo "	Rerunning LaTeX";			\
		while $(LATEX) $< | fgrep -is 'Rerun to get'; do    \
			echo "  Re-Rerunning LaTeX";            \
		done;                                           \
	fi
