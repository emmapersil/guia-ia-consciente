// Guia de IA Consciente: tamanho do texto, checklist de proteção e quiz "Golpe ou não?"

(function () {
  "use strict";

  // Guarda preferências no navegador quando possível (funciona mesmo sem armazenamento)
  function ler(chave, padrao) {
    try {
      var valor = localStorage.getItem(chave);
      return valor === null ? padrao : JSON.parse(valor);
    } catch (e) {
      return padrao;
    }
  }
  function salvar(chave, valor) {
    try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) { /* sem armazenamento */ }
  }

  // ---------- Tamanho do texto ----------
  var escalas = [0.9, 1, 1.15, 1.3];
  var nivel = ler("iac-escala", 1);
  if (typeof nivel !== "number" || nivel < 0 || nivel >= escalas.length) nivel = 1;

  function aplicarEscala() {
    document.documentElement.style.setProperty("--escala", escalas[nivel]);
    document.getElementById("fonte-menor").disabled = nivel === 0;
    document.getElementById("fonte-maior").disabled = nivel === escalas.length - 1;
    salvar("iac-escala", nivel);
  }
  document.getElementById("fonte-menor").addEventListener("click", function () {
    if (nivel > 0) { nivel--; aplicarEscala(); }
  });
  document.getElementById("fonte-maior").addEventListener("click", function () {
    if (nivel < escalas.length - 1) { nivel++; aplicarEscala(); }
  });
  aplicarEscala();

  // ---------- Checklist ----------
  var caixas = Array.prototype.slice.call(document.querySelectorAll("#checklist input"));
  var marcados = ler("iac-checklist", {});
  var progresso = document.getElementById("progresso");

  function atualizarProgresso() {
    var total = caixas.filter(function (c) { return c.checked; }).length;
    progresso.textContent = total === caixas.length
      ? "Parabéns! Você marcou todos os " + total + " cuidados."
      : total + " de " + caixas.length + " cuidados marcados";
  }
  caixas.forEach(function (caixa) {
    caixa.checked = !!marcados[caixa.id];
    caixa.addEventListener("change", function () {
      marcados[caixa.id] = caixa.checked;
      salvar("iac-checklist", marcados);
      atualizarProgresso();
    });
  });
  atualizarProgresso();

  // ---------- Quiz ----------
  var situacoes = [
    {
      texto: "Chega um áudio no WhatsApp com a voz do seu filho: \"Mãe, troquei de número. Preciso de um Pix urgente, depois te explico.\"",
      resposta: "golpe",
      explicacao: "A voz pode ter sido clonada com IA a partir de vídeos e áudios da internet. Desligue e ligue para o número antigo, ou pergunte a palavra-secreta da família."
    },
    {
      texto: "Você pede a um assistente de IA uma receita de bolo de cenoura e ele mostra os ingredientes e o modo de preparo.",
      resposta: "seguro",
      explicacao: "Esse é um bom uso da IA. Mesmo assim, se algo parecer estranho, como uma quantidade exagerada, confira em outra receita."
    },
    {
      texto: "Aparece um vídeo de um médico famoso da TV vendendo um remédio natural que \"cura a diabetes em 7 dias\".",
      resposta: "golpe",
      explicacao: "É um deepfake: o rosto e a voz do médico foram copiados por IA. Promessas milagrosas são sinal de golpe. Nunca troque um tratamento sem falar com o seu médico."
    },
    {
      texto: "Você recebe uma mensagem do \"banco\" com um link: \"Atualize seus dados agora ou sua conta será bloqueada hoje.\"",
      resposta: "golpe",
      explicacao: "Bancos não pedem atualização de dados por link em mensagem. A urgência é para você não pensar. Abra o aplicativo oficial do banco ou ligue para o número do cartão."
    },
    {
      texto: "Depois de assistir a vídeos de receitas, o YouTube passa a sugerir mais vídeos de culinária para você.",
      resposta: "seguro",
      explicacao: "É o algoritmo de recomendação funcionando. Não é perigoso, mas lembre que ele mostra mais do mesmo. Procure também outros assuntos e fontes."
    },
    {
      texto: "No chat de uma loja online, o robô de atendimento pede a senha do seu cartão para \"confirmar a compra\".",
      resposta: "golpe",
      explicacao: "Nenhuma loja ou banco pede a senha do cartão por chat. Encerre a conversa e não passe senhas nem códigos recebidos por SMS."
    },
    {
      texto: "No grupo da família, chega uma foto chocante com o texto: \"Compartilhe com todos antes que apaguem!\" Não há nenhuma fonte.",
      resposta: "golpe",
      explicacao: "É uma armadilha de notícia falsa. Imagens assim podem ser criadas por IA em segundos. Antes de compartilhar, procure a notícia em um jornal conhecido ou em uma agência de checagem."
    }
  ];

  var indice = 0;
  var acertos = 0;
  var el = {
    contador: document.getElementById("quiz-contador"),
    placar: document.getElementById("quiz-placar"),
    barra: document.getElementById("quiz-barra"),
    situacao: document.getElementById("quiz-situacao"),
    botoes: document.getElementById("quiz-botoes"),
    retorno: document.getElementById("quiz-retorno"),
    veredito: document.getElementById("quiz-veredito"),
    explicacao: document.getElementById("quiz-explicacao"),
    proximo: document.getElementById("quiz-proximo"),
    fim: document.getElementById("quiz-fim"),
    resultado: document.getElementById("quiz-resultado"),
    mensagem: document.getElementById("quiz-mensagem"),
    reiniciar: document.getElementById("quiz-reiniciar")
  };
  var botoesResposta = Array.prototype.slice.call(el.botoes.querySelectorAll("button"));

  function textoAcertos(n) { return n + (n === 1 ? " acerto" : " acertos"); }

  function mostrarSituacao() {
    var s = situacoes[indice];
    el.contador.textContent = "Situação " + (indice + 1) + " de " + situacoes.length;
    el.placar.textContent = textoAcertos(acertos);
    el.barra.style.width = (indice / situacoes.length * 100) + "%";
    el.situacao.textContent = s.texto;
    el.botoes.hidden = false;
    botoesResposta.forEach(function (b) { b.disabled = false; });
    el.retorno.hidden = true;
    el.fim.hidden = true;
  }

  function responder(escolha) {
    var s = situacoes[indice];
    var certo = escolha === s.resposta;
    if (certo) acertos++;
    botoesResposta.forEach(function (b) { b.disabled = true; });
    el.placar.textContent = textoAcertos(acertos);
    el.veredito.textContent = (certo ? "Você acertou! " : "Não foi dessa vez. ") +
      (s.resposta === "golpe" ? "Isso é golpe." : "Isso é seguro.");
    el.veredito.className = "quiz-veredito " + (certo ? "acertou" : "errou");
    el.explicacao.textContent = s.explicacao;
    el.proximo.textContent = indice === situacoes.length - 1 ? "Ver resultado" : "Próxima situação";
    el.retorno.hidden = false;
    el.proximo.focus();
  }

  function proxima() {
    indice++;
    if (indice < situacoes.length) {
      mostrarSituacao();
      el.situacao.focus();
    } else {
      terminar();
    }
  }

  function terminar() {
    el.barra.style.width = "100%";
    el.contador.textContent = "Fim do quiz";
    el.botoes.hidden = true;
    el.retorno.hidden = true;
    el.situacao.textContent = "";
    el.resultado.textContent = "Você acertou " + acertos + " de " + situacoes.length + ".";
    el.mensagem.textContent = acertos === situacoes.length
      ? "Excelente! Você reconhece os golpes com IA. Compartilhe este guia com quem você ama."
      : acertos >= 5
        ? "Muito bem! Revise as explicações e fique atento à urgência: ela é o principal sinal de golpe."
        : "Vale reler a seção de riscos. Lembre: desconfie da urgência e confirme por outro canal.";
    el.fim.hidden = false;
    el.reiniciar.focus();
  }

  botoesResposta.forEach(function (b) {
    b.addEventListener("click", function () { responder(b.getAttribute("data-resposta")); });
  });
  el.proximo.addEventListener("click", proxima);
  el.reiniciar.addEventListener("click", function () {
    indice = 0;
    acertos = 0;
    mostrarSituacao();
  });
  el.situacao.setAttribute("tabindex", "-1");

  mostrarSituacao();
})();
