import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type CandidateId = bigint;
export interface WhitelistEntry {
    note: string;
    email: string;
    addedAt: Timestamp;
}
export type Timestamp = bigint;
export type SessionToken = string;
export type JobPostingId = bigint;
export interface JobPosting {
    roleType: RoleType;
    jobDescription: string;
    jobTitle: string;
    timestamp: Timestamp;
    contactEmail: string;
    companyName: string;
    requiredSkills: Array<string>;
    postingId: JobPostingId;
}
export interface CandidateProfile {
    bio: string;
    profileId: CandidateId;
    fullName: string;
    email: string;
    timestamp: Timestamp;
    preferredRoleType: RoleType;
    cvLink: string;
    skills: Array<string>;
}
export interface UserProfile {
    name: string;
    email: string;
}
export enum PortalRole {
    employer = "employer",
    jobSeeker = "jobSeeker"
}
export enum RoleType {
    contract = "contract",
    partTime = "partTime",
    fullTime = "fullTime"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addEmailToWhitelist(email: string, note: string): Promise<void>;
    addPortalUser(username: string, passwordHash: string, portalRole: PortalRole): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    changePortalUserPassword(username: string, newPasswordHash: string): Promise<void>;
    getAllCandidateProfiles(): Promise<Array<CandidateProfile>>;
    getAllJobPostings(): Promise<Array<JobPosting>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCandidateProfileCount(): Promise<bigint>;
    getJobPostingCount(): Promise<bigint>;
    getPortalSession(token: SessionToken): Promise<{
        portalRole: PortalRole;
        username: string;
    } | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isEmailWhitelisted(email: string): Promise<boolean>;
    listEmailWhitelist(): Promise<Array<WhitelistEntry>>;
    listPortalUsers(): Promise<Array<{
        portalRole: PortalRole;
        username: string;
    }>>;
    loginPortalUser(username: string, passwordHash: string): Promise<SessionToken>;
    logoutPortalUser(token: SessionToken): Promise<void>;
    registerCandidateProfile(fullName: string, email: string, skills: Array<string>, preferredRoleType: RoleType, cvLink: string, bio: string): Promise<CandidateId>;
    removeEmailFromWhitelist(email: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitJobPosting(companyName: string, jobTitle: string, roleType: RoleType, requiredSkills: Array<string>, jobDescription: string, contactEmail: string): Promise<JobPostingId>;
}
