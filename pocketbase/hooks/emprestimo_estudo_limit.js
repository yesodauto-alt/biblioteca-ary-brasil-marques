onRecordCreateRequest((e) => {
  var shouldBlock = false
  var blockMessage = ''

  try {
    if (!e.record.getString('tipo_emprestimo')) {
      e.record.set('tipo_emprestimo', 'comum')
    }

    var body = e.requestInfo().body || {}
    var leitorId = body.leitor || e.record.getString('leitor') || ''
    var tipo = body.tipo_emprestimo || e.record.getString('tipo_emprestimo') || 'comum'

    if (leitorId) {
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
        shouldBlock = true
        blockMessage =
          'Este usuário já atingiu o limite de empréstimos: 1 livro comum e 1 livro de estudo.'
      } else if (tipo === 'comum' && comumCount >= 1) {
        shouldBlock = true
        blockMessage =
          'Este usuário já possui um livro comum emprestado. É permitido apenas um livro de estudo adicional.'
      } else if (tipo === 'estudo' && estudoCount >= 1) {
        shouldBlock = true
        blockMessage =
          'Este usuário já possui um livro de estudo emprestado. É permitido apenas um livro comum.'
      }
    }
  } catch (err) {
    $app.logger().error('emprestimo_estudo_limit error', 'error', String(err))
  }

  if (shouldBlock) {
    e.badRequestError(blockMessage)
    return
  }

  e.next()
}, 'emprestimos')
