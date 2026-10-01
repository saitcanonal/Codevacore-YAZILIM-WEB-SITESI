/* CodevaCore — panel navigasyonu, mobil menü, KVKK modal (teklif formu: quote.js) */
(function(){
  'use strict';
  var app = document.getElementById('app');
  var stage = document.getElementById('stage');
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
  var links = Array.prototype.slice.call(document.querySelectorAll('#menu a'));
  var toggle = document.getElementById('menuToggle');
  var DEFAULT = 'ana-sayfa';
  var BASE_TITLE = 'CodevaCore — Yazılım ve Kodlama Stüdyosu';
  var ids = panels.map(function(p){ return p.id; });

  /* ---- Panel gösterimi ---- */
  function show(id){
    if(ids.indexOf(id) === -1) id = DEFAULT;
    panels.forEach(function(p){ p.classList.toggle('active', p.id === id); });
    links.forEach(function(a){
      if(a.dataset.route === id) a.setAttribute('aria-current','page');
      else a.removeAttribute('aria-current');
    });
    var panel = document.getElementById(id);
    document.title = id === DEFAULT ? BASE_TITLE : panel.dataset.title + ' — CodevaCore';
    stage.scrollTop = 0; window.scrollTo(0,0);
    closeMenu();
  }
  function currentId(){ return (location.hash || '').replace('#','') || DEFAULT; }

  /* Tüm "#..." bağlantıları (menü, butonlar, logo) hash üzerinden panel değiştirir */
  window.addEventListener('hashchange', function(){ show(currentId()); stage.focus({preventScroll:true}); });
  document.addEventListener('click', function(e){
    var a = e.target.closest('a[href^="#"]');
    if(!a) return;
    if(a.getAttribute('href') === location.hash){ e.preventDefault(); show(currentId()); } // aynı panele tıklama
  });

  /* ---- Mobil menü (off-canvas altyapısı) ---- */
  function openMenu(){ app.classList.add('menu-open'); document.documentElement.classList.add('no-scroll'); toggle.setAttribute('aria-expanded','true'); toggle.setAttribute('aria-label','Menüyü kapat'); }
  function closeMenu(){ app.classList.remove('menu-open'); document.documentElement.classList.remove('no-scroll'); toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Menüyü aç'); }
  toggle.addEventListener('click', function(){ app.classList.contains('menu-open') ? closeMenu() : openMenu(); });
  document.getElementById('scrim').addEventListener('click', closeMenu);
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !document.getElementById('quotePanel').classList.contains('open')) closeMenu(); });
  var mq = window.matchMedia('(min-width:761px)');
  if(mq.addEventListener) mq.addEventListener('change', closeMenu); else if(mq.addListener) mq.addListener(closeMenu);
  /* Teklif paneli açılırken (ör. mobil menüdeki "Teklif Al") menü arkada açık kalmasın */
  document.addEventListener('click', function(e){ if(e.target.closest('[data-quote]')) closeMenu(); });


  /* ---- Tablet: sidebar daraltma / genişletme ---- */
  var sideCollapse = document.getElementById('sideCollapse');
  var sideExpand = document.getElementById('sideExpand');
  function setCollapsed(on){
    app.classList.toggle('side-collapsed', on);
    try { sessionStorage.setItem('cc_side', on ? '1' : '0'); } catch(_) {}
    if(on && sideExpand) sideExpand.focus(); else if(!on && sideCollapse) sideCollapse.focus();
  }
  var stored = null; try { stored = sessionStorage.getItem('cc_side'); } catch(_) {}
  app.classList.toggle('side-collapsed', stored === null ? window.innerWidth < 900 : stored === '1');
  if(sideCollapse) sideCollapse.addEventListener('click', function(){ setCollapsed(true); });
  if(sideExpand) sideExpand.addEventListener('click', function(){ setCollapsed(false); });

  /* ---- KVKK modal ---- */
  var modal = document.getElementById('legalModal');
  document.getElementById('openLegal').addEventListener('click', function(){
    if(typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open','');
  });
  document.getElementById('closeLegal').addEventListener('click', function(){
    if(typeof modal.close === 'function') modal.close(); else modal.removeAttribute('open');
  });

  show(currentId());
})();
