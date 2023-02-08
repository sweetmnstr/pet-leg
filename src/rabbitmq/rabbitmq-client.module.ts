import { DynamicModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import * as amqp from 'amqplib';
import * as EventEmitter from 'events';

export const RabbitMQ = 'RabbitMQ';

type RabbitMQModuleOptions = {
  connectionOptions: RabbitMQConnectionOptions;
  onChannelReady?: (channel: Channel) => void;
  onRabbitConnect?: (conn: amqp.Connection) => void;
};

export interface Channel extends amqp.Channel {
  responseEmitter: EventEmitter;
}

type RabbitMQConnectionOptions = {
  url: string;
  REPLY_QUEUE: string;
};

type RabbitMQAsyncModuleOptions = {
  useFactory: (
    ...args: any[]
  ) => Promise<RabbitMQModuleOptions> | RabbitMQModuleOptions;
};

@Module({})
export class RabbitMQModule {
  static async registerAsync({
    useFactory,
  }: RabbitMQAsyncModuleOptions): Promise<DynamicModule> {
    const RabbitMQProvider = {
      provide: RabbitMQ,
      useFactory: async (...args) => {
        const { connectionOptions, onChannelReady, onRabbitConnect } =
          await useFactory(...args);

        const channel = await amqp
          .connect(connectionOptions.url)
          .then((conn) => {
            onRabbitConnect(conn);
            return conn.createChannel();
          })
          .then((channel: Channel) => {
            channel.responseEmitter = new EventEmitter();
            channel.responseEmitter.setMaxListeners(0);
            channel.consume(
              connectionOptions.REPLY_QUEUE,
              (msg) => {
                channel.responseEmitter.emit(
                  msg.properties.correlationId,
                  msg.content.toString('utf8'),
                );
              },
              { noAck: true },
            );
            return channel;
          });

        onChannelReady(channel);

        return channel;
      },
    };

    return {
      module: RabbitMQModule,
      providers: [RabbitMQProvider],
      exports: [RabbitMQProvider],
    };
  }
}
