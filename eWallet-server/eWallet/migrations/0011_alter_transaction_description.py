# Generated by Django 5.1.6 on 2025-02-15 23:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('eWallet', '0010_alter_transaction_subtype_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='transaction',
            name='description',
            field=models.CharField(blank=True, choices=[('school_fee', 'School Fee Payment'), ('grocery_shopping', 'Grocery Shopping'), ('rent_payment', 'Rent Payment'), ('utility_bills', 'Utility Bills (Electricity, Water, Gas)'), ('medical_expenses', 'Medical Expenses'), ('transportation', 'Transportation (Bus, Train, Taxi)'), ('entertainment', 'Entertainment & Leisure'), ('dining_out', 'Dining Out & Restaurants'), ('loan_repayment', 'Loan Repayment'), ('subscription_services', 'Subscription Services (Netflix, Spotify)'), ('phone_recharge', 'Phone Recharge & Data'), ('insurance_premium', 'Insurance Premium Payment'), ('investment', 'Investment & Stocks'), ('salary_payment', 'Salary Payment'), ('charity_donation', 'Charity & Donations'), ('online_shopping', 'Online Shopping'), ('travel_booking', 'Travel & Hotel Booking'), ('car_maintenance', 'Car Maintenance & Fuel'), ('home_renovation', 'Home Renovation & Repairs'), ('childcare', 'Childcare & Babysitting'), ('fitness', 'Gym & Fitness Membership'), ('education', 'Education (Courses & Certifications)'), ('wedding_expenses', 'Wedding Expenses'), ('pet_expenses', 'Pet Care & Veterinary'), ('business_expenses', 'Business & Office Supplies'), ('electronics', 'Electronics & Gadgets'), ('legal_fees', 'Legal Fees & Consultation'), ('festive_shopping', 'Festive & Holiday Shopping'), ('gift_purchase', 'Gift Purchase'), ('miscellaneous', 'Miscellaneous')], max_length=50, null=True),
        ),
    ]
