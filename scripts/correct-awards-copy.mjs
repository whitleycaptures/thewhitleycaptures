import { createClient } from '@sanity/client';
import { mkdir, writeFile } from 'node:fs/promises';
const apply = process.argv.includes('--apply');
const client = createClient({
  projectId: '4d7wgp7e',
  dataset: 'production',
  apiVersion: '2026-09-27',
  useCdn: false,
  perspective: 'raw',
  token: process.env.SANITY_AUTH_TOKEN,
});
const documents = await client.fetch(
  '*[_id in ["homepage", "drafts.homepage"]]',
);
const home = documents.find((d) => d._id === 'homepage');
const before =
  'I’m grateful to have my work recognised by photography awards, especially whe little people in front of my camera always come first.';
const after =
  'I’m grateful to have my work recognised by photography awards. The little people in front of my camera always come first.';
if (home?.awards?.copy === after) {
  console.log('Awards copy already corrected.');
} else {
  if (documents.some((d) => d._id.startsWith('drafts.')))
    throw Error('Homepage has an unpublished draft; leave it untouched.');
  if (home?.awards?.copy !== before)
    throw Error('Published copy changed; review before updating.');
  console.log(JSON.stringify({ before, after, apply }));
  if (apply) {
    if (!process.env.SANITY_AUTH_TOKEN)
      throw Error('Run through Sanity exec with --with-user-token.');
    await mkdir('.wrangler/recovery-backups', { recursive: true });
    await writeFile(
      `.wrangler/recovery-backups/homepage-${Date.now()}.json`,
      JSON.stringify(home, null, 2),
    );
    await client
      .patch(home._id)
      .ifRevisionId(home._rev)
      .set({ 'awards.copy': after })
      .commit();
    console.log(
      'Corrected only awards.copy; revision guard and backup recorded.',
    );
  }
}
