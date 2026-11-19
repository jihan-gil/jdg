// Enhancement only: all content remains accessible without JavaScript.
document.body.classList.add('js');

const grid = document.querySelector('#engineering-grid');
grid.innerHTML = engineeringProjects.map((project, index) => `
  <article class="project ${index > 2 ? 'project-extra' : ''} reveal">
    <div class="project-view ${project.image ? 'image-view' : 'static-view'}">
      ${project.image
        ? `<img src="${project.image}" alt="${project.title} engineering render" loading="lazy">`
        : `<div class="static-render ${project.visual}" aria-hidden="true"><span class="render-label">STATIC STUDY / ${String(index + 1).padStart(2, '0')}</span><div class="render-object"></div><span class="render-scale">SCALE / 1:4</span></div>`}
    </div>
    <div class="project-meta"><span>${String(index + 1).padStart(2, '0')} / ${project.kind}</span><h3>${project.title}</h3><b>STATIC RENDER</b></div>
  </article>`).join('');

const toggle = document.querySelector('#projects-toggle');
toggle.addEventListener('click', () => {
  const expanded = grid.classList.toggle('expanded');
  toggle.setAttribute('aria-expanded', String(expanded));
  toggle.innerHTML = expanded ? 'Show less <b>↑</b>' : 'See more <b>↓</b>';
  if (expanded) document.querySelectorAll('.project-extra.reveal').forEach(item => item.classList.add('visible'));
});

const links = [...document.querySelectorAll('.nav-link')];
const sections = [...document.querySelectorAll('[data-section]')];
const setActiveLink = id => links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
let scrollFrame;
function syncNavigation() {
  const readingLine = innerHeight * 0.42;
  const current = sections.find(section => { const bounds = section.getBoundingClientRect(); return bounds.top <= readingLine && bounds.bottom > readingLine; }) || sections.at(-1);
  setActiveLink(current.dataset.section);
}
function requestNavigationSync() { cancelAnimationFrame(scrollFrame); scrollFrame = requestAnimationFrame(syncNavigation); }
addEventListener('scroll', requestNavigationSync, { passive: true });
addEventListener('resize', requestNavigationSync); addEventListener('hashchange', requestNavigationSync); requestNavigationSync();

const reveal = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); reveal.unobserve(entry.target); } }), { threshold: 0.12 });
document.querySelectorAll('.reveal:not(.project-extra)').forEach(el => reveal.observe(el));

const menu = document.querySelector('.menu-toggle');
menu.addEventListener('click', () => { const open = document.body.classList.toggle('menu-open'); menu.setAttribute('aria-expanded', open); });
links.forEach(link => link.addEventListener('click', () => { setActiveLink(link.hash.slice(1)); document.body.classList.remove('menu-open'); }));
