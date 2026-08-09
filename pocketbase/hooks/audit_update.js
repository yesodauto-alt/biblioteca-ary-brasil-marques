onRecordUpdateRequest(
  (e) => {
    var colName = e.record.collectionName
    var entidade = colName === 'leitores' ? 'leitor' : colName === 'livros' ? 'livro' : 'emprestimo'
    var oldStatus = e.record.original().getString('status')
    var newStatus = e.record.getString('status')
    var statusChanged = oldStatus !== newStatus
    var renovacoesChanged = false
    if (colName === 'emprestimos') {
      renovacoesChanged =
        e.record.original().getString('quantidade_renovacoes') !==
        e.record.getString('quantidade_renovacoes')
    }
    var userId = ''
    if (e.auth && e.auth.collectionName === 'users') {
      userId = e.auth.id
    }
    var registroId = e.record.id

    e.next()

    try {
      var auditCol = $app.findCollectionByNameOrId('auditoria')

      var createAudit = function (acao, detalhes) {
        var rec = new Record(auditCol)
        rec.set('acao', acao)
        rec.set('entidade', entidade)
        rec.set('registro_id', registroId)
        if (userId) {
          rec.set('usuario', userId)
        }
        rec.set('detalhes', detalhes)
        $app.save(rec)
      }

      if (colName === 'emprestimos') {
        if (statusChanged && newStatus === 'devolvido') {
          createAudit('devolucao', 'Devolução registrada')
        }
        if (renovacoesChanged) {
          createAudit('renovacao', 'Renovação registrada')
        }
        if (statusChanged && newStatus !== 'devolvido') {
          createAudit('mudanca_status', 'Status alterado de ' + oldStatus + ' para ' + newStatus)
        }
        if (!statusChanged && !renovacoesChanged) {
          createAudit('alteracao', 'Registro alterado')
        }
      } else {
        if (statusChanged) {
          createAudit('mudanca_status', 'Status alterado de ' + oldStatus + ' para ' + newStatus)
        } else {
          createAudit('alteracao', 'Registro alterado')
        }
      }
    } catch (err) {
      $app.logger().error('audit_update failed', 'error', String(err))
    }
  },
  'leitores',
  'livros',
  'emprestimos',
)
