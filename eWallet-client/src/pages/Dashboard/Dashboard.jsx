import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { FiEye, FiBell, FiPlus, FiEyeOff } from "react-icons/fi";
import { BiTransferAlt } from "react-icons/bi";
import { MdOutlineSavings } from "react-icons/md";
import AccountService from "../../services/AccountService";
import CardDetail from "./dashboardComponents/CardDetail";
import TransactionsList from "./dashboardComponents/ListTransactions";
import CreditTransaction from "./dashboardComponents/forms/CreditTransaction";
import DebitTransaction from "./dashboardComponents/forms/DebitTransaction";
import MessageModal from "../../modals/MessageModal";
import IncomeExpenditureAnalysis from "./dashboardComponents/IncomeExpenditureAnalytics";
import UserQRCodePage from "./dashboardComponents/UserQRCodePage";

const savingsPlans = [
    { id: 1, name: "New Car", amount: "$20,000", icon: "🚗" },
    { id: 2, name: "New House", amount: "$100,000", icon: "🏠" },
];

const Dashboard = () => {
    const [account, setAccount] = useState(null);
    const [error, setError] = useState("");
    const { user } = useAuth();
    const [showBalance, setShowBalance] = useState(true);
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [showDebitModal, setShowDebitModal] = useState(false);
    const [showIncomeExpenditureAnalysisModal, setShowIncomeExpenditureAnalysisModal] = useState(false);
    const [showUserQRCodePageModal, setShowUserQRCodePageModal] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const navigate = useNavigate();


    useEffect(() => {
        const fetchAccountDetails = async () => {
            try {
                const data = await AccountService.getAccountDetails();
                setAccount(data);
            } catch (err) {
                setError(err.error || "Failed to fetch account details");
            }
        };

        fetchAccountDetails();
    }, []);

    return (
        <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
            {message.text && (
                <MessageModal
                    type={message.type}
                    message={message.text}
                    onClose={() => setMessage({ type: "", text: "" })}
                />
            )}

            <div className="p-4 md:p-8 bg-gray-100">
                <div className="flex justify-between items-center">
                    <div className="text-lg font-semibold">Total Balance</div>
                    <div className="flex items-center space-x-4">
                        {user && <span className="text-sm font-medium">{user.full_name}</span>}
                        {showBalance ? (
                            <FiEye className="text-xl cursor-pointer" onClick={() => setShowBalance(false)} />
                        ) : (
                            <FiEyeOff className="text-xl cursor-pointer" onClick={() => setShowBalance(true)} />
                        )}
                        <FiBell className="text-xl cursor-pointer" />
                    </div>
                </div>

                {error && <p style={{ color: "red" }}>{error}</p>}
                {account ? (
                    <h2 className="text-2xl font-bold">
                        {showBalance ? `$${account.balance}` : "$********"}
                    </h2>
                ) : (
                    <p>Loading...</p>
                )}
            </div>

            <CardDetail />

            <div className="flex justify-around mt-6">
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                    onClick={() => setShowCreditModal(true)}
                >
                    <FiPlus /> <span>Add Money</span>
                </button>
                <button
                    className="bg-gray-300 text-black px-4 py-2 rounded-lg flex items-center space-x-2"
                    onClick={() => setShowDebitModal(true)}
                >
                    <BiTransferAlt /> <span>Transfer</span>
                </button>
                <button className="bg-gray-300 text-black px-4 py-2 rounded-lg flex items-center space-x-2">
                    <MdOutlineSavings /> <span>Budget</span>
                </button>
            </div>

            <TransactionsList />

            <div className="mt-6">
                <div className="flex justify-between">
                    <h3 className="text-lg font-semibold">My Savings Plans</h3>
                    <button className="text-blue-500">View All</button>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                    {savingsPlans.map((plan) => (
                        <div key={plan.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
                            <div className="text-4xl">{plan.icon}</div>
                            <div className="text-sm font-semibold mt-2">{plan.name}</div>
                            <div className="text-gray-500 text-xs">{plan.amount}</div>
                        </div>
                    ))}
                </div>
            </div>

            {showCreditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
                        <button className="absolute top-2 right-2 text-gray-500" onClick={() => setShowCreditModal(false)}>✖</button>
                        <h3 className="text-lg font-semibold mb-4">Add Money</h3>
                        <CreditTransaction
                            setMessage={setMessage}
                            onSuccess={() => setShowCreditModal(false)}
                        />
                        <button
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded w-auto"
                            onClick={() => setShowCreditModal(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {showDebitModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
                        <button className="absolute top-2 right-2 text-gray-500" onClick={() => setShowDebitModal(false)}>✖</button>
                        <h3 className="text-lg font-semibold mb-4">Debit Transaction</h3>
                        <DebitTransaction onSuccess={() => setShowDebitModal(false)} />
                        <button
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded w-auto"
                            onClick={() => setShowDebitModal(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}


            {showUserQRCodePageModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
                        <button className="absolute top-2 right-2 text-gray-500" onClick={() => setShowUserQRCodePageModal(false)}>✖</button>
                        <h3 className="text-lg font-semibold mb-4">Qr Code</h3>
                        <UserQRCodePage onSuccess={() => setShowUserQRCodePageModal(false)} />
                        <button
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded w-auto"
                            onClick={() => setShowUserQRCodePageModal(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}


            {showIncomeExpenditureAnalysisModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-auto relative">
                        <button className="absolute top-2 right-2 text-gray-500" onClick={() => setShowIncomeExpenditureAnalysisModal(false)}>✖</button>
                        <h3 className="text-lg font-semibold mb-4">Income Expenditure Analytics</h3>
                        <IncomeExpenditureAnalysis onSuccess={() => setShowIncomeExpenditureAnalysisModal(false)} />
                        <button
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded w-auto"
                            onClick={() => setShowIncomeExpenditureAnalysisModal(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-md flex items-center space-x-6">
                <button className="text-xl" onClick={() => setShowIncomeExpenditureAnalysisModal(true)}>📊</button>
                <button className="bg-yellow-400 text-black p-3 rounded-full text-xl" onClick={() => setShowUserQRCodePageModal(true)}>🔍</button>
                <button className="text-xl">⚙️</button>
            </div>
        </div>
    );
};

export default Dashboard;
