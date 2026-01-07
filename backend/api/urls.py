from django.urls import path
from .views import (
    LogisticRegressionARFF,
    CorrelationAPI,
    SplitDatasetAPI,
    DownloadSplit,
    PreprocessingAPI,
    FullPipelineAPI,
    EvaluationAPI
)

urlpatterns = [
    path("logistic/arff/", LogisticRegressionARFF.as_view()),
    path("correlation/arff/", CorrelationAPI.as_view()),
    path("split/arff/", SplitDatasetAPI.as_view()),
    path("download/<str:split_name>/", DownloadSplit.as_view()),
    path("preprocessing/arff/", PreprocessingAPI.as_view()),
    path("notebook09/pipeline/", FullPipelineAPI.as_view()),
    path("notebook10/evaluation/", EvaluationAPI.as_view()), 

]
