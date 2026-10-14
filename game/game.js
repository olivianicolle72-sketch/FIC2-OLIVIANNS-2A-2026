
const playButton = document.getElementById("play");
const voltaButton = document.getElementById("Volta");
const wrapper = document.getElementById("game-wrapper");
const luaLinha = document.getElementById("lua-linha");

const jogadorNome = document.getElementById("jogador-nome");
const jogadorNickname = document.getElementById("jogador-nickname");
const personagem = document.getElementById("personagem");

const vidasElementos = document.querySelectorAll(".vida");
const areaObstaculos = document.getElementById("area-obstaculos");
const telaImpacto = document.getElementById("tela-impacto");
const gameOver = document.getElementById("game-over");
const reiniciarButton = document.getElementById("reiniciar");

// Imagens dos personagens
const imagensAstronauta = {
    Feminino: "/img%20Jogo/person/astroF.png",
    Neutro: "/img%20Jogo/person/astroGN.png",
    Masculino: "/img%20Jogo/person/AstroM.png"
};

// Imagens dos obstáculos
const imagensObstaculos = {
    meteoro: "/img%20Jogo/metoro.png",
    alien: "/img%20Jogo/decoration/ALIEEEn.png",
    estrela: "/img%20Jogo/estrela.png"
};

// Configurações do jogo
const CONFIG = {
    vidasIniciais: 3,
    alturaPulo: 125,
    duracaoPulo: 650,
    velocidadeInicial: 310,
    intervaloObstaculos: 1800,
    tempoReinicio: 800
};

let vidas = CONFIG.vidasIniciais;
let jogador = null;

let jogoAtivo = false;
let gameEncerrado = false;
let emRecuperacao = false;

let alturaAtual = 0;
let velocidadeVertical = 0;
let quantidadePulos = 0;

let obstaculos = [];
let indiceSequencia = 0;

let ultimoTempo = 0;
let tempoSpawn = 0;
let proximoObstaculo = null;
let animacaoId = null;
let temporizadorSpawn = null;
let temporizadorImpacto = null;

// A sequência garante dois aliens consecutivos
// antes da estrela surpresa.
const sequenciaObstaculos = [
    "meteoro",
    "alien",
    "alien",
    "estrela"
];

// Carrega os dados salvos pelo CRUD
function carregarJogador() {
    try {
        const dados = localStorage.getItem("jogadorAtual");

        if (!dados) {
            return null;
        }

        return JSON.parse(dados);
    } catch (erro) {
        console.error("Erro ao carregar jogador:", erro);
        return null;
    }
}

// Mostra o nome, o nick e o personagem
function mostrarAstronauta() {
    jogador = carregarJogador();

    if (!jogador) {
        alert(
            "Nenhum astronauta encontrado. Volte ao cadastro e salve seu personagem."
        );

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

// Atualiza as três vidas
function atualizarVidas() {
    vidasElementos.forEach(function (vida, indice) {
        const continuaViva = indice < vidas;

        vida.classList.toggle("perdida", !continuaViva);
        vida.alt = continuaViva
            ? "Vida disponível"
            : "Vida perdida";
    });

    document.getElementById("vidas").setAttribute(
        "aria-label",
        vidas + (vidas === 1 ? " vida restante" : " vidas restantes")
    );
}

// Prepara o personagem para um novo jogo
function prepararPersonagem() {
    alturaAtual = 0;
    velocidadeVertical = 0;
    quantidadePulos = 0;

    personagem.style.transform = "translateY(0)";
}

// Executa um salto.
// É possível saltar até três vezes antes de tocar no chão.
function pular() {
    if (!jogoAtivo || gameEncerrado || emRecuperacao) {
        return;
    }

    if (quantidadePulos >= 3) {
        return;
    }

    quantidadePulos++;

    // O salto seguinte eleva mais o personagem.
    alturaAtual = CONFIG.alturaPulo * quantidadePulos;

    // O tempo de retorno é calculado pela altura atingida.
    velocidadeVertical = alturaAtual / (CONFIG.duracaoPulo * quantidadePulos / 1000);

    // Animação visual do salto.
    personagem.style.transition = "transform 0.16s ease-out";
    personagem.style.transform =
        "translateY(-" + alturaAtual + "px)";

    // Retira a transição para o movimento de descida.
    setTimeout(function () {
        if (jogoAtivo && !gameEncerrado) {
            personagem.style.transition = "transform 0.3s ease-in";
        }
    }, 160);
}

// Retorna o personagem ao chão
function voltarAoChao() {
    personagem.style.transition =
        "transform 0.3s ease-in";

    personagem.style.transform = "translateY(0)";

    alturaAtual = 0;
    velocidadeVertical = 0;
    quantidadePulos = 0;
}

// Cria um obstáculo na lateral direita
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
        console.error(
            "Não foi possível carregar o obstáculo:",
            imagem.src
        );
    };

    areaObstaculos.appendChild(imagem);

    obstaculos.push({
        elemento: imagem,
        tipo: tipo,
        x: window.innerWidth + 20,
        atingido: false
    });
}

