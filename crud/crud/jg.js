const CONFIG = {
    chaveLocalStorage: "astronautas"
};

// ======================================================
// ESTADO DA APLICAÇÃO
// ======================================================
const sistema = {
    jogadores: [],
    jogadorSelecionado: null
};

// ======================================================
// ELEMENTOS DA INTERFACE
// ======================================================
const formulario = document.getElementById("form");
const campoId = document.getElementById("idJogador");
const campoNome = document.getElementById("nome");
const campoNickname = document.getElementById("user");
const campoIdade = document.getElementById("idade");
const checkHtml = document.getElementById("html");
const checkCss = document.getElementById("css");
const checkJavascript = document.getElementById("javascript");
const listaJogadores = document.getElementById("listaJogadores");
const contador = document.getElementById("contador");
const btnSalvar = document.getElementById("ENVIAR");
const btnJogar = document.getElementById("JOGAR"); 

// ======================================================
// INICIALIZAÇÃO
// ======================================================
inicializar();

function inicializar() {
    carregarJogadores();
    registrarEventos();
    renderizarJogadores();
    verificarStatusBotaoJogar(); 
}

// ======================================================
// EVENTOS
// ======================================================
function registrarEventos() {
    if (formulario) {
        formulario.addEventListener("submit", salvarJogador);
    }

    if (btnJogar) {
        btnJogar.addEventListener("click", redirecionarParaOJogo);
    }
}

// ======================================================
// REDIRECIONAMENTO (CORRIGIDO: Adicionado aspas)
// ======================================================
function redirecionarParaOJogo() {
    window.location.href = "http://127.0.0.1:5500/game/patos.html"; 
}

// CONTROLE DO BOTÃO PLAY
function verificarStatusBotaoJogar() {
    if (!btnJogar) return;
    if (sistema.jogadores.length > 0) {
        btnJogar.removeAttribute("disabled");
    } else {
        btnJogar.setAttribute("disabled", "true");
    }
}

// ======================================================
// SALVAR JOGADOR (CREATE / UPDATE)
// ======================================================
function salvarJogador(evento) {
    evento.preventDefault(); 

    if (!validarDados()) {
        return;
    }

    if (!campoId || campoId.value === "") {
        cadastrarJogador();
    } else {
        atualizarJogador();
    }
}

// ======================================================
// VALIDAÇÃO
// ======================================================
function validarDados() {
    const nome = campoNome.value.trim();
    const nickname = campoNickname.value.trim();
    const idade = Number(campoIdade.value);

    if (nome === "") {
        alert("Informe o nome do astronauta.");
        campoNome.focus();
        return false;
    }

    if (nickname === "") {
        alert("Informe o seu nick.");
        campoNickname.focus();
        return false;
    }

    if (isNaN(idade) || idade < 18 || idade > 50) {
        alert("A idade deve estar entre 18 e 50 anos.");
        campoIdade.focus();
        return false;
    }

    return true;
}

// ======================================================
// CADASTRAR (Cria o card e salva)
// ======================================================
function cadastrarJogador() {
    const linguagens = [];
    if (checkHtml && checkHtml.checked) linguagens.push("HTML");
    if (checkCss && checkCss.checked) linguagens.push("CSS");
    if (checkJavascript && checkJavascript.checked) linguagens.push("JAVASCRIPT");

    const jogador = {
        id: Date.now(),
        nome: campoNome.value.trim(),
        nickname: campoNickname.value.trim(),
        idade: Number(campoIdade.value),
        linguagens: linguagens,
        dataCriacao: new Date().toLocaleString()
    };

    sistema.jogadores.push(jogador);

    salvarJogadores();
    renderizarJogadores(); 
    limparFormulario();
    verificarStatusBotaoJogar(); 
}

// ======================================================
// CARREGAR DADOS (READ)
// ======================================================
function carregarJogadores() {
    const dados = localStorage.getItem(CONFIG.chaveLocalStorage);
    if (!dados) return;

    try {
        sistema.jogadores = JSON.parse(dados);
    } catch (erro) {
        console.error("Erro ao carregar astronautas:", erro);
        sistema.jogadores = [];
    }
}

// ======================================================
// ATUALIZAR (UPDATE)
// ======================================================
function atualizarJogador() {
    const id = Number(campoId.value);
    const jogador = encontrarJogador(id);

    if (!jogador) {
        alert("Astronauta não encontrado.");
        return;
    }

    const linguagens = [];
    if (checkHtml && checkHtml.checked) linguagens.push("HTML");
    if (checkCss && checkCss.checked) linguagens.push("CSS");
    if (checkJavascript && checkJavascript.checked) linguagens.push("JAVASCRIPT");

    jogador.nome = campoNome.value.trim();
    jogador.nickname = campoNickname.value.trim();
    jogador.idade = Number(campoIdade.value);
    jogador.linguagens = linguagens;

    salvarJogadores();
    renderizarJogadores();
    limparFormulario();
    verificarStatusBotaoJogar();
}

