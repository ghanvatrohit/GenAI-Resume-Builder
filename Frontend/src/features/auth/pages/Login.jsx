import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../auth.form.scss'; 
import { useAuth } from '../hooks/useAuth.js';
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const Login = () => {
    const { loading, handleLogin } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('app-theme') || 'dark';
    });

    const toggleTheme = () => {
        setTheme(prevTheme => {
            const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('app-theme', newTheme);
            return newTheme;
        });
    };

    const togglePasswordVisibility = (e) => {
        e.preventDefault(); 
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        
        try {
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            console.log("Login Attempt:", data);
            
            // Check if login was successful
            const isSuccess = await handleLogin({email, password});
            
            if (isSuccess) {
                // Login successful - redirect to home
                navigate("/"); 
            } else {
                setError("Login failed. Please check your email and password.");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError(err.message || "Login failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show loading spinner while app is initializing auth
    if(loading){
        return <LoadingSpinner />;
    }

    return (
        <main data-theme={theme}>
            {/* Theme Toggle Button */}
            <button className="theme-toggle" onClick={toggleTheme} type="button">
                {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>

            {/* Background Decoration */}
            <div className="form-contain"></div>
            
            {/* Login Form */}
            <form onSubmit={handleSubmit}>
                <h1>Login Page</h1>
                
                {/* Error Message */}
                {error && <div className="error-message">{error}</div>}
                
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        type="email" 
                        id="email" 
                        name='email' 
                        placeholder='Enter email address' 
                        required 
                        disabled={isSubmitting}
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <div className="password-wrapper">
                        <input 
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            type={showPassword ? "text" : "password"} 
                            id="password" 
                            name='password' 
                            placeholder='Enter password' 
                            required
                            disabled={isSubmitting}
                        />
                        <button 
                            type="button" 
                            className="eye-button" 
                            onClick={togglePasswordVisibility}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            disabled={isSubmitting}
                        >
                            {showPassword ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                <button 
                    type="submit" 
                    className='button primary-button'
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <p className="auth-link">Don't have an account? <Link to="/register">Register here</Link></p>
        </main>
    );
}

export default Login;