import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  User,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callerName: string;
  callerRole?: string;
}

type CallStatus = "connecting" | "in-call" | "ended";

export function VideoCallModal({
  isOpen,
  onClose,
  callerName,
  callerRole = "Talent Specialist",
}: VideoCallModalProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>("connecting");
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setCallStatus("connecting");
    setIsMuted(false);
    setIsCameraOff(false);

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setTimeout(() => setCallStatus("in-call"), 1800);
      })
      .catch(() => {
        toast.error(
          "Camera/microphone access denied. Please allow permissions.",
        );
        setCallStatus("ended");
      });

    return () => {
      stopStream();
    };
  }, [isOpen]);

  const stopStream = () => {
    if (streamRef.current) {
      for (const t of streamRef.current.getTracks()) {
        t.stop();
      }
      streamRef.current = null;
    }
  };

  const handleEndCall = () => {
    stopStream();
    setCallStatus("ended");
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const toggleMute = () => {
    if (!streamRef.current) return;
    for (const t of streamRef.current.getAudioTracks()) {
      t.enabled = isMuted;
    }
    setIsMuted((prev) => !prev);
  };

  const toggleCamera = () => {
    if (!streamRef.current) return;
    for (const t of streamRef.current.getVideoTracks()) {
      t.enabled = isCameraOff;
    }
    setIsCameraOff((prev) => !prev);
  };

  const statusLabel =
    callStatus === "connecting"
      ? "Connecting..."
      : callStatus === "in-call"
        ? "In Call"
        : "Call Ended";

  const statusColor =
    callStatus === "connecting"
      ? "text-yellow-400"
      : callStatus === "in-call"
        ? "text-emerald-400"
        : "text-red-400";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          data-ocid="videocall.modal"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-4xl h-[90vh] max-h-[700px] flex flex-col overflow-hidden rounded-2xl bg-zinc-900"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-zinc-900/80 backdrop-blur-sm border-b border-white/5 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-navy/30 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-white/70" />
                </div>
                <div>
                  <p className="font-heading font-bold text-white text-sm">
                    {callerName}
                  </p>
                  <p className="font-body text-xs text-white/50">
                    {callerRole}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-heading font-semibold uppercase tracking-wider flex items-center gap-1.5 ${statusColor}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      callStatus === "in-call"
                        ? "bg-emerald-400 animate-pulse"
                        : callStatus === "connecting"
                          ? "bg-yellow-400 animate-ping"
                          : "bg-red-400"
                    }`}
                  />
                  {statusLabel}
                </span>
              </div>
            </div>

            {/* Remote video area */}
            <div className="flex-1 relative bg-zinc-950 flex items-center justify-center overflow-hidden">
              <div className="flex flex-col items-center gap-4 text-center select-none">
                <motion.div
                  animate={
                    callStatus === "in-call" ? { scale: [1, 1.04, 1] } : {}
                  }
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
                  className="w-28 h-28 rounded-full bg-gradient-to-br from-navy/60 to-gold/20 border-2 border-white/10 flex items-center justify-center"
                >
                  <Video size={44} className="text-white/30" />
                </motion.div>
                {callStatus === "connecting" && (
                  <p className="font-body text-white/40 text-sm">
                    Waiting for specialist to connect...
                  </p>
                )}
                {callStatus === "in-call" && (
                  <p className="font-body text-white/30 text-sm">
                    TalentHunting Specialist
                  </p>
                )}
                {callStatus === "ended" && (
                  <p className="font-body text-white/50 text-base">
                    Call Ended
                  </p>
                )}
              </div>

              {/* Gradient mesh background */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-navy/10 blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-gold/5 blur-3xl" />
              </div>

              {/* Self-view PiP */}
              <div className="absolute bottom-4 right-4 w-32 sm:w-40 aspect-video rounded-xl overflow-hidden border-2 border-white/10 shadow-2xl bg-zinc-900">
                {isCameraOff ? (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                    <CameraOff size={20} className="text-white/30" />
                  </div>
                ) : (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                )}
                <div className="absolute bottom-1 left-1.5">
                  <span className="text-[10px] font-heading font-semibold text-white/60">
                    You
                  </span>
                </div>
              </div>
            </div>

            {/* Control bar */}
            <div className="flex items-center justify-center gap-4 px-6 py-5 bg-zinc-900 border-t border-white/5">
              <button
                type="button"
                data-ocid="videocall.toggle"
                onClick={toggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                  isMuted
                    ? "bg-red-500/20 border border-red-400/40 text-red-400"
                    : "bg-white/10 border border-white/10 text-white hover:bg-white/15"
                }`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <button
                type="button"
                data-ocid="videocall.secondary_button"
                onClick={toggleCamera}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                  isCameraOff
                    ? "bg-red-500/20 border border-red-400/40 text-red-400"
                    : "bg-white/10 border border-white/10 text-white hover:bg-white/15"
                }`}
                title={isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
              >
                {isCameraOff ? <CameraOff size={18} /> : <Camera size={18} />}
              </button>

              <button
                type="button"
                data-ocid="videocall.delete_button"
                onClick={handleEndCall}
                className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg shadow-red-900/40"
                title="End Call"
              >
                <PhoneOff size={22} className="text-white" />
              </button>

              <button
                type="button"
                className="w-12 h-12 rounded-full bg-white/10 border border-white/10 text-white/50 flex items-center justify-center"
                disabled
                title="More options (coming soon)"
              >
                <Phone size={18} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ───────────────────────────────────────────────
   Schedule Video Call Form Card
─────────────────────────────────────────────── */
interface ScheduleCardProps {
  username: string | null;
}

interface ScheduledSlot {
  date: string;
  time: string;
  name: string;
}

const MOCK_SLOTS: ScheduledSlot[] = [
  { date: "Wed 2 Apr", time: "10:00 AM", name: "James Okonkwo" },
  { date: "Thu 3 Apr", time: "2:30 PM", name: "Priya Sharma" },
  { date: "Fri 4 Apr", time: "11:00 AM", name: "Sarah Mitchell" },
];

export function VideoConsultationsCard({ username }: ScheduleCardProps) {
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [scheduleName, setScheduleName] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [slots, setSlots] = useState<ScheduledSlot[]>(MOCK_SLOTS);
  const [showForm, setShowForm] = useState(false);

  const handleSchedule = () => {
    if (!scheduleName.trim() || !scheduleDate) {
      toast.error("Please fill in all fields.");
      return;
    }
    const d = new Date(scheduleDate);
    const formatted = d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    const timeStr = d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setSlots((prev) => [
      { date: formatted, time: timeStr, name: scheduleName },
      ...prev,
    ]);
    setScheduleName("");
    setScheduleDate("");
    setShowForm(false);
    toast.success("Video call scheduled successfully!");
  };

  return (
    <>
      <VideoCallModal
        isOpen={isCallOpen}
        onClose={() => setIsCallOpen(false)}
        callerName={username ?? "You"}
        callerRole="Portal User"
      />

      <div className="rounded-2xl border border-border/60 bg-white shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-300">
        <div className="h-1 bg-gradient-to-r from-navy via-gold to-navy" />

        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-navy/8 rounded-xl">
                <Video size={18} className="text-navy" />
              </div>
              <h3 className="font-heading font-bold text-navy text-base">
                Video Consultations
              </h3>
            </div>
            <button
              type="button"
              data-ocid="videocall.open_modal_button"
              onClick={() => setIsCallOpen(true)}
              className="inline-flex items-center gap-1.5 bg-navy hover:bg-navy/90 text-white font-heading font-semibold text-xs py-2 px-3.5 rounded-lg transition-all duration-200 hover:scale-[1.02] shadow-sm"
            >
              <Video size={12} />
              Start Video Call
            </button>
          </div>

          {/* Upcoming slots */}
          <div className="space-y-2 mb-4">
            <p className="text-[11px] font-heading font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Upcoming Calls
            </p>
            {slots.slice(0, 3).map((slot) => (
              <div
                key={`${slot.date}-${slot.name}`}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/50 border border-border/40"
              >
                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Phone size={13} className="text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold text-navy text-xs truncate">
                    {slot.name}
                  </p>
                  <p className="font-body text-[11px] text-muted-foreground">
                    {slot.date} · {slot.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {!showForm ? (
            <Button
              data-ocid="videocall.secondary_button"
              variant="outline"
              size="sm"
              onClick={() => setShowForm(true)}
              className="w-full font-heading text-xs border-border/60 text-muted-foreground hover:border-navy/30 hover:text-navy transition-all duration-200"
            >
              + Schedule a New Call
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 pt-2 border-t border-border/40"
            >
              <p className="text-[11px] font-heading font-semibold uppercase tracking-widest text-muted-foreground mt-2">
                New Scheduled Call
              </p>
              <div className="space-y-2">
                <Label className="text-xs font-heading text-navy/70">
                  Counterpart Name
                </Label>
                <Input
                  data-ocid="videocall.input"
                  value={scheduleName}
                  onChange={(e) => setScheduleName(e.target.value)}
                  placeholder="e.g. James Okonkwo"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-heading text-navy/70">
                  Date &amp; Time
                </Label>
                <Input
                  data-ocid="videocall.input"
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  data-ocid="videocall.submit_button"
                  size="sm"
                  onClick={handleSchedule}
                  className="flex-1 bg-navy hover:bg-navy/90 text-white font-heading text-xs h-8"
                >
                  Schedule
                </Button>
                <Button
                  data-ocid="videocall.cancel_button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="font-heading text-xs h-8"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
