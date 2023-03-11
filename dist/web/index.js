"use strict";import{SemVer as S}from"small-semver";export const MANIFEST_FILE_SUFFIX=".huzma.json",NULL_FIELD="",FIRST_SCHEMA_VERSION=1,LATEST_SCHEMA_VERSION=2,BYTES_NOT_INCLUDED=-1;function d(i){const n=typeof i;return n!=="object"?n:i===null?"null":Array.isArray(i)?"array":"object"}function x(i){if(i.length<1)return"";if(!i.startsWith("/")&&!i.startsWith("./")&&!i.startsWith("../"))return i;const n=i.split("/");let t=-1;for(let s=0;s<n.length;s++){const e=n[s];if(e!==""&&e!=="."&&e!==".."){t=s;break}}return t<0?"":n.slice(t).join("/")}export const NULL_MANIFEST_VERSION="0.0.0";export class HuzmaManifest{schema;name;version;files;entry;invalidation;description;authors;crateLogoUrl;keywords;license;repo;homepageUrl;permissions;metadata;constructor({schema:n=LATEST_SCHEMA_VERSION,name:t="unspecified-name",version:s=NULL_MANIFEST_VERSION,files:e=[],entry:m=NULL_FIELD,invalidation:l="default",description:u=NULL_FIELD,authors:f=[],crateLogoUrl:c=NULL_FIELD,keywords:h=[],license:b=NULL_FIELD,repo:v={type:NULL_FIELD,url:NULL_FIELD},homepageUrl:P=NULL_FIELD,permissions:R=[],metadata:k={}}={}){this.homepageUrl=P,this.repo={type:v?.type||"other",url:v?.url||NULL_FIELD},this.license=b,this.keywords=h,this.crateLogoUrl=x(c),this.authors=f.map(({name:p=NULL_FIELD,email:g=NULL_FIELD,url:M=NULL_FIELD})=>({name:p,email:g,url:M})),this.description=u,this.invalidation=l,this.files=e.map(p=>typeof p=="string"?{name:p,bytes:0,invalidation:"default"}:p).map(({name:p="",bytes:g=0,invalidation:M="default"})=>({name:x(p),bytes:g,invalidation:M})),this.entry=x(m),this.version=s,this.name=t,this.schema=n;const r=R.map(p=>typeof p=="string"?{key:p,value:[]}:p),a=new Map,o=r.reduce((p,g)=>(a.has(g.key)||(a.set(g.key,1),p.push(g)),p),[]);this.permissions=o,this.metadata=k}}const y=i=>typeof i=="string"&&i||NULL_FIELD,A=(i,n,t,s)=>{const e=typeof i[n];return e===t?!0:(s.push(`${n} should be a ${t}, got "${e}"`),!1)},L=i=>{switch(i){case"purge":case"url-diff":return i;default:return"default"}},E="https://example.com";function V(i){try{const n=new URL(i,E);return!!n&&decodeURI(n.href)===n.href}catch{return!1}}export function validateManifest(i){const n={pkg:new HuzmaManifest,errors:[],semanticVersion:S.null()},{pkg:t,errors:s}=n,e=i,m=d(e);if(m!=="object")return s.push(`expected cargo to be type "object" got "${m}"`),n;if(typeof e.schema!="number"||e.schema<FIRST_SCHEMA_VERSION||e.schema>LATEST_SCHEMA_VERSION){const r=new Array(2).fill(0).map((a,o)=>o+1);s.push(`crate version is invalid, got "${e.schema}", valid=${r.join(", ")}`)}t.schema=e.schema||LATEST_SCHEMA_VERSION,A(e,"name","string",s),t.name=y(e.name);let l;A(e,"version","string",s)&&((l=S.fromString(e.version||""))?n.semanticVersion=l:s.push(`${e.version} is not a vaild semantic version`)),t.version=y(e.version);const u=e.files===void 0?[]:e.files,f=Array.isArray(u);f||s.push(`files should be an array, got "${d(u)}"`);const c=new Map,h=f?u:[];for(let r=0;r<h.length;r++){const a=h[r];typeof a=="string"&&(h[r]={name:a,bytes:0,invalidation:"default"});const o=h[r];if(d(o)!=="object"){s.push(`file ${r} is not an object. Expected an object with a "name" field, got ${d(o)}`);break}if(typeof o?.name!="string"){s.push(`file ${r} is not a valid file format, file.name and must be a valid absolute or relative url. got ${o.name}`);break}if(typeof(o?.invalidation||"")!="string"){s.push(`file ${r} is not a valid file format, file.invalidation must be a string`);break}const p=x(o.name);if(c.has(p))break;c.set(p,!0),t.files.push({name:p,bytes:Math.max(typeof o.bytes=="number"?o.bytes:BYTES_NOT_INCLUDED,BYTES_NOT_INCLUDED),invalidation:L(o?.invalidation||"default")})}const b=e.permissions||[];Array.isArray(b)||s.push(`permissions should be an array, got "${d(e.permissions)}"`);const v=new Map;for(let r=0;r<b.length;r++){const a=b[r],o=d(a);if(o!=="string"&&o!=="object"&&s.push(`permission should be a string or object with "key" & "value" properties. Permission ${r} type=${d(a)}`),typeof a=="string"){if(v.has(a))continue;v.set(a,1),t.permissions.push({key:a,value:[]});continue}if(o!=="object")continue;if(typeof a.key!="string"){s.push(`permission ${r} property "key" is not a string. got = ${d(a.key)}`);continue}const p=a.value||[];if(!Array.isArray(p)){s.push(`permission ${r} property "value" is not an array. got = ${d(a.key)}`);continue}v.has(a.key)||(v.set(a.key,1),t.permissions.push({key:a.key,value:p.filter(g=>typeof g=="string")}))}e.entry=y(e.entry),A(e,"entry","string",s),e.entry!==NULL_FIELD&&!V(e.entry)&&s.push(`entry field must be a valid relative or absolute url. got "${t.entry}"`),t.entry=e.entry,t.invalidation=typeof e.invalidation=="string"?L(e.invalidation):"default",t.description=y(e.description),t.authors=(e.authors||[]).filter(r=>typeof r?.name=="string").map(({name:r="",email:a,url:o})=>({name:r,email:y(a),url:y(o)})),t.crateLogoUrl=x(y(e.crateLogoUrl)),t.crateLogoUrl!==NULL_FIELD&&!V(t.crateLogoUrl)&&s.push("crateLogoUrl should be a valid relative or absolute url"),t.keywords=(e.keywords||[]).filter(r=>typeof r=="string"),t.license=y(e.license),t.repo.type=y(e.repo?.type),t.repo.url=y(e.repo?.url),t.homepageUrl=y(e.homepageUrl),e.metadata=e.metadata||{},d(e.metadata)!=="object"&&(s.push(`metadata should be a record of strings, got "${d(e.metadata)}"`),e.metadata={});const P={},R=e.metadata||{},k=Object.keys(e.metadata||{});for(let r=0;r<k.length;r++){const a=k[r],o=R[a];if(typeof o!="string"){s.push(`meta should be a record of strings, got type "${d(o)}" for property "${a}" of meta`);continue}P[a]=o}return t.metadata=P,n}export function manifestIsUpdatable(i,n){const t=validateManifest(n),s=validateManifest(i),e={oldManifest:t,newManifest:s,updateAvailable:!1},m=e.oldManifest.errors.length>0,l=e.oldManifest.errors.length>0;if(m||l)return e;const u=t.pkg.version===NULL_MANIFEST_VERSION,f=s.pkg.version===NULL_MANIFEST_VERSION;if(u&&f)return e;if(f)return e;if(u&&!f)return e.updateAvailable=!0,e;const c=t.semanticVersion,h=s.semanticVersion;return e.updateAvailable=h.isGreater(c),e}export class HuzmaUpdateDetails{add;delete;constructor(n,t){this.add=n,this.delete=t}}export function diffManifestFiles(i,n,t){const s=new HuzmaUpdateDetails([],[]),e={};for(let l=0;l<i.files.length;l++){const{name:u,invalidation:f}=i.files[l];if(i.entry!==NULL_FIELD&&u===i.entry&&f==="default"){e[u]="purge";continue}e[u]=f==="default"?t:f}const m={};for(let l=0;l<n.files.length;l++){const{name:u}=n.files[l];m[u]=!0}for(let l=0;l<i.files.length;l++){const{name:u,bytes:f}=i.files[l];(!m[u]||e[u]==="purge")&&s.add.push({name:u,bytes:f})}for(let l=0;l<n.files.length;l++){const{name:u,bytes:f}=n.files[l],c=e[u];(!c||c==="purge")&&s.delete.push({name:u,bytes:f})}return s}
//# sourceMappingURL=index.js.map
