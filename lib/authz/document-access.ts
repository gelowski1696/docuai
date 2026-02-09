export function canAccessDocument(ownerUserId: string, requesterId: string, requesterRole: string): boolean {
  return ownerUserId === requesterId || requesterRole === 'ADMIN';
}
