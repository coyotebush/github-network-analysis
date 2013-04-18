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

import re

def fix(s, table=False):
    """
    input: (string) s
    output: (string) s
    takes any number in s and replaces the format
    '8e-08' with '8\e{-08}'
    """
    i = re.search('e[-+]\d\d', s)
    while i != None:
        before = s[:i.start()]
        number = s[i.start()+1:i.start()+4]
        after = s[i.end():]
#       print 'before', before
# 	print 'number', number
# 	print 'after', after
        if table:
            num = "%(#)+03d" % {'#': int(number)}
        else:
            num = "%(#)3d" % {'#': int(number)}
            
        s = '%s\\e{%s}%s' % (before, num, after)
        i = re.search('e[-+]\d\d', s)
    return s
