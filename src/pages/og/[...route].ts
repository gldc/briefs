import { generateOpenGraphImage } from 'astro-og-canvas';
import { getSortedBriefs, briefTitle, briefSummary } from '../../lib/briefs';

export async function getStaticPaths() {
  const briefs = await getSortedBriefs();
  const paths = briefs.map((brief) => ({
    params: { route: brief.id + '.png' },
    props: {
      title: briefTitle(brief),
      description: briefSummary(brief),
    },
  }));

  paths.push({
    params: { route: 'default.png' },
    props: {
      title: 'Athena',
      description: 'Daily intelligence on AI & tech, distilled by Athena.',
    },
  });

  paths.push({
    params: { route: 'about.png' },
    props: {
      title: 'About Athena',
      description: 'Daily intelligence on AI & tech, distilled by Athena.',
    },
  });

  return paths;
}

export const GET = async ({ props }: any) => {
  const image = await generateOpenGraphImage({
    title: props.title,
    description: props.description,
    bgGradient: [[246, 241, 230]], // --color-paper
    font: {
      title: {
        color: [28, 23, 21], // --color-ink
        weight: 'Bold',
        size: 72,
      },
      description: {
        color: [132, 117, 102], // --color-mute (#847566)
        weight: 'Normal',
        size: 40,
      },
    },
    padding: 80,
  });
  return new Response(image);
};
