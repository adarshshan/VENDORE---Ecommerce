import { Request, Response } from "express";
import Contact from "../models/ContactSchema";

export class ContactController {
  // @desc    Submit a contact form
  // @route   POST /api/contact
  // @access  Public
  public async submitContact(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone, subject, message } = req.body;

      if (!name || !email || !subject || !message) {
        res.status(400).json({
          success: false,
          message: "Please provide all required fields (name, email, subject, message).",
        });
        return;
      }

      const newContact = await Contact.create({
        name,
        email,
        phone,
        subject,
        message,
      });

      res.status(201).json({
        success: true,
        data: newContact,
        message: "Your message has been received. We will get back to you shortly.",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: error.message,
      });
    }
  }

  // @desc    Get all contact messages (Admin only)
  // @route   GET /api/contact
  // @access  Private/Admin
  public async getAllContacts(req: Request, res: Response): Promise<void> {
    try {
      const contacts = await Contact.find().sort({ createdAt: -1 });
      res.status(200).json({
        success: true,
        data: contacts,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: error.message,
      });
    }
  }

  // @desc    Update contact status (Admin only)
  // @route   PATCH /api/contact/:id
  // @access  Private/Admin
  public async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.body;
      const { id } = req.params;

      if (!["New", "In Progress", "Resolved"].includes(status)) {
        res.status(400).json({
          success: false,
          message: "Invalid status value.",
        });
        return;
      }

      const updatedContact = await Contact.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      );

      if (!updatedContact) {
        res.status(404).json({
          success: false,
          message: "Contact message not found.",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedContact,
        message: `Status updated to ${status}`,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: error.message,
      });
    }
  }
}
