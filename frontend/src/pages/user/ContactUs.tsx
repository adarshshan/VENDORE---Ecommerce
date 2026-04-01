import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import { submitContact } from "../../services/api";
import CustomButton from "../../components/CustomButton";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const ContactUs: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      await submitContact(data);
      setSubmitStatus({
        type: "success",
        message: "Your message has been sent successfully!",
      });
      reset();
    } catch (error: any) {
      setSubmitStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to send message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-5 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-5 sm:mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-text-primary mb-4">
            Contact Us
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Have questions about our products or your order? We're here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Details Section */}
          <div className="space-y-8">
            <div className="card p-8 bg-surface-light border-border">
              <h3 className="text-2xl font-bold text-text-primary mb-8">
                Get in Touch
              </h3>

              <div className="space-y-1">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/20 p-3 rounded-full">
                    <PhoneIcon className="text-text-primary" />
                  </div>
                  <div>
                    <p className="text-text-primary font-semibold">Phone & Helpline</p>
                    <p className="text-text-secondary">+91 7356683993</p>
                    <p className="text-text-secondary">
                      1-800-KIDS-OWN (Toll Free)
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary/20 p-3 rounded-full">
                    <EmailIcon className="text-text-primary" />
                  </div>
                  <div>
                    <p className="text-text-primary font-semibold">Email Address</p>
                    <p className="text-text-secondary">
                      vendorashop555@gmail.com
                    </p>
                    <p className="text-text-secondary">
                      officialsadarsh7@gmail.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary/20 p-3 rounded-full">
                    <LocationIcon className="text-text-primary" />
                  </div>
                  <div>
                    <p className="text-text-primary font-semibold">Physical Address</p>
                    <p className="text-text-secondary">
                      Kootilangadi, Malappuram
                    </p>
                    <p className="text-text-secondary">Kerala, India 676506</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary/20 p-3 rounded-full">
                    <TimeIcon className="text-text-primary" />
                  </div>
                  <div>
                    <p className="text-text-primary font-semibold">Working Hours</p>
                    <p className="text-text-secondary">
                      Mon - Fri: 9:00 AM - 6:00 PM
                    </p>
                    <p className="text-text-secondary">
                      Sat: 10:00 AM - 4:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="card p-8 bg-surface border-border">
            <h3 className="text-2xl font-bold text-text-primary mb-8">
              Send us a Message
            </h3>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6 text-text-primary"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Name
                  </label>
                  <input
                    {...register("name")}
                    className={`input w-full ${errors.name ? "border-error" : "border border-border"}  hover:border-border-light px-3 py-1 rounded-md`}
                    placeholder="Your Name"
                  />
                  {errors.name && (
                    <p className="text-error text-xs mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Email
                  </label>
                  <input
                    {...register("email")}
                    className={`input w-full ${errors.email ? "border-error" : "border border-border"}  hover:border-border-light px-3 py-1 rounded-md`}
                    placeholder="Your Email"
                  />
                  {errors.email && (
                    <p className="text-error text-xs mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Phone (Optional)
                  </label>
                  <input
                    {...register("phone")}
                    className={`input w-full border border-border  hover:border-border-light px-3 py-1 rounded-md`}
                    placeholder="Your Phone"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Subject
                  </label>
                  <input
                    {...register("subject")}
                    className={`input w-full ${errors.subject ? "border-error" : "border border-border"}  hover:border-border-light px-3 py-1 rounded-md`}
                    placeholder="Subject"
                  />
                  {errors.subject && (
                    <p className="text-error text-xs mt-1">
                      {errors.subject.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Message
                </label>
                <textarea
                  {...register("message")}
                  rows={4}
                  className={`input w-full min-h-[120px] ${errors.message ? "border-error" : "border border-border"}  hover:border-border-light px-3 py-1 rounded-md`}
                  placeholder="How can we help you?"
                />
                {errors.message && (
                  <p className="text-error text-xs mt-1">
                    {errors.message.message}
                  </p>
                )}
              </div>

              {submitStatus && (
                <div
                  className={`p-4 rounded-lg ${submitStatus.type === "success" ? "bg-success/20 text-success" : "bg-error/20 text-error"}`}
                >
                  {submitStatus.message}
                </div>
              )}

              <CustomButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </CustomButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
