const playButton = document.getElementById("play");
const voltaButton = document.getElementById("Volta");

const wrapper = document.getElementById("game-wrapper");
const luaLinha = document.getElementById("lua-linha");

playButton.addEventListener("click", () => {
wrapper.classList.add("sumir");
document.body.classList.add("jogo");

```
setTimeout(() => {
    luaLinha.classList.add("expandir-linha");
}, 400);
```

});

voltaButton.addEventListener("click", () => {
luaLinha.classList.remove("expandir-linha");
document.body.classList.remove("jogo");
wrapper.classList.remove("sumir");
});



