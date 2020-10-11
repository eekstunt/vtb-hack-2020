from pprint import pprint
import requests


BASE_URL = 'http://127.0.0.1:9999'


def request(endpoint, json=None):
    url = f'{BASE_URL}/{endpoint}'
    method = 'GET'
    if json is not None:
        method = 'POST'
    return requests.request(method, url, json=json).json()


def main():
    resp = request('payments-graph', json=dict(contractRate=13.6, lastPayment=0, loanAmount=3761234, term=4, payment=102028))
    pprint(resp)
    # print(resp.keys())


if __name__ == '__main__':
    main()
