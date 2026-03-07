import os
import io
import zipfile
import pandas as pd
import numpy as np
from flask import Flask, render_template, request, jsonify
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input
from tensorflow.keras.preprocessing import image

app = Flask(__name__)

# Global storage
store = {
    "model": None,
    "image_extractor": MobileNetV2(weights='imagenet', include_top=False, pooling='avg'),
    "feature_names": [],
    "train_cols": [],
    "classes": [],
    "data_type": None,
    "mode": None
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/train_csv', methods=['POST'])
def train_csv():
    mode = request.form.get('mode')
    target = request.form.get('target')
    selected_features = request.form.get('features', "").split(',')
    
    file = request.files['file']
    df = pd.read_csv(file).dropna()
    
    X = df[selected_features]
    y = df[target]
    
    # One-hot encode categorical strings
    X_encoded = pd.get_dummies(X)
    store.update({
        "mode": mode,
        "data_type": "csv",
        "train_cols": X_encoded.columns.tolist(),
        "feature_names": selected_features,
        "model": RandomForestClassifier() if mode == "Classification" else RandomForestRegressor()
    })
    
    store["model"].fit(X_encoded, y)
    return jsonify({"status": f"CSV {mode} Model Trained", "features": selected_features})

@app.route('/train_images', methods=['POST'])
def train_images():
    # Expecting multiple zip files. Each filename (minus .zip) is the class name.
    zip_files = request.files.getlist('zip_files')
    X_features = []
    y_labels = []
    class_names = []

    for zf in zip_files:
        class_name = zf.filename.replace('.zip', '')
        class_names.append(class_name)
        
        with zipfile.ZipFile(zf, 'r') as z:
            for file_name in z.namelist():
                if file_name.lower().endswith(('.png', '.jpg', '.jpeg')):
                    with z.open(file_name) as f:
                        img_data = f.read()
                        img = image.load_img(io.BytesIO(img_data), target_size=(224, 224))
                        x = image.img_to_array(img)
                        x = np.expand_dims(x, axis=0)
                        x = preprocess_input(x)
                        
                        feat = store["image_extractor"].predict(x, verbose=0)
                        X_features.append(feat.flatten())
                        y_labels.append(class_name)

    store.update({
        "mode": "Classification",
        "data_type": "image",
        "classes": class_names,
        "model": RandomForestClassifier()
    })
    
    store["model"].fit(np.array(X_features), y_labels)
    return jsonify({"status": "Image Classifier Trained", "classes": class_names})

@app.route('/predict', methods=['POST'])
def predict():
    if not store["model"]:
        return jsonify({"error": "No model trained"}), 400

    if store["data_type"] == 'csv':
        #df_input = pd.get_dummies(pd.DataFrame([request.json['inputs']])).reindex(columns=store["train_cols"], fill_value=0)
        df_input = pd.DataFrame([request.json['inputs']])
        for c in df_input.columns:
            df_input[c] = pd.to_numeric(df_input[c], errors='coerce')
        df_input = pd.get_dummies(df_input).reindex(columns=store["train_cols"], fill_value=0)
        res = store["model"].predict(df_input)
        return jsonify({"prediction": str(res[0])})

    elif store["data_type"] == 'image':
        file = request.files['image']
        img = image.load_img(io.BytesIO(file.read()), target_size=(224, 224))
        x = image.img_to_array(img)
        x = np.expand_dims(x, axis=0)
        x = preprocess_input(x)
        feat = store["image_extractor"].predict(x, verbose=0)
        res = store["model"].predict(feat.reshape(1, -1))
        return jsonify({"prediction": str(res[0])})

if __name__ == '__main__':
    app.run(debug=True)