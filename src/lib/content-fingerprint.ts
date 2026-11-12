import { createHash } from 'node:crypto';
import type { Card, ContentKind, Formula } from './content';
export const contentId=(chapterId:string,kind:ContentKind,item:Formula|Card)=>createHash('sha256').update(JSON.stringify([chapterId,kind,('title' in item?[item.title,item.latex]:[item.front,item.back]).map(v=>v.toLowerCase().replace(/\s+/g,' ').trim())])).digest('hex');
