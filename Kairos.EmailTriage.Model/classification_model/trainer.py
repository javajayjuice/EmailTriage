import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
import joblib
import os
from database.training_data import TrainingDataLoader
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'classifier_model.joblib')
VECTORIZE_PATH = os.path.join(os.path.dirname(__file__), 'vectorizer.joblib')

def train_model():
    loader = TrainingDataLoader()
    df = loader.load_training_data()
    X = df['TextColumn']
    y = df['LabelColumn']


    X_train, X_test, y_train, y_test = train_test_split(
    df['TextColumn'], df['LabelColumn'], test_size=0.2, random_state=42
    )

    vectorizer = TfidfVectorizer(max_features=5000)
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)


    model = LogisticRegression(max_iter=1000)
    model.fit(X_train_vec, y_train)

    predictions = model.predict(X_test_vec)
    print(classification_report(y_test, predictions))

    joblib.dump(model, MODEL_PATH)
    joblib.dump(vectorizer, VECTORIZE_PATH)

    print(f"Model saved to {MODEL_PATH}")
    return model, vectorizer

def load_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError("Model not found. Please train it first.")
    
    if not os.path.exists(VECTORIZE_PATH):
        raise FileNotFoundError("Vectorizer not found. Please train it first.")
    
    return joblib.load(MODEL_PATH), joblib.load(VECTORIZE_PATH)