// ======================================================
// PREPARAR EDIÇÃO
// ======================================================
function prepararEdicao(id) {
    const jogador = encontrarJogador(id);
    if (!jogador) return;

    campoId.value = jogador.id;
    campoNome.value = navigator.nome; 
    campoNome.value = jogador.nome;
    campoNickname.value = jogador.nickname;
    campoIdade.value = jogador.idade;

    checkHtml.checked = jogador.linguagens.includes("HTML");
    checkCss.checked = jogador.linguagens.includes("CSS");
    checkJavascript.checked = jogador.linguagens.includes("JAVASCRIPT");

    btnSalvar.textContent = "⚙️ ATUALIZAR";
    campoNome.focus();
}

// ======================================================
// EXCLUIR (DELETE)
// ======================================================
function excluirJogador(id) {
    const jogador = encontrarJogador(id);
    if (!jogador) return;

    const confirmou = confirm(`Deseja realmente excluir o astronauta "${jogador.nickname}"?`);
    if (!confirmou) return;

    sistema.jogadores = sistema.jogadores.filter(item => item.id !== id);

    salvarJogadores();
    renderizarJogadores();
    limparFormulario();
    verificarStatusBotaoJogar(); 
}

function encontrarJogador(id) {
    return sistema.jogadores.find(jogador => jogador.id === id);
}

function salvarJogadores() {
    localStorage.setItem(CONFIG.chaveLocalStorage, JSON.stringify(sistema.jogadores));
}

// ======================================================
// DESENHAR ELEMENTOS NA TELA (RENDERIZAÇÃO RESTAURADA)
// ======================================================
function criarInformacao(rotulo, valor) {
    const p = document.createElement("p");
    p.style.margin = "5px 0";
    p.innerHTML = `<strong>${rotulo}</strong> ${valor}`;
    return p;
}

function criarMensagemListaVazia() {
    const p = document.createElement("p");
    p.textContent = "Nenhum astronauta registrado na órbita.";
    p.style.textAlign = "center";
    p.style.opacity = "0.6";
    listaJogadores.appendChild(p);
}

function limparFormulario() {
    formulario.reset();
    campoId.value = "";
    btnSalvar.textContent = "ENVIAR";
}

function renderizarJogadores() {
    if (!listaJogadores) return;
    listaJogadores.innerHTML = ""; 

    if (contador) {
        contador.textContent = `Total de Astronautas: ${sistema.jogadores.length}`;
    }

    if (sistema.jogadores.length === 0) {
        criarMensagemListaVazia();
        return;
    }

    sistema.jogadores.forEach(function (jogador) {
        const card = criarCardJogador(jogador);
        listaJogadores.appendChild(card);
    });
}

function criarCardJogador(jogador) {
    const card = document.createElement("article");
    card.classList.add("card");
    card.style.marginTop = "15px";

    const titulo = document.createElement("h3");
    titulo.style.color = "#a4e4e4";
    titulo.style.margin = "0 0 10px 0";
    titulo.textContent = jogador.nickname;
    card.appendChild(titulo);

    const nome = criarInformacao("Nome:", jogador.nome);
    const idade = criarInformacao("Idade:", jogador.idade);
    const linguagens = criarInformacao("Linguagens:", jogador.linguagens.join(", ") || "Nenhuma");

    card.appendChild(nome);
    card.appendChild(idade);
    card.appendChild(linguagens);

    const acoes = document.createElement("div");
    acoes.style.marginTop = "15px";
    acoes.style.display = "flex";
    acoes.style.gap = "10px";

    const botaoEditar = document.createElement("button");
    botaoEditar.type = "button";
    botaoEditar.textContent = "✏️ Editar";
    botaoEditar.addEventListener("click", () => prepararEdicao(jogador.id));

    const botaoExcluir = document.createElement("button");
    botaoExcluir.type = "button";
    botaoExcluir.textContent = "🗑️ Excluir";
    botaoExcluir.style.background = "#440b0b";
    botaoExcluir.style.color = "white";
    botaoExcluir.style.border = "none";
    botaoExcluir.style.padding = "6px 12px";
    botaoExcluir.style.borderRadius = "4px";
    botaoExcluir.style.cursor = "pointer";
    botaoExcluir.addEventListener("click", () => excluirJogador(jogador.id));

    acoes.appendChild(botaoEditar);
    acoes.appendChild(botaoExcluir);
    card.appendChild(acoes);

    return card;
}


