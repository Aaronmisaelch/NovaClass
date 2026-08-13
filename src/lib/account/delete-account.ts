import "server-only";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

// Mirrors src/lib/teamclass/data.ts's leaveGroup: reassign leadership if
// members remain, otherwise destroy the group (messages, links, doc). Can't
// reuse that function directly since it's client-SDK-only ("use client",
// firestore/lite writes bound by security rules) — this runs with the admin
// SDK instead, which is what lets it delete groups the user doesn't own.
async function leaveAllGroups(uid: string): Promise<void> {
  const db = getAdminDb();
  const membershipsSnapshot = await db
    .collection("users")
    .doc(uid)
    .collection("groupMemberships")
    .get();

  for (const membershipDoc of membershipsSnapshot.docs) {
    const code = membershipDoc.id;
    const groupRef = db.collection("groups").doc(code);
    const groupSnapshot = await groupRef.get();
    if (!groupSnapshot.exists) continue;

    const group = groupSnapshot.data() as { leaderId: string; memberIds: string[] };
    const remaining = group.memberIds.filter((id) => id !== uid);

    if (remaining.length === 0) {
      const [messagesSnapshot, linksSnapshot] = await Promise.all([
        groupRef.collection("messages").get(),
        groupRef.collection("links").get(),
      ]);
      const batch = db.batch();
      messagesSnapshot.forEach((doc) => batch.delete(doc.ref));
      linksSnapshot.forEach((doc) => batch.delete(doc.ref));
      batch.delete(groupRef.collection("members").doc(uid));
      batch.delete(groupRef);
      await batch.commit();
    } else {
      const newLeaderId = group.leaderId === uid ? remaining[0] : group.leaderId;
      const batch = db.batch();
      batch.delete(groupRef.collection("members").doc(uid));
      batch.update(groupRef, {
        memberIds: remaining,
        leaderId: newLeaderId,
        updatedAt: Date.now(),
      });
      await batch.commit();
    }
  }
}

// Full account teardown: groups first (needs to read groupMemberships before
// it's gone), then a recursive delete of the users/{uid} doc — which also
// removes courses, tasks, schedule/*, dashboardWidgets, dashboard/config and
// groupMemberships in one call, since they all live under it — then the
// Firebase Auth user itself, so the credentials can't sign in again.
export async function deleteUserAccount(uid: string): Promise<void> {
  await leaveAllGroups(uid);

  const db = getAdminDb();
  await db.recursiveDelete(db.collection("users").doc(uid));

  await getAdminAuth().deleteUser(uid);
}
