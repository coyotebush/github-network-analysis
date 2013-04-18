# I needed a string object that had the write function

class IOString:                  # todo subclass str?
    # For a file like object, writes to the file while keeping
    # a local buffer.
    def __init__(self, fileObject=None):
        self.f = fileObject
        self.s = ""
        
    def write(self, s):
        try:
            self.f.write(s)
        except AttributeError:
            pass
        self.s += s

    def __str__(self):
        return self.s

    def close(self):
        try:
            self.f.close()
        except AttributeError:
            pass        
