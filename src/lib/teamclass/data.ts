"use client";

import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { detectLinkPlatform } from "@/lib/teamclass/links";
import { MAX_GROUP_MEMBERS, type Group, type GroupLink } from "@/lib/teamclass/types";

export function groupRef(code: string) {
  return doc(db, "groups", code);
}

export function membersCollectionRef(code: string) {
  return collection(db, "groups", code, "members");
}

function memberRef(code: string, uid: string) {
  return doc(db, "groups", code, "members", uid);
}

function membershipRef(uid: string, code: string) {
  return doc(db, "users", uid, "groupMemberships", code);
}

export function membershipsCollectionRef(uid: string) {
  return collection(db, "users", uid, "groupMemberships");
}

export function messagesCollectionRef(code: string) {
  return collection(db, "groups", code, "messages");
}

export function linksCollectionRef(code: string) {
  return collection(db, "groups", code, "links");
}

function generateCode(): string {
  return String(Math.floor(Math.random() * 10000)).padStart(4, "0");
}

type MemberProfile = { name: string; photoURL: string | null };

export async function createGroup(
  uid: string,
  profile: MemberProfile,
  projectName: string
): Promise<Group> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = generateCode();
    try {
      return await runTransaction(db, async (transaction) => {
        const existing = await transaction.get(groupRef(code));
        if (existing.exists()) {
          throw new Error("CODE_TAKEN");
        }

        const now = Date.now();
        const group: Group = {
          code,
          projectName: projectName.trim(),
          leaderId: uid,
          memberIds: [uid],
          createdAt: now,
          updatedAt: now,
        };

        transaction.set(groupRef(code), group);
        transaction.set(memberRef(code, uid), {
          uid,
          name: profile.name,
          photoURL: profile.photoURL,
          joinedAt: now,
        });
        transaction.set(membershipRef(uid, code), {
          groupId: code,
          projectName: group.projectName,
          joinedAt: now,
        });

        return group;
      });
    } catch (error) {
      if (error instanceof Error && error.message === "CODE_TAKEN") continue;
      throw error;
    }
  }
  throw new Error("No se pudo generar un código disponible. Inténtalo de nuevo.");
}

export async function joinGroup(
  uid: string,
  profile: MemberProfile,
  code: string
): Promise<Group> {
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(groupRef(code));
    if (!snapshot.exists()) {
      throw new Error("NOT_FOUND");
    }

    const group = snapshot.data() as Group;
    if (group.memberIds.includes(uid)) {
      return group;
    }
    if (group.memberIds.length >= MAX_GROUP_MEMBERS) {
      throw new Error("GROUP_FULL");
    }

    const now = Date.now();
    transaction.update(groupRef(code), { memberIds: arrayUnion(uid), updatedAt: now });
    transaction.set(memberRef(code, uid), {
      uid,
      name: profile.name,
      photoURL: profile.photoURL,
      joinedAt: now,
    });
    transaction.set(membershipRef(uid, code), {
      groupId: code,
      projectName: group.projectName,
      joinedAt: now,
    });

    return { ...group, memberIds: [...group.memberIds, uid], updatedAt: now };
  });
}

// Runs after the leaving member's own docs are already gone.
async function destroyGroup(code: string): Promise<void> {
  const [messagesSnapshot, linksSnapshot] = await Promise.all([
    getDocs(messagesCollectionRef(code)),
    getDocs(linksCollectionRef(code)),
  ]);

  const batch = writeBatch(db);
  messagesSnapshot.forEach((docSnapshot) => batch.delete(docSnapshot.ref));
  linksSnapshot.forEach((docSnapshot) => batch.delete(docSnapshot.ref));
  batch.delete(groupRef(code));
  await batch.commit();
}

export async function leaveGroup(uid: string, code: string): Promise<void> {
  const snapshot = await getDoc(groupRef(code));
  if (!snapshot.exists()) {
    await deleteDoc(membershipRef(uid, code)).catch(() => {});
    return;
  }

  const group = snapshot.data() as Group;
  const remaining = group.memberIds.filter((id) => id !== uid);

  if (remaining.length === 0) {
    // Only the fast, small writes are awaited here — this is what the UI
    // waits on before navigating away. Deleting all messages/links and the
    // group doc itself can take longer for a chatty group and doesn't need
    // to block that; it finishes in the background instead of holding up
    // the confirmation modal.
    const batch = writeBatch(db);
    batch.delete(memberRef(code, uid));
    batch.delete(membershipRef(uid, code));
    await batch.commit();

    destroyGroup(code).catch(() => {});
    return;
  }

  const newLeaderId = group.leaderId === uid ? remaining[0] : group.leaderId;
  const batch = writeBatch(db);
  batch.delete(memberRef(code, uid));
  batch.delete(membershipRef(uid, code));
  batch.update(groupRef(code), {
    memberIds: arrayRemove(uid),
    leaderId: newLeaderId,
    updatedAt: Date.now(),
  });
  await batch.commit();
}

export async function expelMember(code: string, targetUid: string): Promise<void> {
  const snapshot = await getDoc(groupRef(code));
  if (!snapshot.exists()) return;
  const group = snapshot.data() as Group;

  const batch = writeBatch(db);
  batch.update(groupRef(code), {
    memberIds: arrayRemove(targetUid),
    leaderId: group.leaderId,
    updatedAt: Date.now(),
  });
  batch.delete(memberRef(code, targetUid));
  batch.delete(membershipRef(targetUid, code));
  await batch.commit();
}

// Used when a membership doc points at a group that no longer exists (e.g.
// deleted directly in the database, bypassing the app's own leave/cascade
// flow) — the client is the only thing that can notice and clean this up,
// since TeamClass has no backend of its own.
export async function deleteMembership(uid: string, code: string): Promise<void> {
  await deleteDoc(membershipRef(uid, code)).catch(() => {});
}

type Sender = { uid: string; name: string };

export async function sendTextMessage(code: string, sender: Sender, text: string): Promise<void> {
  await addDoc(messagesCollectionRef(code), {
    senderId: sender.uid,
    senderName: sender.name,
    text: text.trim(),
    createdAt: Date.now(),
  });
}

export async function addGroupLink(
  code: string,
  addedBy: string,
  url: string,
  label: string
): Promise<GroupLink> {
  const data = {
    url,
    label: label.trim(),
    platform: detectLinkPlatform(url),
    addedBy,
    createdAt: Date.now(),
  };
  const created = await addDoc(linksCollectionRef(code), data);
  return { id: created.id, ...data };
}

export async function deleteGroupLink(code: string, linkId: string): Promise<void> {
  await deleteDoc(doc(db, "groups", code, "links", linkId));
}
