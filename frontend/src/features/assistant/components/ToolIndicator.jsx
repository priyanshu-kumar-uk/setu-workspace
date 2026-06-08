import React from "react";
import "./ToolIndicator.css";
const TOOL_LABELS = {
    tavily_search: "Searching the web",
};
const ToolIndicator = ({ tool }) => {
    if (!tool) return null;
    const label = TOOL_LABELS[tool.name] || `Running ${tool.name}`;
    return (
        <div className="tool-indicator">
            <div className="tool-indicator-pulse" />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
            </svg>
            <span className="tool-indicator-text">{label}…</span>
        </div>
    );
};
export default ToolIndicator;
