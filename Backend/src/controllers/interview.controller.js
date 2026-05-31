const pdf = require("pdf-parse");
const pdfParse = pdf.default || pdf;
const PDFDocument = require("pdfkit");

const { generateInterviewReport } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.module");

async function generateInterViewReportController(req, res) {
    try {
        const { selfDescription, jobDescription } = req.body;

        let resumeText = "";
        if (req.file) {
            const resumeContent = await pdfParse(req.file.buffer);
            resumeText = resumeContent.text;
        }

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        });

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interviewReportByAi
        });

        return res.status(201).json({
            success: true,
            message: "Interview report generated successfully.",
            interviewReport
        });

    } catch (error) {
        console.error("Error generating interview report:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}

async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params;

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewId,
            user: req.user.id
        }).lean();

        if (!interviewReport) {
            return res.status(404).json({
                success: false,
                message: "Interview report not found."
            });
        }

        return res.status(200).json({
            success: true,
            interviewReport
        });

    } catch (error) {
        console.error("Error fetching interview report:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}

async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")
            .lean();

        return res.status(200).json({
            success: true,
            message: "Interview reports fetched successfully.",
            interviewReports
        });

    } catch (error) {
        console.error("Error fetching interview reports:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}

// ✅ generateResumePdfController — properly closed, no nested functions
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params;

        const interviewReport = await interviewReportModel.findById(interviewReportId);

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=PrepAI_Report_${interviewReportId.substring(0, 5)}.pdf`);

        const doc = new PDFDocument({ margin: 40 });
        doc.pipe(res);

        // Title
        doc.fontSize(22).fillColor('#4f6ef7').text('PrepAI Interview Strategy', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(14).fillColor('#333').text(`Report Title: ${interviewReport.title || 'Custom Strategy'}`, { align: 'center' });
        doc.moveDown(1.5);

        // Match Score
        doc.fontSize(16).fillColor('#10b981').text(`Match Score: ${interviewReport.matchScore}%`, { underline: true });
        doc.moveDown(1);

        // Skill Gaps
        if (interviewReport.skillGaps && interviewReport.skillGaps.length > 0) {
            doc.fontSize(14).fillColor('#000').text('Skill Gaps Identified:');
            doc.moveDown(0.5);
            interviewReport.skillGaps.forEach(gap => {
                doc.fontSize(12).fillColor('#d97706').text(`• ${gap.skill} (Severity: ${gap.severity})`);
            });
            doc.moveDown(1);
        }

        // Technical Questions
        if (interviewReport.technicalQuestions && interviewReport.technicalQuestions.length > 0) {
            doc.fontSize(14).fillColor('#000').text('Top Technical Questions:');
            doc.moveDown(0.5);
            interviewReport.technicalQuestions.forEach((q, index) => {
                doc.fontSize(12).fillColor('#2563eb').text(`Q${index + 1}: ${q.question}`);
                doc.fontSize(10).fillColor('#4b5563').text(`Tip: ${q.answer}`);
                doc.moveDown(0.5);
            });
        }

        doc.end();

    } catch (error) {
        console.error("Error generating PDF:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Failed to generate PDF document" });
        }
    }
} // ✅ generateResumePdfController ends here

// ✅ deleteInterviewReportController — now a proper top-level function
async function deleteInterviewReportController(req, res) {
    try {
        const { interviewId } = req.params;

        const deletedReport = await interviewReportModel.findOneAndDelete({
            _id: interviewId,
            user: req.user.id
        });

        if (!deletedReport) {
            return res.status(404).json({
                success: false,
                message: "Interview report not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Interview report deleted successfully"
        });

    } catch (error) {
        console.error("Delete Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController,
    deleteInterviewReportController
};