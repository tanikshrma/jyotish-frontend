import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, Clock, MapPin, SunMedium, Send } from "lucide-react";
import { FinalCTA } from "@/components/FinalCTA";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";

import { useState } from "react";
import { submitProspectIQLead } from "@/lib/prospectiq";
import { PhoneInput } from "@/components/PhoneInput";
import { DEFAULT_COUNTRY_ISO, toE164, validateEmail, validatePhone } from "@/lib/validation";
import { TrackingFields } from "@/components/TrackingFields";
import { submitWhenValid } from "@/lib/tracking";
import { toast } from "sonner";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [countryIso, setCountryIso] = useState(DEFAULT_COUNTRY_ISO);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const phoneError = validatePhone(formData.phone, countryIso);
    if (phoneError) newErrors.phone = phoneError;

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    submitProspectIQLead({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: toE164(formData.phone, countryIso),
      message: `${formData.subject}: ${formData.message}`,
      tags: ["Contact Us Form", "Website Inquiry"],
    });

    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Message Sent Successfully!");
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setErrors({});
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] relative flex flex-col">
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" 
        style={{ 
          backgroundSize: '400px', 
          backgroundRepeat: 'repeat' 
        }}
      ></div>
      
      <SEO 
        title="Contact Us - JyotishNow" 
        description="Get in touch with JyotishNow. We are here to help you with astrology consultations, Kundli reports, and Vastu guidance."
      />
      <Header />
      
      <main className="flex-grow relative z-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-primary text-primary-foreground min-h-[100svh] flex items-center pt-24 pb-14">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[url('https://vibe.filesafe.space/1782888190245745251/attachments/0b551228-bf58-412a-a726-e8a1404b9733.png')] bg-cover bg-[position:80%_center] md:bg-right"></div>
            {/* Linear Gradient Overlay */}
            <div 
              className="absolute inset-0" 
              style={{ 
                background: 'linear-gradient(to right, #780808 0%, rgba(120, 8, 8, 0.8) 30%, rgba(120, 8, 8, 0.6) 50%, rgba(120, 8, 8, 0.3) 75%, transparent 100%)' 
              }}
            ></div>
            {/* Radial Glow */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle at 35% 50%, rgba(120, 8, 8, 0.5) 0%, transparent 60%)'
              }}
            ></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10 max-w-[1300px]">
            <div className="flex flex-col items-start justify-center text-left max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm font-semibold mb-8 backdrop-blur-sm shadow-[0_4px_10px_-2px_rgba(0,0,0,0.1)] pt-[10px] pb-[10px] pl-[15px] pr-[15px] rounded-md"
              >
                <SunMedium className="lucide lucide-star fill-white text-white w-[18px] h-[17px]" />
                <span className="font-light">Get in Touch</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-serif leading-tight mb-6 text-white"
              >
                Contact <span className="text-secondary">Us</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-white/90 mb-8 max-w-xl leading-relaxed"
              >
                Have questions or need guidance? We are here to help you navigate your life's journey with Vedic wisdom.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto"
              >
                <Button size="lg" className="bg-white hover:bg-white/90 text-black text-lg px-8 h-14 shadow-[0_8px_20px_-6px_rgba(255,255,255,0.3)] transition-all duration-300 ease-out hover:-translate-y-1 w-full sm:w-auto" onClick={() => {
                  const contactSection = document.getElementById('contact-section');
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}>
                  Send a Message
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact Content */}
        <section id="contact-section" className="py-20 relative z-10">
          <div className="container mx-auto px-4 max-w-[1300px]">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              
              {/* Contact Info */}
              <div className="space-y-10">
                <div>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">Get in Touch</h2>
                  <p className="text-foreground/80 leading-relaxed text-lg">
                    Whether you have a question about our services, need to book a consultation, or require support, our team is ready to answer all your questions.
                  </p>
                </div>
                
                <div className="grid gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-primary/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg hover:border-secondary/50 transition-all flex items-start gap-5">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/10 to-secondary/20 flex items-center justify-center shrink-0 border border-secondary/30">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xl font-serif font-bold text-primary mb-1">Phone</h4>
                      <p className="text-foreground/80 font-medium text-lg">+91-7015544187</p>
                      <p className="text-sm text-foreground/60 mt-1">Mon-Sat from 10am to 7pm.</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-6 border border-primary/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg hover:border-secondary/50 transition-all flex items-start gap-5">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/10 to-secondary/20 flex items-center justify-center shrink-0 border border-secondary/30">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xl font-serif font-bold text-primary mb-1">Email</h4>
                      <p className="text-foreground/80 font-medium text-lg">myjyotishnow@gmail.com</p>
                      <p className="text-sm text-foreground/60 mt-1">We'll respond within 24 hours.</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-primary/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg hover:border-secondary/50 transition-all flex items-start gap-5">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/10 to-secondary/20 flex items-center justify-center shrink-0 border border-secondary/30">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xl font-serif font-bold text-primary mb-1">Business Hours</h4>
                      <p className="text-foreground/80 font-medium text-lg">Monday - Saturday: 10:00 AM - 7:00 PM</p>
                      <p className="text-sm text-foreground/60 mt-1">Sunday: Closed</p>
                    </div>
                  </div>
                </div>

                <div className="relative w-full h-[300px] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-primary/20">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224345.83923192776!2d77.06889754725782!3d28.52728034389636!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x52c2b7494e204dce!2sNew%20Delhi%2C%20Delhi%2C%20India!5e0!3m2!1sen!2sus!4v1709664421111!5m2!1sen!2sus" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen={true} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full"
                  ></iframe>
                </div>
              </div>
              
              {/* Contact Form */}
              {/* Contact Form */}
              <div className="bg-[#FFFDF9] rounded-3xl p-8 md:p-10 shadow-[0_8px_40px_rgba(122,8,8,0.08)] border border-secondary/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-primary"></div>
                {/* Decorative corners */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-contain bg-no-repeat opacity-20"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-contain bg-no-repeat opacity-20 rotate-180"></div>
                
                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-serif font-bold text-primary mb-3">Send us a Message</h3>
                    <p className="text-foreground/70 text-lg">Fill out the form below and we'll get back to you shortly.</p>
                  </div>
                  
                  <form id="jn-contact-us" name="jn-contact-us" className="space-y-6" onSubmit={handleSubmit} noValidate>
                    <TrackingFields
                      formId="jn-contact-us"
                      lead={{
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        phone: formData.phone ? toE164(formData.phone, countryIso) : "",
                        message: [formData.subject, formData.message].filter(Boolean).join(": "),
                      }}
                    />
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2 relative group">
                        <label htmlFor="firstName" className="text-xs font-bold text-foreground/60 uppercase tracking-widest group-focus-within:text-secondary transition-colors">First Name</label>
                        <Input id="firstName" value={formData.firstName} onChange={e => { setFormData({...formData, firstName: e.target.value}); if(errors.firstName) setErrors({...errors, firstName: ''}); }} className={`h-14 px-4 rounded-xl border bg-white text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-secondary/20 focus-visible:border-secondary transition-all text-lg ${errors.firstName ? 'border-red-500' : 'border-border/50 hover:border-secondary/50'}`} placeholder="Enter first name" />
                        {errors.firstName && <span className="text-xs text-red-600 font-medium mt-1 block">{errors.firstName}</span>}
                      </div>
                      <div className="space-y-2 relative group">
                        <label htmlFor="lastName" className="text-xs font-bold text-foreground/60 uppercase tracking-widest group-focus-within:text-secondary transition-colors">Last Name</label>
                        <Input id="lastName" value={formData.lastName} onChange={e => { setFormData({...formData, lastName: e.target.value}); if(errors.lastName) setErrors({...errors, lastName: ''}); }} className={`h-14 px-4 rounded-xl border bg-white text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-secondary/20 focus-visible:border-secondary transition-all text-lg ${errors.lastName ? 'border-red-500' : 'border-border/50 hover:border-secondary/50'}`} placeholder="Enter last name" />
                        {errors.lastName && <span className="text-xs text-red-600 font-medium mt-1 block">{errors.lastName}</span>}
                      </div>
                    </div>
                    
                    <div className="space-y-2 relative group">
                      <label htmlFor="email" className="text-xs font-bold text-foreground/60 uppercase tracking-widest group-focus-within:text-secondary transition-colors">Email Address</label>
                      <Input id="email" type="email" value={formData.email} onChange={e => { setFormData({...formData, email: e.target.value}); if(errors.email) setErrors({...errors, email: ''}); }} className={`h-14 px-4 rounded-xl border bg-white text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-secondary/20 focus-visible:border-secondary transition-all text-lg ${errors.email ? 'border-red-500' : 'border-border/50 hover:border-secondary/50'}`} placeholder="Enter email address" />
                      {errors.email && <span className="text-xs text-red-600 font-medium mt-1 block">{errors.email}</span>}
                    </div>
                    
                    <div className="space-y-2 relative group">
                      <label htmlFor="phone" className="text-xs font-bold text-foreground/60 uppercase tracking-widest group-focus-within:text-secondary transition-colors">Phone Number</label>
                      <PhoneInput
                        id="phone"
                        value={formData.phone}
                        onChange={(v) => { setFormData(prev => ({ ...prev, phone: v })); if (errors.phone) setErrors(prev => ({ ...prev, phone: '' })); }}
                        countryIso={countryIso}
                        onCountryChange={setCountryIso}
                        error={errors.phone}
                        className="h-14 px-4 text-lg"
                      />
                    </div>
                    
                    <div className="space-y-2 relative group">
                      <label htmlFor="subject" className="text-xs font-bold text-foreground/60 uppercase tracking-widest group-focus-within:text-secondary transition-colors">Subject</label>
                      <Input id="subject" value={formData.subject} onChange={e => { setFormData({...formData, subject: e.target.value}); if(errors.subject) setErrors({...errors, subject: ''}); }} className={`h-14 px-4 rounded-xl border bg-white text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-secondary/20 focus-visible:border-secondary transition-all text-lg ${errors.subject ? 'border-red-500' : 'border-border/50 hover:border-secondary/50'}`} placeholder="What is this regarding?" />
                      {errors.subject && <span className="text-xs text-red-600 font-medium mt-1 block">{errors.subject}</span>}
                    </div>
                    
                    <div className="space-y-2 relative group">
                      <label htmlFor="message" className="text-xs font-bold text-foreground/60 uppercase tracking-widest group-focus-within:text-secondary transition-colors">Message</label>
                      <Textarea 
                        id="message" 
                        value={formData.message} 
                        onChange={e => { setFormData({...formData, message: e.target.value}); if(errors.message) setErrors({...errors, message: ''}); }}
                        className={`min-h-[150px] px-4 pt-4 rounded-xl border bg-white text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-secondary/20 focus-visible:border-secondary transition-all text-lg resize-y ${errors.message ? 'border-red-500' : 'border-border/50 hover:border-secondary/50'}`}
                        placeholder="How can we help you?"
                      />
                      {errors.message && <span className="text-xs text-red-600 font-medium mt-1 block">{errors.message}</span>}
                    </div>
                    
                    <Button type="button" onClick={submitWhenValid(validateForm)} disabled={isSubmitting} className="w-full h-14 bg-gradient-to-r from-primary to-primary/90 hover:opacity-90 text-white rounded-xl text-lg font-bold shadow-[0_8px_20px_-6px_rgba(122,8,8,0.4)] transition-all duration-300 ease-out hover:-translate-y-1 relative overflow-hidden group mt-4">
                      <span className="relative z-10 flex items-center justify-center">
                        {isSubmitting ? "Sending..." : "Send Message"} <Send className="ml-2 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                    </Button>
                  </form>
                </div>
              </div>

            </div>
          </div>
        </section>

        <FinalCTA 
          title="Ready to Transform Your Life?"
          description="Book a consultation today and unlock the doors to health, wealth, and prosperity with expert guidance."
          primaryBtnText="Book Consultation Now"
          primaryBtnLink="/get-consultation"
        />
      </main>
      
      <Footer />
    </div>
  );
}
