import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import MessageModal from '../../modals/MessageModal';
import loginBg from '../../assets/images/register-bg.jpg'; 
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErrorMessage('');
      
      await login(formData); 
      navigate('/dashboard'); 
    } catch (error) {
      const errorResponse = error.response?.data;
      let message = 'Login failed. Please check your credentials.';

      if (errorResponse) {
        message = Object.entries(errorResponse)
          .map(([field, errors]) => `${field.replace('_', ' ')}: ${errors.join(', ')}`)
          .join('. ');
      }

      setErrorMessage(message);
      setShowModal(true);
      console.error('Login error:', errorResponse);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {showModal && (
        <MessageModal
          type="error"
          message={errorMessage}
          onClose={() => setShowModal(false)}
        />
      )}
      {/* Left Image Section */}
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${loginBg})` }}
      >
        <div className="bg-black bg-opacity-40 w-full h-full flex flex-col justify-between p-16">
          <h1 className="text-white text-5xl font-bold mb-6">E-wallet</h1>
          <div>
            <h3 className="text-white text-3xl leading-relaxed mb-6">
              Access Your Funds Anytime, Anywhere.
            </h3>
            <p className="text-white text-sm leading-relaxed">
              Securely manage your transactions with ease.
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex w-full md:w-1/2 justify-center items-center p-8 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome Back!</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700">Email or Phone Number</label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email or phone number"
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
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500">Forgot Password?</p>
            <p className="text-gray-500 mt-4">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-600">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
