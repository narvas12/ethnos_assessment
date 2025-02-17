from django.apps import AppConfig


class EwalletConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'eWallet'

    def ready(self):
        import eWallet.signals
