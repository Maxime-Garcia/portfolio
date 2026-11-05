import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  artistUrl,
  cleanArtist,
  musicSchema,
  pickGenres,
  playsFromHtml,
  playsFromJson,
  topArtists,
  topGenres,
  topTracks,
  cleanTitle,
  videoIdOf,
  watchUrl,
} from '../../src/lib/music';

const json = [
  {
    header: 'YouTube Music',
    title: 'Watched A1',
    subtitles: [{ name: 'Alpha - Topic', url: 'https://www.youtube.com/channel/UC_alpha' }],
    time: '2026-05-01T00:00:00Z',
  },
  {
    header: 'YouTube Music',
    title: 'Watched A2',
    subtitles: [{ name: 'Alpha - Topic' }],
    time: '2026-06-01T00:00:00Z',
  },
  {
    header: 'YouTube Music',
    title: 'Watched B1',
    subtitles: [{ name: 'Beta' }],
    time: '2024-01-01T00:00:00Z',
  },
  { header: 'YouTube', title: 'Watched a video', subtitles: [{ name: 'Some vlogger' }] },
  { header: 'YouTube Music', title: 'Watched removed' },
];

describe('takeout parsing', () => {
  it('keeps YouTube Music plays and cleans "- Topic" channels', () => {
    expect(cleanArtist('Daft Punk - Topic')).toBe('Daft Punk');
    const plays = playsFromJson(json);
    expect(plays.map((p) => p.artist)).toEqual(['Alpha', 'Alpha', 'Beta']);
  });

  it('reads the HTML export too', () => {
    const html = `
      <div class="outer-cell mdl-cell"><div class="header-cell"><p>YouTube Music</p></div>
      <div class="content-cell">Watched <a href="https://music.youtube.com/watch?v=1">Song</a><br>
      <a href="https://www.youtube.com/channel/UC_x">Gamma &amp; Co - Topic</a><br>Jan 1</div></div>
      <div class="outer-cell mdl-cell"><div class="header-cell"><p>YouTube</p></div>
      <div class="content-cell">Watched <a href="https://www.youtube.com/watch?v=2">Clip</a><br>
      <a href="https://www.youtube.com/channel/UC_y">Vlogger</a></div></div>`;
    expect(playsFromHtml(html)).toEqual([
      {
        artist: 'Gamma & Co',
        channelUrl: 'https://www.youtube.com/channel/UC_x',
        title: 'Song',
        videoId: undefined,
      },
    ]);
  });

  it('ranks artists, optionally since a date', () => {
    const plays = playsFromJson(json);
    expect(topArtists(plays, 5).map((a) => [a.name, a.plays])).toEqual([
      ['Alpha', 2],
      ['Beta', 1],
    ]);
    expect(topArtists(plays, 5, '2025-01-01').map((a) => a.name)).toEqual(['Alpha']);
    expect(topArtists(plays, 1)[0].channelUrl).toBe('https://www.youtube.com/channel/UC_alpha');
  });
});

describe('tracks', () => {
  it('cleans titles and reads video ids', () => {
    expect(cleanTitle('Watched Nocturne No. 2')).toBe('Nocturne No. 2');
    expect(cleanTitle('Vous avez regardé Sheesh')).toBe('Sheesh');
    expect(videoIdOf('https://music.youtube.com/watch?v=abc_123-X&list=1')).toBe('abc_123-X');
    expect(videoIdOf(undefined)).toBeUndefined();
    expect(watchUrl('abc123')).toBe('https://music.youtube.com/watch?v=abc123');
  });

  it('ranks the most played songs, most recent play first in the history', () => {
    const plays = playsFromJson([
      {
        header: 'YouTube Music',
        title: 'Watched Song A',
        titleUrl: 'https://music.youtube.com/watch?v=aaaaaa',
        subtitles: [{ name: 'X - Topic' }],
      },
      {
        header: 'YouTube Music',
        title: 'Watched Song B',
        titleUrl: 'https://music.youtube.com/watch?v=bbbbbb',
        subtitles: [{ name: 'Y' }],
      },
      {
        header: 'YouTube Music',
        title: 'Watched Song A',
        titleUrl: 'https://music.youtube.com/watch?v=aaaaaa',
        subtitles: [{ name: 'X - Topic' }],
      },
    ]);
    expect(plays[0]).toMatchObject({ title: 'Song A', videoId: 'aaaaaa', artist: 'X' });
    expect(topTracks(plays, 5)).toEqual([
      { videoId: 'aaaaaa', title: 'Song A', artist: 'X' },
      { videoId: 'bbbbbb', title: 'Song B', artist: 'Y' },
    ]);
  });
});

describe('genres', () => {
  it('drops noise tags and keeps the strongest', () => {
    expect(
      pickGenres([
        { name: 'seen live', count: 9 },
        { name: 'Rock', count: 5 },
        { name: 'Indie', count: 7 },
        { name: '90s', count: 8 },
        { name: 'none', count: 0 },
      ]),
    ).toEqual(['indie', 'rock']);
  });

  it('weights genres by artist plays and first tags', () => {
    const genres = topGenres(
      [
        { plays: 10, genres: ['rock', 'indie'] },
        { plays: 4, genres: ['electronic'] },
      ],
      5,
    );
    expect(genres[0]).toEqual({ name: 'rock', weight: 1 });
    expect(genres.map((g) => g.name)).toEqual(['rock', 'indie', 'electronic']);
  });
});

describe('published data', () => {
  it('links artists to their YouTube Music channel, or a search', () => {
    expect(artistUrl('A', 'https://www.youtube.com/channel/UC_a')).toBe(
      'https://music.youtube.com/channel/UC_a',
    );
    expect(artistUrl('A B')).toBe('https://music.youtube.com/search?q=A%20B');
  });

  it('src/content/music.json matches the schema and holds no play counts', () => {
    const data = JSON.parse(readFileSync('src/content/music.json', 'utf8'));
    expect(() => musicSchema.parse(data)).not.toThrow();
    expect(JSON.stringify(data)).not.toMatch(/"plays"/);
  });
});
