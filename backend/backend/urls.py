from django.urls import path, include
from django.conf import settings   # 👈 FALTABA ESTO
from django.conf.urls.static import static
urlpatterns = [
   
    path('api/', include('api.urls')),
]


# Servir archivos media (ARFF generados, gráficos, etc.)
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )
