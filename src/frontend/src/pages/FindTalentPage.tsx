import { RoleType } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useRegisterCandidateProfile } from "@/hooks/useQueries";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export function FindTalentPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [preferredRoleType, setPreferredRoleType] = useState<RoleType | "">("");
  const [cvLink, setCvLink] = useState("");
  const [bio, setBio] = useState("");
  const [submittedId, setSubmittedId] = useState<bigint | null>(null);

  const { mutateAsync, isPending, isError, error } =
    useRegisterCandidateProfile();

  const addSkill = (raw: string) => {
    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !skills.includes(s));
    if (parts.length > 0) {
      setSkills((prev) => [...prev, ...parts]);
      setSkillsInput("");
    }
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(skillsInput);
    }
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferredRoleType) return;

    const finalSkills = [...skills];
    if (skillsInput.trim()) {
      const extra = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      finalSkills.push(...extra);
    }

    try {
      const id = await mutateAsync({
        fullName,
        email,
        skills: finalSkills,
        preferredRoleType: preferredRoleType as RoleType,
        cvLink,
        bio,
      });
      setSubmittedId(id);
    } catch {
      // error handled via isError
    }
  };

  return (
    <main className="min-h-screen bg-background pt-24 lg:pt-28">
      {/* Header */}
      <div className="bg-navy-dark py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 border border-gold/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gold/15 rounded-lg">
                <Users size={20} className="text-gold" />
              </div>
              <span className="text-gold text-xs font-heading font-semibold uppercase tracking-widest">
                Talent Portal
              </span>
            </div>
            <h1 className="font-display text-3xl lg:text-5xl font-bold text-white mb-3">
              Find Talent
            </h1>
            <p className="font-body text-white/60 text-lg">
              Register your profile to be matched with top remote opportunities
              worldwide.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="register">
          <TabsList className="w-full mb-8 bg-secondary">
            <TabsTrigger value="register" className="flex-1 font-heading">
              Register as Talent
            </TabsTrigger>
            <TabsTrigger value="browse" className="flex-1 font-heading">
              Browse (Coming Soon)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="register">
            {submittedId !== null ? (
              <motion.div
                data-ocid="register.success_state"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} className="text-green-600" />
                </div>
                <h2 className="font-display text-2xl font-bold text-navy mb-3">
                  You're Registered!
                </h2>
                <p className="font-body text-muted-foreground mb-4">
                  Your profile has been submitted. Our team will review it and
                  reach out with matching opportunities.
                </p>
                <div className="inline-block bg-navy/5 border border-navy/10 rounded-lg px-6 py-3 mb-8">
                  <p className="font-body text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Profile ID
                  </p>
                  <p className="font-heading font-bold text-navy text-lg">
                    {submittedId.toString()}
                  </p>
                </div>
                <div>
                  <Button
                    onClick={() => {
                      setSubmittedId(null);
                      setFullName("");
                      setEmail("");
                      setSkills([]);
                      setSkillsInput("");
                      setPreferredRoleType("");
                      setCvLink("");
                      setBio("");
                    }}
                    className="bg-navy hover:bg-navy/90 text-white font-heading"
                  >
                    Register Another Profile
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="border-border/60 shadow-card">
                  <CardContent className="p-8 lg:p-10">
                    <form onSubmit={handleSubmit} className="space-y-7">
                      {/* Full Name */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="fullName"
                          className="font-heading font-semibold text-navy text-sm"
                        >
                          Full Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="fullName"
                          data-ocid="register.name_input"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Alexandra Thompson"
                          required
                          className="font-body focus-visible:ring-gold"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="regEmail"
                          className="font-heading font-semibold text-navy text-sm"
                        >
                          Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="regEmail"
                          type="email"
                          data-ocid="register.email_input"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="alex@example.com"
                          required
                          className="font-body focus-visible:ring-gold"
                        />
                      </div>

                      {/* Skills */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="regSkills"
                          className="font-heading font-semibold text-navy text-sm"
                        >
                          Skills & Expertise
                        </Label>
                        <div className="space-y-3">
                          {skills.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {skills.map((skill) => (
                                <Badge
                                  key={skill}
                                  className="bg-navy/8 text-navy border-navy/20 font-body text-xs pr-1 flex items-center gap-1"
                                >
                                  {skill}
                                  <button
                                    type="button"
                                    onClick={() => removeSkill(skill)}
                                    className="ml-1 hover:text-destructive transition-colors"
                                  >
                                    <X size={10} />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                          <Input
                            id="regSkills"
                            data-ocid="register.skills_input"
                            value={skillsInput}
                            onChange={(e) => setSkillsInput(e.target.value)}
                            onKeyDown={handleSkillKeyDown}
                            onBlur={() => {
                              if (skillsInput.trim()) addSkill(skillsInput);
                            }}
                            placeholder="Type skills and press Enter or comma (e.g. Python, AWS, Leadership)"
                            className="font-body focus-visible:ring-gold"
                          />
                          <p className="text-xs text-muted-foreground font-body">
                            Press Enter or comma to add each skill
                          </p>
                        </div>
                      </div>

                      {/* Role Type */}
                      <div className="space-y-2">
                        <Label className="font-heading font-semibold text-navy text-sm">
                          Preferred Role Type{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={preferredRoleType}
                          onValueChange={(v) =>
                            setPreferredRoleType(v as RoleType)
                          }
                          required
                        >
                          <SelectTrigger
                            data-ocid="register.role_type_select"
                            className="font-body focus:ring-gold"
                          >
                            <SelectValue placeholder="Select preferred type..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={RoleType.fullTime}>
                              Full-Time
                            </SelectItem>
                            <SelectItem value={RoleType.partTime}>
                              Part-Time
                            </SelectItem>
                            <SelectItem value={RoleType.contract}>
                              Contract
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* CV Link */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="cvLink"
                          className="font-heading font-semibold text-navy text-sm"
                        >
                          CV / Portfolio Link
                        </Label>
                        <Input
                          id="cvLink"
                          type="url"
                          data-ocid="register.cv_link_input"
                          value={cvLink}
                          onChange={(e) => setCvLink(e.target.value)}
                          placeholder="https://linkedin.com/in/your-profile or portfolio URL"
                          className="font-body focus-visible:ring-gold"
                        />
                      </div>

                      {/* Bio */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="bio"
                          className="font-heading font-semibold text-navy text-sm"
                        >
                          Brief Bio <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="bio"
                          data-ocid="register.bio_textarea"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell us about yourself, your experience, and what you're looking for in your next role..."
                          required
                          rows={5}
                          className="font-body focus-visible:ring-gold resize-none"
                        />
                      </div>

                      {/* Error */}
                      {isError && (
                        <div className="bg-destructive/8 border border-destructive/20 rounded-lg p-4">
                          <p className="text-destructive text-sm font-body">
                            {error?.message ||
                              "Failed to register. Please try again."}
                          </p>
                        </div>
                      )}

                      {/* Submit */}
                      <Button
                        type="submit"
                        data-ocid="register.submit_button"
                        disabled={isPending || !preferredRoleType}
                        className="w-full bg-navy hover:bg-navy/90 text-white font-heading font-bold text-base py-6 shadow-navy transition-all duration-200"
                      >
                        {isPending ? (
                          <>
                            <Loader2 size={18} className="mr-2 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          <>
                            Register Interest
                            <ArrowRight size={16} className="ml-2" />
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="browse">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-border/60 shadow-card">
                <CardContent className="p-16 text-center">
                  <div className="w-16 h-16 bg-navy/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock size={28} className="text-navy/40" />
                  </div>
                  <h3 className="font-heading font-bold text-navy text-xl mb-2">
                    Coming Soon
                  </h3>
                  <p className="font-body text-muted-foreground text-sm max-w-sm mx-auto">
                    Browse open roles directly — this feature is currently in
                    development and will be available soon.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
