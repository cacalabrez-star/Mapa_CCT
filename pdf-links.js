(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.CodigosPDF=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const W=595.28,H=841.89,M=42;
  const cp1252={0x20ac:0x80,0x201a:0x82,0x0192:0x83,0x201e:0x84,0x2026:0x85,0x2020:0x86,0x2021:0x87,0x02c6:0x88,0x2030:0x89,0x0160:0x8a,0x2039:0x8b,0x0152:0x8c,0x017d:0x8e,0x2018:0x91,0x2019:0x92,0x201c:0x93,0x201d:0x94,0x2022:0x95,0x2013:0x96,0x2014:0x97,0x02dc:0x98,0x2122:0x99,0x0161:0x9a,0x203a:0x9b,0x0153:0x9c,0x017e:0x9e,0x0178:0x9f};
  function latin(s){let out='';for(const ch of String(s||'')){const n=ch.codePointAt(0);out+=String.fromCharCode(n<=255?n:(cp1252[n]||63))}return out}
  function lit(s){return '('+latin(s).replace(/([\\()])/g,'\\$1').replace(/[\r\n]/g,' ')+')'}
  function valid(v){try{const u=new URL(v);return u.protocol==='https:'||u.protocol==='http:'}catch{return false}}
  function wrap(s,max){const words=String(s||'').trim().split(/\s+/).filter(Boolean),lines=[];let line='';for(const word of words){if(!line)line=word;else if((line+' '+word).length<=max)line+=' '+word;else{lines.push(line);line=word}}if(line)lines.push(line);return lines.length?lines:['']}
  function text(cmds,s,x,y,size,bold,color){cmds.push('BT '+(color||'0.082 0.137 0.196')+' rg /'+(bold?'F2':'F1')+' '+size+' Tf 1 0 0 1 '+x.toFixed(2)+' '+y.toFixed(2)+' Tm '+lit(s)+' Tj ET')}
  function line(cmds,x1,y1,x2,y2){cmds.push('0.86 0.90 0.91 RG 0.7 w '+x1+' '+y1.toFixed(2)+' m '+x2+' '+y2.toFixed(2)+' l S')}
  function grouped(items){const map=new Map;items.slice().sort((a,b)=>(Number(a.ordem)||9999)-(Number(b.ordem)||9999)).forEach(i=>{const k=i.trilha||'Outros conteúdos';if(!map.has(k))map.set(k,[]);map.get(k).push(i)});return [...map.entries()]}
  function generate(items,opts){
    opts=opts||{};items=(items||[]).filter(i=>i&&i.titulo);
    const pages=[];let page,y;
    function newPage(){page={cmds:[],links:[]};pages.push(page);text(page.cmds,'COMUNIDADE CÓDIGOS DO TEMPO',M,H-48,9,true,'0.043 0.455 0.514');text(page.cmds,'Lista rápida de conteúdos',M,H-82,22,true);text(page.cmds,'Encontre o tema e abra diretamente a aula ou material.',M,H-103,10,false,'0.38 0.44 0.49');line(page.cmds,M,H-122,W-M,H-122);y=H-153}
    newPage();
    for(const [group,list] of grouped(items)){
      if(y<105)newPage();
      text(page.cmds,group,M,y,13,true,'0.043 0.455 0.514');text(page.cmds,list.length+' '+(list.length===1?'conteúdo':'conteúdos'),W-M-78,y,8.5,true,'0.38 0.44 0.49');y-=16;line(page.cmds,M,y,W-M,y);y-=22;
      for(const item of list){
        const titleLines=wrap(item.titulo,58),meta=([item.tipo,item.nivel].filter(Boolean).join(' · ')+(item.descricao?' - '+item.descricao:'')),metaLines=wrap(meta,86);const height=titleLines.length*14+metaLines.length*11+17;
        if(y-height<48){newPage();text(page.cmds,group+' (continuação)',M,y,12,true,'0.043 0.455 0.514');y-=17;line(page.cmds,M,y,W-M,y);y-=21}
        const top=y;titleLines.forEach((s,n)=>text(page.cmds,s,M,y-n*14,11.2,true));y-=titleLines.length*14+3;metaLines.forEach((s,n)=>text(page.cmds,s,M,y-n*11,8.7,false,'0.38 0.44 0.49'));
        const actionY=top-2;if(valid(item.link)){text(page.cmds,'ABRIR',W-M-42,actionY,9.5,true,'0.043 0.455 0.514');page.links.push({url:item.link,rect:[W-M-46,actionY-3,W-M,actionY+11]})}else text(page.cmds,'EM BREVE',W-M-57,actionY,8.3,true,'0.52 0.57 0.60');
        y-=metaLines.length*11+13;line(page.cmds,M,y,W-M,y);y-=18;
      }
      y-=5;
    }
    pages.forEach((p,n)=>text(p.cmds,'Página '+(n+1)+' de '+pages.length,W-M-58,24,7.5,false,'0.48 0.52 0.55'));
    const objects=[null,null,null,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'];
    const add=o=>(objects.push(o),objects.length-1),pageRefs=[];
    for(const p of pages){const stream=p.cmds.join('\n')+'\n',content=add('<< /Length '+latin(stream).length+' >>\nstream\n'+stream+'endstream'),annots=p.links.map(l=>add('<< /Type /Annot /Subtype /Link /Rect ['+l.rect.map(v=>Number(v).toFixed(2)).join(' ')+'] /Border [0 0 0] /A << /S /URI /URI '+lit(l.url)+' >> >>'));const ref=add('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+W+' '+H+'] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents '+content+' 0 R'+(annots.length?' /Annots ['+annots.map(a=>a+' 0 R').join(' ')+']':'')+' >>');pageRefs.push(ref)}
    objects[1]='<< /Type /Catalog /Pages 2 0 R >>';objects[2]='<< /Type /Pages /Kids ['+pageRefs.map(r=>r+' 0 R').join(' ')+'] /Count '+pageRefs.length+' >>';
    let pdf='%PDF-1.4\n%âãÏÓ\n',offsets=[0];for(let i=1;i<objects.length;i++){offsets[i]=latin(pdf).length;pdf+=i+' 0 obj\n'+objects[i]+'\nendobj\n'}const xref=latin(pdf).length;pdf+='xref\n0 '+objects.length+'\n0000000000 65535 f \n';for(let i=1;i<objects.length;i++)pdf+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';pdf+='trailer\n<< /Size '+objects.length+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF\n';return Uint8Array.from(latin(pdf),c=>c.charCodeAt(0)&255)
  }
  function download(items){const bytes=generate(items),blob=new Blob([bytes],{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Lista_Rapida_Comunidade_Codigos_do_Tempo.pdf';a.target='_blank';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}
  return {generate,download};
});
