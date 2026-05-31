import { createContext, useState, useEffect } from "react"; 
import { getMe } from "./services/auth.api.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Runs ONCE on app mount to check if user is already logged in
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                setLoading(true);
                const data = await getMe();
                
                if (data && data.user) {
                    setUser(data.user);
                    setError(null);
                }
            } catch (error) {
                // User not authenticated - this is normal
                setUser(null);
                setError(null); // Don't show error for not logged in
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);
    
    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading, error, setError }}>
            {children}
        </AuthContext.Provider>
    );
};