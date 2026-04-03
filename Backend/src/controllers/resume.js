import Resume from "../models/resume.js";
import { extractText } from "unpdf";

/**
 * Get all resumes for the current user
 */
export const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: resumes });
  } catch (error) {
    console.error("Get Resumes Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch resumes." });
  }
};

/**
 * Upload a new resume from PDF
 */
export const uploadResume = async (req, res) => {
  console.log("🚀 Canvas-Free PDF Parse Request Received");
  try {
    if (!req.file) {
      console.warn("❌ No file in request buffer");
      return res
        .status(400)
        .json({ success: false, message: "No PDF file uploaded." });
    }

    console.log(
      `📄 Received file: ${req.file.originalname} (${req.file.size} bytes)`,
    );

    // Parse PDF using unpdf API
    let content = "";
    try {
      const uint8Array = new Uint8Array(req.file.buffer);
      const result = await extractText(uint8Array);
      content = Array.isArray(result.text) ? result.text.join("\n") : (result.text || "");
    } catch (parseErr) {
      console.error("❌ PDF Parse Error:", parseErr);
      import("fs").then(fs => fs.appendFileSync("error_log.txt", "Parse Err: " + parseErr.stack + "\n\n"));
      return res
        .status(500)
        .json({
          success: false,
          message: "PDF parser failed: " + parseErr.message,
          error: parseErr.stack
        });
    }

    const name = req.file.originalname;

    if (!content || !content.trim()) {
      console.warn("⚠️ PDF Parsing yielded no readable text content.");
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Could not extract text from PDF. Scanned images are not supported yet.",
        });
    }

    console.log("✅ PDF Parsed successfully. Content length:", content.length);

    const newResume = new Resume({
      user: req.user._id,
      name,
      content,
    });

    await newResume.save();
    console.log("💾 Resume saved to Database");
    res.status(201).json({ success: true, data: newResume });
  } catch (error) {
    console.error("🔥 Global Upload Resume Error:", error);
    import("fs").then(fs => fs.appendFileSync("error_log.txt", "Global Err: " + error.stack + "\n\n"));
    res
      .status(500)
      .json({ success: false, message: "Server error during PDF processing: " + error.message, error: error.stack });
  }
};

/**
 * Delete a resume
 */
export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!resume) {
      return res
        .status(404)
        .json({ success: false, message: "Resume not found." });
    }
    res
      .status(200)
      .json({ success: true, message: "Resume deleted successfully." });
  } catch (error) {
    console.error("Delete Resume Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete resume." });
  }
};
