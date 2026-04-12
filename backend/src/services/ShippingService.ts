import { ProductModel } from "../models/productsSchema";

export interface DeliveryChargeResponse {
  deliveryType: "Local" | "Intra-State" | "Inter-State";
  totalWeight: number;
  deliveryCharge: number;
  estimatedDays: number;
}

export class ShippingService {
  // Configurable origin details
  private static ORIGIN_PINCODE = "676505"; // Kerala
  private static ORIGIN_CITY = "Malappuram";
  private static ORIGIN_STATE = "Kerala";

  // DTDC Lite Pricing Config
  private static PRICING = {
    Local: {
      "500": 50,
      "1000": 100,
      "2000": 170,
    },
    "Intra-State": {
      "500": 75,
      "1000": 150,
      "2000": 260,
    },
    "Inter-State": {
      "500": 100,
      "1000": 230,
      "2000": 420,
    },
    extraChargePerKg: 150,
  };

  async calculateDeliveryCharge(
    pincode: string,
    destinationCity: string,
    destinationState: string,
    cartItems: { productId: string; quantity: number }[],
  ): Promise<DeliveryChargeResponse> {
    // 1. Determine Delivery Type
    let deliveryType: "Local" | "Intra-State" | "Inter-State" = "Inter-State";
    let estimatedDays = 5;

    if (
      destinationCity
        .toLowerCase()
        .includes(ShippingService.ORIGIN_CITY.toLowerCase())
    ) {
      deliveryType = "Local";
      estimatedDays = 1;
    } else if (
      destinationState.toLowerCase() ===
      ShippingService.ORIGIN_STATE.toLowerCase()
    ) {
      deliveryType = "Intra-State";
      estimatedDays = 2;
    } else {
      deliveryType = "Inter-State";
      estimatedDays = 4;
    }

    // 2. Calculate Total Weight
    let totalWeight = 0;
    for (const item of cartItems) {
      const product = await ProductModel.findById(item.productId).select(
        "weight",
      );
      const weight = product?.weight || 500; // Default 500g
      totalWeight += weight * item.quantity;
    }

    // 3. Calculate Charge based on DTDC Lite slabs
    const charge = this.computeCharge(deliveryType, totalWeight);

    return {
      deliveryType,
      totalWeight,
      deliveryCharge: charge,
      estimatedDays,
    };
  }

  private computeCharge(
    type: "Local" | "Intra-State" | "Inter-State",
    weightGrams: number,
  ): number {
    const pricingTable = ShippingService.PRICING[type];

    if (weightGrams <= 500) {
      return pricingTable["500"];
    } else if (weightGrams <= 1000) {
      return pricingTable["1000"];
    } else if (weightGrams <= 2000) {
      return pricingTable["2000"];
    } else {
      // Over 2kg logic
      const baseCharge = pricingTable["2000"];
      const extraWeightKg = Math.ceil((weightGrams - 2000) / 1000);
      return (
        baseCharge + extraWeightKg * ShippingService.PRICING.extraChargePerKg
      );
    }
  }
}
