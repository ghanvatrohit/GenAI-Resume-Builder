import { useContext } from "react";
import { InterviewContext } from "../../interview/interview.context";
import {
    generateInterviewReport,
    getAllInterviewReports,
    getInterviewReportById,
    generateResumePdf,
    deleteInterviewReport
} from "../../interview/services/interview.api";

/**
 * useInterview Hook
 * Manages all interview-related API calls and state
 */
export const useInterview = () => {
    const context = useContext(InterviewContext);

    if (!context) {
        throw new Error(
            "useInterview must be used within an InterviewProvider"
        );
    }

    const { 
        loading, 
        setLoading, 
        report, 
        setReport, 
        reports, 
        setReports,
        error,
        setError
    } = context;

    /**
     * Generate interview report from job description and resume
     */
    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true);
        setError(null);
        
        try {
            console.log("Generating report...", { jobDescription, selfDescription, resumeFile });
            
            const response = await generateInterviewReport({ 
                jobDescription, 
                selfDescription, 
                resumeFile 
            });

            console.log("API Response:", response);

            // Handle the correct response structure from backend
            const reportData = response?.interviewReport || response;
            
            if (!reportData) {
                throw new Error("No data received from the server");
            }

            // Ensure all critical arrays exist with safe defaults so UI components never crash
            const validatedReport = {
                ...reportData,
                _id: reportData._id || `temp_${Date.now()}`, // Temporary ID if backend delay happens
                technicalQuestions: reportData.technicalQuestions || [],
                behavioralQuestions: reportData.behavioralQuestions || [],
                skillGaps: reportData.skillGaps || [],
                preparationPlan: reportData.preparationPlan || [],
                matchScore: typeof reportData.matchScore === 'number' ? reportData.matchScore : 0,
                title: reportData.title || "Interview Report"
            };

            setReport(validatedReport);
            return validatedReport;

        } catch (error) {
            console.error("Error generating interview report:", error.message);
            setError(error.message || "Failed to generate report");
            setReport(null);
            return null;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Fetch interview report by ID
     */
    const getReportById = async (interviewId) => {
        setLoading(true);
        setError(null);

        try {
            console.log("Fetching report by ID:", interviewId);
            
            const response = await getInterviewReportById(interviewId);
            
            console.log("Report fetched:", response);

            const reportData = response?.interviewReport || response;

            if (!reportData) {
                throw new Error("Report data not found");
            }

            // Ensure all required arrays exist
            const validatedReport = {
                ...reportData,
                _id: reportData._id || interviewId,
                technicalQuestions: reportData.technicalQuestions || [],
                behavioralQuestions: reportData.behavioralQuestions || [],
                skillGaps: reportData.skillGaps || [],
                preparationPlan: reportData.preparationPlan || [],
                matchScore: typeof reportData.matchScore === 'number' ? reportData.matchScore : 0,
                title: reportData.title || "Interview Report"
            };

            setReport(validatedReport);
            return validatedReport;

        } catch (error) {
            console.error("Error fetching report:", error.message);
            setError(error.message || "Failed to fetch report");
            setReport(null);
            return null;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Fetch all interview reports for user
     */
    const getReports = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await getAllInterviewReports();

            console.log("All reports response:", response);

            const reportsData = response?.interviewReports || response || [];

            setReports(Array.isArray(reportsData) ? reportsData : []);
            return reportsData;

        } catch (error) {
            console.error("Error fetching reports:", error.message);
            setError(error.message || "Failed to fetch reports");
            setReports([]);
            return [];
        } finally {
            setLoading(false);
        }
    };


    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        let response = null
        try {
            response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
        }
        catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    const deleteReport = async (interviewId) => {
    try {
        console.log("Deleting report:", interviewId);
        await deleteInterviewReport(interviewId);
        
        // State se turant hata do taaki page refresh na karna pade
        setReports((prev) => prev.filter((r) => r._id !== interviewId));
    } catch (error) {
        console.error("Error deleting report from hook:", error.message);
        setError("Failed to delete report.");
    }
    };

    return { 
        loading, 
        report, 
        reports, 
        error,
        generateReport, 
        getReportById, 
        getReports,
        getResumePdf,
        deleteReport
    };
};