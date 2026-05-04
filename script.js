/* ================================================================
   PORTFOLIO V2 — SCRIPT.JS
   Curseur custom, loader, menu overlay, scroll reveal,
   drag-scroll galerie horizontale, formulaire
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {


  // Déclencher les animations du hero au chargement
  setTimeout(() => {
    document.querySelectorAll('.hero .anim-reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('is-visible'), i * 120);
    });
  }, 100);

  /* ============================================================
     2. THEME TOGGLE — Jour / Nuit
     Sauvegarde la préférence dans localStorage
     ============================================================ */
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-toggle-icon');

  // Restaurer la préférence enregistrée
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light');
    themeIcon.textContent = '☾';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light');
      themeIcon.textContent = isLight ? '☾' : '☀';
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
  }




  /* ============================================================
     3. MENU OVERLAY — Ouvrir / fermer
     ============================================================ */
  const menuBtn = document.getElementById('menu-btn');
  const menuBtnText = document.getElementById('menu-btn-text');
  const menuOverlay = document.getElementById('menu-overlay');

  if (menuBtn && menuOverlay) {
    menuBtn.addEventListener('click', () => {
      const isOpen = menuOverlay.classList.toggle('is-open');
      menuBtn.classList.toggle('is-active');
      menuBtnText.textContent = isOpen ? 'fermer' : 'menu';
    });

    // Fermer quand on clique sur un lien
    menuOverlay.querySelectorAll('.menu-overlay__link').forEach(link => {
      link.addEventListener('click', () => {
        menuOverlay.classList.remove('is-open');
        menuBtn.classList.remove('is-active');
        menuBtnText.textContent = 'menu';
      });
    });
  }


  /* ============================================================
     4. SMOOTH SCROLL — Pour toutes les ancres
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


  /* ============================================================
     5. SCROLL REVEAL — IntersectionObserver
     (exclut les éléments dans le hero, gérés par le loader)
     ============================================================ */
  const revealEls = document.querySelectorAll('.anim-reveal:not(.hero .anim-reveal)');

  if ('IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );
    revealEls.forEach(el => revealObs.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }


  /* ============================================================
     6. GALERIE HORIZONTALE — Drag to scroll
     Permet de cliquer-glisser sur desktop comme sur mobile
     ============================================================ */
  const hscroll = document.getElementById('hscroll');

  if (hscroll) {
    let isDragging = false;
    let startX, scrollLeft;

    hscroll.addEventListener('mousedown', (e) => {
      isDragging = true;
      hscroll.classList.add('is-dragging');
      startX = e.pageX - hscroll.offsetLeft;
      scrollLeft = hscroll.scrollLeft;
    });

    hscroll.addEventListener('mouseleave', () => {
      isDragging = false;
      hscroll.classList.remove('is-dragging');
    });

    hscroll.addEventListener('mouseup', () => {
      isDragging = false;
      hscroll.classList.remove('is-dragging');
    });

    hscroll.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - hscroll.offsetLeft;
      const walk = (x - startX) * 1.5;
      hscroll.scrollLeft = scrollLeft - walk;
    });

  }


  /* ============================================================
     7. FORMULAIRE — Retiré
     ============================================================ */

  /* ============================================================
     9. GALERIE — APPARITION AU SCROLL & FILTRES
     ============================================================ */
  const gridItems = document.querySelectorAll('.gallery__item');
  if (gridItems.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('anim-in'); io.unobserve(e.target); }
      });
    }, { threshold: .06, rootMargin: '0px 0px -20px 0px' });
    gridItems.forEach((el, i) => {
      el.style.animationDelay = (i % 5) * 80 + 'ms';
      io.observe(el);
    });
  }

  const filterBtns = document.querySelectorAll('.filter-btn');
  const sectionLabels = document.querySelectorAll('.gallery__section-label');
  const countNumber = document.getElementById('count-number');
  const filterPill = document.getElementById('filter-pill');

  function updateFilterPill(btn) {
    if (!filterPill || !btn) return;
    filterPill.style.width = btn.offsetWidth + 'px';
    filterPill.style.left = btn.offsetLeft + 'px';
  }

  if (filterBtns.length) {
    // Position initiale du pill
    const activeBtn = document.querySelector('.filter-btn.active') || filterBtns[0];
    setTimeout(() => updateFilterPill(activeBtn), 150);
    window.addEventListener('resize', () => {
      const currentActive = document.querySelector('.filter-btn.active');
      if (currentActive) updateFilterPill(currentActive);
    }, { passive: true });

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateFilterPill(btn);

        const filter = btn.dataset.filter;
        let count = 0;

        sectionLabels.forEach(label => {
          label.style.display = (filter === 'all' || label.dataset.section === filter) ? '' : 'none';
        });

        gridItems.forEach((item) => {
          const cats = (item.dataset.category || '').split(' ');
          const show = filter === 'all' || cats.includes(filter);
          if (show) {
            item.classList.remove('is-hidden');
            item.style.animationDelay = (count % 5) * 80 + 'ms';
            item.classList.remove('anim-in');
            void item.offsetWidth;
            item.classList.add('anim-in');
            count++;
          } else {
            item.classList.add('is-hidden');
          }
        });
        if (countNumber) countNumber.textContent = count;
      });
    });
  }

  /* ============================================================
     10. LIGHTBOX v2 — Immersive gallery with slide transitions,
         swipe, thumbnails, and expand animation
     ============================================================ */
  const lightbox = document.getElementById('lightbox');

  if (lightbox) {
    const lbImg = document.getElementById('lb-img');
    const lbCat = document.getElementById('lb-cat');
    const lbTitle = document.getElementById('lb-title');
    const lbSub = document.getElementById('lb-sub');
    const lbDesc = document.getElementById('lb-desc');
    const lbCounter = document.getElementById('lb-counter');
    const lbThumbstrip = document.getElementById('lb-thumbstrip');
    const lbGallery = document.getElementById('lb-gallery');
    const lbGalleryGrid = document.getElementById('lb-gallery-grid');

    let currentLbIndex = 0;
    let isAnimating = false;

    // --- Visible items ---
    function getVisibleItems() {
      const hscroll = document.querySelectorAll('.hscroll__card');
      const gallery = document.querySelectorAll('.gallery__item');
      if (gallery.length > 0) return [...gallery].filter(item => !item.classList.contains('is-hidden'));
      if (hscroll.length > 0) return [...hscroll];
      return [];
    }

    // --- Build thumbnails ---
    function buildThumbnails() {
      if (!lbThumbstrip) return;
      lbThumbstrip.innerHTML = '';
      const items = getVisibleItems();
      items.forEach((item, i) => {
        const thumb = document.createElement('img');
        thumb.className = 'lightbox2__thumb';
        thumb.src = item.dataset.img || item.querySelector('img')?.src || '';
        thumb.alt = item.dataset.title || '';
        thumb.loading = 'lazy';
        if (i === currentLbIndex) thumb.classList.add('is-active');
        thumb.addEventListener('click', () => {
          if (i !== currentLbIndex) slideToItem(i, i > currentLbIndex ? 'next' : 'prev');
        });
        lbThumbstrip.appendChild(thumb);
      });
    }

    function updateThumbnails() {
      if (!lbThumbstrip) return;
      lbThumbstrip.querySelectorAll('.lightbox2__thumb').forEach((t, i) => {
        t.classList.toggle('is-active', i === currentLbIndex);
      });
      // Scroll active into view
      const active = lbThumbstrip.querySelector('.is-active');
      if (active) active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    // --- Show item content (no animation) ---
    function populateItem(idx) {
      const items = getVisibleItems();
      if (!items.length) return;
      currentLbIndex = (idx + items.length) % items.length;
      const item = items[currentLbIndex];

      lbImg.src = item.dataset.img || item.querySelector('img')?.src || '';
      lbImg.alt = item.dataset.title || item.querySelector('img')?.alt || '';

      if (lbCat) lbCat.textContent = item.querySelector('.hscroll__card-cat')?.textContent?.trim() || item.dataset.category || '';
      if (lbTitle) {
        lbTitle.textContent = item.dataset.title || 
                             item.querySelector('.gallery__item-title')?.textContent?.trim() || 
                             item.querySelector('.hscroll__card-title')?.textContent?.trim() || 
                             '';
      }
      
      // On affiche les descriptions uniquement pour Mojo et Kenzi (Shawtie & Demi)
      const currentTitle = lbTitle ? lbTitle.textContent : '';
      const isMojoOrKenzi = currentTitle === 'Mojo' || currentTitle === 'Shawtie & Demi';

      if (lbSub) {
        if (isMojoOrKenzi) {
          lbSub.textContent = item.dataset.sub || 
                             item.querySelector('.gallery__item-sub')?.textContent?.trim() || 
                             item.querySelector('.hscroll__card-desc')?.textContent?.trim() || 
                             '';
        } else {
          lbSub.textContent = '';
        }
      }
      if (lbDesc) {
        if (isMojoOrKenzi) {
          lbDesc.textContent = item.dataset.desc || '';
        } else {
          lbDesc.textContent = '';
        }
      }
      if (lbCounter) lbCounter.textContent = `${currentLbIndex + 1} / ${items.length}`;

      // Gallery images (branding projects)
      if (lbGallery && lbGalleryGrid) {
        lbGalleryGrid.innerHTML = '';
        if (item.dataset.gallery) {
          try {
            const imgs = JSON.parse(item.dataset.gallery);
            if (imgs.length > 0) {
              lbGallery.style.display = 'block';
              currentGalleryImages = imgs;
              imgs.forEach(src => {
                const img = document.createElement('img');
                img.src = src;
                img.alt = (item.dataset.title || 'Projet') + ' — visuel';
                img.loading = 'lazy';
                img.addEventListener('click', () => openFullzoom(src));
                lbGalleryGrid.appendChild(img);
              });
            } else {
              lbGallery.style.display = 'none';
            }
          } catch (e) { lbGallery.style.display = 'none'; }
        } else {
          lbGallery.style.display = 'none';
        }
      }

      updateThumbnails();
    }

    // --- Slide transition ---
    function slideToItem(idx, direction) {
      if (isAnimating) return;
      isAnimating = true;

      const outClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
      const inClass = direction === 'next' ? 'slide-in-left' : 'slide-in-right';

      // Slide out
      lbImg.classList.add(outClass);

      setTimeout(() => {
        populateItem(idx);
        lbImg.classList.remove(outClass);
        lbImg.classList.add(inClass);

        // Force reflow
        void lbImg.offsetWidth;

        // Slide in
        lbImg.classList.remove(inClass);
        lbImg.classList.add('slide-settle');

        setTimeout(() => {
          lbImg.classList.remove('slide-settle');
          isAnimating = false;
        }, 420);
      }, 280);
    }

    // --- Open / Close ---
    function openLightbox(idx) {
      populateItem(idx);
      buildThumbnails();
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
      isAnimating = false;
    }

    // --- Navigation ---
    function goNext() { slideToItem(currentLbIndex + 1, 'next'); }
    function goPrev() { slideToItem(currentLbIndex - 1, 'prev'); }

    // Attach click events to gallery items & hscroll cards
    document.querySelectorAll('.hscroll__card, .gallery__item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('a') && e.target.closest('a') !== item) return;
        const v = getVisibleItems();
        const idx = v.indexOf(item);
        openLightbox(idx >= 0 ? idx : 0);
      });
    });

    document.getElementById('lb-close')?.addEventListener('click', closeLightbox);
    document.getElementById('lb-prev')?.addEventListener('click', goPrev);
    document.getElementById('lb-next')?.addEventListener('click', goNext);

    // Close on backdrop click
    document.getElementById('lb-backdrop')?.addEventListener('click', closeLightbox);

    // Keyboard
    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    });

    // --- Touch swipe ---
    let touchStartX = 0;
    let touchStartY = 0;
    let touchDeltaX = 0;

    lightbox.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchDeltaX = 0;
    }, { passive: true });

    lightbox.addEventListener('touchmove', e => {
      touchDeltaX = e.touches[0].clientX - touchStartX;
      const deltaY = Math.abs(e.touches[0].clientY - touchStartY);
      // Only prevent scroll if horizontal swipe
      if (Math.abs(touchDeltaX) > deltaY && Math.abs(touchDeltaX) > 10) {
        lbImg.style.transform = `translateX(${touchDeltaX * 0.3}px) scale(${1 - Math.abs(touchDeltaX) * 0.0003})`;
        lbImg.style.transition = 'none';
      }
    }, { passive: true });

    lightbox.addEventListener('touchend', () => {
      lbImg.style.transform = '';
      lbImg.style.transition = '';
      if (Math.abs(touchDeltaX) > 60) {
        if (touchDeltaX < 0) goNext();
        else goPrev();
      }
      touchDeltaX = 0;
    }, { passive: true });

    // --- Fullscreen zoom (branding gallery images) ---
    const fullzoom = document.getElementById('fullzoom');
    const fullzoomImg = document.getElementById('fullzoom-img');
    const fullzoomClose = document.getElementById('fullzoom-close');
    const fullzoomPrev = document.getElementById('fullzoom-prev');
    const fullzoomNext = document.getElementById('fullzoom-next');

    let currentGalleryImages = [];
    let currentZoomIndex = 0;

    function openFullzoom(src) {
      if (!fullzoom || !fullzoomImg) return;
      currentZoomIndex = currentGalleryImages.indexOf(src);
      if (currentZoomIndex < 0) currentZoomIndex = 0;
      fullzoomImg.src = src;
      fullzoom.classList.add('is-open');
    }
    function closeFullzoom() {
      if (!fullzoom) return;
      fullzoom.classList.remove('is-open');
    }
    function showZoomImage(idx) {
      if (!currentGalleryImages.length) return;
      currentZoomIndex = (idx + currentGalleryImages.length) % currentGalleryImages.length;
      fullzoomImg.src = currentGalleryImages[currentZoomIndex];
    }
    if (fullzoom) {
      fullzoom.addEventListener('click', e => {
        if (!e.target.closest('button') && e.target !== fullzoomImg) closeFullzoom();
      });
      fullzoomClose?.addEventListener('click', closeFullzoom);
      fullzoomPrev?.addEventListener('click', () => showZoomImage(currentZoomIndex - 1));
      fullzoomNext?.addEventListener('click', () => showZoomImage(currentZoomIndex + 1));
      document.addEventListener('keydown', e => {
        if (!fullzoom.classList.contains('is-open')) return;
        if (e.key === 'Escape') closeFullzoom();
        if (e.key === 'ArrowLeft') showZoomImage(currentZoomIndex - 1);
        if (e.key === 'ArrowRight') showZoomImage(currentZoomIndex + 1);
      });
    }
  }

  /* ============================================================
     10b. COMPTEUR ANIMÉ — Count-up au scroll
     ============================================================ */
  const countEl = document.getElementById('count-number');
  if (countEl) {
    const target = parseInt(countEl.textContent, 10) || 0;
    let hasAnimated = false;

    const countObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          let current = 0;
          const duration = 800;
          const step = Math.ceil(target / (duration / 30));
          const interval = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(interval);
              countEl.classList.add('count-animate');
            }
            countEl.textContent = current;
          }, 30);
        }
      });
    }, { threshold: 0.5 });

    countObs.observe(countEl);
  }


  /* ============================================================
     11. CV LIGHTBOX — Ouvrir / fermer
     ============================================================ */
  const cvLightbox = document.getElementById('cv-lightbox');
  const cvOpenBtn = document.getElementById('cv-open-lightbox');
  const cvCloseBtn = document.getElementById('cv-lb-close');
  const cvBackdrop = document.getElementById('cv-lightbox-backdrop');

  function openCvLightbox() {
    if (!cvLightbox) return;
    cvLightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeCvLightbox() {
    if (!cvLightbox) return;
    cvLightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (cvOpenBtn) {
    cvOpenBtn.addEventListener('click', openCvLightbox);
    cvOpenBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCvLightbox();
      }
    });
  }

  if (cvCloseBtn) cvCloseBtn.addEventListener('click', closeCvLightbox);
  if (cvBackdrop) cvBackdrop.addEventListener('click', closeCvLightbox);

  document.addEventListener('keydown', (e) => {
    if (cvLightbox && cvLightbox.classList.contains('is-open') && e.key === 'Escape') {
      closeCvLightbox();
    }
  });


  /* ============================================================
     12. HOMEPAGE ENHANCEMENTS
     ============================================================ */

  // --- 3. Interactive Moodboard (Draggable posters) ---
  const draggables = document.querySelectorAll('.draggable');
  let highestZ = 10;

  draggables.forEach(element => {
    let isDragging = false;
    let startX, startY;
    let currentX = 0;
    let currentY = 0;

    // Déterminer la rotation initiale en fonction de la classe
    let rotation = '';
    if (element.classList.contains('hero__comp-img--portrait')) rotation = 'rotate(-4deg)';
    if (element.classList.contains('hero__comp-img--landscape')) rotation = 'rotate(6deg)';
    if (element.classList.contains('hero__comp-img--square')) rotation = 'rotate(-2deg)';

    element.addEventListener('pointerdown', (e) => {
      isDragging = true;
      element.setPointerCapture(e.pointerId);
      
      highestZ++;
      element.style.zIndex = highestZ;

      startX = e.clientX - currentX;
      startY = e.clientY - currentY;
    });

    element.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      
      currentX = e.clientX - startX;
      currentY = e.clientY - startY;

      // On applique la translation et on remet la rotation par-dessus
      element.style.transform = `translate(${currentX}px, ${currentY}px) ${rotation}`;
    });

    element.addEventListener('pointerup', (e) => {
      isDragging = false;
      element.releasePointerCapture(e.pointerId);
    });
    
    element.addEventListener('pointercancel', (e) => {
      isDragging = false;
      element.releasePointerCapture(e.pointerId);
    });

    element.addEventListener('dragstart', (e) => e.preventDefault());
  });

  // --- 7. Progress bar for hscroll ---
  const hscrollTrack = document.getElementById('hscroll-track');
  const hscrollProgress = document.getElementById('hscroll-progress');
  const hscrollEl = document.getElementById('hscroll');

  if (hscrollEl && hscrollTrack && hscrollProgress) {
    hscrollEl.addEventListener('scroll', () => {
      const scrollLeft = hscrollEl.scrollLeft;
      const maxScroll = hscrollTrack.scrollWidth - hscrollEl.clientWidth;
      const pct = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
      hscrollProgress.style.width = pct + '%';
    }, { passive: true });
  }

  // --- 8. Tilt 3D on hscroll cards & gallery items ---
  document.querySelectorAll('.hscroll__card, .gallery__item').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 900) return; // Disable on mobile/tablet to avoid scrolling conflicts
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateY = ((x - centerX) / centerX) * 6;
      const rotateX = ((centerY - y) / centerY) * 6;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // --- 9. Drag hint — hide on first scroll ---
  const dragHint = document.getElementById('hscroll-drag-hint');
  if (dragHint && hscrollEl) {
    let dragHintHidden = false;
    hscrollEl.addEventListener('scroll', () => {
      if (!dragHintHidden && hscrollEl.scrollLeft > 20) {
        dragHintHidden = true;
        dragHint.style.transition = 'opacity .4s ease';
        dragHint.style.opacity = '0';
        setTimeout(() => { dragHint.style.display = 'none'; }, 400);
      }
    }, { passive: true });
  }

  // --- 10. Magnetic Tags ---
  const magneticTags = document.querySelectorAll('.tag--magnetic');
  magneticTags.forEach(tag => {
    tag.addEventListener('mousemove', (e) => {
      const rect = tag.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const pullX = x * 0.35; 
      const pullY = y * 0.35;
      
      tag.style.transform = `translate(${pullX}px, ${pullY}px) scale(1.05)`;
    });
    
    tag.addEventListener('mouseleave', () => {
      tag.style.transform = `translate(0px, 0px) scale(1)`;
      tag.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), border-color 0.3s, color 0.3s, background 0.3s';
      
      setTimeout(() => {
        tag.style.transition = 'border-color 0.3s, color 0.3s, background 0.3s';
      }, 400);
    });
  });

  // --- 11. Rotating Word (Gallery Hero) ---
  const rotateWord = document.getElementById('rotate-word');
  if (rotateWord) {
    const words = [
      { text: 'affiches',     style: "font-family:'Instrument Serif',serif; font-style:italic; font-weight:400; font-size:1.4em;" },
      { text: 'IDENTITÉS',    style: "font-family:'Bebas Neue',sans-serif; font-weight:400; letter-spacing:.15em; font-size:1.15em;" },
      { text: 'covers',       style: "font-family:'Syne',sans-serif; font-weight:800; font-size:1.05em; letter-spacing:.03em;" },
      { text: 'créations',    style: "font-family:'Unbounded',sans-serif; font-weight:700; font-size:.85em; letter-spacing:.02em;" },
      { text: 'explorations', style: "font-family:'Instrument Serif',serif; font-style:italic; font-weight:400;" },
    ];
    let wordIndex = 0;

    setInterval(() => {
      rotateWord.style.transform = 'translateY(-100%)';
      rotateWord.style.opacity = '0';

      setTimeout(() => {
        wordIndex = (wordIndex + 1) % words.length;
        rotateWord.textContent = words[wordIndex].text;
        rotateWord.style.cssText = words[wordIndex].style + 'color: var(--c-accent); transition: none; transform: translateY(100%); opacity: 0;';

        void rotateWord.offsetWidth;
        rotateWord.style.transition = 'transform .5s cubic-bezier(.77,0,.175,1), opacity .4s';
        rotateWord.style.transform = 'translateY(0)';
        rotateWord.style.opacity = '1';
      }, 450);
    }, 2500);
  }

});
