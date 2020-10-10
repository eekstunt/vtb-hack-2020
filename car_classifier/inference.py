import os
import time

import cv2
import numpy as np

import classifier


CAR_CLASSES = 2, 5, 7  # car, bus, truck


def load_yolo(yolo_dir):
    # derive the paths to the YOLO weights and model configuration
    weightsPath = os.path.sep.join([yolo_dir, "yolov3.weights"])
    configPath = os.path.sep.join([yolo_dir, "yolov3.cfg"])

    # load our YOLO object detector trained on COCO dataset (80 classes)
    print("[INFO] loading YOLO from disk...")
    return cv2.dnn.readNetFromDarknet(configPath, weightsPath)


def infer_yolo(yolo, image, log=True):
    # determine only the *output* layer names that we need from YOLO
    layer_names = yolo.getLayerNames()
    output_layers = [layer_names[i[0] - 1] for i in yolo.getUnconnectedOutLayers()]

    # construct a blob from the input image and then perform a forward
    # pass of the YOLO object detector, giving us our bounding boxes and
    # associated probabilities
    blob = cv2.dnn.blobFromImage(image, 1 / 255.0, (416, 416),
                                 swapRB=True, crop=False)
    yolo.setInput(blob)
    start = time.time()
    outputs = yolo.forward(output_layers)
    end = time.time()

    # show timing information on YOLO
    if log:
        print("[INFO] YOLO took {:.6f} seconds".format(end - start))
    return outputs


def filter_outputs(yolo_outputs, nms_threshold, image_height, image_width):
    # initialize our lists of detected bounding boxes, confidences, and
    # class IDs, respectively
    boxes = []
    confidences = []
    class_ids = []

    # loop over each of the layer outputs
    for output in yolo_outputs:
        # loop over each of the detections
        for detection in output:
            # extract the class ID and confidence (i.e., probability) of
            # the current object detection
            scores = detection[5:]
            classID = np.argmax(scores)
            confidence = scores[classID]

            # if confidence > 0.05:
            #     box = detection[0:4] * np.array([image_width, image_height, image_width, image_height])
            #     (centerX, centerY, width, height) = box.astype("int")
            #
            #     # use the center (x, y)-coordinates to derive the top and
            #     # and left corner of the bounding box
            #     x = int(centerX - (width / 2))
            #     y = int(centerY - (height / 2))
            #
            #     # update our list of bounding box coordinates, confidences,
            #     # and class IDs
            #     print(classID, [x, y, int(width), int(height)], confidence)

            if confidence < 0.05 or classID not in CAR_CLASSES:
                continue

            # scale the bounding box coordinates back relative to the
            # size of the image, keeping in mind that YOLO actually
            # returns the center (x, y)-coordinates of the bounding
            # box followed by the boxes' width and height
            box = detection[0:4] * np.array([image_width, image_height, image_width, image_height])
            (centerX, centerY, width, height) = box.astype("int")

            # use the center (x, y)-coordinates to derive the top and
            # and left corner of the bounding box
            x = int(centerX - (width / 2))
            y = int(centerY - (height / 2))

            # update our list of bounding box coordinates, confidences,
            # and class IDs
            boxes.append([x, y, int(width), int(height)])
            confidences.append(float(confidence))
            class_ids.append(classID)

    # apply non-maxima suppression to suppress weak, overlapping bounding boxes
    indices = np.asarray(cv2.dnn.NMSBoxes(boxes, confidences, 0, nms_threshold), dtype=np.int)

    boxes = np.asarray(boxes)
    confidences = np.asarray(confidences)
    class_ids = np.asarray(class_ids)
    car_indices = indices[np.isin(class_ids[indices], CAR_CLASSES)]
    return boxes[car_indices], confidences[car_indices]


def predict(car_classifier, image, box, top=None, log=True):
    makes = []
    models = []
    confidences = []

    start = time.time()
    x, y, w, h = box
    predictions = car_classifier.predict(image[max(y, 0):y + h, max(x, 0):x + w], top=top)
    for prediction in predictions:
        makes.append(prediction['make'])
        models.append(prediction['model'])
        confidences.append(prediction['prob'])
    end = time.time()

    # show timing information on MobileNet classifier
    if log:
        print("[INFO] classifier took {:.6f} seconds".format(end - start))

    return tuple(map(np.asarray, (makes, models, confidences)))


class MakeModelPredictor:
    def __init__(self, yolo_dir, min_confidence, nms_threshold):
        self.min_confidence = min_confidence
        self.nms_threshold = nms_threshold

        self.car_classifier = classifier.Classifier()
        self.yolo = load_yolo(yolo_dir)

    def select_box(self, boxes, confidences):
        if len(boxes) == 1:
            return boxes[0]
        selection = boxes
        if len(boxes) > 2:
            min_confidence = self.min_confidence
            for _ in range(3):
                selection = [box for (box, confidence) in zip(boxes, confidences) if confidence > min_confidence + 1e9]
                if len(selection) >= 2:
                    break
                min_confidence /= 2
            else:
                selection = boxes
        return sorted(selection, key=lambda box: box[2] * box[3])[-1]

    def predict(self, image, top=None, log=True):
        height, width = image.shape[:2]
        yolo_outputs = infer_yolo(self.yolo, image, log=log)
        boxes, confidences = filter_outputs(yolo_outputs, self.nms_threshold, height, width)
        if len(boxes) == 0:
            box = (0, 0, width, height)
            prediction = tuple(map(np.asarray, (['UNKNOWN'], ['UNKNOWN'], [1])))
        else:
            box = self.select_box(boxes, confidences)
            prediction = predict(self.car_classifier, image, box, top=top, log=log)

        return (box, *prediction)
