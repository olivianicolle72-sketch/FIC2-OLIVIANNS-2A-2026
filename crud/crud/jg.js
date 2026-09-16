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

const formulario =
    document.getElementById("from");

const campoId =
    document.getElementById("idJogador");

const campoNome =
    document.getElementById("nome");

const campoNickname =
    document.getElementById("user");

const campoIdade =
    document.getElementById("idade");

const checkHtml =
    document.getElementById("html");

const checkCss =
    document.getElementById("css");

const checkJavascript =
    document.getElementById("Javascript");

const listaJogadores =
    document.getElementById("listaJogadores");

const contador =
    document.getElementById("contador");

const btnSalvar =
    document.getElementById("ENVIAR");


// ======================================================
// INICIALIZAÇÃO
// ======================================================

inicializar();


function inicializar() {

    carregarJogadores();

    registrarEventos();

    renderizarJogadores();

}


// ======================================================
// EVENTOS
// ======================================================

function registrarEventos() {

    btnSalvar.addEventListener(
        "click",
        salvarJogador
    );

}


// ======================================================
// CREATE / UPDATE
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

    const nome =
        campoNome.value.trim();

    const nickname =
        campoNickname.value.trim();

    const idade =
        Number(campoIdade.value);


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


    if (
        isNaN(idade) ||
        idade < 0 ||
        idade > 50
    ) {

        alert(
            "A idade deve estar entre 0 e 50 anos."
        );

        campoIdade.focus();

        return false;

    }


    return true;

}


// ======================================================
// CREATE
// ======================================================

function cadastrarJogador() {

    const linguagens = [];

    if (checkHtml.checked) linguagens.push("HTML");
    if (checkCss.checked) linguagens.push("CSS");
    if (checkJavascript.checked) linguagens.push("JAVASCRIPT");


    const jogador = {

        id: Date.now(),

        nome:
            campoNome.value.trim(),

        nickname:
            campoNickname.value.trim(),

        idade:
            Number(campoIdade.value),

        linguagens: linguagens,

        dataCriacao:
            new Date().toLocaleString()

    };


    sistema.jogadores.push(jogador);


    salvarJogadores();

    renderizarJogadores();

    limparFormulario();

}


// ======================================================
// READ
// ======================================================

function carregarJogadores() {

    const dados =
        localStorage.getItem(
            CONFIG.chaveLocalStorage
        );


    if (!dados) {

        return;

    }


    try {

        sistema.jogadores =
            JSON.parse(dados);

    } catch (erro) {

        console.error(
            "Erro ao carregar astronautas:",
            erro
        );

        sistema.jogadores = [];

    }

}


// ======================================================
// UPDATE
// ======================================================

function atualizarJogador() {

    const id =
        Number(campoId.value);


    const jogador =
        encontrarJogador(id);


    if (!jogador) {

        alert(
            "Astronauta não encontrado."
        );

        return;

    }


    const linguagens = [];

    if (checkHtml.checked) linguagens.push("HTML");
    if (checkCss.checked) linguagens.push("CSS");
    if (checkJavascript.checked) linguagens.push("JAVASCRIPT");


    jogador.nome =
        campoNome.value.trim();

    jogador.nickname =
        campoNickname.value.trim();

    jogador.idade =
        Number(campoIdade.value);

    jogador.linguagens = linguagens;


    salvarJogadores();

    renderizarJogadores();

    limparFormulario();

}


// ======================================================
// DELETE
// ======================================================

function excluirJogador(id) {

    const jogador =
        encontrarJogador(id);


    if (!jogador) {

        alert(
            "Astronauta não encontrado."
        );

        return;

    }


    const confirmou =
        confirm(
            `Deseja realmente excluir o astronauta "${jogador.nickname}"?`
        );


    if (!confirmou) {

        return;

    }


    sistema.jogadores =
        sistema.jogadores.filter(
            function (item) {

                return item.id !== id;

            }
        );


    salvarJogadores();

    renderizarJogadores();

    limparFormulario();

}


// ======================================================
// ENCONTRAR JOGADOR
// ======================================================

function encontrarJogador(id) {

    return sistema.jogadores.find(
        function (jogador) {

            return jogador.id === id;

        }
    );

}


// ======================================================
// LOCAL STORAGE
// ======================================================

