import { read, seconds, type Settings } from './settings';
import { nonstop } from './nonstop';

let settings: Settings;
let video: HTMLVideoElement | null = null;
let introDone = false;
let outroDone = false;
let source = '';
let route = location.href;

function skip(): void {
  if (!video) return;
  const player = video.closest('#movie_player');
  if (player?.classList.contains('ad-showing') || player?.classList.contains('ad-interrupting')) return;
  if (location.pathname !== '/watch' || !Number.isFinite(video.duration) || video.duration <= 0) return;
  if (source !== video.currentSrc) {
    source = video.currentSrc;
    introDone = false;
    outroDone = false;
  }
  const { duration, currentTime } = video;
  if (settings.intro >= duration || settings.intro + settings.outro >= duration) return;
  if (!introDone && settings.intro > 0) {
    introDone = true;
    if (currentTime < settings.intro) video.currentTime = settings.intro;
  }
  if (!outroDone && settings.outro > 0 && currentTime >= duration - settings.outro) {
    outroDone = true;
    video.currentTime = duration;
  }
}

function attach(): void {
  const next = document.querySelector<HTMLVideoElement>('video.html5-main-video');
  if (route !== location.href) {
    route = location.href;
    introDone = false;
    outroDone = false;
    source = '';
  }
  if (next === video) return;
  if (video) {
    video.removeEventListener('timeupdate', skip);
    video.removeEventListener('loadedmetadata', skip);
    video.removeEventListener('durationchange', skip);
  }
  video = next;
  source = '';
  introDone = false;
  outroDone = false;
  if (video) {
    video.addEventListener('timeupdate', skip);
    video.addEventListener('loadedmetadata', skip);
    video.addEventListener('durationchange', skip);
    skip();
  }
}

async function start(): Promise<void> {
  settings = await read();
  nonstop(settings.nonstop);
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    if (changes.intro) { settings.intro = seconds(changes.intro.newValue); introDone = false; }
    if (changes.outro) { settings.outro = seconds(changes.outro.newValue); outroDone = false; }
    if (changes.nonstop) {
      settings.nonstop = changes.nonstop.newValue !== false;
      nonstop(settings.nonstop);
    }
    skip();
  });
  document.addEventListener('yt-navigate-finish', attach);
  new MutationObserver(attach).observe(document.documentElement, { childList: true, subtree: true });
  attach();
}

void start();
