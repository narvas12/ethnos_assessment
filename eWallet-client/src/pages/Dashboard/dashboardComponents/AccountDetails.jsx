import { useEffect, useState } from "react";
import AccountService from "../../../services/AccountService";

const AccountDetails = () => {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState("");

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
    <div>
      <h2>Account Details</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {account ? (
        <div>
          <p>Account Name: {account.account_name}</p>
          <p>Account Number: {account.account_number}</p>
          <p>Balance: ${account.balance}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default AccountDetails;
