import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type JobPostingId = Nat;
  type CandidateId = Nat;
  type Timestamp = Int;
  type SessionToken = Text;
  type VideoCallId = Nat;

  type RoleType = {
    #fullTime;
    #partTime;
    #contract;
  };

  public type PortalRole = {
    #jobSeeker;
    #employer;
  };

  public type JobPosting = {
    companyName : Text;
    jobTitle : Text;
    roleType : RoleType;
    requiredSkills : [Text];
    jobDescription : Text;
    contactEmail : Text;
    postingId : JobPostingId;
    timestamp : Timestamp;
  };

  public type CandidateProfile = {
    fullName : Text;
    email : Text;
    skills : [Text];
    preferredRoleType : RoleType;
    cvLink : Text;
    bio : Text;
    profileId : CandidateId;
    timestamp : Timestamp;
  };

  public type UserProfile = {
    name : Text;
    email : Text; // This should be unique to each user
  };

  public type PortalUser = {
    username : Text;
    passwordHash : Text;
    portalRole : PortalRole;
  };

  public type PortalSession = {
    username : Text;
    portalRole : PortalRole;
    createdAt : Timestamp;
  };

  public type WhitelistEntry = {
    email : Text;
    note : Text;
    addedAt : Timestamp;
  };

  public type IVideoCallStatus = {
    #pending;
    #confirmed;
    #completed;
    #cancelled;
  };

  public type IVideoCall = {
    callId : VideoCallId;
    scheduledBy : Text; // username of job seeker or employer
    invitedUser : Text; // Username of the invited job seeker/employer
    scheduledAt : Timestamp;
    durationMinutes : Nat;
    status : IVideoCallStatus;
    notes : Text;
    createdAt : Timestamp;
  };

  module JobPosting {
    public func compare(posting1 : JobPosting, posting2 : JobPosting) : Order.Order {
      Nat.compare(posting1.postingId, posting2.postingId);
    };
  };

  module CandidateProfile {
    public func compare(profile1 : CandidateProfile, profile2 : CandidateProfile) : Order.Order {
      Nat.compare(profile1.profileId, profile2.profileId);
    };
  };

  module IVideoCall {
    public func compare(call1 : IVideoCall, call2 : IVideoCall) : Order.Order {
      Nat.compare(call1.callId, call2.callId);
    };
  };

  let postings = Map.empty<JobPostingId, JobPosting>();
  let candidates = Map.empty<CandidateId, CandidateProfile>();
  let portalUsers = Map.empty<Text, PortalUser>();
  let portalSessions = Map.empty<Text, PortalSession>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let videoCalls = Map.empty<VideoCallId, IVideoCall>();
  let emailWhitelist = Map.fromIter<Text, WhitelistEntry>(
    [(
      "vinayk1907@gmail.com",
      {
        email = "vinayk1907@gmail.com";
        note = "Site Owner / Admin Access";
        addedAt = 0;
      },
    )].values()
  );

  var nextPostingId = 0;
  var nextSessionId = 0;
  var nextCandidateId = 0;
  var nextVideoCallId = 0;
  var monthlyCompletedProfiles = 4;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  //
  // Email Whitelist Functions
  //
  public shared ({ caller }) func addEmailToWhitelist(email : Text, note : Text) : async () {
    enforceAdminAccess(caller);
    let entry : WhitelistEntry = {
      email;
      note;
      addedAt = Time.now();
    };
    emailWhitelist.add(email, entry);
  };

  public shared ({ caller }) func removeEmailFromWhitelist(email : Text) : async () {
    enforceAdminAccess(caller);
    if (not emailWhitelist.containsKey(email)) {
      Runtime.trap("Email not found in whitelist");
    };
    emailWhitelist.remove(email);
  };

  public shared ({ caller }) func listEmailWhitelist() : async [WhitelistEntry] {
    enforceAdminAccess(caller);
    emailWhitelist.values().toArray();
  };

  public query ({ caller }) func isEmailWhitelisted(email : Text) : async Bool {
    // Public query - no authorization needed
    emailWhitelist.containsKey(email);
  };

  //
  // Credential Portal Functions
  //
  public shared ({ caller }) func addPortalUser(username : Text, passwordHash : Text, portalRole : PortalRole) : async () {
    enforceAdminAccess(caller);
    if (portalUsers.containsKey(username)) {
      Runtime.trap("User already exists");
    };
    let newUser : PortalUser = {
      username;
      passwordHash;
      portalRole;
    };
    portalUsers.add(username, newUser);
  };

  public shared ({ caller }) func loginPortalUser(username : Text, passwordHash : Text) : async SessionToken {
    // Public function - no authorization needed for login
    let user = switch (portalUsers.get(username)) {
      case (?u) { u };
      case (null) { Runtime.trap("Invalid credentials") };
    };
    if (user.passwordHash != passwordHash) {
      Runtime.trap("Invalid credentials");
    };
    let token = "session_" # nextSessionId.toText();
    nextSessionId += 1;
    let session : PortalSession = {
      username;
      portalRole = user.portalRole;
      createdAt = Time.now();
    };
    portalSessions.add(token, session);
    token;
  };

  public shared ({ caller }) func logoutPortalUser(token : SessionToken) : async () {
    // Public function - anyone can logout a session
    portalSessions.remove(token);
  };

  public query ({ caller }) func getPortalSession(token : SessionToken) : async ?{
    username : Text;
    portalRole : PortalRole;
  } {
    // Public query - needed for session validation
    portalSessions.get(token);
  };

  public shared ({ caller }) func listPortalUsers() : async [{
    username : Text;
    portalRole : PortalRole;
  }] {
    enforceAdminAccess(caller);
    portalUsers.values().toArray().map(func(user) { { username = user.username; portalRole = user.portalRole } });
  };

  public shared ({ caller }) func changePortalUserPassword(username : Text, newPasswordHash : Text) : async () {
    enforceAdminAccess(caller);
    let user = switch (portalUsers.get(username)) {
      case (?u) { u };
      case (null) { Runtime.trap("User not found") };
    };
    let updatedUser = {
      user with
      passwordHash = newPasswordHash;
    };
    portalUsers.add(username, updatedUser);
  };

  //
  // User Profile Methods
  //
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    enforceUserAccess(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user) {
      enforceAdminAccess(caller);
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    enforceUserAccess(caller);
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func findUserByEmail(email : Text) : async ?UserProfile {
    enforceUserAccess(caller);
    let userArray = userProfiles.toArray();
    let found = userArray.find(
      func((_p, u)) { u.email == email }
    );
    switch (found) {
      case (?(p, fp)) { ?fp };
      case (null) { null };
    };
  };

  //
  // Video Call Methods
  //
  public shared ({ caller }) func scheduleVideoCall(
    invitedUserEmail : Text,
    scheduledAt : Timestamp,
    durationMinutes : Nat,
    notes : Text,
  ) : async VideoCallId {
    enforceUserAccess(caller);

    // Get caller's username from their profile
    let callerProfile = switch (userProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Caller must have a user profile") };
    };

    // Verify invited user exists
    let invitedProfile = switch (findUserByEmailInternal(invitedUserEmail)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Invited user not found") };
    };

    let videoCall : IVideoCall = {
      callId = nextVideoCallId;
      scheduledBy = callerProfile.email;
      invitedUser = invitedUserEmail;
      scheduledAt;
      durationMinutes;
      status = #pending;
      notes;
      createdAt = Time.now();
    };

    videoCalls.add(nextVideoCallId, videoCall);
    nextVideoCallId += 1;
    videoCall.callId;
  };

  public shared ({ caller }) func confirmVideoCall(callId : VideoCallId) : async () {
    enforceUserAccess(caller);

    let callerProfile = switch (userProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Caller must have a user profile") };
    };

    let videoCall = switch (videoCalls.get(callId)) {
      case (?call) { call };
      case (null) { Runtime.trap("Video call not found") };
    };

    // Only the invited user can confirm
    if (videoCall.invitedUser != callerProfile.email) {
      Runtime.trap("Unauthorized: Only the invited user can confirm the call");
    };

    if (videoCall.status != #pending) {
      Runtime.trap("Can only confirm pending calls");
    };

    let updatedCall = {
      videoCall with
      status = #confirmed;
    };

    videoCalls.add(callId, updatedCall);
  };

  public shared ({ caller }) func cancelVideoCall(callId : VideoCallId) : async () {
    enforceUserAccess(caller);

    let callerProfile = switch (userProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Caller must have a user profile") };
    };

    let videoCall = switch (videoCalls.get(callId)) {
      case (?call) { call };
      case (null) { Runtime.trap("Video call not found") };
    };

    // Either participant can cancel
    if (videoCall.scheduledBy != callerProfile.email and videoCall.invitedUser != callerProfile.email) {
      Runtime.trap("Unauthorized: Only call participants can cancel");
    };

    if (videoCall.status == #completed or videoCall.status == #cancelled) {
      Runtime.trap("Cannot cancel completed or already cancelled calls");
    };

    let updatedCall = {
      videoCall with
      status = #cancelled;
    };

    videoCalls.add(callId, updatedCall);
  };

  public query ({ caller }) func getVideoCallDetails(callId : VideoCallId) : async ?IVideoCall {
    enforceUserAccess(caller);

    let callerProfile = switch (userProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Caller must have a user profile") };
    };

    let videoCall = switch (videoCalls.get(callId)) {
      case (?call) { call };
      case (null) { return null };
    };

    // Only participants or admins can view call details
    if (videoCall.scheduledBy != callerProfile.email and
        videoCall.invitedUser != callerProfile.email and
        not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only call participants can view details");
    };

    ?videoCall;
  };

  public query ({ caller }) func findCallsForUser(userEmail : Text) : async [IVideoCall] {
    enforceUserAccess(caller);

    let callerProfile = switch (userProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Caller must have a user profile") };
    };

    // Users can only view their own calls unless they're admin
    if (userEmail != callerProfile.email and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own calls");
    };

    let calls = videoCalls.values().toArray().filter(
      func(c) { c.invitedUser == userEmail or c.scheduledBy == userEmail }
    );

    calls.sort();
  };

  public query ({ caller }) func getVideoCallsCount() : async Nat {
    // Public query - anyone can see the count
    videoCalls.size();
  };

  //
  // Job Posting Methods
  //
  public shared ({ caller }) func submitJobPosting(
    companyName : Text,
    jobTitle : Text,
    roleType : RoleType,
    requiredSkills : [Text],
    jobDescription : Text,
    contactEmail : Text,
  ) : async JobPostingId {
    enforceUserAccess(caller);
    let posting : JobPosting = {
      companyName;
      jobTitle;
      roleType;
      requiredSkills;
      jobDescription;
      contactEmail;
      postingId = nextPostingId;
      timestamp = Time.now();
    };
    postings.add(nextPostingId, posting);
    nextPostingId += 1;
    posting.postingId;
  };

  public query ({ caller }) func getAllJobPostings() : async [JobPosting] {
    enforceAdminAccess(caller);
    postings.values().toArray().sort();
  };

  //
  // Candidate Profile Methods
  //
  public shared ({ caller }) func registerCandidateProfile(
    fullName : Text,
    email : Text,
    skills : [Text],
    preferredRoleType : RoleType,
    cvLink : Text,
    bio : Text,
  ) : async CandidateId {
    enforceUserAccess(caller);
    let profile : CandidateProfile = {
      fullName;
      email;
      skills;
      preferredRoleType;
      cvLink;
      bio;
      profileId = nextCandidateId;
      timestamp = Time.now();
    };
    candidates.add(nextCandidateId, profile);
    nextCandidateId += 1;
    profile.profileId;
  };

  public query ({ caller }) func getAllCandidateProfiles() : async [CandidateProfile] {
    enforceAdminAccess(caller);
    candidates.values().toArray().sort();
  };

  //
  // Count Getters
  //
  public query ({ caller }) func getJobPostingCount() : async Nat {
    enforceUserAccess(caller);
    postings.size();
  };

  public query ({ caller }) func getCandidateProfileCount() : async Nat {
    enforceUserAccess(caller);
    candidates.size();
  };

  public query ({ caller }) func getMonthlyCompletedProfiles() : async Nat {
    // Public query - anyone can see this metric
    monthlyCompletedProfiles;
  };

  public shared ({ caller }) func incrementMonthlyCompletedProfiles() : async () {
    enforceUserAccess(caller);
    monthlyCompletedProfiles += 1;
  };

  //
  // Helper Functions
  //
  func enforceUserAccess(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
  };

  func enforceAdminAccess(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  func findUserByEmailInternal(email : Text) : ?UserProfile {
    let userArray = userProfiles.toArray();
    let found = userArray.find(
      func((_p, u)) { u.email == email }
    );
    switch (found) {
      case (?(p, fp)) { ?fp };
      case (null) { null };
    };
  };
};
