import { Request } from 'express';
import { AuditLog } from '../models/AuditLog.js';

export async function logAudit(
  req: Request,
  action: string,
  targetType: string,
  targetId: string,
  reason?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    await AuditLog.create({
      actorId: req.user?.userId ?? 'system',
      eventId: (req.params.eventId as string) ?? undefined,
      action,
      targetType,
      targetId,
      reason,
      metadata: sanitizeMetadata(metadata),
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('[AUDIT] Failed to create audit log:', error);
  }
}

function sanitizeMetadata(metadata?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!metadata) return undefined;
  const sensitiveFields = ['password', 'passwordHash', 'token', 'answers', 'email', 'phone'];
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (sensitiveFields.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
