routerAdd(
  'POST',
  '/backend/v1/emprestimos/{id}/devolver',
  (e) => {
    var body = e.requestInfo().body || {}
    var voluntarioId = body.voluntario_id

    if (!voluntarioId) {
      return e.badRequestError('Selecione o voluntário responsável por esta operação.')
    }

    function getCurrentDate(tz) {
      try {
        return new Intl.DateTimeFormat('sv-SE', {
          timeZone: tz,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(new Date())
      } catch (_) {
        return new Date(Date.now() - 3 * 3600000).toISOString().split('T')[0]
      }
    }

    try {
      var timezone = 'America/Sao_Paulo'
      try {
        var configRecs = $app.findRecordsByFilter('configuracoes', "id != ''", '', 1, 0)
        if (configRecs.length > 0) {
          var tz = configRecs[0].getString('fuso_horario')
          if (tz) timezone = tz
        }
      } catch (_) {}

      var today = getCurrentDate(timezone)

      var emp = $app.findRecordById('emprestimos', e.request.pathValue('id'))
      emp.set('data_devolucao_real', today)
      emp.set('status', 'devolvido')
      $app.save(emp)

      var livroId = emp.getString('livro')
      var livro = $app.findRecordById('livros', livroId)
      livro.set('status', 'disponível')
      $app.save(livro)

      var auditCol = $app.findCollectionByNameOrId('auditoria')
      var auditRec = new Record(auditCol)
      auditRec.set('acao', 'devolucao')
      auditRec.set('entidade', 'emprestimo')
      auditRec.set('registro_id', emp.id)
      auditRec.set('voluntario', voluntarioId)
      if (e.auth && e.auth.collectionName === 'users') {
        auditRec.set('usuario', e.auth.id)
      }
      auditRec.set('detalhes', 'Devolução registrada')
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
      return e.json(500, { error: 'failed to process devolution' })
    }
  },
  $apis.requireAuth(),
)
