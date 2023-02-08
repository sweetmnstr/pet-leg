import { NotificationTypes } from '../enums/notification-types.enum';

export const LawyerFilter = [
  NotificationTypes.lawyer_CUSTOMER_SENT_MESSAGE,
  NotificationTypes.lawyer_CUSTOMER_SCHEDULED_CONSULTATION,
  NotificationTypes.lawyer_CUSTOMER_REJECTED_CONSULTATION,
  NotificationTypes.lawyer_CUSTOMER_RESCHEDULE_CONSULTATION,
  NotificationTypes.lawyer_CUSTOMER_APPROVED_NEW_TIME_FOR_CONSULTATION,
  NotificationTypes.lawyer_CUSTOMER_ADDED_FEEDBACK,
  NotificationTypes.lawyer_CUSTOMER_ADDED_THE_link,
  NotificationTypes.lawyer_CUSTOMER_MARKED_CONSULTATION_AS_COMPLETED,
  NotificationTypes.lawyer_MODERATOR_SENT_THE_MESSAGE,
  NotificationTypes.lawyer_MODERATOR_APPROVED_YOUR_POST,
  NotificationTypes.lawyer_MODERATOR_REJECTED_YOUR_POST,
  NotificationTypes.lawyer_MODERATOR_APPROVED_YOUR_CHANGES,
  NotificationTypes.lawyer_MODERATOR_REJECTED_YOUR_CHANGES,
];
