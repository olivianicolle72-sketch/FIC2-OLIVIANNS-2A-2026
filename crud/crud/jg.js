const CONFIG = {
    chaveLocalStorage: "astronauta"
};

const PAGINA_DO_JOGO = "/game/pato.html";

const formulario = document.getElementById("from");
const campoId = document.getElementById("idJogador");
const campoNome = document.getElementById("nome");
const campoNickname = document.getElementById("user");
const campoIdade = document.getElementById("idade");
const listaJogadores = document.getElementById("listaJogadores");
const contador = document.getElementById("contador");
const btnSalvar = document.getElementById("ENVIAR");
const btnJogar = document.getElementById("JOGAR");

let astronauta = null;

carregarAstronauta();
renderizarAstronauta();

btnJogar.disabled = !astronauta;

btnSalvar.addEventListener("click", salvarAstronauta);
btnJogar.addEventListener("click", jogar);

function getGenero() {
    const selecionado = document.querySelector(
        'input[name="genero"]:checked'
    );

    return selecionado ? selecionado.value : "";
}

function salvarAstronauta(evento) {
    evento.preventDefault();

    const nome = campoNome.value.trim();
    const nickname = campoNickname.value.trim();
    const idade = Number(campoIdade.value);
    const genero = getGenero();

    if (!nome) {
        alert("Informe o nome do astronauta.");
        campoNome.focus();
        return;
    }

    if (!nickname) {
        alert("Informe o seu nick.");
        campoNickname.focus();
        return;
    }

    if (isNaN(idade) || idade < 18 || idade > 50) {
        alert("A idade deve estar entre 18 e 50 anos.");
        campoIdade.focus();
        return;
    }

    if (!genero) {
        alert("Selecione o gênero.");
        return;
    }

    if (astronauta) {
        astronauta.nome = nome;
        astronauta.nickname = nickname;
        astronauta.idade = idade;
        astronauta.genero = genero;

        alert("Astronauta atualizado com sucesso!");
    } else {
        astronauta = {
            id: Date.now(),
            nome: nome,
            nickname: nickname,
            idade: idade,
            genero: genero
        };

        alert("Astronauta cadastrado com sucesso!");
    }

    localStorage.setItem(
        CONFIG.chaveLocalStorage,
        JSON.stringify(astronauta)
    );

    btnJogar.disabled = false;

    renderizarAstronauta();
    limparFormulario();
}

function carregarAstronauta() {
    const dados = localStorage.getItem(
        CONFIG.chaveLocalStorage
    );

    if (!dados) {
        return;
    }

    try {
        astronauta = JSON.parse(dados);
    } catch {
        astronauta = null;
    }
}

function renderizarAstronauta() {
    listaJogadores.innerHTML = "";

    if (!astronauta) {
        contador.textContent =
            "Nenhum astronauta cadastrado";

        listaJogadores.innerHTML =
            "<div class='lista-vazia'>🚀 Nenhum astronauta cadastrado</div>";

        return;
    }

    contador.textContent =
        "Astronauta cadastrado";

    const card = document.createElement("article");

    card.className = "card";

    card.innerHTML = `
        <h3>${astronauta.nickname}</h3>

        <p>
            <strong>Nome:</strong>
            ${astronauta.nome}
        </p>

        <p>
            <strong>Idade:</strong>
            ${astronauta.idade}
        </p>

        <p>
            <strong>Gênero:</strong>
            ${astronauta.genero}
        </p>

        <div class="acoes">
            <button id="editarAstronauta">
                ✏️ Editar
            </button>

            <button id="excluirAstronauta" class="botao-excluir">
                🗑️ Excluir
            </button>
        </div>
    `;

    listaJogadores.appendChild(card);

    document
        .getElementById("editarAstronauta")
        .addEventListener(
            "click",
            editarAstronauta
        );

    document
        .getElementById("excluirAstronauta")
        .addEventListener(
            "click",
            excluirAstronauta
        );
}

function editarAstronauta() {
    campoId.value = astronauta.id;

    campoNome.value =
        astronauta.nome;

    campoNickname.value =
        astronauta.nickname;

    campoIdade.value =
        astronauta.idade;

    const radio = document.querySelector(
        `input[name="genero"][value="${astronauta.genero}"]`
    );

    if (radio) {
        radio.checked = true;
    }

    btnSalvar.textContent =
        "ATUALIZAR";

    campoNome.focus();
}

function excluirAstronauta() {
    if (!astronauta) {
        return;
    }

    const confirmou = confirm(
        `Deseja excluir o astronauta "${astronauta.nickname}"?`
    );

    if (!confirmou) {
        return;
    }

    localStorage.removeItem(
        CONFIG.chaveLocalStorage
    );

    astronauta = null;

    btnJogar.disabled = true;

    renderizarAstronauta();

    limparFormulario();

    alert("Astronauta excluído com sucesso!");
}

function limparFormulario() {
    formulario.reset();

    campoId.value = "";

    btnSalvar.textContent =
        "ENVIAR";
}

function jogar() {
    if (!astronauta) {
        alert(
            "Cadastre seu astronauta primeiro."
        );

        return;
    }

    localStorage.setItem(
        "jogadorAtual",
        JSON.stringify(astronauta)
    );

  
}

