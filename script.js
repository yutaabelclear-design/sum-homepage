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

  const text = 'The Sun Rises Again';
  heroTitle.textContent = '';

  [...text].forEach((char, index) => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    if (char === ' ') span.classList.add('space');
    span.style.animationDelay = `${index * 0.055}s`;
    heroTitle.appendChild(span);
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
