import { Context, KinesisStreamRecord } from 'aws-lambda';
import { BookingType } from 'src/BookingType.enum';
import { v4 as uuid } from 'uuid';

export const mockedContext: Context = {
  callbackWaitsForEmptyEventLoop: false,
  functionName: 'mocked',
  functionVersion: 'mocked',
  invokedFunctionArn: 'mocked',
  memoryLimitInMB: 'mocked',
  awsRequestId: 'mocked',
  logGroupName: 'mocked',
  logStreamName: 'mocked',
  getRemainingTimeInMillis: vi.fn(() => 0),
  done: vi.fn,
  fail: vi.fn,
  succeed: vi.fn,
};

export const mockedCallback = vi.fn();

export const generateTestRecord = (
  bookingType: BookingType
): KinesisStreamRecord => {
  const booking = generateTestBooking(bookingType);
  return {
    kinesis: {
      data: Buffer.from(JSON.stringify(booking)).toString('base64'),
      partitionKey: booking.partitionKey,
      approximateArrivalTimestamp: booking.timestamp,
      kinesisSchemaVersion: '1.0',
      sequenceNumber: booking.partitionKey,
    },
    eventSource: 'aws:kinesis',
    eventID: 'Test Event ID',
    invokeIdentityArn: 'arn:aws:iam::EXAMPLE',
    eventVersion: '1.0',
    eventName: 'aws:kinesis:record',
    eventSourceARN: 'arn:aws:kinesis:EXAMPLE',
    awsRegion: 'us-east-1',
  };
};

const generateTestBooking = (bookingType: BookingType) => {
  const timestamp = new Date().getTime();
  return {
    id: uuid(),
    partitionKey: uuid(),
    timestamp,
    type: bookingType,
    [bookingType]: {
      timestamp,
      product_provider: 'Test Provider',
      orderId: Math.floor(100000 + Math.random() * 900000),
    },
  };
};
