onRecordCreateRequest((e) => {
  function getCurrentDate(tz) {
    try {
      return new Intl.DateTimeFormat('sv-SE', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date())
    } catch (_) {
      return new Date(Date.now() - 3 * 3600000).toISOString().split('T')[0]
    }
  }

  function addDays(dateStr, days) {
    var d = new Date(dateStr + 'T00:00:00')
    d.setDate(d.getDate() + days)
    var y = d.getFullYear()
    var m = d.getMonth() < 9 ? '0' + (d.getMonth() + 1) : '' + (d.getMonth() + 1)
    var day = d.getDate() < 10 ? '0' + d.getDate() : '' + d.getDate()
    return y + '-' + m + '-' + day
  }

  var timezone = 'America/Sao_Paulo'
  var loanPeriod = 15
  try {
    var configRecs = $app.findRecordsByFilter('configuracoes', "id != ''", '', 1, 0)
    if (configRecs.length > 0) {
      var tz = configRecs[0].getString('fuso_horario')
      if (tz) timezone = tz
      var pdd = configRecs[0].get('prazo_devolucao_dias')
      if (pdd) loanPeriod = pdd
    }
  } catch (_) {}

  var tipo = e.record.getString('tipo_emprestimo') || 'comum'
  if (tipo === 'estudo') loanPeriod = 90

  var today = getCurrentDate(timezone)
  var returnDate = addDays(today, loanPeriod)

  e.record.set('data_emprestimo', new Date().toISOString())
  e.record.set('data_prevista_devolucao', returnDate)

  e.next()
}, 'emprestimos')
