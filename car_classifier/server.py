import io
import os
import pickle
from base64 import b64decode

import numpy as np
from flask import abort, Flask, jsonify, request
from PIL import Image, ImageFile, UnidentifiedImageError

from inference import MakeModelPredictor


USE_PYHEIF = os.getenv('USE_PYHEIF', '') not in ('', '0')
DUMP = os.getenv('DUMP', '') not in ('', '0')
DUMP_DIR = 'dumps'
if USE_PYHEIF:
    import pyheif


app = Flask(__name__)
predictor = MakeModelPredictor('yolo-coco', 0.5, 0.3)
with open('clf.pickle', 'rb') as f:
    MODELS, ALL_MODELS, clf = pickle.load(f)


def get_next_image_number(dir):
    return max(map(lambda p: int(p.split('.')[0]), os.listdir(dir)), default=0) + 1

if DUMP:
    os.makedirs(DUMP_DIR, exist_ok=True)
    IMAGE_NUMBER = get_next_image_number(DUMP_DIR)


def dump_image(data):
    global IMAGE_NUMBER
    with open(f'{DUMP_DIR}/{IMAGE_NUMBER}.jpg', 'wb') as f:
        f.write(data)
    IMAGE_NUMBER += 1


@app.route('/classify', methods=['POST'])
def classify_car():
    image = np.asarray(Image.open(request.stream))
    _, makes, models, confidences = predictor.predict(image, log=False)

    X = np.zeros((1, len(ALL_MODELS)), dtype=np.float32)
    for make, model, confidence in zip(makes, models, confidences):
        X[0, ALL_MODELS.index(f'{make} {model}')] = float(confidence)
    y = clf.predict_proba(X)[0]

    result = dict(zip(MODELS, y))
    # for make, model, confidence in zip(makes, models, confidences):
    #     result[f'{make} {model}'] = float(confidence)
    return jsonify(result)


def load_image(bs):
    ImageFile.LOAD_TRUNCATED_IMAGES = True
    try:
        image = Image.open(io.BytesIO(bs))
    except UnidentifiedImageError as err1:
        if USE_PYHEIF:
            try:
                heif = pyheif.read(bs)
            except ValueError as err2:
                raise err1 from err2
            image = Image.frombytes(
                heif.mode,
                heif.size,
                heif.data,
                "raw",
                heif.mode,
                heif.stride)
        else:
            raise

    if image.mode in ('P', 'RGBA'):
        image = image.convert('RGBA')
        background = Image.new('RGBA', image.size, (255, 255, 255))
        image = Image.alpha_composite(background, image)

    image = image.convert('RGB')

    array = np.asarray(image)
    if len(array.shape) == 2:
        array = array[:, :, None]
    if array.shape[2] == 1:
        array = np.concatenate([array] * 3, axis=2)
    return array


def parse_image():
    # if DUMP:
    #     with open('dump.txt', 'wb') as f:
    #         f.write(request.get_data())
    req = request.get_json(force=True, silent=True)
    if req is None:
        raise ValueError('Could not parse JSON')
    if list(req.keys()) != ['content']:
        raise ValueError('Root key "content" not found')
    if not isinstance(req['content'], str):
        raise ValueError('The value at "content" is not string')

    try:
        bs = b64decode(req['content'])
    except ValueError:
        raise ValueError('Invalid base64')

    if DUMP:
        try:
            dump_image(bs)
        except Exception:
            pass

    try:
        # return np.asarray(Image.open(io.BytesIO(bs)))
        return load_image(bs)
    except ValueError:
        raise ValueError('Could not decode image')


def format_model(model):
    suffix = ' sedan'
    if model.endswith(suffix):
        model = model[:-len(suffix)]
    if model == 'Hyundai Solaris':
        model = 'Hyundai SOLARIS'
    return model


@app.route('/car-recognize', methods=['POST'])
def car_recognize():
    try:
        image = parse_image()
    except ValueError as e:
        abort(422, jsonify({'detail': [{'loc': [0, 0], 'msg': e.args[0], 'type': 'validation error'}]}))
        return

    _, makes, models, confidences = predictor.predict(image, log=False)

    X = np.zeros((1, len(ALL_MODELS)), dtype=np.float32)
    for make, model, confidence in zip(makes, models, confidences):
        X[0, ALL_MODELS.index(f'{make} {model}')] = float(confidence)
    y = clf.predict_proba(X)[0]

    probs = dict(zip(map(format_model, MODELS), y))
    return jsonify({'probabilities': probs})


@app.route('/dump')
def dump():
    with open('dump.txt', 'rb') as f:
        return f.read()


if __name__ == '__main__':
    app.run('0.0.0.0', 9988)
