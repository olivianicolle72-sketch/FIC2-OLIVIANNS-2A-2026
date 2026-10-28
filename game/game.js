// =====================================================
// ELEMENTOS DO HTML
// =====================================================

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
const mensagemSteven = document.getElementById("mensagem-steven");


// =====================================================
// IMAGENS
// =====================================================

const imagensAstronauta = {
    Feminino: "/img%20Jogo/person/astroF.png",
    Neutro: "/img%20Jogo/person/astroGN.png",
    Masculino: "/img%20Jogo/person/AstroM.png"
};

const imagensObstaculos = {
    meteoro: "/img%20Jogo/decoration/metoro.png",
    alien: "/img%20Jogo/decoration/ALIEEEn.png",
    estrela: "/img%20Jogo/decoration/estrela.png"
};


// =====================================================
// CONFIGURAÇÕES DO JOGO
// =====================================================

const CONFIG = {
    vidasIniciais: 3,

    // Cada pulo acrescenta 125 px.
    alturaPorPulo: 125,

    // Tempo máximo antes de voltar ao chão.
    duracaoPulo: 850,

    // Velocidade dos obstáculos.
    velocidadeInicial: 250,

    // Intervalo entre obstáculos.
    intervaloObstaculos: 2300,

    // Tempo de recuperação depois de perder uma vida.
    tempoReinicio: 800,

    // Margens para a área horizontal de colisão.
    margemAstronautaX: 0.25,
    margemObstaculoX: 0.15,

    // Mostrar as áreas de colisão para depuração.
    debugColisao: false
};


// =====================================================
// ESTADO DO JOGO
// =====================================================

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


// =====================================================
// SEQUÊNCIA DE OBSTÁCULOS
// =====================================================

const sequenciaObstaculos = [
    "meteoro",
    "alien",
    "alien",
    "estrela"
];


// =====================================================
// REGRAS DOS OBSTÁCULOS
// =====================================================

const regrasObstaculos = {
    meteoro: {
        pulosNecessarios: 1,
        alturaNecessaria: 125
    },

    alien: {
        pulosNecessarios: 2,
        alturaNecessaria: 250
    },

    estrela: {
        pulosNecessarios: 3,
        alturaNecessaria: 375
    }
};


// =====================================================
// CARREGAR JOGADOR
// =====================================================

function carregarJogador() {
    try {
        const dados = localStorage.getItem("jogadorAtual");

        return dados ? JSON.parse(dados) : null;

    } catch (erro) {
        console.error("Erro ao carregar jogador:", erro);

        return null;
    }
}


// =====================================================
// MOSTRAR ASTRONAUTA
// =====================================================

function mostrarAstronauta() {
    jogador = carregarJogador();

    if (!jogador) {
        alert(
            "Nenhum astronauta encontrado. " +
            "Volte ao cadastro e salve seu personagem."
        );

        return false;
    }

    const imagem = imagensAstronauta[jogador.genero];

    if (!imagem) {
        alert(
            "O gênero cadastrado não possui uma imagem correspondente."
        );

        return false;
    }

    jogadorNome.textContent = jogador.nome || "Astronauta";

    jogadorNickname.textContent = jogador.nickname || "";

    personagem.onerror = function () {
        console.error(
            "Erro ao carregar o personagem:",
            personagem.src
        );
    };

    personagem.src = imagem;

    personagem.alt = "Astronauta de " + jogador.genero;

    return true;
}


// =====================================================
// ATUALIZAR VIDAS
// =====================================================

function atualizarVidas() {
    vidasElementos.forEach(function (vida, indice) {
        const continuaViva = indice < vidas;

        vida.classList.toggle(
            "perdida",
            !continuaViva
        );

        vida.alt = continuaViva
            ? "Vida disponível"
            : "Vida perdida";
    });

    const elementoVidas = document.getElementById("vidas");

    if (elementoVidas) {
        elementoVidas.setAttribute(
            "aria-label",
            vidas + (
                vidas === 1
                    ? " vida restante"
                    : " vidas restantes"
            )
        );
    }
}


