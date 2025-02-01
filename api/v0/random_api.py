import base64
import binascii
import random
import zlib

def get(env, relative_uri):
    # server still python 3.8
    encoded_tail = relative_uri[len('/random/'):]
    try:
        comp_uri = base64.b64decode(encoded_tail, altchars=b'-_', validate=True)
    except binascii.Error:
        return ('404 Not Found', 'Not base64url')
    try:
        payload = zlib.decompress(comp_uri)
        count = int.from_bytes(payload[0], byteorder='little', signed=False)
        if count == 0:
            return ('404 Not Found', 'No Content')
        index = 1
        maxlen = len(payload)
        urls = []
        for i in range(count):
            if index + 4 >= maxlen:
                return ('404 Not Found', 'Not Enough Space For Length')
            length = int.from_bytes(payload[index : index+4], byteorder='little', signed=False)
            index += 4
            if length == 0 or index + length >= maxlen:
                return ('404 Not Found', 'Bad Length')
            url = payload[index : index + length].decode()
            index += length
            urls += [url]
        url = urls[random.randrange(count)]
        return ('302 Found', url)
    except Exception:
        return ('404 Not Found', 'Bad Format')
