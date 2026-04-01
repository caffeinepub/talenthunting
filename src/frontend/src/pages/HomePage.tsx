import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useCandidateProfileCount,
  useJobPostingCount,
  useMonthlyCompletedProfiles,
} from "@/hooks/useQueries";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  Briefcase,
  Building2,
  CalendarCheck,
  CheckCircle,
  FileText,
  Globe,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  UserCheck,
  Users,
} from "lucide-react";
import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ── Animated counter hook ── */
function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return { count, ref };
}

function StatCard({
  value,
  numericValue,
  label,
  icon: Icon,
  suffix = "",
}: {
  value: string;
  numericValue?: number;
  label: string;
  icon: React.ElementType;
  suffix?: string;
}) {
  const { count, ref } = useCountUp(numericValue ?? 0);
  const displayValue = numericValue != null ? `${count}${suffix}` : value;

  return (
    <motion.div
      variants={fadeUp}
      className="flex flex-col items-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-gold/30 transition-all duration-300 hover:-translate-y-1 group"
    >
      <div className="p-3 bg-gold/10 rounded-xl mb-4 group-hover:bg-gold/20 transition-colors duration-300">
        <Icon size={28} className="text-gold" />
      </div>
      <span
        ref={ref}
        className="font-display text-4xl lg:text-5xl font-bold text-white mb-2"
      >
        {displayValue}
      </span>
      <span className="font-heading text-sm text-white/60 text-center uppercase tracking-wider">
        {label}
      </span>
    </motion.div>
  );
}

const services = [
  {
    icon: Globe,
    title: "Remote Talent Acquisition",
    description:
      "We source exceptional remote professionals across all time zones and disciplines, building distributed teams that perform like they're in the same room.",
  },
  {
    icon: Search,
    title: "Executive Search",
    description:
      "Confidential search for C-suite, VP-level, and senior leadership roles. We identify and attract passive candidates who aren't on the open market.",
  },
  {
    icon: ShieldCheck,
    title: "Talent Screening & Vetting",
    description:
      "Multi-stage screening including skills assessment, background verification, and cultural alignment — so you only meet thoroughly vetted candidates.",
  },
  {
    icon: Briefcase,
    title: "Contract & Flexible Staffing",
    description:
      "Rapid deployment of contract specialists and flexible workforce solutions to scale your team on demand without long-term commitment risk.",
  },
];

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Submit Your Role",
    description:
      "Share the details of your open position — role type, skills required, and your vision for the ideal candidate. It takes under 5 minutes.",
  },
  {
    number: "02",
    icon: UserCheck,
    title: "We Screen Candidates",
    description:
      "Our specialist team conducts rigorous screening: skills assessments, structured interviews, and reference checks. You receive only the best.",
  },
  {
    number: "03",
    icon: Award,
    title: "Hire with Confidence",
    description:
      "Review your curated shortlist, meet your finalists, and make the hire. We support you through offer negotiation and onboarding.",
  },
];

const testimonials = [
  {
    quote:
      "TalentHunting.co.uk found us a world-class Head of Engineering within 3 weeks. The quality of candidates was outstanding — every one was exactly who we were looking for.",
    name: "Sarah Mitchell",
    title: "CTO",
    company: "FinTech Innovations Ltd",
    initials: "SM",
  },
  {
    quote:
      "We've used many recruitment firms but none come close to the calibre of candidates and the speed of placement. Our remote marketing team was assembled in under a month.",
    name: "James Okonkwo",
    title: "CEO",
    company: "Nexus Digital Group",
    initials: "JO",
  },
  {
    quote:
      "The talent screening process is unmatched. We received 5 candidates, all exceptional — we ended up making 3 hires. Genuinely transformative for our product team.",
    name: "Dr. Priya Sharma",
    title: "VP of Product",
    company: "MedTech Solutions UK",
    initials: "PS",
  },
];

