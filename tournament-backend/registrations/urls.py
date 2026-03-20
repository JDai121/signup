from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .grouping import get_tournament_groups

router = DefaultRouter()
router.register(r'registrations', views.TournamentRegistrationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('create-payment-intent/', views.create_payment_intent, name='create-payment-intent'),
    path('confirm-payment/', views.confirm_payment, name='confirm-payment'),
    path('groups/', get_tournament_groups),
    path('groups-dashboard/', views.groups_dashboard),

]