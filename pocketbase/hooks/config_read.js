routerAdd(
  'GET',
  '/backend/v1/config',
  (e) => {
    try {
      var records = $app.findRecordsByFilter('configuracoes', "id != ''", '', 1, 0)
      if (records.length === 0) return e.json(200, null)
      var rec = records[0]
      return e.json(200, {
        id: rec.getString('id'),
        prazo_devolucao_dias: rec.get('prazo_devolucao_dias'),
        limite_renovacoes: rec.get('limite_renovacoes'),
        limite_livros_por_usuario: rec.get('limite_livros_por_usuario'),
        nome_biblioteca: rec.getString('nome_biblioteca'),
        telefone: rec.getString('telefone'),
        email: rec.getString('email'),
        informacoes_institucionais: rec.getString('informacoes_institucionais'),
        created: rec.getString('created'),
        updated: rec.getString('updated'),
      })
    } catch (err) {
      return e.json(500, { error: 'failed to load config' })
    }
  },
  $apis.requireAuth(),
)
