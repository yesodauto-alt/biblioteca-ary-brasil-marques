onRecordCreateRequest((e) => {
  var tipo = e.record.get('tipo_emprestimo') || 'comum'

  e.record.set('data_emprestimo', new Date().toISOString())

  var loanPeriod = 15
  var timezone = 'America/Sao_Paulo'

  try {
    var configRecs = $app.findRecordsByFilter('configuracoes', "id != ''", '', 1, 0)
    if (configRecs.length > 0) {
      var prazo = configRecs[0].get('prazo_devolucao_dias')
      if (prazo) loanPeriod = prazo
      var tz = configRecs[0].getString('fuso_horario')
      if (tz) timezone = tz
    }
  } catch (_) {}

  if (tipo === 'estudo') loanPeriod = 90

  var returnDate = new Date()
  returnDate.setDate(returnDate.getDate() + loanPeriod)

  var dateStr
  try {
    dateStr = new Intl.DateTimeFormat('sv-SE', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(returnDate)
  } catch (_) {
    dateStr = returnDate.toISOString().split('T')[0]
  }

  e.record.set('data_prevista_devolucao', dateStr)

  e.next()
}, 'emprestimos')
