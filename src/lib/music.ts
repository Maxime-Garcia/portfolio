import { z } from 'astro/zod';

/** One play from a Google Takeout "watch-history" export (JSON variant). */
export interface TakeoutEntry {
  header?: string;
  title?: string;
  titleUrl?: string;
  subtitles?: { name?: string; url?: string }[];
  time?: string;
}

export interface Play {
  artist: string;
  /** Song title, without Takeout's "Watched" / "Vous avez regardé" prefix. */
  title?: string;
  /** YouTube video id of the song (its cover is the video thumbnail). */
  videoId?: string;
  /** YouTube channel of the artist, when the export has it. */
  channelUrl?: string;
  time?: string;
}

/** "Daft Punk - Topic" → "Daft Punk" (YouTube's auto-generated artist channels). */
export function cleanArtist(name: string): string {
  return name.replace(/\s+-\s+Topic$/i, '').trim();
}

/** Takeout prefixes titles with the action, in the account's language. */
export function cleanTitle(title: string): string {
  return title
    .replace(/^(Watched|Vous avez regardé|A regardé|Has visto|Hai guardato|Angesehen:?)\s+/i, '')
    .trim();
}

/** "https://music.youtube.com/watch?v=abc123" → "abc123". */
export function videoIdOf(url?: string): string | undefined {
  return url?.match(/[?&]v=([\w-]{6,})/)?.[1];
}

/** Keeps YouTube Music plays only, with their artist, title and video. Most recent first (Takeout order). */
export function playsFromJson(entries: TakeoutEntry[]): Play[] {
  const plays: Play[] = [];
  for (const entry of entries) {
    const channel = entry.subtitles?.[0];
    if (entry.header !== 'YouTube Music' || !channel?.name) continue;
    plays.push({
      artist: cleanArtist(channel.name),
      channelUrl: channel.url,
      time: entry.time,
      title: entry.title ? cleanTitle(entry.title) : undefined,
      videoId: videoIdOf(entry.titleUrl),
    });
  }
  return plays;
}

const decode = (html: string) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

/**
 * Same from the HTML variant (Takeout's default). Each YouTube Music cell holds
 * the song link, then the artist channel link.
 */
export function playsFromHtml(html: string): Play[] {
  const plays: Play[] = [];
  const cells = html.split(/<div class="outer-cell/).slice(1);
  for (const cell of cells) {
    if (!/YouTube Music/.test(cell.slice(0, 600))) continue;
    const links = [...cell.matchAll(/<a href="([^"]+)">([\s\S]*?)<\/a>/g)];
    const channel = links.find(([, href]) => /youtube\.com\/channel\//.test(href));
    if (!channel) continue;
    const song = links.find(([href]) => /watch\?v=/.test(href));
    plays.push({
      artist: cleanArtist(decode(channel[2])),
      channelUrl: channel[1],
      title: song ? decode(song[2]) : undefined,
      videoId: videoIdOf(song?.[1]),
    });
  }
  return plays;
}

/** Most played artists, ties broken alphabetically. `since` filters by ISO date when known. */
export function topArtists(plays: Play[], limit: number, since?: string) {
  const counts = new Map<string, { plays: number; channelUrl?: string }>();
  for (const play of plays) {
    if (since && play.time && play.time < since) continue;
    const entry = counts.get(play.artist) ?? { plays: 0, channelUrl: play.channelUrl };
    entry.plays += 1;
    entry.channelUrl ??= play.channelUrl;
    counts.set(play.artist, entry);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1].plays - a[1].plays || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name, { plays, channelUrl }]) => ({ name, plays, channelUrl }));
}

/** Most played songs (with a known video), ties broken by title. */
export function topTracks(plays: Play[], limit: number, since?: string) {
  const counts = new Map<string, { plays: number; title: string; artist: string }>();
  for (const play of plays) {
    if (!play.videoId || !play.title) continue;
    if (since && play.time && play.time < since) continue;
    const entry = counts.get(play.videoId) ?? { plays: 0, title: play.title, artist: play.artist };
    entry.plays += 1;
    counts.set(play.videoId, entry);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1].plays - a[1].plays || a[1].title.localeCompare(b[1].title))
    .slice(0, limit)
    .map(([videoId, { title, artist }]) => ({ videoId, title, artist }));
}

export const watchUrl = (videoId: string) => `https://music.youtube.com/watch?v=${videoId}`;

/** Genres weighted by the plays of the artists carrying them (top tags per artist). */
export function topGenres(artists: { plays: number; genres: string[] }[], limit: number) {
  const weights = new Map<string, number>();
  for (const artist of artists) {
    artist.genres.forEach((genre, rank) => {
      // An artist's first tag counts most.
      weights.set(genre, (weights.get(genre) ?? 0) + artist.plays / (rank + 1));
    });
  }
  const max = Math.max(1, ...weights.values());
  return [...weights.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name, weight]) => ({ name, weight: Math.round((weight / max) * 100) / 100 }));
}

/** Lower-cases, drops non-genre MusicBrainz tags and keeps the strongest ones. */
export function pickGenres(tags: { name: string; count: number }[], limit = 3): string[] {
  const noise =
    /^(seen live|favorites?|\d{2,4}s?|male vocalists?|female vocalists?|british|american|french|english)$/i;
  return tags
    .filter((t) => t.count > 0 && !noise.test(t.name))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((t) => t.name.toLowerCase());
}

/** What the site publishes: a ranking, never the raw listening history nor play counts. */
const track = z.object({
  title: z.string(),
  artist: z.string(),
  url: z.url(),
  /** Local cover in public/music/, absent for placeholders. */
  cover: z.string().optional(),
});

export const musicSchema = z.object({
  placeholder: z.boolean().default(false),
  generatedAt: z.string(),
  /** The most recent play (published with its date). */
  latest: track.extend({ playedAt: z.string() }).optional(),
  /** Most played songs, shown as covers. */
  tracks: z.array(track).default([]),
  genres: z.array(z.object({ name: z.string(), weight: z.number().min(0).max(1) })),
  artists: z.array(z.object({ name: z.string(), url: z.url(), genres: z.array(z.string()) })),
});

export type MusicData = z.infer<typeof musicSchema>;

/** Link to the artist on YouTube Music: their channel when known, a search otherwise. */
export function artistUrl(name: string, channelUrl?: string): string {
  const channel = channelUrl?.match(/youtube\.com\/channel\/([\w-]+)/)?.[1];
  return channel
    ? `https://music.youtube.com/channel/${channel}`
    : `https://music.youtube.com/search?q=${encodeURIComponent(name)}`;
}
