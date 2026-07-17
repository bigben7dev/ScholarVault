// src/components/Footer.jsx
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Vault, ExternalLink } from "lucide-react";
import { cn } from "../lib/utils";
import logo from "../assets/logo2.png";
const currentYear = new Date().getFullYear();

const quickLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "About", href: "/about" }, // now a real page
];

const categoryLinks = [
  { label: "Lecture Summaries", category: "lecture_note" },
  { label: "Handouts", category: "handout" },
  { label: "Past Questions", category: "past_question" },
  { label: "Reference Textbooks", category: "textbook" },
];

export default function Footer() {
  const navigate = useNavigate();

  const handleSmoothScroll = (e, href) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/search?category=${category}`);
  };

  return (
    <footer
      className={cn(
        "border-t transition-colors duration-300",
        "bg-slate-50 border-slate-200",
        "dark:bg-slate-950 dark:border-slate-800",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="ScholarVault" className=" h-8 w-7" />
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                ScholarVault
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Your academic universe, organized. All your notes, handouts, and
              past questions in one secure, intelligent vault.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              &copy; {currentYear} ScholarVault. All rights reserved.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wide uppercase">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("/") ? (
                    <Link
                      to={link.href}
                      className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      onClick={(e) => handleSmoothScroll(e, link.href)}
                      className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wide uppercase">
              Categories
            </h3>
            <ul className="space-y-2">
              {categoryLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleCategoryClick(link.category)}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Operational badge */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wide uppercase">
              Status
            </h3>
            <div
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium",
                "bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800",
                "text-slate-600 dark:text-slate-400",
              )}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              System Status: Operational &middot; v1.0.0
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Engineered by Dev. BigBen🌐✅
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
