import { Request, Response } from "express";
import axios from "axios";
import { ShippingService } from "../services/ShippingService";

const shippingService = new ShippingService();

export class ShippingController {
  async validatePincode(req: Request, res: Response): Promise<void> {
    try {
      const { pincode, cartItems } = req.body;

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

      const destinationState = data.PostOffice[0].State;
      const destinationCity = data.PostOffice[0].District;

      // 2. Calculate Delivery Charges if cartItems are provided
      let deliveryDetails = null;
      if (cartItems && Array.isArray(cartItems) && cartItems.length > 0) {
        deliveryDetails = await shippingService.calculateDeliveryCharge(
          pincode,
          destinationCity,
          destinationState,
          cartItems
        );
      }

      const estimatedDays = deliveryDetails?.estimatedDays || 5;
      const estimatedDate = new Date();
      estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);

      res.status(200).json({
        success: true,
        valid: true,
        serviceable: true,
        city: destinationCity,
        state: destinationState,
        deliveryCharge: deliveryDetails?.deliveryCharge || 0,
        deliveryType: deliveryDetails?.deliveryType || "Inter-State",
        totalWeight: deliveryDetails?.totalWeight || 0,
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
