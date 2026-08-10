routerAdd(
  'POST',
  '/backend/v1/emprestimos/{id}/excluir',
  (e) => {
    var body = e.requestInfo().body || {}
    var voluntarioId = body.voluntario_id || ''

    try {
      var emp = $app.findRecordById('emprestimos', e.request.pathValue('id'))

      var auditCol = $app.findCollectionByNameOrId('auditoria')
      var auditRec = new Record(auditCol)
      auditRec.set('acao', 'mudanca_status')
      auditRec.set('entidade', 'emprestimo')
      auditRec.set('registro_id', emp.id)
      if (voluntarioId) {
        auditRec.set('voluntario', voluntarioId)
      }
      if (e.auth && e.auth.collectionName === 'users') {
        auditRec.set('usuario', e.auth.id)
      }
      auditRec.set('detalhes', 'Empréstimo cancelado/excluído')
      $app.save(auditRec)

      var livroId = emp.getString('livro')
      try {
        var livro = $app.findRecordById('livros', livroId)
        livro.set('status', 'disponível')
        $app.save(livro)
      } catch (_) {}

      $app.delete(emp)

      return e.json(200, { success: true })
    } catch (err) {
      return e.json(500, { error: 'failed to exclude loan' })
    }
  },
  $apis.requireAuth(),
)
