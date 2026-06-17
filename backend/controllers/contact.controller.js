import Contact from "../models/contact.js";

// @desc    Submit a contact form message
// @route   POST /api/contact/submit
// @access  Public
export const submitContactForm = async (req, res) => {
  try {
    const { firstName, lastName, email, inquiryType, message } = req.body;

    if (!firstName || !lastName || !email || !message || inquiryType === "Select Topic...") {
      return res.status(400).json({ success: false, message: "Please provide all required fields." });
    }

    const newContact = await Contact.create({
      firstName,
      lastName,
      email,
      inquiryType,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Your message has been sent successfully!",
      data: newContact,
    });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
