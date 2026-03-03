import { PortalRole } from "@/backend.d";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActor } from "@/hooks/useActor";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  AlertCircle,
  Briefcase,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Search,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface LoginFormProps {
  portalRole: PortalRole;
  tab: "jobSeeker" | "employer";
  label: string;
  icon: React.ReactNode;
}

function LoginForm({ portalRole, tab, label, icon }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { actor } = useActor();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      setError("Connection unavailable. Please try again.");
      return;
    }
    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const passwordHash = await hashPassword(password);
      const token = await actor.loginPortalUser(username.trim(), passwordHash);
      if (!token) {
        setError("Invalid username or password.");
        return;
      }
      localStorage.setItem("portalToken", token);
      localStorage.setItem("portalRole", portalRole);
      if (portalRole === PortalRole.jobSeeker) {
        navigate({ to: "/jobseeker-dashboard" });
      } else {
        navigate({ to: "/employer-dashboard" });
      }
    } catch {
      setError("Invalid username or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-navy/8 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-navy/10">
          {icon}
        </div>
        <h2 className="font-display text-xl font-bold text-navy">
          {label} Login
        </h2>
        <p className="font-body text-sm text-muted-foreground mt-1">
          Enter your credentials to access the portal
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          data-ocid={`${tab}.error_state`}
          className="flex items-center gap-2.5 bg-destructive/8 border border-destructive/20 text-destructive rounded-lg px-4 py-3 text-sm font-body"
        >
          <AlertCircle size={15} className="flex-shrink-0" />
          {error}
        </motion.div>
      )}

      <div className="space-y-1.5">
        <Label
          htmlFor={`${tab}-username`}
          className="font-heading text-xs font-semibold text-navy/70 uppercase tracking-wide"
        >
          Username
        </Label>
        <div className="relative">
          <User
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id={`${tab}-username`}
            data-ocid={`${tab}.input`}
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="pl-10 font-body border-border/70 focus:border-navy focus:ring-navy/20 h-11"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor={`${tab}-password`}
          className="font-heading text-xs font-semibold text-navy/70 uppercase tracking-wide"
        >
          Password
        </Label>
        <div className="relative">
          <Lock
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id={`${tab}-password`}
            data-ocid={`${tab}.search_input`}
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="pl-10 pr-11 font-body border-border/70 focus:border-navy focus:ring-navy/20 h-11"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        data-ocid={`${tab}.submit_button`}
        disabled={isLoading}
        className="w-full bg-navy hover:bg-navy/90 text-white font-heading font-bold h-11 shadow-md transition-all duration-200"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" />
            Signing In...
          </>
        ) : (
          `Sign In to ${label} Portal`
        )}
      </Button>

      <p className="text-center font-body text-xs text-muted-foreground">
        Access credentials are provided by TalentHunting administrators.
        <br />
        Contact{" "}
        <a
          href="mailto:vinayk1907@gmail.com"
          className="text-navy hover:text-gold transition-colors"
        >
          vinayk1907@gmail.com
        </a>{" "}
        for access requests.
      </p>
    </form>
  );
}

export function PortalLoginPage() {
  const search = useSearch({ strict: false }) as { tab?: string };
  const defaultTab = search.tab === "employer" ? "employer" : "jobSeeker";

  return (
    <main className="min-h-screen bg-background pt-20 pb-16 flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-0 right-0 h-72 gradient-hero opacity-90" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2.5 mb-5">
            <img
              src="/assets/generated/th-favicon-transparent.dim_64x64.png"
              alt=""
              className="h-10 w-10 rounded-xl object-cover"
            />
            <img
              src="/assets/generated/talenthunting-logo-transparent.dim_300x80.png"
              alt="TalentHunting.co.uk"
              className="h-11 w-auto object-contain brightness-0 invert"
            />
          </div>
          <h1 className="font-display text-2xl font-bold text-white mb-2">
            Portal Access
          </h1>
          <p className="font-body text-sm text-white/60">
            Select your portal type and sign in below
          </p>
        </div>

        <Card className="border-border/50 shadow-2xl bg-card/98 backdrop-blur-sm">
          <CardContent className="p-7">
            <Tabs defaultValue={defaultTab}>
              <TabsList
                className="grid w-full grid-cols-2 mb-7 bg-secondary h-11"
                data-ocid="portal.tab"
              >
                <TabsTrigger
                  value="jobSeeker"
                  data-ocid="portal.jobseeker_tab"
                  className="font-heading text-sm font-semibold data-[state=active]:bg-navy data-[state=active]:text-white transition-all"
                >
                  <Search size={14} className="mr-2" />
                  Job Seeker
                </TabsTrigger>
                <TabsTrigger
                  value="employer"
                  data-ocid="portal.employer_tab"
                  className="font-heading text-sm font-semibold data-[state=active]:bg-navy data-[state=active]:text-white transition-all"
                >
                  <Briefcase size={14} className="mr-2" />
                  Employer
                </TabsTrigger>
              </TabsList>

              <TabsContent value="jobSeeker">
                <LoginForm
                  portalRole={PortalRole.jobSeeker}
                  tab="jobSeeker"
                  label="Job Seeker"
                  icon={<Search size={22} className="text-navy/60" />}
                />
              </TabsContent>

              <TabsContent value="employer">
                <LoginForm
                  portalRole={PortalRole.employer}
                  tab="employer"
                  label="Employer"
                  icon={<Briefcase size={22} className="text-navy/60" />}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center font-body text-xs text-white/40 mt-6">
          4th Floor, 12 Finsbury Square, London EC2A 1AR
        </p>
      </motion.div>
    </main>
  );
}
