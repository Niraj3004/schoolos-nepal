import NepaliDate from 'nepali-date-converter';

export const adToBs = (date: Date): { year: number, month: number, day: number, formatted: string } => {
  try {
    const bsDate = new NepaliDate(date);
    const year = bsDate.getYear();
    const month = bsDate.getMonth() + 1; // 0-indexed to 1-indexed
    const day = bsDate.getDate();
    
    return {
      year,
      month,
      day,
      formatted: bsDate.format('YYYY-MM-DD')
    };
  } catch (error) {
    throw new Error('Invalid AD date provided for conversion.');
  }
};

export const bsToAd = (bsYear: number, bsMonth: number, bsDay: number): Date => {
  try {
    const bsDate = new NepaliDate(bsYear, bsMonth - 1, bsDay);
    return bsDate.toJsDate();
  } catch (error) {
    throw new Error(`Out-of-range or invalid BS date provided: ${bsYear}-${bsMonth}-${bsDay}.`);
  }
};
