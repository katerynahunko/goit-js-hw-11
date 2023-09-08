import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages } from './api';

const searchForm = document.querySelector('#search-form');
const searchInput = searchForm.querySelector('input[name="searchQuery"]');
const gallery = document.querySelector('.gallery');
const lightbox = new SimpleLightbox('.gallery a');
const perPage = 40;
let currentPage = 1;
let isFetching = false;
let searchQuery = '';
let allImageData = [];
let endOfResultsNotified = false;
let successNotification = false;

async function createMarkup() {
  if (endOfResultsNotified || isFetching) {
    return;
  }

  try {
    isFetching = true;

    const data = await fetchImages(searchQuery, currentPage);

    isFetching = false;

    if (data.hits && data.hits.length > 0) {
      data.hits.forEach(item => {
        const imageExists = allImageData.some(img => img.id === item.id);

        if (!imageExists) {
          allImageData.push(item);

          const photoCard = document.createElement('div');
          photoCard.classList.add('photo-card');

          const link = document.createElement('a');
          link.href = item.largeImageURL;
          photoCard.appendChild(link);

          const image = document.createElement('img');
          image.src = item.webformatURL;
          image.alt = item.tags;
          image.loading = 'lazy';
          link.appendChild(image);

          const info = document.createElement('div');
          info.classList.add('info');
          info.innerHTML = `
            <p class="info-item">
              <b>Likes:</b> ${item.likes}
            </p>
            <p class="info-item">
              <b>Views:</b> ${item.views}
            </p>
            <p class="info-item">
              <b>Comments:</b> ${item.comments}
            </p>
            <p class="info-item">
              <b>Downloads:</b> ${item.downloads}
            </p>
          `;

          photoCard.appendChild(info);
          gallery.appendChild(photoCard);
        }
      });

      lightbox.refresh();

      if (currentPage === 1 && !successNotification) {
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
        successNotification = true;
      }

      if (data.hits.length < perPage) {
        endOfResultsNotified = true;
        Notiflix.Notify.warning(
          "We're sorry, but you've reached the end of search results."
        );
      }

      currentPage += 1;
    } else {
      endOfResultsNotified = true;
      Notiflix.Notify.warning(
        "Sorry, there are no images matching your search query. Please try again."
      );
    }
  } catch (error) {
    console.error('Error:', error);
    Notiflix.Notify.failure('Something is wrong. Please try again later.');
  }
}

searchForm.addEventListener('submit', async event => {
  event.preventDefault();
  searchQuery = searchInput.value.trim();
  currentPage = 1;
  endOfResultsNotified = false;
  isFetching = false;
  successNotification = false;

  gallery.innerHTML = '';
  allImageData = [];

  createMarkup();
});


window.addEventListener('scroll', () => {
  const scrollHeight = document.documentElement.scrollHeight;
  const scrollTop = window.scrollY;
  const clientHeight = document.documentElement.clientHeight;

  if (!isFetching && scrollTop + clientHeight >= scrollHeight - 100) {
    createMarkup();
  }
});
