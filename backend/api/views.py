from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status



from django.http import FileResponse, Http404
import os

from .ml_utils import (
    run_logistic_regression,
    correlation_analysis,
    split_dataset,
    preprocessing_and_scaling,
    full_preprocessing_pipeline,
    evaluate_model
)

# =========================
# DIRECTORIOS
# =========================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPLIT_DIR = os.path.join(BASE_DIR, "splits")


# =========================
# NOTEBOOK 05 – REGRESIÓN
# =========================
class LogisticRegressionARFF(APIView):
    def post(self, request):
        if "file" not in request.FILES:
            return Response(
                {"error": "Archivo no enviado"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            result = run_logistic_regression(request.FILES["file"])
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# =========================
# NOTEBOOK 06 – CORRELACIÓN
# =========================
class CorrelationAPI(APIView):
    def post(self, request):
        if "file" not in request.FILES:
            return Response(
                {"error": "Archivo no enviado"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            result = correlation_analysis(request.FILES["file"])
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# =========================
# NOTEBOOK 07 – SPLIT
# =========================
class SplitDatasetAPI(APIView):
    def post(self, request):
        if "file" not in request.FILES:
            return Response(
                {"error": "Archivo no enviado"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            result = split_dataset(request.FILES["file"])
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# =========================
# DESCARGA DE SPLITS
# =========================
class DownloadSplit(APIView):
    def get(self, request, split_name):
        file_path = os.path.join(SPLIT_DIR, f"{split_name}.arff")

        if not os.path.exists(file_path):
            raise Http404("Archivo no encontrado")

        return FileResponse(
            open(file_path, "rb"),
            as_attachment=True,
            filename=f"{split_name}.arff"
        )


# =========================
# NOTEBOOK 08 – PREPROCESAMIENTO
# =========================
class PreprocessingAPI(APIView):
    def post(self, request):
        print(">>> REQUEST FILES:", request.FILES)

        if "file" not in request.FILES:
            return Response({"error": "Archivo no enviado"}, status=400)

        try:
            result = preprocessing_and_scaling(request.FILES["file"])
            print(">>> RESULT:", result)
            return Response(result, status=200)
        except Exception as e:
            print(">>> ERROR:", e)
            return Response({"error": str(e)}, status=500)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from django.http import FileResponse, Http404
import os

from .ml_utils import (
    run_logistic_regression,
    correlation_analysis,
    split_dataset,
    preprocessing_and_scaling,
    full_preprocessing_pipeline
)

# =========================
# DIRECTORIOS
# =========================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPLIT_DIR = os.path.join(BASE_DIR, "splits")


# =========================
# NOTEBOOK 05 – REGRESIÓN
# =========================
class LogisticRegressionARFF(APIView):
    def post(self, request):
        if "file" not in request.FILES:
            return Response(
                {"error": "Archivo no enviado"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            result = run_logistic_regression(request.FILES["file"])
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# =========================
# NOTEBOOK 06 – CORRELACIÓN
# =========================
class CorrelationAPI(APIView):
    def post(self, request):
        if "file" not in request.FILES:
            return Response(
                {"error": "Archivo no enviado"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            result = correlation_analysis(request.FILES["file"])
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# =========================
# NOTEBOOK 07 – SPLIT
# =========================
class SplitDatasetAPI(APIView):
    def post(self, request):
        if "file" not in request.FILES:
            return Response(
                {"error": "Archivo no enviado"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            result = split_dataset(request.FILES["file"])
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# =========================
# DESCARGA DE SPLITS
# =========================
class DownloadSplit(APIView):
    def get(self, request, split_name):
        file_path = os.path.join(SPLIT_DIR, f"{split_name}.arff")

        if not os.path.exists(file_path):
            raise Http404("Archivo no encontrado")

        return FileResponse(
            open(file_path, "rb"),
            as_attachment=True,
            filename=f"{split_name}.arff"
        )


# =========================
# NOTEBOOK 08 – PREPROCESAMIENTO
# =========================
class PreprocessingAPI(APIView):
    def post(self, request):
        if "file" not in request.FILES:
            return Response({"error": "Archivo no enviado"}, status=400)

        try:
            result = preprocessing_and_scaling(request.FILES["file"])
            return Response(result, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


# =========================
# NOTEBOOK 09 – PIPELINE COMPLETO
# =========================
class FullPipelineAPI(APIView):
    def post(self, request):
        if "file" not in request.FILES:
            return Response(
                {"error": "Archivo no enviado"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            result = full_preprocessing_pipeline(request.FILES["file"])
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# =================================================
# NOTEBOOK 10 – EVALUACIÓN
# =================================================
class EvaluationAPI(APIView):
    def post(self, request):
        if "file" not in request.FILES:
            return Response({"error": "Archivo ARFF no enviado"}, status=400)

        try:
            result = evaluate_model(request.FILES["file"])
            return Response(result)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
