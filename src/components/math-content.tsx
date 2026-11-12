import katex from 'katex';
import 'katex/dist/katex.min.css';

export function FormulaMath({latex,inline=false}:{latex:string;inline?:boolean}) {
  let html:string;
  try {html=katex.renderToString(latex,{displayMode:!inline,throwOnError:true,trust:false,maxExpand:100,maxSize:30});}
  catch {return <code className="text-red-700 break-all">{latex}</code>;}
  return <span className={inline?'':'block overflow-x-auto py-3'} dangerouslySetInnerHTML={{__html:html}}/>;
}
export function MathContent({text}:{text:string}) {
  return <div className="whitespace-pre-wrap break-words">{text.split(/(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$)/g).map((part,i)=>
    part.startsWith('\\[')||part.startsWith('\\(')||part.startsWith('$$') ? <FormulaMath key={i} latex={part.slice(2,-2)} inline={part.startsWith('\\(')}/> : <span key={i}>{part}</span>)}</div>;
}
