import { useEffect, useState } from "react";
import AccountService from "../../../../services/AccountService";
import TransactionService from "../../../../services/TransactionService";
import MessageModal from "../../../../modals/MessageModal";

const CreditTransaction = ({ onClose }) => {
  const [accountId, setAccountId] = useState("");
  const [formData, setFormData] = useState({ amount: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const data = await AccountService.getAccountDetails();
        setAccountId(data.id);
      } catch (error) {
        setMessage({ type: "error", text: "Failed to fetch account details." });
        setShowModal(true);
      }
    };

    fetchAccount();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accountId) {
        setMessage({ type: "error", text: "No account ID found." });
        return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
        const payload = { account: accountId, ...formData };
        await TransactionService.createCreditTransaction(payload);
        setMessage({ type: "success", text: "Credit transaction successful!" });
        setFormData({ amount: "", description: "" }); 
        
        setTimeout(() => {
            onSuccess();
        }, 2000);
    } catch (error) {
        setMessage({ type: "error", text: error });
    } finally {
        setLoading(false);
    }
};


  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold text-center">Deposit Fund</h2>

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
          <label className="block text-gray-700 font-medium">Description</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit"}
        </button>
      </form>

      {showModal && (
        <MessageModal
          type={message.type}
          message={message.text}
          onClose={() => {
            setShowModal(false);
            if (message.type === "success") {
              onClose();
            }
          }}
        />
      )}
    </div>
  );
};

export default CreditTransaction;