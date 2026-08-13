export const MAX_GROUP_MEMBERS = 15;

export interface Group {
  code: string;
  projectName: string;
  leaderId: string;
  memberIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface GroupMember {
  uid: string;
  name: string;
  photoURL: string | null;
  joinedAt: number;
}

export interface GroupMembership {
  groupId: string;
  projectName: string;
  joinedAt: number;
}

export interface GroupMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: number;
}

export interface GroupLink {
  id: string;
  url: string;
  label: string;
  platform: string | null;
  addedBy: string;
  createdAt: number;
}
