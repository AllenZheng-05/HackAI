import os
import io
import zipfile
import pandas as pd
import numpy as np

from flask import Flask, render_template, request, jsonify

from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, r2_score, mean_squared_error

from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input
from tensorflow.keras.preprocessing import image

app = Flask(__name__)

# GLOBAL MODEL STORE
store = {
    "model": None,
    "image_extractor": MobileNetV2(weights='imagenet', include_top=False, pooling='avg'),
    "feature_names": [],
    "train_cols": [],
    "classes": [],
    "data_type": None,
    "mode": None,
    "metrics": {},
    "feature_importance": {}
}


@app.route('/')
def index():
    return render_template('index.html')


# ============================================
# TRAIN CSV MODEL
# ============================================

@app.route('/train_csv', methods=['POST'])
def train_csv():

    mode = request.form.get('mode')
    target = request.form.get('target')
    selected_features = request.form.get('features', "").split(',')

    file = request.files['file']

    df = pd.read_csv(file).dropna()

    X = df[selected_features]
    y = df[target]

    # One-hot encoding
    X_encoded = pd.get_dummies(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_encoded,
        y,
        test_size=0.2,
        random_state=42
    )

    # Extract model parameters from request with defaults
    model_params = {
        'n_estimators': int(request.form.get('n_estimators', 300)),
        'max_depth': int(request.form.get('max_depth', 20)) if request.form.get('max_depth') else None,
        'min_samples_split': int(request.form.get('min_samples_split', 2)),
        'min_samples_leaf': int(request.form.get('min_samples_leaf', 1)),
        'random_state': 42
    }

    if mode == "Classification":

        model = RandomForestClassifier(**model_params)

    else:

        model = RandomForestRegressor(**model_params)

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    # METRICS
    if mode == "Classification":

        acc = accuracy_score(y_test, y_pred)

        store["metrics"] = {
            "accuracy": float(acc),
            "samples": len(df)
        }

    else:

        r2 = r2_score(y_test, y_pred)
        mse = mean_squared_error(y_test, y_pred)

        store["metrics"] = {
            "r2_score": float(r2),
            "mse": float(mse)
        }

    # FEATURE IMPORTANCE
    importances = model.feature_importances_

    store.update({
        "mode": mode,
        "data_type": "csv",
        "train_cols": X_encoded.columns.tolist(),
        "feature_names": selected_features,
        "model": model,
        "feature_importance": dict(zip(X_encoded.columns, importances))
    })

    return jsonify({
        "status": f"CSV {mode} Model Trained",
        "metrics": store["metrics"],
        "features": selected_features
    })


# ============================================
# TRAIN IMAGE MODEL
# ============================================

@app.route('/train_images', methods=['POST'])
def train_images():

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

                        img = image.load_img(
                            io.BytesIO(img_data),
                            target_size=(224, 224)
                        )

                        x = image.img_to_array(img)

                        x = np.expand_dims(x, axis=0)

                        x = preprocess_input(x)

                        feat = store["image_extractor"].predict(x, verbose=0)

                        X_features.append(feat.flatten())

                        y_labels.append(class_name)

    X_features = np.array(X_features)

    # Extract model parameters from request with defaults
    model_params = {
        'n_estimators': int(request.form.get('n_estimators', 300)),
        'max_depth': int(request.form.get('max_depth', 20)) if request.form.get('max_depth') else None,
        'min_samples_split': int(request.form.get('min_samples_split', 2)),
        'min_samples_leaf': int(request.form.get('min_samples_leaf', 1)),
        'random_state': 42
    }

    model = RandomForestClassifier(**model_params)

    model.fit(X_features, y_labels)

    store.update({
        "mode": "Classification",
        "data_type": "image",
        "classes": class_names,
        "model": model
    })

    return jsonify({
        "status": "Image Classifier Trained",
        "classes": class_names
    })


# ============================================
# PREDICTION
# ============================================

@app.route('/predict', methods=['POST'])
def predict():

    if not store["model"]:
        return jsonify({"error": "No model trained"}), 400

    # -------------------
    # CSV Prediction
    # -------------------

    if store["data_type"] == 'csv':

        df_input = pd.DataFrame([request.json['inputs']])

        # convert numeric strings
        df_input = df_input.apply(pd.to_numeric, errors="coerce")

        df_input = pd.get_dummies(df_input).reindex(
            columns=store["train_cols"],
            fill_value=0
        )

        pred = store["model"].predict(df_input)[0]

        response = {
            "prediction": str(pred)
        }

        if store["mode"] == "Classification":

            proba = store["model"].predict_proba(df_input)[0].tolist()

            response["probabilities"] = proba

        return jsonify(response)

    # -------------------
    # IMAGE Prediction
    # -------------------

    elif store["data_type"] == 'image':

        file = request.files['image']

        img = image.load_img(
            io.BytesIO(file.read()),
            target_size=(224, 224)
        )

        x = image.img_to_array(img)

        x = np.expand_dims(x, axis=0)

        x = preprocess_input(x)

        feat = store["image_extractor"].predict(x, verbose=0)

        pred = store["model"].predict(feat.reshape(1, -1))[0]

        return jsonify({"prediction": str(pred)})


# ============================================
# MODEL METRICS API
# ============================================

@app.route('/metrics')
def metrics():

    if not store["metrics"]:
        return jsonify({"error": "Model not trained"}), 400

    return jsonify(store["metrics"])


# ============================================
# FEATURE IMPORTANCE API
# ============================================

@app.route('/feature_importance')
def feature_importance():

    if not store["feature_importance"]:
        return jsonify({"error": "Model not trained"}), 400

    sorted_feats = sorted(
        store["feature_importance"].items(),
        key=lambda x: x[1],
        reverse=True
    )

    return jsonify(sorted_feats)


# ============================================
# MODEL INFO
# ============================================

@app.route('/model_info')
def model_info():

    if not store["model"]:
        return jsonify({"error": "No model trained"}), 400

    # CSV models
    if store["data_type"] == "csv":
        return jsonify({
            "data_type": "csv",
            "mode": store["mode"],
            "features": store["feature_names"],
            "n_features_after_encoding": len(store["train_cols"])
        })

    # Image models
    elif store["data_type"] == "image":
        return jsonify({
            "data_type": "image",
            "mode": "Classification",
            "classes": store["classes"],
            "feature_extractor": "MobileNetV2"
        })


# ============================================

if __name__ == '__main__':
    app.run(debug=True)