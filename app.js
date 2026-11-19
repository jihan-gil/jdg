// Enhancement only: content stays visible if JavaScript cannot load.
document.body.classList.add('js');

const grid = document.querySelector('#engineering-grid');
grid.innerHTML = engineeringProjects.map((project, index) => `
  <article class="project ${project.featured ? 'featured' : ''} reveal">
    <div class="project-view ${project.image ? 'image-view' : 'model-view'}" ${project.image ? '' : `data-model="${project.model}"`}>
      ${project.image ? `<img src="${project.image}" alt="${project.title} engineering render" loading="lazy">` : `<div class="viewer-fallback"><span>GLB / PENDING</span><div class="wireframe wire-${index % 4}"></div><small>Source model retained</small></div>`}
    </div>
    <div class="project-meta"><span>${String(index + 1).padStart(2, '0')} / ${project.kind}</span><h3>${project.title}</h3><b>${project.image ? 'IMAGE STUDY' : 'INTERACTIVE MODEL'} ↗</b></div>
  </article>`).join('');

const links = [...document.querySelectorAll('.nav-link')];
const sections = [...document.querySelectorAll('[data-section]')];
const setActiveLink = (id) => links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
// The section that crosses this reading line owns the sidebar state. Unlike an
// intersection callback, this has no stale state when multiple sections overlap.
let scrollFrame;
function syncNavigation() {
  const readingLine = innerHeight * 0.42;
  const current = sections.find(section => {
    const bounds = section.getBoundingClientRect();
    return bounds.top <= readingLine && bounds.bottom > readingLine;
  }) || sections.at(-1);
  setActiveLink(current.dataset.section);
}
function requestNavigationSync() {
  cancelAnimationFrame(scrollFrame);
  scrollFrame = requestAnimationFrame(syncNavigation);
}
addEventListener('scroll', requestNavigationSync, { passive: true });
addEventListener('resize', requestNavigationSync);
addEventListener('hashchange', requestNavigationSync);
requestNavigationSync();

const reveal = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); reveal.unobserve(entry.target); } }), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => reveal.observe(el));

const menu = document.querySelector('.menu-toggle');
menu.addEventListener('click', () => { const open = document.body.classList.toggle('menu-open'); menu.setAttribute('aria-expanded', open); });
links.forEach(link => link.addEventListener('click', () => {
  // Provide immediate feedback; the intersection observer keeps it in sync while scrolling.
  setActiveLink(link.hash.slice(1));
  document.body.classList.remove('menu-open');
}));

// Lazy import only once a converted GLB is present and its viewer approaches the viewport.
const modelObserver = new IntersectionObserver(async entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    modelObserver.unobserve(entry.target);
    const url = entry.target.dataset.model;
    try { await mountViewer(entry.target, url); } catch (_) { /* The designed fallback remains visible if a model cannot load. */ }
  }
}, { rootMargin: '300px' });
document.querySelectorAll('.model-view').forEach(view => modelObserver.observe(view));

async function mountViewer(container, url) {
  const [{ Scene, PerspectiveCamera, WebGLRenderer, HemisphereLight, DirectionalLight, Box3, Vector3 }, { OrbitControls }, { GLTFLoader }] = await Promise.all([
    import('three'),
    import('three/addons/controls/OrbitControls.js'),
    import('three/addons/loaders/GLTFLoader.js')
  ]);
  const scene = new Scene(); const camera = new PerspectiveCamera(38, 1, .1, 1000);
  const renderer = new WebGLRenderer({ antialias: true, alpha: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  scene.add(new HemisphereLight(0xffffff, 0x171717, 2)); const key = new DirectionalLight(0xffe9e9, 3); key.position.set(3, 4, 4); scene.add(key);
  const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.autoRotate = !matchMedia('(prefers-reduced-motion: reduce)').matches; controls.autoRotateSpeed = .55;
  controls.addEventListener('start', () => controls.autoRotate = false);
  const gltf = await new GLTFLoader().loadAsync(url);
  const model = gltf.scene;
  // The CAD source is Z-up. Three.js renders in Y-up, so rotate the asset once
  // rather than changing the camera coordinate system used by OrbitControls.
  model.rotation.x = -Math.PI / 2;
  const box = new Box3().setFromObject(model); const center = box.getCenter(new Vector3()); const size = box.getSize(new Vector3()).length() || 1;
  model.position.sub(center); camera.position.set(size * 1.25, size * .9, size * 1.05); controls.target.set(0, 0, 0); controls.update(); scene.add(model);
  container.replaceChildren(renderer.domElement);
  const draw = () => { const { width, height } = container.getBoundingClientRect(); if (renderer.domElement.width !== width * renderer.getPixelRatio()) { renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); } controls.update(); renderer.render(scene, camera); requestAnimationFrame(draw); }; draw();
}
