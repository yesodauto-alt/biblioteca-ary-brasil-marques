migrate(
  (app) => {
    var leitoresCol = app.findCollectionByNameOrId('leitores')
    leitoresCol.addIndex('idx_leitores_nome_completo', false, 'nome_completo', '')
    leitoresCol.addIndex('idx_leitores_telefone', false, 'telefone', '')
    app.save(leitoresCol)
  },
  (app) => {
    var leitoresCol = app.findCollectionByNameOrId('leitores')
    leitoresCol.removeIndex('idx_leitores_nome_completo')
    leitoresCol.removeIndex('idx_leitores_telefone')
    app.save(leitoresCol)
  },
)
