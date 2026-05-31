import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../auth/components/LoadingSpinner";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useInterview } from "../../auth/hooks/useinterview";
import "../style/home.scss";

const Home = () => {
    const { loading, generateReport, reports, getReports, deleteReport } = useInterview();
    const navigate = useNavigate();
    const { handleLogout, user } = useAuth();

    const [jobDescription, setJobDescription] = useState("");
    const [selfDescription, setSelfDescription] = useState("");
    const [jobDescriptionLength, setJobDescriptionLength] = useState(0);
    const [resumeFile, setResumeFile] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const [theme, setTheme] = useState(() => localStorage.getItem("prepai-theme") || "dark");

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("prepai-theme", theme);
    }, [theme]);

    const toggleTheme = () => setTheme(t => (t === "dark" ? "light" : "dark"));

    const resumeInputRef = useRef();

    const onLogout = async () => {
        await handleLogout();
        navigate("/login");
    };

    useEffect(() => { getReports(); }, []);

    const handleJobDescriptionChange = (e) => {
        setJobDescription(e.target.value);
        setJobDescriptionLength(e.target.value.length);
    };

    const handleResumeChange = (e) => {
        setResumeFile(e.target.files?.[0] || null);
    };

    const handleGenerateClick = async () => {
        if (!jobDescription.trim()) { alert("Please enter a job description."); return; }
        if (!resumeFile && !selfDescription.trim()) { alert("Please upload a resume or enter a self description."); return; }
        setIsGenerating(true);
        try {
            const fileToUpload = resumeInputRef.current?.files?.[0] || resumeFile;
            const report = await generateReport({ jobDescription, selfDescription, resumeFile: fileToUpload });
            if (report?._id) navigate(`/interview/${report._id}`);
        } catch (err) {
            console.error("Error generating report:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    if (isGenerating) return <LoadingSpinner message="Generating your personalized interview strategy..." />;
    if (loading && !reports.length) return <LoadingSpinner message="Loading your dashboard..." />;

    return (
        <div className="home-page-wrapper">

            <div className="bg-orb bg-orb--1" />
            <div className="bg-orb bg-orb--2" />
            <div className="bg-orb bg-orb--3" />

            {/* ── NAVBAR ── */}
            <nav className="navbar">
                <div className="navbar__brand">
                    <div className="navbar__logo">⚡</div>
                    <span className="navbar__name">PrepAI</span>
                </div>

                <div className="navbar__right">
                    {user && (
                        <div className="navbar__user">
                            <div className="navbar__avatar">
                                {user.username?.charAt(0).toUpperCase()}
                            </div>
                            <span className="navbar__username">Hey, {user.username}!</span>
                        </div>
                    )}

                    <button className="logout-btn" onClick={onLogout}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.2"
                            strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Logout</span>
                    </button>
                </div>
            </nav>
            <button className="theme-fab" onClick={toggleTheme}>
    {theme === "dark" ? "☀️" : "🌙"}
</button>
            {/* ── HERO ── */}
            <header className="page-header">
                <div className="hero">
                    <span className="hero__badge">AI-Powered Interview Prep</span>
                    <h1 className="hero__title">
                        Ace Your Interview with<br />
                        <span className="gradient-text">Personalized Strategy</span>
                    </h1>
                    <p className="hero__sub">
                        Let our advanced AI analyze the job requirements against your profile
                        to craft a winning, tailored interview preparation plan.
                    </p>
                    <div className="hero__stats">
                        {[
                            { num: "10K+", label: "Users Prepared" },
                            { num: "92%", label: "Success Rate" },
                            { num: "30s", label: "AI Analysis" },
                        ].map(({ num, label }) => (
                            <div className="stat-pill" key={label}>
                                <span className="stat-pill__num">{num}</span>
                                <span className="stat-pill__label">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            {/* ── MAIN CARD ── */}
            <main className="home-card">
                <div className="card-content">

                    {/* LEFT */}
                    <div className="col-panel">
                        <div className="col-header">
                            <div className="col-header__left">
                                <div className="col-header__icon col-header__icon--job">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2.2"
                                        strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="7" width="20" height="14" rx="2" />
                                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                    </svg>
                                </div>
                                <div>
                                    <h2>Target Job Description</h2>
                                    <p className="subtitle">Paste the job posting you're applying for</p>
                                </div>
                            </div>
                            <span className="badge badge--required">
                                <span className="dot" /> Required
                            </span>
                        </div>
                        <div className="textarea-wrap">
                            <textarea
                                onChange={handleJobDescriptionChange}
                                value={jobDescription}
                                placeholder="Paste the complete job description here…"
                            />
                            <div className="char-bar">
                                <span className="char-bar__num">{jobDescriptionLength}</span>
                                <span className="char-bar__label">chars</span>
                                <div className="char-bar__track">
                                    <div className="char-bar__fill"
                                        style={{ width: `${Math.min(jobDescriptionLength / 50, 100)}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="col-panel">
                        <div className="col-header">
                            <div className="col-header__left">
                                <div className="col-header__icon col-header__icon--profile">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2.2"
                                        strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <div>
                                    <h2>Your Profile</h2>
                                    <p className="subtitle">Share your background &amp; experience</p>
                                </div>
                            </div>
                        </div>

                        <div className="right-col">
                            <div>
                                <div className="section-label">
                                    <span>Upload Resume</span>
                                    <span className="badge badge--premium">⭐ Best Results</span>
                                </div>
                                <label htmlFor="resume"
                                    className={`upload-zone ${resumeFile ? "upload-zone--active" : ""}`}>
                                    <div className="upload-zone__icon">
                                        {resumeFile ? (
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" strokeWidth="2.5"
                                                strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        ) : (
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" strokeWidth="2"
                                                strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="17 8 12 3 7 8" />
                                                <line x1="12" y1="3" x2="12" y2="15" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="upload-zone__text">
                                        {resumeFile ? (
                                            <><strong>✓ {resumeFile.name}</strong><small>Ready to analyze</small></>
                                        ) : (
                                            <><strong>Click to upload or drag &amp; drop</strong><small>PDF or DOCX · Max 5 MB</small></>
                                        )}
                                    </div>
                                    <input ref={resumeInputRef} type="file" id="resume"
                                        accept=".pdf,.docx,.doc" onChange={handleResumeChange} />
                                </label>
                            </div>

                            <div className="or-divider">or continue without</div>

                            <div>
                                <div className="section-label">
                                    <span>Quick Self-Description</span>
                                    <span className="badge badge--optional">Optional</span>
                                </div>
                                <textarea className="self-desc-textarea"
                                    onChange={e => setSelfDescription(e.target.value)}
                                    value={selfDescription}
                                    placeholder="Share your key experiences, tech skills, years in the industry…" />
                            </div>

                            <div className="pro-tip">
                                <span className="pro-tip__icon">💡</span>
                                <div>
                                    <p className="pro-tip__title">Pro Tip</p>
                                    <p className="pro-tip__text">
                                        Either a <strong>Resume</strong> or <strong>Self-Description</strong> is required.
                                        For best results, include both!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-footer">
                    <div className="card-footer__meta">
                        <div className="pulse-dot" />
                        AI Analysis · ~30 seconds
                    </div>
                    <button className="generate-btn" onClick={handleGenerateClick} disabled={isGenerating}>
                        {isGenerating ? (
                            <><span className="btn-spinner" />Generating…</>
                        ) : (
                            <>
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                                Generate My Interview Strategy
                            </>
                        )}
                    </button>
                </div>
            </main>

            {/* ── RECENT REPORTS ── */}
            {reports && reports.length > 0 && (
                <div className="recent-reports-section">
                    <div className="recent-reports-section__head">
                        <h3 className="recent-reports-section__title">Your Recent Strategies</h3>
                        <span className="recent-reports-section__count">{reports.length} Reports</span>
                    </div>
                    <div className="reports-grid">
                        {reports.map(report => (
                            <div key={report._id} className="report-card"
                                onClick={() => navigate(`/interview/${report._id}`)}>
                                <div className="report-card__icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2"
                                        strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="16" y1="13" x2="8" y2="13" />
                                        <line x1="16" y1="17" x2="8" y2="17" />
                                    </svg>
                                </div>
                                <div className="report-card__info">
                                    <h4 className="report-card__title">{report.title || "Interview Prep Strategy"}</h4>
                                    <span className="report-card__date">
                                        📅 {new Date(report.createdAt).toLocaleDateString("en-US", {
                                            day: "numeric", month: "short", year: "numeric"
                                        })}
                                    </span>
                                </div>
                                <div className="report-card__actions">
                                    {report.matchScore && (
                                        <span className="score-badge">{report.matchScore}% Match</span>
                                    )}
                                    <button className="btn-delete" title="Delete"
                                        onClick={e => {
                                            e.stopPropagation();
                                            if (confirm("Delete this report?")) deleteReport(report._id);
                                        }}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" strokeWidth="2"
                                            strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── FEATURES ── */}
            <section className="features-section">
                {[
                    { icon: "🎯", title: "Smart Analysis", desc: "AI scans every requirement in seconds" },
                    { icon: "📊", title: "Match Score", desc: "Get your job match percentage instantly" },
                    { icon: "💪", title: "Custom Strategy", desc: "Personalized interview prep plan" },
                    { icon: "🚀", title: "Interview Ready", desc: "Walk in confident and prepared" },
                ].map(({ icon, title, desc }) => (
                    <div className="feature-card" key={title}>
                        <span className="feature-card__icon">{icon}</span>
                        <h3>{title}</h3>
                        <p>{desc}</p>
                    </div>
                ))}
            </section>

            {/* ── FOOTER ── */}
            <footer className="page-footer">
                <div className="page-footer__inner">
                    <div className="page-footer__links">
                        <a href="#">Privacy Policy</a>
                        <span>•</span>
                        <a href="#">Terms of Service</a>
                        <span>•</span>
                        <a href="#">Help Center</a>
                    </div>
                    <p className="page-footer__copy">Powered by Advanced AI · Your Success is Our Mission</p>
                </div>
            </footer>

        </div>
    );
};

export default Home;