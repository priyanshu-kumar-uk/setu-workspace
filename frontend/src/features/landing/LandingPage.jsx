import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Video,
  Zap,
  FileText,
  ArrowRight,
  Calendar,
  Bell,
  Globe,
  Share2,
  Monitor,
  MessageCircle,
  Clock,
  Activity,
  Plus,
  Minus,
  CheckCircle2,
} from "lucide-react";
import "./LandingPage.css";
const landingPageData = {
  hero: {
    headline: "The Meeting Room With a Browser Inside",
    subtext:
      "Setu is a video meeting platform with a real browser and AI assistant built directly into every room — so your team can work without switching apps.",
    ctaPrimary: "Get Started",
    ctaSecondary: "See How It Works",
    image: "/hero room image.png",
  },
  premiumFeatures: [
    {
      id: "collaborative-browser",
      badge: "🌐 Smart Workspace",
      title: "Built-in Browser for Shared Workspaces",
      description: "Access websites directly inside the meeting room without switching tabs or applications.\n\nThe built-in browser is controlled by the host and can be shared with participants in real time. This allows teams to review websites, dashboards, documentation, research, and online resources together from a single workspace.",
      highlights: ["Built directly into the room", "Host-controlled browsing", "Share browser view instantly", "No need to switch applications", "Better collaboration and presentations"],
      image: "/hero room image.png",
      imagePosition: "right",
    },
    {
      id: "ai-assistant",
      badge: "🤖 AI Assistant",
      title: "AI Assistant Inside Every Room",
      description: "Get instant assistance during meetings without leaving your workspace.\n\nUse AI to generate ideas, summarize discussions, answer questions, create content, and support decision-making while collaborating with your team.",
      highlights: ["Built directly into meetings", "Instant answers and assistance", "Content generation", "Meeting productivity support", "Faster decision making"],
      image: "/Ai room.png",
      imagePosition: "left",
    },
    {
      id: "shared-documents",
      badge: "📄 Documents Workspace",
      title: "Create Meeting Documents Instantly",
      description: "Capture notes, action items, plans, and meeting outcomes directly inside the room.\n\nDocuments can be created and managed during meetings, helping teams keep important information organized without switching to external tools.",
      highlights: ["Create documents during meetings", "Drag-and-drop support", "Organized meeting notes", "Quick documentation workflow", "No external tools required"],
      image: "/Docs image.png",
      imagePosition: "right",
    },
  ],
  featureGrid: {
    headline: "Everything You Need, Inside the Meeting",
    subtext:
      "Built-in browser, AI assistant, documents, chat, and meeting tools — all in one platform.",
    features: [
      {
        id: 1,
        title: "Built-in Browser",
        desc: "A real browser inside the meeting room — only the host can open it, so you can navigate sites without leaving the call.",
        icon: <Globe size={28} />,
        highlight: true,
      },
      {
        id: 2,
        title: "Browser Sharing",
        desc: "Share just the browser panel with participants, not your whole desktop.",
        icon: <Share2 size={28} />,
      },
      {
        id: 3,
        title: "AI Assistant",
        desc: "Get answers, ideas, and assistance instantly during the meeting.",
        icon: <Zap size={28} />,
        highlight: true,
      },
      {
        id: 6,
        title: "Documents Workspace",
        desc: "Drag and drop files into the meeting room for quick access during discussions. Access them later from your dashboard.",
        icon: <FileText size={28} />,
        highlight: true,
      },
      {
        id: 8,
        title: "Screen Sharing",
        desc: "Share your full screen or specific app windows with others.",
        icon: <Monitor size={28} />,
      },
      {
        id: 11,
        title: "Email Reminders",
        desc: "Automatic email alerts sent to participants before the meeting.",
        icon: <Bell size={28} />,
      },
      {
        id: 12,
        title: "Meeting History",
        desc: "Review past meetings, attendee lists, and session details anytime.",
        icon: <Clock size={28} />,
      },
      {
        id: 13,
        title: "Participant Activity",
        desc: "See who attended and track engagement for each meeting.",
        icon: <Activity size={28} />,
      },
    ],
  },
  useCases: {
    headline: "Built for the Way Different People Actually Work",
    subtext:
      "Whether you're running a remote standup, teaching a class, or reviewing research — Setu's room is built for the work you do inside it.",
  },
  faq: {
    headline: "Frequently Asked Questions",
    subtext:
      "Quick answers to common questions about Setu's browser-native features.",
  },
};
const faqData = [
  {
    id: 1,
    question: "How is Setu different from Zoom or Google Meet?",
    answer:
      "Setu includes a built-in browser inside every meeting. You can look things up or open web apps right in the call without leaving. Zoom and Meet require you to alt-tab or share your screen. Setu also adds an AI assistant and a connected document workspace (not present in Zoom/Meet).",
  },
  {
    id: 2,
    question: "Is the built-in browser a real browser?",
    answer:
      "Yes. It’s a full web browser running in the meeting room (host can open it). You can navigate any website. With Browser Sharing, everyone in the call can see that browser.",
  },
  {
    id: 3,
    question: "What is Browser Sharing?",
    answer:
      "Browser Sharing lets you show only the built-in browser to participants. Unlike normal screen sharing, nothing outside that browser panel is visible.",
  },
  {
    id: 4,
    question:
      "Can meeting participants see previous chat messages after the call?",
    answer:
      "No. Group Chat is only active during the meeting. Once the session ends, the chat history is cleared.",
  },
  {
    id: 5,
    question: "Can I review what happened in past meetings?",
    answer:
      "Yes. The dashboard shows Meeting History, including who attended and basic session details, so you can refer back to past calls.",
  },
];
const LandingPage = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeSection, setActiveSection] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleFaq = (id) => {
    setActiveFaq((prev) => (prev === id ? null : id));
  };
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const navbarHeight = 80;
    const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight;
    window.scrollTo({ top, behavior: "smooth" });
    setMenuOpen(false);
  };
  useEffect(() => {
    const sectionIds = ["features", "faq"];
    const observers = [];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((obs) => obs.disconnect());
  }, []);
  const handleDeveloperSettings = () => {
    const currentUrl = localStorage.getItem('CUSTOM_API_URL') || '';
    const newUrl = prompt('Enter Ngrok URL (e.g., https://xyz.ngrok-free.app). Leave blank for default Render backend:', currentUrl);
    
    if (newUrl !== null) {
      if (newUrl.trim() === '') {
        localStorage.removeItem('CUSTOM_API_URL');
        alert('Switched back to default Render backend!');
      } else {
        localStorage.setItem('CUSTOM_API_URL', newUrl.trim());
        alert('Switched to Custom Backend!');
      }
      window.location.reload();
    }
  };

  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="nav-logo" onClick={() => navigate("/")}>
          SETU
        </div>
        <div className="nav-actions">
          <Link to="/login" className="nav-link-signin">
            Sign In
          </Link>
          <button className="btn-primary" onClick={() => navigate("/register")}>
            Sign Up
          </button>
        </div>
        {}
        <button
          className={`nav-hamburger ${menuOpen ? "hamburger-open" : ""}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>
      {}
      <div className={`mobile-menu-overlay ${menuOpen ? "overlay-visible" : ""}`}>
        <hr className="mobile-menu-divider" />
        <Link to="/login" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>Sign In</Link>
        <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => { navigate("/register"); setMenuOpen(false); }}>Sign Up</button>
      </div>
      {}
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-headline">
            The Meeting Room With a{" "}
            <span className="highlight-text">Browser</span> Inside
          </h1>
          <p className="hero-subtext">{landingPageData.hero.subtext}</p>
          <div className="hero-cta-group">
            <button
              className="btn-primary btn-large"
              onClick={() => navigate("/register")}
            >
              {landingPageData.hero.ctaPrimary} <ArrowRight size={20} />
            </button>
          </div>
        </div>
        <div className="hero-reveal-wrapper">
          <img
            src={landingPageData.hero.image}
            alt="Setu Browser-in-meeting workspace preview"
            className="hero-reveal-image"
          />
        </div>
      </header>
      {}
      <section id="features" className="saas-features-section">
        {landingPageData.premiumFeatures.map((feature) => (
          <div 
            key={feature.id} 
            className={`saas-feature-card ${feature.imagePosition === 'left' ? 'layout-image-left' : 'layout-image-right'}`}
          >
            <div className="sfc-text-area">
              <div className="sfc-badge-wrapper">
                <span className="sfc-badge">{feature.badge}</span>
              </div>
              <h2 className="sfc-title">{feature.title}</h2>
              <p className="sfc-description">{feature.description}</p>
              <ul className="sfc-highlights">
                {feature.highlights.map((highlight, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={18} className="sfc-highlight-icon" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="sfc-image-area">
              <div className="saas-browser-frame">
                <div className="saas-browser-header">
                  <div className="saas-dots">
                    <span className="s-dot red"></span>
                    <span className="s-dot yellow"></span>
                    <span className="s-dot green"></span>
                  </div>
                  <div className="saas-url">setu.app/workspace</div>
                </div>
                <div className="saas-browser-content">
                  <img src={feature.image} alt={feature.title} className="sfc-screenshot" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>
      {}
      {}
      <section className="feature-grid-section">
        <div className="marquee-container">
          <div className="marquee-track">
            {}
            <div className="marquee-group">
              {landingPageData.featureGrid.features.map((f) => (
                <div
                  key={f.id}
                  className={`feature-grid-card ${f.highlight ? "card-highlighted" : ""}`}
                >
                  <div className="grid-card-icon-wrapper">
                    {f.icon}
                  </div>
                  <div className="grid-card-text">
                    <h3 className="grid-card-title">{f.title}</h3>
                    <p className="grid-card-desc">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            {}
            <div className="marquee-group" aria-hidden="true">
              {landingPageData.featureGrid.features.map((f) => (
                <div
                  key={`${f.id}-dup`}
                  className={`feature-grid-card ${f.highlight ? "card-highlighted" : ""}`}
                >
                  <div className="grid-card-icon-wrapper">
                    {f.icon}
                  </div>
                  <div className="grid-card-text">
                    <h3 className="grid-card-title">{f.title}</h3>
                    <p className="grid-card-desc">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {}
      {}
      <section id="faq" className="faq-section">
        <h2 className="section-headline">{landingPageData.faq.headline}</h2>
        <p className="section-subtext">{landingPageData.faq.subtext}</p>
        <div className="faq-accordion-container">
          {faqData.map((faq) => {
            const isOpen = activeFaq === faq.id;
            return (
              <div
                key={faq.id}
                className={`faq-row ${isOpen ? "row-expanded" : ""}`}
              >
                <button
                  className="faq-trigger"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                >
                  <span className="faq-question">{faq.question}</span>
                  <span className="faq-icon-holder">
                    {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                  </span>
                </button>
                <div
                  className={`faq-answer-wrapper ${isOpen ? "answer-open" : ""}`}
                >
                  <div className="faq-answer-inner">
                    <p className="faq-answer">{faq.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      {}
      {}
      {}
      {}
      <div 
        className="developer-settings-dot"
        onClick={handleDeveloperSettings}
        title="Developer Settings"
      >
        ●
      </div>
    </div>
  );
};
export default LandingPage;
