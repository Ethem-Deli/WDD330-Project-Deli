// mediaHelpers.mjs - helpers to fetch Wikipedia summary and Wikimedia images
export async function fetchWikipediaSummary(title){
  try{
    const q = encodeURIComponent(title);
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${q}`;
    const res = await fetch(url);
    if(!res.ok) return null;
    const data = await res.json();
    return data.extract;
  }catch(e){ return null; }
}

export async function fetchWikimediaImage(title){
  try{
    const q = encodeURIComponent(title);
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${q}&origin=*`;
    const res = await fetch(url);
    if(!res.ok) return null;
    const data = await res.json();
    const pages = data.query && data.query.pages || {};
    const page = Object.values(pages)[0];
    if(page && page.original && page.original.source) return page.original.source;
    return null;
  }catch(e){ return null; }
}