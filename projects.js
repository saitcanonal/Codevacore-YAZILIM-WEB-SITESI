/* CodevaCore — Projeler verisi.
   Yeni proje eklemek için diziye bir nesne eklemek yeterli. Boş alanlar kartta gösterilmez.
   status: 'tamamlandi' | 'gelistiriliyor' | 'planlaniyor' | ''   (boş = belirtilmemiş)
   detail: ileride proje detay sayfasının adresi (örn. '#proje-giderim'). Doluysa kartta "Detayları gör" bağlantısı çıkar.
   image: ileride proje görseli yolu (örn. 'assets/projects/giderim.png'). Boşsa baş harfli yer tutucu gösterilir. */
window.CODEVACORE_PROJECTS = [
  { id: 'giderim',      name: 'Giderim',      category: '',     description: '', tech: [], status: '', detail: '', image: '' },
  { id: 'nokta-oyunu',  name: 'Nokta Oyunu',  category: 'Oyun', description: '', tech: [], status: '', detail: '', image: '' }
];

(function(){
  'use strict';
  var grid = document.getElementById('projGrid');
  if(!grid) return;
  var STATUS = { tamamlandi:'Tamamlandı', gelistiriliyor:'Geliştiriliyor', planlaniyor:'Planlanıyor' };

  function el(tag, cls, text){
    var n = document.createElement(tag);
    if(cls) n.className = cls;
    if(text) n.textContent = text;
    return n;
  }

  window.CODEVACORE_PROJECTS.forEach(function(p){
    var card = el('article', 'card proj');
    card.dataset.project = p.id;

    var media = el('div', 'proj-media');
    if(p.image){ var img = el('img'); img.src = p.image; img.alt = p.name; media.appendChild(img); }
    else { media.appendChild(el('span', 'proj-initial', p.name.charAt(0))); }
    card.appendChild(media);

    var body = el('div', 'proj-body');
    if(p.category) body.appendChild(el('span', 'proj-cat', p.category));
    body.appendChild(el('h3', '', p.name));
    if(p.description) body.appendChild(el('p', 'proj-desc', p.description));

    if(p.tech && p.tech.length){
      var tech = el('ul', 'proj-tech');
      p.tech.forEach(function(t){ tech.appendChild(el('li', '', t)); });
      body.appendChild(tech);
    }

    var st = p.status && STATUS[p.status];
    if(st || p.detail){
      var foot = el('div', 'proj-foot');
      if(st) foot.appendChild(el('span', 'proj-status s-' + p.status, st));
      if(p.detail){ var a = el('a', 'proj-link', 'Detayları gör'); a.href = p.detail; foot.appendChild(a); }
      body.appendChild(foot);
    }

    card.appendChild(body);
    grid.appendChild(card);
  });
})();
