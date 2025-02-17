import React, { useEffect, useState } from "react";
import QrCodeService from "../../../services/QrCodeService";

const UserQRCodePage = () => {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const data = await QrCodeService.getQRCode();
        setQrCode(data.qr_image);
      } catch (err) {
        setError("Failed to load QR Code. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchQRCode();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 shadow-lg rounded-xl bg-white text-center">
        <h2 className="text-xl font-semibold mb-4">Your QR Code</h2>
        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {qrCode && (
          <img
            src={qrCode}
            alt="User QR Code"
            className="w-48 h-48 mx-auto rounded-lg border border-gray-300"
          />
        )}
      </div>
    </div>
  );
};

export default UserQRCodePage;
