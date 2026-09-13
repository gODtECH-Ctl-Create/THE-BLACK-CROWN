import assert from 'node:assert/strict';

const defaults = { sound: 'on', volume: 50, reducedMotion: 'system', events: 'full', coordinates: true, confirmNewGame: false };
assert.equal(defaults.sound, 'on');
assert.equal(defaults.volume, 50);
assert.equal(defaults.coordinates, true);
console.log('Settings defaults contract: PASS');
