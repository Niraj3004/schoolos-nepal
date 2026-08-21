import { adToBs, bsToAd } from './nepaliDate';

describe('Nepali Date Converter', () => {
  it('should convert AD to BS correctly', () => {
    // 2026-08-21 is 2083-05-05 (Bhadra 5)
    const adDate = new Date('2026-08-21T00:00:00.000Z');
    const bsResult = adToBs(adDate);
    
    expect(bsResult.year).toBe(2083);
    expect(bsResult.month).toBe(5);
    expect(bsResult.day).toBe(5);
    expect(bsResult.formatted).toBe('2083-05-05');
  });

  it('should convert BS to AD correctly', () => {
    const adDate = bsToAd(2083, 5, 5);
    expect(adDate.getFullYear()).toBe(2026);
    expect(adDate.getMonth()).toBe(7); // August is 0-indexed month 7
    expect(adDate.getDate()).toBe(21);
  });

  it('should throw descriptive error for out-of-range BS date', () => {
    expect(() => {
      bsToAd(3000, 1, 1);
    }).toThrow('Out-of-range or invalid BS date');
  });
});