// =====================================================
// PREPARAR PERSONAGEM
// =====================================================

function prepararPersonagem() {
    alturaAtual = 0;
    quantidadePulos = 0;
    tempoPulo = 0;

    personagemContainer.style.transition = "none";

    personagemContainer.style.transform = "translateY(0)";

    void personagemContainer.offsetHeight;
}


// =====================================================
// PULAR
// =====================================================

function pular() {
    if (
        !jogoAtivo ||
        gameEncerrado ||
        emRecuperacao
    ) {
        return;
    }

    // Limite de três pulos consecutivos.
    if (quantidadePulos >= 3) {
        return;
    }

    quantidadePulos++;

    alturaAtual =
        CONFIG.alturaPorPulo * quantidadePulos;

    // Cada novo pulo reinicia o tempo de permanência no ar.
    tempoPulo = 0;

    personagemContainer.style.transition =
        "transform 0.12s ease-out";

    personagemContainer.style.transform =
        "translateY(-" + alturaAtual + "px)";
}


// =====================================================
// VOLTAR AO CHÃO
// =====================================================

function voltarAoChao() {
    personagemContainer.style.transition =
        "transform 0.3s ease-in";

    personagemContainer.style.transform =
        "translateY(0)";

    alturaAtual = 0;
    quantidadePulos = 0;
    tempoPulo = 0;
}


// =====================================================
// CRIAR OBSTÁCULO
// =====================================================

