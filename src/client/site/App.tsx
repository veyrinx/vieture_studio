// Global styles first, so each component's CSS can override them (same order as the original single file).
import './styles/base.css';
import { SiteProvider } from './context.tsx';
import { Home } from './pages/Home/Home.tsx';
import { BlogList } from './pages/Blog/BlogList.tsx';
import { BlogPost } from './pages/Blog/BlogPost.tsx';
import { Privacy } from './pages/Privacy/Privacy.tsx';
import { CareersPage } from './pages/Careers/CareersPage.tsx';
import { JobPage } from './pages/Careers/JobPage.tsx';
import { ProjectsPage } from './pages/Projects/ProjectsPage.tsx';
import { ProjectPage } from './pages/Projects/ProjectPage.tsx';
import { NotFound } from './pages/NotFound/NotFound.tsx';
import type { PageData } from '../../shared/types.ts';

export function App({ data }: { data: PageData }) {
  let page;
  switch (data.page) {
    case 'home':
      page = <Home latestPosts={data.latestPosts} />;
      break;
    case 'blog':
      page = <BlogList posts={data.posts} category={data.category} tag={data.tag} q={data.q} pageNo={data.pageNo} />;
      break;
    case 'post':
      page = <BlogPost post={data.post} related={data.related} url={data.url} newer={data.newer} older={data.older} />;
      break;
    case 'privacy':
      page = <Privacy />;
      break;
    case 'careers':
      page = <CareersPage />;
      break;
    case 'job':
      page = <JobPage jobId={data.jobId} url={data.url} />;
      break;
    case 'projects':
      page = <ProjectsPage />;
      break;
    case 'project':
      page = <ProjectPage slug={data.slug} />;
      break;
    case 'notfound':
      page = <NotFound />;
      break;
  }
  return <SiteProvider data={data}>{page}</SiteProvider>;
}
