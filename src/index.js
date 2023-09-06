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
const perPage = 20;
let currentPage = 1;
let isLoading = false;
let searchQuery = '';
let allImageData = 0;

async function createMarkup() {
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
      
    } else {
      Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
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
  createMarkup();
});

window.addEventListener('scroll', async () => {
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const clientHeight = document.documentElement.clientHeight;

    if (!isLoading && scrollTop + clientHeight >= scrollHeight - 100) {
      isLoading = true;
      currentPage += 1
      await createMarkup();
      isLoading = false;
    }
  });
  