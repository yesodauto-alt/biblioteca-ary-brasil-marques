migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!usersCol.fields.getByName('role')) {
      usersCol.fields.add(
        new SelectField({
          name: 'role',
          required: true,
          values: ['administrador', 'voluntário'],
          maxSelect: 1,
        }),
      )
    }
    app.save(usersCol)

    try {
      const existingUser = app.findAuthRecordByEmail('_pb_users_auth_', 'camilimag@gmail.com')
      existingUser.set('role', 'administrador')
      app.save(existingUser)
    } catch (_) {}

    const leitoresCol = new Collection({
      name: 'leitores',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'numero_cadastro', type: 'text', required: true },
        { name: 'nome_completo', type: 'text', required: true },
        { name: 'telefone', type: 'text', required: true },
        { name: 'email', type: 'text' },
        { name: 'data_nascimento', type: 'date' },
        { name: 'endereco', type: 'text' },
        { name: 'data_cadastro', type: 'date', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['ativo', 'inativo'],
          maxSelect: 1,
        },
        { name: 'observacoes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_leitores_numero_cadastro ON leitores (numero_cadastro)',
        'CREATE INDEX idx_leitores_status ON leitores (status)',
      ],
    })
    app.save(leitoresCol)

    const livrosCol = new Collection({
      name: 'livros',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'numero_cadastro', type: 'text', required: true },
        { name: 'titulo', type: 'text', required: true },
        { name: 'autor', type: 'text', required: true },
        { name: 'editora', type: 'text', required: true },
        { name: 'categoria', type: 'text' },
        { name: 'localizacao_fisica', type: 'text' },
        { name: 'observacoes', type: 'text' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['disponível', 'emprestado', 'manutenção', 'extraviado', 'baixado'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_livros_numero_cadastro ON livros (numero_cadastro)',
        'CREATE INDEX idx_livros_status ON livros (status)',
      ],
    })
    app.save(livrosCol)

    var leitoresId = app.findCollectionByNameOrId('leitores').id
    var livrosId = app.findCollectionByNameOrId('livros').id

    var emprestimosCol = new Collection({
      name: 'emprestimos',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'leitor',
          type: 'relation',
          required: true,
          collectionId: leitoresId,
          maxSelect: 1,
          cascadeDelete: false,
        },
        {
          name: 'livro',
          type: 'relation',
          required: true,
          collectionId: livrosId,
          maxSelect: 1,
          cascadeDelete: false,
        },
        { name: 'data_emprestimo', type: 'date', required: true },
        { name: 'data_prevista_devolucao', type: 'date', required: true },
        { name: 'data_devolucao_real', type: 'date' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['ativo', 'devolvido', 'atrasado'],
          maxSelect: 1,
        },
        { name: 'quantidade_renovacoes', type: 'number', required: true, onlyInt: true },
        {
          name: 'responsavel',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
          cascadeDelete: false,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_emprestimos_leitor ON emprestimos (leitor)',
        'CREATE INDEX idx_emprestimos_livro ON emprestimos (livro)',
        'CREATE INDEX idx_emprestimos_responsavel ON emprestimos (responsavel)',
        'CREATE INDEX idx_emprestimos_status ON emprestimos (status)',
        'CREATE INDEX idx_emprestimos_created ON emprestimos (created)',
      ],
    })
    app.save(emprestimosCol)

    var auditoriaCol = new Collection({
      name: 'auditoria',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'acao',
          type: 'select',
          required: true,
          values: [
            'criacao',
            'alteracao',
            'emprestimo',
            'devolucao',
            'renovacao',
            'mudanca_status',
          ],
          maxSelect: 1,
        },
        { name: 'entidade', type: 'text', required: true },
        { name: 'registro_id', type: 'text', required: true },
        {
          name: 'usuario',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
          cascadeDelete: false,
        },
        { name: 'detalhes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      ],
      indexes: ['CREATE INDEX idx_auditoria_usuario ON auditoria (usuario)'],
    })
    app.save(auditoriaCol)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('auditoria'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('emprestimos'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('livros'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('leitores'))
    } catch (_) {}
    try {
      var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      var roleField = usersCol.fields.getByName('role')
      if (roleField) {
        usersCol.fields.remove(roleField.id)
      }
      app.save(usersCol)
    } catch (_) {}
  },
)
