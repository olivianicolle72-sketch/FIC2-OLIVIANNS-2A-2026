
const form = document.getElementById('form');
const nomeInput = document.getElementById('nome');
const userInput = document.getElementById('user');
const idadeInput = document.getElementById('idade');
const listaAstros = document.getElementById('listaastros');
const contador = document.getElementById('contador');


let astronautas = [];


function atualizarPainel() {
   
    listaAstros.innerHTML = '';
    
   
    contador.textContent = `Total: ${astronautas.length}`;
    
  
    astronautas.forEach((astro) => {
        const divAstro = document.createElement('div');
        divAstro.className = 'astronauta-item'; 
        
        divAstro.innerHTML = `
            <h3>${astro.nome} <small>(${astro.user})</small></h3>
            <p><strong>Idade:</strong> ${astro.idade} anos</p>
            <p><strong>Linguagens:</strong> ${astro.linguagens.join(', ') || 'Nenhuma selecionada'}</p>
            <hr>
        `;
        
        listaAstros.appendChild(divAstro);
    });
}

// Ouve o evento de envio do formulário
form.addEventListener('submit', function(event) {
    // Evita que a página recarregue ao enviar o formulário
    event.preventDefault();
    
    // Captura as linguagens selecionadas
    const linguagensSelecionadas = [];
    if (document.getElementById('html').checked) linguagensSelecionadas.push('HTML');
    if (document.getElementById('css').checked) linguagensSelecionadas.push('CSS');
    if (document.getElementById('javascript').checked) linguagensSelecionadas.push('JavaScript');
    
    // Cria o objeto do novo astronauta
    const novoAstronauta = {
        nome: nomeInput.value.trim(),
        user: userInput.value.trim(),
        idade: idadeInput.value,
        linguagens: linguagensSelecionadas
    };
    
    // Validação simples para garantir que os campos principais foram preenchidos
    if (!novoAstronauta.nome || !novoAstronauta.user || !novoAstronauta.idade) {
        alert('Por favor, preencha todos os campos do astronauta!');
        return;
    }
    
    // Adiciona o novo astronauta ao array
    astronautas.push(novoAstronauta);
    
    // Atualiza a tela
    atualizarPainel();
    
    // Limpa o formulário para o próximo cadastro
    form.reset();
});
