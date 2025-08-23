// Minimal popup to open current Medium article in ReadMirror and toggle auto-redirect
(async function(){
  const openBtn = document.getElementById('openBtn');
  const autoToggle = document.getElementById('autoToggle');

  const DEFAULTS = { autoUnlock:false };
  const saved = await chrome.storage.sync.get(DEFAULTS);
  autoToggle.checked = !!saved.autoUnlock;

  autoToggle.addEventListener('change', async (e)=>{
    const enable = e.target.checked;
    await chrome.storage.sync.set({autoUnlock: enable});
    try{
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: enable ? ['medium-to-freedium'] : [],
        disableRulesetIds: enable ? [] : ['medium-to-freedium']
      });
    }catch(_){/* ignore if not permitted */}
  });

  function toReadMirror(url){
    try{
      const u = new URL(url);
      if(u.hostname.endsWith('medium.com')){
        const path = u.pathname.replace(/^\/+/, '');
        return `https://freedium.cfd/medium.com/${path}${u.search||''}${u.hash||''}`;
      }
    }catch(_){ }
    return null;
  }

  openBtn.addEventListener('click', async ()=>{
    try{
      const [tab] = await chrome.tabs.query({active:true, currentWindow:true});
      if(!tab || !tab.url) return;
      const target = toReadMirror(tab.url);
      if(!target) return;
      await chrome.tabs.update(tab.id, { url: target });
      window.close();
    }catch(_){ }
  });
})();

