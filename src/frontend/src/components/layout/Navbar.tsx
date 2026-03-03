import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Briefcase, Menu, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "Home", href: "/", ocid: "nav.home_link" },
  { label: "Services", href: "/#services", ocid: "nav.services_link" },
  {
    label: "How It Works",
    href: "/#how-it-works",
    ocid: "nav.how_it_works_link",
  },
  { label: "Post a Role", href: "/post-role", ocid: "nav.post_role_link" },
  { label: "Find Talent", href: "/find-talent", ocid: "nav.find_talent_link" },
  { label: "Contact", href: "/#contact", ocid: "nav.contact_link" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { pathname } = location;
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional close-on-navigate
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleNavClick = (href: string) => {
    if (href.includes("#")) {
      const [path, hash] = href.split("#");
      if (path === "" || path === "/" || location.pathname === "/") {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          return;
        }
      }
      navigate({ to: path || "/" }).then(() => {
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 100);
      });
    } else {
      navigate({ to: href });
    }
    setIsOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-navy/95 backdrop-blur-md shadow-navy" : "bg-navy"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <img
              src="/assets/generated/th-favicon-transparent.dim_64x64.png"
              alt=""
              className="h-8 w-8 rounded-md object-cover flex-shrink-0"
            />
            <img
              src="/assets/generated/talenthunting-logo-transparent.dim_300x80.png"
              alt="TalentHunting.co.uk"
              className="h-9 lg:h-11 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                data-ocid={link.ocid}
                onClick={() => handleNavClick(link.href)}
                className="px-4 py-2 text-sm font-heading font-medium text-white/80 hover:text-gold transition-colors duration-200 rounded-md hover:bg-white/5"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* CTA + Portal Logins + Mobile Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-ocid="nav.jobseeker_login_link"
              onClick={() =>
                navigate({ to: "/portal-login", search: { tab: "jobSeeker" } })
              }
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-heading font-semibold text-white/70 hover:text-gold border border-white/15 hover:border-gold/40 rounded-md transition-all duration-200"
            >
              <Search size={12} />
              Job Seeker
            </button>
            <button
              type="button"
              data-ocid="nav.employer_login_link"
              onClick={() =>
                navigate({ to: "/portal-login", search: { tab: "employer" } })
              }
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-heading font-semibold text-white/70 hover:text-gold border border-white/15 hover:border-gold/40 rounded-md transition-all duration-200"
            >
              <Briefcase size={12} />
              Employer
            </button>
            <Button
              data-ocid="nav.post_role_button"
              onClick={() => navigate({ to: "/post-role" })}
              className="hidden sm:flex bg-gold hover:bg-gold/90 text-navy-deeper font-heading font-bold text-sm shadow-gold transition-all duration-200"
            >
              Post a Role
            </Button>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-white rounded-md hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-navy-dark border-t border-white/10 overflow-hidden"
          >
            <nav className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  data-ocid={link.ocid}
                  onClick={() => handleNavClick(link.href)}
                  className="block w-full text-left px-4 py-3 text-sm font-heading font-medium text-white/80 hover:text-gold hover:bg-white/5 rounded-md transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    data-ocid="nav.jobseeker_login_link"
                    onClick={() => {
                      navigate({
                        to: "/portal-login",
                        search: { tab: "jobSeeker" },
                      });
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-heading font-semibold text-white/80 border border-white/20 hover:border-gold/40 hover:text-gold rounded-md transition-all"
                  >
                    <Search size={12} />
                    Job Seeker Login
                  </button>
                  <button
                    type="button"
                    data-ocid="nav.employer_login_link"
                    onClick={() => {
                      navigate({
                        to: "/portal-login",
                        search: { tab: "employer" },
                      });
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-heading font-semibold text-white/80 border border-white/20 hover:border-gold/40 hover:text-gold rounded-md transition-all"
                  >
                    <Briefcase size={12} />
                    Employer Login
                  </button>
                </div>
                <Button
                  data-ocid="nav.post_role_button"
                  onClick={() => {
                    navigate({ to: "/post-role" });
                    setIsOpen(false);
                  }}
                  className="w-full bg-gold hover:bg-gold/90 text-navy-deeper font-heading font-bold shadow-gold"
                >
                  Post a Role
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
