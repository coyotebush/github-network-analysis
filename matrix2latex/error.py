# Error handling for matrix2latex.py,
# todo: don't yell at errors, fix them!
# To clean the code, error handling is moved to small functions
def assertStr(value, key):
    assert isinstance(value, str), \
           "expected %s to be a str, got %s" % (key, type(value))
    
def assertKeyFormat(value):
    assertStr(value, "format")
    assert r"%" in value, \
           "expected a format str, got %s" % value
    assert value.count("%") == 1,\
           "expected a single format, got %s" % value
    
def assertKeyAlignment(value, n):
    assertStr(value, "alignment")
    assert ("c" in value or "l" in value or "r" in value), \
           "expected legal alignment c, l or r, got %s" % value
    counter = dict()
    counter['c'] = 0
    counter['l'] = 0
    counter['r'] = 0
    for v in value:
        if v in counter:
            counter[v] += 1
        else:
            counter[v] = 1
    length = counter['c'] + counter['l'] + counter['r']
    return length
#    assert length == n,\
#           "Error: %g of %g alignments given '%s'\n" % (length, n, value)

def assertListString(value, key):
    assert isinstance(value, list),\
           "Expected %s to be a list, got %s" % (key, type(value))
    for e in value:
        assertStr(e, "%s element" % key)
