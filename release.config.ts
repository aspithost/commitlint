import { release } from '@abelspithost/conventional-commits-changelog';

await release({
  changelogWriterOptions: {
    remoteRepositoryInformation: {
      host: 'https://github.com',
      owner: 'aspithost',
      repository: 'commitlint',
    },
  },
});