// Escolhe o próximo obstáculo na sequência
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

// Verifica se dois elementos se encostam
function colidiu(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect();
    const b = elementoB.getBoundingClientRect();

    // Margem pequena para tornar a colisão menos injusta.
    const margem = 12;

    return (
        a.left + margem < b.right - margem &&
        a.right - margem > b.left + margem &&
        a.top + margem < b.bottom - margem &&
        a.bottom - margem > b.top + margem
    );
}

// Remove todos os obstáculos da tela
function limparObstaculos() {
    obstaculos.forEach(function (obstaculo) {
        obstaculo.elemento.remove();
    });

    obstaculos = [];
    areaObstaculos.innerHTML = "";
}

// Para os temporizadores e a animação
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

// Mostra o efeito de colisão e tira uma vida
function perderVida() {
    if (emRecuperacao || gameEncerrado || !jogoAtivo) {
        return;
    }

    emRecuperacao = true;
    vidas--;

    atualizarVidas();

    // Interrompe temporariamente os movimentos.
    if (temporizadorSpawn !== null) {
        clearTimeout(temporizadorSpawn);
        temporizadorSpawn = null;
    }

    telaImpacto.classList.remove("ativo");

    // Reinicia a animação preta.
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

    // Retoma o cenário depois da tela preta.
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

// Movimento contínuo e detecção de colisão
function atualizarJogo(tempoAtual) {
    if (!jogoAtivo || gameEncerrado || emRecuperacao) {
        animacaoId = null;
        return;
    }

    const delta = ultimoTempo
        ? Math.min((tempoAtual - ultimoTempo) / 1000, 0.04)
        : 0;

    ultimoTempo = tempoAtual;

    // Velocidade dos obstáculos
    obstaculos.forEach(function (obstaculo) {
        obstaculo.x -= CONFIG.velocidadeInicial * delta;

        obstaculo.elemento.style.left =
            obstaculo.x + "px";
    });

    // Remove os obstáculos que saíram da tela
    obstaculos = obstaculos.filter(function (obstaculo) {
        if (obstaculo.x + obstaculo.elemento.offsetWidth < 0) {
            obstaculo.elemento.remove();
            return false;
        }

        return true;
    });

    // A colisão só é verificada quando o personagem está no jogo.
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

    // O salto termina automaticamente.
    if (quantidadePulos > 0) {
        tempoSpawn += delta * 1000;

        if (tempoSpawn >= CONFIG.duracaoPulo) {
            voltarAoChao();
            tempoSpawn = 0;
        }
    }

    animacaoId = requestAnimationFrame(atualizarJogo);
}

// Inicia a animação
function iniciarMovimento() {
    ultimoTempo = 0;
    tempoSpawn = 0;

    if (animacaoId !== null) {
        cancelAnimationFrame(animacaoId);
    }

    animacaoId = requestAnimationFrame(atualizarJogo);
}

// Começa uma partida
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

// Reinicia mantendo o mesmo cadastro
function reiniciarJogo() {
    gameOver.classList.remove("visivel");
    iniciarJogo();
}

// Botão PLAY
playButton.addEventListener("click", iniciarJogo);

// Teclado: espaço ou seta para cima
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

// Toque na tela para saltar
document.addEventListener("pointerdown", function (evento) {
    if (!jogoAtivo || gameEncerrado) {
        return;
    }

    // Ignora os botões e o painel de Game Over.
    if (
        evento.target.closest("#Volta") ||
        evento.target.closest("#game-over") ||
        evento.target.closest("#jogador-info")
    ) {
        return;
    }

    pular();
});

// Botão REINICIAR
reiniciarButton.addEventListener("click", reiniciarJogo);

// Botão voltar
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

// Carrega os dados ao abrir a página
jogador = carregarJogador();

if (!jogador) {
    console.warn(
        "Nenhum jogador encontrado. Cadastre o astronauta antes de jogar."
    );
}
