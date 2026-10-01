/* CodevaCore — Teklif paneli (sağdan açılan). Mevcut EmailJS kimlikleri değiştirilmedi. */
(function(){
  'use strict';

  /* ===== Çekirdek: doğrulama + gönderim (DOM'dan bağımsız) ===== */
  var EMAILJS = { service: 'service_x3mshno', template: 'template_a6mub2v' }; // Public Key: index.html'de init edilir
  var TO_EMAIL = 'codevacoreyazilim@gmail.com';
  var NAME_RE = /^[\p{L}][\p{L}\s'.\-]{1,39}$/u;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function clean(s){ return String(s || '').replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim(); }
  function links(s){ return (String(s).match(/https?:\/\/|www\./gi) || []).length; }

  function validate(v){
    var e = {};
    if(!clean(v.firstName)) e.firstName = 'Lütfen adınızı yazın.';
    else if(!NAME_RE.test(clean(v.firstName))) e.firstName = 'Ad yalnızca harflerden oluşmalı.';
    if(!clean(v.lastName)) e.lastName = 'Lütfen soyadınızı yazın.';
    else if(!NAME_RE.test(clean(v.lastName))) e.lastName = 'Soyad yalnızca harflerden oluşmalı.';
    if(clean(v.company).length > 80) e.company = 'Şirket adı en fazla 80 karakter olabilir.';
    var digits = String(v.phone || '').replace(/\D/g, '');
    if(!clean(v.phone)) e.phone = 'Lütfen telefon numaranızı yazın.';
    else if(!/^\+?[\d\s()\-]+$/.test(String(v.phone).trim()) || digits.length < 10 || digits.length > 15) e.phone = 'Geçerli bir telefon numarası yazın (örn. 05xx xxx xx xx).';
    if(!clean(v.email)) e.email = 'Lütfen e-posta adresinizi yazın.';
    else if(!EMAIL_RE.test(clean(v.email)) || clean(v.email).length > 100) e.email = 'Geçerli bir e-posta adresi yazın.';
    if(!clean(v.pkg)) e.pkg = 'Lütfen bir paket seçin.';
    if(String(v.notes || '').length > 1500) e.notes = 'Açıklama en fazla 1500 karakter olabilir.';
    else if(links(v.notes) > 2) e.notes = 'Açıklamada en fazla 2 bağlantı bulunabilir.';
    return e;
  }

  /* Mevcut EmailJS şablonunun beklediği parametre adları aynen korunur. */
  function buildParams(v){
    var first = clean(v.firstName), last = clean(v.lastName);
    return {
      package_name: clean(v.pkg),
      user_name: first + ' ' + last,
      first_name: first,
      last_name: last,
      company_name: clean(v.company),
      user_phone: clean(v.phone),
      user_email: clean(v.email),
      user_notes: String(v.notes || '').replace(/\u0000/g, '').trim(),
      to_email: TO_EMAIL
    };
  }

  function send(emailjs, v){
    return emailjs.send(EMAILJS.service, EMAILJS.template, buildParams(v));
  }

  var core = { validate: validate, buildParams: buildParams, send: send, EMAILJS: EMAILJS, TO_EMAIL: TO_EMAIL };
  if(typeof document === 'undefined'){ if(typeof module === 'object') module.exports = core; return; }

  /* ===== Arayüz ===== */
  var panel = document.getElementById('quotePanel');
  if(!panel) return;
  var scrim = document.getElementById('quoteScrim');
  var form = document.getElementById('quoteForm');
  var done = document.getElementById('quoteDone');
  var statusEl = document.getElementById('quoteStatus');
  var btn = document.getElementById('quoteSubmit');
  var fields = { firstName:'qFirst', lastName:'qLast', company:'qCompany', phone:'qPhone', email:'qEmail', pkg:'qPackage', notes:'qNotes' };
  var lastTrigger = null, openedAt = 0, sending = false;
  var COOLDOWN_MS = 60000;

  function val(k){ return document.getElementById(fields[k]).value; }
  function values(){ var o = {}; Object.keys(fields).forEach(function(k){ o[k] = val(k); }); return o; }
  function setError(k, msg){
    var input = document.getElementById(fields[k]);
    var err = document.getElementById(fields[k] + 'Err');
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    err.textContent = msg || '';
  }
  function clearErrors(){ Object.keys(fields).forEach(function(k){ setError(k, ''); }); statusEl.textContent = ''; statusEl.className = 'q-status'; }

  function open(pkg, trigger){
    lastTrigger = trigger || null;
    form.hidden = false; done.hidden = true; clearErrors();
    var sel = document.getElementById('qPackage');
    var exists = Array.prototype.some.call(sel.options, function(o){ return o.value === pkg; });
    sel.value = exists ? pkg : 'Henüz karar vermedim';   // seçilen paket otomatik dolar
    panel.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    document.getElementById('stage').style.overflowY = 'hidden';
    requestAnimationFrame(function(){ panel.classList.add('open'); scrim.classList.add('open'); });
    openedAt = Date.now();
    setTimeout(function(){ document.getElementById('qFirst').focus(); }, 320);
  }
  function close(){
    panel.classList.remove('open'); scrim.classList.remove('open');
    document.documentElement.style.overflow = '';
    document.getElementById('stage').style.overflowY = '';
    setTimeout(function(){ if(!panel.classList.contains('open')) panel.hidden = true; }, 330);
    if(lastTrigger && lastTrigger.focus) lastTrigger.focus();
  }

  document.addEventListener('click', function(e){
    var t = e.target.closest('[data-quote]');
    if(t){ e.preventDefault(); open(t.getAttribute('data-package') || '', t); return; }
    if(e.target.closest('[data-quote-close]')) close();
  });
  document.addEventListener('keydown', function(e){
    if(!panel.classList.contains('open')) return;
    if(e.key === 'Escape'){ close(); return; }
    if(e.key === 'Tab'){ // odak panelin içinde kalsın
      var f = panel.querySelectorAll('button:not([hidden]):not([disabled]), input:not([tabindex="-1"]), select, textarea, a[href]');
      f = Array.prototype.filter.call(f, function(n){ return n.offsetParent !== null; });
      if(!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });

  function showStatus(msg, type){ statusEl.textContent = msg; statusEl.className = 'q-status ' + type; }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    if(sending) return;
    clearErrors();

    var errs = validate(values());
    var keys = Object.keys(errs);
    if(keys.length){
      keys.forEach(function(k){ setError(k, errs[k]); });
      document.getElementById(fields[keys[0]]).focus();
      return;
    }

    // Spam / kötüye kullanım: bal küpü alanı, çok hızlı gönderim, art arda gönderim
    if(document.getElementById('qWebsite').value){ form.hidden = true; done.hidden = false; return; } // botlara sessiz başarı
    if(Date.now() - openedAt < 3000){ showStatus('Lütfen formu doldurduktan sonra tekrar gönderin.', 'error'); return; }
    try {
      var last = Number(sessionStorage.getItem('cc_quote_ts') || 0);
      if(Date.now() - last < COOLDOWN_MS){ showStatus('Az önce bir talep gönderdiniz. Lütfen bir dakika sonra tekrar deneyin.', 'error'); return; }
    } catch(_) {}

    if(typeof emailjs === 'undefined'){
      showStatus('Talep şu anda gönderilemiyor. Lütfen 0543 179 10 53 numarasından veya codevacoreyazilim@gmail.com adresinden bize ulaşın.', 'error');
      return;
    }

    sending = true; btn.disabled = true; var label = btn.textContent; btn.textContent = 'Gönderiliyor...';
    send(emailjs, values()).then(function(){
      try { sessionStorage.setItem('cc_quote_ts', String(Date.now())); } catch(_) {}
      form.reset(); form.hidden = true; done.hidden = false;
      document.getElementById('quoteDoneTitle').focus();
    }, function(err){
      console.error('EmailJS gönderim hatası:', err);
      showStatus('Talebiniz gönderilemedi. İnternet bağlantınızı kontrol edip tekrar deneyin; sorun sürerse 0543 179 10 53 numarasından bize ulaşın.', 'error');
    }).then(function(){ sending = false; btn.disabled = false; btn.textContent = label; });
  });
})();
