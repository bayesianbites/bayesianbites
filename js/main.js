let allReviews = [];

document.addEventListener('DOMContentLoaded', () => {

    const header = document.querySelector('header');
    const menuToggle = document.querySelector('.menu-toggle');

    menuToggle.addEventListener('click', () => {
        header.classList.toggle('expanded');
    });

    const contactButton = document.getElementById('contact-button');
    contactButton.addEventListener('click', showContactInfo);
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!header.contains(e.target) && header.classList.contains('expanded')) {
            header.classList.remove('expanded');
        }
    });

    // Close menu when scrolling
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop) {
            header.classList.remove('expanded');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, false);




    const homeLink = document.getElementById('home-link');
    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.classList.remove('hide-landing');
        displayAllReviews();
    });

    fetchReviews()
        .then(() => {
            updateDropdowns();
            displayAllReviews();
        })
        .catch(error => console.error('Error:', error));

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    searchInput = document.getElementById('search-input');
    searchButton = document.getElementById('search-button');

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
});

async function fetchReviews() {
    try {
        const response = await fetch('reviews/index.json');
        const reviewsMetadata = await response.json();
        allReviews = reviewsMetadata;
    } catch (error) {
        console.error('Error fetching reviews:', error);
    }
}

function showContactInfo(e) {
    e.preventDefault();
    const email = 'bayesianbites@yahoo.com'; // Replace with your actual email
    alert(`Contact us at: ${email}`);
    // Alternatively, you can use: window.location.href = `mailto:${email}`;
}

function performSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm) {
        const searchResults = allReviews.filter(review => 
            review.title.toLowerCase().includes(searchTerm) ||
            review.restaurant.toLowerCase().includes(searchTerm)
        );
        displaySearchResults(searchResults, searchTerm);
    }
}

function displaySearchResults(results, searchTerm) {
    document.body.classList.add('hide-landing');
    const container = document.getElementById('reviews-container');
    container.innerHTML = '';

    if (results.length === 0) {
        container.innerHTML = `<p>No results found for "${searchTerm}".</p>`;
        return;
    }

    const resultsHeader = document.createElement('h2');
    resultsHeader.textContent = `Search results for "${searchTerm}":`;
    container.appendChild(resultsHeader);

    results.forEach(review => {
        const reviewElement = createReviewElement(review);
        container.appendChild(reviewElement);
    });
}



function updateDropdowns() {
    const cuisines = [...new Set(allReviews.map(review => review.cuisine))];
    const cities = [...new Set(allReviews.map(review => review.city))];

    populateDropdown('cuisine-dropdown', cuisines, 'cuisine');
    populateDropdown('city-dropdown', cities, 'city');
}

function populateDropdown(id, items, filterType) {
    const dropdown = document.getElementById(id);
    dropdown.innerHTML = '';
    items.forEach(item => {
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = item;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            displayFilteredReviews(filterType, item);
        });
        dropdown.appendChild(link);
    });
}

function displayAllReviews() {
    document.body.classList.remove('hide-landing');
    displayReviews(allReviews);
}

function displayFilteredReviews(filterType, filterValue) {
    document.body.classList.add('hide-landing');
    const filteredReviews = allReviews.filter(review => review[filterType] === filterValue);
    displayReviews(filteredReviews);
}

function displayReviews(reviews) {
    const container = document.getElementById('reviews-container');
    container.innerHTML = '';
    reviews.forEach(review => {
        const reviewElement = createReviewElement(review);
        container.appendChild(reviewElement);
    });
}

function createReviewElement(review) {
    const article = document.createElement('article');
    article.classList.add('review');
    article.innerHTML = `
        <h2>${review.title}</h2>
        <p class="review-meta">By ${review.author} | ${formatDate(review.date)}</p>
        <p><strong>Restaurant:</strong> ${review.restaurant}</p>
        <div class="star-rating">${createStarRating(review.rating)}</div>
        <p><strong>Cuisine:</strong> ${review.cuisine}</p>
        <p><strong>Location:</strong> ${review.city}</p>
        <div class="tags">
            ${review.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <img src="images/${review.image}" alt="${review.title}" class="review-image" loading="lazy">
        <button class="load-review" data-id="${review.id}">Read Full Review</button>
    `;
    article.querySelector('.load-review').addEventListener('click', () => loadFullReview(review.id));
    return article;
}

function createStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return `${'<span class="star full-star">★</span>'.repeat(fullStars)}${halfStar ? '<span class="star half-star">★</span>' : ''}${'<span class="star empty-star">☆</span>'.repeat(emptyStars)}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

async function loadFullReview(id) {
    try {
        const contentResponse = await fetch(`reviews/${id}.md`);
        const content = await contentResponse.text();
        const review = allReviews.find(review => review.id === id);

        const carouselImages = extractCarouselImages(content);
        const cleanedContent = removeImageMarkdown(content);

        const fullReviewOverlay = document.createElement('div');
        fullReviewOverlay.classList.add('full-review');

        fullReviewOverlay.innerHTML = `
            <div class="review-header" style="background-image: url('images/${review.image}')">
                <h2>${review.title}</h2>
                <div class="star-rating">${createStarRating(review.rating)}</div>
                <p class="review-meta">By ${review.author} | ${formatDate(review.date)}</p>
            </div>
            <button class="close-review">Close</button>
            <div class="review-content">${marked.parse(cleanedContent)}</div>
            ${createCarouselHTML(carouselImages)}
        `;

        fullReviewOverlay.querySelector('.close-review').addEventListener('click', () => {
            document.body.removeChild(fullReviewOverlay);
        });

        document.body.appendChild(fullReviewOverlay);
        initCarousel();
    } catch (error) {
        console.error('Error loading full review:', error);
    }
}

function extractCarouselImages(content) {
    const regex = /!\[.*?\]\((.*?)\)/g;
    let matches;
    const imagePaths = [];
    while ((matches = regex.exec(content)) !== null) {
        imagePaths.push(matches[1]);
    }
    return imagePaths;
}

function removeImageMarkdown(content) {
    return content.replace(/!\[.*?\]\(.*?\)/g, '');
}

function createCarouselHTML(imagePaths) {
    if (imagePaths.length === 0) return '';
    
    return `
        <div class="carousel-container">
            <div class="carousel">
                ${imagePaths.map(path => `
                    <div class="carousel-item">
                        <img src="${path}" alt="Review Image">
                    </div>
                `).join('')}
            </div>
            <button class="carousel-button prev" onclick="scrollCarousel(-1)">❮</button>
            <button class="carousel-button next" onclick="scrollCarousel(1)">❯</button>
        </div>
    `;
}

function initCarousel() {
    const carousel = document.querySelector('.carousel');
    if (carousel) {
        const prevButton = document.querySelector('.carousel-button.prev');
        const nextButton = document.querySelector('.carousel-button.next');

        prevButton.style.display = 'none';

        carousel.addEventListener('scroll', () => {
            prevButton.style.display = carousel.scrollLeft > 0 ? 'block' : 'none';
            nextButton.style.display = carousel.scrollLeft < (carousel.scrollWidth - carousel.clientWidth) ? 'block' : 'none';
        });
    }
}

function scrollCarousel(direction) {
    const carousel = document.querySelector('.carousel');
    const scrollAmount = 300 * direction;
    carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}