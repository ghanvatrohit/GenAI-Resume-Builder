import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useInterview } from "../../auth/hooks/useinterview";
import "../style/interview.scss";

const NAV_ITEMS = [
    { id: "technical", label: "Technical Questions" },
    { id: "behavioral", label: "Behavioral Questions" },
    { id: "roadmap", label: "Road Map" },
];

export default function Interview() {
    const [activeNav, setActiveNav] = useState("technical");
    
    // Track expanded index per tab
    const [expandedIndex, setExpandedIndex] = useState({
        technical: null,
        behavioral: null,
        roadmap: null,
    });

    const { interviewId } = useParams();
    const { report, loading, error, getReportById, getResumePdf } = useInterview();

    // Proper useEffect dependency and error handling
    useEffect(() => {
        if (interviewId) {
            console.log("Loading interview:", interviewId);
            getReportById(interviewId);
        } else {
            console.error("No interview ID provided");
        }
    }, [interviewId]);

    // Toggle expand function
    const toggleExpand = (tab, index) => {
        setExpandedIndex((prev) => ({
            ...prev,
            [tab]: prev[tab] === index ? null : index,
        }));
    };

    // 🔥 UPDATED: Custom Premium Loading State
    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner-wrapper">
                    <div className="spinner">
                        <div className="spinner-ring"></div>
                        <div className="spinner-ring"></div>
                        <div className="spinner-ring"></div>
                    </div>
                    <p className="loading-text">Loading Your Report...</p>
                </div>
            </div>
        );
    }

    // Error handling
    if (error || !report) {
        return (
            <div className="interview-root error-container">
                <h2>Error: {error || "Report not found"}</h2>
            </div>
        );
    }

    // Ensure all data exists with fallbacks
    const {
        matchScore = 0,
        technicalQuestions = [],
        behavioralQuestions = [],
        skillGaps = [],
        preparationPlan = [],
    } = report;

    return (
        <div className="interview-root">

            {/* LEFT SIDEBAR */}
            <aside className="sidebar sidebar--left">

                <div className="sidebar__brand">
                    <span className="sidebar__brand-dot" />
                    <span className="sidebar__brand-text">PrepAI</span>
                </div>

                <nav className="sidebar__nav">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            className={`sidebar__nav-item ${
                                activeNav === item.id
                                    ? "sidebar__nav-item--active"
                                    : ""
                            }`}
                            onClick={() => setActiveNav(item.id)}
                        >
                            <span className="sidebar__nav-indicator" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="sidebar__score">
                    <p className="sidebar__score-label">Match Score</p>
                    <div className="sidebar__score-bar-wrap">
                        <div
                            className="sidebar__score-bar"
                            style={{ width: `${matchScore}%` }}
                        />
                    </div>
                    <p className="sidebar__score-value">
                        {matchScore}%
                    </p>
                </div>

            </aside>

            {/* MAIN CONTENT */}
            <main className="main-content">

                {/* TECHNICAL QUESTIONS */}
                {activeNav === "technical" && (
                    <section className="content-section">
                        <h2 className="content-section__title">
                            Technical Questions
                        </h2>
                        {technicalQuestions.length === 0 ? (
                            <p className="no-data">No technical questions available</p>
                        ) : (
                            <div className="question-list">
                                {technicalQuestions.map((q, i) => (
                                    <div
                                        key={i}
                                        className={`question-card ${
                                            expandedIndex.technical === i
                                                ? "question-card--open"
                                                : ""
                                        }`}
                                        onClick={() => toggleExpand("technical", i)}
                                    >
                                        <div className="question-card__header">
                                            <span className="question-card__index">
                                                Q{i + 1}
                                            </span>
                                            <p className="question-card__question">
                                                {q.question || "No question text"}
                                            </p>
                                            <span className="toggle-icon">
                                                {expandedIndex.technical === i ? "−" : "+"}
                                            </span>
                                        </div>

                                        {expandedIndex.technical === i && (
                                            <div className="question-card__body">
                                                <h4>Intention</h4>
                                                <p>{q.intention || "N/A"}</p>
                                                <h4>Ideal Answer</h4>
                                                <p>{q.answer || "N/A"}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* BEHAVIORAL QUESTIONS */}
                {activeNav === "behavioral" && (
                    <section className="content-section">
                        <h2 className="content-section__title">
                            Behavioral Questions
                        </h2>
                        {behavioralQuestions.length === 0 ? (
                            <p className="no-data">No behavioral questions available</p>
                        ) : (
                            <div className="question-list">
                                {behavioralQuestions.map((q, i) => (
                                    <div
                                        key={i}
                                        className={`question-card ${
                                            expandedIndex.behavioral === i
                                                ? "question-card--open"
                                                : ""
                                        }`}
                                        onClick={() => toggleExpand("behavioral", i)}
                                    >
                                        <div className="question-card__header">
                                            <span className="question-card__index">
                                                B{i + 1}
                                            </span>
                                            <p className="question-card__question">
                                                {q.question || "No question text"}
                                            </p>
                                            <span className="toggle-icon">
                                                {expandedIndex.behavioral === i ? "−" : "+"}
                                            </span>
                                        </div>

                                        {expandedIndex.behavioral === i && (
                                            <div className="question-card__body">
                                                <h4>Intention</h4>
                                                <p>{q.intention || "N/A"}</p>
                                                <h4>Tip</h4>
                                                <p>{q.answer || "N/A"}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* ROADMAP */}
                {activeNav === "roadmap" && (
                    <section className="content-section">
                        <h2 className="content-section__title">
                            Your Road Map
                        </h2>
                        {preparationPlan.length === 0 ? (
                            <p className="no-data">No preparation plan available</p>
                        ) : (
                            <>
                                {preparationPlan.map((plan, i) => (
                                    <div key={i} className="roadmap__week">
                                        <h3>Day {plan.day || i + 1}</h3>
                                        <h4>{plan.topic || "Preparation"}</h4>
                                        {plan.tasks && plan.tasks.length > 0 ? (
                                            <ul>
                                                {plan.tasks.map((task, j) => (
                                                    <li key={j}>✓ {task}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="no-tasks">No tasks for this day</p>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}
                    </section>
                )}

            </main>

            {/* RIGHT SIDEBAR */}
            <aside className="sidebar sidebar--right">

                <div className="skill-gaps">
                    <h3>Skill Gaps</h3>
                    {skillGaps.length === 0 ? (
                        <p className="no-gaps">No skill gaps identified</p>
                    ) : (
                        <>
                            {skillGaps.map((skill, i) => (
                                <span
                                    key={i}
                                    className={`skill-tag skill-tag--${
                                        skill.severity || "medium"
                                    }`}
                                >
                                    {skill.skill || "Unknown skill"}
                                </span>
                            ))}
                        </>
                    )}
                </div>
                
                {/* ACTION BUTTON */}
                <div className="action-section">
                    <button 
                        className="btn-download-resume" 
                        onClick={() => getResumePdf(interviewId)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download AI Resume
                    </button>
                </div>
            </aside>

        </div>
    );
}