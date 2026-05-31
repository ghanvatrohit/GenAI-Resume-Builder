import React, { createContext, useState, useCallback } from "react";

/**
 * Interview Context
 * Manages interview report state and data fetching
 */
export const InterviewContext = createContext();

export const InterviewProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [reports, setReports] = useState([]);
    const [error, setError] = useState(null);

    const value = {
        loading,
        setLoading,
        report,
        setReport,
        reports,
        setReports,
        error,
        setError
    };

    return (
        <InterviewContext.Provider value={value}>
            {children}
        </InterviewContext.Provider>
    );
};