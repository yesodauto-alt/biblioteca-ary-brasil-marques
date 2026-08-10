routerAdd(
  'GET',
  '/backend/v1/volunteers/active',
  (e) => {
    try {
      var records = $app.findRecordsByFilter('voluntarios', 'status = "ativo"', 'nome', 0, 0)
      var result = records.map(function (rec) {
        return {
          id: rec.getString('id'),
          nome: rec.getString('nome'),
          matricula: rec.getString('matricula'),
          status: rec.getString('status'),
        }
      })
      return e.json(200, result)
    } catch (err) {
      return e.json(500, { error: 'failed to load volunteers' })
    }
  },
  $apis.requireAuth(),
)
