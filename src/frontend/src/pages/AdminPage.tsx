import { PortalRole, type WhitelistEntry } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useAddEmailToWhitelist,
  useAddPortalUser,
  useAllCandidateProfiles,
  useAllJobPostings,
  useChangePortalUserPassword,
  useClaimAdminAccess,
  useEmailWhitelist,
  useIsCallerAdmin,
  useListPortalUsers,
  useRemoveEmailFromWhitelist,
} from "@/hooks/useQueries";
import { formatRoleType, formatTimestamp } from "@/utils/format";
import {
  Briefcase,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  LogIn,
  Mail,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  UserCog,
  Users,
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

const SKELETON_ROWS = ["r1", "r2", "r3", "r4", "r5"] as const;
const SKELETON_COLS_6 = ["c1", "c2", "c3", "c4", "c5", "c6"] as const;
const SKELETON_COLS_8 = [
  "c1",
  "c2",
  "c3",
  "c4",
  "c5",
  "c6",
  "c7",
  "c8",
] as const;

function TableSkeleton({ cols }: { cols: number }) {
  const colKeys = cols === 8 ? SKELETON_COLS_8 : SKELETON_COLS_6;
  return (
    <div data-ocid="admin.loading_state" className="space-y-3 p-4">
      {SKELETON_ROWS.map((row) => (
        <div key={row} className="flex gap-4">
          {colKeys.slice(0, cols).map((col) => (
            <Skeleton key={col} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

function RoleBadge({ roleType }: { roleType: string }) {
  const label = formatRoleType(roleType);
  const cls =
    roleType === "fullTime"
      ? "bg-navy/10 text-navy border-navy/20"
      : roleType === "partTime"
        ? "bg-gold/10 text-gold-dark border-gold/20"
        : "bg-muted text-muted-foreground border-border";
  return (
    <Badge variant="outline" className={`${cls} font-heading text-xs`}>
      {label}
    </Badge>
  );
}

function PortalUsersTab() {
  const {
    data: portalUsers,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useListPortalUsers();
  const addPortalUser = useAddPortalUser();
  const changePassword = useChangePortalUserPassword();

  // Add user form state
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [newRole, setNewRole] = useState<PortalRole>(PortalRole.jobSeeker);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  // Change password form state (keyed by username)
  const [changePwUsername, setChangePwUsername] = useState<string | null>(null);
  const [changePwValue, setChangePwValue] = useState("");
  const [showChangePw, setShowChangePw] = useState(false);
  const [changePwError, setChangePwError] = useState<string | null>(null);
  const [changePwSuccess, setChangePwSuccess] = useState<string | null>(null);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword) {
      setAddError("Username and password are required.");
      return;
    }
    setAddError(null);
    setAddSuccess(null);
    try {
      const hash = await hashPassword(newPassword);
      await addPortalUser.mutateAsync({
        username: newUsername.trim(),
        passwordHash: hash,
        portalRole: newRole,
      });
      setAddSuccess(`User "${newUsername.trim()}" created successfully.`);
      setNewUsername("");
      setNewPassword("");
      setNewRole(PortalRole.jobSeeker);
    } catch {
      setAddError("Failed to create user. The username may already exist.");
    }
  };

  const handleChangePassword = async (username: string) => {
    if (!changePwValue) {
      setChangePwError("New password is required.");
      return;
    }
    setChangePwError(null);
    setChangePwSuccess(null);
    try {
      const hash = await hashPassword(changePwValue);
      await changePassword.mutateAsync({ username, newPasswordHash: hash });
      setChangePwSuccess(`Password for "${username}" updated.`);
      setChangePwValue("");
      setChangePwUsername(null);
    } catch {
      setChangePwError("Failed to change password.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Add new user form */}
      <Card className="border-border/60 shadow-card overflow-hidden">
        <CardHeader className="flex flex-row items-center gap-3 py-4 px-6 border-b bg-secondary/30">
          <Plus size={16} className="text-navy" />
          <CardTitle className="font-heading text-navy text-base">
            Create Portal User
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="font-heading text-xs font-semibold text-navy/70 uppercase tracking-wide">
                  Username
                </Label>
                <div className="relative">
                  <UserCog
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    data-ocid="admin.portal_user.input"
                    placeholder="e.g. john.smith"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="pl-9 font-body h-10 border-border/70"
                    disabled={addPortalUser.isPending}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="font-heading text-xs font-semibold text-navy/70 uppercase tracking-wide">
                  Password
                </Label>
                <div className="relative">
                  <Lock
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    data-ocid="admin.portal_user.search_input"
                    type={showNewPw ? "text" : "password"}
                    placeholder="Set a strong password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-9 pr-10 font-body h-10 border-border/70"
                    disabled={addPortalUser.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy"
                    tabIndex={-1}
                  >
                    {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="font-heading text-xs font-semibold text-navy/70 uppercase tracking-wide">
                  Role
                </Label>
                <Select
                  value={newRole}
                  onValueChange={(v) => setNewRole(v as PortalRole)}
                  disabled={addPortalUser.isPending}
                >
                  <SelectTrigger
                    data-ocid="admin.portal_user.select"
                    className="font-body h-10 border-border/70"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value={PortalRole.jobSeeker}
                      className="font-body"
                    >
                      <span className="flex items-center gap-2">
                        <Search size={13} />
                        Job Seeker
                      </span>
                    </SelectItem>
                    <SelectItem
                      value={PortalRole.employer}
                      className="font-body"
                    >
                      <span className="flex items-center gap-2">
                        <Briefcase size={13} />
                        Employer
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {addError && (
              <p
                data-ocid="admin.portal_user.error_state"
                className="text-sm font-body text-destructive bg-destructive/8 rounded-lg px-3 py-2"
              >
                {addError}
              </p>
            )}
            {addSuccess && (
              <p
                data-ocid="admin.portal_user.success_state"
                className="text-sm font-body text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2"
              >
                {addSuccess}
              </p>
            )}

            <Button
              type="submit"
              data-ocid="admin.portal_user.submit_button"
              disabled={addPortalUser.isPending}
              className="bg-navy hover:bg-navy/90 text-white font-heading font-bold text-sm"
            >
              {addPortalUser.isPending ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={14} className="mr-2" />
                  Create User
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing users list */}
      <Card className="border-border/60 shadow-card overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b bg-secondary/30">
          <div className="flex items-center gap-3">
            <Users size={16} className="text-navy" />
            <CardTitle className="font-heading text-navy text-base">
              Portal Users ({portalUsers?.length ?? 0})
            </CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchUsers()}
            disabled={usersLoading}
            className="font-heading text-xs border-border/60"
          >
            <RefreshCw
              size={13}
              className={`mr-1.5 ${usersLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {usersLoading ? (
            <TableSkeleton cols={6} />
          ) : !portalUsers?.length ? (
            <div
              data-ocid="admin.portal_users.empty_state"
              className="py-16 text-center"
            >
              <Users
                size={32}
                className="text-muted-foreground/30 mx-auto mb-3"
              />
              <p className="font-body text-sm text-muted-foreground">
                No portal users yet. Create one above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="admin.portal_users.table">
                <TableHeader>
                  <TableRow className="bg-secondary/20">
                    <TableHead className="font-heading text-xs text-navy/70 uppercase tracking-wide">
                      #
                    </TableHead>
                    <TableHead className="font-heading text-xs text-navy/70 uppercase tracking-wide">
                      Username
                    </TableHead>
                    <TableHead className="font-heading text-xs text-navy/70 uppercase tracking-wide">
                      Role
                    </TableHead>
                    <TableHead className="font-heading text-xs text-navy/70 uppercase tracking-wide">
                      Change Password
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portalUsers.map((user, i) => (
                    <TableRow
                      key={user.username}
                      data-ocid={`admin.portal_users.table.row.${i + 1}`}
                      className="hover:bg-secondary/20 transition-colors"
                    >
                      <TableCell className="font-body text-xs text-muted-foreground">
                        {i + 1}
                      </TableCell>
                      <TableCell className="font-heading font-semibold text-navy text-sm">
                        {user.username}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            user.portalRole === PortalRole.employer
                              ? "bg-navy/8 text-navy border-navy/20 font-heading text-xs"
                              : "bg-gold/10 text-gold-dark border-gold/20 font-heading text-xs"
                          }
                        >
                          {user.portalRole === PortalRole.employer ? (
                            <span className="flex items-center gap-1">
                              <Briefcase size={11} /> Employer
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Search size={11} /> Job Seeker
                            </span>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {changePwUsername === user.username ? (
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <Input
                                data-ocid={`admin.portal_users.table.row.${i + 1}.search_input`}
                                type={showChangePw ? "text" : "password"}
                                placeholder="New password"
                                value={changePwValue}
                                onChange={(e) =>
                                  setChangePwValue(e.target.value)
                                }
                                className="h-8 text-xs font-body w-40 pr-8"
                              />
                              <button
                                type="button"
                                onClick={() => setShowChangePw(!showChangePw)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy"
                                tabIndex={-1}
                              >
                                {showChangePw ? (
                                  <EyeOff size={12} />
                                ) : (
                                  <Eye size={12} />
                                )}
                              </button>
                            </div>
                            <Button
                              size="sm"
                              data-ocid={`admin.portal_users.table.row.${i + 1}.save_button`}
                              onClick={() =>
                                handleChangePassword(user.username)
                              }
                              disabled={changePassword.isPending}
                              className="h-8 text-xs bg-navy hover:bg-navy/90 text-white font-heading"
                            >
                              {changePassword.isPending ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                "Save"
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              data-ocid={`admin.portal_users.table.row.${i + 1}.cancel_button`}
                              onClick={() => {
                                setChangePwUsername(null);
                                setChangePwValue("");
                                setChangePwError(null);
                                setChangePwSuccess(null);
                              }}
                              className="h-8 text-xs font-heading"
                            >
                              Cancel
                            </Button>
                            {changePwError && (
                              <span className="text-xs text-destructive font-body">
                                {changePwError}
                              </span>
                            )}
                            {changePwSuccess && (
                              <span className="text-xs text-green-700 font-body">
                                {changePwSuccess}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            data-ocid={`admin.portal_users.table.row.${i + 1}.edit_button`}
                            onClick={() => {
                              setChangePwUsername(user.username);
                              setChangePwValue("");
                              setChangePwError(null);
                              setChangePwSuccess(null);
                            }}
                            className="h-8 text-xs font-heading border-border/60"
                          >
                            <KeyRound size={12} className="mr-1.5" />
                            Change Password
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmailWhitelistTab() {
  const {
    data: whitelist,
    isLoading: whitelistLoading,
    refetch: refetchWhitelist,
  } = useEmailWhitelist();
  const addEmail = useAddEmailToWhitelist();
  const removeEmail = useRemoveEmailFromWhitelist();

  const [newEmail, setNewEmail] = useState("");
  const [newNote, setNewNote] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newEmail.trim();
    if (!trimmed) {
      setAddError("Please enter an email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setAddError("Please enter a valid email address.");
      return;
    }
    setAddError(null);
    setAddSuccess(null);
    try {
      await addEmail.mutateAsync({ email: trimmed, note: newNote.trim() });
      setAddSuccess(`${trimmed} has been added to the whitelist.`);
      setNewEmail("");
      setNewNote("");
    } catch {
      setAddError("Failed to add email. It may already be on the whitelist.");
    }
  };

  const handleRemove = async (email: string) => {
    try {
      await removeEmail.mutateAsync(email);
    } catch {
      // silent
    }
  };

  const formatAddedAt = (addedAt: bigint) => {
    if (addedAt === BigInt(0)) return "Pre-seeded";
    const ms = Number(addedAt) / 1_000_000;
    return new Date(ms).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Add email form */}
      <Card className="border-border/60 shadow-card overflow-hidden">
        <CardHeader className="flex flex-row items-center gap-3 py-4 px-6 border-b bg-secondary/30">
          <Plus size={16} className="text-navy" />
          <CardTitle className="font-heading text-navy text-base">
            Add Email to Whitelist
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-heading text-xs font-semibold text-navy/70 uppercase tracking-wide">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    data-ocid="admin.whitelist.email_input"
                    type="email"
                    placeholder="e.g. user@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="pl-9 font-body h-10 border-border/70"
                    disabled={addEmail.isPending}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="font-heading text-xs font-semibold text-navy/70 uppercase tracking-wide">
                  Note (optional)
                </Label>
                <Textarea
                  data-ocid="admin.whitelist.note_input"
                  placeholder="e.g. Job seeker from London"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="font-body text-sm border-border/70 min-h-[40px] h-10 resize-none"
                  disabled={addEmail.isPending}
                />
              </div>
            </div>

            {addError && (
              <p
                data-ocid="admin.whitelist.error_state"
                className="text-sm font-body text-destructive bg-destructive/8 rounded-lg px-3 py-2"
              >
                {addError}
              </p>
            )}
            {addSuccess && (
              <p
                data-ocid="admin.whitelist.success_state"
                className="text-sm font-body text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2"
              >
                {addSuccess}
              </p>
            )}

            <Button
              type="submit"
              data-ocid="admin.whitelist.submit_button"
              disabled={addEmail.isPending}
              className="bg-navy hover:bg-navy/90 text-white font-heading font-bold text-sm"
            >
              {addEmail.isPending ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={14} className="mr-2" />
                  Add to Whitelist
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Whitelist table */}
      <Card className="border-border/60 shadow-card overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b bg-secondary/30">
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-navy" />
            <CardTitle className="font-heading text-navy text-base">
              Whitelisted Emails ({whitelist?.length ?? 0})
            </CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchWhitelist()}
            disabled={whitelistLoading}
            className="font-heading text-xs border-border/60"
          >
            <RefreshCw
              size={13}
              className={`mr-1.5 ${whitelistLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {whitelistLoading ? (
            <TableSkeleton cols={6} />
          ) : !whitelist?.length ? (
            <div
              data-ocid="admin.whitelist.empty_state"
              className="py-16 text-center"
            >
              <Mail
                size={32}
                className="text-muted-foreground/30 mx-auto mb-3"
              />
              <p className="font-body text-sm text-muted-foreground">
                No whitelisted emails yet. Add one above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="admin.whitelist.table">
                <TableHeader>
                  <TableRow className="bg-secondary/20">
                    <TableHead className="font-heading text-xs text-navy/70 uppercase tracking-wide">
                      #
                    </TableHead>
                    <TableHead className="font-heading text-xs text-navy/70 uppercase tracking-wide">
                      Email
                    </TableHead>
                    <TableHead className="font-heading text-xs text-navy/70 uppercase tracking-wide">
                      Note
                    </TableHead>
                    <TableHead className="font-heading text-xs text-navy/70 uppercase tracking-wide">
                      Added
                    </TableHead>
                    <TableHead className="font-heading text-xs text-navy/70 uppercase tracking-wide">
                      Remove
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {whitelist.map((entry: WhitelistEntry, i: number) => (
                    <TableRow
                      key={entry.email}
                      data-ocid={`admin.whitelist.table.row.${i + 1}`}
                      className="hover:bg-secondary/20 transition-colors"
                    >
                      <TableCell className="font-body text-xs text-muted-foreground">
                        {i + 1}
                      </TableCell>
                      <TableCell className="font-heading font-semibold text-navy text-sm whitespace-nowrap">
                        {entry.email}
                      </TableCell>
                      <TableCell className="font-body text-xs text-muted-foreground max-w-[200px]">
                        <p className="line-clamp-2">{entry.note || "—"}</p>
                      </TableCell>
                      <TableCell className="font-body text-xs text-muted-foreground whitespace-nowrap">
                        {formatAddedAt(entry.addedAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          data-ocid={`admin.whitelist.table.row.${i + 1}.delete_button`}
                          onClick={() => handleRemove(entry.email)}
                          disabled={removeEmail.isPending}
                          className="h-8 text-xs font-heading border-destructive/40 text-destructive hover:bg-destructive hover:text-white transition-colors"
                        >
                          <Trash2 size={12} className="mr-1.5" />
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ClaimAdminPage({
  identity,
}: { identity: ReturnType<typeof useInternetIdentity>["identity"] }) {
  const claimAdmin = useClaimAdminAccess();
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError("Please enter your admin token.");
      return;
    }
    setError(null);
    try {
      await claimAdmin.mutateAsync(token.trim());
      setSuccess(true);
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      setError(
        "Invalid token or admin access already assigned. Make sure you entered the correct CAFFEINE_ADMIN_TOKEN.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-background pt-24 lg:pt-28 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-6"
      >
        {/* Access Denied notice */}
        <div className="text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={28} className="text-destructive" />
          </div>
          <h1 className="font-display text-2xl font-bold text-navy mb-3">
            Access Denied
          </h1>
          <p className="font-body text-muted-foreground mb-4">
            Your account does not have administrator privileges yet.
          </p>
          <div className="bg-muted/50 rounded-lg px-4 py-2 inline-block mb-6">
            <p className="font-body text-xs text-muted-foreground">
              Principal:{" "}
              <span className="font-heading font-medium text-navy text-xs">
                {identity?.getPrincipal().toString().slice(0, 20)}...
              </span>
            </p>
          </div>
        </div>

        {/* Claim Admin form */}
        <Card className="border-border/60 shadow-card">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <KeyRound size={16} className="text-navy" />
              <CardTitle className="font-heading text-navy text-base">
                Claim Admin Access
              </CardTitle>
            </div>
            <p className="font-body text-xs text-muted-foreground mt-1">
              Enter your{" "}
              <code className="bg-muted px-1 rounded text-navy font-mono text-xs">
                CAFFEINE_ADMIN_TOKEN
              </code>{" "}
              to register as administrator. This can only be claimed once.
            </p>
          </CardHeader>
          <CardContent>
            {success ? (
              <div
                data-ocid="admin.claim.success_state"
                className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3"
              >
                <ShieldAlert size={16} className="text-green-600" />
                <p className="font-body text-sm">
                  Admin access granted! Refreshing...
                </p>
              </div>
            ) : (
              <form onSubmit={handleClaim} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="font-heading text-xs font-semibold text-navy/70 uppercase tracking-wide">
                    Admin Token
                  </Label>
                  <div className="relative">
                    <Lock
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      data-ocid="admin.claim.input"
                      type={showToken ? "text" : "password"}
                      placeholder="Paste your admin token here"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="pl-9 pr-10 font-body h-10 border-border/70"
                      disabled={claimAdmin.isPending}
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy"
                      tabIndex={-1}
                    >
                      {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p
                    data-ocid="admin.claim.error_state"
                    className="text-sm font-body text-destructive bg-destructive/8 rounded-lg px-3 py-2"
                  >
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  data-ocid="admin.claim.submit_button"
                  disabled={claimAdmin.isPending}
                  className="w-full bg-navy hover:bg-navy/90 text-white font-heading font-bold"
                >
                  {claimAdmin.isPending ? (
                    <>
                      <Loader2 size={14} className="mr-2 animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    <>
                      <ShieldAlert size={14} className="mr-2" />
                      Claim Admin Access
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center font-body text-xs text-muted-foreground">
          Your admin token is the{" "}
          <code className="bg-muted px-1 rounded font-mono">
            CAFFEINE_ADMIN_TOKEN
          </code>{" "}
          from your canister settings. Contact Caffeine support if you don't
          have it.
        </p>
      </motion.div>
    </main>
  );
}

export function AdminPage() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = !!identity;

  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const {
    data: jobPostings,
    isLoading: jobsLoading,
    refetch: refetchJobs,
  } = useAllJobPostings();
  const {
    data: candidates,
    isLoading: candidatesLoading,
    refetch: refetchCandidates,
  } = useAllCandidateProfiles();

  const isLoggingIn = loginStatus === "logging-in";

  // Not logged in
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-background pt-24 lg:pt-28 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-navy/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={28} className="text-navy/60" />
          </div>
          <h1 className="font-display text-2xl font-bold text-navy mb-3">
            Admin Access
          </h1>
          <p className="font-body text-muted-foreground mb-8">
            Sign in to access the admin dashboard. Only authorised
            administrators can view this section.
          </p>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="bg-navy hover:bg-navy/90 text-white font-heading font-bold px-8 py-5"
          >
            {isLoggingIn ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                <LogIn size={16} className="mr-2" />
                Sign In
              </>
            )}
          </Button>
        </motion.div>
      </main>
    );
  }

  // Logged in but checking admin status
  if (adminLoading) {
    return (
      <main className="min-h-screen bg-background pt-24 lg:pt-28 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-navy mx-auto mb-4" />
          <p className="font-body text-muted-foreground">
            Verifying admin access...
          </p>
        </div>
      </main>
    );
  }

  // Logged in but NOT admin -- show claim admin form
  if (!isAdmin) {
    return <ClaimAdminPage identity={identity} />;
  }

  // Full admin dashboard
  return (
    <main className="min-h-screen bg-background pt-24 lg:pt-28">
      {/* Header */}
      <div className="bg-navy py-14 lg:py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 border border-gold/10 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gold/15 rounded-lg">
                <ShieldAlert size={18} className="text-gold" />
              </div>
              <span className="text-gold text-xs font-heading font-semibold uppercase tracking-widest">
                Administrator
              </span>
            </div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-white mb-1">
              Admin Dashboard
            </h1>
            <p className="font-body text-white/50 text-sm">
              Viewing as: {identity?.getPrincipal().toString().slice(0, 28)}...
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats row */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap gap-6 lg:gap-8">
          <div className="flex items-center gap-3">
            <Briefcase size={18} className="text-navy" />
            <div>
              <p className="font-body text-xs text-muted-foreground">
                Total Postings
              </p>
              <p className="font-heading font-bold text-navy text-lg leading-none">
                {jobsLoading ? "—" : (jobPostings?.length ?? 0)}
              </p>
            </div>
          </div>
          <div className="w-px bg-border h-8 self-center" />
          <div className="flex items-center gap-3">
            <Users size={18} className="text-navy" />
            <div>
              <p className="font-body text-xs text-muted-foreground">
                Total Candidates
              </p>
              <p className="font-heading font-bold text-navy text-lg leading-none">
                {candidatesLoading ? "—" : (candidates?.length ?? 0)}
              </p>
            </div>
          </div>
          <div className="w-px bg-border h-8 self-center" />
          <div className="flex items-center gap-3">
            <UserCog size={18} className="text-navy" />
            <div>
              <p className="font-body text-xs text-muted-foreground">
                Portal Users
              </p>
              <p className="font-heading font-bold text-navy text-lg leading-none">
                —
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue="job-postings">
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              <TabsList className="bg-secondary">
                <TabsTrigger
                  data-ocid="admin.job_postings_tab"
                  value="job-postings"
                  className="font-heading data-[state=active]:bg-navy data-[state=active]:text-white"
                >
                  <Briefcase size={14} className="mr-2" />
                  Job Postings
                </TabsTrigger>
                <TabsTrigger
                  data-ocid="admin.candidates_tab"
                  value="candidates"
                  className="font-heading data-[state=active]:bg-navy data-[state=active]:text-white"
                >
                  <Users size={14} className="mr-2" />
                  Candidate Profiles
                </TabsTrigger>
                <TabsTrigger
                  data-ocid="admin.portal_users_tab"
                  value="portal-users"
                  className="font-heading data-[state=active]:bg-navy data-[state=active]:text-white"
                >
                  <UserCog size={14} className="mr-2" />
                  Portal Users
                </TabsTrigger>
                <TabsTrigger
                  data-ocid="admin.whitelist_tab"
                  value="whitelist"
                  className="font-heading data-[state=active]:bg-navy data-[state=active]:text-white"
                >
                  <Mail size={14} className="mr-2" />
                  Email Whitelist
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Job Postings Tab */}
            <TabsContent value="job-postings">
              <Card className="border-border/60 shadow-card overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b bg-secondary/30">
                  <CardTitle className="font-heading text-navy text-base">
                    All Job Postings ({jobPostings?.length ?? 0})
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchJobs()}
                    disabled={jobsLoading}
                    className="font-heading text-xs border-border/60"
                  >
                    <RefreshCw
                      size={13}
                      className={`mr-1.5 ${jobsLoading ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {jobsLoading ? (
                    <TableSkeleton cols={6} />
                  ) : !jobPostings?.length ? (
                    <div className="py-16 text-center">
                      <Briefcase
                        size={32}
                        className="text-muted-foreground/30 mx-auto mb-3"
                      />
                      <p className="font-body text-sm text-muted-foreground">
                        No job postings yet.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table data-ocid="admin.job_postings_table">
                        <TableHeader>
                          <TableRow className="bg-secondary/20">
                            <TableHead className="font-heading text-xs text-navy/70 uppercase tracking-wide">
                              #
                            </TableHead>
                            <TableHead className="font-heading text-xs text-navy/70 uppercase tracking-wide">
                              Company
                            </TableHead>
                            <TableHead className="font-heading text-xs text-navy/70 uppercase tracking-wide">
                              Job Title
                            </TableHead>
                            <TableHead className="font-heading text-xs text-navy/70 uppercase tracking-wide">
                              Role Type
                            </TableHead>
                            <TableHead className="font-heading text-xs text-navy/70 uppercase tracking-wide">
                              Skills
                            </TableHead>
                            <TableHead className="font-heading text-xs text-navy/70 uppercase tracking-wide">
                              Email
                            </TableHead>
                            <TableHead className="font-heading text-xs text-navy/70 uppercase tracking-wide">
                              Date
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {jobPostings.map((posting, i) => (
                            <TableRow
                              key={posting.postingId.toString()}
                              data-ocid={`admin.job_postings_table.row.${i + 1}`}
                              className="hover:bg-secondary/20 transition-colors"
                            >
                              <TableCell className="font-body text-xs text-muted-foreground">
                                {i + 1}
                              </TableCell>
                              <TableCell className="font-heading font-semibold text-navy text-sm whitespace-nowrap">
                                {posting.companyName}
                              </TableCell>
                              <TableCell className="font-body text-sm whitespace-nowrap">
                                {posting.jobTitle}
                              </TableCell>
                              <TableCell>
                                <RoleBadge roleType={posting.roleType} />
                              </TableCell>
                              <TableCell className="max-w-[200px]">
                                <div className="flex flex-wrap gap-1">
                                  {posting.requiredSkills
                                    .slice(0, 3)
                                    .map((s) => (
                                      <Badge
                                        key={s}
                                        variant="secondary"
                                        className="font-body text-xs"
                                      >
                                        {s}
                                      </Badge>
                                    ))}
                                  {posting.requiredSkills.length > 3 && (
                                    <Badge
                                      variant="secondary"
                                      className="font-body text-xs text-muted-foreground"
                                    >
                                      +{posting.requiredSkills.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="font-body text-xs text-muted-foreground whitespace-nowrap">
                                {posting.contactEmail}
                              </TableCell>
                              <TableCell className="font-body text-xs text-muted-foreground whitespace-nowrap">
                                {formatTimestamp(posting.timestamp)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Candidates Tab */}
            <TabsContent value="candidates">
              <Card className="border-border/60 shadow-card overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b bg-secondary/30">
                  <CardTitle className="font-heading text-navy text-base">
                    All Candidate Profiles ({candidates?.length ?? 0})
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchCandidates()}
                    disabled={candidatesLoading}
                    className="font-heading text-xs border-border/60"
                  >
                    <RefreshCw
                      size={13}
                      className={`mr-1.5 ${candidatesLoading ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {candidatesLoading ? (
                    <TableSkeleton cols={6} />
                  ) : !candidates?.length ? (
                    <div className="py-16 text-center">
                      <Users
                        size={32}
                        className="text-muted-foreground/30 mx-auto mb-3"
                      />
                      <p className="font-body text-sm text-muted-foreground">
                        No candidate profiles yet.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table data-ocid="admin.candidates_table">
                        <TableHeader>
                          <TableRow className="bg-secondary/20">
                            <TableHead className="font-heading text-xs text-navy/70 uppercase tracking-wide">
                              #
                            </TableHead>
                            <TableHead className="font-heading text-xs text-navy/70 uppercase tracking-wide">
                              Name
                            </TableHead>
                            <TableHead className="font-heading text-xs text-navy/70 uppercase tracking-wide">
                              Email
                            </TableHead>
                            <TableHead className="font-heading text-xs text-navy/70 uppercase tracking-wide">
                              Skills
                            </TableHead>
                            <TableHead className="font-heading text-xs text-navy/70 uppercase tracking-wide">
                              Role Type
                            </TableHead>
                            <TableHead className="font-heading text-xs text-navy/70 uppercase tracking-wide">
                              CV / Portfolio
                            </TableHead>
                            <TableHead className="font-heading text-xs text-navy/70 uppercase tracking-wide">
                              Bio
                            </TableHead>
                            <TableHead className="font-heading text-xs text-navy/70 uppercase tracking-wide">
                              Date
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {candidates.map((candidate, i) => (
                            <TableRow
                              key={candidate.profileId.toString()}
                              data-ocid={`admin.candidates_table.row.${i + 1}`}
                              className="hover:bg-secondary/20 transition-colors"
                            >
                              <TableCell className="font-body text-xs text-muted-foreground">
                                {i + 1}
                              </TableCell>
                              <TableCell className="font-heading font-semibold text-navy text-sm whitespace-nowrap">
                                {candidate.fullName}
                              </TableCell>
                              <TableCell className="font-body text-xs text-muted-foreground whitespace-nowrap">
                                {candidate.email}
                              </TableCell>
                              <TableCell className="max-w-[180px]">
                                <div className="flex flex-wrap gap-1">
                                  {candidate.skills.slice(0, 3).map((s) => (
                                    <Badge
                                      key={s}
                                      variant="secondary"
                                      className="font-body text-xs"
                                    >
                                      {s}
                                    </Badge>
                                  ))}
                                  {candidate.skills.length > 3 && (
                                    <Badge
                                      variant="secondary"
                                      className="font-body text-xs text-muted-foreground"
                                    >
                                      +{candidate.skills.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <RoleBadge
                                  roleType={candidate.preferredRoleType}
                                />
                              </TableCell>
                              <TableCell>
                                {candidate.cvLink ? (
                                  <a
                                    href={candidate.cvLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-navy hover:text-gold transition-colors text-xs font-body"
                                  >
                                    View <ExternalLink size={11} />
                                  </a>
                                ) : (
                                  <span className="text-muted-foreground text-xs font-body">
                                    —
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="max-w-[200px]">
                                <p className="font-body text-xs text-muted-foreground line-clamp-2">
                                  {candidate.bio || "—"}
                                </p>
                              </TableCell>
                              <TableCell className="font-body text-xs text-muted-foreground whitespace-nowrap">
                                {formatTimestamp(candidate.timestamp)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            {/* Portal Users Tab */}
            <TabsContent value="portal-users">
              <PortalUsersTab />
            </TabsContent>
            {/* Email Whitelist Tab */}
            <TabsContent value="whitelist">
              <EmailWhitelistTab />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </main>
  );
}
