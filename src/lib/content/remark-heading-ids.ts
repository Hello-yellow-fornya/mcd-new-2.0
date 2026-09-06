/**
 * Gives every heading a GitHub-style id. The same function feeds the TOC and
 * the HowTo schema, so ids always match the rendered anchors.
 */
import GithubSlugger from 'github-slugger';
import { toString } from 'mdast-util-to-string';
import { visit } from 'unist-util-visit';
import type { Heading, Root } from 'mdast';

export function headingIdFor(node: Heading, slugger: GithubSlugger): { id: string; text: string } {
  const text = toString(node).trim();
  return { id: slugger.slug(text), text };
}

export default function remarkHeadingIds() {
  return (tree: Root) => {
    const slugger = new GithubSlugger();
    visit(tree, 'heading', (node: Heading) => {
      const { id } = headingIdFor(node, slugger);
      const data = (node.data ??= {}) as { hProperties?: Record<string, unknown> };
      data.hProperties = { ...(data.hProperties ?? {}), id };
    });
  };
}
