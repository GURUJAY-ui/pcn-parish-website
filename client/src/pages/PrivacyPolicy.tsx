import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ChevronRight } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { api } from "@/lib/api";

export default function PrivacyPolicy() {
  const { theme } = useTheme();
  const [, navigate] = useLocation();
  const [content, setContent] = useState("");

  useEffect(() => {
    // In a real application, you might fetch this from a CMS or API
    // For now, we'll use a placeholder or load from a static markdown file
    const staticContent = `
# Privacy Policy for Presbyterian Church of Nigeria, First Abuja Parish

**Effective Date: May 15, 2026**

## 1. Introduction

The Presbyterian Church of Nigeria, First Abuja Parish ("PCN FAP", "we", "us", or "our") is committed to protecting the privacy and personal data of our members, visitors, and website users. This Privacy Policy outlines how we collect, use, disclose, and protect your personal data in compliance with the Nigerian Data Protection Act (NDPA) 2023 [1] and other applicable data protection laws.

We recognize the sensitive nature of personal data, especially within a religious context, and are dedicated to upholding the trust placed in us. This policy applies to all personal data processed by PCN FAP through our website and related services.

## 2. Data Controller Information

The Presbyterian Church of Nigeria, First Abuja Parish is the data controller responsible for the processing of your personal data. 

**Contact Details:**
*   **Address:** No. 5 Boke Close, off Sakono Street, Opposite AP Plaza, Wuse II, Abuja, Nigeria
*   **Email:** pulpitfap@gmail.com
*   **Phone:** +234 (0) 8151111877

## 3. Types of Personal Data Collected

We collect various types of personal data depending on your interaction with our website and services. This may include:

*   **Contact Information:** Name, email address, phone number, subject, and message content when you use our general contact form.
*   **Prayer Request Information:** Name, email address (optional), and prayer request content when you submit a prayer request. You have the option to submit prayer requests anonymously.
*   **Donation Information:** Donor name (optional), donor email (optional), amount, donation category, message (optional), and payment reference when you make a donation. You have the option to donate anonymously.
*   **Website Usage Data:** Information about how you use our website, such as IP address, browser type, operating system, pages viewed, and time spent on pages. This data is collected through cookies and similar technologies.
*   **Sensitive Personal Data:** In the context of prayer requests or testimonies (if submitted via contact forms), you may voluntarily provide sensitive personal data such as health status or religious beliefs. We process such data only with your explicit consent or as otherwise permitted by law.

## 4. How Data is Collected

We collect personal data through the following methods:

*   **Directly from you:** When you fill out forms on our website (e.g., contact forms, prayer request forms, donation forms).
*   **Automatically:** Through website technologies such as cookies and analytics tools that collect usage data.

## 5. Purpose of Data Collection

We collect and process your personal data for the following purposes:

*   **To respond to inquiries:** To address your questions, comments, and requests submitted via our contact forms.
*   **To process prayer requests:** To receive and process your prayer requests, including anonymous submissions, and share them with our prayer team for intercession.
*   **To process donations:** To facilitate and acknowledge your financial contributions to the church, including processing anonymous donations.
*   **To improve our website:** To understand how our website is used, identify areas for improvement, and enhance user experience.
*   **To comply with legal obligations:** To meet regulatory and legal requirements under the NDPA 2023 and other applicable laws.

## 6. Legal Basis for Processing

Our legal basis for processing your personal data includes:

*   **Consent:** Where you have given explicit consent for specific processing activities, such as submitting a prayer request or providing personal details for a donation.
*   **Legitimate Interests:** Processing necessary for our legitimate interests as a religious organization, such as maintaining communication, improving our services, and ensuring website security, provided these interests do not override your fundamental rights and freedoms.
*   **Legal Obligation:** Processing necessary to comply with a legal obligation, such as record-keeping requirements or responding to lawful requests from authorities.

## 7. Data Sharing and Disclosure

We do not sell, rent, or trade your personal data to third parties. We may share your data in the following limited circumstances:

*   **With Service Providers:** We may engage third-party service providers to perform functions on our behalf, such as website hosting, analytics, or payment processing. These providers are contractually obligated to protect your data and use it only for the purposes for which it was disclosed.
*   **With Church Staff/Volunteers:** Prayer requests may be shared with our dedicated prayer team for intercession. Anonymous prayer requests will be handled without identifying information.
*   **Legal Requirements:** We may disclose your personal data if required to do so by law or in response to valid requests by public authorities.

## 8. Data Retention

We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, including for the purposes of satisfying any legal, accounting, or reporting requirements. To determine the appropriate retention period, we consider the amount, nature, and sensitivity of the personal data, the potential risk of harm from unauthorized use or disclosure of your personal data, the purposes for which we process your personal data and whether we can achieve those purposes through other means, and the applicable legal requirements.

## 9. Data Security

We implement appropriate technical and organizational measures to protect your personal data from unauthorized access, disclosure, alteration, or destruction. These measures include encryption, access controls, and secure data storage. We regularly review our security practices to ensure they remain robust.

## 10. Your Data Protection Rights

Under the NDPA 2023, you have the following rights regarding your personal data:

*   **Right to be informed:** To be informed about the collection and use of your personal data.
*   **Right of access:** To request access to your personal data.
*   **Right to rectification:** To request that inaccurate or incomplete personal data be corrected.
*   **Right to erasure (Right to be forgotten):** To request the deletion of your personal data under certain conditions.
*   **Right to restrict processing:** To request the restriction of processing of your personal data under certain conditions.
*   **Right to data portability:** To receive your personal data in a structured, commonly used, and machine-readable format.
*   **Right to object:** To object to the processing of your personal data under certain conditions.
*   **Rights in relation to automated decision-making and profiling:** To not be subject to a decision based solely on automated processing, including profiling, which produces legal effects concerning you or similarly significantly affects you.

To exercise any of these rights, please contact us using the details provided in Section 2.

## 11. Changes to this Privacy Policy

We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any significant changes by posting the new policy on our website with a revised effective date.

## 12. Contact Us

If you have any questions or concerns about this Privacy Policy or our data protection practices, please contact us at:

**Email:** pulpitfap@gmail.com
**Phone:** +234 (0) 8151111877

---

## References

[1] Nigeria Data Protection Act, 2023 (https://ndpc.gov.ng/download/nigeria-data-protection-act-2023)
[2] Contact Form Data (Internal Reference)
[3] Donation Form Data (Internal Reference)
    `;
    `;
    setContent(staticContent);
  }, []);

  return (
    <div className={`themed-page min-h-screen ${theme === "light" ? "themed-page--light bg-background text-foreground" : "themed-page--dark bg-background text-foreground"}`}>
      <div className="relative overflow-hidden py-28 border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-background to-pink-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
        <div className="container relative">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">Home</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">Privacy Policy</span>
          </div>
          <div className="max-w-3xl space-y-4">
            <h1 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-5xl md:text-6xl font-bold">Privacy Policy</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Your privacy is important to us. This policy explains how we handle your personal data.
            </p>
          </div>
        </div>
      </div>

      <div className="container py-16">
        <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
}
