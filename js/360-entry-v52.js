(function(){
'use strict';
const BASE='https://jmejiaromero.app.n8n.cloud/webhook';
const ID='edd-360-entry-v52';
let tokenChecked=null,eligible=false,checking=false;
function readSession(){try{const s=JSON.parse(sessionStorage.getItem('edd_session')||'null');return s&&s.token?s:null}catch(e){return null}}
function removeEntry(){const x=document.getElementById(ID);if(x)x.remove()}
function mount(){if(!eligible||document.getElementById(ID))return;const b=document.createElement('button');b.id=ID;b.type='button';b.setAttribute('aria-label','Abrir Evaluación 360°');b.innerHTML='<span style="font-size:16px">◎</span><span>Evaluación 360°</span>';
Object.assign(b.style,{position:'fixed',right:'18px',bottom:'18px',zIndex:'9998',display:'flex',alignItems:'center',gap:'9px',padding:'11px 15px',border:'1px solid rgba(255,255,255,.18)',borderRadius:'12px',background:'#002a5c',color:'#fff',font:'700 12px Inter, Segoe UI, Arial, sans-serif',boxShadow:'0 10px 28px rgba(13,31,55,.22)',cursor:'pointer'});
b.onmouseenter=()=>b.style.transform='translateY(-1px)';b.onmouseleave=()=>b.style.transform='none';b.onclick=()=>{window.location.href='360-live.html'};document.body.appendChild(b)}
async function validate(){const s=readSession();if(!s){tokenChecked=null;eligible=false;removeEntry();return}if(checking)return;if(tokenChecked===s.token){mount();return}checking=true;try{const r=await fetch(BASE+'/360/me',{headers:{Authorization:`Bearer ${s.token}`}});let j=null;try{j=await r.json()}catch(e){}if(!r.ok){eligible=false;removeEntry();return}const d=j&&j.data!==undefined?j.data:j||{};eligible=!!(d.isAdmin||d.participant360);tokenChecked=s.token;if(eligible)mount();else removeEntry()}catch(e){eligible=false;removeEntry()}finally{checking=false}}
const observer=new MutationObserver(()=>{if(eligible)mount()});observer.observe(document.documentElement,{childList:true,subtree:true});
setInterval(validate,2500);validate();
})();