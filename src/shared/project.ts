// Project helpers shared by the server and the site.
import { slugify } from './article.ts';
import type { Project } from './types.ts';

/** URL slug: the one set in the admin, otherwise made from the Vietnamese title. */
export const projectSlug = (p: Project) => slugify(p.slug?.trim() || p.title?.vi || p.title?.en);

/** A project gets its own page once it has a write-up, results or a gallery. */
export const hasCaseStudy = (p: Project) =>
  Boolean((p.body?.vi || p.body?.en || '').trim() || p.results?.some((r) => r.value) || p.gallery?.some((g) => g.image));
