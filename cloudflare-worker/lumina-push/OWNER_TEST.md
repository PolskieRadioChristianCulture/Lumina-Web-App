# Owner-only Android push test

## Audit status 2026-10-17

The isolation release `0fc481f` is already in production. Its delivery cron and
legacy-import cron are separate. The setup instructions below describe the
original pre-enrollment pilot, not the current production enablement policy.
Do not remove existing subscriptions, disable production delivery, reset tokens
or enable a test merely to reproduce that historical setup.

The new P0 patch is local and awaits owner approval. It keeps historical replay
off by default (`COURSE_HISTORICAL_PUSH_ENABLED=false`); importing existing
consent is independent of permission to send old lessons. An operator may enable
historical replay only after separate owner approval.

Automatic test results and FCM acceptance are not Android delivery evidence.
The existing owner-test endpoint targets all registered devices on the pilot
account (up to 10), not exclusively the phone. Before approval, disclose that
scope and agree on the receiving device and its state. Do not open a test window
or retry an ambiguous consumed run without fresh approval.

Local preparation only until owner approves the scoped release. No course enrollment, cron, IAM writes, private-message access or paid-plan activation is part of this test.

Endpoint: POST /v1/course/owner-test, allowed production Origin, Firebase ID token from a registered account, empty body. The verified UID must match the configured pilot. Token values never appear in output or logs. All enabled private device tokens belonging to that UID are targeted once (max 10), so the same test may also appear on the owner's desktop. No legacy public profile token fallback.

Deployment adds a SQLite Durable Object binding OWNER_PUSH_TEST_GUARD, class OwnerPushTestGuard, migration owner-push-test-v1. It persists only a consumed flag per random test run, no UID, device token, lesson, message or credentials. Verify the account is on a sufficient existing free allocation before creating it; do not activate a paid plan. The public route is disabled by default and creates no object until the authenticated pilot passes the checks. No per-user data is migrated.

To open a test window explicitly, use protected secret input for COURSE_PUSH_PILOT_UID and OWNER_PUSH_TEST_RUN_ID (random UUID v4), OWNER_PUSH_TEST_START_AT and OWNER_PUSH_TEST_EXPIRES_AT (epoch milliseconds, at most 15 minutes apart), OWNER_PUSH_TEST_ENABLED=true. Never put values in source, logs or command arguments. COURSE_PUSH_ENABLED stays absent. Confirm expiry and disabled automatic enrollment/dispatch before sending.

One random run authorizes at most one batch; every token is attempted at most once. Claim is durably consumed before FCM, even if the request times out or fails. Do not automatically retry: acceptance may be ambiguous. A deliberate new run requires a fresh owner-approved test. FCM acceptance is not evidence of physical reception. Notification explicitly says TEST, expires in 300 seconds, opens a public published lesson, and contains no simulated private message.

After testing remove all temporary test secrets including pilot UID; confirm route returns 503. Keep the guard migration and consumed markers intact (do not delete/reset them or restore a backup to repeat attempts). For rollback, first disable/remove the test secrets, then deploy previously verified application behavior while retaining the migration and class export. Do not blindly roll back a pre-migration Worker version. No changes to existing chat, subscription consent or Firestore rules are needed.

Acceptance: close PWA normally (do not force-stop Chrome), switch screen off, send one owner-approved test, confirm Android notification and open correct lesson. Separately test normal battery-saving/background behavior and daily-course normal-urgency delivery before enabling student subscriptions. The short high-urgency owner test alone does not certify the normal-urgency course pipeline or all Android vendors.
