migrate(
  (app) => {
    var livrosCol = app.findCollectionByNameOrId('livros')
    livrosCol.addIndex('idx_livros_titulo', false, 'titulo', '')
    livrosCol.addIndex('idx_livros_autor', false, 'autor', '')
    livrosCol.addIndex('idx_livros_editora', false, 'editora', '')
    app.save(livrosCol)
  },
  (app) => {
    var livrosCol = app.findCollectionByNameOrId('livros')
    livrosCol.removeIndex('idx_livros_titulo')
    livrosCol.removeIndex('idx_livros_autor')
    livrosCol.removeIndex('idx_livros_editora')
    app.save(livrosCol)
  },
)
