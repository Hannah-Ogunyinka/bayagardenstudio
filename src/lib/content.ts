import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;
export type Project = CollectionEntry<'projects'>;

/** URL slug for a category, matching WordPress (category base removed). */
export const categorySlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const postUrl = (post: Post): string => `/${post.id}/`;
export const projectUrl = (project: Project): string => `/project/${project.id}/`;
export const categoryUrl = (name: string): string => `/${categorySlug(name)}/`;

/** Published posts, newest first. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf());
}

export async function getProjects(): Promise<Project[]> {
  const projects = await getCollection('projects', ({ data }) => !data.draft);
  return projects.sort((a, b) => a.data.order - b.data.order);
}

export const formatDate = (date: Date): string =>
  date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
