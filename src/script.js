const pokeContainer = document.querySelector('#pokeContainer');
const pokemonCount = 1350;
const itemsPerPage = 50;
let currentPage = 1;
let allPokemons = [];
let filteredPokemons = [];
const totalPages = Math.ceil(pokemonCount / itemsPerPage);

const colors = {
    fire: '#FDDFDF',
    grass: '#DEFDE0',
    electric: '#FCF7DE',
    water: '#DEF3FD',
    ground: '#f4e7da',
    rock: '#d5d5d4',
    fairy: '#fceaff',
    poison: '#98d7a5',
    bug: '#f8d5a3',
    dragon: '#97b3e6',
    psychic: '#eaeda1',
    flying: '#F5F5F5',
    fighting: '#E6E0D4',
    normal: '#F5F5F5'
};


const mainTypes = Object.keys(colors);




const showLoading = (isLoading) => {
    const loadingElement = document.getElementById('loading');
    if (!loadingElement) return;
    
    if (isLoading) {
        loadingElement.style.display = 'block';
        pokeContainer.style.opacity = '0.5';
    } else {
        loadingElement.style.display = 'none';
        pokeContainer.style.opacity = '1';
    }
};


const fetchPokemons = async () => {
    showLoading(true);
    
    try {
        // Se ainda não carregamos todos os pokémons, carregamos
        if (allPokemons.length === 0) {
            const pokemonPromises = [];
            for (let i = 1; i <= pokemonCount; i++) {
                pokemonPromises.push(
                    fetch(`https://pokeapi.co/api/v2/pokemon/${i}`)
                        .then(res => res.json())
                        .catch(() => null) // Ignora erros de requisição
                );
            }
            
            const results = await Promise.all(pokemonPromises);
            allPokemons = results.filter(pokemon => pokemon !== null);
            filteredPokemons = [...allPokemons];
        }
        
        // Mostra os pokémons da página atual
        displayPokemons();
    } catch (error) {
        console.error('Erro ao carregar pokémons:', error);
    } finally {
        showLoading(false);
    }
};

const displayPokemons = () => {
    clearContainer();
    
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const pokemonsToShow = filteredPokemons.slice(startIdx, endIdx);
    
    if (pokemonsToShow.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = 'Nenhum Pokémon encontrado. Tente outro termo de busca.';
        pokeContainer.appendChild(noResults);
    } else {
        pokemonsToShow.forEach(pokemon => {
            createPokemonCard(pokemon);
        });
    }
    
    createPagination();
};

searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredPokemons = [...allPokemons];
    } else {
        filteredPokemons = allPokemons.filter(pokemon => 
            pokemon.name.toLowerCase().includes(searchTerm) ||
            pokemon.id.toString() === searchTerm
        );
    }
    
    currentPage = 1;
    displayPokemons();
});

const clearContainer = () => {
    while (pokeContainer.firstChild) {
        pokeContainer.removeChild(pokeContainer.firstChild);
    }
};


const createPagination = () => {
    const pagination = document.createElement('div');
    pagination.className = 'pagination';
    
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Anterior';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchPokemons();
            window.scrollTo(0, 0);
        }
    });
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Próximo';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchPokemons();
            window.scrollTo(0, 0);
        }
    });
    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    // Limpa os controles antigos
    const oldPagination = document.querySelector('.pagination');
    if (oldPagination) {
        oldPagination.remove();
    }
    // Adiciona os novos controles
    pagination.appendChild(prevButton);
    pagination.appendChild(pageInfo);
    pagination.appendChild(nextButton);
    
    // Adiciona os controles após o container de pokémons
    pokeContainer.parentNode.insertBefore(pagination, pokeContainer.nextSibling);
};

const getPokemons = async (id) => {
    const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
    const res = await fetch(url);
    const data = await res.json();
    createPokemonCard(data);
};

const createPokemonCard = (poke) => {
    const card = document.createElement('div');
    card.classList.add('pokemon');

    const name = poke.name[0].toUpperCase() + poke.name.slice(1);
    const id = poke.id.toString().padStart(3, '0');

    const pokeTypes = poke.types.map(type => type.type.name);
    const type = mainTypes.find(type => pokeTypes.indexOf(type) > -1);
    const color = colors[type];

    card.style.backgroundColor = color;

    const pokemonInnerHTML = `
        <div class="imgContainer">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.id}.png" alt="${name}">
        </div>
        <div class="info">
            <span class="number">#${id}</span>
            <h3 class="name">${name}</h3>
            <small class="type">Type: <span>${type}</span></small>
        </div>
    `;
    
    card.innerHTML = pokemonInnerHTML;

    
    pokeContainer.appendChild(card);
};

fetchPokemons();
