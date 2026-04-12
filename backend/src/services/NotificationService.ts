import nodemailer from "nodemailer";
import twilio from "twilio";

interface NotificationData {
  eventType: "Placed" | "Cancelled" | "Returned" | "ReturnRequested";
  orderId: string;
  customerName: string;
  customerEmail?: string;
  amount: number;
  itemsPrice?: number;
  shippingPrice?: number;
  items: any[];
  reason?: string;
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

  private formatWhatsAppMessage(data: NotificationData): string {
    const { eventType, orderId, customerName, amount, items, reason, itemsPrice, shippingPrice } = data;
    const itemsList = items
      .map((item) => `${item.name} (x${item.quantity})`)
      .join(", ");

    let message = `*${eventType.toUpperCase()} Notification!* 👗\n`;
    message += `*Order ID:* #${orderId}\n`;
    message += `*Customer:* ${customerName}\n`;
    message += `*Items:* ${itemsList}\n`;
    
    if (itemsPrice !== undefined && shippingPrice !== undefined) {
      message += `*Items Price:* ₹${itemsPrice.toFixed(2)}\n`;
      message += `*Shipping:* ${shippingPrice === 0 ? "FREE" : `₹${shippingPrice.toFixed(2)}`}\n`;
    }
    
    message += `*Total Amount:* ₹${amount.toFixed(2)}`;

    if (reason) {
      message += `\n*Reason:* ${reason}`;
    }

    return message;
  }

  private getEmailTemplate(
    data: NotificationData,
    isForAdmin: boolean,
  ): { subject: string; html: string } {
    const { eventType, orderId, customerName, amount, items, reason, itemsPrice, shippingPrice } = data;
    const itemsHtml = items
      .map(
        (item) =>
          `<li>${item.name} - Quantity: ${item.quantity} - Price: ₹${item.price}</li>`,
      )
      .join("");

    let title = "";
    let subject = "";
    let messageBody = "";

    switch (eventType) {
      case "Placed":
        title = "Order Placed Successfully";
        subject = `ThreadCo Order Placed: #${orderId}`;
        messageBody = isForAdmin
          ? `<p>A new order has been placed by <strong>${customerName}</strong>.</p>`
          : `<p>Thank you for your order, <strong>${customerName}</strong>! We're processing it now.</p>`;
        break;
      case "Cancelled":
        title = "Order Cancelled";
        subject = `ThreadCo Order Cancelled: #${orderId}`;
        messageBody = isForAdmin
          ? `<p>Order #${orderId} has been cancelled by <strong>${customerName}</strong>.</p>`
          : `<p>Your order #${orderId} has been successfully cancelled.</p>`;
        if (reason) messageBody += `<p><strong>Reason:</strong> ${reason}</p>`;
        break;
      case "ReturnRequested":
        title = "Return Requested";
        subject = `ThreadCo Return Request: #${orderId}`;
        messageBody = isForAdmin
          ? `<p>A return has been requested for Order #${orderId} by <strong>${customerName}</strong>.</p>`
          : `<p>Your return request for Order #${orderId} has been received and is being reviewed.</p>`;
        if (reason)
          messageBody += `<p><strong>Reason for Return:</strong> ${reason}</p>`;
        break;
      case "Returned":
        title = "Return Processed";
        subject = `ThreadCo Return Approved: #${orderId}`;
        messageBody = isForAdmin
          ? `<p>The return for Order #${orderId} has been approved.</p>`
          : `<p>Your return for Order #${orderId} has been approved and processed.</p>`;
        break;
    }

    const priceBreakdownHtml = (itemsPrice !== undefined && shippingPrice !== undefined) ? `
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-top: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px 0; color: #777;">Items Subtotal:</td>
            <td style="padding: 5px 0; text-align: right; font-weight: bold;">₹${itemsPrice.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #777;">Shipping Charges:</td>
            <td style="padding: 5px 0; text-align: right; font-weight: bold; color: ${shippingPrice === 0 ? "#27ae60" : "#333"};">${shippingPrice === 0 ? "FREE" : `₹${shippingPrice.toFixed(2)}`}</td>
          </tr>
          <tr style="border-top: 1px solid #ddd;">
            <td style="padding: 10px 0 0 0; font-size: 18px; font-weight: bold;">Total Amount:</td>
            <td style="padding: 10px 0 0 0; text-align: right; font-size: 18px; font-weight: bold; color: #e67e22;">₹${amount.toFixed(2)}</td>
          </tr>
        </table>
      </div>
    ` : `
      <p style="font-size: 18px;"><strong>Total Amount:</strong> ₹${amount.toFixed(2)}</p>
    `;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #e67e22; margin: 0;">ThreadCo</h1>
        </div>
        <h2 style="color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px;">${title}</h2>
        ${messageBody}
        <p><strong>Order ID:</strong> #${orderId}</p>
        
        ${priceBreakdownHtml}

        <h3>Order Details:</h3>
        <ul>${itemsHtml}</ul>
        <div style="margin-top: 20px; font-size: 12px; color: #777; text-align: center; border-top: 1px solid #eee; padding-top: 10px;">
          ${isForAdmin ? "This is an automated notification for Admin." : "If you have any questions, please contact our support team."}
          <br/>© ${new Date().getFullYear()} ThreadCo. All rights reserved.
        </div>
      </div>
    `;

    return { subject, html };
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

      const message = this.formatWhatsAppMessage(data);

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

      const adminEmailConfig = process.env.ADMIN_EMAIL || "";
      if (!adminEmailConfig || adminEmailConfig === "admin@kidsown.com") {
        console.warn("Admin email missing or default.");
        return;
      }

      // Support multiple admin emails
      const adminEmails = adminEmailConfig
        .split(",")
        .map((email) => email.trim());

      const { subject, html } = this.getEmailTemplate(data, true);

      const mailOptions = {
        from: `ThreadCo <${process.env.EMAIL_USER}>`,
        to: adminEmails.join(","),
        subject: subject,
        html: html,
      };

      await transporter.sendMail(mailOptions);
      console.log(
        `Email notification sent to admins for order ${data.orderId}`,
      );

      // Send to customer if email is provided
      if (data.customerEmail) {
        await this.sendCustomerEmail(data);
      }
    } catch (error) {
      console.error("Email notification failed:", error);
    }
  }

  private async sendCustomerEmail(data: NotificationData): Promise<void> {
    try {
      const transporter = this.initTransporter();
      if (!transporter || !data.customerEmail) return;

      const { subject, html } = this.getEmailTemplate(data, false);

      const mailOptions = {
        from: `ThreadCo <${process.env.EMAIL_USER}>`,
        to: data.customerEmail,
        subject: subject,
        html: html,
      };

      await transporter.sendMail(mailOptions);
      console.log(
        `Email notification sent to customer (${data.customerEmail}) for order ${data.orderId}`,
      );
    } catch (error) {
      console.error(
        `Customer email notification failed for ${data.customerEmail}:`,
        error,
      );
    }
  }

  async notify(data: NotificationData): Promise<void> {
    // Using setImmediate to not block the main process
    setImmediate(async () => {
      await Promise.allSettled([
        this.sendWhatsAppMessage(data),
        this.sendEmailNotification(data),
      ]);
    });
  }

  // Keep notifyAdmin for backward compatibility, but it calls notify
  async notifyAdmin(data: NotificationData): Promise<void> {
    return this.notify(data);
  }
}

export const notificationService = new NotificationService();
