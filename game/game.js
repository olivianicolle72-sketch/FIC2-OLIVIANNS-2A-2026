const playButton = document.getElementById('play');
const wrapper = document.getElementById('game-wrapper');
const luaLinha = document.getElementById('lua-linha');

playButton.addEventListener('click', function() {
    wrapper.classList.add('sumir');

    setTimeout(function() {
        luaLinha.classList.add('expandir-linha');
    }, 200);
});
