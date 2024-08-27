import {
  KinesisStreamEvent,
  KinesisStreamHandler,
  KinesisStreamRecordPayload,
} from 'aws-lambda';
import { Buffer } from 'buffer';
import { ESBooking } from './ESBooking.type';
import { BookingType } from './BookingType.enum';
import { Booking, BookingCompleted } from './Booking.type';

const PUBLISH_URL = process.env.PUBLISH_URL!;

export const handler: KinesisStreamHandler = async (
  event: KinesisStreamEvent
): Promise<void> => {
  await Promise.allSettled(
    event.Records.map(async (record) => {
      const booking = getBooking(record.kinesis);
      if (booking.type === BookingType.booking_completed) {
        const esBooking = parseBooking(booking as BookingCompleted);
        return publishBooking(esBooking);
      }
    })
  );
};

const getBooking = (payload: KinesisStreamRecordPayload): Booking => {
  const bookingString = Buffer.from(payload.data, 'base64').toString('utf-8');
  return JSON.parse(bookingString);
};

const parseBooking = (booking: BookingCompleted): ESBooking => {
  return {
    product_order_id_buyer: booking.booking_completed.orderId,
    product_provider_buyer: booking.booking_completed.product_provider,
    timestamp: new Date(booking.booking_completed.timestamp).toISOString(),
  };
};

const publishBooking = (esBooking: ESBooking) => {
  return fetch(PUBLISH_URL, {
    method: 'POST',
    body: JSON.stringify(esBooking),
  });
};
