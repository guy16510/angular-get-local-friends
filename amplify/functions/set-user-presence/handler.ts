import { getIdentityId } from '../../shared/utils/identity';

export const handler = async (event: any, context: any) => {
  const { status } = event.arguments;
  const userId = getIdentityId(event.identity);

  await context.db.UserPresence.create({
    userId,
    status,
    lastSeen: new Date().toISOString()
  });

  return { userId, status };
};