function salvarJogadores() {

    localStorage.setItem(

        CONFIG.chaveLocalStorage,

        JSON.stringify(
            sistema.jogadores
        )

    );

}


// ======================================================
// RENDERIZAÇÃO
// ======================================================

function renderizarJogadores() {

    if (!listaJogadores) return;

    listaJogadores.replaceChildren();


    if (contador) {
        contador.textContent =
            `Total de Astronautas: ${sistema.jogadores.length}`;
    }


    if (
        sistema.jogadores.length === 0
    ) {

        criarMensagemListaVazia();

        return;

    }


    sistema.jogadores.forEach(
        function (jogador) {

            const card =
                criarCardJogador(jogador);

            listaJogadores.appendChild(card);

        }
    );

}


// ======================================================
// CRIAR CARD
// ======================================================

function criarCardJogador(jogador) {

    const card =
        document.createElement("article");

    card.classList.add("card");


    const titulo =
        document.createElement("h3");

    titulo.textContent =
        jogador.nickname;


    const nome =
        criarInformacao(
            "Nome:",
            jogador.nome
        );


    const idade =
        criarInformacao(
            "Idade:",
            jogador.idade
        );


    const linguagens =
        criarInformacao(
            "Linguagens:",
            jogador.linguagens.join(", ") || "Nenhuma"
        );


    const acoes =
        document.createElement("div");

    acoes.classList.add("acoes");


    const botaoEditar =
        document.createElement("button");

    botaoEditar.textContent =
        "✏️ Editar";


    botaoEditar.addEventListener(
        "click",
        function () {

            prepararEdicao(jogador.id);

        }
    );


    const botaoExcluir =
        document.createElement("button");

    botaoExcluir.textContent =
        "🗑️ Excluir";

    botaoExcluir.classList.add(
        "botao-excluir"
    );


    botaoExcluir.addEventListener(
        "click",
        function () {

            excluirJogador(jogador.id);

        }
    );


    acoes.appendChild(botaoEditar);

    acoes.appendChild(botaoExcluir);


    card.appendChild(titulo);

    card.appendChild(nome);

    card.appendChild(idade);

    card.appendChild(linguagens);

    card.appendChild(acoes);


    return card;

}


// ======================================================
// CRIAR INFORMAÇÃO DO CARD
// ======================================================

function criarInformacao(rotulo, valor) {

    const paragrafo =
        document.createElement("p");


    const destaque =
        document.createElement("strong");


    destaque.textContent =
        rotulo + " ";


    paragrafo.appendChild(destaque);


    paragrafo.append(
        String(valor)
    );


    return paragrafo;

}


// ======================================================
// MENSAGEM DE LISTA VAZIA
// ======================================================

function criarMensagemListaVazia() {

    const mensagem =
        document.createElement("div");

    mensagem.classList.add(
        "lista-vazia"
    );


    const titulo =
        document.createElement("p");

    titulo.textContent =
        "🚀 Nenhum astronauta cadastrado";


    mensagem.appendChild(titulo);


    listaJogadores.appendChild(mensagem);

}


// ======================================================
// PREPARAR EDIÇÃO
// ======================================================

function prepararEdicao(id) {

    const jogador =
        encontrarJogador(id);


    if (!jogador) {

        return;

    }


    if (!campoId) {
        const inputIdOculto = document.createElement("input");
        inputIdOculto.type = "hidden";
        inputIdOculto.id = "idJogador";
        formulario.appendChild(inputIdOculto);
    }

    document.getElementById("idJogador").value =
        jogador.id;

    campoNome.value =
        jogador.nome;

    campoNickname.value =
        jogador.nickname;

    campoIdade.value =
        jogador.idade;


    checkHtml.checked = jogador.linguagens.includes("HTML");
    checkCss.checked = jogador.linguagens.includes("CSS");
    checkJavascript.checked = jogador.linguagens.includes("JAVASCRIPT");


    btnSalvar.textContent =
        "ATUALIZAR";

    campoNome.focus();

}


// ======================================================
// LIMPAR FORMULÁRIO
// ======================================================

function limparFormulario() {

    formulario.reset();


    const campoIdAtual = document.getElementById("idJogador");
    if (campoIdAtual) {
        campoIdAtual.value = "";
    }


    btnSalvar.textContent =
        "ENVIAR";

}

