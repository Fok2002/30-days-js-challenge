const accordion = document.getElementById('faqAccordion');

accordion.addEventListener('click', (event) => {
  const header = event.target.closest('.accordion-header');
  if (!header) return;

  const item = header.parentElement;
  const isActive = item.classList.contains('active');
  const items = accordion.querySelectorAll('.accordion-item');

  items.forEach((accordionItem) => {
    accordionItem.classList.remove('active');
    accordionItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
  });

  if (!isActive) {
    item.classList.add('active');
    header.setAttribute('aria-expanded', 'true');
  }
});
