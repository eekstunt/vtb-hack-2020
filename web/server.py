from base64 import b64encode

import requests
from flask import Flask, jsonify, request


API_KEY = '0addb468a816d42f276fbd1f810c9527'
# API_KEY = '45e8a43bfef45bc3b9b9fdf93e6fa7d2'
BASE_URL = 'https://gw.hackathon.vtb.ru/vtb/hackathon'
POST_ENDPOINTS = 'calculate', 'payments-graph', 'carloan'
GET_ENDPOINTS = 'marketplace', 'settings'


def call_api(endpoint, payload=None):
    method = 'GET'
    if payload is not None:
        method = 'POST'
    url = f'{BASE_URL}/{endpoint}'
    resp = requests.request(method, url, json=payload, headers={'X-IBM-Client-Id': API_KEY})
    return resp.json()


class Marketplace:
    def __init__(self, data):
        self.data = data['list']
        self.models_by_make = {
            make['title'].lower(): {
                ' '.join((model['title'].lower(), model['alias'].lower())): self._extract_info(model)
                for model in make['models']}
            for make in self.data}
        self.make_by_title = {
            make['title'].lower(): {
                'title': make['title'],
                'titleRus': make['titleRus']}
            for make in self.data}

    @classmethod
    def _extract_info(cls, model):
        return dict(
            title=model['title'],
            titleRus=model['titleRus'],
            price=model['minPrice'],
            photo=model['photo'])

    def get_model_info(self, make_model):
        make_model = make_model
        if 'land rover' in make_model.lower():
            make = 'Land Rover'
            model = ' '.join(make_model.split()[2:])
        else:
            make, *rest = make_model.split()
            model = ' '.join(rest)
        make_info = self.make_by_title[make.lower()]
        models = self.models_by_make[make.lower()]
        for model_key, info in models.items():
            if model.lower() in model_key:
                break
        else:
            raise KeyError(
                f'Could not find "{model}" among the models of "{make}"'
                f' (available keys: {", ".join(models.keys())})')

        info['car'] = make_model
        info['make'] = make_info['title']
        info['makeRus'] = make_info['titleRus']
        info['makeModel'] = ' '.join((info['make'], info['title']))
        info['makeModelRus'] = ' '.join((info['makeRus'], info['titleRus']))
        return info


_MARKETPLACE = None


def get_marketplace():
    global _MARKETPLACE
    if _MARKETPLACE is None:
        data = call_api('marketplace')
        _MARKETPLACE = Marketplace(data)
    return _MARKETPLACE


app = Flask(__name__, static_url_path='')


@app.route('/')
def root():
    return app.send_static_file('index.html')


@app.route('/car-recognize', methods=['POST'])
def recognize():
    image = request.get_data()
    return jsonify(call_api('car-recognize', payload={'content': b64encode(image)}))


@app.route('/get-car-info', methods=['POST'])
def get_car_info():
    make_model = request.get_json(force=True)['make_model']
    return jsonify(get_marketplace().get_model_info(make_model))


def get_api_handler(endpoint):
    def handler():
        payload = None
        if request.method == 'POST':
            payload = request.get_json(force=True)
        return jsonify(call_api(endpoint, payload=payload))
    handler.__name__ = endpoint
    return handler


def register_endpoints(get_endpoints, post_endpoints, handler_factory):
    for method, endpoints in (('GET', get_endpoints), ('POST', post_endpoints)):
        for endpoint in endpoints:
            app.route(f'/{endpoint}', methods=[method])(handler_factory(endpoint))


register_endpoints(GET_ENDPOINTS, POST_ENDPOINTS, get_api_handler)


if __name__ == '__main__':
    app.run('0.0.0.0', port=9999)
