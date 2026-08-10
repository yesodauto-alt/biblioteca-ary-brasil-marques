routerAdd(
  'POST',
  '/backend/v1/emprestimos/{id}/editar',
  (e) => {
    var body = e.requestInfo().body || {}
    var voluntarioId = body.voluntario_id || ''
    var novoLeitor = body.leitor || ''
    var novoLivro = body.livro || ''
    var novoTipo = body.tipo_emprestimo || 'comum'

    if (!voluntarioId) {
      return e.badRequestError('Selecione o voluntário responsável por esta operação.')
    }

    try {
      var emp = $app.findRecordById('emprestimos', e.request.pathValue('id'))
      var oldLivroId = emp.getString('livro')
      var oldLeitorId = emp.getString('leitor')
      var oldTipo = emp.getString('tipo_emprestimo') || 'comum'

      if (novoLivro && novoLivro !== oldLivroId) {
        var newBook = $app.findRecordById('livros', novoLivro)
        if (newBook.getString('status') !== 'disponível') {
          return e.badRequestError('O livro selecionado não está disponível para empréstimo.')
        }
      }

      var validateLeitorId = novoLeitor || oldLeitorId
      var validateTipo = novoTipo || oldTipo
      if ((novoLeitor && novoLeitor !== oldLeitorId) || novoTipo !== oldTipo) {
        var activeLoans = $app.findRecordsByFilter(
          'emprestimos',
          'leitor = "' +
            validateLeitorId +
            '" && (status = "ativo" || status = "atrasado") && id != "' +
            emp.id +
            '"',
          '-created',
          100,
          0,
        )
        var comumCount = 0
        var estudoCount = 0
        for (var li = 0; li < activeLoans.length; li++) {
          var loanTipo = activeLoans[li].getString('tipo_emprestimo') || 'comum'
          if (loanTipo === 'estudo') estudoCount++
          else comumCount++
        }
        if (comumCount + estudoCount >= 2) {
          return e.badRequestError('Este usuário já atingiu o limite de empréstimos.')
        }
        if (validateTipo === 'comum' && comumCount >= 1) {
          return e.badRequestError('Este usuário já possui um livro comum emprestado.')
        }
        if (validateTipo === 'estudo' && estudoCount >= 1) {
          return e.badRequestError('Este usuário já possui um livro de estudo emprestado.')
        }
      }

      if (novoLivro && novoLivro !== oldLivroId) {
        var oldBook = $app.findRecordById('livros', oldLivroId)
        oldBook.set('status', 'disponível')
        $app.save(oldBook)
        newBook.set('status', 'emprestado')
        $app.save(newBook)
        emp.set('livro', novoLivro)
      }

      if (novoLeitor) emp.set('leitor', novoLeitor)
      emp.set('tipo_emprestimo', novoTipo)
      emp.set('responsavel', voluntarioId)

      if (novoTipo !== oldTipo) {
        var loanPeriod = 15
        var timezone = 'America/Sao_Paulo'
        try {
          var configRecs = $app.findRecordsByFilter('configuracoes', "id != ''", '', 1, 0)
          if (configRecs.length > 0) {
            if (configRecs[0].get('prazo_devolucao_dias'))
              loanPeriod = configRecs[0].get('prazo_devolucao_dias')
            if (configRecs[0].getString('fuso_horario'))
              timezone = configRecs[0].getString('fuso_horario')
          }
        } catch (_) {}
        if (novoTipo === 'estudo') loanPeriod = 90
        var returnDate = new Date()
        returnDate.setDate(returnDate.getDate() + loanPeriod)
        var returnDateStr = new Intl.DateTimeFormat('sv-SE', {
          timeZone: timezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(returnDate)
        emp.set('data_prevista_devolucao', returnDateStr)
      }

      $app.save(emp)

      var auditCol = $app.findCollectionByNameOrId('auditoria')
      var auditRec = new Record(auditCol)
      auditRec.set('acao', 'alteracao')
      auditRec.set('entidade', 'emprestimo')
      auditRec.set('registro_id', emp.id)
      auditRec.set('voluntario', voluntarioId)
      if (e.auth && e.auth.collectionName === 'users') auditRec.set('usuario', e.auth.id)
      auditRec.set('detalhes', 'Empréstimo editado')
      $app.save(auditRec)

      return e.json(200, {
        id: emp.id,
        leitor: emp.getString('leitor'),
        livro: emp.getString('livro'),
        data_emprestimo: emp.getString('data_emprestimo'),
        data_prevista_devolucao: emp.getString('data_prevista_devolucao'),
        data_devolucao_real: emp.getString('data_devolucao_real'),
        status: emp.getString('status'),
        quantidade_renovacoes: emp.get('quantidade_renovacoes'),
        responsavel: emp.getString('responsavel'),
        tipo_emprestimo: emp.getString('tipo_emprestimo'),
        created: emp.getString('created'),
        updated: emp.getString('updated'),
      })
    } catch (err) {
      return e.json(500, { error: 'failed to edit loan' })
    }
  },
  $apis.requireAuth(),
)
