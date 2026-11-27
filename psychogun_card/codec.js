/* Port of EXP-04-002 the original Python card-reader codec. Offline, no card writes. */
(function(root){
  'use strict';
  const alphabet='WUFQZXCGEIKRJHPLBNYATODVSM';
  function fail(code){throw new Error(code)}
  function nameFields(name){if(!name||name.length!==9||Array.from(name).some(x=>!Number.isInteger(x)||x<0||x>255))fail('nameBytes');let total=0,length=0;for(let i=0;i<9;i++){total+=name[i];if(name[i])length=i+1}return [total,length]}
  function checksum(b){const [a,c,key,mask]=b;return ((a&63)+(a>>6)+((c&15)<<2)+(c>>4)+((key&3)<<4)+(key>>2)+(mask&63)+(mask>>6)+5)&63}
  function encode(name,mask,key=0,version=0){const [total,length]=nameFields(name);if(![mask,key].every(x=>Number.isInteger(x)&&x>=0&&x<=255)||!Number.isInteger(version)||version<0||version>3)fail('range');const b=[total&255,(total>>8)|(length<<4),key,mask,0];b[4]=(checksum(b)<<2)|version;for(const i of [0,1,3,4])b[i]^=key;let n=b.reduce((v,x,i)=>v+(BigInt(x)<<(8n*BigInt(i))),0n),s='';for(let i=0;i<9;i++){s=alphabet[Number(n%26n)]+s;n/=26n}if(n!==0n)fail('range');return s}
  function decode(password,name){const [total,length]=nameFields(name);if(typeof password!=='string'||password.length!==9||[...password].some(c=>!alphabet.includes(c)))fail('passwordFormat');let n=0n;for(const c of password)n=(n*26n+BigInt(alphabet.indexOf(c)))&((1n<<40n)-1n);const b=Array.from({length:5},(_,i)=>Number((n>>(8n*BigInt(i)))&255n));for(const i of [0,1,3,4])b[i]^=b[2];if((b[4]>>2)!==checksum(b))fail('checksum');if((b[0]|((b[1]&15)<<8))!==total||(b[1]>>4)!==length)fail('nameMismatch');return {mask:b[3],key:b[2],version:b[4]&3}}
  function parseName(text,mode){if(mode==='hex'){const s=text.replace(/[\s-]/g,'');if(!/^[0-9a-f]{18}$/i.test(s))fail('nameHex');return Uint8Array.from(s.match(/../g),x=>parseInt(x,16))}if(!/^[\x20-\x7e]{1,9}$/.test(text))fail('nameAscii');const b=new Uint8Array(9);for(let i=0;i<text.length;i++)b[i]=text.charCodeAt(i);return b}
  const api={alphabet,encode,decode,nameFields,parseName};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.psychogun_card=api;
})(globalThis);
