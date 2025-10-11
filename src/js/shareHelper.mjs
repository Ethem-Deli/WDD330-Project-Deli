// shareHelper.mjs - share links feature
export function shareEvent(ev){
  if(navigator.share){
    navigator.share({title: ev.title, text: ev.description, url: window.location.href + '?event=' + ev.id}).catch(()=>{});
  } else {
    // fallback: copy link to clipboard
    const link = window.location.href.split('#')[0] + '?event=' + ev.id;
    navigator.clipboard?.writeText(link).then(()=> alert('Link copied to clipboard') , ()=> alert('Copy failed'));
  }
}