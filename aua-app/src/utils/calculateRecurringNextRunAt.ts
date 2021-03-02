import { Recurring } from '../entity/Recurring';
import { CLIENT_TZ } from '../services/cronService';
import * as moment from 'moment-timezone';


export function calculateRecurringNextRunAt(recurring: Recurring): Date {
  const { startFrom, every, period } = recurring;
  let startMoment = moment(startFrom);
  if (startMoment.isAfter()) {
    // If the first one hasn't happen
    return startFrom;
  }

  let round = 1;
  let nextRunMoment = startMoment.clone().tz(CLIENT_TZ).add(every, period);
  while(nextRunMoment.isBefore()) {
    round ++;
    nextRunMoment = startMoment.clone().tz(CLIENT_TZ).add(every * round, period);
  }
  return nextRunMoment.toDate();
}
