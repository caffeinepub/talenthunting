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
import { Textarea } from "@/components/ui/textarea";
import { useSubmitJobPosting } from "@/hooks/useQueries";
import { ArrowRight, Briefcase, CheckCircle2, Loader2, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export function PostRolePage() {
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [roleType, setRoleType] = useState<RoleType | "">("");
  const [skillsInput, setSkillsInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [submittedId, setSubmittedId] = useState<bigint | null>(null);

  const { mutateAsync, isPending, isError, error } = useSubmitJobPosting();

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
    if (!roleType) return;

    // Flush any remaining skill input
    const finalSkills = [...skills];
    if (skillsInput.trim()) {
      const extra = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      finalSkills.push(...extra);
    }

    try {
      const id = await mutateAsync({
        companyName,
        jobTitle,
        roleType: roleType as RoleType,
        requiredSkills: finalSkills,
        jobDescription,
        contactEmail,
      });
      setSubmittedId(id);
    } catch {
      // error handled via isError
    }
  };

  if (submittedId !== null) {
    return (
      <main className="min-h-screen bg-background pt-24 lg:pt-28">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
          <motion.div
            data-ocid="post_role.success_state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <h1 className="font-display text-3xl font-bold text-navy mb-3">
              Role Submitted!
            </h1>
            <p className="font-body text-muted-foreground mb-4">
              Your job posting has been received. Our team will review and begin
              sourcing candidates.
            </p>
            <div className="inline-block bg-navy/5 border border-navy/10 rounded-lg px-6 py-3 mb-8">
              <p className="font-body text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Posting ID
              </p>
              <p className="font-heading font-bold text-navy text-lg">
                {submittedId.toString()}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => {
                  setSubmittedId(null);
                  setCompanyName("");
                  setJobTitle("");
                  setRoleType("");
                  setSkills([]);
                  setSkillsInput("");
                  setJobDescription("");
                  setContactEmail("");
                }}
                className="bg-navy hover:bg-navy/90 text-white font-heading"
              >
                Post Another Role
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-24 lg:pt-28">
      {/* Header */}
      <div className="bg-navy py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 border border-gold/10 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gold/15 rounded-lg">
                <Briefcase size={20} className="text-gold" />
              </div>
              <span className="text-gold text-xs font-heading font-semibold uppercase tracking-widest">
                Employer Portal
              </span>
            </div>
            <h1 className="font-display text-3xl lg:text-5xl font-bold text-white mb-3">
              Post a Role
            </h1>
            <p className="font-body text-white/60 text-lg">
              Tell us about your open position and we'll connect you with
              screened, qualified talent.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-border/60 shadow-card">
            <CardContent className="p-8 lg:p-10">
              <form onSubmit={handleSubmit} className="space-y-7">
                {/* Company Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="company"
                    className="font-heading font-semibold text-navy text-sm"
                  >
                    Company Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="company"
                    data-ocid="post_role.company_name_input"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Corporation"
                    required
                    className="font-body focus-visible:ring-gold"
                  />
                </div>

                {/* Job Title */}
                <div className="space-y-2">
                  <Label
                    htmlFor="jobTitle"
                    className="font-heading font-semibold text-navy text-sm"
                  >
                    Job Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="jobTitle"
                    data-ocid="post_role.job_title_input"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Senior Frontend Engineer"
                    required
                    className="font-body focus-visible:ring-gold"
                  />
                </div>

                {/* Role Type */}
                <div className="space-y-2">
                  <Label className="font-heading font-semibold text-navy text-sm">
                    Role Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={roleType}
                    onValueChange={(v) => setRoleType(v as RoleType)}
                    required
                  >
                    <SelectTrigger
                      data-ocid="post_role.role_type_select"
                      className="font-body focus:ring-gold"
                    >
                      <SelectValue placeholder="Select role type..." />
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

                {/* Skills */}
                <div className="space-y-2">
                  <Label
                    htmlFor="skills"
                    className="font-heading font-semibold text-navy text-sm"
                  >
                    Required Skills
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
                      id="skills"
                      data-ocid="post_role.skills_input"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      onBlur={() => {
                        if (skillsInput.trim()) addSkill(skillsInput);
                      }}
                      placeholder="Type skills and press Enter or comma (e.g. React, TypeScript)"
                      className="font-body focus-visible:ring-gold"
                    />
                    <p className="text-xs text-muted-foreground font-body">
                      Press Enter or comma to add each skill
                    </p>
                  </div>
                </div>

                {/* Job Description */}
                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="font-heading font-semibold text-navy text-sm"
                  >
                    Job Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    data-ocid="post_role.description_textarea"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Describe the role, responsibilities, requirements, and any other relevant information..."
                    required
                    rows={6}
                    className="font-body focus-visible:ring-gold resize-none"
                  />
                </div>

                {/* Contact Email */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="font-heading font-semibold text-navy text-sm"
                  >
                    Contact Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    data-ocid="post_role.email_input"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="hiring@yourcompany.com"
                    required
                    className="font-body focus-visible:ring-gold"
                  />
                </div>

                {/* Error */}
                {isError && (
                  <div className="bg-destructive/8 border border-destructive/20 rounded-lg p-4">
                    <p className="text-destructive text-sm font-body">
                      {error?.message ||
                        "Failed to submit role. Please try again."}
                    </p>
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  data-ocid="post_role.submit_button"
                  disabled={isPending || !roleType}
                  className="w-full bg-gold hover:bg-gold/90 text-navy-deeper font-heading font-bold text-base py-6 shadow-gold transition-all duration-200"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Submitting Role...
                    </>
                  ) : (
                    <>
                      Submit Role
                      <ArrowRight size={16} className="ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
