import { Logger } from '@nestjs/common';
import { RabbitMQModule, Channel } from './rabbitmq-client.module';

export const rabbitMQModule = RabbitMQModule.registerAsync({
  useFactory: async () => {
    const logger = new Logger('RabbitMQModule');

    return {
      connectionOptions: {
        REPLY_QUEUE: process.env.RABBITMQ_REPLY_QUEUE,
        url: process.env.RABBITMQ_URL,
      },
      onChannelReady: async (channel: Channel) => {
        logger.log('RabbitMQModule client ready');

        channel.on('error', (err) => {
          logger.error('RabbitMQModule Client Error: ', err);
        });
      },
      onRabbitConnect: (conn) => {
        logger.log(
          `Connected to RabbitMQModule on ${process.env.RABBITMQ_URL}`,
        );
      },
    };
  },
});
