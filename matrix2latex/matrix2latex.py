"""This file is part of matrix2latex.

matrix2latex is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

matrix2latex is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with matrix2latex. If not, see <http://www.gnu.org/licenses/>.
"""
import sys
import os.path

# my stuff:
import fixEngineeringNotation
from error import *                     # error handling
from IOString import IOString
    
def matrix2latex(matr, filename=None, *environments, **keywords):
    r'''
A pdf version of this documentation is available as doc<date>.pdf
Takes a python matrix or nested list and converts to a LaTeX table or matrix.
Author: ob@cakebox.net, inspired by the work of koehler@in.tum.de who has written
a similar package for matlab
\url{http://www.mathworks.com/matlabcentral/fileexchange/4894-matrix2latex}

This software is published under the GNU GPL, by the free software
foundation. For further reading see: 
http://www.gnu.org/licenses/licenses.html#GPL

The following packages and definitions are recommended in the latex preamble 
% scientific notation, 1\e{9} will print as 1x10^9
\providecommand{\e}[1]{\ensuremath{\times 10^{#1}}}
\usepackage{amsmath} % needed for pmatrix
\usepackage{booktabs} % Fancy tables
...
\begin{document}
...

Arguments:
  
matrix
  A numpy matrix or a nested list

Filename
  File to place output, extension .tex is added automatically. File can be included in a LaTeX
  document by \input{filename}. Output will always be returned in a string. If filename is None
  or not a string it is ignored.
  
*environments
  Use 
matrix2latex(m, None, "align*", "pmatrix", ...) for matrix.
  This will give
  \begin{align*}
    \begin{pmatrix}
      1 & 2 \\
      3 & 4
    \end{pmatrix}
  \end{align*}
  Use 
matrix2latex(m, "test", "table", "center", "tabular" ...) for table.
  Table is default so given no arguments: table, center and tabular will be used.
  The above command is then equivalent to \\
matrix2latex(m, "test", ...)

Example

  from matrix2latex import matrix2latex
  m = [[1, 2, 3], [1, 4, 9]] # python nested list
  t = matrix2latex(m)
  print t

\begin{lstlisting}
  \begin{table}[ht]
    \begin{center}
      \begin{tabular}{cc}
        \toprule
        $1$ & $1$\\
        $2$ & $4$\\
        $3$ & $9$\\
        \bottomrule
      \end{tabular}
    \end{center}
  \end{table}
\end{lstlisting}

**keywords
headerRow
    A row at the top used to label the columns.
    Must be a list of strings.

Using the same example from above we can add row labels

rl = ['$x$', '$x^2$']
t = matrix2latex(m, headerRow=rl)

headerColumn
    A column used to label the rows.
    Must be a list of strings

transpose
Flips the table around in case you messed up. Equivalent to
matrix2latex(m.H, ...)
if m is a numpy matrix.
Note the use of headerColumn in the example.
cl = ['$x$', '$x^2$']
t = matrix2latex(m, headerColumn=cl, transpose=True)

caption
    Use to define a caption for your table.
    Inserts \verb!\caption! after \verb!\end{tabular}!.
Always use informative captions!

t = matrix2latex(m, headerRow=rl, 
                 caption='Nice table!')

label
Used to insert \verb!\label{tab:...}! after \verb!\end{tabular}!
Default is filename without extension.

We can use label='niceTable' but if we save it to file
the default label is the filename, so:

matrix2latex(m, 'niceTable', headerRow=rl, 
                 caption='Nice table!')

can be referenced by \verb!\ref{tab:niceTable}!. Table \ref{tab:niceTable}
was included in latex by \verb!\input{niceTable}!.

format
Printf syntax format, e.g. $%.2f$. Default is $%g$.
  This format is then used for all the elements in the table.

m = [[1, 2, 3], [1, 1/2, 1/3]]
rl = ['$x$', '$1/x$']
t = matrix2latex(m, headerRow=rl,
                 format='%.2f')

formatColumn
A list of printf-syntax formats, e.g. [$%.2f$, $%g$]
Must be of same length as the number of columns.
Format i is then used for column i.
This is useful if some of your data should be printed with more significant figures
than other parts

t = matrix2latex(m, headerRow=rl,
                 formatColumn=['%g', '%.2f'])

alignment
Used as an option when tabular is given as enviroment.
\verb!\begin{tabular}{alignment}!
A latex alignment like c, l or r.
Can be given either as one per column e.g. "ccc".
Or if only a single character is given e.g. "c",
it will produce the correct amount depending on the number of columns.
Default is "r".

Note that many of these options only has an effect when typesetting a table,
if the correct environment is not given the arguments are simply ignored.

The options presented by this program represents what I need when creating a table,
if you need a more sophisticated table you must either change the python code
(feel free to submit a patch) or manually adjust the output afterwards.
\url{http://en.wikibooks.org/wiki/LaTeX/Tables} gives an excellent overview
of some advanced table techniques.
    '''
    #
    # Convert to list
    #
    try:
        matr = matr.tolist()
    except AttributeError:
        pass # lets hope it looks like a list

    #
    # Define matrix-size
    # 
    m = len(matr)
    try:
        n = len(matr[0])
    except TypeError: # no length in this dimension (vector...)
        # convert [1, 2] to [[1], [2]]
        newMatr = list()
        [newMatr.append([matr[ix]]) for ix in range(m)]
        matr = newMatr
        m = len(matr)
        n = len(matr[0])
    except IndexError:
        m = 0
        n = 0
    #assert m > 0 and n > 0, "Expected positive matrix dimensions, got %g by %g matrix" % (m, n)
    
    #
    # Default values
    #

    # Keywords
    formatNumber = "$%g$"
    formatColumn = None
    if n != 0:
        alignment = "c"*n               # cccc
    else:
        alignment = "c"

    headerRow = None
    headerColumn = None
    caption = None
    label = None

    # 
    # Conflicts
    #
    if "format" in keywords and "formatColumn" in keywords:
        print('Using both format and formatColumn is not supported, using formatColumn')
        del keywords["format"]
        
    #
    # User-defined values
    # 
    for key in keywords:
        value = keywords[key]
        if key == "format":
            assertKeyFormat(value)
            formatNumber = value
            formatColumn = None         # never let both formatColumn and formatNumber to be defined
        elif key == "formatColumn":
            formatColumn = value
            formatNumber = None
        elif key == "alignment":
            if len(value) == 1:
                alignment = value*n # rrrr
            else:
                alignment = value
            assertKeyAlignment(alignment, n)
        elif key == "headerRow":
            assertListString(value, "headerRow")
            headerRow = list(value)
        elif key == "headerColumn":
            assertListString(value, "headerColumn")
            headerColumn = list(value)
        elif key == "caption":
            assertStr(value, "caption")
            caption = value
        elif key == "label":
            assertStr(value, "label")
            if value.startswith('tab:'):
                label = value[len('tab:'):] # this will be added later in the code, avoids 'tab:tab:' as label
            else:
                label = value
        elif key == "transpose":
            newMatr = list()
            for j in range(0, n):
                row = list()
                for i in range(0, m):
                    row.append(matr[i][j])
                newMatr.append(row)
            copyKeywords = dict(keywords) # can't del original since we are inside for loop.
            del copyKeywords['transpose']
            # Recursion!
            return matrix2latex(newMatr, filename, *environments, **copyKeywords)
        else:
            sys.stderr.write("Error: key not recognized '%s'\n" % key)
            sys.exit(2)
            
    if "headerColumn" in keywords:
        alignment = "r" + alignment

    # Environments
    if len(environments) == 0:          # no environment give, assume table
        environments = ("table", "center", "tabular")

    if formatColumn == None:
        formatColumn = list()
        for j in range(0, n):
            formatColumn.append(formatNumber)

    if headerColumn != None and headerRow != None and len(headerRow) == n:
        headerRow.insert(0, "")

    # 
    # Set outputFile
    # 
    f = None
    if isinstance(filename, str) and filename != '':
        if not filename.endswith('.tex'): # assure propper file extension
            filename += '.tex'
        f = open(filename, 'w')
        if label == None:
            label = os.path.basename(filename) # get basename
            label = label.replace(".tex", "")  # remove extension. TODO: bug with filename=foo.texFoo.tex

    f = IOString(f)
    #
    # Begin block
    # 
    for ixEnv in range(0, len(environments)):
        f.write("\t"*ixEnv)
        f.write(r"\begin{%s}" % environments[ixEnv])
        # special environments:
        if environments[ixEnv] == "table":
            f.write("[ht]")
        elif environments[ixEnv] == "center":
            if caption != None:
                f.write("\n"+"\t"*ixEnv)
                f.write(r"\caption{%s}" % fixEngineeringNotation.fix(caption))
            if label != None:
                f.write("\n"+"\t"*ixEnv)
                f.write(r"\label{tab:%s}" % label)
        elif environments[ixEnv] == "tabular":
            f.write("{" + alignment + "}\n")
            f.write("\t"*ixEnv)
            f.write(r"\toprule")
        # newline
        f.write("\n")
    tabs = len(environments)            # number of \t to use

    # 
    # Table block
    # 

    # Row labels
    if headerRow != None:
        f.write("\t"*tabs)
        for j in range(0, len(headerRow)):
            f.write(r"%s" % headerRow[j])
            if j != len(headerRow)-1:
                f.write(" & ")
            else:
                f.write(r"\\"+ "\n")
                f.write("\t"*tabs)
                f.write(r"\midrule" + "\n")
                
    # Values
    for i in range(0, m):
        f.write("\t"*tabs)
        for j in range(0, n):

            if j == 0:                  # first row
                if headerColumn != None:
                    f.write("%s & " % headerColumn[i])
                    
            if '%s' not in formatColumn[j]:
                try:
                    e = float(matr[i][j])            # current element
                except ValueError: # can't convert to float, use string
                    e = matr[i][j]
                    formatColumn[j] = '%s'
                except TypeError:       # raised for None
                    e = None
            else:
                e = matr[i][j]

            if e == None or e == float('NaN'):
                f.write("-")
            elif e == float('inf'):
                f.write(r"$\infty$")
            elif e == float('-inf'):
                f.write(r"$-\infty$")                
            else:
                fcj = formatColumn[j]
                formated = fcj % e
                formated = fixEngineeringNotation.fix(formated, table=True) # fix 1e+2
                f.write(formated)
            if j != n-1:                # not last row
                f.write(" & ")
            else:                       # last row
                f.write(r"\\")
                f.write("\n")

    #
    # End block
    #
    for ixEnv in range(0, len(environments)):
        ixEnv = len(environments)-1 - ixEnv # reverse order
        # special environments:
        if environments[ixEnv] == "center":
            pass
        elif environments[ixEnv] == "tabular":
            f.write("\t"*ixEnv)
            f.write(r"\bottomrule"+"\n")
        f.write("\t"*ixEnv)
        f.write(r"\end{%s}" % environments[ixEnv])
        if ixEnv != 0:
            f.write("\n")

    f.close()
    return f.__str__()

if __name__ == '__main__':
#     m = matrix('1 2 4;3 4 6')
#     m = matrix('1 2 4;2 2 1;2 1 2')
    m = [[1, 2, 3], [3, 4, 5]]
    print(matrix2latex(m))
    print(matrix2latex(m, 'tmp.tex'))
    print(matrix2latex(m, None, "table", "center", "tabular", format="$%.2f$", alignment='lcr'))
    cl = ["a", "b", "c"]
    rl = ['d', 'e', 'f', 'g']
    print(matrix2latex(m, None, format="$%.2g$", alignment='lcr',
                 headerColumn=cl,caption="test", label="2", headerRow=rl))
    print(matrix2latex(m, None, "align*", "pmatrix", format="%g", alignment='c'))
    print(matrix2latex(m, None, headerColumn=cl, caption="Hello", label="la"))
    print(matrix2latex([['a', 'b', '1'], ['1', '2', '3']], format='%s'))

    m = [[1,None,None], [2,2,1], [2,1,2]]
    print(matrix2latex(m, transpose=True))

    # TODO:
#     m = [[1], [2,2,1], [2,1,2]]
#     print matrix2latex(m, transpose=True)
