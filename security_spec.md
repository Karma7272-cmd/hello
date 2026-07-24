# Security Specification for Firestore Rules

## 1. Data Invariants

- **Ownership Integrity**: A project can only be read, created, updated, or deleted if the user is authenticated and is the verified `ownerId` of that project.
- **Path Alignment**: The project ID in the database document must match the URL path ID (e.g. `projectId`).
- **PII Isolation**: Connectors and custom BYOK keys are private to each user, isolated under `users/{userId}/private/connectors`, and strictly unreadable by anyone other than the verified owner.
- **Timestamp Veracity**: Create/update operations must utilize verified server times (`request.time`).
- **Payload Truncation**: Strings and collections must be bounded to prevent wallet exhausting attacks.

## 2. The "Dirty Dozen" Payloads

Here are 12 specific payloads or attack vectors designed to fail authorization under the secure ruleset:

1. **Identity Spoofing - Project Hijack**: Authenticated user `attacker_uid` attempts to write a project with `ownerId: "victim_uid"`.
2. **Identity Spoofing - Profile Hijack**: Authenticated user `attacker_uid` attempts to read `users/victim_uid/private/connectors`.
3. **Privilege Escalation**: User attempts to inject a custom admin role status.
4. **Anonymity Bypass**: Unauthenticated (null) user attempts to write a project.
5. **ID character poisoning**: User attempts to use a malicious 1KB special character string as a `projectId` (e.g. injection).
6. **Immutable field mutation**: Attempting to alter a project's `ownerId` after creation.
7. **Temporal hijacking**: Attempting to spoof a pre-dated `timestamp` on project creation instead of using `request.time`.
8. **Empty File Injection**: Attempting to create a project with missing structural files.
9. **Spam Creation**: Exceeding the standard size limit of 1MB for project metadata files.
10. **Ghost Keys Injection**: Inserting undocumented properties outside the allowed entity fields in `connectors`.
11. **Spoofed Email Verification**: User with `email_verified == false` attempting to perform standard workspace writes.
12. **Foreign Connectors Modification**: Attempting to update another user's secret BYOK keys.

## 3. Test Runner Outline (firestore.rules.test.ts)

Below is an abstract test runner indicating how we assert safety on these payloads:

```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";

describe("Firestore Security Rules Tests", () => {
  let testEnv: any;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "cohesive-lyceum-jjlsj",
      firestore: {
        rules: require("fs").readFileSync("firestore.rules", "utf8")
      }
    });
  });

  after(() => testEnv.cleanup());

  it("denies unauthenticated project creation", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(db.collection("projects").doc("proj1").set({ id: "proj1", prompt: "Hello" }));
  });

  it("denies project creation with spoofed ownerId", async () => {
    const db = testEnv.authenticatedContext("attacker").firestore();
    await assertFails(db.collection("projects").doc("proj1").set({ id: "proj1", ownerId: "victim", prompt: "Hello", timestamp: new Date().toISOString(), files: {} }));
  });

  it("allows owner to create project", async () => {
    const db = testEnv.authenticatedContext("owner", { email_verified: true }).firestore();
    await assertSucceeds(db.collection("projects").doc("proj1").set({
      id: "proj1",
      ownerId: "owner",
      prompt: "Hello",
      timestamp: new Date().toISOString(),
      files: {}
    }));
  });
});
```
