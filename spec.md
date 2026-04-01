# TalentHunting

## Current State
Professional recruitment website with:
- Public homepage with hero, services, stats, testimonials, CTA sections
- Job Seeker and Employer portal dashboards (login-gated)
- Admin dashboard for user/whitelist management
- Navy/gold color scheme with Fraunces/Cabinet Grotesk fonts
- Authorization via Internet Identity + CAFFEINE_ADMIN_TOKEN

## Requested Changes (Diff)

### Add
- **Video Call Feature**: In-browser video call capability for job seekers and employers using WebRTC (camera/mic access). Add a "Schedule / Start Video Call" section in both portal dashboards. Implement a full-screen VideoCallModal with: own camera preview, mute/end controls, simulated incoming call UI, and a scheduled calls list.
- **Monthly Completed Profiles Stats**: A new homepage stats section showing monthly completed profiles (starting value: 4 this month, growing trend). Add to the existing stats bar on the homepage as a new stat card — "Profiles Completed This Month: 4". Also show a monthly progress chart/visualization on the dashboards.
- **Modernized Design**: Elevate the visual design with glassmorphism cards, subtle gradient overlays, animated counters, improved typography hierarchy, a more vibrant hero with animated background elements, and cleaner dashboard layouts.

### Modify
- **HomePage**: Add monthly profiles stat card (value: 4) to the stats section. Add animated number counters. Improve hero section with floating animated elements.
- **JobSeekerDashboardPage**: Add video call card with "Start/Schedule Call" button and upcoming calls list.
- **EmployerDashboardPage**: Add video call card with "Initiate Call" button and a simple call history.
- **Backend**: Add `getMonthlyCompletedProfiles` query returning Nat, add `scheduleVideoCall` and `getScheduledCalls` functions for storing call appointments.

### Remove
- Nothing removed

## Implementation Plan
1. Update backend (main.mo) to add monthly profile stats and video call scheduling APIs
2. Create VideoCallModal component using WebRTC getUserMedia for camera preview
3. Update HomePage stats to include monthly profiles count (4)
4. Update JobSeekerDashboardPage with video call section
5. Update EmployerDashboardPage with video call section  
6. Modernize overall styling: glassmorphism cards, animated counters, improved hero
