import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "./MarkdownRenderer.css";
function CodeBlock({ children, className, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "";
    const codeText = String(children).replace(/\n$/, "");
    if (!className && !codeText.includes("\n")) {
        return <code className="md-inline-code" {...props}>{children}</code>;
    }
    const handleCopy = () => {
        navigator.clipboard.writeText(codeText);
        const btn = document.activeElement;
        if (btn) {
            btn.textContent = "Copied!";
            setTimeout(() => { btn.textContent = "Copy"; }, 2000);
        }
    };
    return (
        <div className="md-code-block">
            <div className="md-code-header">
                <span className="md-code-lang">{language || "code"}</span>
                <button className="md-copy-btn" onClick={handleCopy} type="button">Copy</button>
            </div>
            <pre className={className}>
                <code className={className} {...props}>{children}</code>
            </pre>
        </div>
    );
}
const MarkdownRenderer = ({ content }) => {
    const components = useMemo(() => ({
        code: CodeBlock,
        table: ({ children, ...props }) => (
            <div className="md-table-wrap"><table {...props}>{children}</table></div>
        ),
        a: ({ children, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer">{children}</a>
        ),
    }), []);
    return (
        <div className="md-renderer">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={components}
            >
                {content || ""}
            </ReactMarkdown>
        </div>
    );
};
export default MarkdownRenderer;
