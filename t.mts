import { FALLBACK_CATALOG } from './src/data/fallbackCatalog';
let ok = 0;
for (const m of FALLBACK_CATALOG) {
  const dec = decodeURIComponent(m.poster.replace('data:image/svg+xml;charset=utf-8,',''));
  const back = decodeURIComponent(m.backdrop.replace('data:image/svg+xml;charset=utf-8,',''));
  const good = dec.startsWith('<svg') && dec.endsWith('</svg>') && (dec.match(/<svg/g)||[]).length===1
    && back.startsWith('<svg') && back.endsWith('</svg>') && m.trailerKey && m.title && m.synopsis;
  if (good) ok++;
  console.log((good?'PASS':'FAIL').padEnd(5), m.id.padEnd(20), m.title.slice(0,34).padEnd(36), 'trailer='+m.trailerKey);
}
console.log('---');
console.log(ok+'/'+FALLBACK_CATALOG.length+' MediaItem validos');
console.log('housas:', [...new Set(FALLBACK_CATALOG.map(m=>m.house))].join(', '));
