from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
import stripe

from .models import TournamentRegistration
from .serializers import TournamentRegistrationSerializer

# Set Stripe API key
stripe.api_key = settings.STRIPE_SECRET_KEY


class TournamentRegistrationViewSet(viewsets.ModelViewSet):
    queryset = TournamentRegistration.objects.all()
    serializer_class = TournamentRegistrationSerializer


@api_view(['POST'])
def create_payment_intent(request):
    """
    Create a Stripe Payment Intent for tournament registration
    """
    try:
        # Get registration data from request
        data = request.data
        
        # Calculate event count
        events_selected = sum([
            data.get('poomsae', False),
            data.get('board_breaking', False),
            data.get('sparring', False)
        ])
        
        # Calculate amount based on pricing structure
        if events_selected == 0:
            return Response(
                {'error': 'Please select at least one event'},
                status=status.HTTP_400_BAD_REQUEST
            )
        elif events_selected <= 2:
            amount = 100  # Base price for 1-2 events
        else:
            amount = 125  # $100 + $25 for 3rd event
        
        # Create Stripe Payment Intent
        # Stripe requires amount in cents
        intent = stripe.PaymentIntent.create(
            amount=int(amount * 100),  # Convert to cents
            currency='usd',
            metadata={
                'first_name': data.get('first_name', ''),
                'last_name': data.get('last_name', ''),
                'email': data.get('email', ''),
                'events_count': events_selected
            },
            automatic_payment_methods={
                'enabled': True,
            }
        )
        
        return Response({
            'clientSecret': intent.client_secret,
            'amount': amount,
            'events_count': events_selected
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def confirm_payment(request):
    """
    Confirm payment and save registration after successful payment
    """
    try:
        payment_intent_id = request.data.get('payment_intent_id')
        registration_data = request.data.get('registration_data')
        
        # Verify payment with Stripe
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        if intent.status == 'succeeded':
            # Calculate amount
            events_count = sum([
                registration_data.get('poomsae', False),
                registration_data.get('board_breaking', False),
                registration_data.get('sparring', False)
            ])
            
            if events_count <= 2:
                amount = 100
            else:
                amount = 125
            
            # Add payment info to registration data
            registration_data['payment_amount'] = amount
            registration_data['payment_status'] = 'succeeded'
            registration_data['stripe_payment_intent_id'] = payment_intent_id
            
            # Create registration
            serializer = TournamentRegistrationSerializer(data=registration_data)
            if serializer.is_valid():
                registration = serializer.save()
                
                # TODO: Send confirmation email here
                
                return Response({
                    'success': True,
                    'registration_id': registration.id,
                    'message': 'Registration successful!'
                }, status=status.HTTP_201_CREATED)
            else:
                return Response(
                    {'error': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            return Response(
                {'error': 'Payment not successful'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )