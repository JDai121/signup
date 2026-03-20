from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
import stripe
from django.shortcuts import render

from .models import TournamentRegistration
from .serializers import TournamentRegistrationSerializer

# Set Stripe API key
stripe.api_key = settings.STRIPE_SECRET_KEY


class TournamentRegistrationViewSet(viewsets.ModelViewSet):
    queryset = TournamentRegistration.objects.all()
    serializer_class = TournamentRegistrationSerializer


def send_confirmation_email(registration):
    """
    Send a registration confirmation email to the competitor.
    """
    context = {
        'registration_id': registration.id,
        'first_name': registration.first_name,
        'last_name': registration.last_name,
        'email': registration.email,
        'phone': registration.phone,
        'date_of_birth': registration.date_of_birth.strftime('%B %d, %Y'),
        'gender': registration.gender,
        'school_name': registration.school_name,
        'belt_rank': registration.get_belt_rank_display(),
        'weight': registration.weight,
        'poomsae': registration.poomsae,
        'board_breaking': registration.board_breaking,
        'sparring': registration.sparring,
        'payment_amount': registration.payment_amount,
        'stripe_payment_intent_id': registration.stripe_payment_intent_id,
        'support_email': settings.EMAIL_HOST_USER,
    }

    subject = f'Tournament Registration Confirmed – {registration.first_name} {registration.last_name}'
    from_email = settings.DEFAULT_FROM_EMAIL
    to_email = [registration.email]

    # Render HTML template
    html_content = render_to_string('registrations/confirmation_email.html', context)

    # Plain-text fallback
    text_content = (
        f"Hi {registration.first_name},\n\n"
        f"Your tournament registration (#{registration.id}) is confirmed!\n\n"
        f"Events: "
        + ", ".join(filter(None, [
            'Poomsae' if registration.poomsae else '',
            'Board Breaking' if registration.board_breaking else '',
            'Sparring' if registration.sparring else '',
        ]))
        + f"\nTotal Paid: ${registration.payment_amount}\n\n"
        f"See you at the tournament!\n"
    )

    msg = EmailMultiAlternatives(subject, text_content, from_email, to_email)
    msg.attach_alternative(html_content, "text/html")
    msg.send()


@api_view(['POST'])
def create_payment_intent(request):
    """
    Create a Stripe Payment Intent for tournament registration
    """
    try:
        data = request.data

        events_selected = sum([
            data.get('poomsae', False),
            data.get('board_breaking', False),
            data.get('sparring', False)
        ])

        if events_selected == 0:
            return Response(
                {'error': 'Please select at least one event'},
                status=status.HTTP_400_BAD_REQUEST
            )
        elif events_selected <= 2:
            amount = 100
        else:
            amount = 125

        intent = stripe.PaymentIntent.create(
            amount=int(amount * 100),
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
            events_count = sum([
                registration_data.get('poomsae', False),
                registration_data.get('board_breaking', False),
                registration_data.get('sparring', False)
            ])

            amount = 125 if events_count > 2 else 100

            registration_data['payment_amount'] = amount
            registration_data['payment_status'] = 'succeeded'
            registration_data['stripe_payment_intent_id'] = payment_intent_id

            serializer = TournamentRegistrationSerializer(data=registration_data)
            if serializer.is_valid():
                registration = serializer.save()

                # Send confirmation email
                try:
                    send_confirmation_email(registration)
                except Exception as email_error:
                    # Don't fail the whole request if email fails — log it instead
                    print(f"[EMAIL ERROR] Failed to send confirmation to {registration.email}: {email_error}")

                return Response({
                    'success': True,
                    'registration_id': registration.id,
                    'message': 'Registration successful! A confirmation email has been sent.'
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


def groups_dashboard(request):
    return render(request, 'groups_dashboard.html')
