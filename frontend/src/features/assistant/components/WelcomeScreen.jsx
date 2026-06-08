import React from "react";
import { Sparkles } from "lucide-react";
import "./WelcomeScreen.css";
const SUGGESTIONS = [
    "Explain how React hooks work",
    "Search for the latest AI news today",
    "Write a Python function to sort a list",
    "What are the best practices for REST API design?",
];
const WelcomeScreen = ({ onSuggestionClick }) => {
    return (
        <div className="welcome-screen">
            <div className="welcome-icon-wrap">
                <Sparkles size={32} />
            </div>
            <h2 className="welcome-title">Setu AI</h2>
            <p className="welcome-subtitle">
                Your intelligent assistant. Ask anything
            </p>
            {}
        </div>
    );
};
export default WelcomeScreen;
