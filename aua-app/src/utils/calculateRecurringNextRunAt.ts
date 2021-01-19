import { Recurring } from '../entity/Recurring';
import { CLIENT_TZ } from '../services/cronService';
import * as moment from 'moment-timezone';


export function calculateRecurringNextRunAt(recurring: Recurring): Date {
  const { startFrom, every, period } = recurring;
  const now = moment();
  let startMoment = moment(startFrom);
  if (startMoment.isBefore(now)) {
    // If the first one hasn't happen
    return startFrom;
  }

  return startMoment.tz(CLIENT_TZ).add(every, period).toDate();
}
