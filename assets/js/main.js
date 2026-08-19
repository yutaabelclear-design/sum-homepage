const navToggle = document.getElementById('navToggle');
const siteNav = document.getElementById('siteNav');

if (navToggle && siteNav) {
  const closeNav = () => {
    siteNav.classList.remove('is-open');
    navToggle.classList.remove('is-active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  };

  const openNav = () => {
    siteNav.classList.add('is-open');
    navToggle.classList.add('is-active');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
  };

  navToggle.addEventListener('click', () => {
    if (siteNav.classList.contains('is-open')) {
      closeNav();
    } else {
      openNav();
    }
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNav();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeNav();
  });
}

const introLoader = document.getElementById('introLoader');
const heroTitle = document.getElementById('heroTitle');
const heroSlides = document.querySelectorAll('.hero-slide');
const storyImages = document.querySelectorAll('[data-story-image]');
const storyPanels = document.querySelectorAll('.story-panel[data-story]');
const progressBar = document.querySelector('.scroll-progress');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

window.addEventListener('load', () => {
  window.setTimeout(() => {
    introLoader?.classList.add('is-hidden');
    startHeroTitle();
  }, prefersReducedMotion ? 200 : 1750);
});

function startHeroTitle() {
  if (!heroTitle || heroTitle.dataset.started === 'true') return;
  heroTitle.dataset.started = 'true';

  const text = heroTitle.dataset.text || 'The Sun Rises Again';
  heroTitle.textContent = '';

  const words = text.split(' ');
  let charIndex = 0;

  words.forEach((word, wordIndex) => {
    const wordSpan = document.createElement('span');
    wordSpan.style.display = 'inline-block';
    wordSpan.style.whiteSpace = 'nowrap';

    [...word].forEach((char) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.animationDelay = `${charIndex * 0.055}s`;
      wordSpan.appendChild(span);
      charIndex += 1;
    });

    heroTitle.appendChild(wordSpan);

    if (wordIndex < words.length - 1) {
      const spaceSpan = document.createElement('span');
      spaceSpan.textContent = '\u00A0';
      spaceSpan.classList.add('space');
      spaceSpan.style.animationDelay = `${charIndex * 0.055}s`;
      heroTitle.appendChild(spaceSpan);
      charIndex += 1;
    }
  });
}

let heroIndex = 0;
function setHeroSlide(index) {
  heroSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle('is-active', slideIndex === index);
  });
}

if (heroSlides.length > 1 && !prefersReducedMotion) {
  window.setInterval(() => {
    heroIndex = (heroIndex + 1) % heroSlides.length;
    setHeroSlide(heroIndex);
  }, 4300);
}

function setActiveStory(name) {
  storyImages.forEach((image) => {
    image.classList.toggle('is-active', image.dataset.storyImage === name);
  });
}

const storyObserver = new IntersectionObserver((entries) => {
  const visibleEntries = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

  if (visibleEntries[0]) {
    setActiveStory(visibleEntries[0].target.dataset.story);
  }
}, {
  threshold: [0.25, 0.4, 0.55, 0.7],
  rootMargin: '-18% 0px -24% 0px'
});

storyPanels.forEach((panel) => storyObserver.observe(panel));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

function updateProgress() {
  if (!progressBar) return;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (scrollTop / scrollable) * 100 : 0;
  progressBar.style.width = `${progress}%`;
}

window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

const blogModal = document.getElementById('blogModal');
if (blogModal) {
  const blogModalImg = document.getElementById('blogModalImg');
  const blogModalTime = document.getElementById('blogModalTime');
  const blogModalTitle = document.getElementById('blogModalTitle');
  const blogModalBody = document.getElementById('blogModalBody');
  const blogModalClose = document.getElementById('blogModalClose');
  const blogModalLink = document.getElementById('blogModalLink');

  function openBlogModal(post) {
    const img = post.querySelector('img');
    const time = post.querySelector('time');
    const title = post.querySelector('h3');
    const body = post.querySelector('.blog-post-body p');
    const link = post.querySelector('.blog-post-body a.link-more');

    blogModalImg.src = img ? img.src : '';
    blogModalImg.alt = img ? img.alt : '';
    blogModalTime.textContent = time ? time.textContent : '';
    blogModalTitle.textContent = title ? title.textContent : '';
    blogModalBody.textContent = body ? body.textContent : '';
    if (blogModalLink) {
      if (link) {
        blogModalLink.href = link.href;
        blogModalLink.style.display = '';
      } else {
        blogModalLink.style.display = 'none';
      }
    }
    blogModal.hidden = false;
  }

  function closeBlogModal() {
    blogModal.hidden = true;
    blogModalImg.src = '';
  }

  document.querySelectorAll('.blog-post').forEach((post) => {
    post.addEventListener('click', () => openBlogModal(post));
  });

  blogModalClose.addEventListener('click', closeBlogModal);
  blogModal.addEventListener('click', (event) => {
    if (event.target === blogModal) closeBlogModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !blogModal.hidden) closeBlogModal();
  });
}

const newsModal = document.getElementById('newsModal');
if (newsModal) {
  const newsModalImg = document.getElementById('newsModalImg');
  const newsModalTime = document.getElementById('newsModalTime');
  const newsModalTitle = document.getElementById('newsModalTitle');
  const newsModalBody = document.getElementById('newsModalBody');
  const newsModalClose = document.getElementById('newsModalClose');

  function openNewsModal(card) {
    const img = card.querySelector('img');
    const time = card.querySelector('time');
    const title = card.querySelector('h3');
    const body = card.querySelector('p');

    if (newsModalImg) {
      newsModalImg.src = img ? img.src : '';
      newsModalImg.alt = img ? img.alt : '';
    }
    newsModalTime.textContent = time ? time.textContent : '';
    newsModalTitle.textContent = title ? title.textContent : '';
    newsModalBody.textContent = body ? body.textContent : '';
    newsModal.hidden = false;
  }

  function closeNewsModal() {
    newsModal.hidden = true;
    if (newsModalImg) newsModalImg.src = '';
  }

  document.querySelectorAll('.news-full-list .news-card').forEach((card) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => openNewsModal(card));
  });

  newsModalClose.addEventListener('click', closeNewsModal);
  newsModal.addEventListener('click', (event) => {
    if (event.target === newsModal) closeNewsModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !newsModal.hidden) closeNewsModal();
  });
}

document.querySelectorAll('.news-slider').forEach((slider) => {
  const list = slider.querySelector('.news-list');
  const prevBtn = slider.querySelector('.news-nav.prev');
  const nextBtn = slider.querySelector('.news-nav.next');
  if (!list) return;

  function scrollByCard(direction) {
    const card = list.querySelector('.news-card');
    const step = card ? card.getBoundingClientRect().width + 22 : 320;
    list.scrollBy({ left: direction * step, behavior: 'smooth' });
  }

  prevBtn?.addEventListener('click', () => scrollByCard(-1));
  nextBtn?.addEventListener('click', () => scrollByCard(1));
});
