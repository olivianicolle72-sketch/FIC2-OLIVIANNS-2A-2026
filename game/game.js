const playButton = document.getElementById("play");
const voltaButton = document.getElementById("Volta");
const wrapper = document.getElementById("game-wrapper");
const luaLinha = document.getElementById("lua-linha");

// Iniciar o jogo
playButton.addEventListener("click", () => {
    wrapper.classList.add("sumir");
    document.body.classList.add("jogo"); // Ativa o novo fundo e as animações
    
    setTimeout(() => {
        luaLinha.classList.add("expandir-linha");
    }, 400);
});

// Botão Voltar
voltaButton.addEventListener("click", () => {
    // Se o jogo JÁ começou, ele limpa a tela, desfaz o fundo novo e volta para o menu inicial
    if (document.body.classList.contains("jogo")) {
        luaLinha.classList.remove("expandir-linha");
        document.body.classList.remove("jogo");
        wrapper.classList.remove("sumir");
    } else {
        // Se o jogo NÃO começou, ele redireciona para a página da ficha
        window.location.href = "http://127.0.0.1:5500/crud/index.html"; 
    }
});


