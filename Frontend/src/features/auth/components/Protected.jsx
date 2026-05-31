import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import React from "react";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const Protected = ({children}) => {
    const { loading, user } = useAuth();

    // Show loading spinner while checking authentication
    if(loading){
        return <LoadingSpinner />;
    }

    // If not authenticated, redirect to login
    if(!user){
        return <Navigate to="/login" />;
    }

    // User is authenticated, show content
    return children;
}

export default Protected;