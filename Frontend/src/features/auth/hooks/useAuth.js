import { useContext } from "react";
import { AuthContext } from "../auth.context.jsx";
import { getMe, login, logout, register } from "../services/auth.api.js";
import { logoutUser } from "../../interview/services/interview.api"; 
export const useAuth = () => {
    const context = useContext(AuthContext);
    const { user, setUser, loading, setLoading } = context;
    
    const handleLogin = async ({email, password}) => {
        setLoading(true);
        try {
            const data = await login({email, password});
            
            if (data && data.user) {
                setUser(data.user);
                console.log("✅ Login successful:", data.user);
                return true; 
            } else {
                console.error("Login failed: No user data returned");
                return false; 
            }
        } catch (err) {
            console.error("❌ Login Request Failed:", err.message);
            return false; 
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async ({username, email, password}) => {
        setLoading(true);
        try {
            const data = await register({username, email, password});
            
            if (data) {
                console.log("✅ Registration successful");
                return true; 
            } else {
                console.error("Registration failed: No data returned.");
                return false;
            }
        } catch (err) {
            console.error("❌ Registration Request Failed:", err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
    try {
        await logoutUser();
        setUser(null); // context ka user clear karo
        return true;
    } catch (err) {
        console.error("Logout failed:", err);
        return false;
    }
};

    const handleGetMe = async () => {
        setLoading(true);
        try {
            const data = await getMe();
            if (data && data.user) {
                setUser(data.user);
                console.log("✅ User data retrieved:", data.user);
            }
        } catch (err) {
            console.error("❌ Get user error:", err.message);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    return { user, loading, handleLogin, handleRegister, handleLogout, handleGetMe };
};