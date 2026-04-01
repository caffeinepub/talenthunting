import { PortalRole } from "@/backend.d";
import { VideoConsultationsCard } from "@/components/VideoCallModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { useCandidateProfileCount } from "@/hooks/useQueries";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const HIRING_STEPS = [
  {
    step: "01",
    title: "Post Your Role",
    desc: "Submit your job requirements and we'll start screening immediately.",
  },
  {
    step: "02",
    title: "We Screen Candidates",
    desc: "Our specialists vet and shortlist the most qualified candidates.",
  },
  {
    step: "03",
    title: "Interview & Hire",
    desc: "Meet your top matches and make a confident hiring decision.",
  },
];

export function EmployerDashboardPage() {
  const navigate = useNavigate();
  const { actor, isFetching: actorFetching } = useActor();
  const [username, setUsername] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const { data: candidateCount, isLoading: countLoading } =
    useCandidateProfileCount();

  useEffect(() => {
    const token = localStorage.getItem("portalToken");
    const role = localStorage.getItem("portalRole");

    if (!token || role !== PortalRole.employer) {
      navigate({ to: "/portal-login", search: { tab: "employer" } });
      return;
    }

    if (!actor || actorFetching) return;

    let cancelled = false;

    actor
      .getPortalSession(token)
      .then((session) => {
        if (cancelled) return;
        if (!session || session.portalRole !== PortalRole.employer) {
          localStorage.removeItem("portalToken");
          localStorage.removeItem("portalRole");
          navigate({ to: "/portal-login", search: { tab: "employer" } });
          return;
        }
        setUsername(session.username);
        setIsVerifying(false);
      })
      .catch(() => {
        if (cancelled) return;
        localStorage.removeItem("portalToken");
        localStorage.removeItem("portalRole");
        navigate({ to: "/portal-login", search: { tab: "employer" } });
      });

    return () => {
      cancelled = true;
    };
  }, [actor, actorFetching, navigate]);

  const handleLogout = async () => {
    const token = localStorage.getItem("portalToken");
    if (token && actor) {
      try {
        await actor.logoutPortalUser(token);
      } catch {
        // ignore, still clear
      }
    }
    localStorage.removeItem("portalToken");
    localStorage.removeItem("portalRole");
    navigate({ to: "/" });
  };

  if (isVerifying) {
    return (
      <main className="min-h-screen bg-background pt-24 lg:pt-28 flex items-center justify-center">
        <div data-ocid="employer.loading_state" className="text-center">
          <div className="w-12 h-12 rounded-full bg-navy/8 flex items-center justify-center mx-auto mb-4">
            <Briefcase size={20} className="text-navy animate-pulse" />
          </div>
          <p className="font-body text-sm text-muted-foreground">
            Verifying your session...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen pb-16"
      style={{ background: "oklch(0.985 0.004 85)" }}
    >
      {/* Hero header — glassmorphism + gradient mesh */}
      <div className="relative pt-20 pb-0 overflow-hidden">
        {/* Gradient mesh */}
        <div
          className="absolute inset-0"
          style={{ background: "oklch(0.15 0.045 258)" }}
        />
        <div
          className="absolute top-0 right-1/3 w-72 h-72 rounded-full blur-3xl pointer-events-none"
          style={{ background: "oklch(0.78 0.155 65 / 0.12)" }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-56 h-56 rounded-full blur-3xl pointer-events-none"
          style={{ background: "oklch(0.22 0.055 258 / 0.4)" }}
        />
        <div className="absolute top-1/2 left-0 w-80 h-80 border border-gold/10 rounded-full -translate-x-1/3 -translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-1.5 bg-gold/15 rounded-lg">
                  <Briefcase size={16} className="text-gold" />
                </div>
                <span className="text-gold text-xs font-heading font-semibold uppercase tracking-widest">
                  Employer Portal
                </span>
              </div>
              <h1 className="font-display text-3xl lg:text-4xl font-bold text-white">
                Welcome back, <span className="text-gold">{username}</span>
              </h1>
              <p className="font-body text-white/50 text-sm mt-1">
                Find and hire exceptional remote talent for your organisation
              </p>
            </div>
            <Button
              data-ocid="employer.logout_button"
              onClick={handleLogout}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 hover:text-white font-heading font-semibold shrink-0 self-start sm:self-auto transition-all duration-200"
            >
              <LogOut size={15} className="mr-2" />
              Log Out
            </Button>
          </motion.div>
        </div>

        {/* Glassmorphism stats bar */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-0">
          <div className="backdrop-blur-md bg-white/10 border border-white/10 rounded-t-2xl px-6 py-4 flex items-center gap-8">
            <div className="flex items-center gap-3">
              <Users size={18} className="text-gold" />
              <div>
                <p className="font-body text-xs text-white/50">
                  Active Candidates
                </p>
                <p className="font-heading font-bold text-white text-lg leading-none">
                  {countLoading ? (
                    <Skeleton className="h-5 w-8 inline-block bg-white/20" />
                  ) : (
                    (candidateCount?.toString() ?? "—")
                  )}
                </p>
              </div>
            </div>
            <div className="w-px bg-white/15 h-8" />
            <p className="font-body text-sm text-white/50">
              Screened candidates ready for your consideration
            </p>
          </div>
        </div>
      </div>

      {/* White content area */}
      <div className="bg-white border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-px" />
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: hiring process + CTA */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="font-display text-xl font-bold text-navy mb-5">
                How to Hire With Us
              </h2>

              <div className="space-y-3">
                {HIRING_STEPS.map((item, i) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.06 }}
                    data-ocid={`employer.item.${i + 1}`}
                  >
                    <Card className="border-border/60 hover:border-navy/25 hover:shadow-sm transition-all duration-300 rounded-2xl">
                      <CardContent className="p-5 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center flex-shrink-0">
                          <span className="font-display font-bold text-gold text-sm">
                            {item.step}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-navy text-base mb-0.5">
                            {item.title}
                          </h3>
                          <p className="font-body text-sm text-muted-foreground leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                        <CheckCircle2
                          size={18}
                          className="text-muted-foreground/20 flex-shrink-0 mt-0.5"
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Post a role CTA */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-5 bg-navy rounded-2xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={14} className="text-gold" />
                    <span className="font-heading text-xs font-semibold text-gold uppercase tracking-widest">
                      Ready to hire?
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-white mb-1.5">
                    Submit a Job Posting
                  </h3>
                  <p className="font-body text-sm text-white/60 mb-5">
                    Tell us about the role and we'll find the right candidates
                    within 48 hours.
                  </p>
                  <Link
                    to="/post-role"
                    data-ocid="employer.primary_button"
                    className="inline-flex items-center gap-2 bg-gold hover:bg-gold/90 text-navy-deeper font-heading font-bold text-sm py-2.5 px-5 rounded-lg transition-all duration-200 hover:scale-[1.02] shadow-md"
                  >
                    Post a Role Now
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right: contact & info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-5"
          >
            {/* Video Consultations Card */}
            <VideoConsultationsCard username={username} />

            {/* Candidate pool card */}
            <Card className="border-border/60 overflow-hidden rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300">
              <div className="h-1.5 bg-gradient-to-r from-gold to-navy" />
              <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="font-heading text-navy text-base">
                  Our Talent Pool
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-3">
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  Access our database of pre-screened candidates across
                  technology, finance, marketing, and operations.
                </p>
                <div className="bg-secondary/60 rounded-xl p-4 text-center">
                  <p className="font-display text-3xl font-bold text-navy mb-0.5">
                    {countLoading ? (
                      <Skeleton className="h-9 w-12 inline-block" />
                    ) : (
                      (candidateCount?.toString() ?? "0")
                    )}
                  </p>
                  <p className="font-body text-xs text-muted-foreground">
                    Screened candidates available
                  </p>
                </div>
                <ul className="space-y-2.5 text-sm font-body text-muted-foreground">
                  <li className="flex items-center gap-2.5">
                    <Mail size={14} className="text-gold flex-shrink-0" />
                    <a
                      href="mailto:hello@talenthunting.co.uk"
                      className="hover:text-navy transition-colors"
                    >
                      hello@talenthunting.co.uk
                    </a>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Phone size={14} className="text-gold flex-shrink-0" />
                    <a
                      href="tel:+442000000000"
                      className="hover:text-navy transition-colors"
                    >
                      +44 20 0000 0000
                    </a>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <MapPin
                      size={14}
                      className="text-gold flex-shrink-0 mt-0.5"
                    />
                    <span>
                      4th Floor, 12 Finsbury Square
                      <br />
                      London, EC2A 1AR
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Account info */}
            <Card className="border-border/60 rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-navy/8 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-navy/60" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-navy text-sm">
                      {username}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      Employer Account
                    </p>
                  </div>
                </div>
                <Button
                  data-ocid="employer.secondary_button"
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full font-heading text-xs border-border/60 text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all duration-200"
                >
                  <LogOut size={13} className="mr-1.5" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
