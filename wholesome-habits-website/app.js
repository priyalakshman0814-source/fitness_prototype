const modal=document.getElementById('registerModal');
const form=document.getElementById('registerForm');
const success=document.getElementById('success');
const continueWa=document.getElementById('continueWa');
const heroWa=document.getElementById('heroWa');
function openModal(){modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';setTimeout(()=>modal.querySelector('input')?.focus(),100)}
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';form.style.display='';success.classList.remove('show');form.reset()}
document.querySelectorAll('[data-open-register]').forEach(b=>b.addEventListener('click',openModal));
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',closeModal));
modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
function prefill(name,goal){return `Hi! I'm ${name} 👋\n\nI just registered for the 21-Day Transformation Programme.\n\nMy goal is: ${goal}.\n\nI'm ready to get started! 💚`}
heroWa.href=`https://wa.me/916364254886?text=${encodeURIComponent(prefill('there','build healthier habits'))}`;
form.addEventListener('submit',async e=>{
 e.preventDefault();
 const data=Object.fromEntries(new FormData(form).entries());
 data.whatsappConsent=document.querySelector('[name="whatsappConsent"]').checked;
 const localMessage=prefill(data.firstName,data.goal);
 try{
   const r=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
   if(!r.ok) throw new Error('server');
   const result=await r.json();
   continueWa.href=result.whatsappUrl;
   form.style.display='none';success.classList.add('show');
   setTimeout(()=>window.open(result.whatsappUrl,'_blank','noopener'),500);
 }catch(err){
   const wa=`https://wa.me/916364254886?text=${encodeURIComponent(localMessage)}`;
   continueWa.href=wa;form.style.display='none';success.classList.add('show');
   setTimeout(()=>window.open(wa,'_blank','noopener'),500);
 }
});
