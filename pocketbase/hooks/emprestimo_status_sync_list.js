onRecordListRequest((e) => {
  var timezone = 'America/Sao_Paulo'
  try {
    var configRecs = $app.findRecordsByFilter('configuracoes', "id != ''", '', 1, 0)
    if (configRecs.length > 0) {
      var tz = configRecs[0].getString('fuso_horario')
      if (tz) timezone = tz
    }
  } catch (_) {}

  var today = new Intl.DateTimeFormat('sv-SE', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

  for (var i = 0; i < e.records.length; i++) {
    var rec = e.records[i]
    var status = rec.getString('status')
    var dataPrevista = rec.getString('data_prevista_devolucao')

    if (!dataPrevista) continue

    if (status === 'ativo' && dataPrevista < today) {
      rec.set('status', 'atrasado')
      try {
        $app.saveNoValidate(rec)
      } catch (_) {}
    } else if (status === 'atrasado' && dataPrevista >= today) {
      rec.set('status', 'ativo')
      try {
        $app.saveNoValidate(rec)
      } catch (_) {}
    }
  }

  e.next()
}, 'emprestimos')
