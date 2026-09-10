(async () => {
 const base = 'https://www.fethiyealfaspor.com';
 const xml = new DOMParser().parseFromString(await (await fetch(base+'/sitemap.xml')).text(),'text/xml');
 const urls = [...xml.querySelectorAll('loc')].map(x=>x.textContent);
 const clean = root => {
  const copy=root.cloneNode(true);
  copy.querySelectorAll('script,style,noscript').forEach(x=>x.remove());
  copy.querySelectorAll('br').forEach(x=>x.replaceWith('\n'));
  copy.querySelectorAll('p,div,h1,h2,h3,h4,h5,h6,li,section,tr').forEach(x=>x.append('\n'));
  return copy.textContent.replace(/[ \t]+/g,' ').replace(/\n[ \t]+/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
 };
 const pages=[];
 for(const url of urls){
  const response=await fetch(url); if(!response.ok)throw Error(url+' '+response.status);
  const html=await response.text();
  const doc=new DOMParser().parseFromString(html,'text/html');
  const sections=[...doc.querySelectorAll('section')].map(s=>({id:s.id,title:s.querySelector('h1,h2')?.textContent.trim()||'',text:clean(s),html:s.outerHTML}));
  const players=[...doc.querySelectorAll('.team-images .team-memeber-info')].map(info=>{
   const key=info.getAttribute('data-img-key');
   const wrapper=[...info.parentElement.querySelectorAll('.team-image-wrapper')].find(x=>x.getAttribute('data-img-key')===key);
   const style=wrapper?.querySelector('.team-image')?.getAttribute('style')||'';
   const photo=style.match(/url\(['"]?([^)'" ]+)/)?.[1]||null;
   return {sourceId:key,name:info.querySelector('.member-name')?.textContent.trim(),position:info.querySelector('.position')?.textContent.trim(),team:info.closest('section')?.querySelector('h1,h2')?.textContent.trim(),photoUrl:photo,sourceUrl:url};
  });
  const imageUrls=[...new Set((html.match(/https?:[^\s"'<>\\)]+/g)||[]).filter(x=>/\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(x)).map(x=>x.replaceAll('&amp;','&')))];
  const contacts=[...doc.querySelectorAll('a[href]')].filter(x=>/^(tel:|mailto:)|instagram.com/.test(x.getAttribute('href'))).map(x=>({text:x.textContent.trim(),href:x.getAttribute('href')}));
  pages.push({url,status:response.status,title:doc.title,description:doc.querySelector('meta[name=description]')?.content,sections,players,imageUrls,contacts,text:clean(doc.body),html});
 }
 return {capturedAt:new Date().toISOString(),source:base,pages};
})()
