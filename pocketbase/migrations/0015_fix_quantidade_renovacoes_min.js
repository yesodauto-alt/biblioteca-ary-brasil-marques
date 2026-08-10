migrate(
  (app) => {
    app
      .db()
      .newQuery(
        'CREATE TABLE IF NOT EXISTS _backup_renovacoes AS SELECT id, quantidade_renovacoes FROM emprestimos',
      )
      .execute()

    const col = app.findCollectionByNameOrId('emprestimos')
    const field = col.fields.getByName('quantidade_renovacoes')
    if (field) {
      col.fields.removeById(field.id)
    }
    col.fields.add(
      new NumberField({
        name: 'quantidade_renovacoes',
        required: true,
        onlyInt: true,
        min: 0,
      }),
    )
    app.save(col)

    app
      .db()
      .newQuery(
        'UPDATE emprestimos SET quantidade_renovacoes = COALESCE((SELECT quantidade_renovacoes FROM _backup_renovacoes WHERE _backup_renovacoes.id = emprestimos.id), 0)',
      )
      .execute()

    app.db().newQuery('DROP TABLE IF EXISTS _backup_renovacoes').execute()
  },
  (app) => {
    app
      .db()
      .newQuery(
        'CREATE TABLE IF NOT EXISTS _backup_renovacoes AS SELECT id, quantidade_renovacoes FROM emprestimos',
      )
      .execute()

    const col = app.findCollectionByNameOrId('emprestimos')
    const field = col.fields.getByName('quantidade_renovacoes')
    if (field) {
      col.fields.removeById(field.id)
    }
    col.fields.add(
      new NumberField({
        name: 'quantidade_renovacoes',
        required: true,
        onlyInt: true,
      }),
    )
    app.save(col)

    app
      .db()
      .newQuery(
        'UPDATE emprestimos SET quantidade_renovacoes = COALESCE((SELECT quantidade_renovacoes FROM _backup_renovacoes WHERE _backup_renovacoes.id = emprestimos.id), 0)',
      )
      .execute()

    app.db().newQuery('DROP TABLE IF EXISTS _backup_renovacoes').execute()
  },
)
