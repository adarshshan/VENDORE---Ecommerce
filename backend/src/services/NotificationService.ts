import nodemailer from "nodemailer";
import twilio from "twilio";

interface NotificationData {
  eventType: "Placed" | "Cancelled" | "Returned";
  orderId: string;
  customerName: string;
  amount: number;
  items: any[];
}

class NotificationService {
  private transporter: nodemailer.Transporter | null = null;
  private twilioClient: twilio.Twilio | null = null;

  private initTransporter() {
    if (this.transporter) return this.transporter;

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn(
        "Email configuration missing. Skipping email initialization.",
      );
      return null;
    }

    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    return this.transporter;
  }

  private initTwilio() {
    if (this.twilioClient) return this.twilioClient;

    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;

    if (!sid || !token || sid === "your_account_sid") {
      console.warn(
        "Twilio configuration missing or default. Skipping WhatsApp initialization.",
      );
      return null;
    }

    if (!sid.startsWith("AC")) {
      console.error(
        "Twilio Account SID must start with 'AC'. Please check your .env file.",
      );
      return null;
    }

    try {
      this.twilioClient = twilio(sid, token);
      return this.twilioClient;
    } catch (error) {
      console.error("Failed to initialize Twilio client:", error);
      return null;
    }
  }

  private formatMessage(data: NotificationData): string {
    const { eventType, orderId, customerName, amount, items } = data;
    const itemsList = items
      .map((item) => `${item.name} (x${item.quantity})`)
      .join(", ");

    return `*${eventType.toUpperCase()} Notification!* 👗
*Order ID:* #${orderId}
*Customer:* ${customerName}
*Items:* ${itemsList}
*Amount:* ₹${amount.toFixed(2)}`;
  }

  async sendWhatsAppMessage(data: NotificationData): Promise<void> {
    try {
      const client = this.initTwilio();
      if (!client) return;

      if (
        !process.env.TWILIO_WHATSAPP_NUMBER ||
        !process.env.ADMIN_PHONE_NUMBER ||
        process.env.ADMIN_PHONE_NUMBER === "+91XXXXXXXXXX"
      ) {
        console.warn("WhatsApp numbers missing or default.");
        return;
      }

      const message = this.formatMessage(data);

      await client.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${process.env.ADMIN_PHONE_NUMBER}`,
        body: message,
      });

      console.log(`WhatsApp notification sent for order ${data.orderId}`);
    } catch (error) {
      console.error("WhatsApp notification failed:", error);
    }
  }

  async sendEmailNotification(data: NotificationData): Promise<void> {
    try {
      const transporter = this.initTransporter();
      if (!transporter) return;

      if (
        !process.env.ADMIN_EMAIL ||
        process.env.ADMIN_EMAIL === "admin@kidsown.com"
      ) {
        console.warn("Admin email missing or default.");
        return;
      }

      const { eventType, orderId, customerName, amount, items } = data;
      const itemsHtml = items
        .map(
          (item) =>
            `<li>${item.name} - Quantity: ${item.quantity} - Price: ₹${item.price}</li>`,
        )
        .join("");

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: `VENDORA Order ${eventType}: #${orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
            <h2 style="color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px;">Order ${eventType}</h2>
            <p><strong>Order ID:</strong> #${orderId}</p>
            <p><strong>Customer Name:</strong> ${customerName}</p>
            <p><strong>Total Amount:</strong> ₹${amount.toFixed(2)}</p>
            <h3>Items:</h3>
            <ul>${itemsHtml}</ul>
            <div style="margin-top: 20px; font-size: 12px; color: #777; text-align: center; border-top: 1px solid #eee; padding-top: 10px;">
              This is an automated notification from VENDORA Admin System.
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email notification sent for order ${orderId}`);
    } catch (error) {
      console.error("Email notification failed:", error);
    }
  }

  async notifyAdmin(data: NotificationData): Promise<void> {
    await Promise.allSettled([
      this.sendWhatsAppMessage(data),
      this.sendEmailNotification(data),
    ]);
  }
}

export const notificationService = new NotificationService();
