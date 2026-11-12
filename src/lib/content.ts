import katex from 'katex';

export type ContentKind='formula'|'flashcard';
export type ContentStatus='draft'|'approved'|'published'|'rejected';
export type Example={question:string;steps:string[];answer:string};
export type Formula={title:string;latex:string;explanation:string;variables:{symbol:string;meaning:string}[];examples:Example[];sourcePage:number};
export type Card={front:string;back:string;sourcePage:number};
export type ContentItem=(Formula|Card)&{id:string;kind:ContentKind;subjectId:string;chapterId:string;chapter:string;level:string;status:ContentStatus;revision:number;sourceJobId:string|null;sourceVerified:boolean;updatedAt:number};
export type PdfJob={id:string;owner:string;title:string;subjectId:string;chapterId:string;chapter:string;level:string;storagePath:string;status:string;error?:string;pageCount?:number;scannedPages?:number[];createdAt:number;attempts:number;added?:number;duplicates?:number};
export type Progress={streak:number;dueAt:number;lastReviewedAt:number;grade:'known'|'revision';requestId:string};

function text(value:unknown,label:string,max=3000,empty=false):string {
  if(typeof value!=='string' || (!empty && !value.trim()) || value.length>max)throw new Error(`${label} must contain ${empty?'0':'1'}–${max} characters.`);
  return value.trim();
}
function object(value:unknown):Record<string,unknown> {if(!value || typeof value!=='object' || Array.isArray(value))throw new Error('Invalid content object.');return value as Record<string,unknown>;}
function array(value:unknown,label:string,max:number):unknown[] {if(!Array.isArray(value) || value.length>max)throw new Error(`${label} must be a list of at most ${max} items.`);return value;}
export function validateLatex(value:unknown):string {
  const latex=text(value,'Formula',4000);
  if(/\\(?:href|url|includegraphics|html\w*|def|gdef|newcommand|renewcommand)\b/.test(latex))throw new Error('Links, HTML and custom macros are not allowed in formulas.');
  katex.renderToString(latex,{throwOnError:true,trust:false,maxExpand:100,maxSize:30,strict:'error'});
  return latex;
}
export function validateContent(kind:ContentKind,raw:unknown,pageCount?:number):Formula|Card {
  const r=object(raw),sourcePage=Number(r.sourcePage);
  if(!Number.isInteger(sourcePage) || sourcePage<0 || (pageCount!==undefined && (sourcePage<1 || sourcePage>pageCount)))throw new Error('Choose a valid source page.');
  if(kind==='flashcard')return {front:text(r.front,'Front',1500),back:text(r.back,'Answer',5000),sourcePage};
  return {title:text(r.title,'Title',160),latex:validateLatex(r.latex),explanation:text(r.explanation,'Explanation',5000),sourcePage,
    variables:array(r.variables,'Variables',20).map(value=>{const v=object(value);return {symbol:text(v.symbol,'Symbol',100),meaning:text(v.meaning,'Meaning',400)};}),
    examples:array(r.examples,'Examples',3).map(value=>{const e=object(value);return {question:text(e.question,'Example question',2000),steps:array(e.steps,'Calculation steps',12).map(s=>text(s,'Step',2000)),answer:text(e.answer,'Example answer',2000)};})};
}
export function validateExtraction(raw:unknown,pageCount:number) {
  const r=object(raw);
  const formulas=array(r.formulas,'Formulas',40).map(f=>validateContent('formula',f,pageCount) as Formula);
  const flashcards=array(r.flashcards,'Flashcards',60).map(c=>validateContent('flashcard',c,pageCount) as Card);
  const ocr=array(r.ocr,'OCR pages',40).map(value=>{const p=object(value);if(!Number.isInteger(p.page) || Number(p.page)<1 || Number(p.page)>pageCount)throw new Error('Invalid OCR source page.');return {page:Number(p.page),text:text(p.text,'OCR text',12000,true)};});
  if(!formulas.length && !flashcards.length)throw new Error('No usable formulas or flashcards found. Try a clearer chapter PDF.');
  return {formulas,flashcards,ocr};
}
export function searchTerms(value:string) {
  const normalized=value.toLowerCase().replace(/[^\p{L}\p{N} ]/gu,' ').replace(/\s+/g,' ').trim();
  const terms=new Set<string>();
  for(const word of [normalized.slice(0,80),...normalized.split(' ').slice(0,80)])for(let n=1;n<=Math.min(word.length,40);n++){terms.add(word.slice(0,n));if(terms.size>=900)return [...terms];}
  return [...terms];
}
export function contentSearchText(item:Formula|Card) {return 'title' in item ? `${item.title} ${item.explanation} ${item.variables.map(v=>v.meaning).join(' ')}` : `${item.front} ${item.back}`;}
export function nextProgress(previous:Partial<Progress>|undefined,grade:'known'|'revision',now:number,requestId:string):Progress {
  const streak=grade==='known'?Math.min(5,(previous?.streak??0)+1):0;
  const minutes=grade==='known'?[1,3,7,14,30][streak-1]*1440:10;
  return {streak,dueAt:now+minutes*60000,lastReviewedAt:now,grade,requestId};
}
const str={type:'string'},page={type:'integer'};
const record=(properties:Record<string,unknown>)=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
const list=(items:unknown)=>({type:'array',items});
export const EXTRACTION_SCHEMA=record({
  formulas:list(record({title:str,latex:str,explanation:str,sourcePage:page,variables:list(record({symbol:str,meaning:str})),examples:list(record({question:str,steps:list(str),answer:str}))})),
  flashcards:list(record({front:str,back:str,sourcePage:page})),ocr:list(record({page,text:str})),
});
