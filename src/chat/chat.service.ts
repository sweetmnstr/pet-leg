import { Twilio } from 'twilio';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UserInstance } from 'twilio/lib/rest/conversations/v1/user';

@Injectable()
export class ChatService {
  private readonly client: Twilio;

  constructor() {
    this.client = new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  }

  async createConversationUser(userId: number): Promise<UserInstance> {
    const identity = uuidv4();

    return this.client.conversations.v1.users.create({
      identity,
      friendlyName: `${userId}`,
    });
  }

  async getOrCreateConversation(
    customerIdentity: { twilioIdentitySid: string; twilioUserSid: string },
    lawyerIdentity: { twilioIdentitySid: string; twilioUserSid: string },
  ): Promise<string> {
    let conversation;

    try {
      const customerConversations = await this.client.conversations.v1
        .users(customerIdentity.twilioUserSid)
        .userConversations.list();

      const lawyerConversations = await this.client.conversations.v1
        .users(lawyerIdentity.twilioUserSid)
        .userConversations.list();

      const [commonConversation] = customerConversations.filter(
        (customerConvo) =>
          lawyerConversations.find(
            (lawyerConvo) =>
              lawyerConvo.conversationSid === customerConvo.conversationSid,
          ),
      );

      conversation = commonConversation;
    } catch (e) {
      conversation = null;
    }

    let conversationSid = conversation?.conversationSid;

    if (!conversation) {
      const createdConversation =
        await this.client.conversations.v1.conversations.create();

      const participants = await createdConversation.participants();

      await participants.create({
        identity: customerIdentity.twilioIdentitySid,
      });

      await participants.create({
        identity: lawyerIdentity.twilioIdentitySid,
      });

      conversationSid = createdConversation.sid;
    }

    return conversationSid;
  }

  async sendMessageToLawyer(
    customerIdentity: { twilioIdentitySid: string; twilioUserSid: string },
    lawyerIdentity: { twilioIdentitySid: string; twilioUserSid: string },
    message: string,
  ): Promise<void> {
    const conversationId = await this.getOrCreateConversation(
      customerIdentity,
      lawyerIdentity,
    );

    await this.client.conversations.v1
      .conversations(conversationId)
      .messages.create({
        author: customerIdentity.twilioIdentitySid,
        body: message,
      });
  }
}
