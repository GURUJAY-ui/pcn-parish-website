import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({
  content,
}: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-4xl font-bold mt-10 mb-6">{children}</h1>
        ),

        h2: ({ children }) => (
          <h2 className="text-2xl font-semibold mt-8 mb-4">{children}</h2>
        ),

        h3: ({ children }) => (
          <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>
        ),

        p: ({ children }) => (
          <p className="leading-8 text-muted-foreground mb-5">
            {children}
          </p>
        ),

        ul: ({ children }) => (
          <ul className="list-disc pl-6 mb-5 space-y-2">{children}</ul>
        ),

        ol: ({ children }) => (
          <ol className="list-decimal pl-6 mb-5 space-y-2">{children}</ol>
        ),

        li: ({ children }) => <li>{children}</li>,

        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">
            {children}
          </strong>
        ),

        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1a3a6b] dark:text-[#d4af37] underline"
          >
            {children}
          </a>
        ),

        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-[#d4af37] pl-4 italic my-6">
            {children}
          </blockquote>
        ),

        hr: () => <hr className="my-10 border-white/10" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}