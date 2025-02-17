import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import AnalyticsService from "../../../services/IncomExpenditureAnalyticService";
import { useAuth } from "../../../contexts/AuthContext";

const durationOptions = [
    { value: "today", label: "Today" },
    { value: "this_week", label: "This Week" },
    { value: "last_week", label: "Last Week" },
    { value: "this_month", label: "This Month" },
    { value: "last_month", label: "Last Month" },
];

const IncomeExpenditureAnalysis = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDuration, setSelectedDuration] = useState("this_month");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await AnalyticsService.getIncomeExpenditureAnalysis(selectedDuration);
                setData(response);
            } catch (err) {
                setError("Failed to fetch income and expenditure analysis.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedDuration]);

    const totalDeposits = data.reduce((sum, d) => sum + (d.total_deposits || 0), 0);
    const totalDebits = data.reduce((sum, d) => sum + (d.total_debits || 0), 0);
    const netDifference = totalDeposits - totalDebits;

    return (
        <div className="p-6 bg-gray-100 ">
            <h2 className="text-2xl font-semibold text-center mb-6">Income & Expenditure Analysis</h2>

            {/* Duration Selector */}
            <div className="flex justify-center mb-4">
                <select
                    className="border rounded px-4 py-2 text-gray-700"
                    value={selectedDuration}
                    onChange={(e) => setSelectedDuration(e.target.value)}
                >
                    {durationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {loading && <div className="text-center mt-10">Loading...</div>}
            {error && <div className="text-center text-red-500 mt-10">{error}</div>}

            {!loading && !error && data.length > 0 && (
                <>
                    {/* Bar Chart */}
                    <div className="w-full h-64 mt-6 bg-white p-4 rounded-lg shadow-md">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="total_deposits" fill="#4687F3" name="Income" />
                                <Bar dataKey="total_debits" fill="#F28C38" name="Expenses" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Summary Statistics */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md flex flex-col items-center">
                            <p className="text-lg">Total Income</p>
                            <p className="text-2xl font-semibold">${totalDeposits.toLocaleString()}</p>
                        </div>
                        <div className="bg-orange-500 text-white p-6 rounded-lg shadow-md flex flex-col items-center">
                            <p className="text-lg">Total Expenses</p>
                            <p className="text-2xl font-semibold">${totalDebits.toLocaleString()}</p>
                        </div>
                        <div
                            className={`p-6 rounded-lg shadow-md flex flex-col items-center ${
                                netDifference >= 0 ? "bg-green-500" : "bg-red-500"
                            } text-white`}
                        >
                            <p className="text-lg">Net Difference</p>
                            <p className="text-2xl font-semibold">${netDifference.toLocaleString()}</p>
                        </div>
                    </div>
                </>
            )}

            {!loading && !error && data.length === 0 && (
                <div className="text-center text-gray-500 mt-10">
                    No data available for the selected duration.
                </div>
            )}
        </div>
    );
};

export default IncomeExpenditureAnalysis;
