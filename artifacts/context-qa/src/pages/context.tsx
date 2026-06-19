import { useLocation } from "wouter";
import { IndigoSidebar } from "../components/IndigoSidebar";
import { AddContextDrawer } from "../components/AddContextDrawer";
import { WorkspaceDropdown } from "../components/WorkspaceDropdown";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

function DuoIcon({ icon, className = "" }: { icon: string; className?: string }) {
  return <i className={`fa-duotone solid fa-${icon} ${className}`} />;
}

const CONTEXT_SECTIONS = [
  { id: "knowledge",    label: "Knowledge",    icon: "lightbulb"  },
  { id: "requirements", label: "Requirements", icon: "list-check" },
];

type ItemStyle = "chip" | "note";

interface KnowledgeCategory {
  id: string;
  label: string;
  icon: string;
  desc: string;
  accent: string;
  accentBg: string;
  accentStrip: string;
  accentBadge: string;
  accentDash: string;
  style: ItemStyle;
  items: string[];
}

const INITIAL_CATEGORIES: KnowledgeCategory[] = [
  {
    id: "industry",
    label: "Industry",
    icon: "building",
    desc: "Market and domain this product operates in",
    accent: "text-indigo-600",
    accentBg: "bg-indigo-50",
    accentStrip: "bg-indigo-400",
    accentBadge: "bg-indigo-100 text-indigo-700",
    accentDash: "hover:border-indigo-300 hover:text-indigo-500",
    style: "chip",
    items: ["SaaS", "EdTech", "B2B Enterprise", "Incentive & Rewards", "HR Tech"],
  },
  {
    id: "workflows",
    label: "Key Workflows",
    icon: "arrow-progress",
    desc: "Critical user journeys that must always be tested",
    accent: "text-emerald-600",
    accentBg: "bg-emerald-50",
    accentStrip: "bg-emerald-400",
    accentBadge: "bg-emerald-100 text-emerald-700",
    accentDash: "hover:border-emerald-300 hover:text-emerald-500",
    style: "chip",
    items: [
      "Course Enrollment & Completion",
      "Points & Rewards Redemption",
      "Manager Dashboard & Reporting",
      "SSO / SAML Login",
      "Incentive Campaign Launch",
      "Leaderboard Ranking Update",
    ],
  },
  {
    id: "patterns",
    label: "Patterns",
    icon: "diagram-project",
    desc: "Recurring test strategies that apply across the app",
    accent: "text-violet-600",
    accentBg: "bg-violet-50",
    accentStrip: "bg-violet-400",
    accentBadge: "bg-violet-100 text-violet-700",
    accentDash: "hover:border-violet-300 hover:text-violet-500",
    style: "chip",
    items: [
      "Await balance_updated event before asserting points",
      "Run SCORM completion across Chrome, Firefox, Safari, Edge",
      "Assert 403 for all 4 role tiers on protected routes",
      "Test redemption race condition with concurrent sessions",
      "Use fixed UTC timestamps in leaderboard tie-break tests",
    ],
  },
  {
    id: "constraints",
    label: "Constraints",
    icon: "shield-halved",
    desc: "System limits and rules that tests must respect",
    accent: "text-amber-600",
    accentBg: "bg-amber-50",
    accentStrip: "bg-amber-400",
    accentBadge: "bg-amber-100 text-amber-700",
    accentDash: "hover:border-amber-300 hover:text-amber-500",
    style: "chip",
    items: [
      "SCORM package max: 500 MB",
      "Session timeout: 30 min (tenant-configurable)",
      "Tier 1 points never expire",
      "API rate limit: 200 req / min per tenant",
      "Video upload max: 4 GB, transcoded async",
    ],
  },
  {
    id: "notes",
    label: "Notes",
    icon: "note-sticky",
    desc: "One-off observations that don't fit elsewhere",
    accent: "text-rose-600",
    accentBg: "bg-rose-50",
    accentStrip: "bg-rose-400",
    accentBadge: "bg-rose-100 text-rose-700",
    accentDash: "hover:border-rose-300 hover:text-rose-500",
    style: "note",
    items: [
      "Points engine is async — allow 5–10s before asserting balance. Listen for rewards.balance_updated or use waitForPointsSync() in test helpers.",
      "Leaderboard score cache refreshes every 60s — never assert rank in the same second as a scoring action. Gate on leaderboard.recalculated event.",
    ],
  },
];

interface PillSection {
  icon: string;
  title: string;
  content: string[];
  isCode?: boolean;
}

interface PillDetail {
  label: string;
  categoryLabel: string;
  categoryIcon: string;
  badgeClass: string;
  description: string;
  sections: PillSection[];
}

