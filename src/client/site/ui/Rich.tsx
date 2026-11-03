import { createElement, type HTMLAttributes } from 'react';
import { rich } from '../../../shared/rich.ts';

type Tag = 'a' | 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'b' | 'li' | 'strong' | 'small' | 'div' | 'figcaption';

/** Editable copy with the safe markup from shared/rich.ts ([highlight], **bold**, [link](url)). */
export function Rich({ as = 'span', text, ...rest }: { as?: Tag; text: string | undefined } & HTMLAttributes<HTMLElement> & { href?: string }) {
  return createElement(as, { ...rest, dangerouslySetInnerHTML: { __html: rich(text ?? '') } });
}
