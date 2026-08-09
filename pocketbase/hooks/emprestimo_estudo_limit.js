onRecordCreateRequest((e) => {
  var leitorId = e.record.getString('leitor')
  var tipo = e.record.getString('tipo_emprestimo') || 'comum'

  if (!leitorId) {
    e.next()
    return
  }

  var activeLoans = $app.findRecordsByFilter(
    'emprestimos',
    'leitor = "' + leitorId + '" && (status = "ativo" || status = "atrasado")',
    '-created',
    100,
    0,
  )

  var comumCount = 0
  var estudoCount = 0

  for (var i = 0; i < activeLoans.length; i++) {
    var loanTipo = activeLoans[i].getString('tipo_emprestimo') || 'comum'
    if (loanTipo === 'estudo') {
      estudoCount++
    } else {
      comumCount++
    }
  }

  var total = comumCount + estudoCount

  if (total >= 2) {
    e.badRequestError(
      'Este usuário já atingiu o limite de empréstimos: 1 livro comum e 1 livro de estudo.',
    )
    return
  }

  if (tipo === 'comum' && comumCount >= 1) {
    e.badRequestError(
      'Este usuário já possui um livro comum emprestado. É permitido apenas um livro de estudo adicional.',
    )
    return
  }

  if (tipo === 'estudo' && estudoCount >= 1) {
    e.badRequestError(
      'Este usuário já possui um livro de estudo emprestado. É permitido apenas um livro comum.',
    )
    return
  }

  e.next()
}, 'emprestimos')
