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
    email : Text;
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

  let postings = Map.empty<JobPostingId, JobPosting>();
  let candidates = Map.empty<CandidateId, CandidateProfile>();
  let portalUsers = Map.empty<Text, PortalUser>();
  let portalSessions = Map.empty<Text, PortalSession>();
  let userProfiles = Map.empty<Principal, UserProfile>();
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
    portalSessions.remove(token);
  };

  public query ({ caller }) func getPortalSession(token : SessionToken) : async ?{
    username : Text;
    portalRole : PortalRole;
  } {
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
    postings.size();
  };

  public query ({ caller }) func getCandidateProfileCount() : async Nat {
    candidates.size();
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
};

