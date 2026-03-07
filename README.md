# HackAI - Universal Teachable Machine

A web-based machine learning application that allows users to train and test models on both tabular (CSV) data and images without writing any code.

## Features

### Tabular Data (CSV)

- **Classification**: Train models to categorize data into different classes
- **Regression**: Train models to predict continuous numerical values
- **Feature Selection**: Choose which columns to include in training and remove data leakage columns
- **Model Metrics**: View accuracy (classification) or R² score/MSE (regression)
- **Feature Importance**: See which features contribute most to predictions

### Image Classification

- **Transfer Learning**: Uses MobileNetV2 (pretrained on ImageNet) for feature extraction
- **Multi-class Support**: Upload multiple ZIP files, one per class (e.g., `cats.zip`, `dogs.zip`)
- **Easy Testing**: Upload new images to classify after training

## Tech Stack

- **Backend**: Flask (Python)
- **ML Models**: scikit-learn (RandomForest)
- **Deep Learning**: TensorFlow/Keras (MobileNetV2 for image features)
- **Frontend**: Bootstrap 5

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/HackAI.git
   cd HackAI
   ```

2. Install dependencies:
   ```bash
   pip install flask pandas scikit-learn tensorflow pillow
   ```

## Running the App

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Start the Flask server:

   ```bash
   python app.py
   ```

3. Open your browser and go to `http://127.0.0.1:5000`

## Usage

### Training a CSV Model

1. Select "Tabular (CSV)" from the dropdown
2. Choose Classification or Regression mode
3. Upload your CSV file
4. Uncheck any columns that might cause data leakage
5. Enter the target column name
6. Click "Train CSV Model"

### Training an Image Classifier

1. Select "Visual (Image ZIPs)" from the dropdown
2. Prepare ZIP files for each class (e.g., `cats.zip` containing cat images)
3. Upload all ZIP files at once
4. Click "Train Image Model"

### Making Predictions

After training, the prediction panel will update:

- **CSV**: Enter values for each feature and click "Predict"
- **Images**: Upload an image and click "Classify Image"

## API Endpoints

| Endpoint              | Method | Description                         |
| --------------------- | ------ | ----------------------------------- |
| `/`                   | GET    | Main web interface                  |
| `/train_csv`          | POST   | Train model on CSV data             |
| `/train_images`       | POST   | Train image classifier              |
| `/predict`            | POST   | Make predictions                    |
| `/metrics`            | GET    | Get model performance metrics       |
| `/feature_importance` | GET    | Get feature importance rankings     |
| `/model_info`         | GET    | Get information about trained model |
