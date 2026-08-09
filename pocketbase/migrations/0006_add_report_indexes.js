migrate(
  (app) => {
    var empCol = app.findCollectionByNameOrId('emprestimos')
    empCol.addIndex('idx_emprestimos_data_emprestimo', false, 'data_emprestimo', '')
    empCol.addIndex('idx_emprestimos_data_prevista', false, 'data_prevista_devolucao', '')
    empCol.addIndex('idx_emprestimos_data_devolucao', false, 'data_devolucao_real', '')
    app.save(empCol)

    var audCol = app.findCollectionByNameOrId('auditoria')
    audCol.addIndex('idx_auditoria_acao', false, 'acao', '')
    audCol.addIndex('idx_auditoria_created', false, 'created', '')
    app.save(audCol)
  },
  (app) => {
    var empCol = app.findCollectionByNameOrId('emprestimos')
    empCol.removeIndex('idx_emprestimos_data_emprestimo')
    empCol.removeIndex('idx_emprestimos_data_prevista')
    empCol.removeIndex('idx_emprestimos_data_devolucao')
    app.save(empCol)

    var audCol = app.findCollectionByNameOrId('auditoria')
    audCol.removeIndex('idx_auditoria_acao')
    audCol.removeIndex('idx_auditoria_created')
    app.save(audCol)
  },
)
