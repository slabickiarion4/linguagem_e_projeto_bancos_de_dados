console.log("JavaScript carregado com sucesso!");

const formPesquisaRaca = document.getElementById("formPesquisaRaca");
const pesquisaRaca = document.getElementById("pesquisaRaca");
const resultadosRaca = document.getElementById("resultadosRaca");
let racasCache = null;

function adicionarDetalhe(elemento, rotulo, valor) {
  if (!valor) {
    return;
  }

  const detalhe = document.createElement("p");
  detalhe.textContent = `${rotulo}: ${valor}`;
  elemento.append(detalhe);
}

function formatarFaixa(faixa, unidade) {
  if (
    !faixa ||
    typeof faixa.min !== "number" ||
    typeof faixa.max !== "number"
  ) {
    return "";
  }

  return `${faixa.min}–${faixa.max} ${unidade}`;
}

function criarResultadoRaca(raca) {
  const atributos = raca.attributes;
  const artigo = document.createElement("article");
  artigo.className = "resultado-raca";

  const imagem = atributos.images?.[0]?.medium || atributos.images?.[0]?.url;
  if (imagem) {
    const elementoImagem = document.createElement("img");
    elementoImagem.src = imagem;
    elementoImagem.alt = `Foto de ${atributos.name}`;
    elementoImagem.loading = "lazy";
    artigo.append(elementoImagem);
  }

  const informacoes = document.createElement("div");
  const titulo = document.createElement("h3");
  titulo.textContent = atributos.name;
  informacoes.append(titulo);
  adicionarDetalhe(informacoes, "Descrição", atributos.description);
  adicionarDetalhe(informacoes, "Origem", atributos.origin?.country);
  adicionarDetalhe(
    informacoes,
    "Expectativa de vida",
    formatarFaixa(atributos.life, "anos"),
  );
  adicionarDetalhe(
    informacoes,
    "Peso dos machos",
    formatarFaixa(atributos.male_weight, "kg"),
  );
  adicionarDetalhe(
    informacoes,
    "Peso das fêmeas",
    formatarFaixa(atributos.female_weight, "kg"),
  );
  adicionarDetalhe(
    informacoes,
    "Hipoalergênico",
    typeof atributos.hypoallergenic === "boolean"
      ? atributos.hypoallergenic
        ? "Sim"
        : "Não"
      : "",
  );
  artigo.append(informacoes);

  return artigo;
}

async function obterRacas() {
  if (racasCache) {
    return racasCache;
  }

  const url = new URL("https://dogapi.dog/api/v2/breeds");
  url.searchParams.set("page[size]", "1000");
  const resposta = await fetch(url);

  if (!resposta.ok) {
    throw new Error("Não foi possível consultar as raças.");
  }

  const dados = await resposta.json();
  if (!Array.isArray(dados.data)) {
    throw new Error("A resposta da API não contém uma lista de raças.");
  }

  racasCache = dados.data;
  return racasCache;
}

formPesquisaRaca.addEventListener("submit", async function (evento) {
  evento.preventDefault();
  const termo = pesquisaRaca.value.trim().toLocaleLowerCase();

  if (!termo) {
    resultadosRaca.textContent = "Digite o nome de uma raça para pesquisar.";
    pesquisaRaca.focus();
    return;
  }

  resultadosRaca.textContent = "Pesquisando raças...";

  try {
    const racas = await obterRacas();
    const encontradas = racas.filter((raca) =>
      raca.attributes.name.toLocaleLowerCase().includes(termo),
    );

    resultadosRaca.replaceChildren();

    if (encontradas.length === 0) {
      resultadosRaca.textContent = "Nenhuma raça encontrada. Tente outro nome.";
      return;
    }

    encontradas.forEach((raca) => {
      resultadosRaca.append(criarResultadoRaca(raca));
    });
  } catch (erro) {
    resultadosRaca.textContent = "Não foi possível pesquisar. Tente novamente.";
    console.error(erro);
  }
});

const fotoCachorro = document.getElementById("fotoCachorro");
const btnNovaFoto = document.getElementById("btnNovaFoto");
const btnCuriosidade = document.getElementById("btnCuriosidade");
const curiosidade = document.getElementById("curiosidade");

btnNovaFoto.addEventListener("click", function () {
  fotoCachorro.src = "https://dogapi.dog/api/v2/breeds/image?t=" + Date.now();
});

btnCuriosidade.addEventListener("click", async function () {
  curiosidade.textContent = "Carregando curiosidade...";

  try {
    const resposta = await fetch("https://dogapi.dog/api/v2/facts?limit=1");

    if (!resposta.ok) {
      throw new Error("Não foi possível consultar a API.");
    }

    const dados = await resposta.json();
    curiosidade.textContent = dados.data[0].attributes.body;
  } catch (erro) {
    curiosidade.textContent = "Não foi possível carregar. Tente novamente.";
    console.error(erro);
  }
});
