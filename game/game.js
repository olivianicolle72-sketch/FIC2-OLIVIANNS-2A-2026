const playButton = document.getElementById("play");
const voltaButton = document.getElementById("Volta");
const wrapper = document.getElementById("game-wrapper");
const luaLinha = document.getElementById("lua-linha");

const jogadorNome = document.getElementById("jogador-nome");
const jogadorNickname = document.getElementById("jogador-nickname");
const personagem = document.getElementById("personagem");
const personagemContainer = document.getElementById("personagem-container");

const vidasElementos = document.querySelectorAll(".vida");
const areaObstaculos = document.getElementById("area-obstaculos");
const telaImpacto = document.getElementById("tela-impacto");
const gameOver = document.getElementById("game-over");
const reiniciarButton = document.getElementById("reiniciar");

const imagensAstronauta = {
    Feminino: "/img%20Jogo/person/astroF.png",
    Neutro: "/img%20Jogo/person/astroGN.png",
    Masculino: "/img%20Jogo/person/AstroM.png"
};

const imagensObstaculos = {
    meteoro: "/img%20Jogo/metoro.png",
    alien: "/img%20Jogo/decoration/ALIEEEn.png",
    estrela: "/img%20Jogo/estrela.png"
};

const CONFIG = {
    vidasIniciais: 3,
    alturaPulo: 125,
    duracaoPulo: 850,
    velocidadeInicial: 250,
    intervaloObstaculos: 2300,
    tempoReinicio: 800
};

let vidas = CONFIG.vidasIniciais;
let jogador = null;

let jogoAtivo = false;
let gameEncerrado = false;
let emRecuperacao = false;

let alturaAtual = 0;
let quantidadePulos = 0;
let obstaculos = [];
let indiceSequencia = 0;

let ultimoTempo = 0;
let tempoPulo = 0;
let animacaoId = null;
let temporizadorSpawn = null;
let temporizadorImpacto = null;

const sequenciaObstaculos = [
    "meteoro",
    "alien",
    "alien",
    "estrela"
];

function carregarJogador() {
    try {
        const dados = localStorage.getItem("jogadorAtual");
        return dados ? JSON.parse(dados) : null;
    } catch (erro) {
        console.error("Erro ao carregar jogador:", erro);
        return null;
    }
}

function mostrarAstronauta() {
    jogador = carregarJogador();

    if (!jogador) {
        alert("Nenhum astronauta encontrado. Volte ao cadastro e salve seu personagem.");
        return false;
    }

    const imagem = imagensAstronauta[jogador.genero];

    if (!imagem) {
        alert("O gênero cadastrado não possui uma imagem correspondente.");
        return false;
    }

    jogadorNome.textContent = jogador.nome;
    jogadorNickname.textContent = jogador.nickname;

    personagem.onerror = function () {
        console.error("Erro ao carregar o personagem:", imagem);
    };

    personagem.src = imagem;
    personagem.alt = "Astronauta de " + jogador.genero;

    return true;
}

function atualizarVidas() {
    vidasElementos.forEach(function (vida, indice) {
        const continuaViva = indice < vidas;

        vida.classList.toggle("perdida", !continuaViva);
        vida.alt = continuaViva ? "Vida disponível" : "Vida perdida";
    });

    document.getElementById("vidas").setAttribute(
        "aria-label",
        vidas + (vidas === 1 ? " vida restante" : " vidas restantes")
    );
}

function prepararPersonagem() {
    alturaAtual = 0;
    quantidadePulos = 0;
    tempoPulo = 0;

    personagemContainer.style.transition = "none";
    personagemContainer.style.transform = "translateY(0)";

    void personagemContainer.offsetHeight;
}

function pular() {
    if (!jogoAtivo || gameEncerrado || emRecuperacao) {
        return;
    }

    if (quantidadePulos >= 3) {
        return;
    }

    quantidadePulos++;

    alturaAtual = CONFIG.alturaPulo * quantidadePulos;
    tempoPulo = 0;

    personagemContainer.style.transition = "transform 0.12s ease-out";
    personagemContainer.style.transform =
        "translateY(-" + alturaAtual + "px)";
}

function voltarAoChao() {
    personagemContainer.style.transition = "transform 0.3s ease-in";
    personagemContainer.style.transform = "translateY(0)";

    alturaAtual = 0;
    quantidadePulos = 0;
    tempoPulo = 0;
}

function criarObstaculo(tipo) {
    if (!jogoAtivo || gameEncerrado || emRecuperacao) {
        return;
    }

    const imagem = document.createElement("img");

    imagem.className = "obstaculo " + tipo;
    imagem.src = imagensObstaculos[tipo];
    imagem.alt = tipo;
    imagem.draggable = false;

    imagem.onerror = function () {
        console.error("Não foi possível carregar o obstáculo:", imagem.src);
    };

    areaObstaculos.appendChild(imagem);

    obstaculos.push({
        elemento: imagem,
        tipo: tipo,
        x: window.innerWidth + 20,
        atingido: false
    });
}

function agendarObstaculo() {
    if (!jogoAtivo || gameEncerrado || emRecuperacao) {
        return;
    }

    const tipo = sequenciaObstaculos[indiceSequencia];

    indiceSequencia =
        (indiceSequencia + 1) % sequenciaObstaculos.length;

    criarObstaculo(tipo);

    temporizadorSpawn = setTimeout(
        agendarObstaculo,
        CONFIG.intervaloObstaculos
    );
}

function colidiu(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect();
    const b = elementoB.getBoundingClientRect();

    const margemHorizontal = 10;
    const margemVertical = 8;

    return (
        a.right - margemHorizontal > b.left + margemHorizontal &&
        a.left + margemHorizontal < b.right - margemHorizontal &&
        a.bottom - margemVertical > b.top + margemVertical &&
        a.top + margemVertical < b.bottom - margemVertical
    );
}

