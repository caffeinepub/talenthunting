import { Link, useNavigate } from "@tanstack/react-router";
import { Globe, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";

export function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  const handleNavClick = (href: string) => {
    if (href.includes("#")) {
      const [path, hash] = href.split("#");
      if (path === "" || path === "/") {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          return;
        }
      }
    } else {
      navigate({ to: href });
    }
  };

  return (
    <footer id="contact" className="bg-navy-deeper text-white">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img
                src="/assets/generated/th-favicon-transparent.dim_64x64.png"
                alt=""
                className="h-8 w-8 rounded-md object-cover flex-shrink-0"
              />
              <img
                src="/assets/generated/talenthunting-logo-transparent.dim_300x80.png"
                alt="TalentHunting.co.uk"
                className="h-9 w-auto object-contain"
              />
            </div>
            <p className="text-white/60 text-sm leading-relaxed font-body">
              Official Remote Acquisition & Talent Screening — connecting the
              world's best talent with forward-thinking organisations.
            </p>
            <div className="flex gap-3 mt-6">
              <a
                href="https://linkedin.com"
                className="p-2 bg-white/10 hover:bg-gold/20 hover:text-gold rounded-md transition-colors"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin size={16} />
              </a>
              <a
                href="https://twitter.com"
                className="p-2 bg-white/10 hover:bg-gold/20 hover:text-gold rounded-md transition-colors"
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter size={16} />
              </a>
              <a
                href="https://talenthunting.co.uk"
                className="p-2 bg-white/10 hover:bg-gold/20 hover:text-gold rounded-md transition-colors"
                aria-label="Website"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe size={16} />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-heading font-bold text-white text-sm uppercase tracking-widest mb-5 text-gold">
              Services
            </h3>
            <ul className="space-y-3 text-sm text-white/60 font-body">
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick("/#services")}
                  className="hover:text-gold transition-colors text-left"
                >
                  Remote Talent Acquisition
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick("/#services")}
                  className="hover:text-gold transition-colors text-left"
                >
                  Executive Search
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick("/#services")}
                  className="hover:text-gold transition-colors text-left"
                >
                  Talent Screening & Vetting
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick("/#services")}
                  className="hover:text-gold transition-colors text-left"
                >
                  Contract & Flexible Staffing
                </button>
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-heading font-bold text-white text-sm uppercase tracking-widest mb-5 text-gold">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm text-white/60 font-body">
              <li>
                <Link to="/" className="hover:text-gold transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/post-role"
                  className="hover:text-gold transition-colors"
                >
                  Post a Role
                </Link>
              </li>
              <li>
                <Link
                  to="/find-talent"
                  className="hover:text-gold transition-colors"
                >
                  Find Talent
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-gold transition-colors">
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-bold text-white text-sm uppercase tracking-widest mb-5 text-gold">
              Contact Us
            </h3>
            <ul className="space-y-4 text-sm text-white/60 font-body">
              <li className="flex items-start gap-3">
                <Mail size={15} className="mt-0.5 text-gold flex-shrink-0" />
                <a
                  href="mailto:hello@talenthunting.co.uk"
                  className="hover:text-gold transition-colors"
                >
                  hello@talenthunting.co.uk
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={15} className="mt-0.5 text-gold flex-shrink-0" />
                <a
                  href="tel:+442000000000"
                  className="hover:text-gold transition-colors"
                >
                  +44 20 0000 0000
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={15} className="mt-0.5 text-gold flex-shrink-0" />
                <address className="not-italic leading-relaxed">
                  TalentHunting Ltd
                  <br />
                  4th Floor, 12 Finsbury Square
                  <br />
                  London, EC2A 1AR
                  <br />
                  United Kingdom
                </address>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40 font-body">
          <p>© {year} TalentHunting.co.uk. All rights reserved.</p>
          <p>
            Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "talenthunting.co.uk")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold/60 hover:text-gold transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
