document.addEventListener('DOMContentLoaded', () => {
    const animalImage = document.getElementById('image');
    const newAnimalButton = document.getElementById('new-animal-button');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const loader = document.querySelector('.loader');
    const errorMessage = document.getElementById('error-message');
    const animalSelect = document.getElementById('animal-select');
    const likeButton = document.getElementById('like-button');
    const viewFavoritesButton = document.getElementById('view-favorites-button');
    const favoritesModal = document.getElementById('favorites-modal');
    const closeButton = document.querySelector('.close-button');
    const favoritesGallery = document.getElementById('favorites-gallery');
    const clearFavoritesButton = document.getElementById('clear-favorites-button');
    const shareButton = document.getElementById('share-button');

    const apis = {
        dog: { url: 'https://random.dog/woof.json', key: 'url' },
        cat: { url: 'https://aws.random.cat/meow', key: 'file' },
        fox: { url: 'https://randomfox.ca/floof/', key: 'image' }
    };

    let history = [];
    let currentIndex = -1;
    let favorites = JSON.parse(localStorage.getItem('animalFavorites')) || [];

    const updateButtons = () => {
        prevButton.disabled = currentIndex <= 0;
        nextButton.disabled = currentIndex >= history.length - 1;
    };

    const showImage = (url) => {
        loader.classList.add('hidden');
        errorMessage.classList.add('hidden');
        animalImage.src = url;
        animalImage.classList.remove('hidden');
    };

    const getNewAnimal = async (animal) => {
        loader.classList.remove('hidden');
        animalImage.classList.add('hidden');
        errorMessage.classList.add('hidden');

        try {
            const api = apis[animal];
            const response = await fetch(api.url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const imageUrl = data[api.key];

            // Add to history
            if (history[currentIndex] !== imageUrl) {
                history = history.slice(0, currentIndex + 1);
                history.push(imageUrl);
                currentIndex++;
            }
            
            showImage(imageUrl);
            updateButtons();
        } catch (error) {
            console.error(`Error fetching new ${animal}:`, error);
            errorMessage.textContent = `Sorry, we could not fetch a new ${animal}. Please try again!`;
            errorMessage.classList.remove('hidden');
            loader.classList.add('hidden');
        }
    };

    animalImage.addEventListener('load', () => {
        loader.classList.add('hidden');
        animalImage.classList.remove('hidden');
    });
    
    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            showImage(history[currentIndex]);
            updateButtons();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentIndex < history.length - 1) {
            currentIndex++;
            showImage(history[currentIndex]);
            updateButtons();
        }
    });

    newAnimalButton.addEventListener('click', () => {
        const selectedAnimal = animalSelect.value;
        getNewAnimal(selectedAnimal);
    });

    animalSelect.addEventListener('change', () => {
        const selectedAnimal = animalSelect.value;
        getNewAnimal(selectedAnimal);
    });

    likeButton.addEventListener('click', () => {
        const currentImage = animalImage.src;
        if (currentImage && !favorites.includes(currentImage)) {
            favorites.push(currentImage);
            localStorage.setItem('animalFavorites', JSON.stringify(favorites));
            alert('Added to favorites!');
        } else if (favorites.includes(currentImage)) {
            alert('This image is already in your favorites.');
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
        const imageUrl = animalImage.src;
        if (imageUrl) {
            const text = `Check out this cute animal!`;
            const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(imageUrl)}&text=${encodeURIComponent(text)}`;
            window.open(twitterUrl, '_blank');
        }
    });

    // Load an initial animal image
    getNewAnimal(animalSelect.value);
});