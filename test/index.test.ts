import { handler } from 'src';
import {
  generateTestRecord,
  mockedCallback,
  mockedContext,
} from './testData.helper';
import { BookingType } from 'src/BookingType.enum';
import { ESBooking } from 'src/ESBooking.type';
import { BookingCompleted } from 'src/Booking.type';

vi.stubGlobal('fetch', vi.fn());

describe('Handler', () => {
  it('should send booking completed records to external service', async () => {
    const testKinesisEvent = {
      Records: [
        generateTestRecord(BookingType.booking_completed),
        generateTestRecord(BookingType.booking_completed),
      ],
    };

    await handler(testKinesisEvent, mockedContext, mockedCallback);
    expect(fetch).toBeCalledTimes(2);
  });

  it('should not send booking requested records to external service', async () => {
    const testKinesisEvent = {
      Records: [
        generateTestRecord(BookingType.booking_requested),
        generateTestRecord(BookingType.booking_requested),
      ],
    };

    await handler(testKinesisEvent, mockedContext, mockedCallback);
    expect(fetch).toBeCalledTimes(0);
  });

  it('should not error if there are no records', async () => {
    const testKinesisEvent = {
      Records: [],
    };
    await handler(testKinesisEvent, mockedContext, mockedCallback);
  });

  it('should send correct json format to external service', async () => {
    const testRecord = generateTestRecord(BookingType.booking_completed);

    const testRecordData: BookingCompleted = JSON.parse(
      Buffer.from(testRecord.kinesis.data, 'base64').toString('utf-8')
    );

    const testBody: ESBooking = {
      product_order_id_buyer: testRecordData.booking_completed.orderId,
      product_provider_buyer: testRecordData.booking_completed.product_provider,
      timestamp: new Date(testRecordData.timestamp).toISOString(),
    };

    const testKinesisEvent = {
      Records: [testRecord],
    };

    await handler(testKinesisEvent, mockedContext, mockedCallback);
    expect(fetch).toBeCalledWith(process.env.PUBLISH_URL, {
      method: 'POST',
      body: JSON.stringify(testBody),
    });
  });
});
