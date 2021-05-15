import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # or any {'0', '1', '2'}
import tensorflow as tf
from tensorflow import keras
import cv2
import numpy as np
import argparse
import skvideo.io

# Usage: 
# python run_classification.py -m ./models/resNetModel.h5 \
#     -i ./input/example.mp4 \
#     -o ./output/example.mp4

ap = argparse.ArgumentParser()
ap.add_argument("-m", "--model", required=True, help="path to trained serialized model")
ap.add_argument("-i", "--input", required=True, help="path to our input video")
ap.add_argument("-o", "--output", required=True, help="path to our output video")

args = vars(ap.parse_args())

def FeatureExtration(img):
    # https://github.com/shomnathsomu/crack-detection-opencv/blob/master/CrackDetection.py
    # https://stackoverflow.com/questions/41893029/opencv-canny-edge-detection-not-working-properly
    gray_image = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    v = np.median(gray_image)
    sigma = 0.33
    lower = int(max(0, (1.0 - sigma) * v))
    upper = int(min(255, (1.0 + sigma) * v))
    edges = cv2.Canny(gray_image, lower, upper)

    # Morphological Closing Operator
    kernel = np.ones((5,5),np.uint8)
    closing = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)

    # Create feature detecting method
    orb = cv2.ORB_create(nfeatures=1500)

    # Make featured Image
    keypoints, descriptors = orb.detectAndCompute(closing, None)
    featuredImg = cv2.drawKeypoints(img, keypoints, None)

    return featuredImg

def center_crop(img, new_width=None, new_height=None):        
    width = img.shape[1]
    height = img.shape[0]

    if new_width is None:
        new_width = min(width, height)

    if new_height is None:
        new_height = min(width, height)

    left = int(np.ceil((width - new_width) / 2))
    right = width - int(np.floor((width - new_width) / 2))

    top = int(np.ceil((height - new_height) / 2))
    bottom = height - int(np.floor((height - new_height) / 2))

    if len(img.shape) == 2:
        center_cropped_img = img[top:bottom, left:right]
    else:
        center_cropped_img = img[top:bottom, left:right, ...]

    return center_cropped_img

def main():
    print("Start CNN Model")

    trained_model_path = args["model"]
    video_path = args["input"]
    output_path =  args["output"]

    model = keras.models.load_model(trained_model_path)

    video = cv2.VideoCapture(video_path)
    length = int(video.get(cv2.CAP_PROP_FRAME_COUNT))

    count = 0
    writer = None
    (W, H) = (None, None)

    print("Processing Video")

    while True:
        grabbed, frame = video.read()

        if not grabbed:
            break

        if W is None or H is None:
            (H, W) = frame.shape[:2]

        feature_img = FeatureExtration(frame)

        # Resize into 200x200 for model
        img_array = cv2.resize(feature_img, (200, 200), interpolation = cv2.INTER_AREA)
        
        # Normalise to 0 - 1
        img_array = cv2.normalize(img_array, None, alpha=0, beta=1, norm_type=cv2.NORM_MINMAX, dtype=cv2.CV_32F)

        # Change from 200x200 to 1x200x200 coz the model input shape
        img_array = np.expand_dims(img_array, axis=0)

        prediction = model.predict(img_array)
        prediction = np.argmax(prediction, axis=1).astype("bool")[0]
        # print(prediction)

        # text = "Concrete Cracked: {}".format(prediction)
        text = "{}".format(prediction)
        cv2.putText(feature_img, text, (35, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 255, 0), 5)

        if writer is None:
            # initialize our video writer
            writer = skvideo.io.FFmpegWriter(output_path)


        writer.writeFrame(feature_img)
        # plt.imshow(feature_img)
        # plt.show()

        if (count / length * 100 % 5 == 0):
            print("{:.1f}% Complete".format(count / length * 100))

        count += 1

        key = cv2.waitKey(1) & 0xFF
        # if the `q` key was pressed, break from the loop
        if key == ord("q"):
            break

    video.release()
    writer.close()
    cv2.destroyAllWindows()

    print("100% Complete")
    print("Video Completed")

if __name__ == "__main__":
    # execute only if run as a script
    main()