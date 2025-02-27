import base64
import binascii
import random
import zlib

ext_map = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'webp': 'image/webp',
    'gif': 'image/gif',
    'jxl': 'image/jxl',
}

def get(env, relative_uri):
    # server still python 3.8
    encoded_tail = relative_uri[len('/random/'):]
    try:
        comp_uri = base64.b64decode(encoded_tail, altchars=b'-_', validate=True)
    except binascii.Error:
        return ('404 Not Found', 'Not base64url')
    try:
        payload = zlib.decompress(comp_uri, wbits=-9)
        if len(payload) == 0:
            return ('404 Not Found', 'Empty Payload')
        count = payload[0]
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
            if length == 0 or index + length > maxlen:
                return ('404 Not Found', 'Bad Length')
            url = payload[index : index + length].decode()
            index += length
            urls += [url]
        url = urls[random.randrange(count)]
        if url.startswith('https://buzo.us/') or '/' not in url:
            fname = url.removeprefix('https://buzo.us/')
            for k, v in ext_map.items():
                if fname.endswith(f'.{k}'):
                    with open(f'../../share/{fname}', 'rb') as file:
                        return ('200 OK', file.read(), [('content-type', v)])
        return ('302 Found', url)
    except Exception:
        return ('404 Not Found', 'Bad Format')