const PILL_DETAILS: Record<string, PillDetail> = {
  "SaaS": {
    label: "SaaS",
    categoryLabel: "Industry",
    categoryIcon: "building",
    badgeClass: "bg-indigo-100 text-indigo-700",
    description: "Halight is a cloud-hosted, multi-tenant SaaS LMS. Subscription plans — Starter, Growth, and Enterprise — control feature access via feature flags evaluated at request time.",
    sections: [
      {
        icon: "layer-group",
        title: "Market Context",
        content: [
          "Per-seat pricing with annual contracts; plan tier stored in tenant.plan",
          "Multi-tenant architecture — strict data isolation enforced per tenant_id",
          "White-label branding (custom domain, logo, colours) available on Enterprise tier",
          "Feature flags evaluated server-side in FeatureFlagService.isEnabled(tenantId, flag)",
        ],
      },
      {
        icon: "flask-gear",
        title: "Test Implications",
        content: [
          "Smoke-test all three subscription tiers after any feature-flag change",
          "Verify tenant isolation: data reads must never return rows from another tenant_id",
          "Test feature-gate UI — gated features must be hidden, not merely 403'd",
          "Assert plan-upgrade flow correctly re-evaluates flags without requiring re-login",
        ],
      },
    ],
  },

  "EdTech": {
    label: "EdTech",
    categoryLabel: "Industry",
    categoryIcon: "building",
    badgeClass: "bg-indigo-100 text-indigo-700",
    description: "Halight's core is a Learning Experience Platform. Content formats include SCORM 1.2, SCORM 2004, xAPI (Tin Can), video-native, and micro-learning quiz modules. Completion data feeds directly into the rewards engine.",
    sections: [
      {
        icon: "graduation-cap",
        title: "Content Formats",
        content: [
          "SCORM 1.2 & 2004 — completion via CMI data model (cmi.core.lesson_status)",
          "xAPI — statements posted to internal LRS at /api/lrs/statements",
          "Video-native — completion at configurable watch-percentage threshold (default 80%)",
          "Micro-learning — pass/fail quiz with randomised question pools and 3-attempt limit",
        ],
      },
      {
        icon: "flask-gear",
        title: "Test Implications",
        content: [
          "SCORM completion must fire cmi.core.lesson_status = 'passed' or 'completed'",
          "xAPI statements must include actor, verb, and object; validated against xAPI 1.0.3 schema",
          "Video progress tracked via player.progress events every 5s — test seek-ahead blocking",
          "Quiz randomisation seed must be stable within a single attempt but different per re-attempt",
        ],
      },
    ],
  },

  "B2B Enterprise": {
    label: "B2B Enterprise",
    categoryLabel: "Industry",
    categoryIcon: "building",
    badgeClass: "bg-indigo-100 text-indigo-700",
    description: "Halight's client base ranges from 50-seat SMBs to 50,000+ seat enterprise deployments. Each tenant has isolated data, custom SSO configuration, bespoke branding, and individually-toggled features.",
    sections: [
      {
        icon: "sitemap",
        title: "Tenant Model",
        content: [
          "Tenant identified by subdomain (client.halight.com) or fully-custom domain",
          "JWT includes tenant_id, role, and feature_flags[] claims — validated on every request",
          "Admin panel scoped to single tenant — no cross-tenant API surface exposed",
        ],
      },
      {
        icon: "flask-gear",
        title: "Test Implications",
        content: [
          "Never share test state across tenants — always seed fresh fixtures per tenant",
          "Always authenticate with tenant-scoped JWTs in integration and E2E tests",
          "Validate custom domain resolution and TLS in the white-label regression suite",
          "Test JWT claim tampering: forged tenant_id must be rejected with 403",
        ],
      },
    ],
  },

  "Incentive & Rewards": {
    label: "Incentive & Rewards",
    categoryLabel: "Industry",
    categoryIcon: "building",
    badgeClass: "bg-indigo-100 text-indigo-700",
    description: "Halight's key differentiator. Learners earn points for completing courses, hitting streaks, earning badges, and peer recognition. Points redeem for prizes via a catalogue or custom voucher codes.",
    sections: [
      {
        icon: "coins",
        title: "Rewards Engine",
        content: [
          "RewardsEngine.award(userId, points, reason, metadata) — entry point for all awards",
          "Balance stored as append-only ledger in rewards_ledger — never mutated, only appended",
          "BadgeEvaluator.check(userId, event) runs after every scoring event",
          "RedemptionService.redeem(userId, catalogItemId) with optimistic lock on balance",
        ],
      },
      {
        icon: "tower-broadcast",
        title: "Telemetry Events",
        content: [
          "rewards.points_awarded { userId, amount, reason, newBalance }",
          "rewards.redeemed { userId, itemId, pointsCost, newBalance }",
          "rewards.balance_updated { userId, balance } — emitted after ledger recalculation",
          "rewards.badge_earned { userId, badgeId, triggeredBy }",
        ],
        isCode: true,
      },
      {
        icon: "flask-gear",
        title: "Test Implications",
        content: [
          "Engine is async — always await rewards.balance_updated before asserting balance",
          "Test idempotency: duplicate point award events must not double-credit",
          "Redemption on insufficient balance must return 402 and show error toast",
          "Assert ledger integrity: SUM(ledger.amount) must equal displayed balance at all times",
        ],
      },
    ],
  },

  "HR Tech": {
    label: "HR Tech",
    categoryLabel: "Industry",
    categoryIcon: "building",
    badgeClass: "bg-indigo-100 text-indigo-700",
    description: "Halight integrates with enterprise HRIS platforms — Workday, BambooHR, ADP — to sync employee records, org structure, and manager hierarchies. Hierarchy drives leaderboard grouping, report scoping, and campaign audience targeting.",
    sections: [
      {
        icon: "arrows-rotate",
        title: "HRIS Integrations",
        content: [
          "Workday: REST API delta sync every 4h + SFTP batch export nightly at 01:00 UTC",
          "BambooHR: webhook-driven provisioning on hire/terminate/transfer events",
          "ADP: SFTP inbound only — no bidirectional sync; processed by HRISyncService",
          "Sync failures queued in sync_errors table and retried with exponential backoff",
        ],
      },
      {
        icon: "flask-gear",
        title: "Test Implications",
        content: [
          "Test provisioning with out-of-order sync events (manager arriving before direct report)",
          "Verify soft-delete: terminated employees lose access but data retained for 90 days",
          "Assert manager hierarchy propagation doesn't corrupt leaderboard scope after re-org",
          "Test SFTP parsing with malformed rows — sync must skip bad rows and log to sync_errors",
        ],
      },
    ],
  },

  "Course Enrollment & Completion": {
    label: "Course Enrollment & Completion",
    categoryLabel: "Key Workflows",
    categoryIcon: "arrow-progress",
    badgeClass: "bg-emerald-100 text-emerald-700",
    description: "The primary learning loop. A learner is enrolled manually, via self-enrol, or triggered by a campaign. Progress is tracked via SCORM/xAPI/video events. Certificate and points are issued on 100% completion.",
    sections: [
      {
        icon: "code",
        title: "Codebase Entry Points",
        content: [
          "CourseService.enroll(userId, courseId, options?)",
          "SCORMPlayer.reportComplete(scormData: CMIData)",
          "CompletionHandler.process(enrollmentId) → CompletionResult",
          "CertificateService.issue(userId, courseId) → CertificateURL",
        ],
        isCode: true,
      },
      {
        icon: "tower-broadcast",
        title: "Telemetry Events",
        content: [
          "course.enrolled { userId, courseId, source: 'manual'|'campaign'|'self' }",
          "course.progress_updated { enrollmentId, pct: number }",
          "course.completed { enrollmentId, completedAt, pointsAwarded }",
          "certificate.issued { userId, courseId, templateId, url }",
        ],
        isCode: true,
      },
      {
        icon: "list-check",
        title: "Test Coverage Areas",
        content: [
          "Enrollment gate: prerequisite course must be marked complete before access granted",
          "Date-window enforcement: enrollment blocked outside campaign start/end window",
          "SCORM threshold: completion fires at 80% by default, configurable per course record",
          "Certificate PDF generation must be idempotent — re-issue returns same URL",
          "Points awarded exactly once per completion via idempotency key on the ledger entry",
        ],
      },
    ],
  },

  "Points & Rewards Redemption": {
    label: "Points & Rewards Redemption",
    categoryLabel: "Key Workflows",
    categoryIcon: "arrow-progress",
    badgeClass: "bg-emerald-100 text-emerald-700",
    description: "Learners spend accumulated points on catalogue items — gift cards, merchandise, custom vouchers. Balance is deducted atomically. Insufficient balance returns 402. Concurrent redemptions are prevented by an optimistic lock on the ledger version.",
    sections: [
      {
        icon: "code",
        title: "Codebase Entry Points",
        content: [
          "RewardsEngine.award(userId, points, reason, meta?)",
          "BalanceService.get(userId) → { available: number, pending: number }",
          "RedemptionService.redeem(userId, catalogItemId) → RedemptionResult",
          "LedgerService.append(entry: LedgerEntry) — optimistic lock on ledger_version",
        ],
        isCode: true,
      },
      {
        icon: "tower-broadcast",
        title: "Telemetry Events",
        content: [
          "rewards.points_awarded { amount, reason, balance }",
          "rewards.redeemed { itemId, pointsCost, newBalance }",
          "rewards.redemption_failed { reason: 'insufficient'|'locked'|'item_unavailable' }",
          "rewards.balance_updated { userId, balance }",
        ],
        isCode: true,
      },
      {
        icon: "list-check",
        title: "Test Coverage Areas",
        content: [
          "Atomic deduction: balance must not go negative under concurrent redemption load",
          "Optimistic lock: second concurrent redemption must fail with 409 Conflict",
          "Zero-balance guard: redeem button disabled in UI; API returns 402",
          "Ledger integrity: SUM(ledger.amount) must always equal the displayed balance",
          "Async delay: await rewards.balance_updated before asserting post-redemption balance",
        ],
      },
    ],
  },

  "Manager Dashboard & Reporting": {
    label: "Manager Dashboard & Reporting",
    categoryLabel: "Key Workflows",
    categoryIcon: "arrow-progress",
    badgeClass: "bg-emerald-100 text-emerald-700",
    description: "Managers view completion rates, point totals, and leaderboard positions for their direct reports. Reports export as CSV or PDF. All data is strictly scoped to the manager's organisational subtree — no cross-hierarchy data leaks.",
    sections: [
      {
        icon: "code",
        title: "Codebase Entry Points",
        content: [
          "AnalyticsController.getDashboard(managerId, dateRange)",
          "HierarchyService.getSubtree(managerId) → userId[]",
          "ReportBuilder.generate(config: ReportConfig) → Report",
          "ExportService.toPDF(reportId) | ExportService.toCSV(reportId)",
        ],
        isCode: true,
      },
      {
        icon: "tower-broadcast",
        title: "Telemetry Events",
        content: [
          "dashboard.viewed { managerId, filters, resultCount }",
          "report.generated { type, rowCount, generatedAt }",
          "report.exported { format: 'pdf'|'csv', reportId }",
        ],
        isCode: true,
      },
      {
        icon: "list-check",
        title: "Test Coverage Areas",
        content: [
          "Data scoping: manager must never see rows outside their HierarchyService subtree",
          "Re-org safety: new direct reports appear; transferred reports disappear immediately",
          "Export completeness: CSV row count must match dashboard pagination total",
          "Date range filters: assert correct ISO-8601 boundary handling (inclusive/exclusive)",
          "Cached vs live toggle: staleness indicator must appear after 5 min without refresh",
        ],
      },
    ],
  },

  "SSO / SAML Login": {
    label: "SSO / SAML Login",
    categoryLabel: "Key Workflows",
    categoryIcon: "arrow-progress",
    badgeClass: "bg-emerald-100 text-emerald-700",
    description: "Enterprise tenants authenticate via SAML 2.0. SP-initiated and IdP-initiated flows are both supported. SAML assertions map to Halight roles and department attributes. New users are auto-provisioned on their first SSO login.",
    sections: [
      {
        icon: "code",
        title: "Codebase Entry Points",
        content: [
          "AuthProvider.handleSamlAssertion(xml: string, tenantId: string)",
          "SAMLAttributeMapper.map(assertion) → UserAttributes",
          "SessionService.createFromSSO(attrs) → Session",
          "TenantResolver.fromIssuer(issuer: string) → Tenant",
        ],
        isCode: true,
      },
      {
        icon: "tower-broadcast",
        title: "Telemetry Events",
        content: [
          "auth.sso_initiated { tenantId, flow: 'sp'|'idp' }",
          "auth.sso_success { userId, isNewUser: boolean }",
          "auth.sso_failed { reason: string, tenantId }",
          "auth.session_created { sessionId, ttl, role }",
        ],
        isCode: true,
      },
      {
        icon: "list-check",
        title: "Test Coverage Areas",
        content: [
          "SP-initiated: redirect to IdP → receive assertion → create session end-to-end",
          "IdP-initiated: assert without prior SP request — must succeed and land on /dashboard",
          "Auto-provision: new user created with correct role from SAML NameID and attributes",
          "Attribute mapping: email, role, department must parse correctly from assertion XML",
          "Replay attack: same assertion submitted twice must be rejected with 400",
          "Clock skew: assertions up to 5 min old must be accepted; 6 min must be rejected",
        ],
      },
    ],
  },

  "Incentive Campaign Launch": {
    label: "Incentive Campaign Launch",
    categoryLabel: "Key Workflows",
    categoryIcon: "arrow-progress",
    badgeClass: "bg-emerald-100 text-emerald-700",
    description: "Admins create time-bound incentive campaigns targeting specific audiences — by department, tier, or manager subtree. On publish, targeted learners are enrolled in linked courses, notified, and a bonus point multiplier activates for the campaign window.",
    sections: [
      {
        icon: "code",
        title: "Codebase Entry Points",
        content: [
          "CampaignService.create(config: CampaignConfig) → Campaign",
          "CampaignService.publish(campaignId) → PublishResult",
          "AudienceFilter.resolve(rules: AudienceRule[]) → userId[]",
          "NotificationDispatcher.send(userIds, template, channels)",
          "PointsMultiplierService.activate(campaignId, factor, window)",
        ],
        isCode: true,
      },
      {
        icon: "tower-broadcast",
        title: "Telemetry Events",
        content: [
          "campaign.created { campaignId, audienceSize }",
          "campaign.published { campaignId, enrolledCount }",
          "campaign.notification_sent { channel: 'email'|'in-app', count }",
          "campaign.enrollment_triggered { userId, courseId }",
          "campaign.multiplier_activated { factor, startsAt, expiresAt }",
        ],
        isCode: true,
      },
      {
        icon: "list-check",
        title: "Test Coverage Areas",
        content: [
          "Audience resolution: assert correct user set for each targeting rule combination",
          "Date enforcement: campaign enrollments blocked before startsAt and after expiresAt",
          "Notification delivery: assert both email and in-app channels receive the send event",
          "Multiplier activation: points multiplied correctly on completions within campaign window",
          "No retroactive awards: courses completed before publish must not receive the bonus",
          "Idempotent publish: double-publish must not double-enrol or double-notify learners",
        ],
      },
    ],
  },

  "Leaderboard Ranking Update": {
    label: "Leaderboard Ranking Update",
    categoryLabel: "Key Workflows",
    categoryIcon: "arrow-progress",
    badgeClass: "bg-emerald-100 text-emerald-700",
    description: "Leaderboards rank learners by points within configurable scopes — global, department, team, or campaign. Rankings recalculate asynchronously every 60 seconds. Ties are broken by earliest course completion timestamp.",
    sections: [
      {
        icon: "code",
        title: "Codebase Entry Points",
        content: [
          "LeaderboardService.recalculate(tenantId, scope: LeaderboardScope)",
          "RankingEngine.score(entries: LedgerEntry[]) → RankedEntry[]",
          "TieBreaker.resolve(tied: RankedEntry[], strategy: 'earliest_completion')",
          "LeaderboardCache.invalidate(tenantId, scope)",
        ],
        isCode: true,
      },
      {
        icon: "tower-broadcast",
        title: "Telemetry Events",
        content: [
          "leaderboard.recalculated { tenantId, scope, durationMs }",
          "leaderboard.rank_changed { userId, oldRank, newRank }",
          "leaderboard.tie_resolved { userIds: string[], winnerId }",
        ],
        isCode: true,
      },
      {
        icon: "list-check",
        title: "Test Coverage Areas",
        content: [
          "60s refresh cycle: never assert rank in the same second as a scoring action",
          "Tie-breaking: use fixed UTC timestamps; earlier completion_at wins rank",
          "Scope isolation: department board must contain only learners in that department",
          "Privacy masking: inactive users (>30 days) shown as 'Anonymous' on global board",
          "Gate rank assertions on leaderboard.recalculated event — never on time.sleep()",
        ],
      },
    ],
  },

  "Await balance_updated event before asserting points": {
    label: "Await balance_updated event before asserting points",
    categoryLabel: "Patterns",
    categoryIcon: "diagram-project",
    badgeClass: "bg-violet-100 text-violet-700",
    description: "The rewards points engine processes award events asynchronously via an internal Redis Streams queue. Tests that synchronously assert the balance immediately after a point-earning action will be intermittently flaky.",
    sections: [
      {
        icon: "triangle-exclamation",
        title: "Why This Matters",
        content: [
          "Point awards flow through RewardsQueue before updating the rewards_ledger",
          "Processing latency is 200ms–5s under normal load; up to 30s during peak",
          "Flaky balance assertions are the #1 source of noise in Halight's rewards test suite",
          "Silent failures: no error thrown — the balance is just stale at assertion time",
        ],
      },
      {
        icon: "code",
        title: "How to Implement",
        content: [
          "cy.waitForEvent('rewards.balance_updated', { userId }) before asserting",
          "waitForPointsSync(userId, expectedBalance, { timeout: 8000 })",
          "Poll BalanceService.get(userId) until balance matches expected as last resort",
          "In unit tests: call RewardsEngine directly and flush the queue synchronously",
        ],
        isCode: true,
      },
    ],
  },

  "Run SCORM completion across Chrome, Firefox, Safari, Edge": {
    label: "Run SCORM completion across Chrome, Firefox, Safari, Edge",
    categoryLabel: "Patterns",
    categoryIcon: "diagram-project",
    badgeClass: "bg-violet-100 text-violet-700",
    description: "Halight's SCORM player uses a postMessage bridge between the host app and the SCORM content iframe. This API surface behaves subtly differently across browsers, causing silent completion failures that are invisible in single-browser test runs.",
    sections: [
      {
        icon: "triangle-exclamation",
        title: "Why This Matters",
        content: [
          "Safari blocks third-party cookies in SCORM content iframes by default — sessions drop",
          "Firefox requires explicit CORS headers on SCORM package assets",
          "Edge Legacy had distinct postMessage origin handling that trips the bridge",
          "Silent failures: SCORM API calls fail without throwing — lesson_status stays 'incomplete'",
        ],
      },
      {
        icon: "code",
        title: "How to Implement",
        content: [
          "@browser:chrome,firefox,safari,edge — tag on all SCORM completion specs",
          "SCORMAPIMock.install() — mock window.API and window.API_1484_11 in unit tests",
          "assert cmi.core.lesson_status === 'completed' in each browser fixture",
          "Add cross-browser SCORM smoke suite as a required step in the pre-release pipeline",
        ],
        isCode: true,
      },
    ],
  },

  "Assert 403 for all 4 role tiers on protected routes": {
    label: "Assert 403 for all 4 role tiers on protected routes",
    categoryLabel: "Patterns",
    categoryIcon: "diagram-project",
    badgeClass: "bg-violet-100 text-violet-700",
    description: "Halight has four user roles with distinct permission boundaries: Learner, Manager, Admin, and Super-Admin. Every protected route must be tested against all roles that should be denied — not just unauthenticated requests.",
    sections: [
      {
        icon: "users",
        title: "Role Definitions",
        content: [
          "Learner — own courses, progress, and rewards only",
          "Manager — Learner access + reports and leaderboards scoped to direct reports",
          "Admin — Manager access + campaign management, user provisioning, SCORM uploads",
          "Super-Admin — full tenant control: billing, SSO config, feature flags, audit logs",
        ],
      },
      {
        icon: "code",
        title: "How to Implement",
        content: [
          "tests/fixtures/roles.ts — maintain JWT fixtures for each of the 4 roles",
          "rbacMatrix — iterate deny-list roles per route and assert 403 in each case",
          "UI: assert protected nav items are absent (not just disabled) for lower tiers",
          "Escalation test: Learner JWT accessing /api/admin/* must return 403, not 404",
        ],
        isCode: true,
      },
    ],
  },

  "Test redemption race condition with concurrent sessions": {
    label: "Test redemption race condition with concurrent sessions",
    categoryLabel: "Patterns",
    categoryIcon: "diagram-project",
    badgeClass: "bg-violet-100 text-violet-700",
    description: "A learner with exactly enough points to redeem one item could double-spend by submitting redemption from two browser tabs simultaneously. The optimistic lock in RedemptionService prevents this — but it must be explicitly verified.",
    sections: [
      {
        icon: "arrows-split-up-and-left",
        title: "Race Condition Flow",
        content: [
          "Both sessions read balance: 500 points (both pass the balance check)",
          "Both submit redeem request for the 500-point catalogue item simultaneously",
          "First request acquires optimistic lock on ledger_version, deducts balance",
          "Second request detects stale ledger_version, returns 409 Conflict",
          "Final balance must be 0 — never negative, never unchanged at 500",
        ],
      },
      {
        icon: "code",
        title: "How to Implement",
        content: [
          "RedemptionTestHelper.drainBalance(userId, targetBalance) to set exact balance",
          "Promise.all([redeem(), redeem()]) — fire two concurrent requests in API tests",
          "Assert exactly one 200 and one 409 in the response pair",
          "Assert final balance === 0 (not negative, not 500)",
          "E2E: second tab must show 'Item already redeemed' error toast",
        ],
        isCode: true,
      },
    ],
  },

  "Use fixed UTC timestamps in leaderboard tie-break tests": {
    label: "Use fixed UTC timestamps in leaderboard tie-break tests",
    categoryLabel: "Patterns",
    categoryIcon: "diagram-project",
    badgeClass: "bg-violet-100 text-violet-700",
    description: "Tie-breaking uses the earliest course completion timestamp. Tests using Date.now() or relative timestamps produce non-deterministic rank ordering when timezone handling differs between local and CI environments.",
    sections: [
      {
        icon: "triangle-exclamation",
        title: "Why This Matters",
        content: [
          "TieBreaker.resolve() compares completion_at in UTC — timezone offsets flip sort order",
          "Local timezone offsets cause the same timestamp to sort differently across environments",
          "Flaky rank assertions are the #2 source of CI noise after async balance delays",
        ],
      },
      {
        icon: "code",
        title: "How to Implement",
        content: [
          "LeaderboardTestFactory.buildTied({ completedAt: ISO_FIXED_DATE })",
          "new Date('2024-01-15T09:00:00.000Z') — always explicit UTC, never Date.now()",
          "expect(ranks).toEqual(['alice', 'bob', 'carol']) — assert full ordered array",
          "Never use Date.now() - 1000 or relative offsets in tie-break scenarios",
        ],
        isCode: true,
      },
    ],
  },

  "SCORM package max: 500 MB": {
    label: "SCORM package max: 500 MB",
    categoryLabel: "Constraints",
    categoryIcon: "shield-halved",
    badgeClass: "bg-amber-100 text-amber-700",
    description: "SCORM packages are uploaded to S3 and extracted server-side by PackageExtractor. Packages exceeding 500 MB are rejected during multipart upload validation — before extraction begins — returning HTTP 413.",
    sections: [
      {
        icon: "code",
        title: "Technical Detail",
        content: [
          "UploadValidator.validateSize(bytes) — enforced before S3 multipart initiates",
          "Error code: UPLOAD_SIZE_EXCEEDED  HTTP 413",
          "Chunk size: 5 MB; validation triggers on receipt of the final chunk",
          "Limit applies to the compressed .zip archive — not the extracted content",
        ],
        isCode: true,
      },
      {
        icon: "flask-gear",
        title: "Test Implications",
        content: [
          "Boundary values: 499 MB → pass, 500 MB → pass, 500.1 MB → 413 fail",
          "Assert error message: 'Package exceeds maximum size of 500 MB'",
          "Use UploadTestHelper.mockFileSize(bytes) — never upload real large files in CI",
          "Verify UI: progress bar clears and error banner appears on rejection",
        ],
      },
    ],
  },

  "Session timeout: 30 min (tenant-configurable)": {
    label: "Session timeout: 30 min (tenant-configurable)",
    categoryLabel: "Constraints",
    categoryIcon: "shield-halved",
    badgeClass: "bg-amber-100 text-amber-700",
    description: "Default idle session TTL is 30 minutes, stored in tenant_config.session_ttl. Enterprise tenants can configure 15–480 minutes via the Admin Panel. Active SCORM sessions extend automatically on each postMessage API call.",
    sections: [
      {
        icon: "code",
        title: "Technical Detail",
        content: [
          "tenant_config.session_ttl (integer, seconds) — default 1800",
          "Redis key: session:{sessionId} with TTL matching session_ttl",
          "SessionService.extend(sessionId) — called on each SCORM postMessage",
          "Configurable range: 900s (15 min) to 28800s (8 h)",
        ],
        isCode: true,
      },
      {
        icon: "flask-gear",
        title: "Test Implications",
        content: [
          "SessionTestHelper.fastForward(minutes) — simulate idle expiry without waiting",
          "Assert redirect to /login?reason=session_expired after TTL elapses",
          "Assert SCORM postMessage resets TTL — learner never interrupted mid-course",
          "Test custom TTL: set session_ttl = 900, assert 15-min expiry behaviour",
          "Verify session still valid after SCORM call at the 29-minute mark",
        ],
      },
    ],
  },

  "Tier 1 points never expire": {
    label: "Tier 1 points never expire",
    categoryLabel: "Constraints",
    categoryIcon: "shield-halved",
    badgeClass: "bg-amber-100 text-amber-700",
    description: "Halight has three learner tiers. Tier 1 (Enterprise plan) learners have points_expiry: null — their balance never expires. Tier 2 and 3 learners have a 12-month rolling expiry. The nightly expiry job runs at 02:00 UTC.",
    sections: [
      {
        icon: "code",
        title: "Technical Detail",
        content: [
          "learner_profile.tier: 1 | 2 | 3 — set at provisioning",
          "ExpiryPolicyService.getPolicy(tier) → { ttlDays: number | null }",
          "ExpiryJob.run() — cron at 02:00 UTC; writes negative ledger entries for expired points",
          "Ledger is append-only: expiry written as { type: 'expiry', amount: -N }",
        ],
        isCode: true,
      },
      {
        icon: "flask-gear",
        title: "Test Implications",
        content: [
          "Mock ExpiryJob.run() trigger in tests — never rely on actual cron timing",
          "Assert Tier 1 balance unchanged after expiry job executes",
          "Assert Tier 2 points earned 13 months ago are zeroed after job run",
          "Boundary: Tier 2 point earned exactly 365 days ago must NOT yet expire",
          "Verify expiry ledger entry format: { type: 'expiry', amount: -N, reason: 'ttl_expired' }",
        ],
      },
    ],
  },

  "API rate limit: 200 req / min per tenant": {
    label: "API rate limit: 200 req / min per tenant",
    categoryLabel: "Constraints",
    categoryIcon: "shield-halved",
    badgeClass: "bg-amber-100 text-amber-700",
    description: "All tenant API calls are rate-limited at 200 requests per minute by the RateLimiter middleware at the API gateway. Internal service-to-service calls authenticated with X-Internal-Token are fully exempt.",
    sections: [
      {
        icon: "code",
        title: "Technical Detail",
        content: [
          "Sliding window counter keyed by tenant_id in Redis (TTL: 60s)",
          "Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset",
          "429 response includes Retry-After header (seconds until window resets)",
          "Exempt paths: /api/webhooks/* and any request with valid X-Internal-Token",
        ],
        isCode: true,
      },
      {
        icon: "flask-gear",
        title: "Test Implications",
        content: [
          "Assert 429 on the 201st request within a 60-second sliding window",
          "Assert Retry-After header is present and a positive integer",
          "Test API client retry logic: verify exponential backoff activates on 429",
          "Assert internal token bypass: > 200 req/min with X-Internal-Token must succeed",
          "Verify tenant isolation: tenant A hitting its limit must not affect tenant B's counter",
        ],
      },
    ],
  },

  "Video upload max: 4 GB, transcoded async": {
    label: "Video upload max: 4 GB, transcoded async",
    categoryLabel: "Constraints",
    categoryIcon: "shield-halved",
    badgeClass: "bg-amber-100 text-amber-700",
    description: "Raw video files up to 4 GB are uploaded via S3 presigned URL, then converted to adaptive-bitrate HLS by an async VideoTranscoder service. The learner sees a 'Processing' placeholder until transcoding completes.",
    sections: [
      {
        icon: "code",
        title: "Technical Detail",
        content: [
          "PresignedUrlService.generate(fileSize, contentType) — 4 GB hard limit enforced here",
          "S3 ObjectCreated event → VideoTranscoder.queue(videoId) — fully asynchronous",
          "GET /api/videos/:id/status → { state: 'processing'|'ready'|'failed' }",
          "HLS manifest served at /cdn/videos/:id/master.m3u8 after successful transcode",
          "SLA: transcoding completes within 2× the video duration",
        ],
        isCode: true,
      },
      {
        icon: "flask-gear",
        title: "Test Implications",
        content: [
          "Mock VideoTranscoder in integration tests — never run real transcoding in CI",
          "Assert 'Processing' UI state immediately after upload completes",
          "Assert player becomes active only after video.transcoded event fires",
          "Test failed transcode path: assert 'Processing failed' state and retry button appear",
          "Boundary: 3.9 GB → pass, 4.0 GB → pass, 4.1 GB → 413 from PresignedUrlService",
        ],
      },
    ],
  },

  "Points engine is async — allow 5–10s before asserting balance. Listen for rewards.balance_updated or use waitForPointsSync() in test helpers.": {
    label: "Points engine async delay",
    categoryLabel: "Notes",
    categoryIcon: "note-sticky",
    badgeClass: "bg-rose-100 text-rose-700",
    description: "The RewardsEngine processes point awards through an internal queue backed by Redis Streams. Balance updates are eventually consistent — a completion event and the resulting balance change are not atomic.",
    sections: [
      {
        icon: "server",
        title: "Queue Architecture",
        content: [
          "rewards:events:{tenantId} — Redis Stream where all point events are published",
          "Consumer group: rewards-consumer processes events in FIFO order",
          "Latency: 200ms–5s at normal load; up to 30s during peak traffic",
          "Failed events retry 3× then land in rewards:dlq (dead letter queue)",
        ],
        isCode: true,
      },
      {
        icon: "code",
        title: "Test Strategy",
        content: [
          "cy.waitForEvent('rewards.balance_updated', { userId }) — subscribe before action",
          "waitForPointsSync(userId, expectedBalance, { timeout: 8000 })",
          "Never use cy.wait(N) — always event-driven assertions",
          "In unit tests: call RewardsEngine directly and flush the queue synchronously",
          "Monitor rewards:dlq in regression suite — DLQ growth indicates queue bugs",
        ],
        isCode: true,
      },
    ],
  },

  "Leaderboard score cache refreshes every 60s — never assert rank in the same second as a scoring action. Gate on leaderboard.recalculated event.": {
    label: "Leaderboard 60s cache refresh",
    categoryLabel: "Notes",
    categoryIcon: "note-sticky",
    badgeClass: "bg-rose-100 text-rose-700",
    description: "Leaderboard rankings are computed from aggregated ledger data and cached in Redis. The cache invalidates and recalculates every 60 seconds via a scheduled job — not on each individual scoring event.",
    sections: [
      {
        icon: "server",
        title: "Cache Architecture",
        content: [
          "Cache key: leaderboard:{tenantId}:{scope}:{dateRange}",
          "TTL: 60s; recalculation job runs every 55s (5s overlap for consistency)",
          "leaderboard.recalculated event emitted on each successful refresh",
          "Cache miss falls through to live DB query — may briefly return stale rank data",
        ],
        isCode: true,
      },
      {
        icon: "code",
        title: "Test Strategy",
        content: [
          "cy.waitForEvent('leaderboard.recalculated') — gate rank assertions on this event",
          "LeaderboardTestHelper.triggerRecalculation() — force immediate refresh in tests",
          "Never assert rank in the same second as the scoring action",
          "Verify staleness indicator appears in UI when cache is older than 55s",
        ],
        isCode: true,
      },
    ],
  },
};

