document.addEventListener('DOMContentLoaded', () => {
    const image = document.getElementById('image');
    const newContentButton = document.getElementById('new-content-button');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const loader = document.querySelector('.loader');
    const errorMessage = document.getElementById('error-message');
    const apiSelect = document.getElementById('api-select');
    const likeButton = document.getElementById('like-button');
    const viewFavoritesButton = document.getElementById('view-favorites-button');
    const favoritesModal = document.getElementById('favorites-modal');
    const closeButton = document.querySelector('.close-button');
    const favoritesGallery = document.getElementById('favorites-gallery');
    const clearFavoritesButton = document.getElementById('clear-favorites-button');
    const shareButton = document.getElementById('share-button');
    const toast = document.getElementById('toast');
    const infoContainer = document.getElementById('info-container');
    const cataasContainer = document.getElementById('cataas-container');
    const cataasText = document.getElementById('cataas-text');
    const cataasButton = document.getElementById('cataas-button');

    const apis = {
        dog: { url: 'https://random.dog/woof.json', key: 'url', type: 'image' },
        cat: { url: 'https://aws.random.cat/meow', key: 'file', type: 'image' },
        fox: { url: 'https://randomfox.ca/floof/', key: 'image', type: 'image' },
        pokemon: { url: 'https://pokeapi.co/api/v2/pokemon/', type: 'pokemon' },
        meal: { url: 'https://www.themealdb.com/api/json/v1/1/random.php', type: 'meal' },
        cataas: { url: 'https://cataas.com/cat/says/', type: 'cataas' },
        art: { url: 'https://api.artic.edu/api/v1/artworks', type: 'art' }
    };

    let history = [];
    let currentIndex = -1;
    let favorites = JSON.parse(localStorage.getItem('animalFavorites')) || [];

    const updateButtons = () => {
        prevButton.disabled = currentIndex <= 0;
        nextButton.disabled = currentIndex >= history.length - 1;
    };

    const showContent = (url, name = '') => {
        loader.classList.add('hidden');
        errorMessage.classList.add('hidden');
        image.src = url;
        image.classList.remove('hidden');
        infoContainer.textContent = name;
    };

    const getContent = async (apiName) => {
        loader.classList.remove('hidden');
        image.classList.add('hidden');
        infoContainer.textContent = '';
        errorMessage.classList.add('hidden');

        try {
            const api = apis[apiName];
            let imageUrl, name;

            if (api.type === 'image') {
                const response = await fetch(api.url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                imageUrl = data[api.key];
            } else if (api.type === 'pokemon') {
                const randomId = Math.floor(Math.random() * 898) + 1;
                const response = await fetch(`${api.url}${randomId}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                imageUrl = data.sprites.front_default;
                name = data.name.charAt(0).toUpperCase() + data.name.slice(1);
            } else if (api.type === 'meal') {
                const response = await fetch(api.url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                const meal = data.meals[0];
                imageUrl = meal.strMealThumb;
                name = meal.strMeal;
            } else if (api.type === 'cataas') {
                const text = cataasText.value || 'Hello';
                imageUrl = `${api.url}${encodeURIComponent(text)}?${new Date().getTime()}`;
            } else if (api.type === 'art') {
                const randomPage = Math.floor(Math.random() * 1000) + 1;
                const response = await fetch(`${api.url}?page=${randomPage}&limit=1`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                const artwork = data.data[0];
                imageUrl = `https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`;
                name = artwork.title;
            }

            if (history[currentIndex]?.url !== imageUrl) {
                history = history.slice(0, currentIndex + 1);
                history.push({ url: imageUrl, name: name });
                currentIndex++;
            }
            
            showContent(imageUrl, name);
            updateButtons();
        } catch (error) {
            console.error(`Error fetching new ${apiName}:`, error);
            errorMessage.textContent = `Sorry, we could not fetch new content. Please try again!`;
            errorMessage.classList.remove('hidden');
            loader.classList.add('hidden');
        }
    };

    const showToast = (message) => {
        toast.textContent = message;
        toast.className = 'toast show';
        setTimeout(function(){ toast.className = toast.className.replace('show', ''); }, 3000);
    }

    image.addEventListener('load', () => {
        loader.classList.add('hidden');
        image.classList.remove('hidden');
    });
    
    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            const item = history[currentIndex];
            showContent(item.url, item.name);
            updateButtons();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentIndex < history.length - 1) {
            currentIndex++;
            const item = history[currentIndex];
            showContent(item.url, item.name);
            updateButtons();
        }
    });

    newContentButton.addEventListener('click', () => {
        const selectedApi = apiSelect.value;
        getContent(selectedApi);
    });

    apiSelect.addEventListener('change', () => {
        const selectedApi = apiSelect.value;
        if (selectedApi === 'cataas') {
            cataasContainer.classList.remove('hidden');
        } else {
            cataasContainer.classList.add('hidden');
        }
        getContent(selectedApi);
    });

    cataasButton.addEventListener('click', () => {
        getContent('cataas');
    });

    likeButton.addEventListener('click', () => {
        const currentImage = image.src;
        if (currentImage && !favorites.includes(currentImage)) {
            favorites.push(currentImage);
            localStorage.setItem('animalFavorites', JSON.stringify(favorites));
            showToast('Added to favorites!');
        } else if (favorites.includes(currentImage)) {
            showToast('This image is already in your favorites.');
        }
    });

    const openFavoritesModal = () => {
        favoritesGallery.innerHTML = '';
        if (favorites.length === 0) {
            favoritesGallery.innerHTML = '<p>You have no favorite images yet.</p>';
        } else {
            favorites.forEach(url => {
                const img = document.createElement('img');
                img.src = url;
                img.loading = 'lazy';
                favoritesGallery.appendChild(img);
            });
        }
        favoritesModal.classList.remove('hidden');
    };

    const closeFavoritesModal = () => {
        favoritesModal.classList.add('hidden');
    };

    viewFavoritesButton.addEventListener('click', openFavoritesModal);
    closeButton.addEventListener('click', closeFavoritesModal);
    window.addEventListener('click', (event) => {
        if (event.target == favoritesModal) {
            closeFavoritesModal();
        }
    });

    clearFavoritesButton.addEventListener('click', () => {
        favorites = [];
        localStorage.removeItem('animalFavorites');
        favoritesGallery.innerHTML = '<p>You have no favorite images yet.</p>';
    });

    shareButton.addEventListener('click', () => {
        const imageUrl = image.src;
        if (imageUrl) {
            const text = `Check out this cool content!`;
            const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(imageUrl)}&text=${encodeURIComponent(text)}`;
            window.open(twitterUrl, '_blank');
        }
    });

    // Load initial content
    getContent(apiSelect.value);
});