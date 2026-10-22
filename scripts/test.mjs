import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { unzipSync } from 'fflate';

const manifest = JSON.parse(await readFile('public/manifest.json', 'utf8'));
const code = await readFile(`dist/youtub-ext-v${manifest.version}/content.js`, 'utf8');
const archive = unzipSync(await readFile(`release/youtub-ext-v${manifest.version}.zip`));
assert.ok(archive['manifest.json'], 'ZIP manifest is at the root');
assert.ok(archive['LICENSE'], 'ZIP includes the project license');
assert.ok(archive['content.js'], 'ZIP includes the playback bundle');
assert.ok(archive['main.js'], 'ZIP includes the popup bundle');
assert.ok(archive['popup.html'], 'ZIP includes the popup markup');
for (const [path, content] of Object.entries(archive)) {
  assert.ok(!path.includes('\\') && !path.startsWith('/'), 'ZIP paths are portable and relative');
  assert.deepEqual(Buffer.from(content), await readFile(`dist/youtub-ext-v${manifest.version}/${path}`), `ZIP matches build: ${path}`);
}
console.log('Release checks passed: ZIP root, required files, portable paths and matching contents.');

async function player(intro, outro, duration = 120) {
  const events = {};
  let navigate;
  let change;
  let ad = false;
  const video = {
    duration, currentTime: 0, currentSrc: 'video-1',
    closest: () => ({ classList: { contains: () => ad } }),
    addEventListener: (name, callback) => { events[name] = callback; },
    removeEventListener: name => { delete events[name]; },
  };
  const location = { pathname: '/watch', href: 'https://www.youtube.com/watch?v=1' };
  runInNewContext(code, {
    location,
    chrome: {
      storage: {
        sync: { get: async () => ({ intro, outro, theme: 'system' }) },
        onChanged: { addListener: callback => { change = callback; } },
      }
    },
    document: {
      querySelector: selector => selector === 'video.html5-main-video' ? video : null,
      querySelectorAll: () => [],
      documentElement: {},
      addEventListener: (_, callback) => { navigate = callback; },
    },
    MutationObserver: class { observe() { } disconnect() { } },
  });
  await new Promise(resolve => setImmediate(resolve));
  return { video, events, location, navigate: () => navigate(), change: value => change(value, 'sync'), ad: value => { ad = value; } };
}

const normal = await player(10, 5);
assert.equal(normal.video.currentTime, 10);
normal.video.currentTime = 2;
normal.events.timeupdate();
assert.equal(normal.video.currentTime, 2, 'Manual seek back stays available');
normal.video.currentTime = 115;
normal.events.timeupdate();
assert.equal(normal.video.currentTime, 120);
normal.location.href = 'https://www.youtube.com/watch?v=2';
normal.video.currentSrc = 'video-2';
normal.video.currentTime = 0;
normal.navigate();
normal.events.timeupdate();
assert.equal(normal.video.currentTime, 10, 'SPA navigation resets skipping');

const short = await player(30, 30, 45);
assert.equal(short.video.currentTime, 0);
const live = await player(10, 5, Infinity);
assert.equal(live.video.currentTime, 0);
const disabled = await player(0, 0);
assert.equal(disabled.video.currentTime, 0);
disabled.ad(true);
disabled.change({ intro: { newValue: 10 } });
assert.equal(disabled.video.currentTime, 0, 'Ads are left alone');
disabled.ad(false);
disabled.events.timeupdate();
assert.equal(disabled.video.currentTime, 10, 'Settings apply after an ad');
console.log('Playback checks passed: intro, outro, manual seeking, navigation, short videos, live streams, disabled settings, ads.');

const nonstopBuild = await build({ entryPoints: ['src/features/nonstop.ts'], bundle: true, write: false, format: 'iife', globalName: 'feature' });
let callback;
let connected = false;
let visible = true;
let disabledButton = false;
let message = 'Video paused. Continue watching?';
let clicks = 0;
let dialogs = [];
const button = {
  matches: () => disabledButton,
  click: () => { clicks++; },
};
const dialog = {
  getClientRects: () => visible ? [{}] : [],
  closest: () => null,
  querySelector: selector => selector === '#content' ? { textContent: message } : button,
};
const context = {
  document: {
    documentElement: {},
    querySelector: () => ({}),
    querySelectorAll: () => dialogs,
  },
  MutationObserver: class {
    constructor(handler) { callback = handler; }
    observe() { connected = true; }
    disconnect() { connected = false; }
  },
};
runInNewContext(nonstopBuild.outputFiles[0].text, context);
context.feature.nonstop(true);
assert.equal(clicks, 0);
dialogs = [dialog];
callback();
assert.equal(clicks, 1, 'New prompt is confirmed synchronously in the observer callback');
callback();
assert.equal(clicks, 1, 'Other mutations do not repeat the click');
visible = false;
callback();
visible = true;
callback();
assert.equal(clicks, 2, 'Reopened prompts are confirmed again');
context.feature.nonstop(false);
assert.equal(connected, false, 'Disabled feature disconnects observation');
context.feature.nonstop(true);
assert.equal(clicks, 3, 'Enabling confirms an already visible prompt');
visible = false;
callback();
visible = true;
message = 'Remove this video from your playlist?';
callback();
assert.equal(clicks, 3, 'Unrelated dialogs are ignored');
message = 'Video paused. Continue watching?';
disabledButton = true;
callback();
assert.equal(clicks, 3, 'Disabled confirmation buttons are ignored');
disabledButton = false;
callback();
assert.equal(clicks, 4, 'Confirmation runs as soon as the button becomes enabled');

const settingsBuild = await build({ entryPoints: ['src/features/settings.ts'], bundle: true, write: false, format: 'iife', globalName: 'preferences' });
let stored = {};
const settingsContext = { chrome: { storage: { sync: { get: async defaults => ({ ...defaults, ...stored }) } } } };
runInNewContext(settingsBuild.outputFiles[0].text, settingsContext);
let preferences = await settingsContext.preferences.read();
assert.equal(preferences.intro, 5);
assert.equal(preferences.nonstop, true);
stored = { intro: 0, nonstop: false };
preferences = await settingsContext.preferences.read();
assert.equal(preferences.intro, 0, 'Explicitly disabled Intro stays disabled');
assert.equal(preferences.nonstop, false, 'Explicitly disabled Non stop playing stays disabled');
console.log('Nonstop checks passed: immediate confirmation, duplicate prevention, reopened prompts, toggling, unrelated dialogs, disabled buttons, defaults and saved preferences.');
