import { useEffect, useState } from "react";
import TransactionService from "../../../../services/TransactionService";
import MessageModal from "../../../../modals/MessageModal";
import AccountService from "../../../../services/AccountService";

// Transaction description choices with icons
const TRANSACTION_DESCRIPTION_CHOICES = [
  { value: "school_fee", label: "🎓 School Fee Payment" },
  { value: "grocery_shopping", label: "🛒 Grocery Shopping" },
  { value: "rent_payment", label: "🏠 Rent Payment" },
  { value: "utility_bills", label: "💡 Utility Bills (Electricity, Water, Gas)" },
  { value: "medical_expenses", label: "🏥 Medical Expenses" },
  { value: "transportation", label: "🚕 Transportation (Bus, Train, Taxi)" },
  { value: "entertainment", label: "🎬 Entertainment & Leisure" },
  { value: "dining_out", label: "🍽️ Dining Out & Restaurants" },
  { value: "loan_repayment", label: "💰 Loan Repayment" },
  { value: "subscription_services", label: "📺 Subscription Services (Netflix, Spotify)" },
  { value: "phone_recharge", label: "📱 Phone Recharge & Data" },
  { value: "insurance_premium", label: "🛡️ Insurance Premium Payment" },
  { value: "investment", label: "📈 Investment & Stocks" },
  { value: "salary_payment", label: "💼 Salary Payment" },
  { value: "charity_donation", label: "❤️ Charity & Donations" },
  { value: "online_shopping", label: "🛍️ Online Shopping" },
  { value: "travel_booking", label: "✈️ Travel & Hotel Booking" },
  { value: "car_maintenance", label: "🚗 Car Maintenance & Fuel" },
  { value: "home_renovation", label: "🔨 Home Renovation & Repairs" },
  { value: "childcare", label: "👶 Childcare & Babysitting" },
  { value: "fitness", label: "🏋️ Gym & Fitness Membership" },
  { value: "education", label: "📚 Education (Courses & Certifications)" },
  { value: "wedding_expenses", label: "💒 Wedding Expenses" },
  { value: "pet_expenses", label: "🐶 Pet Care & Veterinary" },
  { value: "business_expenses", label: "💼 Business & Office Supplies" },
  { value: "electronics", label: "📱 Electronics & Gadgets" },
  { value: "legal_fees", label: "⚖️ Legal Fees & Consultation" },
  { value: "festive_shopping", label: "🎁 Festive & Holiday Shopping" },
  { value: "gift_purchase", label: "🎀 Gift Purchase" },
  { value: "miscellaneous", label: "📌 Miscellaneous" },
];

const DebitTransaction = ({ onSuccess }) => {
  const [formData, setFormData] = useState({ amount: "", description: "", account: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Fetch account details and set the account ID
  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const accountDetails = await AccountService.getAccountDetails();
        setFormData((prevState) => ({
          ...prevState,
          account: accountDetails.id, // Set the accountId from the account service response
        }));
      } catch (error) {
        console.error("Failed to fetch account details:", error);
      }
    };

    fetchAccountDetails();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description || !formData.account) {
      setMessage({ type: "error", text: "Please fill all fields!" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await TransactionService.createDebitTransaction(formData);
      setMessage({ type: "success", text: "Debit transaction successful!" });
      setFormData({ amount: "", description: "", account: "" });

      setTimeout(() => {
        onSuccess(); 
      }, 2000);
    } catch (error) {

      if (error.response && error.response.data) {

        if (error.response.data.amount && error.response.data.amount.includes("Insufficient balance.")) {
          setMessage({ type: "error", text: "Insufficient funds for this transaction!" });
        } else {
          setMessage({ type: "error", text: error.response.data.amount[0] || "An error occurred" });
        }
      } else {
        setMessage({ type: "error", text: error.message || "Something went wrong!" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold text-center">Debit Fund` </h2>

      {message.text && (
        <MessageModal 
          type={message.type} 
          message={message.text} 
          onClose={() => setMessage({ type: "", text: "" })} 
        />
      )}

      <form className="mt-4" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Transaction Type</label>
          <select
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>Select a transaction type</option>
            {TRANSACTION_DESCRIPTION_CHOICES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default DebitTransaction;
