import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ChevronRight } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import ReactMarkdown from "react-markdown";

export default function TermsOfService() {
  const { theme } = useTheme();
  const [, navigate] = useLocation();
  const [content, setContent] = useState("");

  useEffect(() => {
    const staticContent = `
# Terms of Service for Presbyterian Church of Nigeria, First Abuja Parish

**Effective Date: May 15, 2026**  
**Last Updated: May 15, 2026**

---

## 1. Introduction

Welcome to the official website and digital platforms of the Presbyterian Church of Nigeria, First Abuja Parish ("PCN FAP", "Church", "we", "us", or "our").

These Terms of Service ("Terms") govern your access to and use of:

- Our official website;
- Online donation platforms;
- Livestream services;
- Prayer request submissions;
- Sermon streaming and downloads;
- Event registrations;
- Volunteer registration systems;
- Communication platforms;
- Digital forms;
- Social media interactions linked to our ministry;
- Any other digital services operated by PCN FAP.

By accessing or using our services, you agree to comply with these Terms.

If you do not agree with these Terms, you should discontinue use of our services immediately.

---

## 2. About the Church

Presbyterian Church of Nigeria, First Abuja Parish is a religious and non-profit Christian organization operating under the Presbyterian Church of Nigeria.

### Contact Information

**Address:**  
No. 5 Boke Close, off Sakono Street, Opposite AP Plaza, Wuse II, Abuja, Nigeria

**Email:**  
pulpitfap@gmail.com

**Phone:**  
+234 (0) 8151111877

---

## 3. Eligibility to Use Our Services

By using this website or any related service, you confirm that:

- You are legally capable of entering into binding agreements;
- You will use the services lawfully and responsibly;
- You will not misuse church platforms;
- You will not attempt unauthorized access to church systems;
- Any information you provide is accurate and truthful.

If you are under 18 years old, parental or guardian supervision may be required for certain activities.

---

## 4. Spiritual and Religious Nature of Services

PCN FAP is a Christian religious organization.

The content made available through our platforms may include:

- Biblical teachings;
- Sermons;
- Christian counseling guidance;
- Prayer sessions;
- Worship broadcasts;
- Religious materials;
- Ministry communications.

Participation in spiritual activities through our website is voluntary.

Nothing on this website constitutes medical, psychological, financial, or legal advice.

Users should seek qualified professionals where necessary.

---

## 5. User Conduct and Acceptable Use

You agree NOT to:

- Use the website for unlawful purposes;
- Harass, abuse, threaten, or defame others;
- Submit false or misleading information;
- Upload malicious software or harmful code;
- Attempt to compromise website security;
- Use church platforms for fraud or scams;
- Post offensive, obscene, hateful, discriminatory, or anti-Christian content;
- Violate intellectual property rights;
- Impersonate church officials, ministers, staff, or members;
- Interfere with livestreams or church systems;
- Collect personal data of members without authorization;
- Use automated bots or scraping systems without consent.

We reserve the right to suspend or permanently restrict access for violations.

---

## 6. Donations and Financial Contributions

### 6.1 Voluntary Donations

All donations made through our platforms are voluntary.

Donations may include:

- Tithes;
- Offerings;
- Thanksgiving seeds;
- Welfare support;
- Building projects;
- Mission support;
- Event sponsorships;
- Charity contributions.

### 6.2 Payment Processing

Payments may be processed through third-party providers.

We do not store full debit or credit card details on our systems unless expressly stated.

Users are responsible for ensuring payment information is accurate.

### 6.3 Refund Policy

Donations are generally non-refundable except:

- Duplicate transactions;
- Technical processing errors;
- Unauthorized transactions verified by investigation.

Refund requests may require identity verification.

### 6.4 Fraud Prevention

We reserve the right to:

- Review suspicious donations;
- Delay processing;
- Reject transactions;
- Cooperate with law enforcement;
- Request verification documents.

---

## 7. Prayer Requests and Testimonies

### 7.1 Prayer Requests

Users may voluntarily submit prayer requests.

Prayer requests may contain sensitive personal information, including:

- Health conditions;
- Family matters;
- Emotional concerns;
- Financial difficulties;
- Spiritual concerns.

By submitting a prayer request, you consent to processing necessary for ministry purposes.

Anonymous submissions are permitted where available.

### 7.2 Testimonies

By submitting testimonies, you:

- Confirm the testimony is truthful;
- Grant the church permission to review and publish approved testimonies;
- Understand testimonies may be edited for clarity, safety, or length.

We reserve the right not to publish any testimony.

---

## 8. Livestreams, Media, and Recorded Services

Church services, conferences, and events may be:

- Livestreamed;
- Recorded;
- Photographed;
- Broadcast online.

By attending physical or virtual events, you acknowledge that your image, voice, or likeness may appear in church media.

Where required by law, additional consent mechanisms may apply.

Users may not:

- Re-upload church broadcasts without permission;
- Manipulate church media deceptively;
- Remove ownership notices;
- Use church content commercially without authorization.

---

## 9. Intellectual Property Rights

Unless otherwise stated, all website content belongs to PCN FAP or its licensors.

Protected materials include:

- Logos;
- Sermons;
- Audio recordings;
- Videos;
- Graphics;
- Church publications;
- Articles;
- Branding;
- Website design;
- Ministry resources.

Users may:

- Access materials for personal spiritual use;
- Share official links;
- Quote short excerpts with attribution.

Users may NOT:

- Sell church materials;
- Modify copyrighted content without permission;
- Use church branding deceptively;
- Create fake ministry pages;
- Republish entire sermons commercially.

---

## 10. Data Protection and Privacy

PCN FAP processes personal data in accordance with:

- The Nigeria Data Protection Act (NDPA) 2023;
- Applicable Nigerian regulations;
- NDPC compliance requirements.

Our Privacy Policy explains:

- What data we collect;
- Why we collect it;
- Legal bases for processing;
- Data retention practices;
- User rights;
- Security safeguards.

By using our services, you acknowledge our Privacy Policy.

---

## 11. Sensitive Personal Data

As a religious organization, we may process sensitive personal data voluntarily provided by users, including:

- Religious beliefs;
- Prayer-related health information;
- Counseling-related information;
- Family-related concerns.

Such processing shall only occur:

- With consent;
- Where necessary for legitimate religious activities;
- In compliance with NDPA 2023.

Sensitive data shall receive enhanced protection measures.

---

## 12. Children's Privacy and Safeguarding

PCN FAP is committed to child protection and safeguarding.

Parents or guardians should supervise minors using our services.

We do not knowingly collect children's personal data unlawfully.

Where children's information is collected:

- Appropriate consent mechanisms may apply;
- Safeguarding controls will be implemented;
- Access will be restricted;
- Data minimization principles will apply.

Any safeguarding concerns should be reported immediately to the church.

---

## 13. User Accounts and Communications

Where user accounts, registrations, or subscriptions exist:

Users are responsible for:

- Maintaining password confidentiality;
- Securing their devices;
- Updating account information;
- Preventing unauthorized access.

We may send:

- Ministry updates;
- Event notices;
- Prayer communications;
- Donation acknowledgements;
- Administrative notices.

Users may opt out of non-essential communications.

---

## 14. Third-Party Services and Links

Our website may contain links to third-party platforms, including:

- YouTube;
- Facebook;
- Instagram;
- TikTok;
- Payment gateways;
- External ministry resources.

We are not responsible for:

- Third-party privacy practices;
- External platform policies;
- Third-party security failures;
- Content hosted externally.

Users should review external platform policies independently.

---

## 15. Cookies and Website Analytics

We may use:

- Cookies;
- Analytics tools;
- Security monitoring systems;
- Performance tracking technologies.

These technologies help us:

- Improve website performance;
- Understand usage patterns;
- Enhance security;
- Detect abuse.

Users may adjust browser settings to manage cookies.

---

## 16. Security Measures

We implement reasonable technical and organizational safeguards, including:

- Access controls;
- Authentication protections;
- Secure hosting measures;
- Monitoring systems;
- Encryption where applicable;
- Administrative controls.

However, no system is completely secure.

Users acknowledge internet-related security risks.

---

## 17. Limitation of Liability

To the maximum extent permitted by law, PCN FAP shall not be liable for:

- Indirect damages;
- Consequential losses;
- Service interruptions;
- Third-party failures;
- Data loss caused by user negligence;
- Unauthorized access caused by compromised user devices;
- Technical outages beyond our control.

Nothing in these Terms excludes liabilities that cannot legally be excluded under Nigerian law.

---

## 18. Indemnification

You agree to indemnify and hold harmless PCN FAP, its ministers, staff, volunteers, and representatives against claims arising from:

- Your misuse of the platform;
- Violation of these Terms;
- Illegal activities conducted through your access;
- Infringement of third-party rights.

---

## 19. Suspension and Termination

We reserve the right to:

- Restrict access;
- Remove content;
- Suspend accounts;
- Block users;
- Report unlawful conduct.

This may occur without prior notice where necessary.

---

## 20. Reporting Abuse or Violations

Users may report:

- Fraud;
- Harassment;
- Safeguarding concerns;
- Unauthorized use of church materials;
- Security vulnerabilities;
- Data protection complaints.

Reports may be submitted through official church channels.

---

## 21. Governing Law and Jurisdiction

These Terms shall be governed by the laws of the Federal Republic of Nigeria.

Disputes arising from these Terms shall fall under the jurisdiction of competent Nigerian courts.

---

## 22. Regulatory Compliance

PCN FAP aims to comply with applicable:

- Nigeria Data Protection Act 2023;
- NDPC directives;
- Cybersecurity obligations;
- Child safeguarding obligations;
- Anti-fraud obligations;
- Financial compliance obligations applicable to religious organizations.

---

## 23. Changes to These Terms

We may update these Terms periodically.

Updated versions will:

- Be posted on this page;
- Reflect updated effective dates;
- Become effective upon publication unless otherwise stated.

Continued use of our services constitutes acceptance of revised Terms.

---

## 24. Contact Information

For legal, compliance, safeguarding, or data protection concerns, contact:

### Presbyterian Church of Nigeria, First Abuja Parish

**Address:**  
No. 5 Boke Close, off Sakono Street, Opposite AP Plaza, Wuse II, Abuja, Nigeria

**Email:**  
pulpitfap@gmail.com

**Phone:**  
+234 (0) 8151111877

---

## 25. NDPA Data Subject Rights Notice

Under the Nigeria Data Protection Act 2023, users may have rights including:

- Right to access personal data;
- Right to rectification;
- Right to erasure;
- Right to restrict processing;
- Right to object;
- Right to data portability;
- Right to lodge complaints.

Requests may be submitted through official church contact channels.

---

## 26. Entire Agreement

These Terms, together with our Privacy Policy and Safeguarding Policy, constitute the entire agreement between users and PCN FAP regarding use of our digital services.

---

# References

1. Nigeria Data Protection Act (NDPA), 2023
2. Nigerian Data Protection Commission (NDPC) Guidance
3. Internal Church Digital Governance Policies
4. Church Safeguarding and Child Protection Standards
`;

    setContent(staticContent);
  }, []);

  return (
    <div
      className={`themed-page min-h-screen ${
        theme === "light"
          ? "themed-page--light bg-background text-foreground"
          : "themed-page--dark bg-background text-foreground"
      }`}
    >
      <div className="relative overflow-hidden py-28 border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-background to-cyan-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />

        <div className="container relative">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <button
              onClick={() => navigate("/")}
              className="hover:text-foreground transition-colors"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">Terms of Service</span>
          </div>

          <div className="max-w-3xl space-y-4">
            <h1
              style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
              className="text-5xl md:text-6xl font-bold"
            >
              Terms of Service
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed">
              These terms govern the use of the official digital platforms,
              services, media, donations, and communications of Presbyterian
              Church of Nigeria, First Abuja Parish.
            </p>
          </div>
        </div>
      </div>

      <div className="container py-16">
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}