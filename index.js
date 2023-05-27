const Main = (function () {
    const searchBox = document.getElementById('search');
    const searchList = document.getElementById('search-results-list');
    let searchResults = [];
    const SEARCH_TEXT_LIMIT = 2;

    function renderSearchResults() {
        // If data is empty warn the user
        if (!searchResults || searchResults.length === 0) {
            searchList.innerHTML = '<li class="no-results">No results found!</li>';
            return;
        }

        const favSuperHeroes = Common.getFavouriteSuperheroes();
        searchList.innerHTML = '';

        // Append each search result in the list
        searchResults.forEach((element) => {
            const li = document.createElement('li');
            // Find if superhero exists in favourites
            const indexOfSuperHeroInFavourites = favSuperHeroes.findIndex(
                (hero) => hero.id === element.id
            );
            li.classList.add('search-result');
            li.innerHTML = `
                    <div class="search-left">
                      <img src="${element.thumbnail.path}/portrait_incredible.${element.thumbnail.extension}" alt="" />
                    </div>
                    <div class="search-right">
                      <a href="superhero.html?id=${element.name}">
                        <div class="name">${element.name}</div>
                      </a>
                      <div class="full-name">${element.description}</div>
                      <button class="btn add-to-fav" data-id=${element.id
                } style="display: ${indexOfSuperHeroInFavourites === -1 ? 'block' : 'none'
                }">Add to favourites</button>
                      <button class="btn remove-from-fav" data-id=${element.id
                }  style="display: ${indexOfSuperHeroInFavourites === -1 ? 'none' : 'block'
                }">Remove from favourites</button>
                    </div>
                  `;
            searchList.appendChild(li);
        });
    }

    /* Remove all search results from the UI */
    function emptySearchResults() {
        searchList.innerHTML = '';
        searchResults = [];
    }

    /* Handle search key down event and make an API all */
    async function handleSearch(e) {
        const searchTerm = e.target.value;
        const url = Common.apiUrl;

        if (searchTerm.length <= SEARCH_TEXT_LIMIT) {
            emptySearchResults();
            return;
        }

        // Show loader and remove existing search results
        Common.showLoader();
        emptySearchResults();

        try {
            const { data, success } = await Common.apiRequest(`${url}&nameStartsWith=${searchTerm}`);
            Common.hideLoader();
            if (success) {
                searchResults = data.data.results;
                renderSearchResults();
            }
        } catch (error) {
            console.log('error', error);
            Common.hideLoader();
        }
    }

    /* Handle user clicks (anywhere in the document) */
    function handleDocumentClick(e) {
        const target = e.target;

        if (target.classList.contains('add-to-fav')) {
            // Find the hero data and store it in favourites and localstorage
            const searchResultClickedId = target.dataset.id;
            console.log(searchResultClickedId, searchResults)
            const hero = searchResults.filter(
                (hero) => hero.id.toString() === searchResultClickedId
            );
            Common.addHeroToFavourites(hero[0]);
            renderSearchResults();
        } else if (target.classList.contains('remove-from-fav')) {
            // Find the hero data and remove from local storage
            const searchResultClickedId = target.dataset.id;

            // Show add to fav button and hide the remove from fav button
            const addToFavBtn = document.querySelector(
                `button[data-id="${searchResultClickedId}"].add-to-fav`
            );
            if (addToFavBtn) addToFavBtn.style.display = 'block';

            const removeFromFavBtn = document.querySelector(
                `button[data-id="${searchResultClickedId}"].remove-from-fav`
            );
            if (removeFromFavBtn) removeFromFavBtn.style.display = 'none';

            Common.removeHeroFromFavourites(searchResultClickedId);
        }
    }

    function init() {

        searchBox.addEventListener('keyup', Common.debounce(handleSearch, 500));
        document.addEventListener('click', handleDocumentClick);
    }

    return {
        init
    };
})();