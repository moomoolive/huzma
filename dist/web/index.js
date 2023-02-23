"use strict";import{SemVer as M}from"small-semver";import{NULL_FIELD as d,ALL_SCHEMA_VERSIONS as S,LATEST_SCHEMA_VERSION as w}from"./consts";export{NULL_FIELD,ALL_SCHEMA_VERSIONS,LATEST_SCHEMA_VERSION,MANIFEST_FILE_SUFFIX}from"./consts";function y(i){const r=typeof i;return r!=="object"?r:i===null?"null":Array.isArray(i)?"array":"object"}function x(i){if(i.length<1)return"";if(!i.startsWith("/")&&!i.startsWith("./")&&!i.startsWith("../"))return i;const r=i.split("/");let t=-1;for(let s=0;s<r.length;s++){const e=r[s];if(e!==""&&e!=="."&&e!==".."){t=s;break}}return t<0?"":r.slice(t).join("/")}export const NULL_MANIFEST_VERSION="0.0.0";export class HuzmaManifest{schema;name;version;files;entry;invalidation;description;authors;crateLogoUrl;keywords;license;repo;homepageUrl;permissions;metadata;constructor({schema:r="0.1.0",name:t="unspecified-name",version:s=NULL_MANIFEST_VERSION,files:e=[],entry:h=d,invalidation:o="default",description:p=d,authors:u=[],crateLogoUrl:m=d,keywords:v=[],license:P=d,repo:k={type:d,url:d},homepageUrl:R=d,permissions:A=[],metadata:n={}}={}){this.homepageUrl=R,this.repo={type:k?.type||"other",url:k?.url||d},this.license=P,this.keywords=v,this.crateLogoUrl=x(m),this.authors=u.map(({name:f=d,email:b=d,url:L=d})=>({name:f,email:b,url:L})),this.description=p,this.invalidation=o,this.files=e.map(f=>typeof f=="string"?{name:f,bytes:0,invalidation:"default"}:f).map(({name:f="",bytes:b=0,invalidation:L="default"})=>({name:x(f),bytes:b,invalidation:L})),this.entry=x(h),this.version=s,this.name=t,this.schema=r;const a=A.map(f=>typeof f=="string"?{key:f,value:[]}:f),l=new Map,g=a.reduce((f,b)=>(l.has(b.key)||(l.set(b.key,1),f.push(b)),f),[]);this.permissions=g,this.metadata=n}}const c=i=>typeof i=="string"?i||d:d,V=(i,r,t,s)=>{const e=typeof i[r];return e===t?!0:(s.push(`${r} should be a ${t}, got "${e}"`),!1)},E=i=>{switch(i){case"purge":case"url-diff":return i;default:return"default"}};export function validateManifest(i){const r={pkg:new HuzmaManifest,errors:[],semanticVersion:M.null()},{pkg:t,errors:s}=r,e=i,h=y(e);if(h!=="object")return s.push(`expected cargo to be type "object" got "${h}"`),r;S[e.schema||""]||s.push(`crate version is invalid, got "${e.schema}", valid=${Object.keys(S).join()}`),t.schema=e.schema||w,V(e,"name","string",s),t.name=c(e.name);let o;V(e,"version","string",s)&&((o=M.fromString(e.version||""))?r.semanticVersion=o:s.push(`${e.version} is not a vaild semantic version`)),t.version=c(e.version);const p=Array.isArray(e.files);p||s.push(`files should be an array, got "${y(e.files)}"`);const u={},m=p?e.files||[]:[];for(let n=0;n<m.length;n++){const a=m[n];typeof a=="string"&&(m[n]={name:a,bytes:0,invalidation:"default"});const l=m[n];if(y(l)!=="object"){s.push(`file ${n} is not an object. Expected an object with a "name" field, got ${y(l)}`);break}if(typeof l?.name!="string"||typeof(l?.invalidation||"")!="string"){s.push(`file ${n} is not a valid file format, file.name and file.invalidation must be a string`);break}const g=x(l.name);if(g.startsWith("https://")||g.startsWith("http://")||u[g])break;u[g]=!0,t.files.push({name:g,bytes:Math.max(typeof l.bytes=="number"?l.bytes:0,0),invalidation:E(l?.invalidation||"default")})}const v=e.permissions||[];Array.isArray(v)||s.push(`permissions should be an array, got "${y(e.permissions)}"`);const P=new Map;for(let n=0;n<v.length;n++){const a=v[n],l=y(a);if(l!=="string"&&l!=="object"&&s.push(`permission should be a string or object with "key" & "value" properties. Permission ${n} type=${y(a)}`),typeof a=="string"){if(P.has(a))continue;P.set(a,1),t.permissions.push({key:a,value:[]});continue}if(l!=="object")continue;if(typeof a.key!="string"){s.push(`permission ${n} property "key" is not a string. got = ${y(a.key)}`);continue}const g=a.value||[];if(!Array.isArray(g)){s.push(`permission ${n} property "value" is not an array. got = ${y(a.key)}`);continue}P.has(a.key)||(P.set(a.key,1),t.permissions.push({key:a.key,value:g.filter(f=>typeof f=="string")}))}t.entry=c(e.entry),t.entry!==d&&!u[t.entry]&&s.push(`entry must be one of package listed files, got ${t.entry}`),t.invalidation=typeof e.invalidation=="string"?E(e.invalidation):"default",t.description=c(e.description),t.authors=(e.authors||[]).filter(n=>typeof n?.name=="string").map(({name:n="",email:a,url:l})=>({name:n,email:c(a),url:c(l)})),t.crateLogoUrl=x(c(e.crateLogoUrl)),t.keywords=(e.keywords||[]).filter(n=>typeof n=="string"),t.license=c(e.license),t.repo.type=c(e.repo?.type),t.repo.url=c(e.repo?.url),t.homepageUrl=c(e.homepageUrl),e.metadata=e.metadata||{},y(e.metadata)!=="object"&&(s.push(`metadata should be a record of strings, got "${y(e.metadata)}"`),e.metadata={});const k={},R=e.metadata||{},A=Object.keys(e.metadata||{});for(let n=0;n<A.length;n++){const a=A[n],l=R[a];if(typeof l!="string"){s.push(`meta should be a record of strings, got type "${y(l)}" for property "${a}" of meta`);continue}k[a]=l}return t.metadata=k,r}export function manifestIsUpdatable(i,r){const t=validateManifest(r),s=validateManifest(i),e={oldManifest:t,newManifest:s,updateAvailable:!1},h=e.oldManifest.errors.length>0,o=e.oldManifest.errors.length>0;if(h||o)return e;const p=t.pkg.version===NULL_MANIFEST_VERSION,u=s.pkg.version===NULL_MANIFEST_VERSION;if(p&&u)return e;if(u)return e;if(p&&!u)return e.updateAvailable=!0,e;const m=t.semanticVersion,v=s.semanticVersion;return e.updateAvailable=v.isGreater(m),e}class I{add;delete;constructor(r,t){this.add=r,this.delete=t}}export function diffManifestFiles(i,r,t){const s=new I([],[]),e={};for(let o=0;o<i.files.length;o++){const{name:p,invalidation:u}=i.files[o];if(i.entry!==d&&p===i.entry&&u==="default"){e[p]="purge";continue}e[p]=u==="default"?t:u}const h={};for(let o=0;o<r.files.length;o++){const{name:p}=r.files[o];h[p]=!0}for(let o=0;o<i.files.length;o++){const{name:p,bytes:u}=i.files[o];(!h[p]||e[p]==="purge")&&s.add.push({name:p,bytes:u})}for(let o=0;o<r.files.length;o++){const{name:p,bytes:u}=r.files[o],m=e[p];(!m||m==="purge")&&s.delete.push({name:p,bytes:u})}return s}
//# sourceMappingURL=index.js.map
