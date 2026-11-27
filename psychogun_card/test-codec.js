const assert=require('node:assert/strict'), c=require('./codec');
const name=c.parseName('COBRA','ascii');
assert.equal(c.encode(name,255),'ZBEXCKAOI');
assert.deepEqual(c.decode('ZBEXCKAOI',name),{mask:255,key:0,version:0});
assert.throws(()=>c.decode('ZBEXCKAOW',name),/checksum/);
assert.throws(()=>c.decode('ZBEXCKAOI',c.parseName('XOBRA','ascii')),/nameMismatch/);
assert.deepEqual(c.parseName('43 4F 42 52 41 00 00 00 00','hex'),name);
for(const n of [name,new Uint8Array(9),new Uint8Array(9).fill(255),Uint8Array.from([0,1,2,3,4,5,6,7,8])])for(let mask=0;mask<256;mask++){const key=mask*17&255,version=mask%4;assert.deepEqual(c.decode(c.encode(n,mask,key,version),n),{mask,key,version})}
console.log('PASS: known fixture, rejection, name conversion, 1024 round trips.');
