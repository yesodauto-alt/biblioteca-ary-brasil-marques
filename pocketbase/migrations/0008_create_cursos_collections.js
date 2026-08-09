migrate(
  (app) => {
    var cursosCol = new Collection({
      name: 'cursos',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'ano_nivel_etapa', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_cursos_nome ON cursos (nome)'],
    })
    app.save(cursosCol)

    var cursosId = app.findCollectionByNameOrId('cursos').id
    var livrosId = app.findCollectionByNameOrId('livros').id

    var cursosLivrosCol = new Collection({
      name: 'cursos_livros',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'curso',
          type: 'relation',
          required: true,
          collectionId: cursosId,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'livro',
          type: 'relation',
          required: true,
          collectionId: livrosId,
          maxSelect: 1,
          cascadeDelete: false,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_cursos_livros_curso ON cursos_livros (curso)',
        'CREATE INDEX idx_cursos_livros_livro ON cursos_livros (livro)',
        'CREATE UNIQUE INDEX idx_cursos_livros_unique ON cursos_livros (curso, livro)',
      ],
    })
    app.save(cursosLivrosCol)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('cursos_livros'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('cursos'))
    } catch (_) {}
  },
)
