import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setMessage('');
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/auth';
      const endpoint = isLogin ? `${API_BASE_URL}/login` : `${API_BASE_URL}/register`;
      const body = isLogin
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          login(data.token, data.user);
          navigate('/todos');
        } else {
          setMessage('Registration successful! Please log in.');
          setIsLogin(true);
          setFormData({ name: '', email: '', password: '' });
        }
      } else {
        throw new Error(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="text-center mb-4">{isLogin ? 'Login' : 'Register'}</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              {message && <div className="alert alert-success">{message}</div>}
              <form onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-control"
                      placeholder="Name"
                      value={formData.name}
                      onChange={handleChange}
                      required={!isLogin}
                    />
                  </div>
                )}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3 position-relative">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    className="form-control"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-link position-absolute end-0 top-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                  {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                </button>
              </form>
              <div className="mt-3 text-center">
                <button
                  className="btn btn-link"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setMessage('');
                  }}
                >
                  {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;