import arff
import pandas as pd
import numpy as np

from io import TextIOWrapper

from sklearn.preprocessing import RobustScaler, OneHotEncoder, StandardScaler
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

# =================================================
# NOTEBOOK 05 – REGRESIÓN LOGÍSTICA
# =================================================
def run_logistic_regression(uploaded_file):
    text_file = TextIOWrapper(uploaded_file.file, encoding="utf-8")
    dataset = arff.load(text_file)

    df = pd.DataFrame(
        dataset["data"],
        columns=[a[0] for a in dataset["attributes"]]
    )

    y = df["class"]
    X = df.drop(columns=["class"])

    X = pd.get_dummies(X, columns=["protocol_type", "service", "flag"])

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42
    )

    model = LogisticRegression(max_iter=1000, n_jobs=-1)
    model.fit(X_train, y_train)

    accuracy = accuracy_score(y_test, model.predict(X_test))

    return {
        "accuracy": round(float(accuracy), 4),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "features_after_encoding": X.shape[1]
    }


# =================================================
# NOTEBOOK 06 – CORRELACIÓN + SCATTER
# =================================================
def correlation_analysis(uploaded_file):
    text_file = TextIOWrapper(uploaded_file.file, encoding="utf-8")
    dataset = arff.load(text_file)

    df = pd.DataFrame(
        dataset["data"],
        columns=[a[0] for a in dataset["attributes"]]
    )

    df["class"] = df["class"].apply(lambda x: 0 if x == "normal" else 1)

    numeric_df = df.select_dtypes(include=["int64", "float64"])

    corr = numeric_df.corr().fillna(0)

    scatter_df = df[
        ["same_srv_rate", "dst_host_srv_count"]
    ].fillna(0)

    return {
        "correlation": {
            "columns": corr.columns.tolist(),
            "matrix": corr.round(3).values.tolist()
        },
        "scatter": scatter_df.to_dict(orient="list")
    }


# =================================================
# NOTEBOOK 07 – SPLIT + HISTOGRAMAS
# =================================================
def split_dataset(uploaded_file):
    text_file = TextIOWrapper(uploaded_file.file, encoding="utf-8")
    dataset = arff.load(text_file)

    df = pd.DataFrame(
        dataset["data"],
        columns=[a[0] for a in dataset["attributes"]]
    )

    train_set, temp_set = train_test_split(
        df, test_size=0.4, random_state=42, stratify=df["protocol_type"]
    )

    val_set, test_set = train_test_split(
        temp_set, test_size=0.5, random_state=42, stratify=temp_set["protocol_type"]
    )

    def histogram(series):
        counts = series.value_counts()
        return {
            "labels": counts.index.tolist(),
            "values": counts.values.tolist()
        }

    return {
        "train_size": len(train_set),
        "val_size": len(val_set),
        "test_size": len(test_set),
        "histograms": {
            "train": histogram(train_set["protocol_type"]),
            "val": histogram(val_set["protocol_type"]),
            "test": histogram(test_set["protocol_type"])
        }
    }


# =================================================
# NOTEBOOK 08 – PREPROCESAMIENTO Y ESCALADO
# =================================================
def preprocessing_and_scaling(uploaded_file):
    text_file = TextIOWrapper(uploaded_file.file, encoding="utf-8")
    dataset = arff.load(text_file)

    df = pd.DataFrame(
        dataset["data"],
        columns=[a[0] for a in dataset["attributes"]]
    )

    numeric_cols = ["src_bytes", "dst_bytes"]

    X = df[numeric_cols].fillna(0)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_scaled_df = pd.DataFrame(X_scaled, columns=numeric_cols)

    head = X_scaled_df.head(10).round(3)

    return {
        "rows": int(len(X_scaled_df)),
        "head": head.to_dict(orient="records")
    }


# =================================================
# NOTEBOOK 09 – PIPELINE COMPLETO
# =================================================
def full_preprocessing_pipeline(uploaded_file):
    text_file = TextIOWrapper(uploaded_file.file, encoding="utf-8")
    dataset = arff.load(text_file)

    df = pd.DataFrame(
        dataset["data"],
        columns=[a[0] for a in dataset["attributes"]]
    )

    train_set, temp_set = train_test_split(
        df, test_size=0.4, random_state=42, stratify=df["protocol_type"]
    )

    val_set, test_set = train_test_split(
        temp_set, test_size=0.5, random_state=42, stratify=temp_set["protocol_type"]
    )

    X_train = train_set.drop("class", axis=1)

    X_train.loc[
        (X_train["src_bytes"] > 400) & (X_train["src_bytes"] < 800),
        "src_bytes"
    ] = np.nan

    X_train.loc[
        (X_train["dst_bytes"] > 500) & (X_train["dst_bytes"] < 2000),
        "dst_bytes"
    ] = np.nan

    X_train = X_train.dropna()

    num_attribs = list(X_train.select_dtypes(exclude=["object"]))
    cat_attribs = list(X_train.select_dtypes(include=["object"]))

    num_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", RobustScaler()),
    ])

    full_pipeline = ColumnTransformer([
        ("num", num_pipeline, num_attribs),
        ("cat", OneHotEncoder(handle_unknown="ignore"), cat_attribs),
    ])

    X_train_prep = full_pipeline.fit_transform(X_train)

    X_train_prep = pd.DataFrame(
        X_train_prep.toarray() if hasattr(X_train_prep, "toarray") else X_train_prep
    )

    head = X_train_prep.head(10).round(3)

    return {
        "train_rows": int(len(X_train_prep)),
        "val_rows": int(len(val_set)),
        "test_rows": int(len(test_set)),
        "features_after_pipeline": int(X_train_prep.shape[1]),
        "head": head.to_dict(orient="records")
    }

# =================================================
# NOTEBOOK 10 – EVALUACIÓN DE RESULTADOS
# =================================================
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix
)

def evaluate_model(uploaded_file):
    text_file = TextIOWrapper(uploaded_file.file, encoding="utf-8")
    dataset = arff.load(text_file)

    df = pd.DataFrame(
        dataset["data"],
        columns=[a[0] for a in dataset["attributes"]]
    )

    # Etiqueta binaria
    y = df["class"].apply(lambda x: 0 if x == "normal" else 1)

    X = df.drop(columns=["class"])
    X = pd.get_dummies(X, columns=["protocol_type", "service", "flag"])
    X = X.fillna(0)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.3, random_state=42
    )

    model = LogisticRegression(max_iter=1000, n_jobs=-1)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)

    tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()

    return {
        "metrics": {
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1": round(float(f1), 4)
        },
        "confusion_matrix": {
            "tn": int(tn),
            "fp": int(fp),
            "fn": int(fn),
            "tp": int(tp)
        }
    }
