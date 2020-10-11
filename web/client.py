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
    # resp = request('payments-graph', json=dict(contractRate=13.6, lastPayment=0, loanAmount=3761234, term=4, payment=102028))
    # pprint(resp)
    for make_model in [
            'SKODA OCTAVIA',
            'BMW 3',
            'BMW 5',
            'Cadillac ESCALADE',
            'Chevrolet Tahoe',
            'Hyundai Genesis',
            'Jaguar F-PACE',
            'KIA K5',
            'KIA Optima',
            'KIA Sportage',
            'Land Rover RANGE ROVER VELAR',
            'Mazda 3',
            'Mazda 6',
            'Mercedes A',
            'Toyota Camry',
            'Hyundai SOLARIS',
            'KIA Rio',
            'Volkswagen Polo',
            'Volkswagen Tiguan']:
        resp = request('get-car-info', json=dict(make_model=make_model))
        print(f'\n{make_model}')
        pprint(resp)

    # resp = request('payments-graph', json=dict(contractRate=13.6, lastPayment=0, loanAmount=3761234, term=4, payment=102028))
    # pprint(resp)
    # print(resp.keys())


if __name__ == '__main__':
    main()
