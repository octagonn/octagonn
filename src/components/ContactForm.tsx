
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, Clock, MapPin } from "lucide-react";

export const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Using FormSubmit.co service as specified in the original site
      const response = await fetch("https://formsubmit.co/spydernetit@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          _subject: "New message from SpyderNet IT website",
          _captcha: "false"
        }),
      });

      if (response.ok) {
        toast({
          title: "Message Sent!",
          description: "Thank you for reaching out. We'll get back to you soon.",
        });
        setFormData({ name: "", email: "", message: "" });
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try calling us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contact-form" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Call, Text, or Message Below to Schedule Your Service
          </h2>
          <p className="text-xl text-gray-600">
            Get in touch for a free consultation or same-day service
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Send a Quick Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="mt-1"
                  rows={4}
                  placeholder="Describe your tech issue or what you need help with..."
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
              >
                {isSubmitting ? "Sending..." : "Send a Quick Message"}
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-blue-600 text-white rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-4">Need Help or Have a Question?</h3>
              <p className="mb-6 text-blue-100">
                Need help choosing the right service or troubleshooting a tech issue? 
                Reach out and we'll respond ASAP!
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-yellow-400" />
                  <span>spydernetit@gmail.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-yellow-400" />
                  <span>(949) 237-2612</span>
                </div>
              </div>
              
              <p className="mt-6 text-sm text-blue-200">
                Your info is safe with us — we never spam.
              </p>
            </div>

            {/* Business Hours & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <Clock className="h-6 w-6 text-blue-600 mr-2" />
                  <h4 className="font-bold text-gray-800">Business Hours</h4>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Mon-Fri: 10AM–6PM</div>
                  <div>Saturday: 11:30AM–4PM</div>
                  <div>Sunday: 11:30AM–4PM</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <MapPin className="h-6 w-6 text-blue-600 mr-2" />
                  <h4 className="font-bold text-gray-800">Service Area</h4>
                </div>
                <div className="text-sm text-gray-600">
                  <div>Orange County, CA</div>
                  <div>& Surrounding Areas</div>
                  <div className="mt-2 text-blue-600 font-medium">Remote support nationwide</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
