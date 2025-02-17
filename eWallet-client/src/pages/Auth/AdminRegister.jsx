import React, { useState } from 'react';
import AuthService from '../../services/AuthService';
import { useNavigate } from "react-router-dom"; 
import MessageModal from '../../modals/MessageModal';
import registerBg from '../../assets/images/register-bg.jpg';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate(); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const payload = {
        full_name: formData.fullName,
        email: formData.email,
        phone_number: formData.phone_number,
        password: formData.password,
      };

      const response = await AuthService.register(payload);

      const message = response.data?.message || "Registration successful!";
      setSuccessMessage(message);
      setShowModal(true);
      console.log("Registration response:", response);


      setTimeout(() => {
        navigate("/login"); 
      }, 3000);
    } catch (error) {
      const errorResponse = error.response?.data;
      let message = "Registration failed. Please try again.";

      if (errorResponse) {
        message = Object.entries(errorResponse)
          .map(([field, errors]) => `${field.replace("_", " ")}: ${errors.join(", ")}`)
          .join(". ");
      }

      setErrorMessage(message);
      setShowModal(true);
      console.error("Registration error:", errorResponse);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {showModal && (
        <MessageModal
          type={successMessage ? 'success' : 'error'}
          message={successMessage || errorMessage}
          onClose={() => setShowModal(false)}
        />
      )}
      {/* Left Image Section */}
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${registerBg})` }}
      >
        <div className="bg-black bg-opacity-40 w-full h-full flex flex-col justify-between p-16">
          <h1 className="text-white text-5xl font-bold mb-6">E-wallet</h1>

          <div>
          <h3 className="text-white text-3xl leading-relaxed mb-6">
            Manage all your Funds in one location.
          </h3>
          <p className="text-white text-sm leading-relaxed">
            Track all your Income and Expenses In one place 
          </p>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex w-full md:w-1/2 justify-center items-center p-8 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome to E-Wallet!</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700">Phone Number</label>
              <input
                type="phone"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Enter Phone Number eg +23408012345678"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                minLength={8}
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Your password must have at least 8 characters.
              </p>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="mr-2" required />
              <p className="text-sm text-gray-600">
                By creating an account you agree to the{' '}
                <a href="#" className="text-blue-600">
                  Terms & Conditions
                </a>{' '}
                and our{' '}
                <a href="#" className="text-blue-600">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Signup
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-gray-500">Or</p>
            <div className="mt-4 space-y-2">
              <button className="w-full flex items-center justify-center border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition">
                <img
                  src="https://img.icons8.com/color/24/google-logo.png"
                  alt="Google"
                  className="mr-2"
                />
                Continue with Google
              </button>
              <button className="w-full flex items-center justify-center border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition">
                <img
                  src="https://img.icons8.com/color/24/twitter.png"
                  alt="Twitter"
                  className="mr-2"
                />
                Continue with Twitter
              </button>
            </div>
          </div>
          <p className="mt-6 text-center text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
