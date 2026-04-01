import { PortalRole } from "@/backend.d";
import { VideoConsultationsCard } from "@/components/VideoCallModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { useJobPostingCount } from "@/hooks/useQueries";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Briefcase,
  Building2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Search,
  Sparkles,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const FEATURED_ROLES = [
  {
    title: "Senior Frontend Engineer",
    company: "FinTech Innovations Ltd",
    type: "Full-Time",
    location: "Remote (UK)",
    skills: ["React", "TypeScript", "Node.js"],
  },
  {
    title: "Data Scientist",
    company: "Meridian Analytics",
    type: "Contract",
    location: "Remote",
    skills: ["Python", "ML", "TensorFlow"],
  },
  {
    title: "Product Manager",
    company: "GrowthLabs UK",
    type: "Full-Time",
    location: "Remote (Europe)",
    skills: ["Agile", "Roadmapping", "SaaS"],
  },
  {
    title: "DevOps Engineer",
    company: "CloudPeak Systems",
    type: "Part-Time",
    location: "Remote",
    skills: ["AWS", "Kubernetes", "CI/CD"],
  },
];

export function JobSeekerDashboardPage() {
  const navigate = useNavigate();
  const { actor, isFetching: actorFetching } = useActor();
  const [username, setUsername] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const { data: jobCount, isLoading: jobCountLoading } = useJobPostingCount();

  useEffect(() => {
    const token = localStorage.getItem("portalToken");
    const role = localStorage.getItem("portalRole");

    if (!token || role !== PortalRole.jobSeeker) {
      navigate({ to: "/portal-login", search: { tab: "jobSeeker" } });
      return;
    }

    if (!actor || actorFetching) return;

    let cancelled = false;

    actor
      .getPortalSession(token)
      .then((session) => {
        if (cancelled) return;
        if (!session || session.portalRole !== PortalRole.jobSeeker) {
          localStorage.removeItem("portalToken");
          localStorage.removeItem("portalRole");
          navigate({ to: "/portal-login", search: { tab: "jobSeeker" } });
          return;
        }
        setUsername(session.username);
        setIsVerifying(false);
      })
      .catch(() => {
        if (cancelled) return;
        localStorage.removeItem("portalToken");
        localStorage.removeItem("portalRole");
        navigate({ to: "/portal-login", search: { tab: "jobSeeker" } });
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
        // ignore error, still clear local state
      }
    }
    localStorage.removeItem("portalToken");
    localStorage.removeItem("portalRole");
    navigate({ to: "/" });
  };

  if (isVerifying) {
    return (
      <main className="min-h-screen bg-background pt-24 lg:pt-28 flex items-center justify-center">
        <div data-ocid="jobseeker.loading_state" className="text-center">
          <div className="w-12 h-12 rounded-full bg-navy/8 flex items-center justify-center mx-auto mb-4">
            <Search size={20} className="text-navy animate-pulse" />
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
        {/* Gradient mesh background */}
        <div
          className="absolute inset-0"
          style={{
            background: "oklch(0.15 0.045 258)",
          }}
        />
        <div
          className="absolute top-0 left-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none"
          style={{ background: "oklch(0.78 0.155 65 / 0.12)" }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-56 h-56 rounded-full blur-3xl pointer-events-none"
          style={{ background: "oklch(0.22 0.055 258 / 0.4)" }}
        />
        <div className="absolute top-1/2 right-0 w-80 h-80 border border-gold/10 rounded-full translate-x-1/3 -translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-1.5 bg-gold/15 rounded-lg">
                  <Search size={16} className="text-gold" />
                </div>
                <span className="text-gold text-xs font-heading font-semibold uppercase tracking-widest">
                  Job Seeker Portal
                </span>
              </div>
              <h1 className="font-display text-3xl lg:text-4xl font-bold text-white">
                Welcome back, <span className="text-gold">{username}</span>
              </h1>
              <p className="font-body text-white/50 text-sm mt-1">
                Discover exciting remote opportunities curated for you
              </p>
            </div>
            <Button
              data-ocid="jobseeker.logout_button"
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
              <Briefcase size={18} className="text-gold" />
              <div>
                <p className="font-body text-xs text-white/50">Open Roles</p>
                <p className="font-heading font-bold text-white text-lg leading-none">
                  {jobCountLoading ? (
                    <Skeleton className="h-5 w-8 inline-block bg-white/20" />
                  ) : (
                    (jobCount?.toString() ?? "—")
                  )}
                </p>
              </div>
            </div>
            <div className="w-px bg-white/15 h-8" />
            <p className="font-body text-sm text-white/50">
              Browse open roles below and contact us to apply
            </p>
          </div>
        </div>
      </div>

      {/* White bar continuation */}
      <div className="bg-white border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-px" />
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: featured roles */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-xl font-bold text-navy">
                  Featured Opportunities
                </h2>
                <span className="font-body text-xs text-muted-foreground bg-secondary rounded-full px-3 py-1">
                  Updated daily
                </span>
              </div>

              <div className="space-y-3">
                {FEATURED_ROLES.map((role, i) => (
                  <motion.div
                    key={role.title}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.05 }}
                    data-ocid={`jobseeker.item.${i + 1}`}
                  >
                    <Card className="border-border/60 hover:border-navy/30 hover:shadow-md transition-all duration-300 cursor-pointer group rounded-2xl">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3.5 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-navy/6 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-navy/10 transition-colors">
                              <Building2 size={18} className="text-navy/50" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-heading font-bold text-navy text-base truncate">
                                {role.title}
                              </h3>
                              <p className="font-body text-sm text-muted-foreground">
                                {role.company}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                                <span className="inline-flex items-center gap-1 font-body text-xs bg-secondary text-navy/70 rounded-full px-2.5 py-0.5">
                                  <MapPin size={11} />
                                  {role.location}
                                </span>
                                <span
                                  className={`font-body text-xs rounded-full px-2.5 py-0.5 ${
                                    role.type === "Full-Time"
                                      ? "bg-navy/8 text-navy"
                                      : role.type === "Contract"
                                        ? "bg-gold/10 text-gold-dark"
                                        : "bg-secondary text-muted-foreground"
                                  }`}
                                >
                                  {role.type}
                                </span>
                                {role.skills.map((s) => (
                                  <span
                                    key={s}
                                    className="font-body text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <ArrowRight
                            size={16}
                            className="text-muted-foreground/30 group-hover:text-navy/50 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div
                data-ocid="jobseeker.empty_state"
                className="mt-4 bg-secondary/60 rounded-xl px-5 py-4 flex items-start gap-3"
              >
                <Sparkles
                  size={16}
                  className="text-gold mt-0.5 flex-shrink-0"
                />
                <p className="font-body text-sm text-muted-foreground">
                  These are sample featured roles. Contact us directly to
                  receive a full list of open positions matched to your profile.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right: contact & info panel */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-5"
          >
            {/* Video Consultations Card */}
            <VideoConsultationsCard username={username} />

            {/* Contact card */}
            <Card className="border-border/60 overflow-hidden rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300">
              <div className="h-1.5 bg-gradient-to-r from-navy to-gold" />
              <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="font-heading text-navy text-base">
                  Get Personalised Matches
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-3">
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  Our talent specialists will match you with the best remote
                  opportunities for your skills and preferences.
                </p>
                <ul className="space-y-2.5">
                  <li className="flex items-center gap-2.5 text-sm font-body text-muted-foreground">
                    <Mail size={14} className="text-gold flex-shrink-0" />
                    <a
                      href="mailto:hello@talenthunting.co.uk"
                      className="hover:text-navy transition-colors"
                    >
                      hello@talenthunting.co.uk
                    </a>
                  </li>
                  <li className="flex items-center gap-2.5 text-sm font-body text-muted-foreground">
                    <Phone size={14} className="text-gold flex-shrink-0" />
                    <a
                      href="tel:+442000000000"
                      className="hover:text-navy transition-colors"
                    >
                      +44 20 0000 0000
                    </a>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm font-body text-muted-foreground">
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
                <Link
                  to="/find-talent"
                  data-ocid="jobseeker.primary_button"
                  className="flex items-center justify-center gap-2 w-full mt-1 bg-navy hover:bg-navy/90 text-white font-heading font-bold text-sm py-2.5 px-4 rounded-lg transition-all duration-200 hover:scale-[1.01]"
                >
                  Register Your Profile
                  <ArrowRight size={14} />
                </Link>
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
                      Job Seeker Account
                    </p>
                  </div>
                </div>
                <Button
                  data-ocid="jobseeker.secondary_button"
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