function PillDetailModal({ detail, onClose }: { detail: PillDetail; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${detail.badgeClass}`}>
                  <DuoIcon icon={detail.categoryIcon} className="mr-1 text-[9px]" />
                  {detail.categoryLabel}
                </span>
              </div>
              <h2 className="text-[17px] font-black text-gray-900 leading-snug">{detail.label}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0 mt-0.5"
            >
              <X size={15} />
            </button>
          </div>
          <p className="text-[12.5px] text-gray-500 leading-relaxed mt-2">{detail.description}</p>
        </div>

        {/* Sections */}
        <div className="px-6 py-5 flex flex-col gap-5 max-h-[400px] overflow-y-auto">
          {detail.sections.map((section, i) => (
            <div key={i}>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-5 h-5 flex items-center justify-center">
                  <DuoIcon icon={section.icon} className="text-indigo-400 text-[12px]" />
                </div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{section.title}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                {section.content.map((item, j) =>
                  section.isCode ? (
                    <div key={j} className="font-mono text-[11px] bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg text-indigo-700 leading-relaxed">
                      {item}
                    </div>
                  ) : (
                    <div key={j} className="flex items-start gap-2">
                      <span className="text-gray-300 mt-[3px] shrink-0 text-[10px]">▸</span>
                      <span className="text-[12.5px] text-gray-600 leading-relaxed">{item}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KnowledgeView({ onAddContext }: { onAddContext: () => void }) {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [calloutDismissed, setCalloutDismissed] = useState(false);
  const [selectedPill, setSelectedPill] = useState<string | null>(null);

  const removeItem = (catId: string, idx: number) => {
    setCategories(prev =>
      prev.map(c => c.id === catId ? { ...c, items: c.items.filter((_, i) => i !== idx) } : c)
    );
  };

  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);
  const selectedDetail = selectedPill ? PILL_DETAILS[selectedPill] ?? null : null;

  return (
    <div className="flex-1 overflow-y-auto">
      {selectedDetail && (
        <PillDetailModal detail={selectedDetail} onClose={() => setSelectedPill(null)} />
      )}

      {/* ── Page header ── */}
      <div className="bg-white border-b border-gray-200 px-8 pt-5 pb-4 shrink-0 flex items-start justify-between">
        <div>
          <h1 className="cqa-h1">Knowledge Base</h1>
          <p className="cqa-section-desc mt-0.5">
            Context that shapes how ContextQA generates and prioritises tests
          </p>
          <p className="cqa-caption mt-1">{totalItems} items across {categories.length} categories</p>
        </div>
        <button
          onClick={onAddContext}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-white text-sm font-semibold active:scale-95 transition-all shadow-sm bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap shrink-0"
        >
          <DuoIcon icon="plus" />
          Add Context
        </button>
      </div>

      {/* ── Dismissable help callout ── */}
      {!calloutDismissed && (
        <div className="mx-8 mt-5 bg-indigo-50/70 border border-indigo-100 rounded-xl px-5 py-4 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg flex-shrink-0 mt-0.5">
            <DuoIcon icon="lightbulb" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-1.5">
              <p className="text-sm font-bold text-indigo-900">Knowledge Base — teach the AI about your business</p>
              <button
                onClick={() => setCalloutDismissed(true)}
                className="w-5 h-5 flex items-center justify-center rounded text-indigo-300 hover:text-indigo-600 hover:bg-indigo-100 transition-colors flex-shrink-0"
              >
                <X size={12} />
              </button>
            </div>
            <p className="text-xs text-indigo-700/70 leading-relaxed">
              Everything here shapes how ContextQA <strong>understands your product</strong> and generates tests. Click any item to see how it applies to Halight. Add your industry, key user journeys, system constraints, and any edge cases the AI should know about.
            </p>
          </div>
        </div>
      )}

      {/* ── Category cards ── */}
      <div className="px-8 pb-10 mt-5 grid grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`group bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col transition-shadow duration-200 hover:shadow-md ${
              cat.id === "notes" ? "col-span-2" : ""
            }`}
          >
            {/* Coloured accent strip */}
            <div className={`h-[3px] w-full ${cat.accentStrip}`} />

            <div className="p-5 flex flex-col gap-4">
              {/* Card header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${cat.accentBg} flex items-center justify-center text-[15px] ${cat.accent} shrink-0`}>
                    <DuoIcon icon={cat.icon} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 leading-none">{cat.label}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cat.accentBadge}`}>
                        {cat.items.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 leading-snug">{cat.desc}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              {cat.style === "chip" ? (
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedPill(item)}
                      className="group/chip inline-flex items-center gap-1 bg-gray-50 border border-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-pointer"
                    >
                      {item}
                      <span
                        role="button"
                        onClick={(e) => { e.stopPropagation(); removeItem(cat.id, i); }}
                        className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover/chip:opacity-100 hover:bg-gray-200 transition-all text-gray-400 hover:text-gray-700 text-[11px] leading-none shrink-0"
                      >
                        ×
                      </span>
                    </button>
                  ))}
                  <button
                    className={`inline-flex items-center gap-1 border-2 border-dashed border-gray-200 text-gray-400 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${cat.accentDash}`}
                  >
                    + Add
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {cat.items.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedPill(item)}
                      className="group/note relative flex items-start gap-3 border-l-[3px] border-rose-200 pl-4 pr-8 py-3 bg-rose-50/40 rounded-r-xl text-xs text-gray-600 leading-relaxed hover:border-rose-400 hover:bg-rose-50 transition-colors text-left w-full"
                    >
                      <DuoIcon icon="quote-left" className="text-rose-300 text-[10px] mt-0.5 shrink-0" />
                      <span>{item}</span>
                      <span
                        role="button"
                        onClick={(e) => { e.stopPropagation(); removeItem(cat.id, i); }}
                        className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover/note:opacity-100 hover:bg-rose-100 transition-all text-gray-400 hover:text-rose-600 text-xs"
                      >
                        ×
                      </span>
                    </button>
                  ))}
                  <button
                    className={`inline-flex items-center gap-1.5 border-2 border-dashed border-gray-200 text-gray-400 text-xs font-medium px-3 py-2.5 rounded-xl w-fit transition-colors ${cat.accentDash}`}
                  >
                    + Add note
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ContextPage() {
  const [, navigate] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSecNav, setActiveSecNav] = useState("knowledge");

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AddContextDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <IndigoSidebar
        onNew={() => setDrawerOpen(true)}
        onNavigate={navigate}
        onBilling={() => navigate("/settings?section=billing")}
        activeItem="context"
      />

      {/* ── Secondary nav ── */}
      <aside className="w-[88px] bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="flex-1 flex flex-col overflow-y-auto min-h-0 pt-5">
          <div className="px-3 mb-2 shrink-0">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center leading-tight">Context</p>
          </div>
          <nav className="flex flex-col items-center gap-0.5 px-2">
            {CONTEXT_SECTIONS.map((sec) => {
              const isActive = sec.id === activeSecNav;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSecNav(sec.id)}
                  title={sec.label}
                  className={`w-full flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-xl transition-all ${
                    isActive ? "bg-indigo-50 border border-indigo-100" : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <span className={`text-xl leading-none transition-colors ${isActive ? "text-indigo-600" : "text-gray-400"}`}>
                    <DuoIcon icon={sec.icon} />
                  </span>
                  <span className={`text-[9px] font-semibold leading-none text-center ${isActive ? "text-indigo-600" : "text-gray-400"}`}>
                    {sec.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-xl font-bold text-gray-900 hover:opacity-80 transition-opacity"
            >
              <span className="text-gray-900">Context</span>
              <span className="text-indigo-600">QA</span>
            </button>
            <button
              onClick={() => navigate("/settings?section=billing")}
              className="text-xs bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded-full hover:bg-amber-200 transition-colors"
            >
              1,222 Credits Left
            </button>
          </div>
          <div className="flex items-center gap-3">
            <WorkspaceDropdown />
            <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </header>

        {activeSecNav === "knowledge" ? (
          <KnowledgeView onAddContext={() => setDrawerOpen(true)} />
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </div>
  );
}
