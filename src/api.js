import axios from 'axios';


const API_KEY = '39274431-d607d741389e2ed039dd0643f';
const API_URL = 'https://pixabay.com/api/';
const perPage = 40;

export async function fetchImages(searchQuery, currentPage, perPage = 40) {
  try {
    const response = await axios.get(API_URL, {
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

    return response.data;
  } catch (error) {
    throw error;
  }
}
