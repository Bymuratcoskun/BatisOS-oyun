// v1.4 dil seçimi: adres → saklanan → tarayıcı dili. Bozuk değer sessizce kabul edilmez, sıradakine düşer.
import { describe, expect, it } from 'vitest';
import { dilSec } from '../../src/i18n/dil.ts';

describe('v1.4 dil seçimi', () => {
  it('adresteki ?lang= her şeyden önce gelir', () => {
    expect(dilSec('?lang=en', 'tr', ['tr-TR'])).toBe('en');
    expect(dilSec('?lang=tr', 'en', ['en-US'])).toBe('tr');
  });
  it('adreste yoksa saklanan seçim; o da yoksa tarayıcı dili', () => {
    expect(dilSec('', 'en', ['tr-TR'])).toBe('en');
    expect(dilSec('', null, ['tr-TR', 'en'])).toBe('tr');
    expect(dilSec('', null, ['de-DE', 'tr'])).toBe('tr'); // listede Türkçe varsa Türkçe
    expect(dilSec('', null, ['en-GB'])).toBe('en');
    expect(dilSec('', null, ['de-DE'])).toBe('en'); // Türkçe bilmeyen için İngilizce
  });
  it('geçersiz değerler yok sayılır, sıradakine düşülür; hiçbir bilgi yoksa Türkçe', () => {
    expect(dilSec('?lang=fr', 'xx', ['en-US'])).toBe('en');
    expect(dilSec('', null, [])).toBe('tr');
  });
});
