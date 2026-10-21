import { generateChangelog, release } from '@abelspithost/conventional-commits-changelog';

// await release({
//   commitsRetrieverOptions: {
//     from: '@abelspithost/commitlint@0.1.5',
//     to: '@abelspithost/commitlint@0.1.8',
//   },
// });
await generateChangelog();
