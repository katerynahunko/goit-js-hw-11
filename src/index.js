import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '39274431-d607d741389e2ed039dd0643f';
const URL = 'https://pixabay.com/api/';
const searchForm = document.querySelector('#search-form');
const searchInput = searchForm.querySelector('input[name="searchQuery"]');
const gallery = document.querySelector('.gallery');
const lightbox = new SimpleLightbox('.photo-card a');
const perPage = 40;
let currentPage = 1;
let isFetching = false;
let searchQuery = '';
let allImageData = [];
let endOfResultsNotified = false;

async function createMarkup() {
  if (endOfResultsNotified) {
    return;
  }

  try {
    const response = await axios.get(URL, {
      params: {
        key: API_KEY,
        q: searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: currentPage,
        per_page: perPage,
      },
    });

    const data = response.data;

    if (data.hits && data.hits.length > 0) {
      allImageData = [...allImageData, ...data.hits];

      if (currentPage === 1) {
        gallery.innerHTML = '';
      }

      allImageData.forEach(item => {
        const photoCard = document.createElement('div');
        photoCard.classList.add('photo-card');

        const image = document.createElement('img');
        image.src = item.webformatURL;
        image.alt = item.tags;

        const link = document.createElement('a');
        link.href = item.largeImageURL;
        link.appendChild(image);

        const info = document.createElement('div');
        info.classList.add('info');
        info.innerHTML = `
        <img src="" alt="" loading="lazy" />
          <div class="item-card">
              <p class="info-item">
                  <b>Likes: </b>${item.likes}
              </p>
              <p class="info-item">
                  <b>Views: </b> ${item.views}
              </p>
              <p class="info-item">
                  <b>Comments: </b> ${item.comments}
              </p>
              <p class="info-item">
                  <b>Downloads: </b>${item.downloads}
              </p>
          </div>
        `;

        photoCard.appendChild(link);
        photoCard.appendChild(info);
        gallery.appendChild(photoCard);
      });

      lightbox.refresh();

      if (currentPage === 1) {
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      }

      if (data.hits.length < perPage) {
        endOfResultsNotified = true;
        Notiflix.Notify.warning(
          "We're sorry, but you've reached the end of search results."
        );
      }

      currentPage += 1;
    } else {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
  } catch (error) {
    console.error('Error:', error);
    Notiflix.Notify.failure('Something is wrong. Please try again later.');
  }
}

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  searchQuery = searchInput.value.trim();
  allImageData = [];
  currentPage = 1;
  endOfResultsNotified = false;
  createMarkup();
});

window.addEventListener('scroll', async () => {
  const scrollHeight = document.documentElement.scrollHeight;
  const scrollTop = window.scrollY;
  const clientHeight = document.documentElement.clientHeight;

  if (!isFetching && scrollTop + clientHeight >= scrollHeight - 100) {
    isFetching = true;
    createMarkup();
    isFetching = false;
  }
});
