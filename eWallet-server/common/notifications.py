import threading
from django.core.mail import send_mail
from django.conf import settings

class Notification:
    @staticmethod
    def send_email(subject, message, recipient_list, from_email=settings.DEFAULT_FROM_EMAIL):
        def send():
            send_mail(subject, message, from_email, recipient_list)
        
        email_thread = threading.Thread(target=send)
        email_thread.start()