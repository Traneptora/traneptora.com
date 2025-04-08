def get(env, relative_uri):
    try:
        with open(f'../../../0x2/{relative_uri}', 'r') as file:
            return ('301 Moved Permanently', file.read())
    except Exception:
        return ('404 Not Found', 'Not Found')
