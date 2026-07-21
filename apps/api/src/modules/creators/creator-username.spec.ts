import {
  isReservedCreatorUsername,
  isValidCreatorUsername,
  normalizeCreatorUsername,
} from './creator-username';

describe('creator username rules', () => {
  it('normalizes a valid username', () => {
    expect(normalizeCreatorUsername('  Aryan.Fanzo_7 ')).toBe('aryan.fanzo_7');
    expect(isValidCreatorUsername('  Aryan.Fanzo_7 ')).toBe(true);
  });

  it.each(['ab', 'has space', 'creator!', 'a'.repeat(31)])(
    'rejects invalid username %s',
    (username) => {
      expect(isValidCreatorUsername(username)).toBe(false);
    },
  );

  it.each(['admin', ' Sign-In ', 'privacy'])('rejects reserved username %s', (username) => {
    expect(isReservedCreatorUsername(username)).toBe(true);
  });
});