function limparObstaculos() {
    obstaculos.forEach(function (obstaculo) {
        obstaculo.elemento.remove();
    });

    obstaculos = [];
    areaObstaculos.innerHTML = "";
}

function pararMovimento() {
    if (animacaoId !== null) {
        cancelAnimationFrame(animacaoId);
        animacaoId = null;
    }

    if (temporizadorSpawn !== null) {
        clearTimeout(temporizadorSpawn);
        temporizadorSpawn = null;
    }
}

function perderVida() {
    if (emRecuperacao || gameEncerrado || !jogoAtivo) {
        return;
    }

    emRecuperacao = true;
    vidas--;

    atualizarVidas();

    if (temporizadorSpawn !== null) {
        clearTimeout(temporizadorSpawn);
        temporizadorSpawn = null;
    }

    telaImpacto.classList.remove("ativo");
    void telaImpacto.offsetWidth;

    telaImpacto.classList.add("ativo");
    document.body.classList.add("tela-preta");

    limparObstaculos();
    prepararPersonagem();

    if (vidas <= 0) {
        gameEncerrado = true;
        jogoAtivo = false;

        pararMovimento();

        temporizadorImpacto = setTimeout(function () {
            gameOver.classList.add("visivel");
            telaImpacto.classList.remove("ativo");
        }, CONFIG.tempoReinicio);

        return;
    }

    temporizadorImpacto = setTimeout(function () {
        if (gameEncerrado) {
            return;
        }

        document.body.classList.remove("tela-preta");

        emRecuperacao = false;
        indiceSequencia = 0;

        iniciarMovimento();
        agendarObstaculo();
    }, CONFIG.tempoReinicio);
}

function atualizarJogo(tempoAtual) {
    if (!jogoAtivo || gameEncerrado || emRecuperacao) {
        animacaoId = null;
        return;
    }

    const delta = ultimoTempo
        ? Math.min((tempoAtual - ultimoTempo) / 1000, 0.04)
        : 0;

    ultimoTempo = tempoAtual;

    obstaculos.forEach(function (obstaculo) {
        obstaculo.x -= CONFIG.velocidadeInicial * delta;
        obstaculo.elemento.style.left = obstaculo.x + "px";
    });

    obstaculos = obstaculos.filter(function (obstaculo) {
        if (obstaculo.x + obstaculo.elemento.offsetWidth < 0) {
            obstaculo.elemento.remove();
            return false;
        }

        return true;
    });

    for (const obstaculo of obstaculos) {
        if (
            !obstaculo.atingido &&
            colidiu(personagem, obstaculo.elemento)
        ) {
            obstaculo.atingido = true;
            perderVida();
            return;
        }
    }

    if (quantidadePulos > 0) {
        tempoPulo += delta * 1000;

        if (tempoPulo >= CONFIG.duracaoPulo) {
            voltarAoChao();
        }
    }

    animacaoId = requestAnimationFrame(atualizarJogo);
}

function iniciarMovimento() {
    ultimoTempo = 0;
    tempoPulo = 0;

    if (animacaoId !== null) {
        cancelAnimationFrame(animacaoId);
    }

    animacaoId = requestAnimationFrame(atualizarJogo);
}

function iniciarJogo() {
    if (!mostrarAstronauta()) {
        return;
    }

    pararMovimento();

    if (temporizadorImpacto !== null) {
        clearTimeout(temporizadorImpacto);
        temporizadorImpacto = null;
    }

    vidas = CONFIG.vidasIniciais;
    indiceSequencia = 0;

    jogoAtivo = true;
    gameEncerrado = false;
    emRecuperacao = false;

    gameOver.classList.remove("visivel");
    telaImpacto.classList.remove("ativo");
    document.body.classList.remove("tela-preta");

    wrapper.classList.add("sumir");
    document.body.classList.add("jogo");

    atualizarVidas();
    prepararPersonagem();
    limparObstaculos();

    luaLinha.classList.add("expandir-linha");

    iniciarMovimento();
    agendarObstaculo();
}

function reiniciarJogo() {
    gameOver.classList.remove("visivel");
    iniciarJogo();
}

playButton.addEventListener("click", iniciarJogo);

document.addEventListener("keydown", function (evento) {
    if (
        evento.code === "Space" ||
        evento.code === "ArrowUp"
    ) {
        if (jogoAtivo && !gameEncerrado) {
            evento.preventDefault();
            pular();
        }
    }
});

document.addEventListener("pointerdown", function (evento) {
    if (!jogoAtivo || gameEncerrado) {
        return;
    }

    if (
        evento.target.closest("#Volta") ||
        evento.target.closest("#game-over") ||
        evento.target.closest("#jogador-info")
    ) {
        return;
    }

    pular();
});

reiniciarButton.addEventListener("click", reiniciarJogo);

voltaButton.addEventListener("click", function () {
    if (jogoAtivo || gameEncerrado) {
        jogoAtivo = false;
        gameEncerrado = false;
        emRecuperacao = false;

        pararMovimento();
        limparObstaculos();

        if (temporizadorImpacto !== null) {
            clearTimeout(temporizadorImpacto);
            temporizadorImpacto = null;
        }

        gameOver.classList.remove("visivel");
        telaImpacto.classList.remove("ativo");
        document.body.classList.remove("tela-preta");
        document.body.classList.remove("jogo");

        luaLinha.classList.remove("expandir-linha");
        wrapper.classList.remove("sumir");

        prepararPersonagem();
    } else {
        window.location.href = "/crud/index.html";
    }
});

jogador = carregarJogador();

if (!jogador) {
    console.warn("Nenhum jogador encontrado. Cadastre o astronauta antes de jogar.");
}