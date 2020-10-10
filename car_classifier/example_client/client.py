import os
import time
from base64 import b64encode

import pandas as pd
import requests
from tqdm import tqdm


# HOST = 'http://127.0.0.1:9988'
HOST = 'http://84.201.140.87:9988'
# HOST = 'http://0a76dc5fb549.ngrok.io'
RAW_ENDPOINT = f'{HOST}/classify'
JSON_ENDPOINT = f'{HOST}/car-recognize'

BASE_DIR = '../../data'


def get_confidences(image, use_json=True):
    with open(image, 'rb') as file:
        image_bytes = file.read()
    if not use_json:
        resp = requests.post(RAW_ENDPOINT, data=image_bytes)
    else:
        resp = requests.post(JSON_ENDPOINT, json={'content': b64encode(image_bytes)})
    result = resp.json()
    if use_json:
        result = result['probabilities']
    return result


def show_example_confidences(path='example.jpeg', use_json=True):
    confidences = get_confidences(path, use_json=use_json)
    top = sorted(confidences.items(), key=lambda p: p[1])[::-1]
    for car, confidence in top[:20]:
        print(f'{car:<21} {confidence:.4f}')


def list_all_paths(base=BASE_DIR):
    for dir in os.listdir(base):
        abs = os.path.join(base, dir)
        if not os.path.isdir(abs):
            continue
        for file in os.listdir(abs):
            if not file.endswith('jpeg'):
                continue
            yield f'{dir}/{file}'


def run_whole_dataset(use_json=True):
    all_paths = list(list_all_paths())
    faulty_paths = []
    results = None
    t = tqdm(enumerate(all_paths), total=len(all_paths))
    for i, path in t:
        t.set_description(f'{path:<40}; {len(faulty_paths)} failed')
        try:
            start = time.monotonic()
            confidences = get_confidences(f'{BASE_DIR}/{path}', use_json=use_json)
            duration = time.monotonic() - start
        except Exception:
            faulty_paths.append(path)
            continue

        if results is None:
            results = pd.DataFrame(
                columns=['path', 'failed', 'time', 'pred', *confidences.keys()],
                index=range(len(all_paths)))

        pred = sorted(confidences.items(), key=lambda p: p[1])[-1][0]
        row = {'path': path, 'failed': False, 'time': duration, 'pred': pred, **confidences}
        results.iloc[i] = pd.Series(row)

        if i % 100 == 0:
            results.to_csv('results.csv')

    default_confidences = {make: 1 / len(confidences) for make in confidences}
    for i, path in enumerate(faulty_paths, start=len(all_paths) - len(faulty_paths)):
        row = {'path': path, 'failed': True, 'time': -1, 'pred': 'UNKNOWN', **default_confidences}
        results.iloc[i] = pd.Series(row)
    results.to_csv('results.csv')


def main():
    show_example_confidences(use_json=True)
    # run_whole_dataset(use_json=True)


if __name__ == '__main__':
    main()
