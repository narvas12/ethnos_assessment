import { useEffect, useState } from "react";
import CardService from "../../../services/CardService";
import { useAuth } from "../../../contexts/AuthContext";

const CardDetail = () => {
    const { user } = useAuth();
    const [card, setCard] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCard = async () => {
            try {
                const data = await CardService.getCards();
                setCard(data);
            } catch (err) {
                setError(err.error || "Failed to fetch card.");
            }
        };

        fetchCard();
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-2">My Card</h2>

            {error && <p className="text-red-500">{error}</p>}

            {card ? (
                <div className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 text-white rounded-xl p-6 mt-4 shadow-xl transform hover:scale-105 transition duration-300">
                    <div className="text-2xl font-bold tracking-widest mb-2">
                        **** **** **** {card.card_number.slice(-4)}
                    </div>
                    <div className="text-xl font-semibold mb-3">{card.card_holder_name}</div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-200 font-medium">{card.card_type.toUpperCase()} Card</span>
                        <div>
                            <span className="text-gray-200"><strong>Exp Date: </strong>{card.expiry_date}</span><br />

                            <span className="text-gray-200"><strong>CVV: </strong>{card.cvv}</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                        <div className="w-auto rounded-md mb-4">
                            <div
                                className=" rounded-md"

                            ><h4 className="font-bold">${card.card_balance}</h4></div>
                        </div>

                        <div className="flex space-x-2">
                            <div className="w-6 h-6 bg-yellow-400 rounded-full"></div>
                            <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-gray-500">Loading card details...</p>
            )}

        </div>
    );
};

export default CardDetail;
