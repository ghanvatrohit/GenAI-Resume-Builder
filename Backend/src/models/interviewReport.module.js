const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
    {
        question: { type: String, default: "", trim: true },
        intention: { type: String, default: "", trim: true },
        // ← removed required:true — AI sometimes returns empty strings
        answer:    { type: String, default: "", trim: true }
    },
    { _id: false }
);

const skillGapSchema = new mongoose.Schema(
    {
        skill:    { type: String, default: "General Skill", trim: true },
        severity: { type: String, enum: ["low", "medium", "high"], default: "medium" }
    },
    { _id: false }
);

const preparationPlanSchema = new mongoose.Schema(
    {
        day:   { type: Number, default: 1 },
        topic: { type: String, default: "Preparation", trim: true },
        tasks: [{ type: String, trim: true }]
    },
    { _id: false }
);

const interviewReportSchema = new mongoose.Schema(
    {
        jobDescription:  { type: String, required: true, trim: true },
        resume:          { type: String, default: "" },
        selfDescription: { type: String, default: "", trim: true },
        matchScore:      { type: Number, min: 0, max: 100, default: 0 },

        technicalQuestions:  { type: [questionSchema], default: [] },
        behavioralQuestions: { type: [questionSchema], default: [] },
        skillGaps:           { type: [skillGapSchema], default: [] },
        preparationPlan:     { type: [preparationPlanSchema], default: [] },

        user:  { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
        title: { type: String, default: "Interview Report", trim: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model("InterviewReport", interviewReportSchema);