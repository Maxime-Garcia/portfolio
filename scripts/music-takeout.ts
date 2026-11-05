// Turns a Google Takeout YouTube Music history into the "What I listen to" pills.
//
//   node scripts/music-takeout.ts <watch-history.json|.html> [--top 12] [--tracks 6] [--since 2025-01-01]
//
// Takeout: https://takeout.google.com → "YouTube and YouTube Music" → history only.
// The raw history never leaves your machine. Published in src/content/music.json: the most recent
// song (with its date), the most played songs (titles + covers), and the artist/genre ranking —
// never play counts nor the rest of the history. Covers go to public/music/ (cropped album art).
// Genres come from MusicBrainz tags (free API, 1 request per second).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import {
  artistUrl,
  musicSchema,
  pickGenres,
  playsFromHtml,
  playsFromJson,
  topArtists,
  topGenres,
  topTracks,
  watchUrl,
  type MusicData,
} from '../src/lib/music.ts';

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const option = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
if (!file) {
  console.error(
    'Usage: node scripts/music-takeout.ts <watch-history.json|.html> [--top 12] [--since YYYY-MM-DD]',
  );
  process.exit(1);
}

const raw = readFileSync(file, 'utf8');
const plays = file.endsWith('.json') ? playsFromJson(JSON.parse(raw)) : playsFromHtml(raw);
if (plays.length === 0) {
  console.error('No YouTube Music plays found in this export.');
  process.exit(1);
}
const top = topArtists(plays, Number(option('top') ?? 12), option('since'));
console.log(`${plays.length} plays, top ${top.length} artists. Fetching genres from MusicBrainz…`);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
async function genresOf(name: string): Promise<string[]> {
  const url = `https://musicbrainz.org/ws/2/artist/?query=${encodeURIComponent(`artist:"${name}"`)}&fmt=json&limit=1`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'orbite-portfolio/1.0 (https://github.com/Maxime-Garcia/portfolio)' },
  });
  if (!response.ok) return [];
  const data = (await response.json()) as {
    artists?: { tags?: { name: string; count: number }[] }[];
  };
  return pickGenres(data.artists?.[0]?.tags ?? []);
}

const artists = [];
for (const artist of top) {
  const genres = await genresOf(artist.name);
  console.log(`  ${artist.name}: ${genres.join(', ') || '—'}`);
  artists.push({ ...artist, genres });
  await sleep(1100);
}

/** Downloads a song thumbnail and crops it to the square album art (YouTube letterboxes it). */
async function cover(videoId: string): Promise<string | undefined> {
  mkdirSync('public/music', { recursive: true });
  for (const size of ['maxresdefault', 'hqdefault']) {
    const response = await fetch(`https://i.ytimg.com/vi/${videoId}/${size}.jpg`);
    if (!response.ok) continue;
    const image = sharp(Buffer.from(await response.arrayBuffer()));
    const { width = 0, height = 0 } = await image.metadata();
    const side = Math.min(width, height);
    await image
      .extract({
        left: Math.round((width - side) / 2),
        top: Math.round((height - side) / 2),
        width: side,
        height: side,
      })
      .resize(320, 320)
      .webp({ quality: 80 })
      .toFile(`public/music/${videoId}.webp`);
    return `/music/${videoId}.webp`;
  }
  return undefined;
}

const songs = topTracks(plays, Number(option('tracks') ?? 6), option('since'));
const last = plays.find((p) => p.videoId && p.title);
console.log(`Downloading ${songs.length + (last ? 1 : 0)} covers…`);
const tracks = [];
for (const song of songs) {
  tracks.push({
    title: song.title,
    artist: song.artist,
    url: watchUrl(song.videoId),
    cover: await cover(song.videoId),
  });
}
const latest =
  last?.videoId && last.title
    ? {
        title: last.title,
        artist: last.artist,
        url: watchUrl(last.videoId),
        cover: await cover(last.videoId),
        playedAt: last.time ?? new Date().toISOString(),
      }
    : undefined;

const music: MusicData = musicSchema.parse({
  placeholder: false,
  generatedAt: new Date().toISOString().slice(0, 10),
  latest,
  tracks,
  genres: topGenres(artists, 10),
  artists: artists.map(({ name, channelUrl, genres }) => ({
    name,
    url: artistUrl(name, channelUrl),
    genres,
  })),
});
writeFileSync('src/content/music.json', `${JSON.stringify(music, null, 2)}\n`);
console.log('Wrote src/content/music.json');