function criarObstaculo(tipo) {
    if (
        !jogoAtivo ||
        gameEncerrado ||
        emRecuperacao
    ) {
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

    const regra = regrasObstaculos[tipo];

    const obstaculo = {
        elemento: imagem,

        tipo: tipo,

        x: window.innerWidth + 20,

        atingido: false,

        pulosNecessarios: regra.pulosNecessarios,

        alturaNecessaria: regra.alturaNecessaria,

        hitboxVisual: null
    };

    imagem.style.left = obstaculo.x + "px";

    obstaculos.push(obstaculo);
}


// =====================================================
// AGENDAR OBSTÁCULOS
// =====================================================

function agendarObstaculo() {
    if (
        !jogoAtivo ||
        gameEncerrado ||
        emRecuperacao
    ) {
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


// =====================================================
// OBTER ÁREA HORIZONTAL DE COLISÃO
// =====================================================

function obterHitboxHorizontal(
    elemento,
    margemHorizontal
) {
    if (
        !elemento ||
        !elemento.isConnected
    ) {
        return null;
    }

    const retangulo = elemento.getBoundingClientRect();

    if (
        retangulo.width <= 0 ||
        retangulo.height <= 0
    ) {
        return null;
    }

    const margem = retangulo.width * margemHorizontal;

    return {
        esquerda: retangulo.left + margem,

        direita: retangulo.right - margem,

        largura: retangulo.width - margem * 2
    };
}


// =====================================================
// VERIFICAR SOBREPOSIÇÃO HORIZONTAL
// =====================================================

function sobreposicaoHorizontal(elementoA, elementoB) {
    const hitboxA = obterHitboxHorizontal(
        elementoA,
        CONFIG.margemAstronautaX
    );

    const hitboxB = obterHitboxHorizontal(
        elementoB,
        CONFIG.margemObstaculoX
    );

    if (!hitboxA || !hitboxB) {
        return false;
    }

    if (
        hitboxA.largura <= 0 ||
        hitboxB.largura <= 0
    ) {
        return false;
    }

    return (
        hitboxA.direita > hitboxB.esquerda &&
        hitboxA.esquerda < hitboxB.direita
    );
}


// =====================================================
// DEBUG VISUAL DAS ÁREAS DE COLISÃO
// =====================================================

function desenharHitbox(elemento, cor) {
    if (!CONFIG.debugColisao) {
        return;
    }

    const hitbox = obterHitboxHorizontal(
        elemento,
        elemento === personagem
            ? CONFIG.margemAstronautaX
            : CONFIG.margemObstaculoX
    );

    if (!hitbox) {
        return;
    }

    const retangulo = elemento.getBoundingClientRect();

    if (!elemento._hitboxVisual) {
        const caixa = document.createElement("div");

        caixa.style.position = "fixed";

        caixa.style.pointerEvents = "none";

        caixa.style.zIndex = "99999";

        caixa.style.boxSizing = "border-box";

        document.body.appendChild(caixa);

        elemento._hitboxVisual = caixa;
    }

    const caixa = elemento._hitboxVisual;

    caixa.style.border = "2px solid " + cor;

    caixa.style.left = hitbox.esquerda + "px";

    caixa.style.top = retangulo.top + "px";

    caixa.style.width = hitbox.largura + "px";

    caixa.style.height = retangulo.height + "px";
}


function limparHitboxVisual(elemento) {
    if (
        elemento &&
        elemento._hitboxVisual
    ) {
        elemento._hitboxVisual.remove();

        delete elemento._hitboxVisual;
    }
}


// =====================================================
// LIMPAR OBSTÁCULOS
// =====================================================

function limparObstaculos() {
    obstaculos.forEach(function (obstaculo) {
        limparHitboxVisual(obstaculo.elemento);

        obstaculo.elemento.remove();
    });

    obstaculos = [];

    areaObstaculos.innerHTML = "";
}


// =====================================================
// PARAR MOVIMENTO
// =====================================================

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


// =====================================================
// PERDER VIDA
// =====================================================

function perderVida() {
    if (
        emRecuperacao ||
        gameEncerrado ||
        !jogoAtivo
    ) {
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

            temporizadorImpacto = null;

        }, CONFIG.tempoReinicio);

        return;
    }

    temporizadorImpacto = setTimeout(function () {
        temporizadorImpacto = null;

        if (
            gameEncerrado ||
            !jogoAtivo
        ) {
            return;
        }

        document.body.classList.remove("tela-preta");

        emRecuperacao = false;

        indiceSequencia = 0;

        iniciarMovimento();

        agendarObstaculo();

    }, CONFIG.tempoReinicio);
}


// =====================================================
// VERIFICAR SE O ASTRONAUTA CONSEGUE DESVIAR
// =====================================================

function conseguiuDesviar(obstaculo) {
    /*
     * A altura alcançada é comparada com a altura
     * exigida pelo obstáculo.
     *
     * Meteoro: 125 px.
     * Alien: 250 px.
     * Estrela: 375 px.
     */

    return (
        alturaAtual >= obstaculo.alturaNecessaria
    );
}


// =====================================================
// ATUALIZAR JOGO
// =====================================================

function atualizarJogo(tempoAtual) {
    if (
        !jogoAtivo ||
        gameEncerrado ||
        emRecuperacao
    ) {
        animacaoId = null;

        return;
    }

    const delta = ultimoTempo
        ? Math.min(
            (tempoAtual - ultimoTempo) / 1000,
            0.04
        )
        : 0;

    ultimoTempo = tempoAtual;


    // -----------------------------------------------
    // MOVIMENTAR OBSTÁCULOS
    // -----------------------------------------------

    obstaculos.forEach(function (obstaculo) {
        obstaculo.x -=
            CONFIG.velocidadeInicial * delta;

        obstaculo.elemento.style.left =
            obstaculo.x + "px";
    });


    // -----------------------------------------------
    // REMOVER OBSTÁCULOS QUE SAÍRAM DA TELA
    // -----------------------------------------------

    obstaculos = obstaculos.filter(function (obstaculo) {
        if (
            obstaculo.x +
            obstaculo.elemento.offsetWidth < 0
        ) {
            limparHitboxVisual(obstaculo.elemento);

            obstaculo.elemento.remove();

            return false;
        }

        return true;
    });


    // -----------------------------------------------
    // VERIFICAR COLISÕES
    // -----------------------------------------------

    for (const obstaculo of obstaculos) {
        if (obstaculo.atingido) {
            continue;
        }

        if (
            !personagem.isConnected ||
            !obstaculo.elemento.isConnected
        ) {
            continue;
        }

        /*
         * Primeiro verificamos se o astronauta
         * está horizontalmente alinhado ao obstáculo.
         *
         * Isso evita perder vidas quando o obstáculo
         * ainda está distante.
         */

        const estaAlinhado = sobreposicaoHorizontal(
            personagem,
            obstaculo.elemento
        );

        desenharHitbox(personagem, "lime");

        desenharHitbox(obstaculo.elemento, "red");

        if (!estaAlinhado) {
            continue;
        }

        /*
         * Se o astronauta alcançou a altura exigida,
         * consegue desviar do obstáculo.
         *
         * Se não alcançou, perde uma vida.
         */

        if (conseguiuDesviar(obstaculo)) {
            continue;
        }

        obstaculo.atingido = true;

        perderVida();

        return;
    }


    // -----------------------------------------------
    // CONTROLAR O TEMPO DO PULO
    // -----------------------------------------------

    if (quantidadePulos > 0) {
        tempoPulo += delta * 1000;

        if (tempoPulo >= CONFIG.duracaoPulo) {
            voltarAoChao();
        }
    }


    // -----------------------------------------------
    // PRÓXIMO QUADRO
    // -----------------------------------------------

    animacaoId = requestAnimationFrame(atualizarJogo);
}


// =====================================================
// INICIAR MOVIMENTO
// =====================================================

function iniciarMovimento() {
    ultimoTempo = 0;

    tempoPulo = 0;

    if (animacaoId !== null) {
        cancelAnimationFrame(animacaoId);
    }

    animacaoId = requestAnimationFrame(atualizarJogo);
}


// =====================================================
// INICIAR JOGO
// =====================================================

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


// =====================================================
// REINICIAR JOGO
// =====================================================

function reiniciarJogo() {
    gameOver.classList.remove("visivel");

    iniciarJogo();
}


// =====================================================
// EVENTOS DE TECLADO
// =====================================================

playButton.addEventListener("click", iniciarJogo);

document.addEventListener("keydown", function (evento) {
    if (
        evento.code === "Space" ||
        evento.code === "ArrowUp"
    ) {
        if (
            jogoAtivo &&
            !gameEncerrado
        ) {
            evento.preventDefault();

            pular();
        }
    }
});


// =====================================================
// EVENTOS DE TOQUE E CLIQUE
// =====================================================

document.addEventListener("pointerdown", function (evento) {
    if (
        !jogoAtivo ||
        gameEncerrado
    ) {
        return;
    }

    /*
     * Não pular ao clicar nos controles,
     * nas informações do jogador ou na mensagem.
     */

    if (
        evento.target.closest("#Volta") ||
        evento.target.closest("#game-over") ||
        evento.target.closest("#jogador-info") ||
        evento.target.closest("#mensagem-steven")
    ) {
        return;
    }

    pular();
});


// =====================================================
// BOTÃO REINICIAR
// =====================================================

reiniciarButton.addEventListener("click", reiniciarJogo);


// =====================================================
// BOTÃO VOLTAR
// =====================================================

voltaButton.addEventListener("click", function () {
    if (
        jogoAtivo ||
        gameEncerrado
    ) {
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


// =====================================================
// VERIFICAR JOGADOR AO ABRIR A PÁGINA
// =====================================================

jogador = carregarJogador();

if (!jogador) {
    console.warn(
        "Nenhum jogador encontrado. " +
        "Cadastre o astronauta antes de jogar."
    );
}
