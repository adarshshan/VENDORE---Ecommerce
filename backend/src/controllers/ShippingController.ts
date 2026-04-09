import { Request, Response } from "express";
import axios from "axios";

// Warehouse location (Origin)
const ORIGIN_PINCODE = "560001"; // Bangalore example
const ORIGIN_STATE = "Karnataka";

export class ShippingController {
  async validatePincode(req: Request, res: Response): Promise<void> {
    try {
      const { pincode } = req.body;

      if (!pincode || !/^\d{6}$/.test(pincode)) {
        res.status(400).json({
          success: false,
          valid: false,
          message: "Invalid PIN code format. Must be 6 digits.",
        });
        return;
      }

      // 1. Validate using India Post API
      const response = await axios.get(
        `https://api.postalpincode.in/pincode/${pincode}`,
      );

      const data = response.data[0];

      if (data.Status !== "Success") {
        res.status(404).json({
          success: false,
          valid: false,
          message: "Invalid Indian PIN code.",
        });
        return;
      }

      // 2. DTDC Serviceability & Estimation Logic
      // For this implementation, we assume DTDC serves all valid Indian PIN codes
      // But we calculate delivery days based on distance (Same State vs Other)
      
      const destinationState = data.PostOffice[0].State;
      const destinationCity = data.PostOffice[0].District;

      let estimatedDays = 5; // Default (Far states)
      
      if (destinationState === ORIGIN_STATE) {
        estimatedDays = 2; // Same state
      } else if (
        ["Tamil Nadu", "Kerala", "Andhra Pradesh", "Telangana", "Goa", "Maharashtra"].includes(
          destinationState,
        )
      ) {
        estimatedDays = 3; // Nearby states
      }

      const estimatedDate = new Date();
      estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);

      res.status(200).json({
        success: true,
        valid: true,
        serviceable: true,
        city: destinationCity,
        state: destinationState,
        estimatedDays,
        estimatedDeliveryDate: estimatedDate.toISOString().split("T")[0],
      });
    } catch (error: any) {
      console.error("Pincode validation error:", error.message);
      res.status(500).json({
        success: false,
        message: "Failed to validate PIN code. Please try again.",
      });
    }
  }
}
