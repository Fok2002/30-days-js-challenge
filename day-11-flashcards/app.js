const flashcards = document.querySelectorAll('.flashcard');

function toggleFlip(card) {
  card.classList.toggle('is-flipped');
}

flashcards.forEach((card) => {
  card.addEventListener('click', () => toggleFlip(card));
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleFlip(card);
    }
  });
});