const ORB_CONFIG = [
  {
    size: 320,
    top: "10%",
    left: "70%",
    duration: 7,
    delay: 0,
    color: "oklch(0.22 0.055 258 / 0.15)",
  },
  {
    size: 200,
    top: "60%",
    left: "85%",
    duration: 9,
    delay: 1.5,
    color: "oklch(0.78 0.155 65 / 0.08)",
  },
  {
    size: 260,
    top: "30%",
    left: "5%",
    duration: 6,
    delay: 0.8,
    color: "oklch(0.22 0.055 258 / 0.12)",
  },
  {
    size: 140,
    top: "75%",
    left: "20%",
    duration: 8,
    delay: 2,
    color: "oklch(0.78 0.155 65 / 0.06)",
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const { data: jobCount } = useJobPostingCount();
  const { data: candidateCount } = useCandidateProfileCount();
  const { data: monthlyProfiles } = useMonthlyCompletedProfiles();

  const stats = [
    {
      value: jobCount ? `${Number(jobCount)}+` : "500+",
      numericValue: jobCount ? Number(jobCount) : 500,
      suffix: "+",
      label: "Active Job Postings",
      icon: Briefcase,
    },
    {
      value: candidateCount ? `${Number(candidateCount)}+` : "2,400+",
      numericValue: candidateCount ? Number(candidateCount) : 2400,
      suffix: "+",
      label: "Registered Candidates",
      icon: Users,
    },
    {
      value: "50+",
      numericValue: 50,
      suffix: "+",
      label: "UK & Global Reach",
      icon: Globe,
    },
    {
      value: monthlyProfiles ? `${Number(monthlyProfiles)}` : "4",
      numericValue: monthlyProfiles ? Number(monthlyProfiles) : 4,
      suffix: "",
      label: "Profiles Completed This Month",
      icon: CalendarCheck,
    },
  ];

  return (
    <main>
      {/* ─── Hero ─── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-banner.dim_1400x600.jpg')",
          }}
        />
        <div className="absolute inset-0 gradient-hero opacity-92" />

        {/* Floating animated orbs */}
        {ORB_CONFIG.map((orb) => (
          <motion.div
            key={orb.color}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: orb.size,
              height: orb.size,
              top: orb.top,
              left: orb.left,
              background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
              transform: "translate(-50%, -50%)",
            }}
            animate={{ y: [-20, 20, -20] }}
            transition={{
              duration: orb.duration,
              delay: orb.delay,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        ))}

        <div className="absolute top-20 right-0 w-64 h-64 border border-gold/10 rounded-full translate-x-1/2" />
        <div className="absolute bottom-20 left-0 w-96 h-96 border border-gold/5 rounded-full -translate-x-1/2" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-20 pb-16">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="max-w-3xl"
          >
            <motion.div variants={fadeUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold/15 border border-gold/30 rounded-full text-gold text-xs font-heading font-semibold uppercase tracking-widest">
                <CheckCircle size={12} />
                Official Remote Acquisition & Talent Screening
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.05] mb-6"
            >
              Your Gateway to{" "}
              <span
                className="italic"
                style={{
                  background:
                    "linear-gradient(90deg, oklch(0.78 0.155 65) 0%, oklch(0.86 0.12 70) 40%, oklch(0.78 0.155 65) 80%, oklch(0.86 0.12 70) 100%)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "shimmer 3s linear infinite",
                }}
              >
                Global
              </span>{" "}
              Remote Talent
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="font-body text-lg lg:text-xl text-white/70 leading-relaxed mb-10 max-w-2xl"
            >
              Official Remote Acquisition & Talent Screening — connecting the
              world's best talent with forward-thinking organisations across the
              UK and beyond.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                data-ocid="hero.post_role_button"
                onClick={() => navigate({ to: "/post-role" })}
                size="lg"
                className="bg-gold hover:bg-gold/90 text-navy-deeper font-heading font-bold text-base px-8 shadow-gold transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
              >
                Post a Role
                <ArrowRight size={16} className="ml-2" />
              </Button>
              <Button
                data-ocid="hero.register_talent_button"
                onClick={() => navigate({ to: "/find-talent" })}
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 font-heading font-bold text-base px-8 bg-transparent transition-all duration-300"
              >
                Register as Talent
              </Button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="flex items-center gap-4 mt-6 flex-wrap"
            >
              <span className="inline-flex items-center gap-1.5 text-white/50 text-xs font-body">
                <MapPin size={11} className="text-gold/70" />
                4th Floor, 12 Finsbury Square, London EC2A 1AR
              </span>
              <span className="w-px h-3 bg-white/20" />
              <span className="inline-flex items-center gap-1.5 text-white/50 text-xs font-body">
                <Building2 size={11} className="text-gold/70" />
                TalentHunting Ltd, United Kingdom
              </span>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ─── Services ─── */}
      <section id="services" className="py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-16"
          >
            <motion.span
              variants={fadeUp}
              className="inline-block text-xs font-heading font-semibold uppercase tracking-widest text-gold mb-4"
            >
              What We Do
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl lg:text-5xl font-bold text-navy mb-4"
            >
              Expert Talent Solutions
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="font-body text-muted-foreground max-w-2xl mx-auto text-lg"
            >
              From sourcing to screening, we handle every stage of the talent
              acquisition process with precision and professionalism.
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {services.map((service) => (
              <motion.div key={service.title} variants={fadeUp}>
                <Card className="h-full border-border/60 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1.5 group backdrop-blur-sm bg-white/80 border-white/50 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardContent className="p-7">
                    <div className="w-12 h-12 bg-navy/5 group-hover:bg-navy/10 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300">
                      <service.icon size={24} className="text-navy" />
                    </div>
                    <h3 className="font-heading font-bold text-navy text-base mb-3 group-hover:text-gold transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Trusted By ─── */}
      <section className="py-14 border-y border-border/60 bg-secondary/40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <span className="text-xs font-heading font-semibold uppercase tracking-widest text-muted-foreground">
              Trusted by leading organisations
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 lg:gap-x-16"
          >
            {[
              { name: "Vertex Capital", abbr: "VC" },
              { name: "NorthBridge Group", abbr: "NBG" },
              { name: "Axion Partners", abbr: "AP" },
              { name: "Meridian Tech", abbr: "MT" },
              { name: "Solaris Consulting", abbr: "SC" },
              { name: "Pinnacle Recruit", abbr: "PR" },
            ].map(({ name, abbr }) => (
              <div
                key={name}
                className="flex items-center gap-2 opacity-35 hover:opacity-60 transition-opacity duration-300 group"
              >
                <span className="w-7 h-7 rounded bg-navy/15 flex items-center justify-center text-navy text-[9px] font-heading font-black tracking-tight flex-shrink-0">
                  {abbr}
                </span>
                <span className="font-heading font-bold text-navy text-sm lg:text-base tracking-tight whitespace-nowrap">
                  {name}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section
        id="how-it-works"
        className="py-20 lg:py-28 bg-navy noise-overlay overflow-hidden"
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-16"
          >
            <motion.span
              variants={fadeUp}
              className="inline-block text-xs font-heading font-semibold uppercase tracking-widest text-gold mb-4"
            >
              Our Process
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl lg:text-5xl font-bold text-white mb-4"
            >
              How It Works
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="font-body text-white/60 max-w-2xl mx-auto text-lg"
            >
              A streamlined three-step process engineered for quality outcomes
              and exceptional speed of hire.
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
          >
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-px bg-gradient-to-r from-gold/30 via-gold/60 to-gold/30" />

            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                variants={fadeUp}
                className="relative"
              >
                <div className="flex flex-col items-center text-center p-8">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gold/10 border-2 border-gold/30 rounded-full flex items-center justify-center">
                      <step.icon size={32} className="text-gold" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-gold rounded-full flex items-center justify-center text-navy-deeper text-xs font-heading font-black">
                      {i + 1}
                    </span>
                  </div>
                  <div className="text-gold/30 font-display text-5xl font-black mb-3 leading-none">
                    {step.number}
                  </div>
                  <h3 className="font-heading font-bold text-white text-xl mb-3">
                    {step.title}
                  </h3>
                  <p className="font-body text-white/60 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="py-20 lg:py-24 bg-navy-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-16"
          >
            <motion.span
              variants={fadeUp}
              className="inline-block text-xs font-heading font-semibold uppercase tracking-widest text-gold mb-4"
            >
              Client Stories
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl lg:text-5xl font-bold text-navy mb-4"
            >
              Trusted by Leading Organisations
            </motion.h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map((t) => (
              <motion.div key={t.name} variants={fadeUp}>
                <Card className="h-full border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 rounded-2xl">
                  <CardContent className="p-8">
                    <div className="flex gap-1 mb-5">
                      {(["s1", "s2", "s3", "s4", "s5"] as const).map((s) => (
                        <Star
                          key={s}
                          size={14}
                          className="fill-gold text-gold"
                        />
                      ))}
                    </div>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6 italic">
                      "{t.quote}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-white text-xs font-heading font-bold flex-shrink-0">
                        {t.initials}
                      </div>
                      <div>
                        <p className="font-heading font-bold text-navy text-sm">
                          {t.name}
                        </p>
                        <p className="font-body text-xs text-muted-foreground">
                          {t.title}, {t.company}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 lg:py-24 bg-navy relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.span
              variants={fadeUp}
              className="inline-block text-xs font-heading font-semibold uppercase tracking-widest text-gold mb-4"
            >
              Get Started
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl lg:text-5xl font-bold text-white mb-4"
            >
              Ready to find your next hire?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="font-body text-white/60 text-lg mb-10 max-w-2xl mx-auto"
            >
              Whether you're building a team or looking for your next
              opportunity, we're here to make it happen — faster and better.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                onClick={() => navigate({ to: "/post-role" })}
                size="lg"
                className="bg-gold hover:bg-gold/90 text-navy-deeper font-heading font-bold text-base px-10 shadow-gold transition-all duration-300 hover:scale-[1.02]"
              >
                Post a Role
                <ArrowRight size={16} className="ml-2" />
              </Button>
              <Button
                onClick={() => navigate({ to: "/find-talent" })}
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 font-heading font-bold text-base px-10 bg-transparent transition-all duration-300"
              >
                Find Talent
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
