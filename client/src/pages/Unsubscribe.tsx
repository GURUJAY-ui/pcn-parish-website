/**
 * Unsubscribe.tsx — public landing page for the tokenized
 * unsubscribe link sent in every newsletter email. Calls the API once
 * on mount and shows the result. No login required.
 */

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { useGlassTheme, SERIF } from "@/lib/glass";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { api } from "@/lib/api";

export default function Unsubscribe() {
  const t = useGlassTheme();
  const [status, setStatus] = useState<"loading" | "done" | "already" | "error">("loading");
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token") ?? "";
    if (!token) {
      setStatus("error");
      setError("This unsubscribe link is missing a token.");
      return;
    }
    api
      .unsubscribeNewsletter(token)
      .then((r) => {
        setEmail(r.email ?? null);
        setStatus(r.message?.toLowerCase().includes("already") ? "already" : "done");
      })
      .catch((err) => {
        setStatus("error");
        setError(err?.message ?? "This link is invalid or has expired.");
      });
  }, []);

  return (
    <div className={`page-shell min-h-screen ${t.pageBg} ${t.ink}`}>
      <SiteNav />
      <section className={`relative ${t.pageBg} pt-36 md:pt-44 pb-24 px-6`}>
        <div className={`absolute inset-0 ${t.radial}`} />
        <div className="relative max-w-xl mx-auto">
          <div className={`${t.glass} rounded-3xl p-10 text-center`}>
            {status === "loading" && (
              <>
                <Loader2 className={`w-10 h-10 mx-auto mb-4 ${t.ink40} animate-spin`} />
                <p className={`${t.ink50} text-sm`}>Updating your preferences…</p>
              </>
            )}

            {status === "done" && (
              <>
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-emerald-500" />
                <h1 style={SERIF} className={`text-3xl md:text-4xl ${t.ink} tracking-tight mb-3`}>
                  You've been <em className={t.em}>unsubscribed.</em>
                </h1>
                {email && (
                  <p className={`${t.ink50} text-sm mb-2`}>{email} will no longer receive our weekly bulletin.</p>
                )}
                <p className={`${t.ink50} text-sm`}>You're always welcome to rejoin from the homepage. Grace and peace.</p>
              </>
            )}

            {status === "already" && (
              <>
                <CheckCircle2 className={`w-12 h-12 mx-auto mb-4 ${t.ink40}`} />
                <h1 style={SERIF} className={`text-3xl md:text-4xl ${t.ink} tracking-tight mb-3`}>
                  You're already <em className={t.em}>unsubscribed.</em>
                </h1>
                {email && <p className={`${t.ink50} text-sm`}>No further bulletins will be sent to {email}.</p>}
              </>
            )}

            {status === "error" && (
              <>
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <h1 style={SERIF} className={`text-3xl md:text-4xl ${t.ink} tracking-tight mb-3`}>
                  We couldn't process <em className={t.em}>this link.</em>
                </h1>
                <p className={`${t.ink50} text-sm mb-4`}>{error}</p>
                <p className={`${t.ink40} text-xs`}>If you'd like to opt out, reply to any bulletin from <span className={t.ink60}>pulpitfap@gmail.com</span> and we'll remove you manually.</p>
              </>
            )}

            <a href="/" className={`mt-8 inline-flex items-center gap-2 ${t.btnPrimary} rounded-full px-6 py-2.5 text-sm font-medium`}>
              Return home <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
