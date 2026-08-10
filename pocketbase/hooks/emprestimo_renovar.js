routerAdd(
  'POST',
  '/backend/v1/emprestimos/{id}/renovar',
  (e) => {
    var body = e.requestInfo().body || {}
    var voluntarioId = body.voluntario_id
    var novaData = body.nova_data_devolucao

    if (!voluntarioId) {
      return e.badRequestError('Selecione o voluntário responsável por esta operação.')
    }
    if (!novaData) {
      return e.badRequestError('Nova data de devolução é obrigatória.')
    }

    try {
      var emp = $app.findRecordById('emprestimos', e.request.pathValue('id'))
      var currentRenovacoes = emp.get('quantidade_renovacoes') || 0

      emp.set('data_prevista_devolucao', novaData)
      emp.set('quantidade_renovacoes', currentRenovacoes + 1)
      $app.save(emp)

      var auditCol = $app.findCollectionByNameOrId('auditoria')
      var auditRec = new Record(auditCol)
      auditRec.set('acao', 'renovacao')
      auditRec.set('entidade', 'emprestimo')
      auditRec.set('registro_id', emp.id)
      auditRec.set('voluntario', voluntarioId)
      if (e.auth && e.auth.collectionName === 'users') {
        auditRec.set('usuario', e.auth.id)
      }
      auditRec.set('detalhes', 'Renovação registrada')
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
      return e.json(500, { error: 'failed to process renewal' })
    }
  },
  $apis.requireAuth(),
)
