export class Notification {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  userId?: string;
  read: boolean;
  createdAt: Date;
}
