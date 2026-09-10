(() => {
const section=document.querySelector('section');
const c=section.cloneNode(true);
c.querySelectorAll('script,style').forEach(x=>x.remove());
c.querySelectorAll('br').forEach(x=>x.replaceWith('\n'));
c.querySelectorAll('p,div,h1,h2,h3,h4,h5,h6,li,span').forEach(x=>x.append('\n'));
const html=section.outerHTML;
return {sourceUrl:location.href,capturedAt:new Date().toISOString(),text:section.innerText,allLoadedText:c.textContent.replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim(),html,imageUrls:[...new Set((html.match(/https?:[^\s"'<>\\)]+/g)||[]).filter(x=>/\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(x)).map(x=>x.replaceAll('&amp;','&')))]};
})()
