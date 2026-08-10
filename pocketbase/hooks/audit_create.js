onRecordCreateRequest(
  (e) => {
    e.next()

    try {
      var colName = e.record.collectionName
      var acao = 'criacao'
      var entidade = 'leitor'
      if (colName === 'livros') {
        entidade = 'livro'
      } else if (colName === 'emprestimos') {
        acao = 'emprestimo'
        entidade = 'emprestimo'
      }

      var userId = ''
      if (colName === 'emprestimos') {
        userId = e.record.getString('responsavel')
      } else if (e.auth && e.auth.collectionName === 'users') {
        userId = e.auth.id
      }

      var auditCol = $app.findCollectionByNameOrId('auditoria')
      var auditRecord = new Record(auditCol)
      auditRecord.set('acao', acao)
      auditRecord.set('entidade', entidade)
      auditRecord.set('registro_id', e.record.id)
      if (userId) {
        auditRecord.set('usuario', userId)
      }
      auditRecord.set('detalhes', 'Registro criado: ' + e.record.id)
      $app.save(auditRecord)
    } catch (err) {
      $app.logger().error('audit_create failed', 'error', String(err))
    }
  },
  'leitores',
  'livros',
  'emprestimos',
)
