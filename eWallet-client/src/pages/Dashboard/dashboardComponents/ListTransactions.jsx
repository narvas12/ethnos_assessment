import { useEffect, useState } from "react";
import TransactionService from "../../../services/TransactionService";

const TransactionsList = () => {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await TransactionService.getTransactions();
        setTransactions(data);
      } catch (err) {
        setError(err);
      }
    };

    fetchTransactions();
  }, []);

  const transactionsToDisplay = showAll ? transactions : transactions.slice(0, 5);

  return (
    <div className="mt-6 bg-gray-100 p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Recent Activities</h3>
        <button
          className="text-blue-500 hover:underline"
          onClick={() => setShowAll((prev) => !prev)}
        >
          {showAll ? "Show Less" : "View All"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="space-y-3">
        {transactionsToDisplay.length > 0 ? (
          transactionsToDisplay.map((tx) => (
            <div
              key={tx.id}
              className="flex justify-between bg-white p-4 rounded-lg shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                  {tx.description ? tx.description.charAt(0).toUpperCase() : "T"}
                </div>
                <div>
                  <div className="text-sm font-semibold capitalize">
                    {tx.description || "Transaction"}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {new Date(tx.created_at).toLocaleDateString()} ·{" "}
                    {tx.transaction_type === "deposit"
                      ? "Payment Received"
                      : "Payment Sent"}
                  </div>
                </div>
              </div>
              <div
                className={`font-semibold ${
                  tx.transaction_type === "deposit"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                ${tx.amount}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No recent transactions.</p>
        )}
      </div>
    </div>
  );
};

export default TransactionsList;
