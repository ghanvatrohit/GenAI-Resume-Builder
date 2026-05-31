import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true // Important for cookies!
});

export async function register({username, email, password}) {
    try{
        const response = await api.post('/api/auth/register', {
            username, email, password
        });
        
        // ✅ FIX: Changed response.data.success to response.data.user
        if (response.data && response.data.user) { 
            return response.data;
        } else {
            throw new Error(response.data?.message || "Registration failed");
        }
    } catch(err){
        console.error("Registration Error:", err.response?.data || err.message);
        throw err; 
    }
}

export async function login({email, password}) {
    try{
        const response = await api.post('/api/auth/login', {
            email, password
        });
        
        if (response.data && response.data.user) {
            // Token will be automatically stored in cookies
            return response.data;
        } else {
            throw new Error(response.data?.message || "Login failed");
        }
    } catch(err){
        console.error("Login Error:", err.response?.data || err.message);
        throw err;
    }
}

export async function logout() {
    try{
        const response = await api.post('/api/auth/logout', {});
        return response.data;
    } catch(err){
        console.error("Logout Error:", err.response?.data || err.message);
        throw err;
    }
}

export async function getMe() {
    try{
        const response = await api.get('/api/auth/get-me');
        
        if (response.data && response.data.user) {
            return response.data;
        } else {
            // No user found - clear auth state
            throw new Error("User not authenticated");
        }
    } catch(err){
        console.error("Get Current User Error:", err.response?.data || err.message);
        throw err; // Let context handle this
    }
}