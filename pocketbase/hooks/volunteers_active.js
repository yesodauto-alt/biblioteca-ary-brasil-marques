routerAdd(
  'GET',
  '/backend/v1/volunteers/active',
  (e) => {
    try {
      var records = $app.findRecordsByFilter('users', 'status = "ativo"', 'name', 0, 0)
      var result = records.map(function (rec) {
        return {
          id: rec.getString('id'),
          name: rec.getString('name'),
          email: rec.getString('email'),
          role: rec.getString('role'),
          status: rec.getString('status'),
          matricula: rec.getString('matricula'),
        }
      })
      return e.json(200, result)
    } catch (err) {
      return e.json(500, { error: 'failed to load volunteers' })
    }
  },
  $apis.requireAuth(),
)
