import test from 'node:test';
import assert from 'node:assert/strict';
import { nextProgress, searchTerms, validateContent, validateExtraction, validateLatex } from './content';
const formula={title:'Current ratio',latex:String.raw`\frac{\text{Current Assets}}{\text{Current Liabilities}}`,explanation:'Liquidity ratio',variables:[],examples:[{question:'Assets ₹100000, liabilities ₹50000',steps:[String.raw`\(100000/50000=2\)`],answer:'2:1'}],sourcePage:1};
test('formula validation accepts fractions and rejects unsafe LaTeX and invented source pages',()=>{
  assert.deepEqual(validateContent('formula',formula,2),formula);
  assert.throws(()=>validateContent('formula',{...formula,sourcePage:3},2));
  assert.throws(()=>validateLatex(String.raw`\href{javascript:alert(1)}{x}`));
  assert.throws(()=>validateLatex(String.raw`\unknownCommand{x}`));
  assert.throws(()=>validateExtraction({formulas:[formula],flashcards:[],ocr:[{page:3,text:'invented'}]},2));
  assert.throws(()=>validateExtraction({formulas:[],flashcards:[],ocr:[]},2));
});
test('revision scheduling resets mistakes and increases known-card intervals',()=>{
  const first=nextProgress(undefined,'known',0,'a');assert.equal(first.dueAt,86400000);
  assert.equal(nextProgress(first,'known',0,'b').dueAt,3*86400000);
  const retry=nextProgress(first,'revision',0,'c');assert.equal(retry.streak,0);assert.equal(retry.dueAt,600000);
  assert.equal(nextProgress({streak:99},'known',0,'d').dueAt,30*86400000);
});
test('search supports title prefixes and keywords with a bounded index',()=>{
  assert.ok(searchTerms('Current Ratio Liquidity').includes('current ra'));
  assert.ok(searchTerms('Current Ratio Liquidity').includes('liquid'));
  assert.ok(searchTerms('longword '.repeat(5000)).length<=900);
});
