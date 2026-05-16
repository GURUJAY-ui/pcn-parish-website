import { useEffect, useState } from "react";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import MarkdownRenderer from "@/components/legal/MarkdownRenderer";
import { loadLegalMarkdown } from "@/services/legal/legalContent";

export default function SafeguardingPolicy() {
  const [content, setContent] = useState("");

  useEffect(() => {
    async function fetchContent() {
      try {
        const markdown = await loadLegalMarkdown(
          "/src/content/legal/safeguarding.md"
        );

        setContent(markdown);
      } catch (error) {
        console.error("Failed to load safeguarding policy:", error);
      }
    }

    fetchContent();
  }, []);

  return (
    <LegalPageLayout
      title="Safeguarding Policy"
      description="Our safeguarding framework for protecting children, vulnerable individuals, church members, volunteers, and online ministry participants."
    >
      <MarkdownRenderer content={content} />
    </LegalPageLayout>
  );
}