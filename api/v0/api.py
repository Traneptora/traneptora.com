# python3 uwsgi
# api.py
# api dispatch file

import json
import traceback

from pr_data import post as pr_data_post
from dump import post as dump_post
from dump import get as dump_get
from random_api import get as random_get
from short_api import get as short_get

endpoints = {
    '/azur-lane/pr-data/': {
        'post': pr_data_post,
    },
    '/dump/': {
        'post': dump_post,
        'get': dump_get,
    },
    '/random/': {
        'get': random_get,
    },
}

endpoints_0x2 = {
    '': {
        'get': short_get,
    },
}

def is_post_request(environ):
    if environ['REQUEST_METHOD'].upper() != 'POST':
        return (False, False)
    if environ.get('CONTENT_TYPE', '').startswith('multipart/form-data'):
        return (True, True)
    return (True, False)

def application(env, start_response):
    try:
        status, headers, lines = response_checker(env)
        start_response(status, headers)
        return lines
    except Exception as ex:
        traceback.print_exc()
        status = '500 Internal Server Error'
        start_response(status, [('Content-Type', 'application/json')])
        return [json.dumps({'success': False, 'status': status}).encode()]

def response_checker(env):
    status, result, headers, *_ = *dispatch(env), [], None
    if status.startswith('301') or status.startswith('302'):
        headers += [('location', result)]
        return (status, headers, [])
    ct = 'application/json'
    for k, v in headers:
        if k.lower() == 'content-type':
            ct = v
            break
    if status.startswith('200'):
        headers += [('content-type', ct)]
        if ct == 'application/json':
            return (status, headers, [json.dumps(result).encode()])
        else:
            return (status, headers, [result])
    headers += [('content-type', 'application/json')]
    result_dict = {'success': False, 'status': status}
    if result:
        result_dict['result'] = result
    result = [json.dumps(result_dict).encode()]
    return (status, headers, result)

def dispatch(env):
    host_is_0x2 = False
    if env['HTTP_HOST'] == '0x2.us':
        request_uri = env['REQUEST_URI'].removeprefix('/')
        host_is_0x2 = True
    elif not env['REQUEST_URI'].startswith('/api/v0/'):
        return ('404 Not Found', None)
    else:
        request_uri = env['REQUEST_URI'][len('/api/v0'):]
    matched_endpoint = None
    endpoints_list = endpoints_0x2 if host_is_0x2 else endpoints
    for endpoint in endpoints_list:
        if request_uri.startswith(endpoint):
            matched_endpoint = endpoint
            break
    if matched_endpoint is None:
        return ('404 Not Found', None)
    method_table = endpoints_list[matched_endpoint]
    post, formdata = is_post_request(env)
    if post:
        if matched_endpoint != request_uri:
            return ('404 Not Found', 'Bad Endpoint')
        if not formdata:
            return ('400 Bad Request', 'Please use content-type: multipart/form-data')
        if 'post' in method_table:
            return method_table['post'](env, request_uri)
    elif env['REQUEST_METHOD'].lower() in method_table:
        return method_table[env['REQUEST_METHOD'].lower()](env, request_uri)
    return ('405 Method Not Allowed', None)
