document.addEventListener('DOMContentLoaded', () => {
    const searchContainer = document.getElementById('search-container');
    const searchButton = document.getElementById('search-button');

    if (!searchContainer || !searchButton) return;

    if (typeof PagefindUI !== 'undefined') {
        new PagefindUI({
            element: '#pagefind-search',
            showSubResults: true,
            showImages: false,
        });
    }

    function toggleSearch() {
        const isActive = searchContainer.classList.toggle('active');
        if (isActive) {
            setTimeout(() => {
                const input = searchContainer.querySelector('input');
                if (input) input.focus();
            }, 50);
        }
    }

    searchButton.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSearch();
    });

    document.addEventListener('click', (e) => {
        if (searchContainer.classList.contains('active') &&
            !searchContainer.contains(e.target) &&
            e.target !== searchButton) {
            searchContainer.classList.remove('active');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchContainer.classList.contains('active')) {
            searchContainer.classList.remove('active');
        }
    });
});
