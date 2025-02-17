import React, { useState, useEffect } from "react";

const MessageModal = ({ type, message, duration = 5000, onClose }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => Math.max(prev - 100 / (duration / 100), 0));
    }, 100);

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  const modalColors =
    type === "success"
      ? "bg-green-100 text-green-800 border-green-500"
      : "bg-red-100 text-red-800 border-red-500";

  return (
    <div
      className={`fixed top-4 right-4 max-w-sm w-full p-4 rounded-lg shadow-md border ${modalColors} transition-opacity duration-300 z-50`}
    >
      <div className="flex justify-between items-center">
        <span className="font-semibold">{type === "success" ? "Success" : "Error"}</span>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
          &times;
        </button>
      </div>
      <p className="mt-2">{message}</p>
      <div className="relative mt-4 h-1 w-full bg-gray-200 rounded-full">
        <div
          className="absolute top-0 left-0 h-1 rounded-full"
          style={{
            width: `${progress}%`,
            backgroundColor: type === "success" ? "#22c55e" : "#ef4444",
          }}
        ></div>
      </div>
    </div>
  );
};

export default MessageModal;
