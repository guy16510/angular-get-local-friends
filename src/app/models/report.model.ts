export interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string;
  conversationId: string;
  messageId?: string;
  timestamp: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportInput {
  reportedUserId: string;
  conversationId: string;
  messageId?: string;
  reason: string;
} 