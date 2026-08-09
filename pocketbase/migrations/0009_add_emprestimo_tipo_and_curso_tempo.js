migrate(
  (app) => {
    const cursosCol = app.findCollectionByNameOrId('cursos')
    if (!cursosCol.fields.getByName('tempo_emprestimo_dias')) {
      cursosCol.fields.add(
        new NumberField({
          name: 'tempo_emprestimo_dias',
          min: 1,
          onlyInt: true,
        }),
      )
    }
    app.save(cursosCol)

    app
      .db()
      .newQuery('UPDATE cursos SET tempo_emprestimo_dias = 90 WHERE tempo_emprestimo_dias IS NULL')
      .execute()

    const empCol = app.findCollectionByNameOrId('emprestimos')
    if (!empCol.fields.getByName('tipo_emprestimo')) {
      empCol.fields.add(
        new SelectField({
          name: 'tipo_emprestimo',
          values: ['comum', 'estudo'],
          maxSelect: 1,
        }),
      )
    }
    empCol.addIndex('idx_emprestimos_tipo', false, 'tipo_emprestimo', '')
    app.save(empCol)

    app
      .db()
      .newQuery(
        "UPDATE emprestimos SET tipo_emprestimo = 'comum' WHERE tipo_emprestimo IS NULL OR tipo_emprestimo = ''",
      )
      .execute()
  },
  (app) => {
    const cursosCol = app.findCollectionByNameOrId('cursos')
    var tempoField = cursosCol.fields.getByName('tempo_emprestimo_dias')
    if (tempoField) {
      cursosCol.fields.remove(tempoField.id)
    }
    app.save(cursosCol)

    const empCol = app.findCollectionByNameOrId('emprestimos')
    empCol.removeIndex('idx_emprestimos_tipo')
    var tipoField = empCol.fields.getByName('tipo_emprestimo')
    if (tipoField) {
      empCol.fields.remove(tipoField.id)
    }
    app.save(empCol)
  },
)
