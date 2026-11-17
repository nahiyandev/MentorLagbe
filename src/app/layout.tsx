import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "MentorLagbe — Smart Tuition & Mentorship Platform",
    template: "%s | MentorLagbe",
  },
  description:
    "Connect with verified tutors for subject-wise tuition batches and 1-on-1 mentorship, online or offline, tailored to your learning goals.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-sage-bg text-ink font-sans">
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              borderRadius: "12px",
              borderColor: "#DCE5DB",
            },
          }}
        />
      </body>
    </html>
  );
}
