import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Clock, MessageSquare, Flame, ShieldCheck } from "lucide-react";

// ContactPage
// Devotee & Purohit Support Desk: inquiry form + operational contact details
export const ContactPage: React.FC = () => {
  return (
    <div className="w-full text-stone-900">
      <section className="w-full pt-8 sm:pt-14 pb-10 sm:pb-12 px-4">
        <div className="container max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-red-700 text-white text-xs font-semibold tracking-wide uppercase shadow-sm">
            <Flame className="h-3.5 w-3.5 text-amber-300 fill-amber-300 animate-pulse" />
            <span>Devotee Support & Inquiries</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-serif text-stone-900 tracking-tight">
            Connect with Our Sacred Desk
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-stone-600 max-w-xl mx-auto leading-relaxed">
            Need guidance regarding an upcoming auspicious muhurat, ritual
            preparations, or priest onboarding? We are here to assist your
            family.
          </p>
        </div>
      </section>

      <section className="w-full py-10 sm:py-14 px-4 border-b border-stone-200">
        <div className="container max-w-5xl mx-auto flex flex-col gap-6">
          <div className="text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
              Direct Contact Desks
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Reach out to our specialized support desks for ceremonies,
              bookings, or priest onboarding.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-5 w-full">
            <Card className="border-2 border-stone-200 bg-white rounded-lg shadow-xs puja-card-lift flex-1 min-w-0 sm:min-w-70">
              <CardContent className="p-4 sm:p-5 flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-md bg-red-700 text-white flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-stone-900 font-serif">
                    Devotee Booking Helpline
                  </h4>
                  <p className="text-xs text-red-700 font-mono font-bold">
                    +91 98765 43210
                  </p>
                  <p className="text-[11px] text-stone-600 leading-snug">
                    Available 6:00 AM – 9:00 PM IST daily
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-stone-200 bg-white rounded-lg shadow-xs puja-card-lift flex-1 min-w-0 sm:min-w-70">
              <CardContent className="p-4 sm:p-5 flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-md bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-stone-900 font-serif">
                    WhatsApp Muhurat Desk
                  </h4>
                  <p className="text-xs text-emerald-700 font-mono font-bold">
                    +91 98765 43211
                  </p>
                  <p className="text-[11px] text-stone-600 leading-snug">
                    Quick text assistance for samagri lists & muhurat queries
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-stone-200 bg-white rounded-lg shadow-xs puja-card-lift flex-1 min-w-0 sm:min-w-70">
              <CardContent className="p-4 sm:p-5 flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-md bg-amber-500 text-stone-900 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-stone-900 font-serif">
                    Purohit Onboarding & Verification
                  </h4>
                  <p className="text-xs text-amber-800 font-bold">
                    purohits@pujacircle.com
                  </p>
                  <p className="text-[11px] text-stone-600 leading-snug">
                    Gurukul certifications and priest onboarding inquiries
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-stone-200 bg-white rounded-lg shadow-xs flex-1 min-w-0 sm:min-w-70">
              <CardContent className="p-4 sm:p-5 flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-md bg-stone-900 text-white flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-stone-900 font-serif">
                    Operational Timings
                  </h4>
                  <p className="text-xs text-stone-900 font-semibold">
                    Mon – Sun: 6:00 AM – 9:00 PM IST
                  </p>
                  <p className="text-[11px] text-stone-600 leading-snug">
                    Aligned with sacred morning Brahma Muhurat & Sandhya Kaal
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
