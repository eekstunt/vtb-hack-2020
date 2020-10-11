import requests


BASE_URL = 'http://127.0.0.1:9999'


def request(endpoint, json=None):
    url = f'{BASE_URL}/{endpoint}'
    method = 'GET'
    if json is not None:
        method = 'POST'
    return requests.request(method, url, json=json).json()


def main():
    resp = request('settings')
    print(resp)
    # print(resp.keys())


if __name__ == '__main__':
    main()
